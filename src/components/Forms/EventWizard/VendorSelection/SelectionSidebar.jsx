import React from 'react';
import { motion } from 'framer-motion';
import { BsHeart, BsFillCartCheckFill, BsArrowRight, BsX } from 'react-icons/bs';
import { MdLocationOn, MdRestaurant } from 'react-icons/md';

const SelectionSidebar = ({
    vendors,
    isHighDemand,
    estimatedTotal,
    estimatedMax,
    allServicesSelected,
    onRemoveVendor,
    onBack,
    onNext
}) => {
    return (
        <div className="hidden lg:flex flex-col w-[25vw] min-w-[320px] max-w-[400px] h-[calc(100vh-6rem)] sticky top-24 right-0 p-8 pl-0 pointer-events-none z-50">
            <div className="pointer-events-auto flex flex-col h-full bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-[0_20px_80px_-20px_rgba(9,99,126,0.15)] overflow-hidden relative">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] -z-10" />

                <div className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-3xl font-serif-premium italic text-primary">Selection</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Refining Luxury</p>
                        </div>
                        <button onClick={onBack} className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center text-primary/60 hover:bg-primary hover:text-white transition-all" title="Back">
                            <BsArrowRight className="rotate-180" size={16} />
                        </button>
                    </div>
                </div>

                {/* Selected Items List */}
                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                    {Object.entries(vendors).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <BsHeart size={40} className="mb-4 text-primary" />
                            <p className="text-xs font-bold uppercase tracking-widest text-primary">Your selection is empty</p>
                        </div>
                    ) : (
                        Object.entries(vendors).map(([category, vendor]) => (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 p-3 bg-white rounded-2xl shadow-sm border border-gray-50"
                            >
                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                                    <img src={vendor.image} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-primary">
                                        {category === 'Venue' ? <MdLocationOn size={10} /> : <MdRestaurant size={10} />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40 block mb-0.5">{category}</span>
                                    <h4 className="text-sm font-serif-premium font-bold text-primary truncate">{vendor.name}</h4>
                                    <span className="text-xs font-bold text-secondary">₹{(vendor.priceMin >= 1000 ? (vendor.priceMin / 1000).toFixed(0) + 'k' : vendor.priceMin)} - ₹{(vendor.priceMax ? (vendor.priceMax / 1000).toFixed(0) + 'k' : (vendor.priceMin * 1.5 / 1000).toFixed(0) + 'k')}</span>
                                </div>
                                <button
                                    onClick={() => onRemoveVendor(category)}
                                    className="w-6 h-6 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors shrink-0"
                                    title="Remove Selection"
                                >
                                    <BsX size={14} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Totals Section */}
                <div className="p-8 pt-6 bg-gradient-to-t from-white via-white to-transparent">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/5">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <BsFillCartCheckFill size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Live Status</span>
                            <span className={`text-xs font-bold ${isHighDemand ? 'text-amber-500' : 'text-primary'}`}>{isHighDemand ? 'High Demand Date' : 'Standard Date'}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-primary/20 pt-4 mb-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1">Estimated Total</span>
                            <div className="text-right">
                                <span className="text-2xl font-serif-premium text-primary">₹{(estimatedTotal).toLocaleString()}</span>
                                <span className="text-xs font-bold text-primary/40 block">- ₹{(estimatedMax).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onNext}
                        disabled={!allServicesSelected}
                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl
                        ${allServicesSelected
                                ? 'bg-primary text-white hover:bg-secondary hover:scale-[1.02] active:scale-95 shadow-primary/20'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        Finalize Reservation <BsArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectionSidebar;
