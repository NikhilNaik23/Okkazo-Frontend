import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { BsArrowLeft, BsFileEarmarkPdf, BsDownload, BsCheckCircleFill, BsPersonCheckFill, BsFillChatSquareTextFill, BsGraphUp, BsWallet2, BsThreeDotsVertical, BsSendFill, BsCalendarEvent, BsGeoAlt } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { io as createSocket } from 'socket.io-client';
import { refreshAccessToken, selectUser } from '../../../store/slices/authSlice';
import {
    ensureEventConversation,
    ensureEventDmConversation,
    fetchConversationMessages,
    sendConversationMessage,
    markConversationRead,
} from '../../../utils/chatApi';
import { CHAT_SOCKET_URL } from '../../../utils/chatConfig';

const API_BASE_URL = 'http://localhost:8080';

const toManagerBadge = (name) => {
    const text = String(name || '').trim();
    if (!text) return 'M';

    const managerWithNumber = text.match(/\bmanager\b\s*(\d+)/i);
    if (managerWithNumber) return `M${managerWithNumber[1]}`;

    const firstAlpha = text.match(/[A-Za-z]/);
    const firstLetter = firstAlpha ? firstAlpha[0].toUpperCase() : 'M';
    const number = text.match(/(\d+)/);

    return number ? `${firstLetter}${number[1]}` : firstLetter;
};

const EventCommandCenter = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');

    const [campaign, setCampaign] = useState(null);
    const [activeTab, setActiveTab] = useState("command_center"); // command_center | manager_sync
    const [chatMessage, setChatMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [managerSyncUnreadCount, setManagerSyncUnreadCount] = useState(0);
    const socketRef = useRef(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [socketJoined, setSocketJoined] = useState(false);

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

    const currentUserAuthId = (() => {
        const fromUser = String(user?.authId || '').trim();
        if (fromUser) return fromUser;
        const payload = decodeJwtPayload(accessToken);
        return String(payload?.authId || payload?.sub || payload?.userId || payload?.id || '').trim();
    })();

    const [manager, setManager] = useState({
        name: "Event Manager",
        role: "Manager",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        status: "Offline",
        authId: null,
    });

    const toDateLabel = (value, fallback = '—') => {
        if (!value) return fallback;
        const dt = new Date(value);
        if (Number.isNaN(dt.getTime())) return fallback;
        return dt.toLocaleDateString();
    };

    const toDateTimeLabel = (schedule) => {
        const startAt = schedule?.startAt ? new Date(schedule.startAt) : null;
        if (!startAt || Number.isNaN(startAt.getTime())) return '—';
        return `${startAt.toLocaleDateString()} • ${startAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const toStatusLabel = (status) => {
        const normalized = String(status || '').trim();
        if (!normalized) return 'Pending';
        return normalized.replace(/_/g, ' ');
    };

    const buildRoadmap = (promote) => {
        const eventStatus = String(promote?.eventStatus || '').toUpperCase();
        const isManagerUnassigned = eventStatus === 'MANAGER_UNASSIGNED';
        const isInReview = eventStatus === 'IN_REVIEW';
        const isLive = eventStatus === 'LIVE';
        const isCompleted = eventStatus === 'COMPLETED' || eventStatus === 'COMPLETE';
        const isFinal = isLive || isCompleted;

        const trackingStatus = isManagerUnassigned
            ? 'Application Received'
            : isInReview
                ? 'Application in Review'
                : isLive
                    ? 'Live'
                    : isCompleted
                        ? 'Completed'
                        : 'In Progress';

        return {
            trackingStatus,
            steps: [
                {
                    step: 1,
                    label: 'Application Received',
                    status: isManagerUnassigned ? 'in_progress' : 'completed',
                    date: toDateLabel(promote?.createdAt),
                },
                {
                    step: 2,
                    label: 'Manager Assigned',
                    status: isInReview || isFinal ? 'completed' : 'pending',
                    date: toDateLabel(promote?.managerAssignment?.assignedAt),
                },
                {
                    step: 3,
                    label: 'Application In Review',
                    status: isInReview ? 'in_progress' : isFinal ? 'completed' : 'pending',
                    date: isInReview ? 'Today' : toDateLabel(promote?.adminDecision?.decidedAt),
                },
                {
                    step: 4,
                    label: isCompleted ? 'Completed' : 'Success / Live',
                    status: isFinal ? 'completed' : 'pending',
                    date: isFinal ? toDateLabel(promote?.updatedAt) : '—',
                },
            ],
        };
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('Please log in to view promote event details');
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            };

            const resolveByRouteId = (arr) => {
                return (arr || []).find((item) => {
                    const routeId = String(id || '').trim();
                    if (!routeId) return false;
                    return (
                        String(item?.eventId || '') === routeId ||
                        String(item?.promoteId || '') === routeId ||
                        String(item?._id || '') === routeId
                    );
                });
            };

            let pr = null;
            try {
                const listRes = await fetch(`${API_BASE_URL}/api/events/promote/me`, {
                    method: 'GET',
                    headers,
                });
                const listJson = await listRes.json().catch(() => ({}));
                const promoteList = Array.isArray(listJson?.promotes)
                    ? listJson.promotes
                    : Array.isArray(listJson?.data?.promotes)
                        ? listJson.data.promotes
                        : [];
                pr = resolveByRouteId(promoteList) || null;
            } catch {
                // Keep fallback below.
            }

            if (!pr) {
                const singleRes = await fetch(`${API_BASE_URL}/api/events/promote/${encodeURIComponent(String(id))}`, {
                    method: 'GET',
                    headers,
                });
                const singleJson = await singleRes.json().catch(() => ({}));
                if (!singleRes.ok || !singleJson?.success) {
                    toast.error(singleJson?.message || 'Failed to load promote event');
                    return;
                }
                pr = singleJson?.data || null;
            }

            if (!pr) {
                toast.error('Promote event not found');
                return;
            }

            const ticketType = String(pr?.tickets?.ticketType || '').toLowerCase();
            const isFreeEvent = ticketType === 'free';
            const totalTickets = typeof pr?.tickets?.noOfTickets === 'number' ? pr.tickets.noOfTickets : 0;
            const roadmapState = buildRoadmap(pr);

            const mapped = {
                id: pr?.eventId || String(id),
                title: pr?.eventTitle || 'Promote Event',
                status: toStatusLabel(pr?.eventStatus || pr?.adminDecision?.status),
                location: pr?.venue?.locationName || 'Location TBD',
                date: toDateTimeLabel(pr?.schedule),
                description: pr?.eventDescription || '',
                revenue: isFreeEvent ? '-' : (typeof pr?.totalAmount === 'number' ? pr.totalAmount : '-'),
                cost: typeof pr?.platformFee === 'number' ? pr.platformFee : 0,
                revenueGenerated: typeof pr?.totalAmount === 'number' ? pr.totalAmount : 0,
                ticketsSold: typeof pr?.ticketAnalytics?.ticketsSold === 'number' ? pr.ticketAnalytics.ticketsSold : 0,
                totalTickets: totalTickets,
                hasAssignedManager: Boolean(pr?.assignedManagerId),
                assignedManagerId: pr?.assignedManagerId || null,
                managerProfile: pr?.managerProfile || null,
                trackingStatus: roadmapState.trackingStatus,
                roadmap: roadmapState.steps,
                documents: Array.isArray(pr?.authenticityProofs)
                    ? pr.authenticityProofs
                        .filter((p) => p?.url)
                        .map((p, index) => ({
                            name: p.publicId || `auth-proof-${index + 1}`,
                            type: p.mimeType || 'image/*',
                            size: p.sizeBytes ? `${Math.round(p.sizeBytes / (1024 * 1024) * 10) / 10} MB` : '—',
                            url: p.url,
                        }))
                    : [],
                bannerUrl: pr?.eventBanner?.url || null,
            };

            if (!cancelled) setCampaign(mapped);
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        if (!campaign?.hasAssignedManager) {
            setManager((prev) => ({
                ...prev,
                name: 'Event Manager',
                role: 'Manager',
                status: 'Offline',
                authId: null,
            }));
            return;
        }

        const profile = campaign?.managerProfile && typeof campaign.managerProfile === 'object'
            ? campaign.managerProfile
            : null;

        const role = profile?.assignedRole || profile?.department || profile?.role || 'Manager';

        setManager((prev) => ({
            ...prev,
            name: profile?.name || profile?.fullName || 'Event Manager',
            role,
            avatar: profile?.avatar || prev.avatar,
            status: 'Offline',
            authId: profile?.authId || null,
        }));
    }, [campaign?.hasAssignedManager, campaign?.managerProfile]);

    useEffect(() => {
        if (activeTab !== 'manager_sync') return;
        if (!campaign?.hasAssignedManager) return;
        if (!campaign?.id) return;

        let cancelled = false;
        const loadConversation = async () => {
            try {
                setMessages([]);

                const convo = manager?.authId
                    ? await ensureEventDmConversation({
                        eventId: campaign.id,
                        otherAuthId: manager.authId,
                        dispatch,
                        refreshAction: refreshAccessToken,
                    })
                    : await ensureEventConversation({
                        eventId: campaign.id,
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

                setMessages(Array.isArray(msgs) ? msgs : []);
                markConversationRead({ conversationId: convoId, dispatch, refreshAction: refreshAccessToken }).catch(() => {});
            } catch (e) {
                toast.error(e?.message || 'Failed to load chat');
            }
        };

        loadConversation();
        return () => {
            cancelled = true;
        };
    }, [activeTab, campaign?.hasAssignedManager, campaign?.id, manager?.authId, dispatch]);

    useEffect(() => {
        if (activeTab !== 'manager_sync') return;
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
            if (manager?.authId) {
                socket.emit('presence:watch', { authIds: [manager.authId] });
            }
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

        socket.on('connect_error', () => {
            setSocketConnected(false);
            setSocketJoined(false);
        });

        socket.on('message:new', (msg) => {
            const msgId = String(msg?._id || msg?.id || '');
            setMessages((prev) => {
                if (msgId && prev.some((m) => String(m?._id || m?.id || '') === msgId)) return prev;
                return [...prev, msg];
            });

            if (String(msg?.senderAuthId || '') !== currentUserAuthId) {
                socket.emit('messages:read', { conversationId });
                markConversationRead({ conversationId, dispatch, refreshAction: refreshAccessToken }).catch(() => {});
            }
        });

        socket.on('presence:update', ({ authId, online } = {}) => {
            const managerAuthId = String(manager?.authId || '').trim();
            if (!managerAuthId) return;
            if (String(authId || '').trim() !== managerAuthId) return;

            setManager((prev) => ({
                ...prev,
                status: online ? 'Online' : 'Offline',
            }));
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setSocketConnected(false);
            setSocketJoined(false);
        };
    }, [activeTab, conversationId, accessToken, manager?.authId, currentUserAuthId, dispatch]);

    useEffect(() => {
        const eventId = String(campaign?.id || '').trim();
        const viewerAuthId = String(currentUserAuthId || '').trim();

        if (!campaign?.hasAssignedManager || !eventId || !viewerAuthId) {
            setManagerSyncUnreadCount(0);
            return;
        }

        if (activeTab === 'manager_sync') {
            setManagerSyncUnreadCount(0);
            return;
        }

        let cancelled = false;

        const loadUnread = async () => {
            try {
                const convo = manager?.authId
                    ? await ensureEventDmConversation({
                        eventId,
                        otherAuthId: manager.authId,
                        dispatch,
                        refreshAction: refreshAccessToken,
                    })
                    : await ensureEventConversation({
                        eventId,
                        dispatch,
                        refreshAction: refreshAccessToken,
                    });

                const convoId = String(convo?._id || convo?.id || '').trim();
                if (!convoId) {
                    if (!cancelled) setManagerSyncUnreadCount(0);
                    return;
                }

                const msgs = await fetchConversationMessages({
                    conversationId: convoId,
                    limit: 200,
                    dispatch,
                    refreshAction: refreshAccessToken,
                });

                if (cancelled) return;

                const managerAuthId = String(manager?.authId || '').trim();
                const unread = (Array.isArray(msgs) ? msgs : []).filter((m) => {
                    const sender = String(m?.senderAuthId || m?.senderId || '').trim();
                    if (!sender || sender === viewerAuthId) return false;
                    if (managerAuthId && sender !== managerAuthId) return false;
                    const readBy = Array.isArray(m?.readBy) ? m.readBy.map((v) => String(v || '').trim()) : [];
                    return !readBy.includes(viewerAuthId);
                }).length;

                setManagerSyncUnreadCount(unread);
            } catch {
                if (!cancelled) setManagerSyncUnreadCount(0);
            }
        };

        loadUnread();
        const timer = setInterval(loadUnread, 20000);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [activeTab, campaign?.id, campaign?.hasAssignedManager, manager?.authId, currentUserAuthId, dispatch]);
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
                if (!stopped) setMessages(Array.isArray(msgs) ? msgs : []);
            } catch {
                // ignore
            }
        };

        poll();
        const intervalId = setInterval(poll, 2500);
        return () => {
            stopped = true;
            clearInterval(intervalId);
        };
    }, [conversationId, socketConnected, socketJoined, dispatch]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim() || !conversationId) return;

        const text = chatMessage.trim();
        sendConversationMessage({
            conversationId,
            text,
            dispatch,
            refreshAction: refreshAccessToken,
        })
            .then((data) => {
                setChatMessage('');
                if (!socketRef.current?.connected) {
                    setMessages((prev) => [...prev, data]);
                }
            })
            .catch((err) => {
                toast.error(err?.message || 'Failed to send message');
            });
    };

    if (!campaign) {
        return (
            <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center">
                <p className="font-serif-premium text-2xl text-[#09637E] italic animate-pulse">Initializing Command Center...</p>
            </div>
        );
    }

    const isFreeEvent = campaign.revenue === '-';
    const profitLoss = !isFreeEvent ? (campaign.revenueGenerated - campaign.cost) : 0;
    const soldPercent = campaign.totalTickets > 0
        ? Math.round((campaign.ticketsSold / campaign.totalTickets) * 100)
        : 0;
    const hasAssignedManager = Boolean(campaign.hasAssignedManager);
    const managerIsOnline = String(manager?.status || '').toLowerCase() === 'online';

    return (
        <div className="min-h-screen bg-[#EBF4F6] text-[#09637E] font-sans px-8 pb-8 pt-24 md:px-16 md:pb-16 md:pt-28">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <Link to="/user/dashboard" className="flex items-center gap-2 text-[#09637E]/60 hover:text-[#09637E] font-bold uppercase tracking-widest text-xs transition-colors">
                        <BsArrowLeft /> Back to My Events
                    </Link>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("command_center")}
                            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "command_center" ? "bg-[#09637E] text-white shadow-lg" : "bg-white text-[#09637E] hover:bg-[#09637E]/5"}`}
                        >
                            Command Center
                        </button>
                        <button
                            onClick={() => setActiveTab("manager_sync")}
                            disabled={!hasAssignedManager}
                            title={hasAssignedManager ? 'Open manager sync' : 'Manager not assigned yet'}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "manager_sync" ? "bg-[#09637E] text-white shadow-lg" : "bg-white text-[#09637E] hover:bg-[#09637E]/5"} ${!hasAssignedManager ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''}`}
                        >
                            Manager Sync
                            {managerSyncUnreadCount > 0 ? (
                                <span className={`inline-flex min-w-5 h-5 items-center justify-center px-1.5 rounded-full text-[10px] leading-none ${activeTab === 'manager_sync' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {managerSyncUnreadCount > 99 ? '99+' : managerSyncUnreadCount}
                                </span>
                            ) : null}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6 mb-12">
                    <h1 className="text-5xl md:text-7xl font-serif-premium text-[#09637E] italic">
                        {campaign.title}
                    </h1>
                    <span className="px-4 py-2 bg-[#EBF4F6] border border-[#09637E]/20 text-[#09637E] rounded-full text-[10px] font-black uppercase tracking-widest">
                        {campaign.status}
                    </span>
                </div>

                {activeTab === "command_center" && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Roadmap */}
                        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-[#09637E]/5 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-12">
                                <h3 className="text-2xl font-serif-premium italic text-[#09637E]">Event Planning Roadmap</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/60">Tracking Status: {campaign.trackingStatus || 'In Progress'}</span>
                            </div>

                            <div className="relative">
                                {/* Line */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#09637E]/10 -translate-y-1/2 z-0" />

                                <div className="grid grid-cols-4 relative z-10">
                                    {campaign.roadmap.map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center text-center group">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${step.status === 'completed' ? 'bg-[#09637E] text-white scale-110 shadow-lg' :
                                                step.status === 'in_progress' ? 'bg-white border-4 border-[#09637E] text-[#09637E] scale-125 shadow-xl' :
                                                    'bg-[#EBF4F6] text-[#09637E]/30'
                                                }`}>
                                                {step.status === 'completed' ? <BsCheckCircleFill size={20} /> :
                                                    step.status === 'in_progress' ? <div className="w-3 h-3 bg-[#09637E] rounded-full animate-pulse" /> :
                                                        <div className="w-3 h-3 bg-[#09637E]/20 rounded-full" />}
                                            </div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${step.status === 'pending' ? 'opacity-40' : 'text-[#09637E]'}`}>
                                                {idx + 1}. {step.label}
                                            </p>
                                            <p className="text-[9px] font-bold opacity-50">{step.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Asset Preview */}
                            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#09637E]/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] via-transparent to-transparent opacity-60 z-10" />
                                <img
                                    src={campaign.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80"}
                                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    alt="Event Banner"
                                />
                                <div className="relative z-20 h-full flex flex-col justify-end text-white p-4">
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest mb-4 w-fit">Minimal Banner</span>
                                    <h2 className="text-4xl font-serif-premium italic mb-2">{campaign.title}</h2>
                                    <div className="flex items-center gap-4 text-xs font-medium opacity-90">
                                        <span className="flex items-center gap-2"><BsCalendarEvent /> {campaign.date}</span>
                                        <span className="flex items-center gap-2"><BsGeoAlt /> {campaign.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics / Highlights */}
                            <div className="space-y-6">
                                {/* Manager Card Small */}
                                <div className="bg-[#09637E] text-white rounded-[2.5rem] p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#fff]/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <BsFillChatSquareTextFill size={24} className="mb-6 opacity-80" />
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Consultation</p>
                                    <h3 className="text-2xl font-serif-premium italic mb-4">{hasAssignedManager ? 'Manager Connected' : 'Manager Pending'}</h3>
                                    <p className="text-xs opacity-80 mb-6 leading-relaxed">
                                        {hasAssignedManager
                                            ? `${manager.name} is assigned to your event. Sync up for strategy and execution details.`
                                            : 'Your event is waiting for manager assignment. Chat will unlock once a manager is assigned.'}
                                    </p>
                                    <button
                                        onClick={() => hasAssignedManager && setActiveTab("manager_sync")}
                                        disabled={!hasAssignedManager}
                                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${hasAssignedManager ? 'bg-white text-[#09637E] hover:bg-[#EBF4F6]' : 'bg-white/70 text-[#09637E]/50 cursor-not-allowed'}`}
                                    >
                                        Chat with Manager
                                    </button>
                                </div>

                                {/* Quick Stats */}
                                {!isFreeEvent && (
                                    <div className="space-y-4">
                                        {/* Sales Card */}
                                        <div className="bg-white p-6 rounded-[2rem] border border-[#09637E]/5 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                                                        <BsGraphUp /> Ticket Sales
                                                    </p>
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-3xl font-serif-premium text-[#09637E]">{campaign.ticketsSold}</p>
                                                        <span className="text-xs font-bold text-[#09637E]/40">/ {campaign.totalTickets}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-widest mb-1">
                                                        {soldPercent}% Conversion
                                                    </span>
                                                    <p className="text-[10px] font-bold text-[#09637E]/60">{campaign.totalTickets - campaign.ticketsSold} to go</p>
                                                </div>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="w-full h-2 bg-[#EBF4F6] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#09637E] to-[#7AB2B2] rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${soldPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Financials Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-6 rounded-[2rem] border border-[#09637E]/5 shadow-sm">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                                                    <BsWallet2 /> Revenue
                                                </p>
                                                <p className="text-lg font-bold text-[#09637E]">₹{(campaign.revenueGenerated).toLocaleString()}</p>
                                                <p className="text-[8px] font-bold text-[#09637E]/40 mt-1">Gross Income</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-[2rem] border border-[#09637E]/5 shadow-sm">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Net P&L</p>
                                                <p className={`text-lg font-bold ${profitLoss >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {profitLoss >= 0 ? '+' : '-'}₹{Math.abs(profitLoss).toLocaleString()}
                                                </p>
                                                <p className="text-[8px] font-bold text-[#09637E]/40 mt-1">After {Math.abs(campaign.cost).toLocaleString()} fees</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Reports */}
                        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-[#09637E]/5">
                            <h3 className="text-2xl font-serif-premium italic text-[#09637E] mb-8">Campaign Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-2">Description</p>
                                    <p className="text-lg text-[#09637E]/80 leading-relaxed font-light">{campaign.description}</p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-2">Attached Documents</p>
                                        <div className="space-y-3">
                                            {campaign.documents.length > 0 ? (
                                                campaign.documents.map((doc, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center justify-between p-4 bg-[#EBF4F6] rounded-xl hover:bg-[#ddeef2] transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <BsFileEarmarkPdf className="text-[#09637E] shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-[#09637E] truncate">{doc.name}</p>
                                                                <p className="text-[10px] text-[#09637E]/50">{doc.type} • {doc.size}</p>
                                                            </div>
                                                        </div>
                                                        <BsDownload className="text-[#09637E]/70 shrink-0" size={14} />
                                                    </a>
                                                ))
                                            ) : (
                                                <div className="p-4 bg-[#EBF4F6] rounded-xl text-xs text-[#09637E]/60">
                                                    No authenticity proofs uploaded yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "manager_sync" && hasAssignedManager && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        {/* Manager Profile */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#09637E]/5 h-fit text-center">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#09637E] to-[#7AB2B2] mx-auto mb-6">
                                <div className="w-full h-full rounded-full border-4 border-white bg-white flex items-center justify-center">
                                    <span className="text-4xl font-black text-[#09637E] tracking-wider">{toManagerBadge(manager.name)}</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-serif-premium italic text-[#09637E] mb-1">{manager.name}</h3>
                            <p className="text-xs font-black uppercase tracking-widest text-[#09637E]/40 mb-6">{manager.role}</p>

                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 ${managerIsOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                                <span className={`w-2 h-2 rounded-full ${managerIsOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                {manager.status}
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-[#09637E]/5 overflow-hidden flex flex-col h-[600px]">
                            <div className="p-6 border-b border-[#09637E]/5 flex justify-between items-center bg-[#EBF4F6]/30">
                                <div>
                                    <h4 className="font-bold text-[#09637E]">Strategy Sync</h4>
                                    <p className="text-[10px] uppercase tracking-wider opacity-50">Last active: Just now</p>
                                </div>
                                <BsThreeDotsVertical className="text-[#09637E]/40" />
                            </div>

                            <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#FAFAFA]">
                                {messages.map((msg, idx) => {
                                    const msgId = String(msg?._id || msg?.id || idx);
                                    const isMe = String(msg?.senderAuthId || msg?.senderId || '') === currentUserAuthId;
                                    const dt = msg?.createdAt ? new Date(msg.createdAt) : null;
                                    const time = dt && !Number.isNaN(dt.getTime())
                                        ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '';

                                    return (
                                    <div key={msgId} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                            ? 'bg-[#09637E] text-white rounded-tr-none'
                                            : 'bg-white text-[#09637E] border border-[#09637E]/5 rounded-tl-none'
                                            }`}>
                                            <p>{msg?.text || ''}</p>
                                            <p className={`text-[9px] mt-2 text-right ${isMe ? 'text-white/60' : 'text-[#09637E]/40'}`}>{time}</p>
                                        </div>
                                    </div>
                                )})}
                            </div>

                            <div className="p-6 bg-white border-t border-[#09637E]/5">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-[#EBF4F6] border-none rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-[#09637E]/10 placeholder:text-[#09637E]/30 text-[#09637E]"
                                    />
                                    <button type="submit" className="w-14 h-14 bg-[#09637E] rounded-xl flex items-center justify-center text-white hover:bg-[#088395] transition-colors shadow-lg">
                                        <BsSendFill size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCommandCenter;
