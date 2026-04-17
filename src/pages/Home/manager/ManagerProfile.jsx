import React, { useEffect, useMemo, useState } from 'react';
import {
    User, Mail, Lock, Save, LogOut, ChevronRight, Building2, Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    changePassword,
    clearError,
    clearUpdateSuccess,
    fetchCurrentUser,
    logout,
    selectAuthProvider,
    selectError,
    selectIsLoading,
    selectUpdateSuccess,
    selectUser,
    updateProfile,
} from '../../../store/slices/authSlice';

const ManagerProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('general');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });

    const user = useSelector(selectUser);
    const authProvider = useSelector(selectAuthProvider);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const updateSuccess = useSelector(selectUpdateSuccess);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    useEffect(() => {
        setFormData({
            name: user?.name || user?.fullName || 'Manager Account',
            email: user?.email || 'manager@okkazo.com',
        });
    }, [user]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [dispatch, error]);

    useEffect(() => {
        if (updateSuccess) {
            toast.success('Profile updated successfully!');
            dispatch(clearUpdateSuccess());
        }
    }, [dispatch, updateSuccess]);

    const displayName = useMemo(
        () => user?.name || user?.fullName || 'Manager Account',
        [user]
    );

    const displayEmail = useMemo(
        () => user?.email || 'manager@okkazo.com',
        [user]
    );

    const displayDepartment = useMemo(
        () => user?.department || 'Not assigned',
        [user]
    );

    const displayAssignedRole = useMemo(
        () => user?.assignedRole || 'Not assigned',
        [user]
    );

    const initials = useMemo(() => {
        const name = (displayName || '').trim();
        if (!name) return 'MA';

        return name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('') || 'MA';
    }, [displayName]);

    const sections = [
        { id: 'general', label: 'General', icon: User },
        { id: 'security', label: 'Password & Security', icon: Lock },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setFormData({
            name: displayName,
            email: displayEmail,
        });
    };

    const handleSave = () => {
        const nextName = (formData.name || '').trim();
        const currentName = (user?.name || user?.fullName || '').trim();

        if (!nextName) {
            toast.error('Name cannot be empty.');
            return;
        }

        if (nextName === currentName) {
            toast('No profile changes to save.', { icon: 'i' });
            return;
        }

        dispatch(updateProfile({ name: nextName }));
    };

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const provider = String(user?.authProvider || authProvider || '').toUpperCase();
    const hasKnownProvider = ['EMAIL', 'SIGN_IN_WITH_GOOGLE', 'BOTH'].includes(provider);
    const hasEmailPassword = provider === 'EMAIL' || provider === 'BOTH';

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();

        if (!hasKnownProvider) {
            toast.error('Checking account provider. Please try again.');
            return;
        }

        if (!hasEmailPassword) {
            toast.error('Password change is available only for email-password accounts.');
            return;
        }

        const currentPassword = String(passwordForm.currentPassword || '').trim();
        const newPassword = String(passwordForm.newPassword || '');
        const confirmPassword = String(passwordForm.confirmPassword || '');

        if (!currentPassword) {
            toast.error('Current password is required');
            return;
        }

        if (!newPassword) {
            toast.error('New password is required');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New password and confirm password do not match');
            return;
        }

        setIsChangingPassword(true);
        try {
            const result = await dispatch(changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            }));

            if (changePassword.fulfilled.match(result)) {
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                toast.success('Password changed successfully. A confirmation email has been sent.');
                return;
            }

            toast.error(result?.payload || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-400 mx-auto min-h-screen bg-gray-50/30">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Account Settings</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* 1. Sidebar Nav */}
                <div className="lg:w-72 shrink-0 space-y-8">
                    {/* User Mini Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-lg">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{displayName}</h3>
                            <p className="text-xs text-gray-500 font-medium truncate">{displayEmail}</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                            ? 'bg-white text-teal-600 shadow-sm border border-gray-100'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-teal-500' : 'text-gray-400'}`} />
                                        {section.label}
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-teal-400" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Danger Zone Link */}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                </div>

                {/* 2. Main Content Form */}
                <div className="flex-1 max-w-4xl">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-150">
                        {activeSection === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">General Information</h2>
                                    <p className="text-gray-500 text-sm">Update your personal details here.</p>
                                </div>

                                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row gap-8">
                                    <div className="md:w-1/3">
                                        <label className="text-sm font-bold text-gray-900 block mb-1">Public Profile</label>
                                        <p className="text-xs text-gray-500 leading-relaxed">Your avatar is generated from your name initials.</p>
                                    </div>
                                    <div className="md:w-2/3 space-y-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-full bg-teal-100 border-4 border-white shadow-sm flex items-center justify-center text-teal-700 text-2xl font-black">
                                                {initials}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    readOnly
                                                    className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 font-medium text-gray-500 outline-none"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400">Email is managed by account authentication settings.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="department"
                                                    value={displayDepartment}
                                                    readOnly
                                                    className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 font-medium text-gray-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Assigned Role</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="assignedRole"
                                                    value={displayAssignedRole}
                                                    readOnly
                                                    className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 font-medium text-gray-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-8 flex items-center justify-end gap-3">
                                    <button onClick={handleCancel} className="px-5 py-2.5 text-gray-500 font-bold hover:text-gray-900 text-sm">Cancel</button>
                                    <button disabled={isLoading} onClick={handleSave} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Password & Security</h2>
                                    <p className="text-gray-500 text-sm">Change your password securely from this panel.</p>
                                </div>

                                <form onSubmit={handlePasswordChangeSubmit} className="border border-gray-100 rounded-2xl p-6 space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordInputChange}
                                            autoComplete="current-password"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordInputChange}
                                                autoComplete="new-password"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                                placeholder="Enter new password"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordInputChange}
                                                autoComplete="new-password"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        Use at least 8 characters with uppercase, lowercase, number, and special character.
                                    </p>

                                    {!hasKnownProvider && (
                                        <p className="text-xs text-amber-600 font-medium">Checking your account provider...</p>
                                    )}

                                    {hasKnownProvider && !hasEmailPassword && (
                                        <p className="text-xs text-amber-600 font-medium">
                                            This account is using Google sign-in only. Password change is unavailable.
                                        </p>
                                    )}

                                    <div className="pt-2 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isChangingPassword || !hasKnownProvider || !hasEmailPassword}
                                            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <Lock className="w-4 h-4" /> {isChangingPassword ? 'Updating...' : 'Change Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerProfile;
