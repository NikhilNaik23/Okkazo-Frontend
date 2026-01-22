import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Layout/user/Navbar";
import Footer from "../../../components/Layout/user/Footer";
import { BsShieldLock, BsBell, BsEye, BsLink45Deg } from "react-icons/bs";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

const AccountSettings = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        twoFactor: false,
        emailNotifications: false,
        pushNotifications: false,
        smsAlerts: false,
        profilePublic: false,
        showActivity: false
    });

    // Simulate fetching settings from backend
    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                // Simulated API delay
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Mock backend response
                const response = {
                    twoFactor: true,
                    emailNotifications: true,
                    pushNotifications: true,
                    smsAlerts: false,
                    profilePublic: true,
                    showActivity: false
                };
                
                setSettings(response);
            } catch (error) {
                toast.error("Failed to load account settings");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Settings saved successfully!");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const Toggle = ({ active, onClick }) => (
        <button 
            onClick={onClick}
            className={`w-14 h-8 rounded-full transition-all relative ${active ? "bg-[#0caf7d]" : "bg-gray-200"}`}
        >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${active ? "right-1" : "left-1"}`}></div>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <Navbar />
            <Toaster position="top-center" />

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-32 pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Account Settings</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Manage your account preferences and security settings.</p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
                        <div className="w-12 h-12 border-4 border-[#0caf7d] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Settings...</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Security Section */}
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

                        {/* Notification Preferences */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                                <BsBell className="text-[#0caf7d]" size={24} />
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#0b2d49]">Notification Preferences</h2>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-[#0b2d49]">Email Notifications</h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1">Receive updates about your events via email.</p>
                                    </div>
                                    <Toggle active={settings.emailNotifications} onClick={() => toggleSetting("emailNotifications")} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-[#0b2d49]">Push Notifications</h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1">Get instant alerts on your mobile or desktop.</p>
                                    </div>
                                    <Toggle active={settings.pushNotifications} onClick={() => toggleSetting("pushNotifications")} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-[#0b2d49]">SMS Alerts</h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1">Critical updates sent directly to your phone.</p>
                                    </div>
                                    <Toggle active={settings.smsAlerts} onClick={() => toggleSetting("smsAlerts")} />
                                </div>
                            </div>
                        </div>

                        {/* Privacy Section */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                                <BsEye className="text-[#0caf7d]" size={24} />
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#0b2d49]">Privacy</h2>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-[#0b2d49]">Make Profile Public</h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1">Allow others to find and view your public profile.</p>
                                    </div>
                                    <Toggle active={settings.profilePublic} onClick={() => toggleSetting("profilePublic")} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-[#0b2d49]">Show My Activity</h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1">Display your event attendance history to followers.</p>
                                    </div>
                                    <Toggle active={settings.showActivity} onClick={() => toggleSetting("showActivity")} />
                                </div>
                            </div>
                        </div>

                        {/* Linked Accounts */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                                <BsLink45Deg className="text-[#0caf7d]" size={26} />
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#0b2d49]">Linked Accounts</h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
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

                        {/* Actions Button */}
                        <div className="flex items-center justify-end gap-6 pt-10">
                            <button 
                                onClick={() => navigate("/user/profile")}
                                disabled={isSaving}
                                className="text-gray-400 font-black text-sm uppercase tracking-widest hover:text-[#0b2d49] transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-10 py-5 bg-[#0caf7d] text-white font-black rounded-2xl shadow-xl shadow-emerald-500/10 hover:bg-[#09926a] transition-all text-sm uppercase tracking-widest active:scale-95 disabled:opacity-70 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default AccountSettings;
