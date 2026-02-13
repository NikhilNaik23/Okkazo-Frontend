import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsChevronLeft,
    BsChevronRight,
    BsXLg,
    BsFillCartCheckFill,
    BsStarFill,
    BsArrowLeft,
    BsSearch,
    BsCheck,
    BsFacebook
} from "react-icons/bs";
import { MdRestaurant, MdCameraAlt, MdPalette, MdLocationOn, MdVideocam, MdMusicNote, MdFace, MdSort } from 'react-icons/md';
import { dummyVendors } from "../../../data/vendorData";
import { BsGlobe, BsTelephone, BsEnvelope, BsInstagram } from 'react-icons/bs';

const VendorDetailsModal = ({ vendor, onClose, onSelect, isSelected }) => {
    if (!vendor) return null;

    const [activeTab, setActiveTab] = React.useState('Overview');

    // Reset tab when vendor changes (though component likely unmounts, good practice)
    React.useEffect(() => {
        setActiveTab('Overview');
    }, [vendor]);

    // Disable body scroll when modal is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4 sm:px-6"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl h-[85vh] flex flex-col md:flex-row"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
                >
                    <BsXLg size={16} />
                </button>

                {/* Left Side - Image & Quick Info */}
                <div className="w-full md:w-2/5 relative h-64 md:h-auto">
                    <img src={vendor.image} className="absolute inset-0 w-full h-full object-cover" alt={vendor.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-90" />

                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                                {vendor.rating} ★ Rating
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                                Verified
                            </span>
                        </div>
                        <h2 className="text-3xl font-black leading-tight mb-2">{vendor.name}</h2>
                        <p className="text-white/80 text-sm font-medium flex items-center gap-2 mb-6">
                            <MdLocationOn /> {vendor.location}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                <span className="text-[9px] uppercase tracking-widest opacity-60 block mb-1">Starting At</span>
                                <span className="text-lg font-black">₹{vendor.priceMin.toLocaleString()}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                <span className="text-[9px] uppercase tracking-widest opacity-60 block mb-1">Capacity</span>
                                <span className="text-lg font-black">50-500</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Details content */}
                <div className="w-full md:w-3/5 bg-white flex flex-col h-full overflow-hidden">
                    {/* Fixed Tabs Header */}
                    <div className="px-8 pt-8 pb-0 shrink-0">
                        <div className="flex items-center gap-6 border-b border-gray-100 pb-0 overflow-x-auto">
                            {['Overview', 'Services', 'Reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors pb-4
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
                    <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence mode='wait'>
                            {activeTab === 'Overview' && (
                                <motion.div
                                    key="Overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute inset-0 overflow-y-auto p-8 space-y-8 scrollbar-hide"
                                >
                                    <section>
                                        <h3 className="text-lg font-black text-primary mb-3">About {vendor.name}</h3>
                                        <p className="text-gray-500 leading-relaxed text-sm">
                                            Experience the finest quality service with {vendor.name}. We have been serving the community for over 10 years, providing exceptional experiences for weddings, corporate events, and parties. Our team of dedicated professionals ensures every detail is perfect.
                                        </p>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-black text-primary mb-4">Services Highlights</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {['Premium Package', 'Custom Styling', 'On-site Support'].map(s => (
                                                <span key={s} className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-black text-primary mb-4">Contact Info</h3>
                                        <div className="flex gap-4">
                                            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><BsGlobe /></button>
                                            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><BsTelephone /></button>
                                            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><BsEnvelope /></button>
                                            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><BsInstagram /></button>
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
                                    className="absolute inset-0 overflow-y-auto p-8 space-y-6 scrollbar-hide"
                                >
                                    <h3 className="text-lg font-black text-primary mb-2">Detailed Services</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Packages & Offerings</p>

                                    <div className="space-y-4">
                                        {[
                                            { name: "Full Day Coverage", price: "₹25,000", desc: "Complete 8-hour service with 2 dedicated staff members." },
                                            { name: "Premium Package", price: "₹45,000", desc: "Everything in Full Day + drone shots and express editing." },
                                            { name: "Hourly Rate", price: "₹3,500/hr", desc: "Flexible booking for smaller events or specific needs." }
                                        ].map((service, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary/20 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-sm font-black text-primary">{service.name}</h4>
                                                    <span className="text-sm font-black text-secondary">{service.price}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">{service.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Reviews' && (
                                <ReviewsTabContent vendor={vendor} />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Action */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 mt-auto shrink-0">
                        <button
                            onClick={() => {
                                onSelect();
                                onClose();
                            }}
                            className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-3
                            ${isSelected ? 'bg-gray-200 text-gray-500 cursor-default' : 'bg-primary text-white hover:bg-secondary hover:scale-[1.02] active:scale-95'}`}
                        >
                            {isSelected ? <span>Already Selected</span> : <><BsCheck size={18} /> Select Vendor</>}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ReviewsTabContent = ({ vendor }) => {
    const [filterRating, setFilterRating] = React.useState("All");
    const [currentPage, setCurrentPage] = React.useState(1);
    const REVIEWS_PER_PAGE = 5;

    // Generate more dummy reviews for demonstration
    const allReviews = React.useMemo(() => {
        const baseReviews = [
            { name: "Aditya R.", rating: 5, text: "Absolutely amazing experience! The team was professional and the results were beyond our expectations.", date: "2 days ago" },
            { name: "Sneha K.", rating: 4.5, text: "Great service and very accommodating to our last minute requests. Highly recommended!", date: "1 week ago" },
            { name: "Rahul M.", rating: 5, text: "Best value for money. They captured every moment perfectly.", date: "2 weeks ago" },
            { name: "Priya S.", rating: 5, text: "The decor was stunning! Everyone complimented the arrangements. Thank you so much!", date: "3 weeks ago" },
            { name: "Vikram J.", rating: 4, text: "Good experience overall, slight delay in setup but they made up for it with extra effort.", date: "1 month ago" },
            { name: "Ananya B.", rating: 5, text: "Dream come true! The photos are magical. Can't thank you enough.", date: "1 month ago" },
            { name: "Karan L.", rating: 3.5, text: "Decent service but communication could be better.", date: "2 months ago" },
            { name: "Meera P.", rating: 4.5, text: "Loved the food! Catering service was impeccable.", date: "2 months ago" },
            { name: "Arjun D.", rating: 5, text: "High quality equipment and sound. The party was a blast!", date: "3 months ago" },
            { name: "Sanya M.", rating: 2, text: "Not what I expected. The coordination was off.", date: "3 months ago" },
            { name: "Rohan S.", rating: 4, text: "Very professional team. Timely execution.", date: "4 months ago" },
            { name: "Ishaan K.", rating: 5, text: "Simply the best! Highly recommend them for weddings.", date: "5 months ago" },
            { name: "Nisha T.", rating: 3, text: "Average experience. Food was cold by the time it was served.", date: "5 months ago" },
            { name: "Kabir W.", rating: 5, text: "They made our special day even more special. Thank you!", date: "6 months ago" },
            { name: "Zara Q.", rating: 4.5, text: "Great value for the price. Will book again.", date: "6 months ago" },
        ];
        // Duplicate to simulate more data
        return [...baseReviews, ...baseReviews, ...baseReviews].map((r, i) => ({ ...r, id: i }));
    }, []);

    const filteredReviews = React.useMemo(() => {
        if (filterRating === "All") return allReviews;
        return allReviews.filter(r => Math.floor(r.rating) === parseInt(filterRating));
    }, [allReviews, filterRating]);

    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
    const paginatedReviews = filteredReviews.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [filterRating]);

    return (
        <motion.div
            key="Reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 flex flex-col p-8 overflow-hidden"
        >
            <div className="flex items-end justify-between mb-6 shrink-0">
                <div>
                    <h3 className="text-lg font-black text-primary">Client Reviews</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
                        >
                            <option value="All">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            ({filteredReviews.length})
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-primary leading-none">{vendor.rating}</span>
                    <div className="flex text-amber-400 text-xs gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <BsStarFill key={i} className={i < Math.floor(vendor.rating) ? "text-amber-400" : "text-gray-200"} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pb-4">
                {paginatedReviews.map((review) => (
                    <div key={review.id} className="p-5 rounded-2xl bg-white border border-surface shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h5 className="text-xs font-black text-primary">{review.name}</h5>
                                    <span className="text-[10px] text-gray-400 font-bold">{review.date}</span>
                                </div>
                            </div>
                            <div className="flex text-amber-400 text-[10px] gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <BsStarFill key={i} className={i < Math.floor(review.rating) ? "text-amber-400" : "text-gray-200"} />
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">"{review.text}"</p>
                    </div>
                ))}
                {paginatedReviews.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        No reviews found
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between shrink-0">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <BsChevronLeft size={10} />
                    </button>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <BsChevronRight size={10} />
                    </button>
                </div>
            )}
        </motion.div>
    );
};


const VendorCard = ({ vendor, isPopular = false, isSelected, onSelect, onViewDetails }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative shrink-0 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 bg-white group
                ${isPopular ? 'w-[320px] h-[400px]' : 'w-full aspect-[4/5]'}
                ${isSelected ? 'ring-[4px] ring-secondary ring-offset-4' : 'hover:shadow-2xl hover:-translate-y-1'}`}
            onClick={onSelect}
        >
            <img src={vendor.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={vendor.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />

            <div className="absolute top-5 right-5">
                <div className="bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20">
                    <BsStarFill className="text-amber-400" size={12} />
                    <span className="text-xs font-black text-white">{vendor.rating}</span>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-[9px] font-black tracking-[0.25em] text-white/50 uppercase block mb-1">{vendor.location}</span>
                <h3 className={`${isPopular ? 'text-2xl' : 'text-lg'} font-black text-white leading-tight mb-2 truncate`}>{vendor.name}</h3>
                <div className="flex items-center gap-2 mb-4 text-white/60">
                    <p className="text-[11px] font-bold">Standard Pkg: <span className="text-white">₹{vendor.priceMin.toLocaleString()}</span></p>
                </div>
                <div className="flex gap-2">
                    <button className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${isSelected ? 'bg-secondary text-white shadow-lg' : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-primary'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                    >
                        {isSelected ? 'Selected' : 'Select'}
                    </button>
                    <button
                        className="w-12 py-3 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-primary flex items-center justify-center transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails();
                        }}
                    >
                        <BsChevronRight size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const StepVendorSelection = ({ formData, handleNext, handleBack, activeServiceTab, setActiveServiceTab, handleSelectVendor }) => {
    const activeCategory = formData.services[activeServiceTab];
    const allVendors = dummyVendors[activeCategory] || [];
    const scrollRef = useRef(null);

    // State
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isLocationMenuOpen, setIsLocationMenuOpen] = React.useState(false);
    const [isServiceMenuOpen, setIsServiceMenuOpen] = React.useState(false);
    const [selectedVendorForDetails, setSelectedVendorForDetails] = React.useState(null);

    // Sorting Options
    const [sortBy, setSortBy] = React.useState("Recommended");
    const sortOptions = ["Recommended", "Price: Low to High", "Top Rated", "Neighbors First"];
    const [searchQuery, setSearchQuery] = React.useState("");

    const ITEMS_PER_PAGE = 12;

    // Derived Data
    const popularVendors = allVendors.filter(v => v.isPopular && v.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter & Sort Logic
    const filteredVendors = React.useMemo(() => {
        let result = allVendors.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

        if (sortBy === "Price: Low to High") {
            result.sort((a, b) => a.priceMin - b.priceMin);
        } else if (sortBy === "Top Rated") {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "Neighbors First") {
            const userLoc = formData.location ? formData.location.split(',')[0].trim().toLowerCase() : "";
            if (userLoc) {
                result.sort((a, b) => {
                    const aMatch = a.location.toLowerCase().includes(userLoc);
                    const bMatch = b.location.toLowerCase().includes(userLoc);
                    if (aMatch && !bMatch) return -1;
                    if (!aMatch && bMatch) return 1;
                    return 0;
                });
            }
        }
        return result;
    }, [allVendors, searchQuery, sortBy, formData.location]);

    const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedVendors = filteredVendors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const selectedCount = Object.keys(formData.vendors).length;
    const totalServices = formData.services.length;
    const completionPercentage = Math.round((selectedCount / totalServices) * 100) || 0;
    const estimatedTotal = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMin || 0), 0);
    const hasSelections = selectedCount > 0;

    const getIcon = (service) => {
        const s = service.toLowerCase();
        if (s.includes('catering') || s.includes('drink')) return <MdRestaurant size={18} />;
        if (s.includes('photo')) return <MdCameraAlt size={18} />;
        if (s.includes('video')) return <MdVideocam size={18} />;
        if (s.includes('decor') || s.includes('styl')) return <MdPalette size={18} />;
        if (s.includes('entertain') || s.includes('artist')) return <MdMusicNote size={18} />;
        if (s.includes('makeup') || s.includes('groom')) return <MdFace size={18} />;
        if (s.includes('venue')) return <MdLocationOn size={18} />;
        return <MdLocationOn size={18} />;
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const amount = direction === 'left' ? -scrollRef.current.offsetWidth / 2 : scrollRef.current.offsetWidth / 2;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    // Reset page on category change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeServiceTab, sortBy]);

    // Sync sidebar width to CSS variable for Navbar alignment
    React.useEffect(() => {
        const root = document.documentElement;
        if (hasSelections && isSidebarOpen) {
            root.style.setProperty('--sidebar-width', '320px');
        } else {
            root.style.setProperty('--sidebar-width', '0px');
        }
        return () => root.style.setProperty('--sidebar-width', '0px');
    }, [hasSelections, isSidebarOpen]);



    return (
        <div className="w-full relative min-h-screen bg-surface">
            {/* DETAILS MODAL */}
            <AnimatePresence>
                {selectedVendorForDetails && (
                    <VendorDetailsModal
                        vendor={selectedVendorForDetails}
                        onClose={() => setSelectedVendorForDetails(null)}
                        onSelect={() => handleSelectVendor(activeCategory, selectedVendorForDetails)}
                        isSelected={formData.vendors[activeCategory]?.id === selectedVendorForDetails.id}
                    />
                )}
            </AnimatePresence>
            {/* LEFT: MAIN CONTENT */}
            <div className={`transition-all duration-500 pt-[114px] ${hasSelections && isSidebarOpen ? 'pr-[320px]' : 'pr-0'}`}>
                {/* TOP BAR: Categories + Cart - Optimized Alignment */}
                <div className="shrink-0 px-8 bg-transparent sticky top-6 z-[40] h-[70px] flex items-center pointer-events-none">
                    <div className="flex justify-end items-center gap-6 w-full pointer-events-auto">
                        {/* SERVICE SELECTION DROPDOWN */}
                        {/* SEARCH BAR SWAPPED HERE */}
                        <div className="w-[300px] flex justify-end items-center mr-4">
                            <div className="relative w-full group">
                                <BsSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder={`Search for ${activeCategory}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-[72px] pl-16 pr-8 bg-white border-2 border-transparent hover:border-primary/10 focus:border-primary rounded-[2rem] text-sm font-bold text-primary placeholder-primary/30 focus:outline-none shadow-[0_15px_40px_rgba(9,99,126,0.05)] transition-all"
                                />
                            </div>
                        </div>

                        {/* CART ICON INTEGRATED HERE - TO THE RIGHT OF SERVICES */}
                        {hasSelections && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={`relative w-11 h-11 rounded-[18px] flex items-center justify-center transition-all shadow-xl
                                    ${isSidebarOpen ? 'bg-secondary text-white' : 'bg-primary text-white hover:scale-105 active:scale-95'}`}
                            >
                                <BsFillCartCheckFill size={18} />
                                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-md">
                                    {selectedCount}
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="pb-44">
                    {/* FEATURED SLIDER */}
                    {popularVendors.length > 0 && (
                        <div className="mb-20 overflow-hidden">
                            <div className="px-8 mb-10">
                                <h2 className="text-6xl font-black text-primary tracking-tighter leading-none">Popular <span className="text-secondary">{activeCategory}</span></h2>
                                <p className="text-[11px] font-black text-primary/20 uppercase tracking-[0.4em] mt-3">Top tier and most booked partners by creators</p>
                            </div>

                            <div className="relative group/slider">
                                {/* Left Arrow Overlay */}
                                <button
                                    className="absolute left-0 top-0 bottom-0 z-40 w-20 flex items-center justify-center hidden md:flex opacity-0 group-hover/slider:opacity-100 transition-all text-primary hover:scale-125 hover:text-secondary"
                                    onClick={() => scroll('left')}
                                >
                                    <BsChevronLeft size={48} className="drop-shadow-lg" />
                                </button>

                                <motion.div
                                    ref={scrollRef}
                                    className="flex gap-10 overflow-x-auto scroll-smooth pb-12 px-8 scrollbar-hide"
                                    style={{ width: 'calc(100vw - var(--sidebar-width, 0px))', marginLeft: '0px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {popularVendors.map(vendor => (
                                        <div key={vendor.id} className="shrink-0">
                                            <VendorCard
                                                vendor={vendor}
                                                isPopular
                                                isSelected={formData.vendors[activeCategory]?.id === vendor.id}
                                                onSelect={() => handleSelectVendor(activeCategory, vendor)}
                                                onViewDetails={() => setSelectedVendorForDetails(vendor)}
                                            />
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Right Arrow Overlay */}
                                <button
                                    className="absolute right-0 top-0 bottom-0 z-40 w-20 flex items-center justify-center hidden md:flex opacity-0 group-hover/slider:opacity-100 transition-all text-primary hover:scale-125 hover:text-secondary"
                                    onClick={() => scroll('right')}
                                >
                                    <BsChevronRight size={48} className="drop-shadow-lg" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MAIN GRID */}
                    <div className="px-8">
                        <div className="flex items-center gap-6 mb-16">
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
                            <h2 className="text-[12px] font-black text-primary/30 uppercase tracking-[0.8em]">All {activeCategory} Collections</h2>
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                            {paginatedVendors.map(vendor => (
                                <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                    isSelected={formData.vendors[activeCategory]?.id === vendor.id}
                                    onSelect={() => handleSelectVendor(activeCategory, vendor)}
                                    onViewDetails={() => setSelectedVendorForDetails(vendor)}
                                />
                            ))}
                        </div>

                        {paginatedVendors.length === 0 && (
                            <div className="py-40 text-center bg-white rounded-[5rem] border-2 border-dashed border-surface">
                                <p className="text-sm font-black text-primary/20 uppercase tracking-[0.5em]">No unique partners in this radius</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM BAR WITH PAGINATION */}
                <div
                    style={{ right: hasSelections && isSidebarOpen ? '320px' : '0px' }}
                    className="fixed bottom-0 left-0 h-24 bg-white/95 backdrop-blur-2xl border-t border-surface z-50 flex items-center justify-between px-10 shadow-[0_-15px_50px_-15px_rgba(9,99,126,0.15)] transition-all duration-500"
                >
                    <button onClick={handleBack} className="flex items-center gap-3 text-primary hover:text-secondary transition-all group">
                        <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center group-hover:bg-surface">
                            <BsArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">Back</span>
                    </button>

                    <div className="flex-1 shrink flex justify-center px-4 md:px-8">
                        {/* SERVICE SELECTION DROPDOWN SWAPPED HERE */}
                        <div className="relative">
                            <AnimatePresence>
                                {isServiceMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white border border-surface rounded-[2.5rem] shadow-[0_20px_50px_rgba(9,99,126,0.1)] p-4 w-[280px] z-[60] backdrop-blur-xl"
                                    >
                                        <div className="space-y-1">
                                            {formData.services.map((service, idx) => {
                                                const isServiceSelected = !!formData.vendors[service];
                                                return (
                                                    <button
                                                        key={service}
                                                        onClick={() => {
                                                            setActiveServiceTab(idx);
                                                            setIsServiceMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all
                                                            ${activeServiceTab === idx ? 'bg-primary text-white shadow-lg' : 'hover:bg-surface text-primary/40 hover:text-primary'}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span>{getIcon(service)}</span>
                                                                {service}
                                                            </div>
                                                            {isServiceSelected ? (
                                                                <BsCheck className="text-teal-500 text-lg" />
                                                            ) : (
                                                                <BsXLg className="text-red-500 text-xs" />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={() => setIsServiceMenuOpen(!isServiceMenuOpen)}
                                className={`relative flex items-center justify-between gap-4 h-[72px] px-6 min-w-[300px] xl:min-w-[340px] rounded-[2rem] shadow-[0_15px_40px_rgba(9,99,126,0.08)] hover:scale-[1.02] active:scale-95 transition-all border-2 z-50
                                    ${isServiceMenuOpen ? 'bg-surface text-primary border-primary' : 'bg-white text-primary/60 border-primary hover:border-primary hover:shadow-lg'}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${formData.vendors[activeCategory] ? 'bg-teal-500/10 text-teal-600' : 'bg-red-500/10 text-red-500'}`}>
                                        {getIcon(activeCategory)}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary leading-none mb-1.5">{activeCategory}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md ${formData.vendors[activeCategory] ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {formData.vendors[activeCategory] ? 'Secured' : 'Required'}
                                            </span>
                                            <span className="text-[8px] font-bold text-primary/30 uppercase tracking-widest">Category Detail</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 pl-6 border-l border-primary/10">
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] font-black text-primary tabular-nums leading-none mb-1">
                                            {totalServices - selectedCount}
                                        </span>
                                        <span className="text-[7px] font-black text-primary/20 uppercase tracking-widest">Left</span>
                                    </div>
                                    <BsChevronRight className={`transition-transform duration-300 ${isServiceMenuOpen ? '-rotate-90' : 'rotate-0'} text-primary`} size={14} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* PAGINATION TOOL */}
                    <div className="flex items-center gap-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <BsChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all
                                        ${currentPage === page ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-surface text-primary hover:bg-primary/10'}`}
                                >
                                    {page.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <BsChevronRight size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-8 ml-8">
                        {/* SORTING MENU */}
                        <div className="relative">
                            <AnimatePresence>
                                {isLocationMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-4 bg-white border border-surface rounded-[2.5rem] shadow-[0_20px_50px_rgba(9,99,126,0.1)] p-4 w-[240px] z-[60] backdrop-blur-xl"
                                    >
                                        <div className="space-y-1">
                                            {sortOptions.map(option => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setSortBy(option);
                                                        setIsLocationMenuOpen(false);
                                                    }}
                                                    className={`w-full text-left px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${sortBy === option ? 'bg-primary text-white shadow-lg' : 'hover:bg-surface text-primary/40 hover:text-primary'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest border
                                    ${isLocationMenuOpen ? 'bg-white text-primary border-primary' : 'bg-primary text-white border-primary'}`}
                            >
                                <MdSort size={16} />
                                {sortBy}
                                <BsChevronRight className={`transition-transform duration-300 ${isLocationMenuOpen ? '-rotate-90' : 'rotate-90'}`} size={12} />
                            </button>
                        </div>

                        <div className="text-right min-w-[120px]">
                            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase block mb-1">Total Available</span>
                            <p className="text-sm font-black text-secondary">{filteredVendors.length} Verified</p>
                        </div>
                        {(!hasSelections || !isSidebarOpen) && (
                            <button
                                onClick={handleNext}
                                disabled={selectedCount < totalServices}
                                className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl
                                    ${selectedCount >= totalServices ? 'bg-secondary text-white shadow-secondary/20 hover:scale-105 active:scale-95' : 'bg-accent/30 text-white cursor-not-allowed'}`}
                            >
                                Continue
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: SELECTED PARTNERS SIDEBAR */}
            <AnimatePresence>
                {hasSelections && (
                    <div className="fixed top-0 right-0 h-screen z-[100] flex items-start">
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{
                                width: isSidebarOpen ? 320 : 0,
                                opacity: isSidebarOpen ? 1 : 0
                            }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white border-l border-surface flex flex-col pt-8 overflow-hidden h-full shadow-[-20px_0_50px_-10px_rgba(9,99,126,0.05)]"
                        >
                            <div className="w-[320px] h-full flex flex-col">
                                <div className="flex justify-between items-center px-8 pb-6">
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-black text-primary tracking-tight">Selected</h2>
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-0.5">Partners</p>
                                    </div>
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary/30 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <BsXLg size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 scrollbar-hide pb-48">
                                    {Object.entries(formData.vendors).map(([service, vendor]) => (
                                        <motion.div
                                            key={service}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="group cursor-default"
                                        >
                                            <div className="flex gap-4 items-center mb-2">
                                                <div className="relative">
                                                    <img src={vendor.image} className="w-14 h-14 rounded-2xl object-cover shadow-lg ring-2 ring-white" alt={vendor.name} />
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-lg flex items-center justify-center text-white text-[10px]">
                                                        {getIcon(service)}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[9px] font-black tracking-[0.2em] text-primary/30 uppercase block mb-0.5 truncate">{service}</span>
                                                    <h4 className="text-sm font-black text-primary leading-tight truncate group-hover:text-secondary transition-colors">{vendor.name}</h4>
                                                    <p className="text-primary/40 text-[10px] font-bold mt-1">₹{vendor.priceMin.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="shrink-0 px-8 py-6 border-t border-surface bg-surface/50 mt-auto fixed bottom-0 right-0 w-[320px]">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <span className="text-[9px] font-black tracking-[0.2em] text-primary/30 uppercase block mb-1">Total Budget</span>
                                            <span className="text-2xl font-black text-primary tabular-nums">₹{estimatedTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-secondary">{selectedCount}/{totalServices}</p>
                                            <p className="text-[9px] font-black text-primary/30 uppercase">Selected</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        disabled={selectedCount < totalServices}
                                        className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl
                                            ${selectedCount >= totalServices ? 'bg-secondary text-white shadow-secondary/20 hover:scale-105 active:scale-95' : 'bg-accent/30 text-white cursor-not-allowed'}`}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StepVendorSelection;
