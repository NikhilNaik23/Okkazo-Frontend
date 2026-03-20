import React, { useEffect, useMemo, useState } from "react";
import { 
  Settings, 
  Globe, 
  Bell, 
  Lock, 
  Palette, 
  Smartphone, 
  Mail, 
  Database,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

const STORAGE_KEY = 'okkazo.admin.settings.v1';

const DEFAULT_SETTINGS = {
    general: {
        language: 'en-US',
        maintenanceMode: false,
        requireAdmin2FA: true,
        dataRetentionYears: 2,
        webhookUrl: 'https://api.okkazo.com/webhooks/v1',
    },
    security: {
        minPasswordLength: 10,
        requireUpperLower: true,
        requireNumber: true,
        requireSpecialChar: false,
        sessionTimeoutMinutes: 60,
        lockoutEnabled: true,
        lockoutAttempts: 5,
    },
    appearance: {
        theme: 'system',
        density: 'comfortable',
        reducedMotion: false,
        tableStriping: true,
    },
    notifications: {
        // intentionally not functional per request
    },
};

const safeParse = (raw) => {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const isValidUrl = (value) => {
    try {
        const u = new URL(String(value));
        return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
        return false;
    }
};

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState("General");

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saveState, setSaveState] = useState({ status: 'idle', message: '' }); // idle | saved | error

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? safeParse(raw) : null;
        if (!parsed) return;

        // shallow merge to preserve defaults for new keys
        setSettings((prev) => ({
            ...prev,
            ...parsed,
            general: { ...prev.general, ...(parsed.general || {}) },
            security: { ...prev.security, ...(parsed.security || {}) },
            appearance: { ...prev.appearance, ...(parsed.appearance || {}) },
        }));
    }, []);

    const updateSetting = (section, key, value) => {
        setSettings((prev) => ({
            ...prev,
            [section]: {
                ...(prev?.[section] || {}),
                [key]: value,
            },
        }));
        setSaveState({ status: 'idle', message: '' });
    };

    const handleSaveAll = () => {
        // basic validation
        const webhookUrl = settings?.general?.webhookUrl;
        if (webhookUrl && !isValidUrl(webhookUrl)) {
            setSaveState({ status: 'error', message: 'Webhook URL must be a valid http(s) URL' });
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            setSaveState({ status: 'saved', message: 'Saved' });
            window.setTimeout(() => setSaveState({ status: 'idle', message: '' }), 1500);
        } catch {
            setSaveState({ status: 'error', message: 'Could not save settings' });
        }
    };

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

    const Switch = ({ enabled, onChange, label }) => (
        <button
            type="button"
            role="switch"
            aria-label={label}
            aria-checked={Boolean(enabled)}
            onClick={() => onChange?.(!enabled)}
            className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? 'bg-[#28a785]' : 'bg-[#e2e8f0]'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'} shadow-sm`}></div>
        </button>
    );

    const tabRows = useMemo(() => {
        if (activeTab === 'General') {
            return [
                {
                    title: 'Platform Language',
                    description: 'Select the default display language for the administrative interface and customer communications.',
                    control: (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-xs font-bold text-[#0b2d49]">
                            <select
                                value={settings.general.language}
                                onChange={(e) => updateSetting('general', 'language', e.target.value)}
                                className="bg-transparent outline-none cursor-pointer"
                                aria-label="Platform language"
                            >
                                <option value="en-US">English (US)</option>
                                <option value="en-GB">English (UK)</option>
                            </select>
                            <ChevronRight size={14} className="rotate-90 text-[#94a3b8]" />
                        </div>
                    ),
                },
                {
                    title: 'Maintenance Mode',
                    description: 'Disable public facing site and show maintenance screen while performing system updates.',
                    control: (
                        <Switch
                            enabled={settings.general.maintenanceMode}
                            onChange={(v) => updateSetting('general', 'maintenanceMode', v)}
                            label="Maintenance Mode"
                        />
                    ),
                },
                {
                    title: 'Two-Factor Authentication',
                    description: 'Require a secure code from an authenticator app for all administrative logins.',
                    control: (
                        <Switch
                            enabled={settings.general.requireAdmin2FA}
                            onChange={(v) => updateSetting('general', 'requireAdmin2FA', v)}
                            label="Require Admin 2FA"
                        />
                    ),
                },
                {
                    title: 'Data Retention Policy',
                    description: 'Automatically archive event logs and transaction history older than the selected period to cold storage.',
                    control: (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-xs font-bold text-[#0b2d49]">
                            <select
                                value={String(settings.general.dataRetentionYears)}
                                onChange={(e) => updateSetting('general', 'dataRetentionYears', Number(e.target.value))}
                                className="bg-transparent outline-none cursor-pointer"
                                aria-label="Data retention years"
                            >
                                <option value="1">1 year</option>
                                <option value="2">2 years</option>
                                <option value="5">5 years</option>
                            </select>
                            <Database size={14} className="text-[#94a3b8]" />
                        </div>
                    ),
                },
                {
                    title: 'Webhook URL',
                    description: 'The endpoint for receiving real-time platform event updates to external systems.',
                    control: (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#f1f5f9] rounded-lg border border-transparent focus-within:border-[#0b2d49]/10">
                                <input
                                    type="url"
                                    value={settings.general.webhookUrl}
                                    onChange={(e) => updateSetting('general', 'webhookUrl', e.target.value)}
                                    className="bg-transparent outline-none text-xs font-mono text-[#0b2d49] w-[320px] max-w-[50vw]"
                                    placeholder="https://..."
                                    aria-label="Webhook URL"
                                />
                                <Smartphone size={14} className="text-[#94a3b8]" />
                            </div>
                        </div>
                    ),
                },
            ];
        }

        if (activeTab === 'Security') {
            return [
                {
                    title: 'Minimum Password Length',
                    description: 'Set the minimum number of characters required for admin and manager passwords.',
                    control: (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-xs font-bold text-[#0b2d49]">
                            <select
                                value={String(settings.security.minPasswordLength)}
                                onChange={(e) => updateSetting('security', 'minPasswordLength', Number(e.target.value))}
                                className="bg-transparent outline-none cursor-pointer"
                                aria-label="Minimum password length"
                            >
                                <option value="8">8</option>
                                <option value="10">10</option>
                                <option value="12">12</option>
                                <option value="14">14</option>
                            </select>
                            <Lock size={14} className="text-[#94a3b8]" />
                        </div>
                    ),
                },
                {
                    title: 'Password Complexity',
                    description: 'Require stronger passwords by enforcing character rules.',
                    control: (
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Upper/Lower</span>
                                <Switch
                                    enabled={settings.security.requireUpperLower}
                                    onChange={(v) => updateSetting('security', 'requireUpperLower', v)}
                                    label="Require upper and lower"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Number</span>
                                <Switch
                                    enabled={settings.security.requireNumber}
                                    onChange={(v) => updateSetting('security', 'requireNumber', v)}
                                    label="Require number"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Special</span>
                                <Switch
                                    enabled={settings.security.requireSpecialChar}
                                    onChange={(v) => updateSetting('security', 'requireSpecialChar', v)}
                                    label="Require special char"
                                />
                            </div>
                        </div>
                    ),
                },
                {
                    title: 'Account Lockout',
                    description: 'Temporarily lock accounts after repeated failed login attempts.',
                    control: (
                        <div className="flex items-center gap-3">
                            <Switch
                                enabled={settings.security.lockoutEnabled}
                                onChange={(v) => updateSetting('security', 'lockoutEnabled', v)}
                                label="Account lockout"
                            />
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-xs font-bold text-[#0b2d49]">
                                <select
                                    disabled={!settings.security.lockoutEnabled}
                                    value={String(settings.security.lockoutAttempts)}
                                    onChange={(e) => updateSetting('security', 'lockoutAttempts', Number(e.target.value))}
                                    className="bg-transparent outline-none cursor-pointer disabled:opacity-60"
                                    aria-label="Lockout attempts"
                                >
                                    <option value="3">3 attempts</option>
                                    <option value="5">5 attempts</option>
                                    <option value="10">10 attempts</option>
                                </select>
                            </div>
                        </div>
                    ),
                },
            ];
        }

        if (activeTab === 'Appearance') {
            return [
                {
                    title: 'Theme',
                    description: 'Choose how the admin interface should appear.',
                    control: (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-xs font-bold text-[#0b2d49]">
                            <select
                                value={settings.appearance.theme}
                                onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                                className="bg-transparent outline-none cursor-pointer"
                                aria-label="Theme"
                            >
                                <option value="system">System</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                            <Palette size={14} className="text-[#94a3b8]" />
                        </div>
                    ),
                },
                {
                    title: 'Layout Density',
                    description: 'Control spacing and compactness across tables and panels.',
                    control: (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-xs font-bold text-[#0b2d49]">
                            <select
                                value={settings.appearance.density}
                                onChange={(e) => updateSetting('appearance', 'density', e.target.value)}
                                className="bg-transparent outline-none cursor-pointer"
                                aria-label="Layout density"
                            >
                                <option value="comfortable">Comfortable</option>
                                <option value="compact">Compact</option>
                            </select>
                        </div>
                    ),
                },
                {
                    title: 'Reduced Motion',
                    description: 'Reduce animations and motion effects across the admin interface.',
                    control: (
                        <Switch
                            enabled={settings.appearance.reducedMotion}
                            onChange={(v) => updateSetting('appearance', 'reducedMotion', v)}
                            label="Reduced motion"
                        />
                    ),
                },
                {
                    title: 'Table Striping',
                    description: 'Improve readability in tables by alternating row backgrounds.',
                    control: (
                        <Switch
                            enabled={settings.appearance.tableStriping}
                            onChange={(v) => updateSetting('appearance', 'tableStriping', v)}
                            label="Table striping"
                        />
                    ),
                },
            ];
        }

        // Notifications intentionally left non-functional
        return [
            {
                title: 'Email Alerts',
                description: 'Notification settings are not enabled yet.',
                control: (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-xs font-bold text-[#94a3b8]">
                        <Mail size={14} /> Coming soon
                    </div>
                ),
            },
        ];
    }, [activeTab, settings]);

    const saveButton = useMemo(() => {
        if (saveState.status === 'saved') {
            return (
                <div className="flex items-center gap-2 text-xs font-bold text-[#28a785] bg-[#ebf7f3] px-3 py-1.5 rounded-lg border border-[#28a785]/10">
                    <CheckCircle2 size={14} /> Saved
                </div>
            );
        }
        if (saveState.status === 'error') {
            return (
                <button
                    type="button"
                    onClick={handleSaveAll}
                    className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:shadow-md transition-all"
                    title={saveState.message}
                >
                    Save All Changes
                </button>
            );
        }
        return (
            <button
                type="button"
                onClick={handleSaveAll}
                className="text-xs font-bold text-[#28a785] bg-[#ebf7f3] px-3 py-1.5 rounded-lg border border-[#28a785]/10 hover:shadow-md transition-all"
            >
                Save All Changes
            </button>
        );
    }, [saveState, settings]);

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
                            {saveButton}
                        </div>

                        <div className="bg-white rounded-2xl border border-[#f0f2f5] shadow-sm p-4 lg:p-8">
                            {tabRows.map((row) => (
                                <SettingRow
                                    key={row.title}
                                    title={row.title}
                                    description={row.description}
                                    control={row.control}
                                />
                            ))}
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
