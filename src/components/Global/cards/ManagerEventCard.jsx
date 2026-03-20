import React from 'react';
import { Calendar, MapPin, ArrowUpRight, MoreVertical, Users, TrendingUp, Edit, Copy, Archive } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const ManagerEventCard = ({
    image,
    status = 'Planning',
    category = 'CONFERENCE',
    payStatus = 'Paid',
    title = 'Alpha Tech Conf',
    date = 'Oct 24, 2023',
    time = '09:00 AM',
    location = 'San Francisco, CA',
    revenueData = null, // Optional: Only show if revenue matches
    metricLabel = "Ticket Sales", // Generic Label
    metricValue = 0,
    metricTotal = 0,
    team = [],
    onManage,
    onEdit,
    onClone
}) => {
    // varied status colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'Planning': return 'bg-teal-500/90 text-white backdrop-blur-md';
            case 'Finalizing': return 'bg-amber-500/90 text-white backdrop-blur-md';
            case 'Live Now': return 'bg-rose-500/90 text-white backdrop-blur-md animate-pulse';
            case 'Review': return 'bg-indigo-500/90 text-white backdrop-blur-md';
            default: return 'bg-gray-500/90 text-white backdrop-blur-md';
        }
    };

    // pay status colors
    const getPayStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'Unpaid': return 'bg-red-50 text-red-700 border border-red-200';
            case 'Deposit Paid': return 'bg-orange-50 text-orange-700 border border-orange-200';
            case 'Platform Fee Paid': return 'bg-teal-50 text-teal-700 border border-teal-200';
            case 'Full Payment Paid': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            default: return 'bg-gray-50 text-gray-700 border border-gray-200';
        }
    };

    const hasMetric = metricTotal > 0;
    const progressPercentage = hasMetric ? (metricValue / metricTotal) * 100 : 0;
    const hasRevenue = revenueData && revenueData.length > 0 && revenueData.some(d => d.value > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />

                {/* Top Right Badges */}
                <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${getStatusColor(status)}`}>
                        {status}
                    </span>
                </div>

                {/* Bottom Stats Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                    <div>
                        <span className="text-white/90 text-[10px] uppercase font-bold tracking-widest bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 mb-1 inline-block">
                            {category}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight line-clamp-1 group-hover:text-teal-200 transition-colors">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Quick Actions Hover Menu */}
                <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-md rounded-lg p-1 shadow-lg flex gap-1">
                        <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-teal-600" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={onClone} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-teal-600" title="Clone">
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Meta Rows */}
                <div className="flex justify-between items-center mb-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPayStatusColor(payStatus)}`}>
                        {payStatus}
                    </span>
                    <div className="flex items-center text-gray-500 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {date}
                    </div>
                </div>

                {/* Dynamic Metric Progress Section */}
                {hasMetric ? (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
                            <span>{metricLabel}</span>
                            <span className="text-teal-600">{metricValue}/{metricTotal}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`h-full rounded-full ${progressPercentage > 100 ? 'bg-red-500' : 'bg-teal-500'}`}
                            />
                        </div>
                    </div>
                ) : (
                    /* Spacer if no metric, or maybe a description excerpt could go here */
                    <div className="mb-4 text-xs text-gray-400 italic">
                        No active metrics to track.
                    </div>
                )}

                {/* Data & Team Row */}
                <div className="grid grid-cols-2 gap-4 mb-4 mt-auto">
                    {/* Mini Sparkline (Conditional) */}
                    <div>
                        {hasRevenue ? (
                            <>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Trend
                                </p>
                                <div className="h-8 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData}>
                                            <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} fill="#99f6e4" fillOpacity={0.4} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-end">
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                                    No Financial Data
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Team Stack */}
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Team</p>
                        <div className="flex -space-x-2">
                            {team.map((avatar, idx) => (
                                <img
                                    key={idx}
                                    src={avatar}
                                    alt="Team member"
                                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                />
                            ))}
                            <button className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 hover:bg-gray-200">
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-50 mb-4" />

                {/* Footer Action */}
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onManage}
                        className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
                    >
                        Manage
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default ManagerEventCard;
