import React from "react";
import { BsGeoAlt, BsCalendarEvent } from "react-icons/bs";

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

    // Fixed fees for demonstration as per design
    const serviceFee = 5.00;
    const processingFee = 2.50;
    const subtotal = ticketPrice * quantity;

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 h-fit sticky top-32">
            {/* Event Header Card */}
            <div className="relative h-48 group">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/30 uppercase tracking-wider">
                        {event.tag}
                    </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-2xl font-black mb-1 leading-tight">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                        <BsGeoAlt size={12} className="text-[#d7a444]" />
                        {event.location}
                    </div>
                </div>
            </div>

            {/* Date & Time */}
            <div className="p-8">
                <div className="flex items-center gap-4 mb-8 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#0b2d49]">
                        <BsCalendarEvent size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Date & Time</p>
                        <p className="font-extrabold text-[#0b2d49]">{event.date}</p>
                    </div>
                </div>

                {/* Order Details */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-[#0b2d49] uppercase tracking-wider">Order Details</h4>
                    
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[10px] font-bold text-[#0b2d49] h-fit mt-1">{quantity}x</span>
                            <div>
                                <p className="font-bold text-[#0b2d49] text-sm">{category} Admission</p>
                                <p className="text-[10px] text-gray-400 font-medium">Standard Entry</p>
                            </div>
                        </div>
                        <span className="font-bold text-[#0b2d49]">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 font-medium">Service Fee</span>
                            <span className="text-[#0b2d49] font-bold">${serviceFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 font-medium">Processing Fee</span>
                            <span className="text-[#0b2d49] font-bold">${processingFee.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Total to pay</p>
                            <p className="text-4xl font-black text-[#d7a444] tracking-tighter">${(subtotal + serviceFee + processingFee).toFixed(2)}</p>
                        </div>
                        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg border border-gray-100">USD</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutOrderSummary;
