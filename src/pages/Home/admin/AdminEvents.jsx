import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAdminEvents } from "../../../data/adminData";

import InternalEventCard from "../../../components/Global/cards/InternalEventCard";
import { 
  Filter, 
  RotateCcw, 
  Search, 
  Plus,
  Music,
  Mic,
  Palette,
  Briefcase,
  CheckSquare,
  Square,
  ChevronDown
} from "lucide-react";

const MOCK_EVENTS = mockAdminEvents;

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

const ManualEntryCard = () => {
    return (
        <div className="h-full min-h-[460px] w-full max-w-[420px] rounded-3xl border-2 border-dashed border-[#d7a444]/40 bg-[#f3ddb1]/20 hover:bg-[#f3ddb1]/40 hover:border-[#d7a444] transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-[#f3ddb1] text-[#0b2d49] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Plus size={32} />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-[#0b2d49]">Manual Entry</h3>
                <p className="text-sm text-[#5a5b44] mt-1">Add internal verified event</p>
            </div>
        </div>
    );
};



const AdminEvents = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Events");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState(["Upcoming"]);
    const [tempSelectedStatuses, setTempSelectedStatuses] = useState(["Upcoming"]);
    const [showFilters, setShowFilters] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Reset all filters
        setSearchQuery("");
        setSelectedStatuses(["Upcoming"]);
        setTempSelectedStatuses(["Upcoming"]);
        setActiveTab("Events");
        
        // Mock refresh delay
        setTimeout(() => {
            setIsRefreshing(false);
        }, 600);
    };

    const toggleTempStatus = (status) => {
        if (tempSelectedStatuses.includes(status)) {
            if (tempSelectedStatuses.length > 1) {
                setTempSelectedStatuses(tempSelectedStatuses.filter(s => s !== status));
            }
        } else {
            setTempSelectedStatuses([...tempSelectedStatuses, status]);
        }
    };

    const applyFilters = () => {
        setSelectedStatuses(tempSelectedStatuses);
        setShowFilters(false);
    };

    const filteredEvents = MOCK_EVENTS.filter(event => {
        // Tab Filtering
        if (activeTab === "Verified") return event.status === "VERIFIED";
        if (activeTab === "Rejected") return event.status === "REJECTED";
        if (activeTab === "Events") {
            if (event.status === "VERIFIED" || event.status === "REJECTED") return false;
        }

        // Dropdown Multi-Status Filtering
        const isMatch = selectedStatuses.some(status => {
            if (status === "Upcoming") {
                const today = new Date("2026-02-11"); // Contextually present date
                const eventDate = new Date(event.date);
                return eventDate >= today;
            }
            return event.status === status.toUpperCase();
        });

        if (!isMatch) return false;

        // Search Filtering
        const query = searchQuery.toLowerCase();
        return event.title.toLowerCase().includes(query) || 
               event.organizer.toLowerCase().includes(query) ||
               event.id.toString().includes(query);
    });

    return (
        <div className="h-full flex flex-col">
             {/* Page Title */}
             <div className="px-6 py-6 pb-2 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[#0b2d49] tracking-tight">
                            Event Verification
                        </h2>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-8 flex-1">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0b2d49] tracking-tight mb-2">
                            {activeTab === "Events" ? "Event" : activeTab} Requests
                        </h2>
                        <p className="text-[#5a5b44]">Review and verify events before they go live on the platform.</p>
                    </div>
                    <div className="flex gap-3 relative">
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setShowFilters(!showFilters);
                                    setTempSelectedStatuses(selectedStatuses);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 bg-white border border-[#e9eff1] text-[#5a5b44] font-medium rounded-xl hover:bg-[#e9eff1] transition-colors shadow-sm ${showFilters ? 'ring-2 ring-[#d7a444]/20 border-[#d7a444]' : ''}`}
                            >
                                <Filter size={18} className={selectedStatuses.length > 0 && !(selectedStatuses.length === 1 && selectedStatuses[0] === "Upcoming") ? "text-[#d7a444]" : "text-[#708aa0]"} />
                                {selectedStatuses.length === 1 && selectedStatuses[0] === "Upcoming" ? "Filter" : `Filtered (${selectedStatuses.length})`}
                                <ChevronDown size={14} className={`ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilters && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e9eff1] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 border-b border-[#f0f2f5] bg-[#f8fafc]/50">
                                        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest px-2 py-1">Selection Status</p>
                                    </div>
                                    <div className="py-2">
                                        {["Upcoming", "Pending", "Reviewing", "Urgent"].map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => toggleTempStatus(option)}
                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#5a5b44] hover:bg-[#f8fafc] hover:text-[#0b2d49] transition-colors flex items-center gap-3"
                                            >
                                                {tempSelectedStatuses.includes(option) ? (
                                                    <CheckSquare size={18} className="text-[#d7a444]" />
                                                ) : (
                                                    <Square size={18} className="text-[#cbd5e1]" />
                                                )}
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-[#f8fafc] border-t border-[#f0f2f5] flex gap-2">
                                        <button 
                                            onClick={() => setShowFilters(false)}
                                            className="flex-1 px-3 py-2 text-xs font-bold text-[#5a5b44] hover:bg-[#e9eff1] rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={applyFilters}
                                            className="flex-1 px-3 py-2 text-xs font-bold bg-[#0b2d49] text-white rounded-lg hover:bg-[#0b2d49]/90 transition-colors shadow-sm"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`flex items-center gap-2 px-4 py-2 bg-[#0b2d49] text-white font-medium rounded-xl hover:bg-[#0b2d49]/90 transition-colors shadow-sm shadow-[#0b2d49]/20 disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            <RotateCcw size={18} className={isRefreshing ? "animate-spin" : ""} />
                            {isRefreshing ? "Refreshing..." : "Refresh List"}
                        </button>
                    </div>
                </div>

                {/* Tabs & Search Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-[#e9eff1] mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Tabs */}
                        <div className="flex p-1 bg-[#e9eff1] rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                            {["Events", "Verified", "Rejected"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                                        activeTab === tab 
                                        ? "bg-white text-[#0b2d49] shadow-sm" 
                                        : "text-[#5a5b44] hover:text-[#0b2d49] hover:bg-white/50"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-[400px]">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => (
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
                                onClick={() => {setSearchQuery(""); setSelectedStatuses(["Upcoming"]); setTempSelectedStatuses(["Upcoming"]); setActiveTab("Events");}}
                                className="mt-4 text-[#d7a444] font-bold hover:underline"
                             >
                                Clear all filters
                             </button>
                        </div>
                    )}
                    <ManualEntryCard />
                </div>
            </div>
        </div>
    );
};

export default AdminEvents;