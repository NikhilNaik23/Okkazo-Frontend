import React from "react";
import { BsEye } from "react-icons/bs";
import Toggle from "./Toggle";

const PrivacySection = ({ settings, toggleSetting }) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                <BsEye className="text-[#0caf7d]" size={24} />
                <h2 className="text-xl font-black uppercase tracking-widest text-[#0b2d49]">Privacy</h2>
            </div>
            
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-[#0b2d49]">Make Profile Public</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Allow others to find and view your public profile.</p>
                    </div>
                    <Toggle active={settings.profilePublic} onClick={() => toggleSetting("profilePublic")} />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-[#0b2d49]">Show My Activity</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Display your event attendance history to followers.</p>
                    </div>
                    <Toggle active={settings.showActivity} onClick={() => toggleSetting("showActivity")} />
                </div>
            </div>
        </div>
    );
};

export default PrivacySection;
