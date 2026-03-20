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
    MessageSquare,
    ChevronDown
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { blockTeamMember, fetchTeamAccess, unblockTeamMember } from "../../../store/slices/adminSlice";

const AdminTeamAccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [openActionMenuAuthId, setOpenActionMenuAuthId] = useState(null);
    
    // Custom Filter Role Dropdown State
    const [filterRole, setFilterRole] = useState("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    
    // Custom Rows Per Page Dropdown State
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isRowsOpen, setIsRowsOpen] = useState(false);
    const rowOptions = [5, 10, 20, 50];
    
    const { teamMembers, teamStats, teamPagination, teamLoading, teamError, submitting } = useSelector((state) => state.admin);

    useEffect(() => {
        const initialSearch = (searchParams.get('search') || '').trim();
        if (initialSearch && initialSearch !== searchTerm) {
            setSearchTerm(initialSearch);
        }
    }, [searchParams, searchTerm]);

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

    // Pagination Logic
    const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }
    const currentMembers = filteredMembers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

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
                        type="button"
                        onClick={() => navigate("/admin/team-access/add")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#28a785] text-white rounded-lg text-sm font-bold shadow-sm shadow-[#28a785]/20 hover:brightness-110 active:scale-95 transition-all"
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
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-[#6b7280]">Role:</label>
                            <div className="relative flex items-center">
                                <button 
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center justify-between w-32 bg-[#f8f9fa] border border-[#d1d5db] hover:border-gray-400 rounded-md py-1.5 px-3 text-sm font-medium text-[#111827] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                >
                                    <span>{filterRole === "ALL" ? "All" : filterRole}</span>
                                    <ChevronDown size={16} className="text-[#6b7280]" strokeWidth={2.5} />
                                </button>
                                {isFilterOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsFilterOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-1 w-full bg-white border border-[#d1d5db] shadow-xl z-50 rounded-b-md overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-100">
                                            {uniqueRoles.map(role => (
                                                <button
                                                    key={role}
                                                    onClick={() => {
                                                        setFilterRole(role);
                                                        setCurrentPage(1);
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm font-medium ${filterRole === role ? 'bg-[#1a73e8] text-white' : 'text-[#111827] hover:bg-gray-100'} transition-colors whitespace-nowrap`}
                                                >
                                                    {role === "ALL" ? "All" : role}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-visible min-h-[400px]">
                        <table className="w-full text-left rounded-b-2xl">
                            <thead>
                                <tr className="bg-[#fcfdfe] text-[10px] font-bold text-[#cbd5e1] uppercase tracking-[0.15em] border-b border-[#f0f2f5]">
                                    <th className="px-6 py-4">Identity</th>
                                    <th className="px-6 py-4">System Role</th>
                                    <th className="px-6 py-4">Assigned Role</th>
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

                                {!teamLoading && !teamError && currentMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-[#94a3b8]">No team members found.</td>
                                    </tr>
                                )}

                                {!teamLoading && !teamError && currentMembers.map((member, idx) => {
                                    const statusStyles = getStatusStyles(member.status);

                                    return (
                                    <tr key={idx} className="hover:bg-[#f8fafc] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#0b2d49]/10 text-[#0b2d49] flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                                                    {member.avatar || member.name.substring(0,2).toUpperCase()}
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
                                                {member.assignedRole || member.role}
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
                                                    <>
                                                        <div className="fixed inset-0 z-50 cursor-default" onClick={() => setOpenActionMenuAuthId(null)}></div>
                                                        <div className="absolute right-0 top-10 z-[60] min-w-44 rounded-xl border border-[#f0f2f5] bg-white shadow-xl py-1 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
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
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Footer */}
                    <div className="p-6 border-t border-[#f0f2f5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-[#6b7280]">Rows per page:</label>
                            <div className="relative flex items-center">
                                <button 
                                    onClick={() => setIsRowsOpen(!isRowsOpen)}
                                    className="flex items-center justify-between w-16 bg-[#f8f9fa] border border-[#d1d5db] hover:border-gray-400 rounded-md py-1 px-2 text-sm font-medium text-[#111827] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                >
                                    <span>{rowsPerPage}</span>
                                    <ChevronDown size={14} className="text-[#6b7280]" strokeWidth={2.5} />
                                </button>
                                {isRowsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsRowsOpen(false)}></div>
                                        <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-[#d1d5db] shadow-xl z-50 rounded-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-100">
                                            {rowOptions.map(option => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setRowsPerPage(option);
                                                        setCurrentPage(1);
                                                        setIsRowsOpen(false);
                                                    }}
                                                    className={`w-full text-center px-1 py-1.5 text-sm font-medium ${rowsPerPage === option ? 'bg-[#1a73e8] text-white' : 'text-[#111827] hover:bg-gray-100'} transition-colors`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-4 py-2 text-xs font-semibold text-[#6b7280]">
                                {((currentPage - 1) * rowsPerPage) + (currentMembers.length > 0 ? 1 : 0)}-{((currentPage - 1) * rowsPerPage) + currentMembers.length} of {filteredMembers.length}
                            </span>
                            <button 
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-xs font-bold text-[#00182d] border border-[#d1d5db] rounded-md hover:bg-[#f8f9fa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Prev
                            </button>
                            <button 
                                onClick={nextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1 text-xs font-bold text-[#00182d] border border-[#d1d5db] rounded-md hover:bg-[#f8f9fa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTeamAccess;
