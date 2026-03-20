import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BsArrowLeft, BsChatDots, BsCheckCircleFill, BsClock, BsSend, BsFileEarmarkZip, BsDownload, BsCircle, BsTicketPerforated } from "react-icons/bs";
import { myOrganizedEvents } from "../../../data/myEventsData";
import { toast, Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlanningByEventId, fetchPlanningVendorSelectionByEventId, selectPlanningVendorSelectionByEventId } from "../../../store/slices/planningSlice";
import { fetchPromoteByEventId } from "../../../store/slices/promoteSlice";

const UserEventManagement = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // "overview" (Command Center) or "chat" (Manager Sync)
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { sender: "manager", text: "Hello! I'm your dedicated event manager. How can I assist you today?", time: "10:00 AM" }
    ]);

    useEffect(() => {
        let cancelled = false;

        const toDisplayStatus = (status) => {
            const s = String(status || '').trim();
            if (!s) return '';
            // Keep original spacing/format if backend already returns a readable status.
            return s;
        };

        const load = async () => {
            setLoading(true);
            try {
                // 1) Prefer backend planning fetch (UUID eventId route)
                if (eventId && String(eventId).trim()) {
                    const result = await dispatch(fetchPlanningByEventId(String(eventId).trim()));
                    if (result.meta?.requestStatus === 'fulfilled' && result.payload) {
                        const p = result.payload;
                        const selectedServices = Array.isArray(p?.selectedServices) ? p.selectedServices : [];
                        const selectedVendors = Array.isArray(p?.selectedVendors) ? p.selectedVendors : [];
                        const planningEventId = p?.eventId || eventId;
                        if (planningEventId) {
                            dispatch(fetchPlanningVendorSelectionByEventId(planningEventId));
                        }

                        const mapped = {
                            kind: 'PLANNING',
                            id: planningEventId,
                            title: p?.eventTitle || 'Event',
                            location: p?.location?.name || 'Location TBD',
                            image: p?.eventBanner || p?.banner || null,
                            status: toDisplayStatus(p?.status || 'PENDING APPROVAL'),
                            listingType: String(p?.category || '').toLowerCase() === 'public' ? 'Public' : 'Private',
                            assignedManagerId: p?.assignedManagerId || null,
                            guestCount: typeof p?.guestCount === 'number' ? p.guestCount : null,
                            ticketTiers: Array.isArray(p?.tickets?.tiers) ? p.tickets.tiers : [],
                            eventDescription: typeof p?.eventDescription === 'string' ? p.eventDescription : null,
                            selectedServices,
                            selectedVendors,
                            vendorSelectionVendors: [],
                        };

                        if (!cancelled) setEvent(mapped);
                        return;
                    }
                }

                // 2) Try Promote event by eventId
                if (eventId && String(eventId).trim()) {
                    const result = await dispatch(fetchPromoteByEventId(String(eventId).trim()));
                    if (result.meta?.requestStatus === 'fulfilled' && result.payload) {
                        const pr = result.payload;
                        const mapped = {
                            kind: 'PROMOTE',
                            id: pr?.eventId || eventId,
                            title: pr?.eventTitle || 'Event',
                            location: pr?.venue?.locationName || 'Location TBD',
                            image: pr?.eventBanner?.url || null,
                            status: toDisplayStatus(pr?.adminDecision?.status || pr?.eventStatus || 'PENDING'),
                            listingType: 'Public',
                            assignedManagerId: pr?.assignedManagerId || null,
                            guestCount: null,
                            ticketTiers: Array.isArray(pr?.tickets?.tiers) ? pr.tickets.tiers : [],
                            eventDescription: typeof pr?.eventDescription === 'string' ? pr.eventDescription : null,
                            selectedServices: [],
                            selectedVendors: [],
                        };

                        if (!cancelled) setEvent(mapped);
                        return;
                    }
                }

                // 3) Fallback to legacy dummy/local data
                const parsed = Number.isFinite(Number(eventId)) ? parseInt(eventId, 10) : null;
                const foundEvent = myOrganizedEvents.find((e) => e.id === parsed || e.id === eventId);
                if (foundEvent) {
                    if (!cancelled) setEvent(foundEvent);
                    return;
                }

                toast.error("Event not found");
                navigate("/user/my-events");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [dispatch, eventId, navigate]);

    const planningVendorSelection = useSelector((state) => {
        if (!event || String(event?.kind || '').toUpperCase() !== 'PLANNING') return null;
        return selectPlanningVendorSelectionByEventId(state, event?.id);
    });

    useEffect(() => {
        if (!planningVendorSelection) return;
        setEvent((prev) => {
            if (!prev || String(prev?.kind || '').toUpperCase() !== 'PLANNING') return prev;
            const selectedServices = Array.isArray(planningVendorSelection?.selectedServices)
                ? planningVendorSelection.selectedServices
                : prev.selectedServices;
            const vendors = Array.isArray(planningVendorSelection?.vendors)
                ? planningVendorSelection.vendors
                : prev.vendorSelectionVendors;

            const sameServices = Array.isArray(prev.selectedServices) && Array.isArray(selectedServices)
                ? prev.selectedServices.length === selectedServices.length && prev.selectedServices.every((v, i) => v === selectedServices[i])
                : prev.selectedServices === selectedServices;
            const sameVendors = Array.isArray(prev.vendorSelectionVendors) && Array.isArray(vendors)
                ? prev.vendorSelectionVendors.length === vendors.length
                : prev.vendorSelectionVendors === vendors;

            if (sameServices && sameVendors) return prev;

            return {
                ...prev,
                selectedServices,
                vendorSelectionVendors: vendors,
            };
        });
    }, [planningVendorSelection]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        setChatHistory([...chatHistory, { sender: "user", text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setChatMessage("");
        setTimeout(() => {
            setChatHistory(prev => [...prev, {
                sender: "manager",
                text: "Thank you for your message. I'm looking into that for you.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center pt-28">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!event) return null;

    const isPromote = String(event?.kind || '').toUpperCase() === 'PROMOTE';
    const isPublicListing = isPromote || String(event?.listingType || '').toLowerCase() === 'public';
    const isPrivateListing = !isPromote && String(event?.listingType || '').toLowerCase() === 'private';

    const selectedServices = Array.isArray(event?.selectedServices) ? event.selectedServices : [];
    const selectedVendors = Array.isArray(event?.selectedVendors) ? event.selectedVendors : [];
    const vendorByService = new Map(selectedVendors.map((v) => [String(v?.service || '').trim(), v]));

    const vendorSelectionVendors = Array.isArray(event?.vendorSelectionVendors) ? event.vendorSelectionVendors : [];
    const vendorSelectionByService = new Map(vendorSelectionVendors.map((v) => [String(v?.service || '').trim(), v]));

    const toVendorStatus = (raw) => {
        const s = String(raw || '').trim().toUpperCase();
        if (s === 'ACCEPTED') return { key: 'accepted', label: 'accepted', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        if (s === 'REJECTED') return { key: 'reject', label: 'reject', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
        // Backend uses YET_TO_SELECT; UI requirement says yet_to_accept.
        return { key: 'yet_to_accept', label: 'yet_to_accept', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    };

    // Roadmap Status Logic
    const normalizedStatus = String(event?.status || '').toUpperCase().replace(/_/g, ' ').trim();
    const isPendingApproval = normalizedStatus === 'PENDING APPROVAL' || normalizedStatus === 'PENDING_APPROVAL';
    const isLive = normalizedStatus === 'LIVE';
    const isRejected = normalizedStatus === 'REJECTED';
    const isCompleted = normalizedStatus === 'COMPLETED';

    const hasManagerAssigned = Boolean(event?.assignedManagerId);

    const displayStatus = isPendingApproval
        ? 'Pending Approval'
        : isLive
            ? 'Live'
            : isRejected
                ? 'Rejected'
                : isCompleted
                    ? 'Completed'
                : (event?.status || '');

    const steps = [
        {
            id: 1,
            label: 'Application Received',
            status: hasManagerAssigned || isLive || isRejected || isCompleted ? 'completed' : 'current',
        },
        {
            id: 2,
            label: 'Manager Assigned',
            status: hasManagerAssigned ? 'completed' : 'pending',
        },
        {
            id: 3,
            label: 'Application in Review',
            status: hasManagerAssigned
                ? (isPendingApproval ? 'current' : (isLive || isRejected || isCompleted) ? 'completed' : 'current')
                : 'pending',
        },
        {
            id: 4,
            label: isRejected ? 'Rejected' : isCompleted ? 'Completed' : 'Success / Live',
            status: (isLive || isRejected || isCompleted) ? 'completed' : 'pending',
        },
    ];

    const StepIcon = ({ status }) => {
        if (status === 'completed') return <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"><BsCheckCircleFill /></div>;
        if (status === 'current') return <div className="w-8 h-8 rounded-full border-4 border-primary/20 text-primary flex items-center justify-center bg-white"><div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" /></div>;
        return <div className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white" />;
    };

    return (
        <div className="min-h-screen bg-surface pt-28 font-sans text-primary selection:bg-accent selection:text-white">
            <Toaster position="top-center" />

            <main className="max-w-350 mx-auto px-8 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <Link to="/user/my-events" className="inline-flex items-center gap-2 text-primary/50 hover:text-primary font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors group">
                            <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            Back to My Events
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-serif-premium italic text-[#0b2d49]">{event.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isPendingApproval ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-surface text-primary border-primary/10'}`}>
                                {displayStatus}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-1.5 rounded-xl flex gap-1 shadow-sm border border-primary/5">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-surface text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}
                        >
                            Command Center
                        </button>
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-surface text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}
                        >
                            Manager Sync
                        </button>
                    </div>
                </div>

                {activeTab === "overview" && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Roadmap Card */}
                        <div className="bg-white rounded-4xl p-10 shadow-sm border border-primary/5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h2 className="text-xl font-serif-premium text-[#0b2d49] mb-1">Event Planning Roadmap</h2>
                                    {isRejected && (
                                        <Link to="/refund-policy" className="text-[10px] font-bold uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">
                                            Refer Refund Policy details
                                        </Link>
                                    )}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Tracking Status: {displayStatus}</p>
                            </div>

                            <div className="relative z-10">
                                {/* Connecting Line */}
                                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 -z-10" />
                                <div className="absolute top-4 left-0 h-0.5 bg-primary/20 transition-all duration-1000" style={{ width: isPendingApproval ? '33%' : '66%' }} />

                                <div className="grid grid-cols-4 gap-4">
                                    {steps.map((step) => (
                                        <div key={step.id} className="flex flex-col items-center gap-4 text-center">
                                            <StepIcon status={step.status} />
                                            <div>
                                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${step.status === 'completed' || step.status === 'current' ? 'text-primary' : 'text-gray-300'}`}>
                                                    {step.id}. {step.label}
                                                </p>
                                                <p className="text-[9px] font-medium text-gray-400">
                                                    {step.status === 'completed' ? 'Complete' : step.status === 'current' ? 'In Progress' : 'Upcoming'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Event Details */}
                                <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5">
                                    <h3 className="text-sm font-serif-premium text-primary mb-6">Event Details</h3>

                                    <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-100 mb-8 border border-gray-100 group">
                                        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Minimal Banner</div>
                                        <img src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"} alt="Asset" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0" />
                                        <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 to-transparent flex flex-col justify-end p-8 text-white">
                                            <h4 className="font-serif-premium italic text-2xl">{event.title} 2024</h4>
                                            <p className="text-[10px] uppercase tracking-widest opacity-80">{event.location}</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-sm max-w-none text-[#0b2d49]/70 leading-relaxed text-xs">
                                        <h4 className="font-bold text-primary uppercase tracking-widest text-[10px] mb-2">Overview</h4>
                                        {isPublicListing && typeof event?.eventDescription === 'string' && event.eventDescription.trim() ? (
                                            <p>{event.eventDescription.trim()}</p>
                                        ) : (!isPublicListing ? (
                                            <p className="text-[#0b2d49]/60">
                                                This is a private planning event. Details will be coordinated with your manager.
                                            </p>
                                        ) : null)}
                                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
                                            {isPublicListing && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                                                    <div className="w-2 h-2 rounded-full bg-green-400" /> Ticket Sales Active
                                                </div>
                                            )}
                                            <div className="text-[10px] font-bold text-gray-400">ID: #{event.id}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Inventory */}
                                {isPrivateListing ? (
                                    <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5 overflow-hidden relative">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-sm font-serif-premium text-primary">Guest Count</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-surface rounded-xl p-4">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">Guests</p>
                                                <p className="text-2xl font-serif-premium text-[#0b2d49]">
                                                    {typeof event?.guestCount === 'number' ? event.guestCount : '—'}
                                                </p>
                                            </div>
                                            <div className="bg-surface rounded-xl p-4">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">Listing Type</p>
                                                <p className="text-2xl font-serif-premium text-[#0b2d49]">Private</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5 overflow-hidden relative">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-sm font-serif-premium text-primary">Tickets</h3>
                                        </div>

                                        {Array.isArray(event?.ticketTiers) && event.ticketTiers.length > 0 ? (
                                            <div className="space-y-3">
                                                {event.ticketTiers.map((tier, idx) => (
                                                    <div key={tier?._id || tier?.name || idx} className="flex items-center justify-between bg-surface rounded-xl p-4">
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">Tier</p>
                                                            <p className="text-sm font-bold text-[#0b2d49]">{tier?.name || `Tier ${idx + 1}`}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">Quantity</p>
                                                            <p className="text-sm font-bold text-[#0b2d49]">
                                                                {typeof tier?.sold === 'number' ? tier.sold : '—'}
                                                                {typeof tier?.quantity === 'number' ? ` / ${tier.quantity}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-surface rounded-xl p-6 text-sm text-[#0b2d49]/70">
                                                No ticket tiers configured.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Content */}
                            <div className="space-y-8">
                                {/* Consultation / Manager Card */}
                                <div className="relative bg-primary text-white rounded-4xl p-8 shadow-xl overflow-hidden flex flex-col justify-between min-h-75">
                                    {/* Decorative BG */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white backdrop-blur-sm">
                                            {isPendingApproval ? <BsClock size={20} /> : <BsChatDots size={20} />}
                                        </div>

                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Consultation</p>
                                        <h3 className="text-2xl font-serif-premium italic mb-4">
                                            {!hasManagerAssigned
                                                ? 'Manager Selection'
                                                : isRejected
                                                    ? 'Application Closed'
                                                    : 'Manager Connected'
                                            }
                                        </h3>
                                        <p className="text-xs opacity-80 leading-relaxed max-w-62.5">
                                            {!hasManagerAssigned
                                                ? "A dedicated manager will be assigned once your event moves forward in the review process."
                                                : isRejected
                                                    ? "Your application was not approved. A refund has been processed according to our policy."
                                                    : "Your manager is assigned to your event. Sync up for strategy and execution details."
                                            }
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => hasManagerAssigned && !isRejected && setActiveTab("chat")}
                                        disabled={!hasManagerAssigned || isRejected}
                                        className={`mt-8 w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${!hasManagerAssigned || isRejected
                                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                            : 'bg-white text-primary hover:bg-white/90'
                                            }`}
                                    >
                                        {!hasManagerAssigned ? 'Assignment Pending' : isRejected ? 'Refund Processed' : 'Chat with Manager'}
                                    </button>
                                </div>

                                {isPromote ? (
                                    <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5">
                                        <h3 className="text-sm font-serif-premium text-primary mb-6">Promotion Assets</h3>

                                        <div className="space-y-3">
                                            {[
                                                { name: "Media_Kit_2024.zip", size: "24 MB" },
                                                { name: "Social_Banners.zip", size: "12 MB" },
                                                { name: "Event_Logos.ai", size: "4 MB" }
                                            ].map((file, i) => (
                                                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-surface/50 transition-all cursor-pointer">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-surface text-primary flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <BsFileEarmarkZip size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[#0b2d49]">{file.name}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{file.size}</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-primary/40 group-hover:text-primary transition-colors">
                                                        <BsDownload size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-6 py-3 border border-dashed border-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:border-primary transition-colors">
                                            Request New Asset
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5">
                                        <h3 className="text-sm font-serif-premium text-primary mb-6">Services & Vendors</h3>

                                        {selectedServices.length === 0 ? (
                                            <div className="bg-surface rounded-xl p-6 text-sm text-[#0b2d49]/70">
                                                No services selected yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedServices.map((serviceName, i) => {
                                                    const key = String(serviceName || '').trim();
                                                    const vendor = vendorByService.get(key);
                                                    const vendorSel = vendorSelectionByService.get(key);
                                                    const vendorStatusRaw = vendorSel?.status || (vendor?.vendorAuthId ? 'ACCEPTED' : 'YET_TO_SELECT');
                                                    const vendorStatus = toVendorStatus(vendorStatusRaw);
                                                    const vendorAuthId = vendorSel?.vendorAuthId || vendor?.vendorAuthId || null;

                                                    return (
                                                        <div key={`${key}-${i}`} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-surface/50 transition-all">
                                                            <div>
                                                                <p className="text-xs font-bold text-[#0b2d49]">{key || 'Service'}</p>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                    Vendor: {vendorAuthId ? String(vendorAuthId).slice(0, 10) + '…' : 'Not selected'}
                                                                </p>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${vendorStatus.badge}`}>
                                                                {vendorStatus.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "chat" && (
                    <div className="bg-white rounded-4xl shadow-sm border border-primary/5 overflow-hidden flex flex-col h-175 animate-fade-in-up">
                        {isPendingApproval ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-8 text-primary">
                                    <BsChatDots size={40} />
                                </div>
                                <h3 className="text-2xl font-serif-premium text-[#0b2d49] mb-3">Sync Unavailable</h3>
                                <p className="text-sm text-primary max-w-sm leading-relaxed">
                                    Manager Sync will be unlocked once your event passes the Admin Review stage.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-surface/30">
                                    <div>
                                        <h3 className="font-serif-premium text-xl text-[#0b2d49]">Manager Sync</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">Direct Line • Sarah Jenkins</p>
                                    </div>
                                    <Link to="#" className="px-4 py-2 bg-white border border-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">
                                        View Profile
                                    </Link>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-surface">
                                    <div className="flex justify-center mb-8">
                                        <span className="px-4 py-1.5 bg-surface text-primary/60 text-[9px] font-bold rounded-full uppercase tracking-widest">Today</span>
                                    </div>
                                    {chatHistory.map((msg, index) => (
                                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[60%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-[#0b2d49] border border-gray-100 rounded-bl-none'}`}>
                                                <p>{msg.text}</p>
                                                <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-300'}`}>{msg.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-white border-t border-primary/10">
                                    <form onSubmit={handleSendMessage} className="flex gap-4 relative">
                                        <input
                                            type="text"
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-surface border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 text-[#0b2d49] placeholder:text-gray-400"
                                        />
                                        <button type="submit" className="absolute right-2 top-2 bottom-2 w-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all shadow-md">
                                            <BsSend size={18} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserEventManagement;
