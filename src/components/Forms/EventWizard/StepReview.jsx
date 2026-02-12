import React from 'react';
import { motion } from 'framer-motion';
import { BsCheck2Circle, BsInfoCircle, BsTagFill, BsCalendarEvent } from "react-icons/bs";

const StepReview = ({ formData }) => {
    const totalMin = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMin || 0), 0);
    const totalMax = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMax || 0), 0);

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto pb-32"
        >
            {/* Header Section */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-4 border border-teal-100">
                    <BsCheck2Circle size={14} />
                    Final Curation Review
                </div>
                <h2 className="text-5xl font-black text-[#0b2d49] tracking-tight mb-4">
                    The Essence of <span className="text-teal-600">Your Vision</span>
                </h2>
                <p className="text-gray-500 font-medium text-lg max-w-xl mx-auto">
                    Review your curated selections. These premium partners are poised to manifest your intent into reality.
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left: Event Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/50 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-sm">
                        <h4 className="text-[10px] font-black tracking-[0.2em] text-teal-900/40 uppercase mb-6 flex items-center gap-2">
                            <BsCalendarEvent />
                            Event Metadata
                        </h4>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Intent</label>
                                <p className="text-[#0b2d49] font-black text-xl">{formData.listingType || "Private"} Manifestation</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                                <p className="text-[#0b2d49] font-bold">{formData.type || "Special Gathering"}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Timeline</label>
                                <p className="text-[#0b2d49] font-bold">{formData.date || "TBD"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0b2d49] p-8 rounded-[40px] text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase mb-4">Estimated Value</h4>
                            <p className="text-4xl font-black mb-2">₹{totalMin.toLocaleString()}</p>
                            <p className="text-white/40 text-xs font-medium italic">Base curation value across {Object.keys(formData.vendors).length} services.</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                            <BsTagFill size={100} />
                        </div>
                    </div>
                </div>

                {/* Right: Selected Partners */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[48px] p-10 shadow-xl shadow-teal-900/5 border border-teal-900/5">
                        <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-8">
                            <h4 className="text-[10px] font-black tracking-[0.2em] text-teal-900/40 uppercase">Curated Partners</h4>
                            <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-teal-100 italic">
                                Finalizing Selection
                            </span>
                        </div>

                        <div className="space-y-8">
                            {Object.keys(formData.vendors).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                                        <BsInfoCircle size={30} />
                                    </div>
                                    <p className="text-gray-400 font-black italic">No partners curated yet.</p>
                                </div>
                            ) : Object.entries(formData.vendors).map(([service, vendor], idx) => (
                                <motion.div
                                    key={service}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <img
                                                src={vendor.image}
                                                alt={vendor.name}
                                                className="w-20 h-20 rounded-[24px] object-cover bg-gray-100 shadow-lg group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                                <BsCheck2Circle size={12} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black tracking-[0.3em] text-teal-600 uppercase mb-1">{service}</p>
                                            <h5 className="text-lg font-black text-[#0b2d49] transition-colors group-hover:text-teal-900">{vendor.name}</h5>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{vendor.location || "Verified Premium"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black tracking-[0.2em] text-gray-300 uppercase mb-1">Partner Value</p>
                                        <p className="text-[#0b2d49] font-black text-lg">₹{vendor.priceMin.toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Grand Total Footer */}
                        {Object.keys(formData.vendors).length > 0 && (
                            <div className="mt-16 pt-10 border-t-2 border-dashed border-gray-100">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-[10px] font-black tracking-[0.3em] text-teal-900/40 uppercase mb-2">Total Curation Manifest</h3>
                                        <p className="text-xs text-gray-400 font-medium italic">*Final cost curated based on specific event parameters.</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-[#0b2d49]">
                                            ₹{totalMin.toLocaleString()} <span className="text-gray-300 font-medium text-xl">—</span> ₹{totalMax.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StepReview;
