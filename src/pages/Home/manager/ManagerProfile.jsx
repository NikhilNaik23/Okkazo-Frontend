import React, { useState } from 'react';
import {
    User, Mail, Phone, MapPin, Lock, Bell, Shield, Save,
    Camera, LogOut, Moon, Globe, ChevronRight
} from 'lucide-react';

const ManagerProfile = () => {
    const [activeSection, setActiveSection] = useState('general');

    const sections = [
        { id: 'general', label: 'General', icon: User },
        { id: 'security', label: 'Password & Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'team', label: 'Team Management', icon: Shield },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Account Settings</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* 1. Sidebar Nav */}
                <div className="lg:w-72 shrink-0 space-y-8">
                    {/* User Mini Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-lg">
                            MK
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">Manager Account</h3>
                            <p className="text-xs text-gray-500 font-medium">manager@okkazo.com</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                            ? 'bg-white text-teal-600 shadow-sm border border-gray-100'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-teal-500' : 'text-gray-400'}`} />
                                        {section.label}
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-teal-400" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Danger Zone Link */}
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                </div>

                {/* 2. Main Content Form */}
                <div className="flex-1 max-w-4xl">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[600px]">
                        {activeSection === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">General Information</h2>
                                    <p className="text-gray-500 text-sm">Update your photo and personal details here.</p>
                                </div>

                                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row gap-8">
                                    <div className="md:w-1/3">
                                        <label className="text-sm font-bold text-gray-900 block mb-1">Public Profile</label>
                                        <p className="text-xs text-gray-500 leading-relaxed">This will be displayed on your profile.</p>
                                    </div>
                                    <div className="md:w-2/3 space-y-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-white shadow-sm flex items-center justify-center text-gray-400">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm mb-2 flex items-center gap-2">
                                                    <Camera className="w-4 h-4" /> Change Photo
                                                </button>
                                                <p className="text-xs text-gray-400">JPG, GIF or PNG. 1MB Max.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                                                <input type="text" defaultValue="Manager" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                                                <input type="text" defaultValue="Account" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="email" defaultValue="manager@okkazo.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-8 flex items-center justify-end gap-3">
                                    <button className="px-5 py-2.5 text-gray-500 font-bold hover:text-gray-900 text-sm">Cancel</button>
                                    <button className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/20 flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h2>
                                    <p className="text-gray-500 text-sm">Choose what we get in touch about.</p>
                                </div>
                                <div className="space-y-6">
                                    {["New event inquiry", "Vendor application", "Payment received", "System updates"].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">{item}</h3>
                                                <p className="text-xs text-gray-500">Get notified via email and push.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerProfile;
