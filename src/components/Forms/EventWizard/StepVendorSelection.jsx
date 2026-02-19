import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    BsChevronLeft,
    BsChevronRight,
    BsSearch,
    BsCheck,
    BsCalendarEvent,
    BsFilter,
    BsPlus,
    BsX,
    BsXLg,
    BsArrowRight
} from "react-icons/bs";
import { dummyVendors } from "../../../data/vendorData";
import { vendorServiceCategories, isDateHighDemand } from "../../../data/planningWizardData";
import { filterOptions } from "../../../data/vendorSelectionData";
import SharedCalendar from "./SharedCalendar";

// Extracted Components
import { VendorDetailsModal, VendorCard, SelectionSidebar } from './VendorSelection';

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
    const priceMultiplier = isHighDemand ? 1.5 : 1;

    const handleSelectVendorWrapper = (category, vendor) => {
        const adjustedVendor = {
            ...vendor,
            priceMin: (vendor.priceMin || 0) * priceMultiplier,
            priceMax: (vendor.priceMax || Math.round((vendor.priceMin || 0) * 1.5)) * priceMultiplier,
            priceMultiplier: priceMultiplier
        };
        handleSelectVendor(category, adjustedVendor);
    };

    const handleAddService = (service) => {
        const newServices = [...formData.services, service];
        handleChange('services', newServices);
        setActiveServiceTab(newServices.length - 1);
        setShowAddServiceDropdown(false);
    };

    const handleRemoveService = (index) => {
        const serviceToRemove = formData.services[index];
        const newServices = formData.services.filter((_, i) => i !== index);

        if (formData.vendors[serviceToRemove]) {
            const newVendors = { ...formData.vendors };
            delete newVendors[serviceToRemove];
            handleChange('vendors', newVendors);
            setTimeout(() => handleChange('services', newServices), 50);
        } else {
            handleChange('services', newServices);
        }

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

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            allVendors = allVendors.filter(v =>
                v.name.toLowerCase().includes(query) ||
                v.location.toLowerCase().includes(query)
            );
        }

        if (activeCategory === "Venue" && formData.guests) {
            allVendors = allVendors.filter(v => (v.capacity || 1000) >= formData.guests);
        }

        allVendors = allVendors.filter(v => {
            const vendorMax = v.priceMax || (v.priceMin * 1.5);
            return v.priceMin <= priceRange.max && vendorMax >= priceRange.min;
        }).map(v => ({ ...v, category: activeCategory }));

        switch (sortOption) {
            case 'Top Rated':
                allVendors = [...allVendors].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
                break;
            case 'Trending':
                allVendors = [...allVendors].sort((a, b) => b.reviews - a.reviews || (b.isPopular === a.isPopular ? 0 : b.isPopular ? 1 : -1));
                break;
            case 'Nearest':
                allVendors = [...allVendors].reverse();
                break;
            case 'Price: Low to High':
                allVendors = [...allVendors].sort((a, b) => a.priceMin - b.priceMin);
                break;
            case 'Price: High to Low':
                allVendors = [...allVendors].sort((a, b) => b.priceMin - a.priceMin);
                break;
            case 'Capacity: High to Low':
                allVendors = [...allVendors].sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
                break;
            case 'Capacity: Low to High':
                allVendors = [...allVendors].sort((a, b) => (a.capacity || 0) - (b.capacity || 0));
                break;
            default:
                break;
        }

        return allVendors;
    }, [activeCategory, searchQuery, sortOption, priceRange]);

    const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
    const paginatedVendors = filteredVendors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const allServicesSelected = formData.services?.every(service => formData.vendors[service]);
    const estimatedTotal = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMin || 0), 0);
    const estimatedMax = Object.values(formData.vendors).reduce((acc, v) => acc + (v.priceMax || Math.round((v.priceMin || 0) * 1.5)), 0);

    return (
        <div className="w-full min-h-screen bg-surface relative flex flex-col overflow-hidden">
            <div aria-hidden className="fixed top-0 left-0 right-0 h-24 bg-surface pointer-events-none z-90" />

            {/* Modal */}
            <AnimatePresence>
                {selectedVendorForDetails && (
                    <VendorDetailsModal
                        vendor={selectedVendorForDetails}
                        onClose={() => setSelectedVendorForDetails(null)}
                        onSelect={(v) => handleSelectVendorWrapper(activeCategory, v || selectedVendorForDetails)}
                        isSelected={formData.vendors[activeCategory]?.id === selectedVendorForDetails.id}
                        priceMultiplier={priceMultiplier}
                        guestCount={formData.guests}
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

                            {/* Service Category Tabs */}
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
                                        {(() => {
                                            const options = [...filterOptions];
                                            if (activeCategory === "Venue") {
                                                options.push("Capacity: High to Low", "Capacity: Low to High");
                                            }
                                            return options;
                                        })().map(filter => (
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
                <SelectionSidebar
                    vendors={formData.vendors}
                    isHighDemand={isHighDemand}
                    estimatedTotal={estimatedTotal}
                    estimatedMax={estimatedMax}
                    allServicesSelected={allServicesSelected}
                    onRemoveVendor={handleRemoveVendorSelection}
                    onBack={handleBack}
                    onNext={handleNext}
                />
            </div>
        </div>
    );
};

export default StepVendorSelection;
