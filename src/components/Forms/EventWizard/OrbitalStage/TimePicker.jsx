import React from 'react';
import { motion } from 'framer-motion';
import { hours, minutes } from '../../../../data/orbitalStageData';

const TimePicker = ({ formData, handleChange, isOpen, setIsOpen }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-full left-0 mt-4 z-[100] bg-white rounded-[32px] shadow-2xl border border-teal-900/5 p-5 flex flex-col gap-4"
        >
            <div className="flex gap-5 items-center">
                {/* Hours */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-black uppercase text-teal-600/30 text-center">Hour</span>
                    <div className="grid grid-cols-4 gap-1.5">
                        {hours.map(h => {
                            const currentH = parseInt(formData.startTime?.split(':')[0] || '12') % 12 || 12;
                            return (
                                <button
                                    key={h}
                                    onClick={() => {
                                        const isPM = (parseInt(formData.startTime?.split(':')[0] || '12')) >= 12;
                                        const newH = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
                                        const m = formData.startTime?.split(':')[1] || '00';
                                        handleChange('startTime', `${String(newH).padStart(2, '0')}:${m}`);
                                    }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${currentH === h ? 'bg-teal-700 text-white shadow-lg' : 'hover:bg-teal-50 text-teal-900'}`}
                                >
                                    {h}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-[1px] h-16 bg-teal-900/5" />

                {/* Minutes */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-black uppercase text-teal-600/30 text-center">Min</span>
                    <div className="flex flex-col gap-1.5">
                        {minutes.map(m => {
                            const currentM = formData.startTime?.split(':')[1] || '00';
                            return (
                                <button
                                    key={m}
                                    onClick={() => {
                                        const h = formData.startTime?.split(':')[0] || '12';
                                        handleChange('startTime', `${h}:${m}`);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentM === m ? 'bg-teal-700 text-white shadow-lg' : 'hover:bg-teal-50 text-teal-900'}`}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-[1px] h-16 bg-teal-900/5" />

                {/* AM/PM */}
                <div className="flex flex-col gap-1.5">
                    {['AM', 'PM'].map(p => {
                        const isPM = (parseInt(formData.startTime?.split(':')[0] || '12')) >= 12;
                        const active = (p === 'PM' && isPM) || (p === 'AM' && !isPM);
                        return (
                            <button
                                key={p}
                                onClick={() => {
                                    const h = parseInt(formData.startTime?.split(':')[0] || '12') % 12;
                                    const m = formData.startTime?.split(':')[1] || '00';
                                    const newH = p === 'PM' ? h + 12 : h;
                                    handleChange('startTime', `${String(newH).padStart(2, '0')}:${m}`);
                                }}
                                className={`px-4 py-2.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${active ? 'bg-teal-900 text-white' : 'hover:bg-teal-50 text-teal-900 opacity-30'}`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>
            </div>
            <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 bg-teal-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-800 transition-colors shadow-xl shadow-teal-900/10"
            >
                Secure Time
            </button>
        </motion.div>
    );
};

export default TimePicker;
