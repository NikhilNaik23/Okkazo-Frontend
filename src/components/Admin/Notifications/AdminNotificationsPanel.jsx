import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsCheck2All, BsX } from "react-icons/bs";
import { vendorNotificationsData } from "../../../data/vendorNotificationsData";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const AdminNotificationsPanel = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState(vendorNotificationsData);
    const [isLoading, setIsLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);

    const allPastItems = [...notifications.earlier, ...notifications.promotions];
    const filteredNew = notifications.new;
    const filteredPast = allPastItems;

    const handleMarkAllRead = () => {
        const updatedNew = notifications.new.map(n => ({
            ...n,
            unread: false
        }));

        setNotifications(prev => ({
            ...prev,
            new: updatedNew
        }));

        toast.success("All notifications marked as read");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] overflow-hidden">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                />

                {/* Slider Panel */}
                <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-screen max-w-md"
                    >
                        <div className="h-full flex flex-col bg-white shadow-2xl relative">
                            {/* Header */}
                            <div className="px-6 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-2xl font-black text-[#0b2d49]">Notifications</h2>
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-gray-400 hover:text-[#0b2d49] hover:bg-gray-100 rounded-lg transition-all"
                                    >
                                        <BsX size={24} />
                                    </button>
                                </div>
                                <p className="text-xs font-bold text-[#5a5b44] uppercase tracking-widest">Alerts & Updates</p>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                                <div className="space-y-8">
                                    {/* New Notifications */}
                                    {filteredNew.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className="text-[10px] font-black text-[#0b2d49]/30 uppercase tracking-widest whitespace-nowrap">New</span>
                                                <div className="w-full h-[1px] bg-[#0b2d49]/5"></div>
                                            </div>
                                            <div className="space-y-3">
                                                {filteredNew.map((n) => (
                                                    <div 
                                                        key={n.id} 
                                                        className="bg-gray-50/50 hover:bg-white border border-gray-100 p-4 rounded-xl transition-all cursor-pointer group relative"
                                                    >
                                                        {n.unread && <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                                                        <div className="flex gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.bgColor} text-lg shadow-sm border border-black/5`}>
                                                                {n.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-sm text-[#0b2d49] mb-1">{n.title}</h4>
                                                                <p className="text-xs text-[#708aa0] leading-relaxed line-clamp-2">{n.message}</p>
                                                                <span className="text-[10px] font-bold text-[#708aa0]/60 uppercase tracking-tighter mt-2 inline-block">{n.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Earlier Notifications */}
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-[10px] font-black text-[#0b2d49]/30 uppercase tracking-widest whitespace-nowrap">Earlier</span>
                                            <div className="w-full h-[1px] bg-[#0b2d49]/5"></div>
                                        </div>
                                        <div className="space-y-3">
                                            {filteredPast.slice(0, visibleCount).map((n) => (
                                                <div 
                                                    key={n.id} 
                                                    className="p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer flex gap-4"
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.bgColor} opacity-60 text-lg`}>
                                                        {n.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-sm text-[#0b2d49] mb-1">{n.title}</h4>
                                                        <p className="text-xs text-[#5a5b44]/80 leading-relaxed">{n.message}</p>
                                                        <span className="text-[10px] font-bold text-[#5a5b44]/40 uppercase tracking-tighter mt-2 inline-block">{n.time}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0b2d49] hover:bg-gray-50 transition-all"
                                >
                                    <BsCheck2All size={16} />
                                    Mark all read
                                </button>
                                <Link
                                    to="/admin/notifications"
                                    onClick={onClose}
                                    className="px-4 py-3 bg-[#0b2d49] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1a3b55] transition-all shadow-lg shadow-[#0b2d49]/10 flex items-center justify-center text-center"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default AdminNotificationsPanel;
