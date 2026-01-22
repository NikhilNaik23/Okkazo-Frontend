import React from 'react';
import { BsPlus, BsCloudUpload, BsInfoCircle } from "react-icons/bs";

const BannerUpload = () => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-3 font-bold mb-4">
                <div className="text-[#00bfa5]"><BsPlus /></div>
                Event Banner
            </h3>
            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[#00bfa5]/50 transition-all">
                <div className="w-12 h-12 bg-[#00bfa5]/10 text-[#00bfa5] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BsCloudUpload size={24} />
                </div>
                <p className="font-bold text-sm mb-1">Click or drag to upload</p>
                <p className="text-[10px] text-gray-400">SVG, PNG, JPG (Max. 800x400px)</p>
            </div>
            <div className="mt-4 flex items-start gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                <BsInfoCircle className="text-[#0b2d49] mt-0.5" size={12} />
                <p className="text-[10px] text-gray-500 leading-tight">Events with banners have a 40% higher conversion rate.</p>
            </div>
        </div>
    );
};

export default BannerUpload;
