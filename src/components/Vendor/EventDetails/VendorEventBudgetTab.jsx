import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BsArrowRepeat } from 'react-icons/bs';

const VendorEventBudgetTab = () => {
    const {
        tempServices,
        handleUpdateQuotes,
        handleTempServiceChange,
        subtotal
    } = useOutletContext();

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-[#0b2d49]">
                        Service Budget
                    </h2>
                    <p className="text-sm text-[#708aa0] mt-1">
                        Structured cost allocation per service
                    </p>
                </div>

                <button
                    onClick={handleUpdateQuotes}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0b2d49] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all active:scale-95"
                >
                    <BsArrowRepeat size={14} />
                    Update
                </button>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-12 gap-8">

                {/* LEFT — Table */}
                <div className="col-span-8 bg-white rounded-2xl border border-[#708aa0]/10 shadow-sm overflow-hidden">

                    {/* Table Header */}
                    <div className="grid grid-cols-5 px-6 py-4 bg-[#f8fafb] text-[11px] font-black uppercase tracking-wider text-[#708aa0]">
                        <span className="col-span-2">Service</span>
                        <span>Unit Price</span>
                        <span>Qty</span>
                        <span className="text-right">Total</span>
                    </div>

                    <div className="divide-y divide-[#708aa0]/10">
                        {tempServices.map((service) => (
                            <div
                                key={service.id}
                                className="grid grid-cols-5 items-center px-6 py-5 hover:bg-[#f9fbfc] transition"
                            >
                                {/* Service */}
                                <div className="col-span-2">
                                    <p className="font-semibold text-[#0b2d49] text-sm">
                                        {service.name}
                                    </p>
                                    <p className="text-xs text-[#708aa0] mt-1">
                                        {service.details}
                                    </p>
                                </div>

                                {/* Price */}
                                <div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708aa0] font-bold text-sm">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={service.price}
                                            onChange={(e) =>
                                                handleTempServiceChange(service.id, 'price', e.target.value)
                                            }
                                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-[#708aa0]/20 text-sm font-semibold text-[#0b2d49] focus:border-[#d7a444] outline-none transition"
                                        />
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div>
                                    <input
                                        type="number"
                                        value={service.qty}
                                        onChange={(e) =>
                                            handleTempServiceChange(service.id, 'qty', e.target.value)
                                        }
                                        className="w-20 px-3 py-2 rounded-lg border border-[#708aa0]/20 text-sm font-semibold text-[#0b2d49] focus:border-[#d7a444] outline-none transition"
                                    />
                                </div>

                                {/* Total */}
                                <div className="text-right font-bold text-[#0b2d49]">
                                    ₹{(service.price * service.qty).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT — Sticky Summary */}
                <div className="col-span-4">
                    <div className="sticky top-8 bg-white p-8 rounded-2xl border border-[#708aa0]/10 shadow-sm">

                        <div className="flex justify-between text-sm font-semibold text-[#708aa0]">
                            <span>Operational Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>

                        <div className="mt-6 pt-6 border-t border-[#708aa0]/10 flex justify-between items-center">
                            <span className="text-lg font-black text-[#0b2d49]">
                                Budget Total
                            </span>
                            <span className="text-3xl font-black text-[#d7a444]">
                                ₹{subtotal.toLocaleString()}
                            </span>
                        </div>

                        <p className="text-xs text-[#708aa0] mt-4">
                            Tax calculated separately during final invoicing.
                        </p>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default VendorEventBudgetTab;