import React from "react";
import { BsLink45Deg } from "react-icons/bs";
import { FaGoogle, FaFacebookF } from "react-icons/fa";

const LinkedAccountsSection = () => {
    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                <BsLink45Deg className="text-[#0caf7d]" size={26} />
                <h2 className="text-xl font-black uppercase tracking-widest text-[#0b2d49]">Linked Accounts</h2>
            </div>
            
            <div className="space-y-6">
                <div className="flex items-center justify- between bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                            <FaGoogle size={20} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-[#0b2d49]">Google Account</h4>
                            <p className="text-[10px] font-bold text-gray-400">alex.morgan@gmail.com</p>
                        </div>
                    </div>
                    <button className="px-5 py-2 bg-white text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:text-red-500 hover:border-red-100 transition-all">
                        Disconnect
                    </button>
                </div>

                <div className="flex items-center justify-between bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                            <FaFacebookF size={20} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-[#0b2d49]">Facebook Account</h4>
                            <p className="text-[10px] font-bold text-gray-400">Alex Morgan</p>
                        </div>
                    </div>
                    <button className="px-5 py-2 bg-white text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:text-red-500 hover:border-red-100 transition-all">
                        Disconnect
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkedAccountsSection;
