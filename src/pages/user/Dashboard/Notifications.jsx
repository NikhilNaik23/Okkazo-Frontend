import React, { useState, useEffect } from "react";
import { BsCheck2All } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import useNotificationFeed from "../../../hooks/useNotificationFeed";

const Notifications = () => {
    const { grouped, status, markAllRead } = useNotificationFeed();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    const allPastItems = [...grouped.earlier, ...grouped.promotions];

    // Filter items based on search query
    const filteredNew = grouped.new.filter(n =>
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

    const handleMarkAllRead = async () => {
        await markAllRead();
        toast.success("All notifications marked as read");
    };

    const hasMore = visibleCount < filteredPast.length;

    // Helper to get icon background style based on type (using the existing bgColor prop or deriving one)
    const getIconStyle = (n) => {
        // We can use the pre-defined n.bgColor or customize further here
        return n.bgColor || "bg-gray-100";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#EBF4F6] via-[#EBF4F6] to-[#C9E5E8] flex flex-col font-sans text-[#0b2d49] pt-40">
            <main className="flex-1 max-w-4xl mx-auto w-full px-6 pb-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-serif-premium text-[#09637E] mb-4 italic">Notifications</h1>
                    <div className="flex items-center justify-center gap-4 text-sm font-medium text-[#09637E]/60">
                        <span className="uppercase tracking-widest text-[10px]">Your journey, curated</span>
                        <span className="w-8 h-[1px] bg-[#09637E]/20"></span>
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[#09637E] hover:text-[#088395] font-bold text-[10px] uppercase tracking-widest transition-colors hover:underline flex items-center gap-2"
                        >
                            <BsCheck2All size={14} />
                            Mark all as read
                        </button>
                    </div>
                </div>

                <div className="space-y-16">
                    {status === 'loading' && filteredNew.length === 0 && filteredPast.length === 0 && (
                        <div className="text-center py-16 text-[#09637E]/60 font-semibold">Loading notifications...</div>
                    )}

                    {/* Recent Intentions (New) */}
                    {filteredNew.length > 0 && (
                        <div className="relative">
                            <div className="flex items-center justify-center mb-8">
                                <h2 className="text-[10px] font-black text-[#09637E]/40 uppercase tracking-[0.3em] bg-transparent z-10 px-4">Recent Intentions</h2>
                                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#09637E]/10 to-transparent top-1/2 -z-0"></div>
                            </div>

                            <div className="space-y-6">
                                {filteredNew.map((n) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={n.id}
                                        className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-white/50 flex flex-col md:flex-row gap-6 relative overflow-hidden group cursor-pointer"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${n.bgColor} text-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                            {n.icon}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-serif-premium text-xl text-[#09637E]">{n.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-[#09637E]/40 uppercase tracking-widest">{n.time}</span>
                                                    {n.unread && (
                                                        <motion.span
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="w-2 h-2 rounded-full bg-[#09637E]"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-[#09637E]/70 font-light leading-relaxed max-w-2xl">{n.message}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Moments (Earlier + Promotions) */}
                    {(filteredPast.length > 0) && (
                        <div className="relative">
                            <div className="flex items-center justify-center mb-8">
                                <h2 className="text-[10px] font-black text-[#09637E]/40 uppercase tracking-[0.3em] bg-transparent z-10 px-4">Past Moments</h2>
                                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#09637E]/10 to-transparent top-1/2 -z-0"></div>
                            </div>

                            <div className="space-y-6">
                                <AnimatePresence>
                                    {filteredPast.slice(0, visibleCount).map((n) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            key={n.id}
                                            className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/40 flex flex-col md:flex-row gap-6 group cursor-pointer"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${n.bgColor} opacity-80 group-hover:opacity-100 transition-opacity text-xl`}>
                                                {n.icon}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-serif-premium text-lg text-[#09637E]/90">{n.title}</h3>
                                                    <span className="text-[10px] font-black text-[#09637E]/30 uppercase tracking-widest">{n.time}</span>
                                                </div>
                                                <p className="text-xs text-[#09637E]/60 font-medium leading-relaxed max-w-2xl">{n.message}</p>
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
                                        className="px-8 py-3 bg-white/50 hover:bg-white text-[#09637E] font-black rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 text-[10px] uppercase tracking-widest border border-[#09637E]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="w-3 h-3 border-2 border-[#09637E]/30 border-t-[#09637E] rounded-full animate-spin"></span>
                                                Loading...
                                            </>
                                        ) : (
                                            "Load More Notifications"
                                        )}
                                    </button>
                                </div>
                            )}

                            {!hasMore && filteredPast.length > 0 && (
                                <div className="mt-16 text-center opacity-40">
                                    <p className="font-serif-premium italic text-[#09637E]">Archives</p>
                                </div>
                            )}
                        </div>
                    )}

                    {filteredNew.length === 0 && filteredPast.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <p className="font-serif-premium text-2xl text-[#09637E]">No notifications found.</p>
                            <p className="text-sm font-medium mt-2 text-[#09637E]/60">Try adjusting your search terms.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;
