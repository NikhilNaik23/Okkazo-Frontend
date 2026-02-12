import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, MapPin, Clock, Edit, Users,
    FileText, DollarSign, CheckCircle, XCircle, Plus,
    MoreHorizontal, Download, Search, Filter, ChevronRight,
    TrendingUp, AlertCircle, Check, Mail, Phone, Share2,
    Printer, Copy, ExternalLink, CalendarDays, MoreVertical,
    X, Save, Briefcase, MessageSquare, FileCheck, Send, Smile,
    ListTodo, FolderOpen, Upload, Eye, RefreshCw, ChevronDown,
    Paperclip, Hash, Star, ShieldCheck, CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// --- Reusable UI Components ---

const Badge = ({ children, color = 'gray', icon: Icon }) => {
    const colorStyles = {
        teal: 'bg-teal-50 text-teal-700 border-teal-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        gray: 'bg-gray-50 text-gray-700 border-gray-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
        green: 'bg-green-50 text-green-700 border-green-100',
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

// --- Modals ---

const EditEventModal = ({ isOpen, onClose, event }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Edit Event Details</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Event Title</label>
                        <input type="text" defaultValue={event.title} className="w-full px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                            <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                            <input type="text" defaultValue={event.location} className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea defaultValue={event.description} rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none" />
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={() => { toast.success("Event updated successfully!"); onClose(); }} className="px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-lg">Save Changes</button>
                </div>
            </motion.div>
        </div>
    );
};

const AddGuestModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Add New Guest</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                        <input type="text" placeholder="e.g. John Doe" className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                        <input type="email" placeholder="john@example.com" className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Ticket Type</label>
                            <select className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white">
                                <option>General Admission</option>
                                <option>VIP Pass</option>
                                <option>Speaker</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <select className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white">
                                <option>Confirmed</option>
                                <option>Pending</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={() => { toast.success("Guest added to list!"); onClose(); }} className="px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-lg">Add Guest</button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Main Page Component ---

const ManagerEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [scrolled, setScrolled] = useState(false);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

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
        { id: 'vendors', label: 'Vendors', icon: Briefcase, count: 4 },
        { id: 'chat', label: 'Event Chat', icon: MessageSquare, count: 5 },
        { id: 'todo', label: 'To-Do', icon: ListTodo, count: 8 },
        { id: 'schedule', label: 'Schedule', icon: CalendarDays },
        { id: 'financials', label: 'Financials', icon: DollarSign },
        { id: 'documents', label: 'Documents', icon: FolderOpen, count: 6 },
    ];

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
            <EditEventModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} event={event} />
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
                            <button onClick={handleCopyLink} className="h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-colors" title="Share/Copy Link">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button onClick={handlePrint} className="h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-colors" title="Print Event Summary">
                                <Printer className="w-5 h-5" />
                            </button>
                            <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold transition-colors shadow-lg shadow-black/10 flex items-center gap-2">
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
                        {activeTab === 'guests' && <GuestsTab onAddClick={() => setIsGuestModalOpen(true)} />}
                        {activeTab === 'vendors' && <VendorsTab />}
                        {activeTab === 'chat' && <ChatTab />}
                        {activeTab === 'todo' && <ToDoTab />}
                        {activeTab === 'schedule' && <ScheduleTab />}
                        {activeTab === 'financials' && <FinancialsTab event={event} />}
                        {activeTab === 'documents' && <DocumentsTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Tab Components ---

const OverviewTab = ({ event }) => {
    const pipelineStages = [
        { id: 'draft', label: 'Draft', done: true },
        { id: 'planning', label: 'Planning', done: true },
        { id: 'vendor_confirm', label: 'Vendor Confirmation', done: false, active: true },
        { id: 'client_review', label: 'Client Review', done: false },
        { id: 'confirmed', label: 'Confirmed', done: false },
        { id: 'live', label: 'Live', done: false },
        { id: 'completed', label: 'Completed', done: false },
    ];

    return (
        <div className="space-y-8">
            {/* Event Pipeline */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-teal-600" /> Event Pipeline
                </h3>
                <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {pipelineStages.map((stage, i) => (
                        <div key={stage.id} className="flex items-center shrink-0">
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer
                            ${stage.done ? 'bg-teal-50 border-teal-200 text-teal-700' :
                                    stage.active ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-md shadow-amber-100 ring-2 ring-amber-200' :
                                        'bg-gray-50 border-gray-200 text-gray-400'}`}
                                onClick={() => toast(stage.done ? `${stage.label} completed ✓` : stage.active ? `Currently in ${stage.label}` : `${stage.label} upcoming`)}
                            >
                                {stage.done ? <CheckCircle className="w-4 h-4" /> : stage.active ? <Clock className="w-4 h-4 animate-pulse" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                                {stage.label}
                            </div>
                            {i < pipelineStages.length - 1 && (
                                <ChevronRight className={`w-5 h-5 mx-1 shrink-0 ${stage.done ? 'text-teal-400' : 'text-gray-300'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Col */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Client Requirements */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" /> Client Requirements
                            </h3>
                            <Badge color="amber" icon={ShieldCheck}>From Client Brief</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Event Type</p>
                                    <p className="font-bold text-gray-900">Technology Conference</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Budget Range</p>
                                    <p className="font-bold text-gray-900">₹10L – ₹15L</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Expected Guests</p>
                                    <p className="font-bold text-gray-900">2,500 – 3,000</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Preferred Location</p>
                                    <p className="font-bold text-gray-900">San Francisco or Bay Area</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Catering Preference</p>
                                    <p className="font-bold text-gray-900">Vegan + Non-Veg options, Premium Buffet</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Special Notes</p>
                                    <p className="font-bold text-amber-800">Client wants live DJ + photo booth. Priority on AV quality for keynote.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Event Details */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
                            <button className="text-teal-600 font-bold text-sm hover:underline flex items-center gap-1">
                                View Public Page <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
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

                    {/* Planning Progress */}
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
                            <button onClick={() => toast.success("Announcement sent to 2,450 attendees!")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                                <span className="font-bold text-sm">Send Announcement</span>
                                <Mail className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button onClick={() => toast.success("Downloading Attendee CSV...")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                                <span className="font-bold text-sm">Download Attendee List</span>
                                <Download className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button onClick={() => toast.success("Venue contacted via email.")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                                <span className="font-bold text-sm">Contact Venue</span>
                                <Phone className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button onClick={() => toast.success("Quote sent to client!")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                                <span className="font-bold text-sm">Send Quote to Client</span>
                                <Send className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Team Members</h3>
                            <button onClick={() => toast("Invite feature coming soon!")} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><Plus className="w-5 h-5" /></button>
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

                    {/* Client Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Client</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">RC</div>
                            <div>
                                <p className="font-bold text-gray-900">Rajesh Chandrasekhar</p>
                                <p className="text-xs text-gray-500">TechEvents Inc. • CEO</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" /> rajesh@techevents.com</div>
                            <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" /> +91 98765 43210</div>
                        </div>
                        <button onClick={() => toast.success("Opening client chat...")} className="w-full mt-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Message Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GuestsTab = ({ onAddClick }) => {
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
                    <button onClick={() => toast.success("Exporting guest list to CSV...")} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={onAddClick} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
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

const VendorsTab = () => {
    const [vendors, setVendors] = useState([
        { id: 1, name: "Gourmet Bites", category: "CATERING", availability: "available", status: "Confirmed", contact: "Sarah Jenkins", email: "sarah@gourmetbites.com", icon: "GB", color: "blue", price: 250000, rating: 4.8 },
        { id: 2, name: "Crystal Clear AV", category: "AUDIO/VISUAL", availability: "pending", status: "Checking", contact: "Mike Ross", phone: "(555) 123-4567", icon: "CC", color: "orange", price: 180000, rating: 4.5 },
        { id: 3, name: "The Grand Hall", category: "VENUE", availability: "available", status: "Confirmed", contact: "Elena Gilbert", address: "San Francisco, CA", icon: "GH", color: "purple", price: 500000, rating: 4.9 },
        { id: 4, name: "Lens Focus", category: "PHOTOGRAPHY", availability: "unavailable", status: "Unavailable", contact: "Dave Chen", icon: "LF", color: "blue", price: 75000, rating: 4.2 },
    ]);

    const [showAlternatives, setShowAlternatives] = useState(null);

    const alternatives = {
        PHOTOGRAPHY: [
            { id: 101, name: "SnapPro Studio", price: 85000, rating: 4.6, available: true },
            { id: 102, name: "Golden Hour Films", price: 95000, rating: 4.8, available: true },
            { id: 103, name: "PixelPerfect", price: 65000, rating: 4.3, available: true },
        ],
        "AUDIO/VISUAL": [
            { id: 201, name: "SoundWave Pro", price: 200000, rating: 4.7, available: true },
            { id: 202, name: "TechAV Solutions", price: 160000, rating: 4.4, available: true },
        ],
        CATERING: [
            { id: 301, name: "Feast & Co.", price: 280000, rating: 4.6, available: true },
            { id: 302, name: "Royal Kitchen", price: 220000, rating: 4.5, available: true },
        ],
    };

    const getAvailabilityBadge = (av) => {
        if (av === 'available') return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: '✅ Available', icon: CheckCircle };
        if (av === 'pending') return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: '⏳ Pending', icon: Clock };
        return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: '❌ Unavailable', icon: XCircle };
    };

    const handleCheckAvailability = (vendorId) => {
        setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, availability: 'pending', status: 'Checking' } : v));
        toast("Checking vendor availability...", { icon: '🔍' });
        setTimeout(() => {
            const isAvailable = Math.random() > 0.4;
            setVendors(prev => prev.map(v => v.id === vendorId ? {
                ...v,
                availability: isAvailable ? 'available' : 'unavailable',
                status: isAvailable ? 'Available' : 'Unavailable'
            } : v));
            toast[isAvailable ? 'success' : 'error'](isAvailable ? "Vendor is available! ✅" : "Vendor is unavailable ❌");
        }, 1500);
    };

    const handleConfirmVendor = (vendorId) => {
        setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'Confirmed', availability: 'available' } : v));
        toast.success("Vendor confirmed for this event! 🎉");
    };

    const handleReplaceVendor = (vendorId, alt) => {
        setVendors(prev => prev.map(v => v.id === vendorId ? {
            ...v, name: alt.name, price: alt.price, rating: alt.rating,
            availability: 'available', status: 'Confirmed', icon: alt.name.substring(0, 2).toUpperCase()
        } : v));
        setShowAlternatives(null);
        toast.success(`Replaced with ${alt.name}! Now confirmed.`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Vendor Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Verify availability, confirm vendors, and manage alternatives</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.success("All vendors re-checked!")} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Re-check All
                    </button>
                    <button onClick={() => toast.success("Vendor summary sent to client!")} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send to Client
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Vendors</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{vendors.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Confirmed</p>
                    <p className="text-2xl font-extrabold text-green-700 mt-1">{vendors.filter(v => v.availability === 'available').length}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pending</p>
                    <p className="text-2xl font-extrabold text-amber-700 mt-1">{vendors.filter(v => v.availability === 'pending').length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Cost</p>
                    <p className="text-2xl font-extrabold text-teal-600 mt-1">₹{(vendors.reduce((sum, v) => sum + v.price, 0) / 100000).toFixed(1)}L</p>
                </div>
            </div>

            {/* Vendor Cards */}
            <div className="space-y-4">
                {vendors.map((vendor) => {
                    const badge = getAvailabilityBadge(vendor.availability);
                    const BadgeIcon = badge.icon;
                    return (
                        <div key={vendor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Vendor Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md
                                            ${vendor.color === 'blue' ? 'bg-blue-500' : vendor.color === 'orange' ? 'bg-orange-500' : 'bg-purple-500'}`}>
                                            {vendor.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-extrabold text-gray-900 text-lg">{vendor.name}</h4>
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg} ${badge.text}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-gray-500">{vendor.category}</span>
                                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {vendor.contact}</span>
                                                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {vendor.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Quoted Price</p>
                                        <p className="text-xl font-extrabold text-gray-900">₹{(vendor.price / 1000).toFixed(0)}k</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 shrink-0">
                                        {vendor.availability === 'unavailable' && (
                                            <button
                                                onClick={() => setShowAlternatives(showAlternatives === vendor.id ? null : vendor.id)}
                                                className="px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-100 border border-amber-200 flex items-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" /> Find Alternatives
                                            </button>
                                        )}
                                        {vendor.availability === 'pending' && (
                                            <button disabled className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold flex items-center gap-2 cursor-wait">
                                                <Clock className="w-4 h-4 animate-spin" /> Checking...
                                            </button>
                                        )}
                                        {vendor.availability !== 'available' && vendor.availability !== 'pending' && (
                                            <button
                                                onClick={() => handleCheckAvailability(vendor.id)}
                                                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" /> Check Availability
                                            </button>
                                        )}
                                        {vendor.availability === 'available' && vendor.status !== 'Confirmed' && (
                                            <button
                                                onClick={() => handleConfirmVendor(vendor.id)}
                                                className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Confirm
                                            </button>
                                        )}
                                        {vendor.status === 'Confirmed' && (
                                            <span className="px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Confirmed
                                            </span>
                                        )}
                                        <button
                                            onClick={() => toast.success("Contract downloaded")}
                                            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <FileCheck className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toast.success("Opening vendor chat...")}
                                            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Alternatives Panel */}
                            {showAlternatives === vendor.id && alternatives[vendor.category] && (
                                <div className="border-t border-gray-100 bg-amber-50/30 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 text-amber-600" /> Alternative {vendor.category} Vendors
                                        </h4>
                                        <button onClick={() => toast.success(`Alternatives sent to client for ${vendor.category}`)} className="text-sm font-bold text-teal-600 hover:underline flex items-center gap-1">
                                            <Send className="w-3.5 h-3.5" /> Send Options to Client
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {alternatives[vendor.category].map((alt) => (
                                            <div key={alt.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center font-bold text-sm">
                                                        {alt.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{alt.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Star className="w-3 h-3 text-amber-400" /> {alt.rating}
                                                            <span className="text-green-600 font-bold">Available</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="font-extrabold text-gray-900">₹{(alt.price / 1000).toFixed(0)}k</p>
                                                    <button
                                                        onClick={() => handleReplaceVendor(vendor.id, alt)}
                                                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        Select
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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

const FinancialsTab = ({ event }) => {
    const vendorCosts = [
        { vendor: "The Grand Hall", service: "Venue & Infrastructure", price: 500000, status: "Paid", icon: "GH", color: "bg-purple-500" },
        { vendor: "Gourmet Bites", service: "Catering & Buffet", price: 250000, status: "Paid", icon: "GB", color: "bg-blue-500" },
        { vendor: "Crystal Clear AV", service: "Audio/Visual Setup", price: 180000, status: "Pending", icon: "CC", color: "bg-orange-500" },
        { vendor: "Lens Focus", service: "Photography & Video", price: 75000, status: "Negotiating", icon: "LF", color: "bg-blue-500" },
        { vendor: "Staff & Logistics", service: "Event coordination team", price: 120000, status: "Paid", icon: "SL", color: "bg-teal-500" },
        { vendor: "Marketing & PR", service: "Promotions & design", price: 95000, status: "Pending", icon: "MP", color: "bg-pink-500" },
    ];

    const totalCost = vendorCosts.reduce((sum, v) => sum + v.price, 0);
    const markup = 0.18;
    const clientPrice = Math.round(totalCost * (1 + markup));
    const profit = clientPrice - totalCost;
    const paidAmount = vendorCosts.filter(v => v.status === 'Paid').reduce((sum, v) => sum + v.price, 0);

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Vendor Cost" value={`₹${(totalCost / 100000).toFixed(1)}L`} color="blue" icon={DollarSign} />
                <StatCard label="Client Quote" value={`₹${(clientPrice / 100000).toFixed(1)}L`} color="green" icon={TrendingUp} subtext={`${(markup * 100).toFixed(0)}% markup`} />
                <StatCard label="Projected Profit" value={`₹${(profit / 1000).toFixed(0)}k`} color="teal" icon={TrendingUp} trend={18} />
                <StatCard label="Outstanding" value={`₹${((totalCost - paidAmount) / 1000).toFixed(0)}k`} color="rose" icon={AlertCircle} subtext={`${vendorCosts.filter(v => v.status !== 'Paid').length} vendors unpaid`} />
            </div>

            {/* Per-Vendor Cost Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Vendor Cost Breakdown</h3>
                        <p className="text-sm text-gray-500 mt-1">Per-vendor pricing and payment status</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => toast.success("Downloading invoice PDF...")} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <button onClick={() => toast.success("Quote sent to client!")} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                            <Send className="w-4 h-4" /> Send Quote to Client
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Quoted Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vendorCosts.map((item, i) => (
                                <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${item.color} text-white font-bold text-xs flex items-center justify-center shadow-sm`}>{item.icon}</div>
                                            <span className="font-bold text-gray-900 text-sm">{item.vendor}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.service}</td>
                                    <td className="px-6 py-4 text-right font-extrabold text-gray-900">₹{(item.price / 1000).toFixed(0)}k</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold
                                            ${item.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                    'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                            {item.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => toast.success(`Invoice for ${item.vendor} downloaded`)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-gray-900 text-white">
                                <td className="px-6 py-4 font-bold" colSpan={2}>Total Event Cost</td>
                                <td className="px-6 py-4 text-right font-extrabold text-lg">₹{(totalCost / 100000).toFixed(1)}L</td>
                                <td colSpan={2}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Client Quote + Profit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Client Quote */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Client Quote Breakdown</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">Vendor Costs</span>
                            <span className="font-bold text-gray-900">₹{(totalCost / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">Management Fee ({(markup * 100).toFixed(0)}%)</span>
                            <span className="font-bold text-gray-900">₹{((clientPrice - totalCost) / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-teal-50 px-4 -mx-4 rounded-xl">
                            <span className="font-bold text-teal-700">Client Total</span>
                            <span className="text-xl font-extrabold text-teal-700">₹{(clientPrice / 100000).toFixed(1)}L</span>
                        </div>
                    </div>
                </div>

                {/* Profit Estimate */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-gray-400 mb-1 uppercase tracking-wide text-xs">Net Profit Estimate</h3>
                        <p className="text-4xl font-extrabold text-white mb-4">₹{(profit / 1000).toFixed(0)}k</p>
                        <div className="mb-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Payment Collected</span>
                                <span className="font-bold text-green-400">₹{(paidAmount / 1000).toFixed(0)}k / ₹{(totalCost / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(paidAmount / totalCost * 100).toFixed(0)}%` }}></div>
                            </div>
                        </div>
                        <button onClick={() => toast.success("Downloading Financial Report PDF...")} className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" /> Download Financial Report
                        </button>
                    </div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

const ChatTab = () => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, sender: "Sarah Jenkins", role: "Team", time: "10:30 AM", text: "Hey everyone, catering menu is confirmed with Gourmet Bites! 🍔", channel: 'general', badge: 'bg-green-100 text-green-700' },
        { id: 2, sender: "Rajesh C.", role: "Client", time: "10:45 AM", text: "Great to hear! Can we also add a dessert counter?", channel: 'general', badge: 'bg-amber-100 text-amber-700' },
        { id: 3, sender: "You", role: "Manager", time: "10:48 AM", text: "Absolutely, I'll get a quote from the caterer.", channel: 'general', badge: 'bg-teal-100 text-teal-700' },
        { id: 4, sender: "Sarah Jenkins", role: "Team", time: "11:00 AM", text: "Heads up — Lens Focus photography cancelled. Do we go with SnapPro Studio or Golden Hour Films?", channel: 'internal', badge: 'bg-green-100 text-green-700' },
        { id: 5, sender: "Mike Ross", role: "Team", time: "11:05 AM", text: "SnapPro has better availability. Let's go with them.", channel: 'internal', badge: 'bg-green-100 text-green-700' },
        { id: 6, sender: "You", role: "Manager", time: "11:10 AM", text: "Hi Rajesh, we have 2 photographer options for you. I'll send details shortly.", channel: 'client', badge: 'bg-teal-100 text-teal-700' },
        { id: 7, sender: "Rajesh C.", role: "Client", time: "11:20 AM", text: "Sounds good, please share pricing too.", channel: 'client', badge: 'bg-amber-100 text-amber-700' },
        { id: 8, sender: "Gourmet Bites", role: "Vendor", time: "09:00 AM", text: "Dessert counter quote: ₹35,000 for 200 portions. Menu attached.", channel: 'vendors', badge: 'bg-blue-100 text-blue-700' },
        { id: 9, sender: "Crystal Clear AV", role: "Vendor", time: "09:15 AM", text: "AV setup confirmed for Oct 24. Need access by 6 AM.", channel: 'vendors', badge: 'bg-blue-100 text-blue-700' },
    ]);

    const channels = [
        { id: 'general', name: 'General', icon: Hash, desc: 'Everyone', unread: 0 },
        { id: 'internal', name: 'Internal Team', icon: ShieldCheck, desc: 'Private', unread: 2 },
        { id: 'client', name: 'Client', icon: Star, desc: 'Direct', unread: 1 },
        { id: 'vendors', name: 'Vendors', icon: Briefcase, desc: 'All vendors', unread: 2 },
    ];

    const participants = [
        { name: "You", role: "Manager", type: "team", online: true },
        { name: "Sarah Jenkins", role: "Lead Planner", type: "team", online: true },
        { name: "Mike Ross", role: "Logistics", type: "team", online: false },
        { name: "Jessica T.", role: "Marketing", type: "team", online: true },
        { name: "Rajesh C.", role: "Client • CEO", type: "client", online: true },
        { name: "Gourmet Bites", role: "Catering", type: "vendor", online: false },
        { name: "Crystal Clear AV", role: "Audio/Visual", type: "vendor", online: true },
        { name: "Admin", role: "Okkazo Admin", type: "admin", online: true },
    ];

    const typeColors = { team: 'bg-green-500', client: 'bg-amber-500', vendor: 'bg-blue-500', admin: 'bg-rose-500' };

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, {
            id: messages.length + 1, sender: "You", role: "Manager",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: input, channel: activeChannel, badge: 'bg-teal-100 text-teal-700'
        }]);
        setInput('');
        toast.success("Message sent to #" + channels.find(c => c.id === activeChannel).name);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[640px]">
            {/* Channel Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-sm">Channels</h3>
                </div>
                <div className="p-2 space-y-1 flex-1">
                    {channels.map(channel => {
                        const Icon = channel.icon;
                        return (
                            <button key={channel.id} onClick={() => setActiveChannel(channel.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeChannel === channel.id ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <span className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 opacity-60" />
                                    <div className="text-left">
                                        <p className="text-sm font-bold">{channel.name}</p>
                                        <p className="text-[10px] font-medium opacity-60">{channel.desc}</p>
                                    </div>
                                </span>
                                {channel.unread > 0 && <span className="bg-teal-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{channel.unread}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-teal-600" />
                            {channels.find(c => c.id === activeChannel).name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">{channels.find(c => c.id === activeChannel).desc}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Users className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                    {messages.filter(m => m.channel === activeChannel).map((msg) => {
                        const isMe = msg.sender === 'You';
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {isMe ? 'ME' : msg.sender.substring(0, 2).toUpperCase()}
                                </div>
                                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-900">{msg.sender}</span>
                                        {!isMe && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${msg.badge}`}>{msg.role}</span>}
                                        <span className="text-[10px] text-gray-400">{msg.time}</span>
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${isMe ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                        <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><Paperclip className="w-5 h-5" /></button>
                        <div className="flex-1 relative">
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={`Message #${channels.find(c => c.id === activeChannel).name}...`}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"><Smile className="w-4 h-4" /></button>
                        </div>
                        <button onClick={handleSend} disabled={!input.trim()} className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-teal-900/20"><Send className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            {/* Participants */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-sm">Participants</h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">{participants.length} members</p>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-1">
                    {participants.map((p, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="relative">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-600">{p.name.substring(0, 2).toUpperCase()}</div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${p.online ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                                <div className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${typeColors[p.type]}`}></span>
                                    <p className="text-[10px] text-gray-500 font-medium truncate">{p.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ToDoTab = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: "Confirm venue booking", priority: "high", assignee: "Sarah Jenkins", due: "Oct 15", done: true },
        { id: 2, text: "Verify all vendor availability", priority: "high", assignee: "You", due: "Oct 16", done: true },
        { id: 3, text: "Send vendor alternatives to client", priority: "high", assignee: "You", due: "Oct 17", done: false },
        { id: 4, text: "Finalize catering menu", priority: "medium", assignee: "Sarah Jenkins", due: "Oct 18", done: false },
        { id: 5, text: "Confirm AV setup requirements", priority: "medium", assignee: "Mike Ross", due: "Oct 19", done: false },
        { id: 6, text: "Send final schedule to client", priority: "medium", assignee: "You", due: "Oct 20", done: false },
        { id: 7, text: "Collect pending vendor payments", priority: "low", assignee: "Jessica T.", due: "Oct 21", done: false },
        { id: 8, text: "Final walkthrough with venue", priority: "high", assignee: "Sarah Jenkins", due: "Oct 23", done: false },
    ]);
    const [newTask, setNewTask] = useState('');

    const doneCount = tasks.filter(t => t.done).length;
    const progress = Math.round((doneCount / tasks.length) * 100);
    const priorityColors = { high: 'bg-red-50 text-red-700 border-red-200', medium: 'bg-amber-50 text-amber-700 border-amber-200', low: 'bg-blue-50 text-blue-700 border-blue-200' };

    const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, priority: 'medium', assignee: 'You', due: 'TBD', done: false }]);
        setNewTask('');
        toast.success("Task added!");
    };

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Event Tasks</h3>
                        <p className="text-sm text-gray-500">{doneCount} of {tasks.length} tasks completed</p>
                    </div>
                    <span className="text-3xl font-extrabold text-teal-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-teal-500 h-3 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.4)] transition-all" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Add Task */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex gap-3">
                    <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder="Add a new task..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                    <button onClick={addTask} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 text-sm">Active Tasks ({tasks.filter(t => !t.done).length})</h4>
                </div>
                <div className="divide-y divide-gray-50">
                    {tasks.filter(t => !t.done).map(task => (
                        <div key={task.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                            <button onClick={() => toggleTask(task.id)} className="w-5 h-5 rounded-md border-2 border-gray-300 hover:border-teal-500 transition-colors shrink-0 flex items-center justify-center"></button>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm">{task.text}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColors[task.priority]}`}>{task.priority.toUpperCase()}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {task.assignee}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.due}</span>
                                </div>
                            </div>
                            <button onClick={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); toast.success("Task removed"); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completed Tasks */}
            {doneCount > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-green-50/50">
                        <h4 className="font-bold text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Completed ({doneCount})</h4>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {tasks.filter(t => t.done).map(task => (
                            <div key={task.id} className="flex items-center gap-4 px-6 py-3 opacity-60 hover:opacity-80 transition-opacity group">
                                <button onClick={() => toggleTask(task.id)} className="w-5 h-5 rounded-md bg-teal-500 text-white shrink-0 flex items-center justify-center"><Check className="w-3 h-3" /></button>
                                <p className="font-bold text-gray-500 text-sm line-through flex-1">{task.text}</p>
                                <span className="text-xs text-gray-400">{task.assignee}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const DocumentsTab = () => {
    const documents = [
        { id: 1, name: "Vendor_Contract_GourmetBites.pdf", type: "Contract", size: "2.4 MB", uploadedBy: "Sarah Jenkins", date: "Oct 10", shared: true, icon: FileText },
        { id: 2, name: "VenueFloorPlan_GrandHall.pdf", type: "Floor Plan", size: "5.1 MB", uploadedBy: "Elena Gilbert", date: "Oct 8", shared: true, icon: MapPin },
        { id: 3, name: "Invoice_CrystalClearAV.pdf", type: "Invoice", size: "1.2 MB", uploadedBy: "Mike Ross", date: "Oct 12", shared: false, icon: DollarSign },
        { id: 4, name: "EventSchedule_v3.xlsx", type: "Schedule", size: "890 KB", uploadedBy: "You", date: "Oct 14", shared: true, icon: Calendar },
        { id: 5, name: "Photography_Contract_LensFocus.pdf", type: "Contract", size: "1.8 MB", uploadedBy: "Sarah Jenkins", date: "Oct 9", shared: false, icon: FileText },
        { id: 6, name: "CityPermit_Oct24.pdf", type: "Permit", size: "420 KB", uploadedBy: "Mike Ross", date: "Oct 11", shared: false, icon: ShieldCheck },
    ];

    const categories = ['All', 'Contract', 'Invoice', 'Floor Plan', 'Schedule', 'Permit'];
    const [activeCategory, setActiveCategory] = useState('All');
    const filtered = activeCategory === 'All' ? documents : documents.filter(d => d.type === activeCategory);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Event Documents</h3>
                    <p className="text-sm text-gray-500 mt-1">Contracts, invoices, floor plans, and shared files</p>
                </div>
                <button onClick={() => toast.success("Upload dialog opened!")} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload File
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeCategory === cat ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* File List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {filtered.map((doc) => {
                        const Icon = doc.icon;
                        return (
                            <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{doc.name}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{doc.type}</span>
                                        <span>{doc.size}</span>
                                        <span>by {doc.uploadedBy}</span>
                                        <span>{doc.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button onClick={() => toast.success(doc.shared ? "Link unshared with client" : "Shared with client!")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${doc.shared ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-teal-300'}`}>
                                        {doc.shared ? '✓ Shared' : 'Share'}
                                    </button>
                                    <button onClick={() => toast.success(`Downloading ${doc.name}...`)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => toast.success("Preview opened")} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ManagerEventDetails;
