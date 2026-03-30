import React from 'react';
import { motion } from 'framer-motion';
import { BsArrowLeft, BsShieldCheck } from 'react-icons/bs';

const MotionButton = motion.button;
const MotionDiv = motion.div;

const PaymentSummary = ({ onBack, formData, platformFee }) => {
    const shownFee = (typeof platformFee === 'number' && Number.isFinite(platformFee)) ? platformFee : 150;
    return (
        <div className="w-full md:w-5/12 bg-[#09637E] relative p-12 text-white flex flex-col justify-between overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                <MotionButton
                    onClick={onBack}
                    whileHover={{ x: -4 }}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors uppercase text-[10px] font-black tracking-[0.2em] mb-12"
                >
                    <BsArrowLeft size={14} /> Back
                </MotionButton>

                <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest mb-6">
                        Secure Transaction
                    </span>
                    <h1 className="text-5xl font-serif-premium italic leading-tight mb-4">
                        Confirm Your <br /> Reservation
                    </h1>
                    <p className="text-white/60 text-sm leading-relaxed max-w-sm font-medium">
                        This payment serves as a service confirmation to secure your dates. The amount will be adjusted against your overall event cost after vendor selection.
                    </p>
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Rescheduling Flexibility</p>
                        <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                            You may update your event date after booking. Moving to an earlier, non-peak date is complimentary. Rescheduling to a high-demand date will incur an adjustment fee.
                        </p>
                    </div>
                </MotionDiv>
            </div>

            <div className="relative z-10 space-y-6 mt-12 md:mt-0">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Service Type</p>
                            <p className="text-lg font-serif-premium truncate max-w-[150px]">{formData.title || formData.type} Planning</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Date</p>
                            <p className="text-sm font-bold">{formData.date || "TBD"}</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Due</span>
                        <span className="text-3xl font-serif-premium font-bold italic">₹{shownFee.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-3 font-medium leading-relaxed">
                        *Adjustable against final bill
                    </p>
                </div>

                <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    <BsShieldCheck size={14} className="text-teal-300" />
                    <span>256-Bit SSL Encrypted Payment</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;
