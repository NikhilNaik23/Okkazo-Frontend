import React from 'react';
import { motion } from 'framer-motion';
import { BsArrowRight } from 'react-icons/bs';
import { weekDays } from '../../../../data/orbitalStageData';
import toast from 'react-hot-toast';

const DatePicker = ({
    formData,
    handleChange,
    minDateString,
    currentMonth,
    setCurrentMonth,
    isOpen,
    setIsOpen,
    onDateSelected
}) => {
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysCount = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const warningStart = new Date(today);
        warningStart.setDate(today.getDate() + 6);
        const warningEnd = new Date(today);
        warningEnd.setDate(today.getDate() + 21);

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        for (let day = 1; day <= daysCount; day++) {
            const dateObj = new Date(year, month, day);
            dateObj.setHours(0, 0, 0, 0);

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = formData.date === dateStr;
            const isPast = dateStr < minDateString;
            const isHighPrice = dateObj >= warningStart && dateObj <= warningEnd;

            days.push(
                <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => {
                        handleChange('date', dateStr);
                        if (isHighPrice) {
                            toast('Premium Selection: This high-demand date carries a dynamic pricing adjustment due to booking density.', {
                                icon: '💸',
                                duration: 3000,
                                style: {
                                    borderRadius: '15px',
                                    background: '#134e4a',
                                    color: '#fff',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    padding: '12px 20px',
                                    maxWidth: '300px',
                                },
                            });
                        }
                        setIsOpen(false);
                        if (onDateSelected) setTimeout(onDateSelected, 600);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                        ${isSelected ? 'bg-teal-700 text-white shadow-lg' : isHighPrice ? 'text-red-500 hover:bg-red-50' : 'hover:bg-teal-50 text-teal-900'}
                        ${isPast ? 'opacity-10 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 0, x: 20, scale: 0.95 }}
            className="absolute top-1/2 -translate-y-1/2 left-full ml-8 z-[40] bg-white rounded-[25px] shadow-2xl border border-teal-900/5 p-4 w-[280px]"
        >
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-serif-premium italic text-teal-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <div className="flex gap-1">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 hover:bg-teal-50 rounded-full text-teal-900 transition-colors">
                        <BsArrowRight className="rotate-180" size={14} />
                    </button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 hover:bg-teal-50 rounded-full text-teal-900 transition-colors">
                        <BsArrowRight size={14} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-[9px] font-black uppercase text-teal-600/30 text-center py-1">{d}</div>
                ))}
                {renderCalendar()}
            </div>
            <div className="mt-3 pt-3 border-t border-teal-900/5 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm" />
                    <span className="text-[8px] font-bold text-teal-900/60 uppercase tracking-widest">High Demand</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-900 shadow-sm" />
                    <span className="text-[8px] font-bold text-teal-900/60 uppercase tracking-widest">Normal</span>
                </div>
            </div>
        </motion.div>
    );
};

export default DatePicker;
