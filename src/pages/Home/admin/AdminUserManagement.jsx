import React, { useEffect, useState } from 'react';
import { 
    Users, Activity, Store, ShieldCheck, Search, ChevronDown, 
    MoreVertical, BellRing, Ban
} from 'lucide-react';
import { fetchWithNgrok } from '../../../utils/apiHandler';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const roleOptions = ['ALL', 'USER', 'VENDOR', 'MANAGER', 'ADMIN'];
const notificationGroupOptions = ['ALL', 'USER', 'VENDOR', 'MANAGER', 'ADMIN'];

const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
};

const getAccountStatus = (user) => {
    if (user?.accountStatus) {
        const normalized = String(user.accountStatus).toUpperCase();
        if (normalized === 'ACTIVE') return 'Active';
        if (normalized === 'BLOCKED') return 'Blocked';
        return 'Suspended';
    }

    if (user?.isActive === false) return 'Blocked';
    if (!user?.lastLogin) return 'Suspended';
    return 'Active';
};

const renderStatusBadge = (status) => {
    if (status === 'Active') {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                Active
            </span>
        );
    }

    if (status === 'Blocked') {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                Blocked
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span>
            Suspended
        </span>
    );
};

const AdminUserManagement = () => {
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [selectedUserForNotification, setSelectedUserForNotification] = useState(null);
    const [notificationTargetMode, setNotificationTargetMode] = useState('USER');
    const [notificationForm, setNotificationForm] = useState({
        title: '',
        message: '',
        type: 'SYSTEM_ANNOUNCEMENT',
        category: 'SYSTEM',
        groupRole: 'ALL',
    });
    const [isSendingNotification, setIsSendingNotification] = useState(false);
    const [isUpdatingBlockState, setIsUpdatingBlockState] = useState(false);

    const [roleFilter, setRoleFilter] = useState('ALL');
    const [isRoleOpen, setIsRoleOpen] = useState(false);

    // Rows per page
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [isRowsOpen, setIsRowsOpen] = useState(false);
    const rowOptions = [5, 10, 20, 50];

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, byRole: {} });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        limit: usersPerPage,
    });

    const closeNotificationModal = () => {
        setIsNotificationModalOpen(false);
        setSelectedUserForNotification(null);
        setNotificationForm({
            title: '',
            message: '',
            type: 'SYSTEM_ANNOUNCEMENT',
            category: 'SYSTEM',
            groupRole: 'ALL',
        });
        setNotificationTargetMode('USER');
    };

    const handleOpenNotificationModal = (user) => {
        setNotificationTargetMode('USER');
        setSelectedUserForNotification(user);
        setNotificationForm((prev) => ({
            ...prev,
            title: prev.title || 'Important account update',
        }));
        setIsNotificationModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleOpenGroupNotificationModal = () => {
        const defaultGroupRole = roleFilter && notificationGroupOptions.includes(roleFilter) ? roleFilter : 'ALL';
        setNotificationTargetMode('GROUP');
        setSelectedUserForNotification(null);
        setNotificationForm((prev) => ({
            ...prev,
            title: prev.title || 'Platform announcement',
            groupRole: defaultGroupRole,
        }));
        setIsNotificationModalOpen(true);
        setIsRoleOpen(false);
        setOpenDropdownId(null);
    };

    const handleSendNotification = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('No access token found');

            const title = String(notificationForm.title || '').trim();
            const message = String(notificationForm.message || '').trim();

            if (!title || !message) {
                throw new Error('Please provide both title and message');
            }

            setIsSendingNotification(true);

            let response;
            if (notificationTargetMode === 'GROUP') {
                const selectedGroupRole = String(notificationForm.groupRole || 'ALL').toUpperCase();
                response = await fetchWithNgrok(`${API_BASE_URL}/api/notifications/system/broadcast`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        title,
                        message,
                        type: notificationForm.type,
                        category: notificationForm.category,
                        roles: [selectedGroupRole],
                        metadata: {
                            source: 'ADMIN_USER_MANAGEMENT',
                            target: 'GROUP',
                        },
                    }),
                });
            } else {
                const recipientAuthId = String(selectedUserForNotification?.authId || '').trim();
                const recipientRole = String(selectedUserForNotification?.role || 'USER').toUpperCase();

                if (!recipientAuthId) {
                    throw new Error('Selected user does not have a valid auth ID');
                }

                response = await fetchWithNgrok(`${API_BASE_URL}/api/notifications/system/send-to-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        recipientAuthId,
                        recipientRole,
                        title,
                        message,
                        type: notificationForm.type,
                        category: notificationForm.category,
                        metadata: {
                            source: 'ADMIN_USER_MANAGEMENT',
                            target: 'USER',
                        },
                    }),
                });
            }

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to send notification');
            }

            if (notificationTargetMode === 'GROUP') {
                const targetedUsers = Number(data?.data?.targetedUsers || 0);
                toast.success(`${notificationForm.groupRole} notification sent to ${targetedUsers} users`);
            } else {
                toast.success('Notification sent successfully');
            }
            closeNotificationModal();
        } catch (notificationError) {
            toast.error(notificationError?.message || 'Failed to send notification');
        } finally {
            setIsSendingNotification(false);
        }
    };

    const handleToggleBlockAccount = async (user) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('No access token found');

            const authId = String(user?.authId || '').trim();
            if (!authId) throw new Error('User auth ID is missing');

            const accountStatus = getAccountStatus(user);
            const shouldUnblock = accountStatus === 'Blocked';
            const action = shouldUnblock ? 'unblock' : 'block';
            const params = new URLSearchParams({ authId });

            setIsUpdatingBlockState(true);

            const response = await fetchWithNgrok(`${API_BASE_URL}/auth/internal/team-access/${action}?${params.toString()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.message || `Failed to ${action} account`);
            }

            setUsers((prevUsers) => prevUsers.map((item) => {
                if (String(item?.authId || '') !== authId) return item;
                return {
                    ...item,
                    accountStatus: shouldUnblock ? 'ACTIVE' : 'BLOCKED',
                    isActive: shouldUnblock,
                };
            }));

            toast.success(shouldUnblock ? 'Account unblocked successfully' : 'Account blocked successfully');
            setOpenDropdownId(null);
        } catch (blockError) {
            toast.error(blockError?.message || 'Failed to update account status');
        } finally {
            setIsUpdatingBlockState(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            setLoading(true);
            setError('');

            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) throw new Error('No access token found');

                const params = new URLSearchParams({
                    page: String(currentPage),
                    limit: String(usersPerPage),
                });

                const trimmedSearch = searchQuery.trim();
                if (trimmedSearch) params.append('search', trimmedSearch);
                if (roleFilter !== 'ALL') params.append('role', roleFilter);

                const response = await fetchWithNgrok(`${API_BASE_URL}/auth/admin/platform-users?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    signal: controller.signal,
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data?.message || 'Failed to fetch users');
                }

                const incomingUsers = Array.isArray(data?.data) ? data.data : [];
                setUsers(incomingUsers);
                setOpenDropdownId(null);

                setPagination({
                    currentPage: data?.pagination?.currentPage || currentPage,
                    totalPages: data?.pagination?.totalPages || 0,
                    totalUsers: data?.pagination?.totalUsers || incomingUsers.length,
                    limit: data?.pagination?.limit || usersPerPage,
                });

                setStats({
                    totalUsers: data?.stats?.totalUsers || 0,
                    activeUsers: data?.stats?.activeUsers || 0,
                    byRole: data?.stats?.byRole || {},
                });
            } catch (fetchError) {
                if (fetchError?.name !== 'AbortError') {
                    setUsers([]);
                    setError(fetchError.message || 'Failed to fetch users');
                }
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [currentPage, usersPerPage, searchQuery, roleFilter]);

    const totalPages = pagination.totalPages || 0;
    const prevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };
    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const fromCount = pagination.totalUsers > 0 ? ((currentPage - 1) * usersPerPage) + 1 : 0;
    const toCount = pagination.totalUsers > 0 ? ((currentPage - 1) * usersPerPage) + users.length : 0;

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fa] h-full">
            <div className="max-w-350 mx-auto space-y-8">
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
                                <h3 className="text-3xl font-extrabold text-[#00182d] mt-1">{stats.totalUsers.toLocaleString()}</h3>
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
                                <h3 className="text-3xl font-extrabold text-[#00182d] mt-1">{(stats.activeUsers || 0).toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                <Activity size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-[#43474d]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            From auth-service statistics
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,24,45,0.03)] border border-amber-50/50 transition-transform hover:scale-[1.01]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-[#43474d]">Vendors</p>
                                <h3 className="text-3xl font-extrabold text-[#00182d] mt-1">{(stats.byRole?.VENDOR || 0).toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                                <Store size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-amber-700 font-medium">
                            Role breakdown
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,24,45,0.03)] border border-red-50/50 transition-transform hover:scale-[1.01]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-[#43474d]">Admins</p>
                                <h3 className="text-3xl font-extrabold text-[#00182d] mt-1">{(stats.byRole?.ADMIN || 0).toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg text-red-600">
                                <ShieldCheck size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-red-700 font-medium">
                            Elevated access accounts
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
                            <button
                                type="button"
                                onClick={handleOpenGroupNotificationModal}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0b2d49] text-white text-sm font-semibold hover:brightness-110"
                            >
                                <BellRing size={16} />
                                Notify Group
                            </button>
                            <label className="text-sm font-medium text-[#6b7280]">Role:</label>
                            <div className="relative flex items-center">
                                <button 
                                    onClick={() => setIsRoleOpen(!isRoleOpen)}
                                    className="flex items-center justify-between w-32 bg-[#f8f9fa] border border-[#d1d5db] hover:border-gray-400 rounded-md py-1.5 px-3 text-sm font-medium text-[#111827] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                >
                                    <span>{roleFilter === 'ALL' ? 'All' : roleFilter}</span>
                                    <ChevronDown size={16} className="text-[#6b7280]" strokeWidth={2.5} />
                                </button>
                                {isRoleOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsRoleOpen(false)}></div>
                                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#d1d5db] shadow-xl z-50 rounded-b-md overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-100">
                                            {roleOptions.map(option => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setRoleFilter(option);
                                                        setCurrentPage(1);
                                                        setIsRoleOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm font-medium ${roleFilter === option ? 'bg-[#1a73e8] text-white' : 'text-[#111827] hover:bg-gray-100'} transition-colors whitespace-nowrap`}
                                                >
                                                    {option === 'ALL' ? 'All' : option}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table Shell */}
                    <div className="overflow-visible relative min-h-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f3f4f5]/50 text-[#43474d] text-[11px] font-bold uppercase tracking-widest border-b border-[#c3c7ce]/10">
                                    <th className="px-8 py-5">Identity</th>
                                    <th className="px-8 py-5">Join Date</th>
                                    <th className="px-8 py-5">Account Status</th>
                                    <th className="px-8 py-5">Role</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#c3c7ce]/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-8 text-center text-sm text-[#43474d]">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-8 text-center text-sm text-[#ba1a1a]">
                                            {error}
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-8 text-center text-sm text-[#43474d]">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => {
                                        const accountStatus = getAccountStatus(user);
                                        const displayName = user?.name || user?.fullName || 'Unknown User';
                                        const displayRole = String(user?.role || 'USER').toUpperCase();
                                        const userKey = user?.id || user?._id || user?.authId || user?.email;
                                        const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0b2d49&color=fff`;

                                        return (
                                        <tr key={userKey} className="hover:bg-[#f3f4f5]/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        alt={`${displayName}'s Avatar`} 
                                                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-offset-2 ring-[#0b2d49] transition-all" 
                                                        src={avatarUrl}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-bold text-[#00182d] leading-tight">{displayName}</div>
                                                        <div className="text-xs text-[#43474d]">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-medium text-[#43474d]">{formatDate(user.memberSince || user.createdAt)}</td>
                                            <td className="px-8 py-5">
                                                {renderStatusBadge(accountStatus)}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#f3f4f5] text-[#00182d]">
                                                    {displayRole}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right relative">
                                                <button 
                                                    className="p-2 hover:bg-[#e7e8e9] rounded-full transition-colors text-[#73777e]"
                                                    onClick={() => setOpenDropdownId(openDropdownId === userKey ? null : userKey)}
                                                >
                                                    <MoreVertical size={20} />
                                                </button>
                                                
                                                {openDropdownId === userKey && (
                                                    <>
                                                        <div className="fixed inset-0 z-50 cursor-default" onClick={() => setOpenDropdownId(null)}></div>
                                                        <div className="absolute right-8 top-12 w-64 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,24,45,0.15)] border border-[#c3c7ce]/20 z-60 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                                                            <button 
                                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#f3f4f5] transition-colors"
                                                                onClick={() => handleOpenNotificationModal(user)}
                                                            >
                                                                <BellRing size={18} className="text-blue-500" />
                                                                <span className="text-sm font-medium text-[#00182d]">Send Notification</span>
                                                            </button>

                                                            <button 
                                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors"
                                                                onClick={() => handleToggleBlockAccount(user)}
                                                                disabled={isUpdatingBlockState}
                                                            >
                                                                <Ban size={18} className="text-[#ba1a1a]" />
                                                                <span className="text-sm font-bold text-[#ba1a1a]">
                                                                    {getAccountStatus(user) === 'Blocked' ? 'Unblock Account' : 'Block Account'}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                        );
                                    })
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
                                {fromCount}-{toCount} of {pagination.totalUsers}
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
                                disabled={currentPage >= totalPages || totalPages === 0}
                                className="px-3 py-1 text-xs font-bold text-[#00182d] border border-[#d1d5db] rounded-md hover:bg-[#f8f9fa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isNotificationModalOpen && (
                <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/50"
                        onClick={closeNotificationModal}
                        aria-label="Close notification modal overlay"
                    ></button>
                    <div className="relative z-121 w-full max-w-lg rounded-2xl border border-[#dbe2ea] bg-white shadow-[0_24px_80px_rgba(0,24,45,0.28)]">
                        <div className="px-6 py-5 border-b border-[#eef2f7]">
                            <h3 className="text-xl font-extrabold text-[#00182d]">
                                {notificationTargetMode === 'GROUP' ? 'Send Group Notification' : 'Send Notification'}
                            </h3>
                            <p className="text-sm text-[#5f6b78] mt-1">
                                {notificationTargetMode === 'GROUP'
                                    ? `To group: ${notificationForm.groupRole}`
                                    : `To: ${selectedUserForNotification?.name || selectedUserForNotification?.username || selectedUserForNotification?.email || 'Selected user'}`}
                            </p>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            {notificationTargetMode === 'GROUP' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6b78] mb-2">Recipient Group</label>
                                    <select
                                        className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0b2d49]/20 bg-white"
                                        value={notificationForm.groupRole}
                                        onChange={(e) => setNotificationForm((prev) => ({ ...prev, groupRole: e.target.value }))}
                                    >
                                        {notificationGroupOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6b78] mb-2">Title</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0b2d49]/20"
                                    placeholder="Enter notification title"
                                    value={notificationForm.title}
                                    onChange={(e) => setNotificationForm((prev) => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6b78] mb-2">Message</label>
                                <textarea
                                    className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0b2d49]/20 min-h-30"
                                    placeholder="Write your notification message"
                                    value={notificationForm.message}
                                    onChange={(e) => setNotificationForm((prev) => ({ ...prev, message: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-[#eef2f7] flex items-center justify-end gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg border border-[#d1d5db] text-sm font-semibold text-[#334155] hover:bg-[#f8fafc]"
                                onClick={closeNotificationModal}
                                disabled={isSendingNotification}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg bg-[#0b2d49] text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={handleSendNotification}
                                disabled={isSendingNotification}
                            >
                                {isSendingNotification ? 'Sending...' : 'Send Notification'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
