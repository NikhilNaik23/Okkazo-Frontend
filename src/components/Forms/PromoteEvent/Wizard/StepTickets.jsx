import React from 'react';
import { BsPlus, BsTrash3, BsTicketPerforated, BsBoxSeam, BsCurrencyRupee, BsShieldCheck, BsShieldX } from "react-icons/bs";

const StepTickets = ({ formData, setFormData, onAdd, onRemove, onChange }) => {
    const { tickets, totalCapacity, ticketType } = formData;

    const totalAssigned = tickets.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0);
    const isCapacityMet = totalCapacity > 0 && totalAssigned === parseInt(totalCapacity);

    const handleTypeChange = (type) => {
        if (type === 'free') {
            // For free events, we provide one 'General Admission' tier automatically
            setFormData({
                ...formData,
                ticketType: 'free',
                tickets: [{ id: Date.now(), name: "General Admission", price: 0, quantity: formData.totalCapacity || "" }]
            });
        } else {
            setFormData({ ...formData, ticketType: 'paid' });
        }
    };

    const handleCapacityChange = (val) => {
        const capacity = val === "" ? "" : parseInt(val);
        const update = { ...formData, totalCapacity: capacity };

        // If it's a free event, sync the automatic single tier's quantity
        if (formData.ticketType === 'free') {
            update.tickets = [{ ...formData.tickets[0], quantity: capacity, name: "General Admission", price: 0 }];
        }

        setFormData(update);
    };

    return (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-serif-premium text-6xl md:text-8xl italic text-[#7AB2B2] opacity-10 mb-8 absolute -top-20 -left-20 pointer-events-none select-none">Access</h1>

            <div className="mb-12 relative flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 03 — Ticket Management</p>
                    <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Define value tiers.</h2>
                </div>

                {/* Ticket Type Toggle */}
                <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-[#09637E]/10 shadow-sm">
                    <button
                        onClick={() => handleTypeChange('paid')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${ticketType === 'paid'
                            ? 'bg-[#09637E] text-white shadow-lg'
                            : 'text-[#09637E]/40 hover:text-[#09637E]'
                            }`}
                    >
                        <BsCurrencyRupee />
                        Paid
                    </button>
                    <button
                        onClick={() => handleTypeChange('free')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${ticketType === 'free'
                            ? 'bg-[#088395] text-white shadow-lg'
                            : 'text-[#09637E]/40 hover:text-[#09637E]'
                            }`}
                    >
                        <BsShieldCheck />
                        Free
                    </button>
                </div>
            </div>

            {/* Capacity Input & Progress Bar */}
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
                                className={`h-full rounded-full transition-all duration-700 ${totalAssigned > (totalCapacity || 0)
                                    ? 'bg-red-400'
                                    : isCapacityMet
                                        ? 'bg-[#7AB2B2]'
                                        : 'bg-[#088395]'
                                    } shadow-[0_0_10px_rgba(122,178,178,0.3)]`}
                                style={{ width: `${Math.min(100, (totalAssigned / (totalCapacity || 1)) * 100)}%` }}
                            />
                        </div>
                        {totalAssigned > (totalCapacity || 0) && (
                            <p className="text-[8px] text-red-300 font-bold uppercase tracking-widest animate-pulse">Capacity Over Limit</p>
                        )}
                        {totalCapacity > 0 && !isCapacityMet && totalAssigned < totalCapacity && (
                            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">
                                {ticketType === 'free' ? 'Enter capacity to activate' : `Need ${totalCapacity - totalAssigned} more assigned`}
                            </p>
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
                                        <span className="text-[#088395] font-serif-premium italic text-2xl">₹</span>
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
                                            onChange={(e) => onChange(ticket.id, 'quantity', e.target.value === "" ? "" : parseInt(e.target.value))}
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
        </div>
    );
};

export default StepTickets;
