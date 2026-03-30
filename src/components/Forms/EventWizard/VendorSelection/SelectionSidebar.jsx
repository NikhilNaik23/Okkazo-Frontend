import React from 'react';
import { motion } from 'framer-motion';
import { BsHeart, BsFillCartCheckFill, BsArrowRight, BsX } from 'react-icons/bs';
import { MdLocationOn, MdRestaurant } from 'react-icons/md';
import { inferPricingUnit, resolveServicePricingModel } from '../../../../utils/pricing';

const SelectionSidebar = ({
    vendors,
    attendeeCount,
    pricingAttendeeCount,
    attendeeLabel,
    eventDayCount,
    isHighDemand,
    estimatedTotal,
    estimatedMax,
    allServicesSelected,
    onRemoveVendor,
    onBack,
    onNext
}) => {
    const formatPriceCompact = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) return '0';
        if (n >= 1000) return `${Math.round(n / 1000)}k`;
        return String(Math.round(n));
    };

    const attendeeCountForPricing = Math.max(1, Number(pricingAttendeeCount || attendeeCount || 0));
    const dayCountForPricing = Math.max(1, Number(eventDayCount || 1));

    const getHoldMeta = (vendor) => {
        const state = String(vendor?._selectionHoldStatus || '').trim().toLowerCase();
        if (state === 'restored') {
            return {
                label: 'Restored',
                className: 'bg-amber-50 text-amber-700 border-amber-200',
                title: 'Restored from previous choice. Select again to re-hold.',
            };
        }

        return {
            label: 'Held',
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            title: 'Actively held in your current selection flow.',
        };
    };

    return (
        <div className="hidden lg:flex flex-col w-[25vw] min-w-[320px] max-w-100 h-[calc(100vh-6rem)] sticky top-24 right-0 p-8 pl-0 pointer-events-none z-50">
            <div className="pointer-events-auto flex flex-col h-full bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-[0_20px_80px_-20px_rgba(9,99,126,0.15)] overflow-hidden relative">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] -z-10" />

                <div className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-3xl font-serif-premium italic text-primary">Selection</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Refining Luxury</p>
                        </div>
                        <button onClick={onBack} className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center text-primary/60 hover:bg-primary hover:text-white transition-all" title="Back">
                            <BsArrowRight className="rotate-180" size={16} />
                        </button>
                    </div>
                </div>

                {/* Selected Items List */}
                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                    {Object.entries(vendors).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <BsHeart size={40} className="mb-4 text-primary" />
                            <p className="text-xs font-bold uppercase tracking-widest text-primary">Your selection is empty</p>
                        </div>
                    ) : (
                        Object.entries(vendors).map(([category, vendor]) => (
                            (() => {
                                const minPrice = Number(vendor?.priceMin ?? vendor?.unitPrice ?? 0);
                                const maxFallback = Number.isFinite(minPrice) && minPrice > 0 ? Math.round(minPrice * 1.5) : 0;
                                const maxPrice = Number(vendor?.priceMax ?? maxFallback);
                                const displayName = vendor?.name || vendor?.vendorBusinessName || 'Selected Vendor';
                                const holdMeta = getHoldMeta(vendor);
                                const isVenueCategory = String(category || '').trim().toLowerCase() === 'venue';
                                const pricingUnit = vendor?.pricingUnit || inferPricingUnit({
                                    serviceLabel: category,
                                    serviceCategory: category,
                                    categoryId: vendor?.categoryId,
                                });
                                const pricingModelRaw = resolveServicePricingModel({
                                    serviceLabel: category,
                                    serviceCategory: category,
                                    categoryId: vendor?.categoryId,
                                    pricingUnit,
                                });
                                const pricingModel = isVenueCategory ? 'per_day' : pricingModelRaw;
                                const fixedQuantityRaw = Number(vendor?.pricingQuantity);
                                const fixedQuantity = Number.isFinite(fixedQuantityRaw) && fixedQuantityRaw > 0 ? fixedQuantityRaw : 1;
                                const lineMultiplier = pricingModel === 'per_attendee'
                                    ? attendeeCountForPricing
                                    : (pricingModel === 'per_day' ? dayCountForPricing : fixedQuantity);
                                const displayMin = Math.round((Number.isFinite(minPrice) ? minPrice : 0) * lineMultiplier);
                                const displayMax = Math.round((Number.isFinite(maxPrice) ? maxPrice : 0) * lineMultiplier);
                                const unitLabel = pricingUnit === 'PER_PLATE'
                                    ? 'plate'
                                    : (pricingUnit === 'PER_PERSON'
                                        ? 'person'
                                        : (pricingUnit === 'PER_KG'
                                            ? 'kg'
                                            : (pricingUnit === 'PER_100_UNITS'
                                                ? '100 units'
                                                : (pricingModel === 'per_day' ? 'day/event' : 'package'))));

                                return (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 p-3 bg-white rounded-2xl shadow-sm border border-gray-50"
                            >
                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                                    <img src={vendor.image} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-primary">
                                        {category === 'Venue' ? <MdLocationOn size={10} /> : <MdRestaurant size={10} />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40 block mb-0.5">{category}</span>
                                    <h4 className="text-sm font-serif-premium font-bold text-primary truncate">{displayName}</h4>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border mb-1 ${holdMeta.className}`}
                                        title={holdMeta.title}
                                    >
                                        {holdMeta.label}
                                    </span>
                                    <span className="text-xs font-bold text-secondary">₹{formatPriceCompact(displayMin)} - ₹{formatPriceCompact(displayMax)}</span>
                                    {pricingModel === 'per_attendee' ? (
                                        <span className="text-[9px] font-bold text-primary/45 block">
                                            ₹{formatPriceCompact(minPrice)} / {unitLabel} x {attendeeCountForPricing} {String(attendeeLabel || 'Guests').toLowerCase()}
                                        </span>
                                    ) : pricingModel === 'per_day' ? (
                                        <span className="text-[9px] font-bold text-primary/45 block">
                                            ₹{formatPriceCompact(minPrice)} / {unitLabel} x {dayCountForPricing} day{dayCountForPricing > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-primary/45 block">
                                            ₹{formatPriceCompact(minPrice)} / {unitLabel} x {fixedQuantity} (fixed)
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => onRemoveVendor(category)}
                                    className="w-6 h-6 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors shrink-0"
                                    title="Remove Selection"
                                >
                                    <BsX size={14} />
                                </button>
                            </motion.div>
                                );
                            })()
                        ))
                    )}
                </div>

                {/* Totals Section */}
                <div className="p-8 pt-6 bg-linear-to-t from-white via-white to-transparent">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/5">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <BsFillCartCheckFill size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Live Status</span>
                            <span className={`text-xs font-bold ${isHighDemand ? 'text-amber-500' : 'text-primary'}`}>{isHighDemand ? 'High Demand Date' : 'Standard Date'}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-primary/20 pt-4 mb-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1">Estimated Total</span>
                            <div className="text-right">
                                <span className="text-2xl font-serif-premium text-primary">₹{(estimatedTotal).toLocaleString()}</span>
                                <span className="text-xs font-bold text-primary/40 block">- ₹{(estimatedMax).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-5 space-y-2">
                        <p className="text-[10px] leading-relaxed font-bold text-red-600">
                            Availability note: If you have not finished checkout (deposit fee paid), selected vendors/services may or may not remain available. Temporary holds auto-expire in about 10 minutes.
                        </p>
                        <p className="text-[10px] leading-relaxed font-bold text-red-500/90">
                            Note: Final quotation lies in this displayed range.
                        </p>
                    </div>

                    <button
                        onClick={onNext}
                        disabled={!allServicesSelected}
                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl
                        ${allServicesSelected
                                ? 'bg-primary text-white hover:bg-secondary hover:scale-[1.02] active:scale-95 shadow-primary/20'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        Finalize Reservation <BsArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectionSidebar;
