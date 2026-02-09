import React from "react";
import { BsBell } from "react-icons/bs";
import Toggle from "./Toggle";

const NotificationSection = ({ settings, toggleSetting }) => {
    return (
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
    );
};

export default NotificationSection;
