import React from 'react';
import { motion } from 'framer-motion';
import { BsCalendar, BsClock, BsGeoAlt, BsArrowRight, BsChevronDown } from 'react-icons/bs';

const ManifestPreview = ({ formData, onBack, onConfirm }) => {
    const formattedDate = formData.date ? new Date(formData.date).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }) : 'MM/DD/YYYY';

    const formattedTime = formData.startTime ? (() => {
        const [h, m] = formData.startTime.split(':');
        const hour = parseInt(h) % 12 || 12;
        const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
        return { hour: `${hour}:${m}`, ampm };
    })() : { hour: '00:00', ampm: '' };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-[800px] flex items-center pt-40 justify-center overflow-hidden font-sans text-teal-900 bg-[#eff6f7]"
        >
            {/* MAIN CENTRAL ORB */}
            <div className="relative flex items-center justify-center">
                {/* Thin Orbital Ring */}
                <div className="absolute w-[700px] h-[700px] border border-teal-900/5 rounded-full" />

                {/* Main Orb */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-[450px] h-[450px] rounded-full bg-radial-gradient from-[#09637E] to-[#134E4A] shadow-[0_40px_100px_rgba(9,99,126,0.3)] flex flex-col items-center justify-center text-center p-12 z-10"
                    style={{ background: 'radial-gradient(circle at center, #09637E 0%, #064152 100%)' }}
                >
                    <span className="text-[10px] font-black tracking-[0.6em] uppercase text-white/40 mb-4">Event Manifest</span>
                    <h2 className="text-5xl font-serif-premium italic text-white leading-tight mb-8">
                        Manifesting Your {formData.title || formData.type || 'Event'}
                    </h2>
                    <div className="w-12 h-[1px] bg-white/20 mb-8" />
                    <p className="text-[10px] leading-relaxed text-white/40 font-bold uppercase tracking-widest max-w-xs">
                        Orbital Alignment Confirmed
                    </p>
                </motion.div>

                {/* CATEGORY ICONS (Top of Orb) */}
                <div className="absolute -top-[120px] flex gap-16 z-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden ${formData.listingType === 'Public' ? 'ring-2 ring-teal-700 ring-offset-2' : 'opacity-40'}`}>
                            <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop" className="w-full h-full object-cover" alt="Public" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest uppercase text-teal-900 opacity-60">Public</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden ${formData.listingType === 'Private' ? 'ring-2 ring-teal-700 ring-offset-2' : 'opacity-40'}`}>
                            <img src="https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=100&h=100&fit=crop" className="w-full h-full object-cover" alt="Private" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest uppercase text-teal-900 opacity-60">Private</span>
                    </div>
                </div>
            </div>

            {/* LEFT SIDE - EVENT VISION */}
            <div className="absolute left-[15%] top-[35%] flex flex-col items-start max-w-[250px]">
                <p className="text-[9px] tracking-[0.4em] font-black text-teal-900/30 uppercase mb-4">Event Vision</p>
                <div className="flex items-center gap-4">
                    <h3 className="text-4xl font-serif-premium italic text-teal-900 leading-tight">{formData.title || formData.type}</h3>
                    <BsChevronDown className="text-teal-900/20" />
                </div>
            </div>

            {/* BOTTOM LEFT - EVENT VENUE */}
            <div className="absolute left-[15%] bottom-[15%] flex flex-col items-start gap-6">
                <p className="text-[9px] tracking-[0.4em] font-black text-teal-900/30 uppercase">Event Venue</p>
                <div className="relative w-48 h-28 rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-teal-50 flex items-center justify-center">
                    <img
                        src={`https://staticmap.openstreetmap.de/staticmap.php?center=${formData.lat || 0},${formData.lng || 0}&zoom=14&size=400x200&markers=${formData.lat || 0},${formData.lng || 0},ol-marker`}
                        className="w-full h-full object-cover grayscale opacity-50"
                        alt="Location Map"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-teal-900/20">
                        <BsGeoAlt size={32} />
                        <span className="text-[8px] font-black uppercase tracking-widest mt-2">Map Context</span>
                    </div>
                    <div className="absolute inset-0 bg-teal-900/5 mix-blend-overlay" />
                </div>
                <div className="flex flex-col gap-1 max-w-[200px]">
                    <span className="text-[12px] font-black tracking-widest uppercase text-teal-900 leading-tight">
                        {formData.location?.split(',')[0]}
                    </span>
                    <span className="text-[9px] font-bold text-teal-900/50 uppercase tracking-widest leading-relaxed">
                        {formData.location?.split(',').slice(1, 4).join(', ')}
                    </span>
                    {formData.location?.split(',').slice(4).length > 0 && (
                        <span className="text-[8px] font-medium text-teal-900/30 uppercase tracking-widest">
                            {formData.location?.split(',').slice(4).join(', ')}
                        </span>
                    )}
                </div>
            </div>

            {/* TOP RIGHT - EVENT DATE */}
            <div className="absolute right-[15%] top-[30%] flex flex-col items-start">
                <p className="text-[9px] tracking-[0.4em] font-black text-teal-900/30 uppercase mb-4">Event Date</p>
                <div className="flex items-center gap-12">
                    <div>
                        <h3 className="text-4xl font-serif-premium italic text-teal-900">{formattedDate}</h3>
                        <p className="text-[8px] font-bold text-teal-900/30 uppercase tracking-widest mt-1">Scheduled Window / Primary Alignment</p>
                    </div>
                    <BsCalendar className="text-2xl text-teal-900" />
                </div>
            </div>

            {/* BOTTOM RIGHT - EVENT TIMING */}
            <div className="absolute right-[15%] bottom-[25%] flex flex-col items-start">
                <p className="text-[9px] tracking-[0.4em] font-black text-teal-900/30 uppercase mb-4">Event Timing</p>
                <div className="flex items-center gap-12">
                    <h3 className="text-4xl font-serif-premium italic text-teal-900">
                        {formattedTime.hour} <span className="text-2xl font-sans font-bold opacity-30">{formattedTime.ampm}</span>
                    </h3>
                    <BsClock className="text-2xl text-teal-900" />
                </div>
            </div>

            {/* FOOTER - BACK & VENDOR SELECTION */}
            <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                {/* Back Button where Progression was */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-6 group"
                >
                    <div className="w-12 h-12 rounded-full border border-teal-900/10 flex items-center justify-center text-teal-900 group-hover:bg-teal-50 transition-all">
                        <BsArrowRight className="rotate-[225deg]" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-teal-900/40 group-hover:text-teal-900">Back</span>
                </button>

                {/* Confirm Button */}
                <button
                    onClick={onConfirm}
                    className="flex items-center gap-8 group"
                >
                    <span className="text-5xl font-serif-premium italic text-teal-900 group-hover:text-[#09637E] transition-colors whitespace-nowrap">Category Selection</span>
                    <div className="w-[72px] h-[72px] rounded-full bg-[#09637E] flex items-center justify-center text-white shadow-2xl group-hover:bg-[#088395] transition-all group-hover:scale-105 active:scale-95">
                        <BsArrowRight size={32} />
                    </div>
                </button>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-white/40 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-teal-100/30 blur-[100px] pointer-events-none" />
        </motion.div>
    );
};

export default ManifestPreview;
