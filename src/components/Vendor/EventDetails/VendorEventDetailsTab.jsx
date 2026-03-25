import React, { useMemo, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    BsCalendarEvent, BsClock, BsPeople, BsBagCheck, BsInfoCircle,
    BsFileEarmarkText, BsPerson, BsCheckCircle, BsXCircle, BsChatDots, BsGeoAlt, BsArrowRight
} from 'react-icons/bs';

const VendorEventDetailsTab = () => {
    const {
        event,
        handleAccept,
        handleReject,
        services = [],
        tempServices = [],
        handleTempServiceChange,
    } = useOutletContext();
    const navigate = useNavigate();

    const [lockedPrices, setLockedPrices] = useState({});

    const formatKeyLabel = (key) => {
        return String(key || '')
            .replace(/[_-]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const resolveUnitLabel = (serviceObj) => {
        if (!serviceObj) return 'event';
        const catStr = String(serviceObj.categoryId || serviceObj.serviceCategory || serviceObj.category || '').toLowerCase();

        if (catStr.includes('cater') || catStr.includes('drink')) return 'plate';
        if (catStr.includes('makeup') || catStr.includes('mehendi') || catStr.includes('henna')) return 'person';
        if (catStr.includes('securit')) return 'team';
        if (catStr.includes('transport') || catStr.includes('vehicle')) return 'vehicle';
        if (catStr.includes('cake')) return 'kg';
        if (catStr.includes('invitation')) return '100 units';
        if (catStr.includes('venue') || catStr.includes('location')) return 'day';

        return 'event';
    };

    const getImages = (serviceObj) => {
        const raw = serviceObj?.details?.images || serviceObj?.images;
        if (!Array.isArray(raw)) return [];
        return raw
            .map((img) => (typeof img === 'string' ? img : (img?.url || img?.fileUrl)))
            .filter(Boolean);
    };

    const handleLockToggle = (id, currentPrice) => {
        const serviceNode = tempServices.find((s) => s.id === id);
        const currentPriceNum = Number(currentPrice);
        const maxBudgetNum = Number(serviceNode?.maxBudget);

        if (!lockedPrices[id]) {
            if (!Number.isFinite(currentPriceNum) || currentPriceNum <= 0) {
                toast.error('Please enter a valid price before locking.');
                return;
            }
            if (Number.isFinite(maxBudgetNum) && maxBudgetNum > 0 && currentPriceNum > maxBudgetNum) {
                toast.error("Price cannot exceed the client's maximum budget.");
                return;
            }
        }

        setLockedPrices((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const primaryContactName = String(event?.client?.name || '').trim();
    const primaryContactInitial = (primaryContactName[0] || 'M').toUpperCase();

    const allPricesLocked = useMemo(() => {
        if (!Array.isArray(tempServices) || tempServices.length === 0) return false;
        return tempServices.every((s) => lockedPrices[s.id]);
    }, [tempServices, lockedPrices]);

    const acceptedAmount = useMemo(() => {
        if (!Array.isArray(tempServices) || tempServices.length === 0) return 0;
        return tempServices
            .filter((s) => lockedPrices[s.id])
            .reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.qty) || 0), 0);
    }, [tempServices, lockedPrices]);

    return (
        <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Full Width Hero: Event Details */}
            <div className="col-span-12 relative overflow-hidden bg-linear-to-br from-[#0b2d49] to-[#12426e] p-10 rounded-[3rem] shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#d7a444] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-[#4ea8de] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 mb-10 pb-10 border-b border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">
                                    Event ID #E89{event.id}
                                </span>
                                {event.status === 'PENDING' && (
                                    <span className="px-3 py-1 bg-[#d7a444]/20 border border-[#d7a444]/30 rounded-full backdrop-blur-md text-[10px] font-black text-[#d7a444] uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(215,164,68,0.3)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d7a444] animate-pulse"></span>
                                        Pending Review
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-gray-300 tracking-tight leading-tight">
                                {event.title}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                    {/* Stats Grid */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                            { icon: BsCalendarEvent, label: "Date", value: event.date },
                            { icon: BsClock, label: "Time Slot", value: event.time.split(' - ')[0] },
                            { icon: BsPeople, label: "Expected Pax", value: `${event.pax} Guests` },
                            { icon: BsBagCheck, label: "Category", value: event.category }
                        ].map((stat, idx) => (
                            <div key={idx} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-full bg-[#d7a444]/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#d7a444]/20 transition-all">
                                    <stat.icon className="text-[#d7a444] text-sm" />
                                </div>
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="font-bold text-sm text-white group-hover:text-[#d7a444] transition-colors">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="lg:col-span-5 relative pl-0 lg:pl-10 lg:border-l border-white/10 flex flex-col justify-center">
                        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <BsInfoCircle className="text-[#d7a444]" /> Executive Summary
                        </h3>
                        <p className="text-white/80 font-medium leading-relaxed text-sm italic">
                            "{event.description}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Left Column: Requested Services */}
            <div className="col-span-12 lg:col-span-8">
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#f8fafb] to-transparent rounded-bl-[100px] pointer-events-none"></div>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-linear-to-br from-[#0b2d49] to-[#1a4b77] rounded-2xl flex items-center justify-center text-[#d7a444] shadow-lg shrink-0">
                                <BsFileEarmarkText size={20} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-black text-[#0b2d49] truncate">Requested Services</h3>
                                <p className="text-xs font-bold text-[#708aa0] mt-1">Quote and lock your prices to proceed.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end">
                            <span className="px-4 py-2 bg-[#f8fafb] rounded-full text-xs font-black text-[#708aa0] border border-gray-100 shrink-0">
                                {services.length} items
                            </span>
                            {event?.status === 'PENDING' && (
                                <span className={`px-4 py-2 rounded-full text-xs font-black border shrink-0 ${allPricesLocked ? 'bg-green-50 text-green-600 border-green-100' : 'bg-[#f8fafb] text-[#708aa0] border-gray-100'}`}>
                                    {allPricesLocked ? 'Ready to submit' : 'Lock all quotes'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {tempServices.map((service, idx) => {
                            const isLocked = lockedPrices[service.id];
                            const fullService = service.fullService;
                            const unitLabel = resolveUnitLabel(fullService);
                            const images = getImages(fullService);
                            const primaryImage = images[0] || null;

                            const displayName = service.name || fullService?.name || fullService?.serviceName || 'Service';
                            const displayDescription =
                                (fullService?.details?.description || fullService?.description || service.details || '').trim();

                            const itemsSrc = fullService?.details?.items || fullService?.items;
                            const itemsList = typeof itemsSrc === 'string'
                                ? itemsSrc.split(',').map((i) => i.trim()).filter(Boolean)
                                : (Array.isArray(itemsSrc) ? itemsSrc : []);

                            const location = fullService?.details?.location || fullService?.location;
                            const capacity = fullService?.details?.capacity || fullService?.capacity;

                            const chips = [];
                            if (service.basePrice > 0) chips.push(`Original: ₹${Number(service.basePrice).toLocaleString()} / ${unitLabel}`);
                            if (capacity) chips.push(`Capacity: ${capacity}`);
                            if (location) chips.push(String(location));


                            const detailsObj = fullService?.details && typeof fullService.details === 'object' ? fullService.details : null;
                            if (detailsObj) {
                                Object.entries(detailsObj).forEach(([k, v]) => {
                                    const key = String(k || '').trim();
                                    if (!key) return;

                                    const lowered = key.toLowerCase();
                                    if (lowered === 'images' || lowered === 'image' || lowered === 'items' || lowered === 'description') return;

                                    if (v === null || v === undefined) return;
                                    if (typeof v === 'string' && !v.trim()) return;

                                    const label = formatKeyLabel(key);

                                    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                                        chips.push(`${label}: ${String(v)}`);
                                        return;
                                    }

                                    if (Array.isArray(v)) {
                                        const primitive = v.filter((x) => ['string', 'number', 'boolean'].includes(typeof x));
                                        if (primitive.length === v.length) {
                                            primitive.forEach((x) => chips.push(`${label}: ${String(x)}`));
                                            return;
                                        }
                                        chips.push(`${label}: ${v.length} items`);
                                        return;
                                    }

                                    if (typeof v === 'object') {
                                        const entries = Object.entries(v)
                                            .filter(([, vv]) => ['string', 'number', 'boolean'].includes(typeof vv) && String(vv).trim())
                                            .slice(0, 6)
                                            .map(([kk, vv]) => `${formatKeyLabel(kk)}=${String(vv)}`);
                                        if (entries.length > 0) {
                                            chips.push(`${label}: ${entries.join(' • ')}`);
                                        }
                                    }
                                });
                            }

                            const visibleChips = chips;
                            const hiddenCount = 0;

                            return (
                                <div
                                    key={idx}
                                    className={`group/item relative p-6 rounded-2xl border transition-colors overflow-hidden ${isLocked ? 'bg-[#f8fafb] border-[#d7a444]/40' : 'bg-white border-gray-100 hover:border-[#0b2d49]/10'}`}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLocked ? 'bg-[#d7a444]' : 'bg-[#708aa0]/10 group-hover/item:bg-[#d7a444]/40'} transition-colors`}></div>

                                    <div className="flex flex-col gap-5">
                                        {/* Service details (vertical) */}
                                        <div className="min-w-0">
                                            <div className="flex items-start gap-4">
                                                {primaryImage && (
                                                    <div className="shrink-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100 w-20 h-20 hidden sm:block">
                                                        <img src={primaryImage} alt={service.name} className="w-full h-full object-cover" />
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="font-black text-lg text-[#0b2d49] truncate">{displayName}</h4>
                                                        {fullService?.tier && (
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${isLocked ? 'bg-[#d7a444] text-[#0b2d49] border-[#d7a444]' : 'bg-white text-[#708aa0] border-gray-100'}`}>
                                                                {fullService.tier}
                                                            </span>
                                                        )}
                                                        {isLocked && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#d7a444]/10 text-[#d7a444] border border-[#d7a444]/20">
                                                                Locked
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-2 text-[13px] text-[#708aa0] leading-relaxed line-clamp-2">
                                                        {displayDescription || 'Service request for this event.'}
                                                    </p>

                                                    {/* Original price (single line) */}
                                                    {(service.basePrice > 0) && (
                                                        <div className="mt-3 flex items-center gap-2 text-sm font-black text-[#0b2d49]">
                                                            <span className="text-[#708aa0]">Original:</span>
                                                            <span>₹{Number(service.basePrice).toLocaleString()}</span>
                                                            <span className="text-xs font-bold text-[#708aa0]">/ {unitLabel}</span>
                                                        </div>
                                                    )}

                                                    {/* Requested options/items (vertical list like screenshot) */}
                                                    {(itemsList.length > 0) && (
                                                        <div className="mt-4 space-y-2">
                                                            {itemsList.map((it, i) => (
                                                                <div key={`${service.id}-item-${i}`} className="flex items-center gap-3">
                                                                    <span className="w-4 h-4 rounded-full bg-[#d7a444]/15 text-[#d7a444] flex items-center justify-center shrink-0">
                                                                        <BsCheckCircle className="text-[11px]" />
                                                                    </span>
                                                                    <span className="text-[13px] font-bold text-[#0b2d49]">{String(it)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Other details (chips) */}
                                                    {(visibleChips.length > 0) && (
                                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                                            {visibleChips
                                                                .filter((c) => !String(c).toLowerCase().startsWith('original:'))
                                                                .map((label, i) => (
                                                                    <span
                                                                        key={`${service.id}-chip-${i}`}
                                                                        className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-wide border ${isLocked ? 'bg-white border-gray-100 text-[#0b2d49]' : 'bg-[#f8fafb] border-gray-100 text-[#708aa0]'}`}
                                                                    >
                                                                        {label}
                                                                    </span>
                                                                ))}
                                                            {hiddenCount > 0 && (
                                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-wide border ${isLocked ? 'bg-white border-gray-100 text-[#d7a444]' : 'bg-[#f8fafb] border-gray-100 text-[#d7a444]'}`}>
                                                                    +{hiddenCount} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quote + lock (stacked under details) */}
                                        {event?.status === 'PENDING' ? (
                                            <div className="mt-auto pt-4 flex justify-end">
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center justify-end gap-2 w-full">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#708aa0]">Quote Price</h4>
                                                        {isLocked && (
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0b2d49]">
                                                                ₹{(Number(service.price) || 0).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-end gap-2 w-full">
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-[#708aa0]">₹</span>
                                                            <input
                                                                type="number"
                                                                value={service.price || ''}
                                                                onChange={(e) => handleTempServiceChange?.(service.id, 'price', e.target.value)}
                                                                disabled={isLocked}
                                                                className={`border rounded-xl py-2 pl-7 pr-3 text-sm font-black focus:outline-none w-36 transition-colors ${
                                                                    isLocked
                                                                        ? 'bg-[#f8fafb] border-gray-100 text-[#708aa0] cursor-not-allowed'
                                                                        : 'bg-white border-gray-100 text-[#0b2d49] focus:border-[#d7a444] placeholder:text-[#708aa0]/60'
                                                                }`}
                                                                placeholder="Amount"
                                                            />
                                                        </div>

                                                        <button
                                                            onClick={() => handleLockToggle(service.id, service.price)}
                                                            className={`flex items-center justify-center h-10 px-4 rounded-xl font-black text-[11px] uppercase tracking-wider transition-colors border whitespace-nowrap ${
                                                                isLocked
                                                                    ? 'bg-[#d7a444] text-[#0b2d49] border-[#d7a444]'
                                                                    : 'bg-white text-[#708aa0] border-gray-100 hover:border-[#d7a444]/40 hover:text-[#0b2d49]'
                                                            }`}
                                                        >
                                                            {isLocked ? 'Locked' : 'Lock Price'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-auto pt-4 flex flex-wrap items-center justify-start gap-3">
                                                <div className="px-5 py-2.5 bg-[#f8fafb] border border-gray-100 rounded-xl text-xs font-black text-[#0b2d49] uppercase tracking-widest flex flex-col gap-1 text-right">
                                                    <span className="text-[#708aa0] text-[10px]">Agreed Price</span>
                                                    <span className="text-sm">₹{service.price?.toLocaleString()}</span>
                                                </div>
                                                <div className="px-5 py-2.5 bg-[#f8fafb] border border-gray-100 rounded-xl text-xs font-black text-[#0b2d49] uppercase tracking-widest flex items-center gap-2">
                                                    <span className="text-[#708aa0]">/{unitLabel} x</span>
                                                    <span className="text-[#d7a444]">{service.qty}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Column: Client & Location */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
                {/* Client Card */}
                <div className="bg-white p-8 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#f8fafb] to-transparent rounded-bl-[100px] pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest">Primary Contact</h3>
                        <div className="w-8 h-8 rounded-full bg-[#e9eff1] flex items-center justify-center text-[#d7a444]">
                            <BsPerson size={14} />
                        </div>
                    </div>

                    <div className="flex items-center gap-5 mb-8">
                        <div className="relative">
                            <div
                                className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg relative z-10 bg-linear-to-br from-[#0b2d49] to-[#12426e] flex items-center justify-center"
                                aria-label={primaryContactName || 'Primary contact'}
                            >
                                <span className="text-3xl font-black text-white">{primaryContactInitial}</span>
                            </div>
                            <div className="absolute inset-0 bg-[#d7a444] rounded-2xl blur-md opacity-30 transform translate-y-2"></div>
                        </div>
                        <div>
                            <h4 className="font-black text-[#0b2d49] text-xl">{event.client.name}</h4>
                            <p className="text-[10px] font-black text-[#d7a444] uppercase tracking-widest mt-1">{event.client.org}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pb-8 border-b border-gray-100">
                        <a href={`mailto:${event.client.email}`} className="flex items-center gap-4 text-sm font-bold text-[#708aa0] hover:text-[#0b2d49] transition-colors group/link p-3 -mx-3 rounded-xl hover:bg-[#f8fafb]">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover/link:text-[#d7a444] group-hover/link:border-[#d7a444]/20 transition-all">
                                @
                            </div>
                            <span className="truncate">{event.client.email}</span>
                        </a>
                        <a href={`tel:${event.client.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-4 text-sm font-bold text-[#708aa0] hover:text-[#0b2d49] transition-colors group/link p-3 -mx-3 rounded-xl hover:bg-[#f8fafb]">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover/link:text-[#d7a444] group-hover/link:border-[#d7a444]/20 transition-all">
                                <BsClock />
                            </div>
                            {event.client.phone}
                        </a>
                    </div>

                    <div className="mt-8">
                        {event.status === 'PENDING' ? (
                            <div className="flex flex-col gap-3">
                                {allPricesLocked && (
                                    <div className="rounded-2xl border border-gray-100 bg-[#f8fafb] p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Accepted Amount</p>
                                                <p className="mt-1 text-xl font-black text-[#0b2d49] truncate">₹{acceptedAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-full bg-[#d7a444]/10 border border-[#d7a444]/20 text-[10px] font-black uppercase tracking-widest text-[#d7a444] shrink-0">
                                                All quotes locked
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        if (!allPricesLocked) {
                                            toast.error('Please lock your quote price for all specific services before accepting.');
                                            return;
                                        }
                                        handleAccept?.();
                                    }}
                                    className={`w-full py-4 bg-linear-to-r from-[#0b2d49] to-[#12426e] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(11,45,73,0.3)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${!allPricesLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <BsCheckCircle size={16} className="text-[#d7a444]" /> Accept Request
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="w-full py-4 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <BsXCircle size={16} /> Decline
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate("../chat")}
                                className="group w-full py-4 bg-linear-to-r from-[#0b2d49] to-[#12426e] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(11,45,73,0.15)] hover:shadow-[0_15px_30px_rgba(11,45,73,0.25)] transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <BsChatDots size={16} className="text-[#d7a444]" />
                                Open Discussion
                                <BsArrowRight className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#d7a444]" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Location Card */}
                <div className="bg-white p-8 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-6">Venue Location</h3>
                    <div className="flex gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#f8fafb] to-gray-100 border border-gray-200 text-[#d7a444] flex items-center justify-center shrink-0 shadow-inner">
                            <BsGeoAlt size={20} />
                        </div>
                        <p className="text-sm font-bold text-[#0b2d49] leading-relaxed pt-1">
                            {event.location}
                        </p>
                    </div>
                    {/* Simulated Map Container with Premium styling */}
                    <div className="relative h-48 w-full bg-[#f8fafb] rounded-2xl border border-gray-100 overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/40 backdrop-blur-[2px] group-hover:bg-white/10 transition-colors duration-500">
                            <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[#d7a444]/20 group-hover:text-[#d7a444] transition-all duration-300">
                                <BsGeoAlt size={16} />
                            </div>
                            <p className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest">Interactive Map</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorEventDetailsTab;
