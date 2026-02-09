import React from "react";
import { BsShieldLock } from "react-icons/bs";
import Toggle from "./Toggle";

const SecuritySection = ({ settings, toggleSetting }) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                <BsShieldLock className="text-[#0caf7d]" size={24} />
                <h2 className="text-xl font-black uppercase tracking-widest text-[#0b2d49]">Security</h2>
            </div>
            
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-[#0b2d49]">Password</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Update your account password regularly to stay secure.</p>
                    </div>
                    <button className="px-6 py-2.5 bg-[#0caf7d]/10 text-[#0caf7d] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0caf7d] hover:text-white transition-all border border-[#0caf7d]/20">
                        Change Password
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-[#0b2d49]">Two-Factor Authentication</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    <Toggle active={settings.twoFactor} onClick={() => toggleSetting("twoFactor")} />
                </div>
            </div>
        </div>
    );
};

export default SecuritySection;
