import React, { useEffect, useState } from "react";
import { 
  Users, 
  Shield, 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
    Lock,
    LockOpen,
    Filter,
    MessageSquare
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { blockTeamMember, fetchTeamAccess, unblockTeamMember } from "../../../store/slices/adminSlice";

const AdminTeamAccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [openActionMenuAuthId, setOpenActionMenuAuthId] = useState(null);
    const [filterRole, setFilterRole] = useState("ALL");
    const { teamMembers, teamStats, teamPagination, teamLoading, teamError, submitting } = useSelector((state) => state.admin);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            dispatch(fetchTeamAccess({ search: searchTerm.trim(), page: 1, limit: 50 }));
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [dispatch, searchTerm]);

    const formatLastActive = (lastActive) => {
        if (!lastActive) return "Never";
        const date = new Date(lastActive);
        if (Number.isNaN(date.getTime())) return "Unknown";
        return date.toLocaleString();
    };

    const stats = [
        { label: "Total Members", value: String(teamStats.totalMembers || 0), icon: <Users size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Admins", value: String(teamStats.admins || 0), icon: <Shield size={18} />, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Pending Invites", value: String(teamStats.pendingInvites || 0), icon: <Mail size={18} />, color: "text-[#d7a444]", bg: "bg-amber-50" }
    ];

    const handleToggleBlock = async (member) => {
        try {
            if (member.isActive) {
                await dispatch(blockTeamMember(member.authId)).unwrap();
                toast.success("Team member blocked");
            } else {
                await dispatch(unblockTeamMember(member.authId)).unwrap();
                toast.success("Team member unblocked");
            }
            setOpenActionMenuAuthId(null);
        } catch (error) {
            toast.error(error || "Failed to update member status");
        }
    };

    const getStatusStyles = (status) => {
        if (status === "ACTIVE") {
            return {
                dot: "bg-[#28a785] animate-pulse",
                text: "text-[#28a785]",
            };
        }

        if (status === "UNVERIFIED") {
            return {
                dot: "bg-[#d7a444]",
                text: "text-[#d7a444]",
            };
        }

        return {
            dot: "bg-[#94a3b8]",
            text: "text-[#94a3b8]",
        };
    };

    const uniqueRoles = ["ALL", ...new Set(teamMembers.map(m => m.assignedRole || m.role).filter(Boolean))];
    
    const filteredMembers = filterRole === "ALL" 
        ? teamMembers 
        : teamMembers.filter(m => (m.assignedRole || m.role) === filterRole);

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
                <div className="bg-white rounded-2xl border border-[#f0f2f5] shadow-sm auto-rows-min">
                    <div className="p-4 border-b border-[#f0f2f5] flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-2xl">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-bold text-[#1a1c1e]">Team Roster</h3>
                            <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#94a3b8] text-[10px] font-bold rounded-full">{teamPagination.total || 0} total</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#f1f5f9] px-3 py-1.5 rounded-lg border border-[#e2e8f0]">
                            <Filter size={14} className="text-[#64748b]" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="text-xs font-bold text-[#0b2d49] bg-transparent border-none focus:ring-0 cursor-pointer outline-none w-32 truncate"
                            >
                                {uniqueRoles.map(role => (
                                    <option key={role} value={role}>{role === "ALL" ? "All Roles" : role}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-visible">
                        <table className="w-full text-left rounded-b-2xl">
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
                                {teamLoading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-[#94a3b8]">Loading team members...</td>
                                    </tr>
                                )}

                                {!teamLoading && teamError && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-red-500">{teamError}</td>
                                    </tr>
                                )}

                                {!teamLoading && !teamError && filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-[#94a3b8]">No team members found matching the filter.</td>
                                    </tr>
                                )}

                                {!teamLoading && !teamError && filteredMembers.map((member, idx) => {
                                    const statusStyles = getStatusStyles(member.status);

                                    return (
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
                                                <span className="text-xs font-bold text-[#1a1c1e]">{member.assignedRole || member.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2 py-1 bg-[#f1f5f9] text-[#64748b] text-[10px] font-bold rounded-lg uppercase">
                                                {member.access}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 font-bold text-[10px]">
                                                <div className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></div>
                                                <span className={statusStyles.text}>{member.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[11px] font-medium text-[#94a3b8] italic">{formatLastActive(member.lastActive)}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="relative flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setOpenActionMenuAuthId(openActionMenuAuthId === member.authId ? null : member.authId)}
                                                    className="p-2 text-[#94a3b8] hover:text-[#0b2d49] hover:bg-[#f1f5f9] rounded-lg transition-all"
                                                    title="More actions"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>

                                                {openActionMenuAuthId === member.authId && (
                                                    <div className="absolute right-0 top-10 z-20 min-w-44 rounded-xl border border-[#f0f2f5] bg-white shadow-xl py-1 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                                                        <button 
                                                            onClick={() => {
                                                                setOpenActionMenuAuthId(null);
                                                                navigate(`/admin/chat`, { state: { selectedUser: member } });
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-[#1a1c1e] hover:bg-[#f8fafc] flex items-center gap-3 transition-colors border-b border-[#f0f2f5]"
                                                        >
                                                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                                                <MessageSquare size={14} />
                                                            </div>
                                                            <span>Send Message</span>
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => handleToggleBlock(member)}
                                                            disabled={submitting}
                                                            className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-[#1a1c1e] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
                                                        >
                                                            <div className={`p-1.5 rounded-lg ${member.isActive ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-[#28a785]'}`}>
                                                                {member.isActive ? <Lock size={14} /> : <LockOpen size={14} />}
                                                            </div>
                                                            <span>
                                                                {member.isActive ? "Block Account" : "Unblock Account"}
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
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
