import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { 
  Settings, 
  Globe, 
    ChevronRight,
  CheckCircle2
} from "lucide-react";
import { fetchWithAuth } from "../../../utils/apiHandler";
import { refreshAccessToken } from "../../../store/slices/authSlice";

const STORAGE_KEY = 'okkazo.admin.settings.v1';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const DEFAULT_SETTINGS = {
    general: {
        vendorPayoutMode: 'DEMO',
    },
};

const safeParse = (raw) => {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const safeJson = (raw) => {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const AdminSettings = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("General");

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saveState, setSaveState] = useState({ status: 'idle', message: '' }); // idle | saving | saved | error

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? safeParse(raw) : null;
        if (!parsed) return;

        // shallow merge to preserve defaults for new keys
        setSettings((prev) => ({
            ...prev,
            ...parsed,
            general: { ...prev.general, ...(parsed.general || {}) },
        }));
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadPaymentSettings = async () => {
            try {
                const response = await fetchWithAuth(
                    `${API_BASE_URL}/api/orders/settings`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const data = await safeJson(await response.text());
                if (!response.ok || !data?.success) {
                    return;
                }

                const mode = String(data?.data?.vendorPayoutMode || 'DEMO').trim().toUpperCase() === 'RAZORPAY'
                    ? 'RAZORPAY'
                    : 'DEMO';

                if (!cancelled) {
                    setSettings((prev) => ({
                        ...prev,
                        general: {
                            ...prev.general,
                            vendorPayoutMode: mode,
                        },
                    }));
                }
            } catch {
                // keep local fallback
            }
        };

        loadPaymentSettings();
        return () => {
            cancelled = true;
        };
    }, [dispatch]);

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

    const handleSaveAll = useCallback(async () => {
        const vendorPayoutMode = String(settings?.general?.vendorPayoutMode || 'DEMO').trim().toUpperCase() === 'RAZORPAY'
            ? 'RAZORPAY'
            : 'DEMO';

        setSaveState({ status: 'saving', message: '' });

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/orders/settings`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ vendorPayoutMode }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(await response.text());
            if (!response.ok || !data?.success) {
                throw new Error(data?.message || 'Could not save payout mode settings');
            }

            const effectiveMode = String(data?.data?.vendorPayoutMode || 'DEMO').trim().toUpperCase() === 'RAZORPAY'
                ? 'RAZORPAY'
                : 'DEMO';

            setSettings((prev) => ({
                ...prev,
                general: {
                    ...prev.general,
                    vendorPayoutMode: effectiveMode,
                },
            }));

            if (effectiveMode !== vendorPayoutMode) {
                setSaveState({
                    status: 'saved',
                    message: 'Saved. Effective payout mode is DEMO because live Razorpay payouts are disabled on server.',
                });
                return;
            }

            setSaveState({ status: 'saved', message: 'Saved' });
            window.setTimeout(() => setSaveState({ status: 'idle', message: '' }), 1500);
        } catch (error) {
            setSaveState({ status: 'error', message: error?.message || 'Could not save settings' });
        }
    }, [dispatch, settings]);

    const tabs = [
        { id: "General", icon: <Globe size={18} /> }
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

    const tabRows = useMemo(() => {
        if (activeTab === 'General') {
            return [
                {
                    title: 'Vendor Payout Mode',
                    description: 'Choose whether vendor payouts use DEMO simulation or live Razorpay Route transfers.',
                    control: (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-xs font-bold text-[#0b2d49]">
                            <select
                                value={settings.general.vendorPayoutMode}
                                onChange={(e) => updateSetting('general', 'vendorPayoutMode', e.target.value)}
                                className="bg-transparent outline-none cursor-pointer"
                                aria-label="Vendor payout mode"
                            >
                                <option value="DEMO">DEMO (no real transfer)</option>
                                <option value="RAZORPAY">RAZORPAY (live transfer)</option>
                            </select>
                            <ChevronRight size={14} className="rotate-90 text-[#94a3b8]" />
                        </div>
                    ),
                },
            ];
        }
        return [];
    }, [activeTab, settings]);

    const saveButton = useMemo(() => {
        if (saveState.status === 'saving') {
            return (
                <button
                    type="button"
                    disabled
                    className="text-xs font-bold text-[#0b2d49] bg-[#e9eff1] px-3 py-1.5 rounded-lg border border-[#d6dee5] cursor-not-allowed"
                >
                    Saving...
                </button>
            );
        }
        if (saveState.status === 'saved') {
            return (
                <div
                    className="flex items-center gap-2 text-xs font-bold text-[#28a785] bg-[#ebf7f3] px-3 py-1.5 rounded-lg border border-[#28a785]/10"
                    title={saveState.message || 'Saved'}
                >
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
    }, [handleSaveAll, saveState]);

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

                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
