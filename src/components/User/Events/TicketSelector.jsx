import React from "react";
import { BsPeople } from "react-icons/bs";

const TicketSelector = ({ 
    event, 
    selectedCategory, 
    setSelectedCategory, 
    bookingQty, 
    setBookingQty, 
    availableTickets, 
    getCurrentPrice 
}) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-black mb-8">Ticket Booking</h3>
            
            <div className="space-y-8">
                {/* Category Selection */}
                {event.categories && (
                    <div className="space-y-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Ticket Category</p>
                        <div className="grid gap-3">
                            {event.categories.map((cat) => (
                                <button 
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${
                                        selectedCategory === cat.name 
                                        ? "border-[#d7a444] bg-[#fdf8ee] shadow-sm" 
                                        : "border-gray-50 bg-gray-50/50 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className={`font-black uppercase text-xs tracking-wider ${selectedCategory === cat.name ? "text-[#d7a444]" : "text-gray-400"}`}>
                                        {cat.name}
                                    </span>
                                    <span className="font-extrabold text-[#0b2d49]">{cat.price}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                    <div>
                        <p className="font-black text-[#0b2d49] text-xl">{getCurrentPrice()}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            {selectedCategory ? `${selectedCategory} Ticket` : "Single Entry Ticket"}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <button 
                            onClick={() => setBookingQty(q => Math.max(1, q - 1))}
                            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all active:scale-95"
                        >
                            -
                        </button>
                        <span className="w-8 text-center font-black text-[#0b2d49]">{bookingQty}</span>
                        <button 
                            onClick={() => setBookingQty(q => Math.min(availableTickets, q + 1))}
                            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all active:scale-95"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                            Available: {availableTickets} Tickets
                        </span>
                        <div className="flex items-center gap-1.5 text-[#0b2d49]">
                            <BsPeople />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{bookingQty} Selected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketSelector;
