import React from "react";

const BioSection = ({ formData, setFormData }) => {
    return (
        <div className="space-y-2 mb-10">
            <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Short Bio</label>
            <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows="4"
                placeholder="Tell us a bit about yourself..."
                className="w-full px-6 py-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all resize-none leading-relaxed placeholder:text-gray-300 placeholder:font-medium"
            />
        </div>
    );
};

export default BioSection;
