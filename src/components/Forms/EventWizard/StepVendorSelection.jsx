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
import { getInclusiveIstDayRange, toIstDayString } from '../../../utils/istDateTime';
import { inferPricingUnit, resolveServicePricingModel } from '../../../utils/pricing';
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

const DEFAULT_DEMAND_PRICING_MULTIPLIERS = {
    normal: { min: 1, max: 1 },
    highDemand: { min: 1.5, max: 2.25 },
};

const toPositiveNumber = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

const toNonNegativeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const toNonNegativeOrNull = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
};

const resolveBasePrice = ({ baseValue, scaledValue, minMultiplier }) => {
    const directBase = Number(baseValue);
    if (Number.isFinite(directBase) && directBase >= 0) {
        return directBase;
    }

    const scaled = toNonNegativeNumber(scaledValue, 0);
    const safeMin = toPositiveNumber(minMultiplier, 1);
    return scaled / safeMin;
};

const resolveServicePricing = ({ service, minMultiplier = 1, maxMultiplier = 1 }) => {
    const safeMinMultiplier = toPositiveNumber(minMultiplier, 1);
    const safeMaxMultiplier = Math.max(safeMinMultiplier, toPositiveNumber(maxMultiplier, safeMinMultiplier));

    const directBasePrice = toNonNegativeOrNull(service?.basePrice);
    const scaledMin =
        toNonNegativeOrNull(service?.priceMin)
        ?? toNonNegativeOrNull(service?.price)
        ?? (directBasePrice != null ? Math.round(directBasePrice * safeMinMultiplier) : null);
    const scaledMax =
        toNonNegativeOrNull(service?.priceMax)
        ?? (directBasePrice != null ? Math.round(directBasePrice * safeMaxMultiplier) : null)
        ?? scaledMin;

    const basePrice = directBasePrice != null
        ? directBasePrice
        : (scaledMin != null ? (scaledMin / safeMinMultiplier) : null);

    return {
        scaledMin,
        scaledMax,
        basePrice,
    };
};

const getScaledMinFromServices = ({ vendorLike, minMultiplier = 1, maxMultiplier = 1 }) => {
    const services = Array.isArray(vendorLike?.services) ? vendorLike.services : [];
    const scaledCandidates = services
        .map((service) => resolveServicePricing({ service, minMultiplier, maxMultiplier }).scaledMin)
        .filter((v) => Number.isFinite(v) && v > 0);

    if (scaledCandidates.length === 0) return 0;
    return Math.min(...scaledCandidates);
};

const normalizeDemandPricingMultipliers = (raw) => {
    const normalMin = toPositiveNumber(raw?.normal?.min, DEFAULT_DEMAND_PRICING_MULTIPLIERS.normal.min);
    const normalMaxRaw = toPositiveNumber(raw?.normal?.max, DEFAULT_DEMAND_PRICING_MULTIPLIERS.normal.max);
    const highMin = toPositiveNumber(raw?.highDemand?.min, DEFAULT_DEMAND_PRICING_MULTIPLIERS.highDemand.min);
    const highMaxRaw = toPositiveNumber(raw?.highDemand?.max, DEFAULT_DEMAND_PRICING_MULTIPLIERS.highDemand.max);

    return {
        normal: {
            min: normalMin,
            max: normalMaxRaw >= normalMin ? normalMaxRaw : normalMin,
        },
        highDemand: {
            min: highMin,
            max: highMaxRaw >= highMin ? highMaxRaw : highMin,
        },
    };
};

const SERVICE_ALIASES = {
    catering: 'Catering & Drinks',
    'catering and drinks': 'Catering & Drinks',
    'catering & drink': 'Catering & Drinks',
};

const CANONICAL_SERVICE_BY_LOWER = vendorServiceCategories.reduce((acc, service) => {
    const raw = service == null ? '' : String(service).trim();
    if (!raw) return acc;
    acc[raw.toLowerCase()] = raw;
    return acc;
}, {});

const canonicalizeServiceLabel = (value) => {
    const raw = value == null ? '' : String(value).trim();
    if (!raw) return '';

    if (vendorServiceCategories.includes(raw)) return raw;

    const key = raw.toLowerCase();
    const alias = SERVICE_ALIASES[key];
    if (alias) return alias;

    return CANONICAL_SERVICE_BY_LOWER[key] || raw;
};

const normalizeSelectedVendorPricing = (vendor, { minMultiplier, maxMultiplier }) => {
    const v = vendor && typeof vendor === 'object' ? vendor : {};
    const prevMinMultiplier = toPositiveNumber(v?.priceMultiplier, 1);
    const prevAbsoluteMax = toPositiveNumber(v?.absoluteMaxMultiplier, prevMinMultiplier * toPositiveNumber(v?.maxPriceMultiplier, 1));

    const nextMinMultiplier = toPositiveNumber(minMultiplier, 1);
    const nextAbsoluteMax = Math.max(nextMinMultiplier, toPositiveNumber(maxMultiplier, nextMinMultiplier));
    const nextRelativeMax = nextAbsoluteMax / nextMinMultiplier;

    const unitPriceRaw = Number(v?.unitPrice ?? v?.priceMin ?? 0);
    const derivedBaseUnitPrice = Number.isFinite(unitPriceRaw) && unitPriceRaw > 0 ? unitPriceRaw / prevMinMultiplier : 0;
    const baseUnitPriceRaw = Number(v?.baseUnitPrice ?? derivedBaseUnitPrice);
    const baseUnitPrice = Number.isFinite(baseUnitPriceRaw) && baseUnitPriceRaw > 0 ? baseUnitPriceRaw : 0;

    const priceMinRaw = Number(v?.priceMin ?? baseUnitPrice ?? 0);
    const derivedBaseMin = Number.isFinite(priceMinRaw) && priceMinRaw > 0 ? priceMinRaw / prevMinMultiplier : 0;
    const basePriceMinRaw = Number(v?.basePriceMin ?? derivedBaseMin ?? baseUnitPrice ?? 0);
    const basePriceMin = Number.isFinite(basePriceMinRaw) && basePriceMinRaw > 0 ? basePriceMinRaw : 0;

    const priceMaxRaw = Number(v?.priceMax);
    const derivedBaseMax = Number.isFinite(priceMaxRaw) && priceMaxRaw > 0 ? priceMaxRaw / prevAbsoluteMax : 0;
    const basePriceMaxFallback = basePriceMin;
    const basePriceMaxRaw = Number(v?.basePriceMax ?? derivedBaseMax ?? basePriceMaxFallback);
    const basePriceMax = Number.isFinite(basePriceMaxRaw) && basePriceMaxRaw > 0 ? basePriceMaxRaw : basePriceMaxFallback;

    return {
        ...v,
        baseUnitPrice,
        basePriceMin,
        basePriceMax,
        maxPriceMultiplier: nextRelativeMax,
        priceMultiplier: nextMinMultiplier,
        absoluteMaxMultiplier: nextAbsoluteMax,
        unitPrice: Math.round(baseUnitPrice * nextMinMultiplier),
        priceMin: Math.round(basePriceMin * nextMinMultiplier),
        priceMax: Math.round(basePriceMax * nextAbsoluteMax),
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

const mapBackendVenueServiceToCard = ({ vendor, service, index = 0, eventLat, eventLng, minMultiplier = 1, maxMultiplier = 1 }) => {
    const serviceId = service?.serviceId || service?.id || null;
    const details = service?.details || {};

    const serviceLat = details?.locationLat ?? null;
    const serviceLng = details?.locationLng ?? null;
    const computedDistance = haversineKm(eventLat, eventLng, serviceLat, serviceLng);

    const image = getVenueServicePrimaryImage(details) || pickFallbackImage('Venue', index);
    const isAvailable = service?.isAvailable !== false;
    const unavailableReason = !isAvailable
        ? (service?.unavailableReason || vendor?.unavailableReason || 'CURRENTLY_LOCKED_WITH_ANOTHER_EVENT')
        : null;
    const locationName =
        details?.locationAreaName ||
        details?.location ||
        vendor?.location?.name ||
        'Location TBD';

    const safeMinMultiplier = toPositiveNumber(minMultiplier, 1);
    const safeMaxMultiplier = Math.max(safeMinMultiplier, toPositiveNumber(maxMultiplier, safeMinMultiplier));
    const scaledUnitPrice = toNonNegativeNumber(service?.price, toNonNegativeNumber(vendor?.priceMin, 0));
    const baseUnitPrice = resolveBasePrice({
        baseValue: service?.basePrice,
        scaledValue: scaledUnitPrice,
        minMultiplier: safeMinMultiplier,
    });
    const scaledMin = Math.round(baseUnitPrice * safeMinMultiplier);
    const scaledMax = Math.round(baseUnitPrice * safeMaxMultiplier);

    const backendReviewSummary = service?.reviewSummary && typeof service.reviewSummary === 'object'
        ? service.reviewSummary
        : (vendor?.reviewSummary && typeof vendor.reviewSummary === 'object' ? vendor.reviewSummary : null);
    const reviewEntries = Array.isArray(service?.reviewEntries)
        ? service.reviewEntries
        : (Array.isArray(vendor?.reviewEntries) ? vendor.reviewEntries : []);
    const summaryAverageRating = Number(backendReviewSummary?.averageRating);
    const fallbackRating = service?.rating != null
        ? Number(service.rating)
        : (vendor?.rating != null ? Number(vendor.rating) : 0);
    const resolvedRatingNumber = Number.isFinite(summaryAverageRating) && summaryAverageRating > 0
        ? summaryAverageRating
        : (Number.isFinite(fallbackRating) ? fallbackRating : 0);

    const summaryTotalReviews = Number(backendReviewSummary?.totalReviews);
    const fallbackReviewCount = Number(service?.reviewCount ?? service?.reviews ?? vendor?.reviewCount ?? vendor?.reviews ?? reviewEntries.length);
    const resolvedReviewCount = Number.isFinite(summaryTotalReviews) && summaryTotalReviews >= 0
        ? summaryTotalReviews
        : (Number.isFinite(fallbackReviewCount) && fallbackReviewCount >= 0 ? fallbackReviewCount : 0);

    return {
        id: serviceId || `${vendor?.vendorAuthId || 'venue'}-${index}`,
        serviceId: serviceId ? String(serviceId) : null,
        vendorAuthId: vendor?.vendorAuthId || null,
        vendorBusinessName: vendor?.businessName || null,
        category: 'Venue',
        categoryId: vendor?.categoryId || 'venues',
        rating: String(Number(resolvedRatingNumber.toFixed(1))),
        reviews: resolvedReviewCount,
        reviewCount: resolvedReviewCount,
        reviewSummary: backendReviewSummary || {
            averageRating: Number(resolvedRatingNumber.toFixed(1)),
            totalReviews: resolvedReviewCount,
            ratingsBreakdown: null,
        },
        reviewEntries,
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
        baseUnitPrice,
        basePriceMin: baseUnitPrice,
        basePriceMax: baseUnitPrice,
        priceMultiplier: safeMinMultiplier,
        absoluteMaxMultiplier: safeMaxMultiplier,
        maxPriceMultiplier: safeMaxMultiplier / safeMinMultiplier,
        unitPrice: scaledMin,
        priceMin: scaledMin,
        priceMax: scaledMax,

        details,
        services: Array.isArray(vendor?.services) ? vendor.services : [],
        isAvailable,
        unavailableReason,
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

const mapBackendVendorToCard = (vendor, category, index = 0, eventLat, eventLng, minMultiplier = 1, maxMultiplier = 1) => {
    const name = vendor?.businessName || 'Vendor';
    const backendReviewSummary = vendor?.reviewSummary && typeof vendor.reviewSummary === 'object'
        ? vendor.reviewSummary
        : null;
    const reviewEntries = Array.isArray(vendor?.reviewEntries) ? vendor.reviewEntries : [];

    const summaryAverageRating = Number(backendReviewSummary?.averageRating);
    const fallbackRating = Number(vendor?.rating);
    const resolvedRatingNumber = Number.isFinite(summaryAverageRating) && summaryAverageRating > 0
        ? summaryAverageRating
        : (Number.isFinite(fallbackRating) ? fallbackRating : 0);

    const summaryTotalReviews = Number(backendReviewSummary?.totalReviews);
    const fallbackReviewCount = Number(vendor?.reviewCount ?? vendor?.reviews ?? reviewEntries.length);
    const resolvedReviewCount = Number.isFinite(summaryTotalReviews) && summaryTotalReviews >= 0
        ? summaryTotalReviews
        : (Number.isFinite(fallbackReviewCount) && fallbackReviewCount >= 0 ? fallbackReviewCount : 0);

    const rating = String(Number(resolvedRatingNumber.toFixed(1)));
    const location = vendor?.location?.name || 'Location TBD';

    const services = Array.isArray(vendor?.services) ? vendor.services : [];
    const safeMinMultiplier = toPositiveNumber(minMultiplier, 1);
    const safeMaxMultiplier = Math.max(safeMinMultiplier, toPositiveNumber(maxMultiplier, safeMinMultiplier));

    const normalizedServices = services.map((service) => {
        const pricing = resolveServicePricing({
            service,
            minMultiplier: safeMinMultiplier,
            maxMultiplier: safeMaxMultiplier,
        });

        return {
            ...service,
            basePrice: pricing.basePrice != null ? pricing.basePrice : service?.basePrice,
            price: pricing.scaledMin != null ? pricing.scaledMin : service?.price,
            priceMin: pricing.scaledMin != null ? pricing.scaledMin : service?.priceMin,
            priceMax: pricing.scaledMax != null ? pricing.scaledMax : service?.priceMax,
        };
    });

    const serviceScaledMins = normalizedServices
        .map((s) => toNonNegativeOrNull(s?.priceMin))
        .filter((v) => v != null);
    const serviceScaledMaxes = normalizedServices
        .map((s) => toNonNegativeOrNull(s?.priceMax))
        .filter((v) => v != null);
    const serviceBaseMins = normalizedServices
        .map((s) => toNonNegativeOrNull(s?.basePrice))
        .filter((v) => v != null);

    const scaledVendorMin =
        toNonNegativeOrNull(vendor?.priceMin)
        ?? (serviceScaledMins.length ? Math.min(...serviceScaledMins) : null)
        ?? 0;
    const scaledVendorMax =
        toNonNegativeOrNull(vendor?.priceMax)
        ?? (serviceScaledMaxes.length ? Math.max(...serviceScaledMaxes) : null)
        ?? scaledVendorMin;
    const derivedBaseMin = serviceBaseMins.length ? Math.min(...serviceBaseMins) : null;
    const derivedBaseMax = serviceBaseMins.length ? Math.max(...serviceBaseMins) : null;

    const basePriceMin = resolveBasePrice({
        baseValue: derivedBaseMin,
        scaledValue: scaledVendorMin,
        minMultiplier: safeMinMultiplier,
    });
    const basePriceMax = resolveBasePrice({
        baseValue: derivedBaseMax,
        scaledValue: scaledVendorMax,
        minMultiplier: safeMaxMultiplier,
    });
    const normalizedBaseMax = Math.max(basePriceMin, basePriceMax);

    const serviceImage = services?.[0]?.details?.image || null;
    const bannerImage = vendor?.banner || vendor?.images?.banner?.fileUrl || null;
    const profileImage = vendor?.profileImage || vendor?.images?.profile?.fileUrl || null;
    const image = category === 'Venue'
        ? (serviceImage || bannerImage || profileImage || pickFallbackImage(category, index))
        : (bannerImage || profileImage || serviceImage || pickFallbackImage(category, index));

    const { lat, lng } = extractLatLng(vendor);
    const computedDistance = haversineKm(eventLat, eventLng, lat, lng);
    const isAvailable = vendor?.isAvailable !== false;
    const unavailableReason = !isAvailable
        ? (vendor?.unavailableReason || 'CURRENTLY_LOCKED_WITH_ANOTHER_EVENT')
        : null;

    return {
        id: vendor?.vendorAuthId || `${category}-${index}`,
        vendorAuthId: vendor?.vendorAuthId || null,
        name,
        rating,
        reviews: resolvedReviewCount,
        reviewCount: resolvedReviewCount,
        reviewSummary: backendReviewSummary || {
            averageRating: Number(resolvedRatingNumber.toFixed(1)),
            totalReviews: resolvedReviewCount,
            ratingsBreakdown: null,
        },
        reviewEntries,
        baseUnitPrice: basePriceMin,
        basePriceMin,
        basePriceMax: normalizedBaseMax,
        priceMultiplier: safeMinMultiplier,
        absoluteMaxMultiplier: safeMaxMultiplier,
        maxPriceMultiplier: safeMaxMultiplier / safeMinMultiplier,
        pricingUnit: inferPricingUnit({
            serviceLabel: category,
            serviceCategory: category,
            categoryId: vendor?.categoryId,
        }),
        priceMin: Math.round(basePriceMin * safeMinMultiplier),
        priceMax: Math.round(normalizedBaseMax * safeMaxMultiplier),
        image,
        banner: bannerImage || profileImage || serviceImage || null,
        profileImage: profileImage || null,
        location,
        mapsUrl: vendor?.location?.mapsUrl || null,
        categoryId: vendor?.categoryId || null,
        isPopular: Boolean(vendor?.isPopular),
        capacity: vendor?.capacity,
        lat,
        lng,
        distanceKm: computedDistance != null ? computedDistance : vendor?.distanceKm,
        description: vendor?.description || null,
        services: normalizedServices,
        category,
        isAvailable,
        unavailableReason,
        _raw: vendor,
    };
};

const StepVendorSelection = ({ formData, handleNext, handleBack, activeServiceTab, setActiveServiceTab, handleChange, minDateString }) => {
    const dispatch = useDispatch();
    const isPublicListing = String(formData?.listingType || 'Private') === 'Public';
    const activeCategoryRaw = formData.services[activeServiceTab] || "Venue";
    const activeCategory = canonicalizeServiceLabel(activeCategoryRaw);
    const eventId = formData?.id;
    const eventLat = formData?.lat;
    const eventLng = formData?.lng;

    const publicTicketDemand = useMemo(() => {
        if (!isPublicListing) {
            return {
                totalTickets: 0,
                peakDayTickets: 0,
                fallbackCapacity: 0,
                dayCount: 1,
            };
        }

        const dayAllocationMap = formData?.ticketDayAllocations && typeof formData.ticketDayAllocations === 'object'
            ? formData.ticketDayAllocations
            : {};
        const dayTicketCounts = Object.values(dayAllocationMap)
            .map((value) => parseInt(value, 10))
            .filter((value) => Number.isFinite(value) && value > 0);

        const totalTickets = dayTicketCounts.reduce((acc, value) => acc + value, 0);
        const peakDayTickets = dayTicketCounts.length > 0 ? Math.max(...dayTicketCounts) : 0;

        const capacity = parseInt(formData?.totalCapacity, 10);
        const fallbackTicketsTotal = Array.isArray(formData?.tickets)
            ? formData.tickets.reduce((acc, t) => acc + (parseInt(t?.quantity, 10) || 0), 0)
            : 0;

        const fallbackCapacity = Number.isFinite(capacity) && capacity > 0 ? capacity : fallbackTicketsTotal;
        const dayCount = Math.max(1, getInclusiveIstDayRange(formData?.publicStartTime, formData?.publicEndTime).length || 0);

        return {
            totalTickets,
            peakDayTickets,
            fallbackCapacity,
            dayCount,
        };
    }, [formData?.publicEndTime, formData?.publicStartTime, formData?.ticketDayAllocations, formData?.tickets, formData?.totalCapacity, isPublicListing]);

    const overallAttendeeCount = useMemo(() => {
        if (isPublicListing) {
            if (publicTicketDemand.totalTickets > 0) return publicTicketDemand.totalTickets;
            if (publicTicketDemand.peakDayTickets > 0) return publicTicketDemand.peakDayTickets;
            return publicTicketDemand.fallbackCapacity;
        }

        const guests = parseInt(formData?.guests, 10);
        return Number.isFinite(guests) && guests > 0 ? guests : 0;
    }, [formData?.guests, isPublicListing, publicTicketDemand.fallbackCapacity, publicTicketDemand.peakDayTickets, publicTicketDemand.totalTickets]);

    const venueCapacityBaseline = useMemo(() => {
        if (!isPublicListing) return overallAttendeeCount;
        if (publicTicketDemand.peakDayTickets > 0) return publicTicketDemand.peakDayTickets;
        return publicTicketDemand.fallbackCapacity;
    }, [isPublicListing, overallAttendeeCount, publicTicketDemand.fallbackCapacity, publicTicketDemand.peakDayTickets]);

    const eventDayCount = useMemo(() => {
        if (!isPublicListing) return 1;
        return Math.max(1, publicTicketDemand.dayCount || 1);
    }, [isPublicListing, publicTicketDemand.dayCount]);

    const attendeeInfo = useMemo(() => {
        if (isPublicListing) {
            const useVenueBaseline = activeCategory === 'Venue';
            const attendeeCount = useVenueBaseline ? venueCapacityBaseline : overallAttendeeCount;
            return {
                attendeeCount,
                attendeeLabel: 'Tickets',
                capacityBaselineValue: venueCapacityBaseline,
                capacityBaselineSource: publicTicketDemand.peakDayTickets > 0 ? 'peak-day' : 'fallback-total',
            };
        }
        return {
            attendeeCount: overallAttendeeCount,
            attendeeLabel: 'Guests',
            capacityBaselineValue: overallAttendeeCount,
            capacityBaselineSource: 'guests',
        };
    }, [activeCategory, isPublicListing, overallAttendeeCount, publicTicketDemand.peakDayTickets, venueCapacityBaseline]);

    const toDayString = useCallback((value) => {
        const raw = value == null ? '' : String(value).trim();
        if (!raw) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
        // Always derive day in IST for timestamp-like inputs.
        // Truncating the YYYY-MM-DD prefix from ISO strings can shift the day
        // for values stored in UTC (for example IST midnight saved as previous UTC date).
        return toIstDayString(raw);
    }, []);

    const selectedReservationDay = useMemo(() => {
        if (isPublicListing) {
            return toDayString(formData?.publicStartTime);
        }
        return toDayString(formData?.date) || toDayString(formData?.publicStartTime);
    }, [formData?.date, formData?.publicStartTime, isPublicListing, toDayString]);

    const selectedReservationFrom = useMemo(() => {
        if (!isPublicListing) return null;
        return toDayString(formData?.publicStartTime) || null;
    }, [formData?.publicStartTime, isPublicListing, toDayString]);

    const selectedReservationTo = useMemo(() => {
        if (!isPublicListing) return null;
        const explicitTo = toDayString(formData?.publicEndTime);
        return explicitTo || selectedReservationFrom || null;
    }, [formData?.publicEndTime, isPublicListing, selectedReservationFrom, toDayString]);

    const reservationScopeLabel = useMemo(() => {
        if (isPublicListing) {
            const from = selectedReservationFrom || 'selected range';
            const to = selectedReservationTo || from;
            return from === to ? from : `${from} to ${to}`;
        }
        return selectedReservationDay || 'selected date';
    }, [isPublicListing, selectedReservationDay, selectedReservationFrom, selectedReservationTo]);

    const appendReservationQueryParams = useCallback((params) => {
        if (!params) return;

        if (isPublicListing) {
            if (selectedReservationFrom && selectedReservationTo) {
                params.set('from', String(selectedReservationFrom));
                params.set('to', String(selectedReservationTo));
                return;
            }

            if (selectedReservationFrom) {
                params.set('day', String(selectedReservationFrom));
            }
            return;
        }

        if (selectedReservationDay) {
            params.set('day', String(selectedReservationDay));
        }
    }, [isPublicListing, selectedReservationDay, selectedReservationFrom, selectedReservationTo]);

    const formatDisplayDate = useCallback((value) => {
        const day = toDayString(value);
        if (!day) return '';
        const d = new Date(`${day}T00:00:00`);
        return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
    }, [toDayString]);

    const displayedDateLabel = useMemo(() => {
        if (isPublicListing) {
            const from = formatDisplayDate(formData?.publicStartTime);
            const to = formatDisplayDate(formData?.publicEndTime);
            if (from && to) return `${from} - ${to}`;
            return from || to || 'Not set';
        }

        return formatDisplayDate(formData?.date) || 'Select';
    }, [formData?.date, formData?.publicEndTime, formData?.publicStartTime, formatDisplayDate, isPublicListing]);

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
    const readVendorIdentity = useCallback((value) => {
        const source = value && typeof value === 'object' ? value : {};
        const id = String(source?.id || '').trim();
        const vendorAuthId = String(source?.vendorAuthId || source?.authId || '').trim();
        const serviceIdRaw = source?.selectedPackage?.serviceId ?? source?.selectedPackage?.id ?? source?.serviceId;
        const serviceId = serviceIdRaw != null ? String(serviceIdRaw).trim() : '';

        return {
            id,
            vendorAuthId,
            serviceId,
        };
    }, []);

    const isVendorCurrentlySelected = useCallback((vendorLike) => {
        if (!selectedVendorForActiveCategory || !vendorLike) return false;

        const selectedIdentity = readVendorIdentity(selectedVendorForActiveCategory);
        const candidateIdentity = readVendorIdentity(vendorLike);

        if (selectedIdentity.serviceId && candidateIdentity.serviceId) {
            return selectedIdentity.serviceId === candidateIdentity.serviceId;
        }

        if (selectedIdentity.vendorAuthId && candidateIdentity.vendorAuthId) {
            return selectedIdentity.vendorAuthId === candidateIdentity.vendorAuthId;
        }

        if (selectedIdentity.id && candidateIdentity.id) {
            return selectedIdentity.id === candidateIdentity.id;
        }

        return false;
    }, [readVendorIdentity, selectedVendorForActiveCategory]);

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
    const [availabilityFilter, setAvailabilityFilter] = useState('showLocked');
    const [showAddServiceDropdown, setShowAddServiceDropdown] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [demandPricingMultipliers, setDemandPricingMultipliers] = useState(DEFAULT_DEMAND_PRICING_MULTIPLIERS);

    useEffect(() => {
        if (isPublicListing && isCalendarOpen) {
            setIsCalendarOpen(false);
        }
    }, [isCalendarOpen, isPublicListing]);

    // Helper: only update demand multiplier state when values actually differ
    // (avoids new object-ref on every poll → avoids cascading re-renders)
    const stableSetDemandPricingMultipliers = useCallback((next) => {
        setDemandPricingMultipliers((prev) => {
            if (
                prev.normal.min === next.normal.min &&
                prev.normal.max === next.normal.max &&
                prev.highDemand.min === next.highDemand.min &&
                prev.highDemand.max === next.highDemand.max
            ) {
                return prev; // same values → keep same reference → no re-render
            }
            return next;
        });
    }, []);

    // Guard: prevents the hydration effect from overwriting a fresh local selection
    const selectionInProgressRef = useRef(false);
    const selectionGuardTimerRef = useRef(null);

    const ITEMS_PER_PAGE = 9;

    // --- High Demand Logic ---
    const isHighDemand = isDateHighDemand(selectedReservationDay || formData.date);
    const activeDemandMultipliers = isHighDemand
        ? demandPricingMultipliers.highDemand
        : demandPricingMultipliers.normal;
    const priceMultiplier = toPositiveNumber(activeDemandMultipliers?.min, 1);
    const absoluteMaxMultiplier = Math.max(priceMultiplier, toPositiveNumber(activeDemandMultipliers?.max, priceMultiplier));
    const relativeMaxMultiplier = absoluteMaxMultiplier / priceMultiplier;

    const resolvePricingQuantity = useCallback(({ vendorLike, category }) => {
        const normalizedCategory = canonicalizeServiceLabel(category || vendorLike?.category || '');
        const pricingModel = resolveServicePricingModel({
            serviceLabel: normalizedCategory,
            serviceCategory: vendorLike?.serviceCategory || normalizedCategory,
            categoryId: vendorLike?.categoryId,
            pricingUnit: vendorLike?.pricingUnit,
        });

        if (pricingModel === 'per_attendee') {
            return Math.max(1, Number(overallAttendeeCount || 0));
        }

        if (pricingModel === 'fixed') {
            const qty = Number(vendorLike?.pricingQuantity);
            return Number.isFinite(qty) && qty > 0 ? qty : 1;
        }

        return Math.max(1, Number(eventDayCount || 1));
    }, [eventDayCount, overallAttendeeCount]);

    const prevDemandPricingSignatureRef = useRef(`${priceMultiplier}:${absoluteMaxMultiplier}`);
    const lastSyncedReservationDayRef = useRef(null);

    const repriceVendorCard = useCallback((vendorCard) => {
        const repriced = normalizeSelectedVendorPricing(vendorCard, {
            minMultiplier: priceMultiplier,
            maxMultiplier: absoluteMaxMultiplier,
        });

        const prevCardMinMultiplier = toPositiveNumber(vendorCard?.priceMultiplier, 1);
        const repricedServices = Array.isArray(vendorCard?.services)
            ? vendorCard.services.map((svc) => {
                const basePrice = resolveBasePrice({
                    baseValue: svc?.basePrice,
                    scaledValue: svc?.price,
                    minMultiplier: prevCardMinMultiplier,
                });
                return {
                    ...svc,
                    basePrice,
                    price: Math.round(basePrice * priceMultiplier),
                    priceMin: Math.round(basePrice * priceMultiplier),
                    priceMax: Math.round(basePrice * absoluteMaxMultiplier),
                };
            })
            : vendorCard?.services;

        return {
            ...repriced,
            services: repricedServices,
        };
    }, [absoluteMaxMultiplier, priceMultiplier]);

    useEffect(() => {
        let cancelled = false;

        const loadDemandMultipliers = async () => {
            try {
                const response = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/config/fees`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const data = await safeJson(response);
                if (!response.ok || !data?.success) return;

                const next = normalizeDemandPricingMultipliers(data?.data?.demandPricingMultipliers);
                if (!cancelled) {
                    stableSetDemandPricingMultipliers(next);
                }
            } catch (error) {
                console.error('Failed to fetch demand pricing multipliers:', error);
            }
        };

        loadDemandMultipliers();
        const id = setInterval(loadDemandMultipliers, 5000);

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [dispatch, stableSetDemandPricingMultipliers]);

    const syncPlanningReservationDay = useCallback(async ({ day, silent = false } = {}) => {
        if (isPublicListing) return false;
        const normalizedDay = day == null ? '' : String(day).trim();
        if (!eventId || !normalizedDay) return false;

        const response = await fetchWithAuth(
            `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(eventId))}/reservation-day`,
            {
                method: 'PATCH',
                body: JSON.stringify({ day: normalizedDay }),
            },
            { dispatch, refreshAction: refreshAccessToken }
        );

        const data = await safeJson(response);
        if (!response.ok || !data?.success) {
            const err = new Error(data?.message || 'Failed to sync planning date');
            err.status = response.status;
            if (!silent) throw err;
            console.error('Planning date sync failed:', err);
            return false;
        }

        return true;
    }, [dispatch, eventId, isPublicListing]);

    useEffect(() => {
        if (isPublicListing) return;
        if (!eventId || !selectedReservationDay) return;
        if (lastSyncedReservationDayRef.current === selectedReservationDay) return;

        let cancelled = false;
        const run = async () => {
            try {
                const synced = await syncPlanningReservationDay({ day: selectedReservationDay, silent: true });
                if (!cancelled && synced) {
                    lastSyncedReservationDayRef.current = selectedReservationDay;
                }
            } catch (error) {
                console.error('Failed to sync reservation day:', error);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [eventId, isPublicListing, selectedReservationDay, syncPlanningReservationDay]);

    const persistVendorSelection = useCallback(async ({ category, vendor, dayOverride = null }) => {
        const normalizedCategory = canonicalizeServiceLabel(category);
        if (!eventId || !normalizedCategory) return true;

        const vendorAuthId = vendor?.vendorAuthId || vendor?.authId || null;
        const selectedServiceId = (() => {
            const raw = vendor?.selectedPackage?.serviceId ?? vendor?.selectedPackage?.id ?? vendor?.serviceId;
            const s = raw != null ? String(raw).trim() : '';
            return s || null;
        })();

        const pricingModel = resolveServicePricingModel({
            serviceLabel: normalizedCategory,
            serviceCategory: normalizedCategory,
            categoryId: vendor?.categoryId,
            pricingUnit: vendor?.pricingUnit,
        });
        const pricingUnit = vendor?.pricingUnit || inferPricingUnit({
            serviceLabel: normalizedCategory,
            serviceCategory: normalizedCategory,
            categoryId: vendor?.categoryId,
            pricingUnit: pricingModel === 'per_day' ? 'EVENT' : undefined,
        });
        const pricingQuantityRaw = Number(vendor?.pricingQuantity);
        const fixedPricingQuantity = (pricingModel === 'fixed' && Number.isFinite(pricingQuantityRaw) && pricingQuantityRaw > 0)
            ? pricingQuantityRaw
            : null;
        const fixedPricingQuantityUnit = pricingModel === 'fixed'
            ? (() => {
                const unitRaw = vendor?.pricingQuantityUnit != null ? String(vendor.pricingQuantityUnit).trim() : '';
                if (unitRaw) return unitRaw;
                return String(pricingUnit || '').toUpperCase() === 'PER_KG' ? 'kg' : null;
            })()
            : null;
        const unitPrice = Number(vendor?.unitPrice ?? vendor?.priceMin ?? 0);
        const maxMultiplier = toPositiveNumber(relativeMaxMultiplier, 1);
        const quantityMultiplier = resolvePricingQuantity({
            vendorLike: { ...vendor, pricingUnit },
            category: normalizedCategory,
        });

        const lineMin = (vendorAuthId && Number.isFinite(unitPrice) && unitPrice > 0)
            ? Math.round(unitPrice * quantityMultiplier)
            : 0;
        const lineMax = (vendorAuthId && lineMin > 0)
            ? Math.round(lineMin * (Number.isFinite(maxMultiplier) && maxMultiplier > 0 ? maxMultiplier : 1))
            : 0;

        const reservationPayload = (() => {
            if (isPublicListing) {
                if (selectedReservationFrom && selectedReservationTo) {
                    return { from: selectedReservationFrom, to: selectedReservationTo };
                }
                if (selectedReservationFrom) {
                    return { day: selectedReservationFrom };
                }
                return {};
            }

            const reservationDay = dayOverride || selectedReservationDay;
            return reservationDay ? { day: reservationDay } : {};
        })();

        const response = await fetchWithAuth(
            `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}/vendors`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    service: normalizedCategory,
                    ...reservationPayload,
                    vendorAuthId,
                    ...(selectedServiceId ? { serviceId: selectedServiceId } : {}),
                    ...(!vendorAuthId
                        ? {
                            status: 'YET_TO_SELECT',
                            alternativeNeeded: false,
                            rejectionReason: null,
                            pricingUnit: null,
                            pricingQuantity: null,
                            pricingQuantityUnit: null,
                        }
                        : {
                            pricingUnit,
                            ...(fixedPricingQuantity != null ? { pricingQuantity: fixedPricingQuantity } : {}),
                            ...(fixedPricingQuantityUnit ? { pricingQuantityUnit: fixedPricingQuantityUnit } : {}),
                        }),
                    servicePrice: {
                        min: lineMin,
                        max: lineMax,
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
    }, [dispatch, eventId, isPublicListing, relativeMaxMultiplier, resolvePricingQuantity, selectedReservationDay, selectedReservationFrom, selectedReservationTo]);

    const removeCategorySelections = useCallback((vendorsMap, categoryLike) => {
        const next = { ...(vendorsMap && typeof vendorsMap === 'object' ? vendorsMap : {}) };
        const canonical = canonicalizeServiceLabel(categoryLike);
        Object.keys(next).forEach((key) => {
            if (canonicalizeServiceLabel(key) === canonical) {
                delete next[key];
            }
        });
        return next;
    }, []);

    const upsertCategorySelection = useCallback((vendorsMap, categoryLike, vendor) => {
        const canonical = canonicalizeServiceLabel(categoryLike);
        const next = removeCategorySelections(vendorsMap, canonical);
        next[canonical] = vendor;
        return next;
    }, [removeCategorySelections]);

    const previousReservationDayRef = useRef(selectedReservationDay);
    // Ref so the hydration effect can read current vendors without depending on them
    // (depending on formData?.vendors caused a re-run loop that overwrote fresh selections)
    const currentVendorsRef = useRef(formData?.vendors);
    const priceMultiplierRef = useRef(priceMultiplier);
    const absoluteMaxMultiplierRef = useRef(absoluteMaxMultiplier);
    useEffect(() => {
        currentVendorsRef.current = formData?.vendors;
    }, [formData?.vendors]);
    useEffect(() => {
        priceMultiplierRef.current = priceMultiplier;
        absoluteMaxMultiplierRef.current = absoluteMaxMultiplier;
    }, [priceMultiplier, absoluteMaxMultiplier]);

    useEffect(() => {
        const previousDay = previousReservationDayRef.current;
        if (!eventId || !selectedReservationDay || !previousDay || previousDay === selectedReservationDay) {
            previousReservationDayRef.current = selectedReservationDay;
            return;
        }

        const selectedVendors = formData?.vendors && typeof formData.vendors === 'object' ? { ...formData.vendors } : {};
        const categories = Object.keys(selectedVendors);
        if (categories.length === 0) {
            previousReservationDayRef.current = selectedReservationDay;
            return;
        }

        let cancelled = false;

        const revalidateForDay = async () => {
            const nextVendors = { ...selectedVendors };
            const removed = [];

            for (const category of categories) {
                const vendor = selectedVendors[category];
                if (!vendor) continue;

                try {
                    await persistVendorSelection({ category, vendor, dayOverride: selectedReservationDay });
                    const updated = {
                        ...vendor,
                        _selectionHoldStatus: 'held',
                    };
                    const normalizedMap = upsertCategorySelection(nextVendors, category, updated);
                    Object.keys(nextVendors).forEach((k) => delete nextVendors[k]);
                    Object.assign(nextVendors, normalizedMap);
                } catch (error) {
                    if (error?.status === 409) {
                        const normalizedMap = removeCategorySelections(nextVendors, category);
                        Object.keys(nextVendors).forEach((k) => delete nextVendors[k]);
                        Object.assign(nextVendors, normalizedMap);
                        try {
                            await persistVendorSelection({ category, vendor: null, dayOverride: selectedReservationDay });
                        } catch {
                            // best-effort cleanup: local state is already pruned
                        }
                        removed.push(category);
                    } else {
                        console.error('Failed to revalidate vendor selection on date change:', error);
                    }
                }
            }

            if (cancelled) return;

            if (removed.length > 0) {
                handleChange('vendors', nextVendors);
                toast.error(`Some selections are unavailable for ${reservationScopeLabel}. Please reselect: ${removed.join(', ')}`);
            }

            setVendorsRefreshKey((k) => k + 1);
        };

        revalidateForDay().catch((error) => {
            console.error('Failed to refresh vendor lock validation for new date:', error);
        });

        previousReservationDayRef.current = selectedReservationDay;

        return () => {
            cancelled = true;
        };
    }, [eventId, formData?.vendors, handleChange, persistVendorSelection, removeCategorySelections, reservationScopeLabel, selectedReservationDay, upsertCategorySelection]);

    // Poll periodically so auto-expired locks become selectable without manual refresh,
    // and so sidebar selections auto-clear when holds expire.
    useEffect(() => {
        if (!eventId || !activeCategory) return;

        const validateSelectedLocks = async () => {
            if (selectionInProgressRef.current) return;

            const selectedByCategory = currentVendorsRef.current && typeof currentVendorsRef.current === 'object'
                ? currentVendorsRef.current
                : {};
            const selectedKeys = Object.keys(selectedByCategory);
            if (selectedKeys.length === 0) return;

            const selectionQs = new URLSearchParams({ includeVendors: 'true' });
            appendReservationQueryParams(selectionQs);

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}?${selectionQs.toString()}`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) return;

            const heldByService = new Map();
            const backendVendors = Array.isArray(data?.data?.vendors) ? data.data.vendors : [];
            backendVendors.forEach((item) => {
                const vendorAuthId = item?.vendorAuthId != null ? String(item.vendorAuthId).trim() : '';
                if (!vendorAuthId) return;

                const canonicalService = canonicalizeServiceLabel(item?.service);
                const serviceId = item?.serviceId != null ? String(item.serviceId).trim() : null;
                heldByService.set(canonicalService, { vendorAuthId, serviceId });
            });

            const next = { ...selectedByCategory };
            let changed = false;

            const removeCanonicalCategory = (canonical) => {
                Object.keys(next).forEach((key) => {
                    if (canonicalizeServiceLabel(key) === canonical) {
                        delete next[key];
                        changed = true;
                    }
                });
            };

            selectedKeys.forEach((categoryKey) => {
                const selected = selectedByCategory[categoryKey];
                const canonical = canonicalizeServiceLabel(categoryKey);
                const held = heldByService.get(canonical);

                if (!held) {
                    removeCanonicalCategory(canonical);
                    return;
                }

                const selectedVendorAuthId = String(selected?.vendorAuthId || selected?.authId || '').trim();
                const selectedServiceId = (() => {
                    const raw = selected?.selectedPackage?.serviceId ?? selected?.selectedPackage?.id ?? selected?.serviceId;
                    const s = raw != null ? String(raw).trim() : '';
                    return s || null;
                })();

                if (selectedVendorAuthId && held.vendorAuthId !== selectedVendorAuthId) {
                    removeCanonicalCategory(canonical);
                    return;
                }

                if (selectedServiceId && held.serviceId && held.serviceId !== selectedServiceId) {
                    removeCanonicalCategory(canonical);
                }
            });

            if (changed) {
                handleChange('vendors', next);
                toast.error('Some vendor holds expired and were removed.');
            }
        };

        const tick = () => {
            setVendorsRefreshKey((k) => k + 1);
            validateSelectedLocks().catch((error) => {
                console.error('Failed to validate lock status during polling:', error);
            });
        };

        tick();
        const id = setInterval(tick, 60000);

        return () => clearInterval(id);
    }, [activeCategory, appendReservationQueryParams, dispatch, eventId, handleChange]);

    useEffect(() => {
        const nextSignature = `${priceMultiplier}:${absoluteMaxMultiplier}`;
        const prevSignature = prevDemandPricingSignatureRef.current;
        if (prevSignature === nextSignature) return;
        prevDemandPricingSignatureRef.current = nextSignature;

        const chosen = formData?.vendors && typeof formData.vendors === 'object' ? formData.vendors : {};
        const categories = Object.keys(chosen);
        if (categories.length === 0) return;

        setVendorsByCategory((prev) => {
            const next = {};
            Object.entries(prev || {}).forEach(([category, list]) => {
                next[category] = Array.isArray(list) ? list.map((vendorCard) => repriceVendorCard(vendorCard)) : [];
            });
            return next;
        });

        const nextVendors = { ...chosen };
        categories.forEach((category) => {
            nextVendors[category] = normalizeSelectedVendorPricing(chosen[category], {
                minMultiplier: priceMultiplier,
                maxMultiplier: absoluteMaxMultiplier,
            });
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
    }, [absoluteMaxMultiplier, eventId, formData?.vendors, handleChange, persistVendorSelection, priceMultiplier, repriceVendorCard]);

    const handleSelectVendorWrapper = async (category, vendor) => {
        if (vendor?.isAvailable === false) {
            toast.error('This vendor is currently locked for the selected date.');
            return;
        }

        // Mark selection in progress so the hydration effect doesn't overwrite
        selectionInProgressRef.current = true;
        if (selectionGuardTimerRef.current) clearTimeout(selectionGuardTimerRef.current);

        const hasExplicitUnitPricing = vendor?.unitPrice != null;

        const explicitMinMultiplier = toPositiveNumber(vendor?.priceMultiplier, priceMultiplier);
        const explicitAbsoluteMaxMultiplier = Math.max(
            explicitMinMultiplier,
            toPositiveNumber(vendor?.absoluteMaxMultiplier, absoluteMaxMultiplier)
        );
        const explicitRelativeMaxMultiplier = explicitAbsoluteMaxMultiplier / explicitMinMultiplier;
        const explicitUnitPrice = toPositiveNumber(vendor?.unitPrice, toPositiveNumber(vendor?.priceMin, 0));
        const explicitPriceMin = toPositiveNumber(vendor?.priceMin, explicitUnitPrice);
        const explicitPriceMax = Math.max(
            explicitPriceMin,
            toPositiveNumber(vendor?.priceMax, Math.round(explicitPriceMin * explicitRelativeMaxMultiplier))
        );
        const explicitBaseUnitPrice = explicitUnitPrice > 0 ? (explicitUnitPrice / explicitMinMultiplier) : 0;
        const explicitBasePriceMin = explicitPriceMin > 0 ? (explicitPriceMin / explicitMinMultiplier) : explicitBaseUnitPrice;
        const explicitBasePriceMax = explicitPriceMax > 0
            ? (explicitPriceMax / explicitAbsoluteMaxMultiplier)
            : explicitBasePriceMin;

        const serviceFallbackUnitPrice = getScaledMinFromServices({
            vendorLike: vendor,
            minMultiplier: toPositiveNumber(vendor?.priceMultiplier, priceMultiplier),
            maxMultiplier: toPositiveNumber(vendor?.absoluteMaxMultiplier, absoluteMaxMultiplier),
        });

        const fallbackPriceMin = toPositiveNumber(vendor?.priceMin, serviceFallbackUnitPrice || 0);

        const baseVendor = hasExplicitUnitPricing
            ? {
                ...vendor,
                baseUnitPrice: explicitBaseUnitPrice,
                basePriceMin: explicitBasePriceMin,
                basePriceMax: Math.max(explicitBasePriceMin, explicitBasePriceMax),
                unitPrice: explicitUnitPrice,
                priceMin: explicitPriceMin,
                priceMax: explicitPriceMax,
                priceMultiplier: explicitMinMultiplier,
                absoluteMaxMultiplier: explicitAbsoluteMaxMultiplier,
                maxPriceMultiplier: explicitRelativeMaxMultiplier,
            }
            : {
                ...vendor,
                priceMin: fallbackPriceMin,
                priceMax: vendor.priceMax || Math.round((fallbackPriceMin || 0)),
                maxPriceMultiplier: toPositiveNumber(relativeMaxMultiplier, 1),
            };

        const adjustedVendor = normalizeSelectedVendorPricing(baseVendor, {
            minMultiplier: priceMultiplier,
            maxMultiplier: absoluteMaxMultiplier,
        });

        try {
            await persistVendorSelection({ category, vendor: adjustedVendor });
        } catch (e) {
            console.error('Failed to persist vendor selection:', e);

            // Remove stale/conflicted card immediately so user doesn't keep selecting it.
            setVendorsByCategory((prev) => {
                const canonical = canonicalizeServiceLabel(category);
                const list = Array.isArray(prev?.[canonical]) ? prev[canonical] : [];
                const clickedVendorAuthId = String(adjustedVendor?.vendorAuthId || adjustedVendor?.authId || '').trim();
                const clickedServiceId = String(adjustedVendor?.serviceId || '').trim();
                return {
                    ...prev,
                    [canonical]: list.filter((v) => {
                        const sameId = String(v?.id || '') === String(adjustedVendor?.id || '');
                        const sameVendor = clickedVendorAuthId && String(v?.vendorAuthId || '').trim() === clickedVendorAuthId;
                        const sameService = clickedServiceId && String(v?.serviceId || '').trim() === clickedServiceId;
                        return !(sameId || sameVendor || sameService);
                    }),
                };
            });

            // If current selection for this service conflicts, deselect it first.
            const selectedByCategory = formData?.vendors && typeof formData.vendors === 'object' ? formData.vendors : {};
            const currentSelected = selectedByCategory?.[category] || selectedByCategory?.[canonicalizeServiceLabel(category)];
            if (currentSelected && String(currentSelected?.id || '') === String(adjustedVendor?.id || '')) {
                const cleared = removeCategorySelections(selectedByCategory, category);
                handleChange('vendors', cleared);
                try {
                    await persistVendorSelection({ category, vendor: null, dayOverride: selectedReservationDay });
                } catch {
                    // best-effort cleanup
                }
            }

            if (e?.status === 409) {
                toast.error('Vendor is currently unavailable for this date. Please choose another one.');
                setVendorsRefreshKey((k) => k + 1);
            } else {
                toast.error(e?.message || 'Failed to select vendor');
            }
            selectionInProgressRef.current = false;
            return;
        }

        const selectedByCategory = currentVendorsRef.current && typeof currentVendorsRef.current === 'object' ? currentVendorsRef.current : {};
        const next = upsertCategorySelection(selectedByCategory, category, {
            ...adjustedVendor,
            _selectionHoldStatus: 'held',
        });
        handleChange('vendors', next);

        // Keep the guard up for a few seconds so hydration doesn't race in
        selectionGuardTimerRef.current = setTimeout(() => {
            selectionInProgressRef.current = false;
        }, 5000);
    };

    const handleFinalizeReservation = useCallback(async () => {
        const selectedByCategory = formData?.vendors && typeof formData.vendors === 'object'
            ? { ...formData.vendors }
            : {};

        const categories = Object.keys(selectedByCategory);
        if (categories.length === 0) {
            toast.error('Select vendors before finalizing reservation.');
            return;
        }

        if (!isPublicListing && selectedReservationDay) {
            try {
                const synced = await syncPlanningReservationDay({ day: selectedReservationDay });
                if (synced) {
                    lastSyncedReservationDayRef.current = selectedReservationDay;
                }
            } catch (error) {
                toast.error(error?.message || 'Failed to sync updated event date. Please try again.');
                return;
            }
        }

        let nextVendors = { ...selectedByCategory };
        const removed = [];

        for (const category of categories) {
            const vendor = nextVendors[category];
            if (!vendor) continue;

            const derivedRelativeMaxMultiplier = toPositiveNumber(relativeMaxMultiplier, 1);

            const healedMin = toPositiveNumber(
                vendor?.priceMin,
                getScaledMinFromServices({
                    vendorLike: vendor,
                    minMultiplier: toPositiveNumber(vendor?.priceMultiplier, priceMultiplier),
                    maxMultiplier: toPositiveNumber(vendor?.absoluteMaxMultiplier, absoluteMaxMultiplier),
                })
            );
            const vendorForValidation = healedMin > 0
                ? {
                    ...vendor,
                    unitPrice: toPositiveNumber(vendor?.unitPrice, healedMin),
                    priceMin: healedMin,
                    priceMax: Math.max(
                        healedMin,
                        toPositiveNumber(vendor?.priceMax, Math.round(healedMin * derivedRelativeMaxMultiplier))
                    ),
                    maxPriceMultiplier: derivedRelativeMaxMultiplier,
                }
                : vendor;

            try {
                await persistVendorSelection({
                    category,
                    vendor: vendorForValidation,
                    dayOverride: selectedReservationDay,
                });
                nextVendors = upsertCategorySelection(nextVendors, category, {
                    ...vendorForValidation,
                    _selectionHoldStatus: 'held',
                });
            } catch (error) {
                if (error?.status === 409) {
                    nextVendors = removeCategorySelections(nextVendors, category);
                    try {
                        await persistVendorSelection({ category, vendor: null, dayOverride: selectedReservationDay });
                    } catch {
                        // best-effort cleanup
                    }
                    removed.push(category);
                } else {
                    toast.error(error?.message || 'Failed to validate current vendor locks.');
                    return;
                }
            }
        }

        handleChange('vendors', nextVendors);

        if (removed.length > 0) {
            toast.error(`Some vendors were no longer locked for this date and were removed: ${removed.join(', ')}`);
            setVendorsRefreshKey((k) => k + 1);
            return;
        }

        handleNext();
    }, [absoluteMaxMultiplier, formData?.vendors, handleChange, handleNext, isPublicListing, persistVendorSelection, priceMultiplier, relativeMaxMultiplier, removeCategorySelections, selectedReservationDay, syncPlanningReservationDay, upsertCategorySelection]);

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

    const handleRemoveService = async (index) => {
        const previousServices = Array.isArray(formData.services) ? [...formData.services] : [];
        const previousVendors = formData?.vendors && typeof formData.vendors === 'object' ? { ...formData.vendors } : {};

        const serviceToRemove = previousServices[index];
        const newServices = previousServices.filter((_, i) => i !== index);
        const newVendors = removeCategorySelections(previousVendors, serviceToRemove);

        const previousActiveTab = activeServiceTab;

        handleChange('vendors', newVendors);
        handleChange('services', newServices);

        if (activeServiceTab >= index && activeServiceTab > 0) {
            setActiveServiceTab((prev) => prev - 1);
        } else if (newServices.length <= activeServiceTab) {
            setActiveServiceTab(Math.max(0, newServices.length - 1));
        }

        try {
            await persistSelectedServices(newServices);
        } catch (e) {
            console.error('Failed to persist selected services:', e);
            toast.error(e?.message || 'Failed to remove service');
            handleChange('services', previousServices);
            handleChange('vendors', previousVendors);
            setActiveServiceTab(previousActiveTab);
        }
    };

    const handleRemoveVendorSelection = async (category) => {
        const previousVendors = formData?.vendors && typeof formData.vendors === 'object' ? { ...formData.vendors } : {};
        const canonical = canonicalizeServiceLabel(category);
        const current = previousVendors?.[category] || previousVendors?.[canonical];

        const newVendors = removeCategorySelections(previousVendors, category);
        handleChange('vendors', newVendors);

        try {
            await persistVendorSelection({ category, vendor: null });
        } catch (e) {
            console.error('Failed to persist vendor deselection:', e);
            toast.error(e?.message || 'Failed to remove selected vendor');
            if (current) {
                handleChange('vendors', previousVendors);
            }
        }
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
                // Keep backend planning day aligned before lock validation hydration.
                // Otherwise the GET call with day override can clear still-valid locks from the previous day.
                let dayForSelectionQuery = selectedReservationDay;
                if (!isPublicListing && selectedReservationDay && lastSyncedReservationDayRef.current !== selectedReservationDay) {
                    const synced = await syncPlanningReservationDay({ day: selectedReservationDay, silent: true });
                    if (!cancelled && synced) {
                        lastSyncedReservationDayRef.current = selectedReservationDay;
                    } else if (!synced) {
                        // Avoid destructive lock reconciliation against an unsynced override day.
                        dayForSelectionQuery = null;
                    }
                }

                const selectionQs = new URLSearchParams({ includeVendors: 'true' });
                if (isPublicListing) {
                    appendReservationQueryParams(selectionQs);
                } else if (dayForSelectionQuery) {
                    selectionQs.set('day', String(dayForSelectionQuery));
                }

                const response = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}?${selectionQs.toString()}`,
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

                if (!cancelled && !selectionInProgressRef.current) {
                    const knownServices = Array.isArray(formData.services) ? formData.services : [];
                    const vendorProfiles = Array.isArray(selection?.vendorProfiles) ? selection.vendorProfiles : [];
                    const profileByAuthId = new Map(
                        vendorProfiles
                            .map((profile) => [String(profile?.authId || '').trim(), profile])
                            .filter(([authId]) => Boolean(authId))
                    );

                    const fetchVenueServiceDetails = async (serviceId) => {
                        const id = String(serviceId || '').trim();
                        if (!id) return null;

                        try {
                            const svcRes = await fetchWithAuth(
                                `${API_BASE_URL}/api/vendor/public/services/${encodeURIComponent(id)}`,
                                { method: 'GET' },
                                { dispatch, refreshAction: refreshAccessToken }
                            );
                            const svcJson = await safeJson(svcRes);
                            if (!svcRes.ok || !svcJson?.success) return null;
                            return svcJson?.data?.service || null;
                        } catch {
                            return null;
                        }
                    };

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
                        const vendorAuthIdRaw = item?.vendorAuthId ?? item?.authId ?? null;
                        const vendorAuthId = vendorAuthIdRaw ? String(vendorAuthIdRaw).trim() : '';
                        if (!vendorAuthId) continue;

                        const key = resolveServiceKey(item?.service);
                        if (!key) continue;

                        const normalizedService = canonicalizeServiceLabel(item?.service);
                        const serviceId = item?.serviceId ? String(item.serviceId).trim() : null;
                        const hydratedId = serviceId || vendorAuthId;
                        const profile = profileByAuthId.get(vendorAuthId) || null;
                        const venueService = (normalizedService === 'Venue' && serviceId)
                            ? await fetchVenueServiceDetails(serviceId)
                            : null;
                        const current = (currentVendorsRef.current || {})[key] || {};
                        const matchedServiceFromCurrent = Array.isArray(current?.services)
                            ? current.services.find((svc) => {
                                const sid = String(svc?.serviceId || svc?.id || '').trim();
                                return Boolean(serviceId && sid && sid === serviceId);
                            })
                            : null;

                        const bannerImage = profile?.images?.banner?.fileUrl || null;
                        const profileImage = profile?.images?.profile?.fileUrl || null;

                        const venueDetails = venueService?.details || {};
                        const venueImage =
                            Array.isArray(venueDetails?.images) && venueDetails.images.length > 0
                                ? venueDetails.images[0]?.url
                                : (venueDetails?.image || null);

                        const fallbackLocation = profile?.location?.name || profile?.place || profile?.country || 'Location TBD';
                        const location = normalizedService === 'Venue'
                            ? (venueDetails?.locationAreaName || venueDetails?.location || fallbackLocation)
                            : fallbackLocation;

                        const lineMin = Number(item?.servicePrice?.min ?? 0);
                        const persistedPricingUnit = item?.pricingUnit != null ? String(item.pricingUnit).trim() : '';
                        const hydratedPricingUnit = current?.pricingUnit || persistedPricingUnit || inferPricingUnit({
                            serviceLabel: normalizedService,
                            serviceCategory: normalizedService,
                            categoryId: current?.categoryId,
                            pricingUnit: current?.pricingUnit || persistedPricingUnit,
                        });
                        const hydratedPricingModel = resolveServicePricingModel({
                            serviceLabel: normalizedService,
                            serviceCategory: normalizedService,
                            categoryId: current?.categoryId,
                            pricingUnit: hydratedPricingUnit,
                        });
                        const persistedPricingQuantityRaw = Number(item?.pricingQuantity);
                        const persistedPricingQuantity = Number.isFinite(persistedPricingQuantityRaw) && persistedPricingQuantityRaw > 0
                            ? persistedPricingQuantityRaw
                            : null;
                        const persistedPricingQuantityUnit = item?.pricingQuantityUnit != null
                            ? String(item.pricingQuantityUnit).trim() || null
                            : null;
                        const currentPricingQuantityRaw = Number(current?.pricingQuantity);
                        const currentPricingQuantity = Number.isFinite(currentPricingQuantityRaw) && currentPricingQuantityRaw > 0
                            ? currentPricingQuantityRaw
                            : null;
                        const inferredFixedQuantity = hydratedPricingModel === 'fixed'
                            ? (() => {
                                if (persistedPricingQuantity != null) return persistedPricingQuantity;
                                if (currentPricingQuantity != null) return currentPricingQuantity;

                                const lineMinRaw = Number(lineMin);
                                const unitRaw = Number(current?.unitPrice ?? current?.priceMin ?? 0);
                                if (Number.isFinite(lineMinRaw) && lineMinRaw > 0 && Number.isFinite(unitRaw) && unitRaw > 0) {
                                    const guessed = lineMinRaw / unitRaw;
                                    if (Number.isFinite(guessed) && guessed > 0) {
                                        return Math.max(0.5, Math.round(guessed * 2) / 2);
                                    }
                                }

                                return 1;
                            })()
                            : null;
                        const quantityMultiplier = resolvePricingQuantity({
                            vendorLike: {
                                ...current,
                                pricingUnit: hydratedPricingUnit,
                                ...(inferredFixedQuantity != null ? { pricingQuantity: inferredFixedQuantity } : {}),
                            },
                            category: normalizedService,
                        });
                        const safePriceMultiplier = toPositiveNumber(priceMultiplierRef.current, 1);
                        const safeAbsoluteMaxMultiplier = Math.max(
                            safePriceMultiplier,
                            toPositiveNumber(absoluteMaxMultiplierRef.current, safePriceMultiplier)
                        );
                        const activeRelativeMaxMultiplier = safeAbsoluteMaxMultiplier / safePriceMultiplier;
                        const hydratedUnitMin = Number.isFinite(lineMin) && lineMin > 0
                            ? Math.max(1, Math.round(lineMin / quantityMultiplier))
                            : Number(current?.unitPrice || 0);
                        const hydratedUnitMax = Math.max(
                            hydratedUnitMin,
                            Math.round(hydratedUnitMin * activeRelativeMaxMultiplier)
                        );

                        const baseUnitMin = Math.max(0, Math.round(hydratedUnitMin / safePriceMultiplier));
                        const baseUnitMax = Math.max(0, Math.round(hydratedUnitMax / safeAbsoluteMaxMultiplier));

                        const hydratedImage = normalizedService === 'Venue'
                            ? (venueImage || current?.image || bannerImage || profileImage || pickFallbackImage(normalizedService, 0))
                            : (bannerImage || profileImage || current?.image || venueImage || pickFallbackImage(normalizedService, 0));

                        nextVendors[key] = {
                            ...current,
                            id: hydratedId,
                            vendorAuthId,
                            authId: vendorAuthId,
                            serviceId,
                            category: normalizedService,
                            categoryId: normalizedService === 'Venue' ? 'venues' : (current?.categoryId || null),
                            name: venueService?.name || current?.name || current?.vendorBusinessName || profile?.businessName || 'Selected Vendor',
                            vendorBusinessName: current?.vendorBusinessName || profile?.businessName || current?.name || null,
                            image: hydratedImage,
                            banner: current?.banner || (normalizedService === 'Venue'
                                ? (venueImage || bannerImage || profileImage || null)
                                : (bannerImage || profileImage || venueImage || null)),
                            profileImage: profileImage || current?.profileImage || null,
                            location,
                            mapsUrl:
                                venueDetails?.locationMapsUrl ||
                                venueDetails?.mapsUrl ||
                                current?.mapsUrl ||
                                profile?.location?.mapsUrl ||
                                null,
                            details: normalizedService === 'Venue' ? (venueDetails || current?.details || {}) : (current?.details || {}),
                            selectedPackage: serviceId
                                ? {
                                    serviceId,
                                    id: serviceId,
                                    name: (normalizedService === 'Venue'
                                        ? (venueService?.name || current?.name || null)
                                        : (matchedServiceFromCurrent?.name || current?.name || null)),
                                    tier: matchedServiceFromCurrent?.tier || null,
                                }
                                : current?.selectedPackage,
                            pricingUnit: hydratedPricingUnit,
                            pricingQuantity: inferredFixedQuantity != null
                                ? inferredFixedQuantity
                                : (persistedPricingQuantity != null ? persistedPricingQuantity : current?.pricingQuantity),
                            pricingQuantityUnit: inferredFixedQuantity != null
                                ? (String(hydratedPricingUnit || '').toUpperCase() === 'PER_KG'
                                    ? (persistedPricingQuantityUnit || 'kg')
                                    : (persistedPricingQuantityUnit || current?.pricingQuantityUnit))
                                : (persistedPricingQuantityUnit || current?.pricingQuantityUnit),
                            baseUnitPrice: baseUnitMin,
                            basePriceMin: baseUnitMin,
                            basePriceMax: baseUnitMax > 0 ? baseUnitMax : baseUnitMin,
                            priceMultiplier: safePriceMultiplier,
                            absoluteMaxMultiplier: safeAbsoluteMaxMultiplier,
                            maxPriceMultiplier: safeAbsoluteMaxMultiplier / safePriceMultiplier,
                            unitPrice: Number.isFinite(hydratedUnitMin) && hydratedUnitMin > 0 ? hydratedUnitMin : Number(current?.unitPrice || 0),
                            priceMin: Number.isFinite(hydratedUnitMin) && hydratedUnitMin > 0 ? hydratedUnitMin : Number(current?.priceMin || 0),
                            priceMax: Number.isFinite(hydratedUnitMax) && hydratedUnitMax > 0 ? hydratedUnitMax : Number(current?.priceMax || 0),
                            _selectionHoldStatus: current?._selectionHoldStatus === 'held' ? 'held' : 'restored',
                        };
                    }

                    const normalizedCurrent = JSON.stringify(currentVendorsRef.current || {});
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
    // NOTE: formData?.vendors, priceMultiplier, absoluteMaxMultiplier intentionally excluded.
    // Refs are used instead to break re-run loops that overwrote fresh local selections.
    }, [appendReservationQueryParams, dispatch, eventDayCount, eventId, formData.services, handleChange, isPublicListing, overallAttendeeCount, resolvePricingQuantity, selectedReservationDay, setActiveServiceTab, syncPlanningReservationDay]);

    // Fetch vendors from backend per category + filters
    const searchDebounceRef = useRef(null);
    useEffect(() => {
        if (!eventId || !activeCategory) return;

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(async () => {
            setVendorsLoading(true);
            setVendorsError(null);

            try {
                const qs = new URLSearchParams({
                    serviceCategory: activeCategory,
                    sort: sortOption,
                    priceMin: String(priceRange.min ?? 0),
                    priceMax: String(priceRange.max ?? 0),
                    radiusKm: String(DEFAULT_VENDOR_RADIUS_KM),
                    limit: '100',
                    includeUnavailable: availabilityFilter === 'showLocked' ? 'true' : 'false',
                });
                if (searchQuery?.trim()) qs.set('q', searchQuery.trim());
                appendReservationQueryParams(qs);

                const response = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(eventId))}/vendors?${qs.toString()}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const data = await safeJson(response);
                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || 'Failed to fetch vendors');
                }

                const backendMultipliers = normalizeDemandPricingMultipliers(data?.data?.pricingMultipliers || data?.data?.demandPricingMultipliers);
                stableSetDemandPricingMultipliers(backendMultipliers);

                const backendDemandTier = String(data?.data?.demandTier || '').trim().toUpperCase();
                const resolvedActiveMultipliers = backendDemandTier === 'HIGH_DEMAND'
                    ? backendMultipliers.highDemand
                    : backendMultipliers.normal;

                const vendors = Array.isArray(data?.data?.vendors) ? data.data.vendors : [];
                const mapped = activeCategory === 'Venue'
                    ? vendors.flatMap((v, idx) => {
                        const services = Array.isArray(v?.services) ? v.services : [];
                        if (services.length === 0) {
                            return [mapBackendVendorToCard(v, 'Venue', idx, eventLat, eventLng, resolvedActiveMultipliers.min, resolvedActiveMultipliers.max)];
                        }
                        return services.map((svc, svcIdx) => mapBackendVenueServiceToCard({
                            vendor: v,
                            service: svc,
                            index: idx * 100 + svcIdx,
                            eventLat,
                            eventLng,
                            minMultiplier: resolvedActiveMultipliers.min,
                            maxMultiplier: resolvedActiveMultipliers.max,
                        }));
                    })
                    : vendors.map((v, idx) => mapBackendVendorToCard(v, activeCategory, idx, eventLat, eventLng, resolvedActiveMultipliers.min, resolvedActiveMultipliers.max));

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
    }, [activeCategory, appendReservationQueryParams, availabilityFilter, dispatch, eventId, eventLat, eventLng, priceRange.max, priceRange.min, searchQuery, sortOption, stableSetDemandPricingMultipliers, vendorsRefreshKey]);

    const filteredVendors = useMemo(() => {
        const fetched = vendorsByCategory[activeCategory];

        // Never fall back to static dummy vendors on the live selection step.
        // The list should reflect the backend vendor set, including unavailable ones.
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

        if (availabilityFilter === 'availableOnly') {
            allVendors = allVendors.filter((v) => v?.isAvailable !== false);
        }

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

        allVendors = [...allVendors].sort((a, b) => {
            const aUnavailable = a?.isAvailable === false ? 1 : 0;
            const bUnavailable = b?.isAvailable === false ? 1 : 0;
            return aUnavailable - bUnavailable;
        });

        return allVendors;
    }, [activeCategory, attendeeInfo.attendeeCount, availabilityFilter, searchQuery, sortOption, priceRange, vendorsByCategory]);

    const totalPages = Math.max(1, Math.ceil(filteredVendors.length / ITEMS_PER_PAGE));
    const paginatedVendors = filteredVendors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const paginatedAvailableVendors = paginatedVendors.filter((v) => v?.isAvailable !== false);
    const paginatedUnavailableVendors = paginatedVendors.filter((v) => v?.isAvailable === false);

    const allServicesSelected = formData.services?.every((service) => hasSelectedVendorForService(service));
    const getVendorLineMin = (v) => {
        const unitPrice = Number(v?.unitPrice ?? v?.priceMin ?? 0);
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) return 0;

        const multiplier = resolvePricingQuantity({ vendorLike: v, category: v?.category });
        return Math.round(unitPrice * multiplier);
    };

    const estimatedTotal = Object.values(formData.vendors).reduce((acc, v) => acc + getVendorLineMin(v), 0);
    const estimatedMax = Object.values(formData.vendors).reduce(
        (acc, v) => {
            const maxMultiplier = Number(v?.maxPriceMultiplier || relativeMaxMultiplier || 1);
            const safeMultiplier = Number.isFinite(maxMultiplier) && maxMultiplier > 0 ? maxMultiplier : (relativeMaxMultiplier || 1);
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
                        isSelected={isVendorCurrentlySelected(selectedVendorForDetails)}
                        priceMultiplier={priceMultiplier}
                        attendeeCount={attendeeInfo.attendeeCount}
                        attendeeLabel={attendeeInfo.attendeeLabel}
                        eventDayCount={eventDayCount}
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
                                Explore our handpicked collection of {activeCategory.toLowerCase()}{activeCategory.toLowerCase() == "catering & drinks"?'':'s'}, each chosen for their unique character, exceptional service, and ability to create unforgettable moments.
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
                                        className={`hidden md:flex items-center gap-4 px-6 border-l border-gray-100 relative group ${isPublicListing ? 'cursor-default' : 'cursor-pointer'}`}
                                        onClick={isPublicListing ? undefined : () => setIsCalendarOpen(!isCalendarOpen)}
                                    >
                                        <BsCalendarEvent className="text-primary/40 group-hover:text-primary transition-colors" size={14} />
                                        <div className={`flex flex-col relative ${isPublicListing ? 'w-48' : 'w-24'}`}>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-primary/40">{isPublicListing ? 'Date Range' : 'Date'}</span>
                                            <span
                                                className={`text-[10px] font-bold text-primary transition-colors truncate ${isPublicListing ? '' : 'underline decoration-dotted underline-offset-4 cursor-pointer group-hover:text-secondary'}`}
                                                title={displayedDateLabel}
                                            >
                                                {displayedDateLabel}
                                            </span>

                                            <AnimatePresence>
                                                {!isPublicListing && isCalendarOpen && (
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

                                    <div className="shrink-0 flex items-center gap-2 bg-white border border-primary/10 rounded-full p-1">
                                        <button
                                            type="button"
                                            onClick={() => setAvailabilityFilter('availableOnly')}
                                            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${availabilityFilter === 'availableOnly'
                                                ? 'bg-primary text-white'
                                                : 'text-primary/60 hover:text-primary hover:bg-primary/5'}`}
                                        >
                                            Available Only
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAvailabilityFilter('showLocked')}
                                            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${availabilityFilter === 'showLocked'
                                                ? 'bg-primary text-white'
                                                : 'text-primary/60 hover:text-primary hover:bg-primary/5'}`}
                                        >
                                            Show Locked
                                        </button>
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

                                {isPublicListing && activeCategory === 'Venue' && attendeeInfo.capacityBaselineValue > 0 && (
                                    <div className="rounded-2xl border border-primary/10 bg-white/80 px-4 py-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50">Venue Capacity Baseline</p>
                                        <p className="text-xs text-primary mt-1 font-semibold">
                                            {attendeeInfo.capacityBaselineSource === 'peak-day'
                                                ? `Using peak day tickets: ${attendeeInfo.capacityBaselineValue.toLocaleString()} (max day-wise allocation).`
                                                : `Using fallback tickets total: ${attendeeInfo.capacityBaselineValue.toLocaleString()}.`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vendors Grid */}
                        {vendorsLoading ? (
                            <div className="rounded-3xl border border-primary/10 bg-white p-8 text-center text-primary/60 font-semibold">
                                Loading vendors...
                            </div>
                        ) : vendorsError ? (
                            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                                <p className="text-red-700 font-bold">Failed to load vendors</p>
                                <p className="text-red-600 text-sm mt-2">{vendorsError}</p>
                            </div>
                        ) : paginatedVendors.length === 0 ? (
                            <div className="rounded-3xl border border-primary/10 bg-white p-8 text-center text-primary/70">
                                {availabilityFilter === 'availableOnly'
                                    ? `No available ${activeCategory.toLowerCase()} vendors matched your date and filters.`
                                    : `No ${activeCategory.toLowerCase()} vendors matched your date and filters.`}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {paginatedAvailableVendors.length > 0 && (
                                    <div>
                                        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Available</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                            {paginatedAvailableVendors.map(vendor => (
                                                <VendorCard
                                                    key={vendor.id}
                                                    vendor={vendor}
                                                    isSelected={isVendorCurrentlySelected(vendor)}
                                                    isUnavailable={vendor?.isAvailable === false}
                                                    unavailableReason={vendor?.unavailableReason}
                                                    onSelect={() => handleSelectVendorWrapper(activeCategoryRaw, vendor)}
                                                    onViewDetails={() => setSelectedVendorForDetails(vendor)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {availabilityFilter === 'showLocked' && paginatedUnavailableVendors.length > 0 && (
                                    <div>
                                        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-red-600">Unavailable / Locked</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                            {paginatedUnavailableVendors.map(vendor => (
                                                <VendorCard
                                                    key={vendor.id}
                                                    vendor={vendor}
                                                    isSelected={isVendorCurrentlySelected(vendor)}
                                                    isUnavailable={vendor?.isAvailable === false}
                                                    unavailableReason={vendor?.unavailableReason}
                                                    onSelect={() => handleSelectVendorWrapper(activeCategoryRaw, vendor)}
                                                    onViewDetails={() => setSelectedVendorForDetails(vendor)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                    attendeeCount={attendeeInfo.attendeeCount}
                    pricingAttendeeCount={overallAttendeeCount}
                    attendeeLabel={attendeeInfo.attendeeLabel}
                    eventDayCount={eventDayCount}
                    isHighDemand={isHighDemand}
                    estimatedTotal={estimatedTotal}
                    estimatedMax={estimatedMax}
                    allServicesSelected={allServicesSelected}
                    onRemoveVendor={handleRemoveVendorSelection}
                    onBack={handleBack}
                    onNext={handleFinalizeReservation}
                />
            </div>
        </div>
    );
};

export default StepVendorSelection;
