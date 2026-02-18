import { BsGlobe } from "react-icons/bs";
import { eventCategories } from '../../../../data/promoteEventData';

const StepDetails = ({ formData, setFormData }) => {
    const isCustom = formData.category && !eventCategories.includes(formData.category);
    const showCustomInput = formData.category === 'Other' || isCustom;

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* Category */}
                    <div>
                        <p className="text-[#09637E] font-bold uppercase tracking-widest text-[10px] mb-6">Discovery Sphere</p>
                        <div className="flex flex-wrap gap-3">
                            {eventCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`px-6 py-3 rounded-full border transition-all duration-500 relative overflow-hidden group/btn ${formData.category === cat
                                        ? 'bg-[#09637E] border-[#09637E] text-[#EBF4F6] shadow-xl scale-105'
                                        : 'border-[#09637E]/10 bg-white text-[#09637E] hover:border-[#088395] hover:text-[#088395] shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    <span className="text-xs font-bold uppercase tracking-wide relative z-10">{cat}</span>
                                    {formData.category === cat && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                    )}
                                </button>
                            ))}

                            {/* Other Option */}
                            <button
                                onClick={() => setFormData({ ...formData, category: 'Other' })}
                                className={`px-6 py-3 rounded-full border transition-all duration-500 relative overflow-hidden group/btn ${showCustomInput
                                    ? 'bg-[#09637E] border-[#09637E] text-[#EBF4F6] shadow-xl scale-105'
                                    : 'border-[#09637E]/10 bg-white text-[#09637E] hover:border-[#088395] hover:text-[#088395] shadow-sm hover:shadow-md'
                                    }`}
                            >
                                <span className="text-xs font-bold uppercase tracking-wide relative z-10">Other</span>
                            </button>
                        </div>

                        {/* Custom Category Input */}
                        {showCustomInput && (
                            <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <p className="text-[#088395] font-black uppercase tracking-[0.2em] text-[9px] mb-3">Specify Your Sphere</p>
                                <input
                                    type="text"
                                    placeholder="Type custom category..."
                                    value={formData.category === 'Other' ? '' : formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full max-w-sm bg-transparent text-2xl font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b border-[#09637E]/20 pb-2 focus:border-[#088395] transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {/* Privacy */}
                    <div>
                        <p className="text-[#09637E] font-bold uppercase tracking-widest text-[10px] mb-6">Privacy</p>
                        <div className="flex bg-[#09637E]/5 p-1 rounded-full border border-[#09637E]/10 inline-flex cursor-not-allowed opacity-80">
                            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#088395] text-[#EBF4F6] shadow-lg">
                                <BsGlobe size={14} />
                                <span className="text-xs font-bold uppercase tracking-wide">Public Event</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepDetails;
