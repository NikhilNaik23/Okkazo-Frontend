import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HeroSlider from "../../../components/User/Dashboard/HeroSlider";
import EventRow from "../../../components/User/Dashboard/EventRow";
import {
    fetchDashboardData,
    selectDashboardErrors,
    selectDashboardInterestFields,
    selectDashboardIsLoading,
    selectDashboardMarketplaceEvents,
} from "../../../store/slices/dashboardSlice";

const PREDEFINED_FIELDS = [
    "Tech & Innovation", "Art & Design", "Music & Live Events", "Food & Culinary",
    "Health & Wellness", "Travel & Adventure", "Business & Networking", "Science & Education",
    "Sports & Fitness", "Gaming & E-Sports", "Fashion & Lifestyle", "Literature & Writing",
    "Photography", "Film & Cinema", "Startups & Entrepreneurship", "Social Impact"
];

const FIELD_GROUPS = {
    music: ["music & live events"],
    business: ["business & networking", "tech & innovation", "startups & entrepreneurship", "science & education"],
    creative: ["art & design", "photography", "film & cinema", "literature & writing", "fashion & lifestyle"],
};

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2574&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2680&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574&auto=format&fit=crop",
];

const normalizeField = (value) => String(value || "").trim().toLowerCase();

const resolveBannerUrl = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
        const s = value.trim();
        return s || null;
    }

    if (typeof value === "object") {
        const candidates = [value.url, value.fileUrl, value.secure_url, value.src, value.image];
        for (const item of candidates) {
            if (typeof item === "string" && item.trim()) return item.trim();
        }
    }

    return null;
};

const isKnownField = (value) => PREDEFINED_FIELDS.some((field) => normalizeField(field) === normalizeField(value));

const formatDateBadge = (value) => {
    if (!value) return "DATE TBA";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "DATE TBA";
    const day = d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
    const month = d.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
    const date = String(d.getDate()).padStart(2, "0");
    const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toUpperCase();
    return `${day}, ${month} ${date} • ${time}`;
};

const formatPrice = (tickets) => {
    const ticketType = String(tickets?.ticketType || "").toLowerCase();
    if (ticketType === "free") return "Free";

    const tiers = Array.isArray(tickets?.tiers) ? tickets.tiers : [];
    const prices = tiers
        .map((tier) => Number(tier?.price || 0))
        .filter((n) => Number.isFinite(n) && n >= 0);

    const minPrice = prices.length ? Math.min(...prices) : 0;
    return `₹${minPrice.toLocaleString("en-IN")}`;
};

const formatTierPrice = (price) => {
    const n = Number(price || 0);
    if (!Number.isFinite(n) || n <= 0) return "Free";
    return `₹${n.toLocaleString("en-IN")}`;
};

const mapTicketCategories = (tickets) => {
    const tiers = Array.isArray(tickets?.tiers) ? tickets.tiers : [];
    if (tiers.length > 0) {
        return tiers.map((tier, idx) => ({
            name: String(tier?.name || `Category ${idx + 1}`),
            price: formatTierPrice(tier?.price),
        }));
    }

    return [
        {
            name: "General Admission",
            price: formatPrice(tickets),
        },
    ];
};

const normalizeDayKey = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const day = raw.includes('T') ? raw.slice(0, 10) : raw;
    return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : '';
};

const mapTicketDayWiseAllocations = (tickets) => {
    const rows = Array.isArray(tickets?.dayWiseAllocations) ? tickets.dayWiseAllocations : [];
    return rows
        .map((row) => {
            const day = normalizeDayKey(row?.day);
            if (!day) return null;

            const ticketCountRaw = Number(row?.ticketCount || 0);
            const ticketCount = Number.isFinite(ticketCountRaw) && ticketCountRaw > 0 ? ticketCountRaw : 0;
            const tierBreakdown = (Array.isArray(row?.tierBreakdown) ? row.tierBreakdown : [])
                .map((tier) => {
                    const name = String(tier?.name || tier?.tierName || '').trim();
                    if (!name) return null;

                    const countRaw = Number(tier?.available ?? tier?.ticketCount ?? tier?.quantity ?? 0);
                    const noOfTickets = Number.isFinite(countRaw) && countRaw > 0 ? countRaw : 0;
                    const priceRaw = Number(tier?.price || 0);
                    const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0;

                    return {
                        name,
                        noOfTickets,
                        price,
                    };
                })
                .filter(Boolean);

            return {
                day,
                ticketCount,
                tierBreakdown,
            };
        })
        .filter(Boolean)
        .sort((a, b) => String(a.day).localeCompare(String(b.day)));
};

const formatTimeRange = (startAt, endAt) => {
    const start = startAt ? new Date(startAt) : null;
    const end = endAt ? new Date(endAt) : null;

    if (start && !Number.isNaN(start.getTime()) && end && !Number.isNaN(end.getTime())) {
        const startText = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toUpperCase();
        const endText = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toUpperCase();
        return `${startText} - ${endText}`;
    }

    if (start && !Number.isNaN(start.getTime())) {
        return start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toUpperCase();
    }

    return "Time TBA";
};

const normalizePromotionLabel = (value) => {
    const text = String(value || "").trim();
    if (!text) return "";
    return text
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
};

const mapSelectedPromotions = (event) => {
    const selected = Array.isArray(event?.selectedPromotions)
        ? event.selectedPromotions
        : (Array.isArray(event?.promotionType) ? event.promotionType : []);

    const seen = new Set();
    const normalized = [];
    for (const promo of selected) {
        const label = normalizePromotionLabel(promo);
        if (!label) continue;
        const key = label.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        normalized.push(label);
    }
    return normalized;
};

const toRad = (deg) => (deg * Math.PI) / 180;
const haversineKm = (a, b) => {
    if (!a || !b) return Number.POSITIVE_INFINITY;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const value =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return 6371 * (2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)));
};

const getBrowserLocation = () => new Promise((resolve) => {
    if (!navigator?.geolocation) {
        resolve(null);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            resolve({
                lat: Number(position?.coords?.latitude),
                lng: Number(position?.coords?.longitude),
            });
        },
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 }
    );
});

const pickStatus = (event) => {
    const noOfTickets = Number(event?.tickets?.noOfTickets || 0);
    const sold = Number(event?.ticketsSold || 0);
    if (noOfTickets > 0) {
        const ratio = sold / noOfTickets;
        if (ratio >= 0.8) return "Selling fast";
    }
    if (event?.tickets?.ticketType === "free") return "RSVP required";
    return "Available";
};

const mapMarketplaceEventToCard = (event, index) => {
    const field = isKnownField(event?.eventField) ? event?.eventField : "Social Impact";
    const startAt = event?.eventScheduled?.startAt || null;
    const endAt = event?.eventScheduled?.endAt || null;
    const locationName = event?.venue?.locationName || "India";
    const coords = {
        lat: Number(event?.venue?.latitude),
        lng: Number(event?.venue?.longitude),
    };

    return {
        id: String(event?.eventId || `market-${index}`),
        title: event?.eventTitle || "Untitled Event",
        date: formatDateBadge(startAt),
        eventTime: formatTimeRange(startAt, endAt),
        location: locationName,
        eventLocation: locationName,
        price: formatPrice(event?.tickets),
        image: resolveBannerUrl(event?.eventBanner) || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
        tag: field,
        field,
        description: event?.eventDescription || "A curated experience designed for the modern connoisseur.",
        categories: mapTicketCategories(event?.tickets),
        ticketDayWiseAllocations: mapTicketDayWiseAllocations(event?.tickets),
        status: pickStatus(event),
        trendingScore: Number(event?.trendingScore || 0),
        ticketsSold: Number(event?.ticketsSold || 0),
        scheduleStartAt: startAt,
        scheduleEndAt: endAt,
        selectedPromotions: mapSelectedPromotions(event),
        coords,
        raw: event,
    };
};

const uniqueById = (events) => {
    const seen = new Set();
    return events.filter((event) => {
        const key = String(event?.id || "");
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const inFieldGroup = (eventField, groupKeys) => {
    const normalized = normalizeField(eventField);
    return groupKeys.includes(normalized);
};

// --- Main Dashboard ---

const UserDashboard = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";
    const marketplaceEvents = useSelector(selectDashboardMarketplaceEvents);
    const dashboardInterestFields = useSelector(selectDashboardInterestFields);
    const dashboardErrors = useSelector(selectDashboardErrors);
    const loading = useSelector(selectDashboardIsLoading);

    const [geoLocation, setGeoLocation] = useState(null);

    useEffect(() => {
        dispatch(fetchDashboardData({ limit: 300 }));
    }, [dispatch]);

    useEffect(() => {
        let active = true;

        const resolveLocation = async () => {
            const browserLocation = await getBrowserLocation();
            if (!active) return;
            setGeoLocation(browserLocation);
        };

        resolveLocation();

        return () => {
            active = false;
        };
    }, []);

    const liveEvents = useMemo(
        () => uniqueById((Array.isArray(marketplaceEvents) ? marketplaceEvents : []).map(mapMarketplaceEventToCard)),
        [marketplaceEvents]
    );

    const interestFields = useMemo(
        () => (Array.isArray(dashboardInterestFields) ? dashboardInterestFields.filter((f) => isKnownField(f)) : []),
        [dashboardInterestFields]
    );

    const sourceEvents = liveEvents;

    const filteredAllEvents = useMemo(() => {
        if (!searchQuery) return sourceEvents;

        return sourceEvents.filter(e =>
            String(e?.title || "").toLowerCase().includes(searchQuery) ||
            String(e?.tag || "").toLowerCase().includes(searchQuery) ||
            String(e?.location || "").toLowerCase().includes(searchQuery)
        );
    }, [sourceEvents, searchQuery]);

    const sortedByTrending = useMemo(() => {
        return [...filteredAllEvents].sort((a, b) => {
            const scoreDiff = Number(b?.trendingScore || 0) - Number(a?.trendingScore || 0);
            if (scoreDiff !== 0) return scoreDiff;
            return Number(b?.ticketsSold || 0) - Number(a?.ticketsSold || 0);
        });
    }, [filteredAllEvents]);

    const topTenEvents = useMemo(() => {
        if (geoLocation) {
            return [...sortedByTrending]
                .map((event) => ({
                    ...event,
                    distanceKm: haversineKm(geoLocation, event?.coords),
                }))
                .sort((a, b) => {
                    const distDiff = Number(a?.distanceKm || Number.POSITIVE_INFINITY) - Number(b?.distanceKm || Number.POSITIVE_INFINITY);
                    if (distDiff !== 0) return distDiff;
                    return Number(b?.trendingScore || 0) - Number(a?.trendingScore || 0);
                })
                .slice(0, 10);
        }

        return sortedByTrending.slice(0, 10);
    }, [sortedByTrending, geoLocation]);

    const musicEvents = useMemo(() => {
        const items = filteredAllEvents.filter((event) => inFieldGroup(event?.field || event?.tag, FIELD_GROUPS.music));
        return items.length ? items : sortedByTrending.slice(0, 8);
    }, [filteredAllEvents, sortedByTrending]);

    const businessEvents = useMemo(() => {
        const items = filteredAllEvents.filter((event) => inFieldGroup(event?.field || event?.tag, FIELD_GROUPS.business));
        return items.length ? items : sortedByTrending.slice(0, 8);
    }, [filteredAllEvents, sortedByTrending]);

    const creativeEvents = useMemo(() => {
        const items = filteredAllEvents.filter((event) => inFieldGroup(event?.field || event?.tag, FIELD_GROUPS.creative));
        return items.length ? items : sortedByTrending.slice(0, 8);
    }, [filteredAllEvents, sortedByTrending]);

    const recommendedEvents = useMemo(() => {
        if (interestFields.length) {
            const normalizedInterests = interestFields.map(normalizeField);
            const matching = filteredAllEvents.filter((event) => normalizedInterests.includes(normalizeField(event?.field || event?.tag)));
            if (matching.length) return matching.slice(0, 8);
        }
        return sortedByTrending.slice(0, 8);
    }, [filteredAllEvents, sortedByTrending, interestFields]);

    const heroEvents = useMemo(() => {
        if (searchQuery) return [];
        if (topTenEvents.length) return topTenEvents.slice(0, 3);
        return [];
    }, [searchQuery, topTenEvents]);

    const hasResults = filteredAllEvents.length > 0;
    const hasMarketplaceError = Boolean(dashboardErrors?.marketplaceError);
    const showSkeleton = loading || (hasMarketplaceError && liveEvents.length === 0);

    return (
        <div className="bg-[#EBF4F6] pb-20 overflow-x-hidden overflow-y-hidden">
            {!searchQuery && <HeroSlider events={heroEvents} />}

            {/* Content Stacks */}
            <div className={`relative z-30 space-y-8 px-4 md:px-8 pb-12 ${searchQuery ? "mt-28" : "mt-8"}`}>

                {searchQuery && (
                    <div className="mb-8">
                        <h2 className="text-3xl font-serif-premium text-[#09637E] italic">
                            Search Results for "{searchQuery}"
                        </h2>
                        <p className="text-sm text-[#09637E]/60 uppercase tracking-widest mt-2">
                            {showSkeleton ? 'Loading events...' : `Found ${filteredAllEvents.length} events`}
                        </p>
                    </div>
                )}

                {showSkeleton && (
                    <div className="space-y-8 animate-pulse">
                        {[1, 2, 3].map((row) => (
                            <div key={`dashboard-skeleton-row-${row}`} className="space-y-4">
                                <div className="h-8 w-64 rounded-xl bg-white/80" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map((card) => (
                                        <div key={`dashboard-skeleton-card-${row}-${card}`} className="h-72 rounded-3xl bg-white/80 border border-[#7AB2B2]/15" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!showSkeleton && hasResults ? (
                    <>
                        {topTenEvents.length > 0 && <EventRow title={searchQuery ? "Top Matches" : "Top 10 Trending Events Near You"} events={topTenEvents} isTopTen={!searchQuery} />}
                        {musicEvents.length > 0 && <EventRow title="Music & Entertainment" events={musicEvents} />}
                        {businessEvents.length > 0 && <EventRow title="Business & Technology" events={businessEvents} />}
                        {creativeEvents.length > 0 && <EventRow title="Creative Arts & Culture" events={creativeEvents} />}

                        {recommendedEvents.length > 0 && <EventRow title={searchQuery ? "More Results" : "Recommended for You"} events={recommendedEvents} />}
                    </>
                ) : !showSkeleton ? (
                    <div className="text-center py-20 opacity-50">
                        <p className="font-serif-premium text-2xl text-[#09637E]">No events found.</p>
                        <p className="text-sm font-medium mt-2 text-[#09637E]/60">Try adjusting your search terms.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default UserDashboard;
