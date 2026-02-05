import React, { useState } from "react";
import { 
  Settings, 
  Globe, 
  Bell, 
  Lock, 
  Palette, 
  Smartphone, 
  Mail, 
  Database,
  Cloud,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState("General");

    const tabs = [
        { id: "General", icon: <Globe size={18} /> },
        { id: "Security", icon: <Lock size={18} /> },
        { id: "Notifications", icon: <Bell size={18} /> },
        { id: "Appearance", icon: <Palette size={18} /> }
    ];

    const SettingRow = ({ title, description, control }) => (
        <div className="flex items-center justify-between py-6 border-b border-[#f0f2f5] last:border-0 group hover:px-2 transition-all">
            <div className="max-w-xl">
                <h4 className="text-sm font-bold text-[#1a1c1e]">{title}</h4>
                <p className="text-xs text-[#94a3b8] mt-1 font-medium">{description}</p>
            </div>
            <div className="shrink-0 ml-4">
                {control}
            </div>
        </div>
    );

    const Switch = ({ enabled }) => (
        <div className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${enabled ? 'bg-[#28a785]' : 'bg-[#e2e8f0]'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'} shadow-sm`}></div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-[#fcfdfe] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 bg-white border-b border-[#f0f2f5] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#f8fafc] rounded-lg border border-[#f0f2f5]">
                        <Settings className="text-[#0b2d49]" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#1a1c1e]">System Configuration</h1>
                        <p className="text-xs text-[#94a3b8] font-medium mt-0.5">Manage global application settings and platform preferences</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Tab Menu */}
                <div className="w-64 bg-[#fcfdfe] border-r border-[#f0f2f5] py-8 px-4 flex flex-col gap-1 hidden lg:flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab.id 
                                ? "bg-[#0b2d49] text-white shadow-lg shadow-[#0b2d49]/10" 
                                : "text-[#708aa0] hover:bg-[#f1f5f9] hover:text-[#0b2d49]"
                            }`}
                        >
                            {tab.icon}
                            {tab.id}
                        </button>
                    ))}
                    <div className="mt-auto pt-8 border-t border-[#f0f2f5]">
                        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#f0f2f5]">
                            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 text-center text-center">System Health</p>
                            <div className="flex items-center justify-center gap-2 text-[#28a785]">
                                <Settings size={14} className="animate-spin-slow" />
                                <span className="text-xs font-black">STABLE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 custom-scrollbar">
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-black text-[#1a1c1e] tracking-tight">{activeTab} Preferences</h2>
                            <button className="text-xs font-bold text-[#28a785] bg-[#ebf7f3] px-3 py-1.5 rounded-lg border border-[#28a785]/10 hover:shadow-md transition-all">
                                Save All Changes
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#f0f2f5] shadow-sm p-4 lg:p-8">
                            <SettingRow 
                                title="Platform Language" 
                                description="Select the default display language for the administrative interface and customer communications."
                                control={
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-xs font-bold text-[#0b2d49] cursor-pointer">
                                        English (US) <ChevronRight size={14} className="rotate-90" />
                                    </div>
                                }
                            />
                            <SettingRow 
                                title="Maintenance Mode" 
                                description="Disable public facing site and show maintenance screen while performing system updates."
                                control={<Switch enabled={false} />}
                            />
                            <SettingRow 
                                title="Two-Factor Authentication" 
                                description="Require a secure code from an authenticator app for all administrative logins."
                                control={<Switch enabled={true} />}
                            />
                            <SettingRow 
                                title="Data Retention Policy" 
                                description="Automatically archive event logs and transaction history older than 2 years to cold storage."
                                control={<Switch enabled={true} />}
                            />
                            <SettingRow 
                                title="Webhook URL" 
                                description="The endpoint for receiving real-time platform event updates to external systems."
                                control={
                                    <div className="flex items-center gap-2 px-4 py-2 bg-[#f1f5f9] rounded-lg text-xs font-mono text-[#0b2d49] group cursor-pointer">
                                        https://api.okkazo.com/webhooks/v1 <Smartphone size={14} className="text-[#94a3b8]" />
                                    </div>
                                }
                            />
                        </div>
                    </section>
                    
                    <section className="bg-gradient-to-br from-[#0b2d49] to-[#1a4b70] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-0"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0">
                                <Database size={32} className="text-[#d7a444]" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-bold mb-2">Automated Optimization</h3>
                                <p className="text-white/60 text-sm leading-relaxed max-w-lg">
                                    The system is currently running on V4 Internal Core. Database indexing and asset minification are auto-managed for peek performance.
                                </p>
                            </div>
                            <button className="px-6 py-3 bg-white text-[#0b2d49] rounded-xl text-sm font-black shadow-lg hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                                Perform Audit
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
