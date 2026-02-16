import React from 'react';
import { motion } from 'framer-motion';
import { BsStarFill, BsCheck, BsArrowRight } from 'react-icons/bs';
import { formatPrice } from '../../../../data/vendorSelectionData';

const VendorCard = ({ vendor, isSelected, onSelect, onViewDetails, priceMultiplier = 1 }) => {
    // Generate Range Price
    const priceMin = (vendor.priceMin || 0) * priceMultiplier;
    const priceMax = (vendor.priceMax || Math.round((vendor.priceMin || 0) * 1.5)) * priceMultiplier;

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
                <span className="text-[9px] font-bold tracking-[0.25em] text-gray-400 uppercase mb-3 block">
                    {vendor.location}
                </span>

                <h3 className="text-2xl font-serif-premium italic text-primary leading-tight mb-2 group-hover:text-secondary transition-colors">
                    {vendor.name}
                </h3>

                <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">Estimated Range</span>
                        <span className="text-sm font-bold text-primary">
                            {formatPrice(priceMin)} - {formatPrice(priceMax)}
                        </span>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-3 mt-6">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails();
                        }}
                        className="flex-1 py-3 px-6 bg-surface hover:bg-gray-200 text-primary text-[10px] font-black uppercase tracking-widest rounded-full transition-colors truncate"
                    >
                        Explore
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border
                        ${isSelected
                                ? 'bg-secondary border-secondary text-white'
                                : 'bg-white border-gray-200 text-primary hover:border-primary hover:text-secondary'}`}
                    >
                        {isSelected ? <BsCheck size={20} /> : <BsArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default VendorCard;
