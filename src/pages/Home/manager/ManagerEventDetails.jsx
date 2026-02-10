import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, MapPin, Clock, Edit, Users,
    FileText, DollarSign, CheckCircle, XCircle, Plus,
    MoreHorizontal, Download, Search, Filter, ChevronRight,
    TrendingUp, AlertCircle, Check, Mail, Phone, Share2,
    Printer, Copy, ExternalLink, CalendarDays, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable UI Components ---

const Badge = ({ children, color = 'gray', icon: Icon }) => {
    const colorStyles = {
        teal: 'bg-teal-50 text-teal-700 border-teal-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        gray: 'bg-gray-50 text-gray-700 border-gray-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${colorStyles[color]} transition-colors`}>
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
};

const StatCard = ({ label, value, subtext, trend, icon: Icon, color = 'teal' }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
            </div>
            {trend && (
                <span className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-600' : 'text-red-600'} bg-${trend > 0 ? 'green' : 'red'}-50 px-2 py-0.5 rounded-full`}>
                    {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
        <h4 className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</h4>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">{label}</p>
        {subtext && <p className="text-xs text-gray-500 mt-2 font-medium">{subtext}</p>}
    </div>
);

// --- Main Page Component ---

const ManagerEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [scrolled, setScrolled] = useState(false);

    // Scroll listener for sticky header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 200);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mock Data
    const event = {
        title: "Global Tech Summit 2024",
        id: id || "EVT-24-8821",
        status: "Planning",
        date: "Oct 24, 2023",
        endDate: "Oct 26, 2023",
        time: "09:00 AM PST",
        location: "Moscone Center, San Francisco",
        description: "The premier technology conference bringing together startups, enterprise leaders, and investors. Featuring 50+ keynote speakers and 200+ exhibitors.",
        organizer: "TechEvents Inc.",
        attendees: { registered: 2450, capacity: 3000, checkedIn: 120 },
        budget: { total: 150000, spent: 89400, committed: 12000 },
        tasks: { total: 145, completed: 89, pending: 56 }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'guests', label: 'Guest List', icon: Users, count: 2450 },
        { id: 'schedule', label: 'Schedule', icon: CalendarDays },
        { id: 'financials', label: 'Financials', icon: DollarSign },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
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
                                <Badge color="teal" icon={CheckCircle}>{event.status}</Badge>
                                <span className="text-gray-400 font-medium text-sm flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {event.location}
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2 shadow-sm">{event.title}</h1>
                            <p className="text-gray-300 font-medium max-w-2xl text-lg opacity-90">{event.description.substring(0, 100)}...</p>
                        </div>

                        {/* Hero Actions */}
                        <div className="flex items-center gap-3">
                            <button className="h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button className="h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-colors">
                                <Printer className="w-5 h-5" />
                            </button>
                            <button className="px-6 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold transition-colors shadow-lg shadow-black/10 flex items-center gap-2">
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
                                    {tab.count && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-teal-200 text-teal-800' : 'bg-gray-200 text-gray-600'}`}>
                                            {tab.count > 999 ? '2.4k' : tab.count}
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
                        {activeTab === 'overview' && <OverviewTab event={event} />}
                        {activeTab === 'guests' && <GuestsTab />}
                        {activeTab === 'schedule' && <ScheduleTab />}
                        {activeTab === 'financials' && <FinancialsTab event={event} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Tab Components ---

const OverviewTab = ({ event }) => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Col */}
        <div className="xl:col-span-2 space-y-8">
            {/* Details Card */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
                    <button className="text-teal-600 font-bold text-sm hover:underline flex items-center gap-1">
                        View Public Page <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
                    <p className="text-gray-600 leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Organizer</p>
                        <p className="font-bold text-gray-900">{event.organizer}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Start Date</p>
                        <p className="font-bold text-gray-900">{event.date}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">End Date</p>
                        <p className="font-bold text-gray-900">{event.endDate}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Venue ID</p>
                        <p className="font-bold text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded-md w-fit">SF-MOS-01</p>
                    </div>
                </div>
            </section>

            {/* Health / Progress */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Planning Progress</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h4 className="font-bold text-gray-900">Task Completion</h4>
                                <p className="text-sm text-gray-500">89 of 145 tasks completed</p>
                            </div>
                            <span className="text-2xl font-extrabold text-teal-600">61%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                            <div className="bg-teal-500 h-3 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.4)]" style={{ width: '61%' }}></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700">Done</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">89</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Clock className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700">In Progress</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">42</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700">Blocked</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">14</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        {/* Right Col */}
        <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-lg shadow-teal-900/20">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                        <span className="font-bold text-sm">Send Announcement</span>
                        <Mail className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                        <span className="font-bold text-sm">Download Attendee List</span>
                        <Download className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                        <span className="font-bold text-sm">Contact Venue</span>
                        <Phone className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    </button>
                </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Team Members</h3>
                    <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                    {[
                        { name: "Sarah Jenkins", role: "Lead Planner", online: true },
                        { name: "Mike Ross", role: "Logistics", online: false },
                        { name: "Jessica T.", role: "Marketing", online: true },
                    ].map((member, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs shadow-inner">
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                                {member.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500 font-medium">{member.role}</p>
                            </div>
                            <button className="ml-auto text-gray-400 hover:text-teal-600"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </div>
);

const GuestsTab = () => {
    // Mock Guest Data Generation
    const guests = Array.from({ length: 8 }).map((_, i) => ({
        id: i + 1,
        name: ["Alexander Mitchell", "Isabella Chen", "Marcus Johnson", "Sophia Williams", "Ethan Brown", "Olivia Davis", "Liam Wilson", "Emma Taylor"][i],
        email: `guest${i}@example.com`,
        ticket: ["VIP Pass", "General Admission", "Speaker", "Exhibitor"][i % 4],
        status: ["Confirmed", "Checked In", "Pending", "Cancelled"][i % 4],
        company: ["Google", "Stripe", "Amazon", "Meta", "Netflix"][i % 5],
        date: "Oct 12, 2023"
    }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Guest
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-10">
                                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Registrant</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {guests.map((guest) => (
                            <tr key={guest.id} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs border border-white shadow-sm">
                                            {guest.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{guest.name}</p>
                                            <p className="text-xs text-gray-500">{guest.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {guest.ticket}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                    {guest.company}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        color={guest.status === 'Confirmed' ? 'green' : guest.status === 'Checked In' ? 'blue' : guest.status === 'Pending' ? 'amber' : 'red'}
                                        icon={guest.status === 'Confirmed' ? Check : guest.status === 'Checked In' ? CheckCircle : AlertCircle}
                                    >
                                        {guest.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                        <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors shadow-sm border border-transparent hover:border-gray-100"><Edit className="w-4 h-4" /></button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors shadow-sm border border-transparent hover:border-gray-100"><MoreVertical className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                <span className="text-xs font-bold text-gray-500">Showing 1-8 of 2,450</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">Next</button>
                </div>
            </div>
        </div>
    );
};

const ScheduleTab = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
        {/* Date Headers */}
        <div className="flex gap-4 mb-8 justify-center">
            {['Oct 24', 'Oct 25', 'Oct 26'].map((date, i) => (
                <button key={i} className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${i === 0 ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-900/20' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                    Day {i + 1} <span className={`block text-xs font-medium opacity-80`}>{date}</span>
                </button>
            ))}
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-gray-100 ml-6 space-y-8 pb-12">
            {[
                { time: "08:00 AM", title: "Registration & Breakfast", loc: "Main Lobby", dur: "1h 30m" },
                { time: "09:30 AM", title: "Opening Keynote: Future of AI", loc: "Grand Ballroom", dur: "1h" },
                { time: "11:00 AM", title: "Breakout Sessions A/B/C", loc: "Conference Rooms 1-3", dur: "45m" },
                { time: "12:00 PM", title: "Networking Lunch", loc: "Garden Terrace", dur: "1h 30m" },
            ].map((item, i) => (
                <div key={i} className="relative pl-8 group">
                    {/* Dot */}
                    <span className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-white border-4 border-gray-200 group-hover:border-teal-500 transition-colors shadow-sm"></span>

                    {/* Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">{item.time}</span>
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.dur}</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.loc}</span>
                            <div className="flex -space-x-2">
                                <span className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></span>
                                <span className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></span>
                                <span className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white text-[8px] flex items-center justify-center font-bold text-white">+5</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const FinancialsTab = ({ event }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Budget" value="₹1.5M" color="blue" icon={DollarSign} />
            <StatCard label="Spent to Date" value="₹894k" color="amber" icon={TrendingUp} subtext="59% utilized" />
            <StatCard label="projected revenue" value="₹2.2M" color="green" icon={TrendingUp} trend={12} />
            <StatCard label="Outstanding Invoices" value="₹45k" color="rose" icon={AlertCircle} subtext="3 vendors unpaid" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Budget Allocation</h3>
                <div className="space-y-6">
                    {[
                        { label: "Venue & Infrastructure", val: 50, color: "bg-blue-500" },
                        { label: "Catering & Services", val: 25, color: "bg-teal-500" },
                        { label: "Marketing & PR", val: 15, color: "bg-purple-500" },
                        { label: "Staff & Logistics", val: 10, color: "bg-amber-500" },
                    ].map((item, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-gray-700">{item.label}</span>
                                <span className="text-gray-900">{item.val}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.val}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className={`h-full rounded-full ${item.color}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold text-gray-400 mb-1 uppercase tracking-wide text-xs">Net Profit Estimate</h3>
                    <p className="text-4xl font-extrabold text-white mb-8">₹725,200</p>

                    <button className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download Financial Report
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4">Last updated: 2 hours ago by Finance Team</p>
                </div>

                {/* Decor */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
        </div>
    </div>
);

export default ManagerEventDetails;
