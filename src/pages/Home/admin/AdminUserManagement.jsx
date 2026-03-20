import React, { useState } from 'react';
import { 
    Users, Activity, Zap, ShieldAlert, Search, ChevronDown, 
    MoreVertical, Mail, UserRound, RefreshCw, KeyRound, Ban
} from 'lucide-react';

const AdminUserManagement = () => {
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Status Filter
    const [statusFilter, setStatusFilter] = useState("All");
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const statusOptions = ["All", "Active", "Rate Limited", "Suspended", "Blocked"];

    // Rows per page
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [isRowsOpen, setIsRowsOpen] = useState(false);
    const rowOptions = [5, 10, 20, 50];

    const allUsers = [
        { id: 1, name: "Julian Thorne", email: "julian.thorne@example.com", avatar: "https://ui-avatars.com/api/?name=Julian+Thorne&background=0b2d49&color=fff", joinDate: "Oct 12, 2023", status: "Active", riskLevel: "Low" },
        { id: 2, name: "Seraphina Moon", email: "s.moon@techflow.io", avatar: "https://ui-avatars.com/api/?name=Seraphina+Moon&background=0b2d49&color=fff", joinDate: "Nov 03, 2023", status: "Rate Limited", riskLevel: "Medium" },
        { id: 3, name: "Marcus Vane", email: "mv_99@gmail.com", avatar: "https://ui-avatars.com/api/?name=Marcus+Vane&background=0b2d49&color=fff", joinDate: "Aug 21, 2023", status: "Blocked", riskLevel: "High" },
        { id: 4, name: "Elena Rossi", email: "elena.rossi@arch.com", avatar: "https://ui-avatars.com/api/?name=Elena+Rossi&background=0b2d49&color=fff", joinDate: "Jan 15, 2024", status: "Suspended", riskLevel: "Low" },
        { id: 5, name: "David Chen", email: "d.chen@designers.co", avatar: "https://ui-avatars.com/api/?name=David+Chen&background=0b2d49&color=fff", joinDate: "Feb 02, 2024", status: "Active", riskLevel: "Low" },
        { id: 6, name: "Sarah Jenkins", email: "s.jenkins@studio.net", avatar: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=0b2d49&color=fff", joinDate: "Mar 10, 2024", status: "Active", riskLevel: "Low" },
        { id: 7, name: "Tariq Miller", email: "tmiller12@example.org", avatar: "https://ui-avatars.com/api/?name=Tariq+Miller&background=0b2d49&color=fff", joinDate: "Apr 04, 2024", status: "Rate Limited", riskLevel: "Medium" }
    ];

    // Filter Logic
    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === "All" || user.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    
    // Ensure current page is valid after filtering
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fa] h-full">
            <div className="max-w-[1400px] mx-auto space-y-8">
                {/* Header Title & Subtitle Section */}
                <section className="mb-10">
                    <h2 className="text-3xl font-extrabold text-[#00182d] tracking-tight">Platform Users</h2>
                    <p className="text-[#43474d] mt-1 text-lg">Monitor and manage all end users across environments.</p>
                </section>

                {/* Stats Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,24,45,0.03)] border border-blue-50/50 transition-transform hover:scale-[1.01]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-[#43474d]">Total Users</p>
                                <h3 className="text-3xl font-extrabold text-[#00182d] mt-1">12,842</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <Users size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
                            <Activity size={14} className="mr-1" />
                            +12% from last month
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,24,45,0.03)] border border-emerald-50/50 transition-transform hover:scale-[1.01]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-[#43474d]">Active Users</p>
                                <h3 className="text-3xl font-extrabold text-[#00182d] mt-1">8,210</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                <Activity size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-[#43474d]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            Live Now: 423 sessions
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,24,45,0.03)] border border-amber-50/50 transition-transform hover:scale-[1.01]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-[#43474d]">Rate Limited</p>
                                <h3 className="text-3xl font-extrabold text-[#00182d] mt-1">14</h3>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                                <Zap size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-amber-700 font-medium">
                            Requires manual review
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,24,45,0.03)] border border-red-50/50 transition-transform hover:scale-[1.01]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-[#43474d]">Blocked</p>
                                <h3 className="text-3xl font-extrabold text-[#00182d] mt-1">89</h3>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg text-red-600">
                                <ShieldAlert size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-red-700 font-medium">
                            Policy violations detected
                        </div>
                    </div>
                </div>

                {/* Main Content Area: Table with Controls */}
                <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,24,45,0.04)] overflow-visible">
                    {/* Controls Bar */}
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#73777e]" size={20} />
                            <input 
                                className="w-full pl-12 pr-4 py-3 bg-[#f3f4f5] border-none rounded-lg focus:ring-2 focus:ring-[#00182d]/10 text-sm placeholder:text-[#73777e] outline-none" 
                                placeholder="Search by name, email or ID..." 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-[#6b7280]">Status:</label>
                            <div className="relative flex items-center">
                                <button 
                                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                                    className="flex items-center justify-between w-32 bg-[#f8f9fa] border border-[#d1d5db] hover:border-gray-400 rounded-md py-1.5 px-3 text-sm font-medium text-[#111827] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                >
                                    <span>{statusFilter}</span>
                                    <ChevronDown size={16} className="text-[#6b7280]" strokeWidth={2.5} />
                                </button>
                                {isStatusOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsStatusOpen(false)}></div>
                                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#d1d5db] shadow-xl z-50 rounded-b-md overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-100">
                                            {statusOptions.map(option => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setStatusFilter(option);
                                                        setCurrentPage(1);
                                                        setIsStatusOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm font-medium ${statusFilter === option ? 'bg-[#1a73e8] text-white' : 'text-[#111827] hover:bg-gray-100'} transition-colors whitespace-nowrap`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table Shell */}
                    <div className="overflow-visible relative min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f3f4f5]/50 text-[#43474d] text-[11px] font-bold uppercase tracking-widest border-b border-[#c3c7ce]/10">
                                    <th className="px-8 py-5">Identity</th>
                                    <th className="px-8 py-5">Join Date</th>
                                    <th className="px-8 py-5">Account Status</th>
                                    <th className="px-8 py-5">Risk Level</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#c3c7ce]/10">
                                {currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-8 text-center text-sm text-[#43474d]">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-[#f3f4f5]/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        alt={`${user.name}'s Avatar`} 
                                                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-offset-2 ring-[#0b2d49] transition-all" 
                                                        src={user.avatar}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-bold text-[#00182d] leading-tight">{user.name}</div>
                                                        <div className="text-xs text-[#43474d]">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-medium text-[#43474d]">{user.joinDate}</td>
                                            <td className="px-8 py-5">
                                                {user.status === 'Active' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                                        Active
                                                    </span>
                                                )}
                                                {user.status === 'Rate Limited' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
                                                        Rate Limited
                                                    </span>
                                                )}
                                                {user.status === 'Blocked' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                                                        Blocked
                                                    </span>
                                                )}
                                                {user.status === 'Suspended' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span>
                                                        Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                {user.riskLevel === 'Low' && <span className="text-sm font-medium text-[#43474d]">Low</span>}
                                                {user.riskLevel === 'Medium' && <span className="text-sm font-bold text-amber-700">Medium</span>}
                                                {user.riskLevel === 'High' && <span className="text-sm font-extrabold text-[#ba1a1a]">High</span>}
                                            </td>
                                            <td className="px-8 py-5 text-right relative">
                                                <button 
                                                    className="p-2 hover:bg-[#e7e8e9] rounded-full transition-colors text-[#73777e]"
                                                    onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                                                >
                                                    <MoreVertical size={20} />
                                                </button>
                                                
                                                {openDropdownId === user.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-50 cursor-default" onClick={() => setOpenDropdownId(null)}></div>
                                                        <div className="absolute right-8 top-12 w-64 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,24,45,0.15)] border border-[#c3c7ce]/20 z-[60] py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                                                            <button 
                                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#f3f4f5] transition-colors"
                                                                onClick={() => setOpenDropdownId(null)}
                                                            >
                                                                <Mail size={18} className="text-blue-500" />
                                                                <span className="text-sm font-medium text-[#00182d]">Send Message</span>
                                                            </button>
                                                            
                                                            <button 
                                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#f3f4f5] transition-colors"
                                                                onClick={() => setOpenDropdownId(null)}
                                                            >
                                                                <UserRound size={18} className="text-slate-500" />
                                                                <span className="text-sm font-medium text-[#00182d]">View Full Profile</span>
                                                            </button>
                                                            
                                                            <div className="h-px bg-[#c3c7ce]/10 my-1"></div>
                                                            
                                                            <button 
                                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#f3f4f5] transition-colors"
                                                                onClick={() => setOpenDropdownId(null)}
                                                            >
                                                                <RefreshCw size={18} className="text-amber-500" />
                                                                <span className="text-sm font-medium text-[#00182d]">Reset Rate Limit</span>
                                                            </button>
                                                            
                                                            <button 
                                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#f3f4f5] transition-colors"
                                                                onClick={() => setOpenDropdownId(null)}
                                                            >
                                                                <KeyRound size={18} className="text-purple-500" />
                                                                <span className="text-sm font-medium text-[#00182d]">Force Password Reset</span>
                                                            </button>
                                                            
                                                            <div className="h-px bg-[#c3c7ce]/10 my-1"></div>
                                                            
                                                            <button 
                                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors"
                                                                onClick={() => setOpenDropdownId(null)}
                                                            >
                                                                <Ban size={18} className="text-[#ba1a1a]" />
                                                                <span className="text-sm font-bold text-[#ba1a1a]">Suspend Account</span>
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Footer / Pagination within the table container */}
                    <div className="p-6 border-t border-[#f0f2f5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-[#6b7280]">Rows per page:</label>
                            <div className="relative flex items-center">
                                <button 
                                    onClick={() => setIsRowsOpen(!isRowsOpen)}
                                    className="flex items-center justify-between w-16 bg-[#f8f9fa] border border-[#d1d5db] hover:border-gray-400 rounded-md py-1 px-2 text-sm font-medium text-[#111827] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                >
                                    <span>{usersPerPage}</span>
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
                                                        setUsersPerPage(option);
                                                        setCurrentPage(1);
                                                        setIsRowsOpen(false);
                                                    }}
                                                    className={`w-full text-center px-1 py-1.5 text-sm font-medium ${usersPerPage === option ? 'bg-[#1a73e8] text-white' : 'text-[#111827] hover:bg-gray-100'} transition-colors`}
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
                                {((currentPage - 1) * usersPerPage) + (currentUsers.length > 0 ? 1 : 0)}-{((currentPage - 1) * usersPerPage) + currentUsers.length} of {filteredUsers.length}
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

export default AdminUserManagement;
