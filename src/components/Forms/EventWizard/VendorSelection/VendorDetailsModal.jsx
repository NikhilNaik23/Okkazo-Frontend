import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsXLg, BsStarFill, BsCheck, BsArrowRight } from 'react-icons/bs';
import { BsGlobe, BsTelephone, BsEnvelope, BsInstagram } from 'react-icons/bs';
import { MdLocationOn } from 'react-icons/md';
import ReviewsTab from './ReviewsTab';
import { vendorHighlights } from '../../../../data/vendorSelectionData';
import { inferPricingUnit, resolveServicePricingModel } from '../../../../utils/pricing';

const toPositiveNumber = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

const toNonNegativeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const formatUnavailableReason = (reason) => {
    const raw = String(reason || '').trim();
    if (!raw) return 'Currently locked for selected date';
    return raw
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (ch) => ch.toUpperCase());
};

const resolveVendorImage = (vendor) => {
    return (
        vendor?.banner ||
        vendor?.image ||
        vendor?.profileImage ||
        vendor?._raw?.banner ||
        vendor?._raw?.images?.banner?.fileUrl ||
        vendor?._raw?.images?.profile?.fileUrl ||
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=2069&auto=format&fit=crop'
    );
};

const normalizeInclusionItems = (value) => {
    if (Array.isArray(value)) {
        return value
            .flatMap((item) => normalizeInclusionItems(item))
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        const raw = value.trim();
        if (!raw) return [];

        // Support comma/newline separated payloads from mixed backends.
        if (raw.includes('\n') || raw.includes(',')) {
            return raw
                .split(/\n|,/)
                .map((part) => part.trim())
                .filter(Boolean);
        }

        return [raw];
    }

    if (value && typeof value === 'object') {
        const candidate = value?.name || value?.label || value?.title || value?.item || null;
        if (typeof candidate === 'string' && candidate.trim()) {
            return [candidate.trim()];
        }

        // Some payloads wrap items as an object map.
        const values = Object.values(value);
        if (values.length > 0) {
            return values.flatMap((item) => normalizeInclusionItems(item)).filter(Boolean);
        }
    }

    return [];
};

const VendorDetailsModal = ({
    vendor,
    onClose,
    onSelect,
    isSelected,
    priceMultiplier = 1,
    guestCount = 0,
    attendeeCount: attendeeCountProp,
    attendeeLabel: attendeeLabelProp,
    eventDayCount = 1,
    mode,
}) => {
    const [activeTab, setActiveTab] = React.useState('Overview');
    const [expandedPackageId, setExpandedPackageId] = React.useState(null);
    const [packageQuantityById, setPackageQuantityById] = React.useState({});

    const isVenueServiceMode = mode === 'venue-service';

    const attendeeCountRaw = Number(attendeeCountProp ?? guestCount ?? 0);
    const attendeeCount = Number.isFinite(attendeeCountRaw) ? attendeeCountRaw : 0;
    const attendeeLabel = attendeeLabelProp || 'Guests';
    const attendeeCountForPricing = Math.max(1, attendeeCount || 0);
    const normalizedEventDayCount = Math.max(1, Number(eventDayCount || 1));

    const currentPackages = Array.isArray(vendor?.services) ? vendor.services : [];
    const expandedPackage = currentPackages.find(p => (p.serviceId || p.id) === expandedPackageId);

    React.useEffect(() => {
        if (!vendor) return;
        setActiveTab('Overview');
        setExpandedPackageId(null);
        setPackageQuantityById({});
    }, [vendor]);

    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const expandedPackageSafe = expandedPackage || {};
    const expandedInclusionItems = React.useMemo(() => {
        return normalizeInclusionItems(
            expandedPackageSafe?.details?.items
            ?? expandedPackageSafe?.details?.inclusions
            ?? expandedPackageSafe?.items
            ?? expandedPackageSafe?.inclusions
            ?? []
        );
    }, [expandedPackageSafe]);

    if (!vendor) return null;

    const effectiveMinMultiplier = toPositiveNumber(vendor?.priceMultiplier, toPositiveNumber(priceMultiplier, 1));
    const derivedAbsoluteMax = effectiveMinMultiplier * toPositiveNumber(vendor?.maxPriceMultiplier, 1);
    const effectiveAbsoluteMaxMultiplier = Math.max(
        effectiveMinMultiplier,
        toPositiveNumber(vendor?.absoluteMaxMultiplier, derivedAbsoluteMax)
    );
    const relativeMaxMultiplier = effectiveAbsoluteMaxMultiplier / effectiveMinMultiplier;

    const buildSelectedVendorPayload = ({
        sourceVendor,
        unitPrice,
        pricingUnit,
        pricingQuantity = null,
        pricingQuantityUnit = null,
        selectedPackage = null,
    }) => {
        const safeUnitPrice = toNonNegativeNumber(unitPrice, 0);
        const baseUnitPrice = safeUnitPrice / effectiveMinMultiplier;
        const basePriceMin = baseUnitPrice;
        const basePriceMax = baseUnitPrice;

        const qty = Number(pricingQuantity);
        const normalizedQuantity = Number.isFinite(qty) && qty > 0 ? qty : null;

        return {
            ...sourceVendor,
            pricingUnit,
            ...(normalizedQuantity != null ? { pricingQuantity: normalizedQuantity } : {}),
            ...(pricingQuantityUnit ? { pricingQuantityUnit } : {}),
            baseUnitPrice,
            basePriceMin,
            basePriceMax,
            unitPrice: safeUnitPrice,
            priceMin: safeUnitPrice,
            priceMax: Math.round(safeUnitPrice * relativeMaxMultiplier),
            priceMultiplier: effectiveMinMultiplier,
            absoluteMaxMultiplier: effectiveAbsoluteMaxMultiplier,
            maxPriceMultiplier: relativeMaxMultiplier,
            ...(selectedPackage ? { selectedPackage } : {}),
        };
    };

    const getPackageUnitPrice = (pkg) => {
        const direct = Number(pkg?.price);
        if (Number.isFinite(direct) && direct >= 0) return direct;

        const base = Number(pkg?.basePrice);
        if (Number.isFinite(base) && base >= 0) {
            return Math.round(base * effectiveMinMultiplier);
        }

        return 0;
    };

    const inferredPricingUnit = vendor?.pricingUnit || inferPricingUnit({
        serviceLabel: vendor?.category,
        serviceCategory: vendor?.category,
        categoryId: vendor?.categoryId,
    });
    const isPerPlate = String(inferredPricingUnit || '').toUpperCase() === 'PER_PLATE';
    const isPerPerson = String(inferredPricingUnit || '').toUpperCase() === 'PER_PERSON';
    const isPerKg = String(inferredPricingUnit || '').toUpperCase() === 'PER_KG';
    const isPerHundredUnits = String(inferredPricingUnit || '').toUpperCase() === 'PER_100_UNITS';
    const pricingModel = resolveServicePricingModel({
        serviceLabel: vendor?.category,
        serviceCategory: vendor?.category,
        categoryId: vendor?.categoryId,
        pricingUnit: inferredPricingUnit,
    });
    const isPerAttendeePackagePricing = !isVenueServiceMode && pricingModel === 'per_attendee';
    const quantityForPricing = isPerAttendeePackagePricing
        ? attendeeCountForPricing
        : (pricingModel === 'per_day' ? normalizedEventDayCount : 1);
    const packageUnitLabel = isPerPlate
        ? 'Per Plate'
        : (isPerPerson
            ? 'Per Person'
            : (isPerKg
                ? 'Per Kg'
                : (isPerHundredUnits ? 'Per 100 Units' : 'Event/Day')));
    const selectionPricingUnit = isPerPlate
        ? 'PER_PLATE'
        : (isPerPerson
            ? 'PER_PERSON'
            : (isPerKg
                ? 'PER_KG'
                : (isPerHundredUnits
                    ? 'PER_100_UNITS'
                    : (pricingModel === 'fixed' ? 'FIXED' : 'EVENT'))));
    const isPerKgPricing = String(selectionPricingUnit || '').toUpperCase() === 'PER_KG';

    const resolvePackageQuantity = React.useCallback((pkgId) => {
        const raw = Number(packageQuantityById?.[pkgId]);
        if (Number.isFinite(raw) && raw > 0) return raw;
        return 1;
    }, [packageQuantityById]);

    const handlePackageQuantityChange = React.useCallback((pkgId, nextRaw) => {
        const n = Number(nextRaw);
        const nextValue = Number.isFinite(n) && n > 0 ? n : 1;
        setPackageQuantityById((prev) => ({
            ...prev,
            [pkgId]: nextValue,
        }));
    }, []);

    const tabs = isVenueServiceMode ? ['Overview', 'Reviews'] : ['Overview', 'Services', 'Reviews'];

    const formatDistance = (km) => {
        const n = Number(km);
        if (!Number.isFinite(n)) return null;
        if (n < 1) return `${Math.round(n * 1000)} m`;
        return `${n.toFixed(1)} km`;
    };

    const headerDistanceText = formatDistance(vendor?.distanceKm);
    const isUnavailable = vendor?.isAvailable === false;
    const unavailableMessage = formatUnavailableReason(vendor?.unavailableReason);

    const detailRows = isVenueServiceMode
        ? [
            { label: 'Package', value: vendor?.name || null },
            { label: 'Capacity', value: vendor?.capacity ? `${vendor.capacity} guests` : null },
            { label: 'Price', value: vendor?.unitPrice ? `₹${Number(vendor.unitPrice).toLocaleString()} / Event` : null },
            { label: 'Distance', value: formatDistance(vendor?.distanceKm) },
            { label: 'Provider', value: vendor?.vendorBusinessName || null },
        ].filter((r) => r.value)
        : [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 flex items-center justify-center px-4 sm:px-6"
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
                    <img src={resolveVendorImage(vendor)} className="absolute inset-0 w-full h-full object-cover" alt={vendor.name} />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90" />

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
                            {headerDistanceText ? <span className="text-white/60">• {headerDistanceText} from event</span> : null}
                            {vendor.mapsUrl && (
                                <a
                                    href={vendor.mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-white/90 underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Map
                                </a>
                            )}
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
                        {isUnavailable && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
                                {unavailableMessage}
                            </div>
                        )}
                        <div className="flex items-center gap-8 border-b border-gray-100 pb-0 overflow-x-auto">
                            {tabs.map((tab) => (
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
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
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
                                    {isVenueServiceMode && detailRows.length > 0 && (
                                        <section>
                                            <h3 className="text-lg font-bold text-primary mb-5 uppercase tracking-widest text-[11px]">Details</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {detailRows.map((row) => (
                                                    <div
                                                        key={row.label}
                                                        className="bg-surface rounded-2xl p-5 border border-primary/5"
                                                    >
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40 block mb-2">
                                                            {row.label}
                                                        </span>
                                                        <span className="text-sm font-bold text-primary">{row.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                    <section>
                                        <h3 className="text-2xl font-serif-premium text-primary mb-4">About the Experience</h3>
                                        <p className="text-gray-500 leading-loose text-sm font-light">
                                            {vendor.description || `About ${vendor.name}`}
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
                            {!isVenueServiceMode && activeTab === 'Services' && (
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
                                                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Select a tier for your event ({attendeeCount} {attendeeLabel})</p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6">
                                                    {currentPackages.map((pkg, i) => {
                                                        const pkgId = pkg.serviceId || pkg.id || String(i);
                                                        const unitPrice = getPackageUnitPrice(pkg);
                                                        const packageQty = isPerKgPricing ? resolvePackageQuantity(pkgId) : 1;
                                                        const lineQuantity = isPerAttendeePackagePricing
                                                            ? attendeeCountForPricing
                                                            : (pricingModel === 'per_day' ? normalizedEventDayCount : packageQty);

                                                        return (
                                                            <div key={pkgId} className="p-6 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all group flex flex-col relative overflow-hidden">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div>
                                                                        <span className="inline-block px-3 py-1 rounded-full bg-surface border border-primary/10 text-[9px] font-bold uppercase tracking-widest text-primary mb-2">
                                                                            {pkg.tier || 'Package'}
                                                                        </span>
                                                                        <h4 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors">{pkg.name || vendor.name}</h4>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="block text-2xl font-serif-premium text-primary">₹{unitPrice.toLocaleString()}</span>
                                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">/ {packageUnitLabel}</span>
                                                                        <span className="block text-[10px] text-primary/60 font-semibold mt-1">
                                                                            Est. ₹{Math.round(unitPrice * lineQuantity).toLocaleString()} - ₹{Math.round(unitPrice * lineQuantity * relativeMaxMultiplier).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <p className="text-sm text-gray-500 mb-6 leading-relaxed">{pkg.description || 'Package details'}</p>

                                                                {isPerKgPricing && (
                                                                    <div className="mb-6">
                                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/50 block mb-2">
                                                                            Required Quantity (kg)
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            step="0.5"
                                                                            value={packageQty}
                                                                            onChange={(e) => handlePackageQuantityChange(pkgId, e.target.value)}
                                                                            className="w-full max-w-45 px-3 py-2 rounded-lg border border-primary/15 bg-white text-primary font-semibold"
                                                                        />
                                                                    </div>
                                                                )}



                                                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                                                    <button
                                                                        onClick={() => setExpandedPackageId(pkgId)}
                                                                        className="py-3 rounded-xl border border-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:border-primary/30 transition-colors"
                                                                    >
                                                                        Explore
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const updatedVendor = buildSelectedVendorPayload({
                                                                                sourceVendor: vendor,
                                                                                unitPrice,
                                                                                pricingUnit: selectionPricingUnit,
                                                                                pricingQuantity: packageQty,
                                                                                pricingQuantityUnit: isPerKgPricing ? 'kg' : null,
                                                                                selectedPackage: pkg,
                                                                            });
                                                                            onSelect(updatedVendor);
                                                                            onClose();
                                                                        }}
                                                                        disabled={isUnavailable}
                                                                        className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors shadow-lg ${isUnavailable ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-secondary shadow-primary/20'}`}
                                                                    >
                                                                        {isUnavailable ? 'Locked' : 'Add Combined'}
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

                                                {isPerKgPricing && (
                                                    <div className="mb-6">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/50 block mb-2">
                                                            Required Quantity (kg)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.5"
                                                            value={resolvePackageQuantity(expandedPackageId)}
                                                            onChange={(e) => handlePackageQuantityChange(expandedPackageId, e.target.value)}
                                                            className="w-full max-w-55 px-3 py-2 rounded-lg border border-primary/15 bg-white text-primary font-semibold"
                                                        />
                                                    </div>
                                                )}

                                                <div className="bg-surface rounded-3xl p-8 border border-primary/5">
                                                    <div className="flex justify-between items-start mb-8 border-b border-primary/5 pb-8">
                                                        <div>
                                                            <span className="text-secondary font-serif-premium italic text-lg mb-1 block">Selected Tier</span>
                                                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">{expandedPackageSafe.name || vendor.name}</h2>
                                                            <p className="text-gray-500">{expandedPackageSafe.description || 'Package details'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-4xl font-serif-premium text-primary">₹{getPackageUnitPrice(expandedPackageSafe).toLocaleString()}</div>
                                                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">/ {packageUnitLabel}</div>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Complete Inclusions</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                                        {expandedInclusionItems.map((item, idx) => (
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
                                                                ₹{Math.round(getPackageUnitPrice(expandedPackage) * (isPerAttendeePackagePricing
                                                                    ? attendeeCountForPricing
                                                                    : (pricingModel === 'per_day' ? normalizedEventDayCount : resolvePackageQuantity(expandedPackageId)))).toLocaleString()} - ₹{Math.round(getPackageUnitPrice(expandedPackage) * (isPerAttendeePackagePricing
                                                                    ? attendeeCountForPricing
                                                                    : (pricingModel === 'per_day' ? normalizedEventDayCount : resolvePackageQuantity(expandedPackageId))) * relativeMaxMultiplier).toLocaleString()}
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {isPerAttendeePackagePricing
                                                                    ? `For ${attendeeCount} ${attendeeLabel.toLowerCase()}`
                                                                    : (pricingModel === 'per_day'
                                                                        ? `For ${normalizedEventDayCount} day${normalizedEventDayCount > 1 ? 's' : ''}`
                                                                        : `For ${resolvePackageQuantity(expandedPackageId)} kg`)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const unitPrice = getPackageUnitPrice(expandedPackage);
                                                                const expandedQty = isPerKgPricing ? resolvePackageQuantity(expandedPackageId) : 1;

                                                                const updatedVendor = buildSelectedVendorPayload({
                                                                    sourceVendor: vendor,
                                                                    unitPrice,
                                                                    pricingUnit: selectionPricingUnit,
                                                                    pricingQuantity: expandedQty,
                                                                    pricingQuantityUnit: isPerKgPricing ? 'kg' : null,
                                                                    selectedPackage: expandedPackageSafe,
                                                                });
                                                                onSelect(updatedVendor);
                                                                onClose();
                                                            }}
                                                            disabled={isUnavailable}
                                                            className={`px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-lg ${isUnavailable ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-secondary'}`}
                                                        >
                                                            {isUnavailable ? 'Locked' : 'Add to Event'}
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

                    {isVenueServiceMode && (
                        <div className="shrink-0 px-10 py-8 border-t border-gray-100 bg-white">
                            <button
                                onClick={() => {
                                    const unitPrice = toNonNegativeNumber(vendor?.unitPrice, toNonNegativeNumber(vendor?.priceMin, 0));
                                    const updatedVendor = buildSelectedVendorPayload({
                                        sourceVendor: vendor,
                                        unitPrice,
                                        pricingUnit: 'EVENT',
                                    });
                                    onSelect(updatedVendor);
                                    onClose();
                                }}
                                disabled={isUnavailable}
                                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl
                                ${isUnavailable
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                                        : (isSelected
                                            ? 'bg-secondary text-white shadow-secondary/20'
                                            : 'bg-primary text-white hover:bg-secondary shadow-primary/20')}`}
                            >
                                {isUnavailable ? 'Locked for Date' : (isSelected ? 'Selected' : 'Select This Venue')} <BsArrowRight />
                            </button>
                        </div>
                    )}


                </div>
            </motion.div>
        </motion.div>
    );
};

export default VendorDetailsModal;
