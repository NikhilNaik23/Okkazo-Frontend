import React from 'react';
import { BsPlus, BsTrash3, BsCurrencyRupee, BsShieldCheck } from "react-icons/bs";
import { motion, AnimatePresence } from 'framer-motion';

const OrbitalTickets = ({ formData, setFormData, onAdd, onRemove, onChange }) => {
    const { tickets, totalCapacity, ticketType } = formData;
    const totalAssigned = tickets.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0);
    const isCapacityMet = totalCapacity > 0 && totalAssigned === parseInt(totalCapacity);

    const handleTypeChange = (type) => {
        if (type === 'free') {
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
        if (formData.ticketType === 'free') {
            update.tickets = [{ ...formData.tickets[0], quantity: capacity, name: "General Admission", price: 0 }];
        }
        setFormData(update);
    };

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

            <div className="flex gap-8 items-start h-[340px]">
                {/* LEFT: Total Capacity Box */}
                <div className="w-1/2 bg-[#09637E] rounded-3xl p-8 shadow-xl relative overflow-hidden text-white group flex-shrink-0 h-full flex flex-col justify-between">
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

                    <div className="mt-8 flex flex-col gap-2 relative z-10 block">
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
                </div>

                {/* RIGHT: Ticket Tiers List */}
                <div className="w-1/2 flex-shrink-0 h-full">
                    {ticketType === 'paid' ? (
                        <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar pb-4 block">
                            <AnimatePresence>
                                {tickets.map((ticket, idx) => (
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
                                            <div className="col-span-6">
                                                <input
                                                    type="text"
                                                    value={ticket.name}
                                                    onChange={(e) => onChange(ticket.id, 'name', e.target.value)}
                                                    className="w-full bg-transparent text-xl font-serif-premium italic text-[#09637E] outline-none border-b border-[#09637E]/10 pb-1 focus:border-[#088395] placeholder-[#09637E]/30"
                                                    placeholder="Gen Admission"
                                                    title="Tier Name"
                                                />
                                            </div>
                                            <div className="col-span-3">
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
                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    value={ticket.quantity ?? ""}
                                                    onChange={(e) => onChange(ticket.id, 'quantity', e.target.value === "" ? "" : parseInt(e.target.value))}
                                                    className="w-full bg-transparent text-xl font-serif-premium italic text-[#09637E] outline-none border-b border-[#09637E]/10 pb-1 focus:border-[#088395] placeholder-[#09637E]/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="Qty"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <button onClick={onAdd} className="w-full py-4 mt-2 border border-dashed border-[#09637E]/20 rounded-2xl text-[#09637E]/50 font-black uppercase tracking-widest text-[9px] hover:bg-[#09637E]/5 hover:border-[#088395] hover:text-[#088395] transition-all flex items-center justify-center gap-2">
                                <BsPlus size={16} /> Add Ticket Tier
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-[#7AB2B2]/30 rounded-3xl p-8 bg-white/20">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-[#7AB2B2]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7AB2B2]">
                                    <BsShieldCheck size={28} />
                                </div>
                                <h4 className="text-2xl font-serif-premium italic text-[#09637E] mb-2">Free Event Selected</h4>
                                <p className="text-[11px] font-semibold text-[#09637E]/50 leading-relaxed max-w-[200px] mx-auto">
                                    General Admission tier will automatically process the total valid capacity.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrbitalTickets;
