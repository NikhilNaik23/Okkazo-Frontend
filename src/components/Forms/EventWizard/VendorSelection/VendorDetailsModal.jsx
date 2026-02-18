import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsXLg, BsStarFill, BsCheck, BsArrowRight } from 'react-icons/bs';
import { BsGlobe, BsTelephone, BsEnvelope, BsInstagram } from 'react-icons/bs';
import { MdLocationOn } from 'react-icons/md';
import ReviewsTab from './ReviewsTab';
import { categoryPackages, servicePackages as defaultPackages, vendorHighlights } from '../../../../data/vendorSelectionData';

const VendorDetailsModal = ({ vendor, onClose, onSelect, isSelected, priceMultiplier = 1, guestCount = 0 }) => {
    const [activeTab, setActiveTab] = React.useState('Services');
    const [expandedPackageId, setExpandedPackageId] = React.useState(null);

    const currentPackages = vendor ? (categoryPackages[vendor.category] || defaultPackages) : [];
    const expandedPackage = currentPackages.find(p => p.id === expandedPackageId);

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
                        <p className="text-white/70 text-sm font-medium flex items-center gap-2 mb-4 tracking-wide uppercase text-[11px]">
                            <MdLocationOn className="text-secondary" size={16} /> {vendor.location}
                        </p>
                        {vendor.capacity && (
                            <p className="text-white/70 text-sm font-medium flex items-center gap-2 mb-8 tracking-wide uppercase text-[11px]">
                                <span className="bg-secondary/20 px-2 py-1 rounded text-white font-bold">Capacity: {vendor.capacity} Guests</span>
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4">

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
                            {activeTab === 'Services' && (
                                <motion.div
                                    key="Services"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute inset-0 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-gray-200"
                                >
                                    <div className="space-y-8 pb-10">
                                        {!expandedPackageId ? (
                                            <>
                                                <div>
                                                    <h3 className="text-2xl font-serif-premium text-primary mb-2">Offered Packages</h3>
                                                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Select a tier for your event ({guestCount} Guests)</p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6">
                                                    {currentPackages.map((pkg, i) => {
                                                        const isPerUnit = pkg.unit?.toLowerCase().includes('plate') || pkg.unit?.toLowerCase().includes('person');
                                                        const displayPrice = pkg.price * priceMultiplier;

                                                        return (
                                                            <div key={pkg.id} className="p-6 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all group flex flex-col relative overflow-hidden">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div>
                                                                        <span className="inline-block px-3 py-1 rounded-full bg-surface border border-primary/10 text-[9px] font-bold uppercase tracking-widest text-primary mb-2">
                                                                            {pkg.tier}
                                                                        </span>
                                                                        <h4 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors">{pkg.name}</h4>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="block text-2xl font-serif-premium text-primary">₹{displayPrice.toLocaleString()}</span>
                                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">/ {pkg.unit || 'Event'}</span>
                                                                    </div>
                                                                </div>

                                                                <p className="text-sm text-gray-500 mb-6 leading-relaxed">{pkg.desc}</p>



                                                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                                                    <button
                                                                        onClick={() => setExpandedPackageId(pkg.id)}
                                                                        className="py-3 rounded-xl border border-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:border-primary/30 transition-colors"
                                                                    >
                                                                        Explore
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const isPerUnit = pkg.unit?.toLowerCase().includes('plate') || pkg.unit?.toLowerCase().includes('person');
                                                                            const unitMultiplier = isPerUnit ? (guestCount || 1) : 1;

                                                                            const updatedVendor = {
                                                                                ...vendor,
                                                                                priceMin: pkg.price * unitMultiplier,
                                                                                priceMax: pkg.price * unitMultiplier * 1.2,
                                                                                selectedPackage: pkg
                                                                            };
                                                                            onSelect(updatedVendor);
                                                                            onClose();
                                                                        }}
                                                                        className="py-3 rounded-xl bg-primary text-white font-bold text-[10px] uppercase tracking-widest hover:bg-secondary transition-colors shadow-lg shadow-primary/20"
                                                                    >
                                                                        Add Combined
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="animate-fade-in">
                                                <button
                                                    onClick={() => setExpandedPackageId(null)}
                                                    className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary mb-8 transition-colors"
                                                >
                                                    <span className="w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">←</span>
                                                    Back to Packages
                                                </button>

                                                <div className="bg-surface rounded-3xl p-8 border border-primary/5">
                                                    <div className="flex justify-between items-start mb-8 border-b border-primary/5 pb-8">
                                                        <div>
                                                            <span className="text-secondary font-serif-premium italic text-lg mb-1 block">Selected Tier</span>
                                                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">{expandedPackage.name}</h2>
                                                            <p className="text-gray-500">{expandedPackage.desc}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-4xl font-serif-premium text-primary">₹{(expandedPackage.price * priceMultiplier).toLocaleString()}</div>
                                                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">/ {expandedPackage.unit || 'Event'}</div>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Complete Inclusions</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                                        {expandedPackage.includes.map((item, idx) => (
                                                            <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                                    <BsCheck size={12} strokeWidth={1} />
                                                                </div>
                                                                <span className="text-sm text-gray-600 font-medium">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex justify-between items-center bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                                        <div>
                                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Total Estimated Cost</span>
                                                            <div className="text-2xl font-serif-premium text-primary">
                                                                ₹{(expandedPackage.price * priceMultiplier * ((expandedPackage.unit?.toLowerCase().includes('plate') || expandedPackage.unit?.toLowerCase().includes('person')) ? (guestCount || 1) : 1)).toLocaleString()}
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {(expandedPackage.unit?.toLowerCase().includes('plate') || expandedPackage.unit?.toLowerCase().includes('person')) ? `For ${guestCount} guests` : 'Fixed Event Price'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const isPerUnit = expandedPackage.unit?.toLowerCase().includes('plate') || expandedPackage.unit?.toLowerCase().includes('person');
                                                                const unitMultiplier = isPerUnit ? (guestCount || 1) : 1;

                                                                const updatedVendor = {
                                                                    ...vendor,
                                                                    priceMin: expandedPackage.price * unitMultiplier,
                                                                    priceMax: expandedPackage.price * unitMultiplier * 1.2,
                                                                    selectedPackage: expandedPackage
                                                                };
                                                                onSelect(updatedVendor);
                                                                onClose();
                                                            }}
                                                            className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary transition-colors shadow-lg"
                                                        >
                                                            Add to Event
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Reviews' && (
                                <ReviewsTab vendor={vendor} />
                            )}
                        </AnimatePresence>
                    </div>


                </div>
            </motion.div>
        </motion.div>
    );
};

export default VendorDetailsModal;
