import React, { useState } from "react";
import { 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  UserPlus, 
  Phone, 
  Mail, 
  User, 
  Building2, 
  Lock, 
  CheckCircle2,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminManager = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState(true);

    const handleAddManager = (e) => {
        e.preventDefault();
        toast.success("Invitation sent to manager successfully!");
        navigate("/admin/team-access");
    };

    return (
        <div className="flex flex-col h-full bg-[#fcfdfe] overflow-hidden">
            {/* Header / Breadcrumbs */}
            <div className="px-8 py-5 flex flex-col gap-4 shrink-0">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#94a3b8]">
                    <span>System</span>
                    <ChevronRight size={14} />
                    <span className="cursor-pointer hover:text-[#0b2d49]" onClick={() => navigate("/admin/team-access")}>Team Access</span>
                    <ChevronRight size={14} />
                    <span className="text-[#1a1c1e] font-bold">Add Event Manager</span>
                </div>

                <div>
                    <h1 className="text-[32px] font-black text-[#1a1c1e] tracking-tight">Add Event Manager</h1>
                    <p className="text-[#28a785] text-lg font-medium opacity-80 mt-1">
                        Onboard a new manager to your team and define their access levels.
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Main Form Card */}
                <div className="bg-white rounded-3xl border border-[#f0f2f5] shadow-sm overflow-hidden auto-rows-min max-w-5xl">
                    <div className="px-8 py-6 border-b border-[#f0f2f5]">
                        <h3 className="text-lg font-bold text-[#1a1c1e]">Manager Details</h3>
                    </div>

                    <form className="p-8 space-y-8" onSubmit={handleAddManager}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#1a1c1e]">Full Name</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Michael Chen" 
                                            className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#28a785]/30 focus:ring-4 focus:ring-[#28a785]/5 focus:outline-none transition-all placeholder:text-[#cbd5e1]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#1a1c1e]">Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="m.chen@okkazo.com" 
                                        className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#28a785]/30 focus:ring-4 focus:ring-[#28a785]/5 focus:outline-none transition-all placeholder:text-[#cbd5e1]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#1a1c1e]">Phone Number</label>
                                    <div className="flex gap-2">
                                        <div className="w-16 px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm text-[#94a3b8] font-bold flex items-center justify-center">
                                            +1
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="(555) 000-0000" 
                                            className="flex-1 px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#28a785]/30 focus:ring-4 focus:ring-[#28a785]/5 focus:outline-none transition-all placeholder:text-[#cbd5e1]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#1a1c1e]">Department</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#28a785]/30 focus:ring-4 focus:ring-[#28a785]/5 focus:outline-none transition-all appearance-none cursor-pointer text-[#1a1c1e] font-medium font-sans">
                                            <option disabled selected>Select Department / Category</option>
                                            <optgroup label="Public Events">
                                                <option>Music Festivals & Concerts</option>
                                                <option>Tech Conferences & Expos</option>
                                                <option>Sporting Tournaments</option>
                                                <option>Community Workshops</option>
                                            </optgroup>
                                            <optgroup label="Private Events">
                                                <option>Premium Weddings</option>
                                                <option>Corporate Galas</option>
                                                <option>Birthday & Personal Parties</option>
                                                <option>Private VIP Dinners</option>
                                            </optgroup>
                                            <optgroup label="Core Operations">
                                                <option>Administrative Operations</option>
                                                <option>Financial Oversight</option>
                                                <option>Security & Compliance</option>
                                            </optgroup>
                                        </select>
                                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#94a3b8] pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-[#1a1c1e]">Assigned Role</label>
                                        <button type="button" className="text-[11px] font-bold text-[#28a785] flex items-center gap-1 hover:underline">
                                            <Info size={12} />
                                            View permissions
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <select className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#28a785]/30 focus:ring-4 focus:ring-[#28a785]/5 focus:outline-none transition-all appearance-none cursor-pointer text-[#1a1c1e] font-medium">
                                            <option>Senior Event Manager</option>
                                            <option>Accountant</option>
                                            <option>Security Lead</option>
                                            <option>Junior Manager</option>
                                        </select>
                                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#94a3b8] pointer-events-none" />
                                    </div>
                                </div>

                                <div className="p-5 bg-[#ebf7f3]/50 border border-[#ebf7f3] rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-[#1a1c1e]">Active Status</p>
                                        <p className="text-[11px] text-[#28a785] font-medium mt-0.5">Enable immediate login access</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setStatus(!status)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${status ? 'bg-[#28a785]' : 'bg-[#e2e8f0]'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${status ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section in Card */}
                        <div className="pt-8 mt-4 border-t border-[#f0f2f5] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#ebf7f3] text-[#28a785] flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="max-w-[400px]">
                                    <h4 className="text-sm font-bold text-[#1a1c1e]">Security Confirmation</h4>
                                    <p className="text-[11px] text-[#94a3b8] leading-relaxed font-medium">
                                        An invitation email will be sent to the manager to set their initial password and complete the setup.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={() => navigate("/admin/team-access")}
                                    className="px-6 py-2.5 text-sm font-bold text-[#64748b] hover:text-[#1a1c1e] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-8 py-3 bg-[#28a785] text-white rounded-xl text-sm font-black shadow-lg shadow-[#28a785]/20 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    Add Manager
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Access Tier Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                    <div className="bg-white p-6 rounded-2xl border border-[#f0f2f5] shadow-sm relative group overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 size={16} className="text-[#28a785]" />
                            <span className="text-[10px] font-black text-[#28a785] uppercase tracking-widest">Access Tier 1</span>
                        </div>
                        <h4 className="text-base font-black text-[#1a1c1e] mb-2">Full Management</h4>
                        <p className="text-xs text-[#94a3b8] leading-relaxed font-medium">
                            Can manage all event details, vendors, and team assignments.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#f0f2f5] shadow-sm opacity-60">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock size={16} className="text-[#cbd5e1]" />
                            <span className="text-[10px] font-black text-[#cbd5e1] uppercase tracking-widest">Access Tier 2</span>
                        </div>
                        <h4 className="text-base font-black text-[#1a1c1e] mb-2">Ops Limited</h4>
                        <p className="text-xs text-[#94a3b8] leading-relaxed font-medium">
                            Focus on logistics and schedules only. No financial access.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#f0f2f5] shadow-sm opacity-60">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock size={16} className="text-[#cbd5e1]" />
                            <span className="text-[10px] font-black text-[#cbd5e1] uppercase tracking-widest">Access Tier 3</span>
                        </div>
                        <h4 className="text-base font-black text-[#1a1c1e] mb-2">View Only</h4>
                        <p className="text-xs text-[#94a3b8] leading-relaxed font-medium">
                            Reporting access for stakeholder review and planning.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminManager;
