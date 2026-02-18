import React from 'react';
import { useOutletContext } from 'react-router-dom';

const VendorEventBudgetTab = () => {
    const { tempServices, handleUpdateQuotes, handleTempServiceChange, subtotal, tax, total } = useOutletContext();

    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-[#0b2d49] tracking-tight">Service-wise Budget</h2>
                <button
                    onClick={handleUpdateQuotes}
                    className="flex items-center gap-3 px-8 py-4 bg-[#0b2d49] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-lg active:scale-95"
                >
                    Update Quotes
                </button>
            </div>

            <div className="overflow-hidden border border-[#708aa0]/10 rounded-[2rem]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-[#708aa0]/10">
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0]">Service Item</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0]">Service Type</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0]">Unit Price</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0]">Quantity</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0] text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#708aa0]/5">
                        {tempServices.map((service) => (
                            <tr key={service.id} className="group hover:bg-[#e9eff1]/20 transition-all">
                                <td className="px-8 py-6">
                                    <p className="font-black text-[#0b2d49]">{service.name}</p>
                                    <p className="text-xs font-medium text-[#708aa0] mt-1 line-clamp-1">{service.details}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-gray-100 text-[#0b2d49] text-[10px] font-black rounded-lg uppercase">FIXED</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#0b2d49]">₹</span>
                                        <input
                                            type="number"
                                            value={service.price}
                                            onChange={(e) => handleTempServiceChange(service.id, 'price', e.target.value)}
                                            className="w-full pl-7 pr-3 py-2 bg-white border border-[#708aa0]/10 rounded-lg font-bold text-[#0b2d49] focus:border-[#d7a444] outline-none transition-all"
                                        />
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <input
                                        type="number"
                                        value={service.qty}
                                        onChange={(e) => handleTempServiceChange(service.id, 'qty', e.target.value)}
                                        className="w-20 px-3 py-2 bg-white border border-[#708aa0]/10 rounded-lg font-bold text-[#0b2d49] focus:border-[#d7a444] outline-none transition-all"
                                    />
                                </td>
                                <td className="px-8 py-6 font-black text-[#0b2d49] text-right">₹{(service.price * service.qty).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-10 flex flex-col items-end gap-3 px-8">
                <div className="flex justify-between w-64 text-sm font-bold text-[#708aa0]">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 text-sm font-bold text-[#10b981]">
                    <span>Applicable Tax (18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 pt-4 border-t border-gray-100 text-2xl font-black text-[#0b2d49]">
                    <span>Total</span>
                    <span className="text-[#d7a444]">₹{total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default VendorEventBudgetTab;
