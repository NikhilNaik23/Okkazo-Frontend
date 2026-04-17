import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Calendar, 
  Award, 
  ShieldCheck, 
  Edit3, 
  Lock, 
  LogOut,
  Twitter,
  Linkedin,
  Github,
  X,
  Loader2,
  Save
} from "lucide-react";
import { toast } from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  fetchCurrentUser,
    changePassword,
  updateProfile,
  logout,
  selectUser,
    selectAuthProvider,
  selectIsLoading,
  selectError,
  selectUpdateSuccess,
  clearUpdateSuccess,
  clearError
} from "../../../store/slices/authSlice";

const AdminProfile = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const authProvider = useSelector(selectAuthProvider);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const updateSuccess = useSelector(selectUpdateSuccess);

    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [formData, setFormData] = useState({
        name: "",
        fullName: "",
        phone: "",
        location: "",
    });
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [isFetchingLocationSuggestions, setIsFetchingLocationSuggestions] = useState(false);

    // Fetch user data on mount
    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    // Populate form when user data loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                fullName: user.fullName || "",
                phone: user.phone || "",
                location: user.location || "",
            });
        }
    }, [user]);

    useEffect(() => {
        const query = String(formData.location || "").trim();

        if (!isEditing || query.length <= 2) {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
            setIsFetchingLocationSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsFetchingLocationSuggestions(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
                );
                const data = await response.json();
                const suggestions = Array.isArray(data) ? data : [];
                setLocationSuggestions(suggestions);
                setShowLocationSuggestions(suggestions.length > 0);
            } catch (fetchError) {
                console.error("Error fetching location suggestions:", fetchError);
                setLocationSuggestions([]);
                setShowLocationSuggestions(false);
            } finally {
                setIsFetchingLocationSuggestions(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [formData.location, isEditing]);

    // Handle update success
    useEffect(() => {
        if (updateSuccess) {
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            setIsUpdating(false);
            dispatch(clearUpdateSuccess());
        }
    }, [updateSuccess, dispatch]);

    // Handle errors
    useEffect(() => {
        if (error) {
            toast.error(error);
            setIsUpdating(false);
            setIsChangingPassword(false);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({ ...prev, phone: value }));
    };

    const handleLocationSelect = (suggestion) => {
        const displayName = String(suggestion?.display_name || "").trim();
        if (!displayName) return;

        const parts = displayName
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);

        const normalizedLocation = parts.slice(0, 3).join(", ") || displayName;
        setFormData((prev) => ({ ...prev, location: normalizedLocation }));
        setShowLocationSuggestions(false);
        setLocationSuggestions([]);
    };

    const isPhoneValid = (phoneValue) => {
        const digits = String(phoneValue || "").replace(/\D/g, "");
        return digits.length >= 10;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        
        // Only send changed fields
        const updatedFields = {};
        Object.keys(formData).forEach(key => {
            if (formData[key] !== (user[key] || "")) {
                updatedFields[key] = formData[key];
            }
        });

        if (Object.prototype.hasOwnProperty.call(updatedFields, "phone")) {
            const normalizedPhone = String(updatedFields.phone || "").trim();
            if (normalizedPhone && !isPhoneValid(normalizedPhone)) {
                toast.error("Please enter a valid phone number with at least 10 digits");
                setIsUpdating(false);
                return;
            }
            updatedFields.phone = normalizedPhone;
        }

        if (Object.prototype.hasOwnProperty.call(updatedFields, "location")) {
            updatedFields.location = String(updatedFields.location || "").trim();
        }

        if (Object.keys(updatedFields).length === 0) {
            toast.error("No changes to save");
            setIsUpdating(false);
            return;
        }

        dispatch(updateProfile(updatedFields));
    };

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = "/login";
    };

    const handlePasswordFieldChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();

        const currentPassword = String(passwordForm.currentPassword || "").trim();
        const newPassword = String(passwordForm.newPassword || "");
        const confirmPassword = String(passwordForm.confirmPassword || "");

        if (!currentPassword) {
            toast.error("Current password is required");
            return;
        }

        if (!newPassword) {
            toast.error("New password is required");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }

        setIsChangingPassword(true);
        const result = await dispatch(changePassword({
            currentPassword,
            newPassword,
            confirmPassword,
        }));

        if (changePassword.fulfilled.match(result)) {
            setIsChangingPassword(false);
            closePasswordModal();
            toast.success("Password changed successfully. A confirmation email has been sent.");
            return;
        }

        setIsChangingPassword(false);
    };

    const getInitials = (name) => {
        if (!name) return "AD";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const formatMemberSince = (date) => {
        if (!date) return "Unknown";
        return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    const calculateYears = (date) => {
        if (!date) return "0";
        const years = Math.floor((new Date() - new Date(date)) / (365.25 * 24 * 60 * 60 * 1000));
        return years > 0 ? `${years} Year${years > 1 ? 's' : ''}+` : "< 1 Year";
    };

    // Loading state
    if (isLoading && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0b2d49]" />
            </div>
        );
    }

    const userInfo = {
        name: user?.name || "Admin User",
        fullName: user?.fullName || user?.name || "Admin User",
        role: user?.role === "ADMIN" ? "System Administrator" : user?.role || "Administrator",
        email: user?.email || "admin@okkazo.com",
        phone: user?.phone || "Not provided",
        location: user?.location || "Not provided",
        memberSince: formatMemberSince(user?.memberSince),
        avatar: user?.avatar || getInitials(user?.name),
    };

    const provider = String(user?.authProvider || authProvider || "").toUpperCase();
    const hasKnownProvider = ["EMAIL", "SIGN_IN_WITH_GOOGLE", "BOTH"].includes(provider);
    const hasEmailPassword = provider === "EMAIL" || provider === "BOTH";
    const phoneDigitsCount = String(formData.phone || "").replace(/\D/g, "").length;
    const phoneHasInput = String(formData.phone || "").trim().length > 0;
    const phoneLooksValid = !phoneHasInput || phoneDigitsCount >= 10;

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc]">
            {/* Smooth Top Gradient Background */}
            <div className="h-64 bg-gradient-to-br from-[#0b2d49] to-[#1a4b70] shrink-0 relative">
                <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                </div>
                
                {/* Profile Header Floating Overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-8 translate-y-1/2 z-10">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-6">
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-white p-1.5 shadow-2xl relative">
                                {user?.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={userInfo.name}
                                        className="w-full h-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#f3ddb1] to-[#e6c382] flex items-center justify-center text-[#0b2d49] text-4xl font-black">
                                        {getInitials(userInfo.name)}
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="flex-1 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black text-[#1a1c1e] tracking-tight">{userInfo.name}</h1>
                                <p className="text-[#64748b] font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <ShieldCheck size={16} className="text-[#28a785]" />
                                    {userInfo.role}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-6 py-2.5 bg-white border border-[#e9eff1] text-[#0b2d49] rounded-xl text-sm font-bold shadow-sm hover:bg-[#f1f5f9] transition-all flex items-center gap-2 group"
                                >
                                    <Edit3 size={16} className="group-hover:text-[#d7a444] transition-colors" />
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 pt-24 pb-12 px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column - Personal Details & Socials */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Info Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e9eff1]">
                            <h3 className="text-sm font-bold text-[#1a1c1e] mb-6 uppercase tracking-widest border-l-4 border-[#d7a444] pl-3">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-[#708aa0] group-hover:text-[#28a785] transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#b4bdc6] uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-bold text-[#1a1c1e]">{userInfo.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-[#708aa0] group-hover:text-[#d7a444] transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#b4bdc6] uppercase tracking-widest">Phone Number</p>
                                        <p className="text-sm font-bold text-[#1a1c1e]">{userInfo.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-[#708aa0] group-hover:text-[#0b2d49] transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#b4bdc6] uppercase tracking-widest">Location</p>
                                        <p className="text-sm font-bold text-[#1a1c1e]">{userInfo.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-[#f0f2f5] flex justify-center gap-6">
                                <button className="p-2.5 bg-[#f8fafc] text-[#708aa0] rounded-xl hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] transition-all hover:-translate-y-1 shadow-sm">
                                    <Twitter size={20} />
                                </button>
                                <button className="p-2.5 bg-[#f8fafc] text-[#708aa0] rounded-xl hover:bg-[#0077b5]/10 hover:text-[#0077b5] transition-all hover:-translate-y-1 shadow-sm">
                                    <Linkedin size={20} />
                                </button>
                                <button className="p-2.5 bg-[#f8fafc] text-[#708aa0] rounded-xl hover:bg-[#333]/10 hover:text-[#333] transition-all hover:-translate-y-1 shadow-sm">
                                    <Github size={20} />
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Security */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Quick Settings Section */}
                        <div className="bg-[#f8fafc] rounded-3xl p-8 border border-dashed border-[#e9eff1] flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#0b2d49]/10 text-[#0b2d49] rounded-xl shrink-0">
                                    <Lock size={20} />
                                </div>
                                <div className="text-center md:text-left">
                                    <h4 className="text-sm font-bold text-[#1a1c1e]">Security Preferences</h4>
                                    <p className="text-xs text-[#94a3b8] font-medium mt-0.5">Manage passwords and login sessions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        if (!hasKnownProvider) {
                                            toast.error("Checking account provider. Please wait.");
                                            return;
                                        }
                                        if (!hasEmailPassword) {
                                            toast.error("Password change is available only for email-password accounts.");
                                            return;
                                        }
                                        setIsPasswordModalOpen(true);
                                    }}
                                    className="px-5 py-2.5 bg-white text-[#0b2d49] text-xs font-bold rounded-xl border border-[#e9eff1] shadow-sm hover:shadow-md transition-all"
                                >
                                    Change Password
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="px-5 py-2.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    Logout Session
                                </button>
                            </div>
                        </div>

                        {/* Tenure Card */}
                        <div className="bg-[#0b2d49] rounded-3xl p-8 text-white shadow-xl shadow-[#0b2d49]/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 opacity-10 transition-transform group-hover:rotate-12">
                                <Award size={120} />
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-[#d7a444]">
                                    <Calendar size={20} />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest">Service Tenure</h3>
                            </div>
                            <p className="text-3xl font-black mb-1">{calculateYears(user?.memberSince)}</p>
                            <p className="text-white/60 text-xs font-medium">Joined Okkazo in {userInfo.memberSince}</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white p-6 border-b border-[#e9eff1] flex items-center justify-between rounded-t-3xl">
                            <h2 className="text-xl font-black text-[#1a1c1e]">Edit Profile</h2>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="p-2 hover:bg-[#f8fafc] rounded-xl transition-colors"
                            >
                                <X size={20} className="text-[#64748b]" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
                                        Display Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-[#e9eff1] rounded-xl focus:ring-2 focus:ring-[#d7a444] focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="Enter display name"
                                        minLength={2}
                                        maxLength={50}
                                        required
                                    />
                                    <p className="text-xs text-[#94a3b8] mt-1">2-50 characters</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-[#e9eff1] rounded-xl focus:ring-2 focus:ring-[#d7a444] focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="Enter full name"
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-[#94a3b8] mt-1">Max 100 characters</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
                                        Phone Number
                                    </label>
                                    <div className="phone-input-container">
                                        <PhoneInput
                                            country={"in"}
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            inputProps={{
                                                name: "phone",
                                            }}
                                            enableSearch={true}
                                            disableSearchIcon={true}
                                            containerClass="!w-full"
                                            inputClass={`!w-full !h-auto !rounded-xl !py-3 !px-4 !pl-14 !outline-none !transition-all !duration-300 !text-sm ${phoneLooksValid ? '!border !border-[#e9eff1] focus:!ring-2 focus:!ring-[#d7a444]' : '!border !border-rose-300 focus:!ring-2 focus:!ring-rose-200'}`}
                                            buttonClass="!bg-transparent !border-none !rounded-xl !pl-3"
                                            dropdownClass="!bg-white !rounded-xl !shadow-2xl !border !border-[#e9eff1] !mt-2"
                                            searchClass="!bg-white !p-2"
                                        />
                                    </div>
                                    <p className={`text-xs mt-1 ${phoneLooksValid ? 'text-[#94a3b8]' : 'text-rose-500'}`}>
                                        {phoneLooksValid
                                            ? 'Select country code and enter phone number'
                                            : 'Phone number must include at least 10 digits'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
                                        Location
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            onFocus={() => {
                                                if (locationSuggestions.length > 0) {
                                                    setShowLocationSuggestions(true);
                                                }
                                            }}
                                            onBlur={() => {
                                                setTimeout(() => setShowLocationSuggestions(false), 200);
                                            }}
                                            className="w-full px-4 py-3 border border-[#e9eff1] rounded-xl focus:ring-2 focus:ring-[#d7a444] focus:border-transparent outline-none transition-all text-sm"
                                            placeholder="City, State, Country"
                                            maxLength={100}
                                            autoComplete="off"
                                        />
                                        {isFetchingLocationSuggestions && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-[#64748b] border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}

                                        {showLocationSuggestions && locationSuggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-[#e9eff1] rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto">
                                                {locationSuggestions.map((item, index) => (
                                                    <button
                                                        key={`${String(item?.place_id || '')}-${index}`}
                                                        type="button"
                                                        onMouseDown={(event) => {
                                                            event.preventDefault();
                                                            handleLocationSelect(item);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-[#f8fafc] border-b border-[#f1f5f9] last:border-b-0"
                                                    >
                                                        <p className="text-xs font-semibold text-[#1a1c1e] truncate">
                                                            {String(item?.display_name || '').split(',')[0] || 'Unknown place'}
                                                        </p>
                                                        <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                                                            {String(item?.display_name || '')}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#94a3b8] mt-1">Max 100 characters</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#e9eff1]">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 bg-[#f8fafc] text-[#64748b] rounded-xl text-sm font-bold hover:bg-[#e9eff1] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-2.5 bg-[#0b2d49] text-white rounded-xl text-sm font-bold hover:bg-[#0a2540] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#0b2d49]/40 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-3xl border border-[#e9eff1] shadow-2xl p-7 md:p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-[#1a1c1e]">Change Password</h3>
                                <p className="text-sm text-[#64748b] mt-1">Keep your admin account secure with a strong password.</p>
                            </div>
                            <button
                                onClick={closePasswordModal}
                                className="w-9 h-9 rounded-full bg-[#f8fafc] border border-[#e9eff1] text-[#64748b] flex items-center justify-center hover:bg-white"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordChangeSubmit} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748b] block mb-2">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordFieldChange}
                                    autoComplete="current-password"
                                    className="w-full rounded-xl border border-[#e9eff1] bg-white px-4 py-3 text-sm text-[#1a1c1e] focus:outline-none focus:border-[#0b2d49]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748b] block mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordFieldChange}
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-[#e9eff1] bg-white px-4 py-3 text-sm text-[#1a1c1e] focus:outline-none focus:border-[#0b2d49]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#64748b] block mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordFieldChange}
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-[#e9eff1] bg-white px-4 py-3 text-sm text-[#1a1c1e] focus:outline-none focus:border-[#0b2d49]"
                                    required
                                />
                            </div>

                            <p className="text-xs text-[#64748b] leading-relaxed">
                                Password must be 8-72 characters and include uppercase letters, letters, numbers, and special characters.
                            </p>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closePasswordModal}
                                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#64748b] hover:text-[#1a1c1e]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="px-6 py-2.5 bg-[#0b2d49] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#0a2540] disabled:opacity-70"
                                >
                                    {isChangingPassword ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfile;
