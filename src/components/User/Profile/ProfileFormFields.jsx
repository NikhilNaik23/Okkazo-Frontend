import React from "react";

const ProfileFormFields = ({ formData, setFormData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Username</label>
                <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Full Name</label>
                <input 
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all placeholder:text-gray-300 placeholder:font-medium"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Email Address</label>
                <input 
                    type="email"
                    required
                    disabled
                    value={formData.email}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-gray-50 outline-none font-bold text-gray-400 transition-all cursor-not-allowed"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Phone Number</label>
                <input 
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all placeholder:text-gray-300 placeholder:font-medium"
                />
            </div>
        </div>
    );
};

export default ProfileFormFields;
