import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Filter, Calendar as CalendarIcon, LayoutGrid, List, Kanban as KanbanIcon, MoreHorizontal, X, Plus, Users, DollarSign, Calendar, Archive, Download, CheckSquare, BarChart3, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ManagerEventCard from '../../../components/Global/cards/ManagerEventCard';

// Enriched Mock Data with new fields
const EVENTS_DATA = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
        status: 'Planning',
        category: 'CONFERENCE',
        payStatus: 'Paid',
        title: 'Alpha Tech Conf',
        date: 'Oct 24, 2023',
        time: '09:00 AM',
        location: 'San Francisco, CA',
        metricLabel: "Ticket Sales",
        metricValue: 850,
        metricTotal: 1200,
        revenueData: [{ value: 400 }, { value: 300 }, { value: 500 }, { value: 700 }, { value: 600 }],
        team: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2']
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop',
        status: 'Finalizing',
        category: 'WEDDING',
        payStatus: 'Deposit Paid',
        title: 'Johnson Wedding',
        date: 'Nov 12, 2023',
        time: '02:00 PM',
        location: 'Austin, TX',
        metricLabel: "Guest List",
        metricValue: 120,
        metricTotal: 150,
        revenueData: null,
        team: ['https://i.pravatar.cc/150?u=3']
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1459749411177-287ce371c015?q=80&w=1000&auto=format&fit=crop',
        status: 'Live Now',
        category: 'FESTIVAL',
        payStatus: 'Paid',
        title: 'Neon Music Fest',
        date: 'Oct 24-26',
        time: 'All Day',
        location: 'Miami, FL',
        metricLabel: "Tickets Sold",
        metricValue: 4500,
        metricTotal: 5000,
        revenueData: [{ value: 2000 }, { value: 3500 }, { value: 4500 }, { value: 4800 }, { value: 5000 }],
        team: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5', 'https://i.pravatar.cc/150?u=6']
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
        status: 'Review',
        category: 'CORPORATE',
        payStatus: 'Unpaid',
        title: 'Global Summit',
        date: 'Dec 05, 2023',
        time: '10:00 AM',
        location: 'London, UK',
        metricLabel: "Attending",
        metricValue: 280,
        metricTotal: 300,
        revenueData: null,
        team: ['https://i.pravatar.cc/150?u=1']
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1505373877841-8d43f703fb8f?q=80&w=1000&auto=format&fit=crop',
        status: 'Planning',
        category: 'WORKSHOP',
        payStatus: 'Paid',
        title: 'DevOps Connect',
        date: 'Dec 10, 2023',
        time: '11:00 AM',
        location: 'Seattle, WA',
        metricLabel: "Seats",
        metricValue: 45,
        metricTotal: 100,
        revenueData: [{ value: 20 }, { value: 30 }, { value: 25 }, { value: 40 }, { value: 45 }],
        team: ['https://i.pravatar.cc/150?u=7']
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1000&auto=format&fit=crop',
        status: 'Finalizing',
        category: 'GALA',
        payStatus: 'Deposit Paid',
        title: 'Winter Gala',
        date: 'Dec 15, 2023',
        time: '07:00 PM',
        location: 'New York, NY',
        metricLabel: "Donations (₹)",
        metricValue: 15400,
        metricTotal: 20000,
        revenueData: [{ value: 200 }, { value: 250 }, { value: 280 }, { value: 290 }, { value: 300 }],
        team: ['https://i.pravatar.cc/150?u=8', 'https://i.pravatar.cc/150?u=9']
    },
    {
        id: 7,
        image: 'https://images.unsplash.com/photo-1470229722913-7ea0510d9238?q=80&w=1000&auto=format&fit=crop',
        status: 'Live Now',
        category: 'CONCERT',
        payStatus: 'Paid',
        title: 'Indie Rock Expo',
        date: 'Oct 25, 2023',
        time: '06:00 PM',
        location: 'Austin, TX',
        metricLabel: "Sold",
        metricValue: 1800,
        metricTotal: 2000,
        revenueData: [{ value: 1000 }, { value: 1200 }, { value: 1500 }, { value: 1700 }, { value: 1800 }],
        team: ['https://i.pravatar.cc/150?u=10']
    },
    {
        id: 8,
        image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop',
        status: 'Review',
        category: 'RETREAT',
        payStatus: 'Unpaid',
        title: 'Tech Leaders Retreat',
        date: 'Jan 10, 2024',
        time: 'All Day',
        location: 'Denver, CO',
        metricLabel: "Capacity",
        metricValue: 15,
        metricTotal: 50,
        revenueData: null,
        team: ['https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3']
    }
];

const Tabs = ({ activeTab, onTabChange }) => {
    const tabs = ['All Events', 'Active', 'Drafts', 'Archived'];
    return (
        <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-gray-100 w-fit">
            {tabs.map(tab => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

const ManagerEvents = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('All Events');
    const [selectedEvents, setSelectedEvents] = useState([]);

    // Filter Logic
    const filteredEvents = useMemo(() => {
        return EVENTS_DATA.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || event.status === statusFilter;

            // Mock tab logic
            let matchesTab = true;
            if (activeTab === 'Active') matchesTab = ['Planning', 'Finalizing', 'Live Now'].includes(event.status);
            if (activeTab === 'Drafts') matchesTab = false; // Mock
            if (activeTab === 'Archived') matchesTab = false; // Mock

            return matchesSearch && matchesStatus && matchesTab;
        });
    }, [searchQuery, statusFilter, activeTab]);

    const handleManage = (id) => {
        navigate(`/manager/events/${id}`);
    };

    const toggleSelect = (id) => {
        if (selectedEvents.includes(id)) {
            setSelectedEvents(selectedEvents.filter(eventId => eventId !== id));
        } else {
            setSelectedEvents([...selectedEvents, id]);
        }
    };

    return (
        <div className="p-8 max-w-[1920px] mx-auto min-h-screen space-y-8">

            {/* Top Bar: Title + Stats Row */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Events Overview</h1>
                    <div className="flex gap-2 text-gray-500 font-medium items-center">
                        <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-xs font-bold">PRO</span>
                        <span>Manage your portfolio</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-w-[140px]">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Active</span>
                        <span className="text-2xl font-extrabold text-gray-800">24</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-w-[140px]">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Attendees</span>
                        <span className="text-2xl font-extrabold text-gray-800">5.2k</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-w-[140px]">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Revenue</span>
                        <span className="text-2xl font-extrabold text-teal-600">₹1.28L</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-w-[140px]">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Bell className="w-3 h-3" /> Notifications</span>
                        <span className="text-2xl font-extrabold text-rose-500">3 New</span>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden min-h-[600px] flex flex-col">
                {/* Control Bar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col xl:flex-row gap-4 items-center justify-between">

                    {/* Left: Tabs */}
                    <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* Right: Actions */}
                    <div className="flex gap-3 w-full xl:w-auto overflow-x-auto">
                        {/* Bulk Actions (visible when selected) */}
                        <AnimatePresence>
                            {selectedEvents.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-xl text-teal-800 font-bold text-sm mr-2"
                                >
                                    <CheckSquare className="w-4 h-4" /> {selectedEvents.length} Selected
                                    <div className="h-4 w-px bg-teal-200 mx-2" />
                                    <button className="hover:text-teal-900 flex items-center gap-1"><Download className="w-3 h-3" /> Export</button>
                                    <button className="hover:text-teal-900 flex items-center gap-1"><Archive className="w-3 h-3" /> Archive</button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-teal-600 hover:border-teal-200 transition-all relative">
                            <Filter className="w-5 h-5" />
                        </button>
                        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400'}`}><LayoutGrid className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400'}`}><KanbanIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-gray-50/50 flex-grow">
                    <AnimatePresence mode="wait">
                        {viewMode === 'grid' && (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
                            >
                                {filteredEvents.map((event) => (
                                    <div key={event.id} className="relative group/card">
                                        {/* Selection Checkbox Overlay */}
                                        <div className="absolute top-4 left-4 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                            <input
                                                type="checkbox"
                                                checked={selectedEvents.includes(event.id)}
                                                onChange={() => toggleSelect(event.id)}
                                                className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer shadow-sm"
                                            />
                                        </div>
                                        <ManagerEventCard
                                            {...event}
                                            onManage={() => handleManage(event.id)}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {viewMode === 'list' && (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
                                            <th className="px-6 py-4">Event</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Metric</th>
                                            <th className="px-6 py-4 text-right">Team</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredEvents.map((event) => (
                                            <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4"><input type="checkbox" checked={selectedEvents.includes(event.id)} onChange={() => toggleSelect(event.id)} className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" /></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={event.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                        <div>
                                                            <p className="font-bold text-gray-900">{event.title}</p>
                                                            <p className="text-xs text-gray-500">{event.date}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{event.status}</span></td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="text-xs font-bold block">{event.metricLabel}</span>
                                                        <span className="text-sm text-gray-600">{event.metricValue}/{event.metricTotal}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end -space-x-2">
                                                        {event.team.map((src, i) => <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white" />)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleManage(event.id)} className="text-teal-600 font-bold text-sm hover:underline">Manage</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                        {/* Kanban placeholder for brevity, reusing logic from before but wrapped in new layout */}
                        {viewMode === 'kanban' && <div className="text-center p-10 text-gray-400">Kanban View Available</div>}
                    </AnimatePresence>
                </div>

                {/* Footer Pagination */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center text-sm text-gray-500">
                    <span>Showing 1-8 of 24 events</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerEvents;
