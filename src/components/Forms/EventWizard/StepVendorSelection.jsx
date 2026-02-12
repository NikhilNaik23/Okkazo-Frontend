import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsChevronLeft,
    BsChevronRight,
    BsXLg,
    BsFillCartCheckFill,
    BsStarFill,
    BsArrowLeft,
    BsSearch
} from "react-icons/bs";
import { MdRestaurant, MdCameraAlt, MdPalette, MdLocationOn, MdVideocam, MdMusicNote, MdFace } from 'react-icons/md';
import { dummyVendors } from "../../../data/vendorData";

const StepVendorSelection = ({ formData, handleNext, handleBack, activeServiceTab, setActiveServiceTab, handleSelectVendor }) => {
    const activeCategory = formData.services[activeServiceTab];
    const allVendors = dummyVendors[activeCategory] || [];
    const scrollRef = useRef(null);

    // State
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isLocationMenuOpen, setIsLocationMenuOpen] = React.useState(false);
    const [isServiceMenuOpen, setIsServiceMenuOpen] = React.useState(false);

    // Default filter to "All" or extract city from formData.location
    const initialLocation = formData.location ? (formData.location.split(',')[0] || "All") : "All";
    const [filterLocation, setFilterLocation] = React.useState("All");
    const [searchQuery, setSearchQuery] = React.useState("");

    const ITEMS_PER_PAGE = 12;

    // Derived Data
    const popularVendors = allVendors.filter(v => v.isPopular && v.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredVendors = allVendors.filter(v => {
        const matchesLocation = filterLocation === "All" || v.location.toLowerCase().includes(filterLocation.toLowerCase());
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLocation && matchesSearch;
    });

    const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedVendors = filteredVendors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const selectedCount = Object.keys(formData.vendors).length;
    const totalServices = formData.services.length;
    const completionPercentage = Math.round((selectedCount / totalServices) * 100) || 0;
    const estimatedTotal = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMin || 0), 0);
    const hasSelections = selectedCount > 0;

    // Locations for filter
    const locations = ["All", "Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur"];

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
    }, [activeServiceTab, filterLocation]);

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

    const VendorCard = ({ vendor, isPopular = false }) => {
        const isSelected = formData.vendors[activeCategory]?.id === vendor.id;
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative shrink-0 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 bg-white group
                    ${isPopular ? 'w-[320px] h-[400px]' : 'w-full aspect-[4/5]'}
                    ${isSelected ? 'ring-[4px] ring-[#088395] ring-offset-4' : 'hover:shadow-2xl hover:-translate-y-1'}`}
                onClick={() => handleSelectVendor(activeCategory, vendor)}
            >
                <img src={vendor.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={vendor.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] via-[#09637E]/20 to-transparent" />

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
                    <button className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${isSelected ? 'bg-[#088395] text-white shadow-lg' : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-[#09637E]'}`}>
                        {isSelected ? 'Selected' : 'Select'}
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="w-full relative min-h-screen bg-[#EBF4F6]">
            {/* LEFT: MAIN CONTENT */}
            <div className={`transition-all duration-500 pt-[114px] ${hasSelections && isSidebarOpen ? 'pr-[320px]' : 'pr-0'}`}>
                {/* TOP BAR: Categories + Cart - Optimized Alignment */}
                <div className="shrink-0 px-8 bg-transparent sticky top-6 z-[40] h-[70px] flex items-center pointer-events-none">
                    <div className="flex justify-end items-center gap-6 w-full pointer-events-auto">
                        {/* SERVICE SELECTION DROPDOWN */}
                        <div className="relative">
                            <AnimatePresence>
                                {isServiceMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-3 bg-white border border-[#EBF4F6] rounded-[2.5rem] shadow-[0_20px_50px_rgba(9,99,126,0.1)] p-4 w-[280px] z-[60] backdrop-blur-xl"
                                    >
                                        <div className="space-y-1">
                                            {formData.services.map((service, idx) => (
                                                <button
                                                    key={service}
                                                    onClick={() => {
                                                        setActiveServiceTab(idx);
                                                        setIsServiceMenuOpen(false);
                                                    }}
                                                    className={`w-full text-left px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${activeServiceTab === idx ? 'bg-[#09637E] text-white shadow-lg' : 'hover:bg-[#EBF4F6] text-[#09637E]/40 hover:text-[#09637E]'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span>{getIcon(service)}</span>
                                                        {service}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={() => setIsServiceMenuOpen(!isServiceMenuOpen)}
                                className={`flex items-center justify-between gap-4 h-12 px-6 w-[280px] rounded-2xl shadow-[0_10px_30px_rgba(9,99,126,0.1)] hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest border
                                    ${isServiceMenuOpen ? 'bg-white text-[#09637E] border-[#09637E]' : 'bg-white text-[#09637E]/60 border-[#EBF4F6] hover:border-[#09637E]'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span>{getIcon(activeCategory)}</span>
                                    {activeCategory}
                                </div>
                                <BsChevronRight className={`transition-transform duration-300 ${isServiceMenuOpen ? 'rotate-90' : 'rotate-0'}`} size={12} />
                            </button>
                        </div>

                        {/* CART ICON INTEGRATED HERE - TO THE RIGHT OF SERVICES */}
                        {hasSelections && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={`relative w-11 h-11 rounded-[18px] flex items-center justify-center transition-all shadow-xl
                                    ${isSidebarOpen ? 'bg-[#088395] text-white' : 'bg-[#09637E] text-white hover:scale-105 active:scale-95'}`}
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
                                <h2 className="text-6xl font-black text-[#09637E] tracking-tighter leading-none">Popular <span className="text-[#088395]">{activeCategory}</span></h2>
                                <p className="text-[11px] font-black text-[#09637E]/20 uppercase tracking-[0.4em] mt-3">Top tier and most booked partners by creators</p>
                            </div>

                            <div className="relative group/slider">
                                {/* Left Arrow Overlay */}
                                <button
                                    className="absolute left-0 top-0 bottom-0 z-40 w-20 flex items-center justify-center hidden md:flex opacity-0 group-hover/slider:opacity-100 transition-all text-[#09637E] hover:scale-125 hover:text-[#088395]"
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
                                            <VendorCard vendor={vendor} isPopular />
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Right Arrow Overlay */}
                                <button
                                    className="absolute right-0 top-0 bottom-0 z-40 w-20 flex items-center justify-center hidden md:flex opacity-0 group-hover/slider:opacity-100 transition-all text-[#09637E] hover:scale-125 hover:text-[#088395]"
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
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#7AB2B2]/20 to-transparent" />
                            <h2 className="text-[12px] font-black text-[#09637E]/30 uppercase tracking-[0.8em]">All {activeCategory} Collections</h2>
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#7AB2B2]/20 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                            {paginatedVendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} />)}
                        </div>

                        {paginatedVendors.length === 0 && (
                            <div className="py-40 text-center bg-white rounded-[5rem] border-2 border-dashed border-[#EBF4F6]">
                                <p className="text-sm font-black text-[#09637E]/20 uppercase tracking-[0.5em]">No unique partners in this radius</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM BAR WITH PAGINATION */}
                <div className="fixed bottom-0 left-0 right-[var(--sidebar-width,0px)] h-24 bg-white/95 backdrop-blur-2xl border-t border-[#EBF4F6] z-50 flex items-center justify-between px-10 shadow-[0_-15px_50px_-15px_rgba(9,99,126,0.15)] transition-all duration-500">
                    <button onClick={handleBack} className="flex items-center gap-3 text-[#09637E]/40 hover:text-[#09637E] transition-all group">
                        <div className="w-10 h-10 rounded-full border border-[#EBF4F6] flex items-center justify-center group-hover:bg-[#EBF4F6]/50">
                            <BsArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">Back</span>
                    </button>

                    <div className="flex-1 shrink flex justify-center px-4 md:px-8">
                        <div className="relative w-full max-w-xs xl:max-w-sm group">
                            <BsSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#09637E]/30 group-focus-within:text-[#09637E] transition-colors" />
                            <input
                                type="text"
                                placeholder={`Search for ${activeCategory}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-14 pr-6 bg-[#EBF4F6] border border-[#09637E]/10 rounded-2xl text-xs font-bold text-[#09637E] placeholder-[#09637E]/30 focus:outline-none focus:ring-4 focus:ring-[#09637E]/5 transition-all"
                            />
                        </div>
                    </div>

                    {/* PAGINATION TOOL */}
                    <div className="flex items-center gap-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="w-12 h-12 rounded-2xl bg-[#EBF4F6]/50 flex items-center justify-center text-[#09637E]/30 hover:bg-[#09637E] hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none"
                        >
                            <BsChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all
                                        ${currentPage === page ? 'bg-[#09637E] text-white shadow-xl shadow-[#09637E]/20' : 'bg-[#EBF4F6]/50 text-[#09637E]/30 hover:bg-[#09637E]/10'}`}
                                >
                                    {page.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="w-12 h-12 rounded-2xl bg-[#EBF4F6]/50 flex items-center justify-center text-[#09637E]/30 hover:bg-[#09637E] hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none"
                        >
                            <BsChevronRight size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* LOCATION DROP-UP MENU */}
                        <div className="relative">
                            <AnimatePresence>
                                {isLocationMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-4 bg-white border border-[#EBF4F6] rounded-[2.5rem] shadow-[0_20px_50px_rgba(9,99,126,0.1)] p-4 w-[240px] z-[60] backdrop-blur-xl"
                                    >
                                        <div className="space-y-1">
                                            {locations.map(loc => (
                                                <button
                                                    key={loc}
                                                    onClick={() => {
                                                        setFilterLocation(loc);
                                                        setIsLocationMenuOpen(false);
                                                    }}
                                                    className={`w-full text-left px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${filterLocation === loc ? 'bg-[#09637E] text-white shadow-lg' : 'hover:bg-[#EBF4F6] text-[#09637E]/40 hover:text-[#09637E]'}`}
                                                >
                                                    {loc}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest border
                                    ${isLocationMenuOpen ? 'bg-white text-[#09637E] border-[#09637E]' : 'bg-[#09637E] text-white border-[#09637E]'}`}
                            >
                                <MdLocationOn size={16} />
                                {filterLocation}
                                <BsChevronRight className={`transition-transform duration-300 ${isLocationMenuOpen ? '-rotate-90' : 'rotate-90'}`} size={12} />
                            </button>
                        </div>

                        <div className="text-right min-w-[120px]">
                            <span className="text-[10px] font-black tracking-[0.2em] text-[#09637E]/20 uppercase block mb-1">Total Available</span>
                            <p className="text-sm font-black text-[#09637E]">{filteredVendors.length} Verified</p>
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={selectedCount < totalServices}
                            className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl
                                ${selectedCount >= totalServices ? 'bg-[#088395] text-white shadow-[#088395]/20 hover:scale-105 active:scale-95' : 'bg-[#7AB2B2]/30 text-white cursor-not-allowed'}`}
                        >
                            Continue
                        </button>
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
                            className="bg-white border-l border-[#EBF4F6] flex flex-col pt-8 overflow-hidden h-full shadow-[-20px_0_50px_-10px_rgba(9,99,126,0.05)]"
                        >
                            <div className="w-[320px] h-full flex flex-col">
                                <div className="flex justify-between items-center px-8 pb-6">
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-black text-[#09637E] tracking-tight">Selected</h2>
                                        <p className="text-[10px] font-black text-[#088395] uppercase tracking-widest mt-0.5">Partners</p>
                                    </div>
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="w-10 h-10 rounded-xl bg-[#EBF4F6] flex items-center justify-center text-[#09637E]/30 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <BsXLg size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 scrollbar-hide pb-32">
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
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#088395] rounded-lg flex items-center justify-center text-white text-[10px]">
                                                        {getIcon(service)}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[9px] font-black tracking-[0.2em] text-[#09637E]/30 uppercase block mb-0.5 truncate">{service}</span>
                                                    <h4 className="text-sm font-black text-[#09637E] leading-tight truncate group-hover:text-[#088395] transition-colors">{vendor.name}</h4>
                                                    <p className="text-[#09637E]/40 text-[10px] font-bold mt-1">₹{vendor.priceMin.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="shrink-0 px-8 py-8 border-t border-[#EBF4F6] bg-[#EBF4F6]/50 mt-auto fixed bottom-0 w-[320px]">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[9px] font-black tracking-[0.2em] text-[#09637E]/30 uppercase block mb-1">Total Budget</span>
                                            <span className="text-2xl font-black text-[#09637E] tabular-nums">₹{estimatedTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-[#088395]">{selectedCount}/{totalServices}</p>
                                            <p className="text-[9px] font-black text-[#09637E]/30 uppercase">Selected</p>
                                        </div>
                                    </div>
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
