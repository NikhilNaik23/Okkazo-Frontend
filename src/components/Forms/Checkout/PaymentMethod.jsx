import React, { useState } from "react";
import { BsCreditCard, BsArrowLeftRight, BsCheckCircleFill, BsQuestionCircle } from "react-icons/bs";

const PaymentMethod = ({ onConfirm, platformFee }) => {
    const [paymentMode, setPaymentMode] = useState("card");

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_-10px_rgba(9,99,126,0.1)] border border-[#09637E]/5 h-full relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EBF4F6] rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-5 mb-10 relative z-10">
                <div className="w-14 h-14 bg-[#EBF4F6] rounded-2xl flex items-center justify-center text-[#09637E] shadow-sm border border-[#09637E]/5">
                    <BsCreditCard size={24} />
                </div>
                <h2 className="text-3xl font-serif-premium italic text-[#09637E]">Payment Method</h2>
            </div>

            {/* Payment Mode Selector */}
            <div className="flex gap-4 mb-12 relative z-10 bg-[#EBF4F6]/50 p-1.5 rounded-full border border-[#09637E]/5">
                <button
                    onClick={() => setPaymentMode("card")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all text-xs font-black uppercase tracking-widest ${paymentMode === "card"
                            ? "bg-white text-[#09637E] shadow-md border border-[#09637E]/10"
                            : "text-[#09637E]/40 hover:text-[#09637E]/60"
                        }`}
                >
                    <BsCreditCard size={14} className="mb-0.5" />
                    <span>Card</span>
                </button>
                <button
                    onClick={() => setPaymentMode("transfer")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all text-xs font-black uppercase tracking-widest ${paymentMode === "transfer"
                            ? "bg-white text-[#09637E] shadow-md border border-[#09637E]/10"
                            : "text-[#09637E]/40 hover:text-[#09637E]/60"
                        }`}
                >
                    <BsArrowLeftRight size={14} className="mb-0.5" />
                    <span>Transfer</span>
                </button>
            </div>

            {/* Minimalist Card Form */}
            <div className="space-y-10 relative z-10">
                <div className="group">
                    <label className="block text-[10px] font-black text-[#09637E]/30 uppercase tracking-[0.2em] mb-3 group-focus-within:text-[#088395] transition-colors pl-1">Card Information</label>
                    <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className="w-full py-2 bg-transparent border-b border-[#09637E]/10 text-xl font-medium font-serif-premium text-[#0b2d49] placeholder:text-[#0b2d49]/20 focus:outline-none focus:border-[#088395] transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-10">
                    <div className="group">
                        <label className="block text-[10px] font-black text-[#09637E]/30 uppercase tracking-[0.2em] mb-3 group-focus-within:text-[#088395] transition-colors pl-1">Expiry Date</label>
                        <input
                            type="text"
                            placeholder="MM / YY"
                            className="w-full py-2 bg-transparent border-b border-[#09637E]/10 text-xl font-medium font-serif-premium text-[#0b2d49] placeholder:text-[#0b2d49]/20 focus:outline-none focus:border-[#088395] transition-all"
                        />
                    </div>
                    <div className="group">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-[10px] font-black text-[#09637E]/30 uppercase tracking-[0.2em] group-focus-within:text-[#088395] transition-colors pl-1">CVC</label>
                            <BsQuestionCircle className="text-[#09637E]/20 hover:text-[#088395] cursor-help transition-colors" size={14} />
                        </div>
                        <input
                            type="password"
                            placeholder="123"
                            className="w-full py-2 bg-transparent border-b border-[#09637E]/10 text-xl font-medium font-serif-premium text-[#0b2d49] placeholder:text-[#0b2d49]/20 focus:outline-none focus:border-[#088395] transition-all"
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-[10px] font-black text-[#09637E]/30 uppercase tracking-[0.2em] mb-3 group-focus-within:text-[#088395] transition-colors pl-1">Cardholder Name</label>
                    <input
                        type="text"
                        placeholder="Name on card"
                        className="w-full py-2 bg-transparent border-b border-[#09637E]/10 text-xl font-medium font-serif-premium text-[#0b2d49] placeholder:text-[#0b2d49]/20 focus:outline-none focus:border-[#088395] transition-all"
                    />
                </div>

                <label className="flex items-center gap-3 cursor-pointer group pt-2 select-none">
                    <div className="relative flex items-center justify-center w-5 h-5">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-[#09637E]/20 rounded-md transition-all peer-checked:bg-[#088395] peer-checked:border-[#088395] peer-checked:shadow-sm"></div>
                        <BsCheckCircleFill className="absolute text-white opacity-0 peer-checked:opacity-100 transition-all transform scale-50 peer-checked:scale-100" size={10} />
                    </div>
                    <span className="text-xs font-bold text-[#09637E]/50 group-hover:text-[#088395] transition-colors">Save details for future bookings</span>
                </label>

                <button
                    onClick={onConfirm}
                    className="w-full py-5 mt-6 bg-[#088395] text-white rounded-2xl shadow-xl shadow-[#088395]/20 hover:bg-[#066a7a] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <BsCheckCircleFill className="text-white/80 group-hover:text-white transition-colors relative z-10" />
                    <span className="font-black uppercase tracking-[0.2em] text-xs relative z-10">Confirm Payment</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-[#09637E]/30 uppercase tracking-widest mt-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#088395]"></div>
                    Your transaction is encrypted securely
                </div>
            </div>
        </div>
    );
};

export default PaymentMethod;
