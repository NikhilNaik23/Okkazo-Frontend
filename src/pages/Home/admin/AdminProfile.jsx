import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Calendar, 
  Award, 
  ShieldCheck, 
  Edit3, 
  Lock, 
  ChevronRight,
  LogOut,
  Twitter,
  Linkedin,
  Github
} from "lucide-react";

const AdminProfile = () => {
    const [isEditing, setIsEditing] = useState(false);

    const userInfo = {
        name: "Marcus Aurelius",
        role: "System Administrator",
        email: "marcus.a@okkazo.com",
        phone: "+1 (555) 928-4021",
        location: "Seattle, Washington, US",
        memberSince: "May 2022",
        permissions: ["Full Access", "Financial Audit", "Team Lead"],
        avatar: "MA",
        bio: "Veteran system architect focused on event management scalability and platform security infrastructure. Passionate about automated workflows and data-driven decision making."
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc]">
            {/* Smooth Top Gradient Background */}
            <div className="h-64 bg-gradient-to-br from-[#0b2d49] to-[#1a4b70] shrink-0 relative">
                <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                </div>
                
                {/* Profile Header Floating Overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-8 translate-y-1/2 z-10">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-6">
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-white p-1.5 shadow-2xl relative">
                                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#f3ddb1] to-[#e6c382] flex items-center justify-center text-[#0b2d49] text-4xl font-black">
                                    {userInfo.avatar}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-[#0b2d49] text-[#d7a444] rounded-xl shadow-lg border-4 border-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95">
                                    <Camera size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black text-[#1a1c1e] tracking-tight">{userInfo.name}</h1>
                                <p className="text-[#64748b] font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <ShieldCheck size={16} className="text-[#28a785]" />
                                    {userInfo.role}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-6 py-2.5 bg-white border border-[#e9eff1] text-[#0b2d49] rounded-xl text-sm font-bold shadow-sm hover:bg-[#f1f5f9] transition-all flex items-center gap-2 group"
                                >
                                    <Edit3 size={16} className="group-hover:text-[#d7a444] transition-colors" />
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 pt-24 pb-12 px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column - Personal Details & Socials */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Info Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e9eff1]">
                            <h3 className="text-sm font-bold text-[#1a1c1e] mb-6 uppercase tracking-widest border-l-4 border-[#d7a444] pl-3">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-[#708aa0] group-hover:text-[#28a785] transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#b4bdc6] uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-bold text-[#1a1c1e]">{userInfo.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-[#708aa0] group-hover:text-[#d7a444] transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#b4bdc6] uppercase tracking-widest">Phone Number</p>
                                        <p className="text-sm font-bold text-[#1a1c1e]">{userInfo.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-[#708aa0] group-hover:text-[#0b2d49] transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#b4bdc6] uppercase tracking-widest">Location</p>
                                        <p className="text-sm font-bold text-[#1a1c1e]">{userInfo.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-[#f0f2f5] flex justify-center gap-6">
                                <button className="p-2.5 bg-[#f8fafc] text-[#708aa0] rounded-xl hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] transition-all hover:-translate-y-1 shadow-sm">
                                    <Twitter size={20} />
                                </button>
                                <button className="p-2.5 bg-[#f8fafc] text-[#708aa0] rounded-xl hover:bg-[#0077b5]/10 hover:text-[#0077b5] transition-all hover:-translate-y-1 shadow-sm">
                                    <Linkedin size={20} />
                                </button>
                                <button className="p-2.5 bg-[#f8fafc] text-[#708aa0] rounded-xl hover:bg-[#333]/10 hover:text-[#333] transition-all hover:-translate-y-1 shadow-sm">
                                    <Github size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tenure Card */}
                        <div className="bg-[#0b2d49] rounded-3xl p-8 text-white shadow-xl shadow-[#0b2d49]/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 opacity-10 transition-transform group-hover:rotate-12">
                                <Award size={120} />
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-[#d7a444]">
                                    <Calendar size={20} />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest">Service Tenure</h3>
                            </div>
                            <p className="text-3xl font-black mb-1">2 Years+</p>
                            <p className="text-white/60 text-xs font-medium">Joined Okkazo in {userInfo.memberSince}</p>
                        </div>
                    </div>

                    {/* Right Column - Bio & Access */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Bio Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e9eff1]">
                             <h3 className="text-lg font-black text-[#1a1c1e] mb-6 flex items-center gap-3">
                                <User size={20} className="text-[#d7a444]" />
                                Professional Biography
                             </h3>
                             <p className="text-[#64748b] leading-loose text-base font-medium">
                                {userInfo.bio}
                             </p>
                        </div>

                        {/* Permissions Grid */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e9eff1]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-[#1a1c1e]">Security Clearance</h3>
                                <div className="px-3 py-1 bg-green-50 text-[#28a785] text-[10px] font-black rounded-full border border-green-100">
                                    ENHANCED
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userInfo.permissions.map((perm, i) => (
                                    <div key={i} className="group p-4 bg-[#f8fafc] hover:bg-[#0b2d49] border border-[#f0f2f5] rounded-2xl flex items-center justify-between transition-all cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#28a785] group-hover:bg-white/10 group-hover:text-white transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <span className="text-sm font-bold text-[#1a1c1e] group-hover:text-white transition-colors">{perm}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-[#cbd5e1] group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Settings Section */}
                        <div className="bg-[#f8fafc] rounded-3xl p-8 border border-dashed border-[#e9eff1] flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#0b2d49]/10 text-[#0b2d49] rounded-xl shrink-0">
                                    <Lock size={20} />
                                </div>
                                <div className="text-center md:text-left">
                                    <h4 className="text-sm font-bold text-[#1a1c1e]">Security Preferences</h4>
                                    <p className="text-xs text-[#94a3b8] font-medium mt-0.5">Manage passwords and login sessions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-5 py-2.5 bg-white text-[#0b2d49] text-xs font-bold rounded-xl border border-[#e9eff1] shadow-sm hover:shadow-md transition-all">
                                    Change Password
                                </button>
                                <button className="px-5 py-2.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2">
                                    <LogOut size={16} />
                                    Logout Session
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
