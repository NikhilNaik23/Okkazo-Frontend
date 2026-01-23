import React, { useState } from "react";
import { BsCreditCard, BsArrowLeftRight, BsCheckCircleFill, BsQuestionCircle } from "react-icons/bs";

const PaymentMethod = ({ onConfirm, platformFee }) => {
    const [paymentMode, setPaymentMode] = useState("card");

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 h-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <BsCreditCard size={20} />
                </div>
                <h2 className="text-2xl font-bold text-[#0b2d49]">Payment Method</h2>
            </div>

            {/* Payment Mode Selector */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    onClick={() => setPaymentMode("card")}
                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${
                        paymentMode === "card" 
                        ? "border-[#d7a444] bg-[#fdf8ee] text-[#d7a444]" 
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                >
                    <BsCreditCard size={20} />
                    <span className="font-bold">Card</span>
                    {paymentMode === "card" && <BsCheckCircleFill className="ml-1" size={14} />}
                </button>
                <button 
                    onClick={() => setPaymentMode("transfer")}
                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${
                        paymentMode === "transfer" 
                        ? "border-[#d7a444] bg-[#fdf8ee] text-[#d7a444]" 
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                >
                    <BsArrowLeftRight size={20} />
                    <span className="font-bold">Transfer</span>
                </button>
            </div>

            {/* Card Form */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-[#0b2d49] mb-2 px-1">Card Information</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="0000 0000 0000 0000" 
                            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/5 outline-none transition-all"
                        />
                        <BsCreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2da77d] transition-colors" />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-1">
                            <div className="w-6 h-4 bg-gray-200 rounded-sm"></div>
                            <div className="w-6 h-4 bg-gray-300 rounded-sm"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-[#0b2d49] mb-2 px-1">Expiry Date</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="MM / YY" 
                                className="w-full pl-12 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#d7a444] outline-none transition-all"
                            />
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#0b2d49] mb-2 px-1">CVC</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="123" 
                                className="w-full pl-12 pr-10 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#d7a444] outline-none transition-all"
                            />
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                            <BsQuestionCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 cursor-help hover:text-gray-400 transition-colors" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#0b2d49] mb-2 px-1">Cardholder Name</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Name on card" 
                            className="w-full pl-12 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#2da77d] outline-none transition-all"
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                    </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group py-2">
                    <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-300 text-[#2da77d] focus:ring-[#2da77d] cursor-pointer" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-[#0b2d49] transition-colors">Save my payment details for future bookings</span>
                </label>

                <button 
                    onClick={onConfirm}
                    className="w-full py-5 bg-[#0b2d49] text-white font-bold rounded-[1.25rem] shadow-xl shadow-[#0b2d49]/10 hover:bg-[#d7a444] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                    <BsCheckCircleFill className="text-white/80" />
                    Confirm Payment
                </button>

                <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-2 mt-4">
                    <BsCheckCircleFill className="text-[#d7a444]" /> Your transaction is secured with 256-bit SSL encryption.
                </p>
            </div>
        </div>
    );
};

export default PaymentMethod;
