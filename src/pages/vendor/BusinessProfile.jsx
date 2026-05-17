import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    BsCamera,
    BsPencilSquare,
    BsStarFill,
    BsGeoAlt,
    BsGlobe,
    BsCheckCircleFill,
    BsFileEarmarkText,
    BsDownload,
    BsEye,
    BsShieldCheck
} from "react-icons/bs";
import { toast } from "react-hot-toast";
import VendorAvailabilityCalendar from "../../components/Global/VendorAvailabilityCalendar";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationPicker from "../../components/Map/LocationPicker";
import { fetchWithAuth } from "../../utils/apiHandler";
import {
    fetchVendorApplication,
    uploadVendorApplicationImage,
    refreshAccessToken,
    selectVendorApplication,
    selectVendorApplicationLoading,
} from "../../store/slices/authSlice";
import {
    fetchVendorEventRequests,
    selectVendorEventRequests,
} from "../../store/slices/vendorEventsSlice";
import { toIstDayString } from "../../utils/istDateTime";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400";
const DEFAULT_BANNER_IMAGE = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1600";

const toDayKey = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    if (DAY_KEY_RE.test(raw)) return raw;
    return toIstDayString(raw);
};

const okkazoIcon = L.divIcon({
    html: `
        <div class="relative w-10 h-10 flex items-center justify-center">
            <div class="absolute inset-0 bg-[#d7a444] rounded-full scale-50 animate-ping opacity-20"></div>
            <div class="w-8 h-8 bg-[#d7a444] border-2 border-white rounded-full flex items-center justify-center shadow-lg transform -translate-y-1">
                <div class="w-2 h-2 bg-[#0b2d49] rounded-full"></div>
            </div>
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#d7a444] rounded-full"></div>
        </div>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const BusinessProfile = () => {
    const dispatch = useDispatch();
    const vendorApplication = useSelector(selectVendorApplication);
    const vendorApplicationLoading = useSelector(selectVendorApplicationLoading);
    const vendorEventRequests = useSelector(selectVendorEventRequests);

    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [tempAbout, setTempAbout] = useState("");
    const [isSavingAbout, setIsSavingAbout] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState({ profile: false, banner: false });
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isSavingLocation, setIsSavingLocation] = useState(false);
    const [locationDraft, setLocationDraft] = useState({
        location: '',
        place: '',
        country: '',
        latitude: null,
        longitude: null,
    });

    const profileImageInputRef = useRef(null);
    const bannerImageInputRef = useRef(null);
    const didRefreshForCoordsRef = useRef(false);

    useEffect(() => {
        if (!vendorApplication && !vendorApplicationLoading) {
            dispatch(fetchVendorApplication());
        }
    }, [dispatch, vendorApplication, vendorApplicationLoading]);

    useEffect(() => {
        dispatch(fetchVendorEventRequests());
    }, [dispatch]);

    useEffect(() => {
        if (didRefreshForCoordsRef.current) return;
        if (!vendorApplication) return;
        if (vendorApplicationLoading) return;

        const lat = vendorApplication?.latitude;
        const lng = vendorApplication?.longitude;
        const missingCoords = lat == null || lng == null;

        if (missingCoords) {
            didRefreshForCoordsRef.current = true;
            dispatch(fetchVendorApplication());
        }
    }, [dispatch, vendorApplication, vendorApplicationLoading]);

    useEffect(() => {
        if (isEditingAbout) return;
        setTempAbout(vendorApplication?.description || '');
    }, [isEditingAbout, vendorApplication]);

    const about = vendorApplication?.description || "Add your business description to build customer trust.";

    const approvedYear = useMemo(() => {
        const raw = vendorApplication?.approvedAt;
        if (!raw) return null;
        const date = new Date(raw);
        // Invalid date -> return null
        if (Number.isNaN(date.getTime())) return null;
        return date.getFullYear();
    }, [vendorApplication]);

    const todayDayKey = useMemo(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const bookingStats = useMemo(() => {
        const rows = Array.isArray(vendorEventRequests) ? vendorEventRequests : [];

        let eventsServed = 0;
        let upcomingEvents = 0;

        rows.forEach((row) => {
            const planningStatus = String(row?.planningStatus || '').trim().toUpperCase();
            if (planningStatus === 'CANCELLED' || planningStatus === 'CANCELED' || planningStatus === 'CLOSED') {
                return;
            }

            const vendorItems = Array.isArray(row?.vendorItems) ? row.vendorItems : [];
            const hasRejected = vendorItems.some((v) => String(v?.status || '').trim().toUpperCase() === 'REJECTED');
            const isPending = vendorItems.some((v) => String(v?.status || '').trim().toUpperCase() === 'YET_TO_SELECT');
            const isConfirmed = !hasRejected && !isPending;

            if (!isConfirmed) return;

            eventsServed += 1;
            const eventDay = toDayKey(row?.eventDate);
            if (eventDay && eventDay >= todayDayKey) upcomingEvents += 1;
        });

        return {
            eventsServed,
            upcomingEvents,
            totalEvents: rows.length,
        };
    }, [todayDayKey, vendorEventRequests]);

    const stats = useMemo(() => {
        return [
            {
                icon: <BsShieldCheck size={18} />,
                label: 'Active Since',
                value: approvedYear != null ? String(approvedYear) : '—',
            },
            {
                icon: <BsCheckCircleFill size={18} />,
                label: 'Events Served',
                value: bookingStats.eventsServed.toLocaleString(),
            },
            {
                icon: <BsGeoAlt size={18} />,
                label: 'Upcoming Events',
                value: bookingStats.upcomingEvents.toLocaleString(),
            },
            {
                icon: <BsGlobe size={18} />,
                label: 'Total Events',
                value: bookingStats.totalEvents.toLocaleString(),
            },
        ];
    }, [approvedYear, bookingStats]);

    const profileImageUrl = vendorApplication?.images?.profile?.fileUrl || null;
    const bannerImageUrl = vendorApplication?.images?.banner?.fileUrl || null;
    const businessName = vendorApplication?.businessName || 'Your Business';
    const location = vendorApplication?.location || 'Location not set';
    const latitude = vendorApplication?.latitude;
    const longitude = vendorApplication?.longitude;
    const ratingValue = Number(vendorApplication?.ratingAverage ?? vendorApplication?.rating ?? 0);
    const reviewsCount = Number(vendorApplication?.reviewCount ?? vendorApplication?.reviewsCount ?? 0);
    const ratingLabel = Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue.toFixed(1) : '—';
    const reviewsLabel = Number.isFinite(reviewsCount) && reviewsCount >= 0 ? reviewsCount.toLocaleString() : '0';

    const hasCoords = useMemo(() => {
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
        return true;
    }, [latitude, longitude]);

    const center = useMemo(() => {
        if (!hasCoords) return null;
        return [Number(latitude), Number(longitude)];
    }, [hasCoords, latitude, longitude]);

    const documents = vendorApplication?.documents || null;
    const allVerified = useMemo(() => {
        const bl = documents?.businessLicense?.status;
        const oi = documents?.ownerIdentity?.status;
        if (!bl || !oi) return false;
        return String(bl).toUpperCase() === 'VERIFIED' && String(oi).toUpperCase() === 'VERIFIED';
    }, [documents]);

    const formatUploadedAt = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString();
    };

    const openDoc = (url) => {
        if (!url) {
            toast.error('Document URL not available');
            return;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const toCloudinaryAttachmentUrl = (url) => {
        if (!url) return url;
        const raw = String(url);
        // Cloudinary delivery URLs contain `/upload/`. Adding `fl_attachment` forces download.
        if (!raw.includes('/upload/')) return raw;
        if (raw.includes('/upload/fl_attachment/')) return raw;
        return raw.replace('/upload/', '/upload/fl_attachment/');
    };

    const downloadDoc = ({ url, filename }) => {
        if (!url) {
            toast.error('Document URL not available');
            return;
        }

        const href = toCloudinaryAttachmentUrl(url);
        const link = document.createElement('a');
        link.href = href;
        if (filename) link.download = filename;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const safeJson = async (response) => {
        try {
            return await response.json();
        } catch {
            return null;
        }
    };

    const updateMyProfile = async (payload, successMessage) => {
        const response = await fetchWithAuth(
            `${API_BASE_URL}/api/vendor/me/application/profile`,
            {
                method: 'PATCH',
                body: JSON.stringify(payload),
            },
            { dispatch, refreshAction: refreshAccessToken }
        );

        const data = await safeJson(response);
        if (!response.ok || !data?.success) {
            throw new Error(data?.error?.message || data?.message || 'Failed to update profile');
        }

        await dispatch(fetchVendorApplication());
        if (successMessage) toast.success(successMessage);

        return data?.data || null;
    };

    const handleUpdateAbout = async () => {
        const nextDescription = String(tempAbout || '').trim();
        if (!nextDescription) {
            toast.error('Description cannot be empty');
            return;
        }

        if (nextDescription.length > 2000) {
            toast.error('Description cannot exceed 2000 characters');
            return;
        }

        try {
            setIsSavingAbout(true);
            await updateMyProfile({ description: nextDescription }, 'Description updated');
            setIsEditingAbout(false);
        } catch (error) {
            toast.error(error?.message || 'Failed to update description');
        } finally {
            setIsSavingAbout(false);
        }
    };

    const handleImageSelected = async (imageType, file) => {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only JPEG and PNG images are allowed');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Image must be 5MB or smaller');
            return;
        }

        try {
            setIsUploadingImage((prev) => ({ ...prev, [imageType]: true }));
            await dispatch(uploadVendorApplicationImage({ imageType, file })).unwrap();
            toast.success(`${imageType === 'profile' ? 'Profile' : 'Cover'} image updated`);
        } catch (error) {
            toast.error(String(error || `Failed to update ${imageType} image`));
        } finally {
            setIsUploadingImage((prev) => ({ ...prev, [imageType]: false }));
        }
    };

    const openLocationModal = () => {
        setLocationDraft({
            location: String(vendorApplication?.location || '').trim(),
            place: String(vendorApplication?.place || '').trim(),
            country: String(vendorApplication?.country || '').trim(),
            latitude: Number.isFinite(Number(vendorApplication?.latitude)) ? Number(vendorApplication?.latitude) : null,
            longitude: Number.isFinite(Number(vendorApplication?.longitude)) ? Number(vendorApplication?.longitude) : null,
        });
        setIsLocationModalOpen(true);
    };

    const handleMapLocationSelect = async (data) => {
        const lat = Number(data?.lat);
        const lng = Number(data?.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            toast.error('Invalid location selected');
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                { headers: { 'User-Agent': 'Okkazo-Frontend/1.0' } }
            );
            const geoData = await response.json();

            const place = geoData?.address?.city
                || geoData?.address?.town
                || geoData?.address?.village
                || geoData?.address?.suburb
                || geoData?.address?.county
                || '';
            const country = geoData?.address?.country || '';

            setLocationDraft((prev) => ({
                ...prev,
                location: String(data?.address || geoData?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`).trim(),
                place: String(place || '').trim(),
                country: String(country || '').trim(),
                latitude: lat,
                longitude: lng,
            }));
        } catch {
            setLocationDraft((prev) => ({
                ...prev,
                location: String(data?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`).trim(),
                latitude: lat,
                longitude: lng,
            }));
        }
    };

    const handleSaveLocation = async () => {
        const locationText = String(locationDraft.location || '').trim();
        if (!locationText) {
            toast.error('Location is required');
            return;
        }

        const lat = Number(locationDraft.latitude);
        const lng = Number(locationDraft.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            toast.error('Please select a valid point on the map');
            return;
        }

        try {
            setIsSavingLocation(true);
            await updateMyProfile(
                {
                    location: locationText,
                    place: String(locationDraft.place || '').trim() || null,
                    country: String(locationDraft.country || '').trim() || null,
                    latitude: lat,
                    longitude: lng,
                },
                'Location updated'
            );
            setIsLocationModalOpen(false);
        } catch (error) {
            toast.error(error?.message || 'Failed to update location');
        } finally {
            setIsSavingLocation(false);
        }
    };

    if (vendorApplicationLoading && !vendorApplication) {
        return (
            <div className="pb-20 animate-pulse space-y-8">
                <div className="h-10 w-72 rounded-2xl bg-white/80" />
                <div className="h-80 w-full rounded-[3rem] bg-white/80 border border-[#7AB2B2]/15" />
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8 h-[520px] rounded-[3rem] bg-white/80 border border-[#7AB2B2]/15" />
                    <div className="col-span-12 lg:col-span-4 h-[520px] rounded-[3rem] bg-white/80 border border-[#7AB2B2]/15" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-10">
                <h1 className="text-3xl font-black tracking-tight">Business Profile</h1>
            </div>

            {/* Hero / Cover Section */}
            <div className="relative mb-20">
                <input
                    ref={bannerImageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleImageSelected('banner', file);
                        e.target.value = '';
                    }}
                />
                <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleImageSelected('profile', file);
                        e.target.value = '';
                    }}
                />

                <div className="h-80 w-full rounded-[3rem] bg-[#e9eff1] overflow-hidden group border border-white">
                    <img
                        src={bannerImageUrl || DEFAULT_BANNER_IMAGE}
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        alt="Cover"
                    />
                    <button
                        onClick={() => bannerImageInputRef.current?.click()}
                        disabled={isUploadingImage.banner}
                        className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[#0b2d49] font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-white transition-all"
                    >
                        <BsCamera /> {isUploadingImage.banner ? 'Updating Cover...' : 'Change Cover'}
                    </button>
                </div>

                {/* Profile Info Overlay */}
                <div className="absolute -bottom-12 left-12 flex items-end gap-8">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-linear-to-br from-[#d7a444] to-[#f3ddb1] p-1 shadow-2xl border-4 border-white">
                            <img
                                src={profileImageUrl || DEFAULT_PROFILE_IMAGE}
                                className="w-full h-full object-cover rounded-[2.2rem]"
                                alt="Profile"
                            />
                        </div>
                        <button
                            onClick={() => profileImageInputRef.current?.click()}
                            disabled={isUploadingImage.profile}
                            className="absolute bottom-2 right-2 w-10 h-10 bg-[#0b2d49] text-white rounded-xl flex items-center justify-center border-2 border-white shadow-lg hover:bg-[#d7a444] transition-all"
                        >
                            <BsCamera size={18} />
                        </button>
                    </div>
                    <div className="mb-6 pb-2">
                        <h2 className="text-4xl font-black text-[#0b2d49] tracking-tight mb-2">{businessName}</h2>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-[#d7a444] font-black text-sm">
                                <BsStarFill /> {ratingLabel} <span className="text-[#708aa0] font-bold">({reviewsLabel} reviews)</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#5a5b44] font-bold text-sm">
                                <BsGeoAlt className="text-[#708aa0]" /> {location}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: About & Stats */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* About Section */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#10b981]/10 text-[#10b981] rounded-xl flex items-center justify-center">
                                    <BsGlobe size={20} />
                                </div>
                                About the Business
                            </h3>
                            <button
                                onClick={() => {
                                    if (!isEditingAbout) setTempAbout(about);
                                    setIsEditingAbout(!isEditingAbout);
                                }}
                                className="text-[10px] font-black uppercase text-[#d7a444] hover:underline flex items-center gap-2 tracking-widest leading-none"
                            >
                                <BsPencilSquare size={14} /> {isEditingAbout ? "Cancel Editing" : "Edit Description"}
                            </button>
                        </div>

                        {isEditingAbout ? (
                            <div className="space-y-4">
                                <textarea
                                    value={tempAbout}
                                    onChange={(e) => setTempAbout(e.target.value)}
                                    className="w-full h-40 p-6 rounded-4xl bg-[#e9eff1]/50 border-none focus:ring-2 focus:ring-[#d7a444]/20 font-medium text-[#5a5b44] leading-relaxed resize-none"
                                />
                                <button
                                    onClick={handleUpdateAbout}
                                    disabled={isSavingAbout}
                                    className="px-8 py-3 bg-[#0b2d49] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all"
                                >
                                    {isSavingAbout ? 'Updating...' : 'Update Description'}
                                </button>
                            </div>
                        ) : (
                            <p className="text-[#5a5b44] font-medium leading-loose text-lg">
                                {about}
                            </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="bg-[#e9eff1]/30 p-6 rounded-4xl border border-white hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                    <div className="text-[#d7a444] mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                                    <p className="text-[10px] text-[#708aa0] font-black uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                                    <p className="text-xl font-black tracking-tight">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Verification Documents */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#10b981]/10 text-[#10b981] rounded-xl flex items-center justify-center">
                                    <BsShieldCheck size={20} />
                                </div>
                                Verification Documents
                            </h3>
                            {allVerified && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100">
                                    <BsCheckCircleFill size={14} />
                                    <span className="text-xs font-black uppercase tracking-wider">All Verified</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Business License */}
                            <div className="p-6 bg-linear-to-r from-[#e9eff1]/70 to-[#f3ddb1]/20 rounded-4xl border border-[#d7a444]/20 hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-linear-to-br from-[#f3ddb1] to-[#d0a862]/50 rounded-xl flex items-center justify-center text-[#d7a444] shadow-sm">
                                            <BsFileEarmarkText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-[#0b2d49] mb-1">Business License</h4>
                                            <p className="text-xs text-[#708aa0] font-medium">
                                                {documents?.businessLicense?.fileName || "—"}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] text-[#708aa0] font-bold">Uploaded: {formatUploadedAt(documents?.businessLicense?.uploadedAt)}</span>
                                                <span className="text-[10px] font-black uppercase px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                                                    {String(documents?.businessLicense?.status || "—")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openDoc(documents?.businessLicense?.fileUrl)}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all shadow-sm"
                                        >
                                            <BsEye size={16} />
                                        </button>
                                        <button
                                            onClick={() => downloadDoc({ url: documents?.businessLicense?.fileUrl, filename: documents?.businessLicense?.fileName })}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#d7a444] hover:bg-[#d7a444] hover:text-white transition-all shadow-sm"
                                        >
                                            <BsDownload size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Owner Identity */}
                            <div className="p-6 bg-linear-to-r from-[#e9eff1]/70 to-[#f3ddb1]/20 rounded-4xl border border-[#d7a444]/20 hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-linear-to-br from-[#f3ddb1] to-[#d0a862]/50 rounded-xl flex items-center justify-center text-[#d7a444] shadow-sm">
                                            <BsFileEarmarkText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-[#0b2d49] mb-1">Owner Identity Document</h4>
                                            <p className="text-xs text-[#708aa0] font-medium">
                                                {documents?.ownerIdentity?.fileName || "—"}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] text-[#708aa0] font-bold">Uploaded: {formatUploadedAt(documents?.ownerIdentity?.uploadedAt)}</span>
                                                <span className="text-[10px] font-black uppercase px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                                                    {String(documents?.ownerIdentity?.status || "—")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openDoc(documents?.ownerIdentity?.fileUrl)}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all shadow-sm"
                                        >
                                            <BsEye size={16} />
                                        </button>
                                        <button
                                            onClick={() => downloadDoc({ url: documents?.ownerIdentity?.fileUrl, filename: documents?.ownerIdentity?.fileName })}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#d7a444] hover:bg-[#d7a444] hover:text-white transition-all shadow-sm"
                                        >
                                            <BsDownload size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Other Documents */}
                            {Array.isArray(documents?.otherProofs) && documents.otherProofs.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-xs font-black text-[#0b2d49] uppercase tracking-widest mb-4">Additional Documents</p>
                                    <div className="space-y-3">
                                        {documents.otherProofs.map((doc, index) => (
                                            <div key={doc?.documentId || index} className="p-5 bg-linear-to-r from-[#e9eff1]/70 to-[#5a5b44]/5 rounded-xl border border-[#5a5b44]/15 hover:shadow-md transition-all">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-linear-to-br from-[#5a5b44]/20 to-[#5a5b44]/10 rounded-lg flex items-center justify-center text-[#5a5b44]">
                                                            <BsFileEarmarkText size={16} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-[#0b2d49] mb-1">{doc?.fileName || "—"}</h4>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] text-[#708aa0] font-bold">Uploaded: {formatUploadedAt(doc?.uploadedAt)}</span>
                                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                                    {String(doc?.status || "—")}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openDoc(doc?.fileUrl)}
                                                            className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all"
                                                        >
                                                            <BsEye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => downloadDoc({ url: doc?.fileUrl, filename: doc?.fileName })}
                                                            className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#5a5b44] hover:bg-[#5a5b44] hover:text-white transition-all"
                                                        >
                                                            <BsDownload size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Calendar & Map */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Vendor Availability Calendar */}
                    <VendorAvailabilityCalendar />

                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                        <div className="flex items-center justify-between gap-3 mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0b2d49]/5 text-[#d7a444] rounded-xl flex items-center justify-center">
                                    <BsGeoAlt size={20} />
                                </div>
                                Service Area
                            </h3>
                            <button
                                onClick={openLocationModal}
                                className="text-[10px] font-black uppercase text-[#d7a444] hover:underline flex items-center gap-2 tracking-widest leading-none shrink-0"
                            >
                                <BsPencilSquare size={14} /> Edit Location
                            </button>
                        </div>
                        <div className="h-96 w-full rounded-[2.5rem] bg-[#e9eff1] relative overflow-hidden border-2 border-dashed border-[#708aa0]/10 hover:border-[#d7a444]/50 transition-all">
                            {hasCoords && center ? (
                                <MapContainer
                                    center={center}
                                    zoom={13}
                                    scrollWheelZoom={false}
                                    className="h-full w-full"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={center} icon={okkazoIcon}>
                                        <Popup>
                                            <div className="font-sans">
                                                <div className="font-black text-[#0b2d49]">{businessName}</div>
                                                {location ? (
                                                    <div className="text-xs text-[#708aa0] font-medium mt-1">{location}</div>
                                                ) : null}
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#d7a444] shadow-sm mb-4">
                                        <BsGeoAlt size={28} />
                                    </div>
                                    <p className="text-sm font-black text-[#0b2d49]">Location not set</p>
                                    <p className="text-xs text-[#708aa0] font-medium mt-2">Use Edit Location to pin your service area</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <p className="text-[10px] text-[#708aa0] font-black uppercase tracking-[0.2em] mb-4">Verification Status</p>
                            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-600 rounded-2xl border border-green-100 shadow-sm shadow-green-600/5">
                                <BsCheckCircleFill size={20} />
                                <span className="text-xs font-black uppercase tracking-widest">Profile Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[220] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative isolate w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <h3 className="text-lg font-black text-[#0b2d49]">Update Service Area</h3>
                            <button
                                onClick={() => setIsLocationModalOpen(false)}
                                className="px-3 py-1.5 rounded-lg bg-[#f8fafb] text-[#708aa0] text-xs font-black uppercase tracking-widest hover:bg-[#e9eff1]"
                            >
                                Close
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#708aa0] mb-2">Address</label>
                                    <textarea
                                        value={locationDraft.location}
                                        onChange={(e) => setLocationDraft((prev) => ({ ...prev, location: e.target.value }))}
                                        className="w-full min-h-28 p-4 rounded-2xl bg-[#f8fafb] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#d7a444]/30 text-sm font-medium text-[#0b2d49] resize-none"
                                        placeholder="Select from map or type your address"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#708aa0] mb-2">Place</label>
                                        <input
                                            value={locationDraft.place}
                                            onChange={(e) => setLocationDraft((prev) => ({ ...prev, place: e.target.value }))}
                                            className="w-full h-11 px-3 rounded-xl bg-[#f8fafb] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#d7a444]/30 text-sm font-medium text-[#0b2d49]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#708aa0] mb-2">Country</label>
                                        <input
                                            value={locationDraft.country}
                                            onChange={(e) => setLocationDraft((prev) => ({ ...prev, country: e.target.value }))}
                                            className="w-full h-11 px-3 rounded-xl bg-[#f8fafb] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#d7a444]/30 text-sm font-medium text-[#0b2d49]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#708aa0] mb-2">Latitude</label>
                                        <input
                                            value={locationDraft.latitude != null ? String(locationDraft.latitude) : ''}
                                            readOnly
                                            className="w-full h-11 px-3 rounded-xl bg-[#f8fafb] border border-gray-100 text-sm font-bold text-[#0b2d49]/80"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#708aa0] mb-2">Longitude</label>
                                        <input
                                            value={locationDraft.longitude != null ? String(locationDraft.longitude) : ''}
                                            readOnly
                                            className="w-full h-11 px-3 rounded-xl bg-[#f8fafb] border border-gray-100 text-sm font-bold text-[#0b2d49]/80"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="relative isolate rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                <LocationPicker
                                    lat={locationDraft.latitude}
                                    lng={locationDraft.longitude}
                                    onSelect={handleMapLocationSelect}
                                    className="h-[420px]"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsLocationModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-100 bg-white text-[#708aa0] text-xs font-black uppercase tracking-widest hover:bg-[#f8fafb]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveLocation}
                                disabled={isSavingLocation}
                                className="px-5 py-2.5 rounded-xl bg-[#0b2d49] text-white text-xs font-black uppercase tracking-widest hover:bg-[#d7a444] disabled:opacity-60"
                            >
                                {isSavingLocation ? 'Saving...' : 'Save Location'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



export default BusinessProfile;
