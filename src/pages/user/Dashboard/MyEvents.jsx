import React, { useState, useEffect, useRef } from "react";
import { BsCalendarEvent, BsGeoAlt, BsQrCode, BsCheckCircleFill, BsThreeDotsVertical, BsPlusLg, BsArrowRight, BsClock, BsTicketPerforated, BsChevronDown } from "react-icons/bs";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { myOrganizedEvents, myTickets as myTicketsData } from "../../../data/myEventsData";
import { promotedCampaigns } from "../../../data/myEventsDashboardData";
import { fetchMyPlannings, fetchPlanningByEventId } from "../../../store/slices/planningSlice";
import { fetchMyPromotes } from "../../../store/slices/promoteSlice";
import {
    OrganizedEventCard,
    CampaignCard,
    TicketCard,
    SavedEventCard,
    StrategyLeadCard,
    TabButton
} from "../../../components/User/Dashboard";

const MotionDiv = motion.div;

const normalizePromoteStatus = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/_+/g, '-');

const mapPromoteToCampaign = (promote, idx) => {
    const raw = String(promote?.eventStatus || '').trim();
    const normalized = normalizePromoteStatus(raw);

    const statusLabel = (() => {
        if (normalized === 'payment-required') return 'Payment Required';
        if (normalized === 'manager-unassigned') return 'Pending Review';
        if (normalized === 'in-review') return 'Pending Review';
        if (normalized === 'live') return 'Live';
        if (normalized === 'complete') return 'Complete';
        return raw ? raw.replace(/_/g, ' ') : 'Pending Review';
    })();

    const gradient = (() => {
        if (normalized === 'live') return 'bg-gradient-to-b from-[#7AB2B2]/80 via-[#7AB2B2]/20 to-white/90';
        if (normalized === 'payment-required') return 'bg-gradient-to-b from-[#EBF4F6]/80 via-[#d7a444]/20 to-white/90';
        if (normalized === 'complete') return 'bg-gradient-to-b from-[#2d5c58]/70 via-[#7AB2B2]/10 to-white/90';
        return 'bg-gradient-to-b from-[#EBF4F6]/80 via-[#7AB2B2]/20 to-white/90';
    })();

    const centerText = (() => {
        if (normalized === 'payment-required') return 'Locked';
        if (normalized === 'complete') return 'Check';
        if (normalized === 'live') return 'LIVE';
        // Keep short text so it fits the circular badge
        return 'Review';
    })();

    const totalAmount = (typeof promote?.totalAmount === 'number' && Number.isFinite(promote.totalAmount))
        ? promote.totalAmount
        : null;

    const platformFee = (typeof promote?.platformFee === 'number' && Number.isFinite(promote.platformFee))
        ? promote.platformFee
        : null;

    const isPayRequired = normalized === 'payment-required';

    const shownAmount = isPayRequired ? platformFee : totalAmount;
    const revenueLabel = isPayRequired ? 'Platform Fee Due' : 'Total Amount';
    const revenue = shownAmount != null
        ? `₹${shownAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : '—';

    return {
        id: promote?.eventId,
        title: promote?.eventTitle || 'Untitled Campaign',
        subtitle: String(promote?.eventCategory || 'PROMOTION').toUpperCase(),
        status: statusLabel,
        eventStatus: normalized,
        totalAmount,
        platformFee,
        revenueLabel,
        revenue,
        centerText,
        gradient,
        buttonText: normalized === 'payment-required' ? 'Pay Now' : 'Manage',
        _idx: idx,
    };
};

const formatPlanningDate = (planning) => {
    const dateValue = planning?.category === 'public' ? planning?.schedule?.startAt : planning?.eventDate;
    if (!dateValue) return 'TBD • TBD';

    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return 'TBD • TBD';

    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(d.getDate()).padStart(2, '0');

    let timeStr = 'TBD';
    if (planning?.category !== 'public' && planning?.eventTime) {
        const match = String(planning.eventTime).trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
        if (match) {
            const hh = Number(match[1]);
            const mm = match[2];
            const ampm = hh >= 12 ? 'PM' : 'AM';
            const hour12 = ((hh + 11) % 12) + 1;
            timeStr = `${hour12}:${mm} ${ampm}`;
        }
    } else {
        const t = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        timeStr = t.toUpperCase();
    }

    return `${month} ${day} • ${timeStr}`;
};

const mapPlanningToCardEvent = (planning, idx) => {
    const isPublic = planning?.category === 'public';
    const rawStatus = String(planning?.status || '').trim().toUpperCase();

    const status = (() => {
        if (rawStatus === 'PAYMENT PENDING' || rawStatus === 'PAYMENT_PENDING') return 'Payment Pending';
        if (rawStatus === 'IMMEDIATE ACTION') return 'Immediate Action';
        if (rawStatus === 'PENDING APPROVAL') return 'Pending Approval';
        if (rawStatus === 'CONFIRMED') return 'Confirmed';
        if (rawStatus === 'REJECTED') return 'Rejected';
        if (rawStatus === 'COMPLETED') return 'Live';
        if (rawStatus === 'APPROVED') return 'Approved';
        return rawStatus ? rawStatus[0] + rawStatus.slice(1).toLowerCase() : 'Pending Approval';
    })();

    const fallbackImage = myOrganizedEvents?.[idx % (myOrganizedEvents?.length || 1)]?.image;
    const image = planning?.eventBanner?.url || fallbackImage;

    const sold = (() => {
        if (!isPublic) return '';
        if (status === 'Live') return 'Live now';
        if (status === 'Pending Approval') return 'In review';
        if (status === 'Immediate Action') return 'Action required';
        if (status === 'Rejected') return 'Needs changes';
        return 'In progress';
    })();

    return {
        id: planning?.eventId,
        title: planning?.eventTitle || 'Untitled Event',
        date: formatPlanningDate(planning),
        location: planning?.location?.name || 'TBA',
        image,
        status,
        sold,
        formData: { listingType: isPublic ? 'Public' : 'Private' }
    };
};

const MyEvents = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("organized");
    const [isLoading, setIsLoading] = useState(true);
    const [organizedEvents, setOrganizedEvents] = useState([]);
    const [draftEvents, setDraftEvents] = useState([]);
    const [myTickets, setMyTickets] = useState([]);
    const [savedEvents, setSavedEvents] = useState([]);
    const [campaigns, setCampaigns] = useState([]); // Campaigns state
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    const handleManageClick = async (eventId, fallbackStatus) => {
        try {
            const result = await dispatch(fetchPlanningByEventId(eventId));

            if (result.meta?.requestStatus === 'fulfilled') {
                const raw = String(result.payload?.status || '').trim().toUpperCase();

                if (raw === 'IMMEDIATE ACTION') {
                    navigate(`/user/planning-wizard?eventId=${eventId}&step=4&returnTo=my-events`);
                    return;
                }

                if (raw === 'PAYMENT PENDING' || raw === 'PAYMENT_PENDING') {
                    navigate(`/user/planning-wizard?eventId=${eventId}&step=3&returnTo=my-events`);
                    return;
                }

                if (raw === 'PENDING APPROVAL') {
                    navigate(`/user/event-management/${eventId}`);
                    return;
                }

                // Default: view/manage page (avoids reopening wizard for non-editable states)
                navigate(`/user/event-management/${eventId}`);
                return;
            }
        } catch {
            // fall back below
        }

        // Fallback to existing behavior if fetch fails
        if (fallbackStatus === 'Immediate Action') {
            navigate(`/user/planning-wizard?eventId=${eventId}&step=4&returnTo=my-events`);
        } else if (fallbackStatus === 'Draft') {
            navigate(`/user/planning-wizard?eventId=${eventId}`);
        } else {
            navigate(`/user/event-management/${eventId}`);
        }
    };

    const handleCampaignManage = (camp) => {
        const eventId = camp?.id;
        if (!eventId) return;

        if (camp?.eventStatus === 'payment-required') {
            // Open Promote payment for this existing promote event
            navigate('/user/promote', {
                state: {
                    payForEvent: {
                        eventId,
                        eventTitle: camp?.title,
                        amount: camp?.platformFee,
                    },
                },
            });
            return;
        }

        navigate(`/user/promote-event/${eventId}`);
    };

    // Filter States
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterType, setFilterType] = useState("All");
    const [filterDate, setFilterDate] = useState("");
    const [filterLocation, setFilterLocation] = useState("");

    // Mock Promoted Campaigns - Removed to use imported data


    useEffect(() => {
        const fetchSaved = () => {
            try {
                const items = JSON.parse(localStorage.getItem('saved') || '[]');
                setSavedEvents(Array.isArray(items) ? items : []);

                // Legacy key used by older payment flow; keep storage clean and avoid duplicate cards.
                try {
                    const created = JSON.parse(localStorage.getItem('my_organized_events') || '[]');
                    if (Array.isArray(created) && created.length > 0) {
                        const filtered = created.filter((e) => String(e?.status || '').toLowerCase() !== 'immediate action');
                        if (filtered.length !== created.length) {
                            localStorage.setItem('my_organized_events', JSON.stringify(filtered));
                        }
                    }
                } catch { /* ignore */ }

                const drafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');
                setDraftEvents(Array.isArray(drafts) ? drafts : []);
            } catch (e) {
                console.error("Failed to parse local storage items", e);
                setSavedEvents([]);
                setDraftEvents([]);
            }
        };

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await dispatch(fetchMyPlannings({ page: 1, limit: 50 }));
                if (result.meta?.requestStatus === 'fulfilled') {
                    const plannings = result.payload?.plannings || [];
                    const mapped = plannings
                        .filter((p) => p && p.eventId)
                        .map((p, idx) => mapPlanningToCardEvent(p, idx));
                    setOrganizedEvents(mapped);
                } else {
                    setOrganizedEvents(myOrganizedEvents);
                }

                const enhancedTickets = myTicketsData.map((t, i) => ({
                    ...t,
                    statusTag: i === 0 ? "Confirmed Guest" : i === 1 ? "Premium Access" : "VIP Access",
                    month: t.date.split(' ')[0],
                    day: t.date.split(' ')[1] || "01"
                }));
                setMyTickets(enhancedTickets);

                const promotesResult = await dispatch(fetchMyPromotes());
                if (promotesResult.meta?.requestStatus === 'fulfilled') {
                    const promotes = promotesResult.payload?.promotes || [];
                    const mapped = promotes
                        .filter((p) => p && p.eventId)
                        .map((p, idx) => mapPromoteToCampaign(p, idx));
                    setCampaigns(mapped);
                } else {
                    // Fallback to static data if API fails
                    setCampaigns(promotedCampaigns);
                }

                fetchSaved();
            } catch (error) {
                console.error("Fetch Data Error:", error);
                toast.error("Failed to load your events");
                setOrganizedEvents(myOrganizedEvents);
                setCampaigns(promotedCampaigns);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        window.addEventListener('storage', fetchSaved);
        window.addEventListener('savedUpdated', fetchSaved);
        return () => {
            window.removeEventListener('storage', fetchSaved);
            window.removeEventListener('savedUpdated', fetchSaved);
        };
    }, [dispatch]);

    const [showCampaignFilters, setShowCampaignFilters] = useState(false);
    const [campaignFilterStatus, setCampaignFilterStatus] = useState("All");
    const [campaignPage, setCampaignPage] = useState(1);
    const CAMPAIGNS_PER_PAGE = 12;

    // Filter Logic
    const allOrganized = [...draftEvents, ...organizedEvents];
    const filteredOrganized = allOrganized.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery) || e.location.toLowerCase().includes(searchQuery);

        // Extended Filters
        const matchesStatus = filterStatus === "All" || e.status === filterStatus;

        // Handle listing type (check formData or fallback)
        const type = e.formData?.listingType || "Public";
        const matchesType = filterType === "All" || type === filterType;

        // Handle simple date string match
        const dateStr = e.date || "";
        const matchesDate = !filterDate || dateStr.toLowerCase().includes(filterDate.toLowerCase());

        // Handle specific location filter
        const matchesLocation = !filterLocation || e.location.toLowerCase().includes(filterLocation.toLowerCase());

        return matchesSearch && matchesStatus && matchesType && matchesDate && matchesLocation;
    });

    const filteredCampaigns = campaigns.filter(c => {
        const title = String(c.title || '').toLowerCase();
        const subtitle = String(c.subtitle || '').toLowerCase();
        const matchesSearch = title.includes(searchQuery) || subtitle.includes(searchQuery);
        const matchesStatus = campaignFilterStatus === "All" || c.status === campaignFilterStatus;
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic for Campaigns
    const totalPages = Math.ceil(filteredCampaigns.length / CAMPAIGNS_PER_PAGE);
    const currentCampaigns = filteredCampaigns.slice((campaignPage - 1) * CAMPAIGNS_PER_PAGE, campaignPage * CAMPAIGNS_PER_PAGE);

    // Pagination Logic for Organized Events
    const [organizedPage, setOrganizedPage] = useState(1);
    const ORGANIZED_PER_PAGE = 9;
    const totalOrganizedPages = Math.ceil(filteredOrganized.length / ORGANIZED_PER_PAGE);
    const currentOrganized = filteredOrganized.slice((organizedPage - 1) * ORGANIZED_PER_PAGE, organizedPage * ORGANIZED_PER_PAGE);

    const filteredTickets = myTickets.filter(t =>
        t.title.toLowerCase().includes(searchQuery) ||
        t.location.toLowerCase().includes(searchQuery)
    );
    const filteredSaved = savedEvents.filter(s =>
        s.title.toLowerCase().includes(searchQuery) ||
        (s.location && s.location.toLowerCase().includes(searchQuery))
    );


    const [activeMenuId, setActiveMenuId] = useState(null);

    // Handle Deleting a Draft (promotedCampaigns is already defined above)
    const handleDeleteDraft = (draftId) => {
        try {
            const drafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');
            const updatedDrafts = drafts.filter(d => d.id !== draftId);
            localStorage.setItem('planningWizardDrafts', JSON.stringify(updatedDrafts));

            // Dispatch update to refresh the list
            window.dispatchEvent(new Event('savedUpdated'));
            toast.success("Draft deleted successfully");
        } catch (error) {
            console.error("Failed to delete draft:", error);
            toast.error("Could not delete draft");
        }
    };

    const TabButton = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`relative px-8 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors z-10 ${activeTab === id ? "text-white" : "text-[#7AB2B2] hover:text-[#09637E]"}`}
        >
            {activeTab === id && (
                <MotionDiv
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#09637E] rounded-full shadow-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            {label}
        </button>
    );

    const FilterDropdown = ({ label, value, options, onChange }) => {
        const [isOpen, setIsOpen] = useState(false);
        const buttonRef = useRef(null);
        const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

        useEffect(() => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        }, [isOpen]);

        // Handle clicks outside
        useEffect(() => {
            if (!isOpen) return;
            const handleClick = (e) => {
                if (buttonRef.current && !buttonRef.current.contains(e.target) && !e.target.closest('.dropdown-portal')) {
                    setIsOpen(false);
                }
            };
            window.addEventListener('click', handleClick);
            return () => window.removeEventListener('click', handleClick);
        }, [isOpen]);

        return (
            <div className="relative">
                <label className="block text-[9px] font-black uppercase tracking-widest text-[#09637E]/60 mb-2">{label}</label>
                <button
                    ref={buttonRef}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className="w-full bg-[#EBF4F6] rounded-xl px-4 py-3 text-xs font-bold text-[#09637E] flex items-center justify-between hover:bg-[#EBF4F6]/80 transition-colors focus:ring-2 focus:ring-[#09637E]/20"
                >
                    {value}
                    <BsChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && createPortal(
                    <AnimatePresence>
                        <MotionDiv
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                top: coords.top,
                                left: coords.left,
                                width: coords.width,
                                zIndex: 9999
                            }}
                            className="absolute bg-white/90 backdrop-blur-xl rounded-xl shadow-[0_20px_40px_-5px_rgba(9,99,126,0.15)] overflow-hidden border border-[#09637E]/10 dropdown-portal"
                        >
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold transition-all border-b border-[#09637E]/5 last:border-none ${value === opt
                                        ? 'bg-[#09637E] text-white'
                                        : 'text-[#09637E]/70 hover:bg-[#09637E]/5 hover:text-[#09637E] hover:pl-6'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </MotionDiv>
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        );
    };

    return (
        <div className="bg-[#EBF4F6] min-h-screen font-sans text-[#09637E] selection:bg-[#7AB2B2] selection:text-white pt-28">
            <Toaster position="top-center" />

            {/* Top Navigation / Tabs Container */}
            <div className="bg-[#EBF4F6]/50 backdrop-blur-md border-b border-[#09637E]/10 mb-12">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center">
                    <div className="flex p-1 bg-white/50 rounded-full shadow-sm border border-[#09637E]/10 relative">
                        <TabButton id="organized" label="Organized" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="campaigns" label="Campaign Studio" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="tickets" label="My Tickets" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto w-full px-6 pb-32">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-16 h-16 border-4 border-[#09637E] border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="font-bold text-[#09637E]/40 uppercase tracking-widest text-xs animate-pulse">Loading Experience...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {/* Organized Events Tab */}
                        {activeTab === "organized" && (
                            <MotionDiv
                                key="organized"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                                    <div>
                                        <h1 className="text-5xl md:text-6xl font-serif-premium text-[#09637E] mb-4">Creative Studio</h1>
                                        <p className="text-[#088395] text-lg max-w-xl font-light">
                                            Curating {filteredOrganized.length} master experiences this season.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className={`hidden md:flex items-center gap-2 px-6 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest ${showFilters ? "bg-[#09637E] text-white border-[#09637E]" : "bg-white text-[#09637E]/60 border-[#7AB2B2]/30 hover:border-[#09637E]"}`}
                                        >
                                            <BsThreeDotsVertical className="rotate-90" />
                                            Filters
                                        </button>
                                        <Link to="/user/planning-wizard" className="flex items-center gap-3 bg-[#09637E] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#088395] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                            <BsPlusLg />
                                            Create New Event
                                        </Link>
                                    </div>
                                </div>

                                {/* Filter Panel */}
                                <AnimatePresence>
                                    {showFilters && (
                                        <MotionDiv
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mb-8"
                                        >
                                            <div className="bg-white p-6 rounded-[30px] shadow-sm border border-[#09637E]/10 grid grid-cols-1 md:grid-cols-4 gap-6 z-20 relative">
                                                {/* Status Filter */}
                                                <FilterDropdown
                                                    label="Status"
                                                    value={filterStatus}
                                                    options={["All", "Draft", "Immediate Action", "Pending Approval", "Approved", "Live", "Rejected"]}
                                                    onChange={(val) => { setFilterStatus(val); setOrganizedPage(1); }}
                                                />

                                                {/* Type Filter */}
                                                <FilterDropdown
                                                    label="Listing Type"
                                                    value={filterType}
                                                    options={["All", "Public", "Private"]}
                                                    onChange={(val) => { setFilterType(val); setOrganizedPage(1); }}
                                                />

                                                {/* Date Filter */}
                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-[#09637E]/60 mb-2">Date (Month/Year)</label>
                                                    <div className="relative">
                                                        <BsCalendarEvent className="absolute left-4 top-1/2 -translate-y-1/2 text-[#09637E]/40" />
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. NOV, 2026"
                                                            value={filterDate}
                                                            onChange={(e) => { setFilterDate(e.target.value); setOrganizedPage(1); }}
                                                            className="w-full bg-[#EBF4F6] border-none rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-[#09637E] placeholder:text-[#09637E]/30 focus:ring-2 focus:ring-[#09637E]/20"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Location Filter */}
                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-[#09637E]/60 mb-2">Location</label>
                                                    <div className="relative">
                                                        <BsGeoAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#09637E]/40" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search location..."
                                                            value={filterLocation}
                                                            onChange={(e) => { setFilterLocation(e.target.value); setOrganizedPage(1); }}
                                                            className="w-full bg-[#EBF4F6] border-none rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-[#09637E] placeholder:text-[#09637E]/30 focus:ring-2 focus:ring-[#09637E]/20"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </MotionDiv>
                                    )}
                                </AnimatePresence>

                                {/* Events Grid */}
                                {filteredOrganized.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {currentOrganized.map((event, idx) => (
                                            <div key={event.id} className="group relative h-[500px] bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-12px_rgba(9,99,126,0.2)] transition-all duration-500 border border-[#7AB2B2]/10">
                                                {/* Image & Gradient */}
                                                <div className="absolute inset-0">
                                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                                    <div className={`absolute inset-0 transition-opacity duration-500 ${
                                                        // Revised Gradients: Much clearer top to reveal image (opacity-95 to transparent)
                                                        idx === 0 ? 'bg-gradient-to-t from-[#09637E]/95 via-[#09637E]/20 to-transparent' :
                                                            idx === 1 ? 'bg-gradient-to-t from-[#088395]/95 via-[#088395]/20 to-transparent' :
                                                                'bg-gradient-to-t from-[#2d5c58]/95 via-[#2d5c58]/20 to-transparent'
                                                        }`} />
                                                </div>

                                                {/* Content Overlay */}
                                                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
                                                    {/* Top Actions - Added subtle drop shadow for readability against image */}
                                                    <div className="flex justify-between items-start">
                                                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${event.status === 'Live' ? 'bg-[#7AB2B2] text-[#09637E]' :
                                                            event.status === 'Pending Approval' ? 'bg-[#EBF4F6] text-[#09637E]' :
                                                                event.status === 'Immediate Action' ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' :
                                                                    event.status === 'Draft' ? 'bg-gray-100 text-gray-500 border border-gray-200' :
                                                                        event.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                                            event.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                                                'bg-slate-500/50 backdrop-blur-md text-white'
                                                            }`}>
                                                            {event.status === 'Live' && <span className="w-1.5 h-1.5 bg-[#09637E] rounded-full animate-pulse" />}
                                                            {event.status === 'Live' ? 'Live Event' : event.status}
                                                        </span>

                                                        {/* Draft Actions Menu - Only for Drafts */}
                                                        {event.status === 'Draft' && (
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveMenuId(activeMenuId === event.id ? null : event.id);
                                                                    }}
                                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-white/20 text-white transition-all focus:outline-none"
                                                                >
                                                                    <BsThreeDotsVertical />
                                                                </button>

                                                                {/* Popup Menu */}
                                                                <AnimatePresence>
                                                                    {activeMenuId === event.id && (
                                                                        <MotionDiv
                                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                            className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100"
                                                                        >
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteDraft(event.id);
                                                                                    setActiveMenuId(null);
                                                                                }}
                                                                                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                                            >
                                                                                Delete Draft
                                                                            </button>
                                                                        </MotionDiv>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Center/Bottom Info */}
                                                    <div className="mb-4 drop-shadow-md">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#EBF4F6] mb-2 opacity-90">{event.date}</p>
                                                        <h3 className="text-3xl font-serif-premium italic mb-4 leading-[1.1] text-white">{event.title}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                                                            <BsGeoAlt /> {event.location}
                                                        </div>
                                                    </div>

                                                    {/* Bottom Action Area */}
                                                    <div className="pt-6 border-t border-white/20 flex items-center justify-between">
                                                        <div className="drop-shadow-sm min-h-[40px]">
                                                            {/* Tickets Sold Removed */}
                                                        </div>
                                                        <button
                                                            onClick={() => handleManageClick(event.id, event.status)}
                                                            className="px-6 py-2.5 bg-[#EBF4F6] text-[#09637E] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#7AB2B2] hover:text-white transition-colors shadow-lg"
                                                        >
                                                            Manage
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center opacity-40">
                                        <p className="font-serif-premium text-2xl">No curated events found.</p>
                                    </div>
                                )}

                                {/* Organized Page Pagination */}
                                {totalOrganizedPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-8 mb-8">
                                        <button
                                            onClick={() => setOrganizedPage(p => Math.max(1, p - 1))}
                                            disabled={organizedPage === 1}
                                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#09637E] disabled:opacity-30 hover:bg-[#EBF4F6] rounded-lg transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex gap-2">
                                            {[...Array(totalOrganizedPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setOrganizedPage(i + 1)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${organizedPage === i + 1
                                                        ? "bg-[#09637E] text-white shadow-md"
                                                        : "bg-white text-[#09637E] hover:bg-[#EBF4F6]"
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setOrganizedPage(p => Math.min(totalOrganizedPages, p + 1))}
                                            disabled={organizedPage === totalOrganizedPages}
                                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#09637E] disabled:opacity-30 hover:bg-[#EBF4F6] rounded-lg transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}

                                {searchQuery === "" && (
                                    <div className="mt-12 p-8 bg-gradient-to-r from-[#7AB2B2] to-[#088395] rounded-[40px] flex items-center justify-between relative overflow-hidden group shadow-lg">
                                        <div className="absolute inset-0 bg-white/10 opacity-30 mix-blend-overlay" />
                                        <div className="relative z-10 p-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">Tonight • 8:00 PM</p>
                                            <h3 className="text-4xl font-serif-premium italic text-white mb-2">Neon Lights Concert</h3>
                                            <p className="text-xs text-white/90 font-medium">Downtown Arena • 2 Tickets</p>
                                        </div>
                                        <div className="relative z-10">
                                            <button className="bg-[#EBF4F6] text-[#09637E] px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </MotionDiv>
                        )}

                        {/* Campaigns Tab */}
                        {activeTab === "campaigns" && (
                            <MotionDiv
                                key="campaigns"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                                    <div>
                                        <h1 className="text-5xl md:text-6xl font-serif-premium text-[#09637E] mb-4">Promoted Campaigns</h1>
                                        <p className="text-[#088395] text-lg max-w-xl font-light italic">
                                            A curated overview of your high-performance ticket marketing and brand outreach.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setShowCampaignFilters(!showCampaignFilters)}
                                            className={`hidden md:flex items-center gap-2 px-6 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest ${showCampaignFilters ? "bg-[#09637E] text-white border-[#09637E]" : "bg-white text-[#09637E]/60 border-[#7AB2B2]/30 hover:border-[#09637E]"}`}
                                        >
                                            <BsThreeDotsVertical className="rotate-90" />
                                            Filters
                                        </button>
                                        <button
                                            onClick={() => navigate('/user/promote')}
                                            className="flex items-center gap-3 bg-[#09637E] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#088395] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                        >
                                            <BsPlusLg className="text-sm" />
                                            New Promotion
                                        </button>
                                    </div>
                                </div>

                                {/* Campaign Filter Panel */}
                                <AnimatePresence>
                                    {showCampaignFilters && (
                                        <MotionDiv
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mb-8"
                                        >
                                            <div className="bg-white p-6 rounded-[30px] shadow-sm border border-[#09637E]/10 grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <FilterDropdown
                                                    label="Status"
                                                    value={campaignFilterStatus}
                                                    options={["All", "Payment Required", "Pending Review", "Live", "Complete"]}
                                                    onChange={(val) => {
                                                        setCampaignFilterStatus(val);
                                                        setCampaignPage(1); // Reset to first page on filter change
                                                    }}
                                                />
                                            </div>
                                        </MotionDiv>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[600px]">
                                    {currentCampaigns.map((camp) => (
                                        <CampaignCard key={camp.id} camp={camp} onAction={() => handleCampaignManage(camp)} />
                                    ))}
                                    {filteredCampaigns.length === 0 && (
                                        <div className="col-span-4 text-center py-20 opacity-40">
                                            <p className="font-serif-premium text-2xl">No campaigns match your search.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-12">
                                        <button
                                            onClick={() => setCampaignPage(p => Math.max(1, p - 1))}
                                            disabled={campaignPage === 1}
                                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#09637E] disabled:opacity-30 hover:bg-[#EBF4F6] rounded-lg transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex gap-2">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCampaignPage(i + 1)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${campaignPage === i + 1
                                                        ? "bg-[#09637E] text-white shadow-md"
                                                        : "bg-white text-[#09637E] hover:bg-[#EBF4F6]"
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCampaignPage(p => Math.min(totalPages, p + 1))}
                                            disabled={campaignPage === totalPages}
                                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#09637E] disabled:opacity-30 hover:bg-[#EBF4F6] rounded-lg transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </MotionDiv>
                        )}

                        {/* Tickets Tab */}
                        {activeTab === "tickets" && (
                            <MotionDiv
                                key="tickets"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
                                    <h1 className="text-5xl md:text-6xl font-serif-premium text-[#09637E] italic">Upcoming Journeys</h1>
                                    <div className="flex gap-4 items-center mb-2">
                                        <button className="text-xs font-black uppercase tracking-widest text-[#09637E] border-b-2 border-[#09637E] pb-1">Upcoming</button>
                                        <button className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#09637E] transition-colors pb-1">Past Events</button>
                                    </div>
                                </div>

                                {filteredTickets.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                                        {filteredTickets.map((ticket, idx) => (
                                            <TicketCard key={ticket.id} ticket={ticket} idx={idx} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center opacity-40">
                                        <p className="font-serif-premium text-2xl">No upcoming journeys match your search.</p>
                                    </div>
                                )}

                                {/* Pending Inspirations Section */}
                                <div className="mb-20">
                                    <div className="flex items-center justify-between mb-8 border-b border-[#09637E]/10 pb-4">
                                        <h2 className="text-3xl font-serif-premium text-[#09637E] italic">Pending Inspirations</h2>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#09637E]">Saved</span>
                                    </div>

                                    {filteredSaved.length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-[30px] border border-[#09637E]/5">
                                            <p className="text-[#09637E]/40 font-bold uppercase tracking-widest text-xs">
                                                {searchQuery ? "No saved events match your search." : "No saved events yet."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredSaved.map((item) => (
                                                <SavedEventCard key={item.id} item={item} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
};

export default MyEvents;
