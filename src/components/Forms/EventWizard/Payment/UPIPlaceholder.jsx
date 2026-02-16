import React from 'react';
import { motion } from 'framer-motion';
import { BsQrCodeScan } from 'react-icons/bs';

const UPIPlaceholder = () => {
    return (
        <motion.div
            key="upi"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="py-12 flex flex-col items-center justify-center text-center opacity-40 select-none"
        >
            <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
                <BsQrCodeScan size={32} className="text-gray-300" />
            </div>
            <h3 className="font-serif-premium italic text-2xl text-gray-400 mb-2">UPI Integration</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 max-w-[200px]">
                Instant bank transfers using UPI apps will be available shortly.
            </p>
        </motion.div>
    );
};

export default UPIPlaceholder;
