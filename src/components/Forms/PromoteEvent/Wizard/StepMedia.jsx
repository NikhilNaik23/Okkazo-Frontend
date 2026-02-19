import React, { useRef } from 'react';
import { BsCloudUpload, BsX } from "react-icons/bs";

const StepMedia = ({ formData, setFormData }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB limit");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, banner: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerUpload = () => fileInputRef.current.click();
    const handleRemoveBanner = (e) => {
        e.stopPropagation();
        setFormData({ ...formData, banner: null });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-serif-premium text-6xl md:text-8xl italic text-[#7AB2B2] opacity-10 mb-8 absolute -top-20 -left-20 pointer-events-none select-none">Showcase</h1>

            <div className="mb-12 relative">
                <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 02 — Visual Experience</p>
                <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Curate the scene.</h2>
            </div>

            <div className="max-w-3xl">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div className={`w-full h-80 rounded-[1.75rem] relative overflow-hidden group transition-all duration-300 ${formData.banner ? 'border-[#088395] shadow-lg' : 'bg-white border-2 border-dashed border-[#09637E]/10 hover:border-[#088395] hover:shadow-md'}`}>
                    {formData.banner ? (
                        <>
                            <img src={formData.banner} className="w-full h-full object-cover" alt="Event Banner" />
                            <div className="absolute inset-0 bg-[#09637E]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                <p className="text-[#EBF4F6] font-bold uppercase tracking-widest text-xs border border-[#EBF4F6] px-6 py-3 rounded-full hover:bg-[#EBF4F6] hover:text-[#09637E] transition-all">Change Banner</p>
                            </div>
                            <button
                                onClick={handleRemoveBanner}
                                className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#09637E] transition-all z-10"
                            >
                                <BsX size={20} />
                            </button>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#09637E] group-hover:text-[#088395] transition-colors cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <div className="w-20 h-20 bg-[#09637E]/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#088395]/10 transition-colors">
                                <BsCloudUpload size={32} className="opacity-80" />
                            </div>
                            <span className="font-serif-premium text-4xl italic mb-2 text-[#09637E]/80 group-hover:text-[#09637E]">Upload Banner</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Recommended Size: 1920x820px</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepMedia;
