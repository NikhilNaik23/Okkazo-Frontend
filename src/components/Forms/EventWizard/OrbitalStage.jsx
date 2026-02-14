import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCalendar, BsClock, BsGeoAlt, BsArrowRight, BsChevronDown, BsCheck, BsBookmark } from 'react-icons/bs';
import toast from 'react-hot-toast';
import LocationPicker from './../../Map/LocationPicker';

const SpinnerStage = ({ formData, handleChange, setFormData, minDateString, onSaveDraft }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMapOpen, setIsMapOpen] = useState(false);

    useEffect(() => {
        if (isMapOpen) {
            document.body.classList.add('map-ui-open');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('map-ui-open');
            document.body.style.overflow = '';
        }
        return () => {
            document.body.classList.remove('map-ui-open');
            document.body.style.overflow = '';
        };
    }, [isMapOpen]);

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

    // Date Picker Logic
    const [currentMonth, setCurrentMonth] = useState(new Date(formData.date || new Date()));
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysCount = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];

        // Dates for range check
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Red color range: Today + 6 to Today + 21
        const warningStart = new Date(today);
        warningStart.setDate(today.getDate() + 6);
        const warningEnd = new Date(today);
        warningEnd.setDate(today.getDate() + 21);

        // Padding for the start of the month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        for (let day = 1; day <= daysCount; day++) {
            const dateObj = new Date(year, month, day);
            dateObj.setHours(0, 0, 0, 0); // Normalize time

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = formData.date === dateStr;
            const isPast = dateStr < minDateString; // minDateString is today+6 from parent

            // High price check
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
                        setIsDatePickerOpen(false);
                        setTimeout(handleNext, 600);
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

    const publicTypes = ["Concert", "Festival", "Exhibition", "Workshop", "Seminar", "Other"];
    const privateTypes = ["Birthday", "Wedding", "Anniversary", "Party", "Dinner", "Other"];
    const eventTypes = formData.listingType === 'Public' ? publicTypes : privateTypes;

    const steps = [
        { id: 'listing', label: 'Event Category', hint: 'Public or Private Category?' },
        { id: 'title', label: 'Event Title', hint: 'Set the Event Title' },
        { id: 'type', label: 'Event Type', hint: 'Nature of Event' },

        { id: 'date', label: 'Event Date', hint: 'Select Event Date' },
        { id: 'location', label: 'Event Location', hint: 'Set Venue Location' },
        { id: 'time', label: 'Event Time', hint: 'Set Start Time' }
    ];

    const currentStep = steps[activeIndex];

    const isStepValid = () => {
        switch (currentStep.id) {
            case 'listing': return !!formData.listingType;
            case 'title': return !!formData.title;
            case 'type': return !!formData.type && (formData.type !== 'Other' || formData.customType?.trim());
            case 'date': return !!formData.date && formData.date >= minDateString;
            case 'location': return !!formData.locationValid;
            case 'time': return !!formData.startTime;
            default: return false;
        }
    };

    const handleNext = () => {
        if (isStepValid() && activeIndex < steps.length - 1) {
            setActiveIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
        }
    };

    return (
        <div className="relative w-full h-screen min-h-[600px] flex items-center overflow-hidden animate-fade-in text-teal-900">
            {/* SPINNER SECTION (LEFT) - STATIC BACKGROUND */}
            <div className="spinner-semicircle" style={{
                width: '120vh',
                height: '120vh',
                left: '-60vh'
            }}>
                {/* Orbital Paths within spinner */}
                <div className="orbital-path opacity-10" style={{ width: '150vh', height: '150vh' }} />
                <div className="orbital-path opacity-10" style={{ width: '120vh', height: '120vh' }} />

                {/* Step Labels along the curve - NO OVERLAP, FIXED DOT POSITION */}
                <motion.div
                    className="absolute top-1/2 w-1"
                    style={{
                        right: '15vh',
                        transformOrigin: '-45vh center'
                    }}
                    animate={{ rotate: activeIndex * -15 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transformOrigin: '-45vh center',
                                transform: `translateY(-50%) rotate(${idx * 15}deg)`,
                            }}
                            className="flex items-center gap-6 text-right justify-end whitespace-nowrap"
                        >
                            <motion.div
                                animate={{
                                    opacity: activeIndex === idx ? 1 : 0.15,
                                    scale: activeIndex === idx ? 1.2 : 0.85,
                                    rotate: -(idx * 15) + (activeIndex * 15) // Perfect compensation
                                }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center gap-6"
                            >
                                <span className="text-[1.2vh] font-black tracking-[0.3em] uppercase">{step.label}</span>
                                <div className={`w-[1.2vh] h-[1.2vh] rounded-full transition-all duration-500 ${activeIndex === idx ? 'bg-teal-700 shadow-[0_0_20px_#0f766e]' : 'bg-teal-900/20'}`} />
                            </motion.div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* FIXED PROGRESS INDICATOR (Detached from rotation) */}
            <div className="absolute left-[4vh] top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="flex flex-col items-center justify-center w-[16vh] h-[16vh] bg-white shadow-[0_20px_60px_rgba(9,99,126,0.1)] rounded-full mb-6">
                    <p className="text-[9px] tracking-[0.2em] font-bold opacity-30 uppercase mb-1">Resonance</p>
                    <h2 className="text-4xl font-serif-premium italic text-teal-900 leading-none">
                        {Math.round(((activeIndex + 1) / steps.length) * 100)}%
                    </h2>
                    <div className="w-6 h-[1px] bg-teal-900/10 my-3" />
                    <p className="text-[8px] tracking-widest font-bold uppercase opacity-40">Alignment</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#f0fdfa' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
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
                    }}
                    className="flex items-center gap-2 group px-6 py-3 rounded-full border border-teal-900/5 bg-white/50 backdrop-blur-md shadow-sm transition-all"
                >

                    <BsBookmark className="text-teal-700 group-hover:fill-teal-700" size={12} />
                    <span className="text-[9px] font-black tracking-[0.2em] uppercase text-teal-900/60 group-hover:text-teal-900">Save Draft</span>
                </motion.button>
            </div>

            {/* PORTAL CONTAINER (STABLE LAYOUT) */}
            <div className="portal-container flex flex-col h-[70vh] justify-center z-30 pointer-events-none" style={{ position: 'absolute', left: '45vw', top: '50%', transform: 'translateY(-50%)', width: '45vw', minWidth: '400px' }}>
                <div className="flex-1 overflow-visible flex flex-col justify-center pointer-events-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <p className="text-xs tracking-[0.4em] font-black text-teal-600/40 uppercase mb-6">{currentStep.hint}</p>

                            {/* INPUT TYPES */}

                            {/* 1. Listing Type */}
                            {currentStep.id === 'listing' && (
                                <div className="flex gap-8">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, listingType: 'Public', type: 'Concert' }));
                                            setTimeout(handleNext, 600);
                                        }}
                                        className={`group relative w-[28vh] h-[38vh] min-w-[200px] min-h-[280px] rounded-[40px] overflow-hidden transition-all ${formData.listingType === 'Public' ? 'ring-2 ring-teal-700 ring-offset-4 shadow-xl' : 'opacity-40 grayscale hover:opacity-100'}`}
                                    >
                                        <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop" className="w-full h-full object-cover" alt="Public" />
                                        <div className="absolute inset-0 bg-teal-900/40 hidden group-hover:block" />
                                        <h3 className="absolute bottom-6 left-6 text-2xl font-serif-premium italic text-white">Public</h3>
                                        {formData.listingType === 'Public' && <BsCheck className="absolute top-4 right-4 text-2xl text-white bg-teal-700 rounded-full" />}
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, listingType: 'Private', type: 'Birthday' }));
                                            setTimeout(handleNext, 600);
                                        }}
                                        className={`group relative w-[28vh] h-[38vh] min-w-[200px] min-h-[280px] rounded-[40px] overflow-hidden transition-all ${formData.listingType === 'Private' ? 'ring-2 ring-teal-700 ring-offset-4 shadow-xl' : 'opacity-40 grayscale hover:opacity-100'}`}
                                    >
                                        <img src="https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=400&h=600&fit=crop" className="w-full h-full object-cover" alt="Private" />
                                        <div className="absolute inset-0 bg-teal-900/40 hidden group-hover:block" />
                                        <h3 className="absolute bottom-6 left-6 text-2xl font-serif-premium italic text-white">Private</h3>
                                        {formData.listingType === 'Private' && <BsCheck className="absolute top-4 right-4 text-2xl text-white bg-teal-700 rounded-full" />}
                                    </motion.button>
                                </div>
                            )}

                            {/* 2. Event Title */}
                            {currentStep.id === 'title' && (
                                <div className="max-w-md">
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full bg-transparent border-b border-teal-900/10 py-4 text-5xl font-serif-premium text-teal-900 outline-none focus:border-teal-700 transition-all placeholder:opacity-10"
                                        placeholder="The Grand Gala..."
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
                                    />
                                    <p className="mt-4 text-[10px] font-bold text-teal-600/30 tracking-widest uppercase">Set a unique title for your event manifest.</p>
                                </div>
                            )}

                            {/* 3. Event Type */}
                            {currentStep.id === 'type' && (
                                <div className="max-w-md">
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {eventTypes.map(type => (
                                            <motion.button
                                                key={type}
                                                whileHover={{ backgroundColor: 'rgba(9,99,126,0.05)' }}
                                                onClick={() => {
                                                    handleChange('type', type);
                                                    if (type !== 'Other') setTimeout(handleNext, 400);
                                                }}
                                                className={`px-6 py-4 rounded-2xl border transition-all text-left ${formData.type === type ? 'border-teal-700 bg-teal-50' : 'border-teal-900/5'}`}
                                            >
                                                <span className="text-lg font-serif-premium text-teal-900">{type}</span>
                                            </motion.button>
                                        ))}
                                    </div>

                                    <AnimatePresence>
                                        {formData.type === 'Other' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="relative"
                                            >
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    className="w-full bg-transparent border-b border-teal-700 py-3 text-2xl font-serif-premium text-teal-900 outline-none placeholder:opacity-20"
                                                    placeholder="Specify event spirit..."
                                                    value={formData.customType || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, customType: e.target.value }))}
                                                    onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
                                                />
                                                <button
                                                    onClick={handleNext}
                                                    disabled={!formData.customType?.trim()}
                                                    className="absolute right-0 bottom-3 text-teal-700 disabled:opacity-30"
                                                >
                                                    <BsCheck size={28} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* 4. Date */}
                            {currentStep.id === 'date' && (
                                <div className="relative">
                                    <div
                                        className="cursor-pointer group flex items-baseline gap-8"
                                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                    >
                                        <p className="text-6xl font-serif-premium text-teal-900 group-hover:text-teal-700 transition-colors">
                                            {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'MM/DD/YYYY'}
                                        </p>
                                        <BsCalendar className="text-4xl text-teal-900/20 group-hover:text-teal-700 transition-colors" />
                                    </div>

                                    <AnimatePresence>
                                        {isDatePickerOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                                className="absolute top-full left-0 mt-4 z-[100] bg-white rounded-[25px] shadow-2xl border border-teal-900/5 p-4 w-[280px]"
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
                                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
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
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* 5. Location */}
                            {currentStep.id === 'location' && (
                                <div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setIsMapOpen(true)}
                                        className="w-full h-[15vh] rounded-[30px] border border-teal-900/10 bg-white/40 backdrop-blur-md px-8 flex items-center justify-between group hover:border-teal-700 transition-all"
                                    >
                                        <div className="flex items-center gap-6">
                                            <BsGeoAlt className="text-2xl text-teal-900/20 group-hover:text-teal-700 transition-colors" size={24} />
                                            <div className="text-left py-2 max-w-[300px]">
                                                {formData.locationValid ? (
                                                    <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                                                        <h3 className="text-3xl font-serif-premium italic text-teal-900 leading-tight mb-1 truncate">
                                                            {formData.location ? formData.location.split(',')[0] : 'Venue'}
                                                        </h3>
                                                        <p className="text-[11px] font-bold tracking-widest uppercase text-teal-900/60 flex items-center gap-1">
                                                            <span>{Number(formData.lat || 0).toFixed(4)}° N</span>
                                                            <span className="opacity-30 mx-1">|</span>
                                                            <span>{Number(formData.lng || 0).toFixed(4)}° E</span>
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-[9px] font-black tracking-widest uppercase opacity-30">Venue Location</p>
                                                        <h3 className="text-2xl font-serif-premium italic text-teal-900">Set Venue Location</h3>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <BsArrowRight className="text-teal-900/20 group-hover:translate-x-1" />
                                    </motion.button>
                                    {formData.locationValid && (
                                        <button onClick={handleNext} className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-teal-900/40 hover:text-teal-900 transition-colors">Lock Coordinates</button>
                                    )}
                                </div>
                            )}

                            {/* 6. Time */}
                            {currentStep.id === 'time' && (
                                <div className="relative">
                                    <div
                                        className="cursor-pointer group flex items-baseline gap-8"
                                        onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                                    >
                                        <p className="text-6xl font-serif-premium text-teal-900 group-hover:text-teal-700 transition-colors">
                                            {formData.startTime ? (
                                                <>
                                                    {parseInt(formData.startTime.split(':')[0]) % 12 || 12}:{formData.startTime.split(':')[1]}
                                                    <span className="text-3xl ml-3 font-sans font-bold opacity-10">
                                                        {parseInt(formData.startTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                                    </span>
                                                </>
                                            ) : (
                                                "00:00"
                                            )}
                                        </p>
                                        <BsClock className="text-4xl text-teal-900/20 group-hover:text-teal-700 transition-colors" />
                                    </div>

                                    <AnimatePresence>
                                        {isTimePickerOpen && (
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
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
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
                                                            {['00', '15', '30', '45'].map(m => {
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
                                                    onClick={() => setIsTimePickerOpen(false)}
                                                    className="w-full py-3.5 bg-teal-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-800 transition-colors shadow-xl shadow-teal-900/10"
                                                >
                                                    Secure Time
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {formData.startTime && !isTimePickerOpen && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex items-center gap-4 text-teal-700">
                                            <BsCheck className="text-2xl" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Event Time Secured</span>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* FIXED NAVIGATION (Stable outside AnimatePresence) */}
                <div className="flex items-center gap-8 mt-12 py-6 border-t border-teal-900/5">
                    <button
                        onClick={handleBack}
                        disabled={activeIndex === 0}
                        className="flex items-center gap-3 text-[10px] font-black tracking-widest uppercase text-teal-900/20 hover:text-teal-900 disabled:opacity-0 transition-all"
                    >
                        <BsArrowRight className="rotate-180" /> Prev
                    </button>
                    {isStepValid() && activeIndex < steps.length - 1 && (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-3 text-[10px] font-black tracking-widest uppercase text-teal-900 hover:text-teal-700 transition-all"
                        >
                            Spin Next <BsArrowRight />
                        </button>
                    )}
                </div>
            </div>

            {/* MAP MODAL (REUSED) */}
            <AnimatePresence>
                {isMapOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#eff6f7] flex items-center justify-center p-0 md:p-12"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-none md:rounded-[60px] shadow-2xl w-full max-w-6xl h-full md:h-[85vh] overflow-hidden relative flex flex-col"
                        >
                            <div className="p-10 border-b flex flex-col md:flex-row gap-8 justify-between items-start md:items-center relative z-20 bg-white">
                                <div className="flex items-center gap-12 flex-1 w-full text-center">
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest uppercase text-teal-600/40 mb-1">Venue Pin</p>
                                        <h2 className="text-4xl font-serif-premium italic text-teal-900 whitespace-nowrap">Map the Venue</h2>
                                    </div>
                                    <div id="map-search-portal" className="flex-1 max-w-md hidden md:block" />
                                </div>
                                <button onClick={() => setIsMapOpen(false)} className="absolute top-10 right-10 w-14 h-14 rounded-full border flex items-center justify-center text-teal-900 hover:bg-teal-50 transition-colors">
                                    <BsArrowRight className="rotate-45" size={24} />
                                </button>
                            </div>
                            <div className="flex-1 relative bg-gray-50 overflow-visible">
                                <LocationPicker
                                    className="absolute inset-0 w-full h-full"
                                    onSelect={(data) => {
                                        handleChange('location', data.address);
                                        handleChange('lat', data.lat);
                                        handleChange('lng', data.lng);
                                        handleChange('locationValid', true);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpinnerStage;
