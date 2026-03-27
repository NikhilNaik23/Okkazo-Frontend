import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { BsShieldLock, BsBell, BsLink45Deg, BsGoogle, BsEnvelope } from "react-icons/bs";
import { fetchCurrentUser, refreshAccessToken, selectAuthProvider, selectIsAuthenticated, selectUser } from "../../../store/slices/authSlice";

const AccountSettings = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authUser = useSelector(selectUser);
    const authProvider = useSelector(selectAuthProvider);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [providerProbeDone, setProviderProbeDone] = useState(false);

    // State matching the new design requirements
    const [settings, setSettings] = useState({
        twoFactor: true,
        emailNotifications: true,
        pushNotifications: true,
        smsAlerts: false,
    });

    useEffect(() => {
        if (isAuthenticated && !authUser) {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch, isAuthenticated, authUser]);

    useEffect(() => {
        if (isAuthenticated && !authProvider && !providerProbeDone && localStorage.getItem("refreshToken")) {
            setProviderProbeDone(true);
            dispatch(refreshAccessToken());
        }
    }, [dispatch, isAuthenticated, authProvider, providerProbeDone]);

    useEffect(() => {
        setIsLoading(!authUser);
    }, [authUser]);

    const provider = String(authUser?.authProvider || authProvider || "").toUpperCase();
    const hasKnownProvider = ["EMAIL", "SIGN_IN_WITH_GOOGLE", "BOTH"].includes(provider);
    const hasGoogle = provider === "SIGN_IN_WITH_GOOGLE" || provider === "BOTH";
    const hasEmailPassword = provider === "EMAIL" || provider === "BOTH";

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Settings saved successfully");
        }, 1500);
    };

    const ToggleSwitch = ({ checked, onChange }) => (
        <div
            onClick={onChange}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-[#09637E]' : 'bg-gray-300'}`}
        >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : ''}`} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#EBF4F6] text-[#09637E] font-sans pb-20 pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">

                {/* Header */}
                <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl md:text-6xl font-serif-premium italic text-[#09637E] mb-4">Account Settings</h1>
                    <p className="text-[#09637E]/60 text-lg font-light tracking-wide max-w-2xl">
                        Refine your experience in the Okkazo ecosystem.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-[#09637E] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-[#09637E]/40 uppercase tracking-widest text-xs">Loading Preferences...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">

                        {/* LEFT COLUMN */}
                        <div className="space-y-12">
                            {/* Security Section */}
                            <section>
                                <div className="flex items-center justify-between mb-8 border-b border-[#09637E]/10 pb-4">
                                    <h2 className="text-3xl font-serif-premium text-[#09637E]">Security</h2>
                                    <BsShieldLock size={20} className="text-[#09637E]/40" />
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between bg-white/50 p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-[#09637E]/60 mb-1">Account Password</p>
                                            <p className="text-sm text-[#09637E]">Update your access credentials frequently.</p>
                                        </div>
                                        <button className="px-6 py-2 bg-[#09637E] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#088395] transition-colors shadow-lg shadow-[#09637E]/20">
                                            Change
                                        </button>
                                    </div>


                                </div>
                            </section>

                            {/* Notifications Section */}
                            <section>
                                <div className="flex items-center justify-between mb-8 border-b border-[#09637E]/10 pb-4">
                                    <h2 className="text-3xl font-serif-premium text-[#09637E]">Notifications</h2>
                                    <BsBell size={20} className="text-[#09637E]/40" />
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-[#09637E]/60 mb-1 group-hover:text-[#09637E] transition-colors">Email Reports</p>
                                            <p className="text-sm text-[#09637E]/80">Weekly curated updates.</p>
                                        </div>
                                        <ToggleSwitch
                                            checked={settings.emailNotifications}
                                            onChange={() => toggleSetting('emailNotifications')}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-[#09637E]/60 mb-1 group-hover:text-[#09637E] transition-colors">Push Notifications</p>
                                            <p className="text-sm text-[#09637E]/80">Real-time event alerts.</p>
                                        </div>
                                        <ToggleSwitch
                                            checked={settings.pushNotifications}
                                            onChange={() => toggleSetting('pushNotifications')}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-[#09637E]/60 mb-1 group-hover:text-[#09637E] transition-colors">SMS Alerts</p>
                                            <p className="text-sm text-[#09637E]/80">Direct urgent messaging.</p>
                                        </div>
                                        <ToggleSwitch
                                            checked={settings.smsAlerts}
                                            onChange={() => toggleSetting('smsAlerts')}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-12">
                            {/* Linked Accounts Section */}
                            <section>
                                <div className="flex items-center justify-between mb-8 border-b border-[#09637E]/10 pb-4">
                                    <h2 className="text-3xl font-serif-premium text-[#09637E]">Linked Accounts</h2>
                                    <BsLink45Deg size={24} className="text-[#09637E]/40" />
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/40 backdrop-blur-sm p-6 rounded-[20px] border border-white/60 flex items-center justify-between hover:bg-white/60 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500">
                                                <BsGoogle size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#09637E]">Google</p>
                                                <p className="text-xs text-[#09637E]/60">
                                                    {!hasKnownProvider ? "Checking..." : hasGoogle ? (authUser?.email || "Connected") : "Not linked"}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${hasGoogle ? "text-[#09637E]/70" : "text-[#09637E]/40"}`}>
                                            {!hasKnownProvider ? "Checking" : hasGoogle ? "Connected" : "Not Linked"}
                                        </span>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-sm p-6 rounded-[20px] border border-white/60 flex items-center justify-between hover:bg-white/60 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#09637E]">
                                                <BsEnvelope size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#09637E]">Email & Password</p>
                                                <p className="text-xs text-[#09637E]/60">
                                                    {!hasKnownProvider ? "Checking..." : hasEmailPassword ? "Connected" : "Not linked"}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${hasEmailPassword ? "text-[#09637E]/70" : "text-[#09637E]/40"}`}>
                                            {!hasKnownProvider ? "Checking" : hasEmailPassword ? "Connected" : "Not Linked"}
                                        </span>
                                    </div>

                                    {/* Action Bar (Aligned to right column bottom for visual balance) */}
                                    <div className="pt-12 flex justify-end gap-6 items-center mt-auto">
                                        <button
                                            onClick={() => navigate("/user/profile")}
                                            className="text-xs font-black uppercase tracking-widest text-[#09637E]/40 hover:text-[#09637E] transition-colors"
                                        >
                                            Discard Changes
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="px-8 py-3 bg-[#09637E] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-[#088395] hover:scale-105 transition-all active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
                                        >
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountSettings;
