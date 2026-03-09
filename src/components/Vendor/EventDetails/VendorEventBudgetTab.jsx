import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BsArrowRepeat, BsCheckCircleFill, BsWallet2, BsReceipt } from 'react-icons/bs';

const VendorEventBudgetTab = () => {
    const {
        tempServices,
        handleUpdateQuotes,
        handleTempServiceChange,
        subtotal
    } = useOutletContext();

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-[#0b2d49] to-[#12426e] p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#d7a444] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-[#4ea8de] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md mb-4">
                        <BsWallet2 size={12} className="text-[#d7a444]" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-white/90">Financial Dashboard</span>
                    </div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                        Service Budget
                    </h2>
                    <p className="text-sm text-white/70 mt-2 max-w-md leading-relaxed">
                        Manage and allocate your structured costs per service to ensure accurate quoting and premium event delivery.
                    </p>
                </div>

                <div className="relative z-10 w-full md:w-auto mt-4 md:mt-0">
                    <button
                        onClick={handleUpdateQuotes}
                        className="group relative flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#d7a444] to-[#c59333] text-[#0b2d49] rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_20px_rgba(215,164,68,0.4)] transition-all duration-300 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                        <BsArrowRepeat size={18} className="group-hover:rotate-180 transition-transform duration-500 ease-out" />
                        <span className="relative z-10">Sync Quotes</span>
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT — Services List */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2 mb-2 text-xs font-black uppercase tracking-widest text-[#708aa0]">
                        <span className="flex-1">Service Details</span>
                        <div className="hidden sm:grid grid-cols-2 gap-4 w-[280px]">
                            <span className="text-center">Unit Price</span>
                            <span className="text-right">Total</span>
                        </div>
                    </div>

                    {tempServices.map((service, idx) => (
                        <div
                            key={service.id}
                            className="group relative bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(11,45,73,0.08)] hover:border-[#0b2d49]/10 transition-all duration-300"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#d7a444] to-[#0b2d49] rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                {/* Service Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#f8fafb] flex items-center justify-center text-[#d7a444] border border-gray-100 group-hover:bg-[#d7a444]/10 group-hover:border-[#d7a444]/20 transition-colors">
                                            <BsCheckCircleFill size={14} className="opacity-50 group-hover:opacity-100 scale-90 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#0b2d49] text-base group-hover:text-[#d7a444] transition-colors">{service.name}</h3>
                                            <p className="text-xs text-[#708aa0] mt-1 line-clamp-1">{service.details}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs Section */}
                                <div className="flex flex-row items-center gap-4 w-full sm:w-[280px] shrink-0">
                                    {/* Price & Qty Stack */}
                                    <div className="flex flex-col gap-2 w-1/2">
                                        <div className="relative group/input">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708aa0] font-bold text-sm group-focus-within/input:text-[#d7a444] transition-colors">
                                                ₹
                                            </span>
                                            <input
                                                type="number"
                                                value={service.price}
                                                onChange={(e) =>
                                                    handleTempServiceChange(service.id, 'price', e.target.value)
                                                }
                                                className="w-full pl-8 pr-3 py-2.5 bg-[#f8fafb] rounded-xl border border-transparent hover:border-gray-200 focus:bg-white text-sm font-bold text-[#0b2d49] focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/10 outline-none transition-all placeholder:text-gray-300"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="relative group/qty">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-[#708aa0] group-focus-within/qty:text-[#0b2d49] transition-colors tracking-wider">
                                                Qty
                                            </span>
                                            <input
                                                type="number"
                                                value={service.qty}
                                                onChange={(e) =>
                                                    handleTempServiceChange(service.id, 'qty', e.target.value)
                                                }
                                                className="w-full pl-10 pr-3 py-2 bg-[#f8fafb] rounded-xl border border-transparent hover:border-gray-200 focus:bg-white text-sm font-bold text-[#0b2d49] focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/10 outline-none transition-all"
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="w-1/2 flex items-center justify-end">
                                        <div className="text-right">
                                            <p className="text-[10px] text-[#708aa0] font-bold uppercase tracking-wider mb-1 sm:hidden">Total</p>
                                            <span className="text-lg font-black text-[#0b2d49]">
                                                ₹{(service.price * service.qty).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT — Sticky Summary Widget */}
                <div className="lg:col-span-4">
                    <div className="sticky top-8 bg-white p-8 rounded-[2rem] border border-[#708aa0]/10 shadow-[0_20px_40px_rgba(11,45,73,0.06)] overflow-hidden relative group">

                        {/* Summary background texture */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f8fafb] to-transparent rounded-bl-[100px] pointer-events-none"></div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-3 bg-gradient-to-br from-[#0b2d49] to-[#1a4b77] rounded-xl shadow-lg relative overflow-hidden">
                                <BsReceipt className="text-[#d7a444] relative z-10" size={20} />
                            </div>
                            <h3 className="text-xl font-black text-[#0b2d49]">Budget Summary</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-sm font-semibold text-[#708aa0] py-4 border-b border-gray-100">
                                <span>Operational Subtotal</span>
                                <span className="text-[#0b2d49] font-bold">₹{subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm font-semibold text-[#708aa0] py-4 border-b border-gray-100">
                                <span>Estimated Taxes</span>
                                <span className="text-[#0b2d49] font-bold">Calculated Later</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 relative z-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#708aa0] mb-2">Total Project Estimate</p>
                            <div className="mt-1">
                                <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0b2d49] to-[#1a4b77] tracking-tight">
                                    ₹{subtotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 bg-[#f8fafb] p-4 rounded-2xl border border-gray-100 relative z-10">
                            <p className="text-[11px] text-[#708aa0] font-medium leading-relaxed">
                                <span className="text-[#0b2d49] font-bold">Note:</span> This total does not include applicable taxes or platform fees. These will be added during final invoicing to the client. Keep quotes accurate to ensure profitability.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VendorEventBudgetTab;