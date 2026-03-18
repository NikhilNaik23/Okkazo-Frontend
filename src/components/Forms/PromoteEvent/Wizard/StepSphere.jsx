import React, { useState } from "react";
import { BsX } from "react-icons/bs";

const PREDEFINED_INTERESTS = [
    "Tech & Innovation", "Art & Design", "Music & Live Events", "Food & Culinary",
    "Health & Wellness", "Travel & Adventure", "Business & Networking", "Science & Education",
    "Sports & Fitness", "Gaming & E-Sports", "Fashion & Lifestyle", "Literature & Writing",
    "Photography", "Film & Cinema", "Startups & Entrepreneurship", "Social Impact"
];

const StepSphere = ({ formData, setFormData }) => {
    const [showAllInterests, setShowAllInterests] = useState(false);
    const showCustomInput = formData.category === 'Other';

    const toggleInterest = (interest, closeDropdown = false) => {
        const currentInterests = formData.interests || [];
        if (currentInterests.includes(interest)) {
            setFormData({ ...formData, interests: [] });
        } else {
            setFormData({ ...formData, interests: [interest] });
        }
        if (closeDropdown) setShowAllInterests(false);
    };

    const hiddenInterests = PREDEFINED_INTERESTS.slice(5);
    const isOtherSelected = (formData.interests || []).some(i => hiddenInterests.includes(i));

    return (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-serif-premium text-6xl md:text-8xl italic text-[#7AB2B2] opacity-10 mb-8 absolute -top-20 -left-20 pointer-events-none select-none">Sphere</h1>

            <div className="mb-12 relative">
                <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 02 — Event Sphere</p>
                <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Shape your event's identity.</h2>
            </div>

            <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* Discovery Sphere */}
                    <div>
                        <p className="text-[#09637E] font-bold uppercase tracking-widest text-[10px] mb-6">Discovery Sphere</p>
                        <div className="flex flex-wrap gap-3">
                            {["Concert", "Festival", "Exhibition", "Workshop", "Seminar", "Other"].map(cat => (
                                <button
                                    key={cat}
                                    onClick={(e) => { e.preventDefault(); setFormData({ ...formData, category: cat }) }}
                                    className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${formData.category === cat
                                        ? 'bg-[#09637E] border-[#09637E] text-white shadow-md transform scale-105'
                                        : 'border-[#09637E]/10 bg-white text-[#09637E] hover:border-[#088395] hover:text-[#088395] shadow-sm'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Custom Category Input */}
                        {showCustomInput && (
                            <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <p className="text-[#088395] font-black uppercase tracking-[0.2em] text-[9px] mb-3">Specify Your Sphere</p>
                                <input
                                    type="text"
                                    placeholder="Type custom category..."
                                    value={formData.customCategory || ''}
                                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                    className="w-full max-w-sm bg-transparent text-2xl font-serif-premium italic text-[#09637E] placeholder-[#09637E]/20 outline-none border-b border-[#09637E]/20 pb-2 focus:border-[#088395] transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {/* Field */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[#09637E] font-bold uppercase tracking-widest text-[10px]">Field</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {PREDEFINED_INTERESTS.slice(0, 5).map(interest => {
                                const isSelected = (formData.interests || []).includes(interest);
                                return (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleInterest(interest);
                                            setShowAllInterests(false);
                                        }}
                                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${isSelected
                                            ? "bg-[#09637E] border-[#09637E] text-white shadow-md transform scale-105"
                                            : "border-[#09637E]/10 bg-white text-[#09637E] hover:border-[#088395] hover:text-[#088395] shadow-sm"
                                        }`}
                                    >
                                        {interest}
                                    </button>
                                );
                            })}

                            {/* OTHERS Wrapper */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setShowAllInterests(!showAllInterests); }}
                                    className={`px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300 border shadow-sm flex items-center justify-center ${
                                        isOtherSelected
                                            ? 'bg-[#09637E] border-[#09637E] text-white shadow-md transform scale-105'
                                            : 'border-[#09637E]/20 bg-[#09637E]/5 text-[#09637E] hover:bg-[#09637E]/10'
                                    }`}
                                >
                                    OTHERS
                                </button>

                                {showAllInterests && (
                                    <div className="absolute bottom-full left-0 sm:translate-x-[20%] mb-3 w-[300px] z-[100] animate-in fade-in slide-in-from-bottom-2">
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={(e) => { e.stopPropagation(); setShowAllInterests(false); }}
                                        />
                                        <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] shadow-[0_30px_60px_-15px_rgba(9,99,126,0.4)] p-6 relative z-50 border border-[#09637E]/20" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#09637E]/10">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/60">More Interests</h3>
                                                <button
                                                    onClick={() => setShowAllInterests(false)}
                                                    className="w-6 h-6 rounded-full bg-[#EBF4F6] flex items-center justify-center text-[#09637E] hover:bg-[#09637E] hover:text-white transition-colors shrink-0"
                                                >
                                                    <BsX size={14} />
                                                </button>
                                            </div>
                                            <div className="flex flex-col items-stretch gap-2 max-h-[250px] overflow-y-auto pr-2">
                                                {PREDEFINED_INTERESTS.slice(5).map(interest => {
                                                    const isSelected = (formData.interests || []).includes(interest);
                                                    return (
                                                        <button
                                                            key={interest}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleInterest(interest, true);
                                                            }}
                                                            className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 border ${isSelected
                                                                ? "bg-[#09637E] border-[#09637E] text-white shadow-sm"
                                                                : "border-[#09637E]/10 bg-white text-[#09637E] hover:border-[#088395] hover:text-[#088395] hover:bg-[#09637E]/5 shadow-sm"
                                                            }`}
                                                        >
                                                            {interest}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepSphere;
