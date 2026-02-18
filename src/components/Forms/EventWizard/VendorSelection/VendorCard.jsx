import React from 'react';
import { motion } from 'framer-motion';
import { BsStarFill, BsCheck } from 'react-icons/bs';

const VendorCard = ({ vendor, isSelected, onViewDetails }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(9,99,126,0.15)]
            ${isSelected ? 'ring-2 ring-secondary shadow-lg shadow-secondary/10' : 'border border-gray-50'}`}
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] m-3 mb-0 rounded-[2rem] overflow-hidden bg-gray-100">
                <img
                    src={vendor.image}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={vendor.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <BsStarFill className="text-amber-400" size={10} />
                    <span className="text-[10px] font-bold text-primary">{vendor.rating}</span>
                </div>

                {/* Status Indicator (if selected) */}
                {isSelected && (
                    <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-white text-secondary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                            <BsCheck size={16} /> Selected
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-bold tracking-[0.25em] text-gray-400 uppercase block">
                        {vendor.location}
                    </span>
                    {vendor.capacity && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-1 rounded-md">
                            Cap: {vendor.capacity}
                        </span>
                    )}
                </div>

                <h3 className="text-2xl font-serif-premium italic text-primary leading-tight mb-6 group-hover:text-secondary transition-colors">
                    {vendor.name}
                </h3>

                {/* Explore Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails();
                    }}
                    className="w-full py-4 bg-surface hover:bg-primary hover:text-white text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all mt-auto"
                >
                    Explore
                </button>
            </div>
        </motion.div>
    );
};

export default VendorCard;
