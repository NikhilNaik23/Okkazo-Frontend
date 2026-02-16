import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Edit, FileText, Users, Briefcase, MessageSquare,
    ListTodo, CalendarDays, DollarSign, FolderOpen, Share2, Printer, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

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

// Data
import { mockEvent, tabs as tabsData } from '../../../data/managerEventDetailsData';

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

    // Event data
    const event = { ...mockEvent, id: id || mockEvent.id };

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

    const tabs = tabsData.map(tab => ({
        ...tab,
        icon: iconMap[tab.icon]
    }));

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

export default ManagerEventDetails;
