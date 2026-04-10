import React from "react";
import { BsCheckCircleFill, BsDash, BsPlus } from "react-icons/bs";

const TicketSelector = ({
    event,
    categories = [],
    ticketSelection,
    handleQuantityChange,
    availableTickets,
    totalPrice,
    ticketDayWiseAllocations = [],
    selectedTicketDay = '',
    onSelectTicketDay,
    categoryAvailabilityByName = new Map(),
}) => {
    // Helper to get numeric price for calculation/display if needed
    const getNumericPrice = (p) => {
        if (p == null) return 0;
        if (typeof p === 'number') return Number.isFinite(p) ? p : 0;
        if (typeof p !== 'string') return 0;
        const numeric = p.replace(/[^0-9.]/g, '');
        return numeric ? parseFloat(numeric) : 0;
    };

    const normalizeDayKey = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return '';
        const day = raw.includes('T') ? raw.slice(0, 10) : raw;
        return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : '';
    };

    const formatDayLabel = (dayValue) => {
        const key = normalizeDayKey(dayValue);
        if (!key) return 'Date';

        const [yy, mm, dd] = key.split('-').map((v) => Number(v));
        const dt = new Date(Date.UTC(yy, (mm || 1) - 1, dd || 1));
        if (Number.isNaN(dt.getTime())) return key;

        return dt.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            timeZone: 'Asia/Kolkata',
        }).toUpperCase();
    };

    const renderedCategories = Array.isArray(categories) && categories.length > 0
        ? categories
        : (Array.isArray(event?.categories) ? event.categories : []);

    const dayRows = Array.isArray(ticketDayWiseAllocations) ? ticketDayWiseAllocations : [];
    const hasDayWiseRows = dayRows.length > 0;

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 relative overflow-hidden">
            {/* Header */}
            <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#09637E]/60 mb-2">Reservation</p>
                <h3 className="text-4xl font-serif-premium text-[#0b2d49] italic">Ticket Categories</h3>
                <div className="flex justify-end mt-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded-md">Limited Availability</span>
                </div>
            </div>

            <div className="space-y-6">
                {hasDayWiseRows && (
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#09637E]/60 mb-2">Select Event Date</p>
                        <div className="flex flex-wrap gap-2">
                            {dayRows.map((row) => {
                                const dayKey = normalizeDayKey(row?.day);
                                const isActive = dayKey && dayKey === normalizeDayKey(selectedTicketDay);
                                const dayCount = Number(row?.ticketCount || 0);

                                return (
                                    <button
                                        key={dayKey || String(row?.day)}
                                        type="button"
                                        onClick={() => onSelectTicketDay && onSelectTicketDay(dayKey)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            isActive
                                                ? 'bg-[#09637E] text-white border-[#09637E]'
                                                : 'bg-white text-[#09637E] border-gray-200 hover:border-[#09637E]/40'
                                        }`}
                                    >
                                        {formatDayLabel(dayKey)}
                                        <span className={`ml-2 ${isActive ? 'text-white/80' : 'text-[#09637E]/55'}`}>
                                            {Number.isFinite(dayCount) && dayCount >= 0 ? `${dayCount} left` : ''}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Category Selection List */}
                {renderedCategories && (
                    <div className="space-y-3">
                        {renderedCategories.map((cat) => {
                            const qty = ticketSelection[cat.name] || 0;
                            const catAvailableRaw = cat?.available;
                            const catAvailableNumber =
                                catAvailableRaw == null || catAvailableRaw === ''
                                    ? Number.NaN
                                    : Number(catAvailableRaw);
                            const fallbackAvailable = categoryAvailabilityByName?.get?.(cat.name);
                            const maxAvailable = Number.isFinite(catAvailableNumber)
                                ? catAvailableNumber
                                : (Number.isFinite(fallbackAvailable) ? fallbackAvailable : Number.NaN);
                            const reachedLimit = Number.isFinite(maxAvailable) && maxAvailable >= 0 && qty >= maxAvailable;
                            return (
                                <div
                                    key={cat.name}
                                    className={`group flex items-center justify-between p-4 rounded-2xl transition-all ${qty > 0
                                            ? "bg-gray-50 border border-gray-100 shadow-inner"
                                            : "hover:bg-gray-50 border border-transparent"
                                        }`}
                                >
                                    <div>
                                        <p className="font-black uppercase text-xs tracking-widest text-[#0b2d49] mb-1">{cat.name}</p>
                                        <p className="text-[10px] font-bold text-[#09637E]">{cat.price}</p>
                                        {Number.isFinite(maxAvailable) && maxAvailable >= 0 && (
                                            <p className="text-[9px] font-bold text-[#09637E]/50 uppercase tracking-widest mt-1">{maxAvailable} available</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleQuantityChange(cat.name, -1, maxAvailable)}
                                            disabled={qty === 0}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${qty > 0 ? "bg-white shadow-sm text-[#09637E] hover:bg-gray-100" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                                }`}
                                        >
                                            <BsDash />
                                        </button>
                                        <span className={`w-4 text-center font-black text-sm ${qty > 0 ? "text-[#0b2d49]" : "text-gray-300"}`}>
                                            {qty}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(cat.name, 1, maxAvailable)}
                                            disabled={reachedLimit}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                reachedLimit
                                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                    : 'bg-white shadow-sm text-[#09637E] hover:bg-[#09637E] hover:text-white'
                                            }`}
                                        >
                                            <BsPlus />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Total */}
                <div className="pt-8 border-t border-gray-100 mt-2">
                    <div className="flex justify-between items-end">
                        <span className="font-serif-premium text-xl text-[#0b2d49] italic">Total Price</span>
                        <span className="text-3xl font-serif-premium text-[#09637E]">₹{totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Authenticity Guarantee Footer */}
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-center gap-2 text-gray-300">
                <BsCheckCircleFill className="text-[#09637E]/40" size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">100% Authentic Ticketing Guarantee</span>
            </div>
        </div>
    );
};

export default TicketSelector;
