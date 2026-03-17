import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCalendar, BsClock, BsGeoAlt, BsArrowRight, BsCheck } from 'react-icons/bs';

// Data
import { steps, publicTypes, privateTypes } from '../../../data/orbitalStageData';

// Components
import { DatePicker, TimePicker, ProgressIndicator, MapModal } from './OrbitalStage/index';
import OrbitalTickets from './OrbitalTickets';
import OrbitalPromote from './OrbitalPromote';
import CustomDatePicker from '../PromoteEvent/Wizard/CustomDatePicker';

const MAX_BANNER_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_BANNER_FILE_SIZE_LABEL = '50MB';

const SpinnerStage = ({ formData, handleChange, setFormData, minDateString, onSaveDraft, handleAddTicket, handleRemoveTicket, handleTicketChange }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(formData.date || new Date()));

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

    const eventTypes = formData.listingType === 'Public' ? publicTypes : privateTypes;

    const dynamicSteps = formData.listingType === 'Public' ? steps.filter(s => s.id !== 'date').flatMap(s => {
        if (s.id === 'title') return [s, { id: 'description', label: 'Description', hint: 'Tell your story' }];
        if (s.id === 'guests') return [{ id: 'banner', label: 'Event Banner', hint: 'Upload Banner' }];
        return [s];
    }).concat([
        { id: 'tickets', label: 'Tickets', hint: 'Define value tiers' },
        { id: 'promote', label: 'Promotion', hint: 'Amplify your reach' }
    ]) : steps;

    const currentStep = dynamicSteps[activeIndex];

    const isStepValid = () => {
        switch (currentStep.id) {
            case 'listing': return !!formData.listingType;
            case 'title': return !!formData.title;
            case 'description': return !!formData.eventDescription?.trim();
            case 'type': return !!formData.type && (formData.type !== 'Other' || formData.customType?.trim());
            case 'date': return !!formData.date && formData.date >= minDateString;
            case 'location': return !!formData.locationValid;
            case 'time':
                if (formData.listingType === 'Public') {
                    const hasTimes = !!formData.publicStartTime && !!formData.publicEndTime && !!formData.salesStartTime;
                    if (!hasTimes) return false;
                    const start = new Date(formData.publicStartTime);
                    const end = new Date(formData.publicEndTime);
                    const salesStart = new Date(formData.salesStartTime);
                    const salesEnd = !!formData.salesEndTime ? new Date(formData.salesEndTime) : null;

                    return end > start && (salesEnd && salesEnd > salesStart && salesEnd < start) && salesStart < start;
                }
                return !!formData.startTime;
            case 'guests': return !!formData.guests && formData.guests > 0;
            case 'banner': return !!formData.banner;
            case 'tickets':
                const validCapacity = formData.totalCapacity > 0;
                const totalAssigned = formData.tickets.reduce((a, t) => a + (parseInt(t.quantity) || 0), 0);
                return validCapacity && totalAssigned === parseInt(formData.totalCapacity);
            case 'promote': return true; // Optional toggles
            default: return false;
        }
    };

    const handleNext = () => {
        if (isStepValid() && activeIndex < dynamicSteps.length - 1) {
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
            <div className="spinner-semicircle" style={{ width: '120vh', height: '120vh', left: '-60vh' }}>
                <div className="orbital-path opacity-10" style={{ width: '150vh', height: '150vh' }} />
                <div className="orbital-path opacity-10" style={{ width: '120vh', height: '120vh' }} />

                <motion.div
                    className="absolute top-1/2 w-1"
                    style={{ right: '2vh', transformOrigin: '-58vh center' }}
                    animate={{ rotate: activeIndex * -10 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {dynamicSteps.map((step, idx) => (
                        <div
                            key={step.id}
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transformOrigin: 'calc(100% - 58vh) center',
                                transform: `translateY(-50%) rotate(${idx * 10}deg)`,
                            }}
                            className="flex items-center text-right justify-end whitespace-nowrap pr-8"
                        >
                            <motion.div
                                animate={{
                                    opacity: activeIndex === idx ? 1 : 0.15,
                                    scale: activeIndex === idx ? 1.2 : 0.85,
                                    rotate: -(idx * 10) + (activeIndex * 10)
                                }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center gap-4"
                            >
                                <span className="text-[1.2vh] font-black tracking-[0.3em] uppercase">{step.label}</span>
                                <div className={`w-[1.2vh] h-[1.2vh] rounded-full transition-all duration-500 ${activeIndex === idx ? 'bg-teal-700 shadow-[0_0_20px_#0f766e]' : 'bg-teal-900/20'}`} />
                            </motion.div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Progress Indicator */}
            <ProgressIndicator activeIndex={activeIndex} totalSteps={dynamicSteps.length} onSaveDraft={onSaveDraft} />

            {/* PORTAL CONTAINER */}
            <div className="portal-container flex flex-col justify-center z-30 pointer-events-none" style={{ position: 'absolute', left: '42vw', top: '50%', transform: 'translateY(-50%)', width: '45vw', minWidth: '400px', height: '600px' }}>
                <div className="flex-1 overflow-visible flex flex-col justify-center pointer-events-auto h-full relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <p className="text-xs tracking-[0.4em] font-black text-teal-600/40 uppercase mb-6">{currentStep.hint}</p>

                            {/* 1. Listing Type */}
                            {currentStep.id === 'listing' && (
                                <div className="flex gap-8">
                                    {['Public', 'Private'].map((type, index) => (
                                        <motion.button
                                            key={type}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, listingType: type, type: type === 'Public' ? 'Concert' : 'Birthday' }));
                                                setTimeout(handleNext, 600);
                                            }}
                                            className={`group relative w-[28vh] h-[38vh] min-w-[200px] min-h-[280px] rounded-[40px] overflow-hidden transition-all ${formData.listingType === type ? 'ring-2 ring-teal-700 ring-offset-4 shadow-xl' : 'opacity-40 grayscale hover:opacity-100'}`}
                                        >
                                            <img
                                                src={index === 0 ? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop" : "https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=400&h=600&fit=crop"}
                                                className="w-full h-full object-cover"
                                                alt={type}
                                            />
                                            <div className="absolute inset-0 bg-teal-900/40 hidden group-hover:block" />
                                            <h3 className="absolute bottom-6 left-6 text-2xl font-serif-premium italic text-white">{type}</h3>
                                            {formData.listingType === type && <BsCheck className="absolute top-4 right-4 text-2xl text-white bg-teal-700 rounded-full" />}
                                        </motion.button>
                                    ))}
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

                            {/* 2b. Event Description (Public Only) */}
                            {currentStep.id === 'description' && (
                                <div className="max-w-md">
                                    <textarea
                                        autoFocus
                                        maxLength={1000}
                                        className="w-full bg-transparent border-b border-teal-900/10 py-4 text-2xl font-serif-premium text-teal-900 outline-none focus:border-teal-700 transition-all placeholder:opacity-10 resize-none h-32"
                                        placeholder="Describe the spirit of your event..."
                                        value={formData.eventDescription || ''}
                                        onChange={(e) => handleChange('eventDescription', e.target.value)}
                                    />
                                    <div className="flex justify-between mt-4">
                                        <p className="text-[10px] font-bold text-teal-600/30 tracking-widest uppercase">A brief overview for your public audience.</p>
                                        <p className="text-[10px] font-bold text-teal-600/30 tracking-widest uppercase">
                                            {formData.eventDescription?.length || 0} / 1000
                                        </p>
                                    </div>
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
                                <div className="relative w-max">
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
                                        <DatePicker
                                            formData={formData}
                                            handleChange={handleChange}
                                            minDateString={minDateString}
                                            currentMonth={currentMonth}
                                            setCurrentMonth={setCurrentMonth}
                                            isOpen={isDatePickerOpen}
                                            setIsOpen={setIsDatePickerOpen}
                                            onDateSelected={handleNext}
                                        />
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
                                formData.listingType === 'Public' ? (
                                    <div className="w-full text-left space-y-6 animate-in fade-in overflow-visible pt-4 pb-20 relative z-0">
                                        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-teal-900/10 shadow-lg relative z-10 focus-within:z-40 transition-all">
                                            <div className="flex items-center gap-3 mb-6 text-teal-700">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                                                    <BsClock size={20} />
                                                </div>
                                                <h3 className="font-serif-premium italic text-2xl">Event Schedule</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase text-teal-700/60 tracking-[0.2em] ml-1">Starts</p>
                                                    <CustomDatePicker
                                                        selected={formData.publicStartTime ? new Date(formData.publicStartTime) : null}
                                                        onChange={(date) => handleChange('publicStartTime', date)}
                                                        minDate={(() => {
                                                            const d = new Date();
                                                            d.setDate(d.getDate() + 6);
                                                            return d;
                                                        })()}
                                                        dayClassName={(date) => {
                                                            const today = new Date();
                                                            today.setHours(0, 0, 0, 0);
                                                            const highDemandStart = new Date(today);
                                                            highDemandStart.setDate(today.getDate() + 6);
                                                            const highDemandEnd = new Date(highDemandStart);
                                                            highDemandEnd.setDate(highDemandStart.getDate() + 15);
                                                            return (date >= highDemandStart && date <= highDemandEnd) ? "react-datepicker__day--high-demand" : undefined;
                                                        }}
                                                        placeholderText="Event Start..."
                                                        className="!p-4 !rounded-xl text-xs"
                                                        placement="bottom-start"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase text-teal-700/60 tracking-[0.2em] ml-1">Ends</p>
                                                    <CustomDatePicker
                                                        selected={formData.publicEndTime ? new Date(formData.publicEndTime) : null}
                                                        onChange={(date) => handleChange('publicEndTime', date)}
                                                        minDate={formData.publicStartTime ? new Date(formData.publicStartTime) : new Date()}
                                                        placeholderText="Event End..."
                                                        className="!p-4 !rounded-xl text-xs"
                                                        placement="bottom-start"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-teal-900/10 shadow-lg relative transition-all focus-within:z-50 focus-within:ring-2 focus-within:ring-teal-500/20 mb-12">
                                            <div className="flex items-center gap-3 mb-6 text-teal-700">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                                                    <BsClock size={20} />
                                                </div>
                                                <h3 className="font-serif-premium italic text-2xl">Ticket Availability</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase text-teal-700/60 tracking-[0.2em] ml-1">Sales Start</p>
                                                    <CustomDatePicker
                                                        selected={formData.salesStartTime ? new Date(formData.salesStartTime) : null}
                                                        onChange={(date) => handleChange('salesStartTime', date)}
                                                        minDate={(() => {
                                                            const d = new Date();
                                                            d.setDate(d.getDate() + 1);
                                                            d.setHours(0, 0, 0, 0);
                                                            return d;
                                                        })()}
                                                        placeholderText="Sales Start..."
                                                        className="!p-4 !rounded-xl text-xs"
                                                        placement="top-start"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase text-teal-700/60 tracking-[0.2em] ml-1">Sales End</p>
                                                    <CustomDatePicker
                                                        selected={formData.salesEndTime ? new Date(formData.salesEndTime) : null}
                                                        onChange={(date) => handleChange('salesEndTime', date)}
                                                        minDate={formData.salesStartTime ? new Date(formData.salesStartTime) : new Date()}
                                                        maxDate={formData.publicStartTime ? new Date(formData.publicStartTime) : undefined}
                                                        placeholderText="Sales End..."
                                                        className="!p-4 !rounded-xl text-xs"
                                                        placement="top-start"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[#088395]/5 p-4 rounded-2xl flex gap-3 items-start border border-[#088395]/10 relative z-0 max-w-md">
                                            <BsClock className="text-[#088395] mt-0.5 shrink-0" size={14} />
                                            <p className="text-[#09637E]/70 text-[9px] font-bold uppercase tracking-wider leading-relaxed">
                                                Scheduled in your local timezone. Attendees will see the time converted to their local time automatically.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-max">
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
                                            <TimePicker
                                                formData={formData}
                                                handleChange={handleChange}
                                                isOpen={isTimePickerOpen}
                                                setIsOpen={setIsTimePickerOpen}
                                            />
                                        </AnimatePresence>

                                        {formData.startTime && !isTimePickerOpen && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex items-center gap-4 text-teal-700">
                                                <BsCheck className="text-2xl" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Event Time Secured</span>
                                            </motion.div>
                                        )}
                                    </div>
                                )
                            )}

                            {/* 7. Guests (Private) OR Banner (Public) */}
                            {currentStep.id === 'guests' && (
                                <div className="max-w-md">
                                    <input
                                        autoFocus
                                        type="number"
                                        min="1"
                                        className="w-full bg-transparent border-b border-teal-900/10 py-4 text-5xl font-serif-premium text-teal-900 outline-none focus:border-teal-700 transition-all placeholder:opacity-10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        placeholder="100"
                                        value={formData.guests || ''}
                                        onChange={(e) => handleChange('guests', e.target.value)}
                                        onKeyDown={(e) => {
                                            // Prevent non-numeric keys like e, +, -
                                            if (['e', 'E', '+', '-'].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                            // Allow Navigation
                                            if (e.key === 'Enter' && isStepValid()) handleNext();
                                        }}
                                    />
                                    <p className="mt-4 text-[10px] font-bold text-teal-600/30 tracking-widest uppercase">Expected number of attendees.</p>
                                </div>
                            )}

                            {currentStep.id === 'banner' && (
                                <div className="max-w-md w-full animate-in fade-in">
                                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-teal-900/10 shadow-sm relative overflow-hidden group">
                                        <label className="block text-[9px] font-black uppercase text-teal-700 tracking-widest mb-3">Event Banner</label>
                                        <input
                                            type="file"
                                            id="banner-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > MAX_BANNER_FILE_SIZE_BYTES) {
                                                        window.alert(`File size exceeds the ${MAX_BANNER_FILE_SIZE_LABEL} limit.`);
                                                        e.target.value = '';
                                                        return;
                                                    }

                                                    // Store the raw File for multipart upload + data URL for preview
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setFormData(prev => ({
                                                        ...prev,
                                                        banner: reader.result,   // data URL → preview only
                                                        bannerFile: file,        // raw File → sent to backend
                                                    }));
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <div
                                            onClick={() => document.getElementById('banner-upload').click()}
                                            className={`w-full h-48 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${formData.banner ? 'border-teal-700 p-1 bg-white/40' : 'border-teal-900/20 hover:border-teal-700 bg-white/40'}`}
                                        >
                                            {formData.banner ? (
                                                <div className="relative w-full h-full group/img">
                                                    <img src={formData.banner} className="w-full h-full object-cover rounded-[8px]" alt="Banner" />
                                                    <div className="absolute inset-0 bg-teal-900/50 rounded-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                        <span className="text-white text-xs font-bold uppercase tracking-widest">Change Banner</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-teal-900/40 group-hover:text-teal-700 transition-colors">
                                                    <div className="w-12 h-12 rounded-full bg-teal-900/5 flex items-center justify-center mx-auto mb-2">
                                                        <span className="text-3xl font-bold">+</span>
                                                    </div>
                                                    <p className="font-serif-premium italic text-xl">Upload Display Art</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[10px] font-bold text-teal-600/30 tracking-widest uppercase text-center">Required for public listings. Max file size: {MAX_BANNER_FILE_SIZE_LABEL}.</p>
                                </div>
                            )}

                            {/* 8. Tickets (Public Only) */}
                            {currentStep.id === 'tickets' && (
                                <OrbitalTickets formData={formData} setFormData={setFormData} onAdd={handleAddTicket} onRemove={handleRemoveTicket} onChange={handleTicketChange} />
                            )}

                            {/* 9. Promote (Public Only) */}
                            {currentStep.id === 'promote' && (
                                <OrbitalPromote formData={formData} setFormData={setFormData} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="absolute bottom-0 left-0 w-full flex items-center gap-8 py-6 border-t border-teal-900/5 bg-transparent pointer-events-auto">
                    <button
                        onClick={handleBack}
                        disabled={activeIndex === 0}
                        className="flex items-center gap-3 text-[10px] font-black tracking-widest uppercase text-teal-900/20 hover:text-teal-900 disabled:opacity-0 transition-all"
                    >
                        <BsArrowRight className="rotate-180" /> Prev
                    </button>
                    {isStepValid() && activeIndex < dynamicSteps.length - 1 && (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-3 text-[10px] font-black tracking-widest uppercase text-teal-900 hover:text-teal-700 transition-all"
                        >
                            Spin Next <BsArrowRight />
                        </button>
                    )}
                </div>
            </div>

            {/* Map Modal */}
            <AnimatePresence>
                {isMapOpen && (
                    <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} handleChange={handleChange} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpinnerStage;
