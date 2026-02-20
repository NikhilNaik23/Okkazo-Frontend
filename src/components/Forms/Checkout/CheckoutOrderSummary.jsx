import React from "react";
import { BsGeoAlt, BsCalendarEvent, BsCheckCircleFill } from "react-icons/bs";

const CheckoutOrderSummary = ({ event, quantity = 1, category = "General" }) => {
    if (!event) return null;

    // Helper to parse price reliably
    const getNumericPrice = (p) => {
        if (!p || typeof p !== 'string') return 0;
        const numeric = p.replace(/[^0-9.]/g, '');
        return numeric ? parseFloat(numeric) : 0;
    };

    // Use category price if available
    let ticketPrice = getNumericPrice(event.price);
    if (event.categories) {
        const cat = event.categories.find(c => c.name === category);
        if (cat) ticketPrice = getNumericPrice(cat.price);
    }

    const subtotal = ticketPrice * quantity;

    // Fixed fees for demonstration as per design (in INR) - waived for free events
    const serviceFee = subtotal === 0 ? 0 : 415.00;
    const processingFee = subtotal === 0 ? 0 : 207.50;

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 h-fit sticky top-32">
            {/* Event Header Card */}
            {/* Event Header Card */}
            <div className="relative h-64 group">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/20 uppercase tracking-[0.2em]">
                        {event.tag}
                    </span>
                </div>

                <div className="absolute bottom-8 left-8 right-8 text-white">
                    <h3 className="text-3xl font-serif-premium italic mb-2 leading-none drop-shadow-md">{event.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
                        <BsGeoAlt size={12} className="text-[#088395]" />
                        {event.location}
                    </div>
                </div>
            </div>

            {/* Date & Time */}
            <div className="px-8 -mt-6 relative z-10">
                <div className="flex items-center gap-5 bg-white rounded-[2rem] p-5 shadow-lg border border-[#09637E]/5">
                    <div className="w-14 h-14 bg-[#EBF4F6] rounded-2xl flex items-center justify-center text-[#09637E] border border-[#09637E]/10">
                        <BsCalendarEvent size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#09637E]/40 uppercase tracking-[0.2em] leading-none mb-1.5">Date & Time</p>
                        <p className="font-black text-[#09637E] text-lg uppercase">{event.date} • {event.eventTime || "4 PM"}</p>
                    </div>
                </div>
            </div>

            <div className="p-10 pt-8">

                {/* Order Details */}
                {/* Order Details */}
                <div className="space-y-8">
                    <div className="flex justify-between items-center pb-8 border-b border-dashed border-[#09637E]/20">
                        <h4 className="text-xs font-black text-[#09637E]/40 uppercase tracking-[0.2em]">Order Details</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <span className="px-2.5 py-1 bg-[#EBF4F6] rounded-lg text-xs font-black text-[#09637E] h-fit mt-0.5">{quantity}x</span>
                                <div>
                                    <p className="font-bold text-[#09637E] text-base mb-0.5">{category} Admission</p>
                                    <p className="text-[10px] text-[#09637E]/40 font-bold uppercase tracking-wider">Standard Entry</p>
                                </div>
                            </div>
                            <span className="font-black text-[#09637E] text-lg">₹{subtotal.toFixed(2)}</span>
                        </div>

                        <div className="space-y-3 pl-[3.25rem]">
                            <div className="flex justify-between text-xs">
                                <span className="text-[#09637E]/60 font-medium">Service Fee</span>
                                <span className="text-[#09637E]/60 font-bold">₹{serviceFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-[#09637E]/60 font-medium">Processing Fee</span>
                                <span className="text-[#09637E]/60 font-bold">₹{processingFee.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="pt-8 border-t border-dashed border-[#09637E]/20">
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-[10px] font-black text-[#09637E]/40 uppercase tracking-[0.2em] mb-1">Total to pay</p>
                            <span className="px-3 py-1 bg-[#EBF4F6] text-[#09637E]/60 text-[10px] font-black rounded-lg uppercase tracking-widest">INR</span>
                        </div>
                        <p className="text-5xl font-serif-premium italic text-[#09637E] tracking-tight">₹{(subtotal + serviceFee + processingFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-4">
                        <BsCheckCircleFill className="text-[#088395]" size={12} />
                        <span className="text-[9px] font-black text-[#09637E]/40 uppercase tracking-[0.2em]">Bank-Level Security</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutOrderSummary;
