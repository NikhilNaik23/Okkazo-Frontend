import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LocationPicker from "../../../components/Map/LocationPicker";
import { BsPencil, BsX, BsGeoAlt } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { selectUser, selectIsAuthenticated, updateProfile, selectUpdateSuccess, selectIsLoading, selectError, clearUpdateSuccess, clearError } from "../../../store/slices/authSlice";

const EditProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const authUser = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectIsLoading);
    const updateSuccess = useSelector(selectUpdateSuccess);
    const error = useSelector(selectError);
    
    const [formData, setFormData] = useState({
        name: "",
        fullName: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        interests: []
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Please login to edit your profile");
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    // Initialize form with user data
    useEffect(() => {
        if (authUser && !isInitialized) {
            setFormData({
                name: authUser.name || "",
                fullName: authUser.fullName || "",
                email: authUser.email || "",
                phone: authUser.phone || "",
                location: authUser.location || "",
                bio: authUser.bio || "",
                interests: authUser.interests || []
            });
            setIsInitialized(true);
        }
    }, [authUser, isInitialized]);

    // Handle update success
    useEffect(() => {
        if (updateSuccess) {
            toast.success("Profile updated successfully!");
            dispatch(clearUpdateSuccess());
            setTimeout(() => navigate("/user/profile"), 1000);
        }
    }, [updateSuccess, dispatch, navigate]);

    // Handle errors
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Only send fields that can be updated (matching backend User model)
        const updateData = {
            name: formData.name,
            fullName: formData.fullName,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
            interests: formData.interests
        };
        
        dispatch(updateProfile(updateData));
    };

    const handleLocationSelect = (locationData) => {
        if (locationData.isValid) {
            setFormData({...formData, location: locationData.address});
            setShowLocationPicker(false);
        }
    };

    const removeInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== interest)
        }));
    };

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-12 pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Edit Profile</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Manage your personal information and preferences.</p>
                </div>

                {!isInitialized ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
                        <div className="w-12 h-12 border-4 border-[#d7a444] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Profile...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 animate-in fade-in duration-500">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center mb-12 border-b border-gray-50 pb-12">
                            <div className="relative mb-4">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50">
                                    <img src={authUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=d7a444&color=0b2d49&size=128`} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <button type="button" className="absolute bottom-1 right-1 w-10 h-10 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-[#0b2d49] hover:text-[#d7a444] transition-all">
                                    <BsPencil size={18} />
                                </button>
                            </div>
                            <p className="text-sm font-black mb-1">Profile Picture</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">JPG, GIF or PNG. Max size of 2MB.</p>
                        </div>

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Username</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Full Name</label>
                                <input 
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    placeholder="Enter your full name"
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all placeholder:text-gray-300 placeholder:font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Email Address</label>
                                <input 
                                    type="email"
                                    required
                                    disabled
                                    value={formData.email}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-gray-50 outline-none font-bold text-gray-400 transition-all cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Phone Number</label>
                                <input 
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="Enter your phone number"
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all placeholder:text-gray-300 placeholder:font-medium"
                                />
                            </div>
                        </div>

                        {/* Location Section with Map */}
                        <div className="space-y-4 mb-10">
                            <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Location</label>
                            
                            {/* Current Location Display */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 font-bold text-[#0b2d49] flex items-center gap-3">
                                    <BsGeoAlt className="text-[#d7a444] shrink-0" size={18} />
                                    <span className={formData.location ? "" : "text-gray-400 font-medium"}>
                                        {formData.location || "No location selected"}
                                    </span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                                    className={`px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                                        showLocationPicker 
                                            ? "bg-[#0b2d49] text-white" 
                                            : "bg-[#d7a444]/10 text-[#d7a444] hover:bg-[#d7a444] hover:text-white border border-[#d7a444]/20"
                                    }`}
                                >
                                    {showLocationPicker ? "Close Map" : "Pick on Map"}
                                </button>
                            </div>

                            {/* Location Picker Map */}
                            {showLocationPicker && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-xs text-gray-400 font-medium mb-3 pl-2">
                                        Click on the map to select your location. We'll automatically detect the address.
                                    </p>
                                    <LocationPicker 
                                        lat={null} 
                                        lng={null} 
                                        onLocationSelect={handleLocationSelect}
                                        className="h-80 w-full rounded-2xl overflow-hidden border-2 border-gray-50 relative z-0 bg-gray-100"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 mb-10">
                            <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Short Bio</label>
                            <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                rows="4"
                                placeholder="Tell us a bit about yourself..."
                                className="w-full px-6 py-5 bg-white rounded-2xl border-2 border-gray-50 focus:border-[#d7a444] outline-none font-bold text-[#0b2d49] transition-all resize-none leading-relaxed placeholder:text-gray-300 placeholder:font-medium"
                            />
                        </div>

                        {/* Interests Tag Cloud */}
                        <div className="space-y-6 mb-12">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Interests</label>
                                <button type="button" className="text-xs font-black text-[#d7a444] hover:underline">+ Add New</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {formData.interests.length > 0 ? (
                                    formData.interests.map((interest) => (
                                        <div 
                                            key={interest}
                                            className="px-5 py-2.5 bg-emerald-50/30 text-[#0b2d49] rounded-2xl flex items-center gap-2 font-black text-sm border border-emerald-100 hover:border-[#d7a444] transition-all group"
                                        >
                                            {interest}
                                            <button 
                                                type="button"
                                                onClick={() => removeInterest(interest)}
                                                className="p-1 hover:bg-white rounded-full transition-colors text-emerald-300 hover:text-red-500"
                                            >
                                                <BsX size={16} strokeWidth={1} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No interests added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-6 pt-10 border-t border-gray-50">
                            <button 
                                type="button"
                                onClick={() => navigate("/user/profile")}
                                disabled={isLoading}
                                className="flex-1 py-5 bg-white text-[#0b2d49] font-black rounded-2xl border-2 border-gray-50 hover:bg-gray-50 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-5 bg-[#0caf7d] text-white font-black rounded-2xl shadow-xl shadow-emerald-500/10 hover:bg-[#09926a] transition-all text-sm uppercase tracking-widest active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
};

export default EditProfile;
