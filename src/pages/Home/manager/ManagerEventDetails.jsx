import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Edit, FileText, Users, Briefcase, MessageSquare,
    ListTodo, CalendarDays, DollarSign, FolderOpen, Share2, Printer, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import {
    fetchPlanningVendorSelectionByEventId,
    selectPlanningVendorSelectionByEventId,
} from '../../../store/slices/planningSlice';

// UI Components
import { Badge } from '../../../components/Manager/EventDetails/ui';

// Modal Components
import { EditEventModal } from '../../../components/Manager/EventDetails/modals';

// Tab Components
import {
    OverviewTab,
    GuestsTab,
    VendorsTab,
    FinancialsTab,
    ChatTab,
    ToDoTab,
    DocumentsTab
} from '../../../components/Manager/EventDetails/tabs';
// import NewChatTab from '../../../components/Manager/EventDetails/tabs/NewChatTab';

// Data
import { tabs as tabsData } from '../../../data/managerEventDetailsData';
import { fetchWithAuth } from '../../../utils/apiHandler';
import { refreshAccessToken, selectUser } from '../../../store/slices/authSlice';
import { ensureEventDmConversation, fetchConversationMessages } from '../../../utils/chatApi';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const MotionDiv = motion.div;

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const formatEventDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

const formatEventDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const toNonNegativeNumber = (value) => {
    const n = Number(value || 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
};

const formatMoneyShort = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return '₹0.00';
    return `₹${new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n)}`;
};

const toInrFromPaise = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Number((n / 100).toFixed(2));
};

const MANAGER_ACTION_ALLOWED_ASSIGNED_ROLES = new Set(['JUNIOR MANAGER', 'SENIOR EVENT MANAGER']);
const normalizeAssignedRole = (value) => String(value || '').trim().toUpperCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ');

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
    return String(payload?.authId || payload?.sub || payload?.userId || payload?.id || '').trim();
};

const getInitials = (name) => {
    const n = String(name || '').trim();
    if (!n) return 'NA';
    const parts = n.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || 'N';
    const last = (parts.length > 1 ? parts[parts.length - 1]?.[0] : '') || '';
    return `${first}${last}`.toUpperCase();
};

const ManagerEventDetails = () => {
    // Force HMR Update
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
    const currentUserAuthId = resolveAuthId({ user, accessToken });
    const shouldAutoExportFinancialUi = useMemo(() => {
        const params = new URLSearchParams(location.search || '');
        return String(params.get('exportUi') || '').trim() === '1';
    }, [location.search]);

    const vendorSelection = useSelector((state) => selectPlanningVendorSelectionByEventId(state, id));
    const [activeTab, setActiveTab] = useState('overview');
    const [scrolled, setScrolled] = useState(false);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [eventType, setEventType] = useState(null); // 'planning' | 'promote'
    const [rawEvent, setRawEvent] = useState(null);
    const [client, setClient] = useState(null);
    const [assignedManager, setAssignedManager] = useState(null);
    const [availableCoreStaff, setAvailableCoreStaff] = useState([]);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
    const [staffRefreshKey, setStaffRefreshKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [guestCount, setGuestCount] = useState(null);
    const [todoCount, setTodoCount] = useState(null);
    const [markingComplete, setMarkingComplete] = useState(false);
    const [payingGeneratedRevenue, setPayingGeneratedRevenue] = useState(false);
    const [promotionActionLoadingKey, setPromotionActionLoadingKey] = useState('');
    const [vendorPayoutMode, setVendorPayoutMode] = useState('DEMO');
    const [eventTransactions, setEventTransactions] = useState(null);
    const [guestExportTrigger, setGuestExportTrigger] = useState(0);
    const [guestNotifyTrigger, setGuestNotifyTrigger] = useState(0);

    // Scroll listener for sticky header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 200);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search || '');
        const requestedTab = String(params.get('tab') || '').trim().toLowerCase();
        if (!requestedTab) return;

        const allowedTabs = new Set(['overview', 'guests', 'vendors', 'chat', 'todo', 'financials', 'documents']);
        if (!allowedTabs.has(requestedTab)) return;

        setActiveTab(requestedTab);
    }, [location.search, id]);

    useEffect(() => {
        if (!id) return;
        dispatch(fetchPlanningVendorSelectionByEventId(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (!id) {
            setEventTransactions(null);
            return;
        }

        let cancelled = false;

        const loadEventTransactions = async () => {
            try {
                const res = await fetchWithAuth(
                    `${API_BASE_URL}/api/orders/admin/${encodeURIComponent(String(id))}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const json = await safeJson(res);
                if (cancelled) return;

                if (!res.ok || !json?.success) {
                    setEventTransactions(null);
                    return;
                }

                setEventTransactions(json.data || null);
            } catch {
                if (!cancelled) setEventTransactions(null);
            }
        };

        loadEventTransactions();

        return () => {
            cancelled = true;
        };
    }, [id, dispatch]);

    useEffect(() => {
        setGuestCount(null);
    }, [id]);

    useEffect(() => {
        setTodoCount(null);
    }, [id]);

    useEffect(() => {
        if (!id) {
            setGuestCount(0);
            return;
        }

        let cancelled = false;

        const loadGuestCount = async () => {
            try {
                const res = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/tickets/events/${encodeURIComponent(String(id))}/guests?page=1&limit=1`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const json = await safeJson(res);
                if (cancelled) return;

                if (!res.ok || !json?.success) {
                    setGuestCount(0);
                    return;
                }

                const total = Number(json?.data?.total || 0);
                setGuestCount(Number.isFinite(total) && total >= 0 ? total : 0);
            } catch {
                if (!cancelled) setGuestCount(0);
            }
        };

        loadGuestCount();

        return () => {
            cancelled = true;
        };
    }, [id, dispatch]);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        const loadEvent = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const planningRes = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(id))}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );
                const planningJson = await safeJson(planningRes);

                if (!cancelled && planningRes.ok && planningJson?.success) {
                    setEventType('planning');
                    setRawEvent(planningJson.data);
                    return;
                }

                const promoteRes = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/promote/${encodeURIComponent(String(id))}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );
                const promoteJson = await safeJson(promoteRes);

                if (!cancelled && promoteRes.ok && promoteJson?.success) {
                    setEventType('promote');
                    setRawEvent(promoteJson.data);
                    return;
                }

                throw new Error(promoteJson?.message || planningJson?.message || 'Event not found');
            } catch (err) {
                if (cancelled) return;
                setEventType(null);
                setRawEvent(null);
                setClient(null);
                setAssignedManager(null);
                setAvailableCoreStaff([]);
                setLoadError(err?.message || 'Failed to load event details');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadEvent();
        return () => {
            cancelled = true;
        };
    }, [id, dispatch]);

    useEffect(() => {
        if (!rawEvent?.authId) {
            setClient(null);
            return;
        }

        let cancelled = false;
        const loadClient = async () => {
            try {
                const res = await fetchWithAuth(
                    `${API_BASE_URL}/api/users/auth/${encodeURIComponent(String(rawEvent.authId))}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );
                const json = await safeJson(res);
                if (!cancelled && res.ok && json?.success) {
                    setClient(json.data);
                } else if (!cancelled) {
                    setClient(null);
                }
            } catch {
                if (!cancelled) setClient(null);
            }
        };

        loadClient();
        return () => {
            cancelled = true;
        };
    }, [rawEvent?.authId, dispatch]);

    useEffect(() => {
        const assignedManagerId = String(rawEvent?.assignedManagerId || rawEvent?.managerId || '').trim();
        if (!assignedManagerId) {
            setAssignedManager(null);
            return;
        }

        let cancelled = false;

        const loadAssignedManager = async () => {
            try {
                const res = await fetchWithAuth(
                    `${API_BASE_URL}/api/users/${encodeURIComponent(assignedManagerId)}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );
                const json = await safeJson(res);
                if (cancelled) return;

                if (!res.ok || !json?.success) {
                    setAssignedManager(null);
                    return;
                }

                setAssignedManager(json.data || null);
            } catch {
                if (!cancelled) setAssignedManager(null);
            }
        };

        loadAssignedManager();

        return () => {
            cancelled = true;
        };
    }, [rawEvent?.assignedManagerId, rawEvent?.managerId, dispatch]);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        const loadStaff = async () => {
            try {
                const res = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/staff/core/available?excludeEventId=${encodeURIComponent(String(id))}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );
                const json = await safeJson(res);
                if (!cancelled && res.ok) {
                    const staff = Array.isArray(json?.staff)
                        ? json.staff
                        : (Array.isArray(json?.data?.staff) ? json.data.staff : []);
                    setAvailableCoreStaff(staff);
                } else if (!cancelled) {
                    setAvailableCoreStaff([]);
                }
            } catch {
                if (!cancelled) setAvailableCoreStaff([]);
            }
        };

        loadStaff();
        return () => {
            cancelled = true;
        };
    }, [id, dispatch, staffRefreshKey]);

    useEffect(() => {
        let cancelled = false;

        const loadPayoutMode = async () => {
            try {
                const res = await fetchWithAuth(
                    `${API_BASE_URL}/api/orders/settings`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const json = await safeJson(res);
                if (cancelled || !res.ok || !json?.success) return;

                const mode = String(json?.data?.vendorPayoutMode || 'DEMO').trim().toUpperCase();
                setVendorPayoutMode(mode === 'RAZORPAY' ? 'RAZORPAY' : 'DEMO');
            } catch {
                if (!cancelled) setVendorPayoutMode('DEMO');
            }
        };

        loadPayoutMode();
        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    useEffect(() => {
        const coreStaffIds = Array.isArray(rawEvent?.coreStaffIds)
            ? rawEvent.coreStaffIds.map((v) => String(v || '').trim()).filter(Boolean)
            : [];

        if (!coreStaffIds.length) {
            setSelectedTeamMembers([]);
            return;
        }

        let cancelled = false;

        const loadAssignedTeam = async () => {
            try {
                const results = await Promise.all(
                    coreStaffIds.map(async (staffId) => {
                        try {
                            const res = await fetchWithAuth(
                                `${API_BASE_URL}/api/users/${encodeURIComponent(String(staffId))}`,
                                { method: 'GET' },
                                { dispatch, refreshAction: refreshAccessToken }
                            );
                            const json = await safeJson(res);
                            if (!res.ok || !json?.success) return null;
                            return json.data;
                        } catch {
                            return null;
                        }
                    })
                );

                const team = results.filter(Boolean);
                if (!cancelled) setSelectedTeamMembers(team);
            } catch {
                if (!cancelled) setSelectedTeamMembers([]);
            }
        };

        loadAssignedTeam();
        return () => {
            cancelled = true;
        };
    }, [rawEvent?.coreStaffIds, dispatch]);

    const event = useMemo(() => {
        if (!rawEvent) return null;

        if (eventType === 'planning') {
            const startAt = rawEvent?.schedule?.startAt || rawEvent?.eventDate || null;
            const endAt = rawEvent?.schedule?.endAt || rawEvent?.eventDate || null;
            const ticketAvailabilityStartAt = rawEvent?.ticketAvailability?.startAt || null;
            const ticketAvailabilityEndAt = rawEvent?.ticketAvailability?.endAt || null;
            const expectedGuests = rawEvent?.guestCount ?? rawEvent?.noOfGuest ?? rawEvent?.noOfGuests ?? null;
            const listingType = String(rawEvent?.category || '').trim().toLowerCase() === 'public' ? 'public' : 'private';
            return {
                id: rawEvent.eventId || id,
                type: 'planning',
                listingType,
                status: rawEvent.status || '—',
                title: rawEvent.eventTitle || 'Event',
                description: rawEvent.eventDescription || '',
                location: rawEvent?.location?.name || '—',
                date: formatEventDate(startAt),
                endDate: formatEventDate(endAt),
                organizer: client?.name || client?.fullName || '—',
                servicesOpted: Array.isArray(rawEvent?.selectedServices) ? rawEvent.selectedServices : [],
                preferredLocation: rawEvent?.location?.name || '—',
                expectedGuests,
                ticketAvailabilityStart: formatEventDateTime(ticketAvailabilityStartAt),
                ticketAvailabilityEnd: formatEventDateTime(ticketAvailabilityEndAt),
                ticketType: rawEvent?.tickets?.ticketType || null,
                ticketTiers: Array.isArray(rawEvent?.tickets?.tiers) ? rawEvent.tickets.tiers : [],
                ticketDayWiseAllocations: Array.isArray(rawEvent?.tickets?.dayWiseAllocations) ? rawEvent.tickets.dayWiseAllocations : [],
                totalTicketCapacity: rawEvent?.tickets?.totalTickets ?? null,
                ticketSalesStats: rawEvent?.ticketSalesStats && typeof rawEvent.ticketSalesStats === 'object' ? rawEvent.ticketSalesStats : null,
                selectedPromotions: Array.isArray(rawEvent?.promotionType) ? rawEvent.promotionType : [],
                platformFee: rawEvent?.platformFee ?? null,
                serviceChargePercent: rawEvent?.serviceChargePercent ?? null,
                client,
                availableCoreStaff,
                selectedTeamMembers,
            };
        }

        if (eventType === 'promote') {
            const ticketAvailabilityStartAt = rawEvent?.ticketAvailability?.startAt || null;
            const ticketAvailabilityEndAt = rawEvent?.ticketAvailability?.endAt || null;
            return {
                id: rawEvent.eventId || id,
                type: 'promote',
                listingType: 'public',
                status: rawEvent.eventStatus || rawEvent.status || '—',
                title: rawEvent.eventTitle || 'Event',
                description: rawEvent.eventDescription || '',
                location: rawEvent?.venue?.locationName || '—',
                date: formatEventDate(rawEvent?.schedule?.startAt),
                endDate: formatEventDate(rawEvent?.schedule?.endAt),
                organizer: client?.name || client?.fullName || '—',
                servicesOpted: Array.isArray(rawEvent?.promotion) ? rawEvent.promotion : [],
                preferredLocation: rawEvent?.venue?.locationName || '—',
                ticketAvailabilityStart: formatEventDateTime(ticketAvailabilityStartAt),
                ticketAvailabilityEnd: formatEventDateTime(ticketAvailabilityEndAt),
                ticketType: rawEvent?.tickets?.ticketType || null,
                ticketTiers: Array.isArray(rawEvent?.tickets?.tiers) ? rawEvent.tickets.tiers : [],
                ticketDayWiseAllocations: Array.isArray(rawEvent?.tickets?.dayWiseAllocations) ? rawEvent.tickets.dayWiseAllocations : [],
                totalTicketCapacity: rawEvent?.tickets?.noOfTickets ?? null,
                ticketSalesStats: rawEvent?.ticketSalesStats && typeof rawEvent.ticketSalesStats === 'object' ? rawEvent.ticketSalesStats : null,
                selectedPromotions: Array.isArray(rawEvent?.promotion) ? rawEvent.promotion : [],
                platformFee: rawEvent?.platformFee ?? null,
                serviceChargePercent: rawEvent?.serviceChargePercent ?? null,
                client,
                availableCoreStaff,
                selectedTeamMembers,
            };
        }

        return null;
    }, [rawEvent, eventType, id, client, availableCoreStaff, selectedTeamMembers]);

    const handleSaveEdits = async ({ eventTitle, locationName, eventDescription }) => {
        if (!eventType) throw new Error('Unknown event type');

        const endpoint = eventType === 'planning'
            ? `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(id))}`
            : `${API_BASE_URL}/api/events/promote/${encodeURIComponent(String(id))}`;

        const res = await fetchWithAuth(
            endpoint,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    eventTitle,
                    eventDescription,
                    locationName,
                }),
            },
            { dispatch, refreshAction: refreshAccessToken }
        );

        const json = await safeJson(res);
        if (!res.ok || !json?.success) {
            throw new Error(json?.message || 'Failed to update event');
        }

        setRawEvent(json.data);
    };

    const handleAddTeamMember = async (staffMember) => {
        if (!eventType) throw new Error('Unknown event type');
        const staffId = staffMember?.id || staffMember?._id;
        if (!staffId) throw new Error('Invalid staff id');

        const endpoint = eventType === 'planning'
            ? `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(id))}/core-staff`
            : `${API_BASE_URL}/api/events/promote/${encodeURIComponent(String(id))}/core-staff`;

        const res = await fetchWithAuth(
            endpoint,
            {
                method: 'POST',
                body: JSON.stringify({ staffId: String(staffId) }),
            },
            { dispatch, refreshAction: refreshAccessToken }
        );

        const json = await safeJson(res);
        if (!res.ok || !json?.success) {
            throw new Error(json?.message || 'Failed to assign staff');
        }

        setRawEvent(json.data);
        setStaffRefreshKey((v) => v + 1);
    };

    const handleRemoveTeamMember = async (staffMember) => {
        if (!eventType) throw new Error('Unknown event type');
        const staffId = staffMember?.id || staffMember?._id;
        if (!staffId) throw new Error('Invalid staff id');

        const endpoint = eventType === 'planning'
            ? `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(id))}/core-staff/${encodeURIComponent(String(staffId))}`
            : `${API_BASE_URL}/api/events/promote/${encodeURIComponent(String(id))}/core-staff/${encodeURIComponent(String(staffId))}`;

        const res = await fetchWithAuth(
            endpoint,
            { method: 'DELETE' },
            { dispatch, refreshAction: refreshAccessToken }
        );

        const json = await safeJson(res);
        if (!res.ok || !json?.success) {
            throw new Error(json?.message || 'Failed to remove staff');
        }

        setRawEvent(json.data);
        setStaffRefreshKey((v) => v + 1);
    };

    // Icon mapping for tabs
    const iconMap = {
        FileText,
        Users,
        Briefcase,
        MessageSquare,
        ListTodo,
        CalendarDays,
        DollarSign,
        FolderOpen
    };

    const vendorSlotCount = useMemo(() => {
        if (!vendorSelection) return null;
        if (Array.isArray(vendorSelection?.selectedServices)) return vendorSelection.selectedServices.length;
        if (Array.isArray(vendorSelection?.vendors)) return vendorSelection.vendors.length;
        return null;
    }, [vendorSelection]);

    const promoteProofCount = useMemo(() => {
        if (eventType !== 'promote') return null;
        return Array.isArray(rawEvent?.authenticityProofs) ? rawEvent.authenticityProofs.length : 0;
    }, [eventType, rawEvent?.authenticityProofs]);

    const canUseRestrictedManagerActions = useMemo(
        () => MANAGER_ACTION_ALLOWED_ASSIGNED_ROLES.has(normalizeAssignedRole(user?.assignedRole)),
        [user?.assignedRole]
    );

    const canNotifyGuests = useMemo(() => {
        const assignedManagerAuthId = String(assignedManager?.authId || '').trim();
        const actorAuthId = String(currentUserAuthId || '').trim();
        if (!assignedManagerAuthId || !actorAuthId) return false;
        return assignedManagerAuthId === actorAuthId;
    }, [assignedManager?.authId, currentUserAuthId]);

    const chatContactAuthIds = useMemo(() => {
        const ids = new Set();

        const clientAuthId = String(client?.authId || rawEvent?.authId || '').trim();
        if (canUseRestrictedManagerActions && clientAuthId) ids.add(clientAuthId);

        const acceptedVendorAuthIds = (Array.isArray(vendorSelection?.vendors) ? vendorSelection.vendors : [])
            .filter((v) => String(v?.status || '').trim().toUpperCase() === 'ACCEPTED')
            .map((v) => String(v?.vendorAuthId || '').trim())
            .filter(Boolean);

        for (const authId of acceptedVendorAuthIds) ids.add(authId);

        const assignedManagerAuthId = String(assignedManager?.authId || '').trim();
        if (assignedManagerAuthId && assignedManagerAuthId !== String(currentUserAuthId || '').trim()) {
            ids.add(assignedManagerAuthId);
        }

        for (const member of (Array.isArray(selectedTeamMembers) ? selectedTeamMembers : [])) {
            const authId = String(member?.authId || '').trim();
            if (!authId || authId === String(currentUserAuthId || '').trim()) continue;
            ids.add(authId);
        }

        return Array.from(ids);
    }, [
        canUseRestrictedManagerActions,
        client?.authId,
        rawEvent?.authId,
        vendorSelection?.vendors,
        assignedManager?.authId,
        selectedTeamMembers,
        currentUserAuthId,
    ]);

    useEffect(() => {
        const eventId = String(id || '').trim();
        const managerAuthId = String(currentUserAuthId || '').trim();
        const contactAuthIds = Array.isArray(chatContactAuthIds) ? chatContactAuthIds : [];

        if (!eventId || !managerAuthId || contactAuthIds.length === 0) {
            setUnreadChatCount(0);
            return;
        }

        if (activeTab === 'chat') {
            // While chat tab is open, ChatTab itself pushes live unread totals.
            return;
        }

        let cancelled = false;

        const loadUnreadCount = async () => {
            try {
                const counts = await Promise.all(contactAuthIds.map(async (otherAuthId) => {
                    try {
                        const convo = await ensureEventDmConversation({
                            eventId,
                            otherAuthId,
                            dispatch,
                            refreshAction: refreshAccessToken,
                        });

                        const conversationId = String(convo?._id || convo?.id || '').trim();
                        if (!conversationId) return 0;

                        const messages = await fetchConversationMessages({
                            conversationId,
                            limit: 200,
                            dispatch,
                            refreshAction: refreshAccessToken,
                        });

                        return (Array.isArray(messages) ? messages : []).filter((msg) => {
                            const sender = String(msg?.senderAuthId || msg?.senderId || '').trim();
                            if (!sender || sender === managerAuthId) return false;
                            const readBy = Array.isArray(msg?.readBy) ? msg.readBy.map((v) => String(v || '').trim()) : [];
                            return !readBy.includes(managerAuthId);
                        }).length;
                    } catch {
                        return 0;
                    }
                }));

                if (cancelled) return;

                const unreadTotal = counts.reduce((sum, n) => sum + Number(n || 0), 0);
                setUnreadChatCount(unreadTotal);
            } catch {
                if (!cancelled) setUnreadChatCount(0);
            }
        };

        loadUnreadCount();
        const timer = setInterval(loadUnreadCount, 20000);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [id, currentUserAuthId, activeTab, dispatch, chatContactAuthIds]);

    const tabs = tabsData
        .filter((tab) => {
            if (tab.id === 'schedule') return false;
            if (!canUseRestrictedManagerActions && tab.id === 'vendors') return false;
            if (eventType === 'promote' && tab.id === 'vendors') return false;
            if (eventType === 'planning' && tab.id === 'documents') return false;
            return true;
        })
        .map(tab => ({
            ...tab,
            icon: iconMap[tab.icon],
            count: tab.id === 'vendors'
                ? (vendorSlotCount ?? tab.count)
                : tab.id === 'guests'
                    ? (guestCount ?? tab.count)
                : tab.id === 'chat'
                    ? unreadChatCount
                : tab.id === 'todo'
                    ? (todoCount ?? tab.count)
                : tab.id === 'documents' && eventType === 'promote'
                    ? promoteProofCount
                    : tab.count,
        }));

    useEffect(() => {
        if (!canUseRestrictedManagerActions && activeTab === 'vendors') {
            setActiveTab('overview');
            return;
        }

        if (eventType === 'promote' && activeTab === 'vendors') {
            setActiveTab('overview');
        }
    }, [eventType, activeTab, canUseRestrictedManagerActions]);

    useEffect(() => {
        if (activeTab === 'schedule') {
            setActiveTab('overview');
            return;
        }

        if (eventType === 'planning' && activeTab === 'documents') {
            setActiveTab('overview');
        }
    }, [eventType, activeTab]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    const handlePrint = () => {
        toast("Preparing print view...", { icon: '🖨️' });
        setTimeout(() => window.print(), 1000);
    };

    const handleQuickSendAnnouncement = () => {
        setActiveTab('guests');
        setGuestNotifyTrigger((v) => v + 1);
    };

    const handleQuickDownloadAttendeeList = () => {
        setActiveTab('guests');
        setGuestExportTrigger((v) => v + 1);
    };

    const handleQuickContactVenue = () => {
        if (eventType !== 'planning') return;

        if (!canUseRestrictedManagerActions) {
            toast.error('Vendor contacts are available only for assigned manager roles.');
            return;
        }

        setActiveTab('vendors');
        toast('Open accepted vendor cards to view venue/vendor details.', { icon: 'ℹ️' });
    };

    const handleQuickSendQuoteToClient = async () => {
        if (eventType !== 'planning') return;

        if (!canUseRestrictedManagerActions) {
            toast.error('Sending quotation mail is available only for assigned manager roles.');
            return;
        }

        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(id))}/quote/send-email`,
                {
                    method: 'POST',
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to send quotation email');
            }

            setActiveTab('vendors');
            toast.success(json?.message || 'Quotation email sent to client.');
        } catch (error) {
            toast.error(error?.message || 'Failed to send quotation email');
        }
    };

    const normalizedStatus = String(event?.status || '').trim().toUpperCase();
    const planningListingType = String(event?.listingType || '').trim().toLowerCase();
    const isPlanningEvent = eventType === 'planning';
    const canManagerCompletePlanning = isPlanningEvent && ['private', 'public'].includes(planningListingType);
    const hasEventDateReached = useMemo(() => {
        const sourceDate = rawEvent?.schedule?.startAt || rawEvent?.eventDate || null;
        if (!sourceDate) return false;

        const parsed = new Date(sourceDate);
        if (Number.isNaN(parsed.getTime())) return false;

        const eventDayStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return todayStart >= eventDayStart;
    }, [rawEvent?.schedule?.startAt, rawEvent?.eventDate]);
    const canMarkAsComplete = canManagerCompletePlanning && normalizedStatus === 'CONFIRMED' && hasEventDateReached;
    const generatedRevenuePayout = useMemo(() => {
        const isPlanningPublic = eventType === 'planning' && String(event?.listingType || '').trim().toLowerCase() === 'public';
        const isPromote = eventType === 'promote';
        const isSupported = isPlanningPublic || isPromote;
        const normalizedEventStatus = String(event?.status || '').trim().toUpperCase().replace(/_/g, ' ');
        const planningCompletionMarked = !isPlanningPublic
            || ['COMPLETED', 'VENDOR PAYMENT PENDING', 'CLOSED'].includes(normalizedEventStatus);

        const generatedRevenueInr = toNonNegativeNumber(event?.ticketSalesStats?.grossRevenueInr);
        const platformFeeInr = toNonNegativeNumber(
            event?.ticketSalesStats?.platformFeeInr
            ?? event?.platformFee
        );
        const serviceChargeInr = toNonNegativeNumber(event?.ticketSalesStats?.serviceChargeInr);
        const totalFeesInr = toNonNegativeNumber(
            event?.ticketSalesStats?.totalFeesInr
            ?? (platformFeeInr + serviceChargeInr)
        );

        const totalVendorCostInr = isPlanningPublic
            ? (Array.isArray(vendorSelection?.vendors) ? vendorSelection.vendors : []).reduce((sum, row) => {
                const lockedPrice = toNonNegativeNumber(row?.vendorQuotedPrice);
                const commissionAmount = toNonNegativeNumber(row?.commissionAmount);
                const isLocked = Boolean(row?.priceLocked) && lockedPrice > 0;
                if (!isLocked) return sum;
                return sum + Math.max(0, lockedPrice - commissionAmount);
            }, 0)
            : 0;

        const payoutAmountInr = Number(Math.max(0, generatedRevenueInr - totalFeesInr).toFixed(2));
        const payoutStatus = String(rawEvent?.generatedRevenuePayout?.status || '').trim().toUpperCase();
        const payoutPaidInr = payoutStatus === 'SUCCESS'
            ? toInrFromPaise(rawEvent?.generatedRevenuePayout?.amountPaise)
            : 0;
        const payoutPendingInr = Number(Math.max(0, payoutAmountInr - payoutPaidInr).toFixed(2));

        const totalAmountInr = toNonNegativeNumber(
            rawEvent?.totalAmount
            ?? vendorSelection?.totalMaxAmount
        );
        const depositPaidInr = toInrFromPaise(rawEvent?.depositPaidAmountPaise);
        const vendorConfirmationPaidInr = toInrFromPaise(rawEvent?.vendorConfirmationPaidAmountPaise);
        const remainingPaymentPaidInr = toInrFromPaise(rawEvent?.remainingPaymentPaidAmountPaise);
        const totalMilestonesPaidInr = Number((depositPaidInr + vendorConfirmationPaidInr + remainingPaymentPaidInr).toFixed(2));
        const remainingPaymentDueInr = Number(Math.max(0, totalAmountInr - totalMilestonesPaidInr).toFixed(2));
        const remainingPaymentSettled = !isPlanningPublic
            || Boolean(rawEvent?.remainingPaymentPaid)
            || remainingPaymentDueInr <= 0;

        return {
            isSupported,
            generatedRevenueInr,
            totalVendorCostInr,
            platformFeeInr,
            serviceChargeInr,
            totalFeesInr,
            payoutAmountInr,
            alreadyPaid: payoutStatus === 'SUCCESS',
            payoutPaidInr,
            payoutPendingInr,
            requiresCompletionFirst: isPlanningPublic,
            completionMarked: planningCompletionMarked,
            requiresRemainingPaymentFirst: isPlanningPublic,
            remainingPaymentSettled,
            remainingPaymentDueInr,
        };
    }, [
        eventType,
        event?.listingType,
        event?.status,
        event?.platformFee,
        event?.ticketSalesStats,
        rawEvent?.totalAmount,
        rawEvent?.remainingPaymentPaid,
        rawEvent?.depositPaidAmountPaise,
        rawEvent?.vendorConfirmationPaidAmountPaise,
        rawEvent?.remainingPaymentPaidAmountPaise,
        rawEvent?.generatedRevenuePayout?.amountPaise,
        vendorSelection?.vendors,
        vendorSelection?.totalMaxAmount,
        rawEvent?.generatedRevenuePayout?.status,
    ]);

    const privateBilling = useMemo(() => {
        const listingType = String(event?.listingType || '').trim().toLowerCase();
        const isPlanningEvent = eventType === 'planning';
        const isPrivatePlanningEvent = isPlanningEvent && listingType === 'private';
        const isPublicPlanningEvent = isPlanningEvent && listingType === 'public';
        const isPromoteEvent = eventType === 'promote';
        const isPlanningMilestoneBilling = isPrivatePlanningEvent || isPublicPlanningEvent;

        const normalizedEventStatus = String(event?.status || '').trim().toUpperCase().replace(/_/g, ' ');
        const planningVisibleStatuses = ['VERIFIED', 'CONFIRMED', 'COMPLETED', 'VENDOR PAYMENT PENDING', 'CLOSED'];
        const canShow = isPlanningMilestoneBilling
            ? planningVisibleStatuses.includes(normalizedEventStatus)
            : isPromoteEvent;

        if (!isPlanningMilestoneBilling && !isPromoteEvent) {
            return { enabled: false };
        }

        if (isPromoteEvent) {
            const promoteOrders = (Array.isArray(eventTransactions?.orders) ? eventTransactions.orders : [])
                .map((row) => ({
                    status: String(row?.status || '').trim().toUpperCase(),
                    orderType: String(row?.orderType || '').trim().toUpperCase(),
                    amountPaise: Number(row?.amount || 0),
                    createdAt: row?.createdAt || null,
                    paidAt: row?.paidAt || null,
                }))
                .filter((row) => row.orderType === 'PROMOTE EVENT')
                .filter((row) => Number.isFinite(row.amountPaise) && row.amountPaise > 0)
                .sort((a, b) => {
                    const at = new Date(a?.createdAt || 0).getTime();
                    const bt = new Date(b?.createdAt || 0).getTime();
                    return bt - at;
                });

            const latestPromoteOrder = promoteOrders[0] || null;
            const latestPaidPromoteOrder = [...promoteOrders]
                .filter((row) => row.status === 'PAID')
                .sort((a, b) => {
                    const at = new Date(a?.paidAt || a?.createdAt || 0).getTime();
                    const bt = new Date(b?.paidAt || b?.createdAt || 0).getTime();
                    return bt - at;
                })[0] || null;

            const promotePaidTotalInrRaw = Number(
                (
                    promoteOrders
                        .filter((row) => row.status === 'PAID')
                        .reduce((sum, row) => sum + Number(row.amountPaise || 0), 0)
                ) / 100
            );

            const settlementAmountInr = latestPaidPromoteOrder
                ? toInrFromPaise(latestPaidPromoteOrder.amountPaise)
                : (latestPromoteOrder ? toInrFromPaise(latestPromoteOrder.amountPaise) : 0);

            const promotePaidTotalInr = settlementAmountInr > 0
                ? Number(Math.min(settlementAmountInr, promotePaidTotalInrRaw || 0).toFixed(2))
                : Number((promotePaidTotalInrRaw || 0).toFixed(2));

            const settlementOutstandingInr = Number(
                Math.max(0, settlementAmountInr - promotePaidTotalInr).toFixed(2)
            );

            const hasSettlementOrders = settlementAmountInr > 0 || promotePaidTotalInr > 0;

            if (hasSettlementOrders) {
                const hasPendingCreatedOrder = promoteOrders.some((row) => row.status === 'CREATED');

                return {
                    enabled: canShow,
                    normalizedStatus: normalizedEventStatus,
                    billingScope: 'promote',
                    summaryText: 'Promote settlement summary for activation billing.',
                    statusNote: promotePaidTotalInr > 0
                        ? (hasPendingCreatedOrder
                            ? 'Payment is completed. Additional CREATED entries are pending retries and do not increase due amount.'
                            : 'Payment is completed for this promote event.')
                        : 'Settlement payment is pending for this promote event.',
                    totalAmountInr: settlementAmountInr,
                    paidTotalInr: promotePaidTotalInr,
                    outstandingDueInr: settlementOutstandingInr,
                    lineItems: [
                        {
                            id: 'promote-settlement',
                            serviceName: 'Promote Settlement Fee',
                            businessName: 'Platform + marketing + tax billing',
                            amountInr: settlementAmountInr,
                        },
                    ],
                    paidBreakdownRows: [
                        { label: 'Settlement Total', amountInr: settlementAmountInr },
                        { label: 'Settlement Paid', amountInr: promotePaidTotalInr },
                        { label: 'Outstanding Due', amountInr: settlementOutstandingInr },
                    ],
                };
            }

            const grossRevenueInr = toNonNegativeNumber(event?.ticketSalesStats?.grossRevenueInr);
            const platformFeeInr = toNonNegativeNumber(
                event?.ticketSalesStats?.platformFeeInr
                ?? event?.platformFee
            );
            const serviceChargeInr = toNonNegativeNumber(event?.ticketSalesStats?.serviceChargeInr);
            const totalFeesInr = toNonNegativeNumber(
                event?.ticketSalesStats?.totalFeesInr
                ?? (platformFeeInr + serviceChargeInr)
            );

            const totalVendorCostInr = isPublicPlanningEvent
                ? (Array.isArray(vendorSelection?.vendors) ? vendorSelection.vendors : []).reduce((sum, row) => {
                    const lockedPrice = toNonNegativeNumber(row?.vendorQuotedPrice);
                    const commissionAmount = toNonNegativeNumber(row?.commissionAmount);
                    const isLocked = Boolean(row?.priceLocked) && lockedPrice > 0;
                    if (!isLocked) return sum;
                    return sum + Math.max(0, lockedPrice - commissionAmount);
                }, 0)
                : 0;

            const payoutTotalInr = Number(
                Math.max(0, grossRevenueInr - totalFeesInr - totalVendorCostInr).toFixed(2)
            );
            const payoutStatus = String(rawEvent?.generatedRevenuePayout?.status || '').trim().toUpperCase();
            const payoutPaidInr = payoutStatus === 'SUCCESS'
                ? toInrFromPaise(rawEvent?.generatedRevenuePayout?.amountPaise)
                : 0;
            const outstandingDueInr = Number(Math.max(0, payoutTotalInr - payoutPaidInr).toFixed(2));

            const lineItems = [
                {
                    id: 'generated-revenue',
                    serviceName: 'Generated Ticket Revenue',
                    businessName: 'Total collected from ticket sales',
                    amountInr: grossRevenueInr,
                },
                {
                    id: 'total-fees',
                    serviceName: 'Total Platform Fees',
                    businessName: 'Platform fee + service charge',
                    amountInr: totalFeesInr,
                },
                ...(isPublicPlanningEvent
                    ? [{
                        id: 'vendor-cost',
                        serviceName: 'Vendor Cost',
                        businessName: 'Locked vendor commitments',
                        amountInr: totalVendorCostInr,
                    }]
                    : []),
            ];

            return {
                enabled: canShow,
                normalizedStatus: normalizedEventStatus,
                billingScope: 'promote',
                summaryText: 'Promote event billing summary with generated revenue, fees, and payout progress.',
                statusNote: 'Payout is released from generated revenue after fee settlement.',
                totalAmountInr: payoutTotalInr,
                paidTotalInr: payoutPaidInr,
                outstandingDueInr,
                lineItems,
                paidBreakdownRows: [
                    { label: 'Platform Fee', amountInr: platformFeeInr },
                    { label: 'Service Charge', amountInr: serviceChargeInr },
                    ...(isPublicPlanningEvent ? [{ label: 'Vendor Cost', amountInr: totalVendorCostInr }] : []),
                    { label: 'Total Fees', amountInr: totalFeesInr },
                    { label: 'Payout Released', amountInr: payoutPaidInr },
                    { label: 'Outstanding Payout', amountInr: outstandingDueInr },
                ],
            };
        }

        const selectedServices = Array.isArray(vendorSelection?.selectedServices)
            ? vendorSelection.selectedServices
            : (Array.isArray(rawEvent?.selectedServices) ? rawEvent.selectedServices : []);
        const vendors = Array.isArray(vendorSelection?.vendors) ? vendorSelection.vendors : [];
        const vendorProfiles = Array.isArray(vendorSelection?.vendorProfiles) ? vendorSelection.vendorProfiles : [];
        const profileByAuthId = new Map(
            vendorProfiles
                .map((profile) => [String(profile?.authId || '').trim(), profile])
                .filter(([key]) => Boolean(key))
        );

        const toServiceKey = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const vendorByService = new Map(
            vendors
                .filter((row) => row?.service)
                .map((row) => [toServiceKey(row.service), row])
        );

        const lineItems = (Array.isArray(selectedServices) ? selectedServices : [])
            .map((serviceName, idx) => {
                const serviceKey = toServiceKey(serviceName);
                const vendorRow = vendorByService.get(serviceKey) || null;
                const vendorAuthId = String(vendorRow?.vendorAuthId || '').trim();
                const vendorProfile = vendorAuthId ? profileByAuthId.get(vendorAuthId) : null;
                const lockedPrice = toNonNegativeNumber(vendorRow?.vendorQuotedPrice);
                const estimatedPrice = Math.max(
                    toNonNegativeNumber(vendorRow?.servicePrice?.max),
                    toNonNegativeNumber(vendorRow?.servicePrice?.min)
                );
                const amountInr = lockedPrice > 0 ? lockedPrice : estimatedPrice;

                return {
                    id: `${serviceKey || 'service'}:${idx}`,
                    serviceName: String(vendorRow?.serviceName || serviceName || 'Service').trim(),
                    businessName: vendorProfile?.businessName || (vendorAuthId ? 'Selected Vendor' : 'Vendor TBD'),
                    amountInr,
                };
            })
            .filter((item) => item.amountInr > 0 || item.businessName);

        const lockedTotalInr = vendors.reduce((sum, row) => sum + toNonNegativeNumber(row?.vendorQuotedPrice), 0);
        const lineItemsTotalInr = lineItems.reduce((sum, item) => sum + toNonNegativeNumber(item?.amountInr), 0);
        const rangeMaxInr = toNonNegativeNumber(vendorSelection?.totalMaxAmount);
        const eventTotalInr = toNonNegativeNumber(rawEvent?.totalAmount);
        const totalAmountInr = eventTotalInr || lockedTotalInr || rangeMaxInr || lineItemsTotalInr;

        const depositPaidInr = toInrFromPaise(rawEvent?.depositPaidAmountPaise);
        const vendorConfirmationPaidInr = toInrFromPaise(rawEvent?.vendorConfirmationPaidAmountPaise);
        const remainingPaymentPaidInr = toInrFromPaise(rawEvent?.remainingPaymentPaidAmountPaise);
        const paidTotalInr = Number((depositPaidInr + vendorConfirmationPaidInr + remainingPaymentPaidInr).toFixed(2));
        const outstandingDueInr = Number(Math.max(0, totalAmountInr - paidTotalInr).toFixed(2));

        return {
            enabled: canShow,
            normalizedStatus: normalizedEventStatus,
            billingScope: isPublicPlanningEvent ? 'planning-public' : 'planning-private',
            summaryText: isPublicPlanningEvent
                ? 'Public event billing summary with outstanding dues and paid milestones.'
                : 'Private event billing summary with outstanding dues and paid milestones.',
            statusNote: normalizedEventStatus === 'CONFIRMED'
                ? (isPublicPlanningEvent
                    ? 'Billing is visible now for confirmed public events. Remaining collection is completed after event completion.'
                    : 'Billing is visible now for confirmed private events. Remaining collection is completed after event completion.')
                : null,
            totalAmountInr,
            paidTotalInr,
            outstandingDueInr,
            depositPaidInr,
            vendorConfirmationPaidInr,
            remainingPaymentPaidInr,
            lineItems,
            paidBreakdownRows: [
                { label: 'Deposit Fee', amountInr: depositPaidInr },
                { label: 'Vendor Confirmation', amountInr: vendorConfirmationPaidInr },
                { label: 'Remaining Payment', amountInr: remainingPaymentPaidInr },
                { label: 'Total Paid', amountInr: paidTotalInr },
            ],
        };
    }, [
        eventType,
        event?.listingType,
        event?.status,
        event?.ticketSalesStats,
        event?.platformFee,
        rawEvent?.selectedServices,
        rawEvent?.totalAmount,
        rawEvent?.depositPaidAmountPaise,
        rawEvent?.vendorConfirmationPaidAmountPaise,
        rawEvent?.remainingPaymentPaidAmountPaise,
        rawEvent?.generatedRevenuePayout?.status,
        rawEvent?.generatedRevenuePayout?.amountPaise,
        eventTransactions?.orders,
        vendorSelection?.selectedServices,
        vendorSelection?.vendors,
        vendorSelection?.vendorProfiles,
        vendorSelection?.totalMaxAmount,
    ]);

    const handlePayGeneratedRevenue = async () => {
        if (!canUseRestrictedManagerActions) {
            toast.error('This action is not available for your assigned role.');
            return;
        }

        if (!event || !generatedRevenuePayout.isSupported) {
            toast('Generated revenue payout is available only for planning public and promote events.', { icon: 'ℹ️' });
            return;
        }

        if (generatedRevenuePayout.requiresCompletionFirst && !generatedRevenuePayout.completionMarked) {
            toast.error('Mark the event as complete before releasing generated revenue payout.');
            return;
        }

        if (generatedRevenuePayout.requiresRemainingPaymentFirst && !generatedRevenuePayout.remainingPaymentSettled) {
            toast.error(
                `Remaining event payment is pending${generatedRevenuePayout.remainingPaymentDueInr > 0
                    ? ` (${formatMoneyShort(generatedRevenuePayout.remainingPaymentDueInr)} due)`
                    : ''}. Ask user to pay the remaining amount first.`
            );
            return;
        }

        if (generatedRevenuePayout.alreadyPaid) {
            toast.success('Generated revenue payout has already been sent to the user.');
            return;
        }

        if (generatedRevenuePayout.payoutAmountInr <= 0) {
            toast.error('Generated revenue payout amount is zero for this event.');
            return;
        }

        const endpoint = eventType === 'planning'
            ? `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(id))}/generated-revenue-payout`
            : `${API_BASE_URL}/api/events/promote/${encodeURIComponent(String(id))}/generated-revenue-payout`;

        try {
            setPayingGeneratedRevenue(true);
            const res = await fetchWithAuth(
                endpoint,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ mode: vendorPayoutMode }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to send generated revenue payout');
            }

            setRawEvent(json.data);
            const responseMode = String(json?.data?.generatedRevenuePayout?.mode || vendorPayoutMode).trim().toUpperCase();
            toast.success(responseMode === 'RAZORPAY'
                ? 'Generated revenue payout sent to user (RAZORPAY mode).'
                : 'Generated revenue payout sent to user (DEMO).');
        } catch (error) {
            toast.error(error?.message || 'Failed to send generated revenue payout');
        } finally {
            setPayingGeneratedRevenue(false);
        }
    };

    const handleMarkAsComplete = async () => {
        if (!event) return;

        if (!canUseRestrictedManagerActions) {
            toast.error('This action is not available for your assigned role.');
            return;
        }

        if (!canManagerCompletePlanning) {
            toast('Mark as complete is available only for planning events.', { icon: 'ℹ️' });
            return;
        }

        if (normalizedStatus === 'COMPLETED') {
            toast.success('This event is already marked as completed.');
            return;
        }

        if (!hasEventDateReached) {
            toast('Mark as complete is available on the event date.', { icon: '📅' });
            return;
        }

        if (!canMarkAsComplete) {
            toast.error('Only CONFIRMED events can be marked as complete.');
            return;
        }

        try {
            setMarkingComplete(true);
            const res = await fetchWithAuth(
                `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(id))}/mark-complete`,
                { method: 'PATCH' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to mark event as complete');
            }

            setRawEvent(json.data);
            toast.success('Event marked as completed.');
        } catch (error) {
            toast.error(error?.message || 'Failed to mark event as complete');
        } finally {
            setMarkingComplete(false);
        }
    };

    const handlePromotionAction = async (label) => {
        const actionKey = String(label || '').trim().toLowerCase();

        if (actionKey === 'advanced analytics') {
            toast('No manager action is needed for Advanced Analytics right now.', { icon: 'ℹ️' });
            return;
        }

        if (actionKey === 'social synergy') {
            toast('Social Synergy posting is not available yet.', { icon: 'ℹ️' });
            return;
        }

        if (actionKey === 'featured placement') {
            toast('Featured Placement flow is still in progress and will be added next.', { icon: 'ℹ️' });
            return;
        }

        if (actionKey !== 'email blast') {
            toast('Unsupported promotion action.', { icon: '⚠️' });
            return;
        }

        if (!id || !eventType) {
            toast.error('Event details are still loading. Please try again.');
            return;
        }

        const endpoint = eventType === 'planning'
            ? `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(id))}/promotion-actions/email-blast`
            : `${API_BASE_URL}/api/events/promote/${encodeURIComponent(String(id))}/promotion-actions/email-blast`;

        try {
            setPromotionActionLoadingKey(actionKey);

            const res = await fetchWithAuth(
                endpoint,
                {
                    method: 'POST',
                    body: JSON.stringify({}),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to trigger email blast');
            }

            toast.success('Email Blast triggered. Event details will be sent to all platform users.');
        } catch (error) {
            toast.error(error?.message || 'Failed to trigger email blast');
        } finally {
            setPromotionActionLoadingKey('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Modals */}
            {event ? (
                <EditEventModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    event={event}
                    onSave={handleSaveEdits}
                />
            ) : null}

            {/* 1. Immersive Hero Section */}
            <div className="relative h-[240px] lg:h-[320px] bg-gray-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Event Cover"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                </div>

                {/* Back Button */}
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-bold transition-all border border-white/10 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                </div>

                {/* Event Title Block */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 z-20">
                    <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Badge color="teal" icon={CheckCircle}>{event?.status || (loading ? 'LOADING' : '—')}</Badge>
                                <span className="text-gray-400 font-medium text-sm flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {event?.location || '—'}
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2 shadow-sm">
                                {loading ? 'Loading...' : (event?.title || (loadError ? 'Event not found' : '—'))}
                            </h1>
                            <p className="text-gray-300 font-medium max-w-2xl text-lg opacity-90">
                                {event?.description
                                    ? `${String(event.description).substring(0, 100)}...`
                                    : (loadError ? String(loadError) : '—')}
                            </p>
                        </div>

                        {/* Hero Actions */}
                        <div className="flex items-center gap-3">
                            <button onClick={handleCopyLink} className="h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-colors" title="Share/Copy Link">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button onClick={handlePrint} className="h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-colors" title="Print Event Summary">
                                <Printer className="w-5 h-5" />
                            </button>
                            <div className="flex flex-col gap-2">
                                {canUseRestrictedManagerActions ? (
                                    <button
                                        onClick={handleMarkAsComplete}
                                        disabled={!event || markingComplete || !canMarkAsComplete}
                                        title={!event
                                            ? 'Event details are loading.'
                                            : markingComplete
                                                ? 'Marking event as completed...'
                                                    : !canManagerCompletePlanning
                                                        ? 'Available only for planning events.'
                                                    : normalizedStatus === 'COMPLETED'
                                                        ? 'Event is already completed.'
                                                        : normalizedStatus !== 'CONFIRMED'
                                                            ? 'Only CONFIRMED events can be marked as complete.'
                                                            : !hasEventDateReached
                                                                ? 'Available on the event date.'
                                                                : 'Mark this event as complete.'}
                                        className="px-6 py-2.5 bg-teal-600 text-white hover:bg-teal-700 rounded-xl font-bold transition-colors shadow-lg shadow-black/10 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-4 h-4" /> {markingComplete ? 'Marking…' : 'Mark as Complete'}
                                    </button>
                                ) : null}
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    disabled={!event}
                                    className="px-6 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold transition-colors shadow-lg shadow-black/10 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Edit className="w-4 h-4" /> Edit Event
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Sticky Tab Navigation */}
            <div className={`sticky top-0 z-30 transition-all duration-300 border-b ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-gray-200 py-2' : 'bg-transparent border-transparent py-4'}`}>
                <div className="max-w-[1920px] mx-auto px-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="overflow-x-auto">
                            <nav className="flex items-center gap-1 p-1 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 w-max">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    const hasCount = tab.count !== undefined && tab.count !== null;
                                    const numericCount = Number(tab.count);
                                    const displayCount = Number.isFinite(numericCount)
                                        ? (numericCount > 999 ? `${(numericCount / 1000).toFixed(1)}k` : String(numericCount))
                                        : String(tab.count);
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                                                ${isActive ? 'text-teal-700 bg-teal-50 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                                            {tab.label}
                                            {hasCount && (
                                                <span className={`inline-flex min-w-5 h-5 items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] leading-none ${isActive ? 'bg-teal-200 text-teal-800' : 'bg-gray-200 text-gray-600'}`}>
                                                    {displayCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {canUseRestrictedManagerActions && event && generatedRevenuePayout.isSupported ? (
                            <button
                                onClick={handlePayGeneratedRevenue}
                                disabled={payingGeneratedRevenue
                                    || generatedRevenuePayout.alreadyPaid
                                    || generatedRevenuePayout.payoutAmountInr <= 0
                                    || (generatedRevenuePayout.requiresCompletionFirst && !generatedRevenuePayout.completionMarked)
                                    || (generatedRevenuePayout.requiresRemainingPaymentFirst && !generatedRevenuePayout.remainingPaymentSettled)}
                                title={generatedRevenuePayout.alreadyPaid
                                    ? 'Generated revenue payout already sent to user.'
                                    : (generatedRevenuePayout.requiresCompletionFirst && !generatedRevenuePayout.completionMarked)
                                        ? 'Mark this event as complete first.'
                                    : (generatedRevenuePayout.requiresRemainingPaymentFirst && !generatedRevenuePayout.remainingPaymentSettled)
                                        ? `Waiting for user remaining payment${generatedRevenuePayout.remainingPaymentDueInr > 0
                                            ? ` (${formatMoneyShort(generatedRevenuePayout.remainingPaymentDueInr)} due)`
                                            : ''}.`
                                    : generatedRevenuePayout.payoutAmountInr <= 0
                                        ? 'No payable generated revenue for this event.'
                                        : `Pay ${formatMoneyShort(generatedRevenuePayout.payoutAmountInr)} to user using ${vendorPayoutMode} mode.`}
                                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <DollarSign className="w-4 h-4" />
                                {payingGeneratedRevenue
                                    ? 'Paying...'
                                    : generatedRevenuePayout.alreadyPaid
                                        ? 'Revenue Paid'
                                        : `${vendorPayoutMode === 'DEMO' ? 'Demo Pay' : 'Pay'} Generated Revenue (${formatMoneyShort(generatedRevenuePayout.payoutAmountInr)})`}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* 3. Main Content Area */}
            <div className="max-w-[1920px] mx-auto px-6 pt-6">
                <AnimatePresence mode="wait">
                    <MotionDiv
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            event ? (
                                <OverviewTab
                                    event={event}
                                    onAddTeamMember={handleAddTeamMember}
                                    onRemoveTeamMember={handleRemoveTeamMember}
                                    getInitials={getInitials}
                                    onMessageClient={() => setActiveTab('chat')}
                                    onPromotionAction={handlePromotionAction}
                                    promotionActionLoadingKey={promotionActionLoadingKey}
                                    privateBilling={privateBilling}
                                    generatedRevenuePayout={generatedRevenuePayout}
                                    onQuickSendAnnouncement={handleQuickSendAnnouncement}
                                    onQuickDownloadAttendeeList={handleQuickDownloadAttendeeList}
                                    onQuickContactVenue={handleQuickContactVenue}
                                    onQuickSendQuoteToClient={handleQuickSendQuoteToClient}
                                    enablePlanningVendorQuickActions={canUseRestrictedManagerActions}
                                />
                            ) : (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="text-sm font-bold text-gray-600">
                                        {loading ? 'Loading event details...' : (loadError || 'Event not found')}
                                    </div>
                                </div>
                            )
                        )}
                        {activeTab === 'guests' && (
                            <GuestsTab
                                onGuestCountChange={setGuestCount}
                                canNotifyGuests={canNotifyGuests}
                                eventTitle={event?.title || rawEvent?.eventTitle || 'Event'}
                                triggerExportSignal={guestExportTrigger}
                                triggerNotifySignal={guestNotifyTrigger}
                            />
                        )}
                        {activeTab === 'vendors' && eventType !== 'promote' && <VendorsTab />}
                        {activeTab === 'chat' && (
                            <ChatTab
                                eventId={id}
                                client={client}
                                teamMembers={selectedTeamMembers}
                                assignedManager={assignedManager}
                                onUnreadCountChange={setUnreadChatCount}
                            />
                        )}
                        {activeTab === 'todo' && <ToDoTab eventId={id} onTaskCountChange={setTodoCount} />}
                        {activeTab === 'financials' && event && (
                            <FinancialsTab
                                event={event}
                                exportUiOnLoad={shouldAutoExportFinancialUi}
                            />
                        )}
                        {activeTab === 'documents' && eventType === 'promote' && <DocumentsTab eventType={eventType} eventData={rawEvent} />}
                    </MotionDiv>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManagerEventDetails;
