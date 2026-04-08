import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    Search, Volume2, Users, Briefcase, MoreVertical,
    CheckCheck, Plus, Paperclip, Send, Phone, Smile, Clock, Check, ChevronDown, ChevronRight
} from 'lucide-react';
import { toast } from "react-hot-toast";
import EmojiPicker from 'emoji-picker-react';
import { io as createSocket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAccessToken, selectUser } from '../../../../store/slices/authSlice';
import { fetchWithAuth } from '../../../../utils/apiHandler';
import {
    ensureEventDmConversation,
    fetchStaffChatContacts,
    fetchConversationMessages,
    sendConversationMessage,
    markConversationRead,
    deleteConversationMessage,
    updateConversationMessage,
} from '../../../../utils/chatApi';
import { CHAT_API_BASE_URL, CHAT_SOCKET_URL } from '../../../../utils/chatConfig';
import { extractRichChatMessage, stripRichChatMessage } from '../../../../utils/richChat';
import { fetchPlanningByEventId, fetchPlanningVendorSelectionByEventId, selectPlanningVendorSelectionByEventId } from '../../../../store/slices/planningSlice';
import { computeMoneyRangeFromBase, derivePricingDemandFromEvent } from '../../../../utils/pricing';

const EVENTS_API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const PRIVILEGED_ASSIGNED_ROLES = new Set(['JUNIOR MANAGER', 'SENIOR EVENT MANAGER']);
const COORDINATOR_ASSIGNED_ROLES = new Set(['EVENT COORDINATOR', 'COORDINATOR']);

const normalizeAssignedRole = (value) => String(value || '').trim().toUpperCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ');

const formatMoneyShort = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return '—';
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
    return `₹${n.toFixed(0)}`;
};

const decodeJwtPayload = (token) => {
    try {
        const parts = String(token || '').split('.');
        if (parts.length < 2) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const json = atob(padded);
        return JSON.parse(json);
    } catch {
        return null;
    }
};

const resolveAuthId = ({ user, accessToken }) => {
    const fromUser = String(user?.authId || '').trim();
    if (fromUser) return fromUser;
    const payload = decodeJwtPayload(accessToken);
    const fromToken = String(payload?.authId || payload?.sub || payload?.userId || payload?.id || '').trim();
    return fromToken;
};

const ChatTab = ({ eventId, client, teamMembers = [], assignedManager = null, onUnreadCountChange }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
    const currentUserId = resolveAuthId({ user, accessToken });
    const isPrivilegedAssignedRole = useMemo(
        () => PRIVILEGED_ASSIGNED_ROLES.has(normalizeAssignedRole(user?.assignedRole)),
        [user?.assignedRole]
    );
    const isCoordinatorAssignedRole = useMemo(
        () => COORDINATOR_ASSIGNED_ROLES.has(normalizeAssignedRole(user?.assignedRole)),
        [user?.assignedRole]
    );
    const canViewManagerCoordinatorSection = isPrivilegedAssignedRole || isCoordinatorAssignedRole;

    const planningVendorSelection = useSelector((state) => selectPlanningVendorSelectionByEventId(state, eventId));

    const vendorContacts = useMemo(() => {
        const vendorItems = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
        const vendorProfiles = Array.isArray(planningVendorSelection?.vendorProfiles)
            ? planningVendorSelection.vendorProfiles
            : [];

        const profileByAuthId = new Map();
        for (const p of vendorProfiles) {
            const authId = p?.authId != null ? String(p.authId).trim() : '';
            if (authId) profileByAuthId.set(authId, p);
        }

        const accepted = vendorItems
            .filter((v) => String(v?.status || '').trim().toUpperCase() === 'ACCEPTED')
            .map((v) => ({
                vendorAuthId: v?.vendorAuthId != null ? String(v.vendorAuthId).trim() : '',
                service: v?.service != null ? String(v.service).trim() : '',
            }))
            .filter((v) => v.vendorAuthId);

        const servicesByVendor = new Map();
        for (const row of accepted) {
            const list = servicesByVendor.get(row.vendorAuthId) || [];
            if (row.service && !list.includes(row.service)) list.push(row.service);
            servicesByVendor.set(row.vendorAuthId, list);
        }

        return Array.from(servicesByVendor.entries()).map(([vendorAuthId, services]) => {
            const profile = profileByAuthId.get(vendorAuthId);
            const name = profile?.businessName || profile?.name || 'Vendor';
            const serviceLabel = services.length ? services.join(', ') : 'Vendor';
            return {
                id: vendorAuthId,
                name,
                type: 'vendor',
                role: serviceLabel,
                online: false,
                lastSeen: '',
            };
        });
    }, [planningVendorSelection]);

    const teamContacts = useMemo(() => {
        const list = Array.isArray(teamMembers) ? teamMembers : [];
        return list
            .map((member) => {
                const authId = String(member?.authId || '').trim();
                if (!authId) return null;
                const assignedRole = String(member?.assignedRole || '').trim();
                return {
                    id: authId,
                    name: member?.name || member?.fullName || 'Team Staff',
                    type: 'team',
                    role: assignedRole || 'Team Staff',
                    online: false,
                    lastSeen: '',
                };
            })
            .filter(Boolean);
    }, [teamMembers]);

    const [staffAdminContacts, setStaffAdminContacts] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const loadStaffAdmins = async () => {
            if (!accessToken) {
                if (!cancelled) setStaffAdminContacts([]);
                return;
            }

            try {
                const groups = await fetchStaffChatContacts({
                    dispatch,
                    refreshAction: refreshAccessToken,
                });

                if (cancelled) return;

                const adminsByAuthId = new Map();

                for (const group of (Array.isArray(groups) ? groups : [])) {
                    const groupKey = String(group?.key || '').trim().toUpperCase();
                    const contacts = Array.isArray(group?.contacts) ? group.contacts : [];

                    for (const contact of contacts) {
                        const authId = String(contact?.authId || '').trim();
                        if (!authId || authId === currentUserId || adminsByAuthId.has(authId)) continue;

                        const role = String(contact?.role || '').trim();
                        const roleUpper = role.toUpperCase();
                        const isAdmin = groupKey.includes('ADMIN') || roleUpper === 'ADMIN' || roleUpper.includes('ADMIN');
                        if (!isAdmin) continue;

                        adminsByAuthId.set(authId, {
                            id: authId,
                            name: contact?.name || contact?.fullName || 'Admin',
                            type: 'admin',
                            role: role || 'Admin',
                            online: false,
                            lastSeen: '',
                        });
                    }
                }

                setStaffAdminContacts(Array.from(adminsByAuthId.values()));
            } catch {
                if (!cancelled) setStaffAdminContacts([]);
            }
        };

        loadStaffAdmins();

        return () => {
            cancelled = true;
        };
    }, [accessToken, currentUserId, dispatch]);

    const contacts = useMemo(() => {
        const clientAuthId = client?.authId != null ? String(client.authId).trim() : '';
        const includeClientContact = isPrivilegedAssignedRole;
        const list = [];

        for (const admin of (Array.isArray(staffAdminContacts) ? staffAdminContacts : [])) {
            if (!admin?.id) continue;
            if (list.some((c) => c.id === admin.id)) continue;
            list.push(admin);
        }

        const assignedManagerAuthId = String(assignedManager?.authId || '').trim();
        if (assignedManagerAuthId && assignedManagerAuthId !== String(currentUserId || '').trim()) {
            list.push({
                id: assignedManagerAuthId,
                name: assignedManager?.name || assignedManager?.fullName || 'Assigned Manager',
                type: 'team',
                role: String(assignedManager?.assignedRole || 'Assigned Manager').trim() || 'Assigned Manager',
                online: false,
                lastSeen: '',
            });
        }

        if (includeClientContact && clientAuthId) {
            list.push({
                id: clientAuthId,
                name: client?.name || client?.fullName || 'Client',
                type: 'client',
                role: 'Client',
                online: false,
                lastSeen: '',
            });
        }

        for (const v of vendorContacts) {
            if (!v?.id) continue;
            // Avoid duplicates if a vendor authId ever overlaps (should not)
            if (list.some((c) => c.id === v.id)) continue;
            list.push(v);
        }

        for (const t of teamContacts) {
            if (!t?.id) continue;
            if (list.some((c) => c.id === t.id)) continue;
            list.push(t);
        }

        return list;
    }, [assignedManager, client, currentUserId, isPrivilegedAssignedRole, staffAdminContacts, vendorContacts, teamContacts]);

    const [activeChannel, setActiveChannel] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState([]);
    const [unreadCountByContact, setUnreadCountByContact] = useState({});
    const [conversationId, setConversationId] = useState(null);
    const socketRef = useRef(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [socketJoined, setSocketJoined] = useState(false);
    const [presenceByAuthId, setPresenceByAuthId] = useState({});

    const lastAltSyncRef = useRef({});

    const latestAltMessageIdByService = useMemo(() => {
        const latestByService = {};
        const list = Array.isArray(messages) ? messages : [];

        const normalizeServiceKey = (value) => String(value || '').trim().toLowerCase();
        const toTs = (m) => {
            const raw = m?.createdAt;
            if (raw == null) return null;
            if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
            const t = Date.parse(String(raw));
            return Number.isFinite(t) ? t : null;
        };

        for (let idx = 0; idx < list.length; idx++) {
            const m = list[idx];
            const msgId = String(m?._id || m?.id || '').trim();
            if (!msgId) continue;

            const rich = extractRichChatMessage(m?.text);
            if (!rich || rich.kind !== 'vendorAlternatives') continue;

            const payload = rich.payload && typeof rich.payload === 'object' ? rich.payload : null;
            const serviceKey = normalizeServiceKey(payload?.serviceLabel || payload?.service || payload?.serviceCategory);
            if (!serviceKey) continue;

            const ts = toTs(m);
            const prev = latestByService[serviceKey];
            const shouldReplace = !prev
                || (ts != null && (prev.ts == null || ts > prev.ts))
                || (ts != null && prev.ts != null && ts === prev.ts && idx > prev.idx)
                || (ts == null && prev.ts == null && idx > prev.idx);

            if (shouldReplace) {
                latestByService[serviceKey] = { id: msgId, ts, idx };
            }
        }

        const out = {};
        for (const [k, v] of Object.entries(latestByService)) {
            out[k] = v.id;
        }
        return out;
    }, [messages]);

    const [expandedAltKeys, setExpandedAltKeys] = useState({});
    const [selectingAltKey, setSelectingAltKey] = useState(null);
    const [lockedAltByService, setLockedAltByService] = useState({});
    const [lockedAltServiceIdByService, setLockedAltServiceIdByService] = useState({});
    const [lockedAltMessageIdByService, setLockedAltMessageIdByService] = useState({});

    const pushUnreadTotals = (nextMap) => {
        const total = Object.values(nextMap || {}).reduce((sum, value) => sum + Number(value || 0), 0);
        if (typeof onUnreadCountChange === 'function') {
            onUnreadCountChange(total);
        }
    };

    const clearUnreadForContact = (contactAuthId) => {
        const key = String(contactAuthId || '').trim();
        if (!key) return;

        setUnreadCountByContact((prev) => {
            if (!prev || Number(prev[key] || 0) <= 0) return prev;
            const next = { ...prev, [key]: 0 };
            pushUnreadTotals(next);
            return next;
        });
    };

    useEffect(() => {
        const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
        const rejectedKeys = list
            .map((v) => {
                const serviceKey = String(v?.service || '').trim().toLowerCase();
                const status = String(v?.status || '').trim().toUpperCase();
                if (!serviceKey) return null;
                if (!status || !status.includes('REJECT')) return null;
                return serviceKey;
            })
            .filter(Boolean);

        if (rejectedKeys.length === 0) return;

        setLockedAltByService((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const k of rejectedKeys) {
                if (next[k] != null) {
                    delete next[k];
                    changed = true;
                }
            }
            return changed ? next : prev;
        });

        setLockedAltServiceIdByService((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const k of rejectedKeys) {
                if (next[k] != null) {
                    delete next[k];
                    changed = true;
                }
            }
            return changed ? next : prev;
        });

        setLockedAltMessageIdByService((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const k of rejectedKeys) {
                if (next[k] != null) {
                    delete next[k];
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [planningVendorSelection]);

    const [guestCountForPricing, setGuestCountForPricing] = useState(null);
    const [dayCountForPricing, setDayCountForPricing] = useState(1);
    
    // UI states
    const [isVendorsOpen, setIsVendorsOpen] = useState(true);
    const [isInternalOpen, setIsInternalOpen] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [pendingFiles, setPendingFiles] = useState([]);
    
    // Call modal & interaction states
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editInput, setEditInput] = useState('');
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false, msgId: null });

    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const contextMenuRef = useRef(null);
    const messageMenuRef = useRef(null);

    const messagesViewportRef = useRef(null);
    const messagesEndRef = useRef(null);
    const stickToBottomRef = useRef(true);
    const initialScrollDoneRef = useRef(false);

    const handleMessagesScroll = () => {
        const el = messagesViewportRef.current;
        if (!el) return;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        stickToBottomRef.current = distance < 140;
    };

    const scrollToBottom = (behavior = 'auto') => {
        const el = messagesViewportRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    useEffect(() => {
        let cancelled = false;
        if (!eventId) return () => {
            cancelled = true;
        };

        dispatch(fetchPlanningByEventId(String(eventId)))
            .then((action) => {
                if (cancelled) return;
                if (action?.meta?.requestStatus === 'fulfilled') {
                    const pricingDemand = derivePricingDemandFromEvent(action?.payload || {});
                    setGuestCountForPricing(pricingDemand?.attendeeCount ?? null);
                    setDayCountForPricing(pricingDemand?.dayCount ?? 1);
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [dispatch, eventId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (contextMenu.show && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu(prev => ({ ...prev, show: false }));
            }
            if (activeMessageMenu && messageMenuRef.current && !messageMenuRef.current.contains(event.target)) {
                setActiveMessageMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, contextMenu.show, activeMessageMenu]);

    const handleContextMenu = (e, msgId) => {
        e.preventDefault();
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            show: true,
            msgId: msgId
        });
    };

    useEffect(() => {
        if (!activeChannel && contacts.length) {
            setActiveChannel(contacts[0].id);
        }
    }, [activeChannel, contacts]);

    useEffect(() => {
        const allowed = new Set((contacts || []).map((c) => String(c?.id || '').trim()).filter(Boolean));
        setUnreadCountByContact((prev) => {
            const next = {};
            for (const [key, value] of Object.entries(prev || {})) {
                if (allowed.has(String(key || '').trim())) {
                    next[key] = Number(value || 0);
                }
            }
            const changed = JSON.stringify(next) !== JSON.stringify(prev || {});
            if (changed) {
                pushUnreadTotals(next);
                return next;
            }
            return prev;
        });
    }, [contacts]);

    useEffect(() => {
        const eventIdValue = String(eventId || '').trim();
        const managerAuthId = String(currentUserId || '').trim();
        const contactAuthIds = (contacts || []).map((c) => String(c?.id || '').trim()).filter(Boolean);

        if (!eventIdValue || !managerAuthId || contactAuthIds.length === 0) {
            setUnreadCountByContact({});
            pushUnreadTotals({});
            return;
        }

        let cancelled = false;

        const loadUnreadCounts = async () => {
            try {
                const results = await Promise.all(contactAuthIds.map(async (otherAuthId) => {
                    try {
                        const convo = await ensureEventDmConversation({
                            eventId: eventIdValue,
                            otherAuthId,
                            dispatch,
                            refreshAction: refreshAccessToken,
                        });

                        const convoId = String(convo?._id || convo?.id || '').trim();
                        if (!convoId) return [otherAuthId, 0];

                        const rows = await fetchConversationMessages({
                            conversationId: convoId,
                            limit: 200,
                            dispatch,
                            refreshAction: refreshAccessToken,
                        });

                        const unread = (Array.isArray(rows) ? rows : []).filter((msg) => {
                            const sender = String(msg?.senderAuthId || msg?.senderId || '').trim();
                            if (!sender || sender === managerAuthId) return false;
                            const readBy = Array.isArray(msg?.readBy) ? msg.readBy.map((v) => String(v || '').trim()) : [];
                            return !readBy.includes(managerAuthId);
                        }).length;

                        return [otherAuthId, unread];
                    } catch {
                        return [otherAuthId, 0];
                    }
                }));

                if (cancelled) return;
                const next = Object.fromEntries(results);
                setUnreadCountByContact(next);
                pushUnreadTotals(next);
            } catch {
                if (!cancelled) {
                    setUnreadCountByContact({});
                    pushUnreadTotals({});
                }
            }
        };

        loadUnreadCounts();
        const timer = setInterval(loadUnreadCounts, 20000);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [contacts, currentUserId, dispatch, eventId, onUnreadCountChange]);

    useEffect(() => {
        if (!activeChannel) return;
        const exists = contacts.some((c) => String(c?.id || '') === String(activeChannel));
        if (!exists) {
            setActiveChannel(contacts[0]?.id || null);
        }
    }, [activeChannel, contacts]);

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchPlanningVendorSelectionByEventId(eventId));
    }, [dispatch, eventId]);

    // Ensure DM conversation for the currently selected contact + load initial messages
    useEffect(() => {
        if (!eventId || !activeChannel) return;
        let cancelled = false;

        const load = async () => {
            try {
                setMessages([]);

                const convo = await ensureEventDmConversation({
                    eventId,
                    otherAuthId: activeChannel,
                    dispatch,
                    refreshAction: refreshAccessToken,
                });

                const convoId = String(convo?._id || convo?.id || '').trim();
                if (!convoId) throw new Error('Invalid conversation');
                if (cancelled) return;

                setConversationId(convoId);

                const msgs = await fetchConversationMessages({
                    conversationId: convoId,
                    limit: 200,
                    dispatch,
                    refreshAction: refreshAccessToken,
                });
                if (cancelled) return;
                setMessages(msgs);

                // best-effort mark-as-read when opening
                markConversationRead({ conversationId: convoId, dispatch, refreshAction: refreshAccessToken }).catch(() => {});
                clearUnreadForContact(activeChannel);
            } catch (e) {
                toast.error(e?.message || 'Failed to load chat');
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [eventId, activeChannel, dispatch]);

    // Socket connection for realtime updates
    useEffect(() => {
        if (!conversationId || !accessToken) return;

        const socket = createSocket(CHAT_SOCKET_URL, {
            auth: { token: accessToken },
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setSocketConnected(true);
            setSocketJoined(false);
            socket.emit('conversation:join', { conversationId });
        });

        socket.on('conversation:joined', (payload) => {
            const joinedId = String(payload?.conversationId || '').trim();
            if (joinedId && joinedId === String(conversationId)) {
                setSocketJoined(true);
            }
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
            setSocketJoined(false);
        });

        socket.on('message:new', (msg) => {
            const msgId = String(msg?._id || msg?.id || '');
            setMessages((prev) => {
                if (msgId && prev.some((m) => String(m?._id || m?.id || '') === msgId)) return prev;
                return [...prev, msg];
            });

            // If alternatives arrived, refresh vendor-selection so lock state matches backend immediately.
            try {
                const rich = extractRichChatMessage(msg?.text);
                if (rich?.kind === 'vendorAlternatives') {
                    const payload = rich.payload && typeof rich.payload === 'object' ? rich.payload : null;
                    const serviceKey = String(payload?.serviceLabel || payload?.service || '').trim().toLowerCase();
                    const planningEventId = String(eventId || '').trim();
                    if (planningEventId) {
                        const prev = lastAltSyncRef.current || {};
                        const lastMsgId = prev[serviceKey || '_all'] || null;
                        if (!msgId || lastMsgId !== msgId) {
                            lastAltSyncRef.current = { ...prev, [serviceKey || '_all']: msgId || String(Date.now()) };
                            dispatch(fetchPlanningVendorSelectionByEventId(planningEventId));
                        }
                    }
                }
            } catch {
                // ignore
            }

            if (String(msg?.senderAuthId || '') !== currentUserId) {
                socket.emit('messages:read', { conversationId });
                markConversationRead({ conversationId, dispatch, refreshAction: refreshAccessToken }).catch(() => {});
                clearUnreadForContact(activeChannel);
            }
        });

        socket.on('message:deleted', ({ conversationId: convoId, messageId } = {}) => {
            if (String(convoId || '').trim() !== String(conversationId)) return;
            const deletedId = String(messageId || '').trim();
            if (!deletedId) return;
            setMessages((prev) => prev.filter((m) => String(m?._id || m?.id || '') !== deletedId));
        });

        socket.on('message:updated', (updated) => {
            const updatedId = String(updated?._id || updated?.id || '').trim();
            if (!updatedId) return;
            setMessages((prev) => prev.map((m) => (String(m?._id || m?.id || '') === updatedId ? { ...m, ...updated } : m)));
        });

        socket.on('messages:read', ({ conversationId: convoId, authId } = {}) => {
            const readerAuthId = String(authId || '').trim();
            if (!readerAuthId) return;
            if (String(convoId || '').trim() !== String(conversationId)) return;

            setMessages((prev) => prev.map((m) => {
                const sender = String(m?.senderAuthId || '').trim();
                if (!sender || sender === readerAuthId) return m;
                const readBy = Array.isArray(m?.readBy) ? m.readBy.map(String) : [];
                if (readBy.includes(readerAuthId)) return m;
                return { ...m, readBy: [...readBy, readerAuthId] };
            }));
        });

        socket.on('presence:update', ({ authId, online } = {}) => {
            const id = String(authId || '').trim();
            if (!id) return;
            setPresenceByAuthId((prev) => ({ ...prev, [id]: Boolean(online) }));
        });

        socket.on('connect_error', () => {
            setSocketConnected(false);
            setSocketJoined(false);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setSocketConnected(false);
            setSocketJoined(false);
        };
    }, [conversationId, accessToken, currentUserId, dispatch, eventId]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socketConnected || !socket) return;

        const authIds = contacts
            .map((c) => (c?.id != null ? String(c.id).trim() : ''))
            .filter(Boolean);

        socket.emit('presence:watch', { authIds });
    }, [socketConnected, contacts]);

    // Fallback polling when socket isn't connected (e.g. socket JWT auth failing)
    useEffect(() => {
        if (!conversationId) return;
        if (socketConnected && socketJoined) return;

        let stopped = false;
        const poll = async () => {
            try {
                const msgs = await fetchConversationMessages({
                    conversationId,
                    limit: 200,
                    dispatch,
                    refreshAction: refreshAccessToken,
                });
                if (!stopped) setMessages(msgs);
            } catch {
                // ignore
            }
        };

        poll();
        const id = setInterval(poll, 2500);
        return () => {
            stopped = true;
            clearInterval(id);
        };
    }, [conversationId, socketConnected, socketJoined, dispatch]);

    useEffect(() => {
        if (!conversationId) return;
        stickToBottomRef.current = true;
        initialScrollDoneRef.current = false;
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) return;
        if (!messages.length) return;
        if (!stickToBottomRef.current) return;

        const behavior = initialScrollDoneRef.current ? 'smooth' : 'auto';
        requestAnimationFrame(() => scrollToBottom(behavior));
        initialScrollDoneRef.current = true;
    }, [conversationId, messages.length]);

    // Filter contacts safely
    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const hasManagerOrCoordinatorRole = (roleValue) => {
        const normalized = String(roleValue || '').trim().toUpperCase();
        return normalized.includes('MANAGER') || normalized.includes('COORDINATOR');
    };

    const admins = filteredContacts.filter(c => c.type === 'admin');
    const clients = filteredContacts.filter(c => c.type === 'client');
    const managerCoordinatorContacts = canViewManagerCoordinatorSection
        ? filteredContacts.filter((c) => c.type === 'team'
            && String(c?.id || '') !== String(currentUserId || '')
            && hasManagerOrCoordinatorRole(c?.role))
        : [];
    const team = isPrivilegedAssignedRole
        ? filteredContacts.filter((c) => c.type === 'team'
            && String(c?.id || '') !== String(currentUserId || '')
            && !hasManagerOrCoordinatorRole(c?.role))
        : [];
    const vendors = filteredContacts.filter(c => c.type === 'vendor');

    // Get current active chat context
    const currentContact = contacts.find(c => c.id === activeChannel);

    const handleSend = async () => {
        if ((!chatInput.trim() && pendingFiles.length === 0) || !conversationId) return;

        try {
            const data = await sendConversationMessage({
                conversationId,
                text: chatInput.trim(),
                files: pendingFiles,
                dispatch,
                refreshAction: refreshAccessToken,
            });

            setChatInput('');
            setPendingFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';

            const msgId = String(data?._id || data?.id || '');
            setMessages((prev) => {
                if (msgId && prev.some((m) => String(m?._id || m?.id || '') === msgId)) return prev;
                return [...prev, data];
            });
        } catch (e) {
            toast.error(e?.message || 'Failed to send message');
        }
    };

    const formatMoneyRangeFromBasePrice = (price, { serviceLabel } = {}) => {
        const range = computeMoneyRangeFromBase({
            basePrice: price,
            guestCount: guestCountForPricing,
            dayCount: dayCountForPricing,
            serviceLabel,
        });

        const min = Number(range?.min ?? 0);
        const max = Number(range?.max ?? 0);
        if (!Number.isFinite(min) || min <= 0) return '—';

        const fmt = (n) => (n < 10000 ? `₹${Math.round(n)}` : formatMoneyShort(n));
        return `${fmt(min)} – ${fmt(max)}`;
    };

    const formatMoneyRangeFromMinMax = (minRaw, _maxRaw, { serviceLabel } = {}) => {
        // For consistency, max is derived as min*1.5 (and multiplied by guestCount when per-attendee).
        return formatMoneyRangeFromBasePrice(minRaw, { serviceLabel });
    };

    const selectVendorForService = async ({ serviceLabel, vendorAuthId, serviceId, price, sourceMessageId }) => {
        if (!eventId) return;

        try {
            const normalizedServiceId = serviceId != null && String(serviceId).trim() ? String(serviceId).trim() : null;
            setSelectingAltKey(`${serviceLabel}:${vendorAuthId}:${normalizedServiceId || ''}`);

            const servicePrice = computeMoneyRangeFromBase({
                basePrice: price,
                guestCount: guestCountForPricing,
                dayCount: dayCountForPricing,
                serviceLabel,
            });

            const res = await fetchWithAuth(
                `${EVENTS_API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}/vendors`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service: serviceLabel,
                        vendorAuthId,
                        serviceId: normalizedServiceId,
                        status: 'YET_TO_SELECT',
                        rejectionReason: null,
                        alternativeNeeded: false,
                        servicePrice,
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to select vendor');
            }

            dispatch(fetchPlanningVendorSelectionByEventId(eventId));
            setLockedAltByService((prev) => ({
                ...prev,
                [String(serviceLabel || '').trim().toLowerCase()]: String(vendorAuthId || '').trim(),
            }));
            setLockedAltServiceIdByService((prev) => ({
                ...prev,
                [String(serviceLabel || '').trim().toLowerCase()]: normalizedServiceId,
            }));
            setLockedAltMessageIdByService((prev) => ({
                ...prev,
                [String(serviceLabel || '').trim().toLowerCase()]: sourceMessageId != null ? String(sourceMessageId).trim() : null,
            }));
            toast.success('Vendor selected');
        } catch (e) {
            toast.error(e?.message || 'Failed to select vendor');
        } finally {
            setSelectingAltKey(null);
        }
    };

    const renderRichAlternatives = (msg, isMe) => {
        const rich = extractRichChatMessage(msg?.text);
        if (!rich || rich.kind !== 'vendorAlternatives') return null;

        const payload = rich.payload && typeof rich.payload === 'object' ? rich.payload : null;
        const serviceLabel = String(payload?.serviceLabel || '').trim();
        const options = Array.isArray(payload?.options) ? payload.options : [];
        const radiusKmRaw = Number(payload?.radiusKm);
        const radiusKm = Number.isFinite(radiusKmRaw) && radiusKmRaw > 0 ? radiusKmRaw : null;
        if (!serviceLabel || options.length === 0) return null;

        const msgId = String(msg?._id || msg?.id || '').trim();

        const normalizeService = (s) => String(s || '').trim().toLowerCase();
        const normalizeServiceId = (id) => {
            const s = id != null ? String(id).trim() : '';
            return s || null;
        };
        const serviceKey = normalizeService(serviceLabel);
        const statusForService = (() => {
            const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
            const match = list.find((v) => normalizeService(v?.service) === serviceKey);
            return String(match?.status || '').trim().toUpperCase();
        })();
        const isRejected = Boolean(statusForService) && statusForService.includes('REJECT');

        const latestIdForService = latestAltMessageIdByService?.[serviceKey] || null;
        const localLockMsgId = lockedAltMessageIdByService?.[serviceKey] != null ? String(lockedAltMessageIdByService[serviceKey]).trim() : null;
        const isLocalLockValid = !latestIdForService ? true : (Boolean(localLockMsgId) && localLockMsgId === latestIdForService);

        const lockedVendorAuthIdLocal = (isRejected || !isLocalLockValid) ? null : (lockedAltByService?.[serviceKey] || null);
        const lockedVendorAuthIdFromStore = (() => {
            const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
            const match = list.find((v) => normalizeService(v?.service) === serviceKey);
            const status = String(match?.status || '').trim().toUpperCase();
            if (status && status.includes('REJECT')) return null;
            if (match?.alternativeNeeded === true) return null;
            const id = match?.vendorAuthId != null ? String(match.vendorAuthId).trim() : '';
            return id || null;
        })();
        const lockedVendorAuthId = lockedVendorAuthIdLocal || lockedVendorAuthIdFromStore || null;

        const lockedServiceIdFromStore = (() => {
            const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
            const match = list.find((v) => normalizeService(v?.service) === serviceKey);
            const status = String(match?.status || '').trim().toUpperCase();
            if (status && status.includes('REJECT')) return null;
            if (match?.alternativeNeeded === true) return null;
            return normalizeServiceId(match?.serviceId);
        })();

        const lockedServiceIdLocal = (isRejected || !isLocalLockValid) ? null : (lockedAltServiceIdByService?.[serviceKey] || null);
        const lockedServiceId = lockedServiceIdLocal || lockedServiceIdFromStore || null;

        const formatDistance = (km) => {
            const n = Number(km);
            if (!Number.isFinite(n)) return null;
            if (n < 1) return `${Math.round(n * 1000)} m`;
            return `${n.toFixed(1)} km`;
        };

        const isVenue = serviceKey === 'venue';

        return (
            <div className="space-y-3">
                <div className={`text-sm font-extrabold ${isMe ? 'text-white' : 'text-gray-900'}`}>Alternative options for {serviceLabel}</div>
                {radiusKm != null && (
                    <div className={`text-xs ${isMe ? 'text-white/70' : 'text-gray-600'}`}>Showing options within {radiusKm} km of the event location</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {options.slice(0, 6).map((o) => {
                        const vendorAuthId = String(o?.vendorAuthId || '').trim();
                        const optionServiceId = normalizeServiceId(o?.serviceId);
                        const key = `${msgId}:${serviceLabel}:${vendorAuthId}:${optionServiceId || ''}`;
                        const expanded = Boolean(expandedAltKeys[key]);
                        const selecting = selectingAltKey === `${serviceLabel}:${vendorAuthId}:${optionServiceId || ''}`;
                        const latestId = latestAltMessageIdByService?.[serviceKey] || null;
                        const isLatestForService = !msgId || !latestId ? true : latestId === msgId;
                        const isLocked = Boolean(lockedVendorAuthId);
                        const isSelected = isLocked
                            && vendorAuthId
                            && lockedVendorAuthId === vendorAuthId
                            && (!lockedServiceId || !optionServiceId || lockedServiceId === optionServiceId);
                        const isDisabled = !vendorAuthId || selecting || !isLatestForService || (isLocked && !isSelected);
                        const displayName = isVenue ? (o?.name || o?.businessName || 'Venue') : (o?.businessName || 'Vendor');
                        const displayVendorName = isVenue
                            && o?.businessName
                            && o?.name
                            && String(o.name).trim()
                            && String(o.businessName).trim()
                            && String(o.name).trim() !== String(o.businessName).trim()
                            ? String(o.businessName).trim()
                            : null;
                        const tier = o?.tier ? String(o.tier) : '';
                        const priceText = formatMoneyRangeFromMinMax(o?.priceMin ?? o?.price, o?.priceMax, { serviceLabel });
                        const distanceText = o?.distanceText || formatDistance(o?.distanceKm);
                        const services = Array.isArray(o?.services) ? o.services : [];
                        const showServices = !isVenue && services.length > 0;
                        const showExpandedPanel = expanded;
                        const showVendorSummaryLine = !(showServices && showExpandedPanel);
                        const locationName = (() => {
                            const loc = o?.location;
                            if (!loc) return '';
                            if (typeof loc === 'string') return loc;
                            if (typeof loc === 'object' && typeof loc?.name === 'string') return loc.name;
                            return '';
                        })();

                        return (
                            <div key={key} className="bg-white rounded-xl border border-gray-200 p-3 text-gray-900">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-extrabold truncate">{displayName}</div>
                                        {displayVendorName ? (
                                            <div className="text-[11px] font-bold text-gray-500 mt-0.5">{displayVendorName}</div>
                                        ) : null}
                                        {showVendorSummaryLine && (
                                            <div className="text-xs font-bold text-gray-500 mt-0.5">
                                                {tier ? tier : '—'} {tier ? '• ' : ''}{priceText}
                                            </div>
                                        )}
                                        {distanceText ? (
                                            <div className="text-[11px] font-bold text-gray-500 mt-0.5">{distanceText} from event</div>
                                        ) : null}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedAltKeys((prev) => ({ ...prev, [key]: !prev[key] }))}
                                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                                        >
                                            Explore
                                        </button>
                                        {isVenue ? (
                                            <button
                                                type="button"
                                                disabled={isDisabled}
                                                onClick={() => selectVendorForService({
                                                    serviceLabel,
                                                    vendorAuthId,
                                                    serviceId: o?.serviceId,
                                                    price: o?.price,
                                                    sourceMessageId: msgId,
                                                })}
                                                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 disabled:opacity-60"
                                            >
                                                {selecting ? 'Selecting…' : (isSelected ? 'Selected' : (isLocked || !isLatestForService ? 'Locked' : 'Select'))}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                {showExpandedPanel && (
                                    <div className="mt-3 text-xs text-gray-700 space-y-1">
                                        {(o?.serviceCategory || serviceLabel) && (
                                            <div><span className="font-bold">Service:</span> {o?.serviceCategory || serviceLabel}</div>
                                        )}
                                        {(locationName || o?.country) && (
                                            <div><span className="font-bold">Location:</span> {locationName}{o?.country ? `, ${o.country}` : ''}</div>
                                        )}
                                        {distanceText && (
                                            <div><span className="font-bold">Distance:</span> {distanceText} from event</div>
                                        )}
                                        {o?.description && (
                                            <div className="text-gray-600">{String(o.description)}</div>
                                        )}

                                        {showServices && (
                                            <div className="pt-2">
                                                <div className="font-bold text-gray-700 mb-1">Services</div>
                                                <div className="space-y-2">
                                                    {services.slice(0, 10).map((s, idx) => {
                                                        const svcId = s?.serviceId || s?.id || `${idx}`;
                                                        const normalizedSvcId = normalizeServiceId(svcId);
                                                        const svcSelecting = selectingAltKey === `${serviceLabel}:${vendorAuthId}:${normalizedSvcId || ''}`;
                                                        const svcDisabled = !normalizedSvcId || svcSelecting || !isLatestForService || (isLocked && (!isSelected || (lockedServiceId && lockedServiceId !== normalizedSvcId)));
                                                        const svcSelected = isLocked && isSelected && lockedServiceId && lockedServiceId === normalizedSvcId;
                                                        const svcTier = s?.tier ? String(s.tier) : '';
                                                        const svcName = s?.name ? String(s.name) : '';
                                                        const svcPrice = s?.price;
                                                        return (
                                                            <div key={String(normalizedSvcId)} className="flex items-start justify-between gap-2 border border-gray-100 rounded-lg p-2">
                                                                <div className="min-w-0">
                                                                    <div className="font-bold truncate">{svcTier || svcName || 'Service'}</div>
                                                                    <div className="text-[11px] text-gray-500 font-bold">
                                                                        {svcName && svcTier ? `${svcName} • ` : ''}{formatMoneyRangeFromBasePrice(svcPrice, { serviceLabel })}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    disabled={svcDisabled}
                                                                    onClick={() => selectVendorForService({
                                                                        serviceLabel,
                                                                        vendorAuthId,
                                                                        serviceId: normalizedSvcId,
                                                                        price: svcPrice,
                                                                        sourceMessageId: msgId,
                                                                    })}
                                                                    className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 disabled:opacity-60 shrink-0"
                                                                >
                                                                    {svcSelecting ? 'Selecting…' : (svcSelected ? 'Selected' : (isLocked || !isLatestForService ? 'Locked' : 'Select'))}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {stripRichChatMessage(msg?.text) ? (
                    <div className={`text-xs whitespace-pre-wrap ${isMe ? 'text-white/70' : 'text-gray-600'}`}>{stripRichChatMessage(msg?.text)}</div>
                ) : null}
            </div>
        );
    };

    const handleDeleteMessage = async (id) => {
        const deleteId = String(id);
        if (!deleteId || !conversationId) return;

        try {
            await deleteConversationMessage({
                conversationId,
                messageId: deleteId,
                dispatch,
                refreshAction: refreshAccessToken,
            });
            setMessages((prev) => prev.filter(m => String(m?._id || m?.id || '') !== deleteId));
            toast.success("Message deleted");
        } catch (error) {
            toast.error(error?.message || 'Failed to delete message');
        }
    };

    const handleEditMessage = async (id, newText) => {
        const editId = String(id);
        if (!editId || !conversationId) return;

        try {
            const updated = await updateConversationMessage({
                conversationId,
                messageId: editId,
                text: newText,
                dispatch,
                refreshAction: refreshAccessToken,
            });

            setMessages((prev) => prev.map((m) => (String(m?._id || m?.id || '') === editId ? { ...m, ...updated } : m)));
            toast.success('Message edited');
        } catch (error) {
            toast.error(error?.message || 'Failed to edit message');
        }
    };

    const handleEmojiClick = (emojiData) => {
        setChatInput(prev => prev + emojiData.emoji);
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const fileList = Array.from(e.target.files || []);
        if (!fileList.length) return;

        setPendingFiles((prev) => {
            const next = [...prev];
            for (const file of fileList) {
                if (!next.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) {
                    next.push(file);
                }
            }
            return next;
        });

        // allow re-selecting same file
        e.target.value = '';
    };

    const handleRemovePendingFile = (idx) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleStartEdit = (msg) => {
        const msgId = String(msg?._id || msg?.id || '');
        setEditingMessageId(msgId);
        setEditInput(msg?.text || '');
        setActiveMessageMenu(null);
    };

    const submitEdit = async (id) => {
        if (!editInput.trim()) return;
        await handleEditMessage(id, editInput);
        setEditingMessageId(null);
    };

    const renderMessageActions = (msg, isMe) => {
        const msgId = String(msg?._id || msg?.id || '');
        const isEditable = isMe; // Allow edits for demo purposes
        
        return (
            <div className={`absolute top-1 right-1 z-20`}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveMessageMenu(activeMessageMenu === msgId ? null : msgId);
                    }}
                    className={`p-1 ${isMe ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-black/5'} rounded-full transition-all opacity-0 group-hover/bubble:opacity-100 ${activeMessageMenu === msgId ? 'opacity-100 bg-black/5' : ''}`}
                >
                    <MoreVertical size={14} />
                </button>

                {activeMessageMenu === msgId && (
                    <div
                        ref={messageMenuRef}
                        className={`absolute z-60 top-full ${isMe ? 'right-0' : 'left-0'} mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 min-w-35 p-2 animate-in fade-in zoom-in-95 duration-200`}
                    >
                        {isEditable && (
                            <button
                                onClick={() => handleStartEdit(msg)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                            >
                                Edit
                            </button>
                        )}
                        <button
                            onClick={() => handleDeleteMessage(msgId)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const getMessageTimestamp = (msg) => {
        const createdAt = msg?.createdAt || msg?.date;
        if (!createdAt) return msg?.timestamp || '';
        const dt = new Date(createdAt);
        if (Number.isNaN(dt.getTime())) return msg?.timestamp || '';
        return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const resolveChatAssetUrl = (url) => {
        if (!url) return '';
        const s = String(url);
        return s.startsWith('http') ? s : `${CHAT_API_BASE_URL}${s}`;
    };

    const openAttachmentWithAuth = async ({ url, filename, mimetype }) => {
        const resolvedUrl = resolveChatAssetUrl(url);
        if (!resolvedUrl) return;

        // Cloudinary / external URLs should be opened directly (no auth header, avoids CORS preflight issues)
        if (String(url).startsWith('http') && !resolvedUrl.startsWith(CHAT_API_BASE_URL)) {
            window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        try {
            const res = await fetchWithAuth(
                resolvedUrl,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                throw new Error(msg || `Failed to open attachment (${res.status})`);
            }

            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const safeName = String(filename || 'attachment');
            const type = String(mimetype || res.headers.get('content-type') || '').toLowerCase();
            const isPreviewable = type.startsWith('image/') || type.includes('pdf') || type.startsWith('text/');

            if (isPreviewable) {
                const win = window.open(objectUrl, '_blank', 'noopener,noreferrer');
                if (!win) {
                    const a = document.createElement('a');
                    a.href = objectUrl;
                    a.download = safeName;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }
            } else {
                const a = document.createElement('a');
                a.href = objectUrl;
                a.download = safeName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }

            setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        } catch (e) {
            toast.error(e?.message || 'Unable to open attachment');
        }
    };

    const renderAttachments = (attachments = []) => {
        if (!Array.isArray(attachments) || attachments.length === 0) return null;

        return (
            <div className="mt-3 space-y-2">
                {attachments.map((a) => {
                    const url = a?.url;
                    const name = a?.originalName || a?.filename || 'Attachment';
                    const type = (a?.mimetype || '').toLowerCase();

                    const resolvedUrl = resolveChatAssetUrl(url);
                    const isImage = type.startsWith('image/') || (resolvedUrl && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(resolvedUrl));

                    if (!url) return null;

                    return isImage ? (
                        <button
                            key={`${String(url)}-${name}`}
                            type="button"
                            onClick={() => openAttachmentWithAuth({ url, filename: name, mimetype: type })}
                            className="block"
                            title="Open image"
                        >
                            <img src={resolvedUrl} alt={name} className="max-h-60 rounded-xl border border-black/5" />
                        </button>
                    ) : (
                        <button
                            key={`${String(url)}-${name}`}
                            type="button"
                            onClick={() => openAttachmentWithAuth({ url, filename: name, mimetype: type })}
                            className="block text-left text-sm font-bold underline underline-offset-2"
                            title="Open attachment"
                        >
                            {name}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderSidebarItem = (contact, Icon) => {
        const isActive = activeChannel === contact.id;
        const unreadCount = Number(unreadCountByContact?.[String(contact.id)] || 0);
        const isOnline = Boolean(presenceByAuthId?.[String(contact.id)]);

        return (
            <button
                key={contact.id}
                onClick={() => setActiveChannel(contact.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-[#e7f7f5] border-l-4 border-teal-500 shadow-sm' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
            >
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                    {Icon ? <Icon size={18} /> : <span className="text-xs font-bold">{contact.name.substring(0, 2).toUpperCase()}</span>}
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>

                <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-teal-900' : 'text-gray-700'}`}>{contact.name}</p>
                        {unreadCount > 0 && (
                            <span className="ml-2 min-w-5 h-5 px-1.5 rounded-full bg-teal-600 text-white text-[10px] font-bold leading-5 text-center shrink-0">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </div>
                    <p className={`text-xs truncate ${isActive ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>
                        {contact.role || contact.lastSeen}
                    </p>
                </div>
            </button>
        )
    };

    return (
        <div className="flex h-[calc(100vh-150px)] bg-white rounded-3xl border border-[#708aa0]/10 overflow-hidden shadow-sm">
            {/* --- LEFT SIDEBAR --- */}
            <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0">
                {/* Search */}
                <div className="p-5 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/10 text-gray-700 placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-scroll p-4 space-y-6 custom-scrollbar">

                    {/* Admin */}
                    {admins.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center px-3 mb-2">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Admin</h4>
                                <Users size={12} className="text-gray-300" />
                            </div>
                            <div className="space-y-1">
                                {admins.map(c => renderSidebarItem(c, null))}
                            </div>
                        </div>
                    )}

                    {/* Client */}
                    {canViewManagerCoordinatorSection && managerCoordinatorContacts.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center px-3 mb-2">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assigned Manager & Coordinator</h4>
                                <Users size={12} className="text-gray-300" />
                            </div>
                            <div className="space-y-1">
                                {managerCoordinatorContacts.map(c => renderSidebarItem(c, null))}
                            </div>
                        </div>
                    )}

                    {/* Client */}
                    {isPrivilegedAssignedRole && clients.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center px-3 mb-2">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Client</h4>
                                <Users size={12} className="text-gray-300" />
                            </div>
                            <div className="space-y-1">
                                {clients.map(c => renderSidebarItem(c, null))}
                            </div>
                        </div>
                    )}

                    {/* Internal Team */}
                    {isPrivilegedAssignedRole && team.length > 0 && (
                        <div>
                            <button
                                onClick={() => setIsInternalOpen(!isInternalOpen)}
                                className="w-full flex justify-between items-center px-3 mb-2 hover:bg-gray-50 rounded-lg py-1 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    {isInternalOpen ? (
                                        <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                    ) : (
                                        <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                    )}
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">Team Staff</h4>
                                </div>
                                <Users size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </button>

                            {isInternalOpen && (
                                <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-200 origin-top">
                                    {team.map(c => renderSidebarItem(c, null))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Vendors */}
                    {vendors.length > 0 && (
                        <div>
                            <button
                                onClick={() => setIsVendorsOpen(!isVendorsOpen)}
                                className="w-full flex justify-between items-center px-3 mb-2 hover:bg-gray-50 rounded-lg py-1 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    {isVendorsOpen ? (
                                        <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                    ) : (
                                        <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                    )}
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">Vendors</h4>
                                </div>
                                <Briefcase size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </button>

                            {isVendorsOpen && (
                                <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-200 origin-top">
                                    {vendors.map(c => renderSidebarItem(c, null))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">

                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-[#0b2d49]">
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-gray-900">
                                    {currentContact ? currentContact.name : 'Select a chat'}
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">
                                {currentContact?.role || 'Direct Message'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={messagesViewportRef} onScroll={handleMessagesScroll}>

                    {currentContact ? (
                        <>
                            <div className="flex items-center justify-center my-6">
                                <span className="bg-gray-200/50 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Chat History</span>
                            </div>

                            <div className="max-w-4xl mx-auto space-y-6">
                                {messages.map(msg => {
                                    const msgId = String(msg?._id || msg?.id || '');
                                    const isMe = String(msg?.senderAuthId || msg?.senderId || '') === currentUserId;
                                    const timestamp = getMessageTimestamp(msg);
                                    const readBy = Array.isArray(msg?.readBy) ? msg.readBy.map(String) : [];
                                    const isReadByOther = isMe ? readBy.some((id) => id && id !== currentUserId) : false;

                                    return (
                                        <div
                                            key={msgId || `${timestamp}-${String(msg?.senderAuthId || msg?.senderId || '')}`}
                                            className="group relative"
                                            onContextMenu={(e) => handleContextMenu(e, msgId)}
                                        >
                                            {isMe ? (
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-end gap-3 max-w-[75%]">
                                                        <div className="bg-[#0b2d49] text-white p-4 pr-7 rounded-2xl rounded-tr-sm shadow-sm relative group/bubble">
                                                            {renderMessageActions(msg, true)}
                                                            {editingMessageId === msgId ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <textarea
                                                                        className="bg-white/10 text-white rounded-xl p-2 text-sm outline-none border border-white/20 min-w-50"
                                                                        value={editInput}
                                                                        onChange={(e) => setEditInput(e.target.value)}
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex justify-end gap-2 text-xs">
                                                                        <button onClick={() => setEditingMessageId(null)} className="font-bold opacity-70">Cancel</button>
                                                                        <button onClick={() => submitEdit(msgId)} className="font-bold">Save</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {renderRichAlternatives(msg, true) || (
                                                                        <p className="text-sm font-medium leading-relaxed">{msg?.text}</p>
                                                                    )}
                                                                    {renderAttachments(msg?.attachments)}
                                                                    {(msg?.editedAt || msg?.isEdited) && <span className="text-[9px] opacity-40 float-right mt-1 ml-2 italic">edited</span>}
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0b2d49] flex items-center justify-center text-xs font-bold shrink-0 border border-blue-100 uppercase">ME</div>
                                                    </div>
                                                    <div className="flex items-center gap-1 mr-12">
                                                        <span className="text-[10px] font-bold text-gray-400">{timestamp}</span>
                                                        {isReadByOther ? (
                                                            <CheckCheck size={12} className="text-green-500" />
                                                        ) : (
                                                            <Check size={12} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="flex items-end gap-3 max-w-[75%]">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0 border border-gray-200">
                                                            {currentContact.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="bg-gray-100 text-gray-800 p-4 pr-7 rounded-2xl rounded-tl-sm shadow-sm relative group/bubble">
                                                            {renderMessageActions(msg, false)}
                                                            {renderRichAlternatives(msg, false) || (
                                                                <p className="text-sm font-medium leading-relaxed">{msg?.text}</p>
                                                            )}
                                                            {renderAttachments(msg?.attachments)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 ml-12">
                                                        <span className="text-[10px] font-bold text-gray-400">{timestamp}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Users size={48} className="mb-4 opacity-20" />
                            <p className="font-medium text-lg text-gray-500">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>

                {/* Footer Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <div className={`bg-gray-100 rounded-3xl px-2 py-1.5 flex items-center gap-1 border border-transparent transition-all relative ${currentContact ? 'focus-within:border-[#0b2d49]/10 focus-within:bg-gray-50' : 'opacity-50 pointer-events-none'}`}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={handleAttachClick}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <Paperclip size={20} />
                            </button>
                            <div className="relative" ref={emojiPickerRef}>
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-[#0b2d49] bg-gray-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <Smile size={20} />
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-4 shadow-2xl animate-in slide-in-from-bottom-2 duration-200 z-50">
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            autoFocusSearch={false}
                                            theme="light"
                                            width={320}
                                            height={400}
                                        />
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 outline-none focus:outline-none text-[15px] font-medium text-gray-800 placeholder-gray-500 min-w-0"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!chatInput.trim() && pendingFiles.length === 0}
                                className="p-3 bg-[#0b2d49] hover:bg-[#1a3b55] text-white rounded-full transition-all disabled:opacity-50 disabled:scale-95 shadow-md flex items-center justify-center shrink-0"
                            >
                                <Send size={18} />
                            </button>
                        </div>

                        {pendingFiles.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {pendingFiles.map((file, idx) => (
                                    <div key={`${file.name}-${file.size}-${file.lastModified}-${idx}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                                        <span className="max-w-48 truncate">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePendingFile(idx)}
                                            className="text-rose-600 hover:text-rose-700"
                                            aria-label="Remove attachment"
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* --- CONTEXT MENU --- */}
            {contextMenu.show && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-100 bg-white rounded-2xl shadow-2xl border border-gray-100 min-w-40 p-2 animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {(() => {
                        const msg = messages.find(m => String(m?._id || m?.id || '') === String(contextMenu.msgId));
                        if (!msg) return null;
                        const isMe = String(msg?.senderAuthId || msg?.senderId || '') === currentUserId;
                        const isEditable = isMe;

                        return (
                            <>
                                {isEditable && (
                                    <button
                                        onClick={() => {
                                            handleStartEdit(msg);
                                            setContextMenu(prev => ({ ...prev, show: false }));
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                    >
                                        Edit Message
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        handleDeleteMessage(contextMenu.msgId);
                                        setContextMenu(prev => ({ ...prev, show: false }));
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                                >
                                    Delete Message
                                </button>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default ChatTab;
