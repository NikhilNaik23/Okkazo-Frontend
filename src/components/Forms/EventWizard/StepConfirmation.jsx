import React from 'react';
import { motion } from 'framer-motion';
import { BsCheck, BsArrowRight } from "react-icons/bs";
import { Link, useNavigate } from 'react-router-dom';

const StepConfirmation = ({ eventId, totalMin, totalMax }) => {
    const navigate = useNavigate();
    const hasTotals = Number.isFinite(Number(totalMin)) && Number.isFinite(Number(totalMax)) && (Number(totalMin) > 0 || Number(totalMax) > 0);
    return (
        <div className="w-full h-screen bg-surface relative flex flex-col overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-secondary/5 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="w-24 h-24 rounded-full border border-primary/20 flex items-center justify-center mb-12 relative"
                >
                    <div className="absolute inset-2 border border-dashed border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                        <BsCheck size={40} strokeWidth={1} />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-7xl font-serif-premium italic text-primary mb-6"
                >
                    Success!
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-primary/60 max-w-lg text-center leading-relaxed font-medium mb-12"
                >
                    Your event has been mapped into existence. A dedicated concierge will reach out to orchestrate the final details for your celebration within 24 hours.
                </motion.p>

                {hasTotals && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="mb-12 bg-white/60 backdrop-blur-sm border border-primary/10 rounded-3xl px-10 py-6 text-center"
                    >
                        <p className="text-[10px] font-black tracking-[0.3em] text-primary/50 uppercase mb-3">Estimated Total Investment</p>
                        <div className="text-3xl md:text-4xl font-black text-primary font-serif-premium">
                            ₹{Number(totalMin).toLocaleString()} – ₹{Number(totalMax).toLocaleString()}
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-6"
                >
                    <Link
                        to="/user/dashboard"
                        className="px-10 py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-4"
                    >
                        Go to Dashboard <BsArrowRight />
                    </Link>

                    <button
                        onClick={() => navigate(`/user/event-management/${eventId}`)}
                        className="px-10 py-4 bg-white border border-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:border-primary/30 hover:bg-gray-50 transition-all"
                    >
                        Track Event Status
                    </button>
                </motion.div>
            </div>

            {/* Footer Metrics/Info */}
            <div className="relative z-10 border-t border-primary/5 bg-white/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Step 1</span>
                        <h4 className="text-xl font-serif-premium text-primary">Concierge</h4>
                        <p className="text-xs text-primary/60 leading-relaxed">
                            An expert planner is currently reviewing your preferences and will prepare a tailored proposal.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Step 2</span>
                        <h4 className="text-xl font-serif-premium text-primary">Verification</h4>
                        <p className="text-xs text-primary/60 leading-relaxed">
                            We are confirming availability with your selected vendors to ensure seamless execution.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col gap-2 items-start"
                    >
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Support</span>
                        <h4 className="text-xl font-serif-premium text-primary">Need Help?</h4>
                        <button className="w-10 h-10 rounded-full bg-white border border-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                            <BsArrowRight className="-rotate-45" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default StepConfirmation;
