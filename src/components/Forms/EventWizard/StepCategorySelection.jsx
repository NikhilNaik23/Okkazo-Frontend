import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCheck, BsGeoAlt, BsCamera, BsCupStraw, BsPalette, BsMusicNoteBeamed, BsPlus, BsCameraVideo, BsStars, BsEnvelope, BsSpeaker, BsTools, BsShieldCheck, BsCarFront, BsBroadcast, BsCake } from 'react-icons/bs';
import { vendorServiceCategories } from '../../../data/planningWizardData';

const categoryIcons = {
    'Venue': <BsGeoAlt />,
    'Catering & Drinks': <BsCupStraw />,
    'Photography': <BsCamera />,
    'Videography': <BsCameraVideo />,
    'Decor & Styling': <BsPalette />,
    'Entertainment & Artists': <BsMusicNoteBeamed />,
    'Makeup & Grooming': <BsStars />,
    'Invitations & Printing': <BsEnvelope />,
    'Sound & Lighting': <BsSpeaker />,
    'Equipment Rental': <BsTools />,
    'Security & Safety': <BsShieldCheck />,
    'Transportation': <BsCarFront />,
    'Live Streaming & Media': <BsBroadcast />,
    'Cake & Desserts': <BsCake />,
    'Other': <BsPlus />
};


const StepCategorySelection = ({ selectedServices, onToggleService, onUpdateService }) => {
    const [isOthersOpen, setIsOthersOpen] = useState(false);

    // Split categories into visible (5) and hidden (removing 'Other' from the list to avoid duplication)
    const visibleCategories = vendorServiceCategories.slice(0, 7);
    const hiddenCategories = vendorServiceCategories.slice(7).filter(cat => cat !== 'Other');

    // Check if any hidden category is selected
    const selectedHiddenCount = hiddenCategories.filter(cat => selectedServices.includes(cat)).length;

    // Check if 'Other' is selected (no more custom input)
    const isOtherSelected = selectedServices.includes('Other');
    const totalHiddenSelected = selectedHiddenCount + (isOtherSelected ? 1 : 0);

    return (
        <div className="relative w-full h-[85vh] flex items-start animate-fade-in text-teal-900 pt-20">
            {/* AMBIENT BACKGROUND ELEMENTS (Orbital Paths) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 orbital-path opacity-[0.02]" style={{ width: '150vh', height: '150vh' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 orbital-path opacity-[0.04]" style={{ width: '110vh', height: '110vh' }} />
            </div>

            {/* PROGRESS INDICATOR (LEFT) - Matching OrbitalStage */}
            <div className="fixed top-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(9,99,126,0.08)] rounded-full z-40 border border-teal-500/5"
                style={{ left: '4vh', width: '14vh', height: '14vh' }}>
                <p className="text-[8px] tracking-[0.2em] font-bold opacity-30 uppercase mb-1">Curation</p>
                <h2 className="text-4xl font-serif-premium italic text-teal-900 leading-none">
                    {selectedServices.length}
                </h2>
                <div className="w-6 h-[1px] bg-teal-900/10 my-3" />
                <p className="text-[7px] tracking-widest font-bold uppercase opacity-40">Elements</p>
            </div>

            {/* CONTENT AREA - CENTERED AND SCROLLABLE */}
            <div className="relative z-10 w-full max-w-4xl mx-auto h-full flex flex-col px-6">
                <div className="mb-10 text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black tracking-[0.4em] uppercase text-teal-600/40 mb-3"
                    >
                        Component Selection
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-serif-premium italic text-teal-900 leading-tight"
                    >
                        Define the Essence <br /> of Your Gathering
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-teal-900/40 mt-4 font-medium mx-auto max-w-md leading-relaxed"
                    >
                        Select the elemental services required to manifest your vision into reality.
                    </motion.p>
                </div>

                {/* SCROLLABLE GRID AREA */}
                <div className="flex-1 overflow-visible pr-2 pb-40">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
                        {visibleCategories.map((category, idx) => {
                            const isSelected = selectedServices.includes(category);

                            return (
                                <motion.button
                                    key={category}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 0.1 * idx + 0.4 }}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onToggleService(category)}
                                    className={`relative rounded-[32px] border transition-all flex flex-col items-center justify-center gap-4 p-4 overflow-hidden group aspect-square
                                        ${isSelected
                                            ? 'border-teal-700/30 bg-white shadow-[0_20px_40px_rgba(15,118,110,0.08)]'
                                            : 'border-teal-900/5 bg-white/20 backdrop-blur-md hover:bg-white hover:border-teal-900/20'}`}
                                >
                                    {/* Selection Glow */}
                                    {isSelected && (
                                        <motion.div
                                            layoutId="glow"
                                            className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none"
                                        />
                                    )}

                                    {/* Icon with Orbital Ring */}
                                    <div className="relative">
                                        <div className={`text-4xl transition-all duration-500 ${isSelected ? 'text-teal-700 scale-110' : 'text-teal-900/10 group-hover:text-teal-900/30'}`}>
                                            {categoryIcons[category] || <BsPlus />}
                                        </div>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ rotate: 0 }}
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                className="absolute -inset-3 border border-teal-700/10 rounded-full border-dashed"
                                            />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="text-center z-10">
                                        <span className={`text-[10px] font-black tracking-[0.2em] uppercase block transition-colors ${isSelected ? 'text-teal-900' : 'text-teal-900/30'}`}>
                                            {category}
                                        </span>
                                    </div>

                                    {/* Checkmark Portal */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="absolute top-5 right-5 w-5 h-5 rounded-full bg-teal-700 flex items-center justify-center text-white text-[10px]"
                                        >
                                            <BsCheck />
                                        </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}

                        {/* OTHERS DROPDOWN BUTTON */}
                        <div className="relative">
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.1 * 5 + 0.4 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsOthersOpen(!isOthersOpen)}
                                className={`relative w-full rounded-[32px] border transition-all flex flex-col items-center justify-center gap-4 p-4 overflow-hidden group aspect-square
                                    ${totalHiddenSelected > 0
                                        ? 'border-teal-700/30 bg-white shadow-[0_20px_40px_rgba(15,118,110,0.08)]'
                                        : 'border-teal-900/5 bg-white/20 backdrop-blur-md hover:bg-white hover:border-teal-900/20'}`}
                            >
                                <div className="relative">
                                    <div className={`text-4xl transition-all duration-500 ${totalHiddenSelected > 0 ? 'text-teal-700 scale-110' : 'text-teal-900/10 group-hover:text-teal-900/30'}`}>
                                        <BsPlus className={`transition-transform duration-300 ${isOthersOpen ? 'rotate-45' : ''}`} />
                                    </div>
                                    {totalHiddenSelected > 0 && !isOthersOpen && (
                                        <motion.div
                                            initial={{ rotate: 0 }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            className="absolute -inset-3 border border-teal-700/10 rounded-full border-dashed"
                                        />
                                    )}
                                </div>
                                <div className="text-center z-10 text-[10px] font-black tracking-[0.2em] uppercase">
                                    <span className={totalHiddenSelected > 0 ? 'text-teal-900' : 'text-teal-900/30'}>
                                        {totalHiddenSelected > 0 ? `Others (${totalHiddenSelected})` : 'Others'}
                                    </span>
                                </div>

                                {totalHiddenSelected > 0 && (
                                    <div className="absolute top-5 right-5 w-5 h-5 rounded-full bg-teal-700 flex items-center justify-center text-white text-[10px]">
                                        <BsCheck />
                                    </div>
                                )}
                            </motion.button>

                            {/* DROPDOWN MENU */}
                            <AnimatePresence>
                                {isOthersOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="fixed bottom-40 right-10 h-[50vh] bg-white/98 backdrop-blur-2xl border border-teal-900/10 rounded-[42px] shadow-2xl z-[120] flex flex-col p-6 min-w-[300px]"
                                        style={{ width: '25vw' }}
                                    >
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <span className="text-[10px] font-black tracking-[0.2em] text-teal-900/40 uppercase">Additional Choices</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setIsOthersOpen(false); }}
                                                className="w-8 h-8 rounded-full bg-teal-900/5 flex items-center justify-center text-teal-900/60 hover:bg-teal-900/10 transition-colors"
                                            >
                                                <BsPlus size={20} className="rotate-45" />
                                            </button>
                                        </div>
                                        <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-teal-900/10 scrollbar-track-transparent hover:scrollbar-thumb-teal-900/20 transition-colors">
                                            {hiddenCategories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => onToggleService(category)}
                                                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all text-left group
                                                    ${selectedServices.includes(category) ? 'bg-teal-700/5 text-teal-900 font-bold' : 'text-teal-900/50 hover:bg-teal-900/5'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">
                                                            {categoryIcons[category] || <BsPlus />}
                                                        </span>
                                                        <span className="text-[10px] tracking-wider uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {category}
                                                        </span>
                                                    </div>
                                                    {selectedServices.includes(category) && <BsCheck className="text-teal-700 text-lg" />}
                                                </button>
                                            ))}

                                            {/* Removed redundant Other button from here */}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepCategorySelection;
