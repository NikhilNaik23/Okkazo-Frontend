import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { selectUser, selectIsAuthenticated, updateProfile, selectUpdateSuccess, selectIsLoading, selectError, clearUpdateSuccess, clearError } from "../../../store/slices/authSlice";
import ProfilePictureSection from "../../../components/User/Profile/ProfilePictureSection";
import ProfileFormFields from "../../../components/User/Profile/ProfileFormFields";
import LocationSection from "../../../components/User/Profile/LocationSection";
import BioSection from "../../../components/User/Profile/BioSection";
import InterestsSection from "../../../components/User/Profile/InterestsSection";

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
                        <ProfilePictureSection authUser={authUser} formData={formData} />

                        {/* Form Grid */}
                        <ProfileFormFields formData={formData} setFormData={setFormData} />

                        {/* Location Section with Map */}
                        <LocationSection 
                            formData={formData}
                            showLocationPicker={showLocationPicker}
                            setShowLocationPicker={setShowLocationPicker}
                            handleLocationSelect={handleLocationSelect}
                        />

                        {/* Bio Section */}
                        <BioSection formData={formData} setFormData={setFormData} />

                        {/* Interests Tag Cloud */}
                        <InterestsSection formData={formData} removeInterest={removeInterest} />

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
