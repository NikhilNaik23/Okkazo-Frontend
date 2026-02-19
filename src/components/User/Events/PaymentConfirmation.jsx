import React from "react";
import { BsShieldCheck, BsArrowLeft, BsGem } from "react-icons/bs";
import { promotePrices } from "../../../data/promoteEventData";

const PaymentConfirmation = ({ formData, platformFee, setCurrentStep, handlePaymentSuccess }) => {
    // Promotion costs calculation
    const promoCosts = Object.keys(formData.promotions).reduce((acc, key) => {
        if (formData.promotions[key] === true && promotePrices[key]) {
            return acc + promotePrices[key];
        }
        return acc;
    }, 0);

    const subtotal = platformFee + promoCosts;
    const tax = subtotal * 0.05;
    const finalTotal = subtotal + tax;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border border-[#09637E]/10 relative overflow-hidden group">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#088395]/5 rounded-full blur-3xl -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-[#088395]/10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7AB2B2]/10 rounded-full blur-3xl -ml-32 -mb-32 group-hover:bg-[#7AB2B2]/20" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        {/* Summary Column */}
                        <div className="flex-1 space-y-8">
                            <div>
                                <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Secure Checkout</p>
                                <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Authorize Publication.</h2>
                            </div>

                            <div className="p-8 bg-[#09637E] rounded-3xl text-[#EBF4F6] relative overflow-hidden group/card shadow-xl">
                                <div className="absolute top-4 right-4 text-[#7AB2B2]/20 group-hover/card:scale-110 transition-transform duration-500">
                                    <BsShieldCheck size={120} />
                                </div>
                                <div className="relative z-10">
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Event Title</span>
                                    <h3 className="text-2xl font-serif-premium italic mb-6">{formData.eventName || 'Untitled Event'}</h3>

                                    <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <BsGem className="text-[#7AB2B2]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Status</p>
                                            <p className="text-sm font-bold tracking-wide">Ready to Launch</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex items-center gap-2 text-[#09637E]/40 hover:text-[#09637E] transition-all font-bold uppercase tracking-widest text-[10px] group/back"
                            >
                                <BsArrowLeft className="group-hover/back:-translate-x-1 transition-transform" />
                                Return to editing
                            </button>
                        </div>

                        {/* Bill Column */}
                        <div className="w-full md:w-80 bg-[#EBF4F6] rounded-[2.5rem] p-8 border border-[#09637E]/5 flex flex-col justify-between shadow-inner">
                            <div>
                                <h4 className="font-serif-premium text-2xl italic text-[#09637E] mb-8">Summary</h4>
                                <ul className="space-y-5">
                                    <li className="flex justify-between items-center text-[#09637E]/70">
                                        <span className="text-xs font-bold uppercase tracking-wider">Platform</span>
                                        <span className="font-mono text-sm leading-none">₹{platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </li>
                                    {promoCosts > 0 && (
                                        <li className="flex justify-between items-center text-[#09637E]/70">
                                            <span className="text-xs font-bold uppercase tracking-wider">Marketing</span>
                                            <span className="font-mono text-sm leading-none">₹{promoCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </li>
                                    )}
                                    <li className="flex justify-between items-center text-[#09637E]/70">
                                        <span className="text-xs font-bold uppercase tracking-wider">Tax (5%)</span>
                                        <span className="font-mono text-sm leading-none">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-12 pt-8 border-t border-[#09637E]/10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-2 text-right">Settlement Total</p>
                                <div className="text-right">
                                    <span className="text-5xl font-serif-premium italic text-[#09637E]">₹{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <button
                                    onClick={handlePaymentSuccess}
                                    className="w-full mt-8 py-5 bg-[#088395] text-[#EBF4F6] font-black uppercase tracking-[0.15em] text-xs rounded-2xl shadow-xl hover:bg-[#09637E] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group/pay"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/pay:translate-x-full transition-transform duration-700" />
                                    <span className="relative z-10">Confirm & Transact</span>
                                </button>

                                <p className="mt-6 text-[9px] text-center text-[#09637E]/40 px-4 leading-relaxed font-bold uppercase tracking-widest">
                                    Secure encryption provided. By transacting, you agree to Okkazo terms.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmation;
