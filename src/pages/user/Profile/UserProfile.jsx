import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { BsPencil, BsGear, BsEnvelope, BsTelephone, BsGeoAlt, BsStars, BsClockHistory, BsArrowClockwise, BsBoxArrowRight } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { selectUser, selectIsLoading as selectAuthLoading, selectIsAuthenticated, fetchCurrentUser, logout } from "../../../store/slices/authSlice";
import useNotificationFeed from "../../../hooks/useNotificationFeed";

const UserProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const authUser = useSelector(selectUser);
    const authLoading = useSelector(selectAuthLoading);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const {
        grouped: activityGrouped,
        status: activityStatus,
        refresh: refreshActivity,
    } = useNotificationFeed({
        enabled: isAuthenticated,
        limit: 25,
        fetchUnread: false,
        pollIntervalMs: 45000,
    });

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const activityItems = Array.isArray(activityGrouped?.all)
        ? activityGrouped.all.slice(0, 5)
        : [];

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate("/", { replace: true });
    };

    // Fetch user data and map to local state
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (!authUser) {
            dispatch(fetchCurrentUser());
        }
    }, [isAuthenticated, authUser, dispatch, navigate]);

    // Map authUser to local user state when it changes
    useEffect(() => {
        if (authUser) {
            setUser({
                id: authUser.id,
                authId: authUser.authId,
                name: authUser.name,
                email: authUser.email,
                phone: authUser.phone || "Not provided",
                location: authUser.location || "Not provided",
                avatar: authUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name)}&background=09637E&color=ffffff&size=200`,
                bio: authUser.bio || "",
                interests: authUser.interests || [],
                memberSince: authUser.memberSince ? new Date(authUser.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "February 2026",
                role: authUser.role,
                profileIsComplete: authUser.profileIsComplete,
                profileCompletionPercentage: authUser.profileCompletionPercentage,
                isActive: authUser.isActive,
                lastLogin: authUser.lastLogin,
            });
            setIsLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        setIsLoading(authLoading);
    }, [authLoading]);

    return (
        <div className="min-h-screen bg-[#EBF4F6] flex flex-col font-sans text-[#09637E]">
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-24 pb-20">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] shadow-xl border border-[#09637E]/5">
                        <div className="w-12 h-12 border-4 border-[#09637E] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-[#09637E]/40 uppercase tracking-widest text-xs">Loading Profile...</p>
                    </div>
                ) : user ? (
                    <>
                        {/* Hero Profile Card */}
                        <div className="bg-[#EBF4F6] rounded-[3rem] shadow-xl border border-white/50 overflow-hidden mb-12 relative animate-in fade-in duration-700">
                            {/* Top Gradient Background */}
                            <div className="h-48 bg-gradient-to-b from-[#D1E9ED] to-[#EBF4F6]"></div>

                            <div className="px-10 pb-12 flex flex-col items-center">
                                {/* Auto-centered Profile Picture Container */}
                                <div className="relative -mt-24 mb-6 group cursor-pointer">
                                    <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-[#09637E] to-[#7AB2B2] shadow-2xl">
                                        <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-white">
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        </div>
                                    </div>

                                </div>

                                <h1 className="text-5xl font-serif-premium italic font-bold mb-2 tracking-tight text-[#09637E] text-center">{user.name}</h1>
                                <p className="text-[#088395] font-medium mb-8">Member since {user.memberSince}</p>

                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => navigate("/user/edit-profile")}
                                            className="flex items-center justify-center gap-2 bg-[#09637E] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#088395] transition-all shadow-lg hover:shadow-xl active:scale-95"
                                        >
                                            <BsPencil size={14} />
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={() => navigate("/user/account-settings")}
                                            className="flex items-center justify-center gap-2 bg-white text-[#09637E] px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition-all border border-[#09637E]/10 shadow-sm active:scale-95"
                                        >
                                            <BsGear size={14} />
                                            Account Settings
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-center gap-2 bg-white text-red-600 px-8 py-3 rounded-full font-bold text-sm hover:bg-red-50 transition-all border border-red-200 shadow-sm active:scale-95"
                                    >
                                        <BsBoxArrowRight size={14} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {/* Left Column: Info & Interests */}
                            <div className="space-y-8">
                                {/* Personal Info */}
                                <div className="bg-[#EBF4F6] rounded-[2.5rem] p-8 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_16px_rgba(9,99,126,0.05)] border border-white/60">
                                    <h2 className="text-xl font-serif-premium text-[#09637E] mb-8 border-l-4 border-[#09637E] pl-4 font-bold">
                                        Personal Info
                                    </h2>
                                    <div className="space-y-6 px-2">
                                        <div className="group">
                                            <p className="text-[10px] font-black text-[#088395] uppercase tracking-widest flex items-center gap-2 mb-1">
                                                <BsEnvelope /> Email Address
                                            </p>
                                            <p className="font-bold text-[#09637E] text-sm md:text-base break-all">{user.email}</p>
                                        </div>
                                        <div className="group">
                                            <p className="text-[10px] font-black text-[#088395] uppercase tracking-widest flex items-center gap-2 mb-1">
                                                <BsTelephone /> Phone Number
                                            </p>
                                            <p className="font-bold text-[#09637E] text-sm md:text-base italic opacity-60">{user.phone}</p>
                                        </div>
                                        <div className="group">
                                            <p className="text-[10px] font-black text-[#088395] uppercase tracking-widest flex items-center gap-2 mb-1">
                                                <BsGeoAlt /> Location
                                            </p>
                                            <p className="font-bold text-[#09637E] text-sm md:text-base italic opacity-60">{user.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Interests */}
                                <div className="bg-[#EBF4F6] rounded-[2.5rem] p-8 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_16px_rgba(9,99,126,0.05)] border border-white/60 min-h-[300px] flex flex-col">
                                    <h2 className="text-xl font-serif-premium text-[#09637E] mb-8 border-l-4 border-[#09637E] pl-4 font-bold">
                                        Interests
                                    </h2>
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                        {user.interests.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {user.interests.map((interest) => (
                                                    <span
                                                        key={interest}
                                                        className="px-4 py-2 bg-white text-[#09637E] rounded-xl text-xs font-bold border border-[#09637E]/10 shadow-sm"
                                                    >
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <BsStars size={32} className="text-[#09637E]/20 mx-auto animate-pulse" />
                                                <p className="text-xs text-[#09637E]/40 italic font-serif-premium">No interests listed yet.</p>
                                                <button onClick={() => navigate("/user/edit-profile")} className="text-[10px] font-black uppercase tracking-widest text-[#09637E] border-b border-[#09637E] hover:text-[#088395] hover:border-[#088395] transition-colors pb-0.5">
                                                    Add Your Passions
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Recent Activity */}
                            <div className="lg:col-span-2">
                                <div className="bg-[#EBF4F6] rounded-[2.5rem] p-10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_16px_rgba(9,99,126,0.05)] border border-white/60 h-full relative overflow-hidden flex flex-col">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                                    <div className="mb-8 relative z-10">
                                        <div className="flex items-center justify-between gap-3">
                                            <h2 className="text-2xl font-serif-premium text-[#09637E] border-l-4 border-[#09637E] pl-4 font-bold">
                                                Recent Activity
                                            </h2>
                                            <button
                                                onClick={() => refreshActivity()}
                                                className="w-9 h-9 bg-[#09637E] rounded-full flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
                                                aria-label="Refresh recent activity"
                                                title="Refresh recent activity"
                                            >
                                                <BsArrowClockwise size={14} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/45 mt-3 pl-5">
                                            Latest 5 updates
                                        </p>
                                    </div>

                                    {activityStatus === 'loading' && activityItems.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                                            <div className="w-10 h-10 border-4 border-[#09637E]/25 border-t-[#09637E] rounded-full animate-spin mb-4" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#09637E]/50">Loading activity...</p>
                                        </div>
                                    ) : activityItems.length > 0 ? (
                                        <div className="flex-1 relative z-10 overflow-hidden">
                                            <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
                                                <div className="bg-white/40 rounded-3xl border border-white/70 p-5">
                                                    {activityItems.map((item, index) => (
                                                        <div
                                                            key={item.id}
                                                            className={`w-full text-left ${index < activityItems.length - 1 ? 'mb-4 pb-4 border-b border-[#09637E]/10' : ''}`}
                                                        >
                                                            <div className="grid grid-cols-[14px_minmax(0,1fr)_auto] items-start gap-3">
                                                                <div className="relative pt-1">
                                                                    <span className="block w-3 h-3 rounded-full bg-[#09637E] ring-4 ring-white/60" />
                                                                    {index < activityItems.length - 1 ? (
                                                                        <span className="absolute left-[5px] top-4 h-[calc(100%+0.75rem)] w-px bg-[#09637E]/20" />
                                                                    ) : null}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.bgColor || 'bg-[#EBF4F6]'}`}>
                                                                            {item.icon}
                                                                        </div>
                                                                        <h3 className="text-sm font-bold text-[#09637E] truncate">
                                                                            {item.title || 'Activity'}
                                                                        </h3>
                                                                    </div>
                                                                    <p className="text-xs text-[#09637E]/70 leading-relaxed line-clamp-2 pl-9">
                                                                        {item.message || 'A new update is available.'}
                                                                    </p>
                                                                </div>

                                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/45 mt-1 whitespace-nowrap">
                                                                    {item.time || 'Just now'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                                            <div className="w-24 h-24 rounded-full border-4 border-[#09637E]/10 flex items-center justify-center mb-6 relative">
                                                <BsClockHistory size={40} className="text-[#09637E]/20" />
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-[#7AB2B2] rounded-full opacity-50 animate-ping"></div>
                                            </div>
                                            <h3 className="font-serif-premium italic text-2xl text-[#09637E]/30 mb-2">A blank canvas for your journey.</h3>
                                            <p className="text-xs text-[#09637E]/40 max-w-xs text-center leading-relaxed">Your recent interactions and event highlights will appear here.</p>

                                            <div className="flex gap-2 mt-8">
                                                <div className="w-8 h-1.5 bg-[#09637E]/10 rounded-full"></div>
                                                <div className="w-1.5 h-1.5 bg-[#09637E]/10 rounded-full"></div>
                                                <div className="w-1.5 h-1.5 bg-[#09637E]/10 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40">
                        <p className="text-[#09637E]/40 font-bold uppercase tracking-widest text-xs">User profile not found.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserProfile;
