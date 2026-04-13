import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminEventDashboard, fetchManagerAutoAssignConfig, setManagerAutoAssignEnabled } from "../../../store/slices/adminSlice";

import InternalEventCard from "../../../components/Global/cards/InternalEventCard";
import {
    ChevronDown,
    Filter,
    Search,
    CheckSquare,
    Square,
    FileText,
    X,
    ArrowRight,
    Clock,
    CheckCircle,
    FileSearch
} from "lucide-react";

const formatEventDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatSubmittedAt = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const getNextAutoAssignTime = (after) => {
    const base = new Date(after);
    if (Number.isNaN(base.getTime())) return null;

    const y = base.getFullYear();
    const m = base.getMonth();
    const d = base.getDate();

    const slotMorning = new Date(y, m, d, 9, 0, 0, 0);
    const slotEvening = new Date(y, m, d, 21, 0, 0, 0);

    if (base < slotMorning) return slotMorning;
    if (base < slotEvening) return slotEvening;
    return new Date(y, m, d + 1, 9, 0, 0, 0);
};

const deriveUiStatus = (request) => {
    const requestType = request?.requestType;

    if (requestType === 'PLANNING') {
        if (String(request?.status || '').toUpperCase() === 'REJECTED') return 'REJECTED';
        if (request?.assignedManagerId) return 'VERIFIED';
        if (request?.isUrgent) return 'URGENT';
        return 'PENDING';
    }

    const decision = request?.adminDecision?.status;
    if (decision === 'REJECTED') return 'REJECTED';
    const promoteStatus = normalizeStatusToken(request?.eventStatus);
    if (['CONFIRMED', 'LIVE', 'COMPLETE', 'COMPLETED', 'CLOSED'].includes(promoteStatus)) return 'VERIFIED';
    if (request?.assignedManagerId) return 'VERIFIED';
    if (decision === 'APPROVED') {
        const decidedAt = request?.adminDecision?.decidedAt;
        if (decidedAt) {
            const nextSlot = getNextAutoAssignTime(decidedAt);
            if (nextSlot) {
                const graceMs = 15 * 60 * 1000;
                if (Date.now() >= nextSlot.getTime() + graceMs) return 'URGENT';
            }
        }
        return 'REVIEWING';
    }
    return 'PENDING';
};

const normalizeStatusToken = (value) =>
    String(value || '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_');

const isPaymentRequiredRequest = (request) => {
    const statusTokens = [
        normalizeStatusToken(request?.status),
        normalizeStatusToken(request?.eventStatus),
    ];
    return statusTokens.includes('PAYMENT_REQUIRED');
};

const isTerminalRequestForApplications = (request) => {
    const requestType = String(request?.requestType || 'PROMOTE').trim().toUpperCase();

    if (requestType === 'PLANNING') {
        const planningStatus = normalizeStatusToken(request?.status);
        return ['REJECTED', 'CANCELLED', 'CANCELED', 'COMPLETED', 'COMPLETE', 'CLOSED', 'VENDOR_PAYMENT_PENDING'].includes(planningStatus);
    }

    const promoteStatus = normalizeStatusToken(request?.eventStatus);
    return ['REJECTED', 'CANCELLED', 'CANCELED', 'COMPLETED', 'COMPLETE', 'CLOSED'].includes(promoteStatus);
};

const mapRequestToUiEvent = (request) => {
    const requestType = request?.requestType;

    if (requestType === 'PLANNING') {
        const dateIso = request?.category === 'public' ? request?.schedule?.startAt : request?.eventDate;
        const typeLabel = request?.eventType === 'Other' ? (request?.customEventType || 'Other') : request?.eventType;

        return {
            id: request?.eventId,
            title: request?.eventTitle || 'Untitled Event',
            organizer: request?.authId || 'Organizer',
            date: formatEventDate(dateIso),
            submitted: formatSubmittedAt(request?.createdAt),
            category: (typeLabel || 'PLANNING').toUpperCase(),
            status: deriveUiStatus(request),
            image: request?.eventBanner?.url,
            raw: request,
            requestType,
        };
    }

    const eventCategory = request?.eventCategory === 'Other' ? (request?.customCategory || 'Other') : request?.eventCategory;

    return {
        id: request?.eventId,
        title: request?.eventTitle || 'Untitled Event',
        organizer: request?.authId || 'Organizer',
        date: formatEventDate(request?.schedule?.startAt),
        submitted: formatSubmittedAt(request?.createdAt),
        category: eventCategory || 'EVENT',
        status: deriveUiStatus(request),
        image: request?.eventBanner?.url,
        raw: request,
        requestType: requestType || 'PROMOTE',
    };
};

/*const MOCK_EVENTS_OLD = [
  {
    id: 1,
    title: "Summer Soundwaves 2024",
    organizer: "Vibe Entertainment Co.",
    date: "Aug 12, 2024",
    submitted: "Oct 24, 09:45 AM",
    category: "MUSIC FESTIVAL",
    status: "URGENT",
    image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Future Tech Expo 2024",
    organizer: "Silicon Valley Events",
    date: "Nov 05, 2024",
    submitted: "Oct 25, 02:20 PM",
    category: "CONFERENCE",
    status: "REVIEWING",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Ethereal Art Nights",
    organizer: "Canvas & Clay Hub",
    date: "Dec 01, 2024",
    submitted: "Oct 26, 11:15 AM",
    category: "EXHIBITION",
    status: "PENDING",
    image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Gourmet Garden Series",
    organizer: "Culinary Masters",
    date: "Sept 18, 2024",
    submitted: "Oct 26, 04:40 PM",
    category: "WORKSHOP",
    status: "PENDING",
    image: "https://images.unsplash.com/photo-1628194380993-97ae0c868427?q=80&w=1000&auto=format&fit=crop"
  }
];*/

const AdminEvents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const ITEMS_PER_PAGE = 12;
    const [activeTab, setActiveTab] = useState("Events");
    const [searchQuery, setSearchQuery] = useState("");
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { eventDashboard, eventDashboardLoading, managerAutoAssignConfig, managerAutoAssignLoading, managerAutoAssignUpdating } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchAdminEventDashboard());
        dispatch(fetchManagerAutoAssignConfig());
    }, [dispatch]);

    const autoAssignEnabled = typeof managerAutoAssignConfig?.enabled === 'boolean' ? managerAutoAssignConfig.enabled : null;
    const toggleAutoAssign = () => {
        if (autoAssignEnabled === null) return;
        dispatch(setManagerAutoAssignEnabled({ enabled: !autoAssignEnabled }));
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setSearchQuery("");
        setActiveTab("Events");

        dispatch(fetchAdminEventDashboard())
            .finally(() => setIsRefreshing(false));
    };

    const assignedEvents = useMemo(() => (eventDashboard?.assigned || []).map(mapRequestToUiEvent), [eventDashboard]);
    const rejectedEvents = useMemo(() => (eventDashboard?.rejected || []).map(mapRequestToUiEvent), [eventDashboard]);
    const pendingApplications = useMemo(
        () => (eventDashboard?.applications || [])
            .filter((request) => !isPaymentRequiredRequest(request))
            .filter((request) => !isTerminalRequestForApplications(request))
            .filter((request) => deriveUiStatus(request) !== 'VERIFIED')
            .map(mapRequestToUiEvent),
        [eventDashboard]
    );
    const showEventsSkeleton = eventDashboardLoading && !eventDashboard;

    const filteredEvents = useMemo(() => {
        const list = activeTab === 'Rejected' ? rejectedEvents : assignedEvents;
        const query = searchQuery.toLowerCase();

        return list.filter((event) => {
            if (!query) return true;
            return (
                (event.title || '').toLowerCase().includes(query) ||
                (event.organizer || '').toLowerCase().includes(query) ||
                String(event.id || '').toLowerCase().includes(query)
            );
        });
    }, [activeTab, assignedEvents, rejectedEvents, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedEvents = filteredEvents.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="h-full flex flex-col">
            <div className="px-6 pb-8 flex-1">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0b2d49] tracking-tight mb-2">
                            {activeTab === "Events" ? "Event" : activeTab} Requests
                        </h2>
                        <p className="text-[#5a5b44]">Review and verify events before they go live on the platform.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowApplicationsModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0b2d49] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all whitespace-nowrap active:scale-95"
                        >
                            <FileText size={14} />
                            Applications
                            {pendingApplications.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-[#d7a444] text-white rounded-md text-[8px]">{pendingApplications.length}</span>
                            )}
                        </button>

                        <button
                            onClick={toggleAutoAssign}
                            disabled={managerAutoAssignLoading || managerAutoAssignUpdating || autoAssignEnabled === null}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all whitespace-nowrap active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                                ${autoAssignEnabled ? 'bg-[#d7a444] text-white shadow-[#d7a444]/10 hover:bg-[#0b2d49]' : 'bg-[#0b2d49] text-white shadow-[#0b2d49]/10 hover:bg-[#d7a444]'}`}
                        >
                            <Clock size={14} />
                            Auto Assign
                            {autoAssignEnabled !== null && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] ${autoAssignEnabled ? 'bg-white/20 text-white' : 'bg-[#d7a444] text-white'}`}>{autoAssignEnabled ? 'ON' : 'OFF'}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Tabs & Search Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-[#e9eff1] mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Tabs */}
                        <div className="flex p-1 bg-[#e9eff1] rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                            {["Events", "Rejected"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab
                                            ? "bg-white text-[#0b2d49] shadow-sm"
                                            : "text-[#5a5b44] hover:text-[#0b2d49] hover:bg-white/50"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-100">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0]" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search event, vendor or ID..."
                                className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] hover:bg-white border-transparent focus:bg-white border focus:border-[#d7a444] rounded-xl text-sm transition-all outline-none text-[#0b2d49]"
                            />
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {showEventsSkeleton ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <div key={`admin-event-skeleton-${index}`} className="h-[360px] rounded-3xl bg-white border border-[#e9eff1] animate-pulse" />
                            ))
                        ) : filteredEvents.length > 0 ? (
                            paginatedEvents.map((event) => (
                                <InternalEventCard
                                    key={event.id}
                                    title={event.title}
                                    category={event.category}
                                    image={event.image}
                                    organizer={event.organizer}
                                    eventDate={event.date}
                                    submittedDate={event.submitted}
                                    status={event.status}
                                    onVerify={() => navigate(`${event.id}`)}
                                    onDetails={() => navigate(`${event.id}`)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-[#708aa0] border-2 border-dashed border-[#e9eff1] rounded-3xl">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium">No requests found matching your criteria</p>
                                <button
                                    onClick={() => { setSearchQuery(""); setActiveTab("Events"); }}
                                    className="mt-4 text-[#d7a444] font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>

                    {!showEventsSkeleton && filteredEvents.length > 0 && (
                        <div className="mt-6 flex items-center justify-between bg-white border border-[#e9eff1] rounded-2xl px-4 py-3 shadow-sm">
                            <p className="text-xs font-bold text-[#708aa0] uppercase tracking-widest">
                                Showing {((safePage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(safePage * ITEMS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={safePage <= 1}
                                    className="px-4 py-2 rounded-xl border border-[#e9eff1] text-[10px] font-black uppercase tracking-widest text-[#0b2d49] bg-white hover:border-[#0b2d49] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Prev
                                </button>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#708aa0] px-2">
                                    Page {safePage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={safePage >= totalPages}
                                    className="px-4 py-2 rounded-xl border border-[#e9eff1] text-[10px] font-black uppercase tracking-widest text-[#0b2d49] bg-white hover:border-[#0b2d49] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            </div>

            {/* Applications Modal */}
            {showApplicationsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-[#0b2d49]/40 backdrop-blur-md transition-opacity"
                        onClick={() => setShowApplicationsModal(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-[#e9eff1] flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-black text-[#0b2d49] flex items-center gap-3">
                                    <FileSearch className="text-[#d7a444]" />
                                    Event Applications
                                </h3>
                                <p className="text-xs font-bold text-[#708aa0] uppercase tracking-widest mt-1">
                                    {pendingApplications.length} Request{pendingApplications.length !== 1 ? 's' : ''} awaiting review
                                </p>
                            </div>
                            <button
                                onClick={() => setShowApplicationsModal(false)}
                                className="p-2 hover:bg-[#f8fafc] rounded-xl text-[#708aa0] hover:text-[#0b2d49] transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar space-y-4">
                            {pendingApplications.map((v) => (
                                <div
                                    key={v.id}
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#f8fafc] hover:bg-white rounded-3xl border border-transparent hover:border-[#e9eff1] transition-all hover:shadow-lg gap-4"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden relative shadow-inner shrink-0">
                                            <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-[#0b2d49]/20"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#0b2d49] text-base group-hover:text-[#d7a444] transition-colors">{v.title}</h4>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                <span className="text-[9px] font-black text-[#708aa0] uppercase tracking-widest">{v.organizer}</span>
                                                <div className="w-1 h-1 bg-[#e9eff1] rounded-full"></div>
                                                <span className="text-[9px] font-black text-[#d7a444] uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={10} /> {v.submitted}
                                                </span>
                                                <div className="w-1 h-1 bg-[#e9eff1] rounded-full"></div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${v.status === 'URGENT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {v.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowApplicationsModal(false);
                                            navigate(`${v.id}`);
                                        }}
                                        className="px-6 py-3 bg-[#0b2d49] hover:bg-[#d7a444] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2 justify-center"
                                    >
                                        Verify <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}

                            {pendingApplications.length === 0 && (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <CheckCircle size={48} className="text-[#10b981] opacity-20 mb-4" />
                                    <h4 className="text-lg font-black text-[#0b2d49]">All Caught Up!</h4>
                                    <p className="text-sm text-[#708aa0] mt-1 font-medium">No pending event applications at the moment.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-[#f8fafc] border-t border-[#e9eff1] flex justify-end">
                            <button
                                onClick={() => setShowApplicationsModal(false)}
                                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#5a5b44] hover:text-[#0b2d49] transition-colors"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;