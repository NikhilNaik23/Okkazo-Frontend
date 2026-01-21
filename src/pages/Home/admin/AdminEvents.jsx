import React, { useState } from "react";

import InternalEventCard from "../../../components/Global/cards/InternalEventCard";
import { 
  Filter, 
  RotateCcw, 
  Search, 
  Plus,
  Music,
  Mic,
  Palette,
  Briefcase
} from "lucide-react";

const MOCK_EVENTS = [
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
];

const ManualEntryCard = () => {
    return (
        <div className="h-full min-h-[460px] w-full max-w-[420px] rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Plus size={32} />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Manual Entry</h3>
                <p className="text-sm text-gray-500 mt-1">Add internal verified event</p>
            </div>
        </div>
    );
};

const AdminEvents = () => {
    const [activeTab, setActiveTab] = useState("Pending");

    return (
        <div className="h-full flex flex-col">
             {/* Page Title (Previously from Layout) */}
             <div className="px-6 py-6 pb-2 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-600 tracking-tight">
                            Event Verification
                        </h2>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-8 flex-1">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Pending Requests</h2>
                        <p className="text-gray-500">Review and verify events before they go live on the platform.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                            <Filter size={18} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
                            <RotateCcw size={18} />
                            Refresh List
                        </button>
                    </div>
                </div>

                {/* Tabs & Search Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-100/50 rounded-xl w-full md:w-auto">
                            {["Pending (12)", "Verified", "Rejected"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        activeTab === tab 
                                        ? "bg-white text-emerald-600 shadow-sm" 
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-[400px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Search event, vendor or ID..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100 border-transparent focus:bg-white border focus:border-emerald-500 rounded-xl text-sm transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MOCK_EVENTS.map((event) => (
                        <InternalEventCard
                            key={event.id}
                            title={event.title}
                            category={event.category}
                            image={event.image}
                            organizer={event.organizer}
                            eventDate={event.date}
                            submittedDate={event.submitted}
                            status={event.status}
                            onVerify={() => console.log("Verify", event.id)}
                            onDetails={() => console.log("Details", event.id)}
                        />
                    ))}
                    <ManualEntryCard />
                </div>
            </div>
        </div>
    );
};

export default AdminEvents;