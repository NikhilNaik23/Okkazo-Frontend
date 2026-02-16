import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsXLg, BsStarFill, BsCheck } from 'react-icons/bs';
import { BsGlobe, BsTelephone, BsEnvelope, BsInstagram } from 'react-icons/bs';
import { MdLocationOn } from 'react-icons/md';
import ReviewsTab from './ReviewsTab';
import { servicePackages, vendorHighlights } from '../../../../data/vendorSelectionData';

const VendorDetailsModal = ({ vendor, onClose, onSelect, isSelected, priceMultiplier = 1 }) => {
    const [activeTab, setActiveTab] = React.useState('Overview');

    React.useEffect(() => {
        if (!vendor) return;
        setActiveTab('Overview');
    }, [vendor]);

    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!vendor) return null;

    // Price Range Calculation (Mock logic if max missing)
    const priceMin = (vendor.priceMin || 0) * priceMultiplier;
    const priceMax = (vendor.priceMax || Math.round((vendor.priceMin || 0) * 1.5)) * priceMultiplier;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4 sm:px-6"
        >
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl h-[85vh] flex flex-col md:flex-row"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 z-50 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/30"
                >
                    <BsXLg size={20} />
                </button>

                {/* Left Side - Image & Quick Info */}
                <div className="w-full md:w-5/12 relative h-[30vh] md:h-auto">
                    <img src={vendor.image} className="absolute inset-0 w-full h-full object-cover" alt={vendor.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                    <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                {vendor.category || "Venue"}
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-1">
                                <BsCheck size={14} /> Verified
                            </span>
                        </div>

                        <h2 className="text-4xl font-serif-premium italic mb-2 leading-tight">{vendor.name}</h2>
                        <p className="text-white/70 text-sm font-medium flex items-center gap-2 mb-8 tracking-wide uppercase text-[11px]">
                            <MdLocationOn className="text-secondary" size={16} /> {vendor.location}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                <span className="text-[10px] uppercase tracking-widest opacity-60 block mb-1">Range</span>
                                <span className="text-xl font-serif-premium">₹{(originalMin => originalMin >= 1000 ? (originalMin / 1000).toFixed(0) + 'k' : originalMin)(priceMin)} - ₹{(originalMax => originalMax >= 1000 ? (originalMax / 1000).toFixed(0) + 'k' : originalMax)(priceMax)}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                <span className="text-[10px] uppercase tracking-widest opacity-60 block mb-1">Rating</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-serif-premium">{vendor.rating}</span>
                                    <div className="flex text-amber-400 text-[10px]">
                                        {[...Array(5)].map((_, i) => (
                                            <BsStarFill key={i} className={i < Math.floor(vendor.rating) ? "text-amber-400" : "text-white/20"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Details content */}
                <div className="w-full md:w-7/12 bg-white flex flex-col h-full overflow-hidden relative z-10">
                    {/* Fixed Tabs Header */}
                    <div className="px-10 pt-10 pb-0 shrink-0 bg-white z-20">
                        <div className="flex items-center gap-8 border-b border-gray-100 pb-0 overflow-x-auto">
                            {['Overview', 'Services', 'Reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-colors pb-5
                                    ${activeTab === tab ? 'text-primary' : 'text-gray-300 hover:text-gray-500'}`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area - Independent Scrolling */}
                    <div className="flex-1 overflow-hidden relative bg-white">
                        <AnimatePresence mode='wait'>
                            {activeTab === 'Overview' && (
                                <motion.div
                                    key="Overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 overflow-y-auto p-10 space-y-10 scrollbar-thin scrollbar-thumb-gray-200"
                                >
                                    <section>
                                        <h3 className="text-2xl font-serif-premium text-primary mb-4">About the Experience</h3>
                                        <p className="text-gray-500 leading-loose text-sm font-light">
                                            Immerse yourself in the exquisite offerings of {vendor.name}. Known for our attention to detail and bespoke services, we curate moments that linger in memory. From intimate gatherings to grand celebrations, our venue spaces and services are designed to elevate your event.
                                        </p>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-primary mb-5 uppercase tracking-widest text-[11px]">Highlights</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {vendorHighlights.map(s => (
                                                <span key={s} className="px-5 py-2.5 rounded-full bg-surface text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/5 hover:bg-primary hover:text-white transition-colors cursor-default">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-primary mb-5 uppercase tracking-widest text-[11px]">Connect</h3>
                                        <div className="flex gap-4">
                                            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all"><BsGlobe size={18} /></button>
                                            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all"><BsTelephone size={18} /></button>
                                            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all"><BsEnvelope size={18} /></button>
                                            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all"><BsInstagram size={18} /></button>
                                        </div>
                                    </section>
                                </motion.div>
                            )}
                            {/* Services Tab */}
                            {activeTab === 'Services' && (
                                <motion.div
                                    key="Services"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute inset-0 overflow-y-auto p-10 space-y-8 scrollbar-thin scrollbar-thumb-gray-200"
                                >
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-serif-premium text-primary">Offered Services</h3>
                                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Standard Packages</p>

                                        <div className="grid grid-cols-1 gap-4">
                                            {servicePackages.map((service, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all group">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-primary mt-1">
                                                            <BsCheck />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">{service.name}</h4>
                                                            <p className="text-xs text-gray-400 mt-1">{service.desc}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-primary">₹{(service.price * (vendor.priceMultiplier || 1)).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Reviews' && (
                                <ReviewsTab vendor={vendor} />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Action */}
                    <div className="p-8 border-t border-gray-100 bg-white mt-auto shrink-0 z-20">
                        <button
                            onClick={() => {
                                onSelect();
                                onClose();
                            }}
                            disabled={isSelected}
                            className={`w-full py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.25em] transition-all shadow-xl flex items-center justify-center gap-4
                            ${isSelected
                                    ? 'bg-secondary text-white cursor-default opacity-90'
                                    : 'bg-primary text-white hover:bg-secondary hover:shadow-2xl hover:-translate-y-1 active:translate-y-0'}`}
                        >
                            {isSelected ? (
                                <span className="flex items-center gap-3"><BsCheck size={20} /> Currently Selected</span>
                            ) : (
                                <span>Add to Event</span>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default VendorDetailsModal;
