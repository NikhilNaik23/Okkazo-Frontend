import React from 'react';
import { motion } from 'framer-motion';
import { BsBookmark } from 'react-icons/bs';
import toast from 'react-hot-toast';

const ProgressIndicator = ({ activeIndex, totalSteps, onSaveDraft }) => {
    const handleSave = () => {
        const success = onSaveDraft ? onSaveDraft() : false;
        if (success) {
            toast.success('Intent Manifested: Progress secured as draft.', {
                style: {
                    borderRadius: '15px',
                    background: '#0b2d49',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '12px 20px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                },
                iconTheme: {
                    primary: '#2dd4bf',
                    secondary: '#fff',
                },
            });
        } else {
            toast.error('Failed to manifest intent. Please try again.');
        }
    };

    return (
        <div className="absolute left-[4vh] top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            <div className="flex flex-col items-center justify-center w-[16vh] h-[16vh] bg-white shadow-[0_20px_60px_rgba(9,99,126,0.1)] rounded-full mb-6">
                <p className="text-[9px] tracking-[0.2em] font-bold opacity-30 uppercase mb-1">Resonance</p>
                <h2 className="text-4xl font-serif-premium italic text-teal-900 leading-none">
                    {Math.round(((activeIndex + 1) / totalSteps) * 100)}%
                </h2>
                <div className="w-6 h-[1px] bg-teal-900/10 my-3" />
                <p className="text-[8px] tracking-widest font-bold uppercase opacity-40">Alignment</p>
            </div>

            <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#f0fdfa' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex items-center gap-2 group px-6 py-3 rounded-full border border-teal-900/5 bg-white/50 backdrop-blur-md shadow-sm transition-all"
            >
                <BsBookmark className="text-teal-700 group-hover:fill-teal-700" size={12} />
                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-teal-900/60 group-hover:text-teal-900">Save Draft</span>
            </motion.button>
        </div>
    );
};

export default ProgressIndicator;
