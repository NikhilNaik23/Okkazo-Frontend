import React from 'react';
import { motion } from 'framer-motion';
import { BsCheck } from 'react-icons/bs';

const PaymentSuccess = ({ displayTransactionId, countdown, onNext }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center max-w-md mx-auto"
        >
            <div className="w-32 h-32 relative mb-8">
                <motion.div
                    className="absolute inset-0 bg-green-50 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />
                <motion.div
                    className="absolute inset-0 border border-green-200 rounded-full"
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-green-600">
                    <BsCheck size={64} />
                </div>
            </div>

            <h2 className="text-4xl font-serif-premium italic text-[#09637E] mb-4">Payment Confirmed</h2>
            <p className="text-gray-400 font-medium leading-relaxed mb-4">
                Thank you! Your reservation fee has been successfully processed. You may now proceed to curate your team.
            </p>

            <div className="mb-8">
                <span className="text-xs font-bold text-[#09637E] animate-pulse">
                    Redirecting in {countdown}...
                </span>
            </div>

            <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
                <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Transaction ID</span>
                    <span className="text-xs font-mono font-bold text-gray-700">TXN-{displayTransactionId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount Paid</span>
                    <span className="text-xs font-bold text-gray-700">₹15,000</span>
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full bg-[#09637E] text-white rounded-xl py-4 font-black tracking-[0.2em] text-xs uppercase transition-all shadow-lg hover:bg-[#088395] hover:-translate-y-1"
            >
                Continue Now
            </button>
        </motion.div>
    );
};

export default PaymentSuccess;
