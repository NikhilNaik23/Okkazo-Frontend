import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCalendar, BsClock, BsGeoAlt, BsArrowRight, BsCheck } from 'react-icons/bs';

// Data
import { steps, publicTypes, privateTypes } from '../../../data/orbitalStageData';

// Components
import { DatePicker, TimePicker, ProgressIndicator, MapModal } from './OrbitalStage/index';
import OrbitalTickets from './OrbitalTickets';
import OrbitalPromote from './OrbitalPromote';

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

    const dynamicSteps = formData.listingType === 'Public' ? steps.filter(s => s.id !== 'date').map(s => {
        if (s.id === 'guests') return { id: 'banner', label: 'Event Banner', hint: 'Upload Banner' };
        return s;
    }).concat([
        { id: 'tickets', label: 'Tickets', hint: 'Define value tiers' },
        { id: 'promote', label: 'Promotion', hint: 'Amplify your reach' }
    ]) : steps;

    const currentStep = dynamicSteps[activeIndex];

    const isStepValid = () => {
        switch (currentStep.id) {
            case 'listing': return !!formData.listingType;
            case 'title': return !!formData.title;
            case 'type': return !!formData.type && (formData.type !== 'Other' || formData.customType?.trim());
            case 'date': return !!formData.date && formData.date >= minDateString;
            case 'location': return !!formData.locationValid;
            case 'time':
                if (formData.listingType === 'Public') {
                    return !!formData.publicStartTime && !!formData.publicEndTime && !!formData.salesStartTime;
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
                                    <div className="w-full text-left space-y-4 animate-in fade-in overflow-visible">
                                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-teal-900/10 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4 text-teal-700">
                                                <BsClock size={16} />
                                                <h3 className="font-serif-premium italic text-xl">Event Schedule</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-teal-700 tracking-widest mb-1">Starts</p>
                                                    <input type="datetime-local" min={minDateString + "T00:00"} className="w-full bg-white border border-teal-900/10 p-2 rounded-xl text-teal-900 outline-none focus:border-teal-700 text-xs" value={formData.publicStartTime || ''} onChange={e => handleChange('publicStartTime', e.target.value)} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-teal-700 tracking-widest mb-1">Ends</p>
                                                    <input type="datetime-local" min={formData.publicStartTime || minDateString + "T00:00"} className="w-full bg-white border border-teal-900/10 p-2 rounded-xl text-teal-900 outline-none focus:border-teal-700 text-xs" value={formData.publicEndTime || ''} onChange={e => handleChange('publicEndTime', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-teal-900/10 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4 text-teal-700">
                                                <BsClock size={16} />
                                                <h3 className="font-serif-premium italic text-xl">Ticket Availability</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-teal-700 tracking-widest mb-1">Sales Start</p>
                                                    <input type="datetime-local" className="w-full bg-white border border-teal-900/10 p-2 rounded-xl text-teal-900 outline-none focus:border-teal-700 text-xs" value={formData.salesStartTime || ''} onChange={e => handleChange('salesStartTime', e.target.value)} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-teal-700 tracking-widest mb-1">Sales End (Optional)</p>
                                                    <input type="datetime-local" min={formData.salesStartTime || ""} className="w-full bg-white border border-teal-900/10 p-2 rounded-xl text-teal-900 outline-none focus:border-teal-700 text-xs" value={formData.salesEndTime || ''} onChange={e => handleChange('salesEndTime', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[9px] mt-2 font-bold text-teal-600/50 tracking-widest uppercase flex items-center gap-2">
                                            <BsClock size={12} /> Scheduled in local timezone
                                        </p>
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
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setFormData(prev => ({ ...prev, banner: reader.result }));
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
                                    <p className="mt-4 text-[10px] font-bold text-teal-600/30 tracking-widest uppercase text-center">Required for public listings.</p>
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
