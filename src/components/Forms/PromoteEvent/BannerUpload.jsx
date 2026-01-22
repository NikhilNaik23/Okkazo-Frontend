import React, { useRef } from 'react';
import { BsPlus, BsCloudUpload, BsInfoCircle, BsX } from "react-icons/bs";

const BannerUpload = ({ formData, setFormData }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File size exceeds 5MB limit");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, banner: reader.result }); // Storing base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveBanner = (e) => {
        e.stopPropagation();
        setFormData({ ...formData, banner: null });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerUpload = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-3 font-bold mb-4">
                <div className="text-[#00bfa5]"><BsPlus /></div>
                Event Banner
            </h3>
            
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/svg+xml"
                className="hidden"
            />

            {formData && formData.banner ? (
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer border border-gray-200" onClick={triggerUpload}>
                    <img 
                        src={formData.banner} 
                        alt="Event Banner" 
                        className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="text-white text-xs font-bold">Click to change</p>
                    </div>
                    <button 
                        onClick={handleRemoveBanner}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                    >
                        <BsX size={16} />
                    </button>
                </div>
            ) : (
                <div 
                    onClick={triggerUpload}
                    className="border-2 border-dashed border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[#00bfa5]/50 transition-all mb-4"
                >
                    <div className="w-12 h-12 bg-[#00bfa5]/10 text-[#00bfa5] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BsCloudUpload size={24} />
                    </div>
                    <p className="font-bold text-sm mb-1">Click or drag to upload</p>
                    <p className="text-[10px] text-gray-400">SVG, PNG, JPG (Max. 800x400px)</p>
                </div>
            )}

            {!formData?.banner && (
                <div className="mt-4 flex items-start gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <BsInfoCircle className="text-[#0b2d49] mt-0.5" size={12} />
                    <p className="text-[10px] text-gray-500 leading-tight">Events with banners have a 40% higher conversion rate.</p>
                </div>
            )}
        </div>
    );
};

export default BannerUpload;
