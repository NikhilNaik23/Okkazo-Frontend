import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsChevronLeft,
    BsChevronRight,
    BsXLg,
    BsFillCartCheckFill,
    BsStarFill,
    BsArrowRight,
    BsSearch,
    BsCheck,
    BsCalendarEvent,
    BsFilter,
    BsHeart,
    BsHeartFill,
    BsPlus,
    BsX
} from "react-icons/bs";
import { MdRestaurant, MdCameraAlt, MdPalette, MdLocationOn, MdVideocam, MdMusicNote, MdFace, MdSort } from 'react-icons/md';
import { dummyVendors } from "../../../data/vendorData";

import { vendorServiceCategories, isDateHighDemand } from "../../../data/planningWizardData";
import { BsGlobe, BsTelephone, BsEnvelope, BsInstagram } from 'react-icons/bs';
import SharedCalendar from "./SharedCalendar";

// --- Helper Components ---

const ReviewsTab = ({ vendor }) => {
    const [page, setPage] = useState(1);
    const PER_PAGE = 3;

    // Mock Reviews Data
    const reviews = useMemo(() => Array.from({ length: 42 }).map((_, i) => ({
        id: i,
        user: `User ${i + 1}`,
        rating: 4 + Math.random(),
        date: new Date(2025, 0, 15 - i).toLocaleDateString(),
        text: "Absolutely stunning experience! The attention to detail was immaculate and the team went above and beyond to ensure our day was perfect. Highly recommended for anyone looking for luxury service."
    })), []);

    const totalPages = Math.ceil(reviews.length / PER_PAGE);
    const currentReviews = reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <motion.div
            key="Reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 flex flex-col p-10"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-serif-premium text-primary">Client Experiences</h3>
                    <p className="text-gray-400 text-xs font-bold mt-2">Total Reviews: <span className="text-primary">{reviews.length}</span></p>
                </div>
                <div className="flex items-center gap-2 text-amber-400 bg-amber-50 px-4 py-2 rounded-full">
                    <span className="text-lg font-bold text-primary">{vendor.rating}</span>
                    <div className="flex text-xs"><BsStarFill /><BsStarFill /><BsStarFill /><BsStarFill /><BsStarFill className="text-amber-200" /></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                {currentReviews.map(review => (
                    <div key={review.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase">
                                    {review.user.substring(0, 1)}
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-primary uppercase tracking-wider">{review.user}</h5>
                                    <span className="text-[10px] text-gray-400">{review.date}</span>
                                </div>
                            </div>
                            <div className="flex text-amber-400 text-[9px] gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <BsStarFill key={i} className={i < Math.floor(review.rating) ? "" : "text-gray-200"} />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed font-light">"{review.text}"</p>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-primary hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary transition-all"
                    >
                        <BsChevronLeft size={10} />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-primary hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary transition-all"
                    >
                        <BsChevronRight size={10} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

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
                                            {['Premium Aesthetics', 'Custom Layouts', 'Dedicated Concierge', 'Valet Service'].map(s => (
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
                            {/* Placeholder for other tabs */}
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
                                            {[
                                                { name: "Full Day Coverage", price: 85000, desc: "Up to 12 hours of coverage with 2 photographers" },
                                                { name: "Cinematic Film", price: 60000, desc: "5-7 minute highlight reel and full ceremony edit" },
                                                { name: "Pre-Wedding Shoot", price: 25000, desc: "4 hour session at location of choice" },
                                                { name: "Drone Coverage", price: 15000, desc: "Aerial shots for venue and entry" },
                                                { name: "Express Editing", price: 10000, desc: "Same day edit slideshow for reception" }
                                            ].map((service, i) => (
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

// --- Vendor Card Component ---

const VendorCard = ({ vendor, isSelected, onSelect, onViewDetails, priceMultiplier = 1 }) => {
    // Generate Range Price
    const priceMin = (vendor.priceMin || 0) * priceMultiplier;
    const priceMax = (vendor.priceMax || Math.round((vendor.priceMin || 0) * 1.5)) * priceMultiplier;

    // Format Price nicely
    const formatPrice = (p) => "₹" + (p >= 1000 ? (p / 1000).toFixed(0) + 'k' : p);

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


// --- Main Page Component ---

const StepVendorSelection = ({ formData, handleNext, handleBack, activeServiceTab, setActiveServiceTab, handleSelectVendor, handleChange, minDateString }) => {
    const activeCategory = formData.services[activeServiceTab] || "Venue";

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVendorForDetails, setSelectedVendorForDetails] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Sort/Filter placeholders
    const [sortOption, setSortOption] = useState("Recommended");
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
    const [showAddServiceDropdown, setShowAddServiceDropdown] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const ITEMS_PER_PAGE = 9;

    // --- High Demand Logic ---
    const isHighDemand = isDateHighDemand(formData.date);
    const priceMultiplier = isHighDemand ? 1.5 : 1; // 50% increase for high demand

    const handleSelectVendorWrapper = (category, vendor) => {
        // Apply multiplier to the selected vendor object
        const adjustedVendor = {
            ...vendor,
            priceMin: (vendor.priceMin || 0) * priceMultiplier,
            priceMax: (vendor.priceMax || Math.round((vendor.priceMin || 0) * 1.5)) * priceMultiplier,
            priceMultiplier: priceMultiplier // Store for reference
        };
        handleSelectVendor(category, adjustedVendor);
    };

    const handleAddService = (service) => {
        const newServices = [...formData.services, service];
        handleChange('services', newServices);
        // Automatically switch to the new tab
        setActiveServiceTab(newServices.length - 1);
        setShowAddServiceDropdown(false);
    };

    const handleRemoveService = (index) => {
        const serviceToRemove = formData.services[index];
        const newServices = formData.services.filter((_, i) => i !== index);

        // Remove the vendor selection for this service if it exists
        if (formData.vendors[serviceToRemove]) {
            const newVendors = { ...formData.vendors };
            delete newVendors[serviceToRemove];
            handleChange('vendors', newVendors);

            // Defer the second update to ensure state consistency
            setTimeout(() => {
                handleChange('services', newServices);
            }, 50);
        } else {
            handleChange('services', newServices);
        }

        // Adjust active tab safely
        if (activeServiceTab >= index && activeServiceTab > 0) {
            setActiveServiceTab(prev => prev - 1);
        } else if (newServices.length <= activeServiceTab) {
            setActiveServiceTab(Math.max(0, newServices.length - 1));
        }
    };

    const handleRemoveVendorSelection = (category) => {
        const newVendors = { ...formData.vendors };
        delete newVendors[category];
        handleChange('vendors', newVendors);
    };

    // Reset filters when changing category
    React.useEffect(() => {
        setSearchQuery("");
        setPriceRange({ min: 0, max: 200000 });
        setSortOption("Recommended");
        setCurrentPage(1);
    }, [activeCategory]);

    const filteredVendors = useMemo(() => {
        let allVendors = dummyVendors[activeCategory] || [];

        // 1. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            allVendors = allVendors.filter(v =>
                v.name.toLowerCase().includes(query) ||
                v.location.toLowerCase().includes(query)
            );
        }

        // 2. Price Filter
        allVendors = allVendors.filter(v => {
            // Check if vendor price range overlaps with selected range
            // Vendor Range: [v.priceMin, v.priceMax]
            // Selected Range: [priceRange.min, priceRange.max]
            // Overlap condition: start1 <= end2 && start2 <= end1
            const vendorMax = v.priceMax || (v.priceMin * 1.5);
            return v.priceMin <= priceRange.max && vendorMax >= priceRange.min;
        });

        // 3. Sorting
        switch (sortOption) {
            case 'Top Rated':
                allVendors = [...allVendors].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
                break;
            case 'Trending':
                allVendors = [...allVendors].sort((a, b) => b.reviews - a.reviews || (b.isPopular === a.isPopular ? 0 : b.isPopular ? 1 : -1));
                break;
            case 'Nearest':
                // Mock "Nearest" - Shuffle deterministically or sort by ID as proxy for now since no geo data
                // For now, let's just reverse to show change
                allVendors = [...allVendors].reverse();
                break;
            case 'Price: Low to High':
                allVendors = [...allVendors].sort((a, b) => a.priceMin - b.priceMin);
                break;
            case 'Price: High to Low':
                allVendors = [...allVendors].sort((a, b) => b.priceMin - a.priceMin);
                break;
            default: // Recommended
                // Keep default order (which might be "curated" in data)
                break;
        }

        return allVendors;
    }, [activeCategory, searchQuery, sortOption, priceRange]);

    const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
    const paginatedVendors = filteredVendors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Sidebar Logic
    const selectedCount = Object.keys(formData.vendors).length;
    const allServicesSelected = formData.services?.every(service => formData.vendors[service]);
    // const currentSelection = formData.vendors[activeCategory];

    // Calculate Total Estimated
    const estimatedTotal = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMin || 0), 0);
    const estimatedMax = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMax || Math.round((v.priceMin || 0) * 1.5)), 0);

    return (
        <div className="w-full min-h-screen bg-surface relative flex flex-col overflow-hidden">

            {/* Prevent scroll content from bleeding into the fixed navbar area */}
            <div aria-hidden className="fixed top-0 left-0 right-0 h-24 bg-surface pointer-events-none z-90" />

            {/* Modal */}
            <AnimatePresence>
                {selectedVendorForDetails && (
                    <VendorDetailsModal
                        vendor={selectedVendorForDetails}
                        onClose={() => setSelectedVendorForDetails(null)}
                        onSelect={() => handleSelectVendorWrapper(activeCategory, selectedVendorForDetails)}
                        isSelected={formData.vendors[activeCategory]?.id === selectedVendorForDetails.id}
                        priceMultiplier={priceMultiplier}
                    />
                )}
            </AnimatePresence>

            <div className="flex-1 flex max-w-[1920px] mx-auto w-full relative">

                {/* Main Content (Scrollable) */}
                <div className="flex-1 h-screen overflow-y-auto scrollbar-hide">
                    <div className="px-8 md:px-16 pt-32 pb-48 max-w-7xl mx-auto">

                        {/* Header Section */}
                        <div className="mb-16">
                            <button
                                onClick={handleBack}
                                className="mb-8 flex items-center gap-2 text-primary/40 hover:text-primary transition-colors text-[10px] uppercase tracking-widest font-bold group"
                            >
                                <BsArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                                Back
                            </button>

                            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-white/40 backdrop-blur-sm mb-6">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Curated Selection</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-serif-premium italic text-primary mb-6">
                                Upcoming <br />
                                <span className="not-italic">Experiences</span>
                            </h1>
                            <p className="max-w-xl text-primary/60 text-sm leading-relaxed font-medium">
                                Explore our handpicked collection of {activeCategory.toLowerCase()}s, each chosen for their unique character, exceptional service, and ability to create unforgettable moments.
                            </p>
                        </div>

                        {/* Sticky Navigation & Search Header */}
                        <div className="sticky top-24 z-40 -mx-8 px-8 md:-mx-16 md:px-16 bg-surface/95 backdrop-blur-xl border-b border-primary/5 shadow-[0_10px_30px_-10px_rgba(9,99,126,0.05)] transition-all duration-300 py-6 mb-8">

                            {/* Service Category Tabs - "Rolling" Navbar */}
                            <div className="flex items-center gap-3 mb-6 pb-2">
                                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide flex-1">
                                    {formData.services.map((service, idx) => {
                                        const isSelected = !!formData.vendors[service];
                                        const isActive = activeServiceTab === idx;

                                        return (
                                            <div key={service} className="relative group/tab shrink-0">
                                                <button
                                                    onClick={() => setActiveServiceTab(idx)}
                                                    className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border pr-8
                                                    ${isActive
                                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                                                            : 'bg-white text-primary/60 border-primary/10 hover:border-primary/30 hover:text-primary'}`}
                                                >
                                                    {service}
                                                    {isSelected && (
                                                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] shadow-sm">
                                                            <BsCheck size={12} strokeWidth={1} />
                                                        </span>
                                                    )}
                                                </button>
                                                {formData.services.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveService(idx);
                                                        }}
                                                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors
                                                        ${isActive ? 'text-white/60 hover:text-white hover:bg-white/20' : 'text-primary/20 hover:text-red-500 hover:bg-red-50'}`}
                                                    >
                                                        <BsX size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Add Service Button */}
                                <div className="relative shrink-0">
                                    <button
                                        onClick={() => setShowAddServiceDropdown(!showAddServiceDropdown)}
                                        className="w-10 h-10 rounded-full bg-white border border-dashed border-primary/20 text-primary/40 flex items-center justify-center hover:border-primary hover:text-primary transition-all shadow-sm"
                                        title="Add Service"
                                    >
                                        <BsPlus size={24} className={showAddServiceDropdown ? "rotate-45 transition-transform" : "transition-transform"} />
                                    </button>

                                    {showAddServiceDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-[60]" onClick={() => setShowAddServiceDropdown(false)} />
                                            <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-xl border border-primary/10 p-2 z-[70] animate-fade-in-up scrollbar-thin scrollbar-thumb-gray-200">
                                                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 border-b border-gray-100 mb-1">
                                                    Add Service
                                                </div>
                                                {vendorServiceCategories.filter(s => !formData.services.includes(s) && s !== 'Other').map(service => (
                                                    <button
                                                        key={service}
                                                        onClick={() => handleAddService(service)}
                                                        className="w-full text-left px-4 py-3 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 transition-colors flex items-center justify-between group"
                                                    >
                                                        {service}
                                                        <BsPlus className="opacity-0 group-hover:opacity-100 text-primary" />
                                                    </button>
                                                ))}
                                                {vendorServiceCategories.filter(s => !formData.services.includes(s) && s !== 'Other').length === 0 && (
                                                    <div className="px-4 py-4 text-center text-[10px] text-gray-400">
                                                        All services added
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-5">
                                {/* Search Bar Row */}
                                <div className="bg-white p-1.5 pl-2 rounded-full shadow-[0_4px_20px_-5px_rgba(9,99,126,0.05)] border border-primary/5 flex items-center pr-2">
                                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary shrink-0">
                                        <BsSearch size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`Search for ${activeCategory.toLowerCase()}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 h-10 bg-transparent border-none focus:ring-0 text-primary placeholder-primary/40 font-bold text-sm px-4"
                                    />
                                    <div
                                        className="hidden md:flex items-center gap-4 px-6 border-l border-gray-100 relative group cursor-pointer"
                                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    >
                                        <BsCalendarEvent className="text-primary/40 group-hover:text-primary transition-colors" size={14} />
                                        <div className="flex flex-col relative w-24">
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-primary/40">Date</span>
                                            <span className="text-[10px] font-bold text-primary underline decoration-dotted underline-offset-4 cursor-pointer group-hover:text-secondary transition-colors truncate">
                                                {formData.date ? new Date(formData.date).toLocaleDateString() : "Select"}
                                            </span>

                                            <AnimatePresence>
                                                {isCalendarOpen && (
                                                    <SharedCalendar
                                                        selectedDate={formData.date}
                                                        onChange={(dateStr) => {
                                                            handleChange('date', dateStr);
                                                            setIsCalendarOpen(false);
                                                        }}
                                                        minDateString={minDateString}
                                                        onClose={() => setIsCalendarOpen(false)}
                                                    />
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters Row */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-2 -mb-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/30 mr-2 shrink-0">Filter By</span>
                                        {['Nearest', 'Top Rated', 'Trending'].map(filter => (
                                            <button
                                                key={filter}
                                                onClick={() => setSortOption(filter)}
                                                className={`shrink-0 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border
                                                ${sortOption === filter
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-transparent text-primary/60 border-primary/20 hover:border-primary hover:text-primary'}`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative shrink-0 z-50">
                                        <button
                                            onClick={() => setShowPriceFilter(!showPriceFilter)}
                                            className={`shrink-0 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border flex items-center gap-2 transition-all ml-auto
                                            ${showPriceFilter ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-gray-200 hover:border-primary'}`}
                                        >
                                            Price Range <BsFilter size={12} />
                                        </button>
                                        {showPriceFilter && (
                                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-fade-in-up">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Price Range</span>
                                                    <button onClick={() => setShowPriceFilter(false)} className="text-gray-400 hover:text-primary"><BsXLg size={10} /></button>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-[9px] font-bold text-gray-400 block mb-1">Max Price: ₹{(priceRange.max).toLocaleString()}</label>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="500000"
                                                            step="5000"
                                                            value={priceRange.max}
                                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                                            className="w-full accent-primary h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex justify-between pt-2">
                                                        <button
                                                            onClick={() => setPriceRange({ min: 0, max: 20000 })}
                                                            className="text-[9px] font-bold text-primary/60 hover:text-primary underline"
                                                        >
                                                            Reset
                                                        </button>
                                                        <button
                                                            onClick={() => setShowPriceFilter(false)}
                                                            className="px-3 py-1 bg-primary text-white text-[9px] font-bold rounded-lg"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vendors Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {paginatedVendors.map(vendor => (
                                <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                    isSelected={formData.vendors[activeCategory]?.id === vendor.id}
                                    onSelect={() => handleSelectVendorWrapper(activeCategory, vendor)}
                                    onViewDetails={() => setSelectedVendorForDetails(vendor)}
                                    priceMultiplier={priceMultiplier}
                                />
                            ))}
                        </div>

                        {/* Pagination Footer */}
                        <div className="mt-20 flex items-center justify-between border-t border-primary/5 pt-8">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">
                                Showing <span className="text-primary">{paginatedVendors.length.toString().padStart(2, '0')}</span> of <span className="text-primary">{filteredVendors.length}</span> Experiences
                            </span>

                            <div className="flex items-center gap-4">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="px-6 py-2 rounded-full border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <BsChevronLeft size={10} /> Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                                            ${currentPage === page ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'text-primary/40 hover:text-primary hover:bg-white'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    {totalPages > 5 && <span className="text-primary/40 text-xs">...</span>}
                                    {totalPages > 5 && (
                                        <button className="text-primary/40 hover:text-primary text-[10px] font-bold w-8 h-8">{totalPages}</button>
                                    )}
                                </div>

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="px-6 py-2 rounded-full border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    Next <BsChevronRight size={10} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Floating Sidebar - Selection */}
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
                                <button onClick={handleBack} className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center text-primary/60 hover:bg-primary hover:text-white transition-all" title="Back">
                                    <BsArrowRight className="rotate-180" size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Selected Items List */}
                        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                            {Object.entries(formData.vendors).length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <BsHeart size={40} className="mb-4 text-primary" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Your selection is empty</p>
                                </div>
                            ) : (
                                Object.entries(formData.vendors).map(([category, vendor]) => (
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
                                            onClick={() => handleRemoveVendorSelection(category)}
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
                                onClick={handleNext}
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

            </div>
        </div>
    );
};

export default StepVendorSelection;
