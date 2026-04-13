import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsXLg, BsCheck2All } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import useNotificationFeed from '../../../hooks/useNotificationFeed';

const NotificationSidebar = ({ isOpen, onClose }) => {
    const { grouped, markAllRead } = useNotificationFeed({ enabled: isOpen });
    const latestNotifications = (Array.isArray(grouped?.all) ? grouped.all : []).slice(0, 10);
    const notifications = {
        new: latestNotifications.filter((n) => n.unread),
        promotions: latestNotifications.filter((n) => !n.unread && n.category === 'PROMOTION'),
        earlier: latestNotifications.filter((n) => !n.unread && n.category !== 'PROMOTION'),
    };

    const handleMarkAllRead = async () => {
        await markAllRead();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[160] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                            <div>
                                <h2 className="text-2xl font-serif-premium text-[#0b2d49] italic">Notifications</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Updates & Alerts</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#EBF4F6] hover:text-[#09637E] transition-all"
                            >
                                <BsXLg size={16} />
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* NEW */}
                            {notifications.new.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">New</p>
                                    <div className="space-y-3">
                                        {notifications.new.map((n) => (
                                            <div key={`new-${n.id}`} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                                {n.unread && <div className="absolute right-3 top-3 w-2 h-2 bg-red-500 rounded-full"></div>}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-sm shadow-black/5 ${n.bgColor}`}>
                                                    {n.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-[#0b2d49] text-sm group-hover:text-[#09637E] transition-colors leading-tight mb-1">{n.title}</h3>
                                                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{n.message}</p>
                                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider mt-2">{n.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* EARLIER */}
                            {notifications.earlier.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">Earlier</p>
                                    <div className="space-y-3">
                                        {notifications.earlier.map((n) => (
                                            <div key={`earlier-${n.id}`} className="flex gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/50 opacity-70 ${n.bgColor}`}>
                                                    {n.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-[#0b2d49]/80 text-sm">{n.title}</h3>
                                                    <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-2">{n.message}</p>
                                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider mt-2">{n.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PROMOTIONS */}
                            {notifications.promotions.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">Promotions</p>
                                    <div className="space-y-3">
                                        {notifications.promotions.map((n) => (
                                            <div key={`promo-${n.id}`} className="flex gap-4 p-4 bg-gradient-to-r from-white to-[#EBF4F6]/50 rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white ${n.bgColor}`}>
                                                    {n.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-[#09637E] text-sm">{n.title}</h3>
                                                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{n.message}</p>
                                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider mt-2">{n.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                            <button
                                onClick={handleMarkAllRead}
                                className="flex-1 py-3 bg-white border border-gray-200 text-[#0b2d49] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EBF4F6] hover:text-[#09637E] hover:border-[#09637E]/20 transition-all flex items-center justify-center gap-2"
                            >
                                <BsCheck2All size={14} /> Mark all read
                            </button>
                            <Link
                                to="/user/notifications"
                                onClick={onClose}
                                className="flex-1 py-3 bg-[#09637E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#074d63] transition-all flex items-center justify-center shadow-lg shadow-[#09637E]/20"
                            >
                                View All
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationSidebar;
