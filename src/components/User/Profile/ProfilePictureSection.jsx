import React from "react";
import { BsPencil } from "react-icons/bs";

const ProfilePictureSection = ({ authUser, formData }) => {
    return (
        <div className="flex flex-col items-center mb-12 border-b border-gray-50 pb-12">
            <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50">
                    <img 
                        src={authUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=d7a444&color=0b2d49&size=128`} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                    />
                </div>
                <button 
                    type="button" 
                    className="absolute bottom-1 right-1 w-10 h-10 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-[#0b2d49] hover:text-[#d7a444] transition-all"
                >
                    <BsPencil size={18} />
                </button>
            </div>
            <p className="text-sm font-black mb-1">Profile Picture</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">JPG, GIF or PNG. Max size of 2MB.</p>
        </div>
    );
};

export default ProfilePictureSection;
