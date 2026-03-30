import React, { useEffect, useMemo, useState } from 'react';
import { BsPlus, BsTrash3, BsTicketPerforated, BsBoxSeam, BsCurrencyRupee, BsShieldCheck } from "react-icons/bs";
import { getInclusiveIstDayRange } from '../../../../utils/istDateTime';
import { getTierDescriptors, getDayTierTotal, validateDayTierAllocations } from '../../../../utils/dayTierAllocation';

const StepTickets = ({ formData, setFormData, onAdd, onRemove, onChange }) => {
    const { tickets, totalCapacity, ticketType } = formData;
    const scheduleDays = getInclusiveIstDayRange(formData.startDate, formData.endDate);
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

    const totalAssigned = tickets.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0);
    const isCapacityMet = totalCapacity > 0 && totalAssigned === parseInt(totalCapacity, 10);

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
                    <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 03 - Ticket Management</p>
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

            <div className="mb-12 bg-[#09637E] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Total Event Capacity</label>
                        <div className="flex items-baseline gap-4 border-b border-white/10 pb-4 focus-within:border-[#7AB2B2] transition-colors">
                            <input
                                type="number"
                                value={totalCapacity}
                                placeholder="Total expected attendees..."
                                onChange={(e) => handleCapacityChange(e.target.value)}
                                className="w-full bg-transparent text-5xl font-serif-premium italic text-white placeholder-white/10 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[#7AB2B2] font-black uppercase tracking-widest text-xs opacity-60">Tickets</span>
                        </div>
                    </div>

                    <div className="md:w-64 space-y-4">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Allocation</span>
                            <span className={`text-xl font-serif-premium italic ${isCapacityMet ? 'text-[#7AB2B2]' : 'text-white'}`}>
                                {totalAssigned} / {totalCapacity || 0}
                            </span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${totalAssigned > (totalCapacity || 0) ? 'bg-red-400' : isCapacityMet ? 'bg-[#7AB2B2]' : 'bg-[#088395]'} shadow-[0_0_10px_rgba(122,178,178,0.3)]`}
                                style={{ width: `${Math.min(100, (totalAssigned / (totalCapacity || 1)) * 100)}%` }}
                            />
                        </div>
                        {ticketType === 'paid' && !allocationValidation.isValid && (
                            <p className="text-[8px] text-amber-200 font-bold uppercase tracking-widest">Match day totals and tier totals</p>
                        )}
                    </div>
                </div>
            </div>

            {ticketType === 'paid' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {tickets.map((ticket, idx) => (
                        <div
                            key={ticket.id}
                            className="relative group bg-white rounded-[2.5rem] p-8 border border-[#09637E]/5 hover:border-[#088395]/30 transition-all duration-500 shadow-xl overflow-hidden animate-in fade-in slide-in-from-left-4"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#088395]/5 rounded-full blur-3xl group-hover:bg-[#088395]/10 transition-all duration-700" />

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end relative z-10">
                                <div className="md:col-span-1 hidden md:flex pb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-[#09637E]/5 flex items-center justify-center text-[#09637E]/40 group-hover:text-[#088395] group-hover:bg-[#088395]/10 transition-all">
                                        <BsTicketPerforated size={20} />
                                    </div>
                                </div>

                                <div className="md:col-span-4">
                                    <label className="block text-[9px] font-black text-[#09637E]/40 uppercase tracking-[0.2em] mb-3">Tier Designation</label>
                                    <input
                                        type="text"
                                        value={ticket.name}
                                        placeholder="e.g. VIP Backstage"
                                        onChange={(e) => onChange(ticket.id, 'name', e.target.value)}
                                        className="w-full bg-transparent text-2xl font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b border-[#09637E]/10 pb-2 focus:border-[#088395] transition-all"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-[9px] font-black text-[#09637E]/40 uppercase tracking-[0.2em] mb-3">Entrance Fee</label>
                                    <div className="flex items-baseline gap-2 group/input">
                                        <span className="text-[#088395] font-serif-premium italic text-2xl">Rs</span>
                                        <input
                                            type="number"
                                            value={ticket.price}
                                            placeholder="Min. 1"
                                            onChange={(e) => onChange(ticket.id, 'price', e.target.value === "" ? "" : parseFloat(e.target.value))}
                                            onWheel={(e) => e.target.blur()}
                                            className="w-full bg-transparent text-3xl font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b border-[#09637E]/10 pb-2 focus:border-[#088395] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-[9px] font-black text-[#09637E]/40 uppercase tracking-[0.2em] mb-3">Availability</label>
                                    <div className="flex items-center gap-3">
                                        <BsBoxSeam className="text-[#09637E]/20" />
                                        <input
                                            type="number"
                                            value={ticket.quantity}
                                            placeholder="Quantity"
                                            onChange={(e) => onChange(ticket.id, 'quantity', e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                                            onWheel={(e) => e.target.blur()}
                                            className="w-full bg-transparent text-2xl font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b border-[#09637E]/10 pb-2 focus:border-[#088395] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-1 flex justify-end pb-1">
                                    <button
                                        onClick={() => onRemove(ticket.id)}
                                        className="w-12 h-12 rounded-full text-[#09637E]/30 hover:text-red-500 hover:bg-red-50 transition-all duration-300 flex items-center justify-center group/del"
                                        title="Remove Tier"
                                    >
                                        <BsTrash3 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={onAdd}
                        className="w-full py-8 mt-6 border-2 border-dashed border-[#09637E]/10 rounded-[2.5rem] text-[#09637E]/60 font-black uppercase tracking-[0.3em] text-[10px] flex flex-col items-center justify-center gap-4 hover:bg-[#09637E]/5 hover:border-[#088395] hover:text-[#088395] transition-all active:scale-[0.98] group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#088395]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <div className="w-12 h-12 rounded-full bg-[#09637E]/5 flex items-center justify-center group-hover:bg-[#088395] group-hover:text-[#EBF4F6] transition-all duration-500 group-hover:rotate-90">
                            <BsPlus size={32} />
                        </div>
                        <span>Architect New Ticket Tier</span>
                    </button>
                </div>
            )}

            <div className="mt-10 bg-white rounded-[2rem] p-6 border border-[#09637E]/10 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#09637E]/70">Tickets Per Day</h4>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${allocationValidation.isValid ? 'text-[#088395]' : 'text-[#09637E]/40'}`}>
                        {allocationValidation.isValid ? 'Ready' : 'Pending'}
                    </span>
                </div>

                {scheduleDays.length === 0 ? (
                    <p className="text-[10px] font-semibold text-[#09637E]/50 uppercase tracking-wider">
                        Set schedule dates in Step 5, then return here to enter day-wise tier allocations.
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
                                                        max={tier.quantity || undefined}
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
                                        <span className={`font-black ${allocationValidation.tierTotalById[tier.id] === allocationValidation.tierTargetById[tier.id] ? 'text-[#088395]' : 'text-red-500'}`}>
                                            {allocationValidation.tierTotalById[tier.id] || 0} / {allocationValidation.tierTargetById[tier.id] || 0}
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
