import React, { useState, useEffect } from "react";
import { BsCalendarEvent, BsGeoAlt, BsQrCode, BsCheckCircleFill, BsThreeDotsVertical, BsPlusLg, BsArrowRight, BsClock, BsTicketPerforated } from "react-icons/bs";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { myOrganizedEvents, myTickets as myTicketsData } from "../../../data/myEventsData";

const MyEvents = () => {
    const [activeTab, setActiveTab] = useState("organized"); // "organized", "tickets", or "campaigns"
    const [isLoading, setIsLoading] = useState(true);
    const [organizedEvents, setOrganizedEvents] = useState([]);
    const [createdEvents, setCreatedEvents] = useState([]);
    const [draftEvents, setDraftEvents] = useState([]);
    const [myTickets, setMyTickets] = useState([]);
    const [savedEvents, setSavedEvents] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    // Filter States
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterType, setFilterType] = useState("All");
    const [filterDate, setFilterDate] = useState("");
    const [filterLocation, setFilterLocation] = useState("");

    // Mock Promoted Campaigns
    const promotedCampaigns = [
        {
            id: 'p1',
            title: "Neon Lights Fest",
            subtitle: "OA PERFORMANCE SERIES",
            status: "Live Campaign",
            revenue: "$124,500",
            revenueLabel: "Revenue Generated",
            conversion: "4.82%",
            centerText: "70%",
            gradient: "bg-gradient-to-b from-[#7AB2B2]/80 via-[#EBF4F6]/20 to-[#09637E]/90",
            buttonText: "Campaign Analytics"
        },
        {
            id: 'p2',
            title: "The Winter Gala",
            subtitle: "EXCLUSIVE ACCESS HUB",
            status: "Pending Review",
            revenue: "$85,000",
            revenueLabel: "Revenue Target",
            conversion: null,
            centerText: "Locked",
            gradient: "bg-gradient-to-b from-[#EBF4F6]/80 via-[#7AB2B2]/20 to-white/90",
            buttonText: "Edit Submission"
        },
        {
            id: 'p3',
            title: "Opera Premiere",
            subtitle: "SIGNATURE SERIES",
            status: "Sold Out",
            revenue: "$210,000",
            revenueLabel: "Total Revenue",
            conversion: "+342%",
            centerText: "Check",
            gradient: "bg-gradient-to-b from-[#d7a444]/80 via-[#f0dbb0]/20 to-white/90",
            buttonText: "Performance Report"
        }
    ];

    useEffect(() => {
        const fetchSaved = () => {
            try {
                const items = JSON.parse(localStorage.getItem('saved') || '[]');
                setSavedEvents(Array.isArray(items) ? items : []);

                const created = JSON.parse(localStorage.getItem('my_organized_events') || '[]');
                setCreatedEvents(Array.isArray(created) ? created : []);

                const drafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');
                setDraftEvents(Array.isArray(drafts) ? drafts : []);
            } catch (e) {
                console.error("Failed to parse local storage items", e);
                setSavedEvents([]);
                setCreatedEvents([]);
                setDraftEvents([]);
            }
        };

        const fetchData = async () => {
            setIsLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 800));

                setOrganizedEvents(myOrganizedEvents);

                const enhancedTickets = myTicketsData.map((t, i) => ({
                    ...t,
                    statusTag: i === 0 ? "Confirmed Guest" : i === 1 ? "Premium Access" : "VIP Access",
                    month: t.date.split(' ')[0],
                    day: t.date.split(' ')[1] || "01"
                }));
                setMyTickets(enhancedTickets);

                // Initial fetch
                fetchSaved();

            } catch (error) {
                toast.error("Failed to load your events");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        // Listen for updates
        window.addEventListener('storage', fetchSaved);
        window.addEventListener('savedUpdated', fetchSaved);
        return () => {
            window.removeEventListener('storage', fetchSaved);
            window.removeEventListener('savedUpdated', fetchSaved);
        };
    }, []);

    // Filter Logic
    const allOrganized = [...draftEvents, ...createdEvents, ...organizedEvents];
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

    const filteredCampaigns = promotedCampaigns.filter(c =>
        c.title.toLowerCase().includes(searchQuery) ||
        c.subtitle.toLowerCase().includes(searchQuery)
    );

    const filteredTickets = myTickets.filter(t =>
        t.title.toLowerCase().includes(searchQuery) ||
        t.location.toLowerCase().includes(searchQuery)
    );

    const filteredSaved = savedEvents.filter(s =>
        s.title.toLowerCase().includes(searchQuery) ||
        (s.location && s.location.toLowerCase().includes(searchQuery))
    );


    const TabButton = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`relative px-8 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors z-10 ${activeTab === id ? "text-white" : "text-[#7AB2B2] hover:text-[#09637E]"
                }`}
        >
            {activeTab === id && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#09637E] rounded-full shadow-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            {label}
        </button>
    );

    return (
        <div className="bg-[#EBF4F6] min-h-screen font-sans text-[#09637E] selection:bg-[#7AB2B2] selection:text-white pt-28">
            <Toaster position="top-center" />

            {/* Top Navigation / Tabs Container */}
            <div className="bg-[#EBF4F6]/50 backdrop-blur-md border-b border-[#09637E]/10 mb-12">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center">
                    <div className="flex p-1 bg-white/50 rounded-full shadow-sm border border-[#09637E]/10 relative">
                        <TabButton id="organized" label="Organized" />
                        <TabButton id="campaigns" label="Campaign Studio" />
                        <TabButton id="tickets" label="My Tickets" />
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
                        {activeTab === "organized" && (
                            <motion.div
                                key="organized"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Header Section */}
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
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mb-8"
                                        >
                                            <div className="bg-white p-6 rounded-[30px] shadow-sm border border-[#09637E]/10 grid grid-cols-1 md:grid-cols-4 gap-6">
                                                {/* Status Filter */}
                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-[#09637E]/60 mb-2">Status</label>
                                                    <select
                                                        value={filterStatus}
                                                        onChange={(e) => setFilterStatus(e.target.value)}
                                                        className="w-full bg-[#EBF4F6] border-none rounded-xl px-4 py-3 text-xs font-bold text-[#09637E] focus:ring-2 focus:ring-[#09637E]/20 cursor-pointer"
                                                    >
                                                        <option value="All">All Statuses</option>
                                                        <option value="Draft">Draft</option>
                                                        <option value="Immediate Action">Immediate Action</option>
                                                        <option value="Pending Approval">Pending Approval</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Live">Live</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </div>

                                                {/* Type Filter */}
                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-[#09637E]/60 mb-2">Listing Type</label>
                                                    <select
                                                        value={filterType}
                                                        onChange={(e) => setFilterType(e.target.value)}
                                                        className="w-full bg-[#EBF4F6] border-none rounded-xl px-4 py-3 text-xs font-bold text-[#09637E] focus:ring-2 focus:ring-[#09637E]/20 cursor-pointer"
                                                    >
                                                        <option value="All">All Types</option>
                                                        <option value="Public">Public</option>
                                                        <option value="Private">Private</option>
                                                    </select>
                                                </div>

                                                {/* Date Filter */}
                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-[#09637E]/60 mb-2">Date (Month/Year)</label>
                                                    <div className="relative">
                                                        <BsCalendarEvent className="absolute left-4 top-1/2 -translate-y-1/2 text-[#09637E]/40" />
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. NOV, 2026"
                                                            value={filterDate}
                                                            onChange={(e) => setFilterDate(e.target.value)}
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
                                                            onChange={(e) => setFilterLocation(e.target.value)}
                                                            className="w-full bg-[#EBF4F6] border-none rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-[#09637E] placeholder:text-[#09637E]/30 focus:ring-2 focus:ring-[#09637E]/20"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Events Grid */}
                                {filteredOrganized.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredOrganized.map((event, idx) => (
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
                                                                        'bg-slate-500/50 backdrop-blur-md text-white'
                                                            }`}>
                                                            {event.status === 'Live' && <span className="w-1.5 h-1.5 bg-[#09637E] rounded-full animate-pulse" />}
                                                            {event.status === 'Live' ? 'Live Event' : event.status}
                                                        </span>
                                                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-white/20 text-white transition-all">
                                                            <BsThreeDotsVertical />
                                                        </button>
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
                                                            {/* Only show sold count if NOT private */}
                                                            {event.formData?.listingType !== 'Private' && (
                                                                <>
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Tickets Sold</p>
                                                                    <p className="text-lg font-bold text-white">{event.sold}</p>
                                                                </>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/user/planning-wizard?eventId=${event.id}`)}
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

                                {/* Example Small Card Sidebar Implementation */}
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
                            </motion.div>
                        )}

                        {activeTab === "campaigns" && (
                            <motion.div
                                key="campaigns"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Header Section */}
                                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                                    <div>
                                        <h1 className="text-5xl md:text-6xl font-serif-premium text-[#09637E] mb-4">Promoted Campaigns</h1>
                                        <p className="text-[#088395] text-lg max-w-xl font-light italic">
                                            A curated overview of your high-performance ticket marketing and brand outreach.
                                        </p>
                                    </div>
                                    <button className="flex items-center gap-3 bg-[#09637E] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#088395] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                        <BsPlusLg className="text-sm" />
                                        New Promotion
                                    </button>
                                </div>

                                {/* Campaigns Grid - 4 Columns */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[600px]">

                                    {/* Card 1: Dedicated Strategy Lead (Always show unless strict filter hides it? Let's keep it visible for now or filterable by 'strategy') */}
                                    {searchQuery === "" && (
                                        <div className="relative bg-gradient-to-br from-[#7AB2B2]/20 to-[#EBF4F6] rounded-[40px] p-8 flex flex-col justify-between overflow-hidden border border-[#09637E]/5">
                                            <div>
                                                <div className="w-12 h-12 rounded-full border-2 border-[#09637E] flex items-center justify-center text-[#09637E] mb-8">
                                                    <BsClock size={20} />
                                                </div>
                                                <h3 className="text-3xl font-serif-premium text-[#09637E] mb-4 leading-tight">Your Dedicated Strategy Lead</h3>
                                                <p className="text-xs text-[#09637E]/60 leading-relaxed font-medium">
                                                    Direct access to your assigned account manager for high-tier campaign optimizations and bespoke requests.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white/50 p-4 rounded-3xl backdrop-blur-sm border border-white/40">
                                                <div className="w-12 h-12 bg-[#0b2d49] rounded-xl flex items-center justify-center text-white shadow-lg">
                                                    {/* Placeholder Avatar */}
                                                    <span className="font-bold text-xs">SM</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]">Sarah Miller</p>
                                                    <p className="text-[9px] font-bold text-[#09637E]/50 uppercase tracking-wider">Senior Strategist</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Campaign Cards Loop */}
                                    {filteredCampaigns.map((camp) => (
                                        <div key={camp.id} className={`relative rounded-[40px] p-8 flex flex-col justify-between overflow-hidden text-white ${camp.gradient} shadow-lg hover:-translate-y-2 transition-transform duration-500`}>
                                            {/* Status Pill */}
                                            <div className="flex justify-start">
                                                <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${camp.status.includes('Live') ? 'bg-emerald-400 text-[#09637E]' :
                                                    camp.status.includes('Sold Out') ? 'bg-emerald-600 text-white' : 'bg-[#d7a444] text-[#0b2d49]'
                                                    }`}>
                                                    {camp.status.includes('Live') && <span className="w-1.5 h-1.5 bg-[#09637E] rounded-full animate-pulse" />}
                                                    {camp.status}
                                                </span>
                                            </div>

                                            {/* Title Section */}
                                            <div className="mt-8 relative z-10">
                                                <h3 className="text-3xl font-serif-premium mb-2 leading-none text-[#09637E] mix-blend-color-burn">{camp.title}</h3>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mix-blend-overlay text-[#09637E]">{camp.subtitle}</p>
                                            </div>

                                            {/* Center Graphic/Stats */}
                                            <div className="flex-1 flex items-center justify-center my-8 relative z-10">
                                                {camp.centerText === 'Locked' ? (
                                                    <div className="text-center opacity-50 text-[#09637E]">
                                                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md mx-auto mb-2 border border-[#09637E]/20">
                                                            <BsClock size={30} />
                                                        </div>
                                                    </div>
                                                ) : camp.centerText === 'Check' ? (
                                                    <div className="text-center">
                                                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl mx-auto">
                                                            <BsCheckCircleFill size={40} className="text-[#09637E]" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative w-24 h-24 rounded-full border-4 border-white/40 flex items-center justify-center backdrop-blur-sm text-[#09637E]">
                                                        <span className="text-2xl font-bold">{camp.centerText}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bottom Stats & Action */}
                                            <div className="relative z-10">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1 text-[#09637E]">{camp.revenueLabel}</p>
                                                <h4 className="text-3xl font-serif-premium mb-4 text-[#09637E]">{camp.revenue}</h4>

                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        {camp.conversion && (
                                                            <div className="bg-white/30 backdrop-blur-md px-3 py-2 rounded-xl border border-white/40">
                                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5 text-[#09637E]">ROI</p>
                                                                <p className="text-xs font-bold text-[#09637E]">{camp.conversion}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${camp.status === 'Sold Out' ? 'bg-[#09637E] text-white hover:bg-[#074d63]' : 'bg-white text-[#09637E] hover:bg-gray-100 shadow-lg'
                                                        }`}>
                                                        {camp.buttonText}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredCampaigns.length === 0 && searchQuery !== "" && (
                                        <div className="col-span-4 text-center py-20 opacity-40">
                                            <p className="font-serif-premium text-2xl">No campaigns match your search.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "tickets" && (
                            <motion.div
                                key="tickets"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Header Section */}
                                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
                                    <h1 className="text-5xl md:text-6xl font-serif-premium text-[#09637E] italic">Upcoming Journeys</h1>
                                    <div className="flex gap-4 items-center mb-2">
                                        <button className="text-xs font-black uppercase tracking-widest text-[#09637E] border-b-2 border-[#09637E] pb-1">Upcoming</button>
                                        <button className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#09637E] transition-colors pb-1">Past Events</button>
                                    </div>
                                </div>

                                {/* Tickets Grid */}
                                {filteredTickets.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                                        {filteredTickets.map((ticket, idx) => (
                                            <div key={ticket.id} className="group relative h-[520px] rounded-[40px] overflow-hidden hover:-translate-y-2 transition-transform duration-500 shadow-xl cursor-pointer">
                                                {/* Background Image & Overlay */}
                                                <img src={ticket.image} alt={ticket.title} className="absolute inset-0 w-full h-full object-cover" />
                                                <div className={`absolute inset-0 transition-opacity duration-300 ${
                                                    // Improved Gradients that fade to transparency at top
                                                    idx === 0 ? 'bg-gradient-to-t from-[#09637E]/95 via-[#09637E]/20 to-transparent' :
                                                        idx === 1 ? 'bg-gradient-to-t from-[#09637E]/95 via-[#09637E]/20 to-transparent' :
                                                            'bg-gradient-to-t from-[#09637E]/95 via-[#09637E]/20 to-transparent'
                                                    }`} />

                                                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                                    {/* Date Badge */}
                                                    <div className="flex justify-between items-start">
                                                        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 text-center min-w-[70px]">
                                                            <p className="text-[10px] font-black text-white/80 uppercase mb-0.5">{ticket.month}</p>
                                                            <p className="text-3xl font-serif-premium text-white leading-none">{ticket.day}</p>
                                                        </div>
                                                        {/* Stub element for layout balance */}
                                                        <div className="w-8" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="text-white drop-shadow-md">
                                                        <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-80 mb-3">
                                                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                                            {ticket.statusTag}
                                                        </p>
                                                        <h3 className="text-3xl font-serif-premium italic mb-4 leading-tight">{ticket.title}</h3>
                                                        <div className="flex items-center gap-2 text-xs opacity-80 mb-8">
                                                            <BsGeoAlt /> {ticket.location}
                                                        </div>

                                                        <button className="w-full bg-[#EBF4F6] text-[#09637E] py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#7AB2B2] hover:text-white transition-all flex items-center justify-center gap-3 shadow-lg">
                                                            <BsQrCode size={16} />
                                                            View Ticket
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center opacity-40">
                                        <p className="font-serif-premium text-2xl">No upcoming journeys match your search.</p>
                                    </div>
                                )}

                                {/* PENDING INSPIRATIONS SECTION */}
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
                                                <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-[30px] shadow-sm hover:shadow-lg transition-all group border border-[#09637E]/5">
                                                    {/* Image Circle */}
                                                    <div className="relative w-24 h-24 shrink-0">
                                                        <div className="absolute inset-0 rounded-full border-4 border-[#EBF4F6] shadow-inner overflow-hidden">
                                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                        </div>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 text-center md:text-left">
                                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                                            <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#7AB2B2]/20 text-[#09637E]">
                                                                Saved
                                                            </span>
                                                        </div>
                                                        <h3 className="text-2xl font-serif-premium text-[#09637E] mb-1">{item.title}</h3>
                                                        <p className="text-xs text-[#088395] font-medium">{item.location} • {item.date}</p>
                                                    </div>

                                                    {/* Price & Action */}
                                                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                                        {item.price && (
                                                            <p className="text-sm font-black text-[#09637E]/60 uppercase tracking-widest text-right w-full mb-1">
                                                                {item.price}
                                                            </p>
                                                        )}
                                                        <Link to={`/user/event/${item.id}`} className="w-full">
                                                            <button className="px-6 py-3 bg-[#09637E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#088395] transition-all shadow-lg w-full">
                                                                View and Book Event
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
};
export default MyEvents;
