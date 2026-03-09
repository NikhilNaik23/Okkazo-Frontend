import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    BsCheckCircleFill,
    BsXCircleFill,
    BsClockFill,
    BsFileEarmarkTextFill,
    BsShop,
    BsExclamationTriangleFill,
    BsEnvelopeFill,
    BsCalendarCheckFill,
    BsTelephoneFill,
    BsGeoAltFill,
    BsInfoCircleFill,
    BsArrowLeft,
    BsCloudUpload,
    BsFileEarmarkText,
    BsTrash,
    BsShieldExclamation
} from "react-icons/bs";
import { toast } from "react-hot-toast";
import {
    selectVendorApplication,
    selectVendorApplicationLoading,
    selectIsAuthenticated,
    selectUserRole,
    selectIsLoading,
    uploadVendorDocument
} from "../../store/slices/authSlice";

const VendorApplicationStatus = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const userRole = useSelector(selectUserRole);
    const vendorApplication = useSelector(selectVendorApplication);
    const isLoading = useSelector(selectVendorApplicationLoading);
    const isUploading = useSelector(selectIsLoading);

    // File upload states
    const [businessLicense, setBusinessLicense] = useState(null);
    const [ownerIdentity, setOwnerIdentity] = useState(null);
    const businessLicenseRef = useRef(null);
    const ownerIdentityRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (userRole && userRole !== 'VENDOR') {
            const routes = { ADMIN: "/admin", MANAGER: "/manager" };
            navigate(routes[userRole] || "/user/dashboard");
            return;
        }

        if (vendorApplication?.status === 'APPROVED') {
            navigate("/vendor/dashboard");
        }
    }, [isAuthenticated, userRole, vendorApplication, navigate]);



    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size too large! Max 5MB.");
            e.target.value = '';
            return;
        }
        const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowed.includes(file.type)) {
            toast.error("Only PDF, JPG, and PNG files are allowed.");
            e.target.value = '';
            return;
        }
        if (type === 'businessLicense') setBusinessLicense(file);
        else setOwnerIdentity(file);
    };

    const handleUpload = async (documentType) => {
        const file = documentType === 'businessLicense' ? businessLicense : ownerIdentity;
        if (!file) {
            toast.error('Please select a file first');
            return;
        }
        const result = await dispatch(uploadVendorDocument({
            applicationId: vendorApplication.applicationId,
            documentType,
            file,
        }));
        if (uploadVendorDocument.fulfilled.match(result)) {
            toast.success(`${documentType === 'businessLicense' ? 'Business License' : 'Owner Identity'} uploaded successfully!`);
            if (documentType === 'businessLicense') { setBusinessLicense(null); if (businessLicenseRef.current) businessLicenseRef.current.value = ''; }
            else { setOwnerIdentity(null); if (ownerIdentityRef.current) ownerIdentityRef.current.value = ''; }
        } else {
            toast.error(result.payload || 'Upload failed. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Pending';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#088395] border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-[#09637E] uppercase tracking-[0.2em] text-[10px]">Loading Application</p>
                </div>
            </div>
        );
    }

    const timelineSteps = [
        {
            id: 'submitted',
            label: 'Application Submitted',
            description: 'Your initial application was received successfully.',
            date: formatDate(vendorApplication?.submittedAt),
            status: 'COMPLETED',
            icon: <BsCalendarCheckFill />
        },
        {
            id: 'documents',
            label: 'Document Verification',
            description: 'Checking business license and identity proofs.',
            status: vendorApplication?.documents?.businessLicense?.status === 'APPROVED' &&
                vendorApplication?.documents?.ownerIdentity?.status === 'APPROVED' ? 'COMPLETED' :
                (vendorApplication?.status === 'REJECTED' ? 'FAILED' : 'IN_PROGRESS'),
            icon: <BsFileEarmarkTextFill />
        },
        {
            id: 'review',
            label: 'Administrative Review',
            description: 'Final manual verification by our operations team.',
            status: vendorApplication?.status === 'PENDING_REVIEW' || vendorApplication?.status === 'UNDER_VERIFICATION' ? 'IN_PROGRESS' :
                (['APPROVED', 'REJECTED', 'SUSPENDED'].includes(vendorApplication?.status) ? 'COMPLETED' : 'WAITING'),
            icon: <BsClockFill />
        },
        {
            id: 'final',
            label: 'Final Decision',
            description: vendorApplication?.status === 'APPROVED' ? 'Welcome to Okkazo!' : 'Status will be updated here.',
            status: vendorApplication?.status === 'APPROVED' ? 'COMPLETED' :
                (vendorApplication?.status === 'REJECTED' ? 'FAILED' : 'WAITING'),
            icon: <BsCheckCircleFill />
        }
    ];

    const getStepColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-[#088395] text-white border-[#088395]';
            case 'IN_PROGRESS': return 'bg-white text-[#088395] border-[#088395] animate-pulse';
            case 'FAILED': return 'bg-red-500 text-white border-red-500';
            default: return 'bg-[#7AB2B2]/20 text-[#7AB2B2] border-[#7AB2B2]/30';
        }
    };

    return (
        <div className="min-h-screen bg-[#EBF4F6] py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Side: Timeline */}
                <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-[#7AB2B2]/20 border border-white">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-[#088395] font-black text-xs uppercase tracking-widest mb-10 hover:gap-4 transition-all"
                    >
                        <BsArrowLeft className="text-lg" /> Back to Home
                    </button>

                    <h1 className="text-4xl md:text-5xl font-black text-[#09637E] mb-2 tracking-tight">Application Journey</h1>
                    <p className="text-[#088395] font-medium mb-12">Track your registration progress in real-time.</p>

                    <div className="space-y-0 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#088395] via-[#7AB2B2]/30 to-[#7AB2B2]/10" />

                        {timelineSteps.map((step) => (
                            <div key={step.id} className="relative pl-16 pb-12 last:pb-0 group">
                                {/* Dot/Icon */}
                                <div className={`absolute left-0 top-0 w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 ${getStepColor(step.status)} shadow-lg`}>
                                    {React.cloneElement(step.icon, { className: "text-lg" })}
                                </div>

                                {/* Content */}
                                <div className="transition-all duration-300 group-hover:translate-x-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                        <h3 className={`text-xl font-black tracking-tight ${step.status === 'WAITING' ? 'text-[#7AB2B2]' : 'text-[#09637E]'}`}>
                                            {step.label}
                                        </h3>
                                        {step.date && (
                                            <span className="text-[10px] font-black bg-[#EBF4F6] text-[#088395] px-3 py-1 rounded-full uppercase tracking-tighter border border-[#7AB2B2]/20">
                                                {step.date}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm leading-relaxed ${step.status === 'WAITING' ? 'text-[#7AB2B2]' : 'text-[#088395]/70'}`}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Final Status Action */}
                    <div className="mt-12 pt-10 border-t border-[#7AB2B2]/20">
                        {vendorApplication?.status === 'SUSPENDED' ? (
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8">
                                <h4 className="flex items-center gap-2 text-gray-700 font-black mb-2 uppercase tracking-wide text-sm">
                                    <BsShieldExclamation /> Application Suspended
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    Your application has been suspended. Please contact our support team for more information and next steps.
                                </p>
                                <button
                                    onClick={() => window.location.href = "mailto:support@okkazo.com"}
                                    className="bg-[#09637E] text-white font-black text-xs px-6 py-4 rounded-xl hover:bg-[#088395] transition-all uppercase tracking-widest"
                                >
                                    Contact Support Team
                                </button>
                            </div>
                        ) : vendorApplication?.status === 'REJECTED' ? (
                            <div className="space-y-6">
                                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                    <h4 className="flex items-center gap-2 text-red-700 font-black mb-2 uppercase tracking-wide text-sm">
                                        <BsExclamationTriangleFill /> Application Rejected
                                    </h4>
                                    <p className="text-red-600/80 text-sm leading-relaxed">
                                        {vendorApplication.reviewNotes || "Your application did not meet our current requirements. You can re-upload your documents below."}
                                    </p>
                                </div>
                                {/* Document Upload Section */}
                                <div className="bg-white p-6 rounded-2xl border border-[#7AB2B2]/20 shadow-sm">
                                    <h4 className="text-[#09637E] font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                        <BsCloudUpload /> Re-upload Documents
                                    </h4>
                                    <p className="text-[#088395]/70 text-sm mb-6">Upload corrected documents to resubmit your application for review.</p>
                                    <div className="space-y-4">
                                        {/* Business License Upload */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#09637E] uppercase tracking-widest">Business License</label>
                                            <input type="file" ref={businessLicenseRef} onChange={(e) => handleFileSelect(e, 'businessLicense')} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                                            {!businessLicense ? (
                                                <div onClick={() => businessLicenseRef.current?.click()} className="w-full bg-[#EBF4F6]/50 rounded-2xl p-5 border-2 border-dashed border-[#7AB2B2]/30 hover:border-[#7AB2B2] hover:bg-white transition-all cursor-pointer group text-center">
                                                    <BsCloudUpload size={24} className="mx-auto mb-2 text-[#7AB2B2] group-hover:scale-110 transition-transform" />
                                                    <p className="text-[#09637E] font-bold text-xs">Tap to upload</p>
                                                    <p className="text-[#708aa0] text-[10px] mt-1">Max 5MB &bull; PDF, JPG, PNG</p>
                                                </div>
                                            ) : (
                                                <div className="w-full bg-white rounded-2xl p-4 border border-[#7AB2B2]/20 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <BsFileEarmarkText className="text-[#09637E] shrink-0" />
                                                        <p className="text-[#09637E] font-bold text-xs truncate">{businessLicense.name}</p>
                                                    </div>
                                                    <button onClick={() => { setBusinessLicense(null); if (businessLicenseRef.current) businessLicenseRef.current.value = ''; }} className="text-red-500 hover:scale-110 transition-transform"><BsTrash size={14} /></button>
                                                </div>
                                            )}
                                            {businessLicense && (
                                                <button onClick={() => handleUpload('businessLicense')} disabled={isUploading} className="w-full py-3 bg-[#088395] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#09637E] transition-all disabled:opacity-50">
                                                    {isUploading ? 'Uploading...' : 'Upload Business License'}
                                                </button>
                                            )}
                                        </div>
                                        {/* Owner Identity Upload */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#09637E] uppercase tracking-widest">Owner Identity</label>
                                            <input type="file" ref={ownerIdentityRef} onChange={(e) => handleFileSelect(e, 'ownerIdentity')} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                                            {!ownerIdentity ? (
                                                <div onClick={() => ownerIdentityRef.current?.click()} className="w-full bg-[#EBF4F6]/50 rounded-2xl p-5 border-2 border-dashed border-[#7AB2B2]/30 hover:border-[#7AB2B2] hover:bg-white transition-all cursor-pointer group text-center">
                                                    <BsCloudUpload size={24} className="mx-auto mb-2 text-[#7AB2B2] group-hover:scale-110 transition-transform" />
                                                    <p className="text-[#09637E] font-bold text-xs">Tap to upload</p>
                                                    <p className="text-[#708aa0] text-[10px] mt-1">Max 5MB &bull; PDF, JPG, PNG</p>
                                                </div>
                                            ) : (
                                                <div className="w-full bg-white rounded-2xl p-4 border border-[#7AB2B2]/20 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <BsFileEarmarkText className="text-[#09637E] shrink-0" />
                                                        <p className="text-[#09637E] font-bold text-xs truncate">{ownerIdentity.name}</p>
                                                    </div>
                                                    <button onClick={() => { setOwnerIdentity(null); if (ownerIdentityRef.current) ownerIdentityRef.current.value = ''; }} className="text-red-500 hover:scale-110 transition-transform"><BsTrash size={14} /></button>
                                                </div>
                                            )}
                                            {ownerIdentity && (
                                                <button onClick={() => handleUpload('ownerIdentity')} disabled={isUploading} className="w-full py-3 bg-[#088395] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#09637E] transition-all disabled:opacity-50">
                                                    {isUploading ? 'Uploading...' : 'Upload Owner Identity'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : vendorApplication?.status === 'DOCUMENTS_REQUESTED' ? (
                            <div className="space-y-6">
                                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                                    <h4 className="flex items-center gap-2 text-amber-700 font-black mb-2 uppercase tracking-wide text-sm">
                                        <BsExclamationTriangleFill /> Documents Requested
                                    </h4>
                                    <p className="text-amber-600/80 text-sm leading-relaxed">
                                        {vendorApplication.reviewNotes || "Our team has requested additional documents. Please upload them below."}
                                    </p>
                                </div>
                                {/* Document Upload Section - only show for non-VERIFIED docs */}
                                <div className="bg-white p-6 rounded-2xl border border-[#7AB2B2]/20 shadow-sm">
                                    <h4 className="text-[#09637E] font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                        <BsCloudUpload /> Upload Requested Documents
                                    </h4>
                                    <p className="text-[#088395]/70 text-sm mb-6">Upload only the documents that need attention.</p>
                                    <div className="space-y-4">
                                        {/* Business License Upload - only if not VERIFIED */}
                                        {vendorApplication?.documents?.businessLicense?.status !== 'VERIFIED' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#09637E] uppercase tracking-widest">Business License</label>
                                            {vendorApplication?.documents?.businessLicense?.status === 'REJECTED' && vendorApplication?.documents?.businessLicense?.rejectionReason && (
                                                <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                                                    <span className="font-bold">Rejected:</span> {vendorApplication.documents.businessLicense.rejectionReason}
                                                </p>
                                            )}
                                            <input type="file" ref={businessLicenseRef} onChange={(e) => handleFileSelect(e, 'businessLicense')} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                                            {!businessLicense ? (
                                                <div onClick={() => businessLicenseRef.current?.click()} className="w-full bg-[#EBF4F6]/50 rounded-2xl p-5 border-2 border-dashed border-[#7AB2B2]/30 hover:border-[#7AB2B2] hover:bg-white transition-all cursor-pointer group text-center">
                                                    <BsCloudUpload size={24} className="mx-auto mb-2 text-[#7AB2B2] group-hover:scale-110 transition-transform" />
                                                    <p className="text-[#09637E] font-bold text-xs">Tap to upload</p>
                                                    <p className="text-[#708aa0] text-[10px] mt-1">Max 5MB &bull; PDF, JPG, PNG</p>
                                                </div>
                                            ) : (
                                                <div className="w-full bg-white rounded-2xl p-4 border border-[#7AB2B2]/20 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <BsFileEarmarkText className="text-[#09637E] shrink-0" />
                                                        <p className="text-[#09637E] font-bold text-xs truncate">{businessLicense.name}</p>
                                                    </div>
                                                    <button onClick={() => { setBusinessLicense(null); if (businessLicenseRef.current) businessLicenseRef.current.value = ''; }} className="text-red-500 hover:scale-110 transition-transform"><BsTrash size={14} /></button>
                                                </div>
                                            )}
                                            {businessLicense && (
                                                <button onClick={() => handleUpload('businessLicense')} disabled={isUploading} className="w-full py-3 bg-[#088395] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#09637E] transition-all disabled:opacity-50">
                                                    {isUploading ? 'Uploading...' : 'Upload Business License'}
                                                </button>
                                            )}
                                        </div>
                                        )}
                                        {/* Owner Identity Upload - only if not VERIFIED */}
                                        {vendorApplication?.documents?.ownerIdentity?.status !== 'VERIFIED' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#09637E] uppercase tracking-widest">Owner Identity</label>
                                            {vendorApplication?.documents?.ownerIdentity?.status === 'REJECTED' && vendorApplication?.documents?.ownerIdentity?.rejectionReason && (
                                                <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                                                    <span className="font-bold">Rejected:</span> {vendorApplication.documents.ownerIdentity.rejectionReason}
                                                </p>
                                            )}
                                            <input type="file" ref={ownerIdentityRef} onChange={(e) => handleFileSelect(e, 'ownerIdentity')} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                                            {!ownerIdentity ? (
                                                <div onClick={() => ownerIdentityRef.current?.click()} className="w-full bg-[#EBF4F6]/50 rounded-2xl p-5 border-2 border-dashed border-[#7AB2B2]/30 hover:border-[#7AB2B2] hover:bg-white transition-all cursor-pointer group text-center">
                                                    <BsCloudUpload size={24} className="mx-auto mb-2 text-[#7AB2B2] group-hover:scale-110 transition-transform" />
                                                    <p className="text-[#09637E] font-bold text-xs">Tap to upload</p>
                                                    <p className="text-[#708aa0] text-[10px] mt-1">Max 5MB &bull; PDF, JPG, PNG</p>
                                                </div>
                                            ) : (
                                                <div className="w-full bg-white rounded-2xl p-4 border border-[#7AB2B2]/20 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <BsFileEarmarkText className="text-[#09637E] shrink-0" />
                                                        <p className="text-[#09637E] font-bold text-xs truncate">{ownerIdentity.name}</p>
                                                    </div>
                                                    <button onClick={() => { setOwnerIdentity(null); if (ownerIdentityRef.current) ownerIdentityRef.current.value = ''; }} className="text-red-500 hover:scale-110 transition-transform"><BsTrash size={14} /></button>
                                                </div>
                                            )}
                                            {ownerIdentity && (
                                                <button onClick={() => handleUpload('ownerIdentity')} disabled={isUploading} className="w-full py-3 bg-[#088395] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#09637E] transition-all disabled:opacity-50">
                                                    {isUploading ? 'Uploading...' : 'Upload Owner Identity'}
                                                </button>
                                            )}
                                        </div>
                                        )}
                                        {/* Show message if all docs are verified */}
                                        {vendorApplication?.documents?.businessLicense?.status === 'VERIFIED' && vendorApplication?.documents?.ownerIdentity?.status === 'VERIFIED' && (
                                            <div className="bg-green-50 p-4 rounded-2xl border border-green-200 text-center">
                                                <p className="text-green-700 font-bold text-sm">All documents are verified. Your application is being processed.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#EBF4F6] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#7AB2B2]/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#088395] shadow-sm">
                                        <BsClockFill className="text-xl animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-[#088395] uppercase tracking-widest">Est. Completion</p>
                                        <p className="text-[#09637E] font-bold">2-3 Working Days</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.location.href = "mailto:support@okkazo.com"}
                                    className="bg-white text-[#09637E] font-black text-xs px-6 py-4 rounded-xl border-2 border-[#7AB2B2]/30 hover:bg-[#09637E] hover:text-white hover:border-[#09637E] transition-all uppercase tracking-widest"
                                >
                                    Get Assistance
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Quick Info */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Business Summary Card */}
                    <div className="bg-[#09637E] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#09637E]/20 relative overflow-hidden">
                        {/* Decorative Circle */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <BsShop /> Business Identity
                        </h2>

                        <div className="space-y-6 relative">
                            <div>
                                <p className="text-[10px] font-black text-[#7AB2B2] uppercase tracking-[0.2em] mb-2">Registry Name</p>
                                <p className="text-xl font-bold border-l-4 border-[#088395] pl-4">{vendorApplication?.businessName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-[#7AB2B2] uppercase tracking-[0.2em] mb-2">Category</p>
                                    <p className="font-bold text-sm bg-white/10 p-3 rounded-xl">{vendorApplication?.serviceCategory}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#7AB2B2] uppercase tracking-[0.2em] mb-2">Location</p>
                                    <p className="font-bold text-sm bg-white/10 p-3 rounded-xl flex items-center gap-2">
                                        <BsGeoAltFill className="text-[#088395]" /> {vendorApplication?.location || 'Unknown'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-[#7AB2B2] uppercase tracking-[0.2em] mb-2">Contact Channels</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors">
                                        <BsEnvelopeFill className="text-[#088395]" />
                                        <span className="text-sm font-medium opacity-90 truncate">{vendorApplication?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors">
                                        <BsTelephoneFill className="text-[#088395]" />
                                        <span className="text-sm font-medium opacity-90">{vendorApplication?.phone}</span>
                                    </div>
                                </div>
                            </div>

                            {vendorApplication?.description && (
                                <div className="bg-[#EBF4F6]/10 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black text-[#7AB2B2] uppercase tracking-[0.2em] mb-2">Service Overview</p>
                                    <p className="text-xs leading-relaxed italic opacity-80">"{vendorApplication.description}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Verification Progress Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#7AB2B2]/20 shadow-lg shadow-[#7AB2B2]/10">
                        <h3 className="text-[#09637E] font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                            Verification Status
                        </h3>

                        <div className="space-y-4">
                            {[
                                { id: 'bl', name: 'Business License', doc: vendorApplication?.documents?.businessLicense },
                                { id: 'oi', name: 'Owner Identity', doc: vendorApplication?.documents?.ownerIdentity }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-[#EBF4F6]/30 rounded-2xl border border-[#7AB2B2]/10">
                                    <div className="flex items-center gap-3">
                                        {item.doc?.status === 'REJECTED' ? <BsXCircleFill className="text-red-400" /> : <BsCheckCircleFill className={item.doc?.status === 'VERIFIED' ? 'text-[#088395]' : 'text-[#7AB2B2]/30'} />}
                                        <span className="text-sm font-bold text-[#09637E]">{item.name}</span>
                                    </div>
                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full tracking-[0.1em] border ${item.doc?.status === 'VERIFIED' ? 'bg-[#088395] border-[#088395] text-white' :
                                        item.doc?.status === 'REJECTED' ? 'bg-red-100 border-red-300 text-red-600' :
                                        'bg-white border-[#7AB2B2]/30 text-[#088395]'
                                        }`}>
                                        {(item.doc?.status || 'PENDING').replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex items-start gap-3 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100">
                            <BsInfoCircleFill className="text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-yellow-800 leading-relaxed font-medium">
                                Our verification office is currently processing a high volume of requests.
                                We appreciate your patience.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VendorApplicationStatus;
