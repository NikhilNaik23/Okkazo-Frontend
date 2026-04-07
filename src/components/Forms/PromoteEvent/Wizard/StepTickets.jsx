import React, { useEffect, useMemo, useState } from 'react';
import { BsPlus, BsTrash3, BsTicketPerforated, BsCurrencyRupee, BsShieldCheck } from "react-icons/bs";
import { getInclusiveIstDayRange } from '../../../../utils/istDateTime';
import { getTierDescriptors, getDayTierTotal, validateDayTierAllocations } from '../../../../utils/dayTierAllocation';

const StepTickets = ({ formData, setFormData, onAdd, onRemove, onChange }) => {
    const { tickets, totalCapacity, ticketType } = formData;
    const scheduleDays = useMemo(
        () => getInclusiveIstDayRange(formData.startDate, formData.endDate),
        [formData.startDate, formData.endDate]
    );
    const firstDay = scheduleDays[0] || null;
    const dayAllocations = formData.ticketDayAllocations && typeof formData.ticketDayAllocations === 'object'
        ? formData.ticketDayAllocations
        : {};
    const dayTierAllocations = formData.ticketDayTierAllocations && typeof formData.ticketDayTierAllocations === 'object'
        ? formData.ticketDayTierAllocations
        : {};

    const tierDescriptors = useMemo(() => getTierDescriptors(tickets), [tickets]);
    const tierIds = useMemo(() => tierDescriptors.map((tier) => tier.id), [tierDescriptors]);
    const [sameAsFirstDays, setSameAsFirstDays] = useState({});

    const allocationValidation = useMemo(() => validateDayTierAllocations({
        days: scheduleDays,
        tickets,
        dayAllocations,
        dayTierAllocations,
    }), [scheduleDays, tickets, dayAllocations, dayTierAllocations]);

    const totalAssigned = ticketType === 'paid'
        ? Object.values(allocationValidation.tierTotalById || {}).reduce((sum, value) => sum + (parseInt(value, 10) || 0), 0)
        : tickets.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0);
    const isCapacityMet = totalCapacity > 0 && totalAssigned === parseInt(totalCapacity, 10);

    const getDayLabel = (day) => {
        const d = new Date(`${day}T00:00:00+05:30`);
        if (Number.isNaN(d.getTime())) return day;
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
    };

    useEffect(() => {
        const validDays = new Set(scheduleDays.filter((day) => day !== firstDay));
        setSameAsFirstDays((prev) => {
            const next = {};
            for (const [day, enabled] of Object.entries(prev || {})) {
                if (validDays.has(day)) next[day] = Boolean(enabled);
            }
            const unchanged =
                Object.keys(next).length === Object.keys(prev || {}).length &&
                Object.keys(next).every((key) => Boolean(next[key]) === Boolean(prev[key]));
            return unchanged ? prev : next;
        });
    }, [scheduleDays, firstDay]);

    useEffect(() => {
        if (ticketType !== 'paid') return;

        setFormData((prev) => {
            const prevTickets = Array.isArray(prev.tickets) ? prev.tickets : [];
            if (prevTickets.length === 0) return prev;

            const prevDays = getInclusiveIstDayRange(prev.startDate, prev.endDate);
            const prevDayTier = prev.ticketDayTierAllocations && typeof prev.ticketDayTierAllocations === 'object'
                ? prev.ticketDayTierAllocations
                : {};

            const tierTotalsById = Object.fromEntries(
                prevTickets.map((ticket) => [String(ticket?.id ?? ''), 0])
            );

            for (const day of prevDays) {
                const dayEntry = prevDayTier[day] && typeof prevDayTier[day] === 'object'
                    ? prevDayTier[day]
                    : {};

                for (const ticket of prevTickets) {
                    const tierId = String(ticket?.id ?? '');
                    if (!tierId) continue;
                    const parsed = parseInt(dayEntry[tierId], 10);
                    if (Number.isFinite(parsed) && parsed > 0) {
                        tierTotalsById[tierId] += parsed;
                    }
                }
            }

            let changed = false;
            const nextTickets = prevTickets.map((ticket) => {
                const tierId = String(ticket?.id ?? '');
                const nextQuantity = tierId ? Math.max(0, tierTotalsById[tierId] || 0) : 0;
                const currentQuantity = parseInt(ticket?.quantity, 10);
                if (!Number.isFinite(currentQuantity) || currentQuantity !== nextQuantity) {
                    changed = true;
                    return { ...ticket, quantity: nextQuantity };
                }
                return ticket;
            });

            if (!changed) return prev;
            return {
                ...prev,
                tickets: nextTickets,
            };
        });
    }, [ticketType, scheduleDays, dayTierAllocations, tickets, setFormData]);

    const handleTypeChange = (type) => {
        if (type === 'free') {
            setFormData({
                ...formData,
                ticketType: 'free',
                tickets: [{ id: Date.now(), name: "General Admission", price: 0, quantity: formData.totalCapacity || "" }],
            });
            return;
        }
        setFormData({ ...formData, ticketType: 'paid' });
    };

    const handleCapacityChange = (val) => {
        const capacity = val === "" ? "" : parseInt(val, 10);
        const update = { ...formData, totalCapacity: capacity };
        if (formData.ticketType === 'free') {
            update.tickets = [{ ...formData.tickets[0], quantity: capacity, name: "General Admission", price: 0 }];
        }
        setFormData(update);
    };

    const handleDayAllocationChange = (day, rawValue) => {
        const value = rawValue === '' ? '' : Math.max(0, parseInt(rawValue, 10) || 0);
        const firstTierId = tierIds[0] || null;
        const nextDayTier = {
            ...(dayTierAllocations[day] && typeof dayTierAllocations[day] === 'object' ? dayTierAllocations[day] : {}),
        };
        if (ticketType === 'free' && firstTierId) {
            nextDayTier[firstTierId] = value === '' ? '' : Number(value);
        }

        setFormData({
            ...formData,
            ticketDayAllocations: {
                ...dayAllocations,
                [day]: value,
            },
            ticketDayTierAllocations: {
                ...dayTierAllocations,
                [day]: nextDayTier,
            },
        });
    };

    const handleDayTierAllocationChange = (day, tierId, rawValue) => {
        const value = rawValue === '' ? '' : Math.max(0, parseInt(rawValue, 10) || 0);
        const nextDayEntry = {
            ...(dayTierAllocations[day] && typeof dayTierAllocations[day] === 'object' ? dayTierAllocations[day] : {}),
            [tierId]: value,
        };
        const nextDayTotal = getDayTierTotal(nextDayEntry, tierIds);

        const nextTicketDayTierAllocations = {
            ...dayTierAllocations,
            [day]: nextDayEntry,
        };
        const nextTicketDayAllocations = {
            ...dayAllocations,
            [day]: nextDayTotal > 0 ? nextDayTotal : '',
        };

        if (day === firstDay && ticketType === 'paid') {
            for (const [otherDay, enabled] of Object.entries(sameAsFirstDays)) {
                if (!enabled) continue;
                nextTicketDayTierAllocations[otherDay] = { ...nextDayEntry };
                nextTicketDayAllocations[otherDay] = nextDayTotal > 0 ? nextDayTotal : '';
            }
        }

        setFormData({
            ...formData,
            ticketDayAllocations: nextTicketDayAllocations,
            ticketDayTierAllocations: nextTicketDayTierAllocations,
        });
    };

    const handleToggleSameAsFirst = (day, enabled) => {
        setSameAsFirstDays((prev) => ({ ...prev, [day]: enabled }));
        if (!enabled || !firstDay || !dayTierAllocations[firstDay]) return;

        const firstDayEntry = dayTierAllocations[firstDay] && typeof dayTierAllocations[firstDay] === 'object'
            ? dayTierAllocations[firstDay]
            : {};
        const copiedEntry = { ...firstDayEntry };
        const copiedTotal = getDayTierTotal(copiedEntry, tierIds);

        setFormData({
            ...formData,
            ticketDayAllocations: {
                ...dayAllocations,
                [day]: copiedTotal > 0 ? copiedTotal : '',
            },
            ticketDayTierAllocations: {
                ...dayTierAllocations,
                [day]: copiedEntry,
            },
        });
    };

    return (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-serif-premium text-6xl md:text-8xl italic text-[#7AB2B2] opacity-10 mb-8 absolute -top-20 -left-20 pointer-events-none select-none">Access</h1>

            <div className="mb-12 relative flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 05 - Ticket Management</p>
                    <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Define value tiers.</h2>
                </div>

                <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-[#09637E]/10 shadow-sm">
                    <button
                        onClick={() => handleTypeChange('paid')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${ticketType === 'paid' ? 'bg-[#09637E] text-white shadow-lg' : 'text-[#09637E]/40 hover:text-[#09637E]'}`}
                    >
                        <BsCurrencyRupee />
                        Paid
                    </button>
                    <button
                        onClick={() => handleTypeChange('free')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${ticketType === 'free' ? 'bg-[#088395] text-white shadow-lg' : 'text-[#09637E]/40 hover:text-[#09637E]'}`}
                    >
                        <BsShieldCheck />
                        Free
                    </button>
                </div>
            </div>

            <div className="mb-12 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-4 bg-[#09637E] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />

                    <div className="relative z-10 space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-3">Total Event Capacity</label>
                            <div className="flex items-end gap-3 border-b border-white/10 pb-3 focus-within:border-[#7AB2B2] transition-colors">
                                <input
                                    type="number"
                                    value={totalCapacity}
                                    placeholder="Total"
                                    onChange={(e) => handleCapacityChange(e.target.value)}
                                    className="w-full bg-transparent text-4xl font-serif-premium italic text-white placeholder-white/20 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[#7AB2B2] font-black uppercase tracking-widest text-[10px]">Tickets</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Allocated</span>
                                <span className={`text-lg font-serif-premium italic ${isCapacityMet ? 'text-[#7AB2B2]' : 'text-white'}`}>
                                    {totalAssigned} / {totalCapacity || 0}
                                </span>
                            </div>
                            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${totalAssigned > (totalCapacity || 0) ? 'bg-red-400' : isCapacityMet ? 'bg-[#7AB2B2]' : 'bg-[#088395]'} shadow-[0_0_10px_rgba(122,178,178,0.3)]`}
                                    style={{ width: `${Math.min(100, (totalAssigned / (totalCapacity || 1)) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {ticketType === 'paid' && (
                            <p className="text-[9px] text-[#EBF4F6]/65 font-bold uppercase tracking-wider">
                                Tier quantities are auto-calculated from Tickets Per Day.
                            </p>
                        )}

                        {ticketType === 'paid' && !allocationValidation.isValid && (
                            <p className="text-[8px] text-amber-200 font-bold uppercase tracking-widest">Match day totals before continuing</p>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-8 bg-white rounded-[2rem] p-6 border border-[#09637E]/10 shadow-xl">
                    {ticketType === 'paid' ? (
                        <>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#09637E]/55">Ticket Tiers</p>
                                    <h3 className="text-2xl font-serif-premium italic text-[#09637E]">Set names and prices.</h3>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-[#EBF4F6] text-[10px] font-black uppercase tracking-widest text-[#088395]">
                                    {tickets.length} tier{tickets.length === 1 ? '' : 's'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {tickets.map((ticket, idx) => (
                                    <div
                                        key={ticket.id}
                                        className="relative group rounded-2xl border border-[#09637E]/10 px-4 py-4 bg-[#EBF4F6]/35"
                                        style={{ animationDelay: `${idx * 90}ms` }}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                            <div className="md:col-span-1 hidden md:flex pb-1">
                                                <div className="w-10 h-10 rounded-xl bg-[#09637E]/5 flex items-center justify-center text-[#088395]">
                                                    <BsTicketPerforated size={16} />
                                                </div>
                                            </div>

                                            <div className="md:col-span-5">
                                                <label className="block text-[9px] font-black text-[#09637E]/45 uppercase tracking-[0.2em] mb-2">Tier Designation</label>
                                                <input
                                                    type="text"
                                                    value={ticket.name}
                                                    placeholder="e.g. VIP Backstage"
                                                    onChange={(e) => onChange(ticket.id, 'name', e.target.value)}
                                                    className="w-full bg-transparent text-xl font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b border-[#09637E]/15 pb-2 focus:border-[#088395] transition-all"
                                                />
                                            </div>

                                            <div className="md:col-span-4">
                                                <label className="block text-[9px] font-black text-[#09637E]/45 uppercase tracking-[0.2em] mb-2">Entrance Fee</label>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-[#088395] font-serif-premium italic text-xl">Rs</span>
                                                    <input
                                                        type="number"
                                                        value={ticket.price}
                                                        placeholder="Min. 1"
                                                        onChange={(e) => onChange(ticket.id, 'price', e.target.value === "" ? "" : parseFloat(e.target.value))}
                                                        onWheel={(e) => e.target.blur()}
                                                        className="w-full bg-transparent text-2xl font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b border-[#09637E]/15 pb-2 focus:border-[#088395] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-1 flex justify-end pb-1">
                                                <button
                                                    onClick={() => onRemove(ticket.id)}
                                                    className="w-10 h-10 rounded-full text-[#09637E]/35 hover:text-red-500 hover:bg-red-50 transition-all duration-300 flex items-center justify-center"
                                                    title="Remove Tier"
                                                >
                                                    <BsTrash3 size={16} />
                                                </button>
                                            </div>

                                            <div className="md:col-span-12">
                                                <p className="text-[9px] font-black uppercase tracking-wider text-[#09637E]/50">
                                                    Quantity comes from Tickets Per Day: {allocationValidation.tierTotalById[String(ticket.id)] || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={onAdd}
                                className="w-full py-6 mt-5 border-2 border-dashed border-[#09637E]/12 rounded-2xl text-[#09637E]/65 font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 hover:bg-[#09637E]/5 hover:border-[#088395] hover:text-[#088395] transition-all active:scale-[0.99]"
                            >
                                <div className="w-9 h-9 rounded-full bg-[#09637E]/6 flex items-center justify-center">
                                    <BsPlus size={24} />
                                </div>
                                Architect New Ticket Tier
                            </button>
                        </>
                    ) : (
                        <div className="min-h-[220px] flex items-center justify-center text-center px-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#09637E]/55 mb-3">Free Mode</p>
                                <p className="text-2xl font-serif-premium italic text-[#09637E] mb-2">Single General Admission tier enabled.</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#09637E]/45">Set daily allocation below to distribute free entries.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10 bg-white rounded-[2rem] p-6 border border-[#09637E]/10 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#09637E]/70">Tickets Per Day</h4>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${allocationValidation.isValid ? 'text-[#088395]' : 'text-[#09637E]/40'}`}>
                        {allocationValidation.isValid ? 'Ready' : 'Pending'}
                    </span>
                </div>

                {scheduleDays.length === 0 ? (
                    <p className="text-[10px] font-semibold text-[#09637E]/50 uppercase tracking-wider">
                        Set schedule dates in Step 4, then return here to enter day-wise tier allocations.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {scheduleDays.map((day) => (
                            <div key={day} className="rounded-xl border border-[#09637E]/10 p-3 bg-white/70">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-7 text-[#09637E] text-sm font-semibold">{getDayLabel(day)}</div>
                                    <div className="col-span-5 text-right">
                                        {ticketType === 'paid' ? (
                                            <span className="text-base font-serif-premium italic text-[#09637E]">{allocationValidation.dayTotalByDay[day] || 0}</span>
                                        ) : (
                                            <input
                                                type="number"
                                                min="1"
                                                max={totalCapacity || undefined}
                                                value={dayAllocations[day] ?? ''}
                                                onChange={(e) => handleDayAllocationChange(day, e.target.value)}
                                                className="w-full bg-transparent text-base font-serif-premium italic text-[#09637E] outline-none border-b border-[#09637E]/15 pb-1 focus:border-[#088395] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="Qty"
                                            />
                                        )}
                                    </div>
                                </div>

                                {ticketType === 'paid' && day !== firstDay && (
                                    <div className="mt-2 flex justify-end">
                                        <label className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#09637E]/60">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(sameAsFirstDays[day])}
                                                onChange={(e) => handleToggleSameAsFirst(day, e.target.checked)}
                                                className="accent-[#088395]"
                                            />
                                            Same as 1st day
                                        </label>
                                    </div>
                                )}

                                {ticketType === 'paid' && (
                                    <div className="mt-2 space-y-1">
                                        {tierDescriptors.map((tier) => (
                                            <div key={`${day}-${tier.id}`} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-7 text-[11px] font-semibold text-[#09637E]/70 truncate" title={tier.name || 'Tier'}>
                                                    {tier.name || 'Tier'}
                                                </div>
                                                <div className="col-span-5">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        disabled={Boolean(sameAsFirstDays[day]) && day !== firstDay}
                                                        value={dayTierAllocations?.[day]?.[tier.id] ?? ''}
                                                        onChange={(e) => handleDayTierAllocationChange(day, tier.id, e.target.value)}
                                                        className="w-full bg-transparent text-sm font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b border-[#09637E]/10 pb-1 focus:border-[#088395] disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {ticketType === 'paid' && tierDescriptors.length > 0 && (
                            <div className="mt-2 border-t border-[#09637E]/10 pt-3 space-y-1">
                                {tierDescriptors.map((tier) => (
                                    <div key={`tier-total-${tier.id}`} className="flex items-center justify-between text-[11px]">
                                        <span className="font-semibold text-[#09637E]/70 truncate max-w-[70%]">{tier.name || 'Tier'}</span>
                                        <span className="font-black text-[#088395]">
                                            {allocationValidation.tierTotalById[tier.id] || 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepTickets;
