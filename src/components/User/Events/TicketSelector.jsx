import React from "react";
import { BsCheckCircleFill, BsDash, BsPlus } from "react-icons/bs";

const TicketSelector = ({
    event,
    ticketSelection,
    handleQuantityChange,
    availableTickets,
    totalPrice
}) => {
    // Helper to get numeric price for calculation/display if needed
    const getNumericPrice = (p) => {
        if (!p || typeof p !== 'string') return 0;
        const numeric = p.replace(/[^0-9.]/g, '');
        return numeric ? parseFloat(numeric) : 0;
    };

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
                {/* Category Selection List */}
                {event.categories && (
                    <div className="space-y-3">
                        {event.categories.map((cat) => {
                            const qty = ticketSelection[cat.name] || 0;
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
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleQuantityChange(cat.name, -1)}
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
                                            onClick={() => handleQuantityChange(cat.name, 1)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white shadow-sm text-[#09637E] hover:bg-[#09637E] hover:text-white"
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
