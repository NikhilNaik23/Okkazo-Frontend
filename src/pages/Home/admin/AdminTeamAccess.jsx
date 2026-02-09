import React, { useState } from "react";
import { 
  Users, 
  Shield, 
  Plus, 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Lock,
  ChevronDown
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const AdminTeamAccess = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const teamMembers = [
        {
            id: "#T-1001",
            name: "Alexander Pierce",
            role: "Super Admin",
            email: "alexander@okkazo.com",
            status: "ACTIVE",
            access: "Full Access",
            avatar: "AP",
            lastActive: "2 mins ago"
        },
        {
            id: "#T-1002",
            name: "Sarah Jenkins",
            role: "Financial Manager",
            email: "sarah.j@okkazo.com",
            status: "ACTIVE",
            access: "Billing & Reports",
            avatar: "SJ",
            lastActive: "1 hour ago"
        },
        {
            id: "#T-1003",
            name: "Michael Chen",
            role: "Event Coordinator",
            email: "m.chen@okkazo.com",
            status: "INACTIVE",
            access: "Event Management",
            avatar: "MC",
            lastActive: "3 days ago"
        },
        {
            id: "#T-1004",
            name: "Elena Rodriguez",
            role: "Security Lead",
            email: "elena.r@okkazo.com",
            status: "ACTIVE",
            access: "User Verification",
            avatar: "ER",
            lastActive: "Just now"
        }
    ];

    const stats = [
        { label: "Total Members", value: "12", icon: <Users size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Admins", value: "4", icon: <Shield size={18} />, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Pending Invites", value: "2", icon: <Mail size={18} />, color: "text-[#d7a444]", bg: "bg-amber-50" }
    ];

    return (
        <div className="flex flex-col h-full bg-[#fcfdfe] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-[#f0f2f5] shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-[#1a1c1e]">Team Access Control</h1>
                    <p className="text-xs text-[#94a3b8] font-medium mt-0.5">Manage permissions and system access levels</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                        <input 
                            type="text" 
                            placeholder="Find a team member..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 pl-10 pr-4 py-2 bg-[#f1f5f9] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#0b2d49]/10 focus:outline-none transition-all placeholder:text-[#94a3b8]"
                        />
                    </div>
                    <button 
                        onClick={() => navigate("add")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0b2d49] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4b70] transition-all shadow-md active:scale-95"
                    >
                        <UserPlus size={16} />
                        Add Manager
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-[#f0f2f5] shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#b4bdc6] uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-2xl font-black text-[#1a1c1e]">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl border border-[#f0f2f5] shadow-sm overflow-hidden auto-rows-min">
                    <div className="p-4 border-b border-[#f0f2f5] flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-bold text-[#1a1c1e]">Team Roster</h3>
                            <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#94a3b8] text-[10px] font-bold rounded-full">4 total</span>
                        </div>
                        <button className="text-xs font-bold text-[#0b2d49] hover:underline flex items-center gap-1 group">
                            Role Settings
                            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#fcfdfe] text-[10px] font-bold text-[#cbd5e1] uppercase tracking-[0.15em] border-b border-[#f0f2f5]">
                                    <th className="px-6 py-4">Identity</th>
                                    <th className="px-6 py-4">System Role</th>
                                    <th className="px-6 py-4">Access Scope</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Activity</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f0f2f5]">
                                {teamMembers.map((member, idx) => (
                                    <tr key={idx} className="hover:bg-[#f8fafc] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#0b2d49]/10 text-[#0b2d49] flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                                                    {member.avatar}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#1a1c1e] group-hover:text-[#0b2d49] transition-colors">{member.name}</p>
                                                    <p className="text-[11px] text-[#94a3b8] font-medium">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-[#28a785]" />
                                                <span className="text-xs font-bold text-[#1a1c1e]">{member.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2 py-1 bg-[#f1f5f9] text-[#64748b] text-[10px] font-bold rounded-lg uppercase">
                                                {member.access}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 font-bold text-[10px]">
                                                <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-[#28a785] animate-pulse' : 'bg-[#94a3b8]'}`}></div>
                                                <span className={member.status === 'ACTIVE' ? 'text-[#28a785]' : 'text-[#94a3b8]'}>{member.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[11px] font-medium text-[#94a3b8] italic">{member.lastActive}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-[#94a3b8] hover:text-[#0b2d49] hover:bg-white rounded-lg transition-all">
                                                    <Lock size={16} />
                                                </button>
                                                <button className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl border border-dashed border-[#e9eff1]">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-[#f0f2f5]">
                        <Shield className="text-[#d7a444]" size={16} />
                    </div>
                    <p className="text-xs text-[#94a3b8] font-medium">
                        <span className="font-bold text-[#1a1c1e]">Admin Tip:</span> Only Super Admins can manage role permissions and Invite/Deactivate team members.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminTeamAccess;
