import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { fetchWithAuth } from '../../../utils/apiHandler';
import { useDispatch } from 'react-redux';
import { refreshAccessToken } from '../../../store/slices/authSlice';
import { toast } from 'react-hot-toast';

// Extracted Components
import { VendorDetailsModal, VendorCard, SelectionSidebar } from './VendorSelection';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Fetch vendors/services within a reasonable driving radius from the event location.
// Backend only enables geo filtering when `radiusKm` is present in the query.
const DEFAULT_VENDOR_RADIUS_KM = 120;

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const DEFAULT_MAX_PRICE_MULTIPLIER = 1.5;

const SERVICE_ALIASES = {
    catering: 'Catering & Drinks',
    'catering and drinks': 'Catering & Drinks',
    'catering & drink': 'Catering & Drinks',
};

const canonicalizeServiceLabel = (value) => {
    const raw = value == null ? '' : String(value).trim();
    if (!raw) return '';

    const key = raw.toLowerCase();
    const alias = SERVICE_ALIASES[key];
    return alias || raw;
};

const normalizeSelectedVendorPricing = (vendor, priceMultiplier) => {
    const v = vendor && typeof vendor === 'object' ? vendor : {};
    const prevMultiplierRaw = Number(v?.priceMultiplier);
    const prevMultiplier = Number.isFinite(prevMultiplierRaw) && prevMultiplierRaw > 0 ? prevMultiplierRaw : 1;

    const nextMultiplierRaw = Number(priceMultiplier);
    const nextMultiplier = Number.isFinite(nextMultiplierRaw) && nextMultiplierRaw > 0 ? nextMultiplierRaw : 1;

    const unitPriceRaw = Number(v?.unitPrice ?? v?.priceMin ?? 0);
    const derivedBaseUnitPrice = Number.isFinite(unitPriceRaw) && unitPriceRaw > 0 ? unitPriceRaw / prevMultiplier : 0;
    const baseUnitPriceRaw = Number(v?.baseUnitPrice ?? derivedBaseUnitPrice);
    const baseUnitPrice = Number.isFinite(baseUnitPriceRaw) && baseUnitPriceRaw > 0 ? baseUnitPriceRaw : 0;

    const priceMinRaw = Number(v?.priceMin ?? baseUnitPrice ?? 0);
    const derivedBaseMin = Number.isFinite(priceMinRaw) && priceMinRaw > 0 ? priceMinRaw / prevMultiplier : 0;
    const basePriceMinRaw = Number(v?.basePriceMin ?? derivedBaseMin ?? baseUnitPrice ?? 0);
    const basePriceMin = Number.isFinite(basePriceMinRaw) && basePriceMinRaw > 0 ? basePriceMinRaw : 0;

    const explicitMaxMultiplierRaw = Number(v?.maxPriceMultiplier);
    const maxPriceMultiplier = Number.isFinite(explicitMaxMultiplierRaw) && explicitMaxMultiplierRaw > 0
        ? explicitMaxMultiplierRaw
        : DEFAULT_MAX_PRICE_MULTIPLIER;

    const priceMaxRaw = Number(v?.priceMax);
    const derivedBaseMax = Number.isFinite(priceMaxRaw) && priceMaxRaw > 0 ? priceMaxRaw / prevMultiplier : 0;
    const basePriceMaxFallback = Math.round(basePriceMin * maxPriceMultiplier);
    const basePriceMaxRaw = Number(v?.basePriceMax ?? derivedBaseMax ?? basePriceMaxFallback);
    const basePriceMax = Number.isFinite(basePriceMaxRaw) && basePriceMaxRaw > 0 ? basePriceMaxRaw : basePriceMaxFallback;

    return {
        ...v,
        baseUnitPrice,
        basePriceMin,
        basePriceMax,
        maxPriceMultiplier,
        priceMultiplier: nextMultiplier,
        unitPrice: Math.round(baseUnitPrice * nextMultiplier),
        priceMin: Math.round(basePriceMin * nextMultiplier),
        priceMax: Math.round(basePriceMax * nextMultiplier),
    };
};

const pickFallbackImage = (category, index = 0) => {
    const list = dummyVendors?.[category];
    if (Array.isArray(list) && list.length > 0) {
        return list[index % list.length]?.image;
    }
    return "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=2069&auto=format&fit=crop";
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
    const a1 = Number(lat1);
    const o1 = Number(lon1);
    const a2 = Number(lat2);
    const o2 = Number(lon2);
    if (![a1, o1, a2, o2].every((v) => Number.isFinite(v))) return null;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(a2 - a1);
    const dLon = toRad(o2 - o1);

    const sLat1 = toRad(a1);
    const sLat2 = toRad(a2);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(sLat1) * Math.cos(sLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getVenueServicePrimaryImage = (serviceDetails) => {
    const images = Array.isArray(serviceDetails?.images) ? serviceDetails.images : [];
    const first = images[0]?.url;
    return first || serviceDetails?.image || null;
};

const mapBackendVenueServiceToCard = ({ vendor, service, index = 0, eventLat, eventLng }) => {
    const serviceId = service?.serviceId || service?.id || null;
    const details = service?.details || {};

    const serviceLat = details?.locationLat ?? null;
    const serviceLng = details?.locationLng ?? null;
    const computedDistance = haversineKm(eventLat, eventLng, serviceLat, serviceLng);

    const image = getVenueServicePrimaryImage(details) || pickFallbackImage('Venue', index);
    const locationName =
        details?.locationAreaName ||
        details?.location ||
        vendor?.location?.name ||
        'Location TBD';

    const unitPrice = Number(service?.price ?? vendor?.priceMin ?? 0);

    return {
        id: serviceId || `${vendor?.vendorAuthId || 'venue'}-${index}`,
        serviceId: serviceId ? String(serviceId) : null,
        vendorAuthId: vendor?.vendorAuthId || null,
        vendorBusinessName: vendor?.businessName || null,
        category: 'Venue',
        categoryId: vendor?.categoryId || 'venues',
        rating: service?.rating != null ? String(service.rating) : (vendor?.rating != null ? String(vendor.rating) : '0'),
        reviews: Number(vendor?.reviews || 0),
        description: service?.description || vendor?.description || null,
        image,
        banner: image,
        location: locationName,
        mapsUrl: details?.locationMapsUrl || vendor?.location?.mapsUrl || null,
        lat: Number.isFinite(Number(serviceLat)) ? Number(serviceLat) : null,
        lng: Number.isFinite(Number(serviceLng)) ? Number(serviceLng) : null,
        distanceKm: computedDistance != null ? computedDistance : vendor?.distanceKm,
        capacity: details?.capacity != null ? Number(details.capacity) : vendor?.capacity,

        pricingUnit: 'EVENT',
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
        priceMin: Number.isFinite(unitPrice) ? unitPrice : 0,
        priceMax: Math.round((Number.isFinite(unitPrice) ? unitPrice : 0) * DEFAULT_MAX_PRICE_MULTIPLIER),
        maxPriceMultiplier: DEFAULT_MAX_PRICE_MULTIPLIER,

        details,
        services: Array.isArray(vendor?.services) ? vendor.services : [],
        _raw: vendor,
        _rawService: service,
    };
};

const extractLatLng = (value) => {
    if (!value || typeof value !== 'object') return { lat: null, lng: null };

    const candidates = [
        { lat: value?.latitude, lng: value?.longitude },
        { lat: value?.lat, lng: value?.lng },
        { lat: value?.locationLat, lng: value?.locationLng },
        { lat: value?.location?.latitude, lng: value?.location?.longitude },
        { lat: value?.location?.lat, lng: value?.location?.lng },
        { lat: value?.details?.locationLat, lng: value?.details?.locationLng },
    ];

    for (const c of candidates) {
        const lat = Number(c?.lat);
        const lng = Number(c?.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    return { lat: null, lng: null };
};

const mapBackendVendorToCard = (vendor, category, index = 0, eventLat, eventLng) => {
    const name = vendor?.businessName || 'Vendor';
    const rating = vendor?.rating != null ? String(vendor.rating) : '0';
    const location = vendor?.location?.name || 'Location TBD';

    const services = Array.isArray(vendor?.services) ? vendor.services : [];
    const priceMin = vendor?.priceMin != null ? Number(vendor.priceMin) : (services[0]?.price != null ? Number(services[0].price) : 0);
    const priceMax = vendor?.priceMax != null ? Number(vendor.priceMax) : Math.round(priceMin * 1.5);

    const image = services?.[0]?.details?.image || pickFallbackImage(category, index);

    const { lat, lng } = extractLatLng(vendor);
    const computedDistance = haversineKm(eventLat, eventLng, lat, lng);

    return {
        id: vendor?.vendorAuthId || `${category}-${index}`,
        vendorAuthId: vendor?.vendorAuthId || null,
        name,
        rating,
        reviews: Number(vendor?.reviews || 0),
        priceMin,
        priceMax,
        image,
        location,
        mapsUrl: vendor?.location?.mapsUrl || null,
        categoryId: vendor?.categoryId || null,
        isPopular: Boolean(vendor?.isPopular),
        capacity: vendor?.capacity,
        lat,
        lng,
        distanceKm: computedDistance != null ? computedDistance : vendor?.distanceKm,
        description: vendor?.description || null,
        services,
        category,
        _raw: vendor,
    };
};

const StepVendorSelection = ({ formData, handleNext, handleBack, activeServiceTab, setActiveServiceTab, handleSelectVendor, handleChange, minDateString }) => {
    const dispatch = useDispatch();
    const activeCategoryRaw = formData.services[activeServiceTab] || "Venue";
    const activeCategory = canonicalizeServiceLabel(activeCategoryRaw);
    const eventId = formData?.id;
    const eventLat = formData?.lat;
    const eventLng = formData?.lng;

    const attendeeInfo = useMemo(() => {
        const listingType = String(formData?.listingType || 'Private');

        if (listingType === 'Public') {
            const capacity = parseInt(formData?.totalCapacity, 10);
            const fallbackTicketsTotal = Array.isArray(formData?.tickets)
                ? formData.tickets.reduce((acc, t) => acc + (parseInt(t?.quantity, 10) || 0), 0)
                : 0;

            return {
                attendeeCount: Number.isFinite(capacity) && capacity > 0 ? capacity : fallbackTicketsTotal,
                attendeeLabel: 'Tickets',
            };
        }

        const guests = parseInt(formData?.guests, 10);
        return {
            attendeeCount: Number.isFinite(guests) ? guests : 0,
            attendeeLabel: 'Guests',
        };
    }, [formData?.guests, formData?.listingType, formData?.tickets, formData?.totalCapacity]);

    const isVendorStepComplete = useMemo(() => {
        const services = Array.isArray(formData?.services) ? formData.services : [];
        if (services.length === 0) return false;

        const chosen = formData?.vendors || {};
        return services.every((service) => {
            const v = chosen?.[service] || chosen?.[canonicalizeServiceLabel(service)];
            return Boolean(v && (v.vendorAuthId || v.authId || v.id));
        });
    }, [formData?.services, formData?.vendors]);

    const selectedVendorForActiveCategory = formData?.vendors?.[activeCategoryRaw] || formData?.vendors?.[activeCategory];
    const hasSelectedVendorForService = useCallback(
        (serviceLabel) => Boolean(formData?.vendors?.[serviceLabel] || formData?.vendors?.[canonicalizeServiceLabel(serviceLabel)]),
        [formData?.vendors]
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVendorForDetails, setSelectedVendorForDetails] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [vendorsLoading, setVendorsLoading] = useState(false);
    const [vendorsError, setVendorsError] = useState(null);
    const [vendorsByCategory, setVendorsByCategory] = useState({});
    const [vendorsRefreshKey, setVendorsRefreshKey] = useState(0);

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

    const prevPriceMultiplierRef = useRef(priceMultiplier);

    const persistVendorSelection = useCallback(async ({ category, vendor }) => {
        const normalizedCategory = canonicalizeServiceLabel(category);
        if (!eventId || !normalizedCategory || !vendor) return true;

        const vendorAuthId = vendor.vendorAuthId || vendor.authId;
        if (!vendorAuthId) return true;

        const selectedServiceId = (() => {
            const raw = vendor?.selectedPackage?.serviceId ?? vendor?.selectedPackage?.id ?? vendor?.serviceId;
            const s = raw != null ? String(raw).trim() : '';
            return s || null;
        })();

        const attendeeCountForPricing = Math.max(1, Number(attendeeInfo?.attendeeCount || 0));
        const pricingUnit = vendor?.pricingUnit
            || (String(category || '').toLowerCase().includes('catering') ? 'PER_PLATE' : 'EVENT');
        const unitPrice = Number(vendor?.unitPrice ?? vendor?.priceMin ?? 0);
        const maxMultiplier = Number(vendor?.maxPriceMultiplier || DEFAULT_MAX_PRICE_MULTIPLIER);

        const lineMin = pricingUnit === 'PER_PLATE'
            ? Math.round(unitPrice * attendeeCountForPricing)
            : Math.round(unitPrice);
        const lineMax = Math.round(lineMin * (Number.isFinite(maxMultiplier) && maxMultiplier > 0 ? maxMultiplier : DEFAULT_MAX_PRICE_MULTIPLIER));

        const response = await fetchWithAuth(
            `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}/vendors`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    service: normalizedCategory,
                    vendorAuthId,
                    ...(selectedServiceId ? { serviceId: selectedServiceId } : {}),
                    servicePrice: {
                        min: Number.isFinite(lineMin) && lineMin > 0 ? lineMin : 0,
                        max: Number.isFinite(lineMax) && lineMax > 0 ? lineMax : 0,
                    },
                }),
            },
            { dispatch, refreshAction: refreshAccessToken }
        );

        const data = await safeJson(response);
        if (!response.ok || !data?.success) {
            const err = new Error(data?.message || 'Failed to save vendor selection');
            err.status = response.status;
            throw err;
        }

        return true;
    }, [attendeeInfo?.attendeeCount, dispatch, eventId]);

    useEffect(() => {
        const prevMultiplier = prevPriceMultiplierRef.current;
        if (prevMultiplier === priceMultiplier) return;
        prevPriceMultiplierRef.current = priceMultiplier;

        const chosen = formData?.vendors && typeof formData.vendors === 'object' ? formData.vendors : {};
        const categories = Object.keys(chosen);
        if (categories.length === 0) return;

        const nextVendors = { ...chosen };
        categories.forEach((category) => {
            nextVendors[category] = normalizeSelectedVendorPricing(chosen[category], priceMultiplier);
        });

        handleChange('vendors', nextVendors);

        if (!eventId) return;
        Promise.all(
            categories.map(async (category) => {
                try {
                    await persistVendorSelection({ category, vendor: nextVendors[category] });
                } catch (e) {
                    console.error('Failed to persist repriced vendor selection:', e);
                }
            })
        ).catch(() => undefined);
    }, [eventId, formData?.vendors, handleChange, persistVendorSelection, priceMultiplier]);

    const handleSelectVendorWrapper = async (category, vendor) => {
        const hasExplicitUnitPricing = vendor?.unitPrice != null;

        const baseVendor = hasExplicitUnitPricing
            ? {
                ...vendor,
                priceMin: vendor.priceMin != null ? vendor.priceMin : Number(vendor.unitPrice || 0),
                priceMax: vendor.priceMax != null ? vendor.priceMax : Math.round(Number(vendor.unitPrice || 0) * DEFAULT_MAX_PRICE_MULTIPLIER),
                maxPriceMultiplier: vendor.maxPriceMultiplier || DEFAULT_MAX_PRICE_MULTIPLIER,
            }
            : {
                ...vendor,
                priceMax: vendor.priceMax || Math.round((vendor.priceMin || 0) * DEFAULT_MAX_PRICE_MULTIPLIER),
                maxPriceMultiplier: vendor.maxPriceMultiplier || DEFAULT_MAX_PRICE_MULTIPLIER,
            };

        const adjustedVendor = normalizeSelectedVendorPricing(baseVendor, priceMultiplier);

        try {
            await persistVendorSelection({ category, vendor: adjustedVendor });
        } catch (e) {
            console.error('Failed to persist vendor selection:', e);
            if (e?.status === 409) {
                toast.error('Vendor just became unavailable for this date. Refreshing list...');
                setVendorsRefreshKey((k) => k + 1);
            } else {
                toast.error(e?.message || 'Failed to select vendor');
            }
            return;
        }

        handleSelectVendor(category, adjustedVendor);
    };

    // Refresh list only when tab becomes visible; avoid aggressive interval polling.
    useEffect(() => {
        if (!eventId || !activeCategory) return;
        if (isVendorStepComplete) return;

        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                setVendorsRefreshKey((k) => k + 1);
            }
        };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [activeCategory, eventId, isVendorStepComplete]);

    const persistSelectedServices = async (nextServices) => {
        if (!eventId) return;
        const response = await fetchWithAuth(
            `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}/services`,
            {
                method: 'PATCH',
                body: JSON.stringify({ selectedServices: nextServices }),
            },
            { dispatch, refreshAction: refreshAccessToken }
        );

        const data = await safeJson(response);
        if (!response.ok || !data?.success) {
            throw new Error(data?.message || 'Failed to update selected services');
        }
    };

    const handleAddService = (service) => {
        const newServices = [...formData.services, service];
        handleChange('services', newServices);
        setActiveServiceTab(newServices.length - 1);
        setShowAddServiceDropdown(false);

        persistSelectedServices(newServices).catch((e) => {
            console.error('Failed to persist selected services:', e);
        });
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

        persistSelectedServices(newServices).catch((e) => {
            console.error('Failed to persist selected services:', e);
        });
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

    // Ensure VendorSelection exists (and optionally hydrate services) once we have an eventId
    useEffect(() => {
        if (!eventId) return;

        let cancelled = false;
        const run = async () => {
            try {
                const response = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const data = await safeJson(response);
                if (!response.ok || !data?.success) return;
                const selection = data.data;
                const selectedServices = selection?.selectedServices;

                if (!cancelled && Array.isArray(selectedServices) && selectedServices.length > 0) {
                    // Only hydrate services if wizard doesn't have them yet
                    if (!Array.isArray(formData.services) || formData.services.length === 0) {
                        handleChange('services', selectedServices);
                        setActiveServiceTab(0);
                    }
                }

                if (!cancelled) {
                    const knownServices = Array.isArray(formData.services) ? formData.services : [];
                    const nextVendors = {};

                    const resolveServiceKey = (serviceValue) => {
                        const normalized = canonicalizeServiceLabel(serviceValue);
                        const exact = knownServices.find((s) => String(s || '').trim() === String(serviceValue || '').trim());
                        if (exact) return exact;

                        const canonicalMatch = knownServices.find(
                            (s) => canonicalizeServiceLabel(s) === normalized
                        );
                        return canonicalMatch || normalized;
                    };

                    for (const item of (Array.isArray(selection?.vendors) ? selection.vendors : [])) {
                        const vendorAuthId = item?.vendorAuthId ? String(item.vendorAuthId).trim() : '';
                        if (!vendorAuthId) continue;

                        const key = resolveServiceKey(item?.service);
                        if (!key) continue;

                        const normalizedService = canonicalizeServiceLabel(item?.service);
                        const serviceId = item?.serviceId ? String(item.serviceId).trim() : null;
                        const hydratedId = normalizedService === 'Venue' && serviceId ? serviceId : vendorAuthId;

                        const current = (formData?.vendors || {})[key] || {};
                        const lineMin = Number(item?.servicePrice?.min ?? 0);
                        const lineMax = Number(item?.servicePrice?.max ?? 0);

                        nextVendors[key] = {
                            ...current,
                            id: hydratedId,
                            vendorAuthId,
                            authId: vendorAuthId,
                            serviceId,
                            category: normalizedService,
                            name: current?.name || current?.vendorBusinessName || 'Selected Vendor',
                            vendorBusinessName: current?.vendorBusinessName || current?.name || null,
                            pricingUnit: current?.pricingUnit || (normalizedService === 'Catering & Drinks' ? 'PER_PLATE' : 'EVENT'),
                            unitPrice: Number.isFinite(lineMin) && lineMin > 0 ? lineMin : Number(current?.unitPrice || 0),
                            priceMin: Number.isFinite(lineMin) && lineMin > 0 ? lineMin : Number(current?.priceMin || 0),
                            priceMax: Number.isFinite(lineMax) && lineMax > 0 ? lineMax : Number(current?.priceMax || 0),
                        };
                    }

                    const normalizedCurrent = JSON.stringify(formData?.vendors || {});
                    const normalizedNext = JSON.stringify(nextVendors);
                    if (normalizedCurrent !== normalizedNext) {
                        handleChange('vendors', nextVendors);
                    }
                }
            } catch (e) {
                console.error('Failed to ensure vendor selection:', e);
            }
        };

        run();
        return () => { cancelled = true; };
    }, [dispatch, eventId, formData.services, handleChange, setActiveServiceTab]);

    // Fetch vendors from backend per category + filters
    const searchDebounceRef = useRef(null);
    useEffect(() => {
        if (!eventId || !activeCategory) return;

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(async () => {
            const hasCachedForCategory = Array.isArray(vendorsByCategory[activeCategory]) && vendorsByCategory[activeCategory].length > 0;
            setVendorsLoading(!hasCachedForCategory);
            setVendorsError(null);

            try {
                const qs = new URLSearchParams({
                    serviceCategory: activeCategory,
                    sort: sortOption,
                    priceMin: String(priceRange.min ?? 0),
                    priceMax: String(priceRange.max ?? 0),
                    radiusKm: String(DEFAULT_VENDOR_RADIUS_KM),
                    limit: '100',
                });
                if (searchQuery?.trim()) qs.set('q', searchQuery.trim());
                if (formData?.date) qs.set('day', String(formData.date));

                const response = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(eventId))}/vendors?${qs.toString()}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const data = await safeJson(response);
                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || 'Failed to fetch vendors');
                }

                const vendors = Array.isArray(data?.data?.vendors) ? data.data.vendors : [];
                const mapped = activeCategory === 'Venue'
                    ? vendors.flatMap((v, idx) => {
                        const services = Array.isArray(v?.services) ? v.services : [];
                        if (services.length === 0) {
                            return [mapBackendVendorToCard(v, 'Venue', idx, eventLat, eventLng)];
                        }
                        return services.map((svc, svcIdx) => mapBackendVenueServiceToCard({
                            vendor: v,
                            service: svc,
                            index: idx * 100 + svcIdx,
                            eventLat,
                            eventLng,
                        }));
                    })
                    : vendors.map((v, idx) => mapBackendVendorToCard(v, activeCategory, idx, eventLat, eventLng));

                setVendorsByCategory((prev) => ({
                    ...prev,
                    [activeCategory]: mapped,
                }));
            } catch (e) {
                console.error('Vendor fetch failed:', e);
                setVendorsError(e.message || 'Failed to fetch vendors');
            } finally {
                setVendorsLoading(false);
            }
        }, 250);

        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, [activeCategory, dispatch, eventId, eventLat, eventLng, formData?.date, priceRange.max, priceRange.min, searchQuery, sortOption, vendorsRefreshKey]);

    const filteredVendors = useMemo(() => {
        const fetched = vendorsByCategory[activeCategory];

        // Never fall back to static dummy vendors on the live selection step.
        // The list should reflect only currently available backend vendors.
        let allVendors = Array.isArray(fetched) ? fetched : [];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            allVendors = allVendors.filter(v =>
                v.name.toLowerCase().includes(query) ||
                v.location.toLowerCase().includes(query)
            );
        }

        if (activeCategory === "Venue" && attendeeInfo.attendeeCount) {
            allVendors = allVendors.filter(v => (v.capacity || 1000) >= attendeeInfo.attendeeCount);
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
                allVendors = [...allVendors].sort((a, b) => {
                    const da = Number.isFinite(Number(a?.distanceKm)) ? Number(a.distanceKm) : Number.POSITIVE_INFINITY;
                    const db = Number.isFinite(Number(b?.distanceKm)) ? Number(b.distanceKm) : Number.POSITIVE_INFINITY;
                    return da - db;
                });
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

        // Venue should always be shown nearest-first (based on event/service coordinates).
        if (activeCategory === 'Venue') {
            allVendors = [...allVendors].sort((a, b) => {
                const da = Number.isFinite(Number(a?.distanceKm)) ? Number(a.distanceKm) : Number.POSITIVE_INFINITY;
                const db = Number.isFinite(Number(b?.distanceKm)) ? Number(b.distanceKm) : Number.POSITIVE_INFINITY;
                return da - db;
            });
        }

        return allVendors;
    }, [activeCategory, attendeeInfo.attendeeCount, searchQuery, sortOption, priceRange, vendorsByCategory]);

    const totalPages = Math.max(1, Math.ceil(filteredVendors.length / ITEMS_PER_PAGE));
    const paginatedVendors = filteredVendors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const allServicesSelected = formData.services?.every((service) => hasSelectedVendorForService(service));
    const attendeeCountForPricing = Math.max(1, attendeeInfo.attendeeCount || 0);

    const getVendorLineMin = (v) => {
        const unitPrice = Number(v?.unitPrice ?? v?.priceMin ?? 0);
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) return 0;

        const pricingUnit = v?.pricingUnit
            || (String(v?.category || '').toLowerCase().includes('catering') ? 'PER_PLATE' : 'EVENT');

        const multiplier = pricingUnit === 'PER_PLATE' ? attendeeCountForPricing : 1;
        return Math.round(unitPrice * multiplier);
    };

    const estimatedTotal = Object.values(formData.vendors).reduce((acc, v) => acc + getVendorLineMin(v), 0);
    const estimatedMax = Object.values(formData.vendors).reduce(
        (acc, v) => {
            const maxMultiplier = Number(v?.maxPriceMultiplier || DEFAULT_MAX_PRICE_MULTIPLIER);
            const safeMultiplier = Number.isFinite(maxMultiplier) && maxMultiplier > 0 ? maxMultiplier : DEFAULT_MAX_PRICE_MULTIPLIER;
            return acc + Math.round(getVendorLineMin(v) * safeMultiplier);
        },
        0
    );

    return (
        <div className="w-full min-h-screen bg-surface relative flex flex-col overflow-hidden">
            <div aria-hidden className="fixed top-0 left-0 right-0 h-24 bg-surface pointer-events-none z-90" />

            {/* Modal */}
            <AnimatePresence>
                {selectedVendorForDetails && (
                    <VendorDetailsModal
                        vendor={selectedVendorForDetails}
                        onClose={() => setSelectedVendorForDetails(null)}
                        onSelect={(v) => handleSelectVendorWrapper(activeCategoryRaw, v || selectedVendorForDetails)}
                        isSelected={selectedVendorForActiveCategory?.id === selectedVendorForDetails.id}
                        priceMultiplier={priceMultiplier}
                        attendeeCount={attendeeInfo.attendeeCount}
                        attendeeLabel={attendeeInfo.attendeeLabel}
                        guestCount={formData.guests}
                        mode={activeCategory === 'Venue' ? 'venue-service' : undefined}
                    />
                )}
            </AnimatePresence>

            <div className="flex-1 flex max-w-480 mx-auto w-full relative">
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
                                        const isSelected = hasSelectedVendorForService(service);
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
                                            <div className="fixed inset-0 z-60" onClick={() => setShowAddServiceDropdown(false)} />
                                            <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-xl border border-primary/10 p-2 z-70 animate-fade-in-up scrollbar-thin scrollbar-thumb-gray-200">
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
                        {vendorsLoading ? (
                            <div className="rounded-3xl border border-primary/10 bg-white p-8 text-center text-primary/60 font-semibold">
                                Loading available vendors...
                            </div>
                        ) : vendorsError ? (
                            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                                <p className="text-red-700 font-bold">Failed to load vendors</p>
                                <p className="text-red-600 text-sm mt-2">{vendorsError}</p>
                            </div>
                        ) : paginatedVendors.length === 0 ? (
                            <div className="rounded-3xl border border-primary/10 bg-white p-8 text-center text-primary/70">
                                No available {activeCategory.toLowerCase()} vendors for this date.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {paginatedVendors.map(vendor => (
                                    <VendorCard
                                        key={vendor.id}
                                        vendor={vendor}
                                        isSelected={selectedVendorForActiveCategory?.id === vendor.id}
                                        onSelect={() => handleSelectVendorWrapper(activeCategoryRaw, vendor)}
                                        onViewDetails={() => setSelectedVendorForDetails(vendor)}
                                        priceMultiplier={priceMultiplier}
                                    />
                                ))}
                            </div>
                        )}

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
