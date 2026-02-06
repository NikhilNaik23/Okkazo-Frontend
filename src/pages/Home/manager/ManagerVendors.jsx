import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, SlidersHorizontal, Users, ShieldCheck, Clock, TrendingUp, ArrowUpDown, Star, Filter, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ManagerVendorCard from '../../../components/Global/cards/ManagerVendorCard';

// Reusable Custom Dropdown Component
const CustomDropdown = ({
    label,
    value,
    options,
    onSelect,
    icon: Icon,
    searchable = false,
    placeholder = "Search..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options if searchable
    const filteredOptions = searchable
        ? options.filter(opt =>
            (typeof opt === 'string' ? opt : opt.label).toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    const getDisplayValue = (val) => {
        if (!val) return label;
        // Handle complex objects vs strings
        const found = options.find(o => (typeof o === 'string' ? o === val : o.value === val));
        if (!found) return val; // Fallback
        return typeof found === 'string' ? (found === 'All' ? label : found) : found.label;
    };

    // For the specific format requested: "Category: All", "Status: Active" etc.
    // If value is "All" or "Any", show Header Label (e.g. "Category: All"). 
    // Otherwise show just the value ? Or "Category: Value"?
    // The user's previous code had logic like: `cat === 'All' ? 'Category: All' : cat`
    // Let's replicate generic logic:
    const displayText = (val) => {
        const isDefault = val === 'All' || val === 'Any' || val === 'Newest'; // simplistic check

        // Custom formatting based on the 'label' prop context
        if (label.includes('Category')) return val === 'All' ? 'Category: All' : val;
        if (label.includes('Status')) return val === 'All' ? 'Status: All' : val;
        if (label.includes('Rating')) return val === 'Any' ? 'Rating: Any' : `${val}+ Stars`;
        if (label.includes('Sort')) {
            const sortMap = {
                'Newest': 'Sort: Newest',
                'Oldest': 'Sort: Oldest',
                'Rating High': 'Sort: Top Rated',
                'A-Z': 'Sort: Name A-Z'
            };
            return sortMap[val] || val;
        }
        return val;
    };

    return (
        <div className="relative min-w-[160px] shrink-0" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-700 transition-colors"
            >
                <span className="truncate">{displayText(value)}</span>
                <Icon className="w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 overflow-hidden"
                    >
                        {searchable && (
                            <div className="relative mb-2 px-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={placeholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-500/20 outline-none"
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => {
                                    const optVal = typeof opt === 'string' ? opt : opt.value;
                                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                                    const isSelected = value === optVal;

                                    return (
                                        <button
                                            key={optVal}
                                            onClick={() => {
                                                onSelect(optVal);
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${isSelected
                                                    ? 'bg-teal-50 text-teal-700'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {optLabel}
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-3 py-4 text-center text-xs text-gray-400">
                                    No results found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ManagerVendors = () => {
    // 1. Mock Data
    const [vendors] = useState([
        {
            id: 1,
            name: 'Epicurean Catering',
            category: 'Catering',
            status: 'Active',
            rating: 4.8,
            reviewCount: 124,
            email: 'contact@epicurean.com',
            phone: '+1 (555) 123-4567',
            joined: '2023-01-15'
        },
        {
            id: 2,
            name: 'Stellar Decors',
            category: 'Decor',
            status: 'Under Review',
            rating: 4.5,
            reviewCount: 45,
            email: 'info@stellar.com',
            phone: '+1 (555) 987-6543',
            joined: '2023-03-22'
        },
        {
            id: 3,
            name: 'Apex Audio Visual',
            category: 'Audio/Visual',
            status: 'Active',
            rating: 5.0,
            reviewCount: 89,
            email: 'sales@apexaudiovisual.com',
            phone: '+1 (555) 345-6789',
            joined: '2022-11-05'
        },
        {
            id: 4,
            name: 'SafeGuard Pros',
            category: 'Security',
            status: 'Inactive',
            rating: 3.7,
            reviewCount: 12,
            email: 'hq@safeguard.com',
            phone: '+1 (555) 765-4321',
            joined: '2023-05-10'
        },
        {
            id: 5,
            name: 'Luxe Linens',
            category: 'Decor',
            status: 'Active',
            rating: 4.2,
            reviewCount: 230,
            email: 'orders@luxelinens.com',
            phone: '+1 (555) 111-2222',
            joined: '2023-02-18'
        },
        {
            id: 6,
            name: 'Capture Moments',
            category: 'Photography',
            status: 'Active',
            rating: 4.9,
            reviewCount: 67,
            email: 'hello@capturemoments.com',
            phone: '+1 (555) 999-8888',
            joined: '2023-04-30'
        }
    ]);

    // 2. State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [ratingFilter, setRatingFilter] = useState('Any');
    const [sortBy, setSortBy] = useState('Newest');

    // Filter Options
    const categories = ['All', 'Catering', 'Decor', 'Audio/Visual', 'Security', 'Photography', 'Transport', 'Entertainment', 'Staffing', 'Florist'];
    const statuses = ['All', 'Active', 'Inactive', 'Under Review'];
    const ratingOptions = [
        { label: 'Rating: Any', value: 'Any' },
        { label: '4.5+ Stars', value: '4.5' },
        { label: '4.0+ Stars', value: '4.0' },
        { label: '3.5+ Stars', value: '3.5' }
    ];
    const sortOptions = [
        { label: 'Sort: Newest', value: 'Newest' },
        { label: 'Sort: Oldest', value: 'Oldest' },
        { label: 'Sort: Top Rated', value: 'Rating High' },
        { label: 'Sort: Name A-Z', value: 'A-Z' }
    ];

    // 3. Filter & Sort Logic
    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || vendor.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;
        const matchesRating = ratingFilter === 'Any' || vendor.rating >= parseFloat(ratingFilter);

        return matchesSearch && matchesCategory && matchesStatus && matchesRating;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'Newest': return new Date(b.joined) - new Date(a.joined);
            case 'Oldest': return new Date(a.joined) - new Date(b.joined);
            case 'Rating High': return b.rating - a.rating;
            case 'Rating Low': return a.rating - b.rating;
            case 'A-Z': return a.name.localeCompare(b.name);
            default: return 0;
        }
    });

    // Stats Calculation
    const activeVendors = vendors.filter(v => v.status === 'Active').length;
    const reviewVendors = vendors.filter(v => v.status === 'Under Review').length;
    const avgRating = (vendors.reduce((acc, curr) => acc + curr.rating, 0) / vendors.length).toFixed(1);

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 max-w-[1920px] mx-auto">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight"
                    >
                        Vendor Directory
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        Manage your network of {vendors.length} global partners.
                    </motion.p>
                </div>

                {/* Quick Stats Row */}
                <div className="flex gap-4 overflow-x-auto pb-2 xl:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {[
                        { label: 'Total Vendors', value: vendors.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Active Partners', value: activeVendors, icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' },
                        { label: 'Pending Review', value: reviewVendors, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                        { label: 'Avg Rating', value: avgRating, icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 min-w-[180px]"
                        >
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{stat.value}</div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-8 bg-white p-2 rounded-3xl shadow-sm border border-gray-100 sticky top-4 z-30">

                {/* Scrollable Container with overflowing visible for dropdowns */}
                <div className="flex items-center gap-3 w-full xl:w-auto px-2 overflow-x-auto xl:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-4 xl:pb-0">

                    {/* Category Dropdown (Searchable) */}
                    <CustomDropdown
                        label="Category"
                        value={categoryFilter}
                        options={categories}
                        onSelect={setCategoryFilter}
                        icon={Filter}
                        searchable={true}
                        placeholder="Find category..."
                    />

                    {/* Search Pill */}
                    <div className="relative group min-w-[200px] shrink-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-teal-100 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-semibold transition-all outline-none"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <CustomDropdown
                        label="Status"
                        value={statusFilter}
                        options={statuses}
                        onSelect={setStatusFilter}
                        icon={SlidersHorizontal}
                    />

                    {/* Rating Dropdown */}
                    <CustomDropdown
                        label="Rating"
                        value={ratingFilter}
                        options={ratingOptions}
                        onSelect={setRatingFilter}
                        icon={Star}
                    />

                    {/* Sort By Dropdown */}
                    <CustomDropdown
                        label="Sort"
                        value={sortBy}
                        options={sortOptions}
                        onSelect={setSortBy}
                        icon={ArrowUpDown}
                    />
                </div>
            </div>

            {/* Grid Area */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence>
                    {filteredVendors.map((vendor) => (
                        <ManagerVendorCard
                            key={vendor.id}
                            {...vendor}
                            onEdit={() => console.log('Edit', vendor.id)}
                            onUpdateStatus={() => console.log('Update Status', vendor.id)}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredVendors.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Filter className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No vendors found</h3>
                    <p className="text-gray-500 mt-1 max-w-md">
                        We couldn't find any vendors matching your current filters. Try adjusting your search criteria.
                    </p>
                    <button
                        onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setStatusFilter('All'); setRatingFilter('Any'); }}
                        className="mt-6 text-teal-600 font-bold hover:underline"
                    >
                        Clear all filters
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default ManagerVendors;
