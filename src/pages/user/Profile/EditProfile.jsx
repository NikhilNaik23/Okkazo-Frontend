import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { BsPencil, BsGeoAlt, BsX } from "react-icons/bs";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { selectUser, selectIsAuthenticated, updateProfile, selectUpdateSuccess, selectIsLoading, selectError, clearUpdateSuccess, clearError } from "../../../store/slices/authSlice";

const PREDEFINED_INTERESTS = [
    "Tech & Innovation", "Art & Design", "Music & Live Events", "Food & Culinary",
    "Health & Wellness", "Travel & Adventure", "Business & Networking", "Science & Education",
    "Sports & Fitness", "Gaming & E-Sports", "Fashion & Lifestyle", "Literature & Writing",
    "Photography", "Film & Cinema", "Startups & Entrepreneurship", "Social Impact"
];

const EditProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux selectors
    const authUser = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectIsLoading);
    const updateSuccess = useSelector(selectUpdateSuccess);
    const error = useSelector(selectError);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "", // Stores full number with country code
        location: "",
        bio: "",
        interests: []
    });

    const [newInterest, setNewInterest] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Initialize/Redirect logic
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        if (authUser) {
            setFormData({
                name: authUser.name || "",
                email: authUser.email || "",
                phone: authUser.phone || "", // Load full phone string directly
                location: authUser.location || "",
                bio: authUser.bio || "",
                interests: authUser.interests || []
            });
        }
    }, [isAuthenticated, authUser, navigate]);

    // Handle success/error feedback
    useEffect(() => {
        if (updateSuccess) {
            toast.success("Narrative updated successfully");
            dispatch(clearUpdateSuccess());
            setTimeout(() => navigate("/user/profile"), 800);
        }
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [updateSuccess, error, dispatch, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'location') {
            setShowSuggestions(true);
        }
    };

    // Location suggestion logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (showSuggestions && formData.location && formData.location.length > 2) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=5&addressdetails=1`);
                    const data = await response.json();
                    setLocationSuggestions(data);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                }
            } else {
                setLocationSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.location, showSuggestions]);

    const handleLocationSelect = (suggestion) => {
        const address = suggestion.display_name;
        // Optionally shorten address
        const parts = address.split(',').slice(0, 3).join(',');

        setFormData(prev => ({ ...prev, location: parts }));
        setShowSuggestions(false);
        setLocationSuggestions([]);
    };

    const handlePhoneChange = (value, country, e, formattedValue) => {
        setFormData(prev => ({ ...prev, phone: `+${value}` })); // Ensure + format if backend expects it, or just use value
    };

    const toggleInterest = (interest) => {
        if (formData.interests.includes(interest)) {
            setFormData(prev => ({
                ...prev,
                interests: prev.interests.filter(i => i !== interest)
            }));
        } else {
            if (formData.interests.length >= 8) {
                toast.error("You can select up to 8 interests");
                return;
            }
            setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, interest]
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateProfile(formData));
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Using OpenStreetMap Nominatim for free reverse geocoding (no API key required for low volume)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.county || "";
                        const state = data.address.state || "";
                        const country = data.address.country || "";

                        // Construct a clean location string, e.g., "San Francisco, California, United States"
                        const locationComponents = [city, state, country].filter(part => part && part.trim().length > 0);
                        const locationString = locationComponents.join(", ");

                        setFormData(prev => ({ ...prev, location: locationString }));
                        toast.success("Location updated from browser");
                    } else {
                        toast.error("Could not determine address from coordinates");
                    }
                } catch (err) {
                    console.error("Geocoding error:", err);
                    toast.error("Failed to fetch location details");
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setIsLocating(false);
                let msg = "Location error";
                switch (error.code) {
                    case 1: msg = "Location permission denied"; break;
                    case 2: msg = "Location unavailable"; break;
                    case 3: msg = "Location request timed out"; break;
                    default: msg = "An unknown error occurred"; break;
                }
                toast.error(msg);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="min-h-screen bg-[#EBF4F6] font-sans text-[#09637E] flex flex-col items-center pt-32 pb-12 relative overflow-hidden">

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-white/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-[60%] -left-[10%] w-[600px] h-[600px] bg-[#7AB2B2]/10 rounded-full blur-[80px]"></div>
            </div>

            {/* Page Title */}
            <h1 className="text-6xl font-serif-premium italic text-[#09637E] mb-12 relative z-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                Edit Profile
                <span className="block w-24 h-1 bg-[#09637E]/20 mx-auto mt-4 rounded-full"></span>
            </h1>

            {/* Main Form Card */}
            <div className="bg-[#EBF4F6]/80 backdrop-blur-md rounded-[40px] shadow-[0_20px_60px_-15px_rgba(9,99,126,0.15)] border border-white/60 p-12 w-full max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Profile Picture Avatar */}
                <div className="flex flex-col items-center -mt-24 mb-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full p-1 bg-white shadow-xl ring-4 ring-[#EBF4F6]">
                            <img
                                src={authUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=09637E&color=fff`}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>

                    </div>
                    <p className="mt-4 text-xs font-black uppercase tracking-widest text-[#09637E]/50">Profile Curator</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Row 1: Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 group-focus-within:text-[#09637E] transition-colors">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-[#09637E]/20 py-2 font-serif-premium text-xl text-[#09637E] focus:outline-none focus:border-[#09637E] transition-colors placeholder-[#09637E]/20"
                                placeholder="Alex Morgan"
                            />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 group-focus-within:text-[#09637E] transition-colors">Email Identity</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled // Usually email is immutable or requires verification
                                className="w-full bg-transparent border-b border-[#09637E]/20 py-2 font-serif-premium text-xl text-[#09637E]/60 focus:outline-none focus:border-[#09637E] transition-colors cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Row 2: Contact & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 group relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 group-focus-within:text-[#09637E] transition-colors mb-2 block">Contact Number</label>
                            <div className="border-b border-[#09637E]/20">
                                <PhoneInput
                                    country={'in'}
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    enableSearch={true}
                                    disableSearchIcon={true}
                                    inputStyle={{
                                        width: '100%',
                                        height: 'auto',
                                        fontSize: '1.25rem',
                                        fontFamily: 'serif',
                                        color: '#09637E',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '0',
                                        paddingLeft: '48px',
                                        paddingTop: '0.5rem',
                                        paddingBottom: '0.5rem'
                                    }}
                                    buttonStyle={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '0',
                                        paddingLeft: '0',
                                        paddingRight: '0'
                                    }}
                                    dropdownStyle={{
                                        backgroundColor: '#EBF4F6',
                                        color: '#09637E',
                                        fontFamily: 'sans-serif',
                                        zIndex: 50,
                                        borderRadius: '1rem',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                    }}
                                    containerStyle={{
                                        width: '100%'
                                    }}
                                    searchStyle={{
                                        backgroundColor: '#fff',
                                        padding: '10px'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 group">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 group-focus-within:text-[#09637E] transition-colors">Current Base (City)</label>
                                <button
                                    type="button"
                                    onClick={handleUseLocation}
                                    disabled={isLocating}
                                    className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/60 hover:text-[#09637E] flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait hover:underline"
                                >
                                    {isLocating ? (
                                        <div className="w-3 h-3 border-2 border-[#09637E] border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <BsGeoAlt size={10} />
                                    )}
                                    {isLocating ? "Locating..." : "Use Current Location"}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    onFocus={() => { if (formData.location.length > 2) setShowSuggestions(true); }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                                    className="w-full bg-transparent border-b border-[#09637E]/20 py-2 font-serif-premium text-xl text-[#09637E] focus:outline-none focus:border-[#09637E] transition-colors placeholder-[#09637E]/20"
                                    placeholder="San Francisco, CA"
                                    autoComplete="off"
                                />
                                {showSuggestions && locationSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl shadow-xl rounded-b-2xl z-50 max-h-60 overflow-y-auto border border-[#09637E]/10 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {locationSuggestions.map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleLocationSelect(item)}
                                                className="w-full text-left px-4 py-3 hover:bg-[#09637E]/5 transition-colors border-b border-[#09637E]/5 last:border-0"
                                            >
                                                <p className="text-sm font-bold text-[#09637E] truncate">{item.display_name.split(',')[0]}</p>
                                                <p className="text-[10px] text-[#09637E]/60 truncate">{item.display_name}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio / Narrative */}
                    <div className="space-y-2 group pt-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 group-focus-within:text-[#09637E] transition-colors">Personal Narrative</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            className="w-full bg-transparent border-b border-[#09637E]/20 py-2 font-serif-premium text-lg italic text-[#09637E] focus:outline-none focus:border-[#09637E] transition-colors placeholder-[#09637E]/20 resize-none leading-relaxed"
                            placeholder="Curating experiences at the intersection of high-art and technology..."
                        />
                    </div>

                    {/* Interests / Passions */}
                    <div className="space-y-4 pt-4 border-t border-[#09637E]/10">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40">Fields of Interest</label>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/30">{formData.interests.length}/8 Selected</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {PREDEFINED_INTERESTS.map((interest, idx) => {
                                const isSelected = formData.interests.includes(interest);
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${isSelected
                                                ? "bg-[#09637E] text-white border-[#09637E] shadow-lg scale-105"
                                                : "bg-white text-[#09637E]/60 border-[#09637E]/10 hover:border-[#09637E]/30 hover:text-[#09637E]"
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-12">
                        <button
                            type="button"
                            onClick={() => navigate("/user/profile")}
                            className="text-xs font-black uppercase tracking-widest text-[#09637E]/40 hover:text-[#09637E] transition-colors px-4 py-2"
                        >
                            Discard Edits
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-[#09637E] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-[#088395] hover:scale-105 transition-all active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
                        >
                            {isLoading ? "Saving..." : "Save Narrative"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditProfile;
