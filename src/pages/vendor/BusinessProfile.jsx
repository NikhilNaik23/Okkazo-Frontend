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
import { vendorProfileData } from "../../data/vendorProfileData.jsx";
import VendorAvailabilityCalendar from "../../components/Global/VendorAvailabilityCalendar";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    fetchVendorApplication,
    selectVendorApplication,
    selectVendorApplicationLoading,
} from "../../store/slices/authSlice";

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

    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutOverride, setAboutOverride] = useState(null);
    const [tempAbout, setTempAbout] = useState(vendorProfileData.about);
    const didRefreshForCoordsRef = useRef(false);

    useEffect(() => {
        if (!vendorApplication && !vendorApplicationLoading) {
            dispatch(fetchVendorApplication());
        }
    }, [dispatch, vendorApplication, vendorApplicationLoading]);

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

    const about = aboutOverride ?? vendorApplication?.description ?? vendorProfileData.about;

    const approvedYear = useMemo(() => {
        const raw = vendorApplication?.approvedAt;
        if (!raw) return null;
        const date = new Date(raw);
        // Invalid date -> return null
        if (Number.isNaN(date.getTime())) return null;
        return date.getFullYear();
    }, [vendorApplication]);

    const stats = useMemo(() => {
        const base = Array.isArray(vendorProfileData.stats) ? vendorProfileData.stats : [];
        if (base.length === 0) return base;
        const next = base.map((s) => ({ ...s }));
        // Replace first stat with "Active Since" driven by approved year.
        next[0] = {
            ...next[0],
            label: 'Active Since',
            value: approvedYear != null ? String(approvedYear) : next?.[0]?.value,
        };
        return next;
    }, [approvedYear]);

    const profileImageUrl = vendorApplication?.images?.profile?.fileUrl || null;
    const bannerImageUrl = vendorApplication?.images?.banner?.fileUrl || null;
    const businessName = vendorApplication?.businessName || vendorProfileData.name;
    const location = vendorApplication?.location || vendorProfileData.location;
    const latitude = vendorApplication?.latitude;
    const longitude = vendorApplication?.longitude;

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

    const handleSaveChanges = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Saving changes...',
                success: <b>Profile updated successfully!</b>,
                error: <b>Could not save changes.</b>,
            },
            {
                style: { borderRadius: '16px', background: '#0b2d49', color: '#fff' }
            }
        );
    };

    const handleUpdateAbout = () => {
        setAboutOverride(tempAbout);
        setIsEditingAbout(false);
        toast.success("Description updated!");
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black tracking-tight">Business Profile</h1>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white border-2 border-[#e9eff1] text-[#0b2d49] rounded-2xl font-bold text-sm hover:border-[#0b2d49] transition-all flex items-center gap-2">
                        <BsGlobe /> Preview Website
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        className="px-6 py-3 bg-[#0b2d49] text-white rounded-2xl font-bold text-sm hover:bg-[#d7a444] transition-all shadow-lg active:scale-95"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Hero / Cover Section */}
            <div className="relative mb-20">
                <div className="h-80 w-full rounded-[3rem] bg-[#e9eff1] overflow-hidden group border border-white">
                    <img
                        src={bannerImageUrl || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1600"}
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        alt="Cover"
                    />
                    <button
                        onClick={() => toast.success("Cover photo update coming soon!")}
                        className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[#0b2d49] font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-white transition-all"
                    >
                        <BsCamera /> Change Cover
                    </button>
                </div>

                {/* Profile Info Overlay */}
                <div className="absolute -bottom-12 left-12 flex items-end gap-8">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-linear-to-br from-[#d7a444] to-[#f3ddb1] p-1 shadow-2xl border-4 border-white">
                            <img
                                src={profileImageUrl || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400"}
                                className="w-full h-full object-cover rounded-[2.2rem]"
                                alt="Profile"
                            />
                        </div>
                        <button
                            onClick={() => toast.success("Profile photo update coming soon!")}
                            className="absolute bottom-2 right-2 w-10 h-10 bg-[#0b2d49] text-white rounded-xl flex items-center justify-center border-2 border-white shadow-lg hover:bg-[#d7a444] transition-all"
                        >
                            <BsCamera size={18} />
                        </button>
                    </div>
                    <div className="mb-6 pb-2">
                        <h2 className="text-4xl font-black text-[#0b2d49] tracking-tight mb-2">{businessName}</h2>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-[#d7a444] font-black text-sm">
                                <BsStarFill /> {vendorProfileData.rating} <span className="text-[#708aa0] font-bold">({vendorProfileData.reviews} reviews)</span>
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
                                    className="px-8 py-3 bg-[#0b2d49] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all"
                                >
                                    Update Description
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
                        <h3 className="text-xl font-black flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#0b2d49]/5 text-[#d7a444] rounded-xl flex items-center justify-center">
                                <BsGeoAlt size={20} />
                            </div>
                            Service Area
                        </h3>
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
                                    <p className="text-sm font-black text-[#0b2d49]">Coverage Map Placeholder</p>
                                    <p className="text-xs text-[#708aa0] font-medium mt-2">Integrating with Leaflet for precise area selection</p>
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
        </div>
    );
};



export default BusinessProfile;
