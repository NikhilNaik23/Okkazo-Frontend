import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Layout/user/Navbar";
import Footer from "../../components/Layout/user/Footer";
import { BsPencil, BsX } from "react-icons/bs";
import { toast, Toaster } from "react-hot-toast";

const EditProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        interests: []
    });

    // Simulate fetching data from backend
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                // Simulated API delay
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Mock backend response
                const response = {
                    fullName: "Alex Morgan",
                    email: "alex.morgan@example.com",
                    phone: "+1 (555) 012-3456",
                    location: "San Francisco, CA",
                    bio: "Tech enthusiast and art lover. I enjoy attending community-driven events and networking with professionals across industries.",
                    interests: ["Music", "Arts", "Tech", "Sustainability", "Workshops"]
                };
                
                setFormData(response);
            } catch (error) {
                toast.error("Failed to load profile data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const locations = ["San Francisco, CA", "New York, NY", "London, UK", "Tokyo, JP", "Berlin, DE"];

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Profile updated successfully!");
            setTimeout(() => navigate("/user/profile"), 1000);
        } catch (error) {
            toast.error("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const removeInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== interest)
        }));
    };

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <Navbar />
            <Toaster position="top-center" />

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-32 pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Edit Profile</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Manage your personal information and preferences.</p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
                        <div className="w-12 h-12 border-4 border-[#d7a444] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Profile...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 animate-in fade-in duration-500">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center mb-12 border-b border-gray-50 pb-12">
                            <div className="relative mb-4">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50">
                                    <img src={`https://ui-avatars.com/api/?name=${formData.fullName}&background=d7a444&color=0b2d49&size=128`} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <button type="button" className="absolute bottom-1 right-1 w-10 h-10 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-[#0b2d49] hover:text-[#d7a444] transition-all">
                                    <BsPencil size={18} />
                                </button>
                            </div>
                            <p className="text-sm font-black mb-1">Profile Picture</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">JPG, GIF or PNG. Max size of 2MB.</p>
                        </div>

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Full Name</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Email Address</label>
                                <input 
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Phone Number</label>
                                <input 
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Location</label>
                                <div className="relative">
                                    <select 
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all appearance-none cursor-pointer"
                                    >
                                        {locations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-10">
                            <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Short Bio</label>
                            <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                rows="4"
                                className="w-full px-6 py-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all resize-none leading-relaxed"
                            />
                        </div>

                        {/* Interests Tag Cloud */}
                        <div className="space-y-6 mb-12">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Interests</label>
                                <button type="button" className="text-xs font-black text-[#d7a444] hover:underline">+ Add New</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {formData.interests.length > 0 ? (
                                    formData.interests.map((interest) => (
                                        <div 
                                            key={interest}
                                            className="px-5 py-2.5 bg-emerald-50/30 text-[#0b2d49] rounded-2xl flex items-center gap-2 font-black text-sm border border-emerald-100 hover:border-[#d7a444] transition-all group"
                                        >
                                            {interest}
                                            <button 
                                                type="button"
                                                onClick={() => removeInterest(interest)}
                                                className="p-1 hover:bg-white rounded-full transition-colors text-emerald-300 hover:text-red-500"
                                            >
                                                <BsX size={16} strokeWidth={1} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No interests added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-6 pt-10 border-t border-gray-50">
                            <button 
                                type="button"
                                onClick={() => navigate("/user/profile")}
                                disabled={isSaving}
                                className="flex-1 py-5 bg-white text-[#0b2d49] font-black rounded-2xl border-2 border-gray-50 hover:bg-gray-50 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 py-5 bg-[#0caf7d] text-white font-black rounded-2xl shadow-xl shadow-emerald-500/10 hover:bg-[#09926a] transition-all text-sm uppercase tracking-widest active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default EditProfile;
