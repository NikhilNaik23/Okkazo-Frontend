import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Layout/user/Navbar";
import Footer from "../../../components/Layout/user/Footer";
import { BsPencil, BsGear, BsEnvelope, BsTelephone, BsGeoAlt } from "react-icons/bs";
import { toast, Toaster } from "react-hot-toast";
import { userProfileData, userActivitiesData } from "../../../data/userData";

const UserProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);

    // Simulate fetching profile and activities from backend
    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                // Simulated API delay
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Mock user response
                const userResponse = userProfileData;

                // Mock activities response
                const activitiesResponse = userActivitiesData;

                setUser(userResponse);
                setActivities(activitiesResponse);
            } catch (error) {
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <Navbar />
            <Toaster position="top-center" />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-20">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] shadow-xl border border-gray-100">
                        <div className="w-12 h-12 border-4 border-[#d7a444] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Profile...</p>
                    </div>
                ) : user ? (
                    <>
                        {/* Hero Profile Section */}
                        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden mb-12 relative animate-in fade-in duration-700">
                            <div className="h-48 bg-gradient-to-r from-[#d7a444]/20 via-[#e9eff1] to-[#708aa0]/20"></div>
                            <div className="px-10 pb-12 flex flex-col items-center">
                                <div className="relative -mt-24 mb-6">
                                    <div className="w-40 h-40 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-white">
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <h1 className="text-5xl font-black mb-2 tracking-tight">{user.name}</h1>
                                <p className="text-gray-400 font-medium mb-8">Member since {user.memberSince}</p>
                                
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => navigate("/user/edit-profile")}
                                        className="flex items-center gap-2 bg-[#0b2d49] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-[#d7a444] hover:text-[#0b2d49] transition-all shadow-lg active:scale-95 group"
                                    >
                                        <BsPencil className="group-hover:scale-110 transition-transform" />
                                        Edit Profile
                                    </button>
                                    <button 
                                        onClick={() => navigate("/user/account-settings")}
                                        className="flex items-center gap-2 bg-white text-[#0b2d49] px-8 py-4 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all border border-gray-100 shadow-sm active:scale-95 group"
                                    >
                                        <BsGear className="group-hover:rotate-90 transition-transform" />
                                        Account Settings
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {/* Left Column: Info & Interests */}
                            <div className="space-y-10">
                                {/* Personal Info */}
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-[#d7a444] rounded-full"></span>
                                        Personal Info
                                    </h2>
                                    <div className="space-y-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <BsEnvelope /> Email Address
                                            </p>
                                            <p className="font-bold text-[#0b2d49]">{user.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <BsTelephone /> Phone Number
                                            </p>
                                            <p className="font-bold text-[#0b2d49]">{user.phone}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <BsGeoAlt /> Location
                                            </p>
                                            <p className="font-bold text-[#0b2d49]">{user.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Interests */}
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-[#d7a444] rounded-full"></span>
                                        Interests
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {user.interests.length > 0 ? (
                                            user.interests.map((interest) => (
                                                <span 
                                                    key={interest}
                                                    className="px-4 py-2 bg-[#f3ddb1]/30 text-[#d0a862] rounded-xl text-xs font-black border border-[#f3ddb1]/50 hover:bg-[#d7a444] hover:text-[#0b2d49] transition-all cursor-default"
                                                >
                                                    {interest}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No interests listed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Recent Activity */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 h-full">
                                    <div className="flex items-center justify-between mb-10">
                                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                            <span className="w-1.5 h-8 bg-[#d7a444] rounded-full"></span>
                                            Recent Activity
                                        </h2>
                                        <button className="text-sm font-black text-[#d7a444] hover:underline">View All</button>
                                    </div>

                                    <div className="space-y-8 relative">
                                        {/* Vertical Line for Timeline */}
                                        <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gray-50"></div>

                                        {activities.length > 0 ? (
                                            activities.map((activity) => (
                                                <div key={activity.id} className="relative flex gap-6 group">
                                                    <div className={`z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-sm shadow-black/5 ${activity.bgColor}`}>
                                                        {activity.icon}
                                                    </div>
                                                    <div className="pt-1">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                            <h4 className="font-black text-[#0b2d49] group-hover:text-[#d7a444] transition-colors">{activity.title}</h4>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activity.time}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">{activity.description}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 italic text-center py-10">No recent activity found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">User profile not found.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default UserProfile;
