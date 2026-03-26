import React, { useState } from "react";
import { BsCheckCircleFill, BsShieldCheck, BsLightningCharge, BsArrowRight } from "react-icons/bs";

const PaymentMethod = ({ onConfirm, platformFee, isProcessing = false, isFreeCheckout = false }) => {
    const [selectedMethod, setSelectedMethod] = useState("razorpay");

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_-10px_rgba(9,99,126,0.1)] border border-[#09637E]/5 h-full relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EBF4F6] rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#09637E]/5 rounded-2xl flex items-center justify-center text-[#09637E] shadow-sm border border-[#09637E]/10">
                        <BsShieldCheck size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif-premium italic text-[#09637E]">Payment Checkout</h2>
                        <p className="text-[10px] font-black text-[#09637E]/40 uppercase tracking-[0.2em] mt-1">{isFreeCheckout ? 'No Payment Required' : 'Powered by Razorpay'}</p>
                    </div>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-[#088395] uppercase tracking-widest bg-[#088395]/10 px-3 py-1 rounded-full border border-[#088395]/20">Secure Gateway</span>
                </div>
            </div>

            {/* Razorpay Method Selection */}
            <div className="space-y-4 mb-12 relative z-10">
                <p className="text-[10px] font-black text-[#09637E]/30 uppercase tracking-[0.2em] mb-4 pl-1">Select Payment Preference</p>

                <div
                    onClick={() => !isFreeCheckout && setSelectedMethod("razorpay")}
                    className={`group cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between ${selectedMethod === "razorpay"
                        ? "bg-[#09637E]/5 border-[#09637E] shadow-lg shadow-[#09637E]/5"
                        : "bg-transparent border-[#09637E]/10 hover:border-[#09637E]/30"
                        }`}
                >
                    <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedMethod === "razorpay" ? "bg-[#09637E] text-white" : "bg-[#EBF4F6] text-[#09637E]"
                            }`}>
                            <BsLightningCharge />
                        </div>
                        <div>
                            <h4 className={`font-bold transition-colors ${selectedMethod === "razorpay" ? "text-[#09637E]" : "text-[#09637E]/80"}`}>
                                {isFreeCheckout ? 'Confirm Free Ticket' : 'Pay with Razorpay'}
                            </h4>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === "razorpay" ? "bg-[#22c55e] border-[#22c55e]" : "border-[#09637E]/20"
                        }`}>
                        {selectedMethod === "razorpay" && <BsCheckCircleFill className="text-white text-xs" />}
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 relative z-10">
                <div className="p-4 bg-[#EBF4F6]/50 rounded-2xl border border-[#09637E]/5">
                    <p className="text-[9px] font-bold text-[#09637E]/40 uppercase tracking-widest mb-1">Processing Time</p>
                    <p className="text-xs font-bold text-[#09637E]">Instant Confirmation</p>
                </div>
                <div className="p-4 bg-[#EBF4F6]/50 rounded-2xl border border-[#09637E]/5">
                    <p className="text-[9px] font-bold text-[#09637E]/40 uppercase tracking-widest mb-1">Security</p>
                    <p className="text-xs font-bold text-[#09637E]">AES 256-bit Encrypted</p>
                </div>
            </div>

            {/* Pay Button */}
            <div className="relative z-10">
                <button
                    onClick={onConfirm}
                    disabled={isProcessing}
                    className="w-full py-6 bg-[#09637E] text-white rounded-[2rem] shadow-2xl shadow-[#09637E]/30 hover:bg-[#088395] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></div>
                    <span className="font-black uppercase tracking-[0.3em] text-xs relative z-10">
                        {isProcessing ? 'Processing...' : (isFreeCheckout ? 'Confirm Ticket' : 'Proceed to Razorpay')}
                    </span>
                    <BsArrowRight className="text-white/60 group-hover:text-white transition-all group-hover:translate-x-1 relative z-10" size={18} />
                </button>

                <div className="flex flex-col items-center gap-3 mt-8">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-[#09637E]/30 uppercase tracking-[0.2em]">
                        <BsShieldCheck className="text-[#088395]" size={12} />
                        {isFreeCheckout ? 'Instant ticket confirmation for free events' : 'Your transaction is protected by Razorpay Security'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethod;
