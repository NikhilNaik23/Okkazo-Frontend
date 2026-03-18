import React from "react";

const StepDetails = ({ formData, setFormData }) => {
    return (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-serif-premium text-6xl md:text-8xl italic text-[#7AB2B2] opacity-10 mb-8 absolute -top-20 -left-20 pointer-events-none select-none">Identity</h1>

            <div className="mb-12 relative">
                <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 01 — Core Identity</p>
                <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Define your moment.</h2>
            </div>

            <div className="space-y-12">
                {/* Event Title */}
                <div className="group relative">
                    <input
                        type="text"
                        placeholder="Name of your creation..."
                        value={formData.eventName}
                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                        className="w-full bg-transparent text-5xl md:text-7xl font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b-2 border-[#09637E]/20 pb-4 focus:border-[#088395] transition-all duration-500"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#088395] transition-all duration-700 group-focus-within:w-full" />
                </div>

                {/* Event Description */}
                <div className="group relative">
                    <textarea
                        rows={3}
                        placeholder="Describe the experience you're creating..."
                        value={formData.eventDescription}
                        onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                        className="w-full bg-transparent text-lg font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b-2 border-[#09637E]/20 pb-2 resize-none focus:border-[#088395] transition-all duration-500"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#088395] transition-all duration-700 group-focus-within:w-full" />
                    <span className={`absolute right-1 bottom-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${(formData.eventDescription?.length || 0) > 1800 ? 'text-red-400' : 'text-[#09637E]/30'}`}>
                        {formData.eventDescription?.length || 0}/2000
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StepDetails;
