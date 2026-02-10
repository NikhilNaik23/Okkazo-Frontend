import React, { useState } from 'react';
import {
    FileText, Download, Calendar, Filter, BarChart2, TrendingUp, DollarSign,
    Folder, Grid, List, Search, MoreVertical, Clock, HardDrive, Share2, Plus,
    X, ChevronDown, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManagerReports = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    // Enhanced Mock Data
    const reports = [
        { id: 1, title: 'Oct 2023 Financial Summary', type: 'Finance', category: 'finance', size: '2.4 MB', date: 'Oct 31, 2023', icon: DollarSign, color: 'emerald' },
        { id: 2, title: 'Epicurean Catering - Q3 Review', type: 'Vendor', category: 'vendor', size: '4.1 MB', date: 'Oct 15, 2023', icon: BarChart2, color: 'blue' },
        { id: 3, title: 'Alpha Conf 2023 - Post Mortem', type: 'Event', category: 'event', size: '8.5 MB', date: 'Oct 10, 2023', icon: FileText, color: 'purple' },
        { id: 4, title: 'Guest Feedback - Sep 2023', type: 'Feedback', category: 'feedback', size: '1.2 MB', date: 'Sep 30, 2023', icon: TrendingUp, color: 'rose' },
        { id: 5, title: 'Sep 2023 P&L Statement', type: 'Finance', category: 'finance', size: '2.3 MB', date: 'Sep 30, 2023', icon: DollarSign, color: 'emerald' },
        { id: 6, title: 'Stellar Decors - SLA Report', type: 'Vendor', category: 'vendor', size: '12 MB', date: 'Sep 15, 2023', icon: FileText, color: 'amber' },
        { id: 7, title: 'Tech Summit - Attendance Log', type: 'Event', category: 'event', size: '3.4 MB', date: 'Sep 10, 2023', icon: UsersIcon, color: 'purple' },
        { id: 8, title: 'Q3 NPS Score Analysis', type: 'Feedback', category: 'feedback', size: '1.8 MB', date: 'Sep 01, 2023', icon: TrendingUp, color: 'rose' },
    ];

    const stats = [
        { label: "Total Reports", val: "142", icon: FileText },
        { label: "Storage Used", val: "4.2 GB", icon: HardDrive },
        { label: "Downloads", val: "891", icon: Download },
    ];

    const filteredReports = activeFilter === 'all'
        ? reports
        : reports.filter(r => r.category === activeFilter);

    return (
        <div className="p-6 lg:p-8 max-w-[1920px] mx-auto min-h-screen bg-gray-50/30">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Report Library</h1>
                    <p className="text-gray-500 font-medium">Access detailed insights for Events, Vendors, and Financials.</p>
                </div>
                <button
                    onClick={() => setShowGenerateModal(true)}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/20 flex items-center gap-2 transition-transform hover:scale-105"
                >
                    <Plus className="w-4 h-4" /> Generate New Report
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-gray-900">{stat.val}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-gray-100/50 rounded-xl overflow-x-auto max-w-full">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'finance', label: 'Finance' },
                        { id: 'event', label: 'Events' },
                        { id: 'vendor', label: 'Vendors' },
                        { id: 'feedback', label: 'Feedback' },
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeFilter === filter.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search report name..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-teal-500 transition-colors" />
                    </div>
                    <div className="flex items-center border-l border-gray-200 pl-3 gap-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredReports.map((report) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-teal-100 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="p-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${report.color}-50 text-${report.color}-600 group-hover:scale-110 transition-transform`}>
                                    <report.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{report.title}</h3>
                                <p className="text-sm font-medium text-gray-400">{report.size} • {report.type}</p>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 group-hover:bg-white transition-colors">
                                <span className="text-xs font-bold text-gray-400">{report.date}</span>
                                <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform flex justify-center gap-3">
                                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2">
                                    <Download className="w-3 h-3" /> Download
                                </button>
                                <button className="px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50">
                                    <Share2 className="w-3 h-3" /> Share
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50 transition-all group min-h-[200px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-teal-100 group-hover:scale-110 transition-all">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-bold">Create Custom Report</span>
                    </button>
                </div>
            )}

            {/* Generate Report Modal */}
            <AnimatePresence>
                {showGenerateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-extrabold text-gray-900">Generate New Report</h2>
                                <button onClick={() => setShowGenerateModal(false)} className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-900 shadow-sm"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Report Category</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Event Report', 'Vendor Performance', 'Feedback Analysis', 'Financial Summary'].map((type) => (
                                            <button key={type} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-left text-sm font-bold text-gray-700 hover:border-teal-500 hover:ring-1 hover:ring-teal-500 transition-all focus:border-teal-600 focus:bg-teal-50">
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Date Range</label>
                                    <button className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left text-sm font-medium flex justify-between items-center text-gray-700">
                                        <span>Last 30 Days</span>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Includes</label>
                                    <div className="space-y-2">
                                        {['Detailed Analytics', 'Raw Data CSV', 'Executive Summary'].map((opt) => (
                                            <div key={opt} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-white bg-teal-600 border-teal-600">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 flex justify-end gap-3">
                                <button onClick={() => setShowGenerateModal(false)} className="px-6 py-3 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button onClick={() => setShowGenerateModal(false)} className="px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 flex items-center gap-2 shadow-lg">
                                    <Download className="w-4 h-4" /> Generate & Download
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Icon Helper
const UsersIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

export default ManagerReports;
