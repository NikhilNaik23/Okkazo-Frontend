import React from 'react';
import { BsCalendar, BsGeoAlt, BsTicketPerforated, BsCurrencyRupee } from "react-icons/bs";
import { promotePrices } from '../../../../data/promoteEventData';

const StepReview = ({ formData, platformFee = 15000, serviceChargePercent = 2.5 }) => {
    // Calculate totals
    const totalTickets = formData.tickets.reduce((acc, t) => acc + (t.quantity || 0), 0);
    const grossRevenue = formData.tickets.reduce((acc, t) => acc + ((t.price * t.quantity) || 0), 0);
    const rate = Math.max(0, Math.min(100, Number(serviceChargePercent))) / 100;
    const serviceCharge = grossRevenue * rate;
    const netRevenue = grossRevenue - serviceCharge;

    // Promotion costs
    const promoCosts = Object.keys(formData.promotions).reduce((acc, key) => {
        if (formData.promotions[key] === true && promotePrices[key]) {
            return acc + promotePrices[key];
        }
        return acc;
    }, 0);

    const subtotal = platformFee + promoCosts;
    const tax = subtotal * 0.05;
    const finalTotal = subtotal + tax;

    return (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-serif-premium text-6xl md:text-8xl italic text-[#7AB2B2] opacity-10 mb-8 absolute -top-20 -left-20 pointer-events-none select-none">Manifest</h1>

            <div className="mb-12 relative">
                <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 07 — Final Review</p>
                <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Ready to launch?</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Event Card - Keep Dark for Contrast */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#09637E] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                        {/* Banner Vis */}
                        <div className="absolute inset-0 z-0">
                            {formData.banner && <img src={formData.banner} className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700" alt="bg" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] via-[#09637E]/80 to-[#09637E]/40" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full border border-[#7AB2B2]/30 text-[#7AB2B2] text-[10px] font-bold uppercase tracking-widest mb-3">{formData.category || 'Uncategorized'}</span>
                                <h3 className="text-4xl font-serif-premium italic text-[#EBF4F6] leading-none mb-2">{formData.eventName || 'Untitled Event'}</h3>
                            </div>

                            <div className="flex flex-col gap-4 border-t border-[#EBF4F6]/10 pt-6">
                                <div className="flex items-center gap-4 text-[#7AB2B2]">
                                    <BsCalendar size={18} />
                                    <span className="text-sm font-bold text-[#EBF4F6] uppercase tracking-wide">
                                        {formData.startDate ? new Date(formData.startDate).toLocaleString() : 'Date TBD'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-[#7AB2B2]">
                                    <BsGeoAlt size={18} />
                                    <span className="text-sm font-bold text-[#EBF4F6] uppercase tracking-wide truncate max-w-xs" title={formData.address}>
                                        {formData.address || 'Location TBD'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Update for Light Theme */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#09637E]/5">
                            <p className="text-[10px] text-[#09637E]/60 font-black uppercase tracking-widest mb-2">Total Tickets</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-serif-premium text-[#09637E] italic">{totalTickets}</span>
                                <BsTicketPerforated className="text-[#088395] opacity-50" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#09637E]/5 relative overflow-hidden">
                            <p className="text-[10px] text-[#09637E]/60 font-black uppercase tracking-widest mb-2">Est. Net Revenue</p>
                            <div className="flex flex-col">
                                <span className="text-3xl font-serif-premium text-[#09637E] italic">₹{netRevenue.toLocaleString()}</span>
                                <span className="text-[9px] font-bold text-[#09637E]/40 uppercase tracking-wider mt-1">Post {serviceChargePercent}% Service Fee</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Costs Breakdown */}
                <div className="bg-white text-[#09637E] rounded-[2rem] p-8 shadow-xl flex flex-col justify-between border border-[#09637E]/5">
                    <div>
                        <h4 className="font-serif-premium text-2xl italic mb-6">Investment</h4>
                        <ul className="space-y-4 text-sm font-bold opacity-80">
                            <li className="flex justify-between border-b border-[#09637E]/20 pb-2">
                                <span>Platform Fee</span>
                                <span>₹{Number(platformFee).toFixed(2)}</span>
                            </li>
                            {promoCosts > 0 && (
                                <li className="flex justify-between border-b border-[#09637E]/20 pb-2">
                                    <span>Visibility Boost</span>
                                    <span>₹{promoCosts.toFixed(2)}</span>
                                </li>
                            )}
                            <li className="flex justify-between">
                                <span>Tax (5%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-12">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Total Due Today</p>
                        <p className="text-5xl font-serif-premium italic leading-none">
                            ₹{finalTotal.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StepReview;
