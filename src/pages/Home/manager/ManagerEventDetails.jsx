import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { EditEventModal, AddGuestModal } from '../../../components/Manager/EventDetails/modals';

// Tab Components
import {
    OverviewTab,
    GuestsTab,
    VendorsTab,
    ScheduleTab,
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

const API_BASE_URL = 'http://localhost:8080';

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
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
    const currentUserAuthId = resolveAuthId({ user, accessToken });

    const vendorSelection = useSelector((state) => selectPlanningVendorSelectionByEventId(state, id));
    const [activeTab, setActiveTab] = useState('overview');
    const [scrolled, setScrolled] = useState(false);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

    const [eventType, setEventType] = useState(null); // 'planning' | 'promote'
    const [rawEvent, setRawEvent] = useState(null);
    const [client, setClient] = useState(null);
    const [availableCoreStaff, setAvailableCoreStaff] = useState([]);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
    const [staffRefreshKey, setStaffRefreshKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    // Scroll listener for sticky header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 200);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!id) return;
        dispatch(fetchPlanningVendorSelectionByEventId(id));
    }, [dispatch, id]);

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
            return {
                id: rawEvent.eventId || id,
                type: 'planning',
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

    const chatContactAuthIds = useMemo(() => {
        const ids = new Set();

        const clientAuthId = String(client?.authId || '').trim();
        if (clientAuthId) ids.add(clientAuthId);

        const acceptedVendorAuthIds = (Array.isArray(vendorSelection?.vendors) ? vendorSelection.vendors : [])
            .filter((v) => String(v?.status || '').trim().toUpperCase() === 'ACCEPTED')
            .map((v) => String(v?.vendorAuthId || '').trim())
            .filter(Boolean);

        for (const authId of acceptedVendorAuthIds) ids.add(authId);
        return Array.from(ids);
    }, [client?.authId, vendorSelection?.vendors]);

    useEffect(() => {
        const eventId = String(id || '').trim();
        const managerAuthId = String(currentUserAuthId || '').trim();
        const contactAuthIds = Array.isArray(chatContactAuthIds) ? chatContactAuthIds : [];

        if (!eventId || !managerAuthId || contactAuthIds.length === 0) {
            setUnreadChatCount(0);
            return;
        }

        if (activeTab === 'chat') {
            // Chat tab marks messages as read when opened.
            setUnreadChatCount(0);
            return;
        }

        let cancelled = false;

        const loadUnreadCount = async () => {
            try {
                const counts = await Promise.all(contactAuthIds.map(async (otherAuthId) => {
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
        .filter((tab) => !(eventType === 'promote' && tab.id === 'vendors'))
        .map(tab => ({
            ...tab,
            icon: iconMap[tab.icon],
            count: tab.id === 'vendors'
                ? (vendorSlotCount ?? tab.count)
                : tab.id === 'chat'
                    ? unreadChatCount
                : tab.id === 'documents' && eventType === 'promote'
                    ? promoteProofCount
                    : tab.count,
        }));

    useEffect(() => {
        if (eventType === 'promote' && activeTab === 'vendors') {
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
            <AddGuestModal isOpen={isGuestModalOpen} onClose={() => setIsGuestModalOpen(false)} />

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

            {/* 2. Sticky Tab Navigation */}
            <div className={`sticky top-0 z-30 transition-all duration-300 border-b ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-gray-200 py-2' : 'bg-transparent border-transparent py-4'}`}>
                <div className="max-w-[1920px] mx-auto px-6 overflow-x-auto">
                    <nav className="flex items-center gap-1 p-1 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 w-fit">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const hasCount = tab.count !== undefined && tab.count !== null;
                            const numericCount = Number(tab.count);
                            const displayCount = Number.isFinite(numericCount)
                                ? (numericCount > 999 ? '2.4k' : String(numericCount))
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
            </div>

            {/* 3. Main Content Area */}
            <div className="max-w-[1920px] mx-auto px-6 pt-6">
                <AnimatePresence mode="wait">
                    <motion.div
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
                                />
                            ) : (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="text-sm font-bold text-gray-600">
                                        {loading ? 'Loading event details...' : (loadError || 'Event not found')}
                                    </div>
                                </div>
                            )
                        )}
                        {activeTab === 'guests' && <GuestsTab onAddClick={() => setIsGuestModalOpen(true)} />}
                        {activeTab === 'vendors' && eventType !== 'promote' && <VendorsTab />}
                        {activeTab === 'chat' && <ChatTab eventId={id} client={client} />}
                        {activeTab === 'todo' && <ToDoTab />}
                        {activeTab === 'schedule' && <ScheduleTab />}
                        {activeTab === 'financials' && event && <FinancialsTab event={event} />}
                        {activeTab === 'documents' && <DocumentsTab eventType={eventType} eventData={rawEvent} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManagerEventDetails;
