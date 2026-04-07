import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Users, ArrowUpDown, Filter, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import ManagerVendorCard from '../../../components/Global/cards/ManagerVendorCard';
import { fetchWithAuth } from '../../../utils/apiHandler';
import { refreshAccessToken } from '../../../store/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const mapVendorStatus = (rawStatus) => {
    const status = String(rawStatus || '').trim().toUpperCase();

    if (status === 'APPROVED') return 'Active';
    if (['PENDING_REVIEW', 'DOCUMENTS_REQUESTED', 'UNDER_VERIFICATION'].includes(status)) {
        return 'Under Review';
    }
    if (['REJECTED', 'SUSPENDED'].includes(status)) return 'Inactive';

    return 'Inactive';
};

const toTimestamp = (value) => {
    const d = value ? new Date(value) : null;
    return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
};

// Reusable Custom Dropdown Component
const CustomDropdown = ({
    label,
    value,
    options,
    onSelect,
    icon,
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

    const displayText = (val) => {
        if (label.includes('Category')) return val === 'All' ? 'Category: All' : val;
        if (label.includes('Status')) return val === 'All' ? 'Status: All' : val;
        if (label.includes('Sort')) {
            const sortMap = {
                'Newest': 'Sort: Newest',
                'Oldest': 'Sort: Oldest',
                'A-Z': 'Sort: Name A-Z'
            };
            return sortMap[val] || val;
        }
        return val;
    };

    const DropdownIcon = icon;

    return (
        <div className="relative min-w-40 shrink-0" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-700 transition-colors"
            >
                <span className="truncate">{displayText(value)}</span>
                {DropdownIcon ? <DropdownIcon className="w-4 h-4 text-gray-400" /> : null}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <MotionDiv
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

                        <div className="max-h-50 overflow-y-auto pr-1 custom-scrollbar">
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
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

const ManagerVendors = () => {
    const dispatch = useDispatch();

    const [vendors, setVendors] = useState([]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Newest');

    useEffect(() => {
        let cancelled = false;

        const loadVendors = async () => {
            setLoading(true);
            setError('');

            try {
                const [applicationsRes, categoriesRes] = await Promise.all([
                    fetchWithAuth(
                        `${API_BASE_URL}/api/vendor/applications?limit=500&skip=0`,
                        { method: 'GET' },
                        { dispatch, refreshAction: refreshAccessToken }
                    ),
                    fetchWithAuth(
                        `${API_BASE_URL}/auth/vendor/service-categories`,
                        { method: 'GET' },
                        { dispatch, refreshAction: refreshAccessToken }
                    ),
                ]);

                const applicationsJson = await safeJson(applicationsRes);
                const categoriesJson = await safeJson(categoriesRes);

                if (!applicationsRes.ok || !applicationsJson?.success) {
                    throw new Error(applicationsJson?.error?.message || applicationsJson?.message || 'Failed to fetch vendors');
                }

                const applications = Array.isArray(applicationsJson?.data?.applications)
                    ? applicationsJson.data.applications
                    : [];

                const mappedVendors = applications.map((app) => {
                    const createdOrJoined = app?.approvedAt || app?.submittedAt || app?.createdAt || null;
                    return {
                        id: String(app?.applicationId || app?._id || app?.authId || Math.random()).trim(),
                        authId: String(app?.authId || '').trim(),
                        logo: app?.images?.profile?.fileUrl || null,
                        name: String(app?.businessName || 'Vendor').trim() || 'Vendor',
                        category: String(app?.serviceCategory || 'Other').trim() || 'Other',
                        status: mapVendorStatus(app?.status),
                        rawStatus: String(app?.status || '').trim().toUpperCase(),
                        rating: Number(app?.rating || app?.avgRating || 0),
                        reviewCount: Number(app?.reviewCount || app?.totalReviews || 0),
                        email: String(app?.email || '—').trim() || '—',
                        phone: String(app?.phone || '—').trim() || '—',
                        joined: createdOrJoined,
                    };
                });

                const categoriesFromApi = Array.isArray(categoriesJson)
                    ? categoriesJson.filter((c) => typeof c === 'string' && c.trim())
                    : [];

                const categoriesFromData = Array.from(new Set(
                    mappedVendors.map((v) => v.category).filter(Boolean)
                )).sort((a, b) => a.localeCompare(b));

                if (cancelled) return;
                setVendors(mappedVendors);
                setServiceCategories(categoriesFromApi.length ? categoriesFromApi : categoriesFromData);
            } catch (loadError) {
                if (cancelled) return;
                setVendors([]);
                setServiceCategories([]);
                setError(loadError?.message || 'Failed to load vendors');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadVendors();

        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    const categories = useMemo(() => {
        return ['All', ...serviceCategories];
    }, [serviceCategories]);

    const statuses = ['All', 'Active', 'Under Review', 'Inactive'];

    const sortOptions = [
        { label: 'Sort: Newest', value: 'Newest' },
        { label: 'Sort: Oldest', value: 'Oldest' },
        { label: 'Sort: Name A-Z', value: 'A-Z' }
    ];

    const filteredVendors = vendors.filter((vendor) => {
        const q = normalizeText(searchTerm);
        const matchesSearch = !q
            || normalizeText(vendor.name).includes(q)
            || normalizeText(vendor.category).includes(q)
            || normalizeText(vendor.email).includes(q);
        const matchesCategory = categoryFilter === 'All' || vendor.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'Newest': return toTimestamp(b.joined) - toTimestamp(a.joined);
            case 'Oldest': return toTimestamp(a.joined) - toTimestamp(b.joined);
            case 'A-Z': return a.name.localeCompare(b.name);
            default: return 0;
        }
    });

    const verifiedVendorsCount = useMemo(() => {
        return vendors.filter((v) => v.rawStatus === 'APPROVED').length;
    }, [vendors]);

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 max-w-480 mx-auto">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
                <div>
                    <MotionH1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight"
                    >
                        Vendor Directory
                    </MotionH1>
                    <MotionP
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        View your verified vendor network.
                    </MotionP>
                </div>

                {/* Quick Stats Row */}
                <div className="flex gap-4 overflow-x-auto pb-2 xl:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 min-w-55"
                    >
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{verifiedVendorsCount}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Vendors (Verified)</div>
                        </div>
                    </MotionDiv>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                </div>
            )}

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
                    <div className="relative group min-w-50 shrink-0">
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
            <MotionDiv
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence>
                    {filteredVendors.map((vendor, index) => (
                        <ManagerVendorCard
                            key={`${vendor.id}-${index}`}
                            {...vendor}
                        />
                    ))}
                </AnimatePresence>
            </MotionDiv>

            {/* Empty State */}
            {filteredVendors.length === 0 && (
                <MotionDiv
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
                        onClick={() => {
                            setSearchTerm('');
                            setCategoryFilter('All');
                            setStatusFilter('All');
                            setSortBy('Newest');
                        }}
                        className="mt-6 text-teal-600 font-bold hover:underline"
                    >
                        Clear all filters
                    </button>
                </MotionDiv>
            )}

            {loading && (
                <div className="mt-6 text-xs text-gray-400 font-medium">Refreshing vendors...</div>
            )}
        </div>
    );
};

export default ManagerVendors;
