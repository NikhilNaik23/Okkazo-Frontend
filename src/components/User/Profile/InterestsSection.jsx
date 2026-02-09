import React from "react";
import { BsX } from "react-icons/bs";

const InterestsSection = ({ formData, removeInterest }) => {
    return (
        <div className="space-y-6 mb-12">
            <div className="flex justify-between items-center">
                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Interests</label>
                <button type="button" className="text-xs font-black text-[#d7a444] hover:underline">+ Add New</button>
            </div>
            <div className="flex flex-wrap gap-3">
                {formData.interests.length > 0 ? (
                    formData.interests.map((interest) => (
                        <div 
                            key={interest}
                            className="px-5 py-2.5 bg-emerald-50/30 text-[#0b2d49] rounded-2xl flex items-center gap-2 font-black text-sm border border-emerald-100 hover:border-[#d7a444] transition-all group"
                        >
                            {interest}
                            <button 
                                type="button"
                                onClick={() => removeInterest(interest)}
                                className="p-1 hover:bg-white rounded-full transition-colors text-emerald-300 hover:text-red-500"
                            >
                                <BsX size={16} strokeWidth={1} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-400 italic">No interests added yet.</p>
                )}
            </div>
        </div>
    );
};

export default InterestsSection;
