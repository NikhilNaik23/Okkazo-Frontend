import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsStars, BsX, BsTagFill, BsArrowRight } from "react-icons/bs";

const StepReview = ({ formData, onRemoveVendor }) => {
    const totalMin = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMin || 0), 0);
    const totalMax = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMax || 0), 0);

    const categories = ['Venue', 'Catering', 'Florals', 'Photography', 'Music', 'Decor'];

    return (
        <div className="w-full pb-40">
            {/* Header */}
            <div className="text-center mb-8 pt-40">
                <h1 className="text-5xl md:text-7xl font-serif-premium italic text-primary mb-6">Finalized Selections</h1>

                {/* Visual Navigation */}
                <div className="flex justify-center">
                    <span className="text-2xl font-black tracking-[0.2em] uppercase text-gray-400">
                        Overview
                    </span>
                </div>
            </div>

            {/* Event Details & Summary */}
            <div className="max-w-4xl mx-auto px-6 mb-32">
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-blue-50/50 shadow-sm relative overflow-hidden">

                    {/* Centered Title */}
                    <div className="text-center mb-12 relative z-10">
                        <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-4">Manifesting</p>
                        <h2 className="font-serif-premium text-4xl md:text-5xl text-primary">{formData.title}</h2>
                    </div>

                    {/* Event Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 border-y border-gray-100 py-12">
                        <div className="text-center md:text-left">
                            <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">Date</p>
                            <p className="font-serif-premium text-xl text-primary">{formData.date}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">Time</p>
                            <p className="font-serif-premium text-xl text-primary">{formData.startTime}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">Location</p>
                            <p className="font-serif-premium text-lg text-primary truncate" title={formData.location}>{formData.location}</p>
                        </div>
                    </div>

                    {/* Quick Vendor Summary */}
                    <div>
                        <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-6 text-center">Curated Artisans</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {Object.entries(formData.vendors).map(([service, vendor]) => (
                                <div key={service} className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{service}:</span>
                                    <span className="text-sm font-serif-premium text-primary">{vendor.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Vendor Sections */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-32">
                <AnimatePresence>
                    {Object.entries(formData.vendors).map(([service, vendor], idx) => (
                        <motion.div
                            key={service}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-center`}
                        >
                            {/* Visual Side */}
                            <div className="w-full md:w-1/2 relative group">
                                {/* "Reservea" branding removed */}
                                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-700" />
                                    <img
                                        src={vendor.image}
                                        alt={vendor.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                                    />

                                    {/* Floating Price Card */}
                                    <div className={`absolute ${idx % 2 === 0 ? 'bottom-8 right-8' : 'bottom-8 left-8'} bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-[240px]`}>
                                        <p className="text-[9px] font-black tracking-[0.2em] text-primary uppercase mb-2">Lead Artisan</p>
                                        <h4 className="font-serif-premium text-xl text-primary italic leading-tight mb-4">{vendor.name}</h4>
                                        <div className="flex justify-between items-end border-t border-gray-200 pt-3">
                                            <p className="font-black text-lg text-primary">₹{vendor.priceMin.toLocaleString()}</p>
                                            {onRemoveVendor && (
                                                <button
                                                    onClick={() => onRemoveVendor(service)}
                                                    className="text-[8px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    Release Selection
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 text-center md:text-left space-y-8">
                                <BsStars className="text-primary text-3xl mx-auto md:mx-0 opacity-60" />

                                <div>
                                    <p className="text-[11px] font-black tracking-[0.3em] text-gray-400 uppercase mb-4">
                                        Artisan {service} Collective
                                    </p>
                                    <h2 className="text-4xl md:text-5xl font-serif-premium text-primary leading-tight mb-6">
                                        {vendor.name}
                                    </h2>
                                    <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                                        Each partner in our curated hub is hand-selected based on their commitment to artisanal excellence and bespoke service. Your journey through this gallery is designed to be as effortless as it is inspiring.
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6 pt-4 justify-center md:justify-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Organic Sourcing</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Custom Menus</span>
                                    </div>
                                </div>

                                <button className="mt-8 text-xs font-black tracking-[0.2em] uppercase text-primary border-b border-primary pb-1 hover:opacity-70 transition-opacity">
                                    Scroll to Explore
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {Object.keys(formData.vendors).length === 0 && (
                    <div className="text-center py-32 opacity-40">
                        <h3 className="text-3xl font-serif-premium italic text-primary">Your canvas awaits selection...</h3>
                    </div>
                )}
            </div>

            {/* Total Footer */}
            {Object.keys(formData.vendors).length > 0 && (
                <div className="max-w-4xl mx-auto mt-32 px-6">
                    <div className="bg-surface rounded-[3rem] p-12 relative overflow-hidden text-center">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-4">Estimated Total Investment</p>
                            <div className="text-5xl md:text-6xl font-black text-primary mb-4 font-serif-premium">
                                ₹{totalMin.toLocaleString()}
                            </div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
                                Across {Object.keys(formData.vendors).length} Artisan Partners
                            </p>
                            <p className="text-xs text-gray-400 font-medium italic max-w-lg mx-auto">
                                *Final curation value subject to seasonal availability and specific custom requirements defined in the next phase.
                            </p>
                        </div>
                        <BsTagFill className="absolute -bottom-12 -right-12 text-primary/5 text-[200px] rotate-12" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepReview;
