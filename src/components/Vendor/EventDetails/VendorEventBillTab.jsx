import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BsReceipt, BsShare, BsCheckCircle } from 'react-icons/bs';

const VendorEventBillTab = () => {
    const { event, services, subtotal, handlePrint, handleShareInvoice } = useOutletContext();

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start animate-in zoom-in-95 duration-700">
            {/* Main Invoice Card */}
            <div className="flex-1 bg-white p-12 lg:p-16 rounded-[4rem] shadow-2xl border border-[#708aa0]/10 relative overflow-hidden printable-content">
                {/* Invoice Top Watermark/Design */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#0b2d49]/5 rounded-bl-[10rem] -mr-20 -mt-20"></div>

                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h1 className="text-4xl font-black text-[#0b2d49] tracking-tighter mb-4">PROFORMA INVOICE</h1>
                        <p className="text-sm font-black text-[#708aa0] uppercase tracking-[0.4em]">#{event.id}82941-2024</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-[#0b2d49]">Okkazo Events</p>
                        <p className="text-xs font-bold text-[#708aa0]">Vendor Partner Portal</p>
                        <p className="text-xs font-bold text-[#708aa0] mt-1">GSTIN: 08AAAAA0000A1Z5</p>
                        <p className="text-xs font-bold text-[#708aa0]">Udaipur, Rajasthan, India</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10 lg:gap-20 py-10 border-y border-gray-100 mt-12">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-[#708aa0] tracking-widest">Client Bill To:</p>
                        <div>
                            <h3 className="text-2xl font-black text-[#0b2d49]">{event.client.name}</h3>
                            <p className="text-sm font-bold text-[#708aa0] mt-1">{event.client.org}</p>
                            <p className="text-sm font-bold text-[#708aa0]">{event.client.email}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-[#708aa0] tracking-widest">Event Summary:</p>
                        <div>
                            <h3 className="text-xl font-black text-[#0b2d49] mb-1">{event.title}</h3>
                            <p className="text-sm font-bold text-[#d7a444] uppercase">{event.date} • {event.category}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 mt-10">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b-2 border-[#0b2d49]">
                                    <th className="py-4 text-[10px] font-black uppercase text-[#708aa0]">Description</th>
                                    <th className="py-4 text-center text-[10px] font-black uppercase text-[#708aa0]">Qty</th>
                                    <th className="py-4 text-center text-[10px] font-black uppercase text-[#708aa0]">Rate</th>
                                    <th className="py-4 text-right text-[10px] font-black uppercase text-[#708aa0]">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {services.map((s, i) => (
                                    <tr key={i}>
                                        <td className="py-6 font-bold text-[#0b2d49]">{s.name}</td>
                                        <td className="py-6 text-center text-[#708aa0] font-bold">{s.qty}</td>
                                        <td className="py-6 text-center text-[#708aa0] font-bold">₹{s.price.toLocaleString()}</td>
                                        <td className="py-6 text-right font-black text-[#0b2d49]">₹{(s.price * s.qty).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-end pt-10 border-t border-gray-100">
                        <div className="max-w-md">
                            <p className="text-[10px] font-black uppercase text-[#708aa0] tracking-widest mb-3">Notes & Terms:</p>
                            <p className="text-xs font-medium text-[#708aa0] leading-relaxed italic">
                                1. This is a **Proforma Invoice** and not a formal Tax Invoice.<br />
                                2. Prices are based on current requirements and may vary if scope changes.<br />
                                3. Final Tax Invoice including applicable GST will be issued upon service completion.
                            </p>
                        </div>
                        <div className="w-80 space-y-4">
                            <div className="flex justify-between pt-6 border-t-2 border-[#0b2d49] text-3xl font-black text-[#0b2d49]">
                                <span>Estimated Total</span>
                                <span className="text-[#d7a444]">₹{subtotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar Actions */}
            <div className="w-full lg:w-72 flex flex-col gap-4 no-print">
                <div className="bg-white p-6 rounded-[2rem] border border-[#708aa0]/10 shadow-sm">
                    <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-6 px-2">Invoice Actions</h3>
                    <div className="flex flex-col gap-3">
                        <button className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#d7a444] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">
                            <BsReceipt size={16} /> Download PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className="w-full py-4 bg-[#f8fafb] text-[#0b2d49] border border-[#708aa0]/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <BsReceipt size={16} /> Print Invoice
                        </button>
                        <button
                            onClick={handleShareInvoice}
                            className="w-full py-4 bg-[#f8fafb] text-[#0b2d49] border border-[#708aa0]/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <BsShare size={16} /> Share Invoice
                        </button>
                    </div>
                </div>

                <div className="bg-[#eefcf7] p-6 rounded-[2rem] border border-[#14b67b]/10 shadow-sm">
                    <p className="text-[10px] font-black text-[#14b67b] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <BsCheckCircle size={14} /> System Verified
                    </p>
                    <p className="text-xs font-bold text-[#0b2d49] leading-relaxed opacity-70">
                        This invoice is automatically generated and verified by Okkazo's finance module.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorEventBillTab;
