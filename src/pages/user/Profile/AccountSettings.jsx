import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SecuritySection from "../../../components/User/Settings/SecuritySection";
import NotificationSection from "../../../components/User/Settings/NotificationSection";
import PrivacySection from "../../../components/User/Settings/PrivacySection";
import LinkedAccountsSection from "../../../components/User/Settings/LinkedAccountsSection";

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
            } catch {
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
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-12 pb-20">
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
                        <SecuritySection settings={settings} toggleSetting={toggleSetting} />

                        {/* Notification Preferences */}
                        <NotificationSection settings={settings} toggleSetting={toggleSetting} />

                        {/* Privacy Section */}
                        <PrivacySection settings={settings} toggleSetting={toggleSetting} />

                        {/* Linked Accounts */}
                        <LinkedAccountsSection />

                        {/* Actions Button */}
                        <div className="flex items-center justify-end gap-6 pt-10">
                            <button 
                                onClick={() => navigate("/user/profile")}
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
        </div>
    );
};

export default AccountSettings;
