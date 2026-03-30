import React, { useEffect, useMemo, useState } from 'react';
import { BsPlus, BsTrash3, BsCurrencyRupee, BsShieldCheck } from "react-icons/bs";
import { motion, AnimatePresence } from 'framer-motion';
import { getInclusiveIstDayRange } from '../../../utils/istDateTime';
import { getTierDescriptors, getDayTierTotal, validateDayTierAllocations } from '../../../utils/dayTierAllocation';

const OrbitalTickets = ({ formData, setFormData, onAdd, onRemove, onChange }) => {
    const { tickets, totalCapacity, ticketType } = formData;
    const totalAssigned = tickets.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0);
    const isCapacityMet = totalCapacity > 0 && totalAssigned === parseInt(totalCapacity);
    const scheduleDays = getInclusiveIstDayRange(formData.publicStartTime, formData.publicEndTime);
    const dayAllocations = formData.ticketDayAllocations && typeof formData.ticketDayAllocations === 'object'
        ? formData.ticketDayAllocations
        : {};
    const dayTierAllocations = formData.ticketDayTierAllocations && typeof formData.ticketDayTierAllocations === 'object'
        ? formData.ticketDayTierAllocations
        : {};
    const tierDescriptors = useMemo(() => getTierDescriptors(tickets), [tickets]);
    const tierIds = useMemo(() => tierDescriptors.map((tier) => tier.id), [tierDescriptors]);
    const firstDay = scheduleDays[0] || null;
    const [sameAsFirstDays, setSameAsFirstDays] = useState({});

    const allocationValidation = useMemo(() => validateDayTierAllocations({
        days: scheduleDays,
        tickets,
        dayAllocations,
        dayTierAllocations,
    }), [scheduleDays, tickets, dayAllocations, dayTierAllocations]);

    const getDayLabel = (day) => {
        const d = new Date(`${day}T00:00:00+05:30`);
        if (Number.isNaN(d.getTime())) return day;
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
    };

    const dailyTotalAssigned = scheduleDays.reduce((acc, day) => acc + (parseInt(dayAllocations[day], 10) || 0), 0);
    const allDaysAllocated = scheduleDays.length > 0 && scheduleDays.every((day) => (parseInt(dayAllocations[day], 10) || 0) > 0);
    const isAllocationReady = ticketType === 'paid' ? allocationValidation.isValid : allDaysAllocated;

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

    const handleTypeChange = (type) => {
        if (type === 'free') {
            setFormData({
                ...formData,
                ticketType: 'free',
                tickets: [{ id: Date.now(), name: "General Admission", price: 0, quantity: formData.totalCapacity || "" }],
            });
        } else {
            setFormData({ ...formData, ticketType: 'paid' });
        }
    };

    const handleCapacityChange = (val) => {
        const capacity = val === "" ? "" : parseInt(val);
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

    useEffect(() => {
        if (ticketType !== 'paid' || scheduleDays.length === 0 || tickets.length === 0) return;

        const nextTickets = tickets.map((ticket) => {
            const ticketId = String(ticket?.id ?? '');
            const derivedQuantity = scheduleDays.reduce((sum, day) => {
                const dayEntry = dayTierAllocations?.[day] && typeof dayTierAllocations[day] === 'object'
                    ? dayTierAllocations[day]
                    : {};
                return sum + Math.max(0, parseInt(dayEntry?.[ticketId], 10) || 0);
            }, 0);

            return {
                ...ticket,
                quantity: derivedQuantity,
            };
        });

        const unchanged =
            nextTickets.length === tickets.length &&
            nextTickets.every((nextTicket, idx) => String(nextTicket?.quantity ?? '') === String(tickets[idx]?.quantity ?? ''));

        if (unchanged) return;

        setFormData({
            ...formData,
            tickets: nextTickets,
        });
    }, [ticketType, scheduleDays, dayTierAllocations, tickets, setFormData, formData]);

    return (
        <div className="w-full animate-in fade-in">
            {/* Header / Type Switcher */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-4xl font-serif-premium italic text-[#09637E] leading-tight">Define Tiers</h3>
                    <p className="text-[10px] font-black uppercase text-[#088395]/70 tracking-widest mt-1">Ticket Management</p>
                </div>
                <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-xl border border-[#09637E]/10 shadow-sm">
                    <button
                        onClick={() => handleTypeChange('paid')}
                        className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 ${ticketType === 'paid' ? 'bg-[#088395] text-white shadow-md' : 'text-[#09637E]/40 hover:text-[#09637E]'}`}
                    >
                        <BsCurrencyRupee size={12} /> Paid
                    </button>
                    <button
                        onClick={() => handleTypeChange('free')}
                        className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 ${ticketType === 'free' ? 'bg-[#7AB2B2] text-white shadow-md' : 'text-[#09637E]/40 hover:text-[#09637E]'}`}
                    >
                        <BsShieldCheck size={12} /> Free
                    </button>
                </div>
            </div>

            <div className="flex gap-8 items-start h-[360px]">
                {/* LEFT: Total Capacity Box */}
                <div className="w-1/2 bg-[#09637E] rounded-3xl p-6 shadow-xl relative overflow-hidden text-white group flex-shrink-0 h-full flex flex-col justify-between">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                    <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Total Event Capacity</label>
                        <div className="flex items-baseline gap-4 border-b border-white/10 pb-4 focus-within:border-[#7AB2B2] transition-colors">
                            <input
                                type="number"
                                min="1"
                                value={totalCapacity}
                                onChange={(e) => handleCapacityChange(e.target.value)}
                                className="w-full bg-transparent text-6xl font-serif-premium italic text-white placeholder-white/20 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Attendees..."
                            />
                            <span className="text-[#088395] font-black uppercase tracking-[0.2em] text-sm opacity-90">Tickets</span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-2 relative z-10">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Allocation</span>
                            <span className={`text-xl font-serif-premium italic ${isCapacityMet ? 'text-[#088395]' : 'text-white'}`}>
                                {totalAssigned} <span className="text-white/40 text-sm">/</span> {totalCapacity || 0}
                            </span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${totalAssigned > (totalCapacity || 0) ? 'bg-red-400' : isCapacityMet ? 'bg-[#088395]' : 'bg-[#7AB2B2]'}`}
                                style={{ width: `${Math.min(100, (totalAssigned / (totalCapacity || 1)) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-4">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Daily Tickets</span>
                            <span className={`text-sm font-black tracking-wide ${isAllocationReady ? 'text-[#7AB2B2]' : 'text-white/80'}`}>
                                {dailyTotalAssigned}
                            </span>
                        </div>
                        <p className="text-[9px] text-white/55 uppercase tracking-wider">
                            {scheduleDays.length > 0
                                ? (allocationValidation.isValid ? 'Per-day and tier allocation matched' : 'Match per-day totals and tier totals')
                                : 'Set schedule dates first'}
                        </p>
                    </div>
                </div>

                {/* RIGHT: Ticket Tiers List */}
                <div className="w-1/2 flex-shrink-0 h-full">
                    <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar pb-4 block">
                        {ticketType === 'paid' ? (
                            <>
                                <AnimatePresence>
                                    {tickets.map((ticket) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={ticket.id}
                                            className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-[#09637E]/10 shadow-sm relative group"
                                        >
                                            <div className="grid grid-cols-12 gap-3 items-end">
                                                <div className="col-span-12 mb-1 flex justify-between items-center">
                                                    <label className="block text-[8px] font-black text-[#09637E]/40 uppercase tracking-widest">Tier Details</label>
                                                    <button onClick={() => onRemove(ticket.id)} className="text-[#09637E]/20 hover:text-red-500 transition-colors pointer-events-auto z-10" title="Remove Tier">
                                                        <BsTrash3 size={14} />
                                                    </button>
                                                </div>
                                                <div className="col-span-8">
                                                    <input
                                                        type="text"
                                                        value={ticket.name}
                                                        onChange={(e) => onChange(ticket.id, 'name', e.target.value)}
                                                        className="w-full bg-transparent text-xl font-serif-premium italic text-[#09637E] outline-none border-b border-[#09637E]/10 pb-1 focus:border-[#088395] placeholder-[#09637E]/30"
                                                        placeholder="Gen Admission"
                                                        title="Tier Name"
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-[#088395] font-serif-premium italic text-xl">₹</span>
                                                        <input
                                                            type="number"
                                                            value={ticket.price ?? ""}
                                                            onChange={(e) => onChange(ticket.id, 'price', e.target.value === "" ? "" : parseFloat(e.target.value))}
                                                            className="w-full bg-transparent text-xl font-serif-premium italic text-[#09637E] outline-none border-b border-[#09637E]/10 pb-1 focus:border-[#088395] placeholder-[#09637E]/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            placeholder="Price"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <button onClick={onAdd} className="w-full py-4 mt-2 border border-dashed border-[#09637E]/20 rounded-2xl text-[#09637E]/50 font-black uppercase tracking-widest text-[9px] hover:bg-[#09637E]/5 hover:border-[#088395] hover:text-[#088395] transition-all flex items-center justify-center gap-2">
                                    <BsPlus size={16} /> Add Ticket Tier
                                </button>
                            </>
                        ) : (
                            <div className="border-2 border-dashed border-[#7AB2B2]/30 rounded-3xl p-6 bg-white/20">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[#7AB2B2]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7AB2B2]">
                                        <BsShieldCheck size={28} />
                                    </div>
                                    <h4 className="text-2xl font-serif-premium italic text-[#09637E] mb-2">Free Event Selected</h4>
                                    <p className="text-[11px] font-semibold text-[#09637E]/50 leading-relaxed max-w-[240px] mx-auto">
                                        General Admission tier will automatically process the total valid capacity.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white/75 backdrop-blur-md rounded-2xl p-4 border border-[#09637E]/10 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-black uppercase tracking-widest text-[#09637E]/70">Tickets Per Day</h4>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${isAllocationReady ? 'text-[#088395]' : 'text-[#09637E]/40'}`}>
                                    {isAllocationReady ? 'Ready' : 'Pending'}
                                </span>
                            </div>

                            {scheduleDays.length === 0 ? (
                                <p className="text-[10px] font-semibold text-[#09637E]/45 uppercase tracking-wider">
                                    Select event start and end dates to allocate day-wise ticket quantities.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {scheduleDays.map((day) => (
                                        <div key={day} className="rounded-xl border border-[#09637E]/10 p-3 bg-white/60">
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-7 text-[#09637E] text-sm font-semibold">
                                                    {getDayLabel(day)}
                                                </div>
                                                <div className="col-span-5 text-right">
                                                    {ticketType === 'paid' ? (
                                                        <span className="text-base font-serif-premium italic text-[#09637E]">
                                                            {allocationValidation.dayTotalByDay[day] || 0}
                                                        </span>
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
                                                                    max={tier.quantity || undefined}
                                                                    disabled={Boolean(sameAsFirstDays[day]) && day !== firstDay}
                                                                    value={dayTierAllocations?.[day]?.[tier.id] ?? ''}
                                                                    onChange={(e) => handleDayTierAllocationChange(day, tier.id, e.target.value)}
                                                                    className="w-full bg-transparent text-sm font-serif-premium italic text-[#09637E] outline-none border-b border-[#09637E]/15 pb-1 focus:border-[#088395] disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {ticketType === 'paid' && tickets.length > 0 && (
                                <div className="mt-4 border-t border-[#09637E]/10 pt-3 space-y-1">
                                    {tickets.map((ticket, idx) => {
                                        const tierId = String(ticket?.id ?? `tier-${idx}`);
                                        const allocated = allocationValidation.tierTotalById[tierId] || 0;
                                        const target = allocationValidation.tierTargetById[tierId] || 0;
                                        const isMatched = allocated === target;

                                        return (
                                        <div key={`tier-total-${tierId}`} className="flex items-center justify-between text-[11px] gap-3">
                                            <span className="font-semibold text-[#09637E]/70 truncate max-w-[58%]">{ticket?.name || 'Tier'}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`font-black ${isMatched ? 'text-[#088395]' : 'text-red-500'}`}>
                                                    {allocated}
                                                </span>
                                                <span className="text-[#09637E]/35">/</span>
                                                <span className="w-16 text-right font-black text-[#09637E]">
                                                    {target}
                                                </span>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrbitalTickets;
