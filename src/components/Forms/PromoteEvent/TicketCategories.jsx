import React from 'react';
import { BsTrash, BsPlus } from "react-icons/bs";

const TicketCategories = ({ formData, handleTicketChange, handleRemoveTicket, handleAddTicket }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-3 font-bold text-lg mb-6">
                <div className="text-white bg-[#0b2d49] w-6 h-6 rounded flex items-center justify-center text-[10px]">🎫</div>
                Ticket Categories
            </h2>
            <div className="space-y-4">
                {formData.tickets.map((ticket) => (
                    <div key={ticket.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="md:col-span-5">
                            <label className="block text-[8px] font-extrabold text-gray-400 uppercase mb-1">Category Name</label>
                            <input
                                type="text"
                                value={ticket.name}
                                onChange={(e) => handleTicketChange(ticket.id, 'name', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#d7a444] outline-none"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-[8px] font-extrabold text-gray-400 uppercase mb-1">Price per Ticket (₹)</label>
                            <input
                                type="number"
                                value={ticket.price}
                                onChange={(e) => handleTicketChange(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#d7a444] outline-none"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-[8px] font-extrabold text-gray-400 uppercase mb-1">Quantity</label>
                            <input
                                type="number"
                                value={ticket.quantity}
                                onChange={(e) => handleTicketChange(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#d7a444] outline-none"
                            />
                        </div>
                        <div className="md:col-span-1 flex justify-center pb-2">
                            <button
                                onClick={() => handleRemoveTicket(ticket.id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <BsTrash size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    onClick={handleAddTicket}
                    className="w-full py-4 mt-2 border-2 border-dashed border-[#0b2d49] rounded-xl text-[#0b2d49] font-bold flex items-center justify-center gap-2 hover:bg-[#0b2d49]/5 transition-all active:scale-[0.98]"
                >
                    <div className="w-5 h-5 rounded-full bg-[#0b2d49] text-white flex items-center justify-center text-xs">
                        <BsPlus size={18} />
                    </div>
                    Add Category
                </button>
            </div>
        </div>
    );
};

export default TicketCategories;
