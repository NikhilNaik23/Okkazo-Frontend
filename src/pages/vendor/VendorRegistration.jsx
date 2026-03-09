import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    BsShop,
    BsEnvelope,
    BsPhone,
    BsMap,
    BsFileEarmarkText,
    BsArrowRight,
    BsGeoAlt
} from "react-icons/bs";
import { toast } from "react-hot-toast";
import { termsOfService, privacyPolicy } from "../../data/vendorRegistrationData";
import {
    registerVendor,
    fetchServiceCategories,
    clearVendorRegisterSuccess,
    clearError,
    selectIsLoading,
    selectError,
    selectVendorRegisterSuccess,
    selectVendorRegisterMessage,
    selectVendorRegisterData,
    selectServiceCategories,
    selectServiceCategoriesLoading
} from "../../store/slices/authSlice";

// Components
import Modal from "../../components/Global/Modal";
import { RegistrationSuccess, FileUploadField, MultiFileUpload, SidePanel } from "../../components/Vendor/Registration";
import LocationPicker from "../../components/Map/LocationPicker";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const VendorRegistration = () => {
    const dispatch = useDispatch();
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const vendorRegisterSuccess = useSelector(selectVendorRegisterSuccess);
    const vendorRegisterMessage = useSelector(selectVendorRegisterMessage);
    const vendorRegisterData = useSelector(selectVendorRegisterData);
    const serviceCategories = useSelector(selectServiceCategories);
    const serviceCategoriesLoading = useSelector(selectServiceCategoriesLoading);

    const [formData, setFormData] = useState({
        businessName: "",
        serviceCategory: "",
        customService: "",
        email: "",
        phone: "",
        location: "",
        place: "",
        country: "",
        latitude: null,
        longitude: null,
        description: ""
    });
    const [agreed, setAgreed] = useState(false);

    // Modal states
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    // Location states
    const [isLocating, setIsLocating] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

    // File upload states
    const [businessLicense, setBusinessLicense] = useState(null);
    const [ownerIdentity, setOwnerIdentity] = useState(null);
    const [otherProofs, setOtherProofs] = useState([]);

    // File input refs
    const businessLicenseRef = useRef(null);
    const ownerIdentityRef = useRef(null);
    const otherProofsRef = useRef(null);

    // Fetch service categories on mount
    useEffect(() => {
        dispatch(fetchServiceCategories());
    }, [dispatch]);

    // Location suggestion logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.location && formData.location.length > 2) {
                setIsFetchingSuggestions(true);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=5&addressdetails=1`);
                    const data = await response.json();
                    setLocationSuggestions(data);
                    if (data.length > 0) {
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                } finally {
                    setIsFetchingSuggestions(false);
                }
            } else {
                setLocationSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.location]);

    const handleLocationSelect = (suggestion) => {
        const address = suggestion.display_name;
        const parts = address.split(',');
        const place = parts[0]?.trim() || '';
        const country = parts[parts.length - 1]?.trim() || '';
        const displayLocation = parts.slice(0, 3).join(', ');
        const latitude = parseFloat(suggestion.lat);
        const longitude = parseFloat(suggestion.lon);

        setFormData(prev => ({ 
            ...prev, 
            location: displayLocation,
            place,
            country,
            latitude,
            longitude
        }));
        setShowSuggestions(false);
        setLocationSuggestions([]);
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
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.county || "";
                        const state = data.address.state || "";
                        const country = data.address.country || "";

                        const locationComponents = [city, state, country].filter(part => part && part.trim().length > 0);
                        const locationString = locationComponents.join(", ");
                        const place = city || state || "";

                        setFormData(prev => ({ 
                            ...prev, 
                            location: locationString,
                            place,
                            country,
                            latitude,
                            longitude
                        }));
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

    // Handle success/error states
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(clearError());
            dispatch(clearVendorRegisterSuccess());
        };
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'location') {
            // When user manually types, clear the coordinates until they select from suggestions
            setFormData({ 
                ...formData, 
                [name]: value,
                place: '',
                country: '',
                latitude: null,
                longitude: null
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handlePhoneChange = (value) => {
        setFormData(prev => ({ ...prev, phone: value }));
    };

    const handleMapLocationSelect = async (data) => {
        try {
            // Fetch detailed address information
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}&addressdetails=1`,
                { headers: { 'User-Agent': 'Okkazo-Frontend/1.0' } }
            );
            const geoData = await response.json();
            
            if (geoData && geoData.address) {
                const place = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.suburb || '';
                const country = geoData.address.country || '';
                
                setFormData(prev => ({
                    ...prev,
                    location: data.address || `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
                    place,
                    country,
                    latitude: data.lat,
                    longitude: data.lng
                }));
                toast.success('Location selected successfully');
            }
        } catch (error) {
            console.error('Error fetching location details:', error);
            // Still set basic location data
            setFormData(prev => ({
                ...prev,
                location: data.address || `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
                latitude: data.lat,
                longitude: data.lng
            }));
            toast.success('Location selected successfully');
        }
    };

    const isFormValid = () => {
        // Basic phone validation: at least 10 digits (including country code)
        const isPhoneValid = formData.phone && formData.phone.length >= 10;

        return (
            formData.businessName &&
            formData.serviceCategory &&
            (formData.serviceCategory !== "Other" || formData.customService) &&
            formData.email &&
            isPhoneValid &&
            agreed
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // Create FormData object for multipart/form-data
        const formDataToSend = new FormData();
        formDataToSend.append('businessName', formData.businessName);
        formDataToSend.append('serviceCategory', formData.serviceCategory);
        if (formData.serviceCategory === 'Other' && formData.customService) {
            formDataToSend.append('customService', formData.customService);
        }
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        
        // Consolidate location data into JSON to reduce field count
        const locationData = {
            location: formData.location || '',
            place: formData.place || '',
            country: formData.country || '',
            latitude: formData.latitude,
            longitude: formData.longitude
        };
        formDataToSend.append('locationData', JSON.stringify(locationData));
        
        if (formData.description) {
            formDataToSend.append('description', formData.description);
        }

        // Append files if they exist
        if (businessLicense) {
            formDataToSend.append('businessLicense', businessLicense);
        }
        if (ownerIdentity) {
            formDataToSend.append('ownerIdentity', ownerIdentity);
        }
        if (otherProofs.length > 0) {
            otherProofs.forEach(file => {
                formDataToSend.append('otherProofs', file);
            });
        }

        formDataToSend.append('agreedToTerms', String(agreed));

        // Dispatch Redux action
        dispatch(registerVendor(formDataToSend));
    };

    if (vendorRegisterSuccess) {
        return <RegistrationSuccess email={formData.email} message={vendorRegisterMessage} data={vendorRegisterData} />;
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full bg-[#EBF4F6] overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-[#EBF4F6]">
                <div className="min-h-full flex flex-col items-center justify-center p-8 md:p-12">
                    <div className="max-w-xl w-full">
                        {/* Mobile Logo Only */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-10 h-10 bg-[#09637E] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                O
                            </div>
                        </div>

                        {/* Registration Header */}
                        <div className="text-center mb-10 animate-[fadeInDown_0.7s_ease-out]">
                            <div className="inline-block p-4 bg-gradient-to-br from-[#09637E] to-[#088395] rounded-3xl mb-6 shadow-xl shadow-[#09637E]/20 hover:scale-110 transition-transform duration-300 cursor-pointer">
                                <BsShop size={32} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-[#09637E] mb-3 tracking-tight">Become a Vendor</h1>
                            <p className="text-[#708aa0] font-medium text-base max-w-md mx-auto leading-relaxed">
                                Expand your reach and manage your event services through Okkazo.
                            </p>
                        </div>

                        {/* Form Container */}
                        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-[#09637E]/5 border border-white animate-[fadeInUp_0.8s_ease-out]">
                            <div className="space-y-8">

                                {/* Business Basics */}
                                <section className="space-y-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#7AB2B2]/20 to-[#088395]/30 rounded-2xl flex items-center justify-center text-[#09637E] shadow-sm">
                                            <BsShop size={20} />
                                        </div>
                                        <h2 className="text-xl font-black text-[#09637E]">Business Details</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Business Name *</label>
                                            <input
                                                type="text"
                                                name="businessName"
                                                required
                                                value={formData.businessName}
                                                onChange={handleInputChange}
                                                placeholder="Enter legal business name"
                                                className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Service Category *</label>
                                            <select
                                                name="serviceCategory"
                                                required
                                                value={formData.serviceCategory}
                                                onChange={handleInputChange}
                                                disabled={serviceCategoriesLoading}
                                                className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm text-[#09637E] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="" disabled>
                                                    {serviceCategoriesLoading ? 'Loading categories...' : 'Select Category'}
                                                </option>
                                                {serviceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {formData.serviceCategory === "Other" && (
                                        <div className="space-y-2 animate-[fadeInDown_0.3s_ease-out]">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Custom Service Name *</label>
                                            <input
                                                type="text"
                                                name="customService"
                                                required
                                                value={formData.customService}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Drone Photography, Pet Sitting"
                                                className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0]"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Business Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Tell us about your services, experience, and what makes you unique..."
                                            rows={4}
                                            className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] resize-none"
                                        ></textarea>
                                    </div>
                                </section>

                                {/* Contact Info */}
                                <section className="space-y-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#7AB2B2]/20 to-[#088395]/30 rounded-2xl flex items-center justify-center text-[#09637E] shadow-sm">
                                            <BsEnvelope size={20} />
                                        </div>
                                        <h2 className="text-xl font-black text-[#09637E]">Contact Info</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 relative group">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Business Email *</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="name@business.com"
                                                    className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] pl-12"
                                                />
                                                <BsEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0] group-focus-within:text-[#09637E] transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 relative group flex flex-col">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Phone Number *</label>
                                            <div className="relative phone-input-container">
                                                <PhoneInput
                                                    country={'in'}
                                                    value={formData.phone}
                                                    onChange={handlePhoneChange}
                                                    inputProps={{
                                                        name: 'phone',
                                                        required: true,
                                                    }}
                                                    containerClass="!w-full"
                                                    inputClass="!w-full !h-auto !bg-white !rounded-2xl !py-3.5 !px-5 !pl-14 !border !border-gray-100 focus:!border-[#7AB2B2] focus:!ring-4 focus:!ring-[#7AB2B2]/10 !outline-none !transition-all !duration-300 !font-medium !text-sm !placeholder:text-[#708aa0]"
                                                    buttonClass="!bg-transparent !border-none !rounded-2xl !pl-4"
                                                    dropdownClass="!bg-white !rounded-xl !shadow-2xl !border-none !mt-2 !text-[#09637E]"
                                                    searchClass="!bg-white !p-2"
                                                    enableSearch={true}
                                                    disableSearchIcon={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative group">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Primary Location *</label>
                                            <button
                                                type="button"
                                                onClick={handleUseLocation}
                                                disabled={isLocating}
                                                className="text-[10px] font-black uppercase tracking-widest text-[#088395] hover:text-[#09637E] flex items-center gap-2 pr-1 transition-colors disabled:opacity-50"
                                            >
                                                {isLocating ? (
                                                    <div className="w-3 h-3 border-2 border-[#088395] border-t-transparent rounded-full animate-spin" />
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
                                                required
                                                autoComplete="off"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                onFocus={() => { if (formData.location.length > 2 && locationSuggestions.length > 0) setShowSuggestions(true); }}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                                                placeholder="City, State (e.g., New York, NY)"
                                                className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] pl-12"
                                            />
                                            <BsMap className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0] group-focus-within:text-[#09637E] transition-colors" />
                                            {isFetchingSuggestions && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-[#088395] border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}

                                            {/* Location Suggestions Dropdown */}
                                            {showSuggestions && locationSuggestions.length > 0 && (
                                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white shadow-2xl rounded-2xl z-[9999] max-h-60 overflow-y-auto border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {locationSuggestions.map((item, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleLocationSelect(item)}
                                                            className="w-full text-left px-5 py-3.5 hover:bg-[#09637E]/5 transition-colors border-b border-gray-50 last:border-0"
                                                        >
                                                            <p className="text-sm font-bold text-[#09637E] truncate">
                                                                {item.display_name.split(',')[0]}
                                                            </p>
                                                            <p className="text-[10px] text-[#708aa0] font-medium truncate mt-0.5">
                                                                {item.display_name}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Inline Map */}
                                        <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                                            <LocationPicker
                                                lat={formData.latitude}
                                                lng={formData.longitude}
                                                onSelect={handleMapLocationSelect}
                                                className="h-[350px]"
                                                hideSearch={true}
                                            />
                                        </div>
                                        {formData.place && formData.country && (
                                            <div className="mt-2 flex items-center justify-between text-xs ml-1">
                                                <div className="text-[#708aa0]">
                                                    <span className="font-bold text-[#09637E]">Selected:</span> {formData.place}, {formData.country}
                                                </div>
                                                {formData.latitude !== null && formData.longitude !== null && (
                                                    <div className="text-[#708aa0] font-medium">
                                                        <span className="font-bold text-[#088395]">Lat:</span> {formData.latitude.toFixed(4)}, <span className="font-bold text-[#088395]">Long:</span> {formData.longitude.toFixed(4)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </section>


                                {/* Documents Upload */}
                                <section className="space-y-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#7AB2B2]/20 to-[#088395]/30 rounded-2xl flex items-center justify-center text-[#09637E] shadow-sm">
                                            <BsFileEarmarkText size={20} />
                                        </div>
                                        <h2 className="text-xl font-black text-[#09637E]">Verification Documents</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FileUploadField
                                            label="Business License"
                                            file={businessLicense}
                                            onFileChange={setBusinessLicense}
                                            onRemove={() => {
                                                setBusinessLicense(null);
                                                if (businessLicenseRef.current) businessLicenseRef.current.value = '';
                                            }}
                                            inputRef={businessLicenseRef}
                                        />
                                        <FileUploadField
                                            label="Owner Identity"
                                            file={ownerIdentity}
                                            onFileChange={setOwnerIdentity}
                                            onRemove={() => {
                                                setOwnerIdentity(null);
                                                if (ownerIdentityRef.current) ownerIdentityRef.current.value = '';
                                            }}
                                            inputRef={ownerIdentityRef}
                                        />
                                    </div>

                                    <MultiFileUpload
                                        files={otherProofs}
                                        onAddFile={(file) => setOtherProofs([...otherProofs, file])}
                                        onRemoveFile={(index) => setOtherProofs(otherProofs.filter((_, i) => i !== index))}
                                        inputRef={otherProofsRef}
                                        maxFiles={3}
                                    />
                                </section>

                                {/* Agreements and Submit */}
                                <div className="pt-6 border-t border-gray-100 flex flex-col gap-6">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="w-6 h-6 rounded-lg border-[#7AB2B2]/50 text-[#09637E] focus:ring-[#09637E]/20 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-[#708aa0]">
                                            I agree to the <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-[#09637E] font-bold hover:underline">Terms of Service</span> and <span onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} className="text-[#09637E] font-bold hover:underline">Privacy Policy</span>.
                                        </span>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={!isFormValid() || isLoading}
                                        className={`w-full py-5 rounded-[1.25rem] font-black text-base transition-all duration-300 flex items-center justify-center gap-3 ${isFormValid() && !isLoading ? 'bg-gradient-to-r from-[#09637E] to-[#088395] text-white shadow-xl shadow-[#09637E]/20 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Submit Application</span>
                                                <BsArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Image & Branding */}
            <SidePanel />

            {/* Modals */}
            <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title={termsOfService.title}>
                <div className="space-y-4">
                    <p className="font-bold text-[#09637E]">{termsOfService.intro}</p>
                    <p className="text-xs text-[#708aa0] italic">{termsOfService.description}</p>
                    {termsOfService.sections.map((section, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-[#09637E] mb-1">{section.title}</h4>
                            <p>{section.content}</p>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title={privacyPolicy.title}>
                <div className="space-y-4">
                    <p className="font-bold text-[#09637E]">{privacyPolicy.intro}</p>
                    <p className="text-xs text-[#708aa0] italic">{privacyPolicy.description}</p>
                    {privacyPolicy.sections.map((section, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-[#09637E] mb-1">{section.title}</h4>
                            <p>{section.content}</p>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default VendorRegistration;
