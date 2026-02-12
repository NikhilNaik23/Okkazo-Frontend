import React, { useState } from "react";
import {
    BsCamera,
    BsPencilSquare,
    BsStarFill,
    BsGeoAlt,
    BsPlus,
    BsGlobe,
    BsPlusLg,
    BsCheckCircleFill,
    BsFileEarmarkText,
    BsDownload,
    BsEye,
    BsShieldCheck
} from "react-icons/bs";
import { toast } from "react-hot-toast";
import { vendorProfileData } from "../../data/vendorProfileData.jsx";
import VendorAvailabilityCalendar from "../../components/Global/VendorAvailabilityCalendar";

const BusinessProfile = () => {
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [profileData, setProfileData] = useState(vendorProfileData);

    const [tempAbout, setTempAbout] = useState(profileData.about);

    const handleSaveChanges = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Saving changes...',
                success: <b>Profile updated successfully!</b>,
                error: <b>Could not save changes.</b>,
            },
            {
                style: { borderRadius: '16px', background: '#0b2d49', color: '#fff' }
            }
        );
    };

    const handleUpdateAbout = () => {
        setProfileData({ ...profileData, about: tempAbout });
        setIsEditingAbout(false);
        toast.success("Description updated!");
    };

    const handleAddService = () => {
        const newService = {
            id: Date.now(),
            name: "New Service Package",
            description: "Details for the new service offering.",
            price: "100"
        };
        setProfileData({
            ...profileData,
            services: [...profileData.services, newService]
        });
        toast.success("New service added to profile.");
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black tracking-tight">Business Profile</h1>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white border-2 border-[#e9eff1] text-[#0b2d49] rounded-2xl font-bold text-sm hover:border-[#0b2d49] transition-all flex items-center gap-2">
                        <BsGlobe /> Preview Website
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        className="px-6 py-3 bg-[#0b2d49] text-white rounded-2xl font-bold text-sm hover:bg-[#d7a444] transition-all shadow-lg active:scale-95"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Hero / Cover Section */}
            <div className="relative mb-20">
                <div className="h-80 w-full rounded-[3rem] bg-[#e9eff1] overflow-hidden group border border-white">
                    <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Cover" />
                    <button
                        onClick={() => toast.success("Cover photo update coming soon!")}
                        className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[#0b2d49] font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-white transition-all"
                    >
                        <BsCamera /> Change Cover
                    </button>
                </div>

                {/* Profile Info Overlay */}
                <div className="absolute -bottom-12 left-12 flex items-end gap-8">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-linear-to-br from-[#d7a444] to-[#f3ddb1] p-1 shadow-2xl border-4 border-white">
                            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover rounded-[2.2rem]" alt="Profile" />
                        </div>
                        <button
                            onClick={() => toast.success("Profile photo update coming soon!")}
                            className="absolute bottom-2 right-2 w-10 h-10 bg-[#0b2d49] text-white rounded-xl flex items-center justify-center border-2 border-white shadow-lg hover:bg-[#d7a444] transition-all"
                        >
                            <BsCamera size={18} />
                        </button>
                    </div>
                    <div className="mb-6 pb-2">
                        <h2 className="text-4xl font-black text-[#0b2d49] tracking-tight mb-2">{profileData.name}</h2>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-[#d7a444] font-black text-sm">
                                <BsStarFill /> {profileData.rating} <span className="text-[#708aa0] font-bold">({profileData.reviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#5a5b44] font-bold text-sm">
                                <BsGeoAlt className="text-[#708aa0]" /> {profileData.location}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: About & Stats */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* About Section */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#10b981]/10 text-[#10b981] rounded-xl flex items-center justify-center">
                                    <BsGlobe size={20} />
                                </div>
                                About the Business
                            </h3>
                            <button
                                onClick={() => setIsEditingAbout(!isEditingAbout)}
                                className="text-[10px] font-black uppercase text-[#d7a444] hover:underline flex items-center gap-2 tracking-widest leading-none"
                            >
                                <BsPencilSquare size={14} /> {isEditingAbout ? "Cancel Editing" : "Edit Description"}
                            </button>
                        </div>

                        {isEditingAbout ? (
                            <div className="space-y-4">
                                <textarea
                                    value={tempAbout}
                                    onChange={(e) => setTempAbout(e.target.value)}
                                    className="w-full h-40 p-6 rounded-[2rem] bg-[#e9eff1]/50 border-none focus:ring-2 focus:ring-[#d7a444]/20 font-medium text-[#5a5b44] leading-relaxed resize-none"
                                />
                                <button
                                    onClick={handleUpdateAbout}
                                    className="px-8 py-3 bg-[#0b2d49] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all"
                                >
                                    Update Description
                                </button>
                            </div>
                        ) : (
                            <p className="text-[#5a5b44] font-medium leading-[2] text-lg">
                                {profileData.about}
                            </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                            {profileData.stats.map((stat, idx) => (
                                <div key={idx} className="bg-[#e9eff1]/30 p-6 rounded-[2rem] border border-white hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                    <div className="text-[#d7a444] mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                                    <p className="text-[10px] text-[#708aa0] font-black uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                                    <p className="text-xl font-black tracking-tight">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Services & Pricing */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0b2d49]/5 text-[#d7a444] rounded-xl flex items-center justify-center">
                                    <BsPlus size={32} />
                                </div>
                                Services & Pricing
                            </h3>
                            <button
                                onClick={handleAddService}
                                className="p-3 bg-[#e9eff1]/50 text-[#d7a444] rounded-xl hover:bg-[#e9eff1] transition-all shadow-sm active:scale-95"
                            >
                                <BsPlusLg size={20} strokeWidth={1} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {profileData.services.map((service) => (
                                <div key={service.id} className="p-8 bg-gray-50/50 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-transparent hover:border-[#708aa0]/10 hover:bg-white hover:shadow-lg transition-all decoration-300">
                                    <div>
                                        <h4 className="text-lg font-black text-[#0b2d49] mb-1">{service.name}</h4>
                                        <p className="text-sm text-[#5a5b44] font-medium">{service.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[#d7a444] font-black text-xl leading-none mb-1">From ${service.price}</p>
                                        <p className="text-[10px] text-[#708aa0] font-black uppercase tracking-[0.2em] leading-none">Per Person</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Verification Documents */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#10b981]/10 text-[#10b981] rounded-xl flex items-center justify-center">
                                    <BsShieldCheck size={20} />
                                </div>
                                Verification Documents
                            </h3>
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100">
                                <BsCheckCircleFill size={14} />
                                <span className="text-xs font-black uppercase tracking-wider">All Verified</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Business License */}
                            <div className="p-6 bg-gradient-to-r from-[#e9eff1]/70 to-[#f3ddb1]/20 rounded-[2rem] border border-[#d7a444]/20 hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#f3ddb1] to-[#d0a862]/50 rounded-xl flex items-center justify-center text-[#d7a444] shadow-sm">
                                            <BsFileEarmarkText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-[#0b2d49] mb-1">Business License</h4>
                                            <p className="text-xs text-[#708aa0] font-medium">
                                                {profileData.documents.businessLicense.name} • {(profileData.documents.businessLicense.size / 1024).toFixed(1)} KB
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] text-[#708aa0] font-bold">Uploaded: {profileData.documents.businessLicense.uploadDate}</span>
                                                <span className="text-[10px] font-black uppercase px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                                                    {profileData.documents.businessLicense.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toast.success("Viewing document...")}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all shadow-sm"
                                        >
                                            <BsEye size={16} />
                                        </button>
                                        <button
                                            onClick={() => toast.success("Downloading document...")}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#d7a444] hover:bg-[#d7a444] hover:text-white transition-all shadow-sm"
                                        >
                                            <BsDownload size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Owner Identity */}
                            <div className="p-6 bg-gradient-to-r from-[#e9eff1]/70 to-[#f3ddb1]/20 rounded-[2rem] border border-[#d7a444]/20 hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#f3ddb1] to-[#d0a862]/50 rounded-xl flex items-center justify-center text-[#d7a444] shadow-sm">
                                            <BsFileEarmarkText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-[#0b2d49] mb-1">Owner Identity Document</h4>
                                            <p className="text-xs text-[#708aa0] font-medium">
                                                {profileData.documents.ownerIdentity.name} • {(profileData.documents.ownerIdentity.size / 1024).toFixed(1)} KB
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] text-[#708aa0] font-bold">Uploaded: {profileData.documents.ownerIdentity.uploadDate}</span>
                                                <span className="text-[10px] font-black uppercase px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                                                    {profileData.documents.ownerIdentity.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toast.success("Viewing document...")}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all shadow-sm"
                                        >
                                            <BsEye size={16} />
                                        </button>
                                        <button
                                            onClick={() => toast.success("Downloading document...")}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#d7a444] hover:bg-[#d7a444] hover:text-white transition-all shadow-sm"
                                        >
                                            <BsDownload size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Other Documents */}
                            {profileData.documents.otherProofs.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-xs font-black text-[#0b2d49] uppercase tracking-widest mb-4">Additional Documents</p>
                                    <div className="space-y-3">
                                        {profileData.documents.otherProofs.map((doc, index) => (
                                            <div key={index} className="p-5 bg-gradient-to-r from-[#e9eff1]/70 to-[#5a5b44]/5 rounded-xl border border-[#5a5b44]/15 hover:shadow-md transition-all">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-[#5a5b44]/20 to-[#5a5b44]/10 rounded-lg flex items-center justify-center text-[#5a5b44]">
                                                            <BsFileEarmarkText size={16} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-[#0b2d49] mb-1">{doc.name}</h4>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] text-[#708aa0] font-medium">{(doc.size / 1024).toFixed(1)} KB</span>
                                                                <span className="text-[10px] text-[#708aa0] font-bold">Uploaded: {doc.uploadDate}</span>
                                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                                    {doc.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toast.success("Viewing document...")}
                                                            className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all"
                                                        >
                                                            <BsEye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => toast.success("Downloading document...")}
                                                            className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#5a5b44] hover:bg-[#5a5b44] hover:text-white transition-all"
                                                        >
                                                            <BsDownload size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Calendar & Map */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Vendor Availability Calendar */}
                    <VendorAvailabilityCalendar />

                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                        <h3 className="text-xl font-black flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#0b2d49]/5 text-[#d7a444] rounded-xl flex items-center justify-center">
                                <BsGeoAlt size={20} />
                            </div>
                            Service Area
                        </h3>
                        <div className="h-96 w-full rounded-[2.5rem] bg-[#e9eff1] relative overflow-hidden border-2 border-dashed border-[#708aa0]/10 flex flex-col items-center justify-center text-center p-8 group cursor-pointer hover:border-[#d7a444]/50 transition-all">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#d7a444] shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <BsGeoAlt size={28} />
                            </div>
                            <p className="text-sm font-black text-[#0b2d49]">Coverage Map Placeholder</p>
                            <p className="text-xs text-[#708aa0] font-medium mt-2">Integrating with Leaflet for precise area selection</p>
                            <button className="mt-6 px-6 py-2.5 bg-white rounded-xl text-[10px] font-black uppercase text-[#0b2d49] shadow-sm opacity-0 group-hover:opacity-100 transition-all">Configure Map</button>
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <p className="text-[10px] text-[#708aa0] font-black uppercase tracking-[0.2em] mb-4">Verification Status</p>
                            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-600 rounded-2xl border border-green-100 shadow-sm shadow-green-600/5">
                                <BsCheckCircleFill size={20} />
                                <span className="text-xs font-black uppercase tracking-widest">Profile Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default BusinessProfile;
