import React from 'react';
import { motion } from 'framer-motion';

const TabButton = ({ id, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`relative px-8 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors z-10 ${activeTab === id ? "text-white" : "text-[#7AB2B2] hover:text-[#09637E]"
            }`}
    >
        {activeTab === id && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-[#09637E] rounded-full shadow-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        {label}
    </button>
);

export default TabButton;
