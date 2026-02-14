import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsXLg, BsEye, BsTrash, BsBookmarkHeart } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const SavedSidebar = ({ isOpen, onClose }) => {
    const [savedItems, setSavedItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSaved = () => {
            try {
                const items = JSON.parse(localStorage.getItem('saved') || '[]');
                setSavedItems(Array.isArray(items) ? items : []);
            } catch (e) {
                console.error("Failed to parse saved items", e);
                setSavedItems([]);
            }
        };

        if (isOpen) {
            fetchSaved();
            window.addEventListener('storage', fetchSaved);
            window.addEventListener('savedUpdated', fetchSaved);
            return () => {
                window.removeEventListener('storage', fetchSaved);
                window.removeEventListener('savedUpdated', fetchSaved);
            };
        }
    }, [isOpen]);

    const handleRemove = (idToRemove) => {
        const newSaved = savedItems.filter(item => item.id !== idToRemove);
        setSavedItems(newSaved);
        localStorage.setItem('saved', JSON.stringify(newSaved));
        window.dispatchEvent(new Event('savedUpdated'));
    };

    const handleView = (id) => {
        onClose();
        navigate(`/user/event/${id}`);
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
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#EBF4F6] shadow-2xl z-[160] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#09637E]/10 flex items-center justify-between bg-[#EBF4F6] relative z-10">
                            <div>
                                <h2 className="text-2xl font-serif-premium text-[#09637E] italic">Saved Collection</h2>
                                <p className="text-[10px] uppercase tracking-widest text-[#09637E]/60 mt-1">Your Curated Inspirations</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#09637E]/40 hover:bg-[#09637E] hover:text-white transition-all shadow-sm"
                            >
                                <BsXLg size={14} />
                            </button>
                        </div>

                        {/* Saved Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {savedItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-6">
                                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#09637E] shadow-inner">
                                        <BsBookmarkHeart size={40} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#09637E] uppercase tracking-widest text-sm mb-2">Collection Empty</p>
                                        <p className="text-xs text-[#09637E]/60 max-w-[200px] mx-auto">Explore events and save your favorites to view them here.</p>
                                    </div>
                                </div>
                            ) : (
                                savedItems.map((item, idx) => (
                                    <motion.div
                                        key={`${item.id}-${idx}`}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-white p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-[#09637E]/10"
                                    >
                                        <div className="flex gap-4">
                                            {/* Image */}
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative shadow-inner">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[#09637E]/40 text-xs font-bold uppercase">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                <div>
                                                    <h3 className="font-serif-premium text-[#0b2d49] truncate pr-2 text-lg leading-tight mb-1">{item.title || "Unknown Event"}</h3>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#09637E]/60 mb-0.5">{item.date || "Date TBD"}</p>
                                                    <p className="text-[10px] font-medium text-[#09637E]/40 truncate">{item.location || "Location TBD"}</p>
                                                </div>

                                                <div className="flex items-center justify-end gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleRemove(item.id)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                        title="Remove from collection"
                                                    >
                                                        <BsTrash size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleView(item.id)}
                                                        className="px-4 py-2 rounded-full bg-[#09637E] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#074d63] transition-colors flex items-center gap-2 shadow-lg shadow-[#09637E]/20"
                                                    >
                                                        View <BsEye size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SavedSidebar;
