import React, { useState, useEffect } from "react";
import { BsCheck2All, BsTicketPerforated, BsChatLeftText, BsArrowRepeat, BsStar, BsStars, BsClock } from "react-icons/bs";
import { vendorNotificationsData } from "../../data/vendorNotificationsData";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const VendorNotifications = () => {
    // Initial State from data
    const [notifications, setNotifications] = useState(vendorNotificationsData);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    // Merge earlier and promotions for the "Past Moments" timeline
    const allPastItems = [...notifications.earlier, ...notifications.promotions];

    // Filter items based on search query
    const filteredNew = notifications.new.filter(n =>
        n.title.toLowerCase().includes(searchQuery) ||
        n.message.toLowerCase().includes(searchQuery)
    );

    const filteredPast = allPastItems.filter(n =>
        n.title.toLowerCase().includes(searchQuery) ||
        n.message.toLowerCase().includes(searchQuery)
    );

    // State for pagination
    const [visibleCount, setVisibleCount] = useState(3);
    const [isLoading, setIsLoading] = useState(false);

    // Reset pagination when search changes
    useEffect(() => {
        setVisibleCount(3);
    }, [searchQuery]);

    const handleLoadMore = () => {
        setIsLoading(true);
        // Simulate network delay for effect
        setTimeout(() => {
            setVisibleCount(prev => prev + 3);
            setIsLoading(false);
        }, 800);
    };

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

    const hasMore = visibleCount < filteredPast.length;

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            {/* Header Section */}
            <div className="bg-white border-b border-[#708aa0]/10 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-[#0b2d49]">Notifications</h1>
                            <p className="text-sm font-bold text-[#5a5b44] mt-1">Updates and alerts for your business</p>
                        </div>
                        <button
                            onClick={handleMarkAllRead}
                            className="bg-[#0b2d49] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#0b2d49]/90 transition-all shadow-lg shadow-[#0b2d49]/20 flex items-center gap-2"
                        >
                            <BsCheck2All size={18} />
                            Mark all as read
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-10">
                <div className="space-y-12">
                    {/* Recent Intentions (New) */}
                    {filteredNew.length > 0 && (
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="text-sm font-black text-[#0b2d49]/40 uppercase tracking-widest whitespace-nowrap">Recent Alerts</h2>
                                <div className="w-full h-[1px] bg-[#0b2d49]/10"></div>
                            </div>

                            <div className="space-y-4">
                                {filteredNew.map((n) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={n.id}
                                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-[#708aa0]/10 flex flex-col md:flex-row gap-6 group cursor-pointer relative overflow-hidden"
                                    >
                                        {n.unread && <div className="absolute top-0 left-0 w-1 h-full bg-[#d7a444]"></div>}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${n.bgColor} text-xl`}>
                                            {n.icon}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-[#0b2d49]">{n.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">{n.time}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-[#708aa0] font-medium leading-relaxed max-w-3xl">{n.message}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Moments (Earlier + Promotions) */}
                    {(filteredPast.length > 0) && (
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="text-sm font-black text-[#0b2d49]/40 uppercase tracking-widest whitespace-nowrap">Past Notifications</h2>
                                <div className="w-full h-[1px] bg-[#0b2d49]/10"></div>
                            </div>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {filteredPast.slice(0, visibleCount).map((n) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.2 }}
                                            key={n.id}
                                            className="bg-white/60 hover:bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-[#708aa0]/10 flex flex-col md:flex-row gap-6 group cursor-pointer"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${n.bgColor} opacity-80 group-hover:opacity-100 transition-opacity text-xl`}>
                                                {n.icon}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg text-[#0b2d49]">{n.title}</h3>
                                                    <span className="text-[10px] font-black text-[#5a5b44] uppercase tracking-widest">{n.time}</span>
                                                </div>
                                                <p className="text-sm text-[#5a5b44] font-medium leading-relaxed max-w-3xl">{n.message}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Load More Button */}
                            {hasMore && (
                                <div className="mt-12 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                        className="px-8 py-3 bg-white hover:bg-[#e9eff1] text-[#0b2d49] font-black rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 text-[10px] uppercase tracking-widest border border-[#708aa0]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="w-3 h-3 border-2 border-[#0b2d49]/30 border-t-[#0b2d49] rounded-full animate-spin"></span>
                                                Loading...
                                            </>
                                        ) : (
                                            "Load More"
                                        )}
                                    </button>
                                </div>
                            )}

                            {!hasMore && filteredPast.length > 0 && (
                                <div className="mt-16 text-center opacity-40">
                                    <p className="font-bold text-[#0b2d49]">No more notifications</p>
                                </div>
                            )}
                        </div>
                    )}

                    {filteredNew.length === 0 && filteredPast.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <p className="font-black text-2xl text-[#0b2d49]">No notifications found.</p>
                            <p className="text-sm font-medium mt-2 text-[#708aa0]">You're all caught up!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default VendorNotifications;
