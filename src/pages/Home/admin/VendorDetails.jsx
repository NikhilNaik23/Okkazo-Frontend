import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendorApplications, approveVendorApplication, rejectVendorApplication, requestVendorDocuments, verifyDocument, rejectDocument, fetchVendorServicesByAuthId } from "../../../store/slices/adminSlice";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Info,
  BadgeCheck,
  Clock,
  IndianRupee,
  MoreVertical,
  Briefcase,
  UserMinus,
  Ban,
  Edit3,
  CreditCard,
  Flag,
  Trash2,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};


// Helper function to get document status
const getDocumentStatus = (doc) => {
  if (!doc) return 'pending';
  if (doc.status === 'VERIFIED') return 'verified';
  if (doc.status === 'REJECTED') return 'warning';
  return 'pending';
};

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestDocsModal, setShowRequestDocsModal] = useState(false);
  const [showVerifyDocModal, setShowVerifyDocModal] = useState(false);
  const [showRejectDocModal, setShowRejectDocModal] = useState(false);
  
  // Form states
  const [rejectReason, setRejectReason] = useState("");
  const [requestedDocs, setRequestedDocs] = useState("");
  const [docRejectReason, setDocRejectReason] = useState("");

  const {
    vendorApplications,
    loading,
    error,
    submitting,
    vendorServicesByAuthId,
    vendorServicesLoadingByAuthId,
    vendorServicesErrorByAuthId,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    if (vendorApplications.length === 0) {
      dispatch(fetchVendorApplications());
    }
  }, [dispatch, vendorApplications.length]);

  // Find the vendor from the fetched applications
  const vendor = vendorApplications.find(v => v.applicationId === id);

  const isVerifiedVendor = vendor?.status === "APPROVED";

  const vendorAuthId = vendor?.authId;
  const vendorServicesResult = vendorAuthId ? vendorServicesByAuthId?.[vendorAuthId] : null;
  const vendorServicesLoading = vendorAuthId ? Boolean(vendorServicesLoadingByAuthId?.[vendorAuthId]) : false;
  const vendorServicesError = vendorAuthId ? vendorServicesErrorByAuthId?.[vendorAuthId] : null;


  useEffect(() => {
    if (!isVerifiedVendor) return;
    if (activeTab !== 'services') return;
    if (!vendorAuthId) return;
    if (vendorServicesResult || vendorServicesLoading || vendorServicesError) return;

    dispatch(fetchVendorServicesByAuthId({ vendorAuthId, limit: 100, skip: 0 }));
  }, [
    activeTab,
    dispatch,
    isVerifiedVendor,
    vendorAuthId,
    vendorServicesError,
    vendorServicesLoading,
    vendorServicesResult,
  ]);

  useEffect(() => {
    // Prevent access to Services/Pricing while vendor is unverified
    if (!isVerifiedVendor && activeTab === "services") {
      setActiveTab("overview");
    }
  }, [activeTab, isVerifiedVendor]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#f8fafc] items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#d7a444]" />
        <p className="mt-4 text-[#708aa0] font-medium">Loading vendor details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-[#f8fafc] items-center justify-center">
        <p className="text-red-500 font-bold">Error loading vendor</p>
        <p className="text-[#708aa0] mt-2">{error}</p>
        <button 
          onClick={() => navigate("/admin/vendors")}
          className="mt-4 px-6 py-3 bg-[#0b2d49] text-white rounded-xl font-bold"
        >
          Back to Vendors
        </button>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col h-full bg-[#f8fafc] items-center justify-center">
        <p className="text-[#0b2d49] font-bold text-xl">Vendor not found</p>
        <button 
          onClick={() => navigate("/admin/vendors")}
          className="mt-4 px-6 py-3 bg-[#0b2d49] text-white rounded-xl font-bold"
        >
          Back to Vendors
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };
  
  const handleRequestDocs = () => {
    setShowRequestDocsModal(true);
  };
  
  const confirmApprove = async () => {
    const result = await dispatch(approveVendorApplication(vendor.applicationId));
    if (approveVendorApplication.fulfilled.match(result)) {
      toast.success(`${vendor.businessName} has been approved successfully!`);
      setShowApproveModal(false);
    } else {
      toast.error(result.payload || 'Failed to approve vendor. Please try again.');
    }
  };
  
  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    const result = await dispatch(rejectVendorApplication({ applicationId: vendor.applicationId, rejectionReason: rejectReason }));
    if (rejectVendorApplication.fulfilled.match(result)) {
      toast.success(`${vendor.businessName} application has been rejected.`);
      setShowRejectModal(false);
      setRejectReason("");
    } else {
      toast.error(result.payload || 'Failed to reject application. Please try again.');
    }
  };
  
  const confirmRequestDocs = async () => {
    if (!requestedDocs.trim()) {
      toast.error('Please specify what documents are needed');
      return;
    }
    
    const result = await dispatch(requestVendorDocuments({ applicationId: vendor.applicationId, requestedDocuments: requestedDocs }));
    if (requestVendorDocuments.fulfilled.match(result)) {
      toast.success('Document request sent successfully!');
      setShowRequestDocsModal(false);
      setRequestedDocs("");
    } else {
      toast.error(result.payload || 'Failed to send document request. Please try again.');
    }
  };

  const confirmVerifyDoc = async () => {
    if (!selectedDoc) return;
    const result = await dispatch(verifyDocument({ 
      applicationId: vendor.applicationId, 
      documentType: selectedDoc.documentType,
      documentId: selectedDoc.documentId
    }));
    if (verifyDocument.fulfilled.match(result)) {
      toast.success(`${selectedDoc.title} verified successfully!`);
      setShowVerifyDocModal(false);
      setSelectedDoc(null);
    } else {
      toast.error(result.payload || 'Failed to verify document.');
    }
  };

  const confirmRejectDoc = async () => {
    if (!selectedDoc || !docRejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    const result = await dispatch(rejectDocument({ 
      applicationId: vendor.applicationId, 
      documentType: selectedDoc.documentType,
      documentId: selectedDoc.documentId,
      rejectionReason: docRejectReason
    }));
    if (rejectDocument.fulfilled.match(result)) {
      toast.success(`${selectedDoc.title} rejected. Vendor will be asked to re-upload.`);
      setShowRejectDocModal(false);
      setDocRejectReason("");
      setSelectedDoc(null);
    } else {
      toast.error(result.payload || 'Failed to reject document.');
    }
  };

  // Get status display text
  const getStatusDisplay = () => {
    const statusMap = {
      'PENDING_REVIEW': { text: 'PENDING REVIEW', color: 'bg-[#f3ddb1] text-[#0b2d49] border-[#d7a444]/20' },
      'DOCUMENTS_REQUESTED': { text: 'DOCUMENTS REQUESTED', color: 'bg-amber-50 text-amber-600 border-amber-200' },
      'UNDER_VERIFICATION': { text: 'UNDER REVIEW', color: 'bg-[#f3ddb1] text-[#0b2d49] border-[#d7a444]/20' },
      'APPROVED': { text: 'VERIFIED VENDOR', color: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' },
      'REJECTED': { text: 'REJECTED', color: 'bg-red-50 text-red-600 border-red-200' },
      'SUSPENDED': { text: 'SUSPENDED', color: 'bg-gray-100 text-gray-600 border-gray-200' }
    };
    return statusMap[vendor.status] || { text: vendor.status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
  };

  const statusDisplay = getStatusDisplay();

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "documents", label: "Documents", icon: FileText },
    ...(isVerifiedVendor ? [{ id: "services", label: "Services & Pricing", icon: Briefcase }] : []),
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Navigation Header */}
      <div className="bg-white border-b border-[#e9eff1] px-8 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/vendors")}
            className="p-2.5 hover:bg-[#f8fafc] rounded-xl text-[#708aa0] hover:text-[#0b2d49] transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-8 w-[1px] bg-[#e9eff1]"></div>
          <div>
            <nav className="flex items-center gap-2 text-xs font-black text-[#708aa0] uppercase tracking-widest mb-0.5">
              <span>Vendors</span>
              <ChevronRight size={12} />
              <span className="text-[#d7a444]">{vendor.applicationId}</span>
            </nav>
            <h2 className="text-xl font-black text-[#0b2d49]">Application Review</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-2.5 rounded-xl transition-all ${showMoreMenu ? 'bg-[#0b2d49] text-white shadow-lg' : 'text-[#708aa0] hover:bg-[#f8fafc]'}`}
            >
              <MoreVertical size={20} />
            </button>

            {showMoreMenu && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e9eff1] rounded-2xl shadow-2xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#0b2d49] hover:bg-[#f8fafc] rounded-xl transition-all group">
                      <Edit3 size={16} className="text-[#d7a444]" />
                      Edit Details
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#0b2d49] hover:bg-[#f8fafc] rounded-xl transition-all group">
                      <CreditCard size={16} className="text-[#d7a444]" />
                      View Ledger
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#0b2d49] hover:bg-[#f8fafc] rounded-xl transition-all group">
                      <Flag size={16} className="text-[#d7a444]" />
                      Report Issue
                    </button>
                    <div className="h-[1px] bg-[#e9eff1] my-2 mx-2"></div>
                    <button 
                      onClick={() => {
                        toast.error("Suspension feature coming soon");
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                    >
                      <Ban size={16} />
                      Suspend Vendor
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm(`Are you sure you want to remove ${vendor.businessName}?`)) {
                          toast.success("Vendor removed successfully");
                          navigate("/admin/vendors");
                        }
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                      Remove Vendor
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Profile Hero Section */}
        <div className="bg-white border-b border-[#e9eff1]">
          <div className="px-8 py-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Entity Icon / Brand */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#0b2d49] to-[#1a4a6e] flex items-center justify-center text-5xl font-black shadow-inner relative overflow-hidden">
                   <Building2 size={48} className="relative z-10 text-white/80" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-4 border-[#f8fafc] rounded-full flex items-center justify-center text-[#10b981] shadow-md">
                   <ShieldCheck size={20} />
                </div>
              </div>

              {/* Identity Details */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                   <h1 className="text-4xl font-black text-[#0b2d49] tracking-tight">{vendor.businessName}</h1>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${statusDisplay.color}`}>
                     <span className={`w-2 h-2 rounded-full ${vendor.status === "APPROVED" ? "bg-[#10b981]" : "bg-[#d7a444] animate-pulse"}`}></span>
                     {statusDisplay.text}
                   </span>
                </div>
                
                <p className="text-lg text-[#5a5b44] font-medium max-w-2xl leading-relaxed">
                  {vendor.description || vendor.serviceCategory}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                  <div className="flex items-center gap-3 text-[#708aa0]">
                    <div className="w-10 h-10 rounded-xl bg-[#f8fafc] flex items-center justify-center text-[#0b2d49]"><MapPin size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Location</p>
                      <p className="text-sm font-bold text-[#0b2d49]">{vendor.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#708aa0]">
                    <div className="w-10 h-10 rounded-xl bg-[#f8fafc] flex items-center justify-center text-[#0b2d49]"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Submitted</p>
                      <p className="text-sm font-bold text-[#0b2d49]">{formatDate(vendor.submittedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#708aa0]">
                    <div className="w-10 h-10 rounded-xl bg-[#f8fafc] flex items-center justify-center text-[#0b2d49]"><BadgeCheck size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Status</p>
                      <p className="text-sm font-bold text-[#0b2d49]">{vendor.status === 'APPROVED' ? 'KYC Verified' : 'KYC Ready'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Actions Box */}
              {vendor.status !== "APPROVED" && vendor.status !== "SUSPENDED" && (
                <div className="w-full md:w-auto min-w-[300px] bg-[#f8fafc] border border-[#e9eff1] rounded-3xl p-8 flex flex-col gap-4">
                  {vendor.status !== "REJECTED" && (
                    <button 
                     onClick={handleApprove}
                     className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-xl shadow-[#0b2d49]/10 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Approve Vendor
                    </button>
                  )}
                  {vendor.status !== "REJECTED" && (
                    <button 
                     onClick={handleReject}
                     className="w-full py-4 bg-white border border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject Application
                    </button>
                  )}
                  {vendor.status !== "DOCUMENTS_REQUESTED" && vendor.status !== "REJECTED" && (
                    <button 
                     onClick={handleRequestDocs}
                     className="w-full py-4 bg-[#e9eff1] text-[#0b2d49] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 mt-4">
                      <AlertCircle size={18} />
                      Request Documents
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabbed Navigation */}
          <div className="px-8 max-w-7xl mx-auto">
             <div className="flex border-b border-[#e9eff1]">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-8 py-5 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all relative ${
                        activeTab === tab.id 
                          ? "text-[#0b2d49]" 
                          : "text-[#708aa0] hover:text-[#0b2d49]"
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#d7a444] rounded-t-full"></div>
                      )}
                    </button>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Dynamic Content Sections */}
        <div className="px-8 py-12 max-w-7xl mx-auto">
           {activeTab === "overview" && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Business Profile Details */}
               <div className="lg:col-span-2 space-y-8">
                 <div className="bg-white rounded-3xl border border-[#e9eff1] p-10 shadow-sm">
                    <h3 className="text-xl font-black text-[#0b2d49] mb-8 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#d7a444] rounded-full"></div>
                      Official Registration Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <DetailItem label="Business Name" value={vendor.businessName} />
                      <DetailItem label="Service Category" value={vendor.serviceCategory} />
                      <DetailItem label="Application ID" value={vendor.applicationId} />
                      <DetailItem label="Contact Email" value={vendor.email} />
                      <DetailItem label="Primary Phone" value={vendor.phone} />
                      <DetailItem label="Location" value={vendor.location} fullWidth />
                    </div>
                 </div>

                 <div className="bg-white rounded-3xl border border-[#e9eff1] p-10 shadow-sm">
                    <h3 className="text-xl font-black text-[#0b2d49] mb-8 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#d7a444] rounded-full"></div>
                      Verification Checks
                    </h3>
                    <div className="space-y-4">
                       <CheckItem 
                        title="Business License Verification" 
                        status={getDocumentStatus(vendor.documents?.businessLicense)} 
                        message={vendor.documents?.businessLicense ? `Document uploaded: ${vendor.documents.businessLicense.fileName}` : 'No document uploaded yet'}
                       />
                       <CheckItem 
                        title="Individual Identity (KYC)" 
                        status={getDocumentStatus(vendor.documents?.ownerIdentity)} 
                        message={vendor.documents?.ownerIdentity ? `Document uploaded: ${vendor.documents.ownerIdentity.fileName}` : 'No document uploaded yet'}
                       />
                       <CheckItem 
                        title="Additional Documents" 
                        status={vendor.documents?.otherProofs?.length > 0 ? 'verified' : 'pending'} 
                        message={vendor.documents?.otherProofs?.length > 0 ? `${vendor.documents.otherProofs.length} additional document(s) uploaded` : 'No additional documents'}
                       />
                    </div>
                 </div>
               </div>

               {/* Side Stats */}
               <div className="space-y-8">
                  {vendor.status === "APPROVED" && (
                    <div className="bg-[#0b2d49] rounded-3xl p-10 text-white shadow-xl shadow-[#0b2d49]/10 block-gradient">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-8">Financial Overview</h4>
                      <div className="space-y-8">
                        <div>
                            <p className="text-xs font-bold opacity-60 mb-2">Platform Revenue Share</p>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-black">2.5%</span>
                                <div className="p-2 bg-white/10 rounded-lg"><TrendingUp size={20} className="text-[#d7a444]" /></div>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold opacity-60 mb-2">Estimated Monthly Payout</p>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-black flex items-center gap-1"><IndianRupee size={24} /> 45,000+</span>
                            </div>
                        </div>
                      </div>
                    </div>
                  )}


               </div>
             </div>
           )}

           {activeTab === "documents" && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {vendor.documents?.businessLicense && (
                  <DocumentCard 
                    title="Business License" 
                    type={vendor.documents.businessLicense.fileName?.split('.').pop()?.toUpperCase() || 'PDF'} 
                    size="--" 
                    status={vendor.documents.businessLicense.status}
                    onClick={() => setSelectedDoc({ 
                      title: "Business License", 
                      type: vendor.documents.businessLicense.fileName?.split('.').pop()?.toUpperCase() || 'PDF', 
                      size: "--",
                      url: vendor.documents.businessLicense.fileUrl,
                      documentType: 'businessLicense',
                      status: vendor.documents.businessLicense.status
                    })}
                  />
                )}
                {vendor.documents?.ownerIdentity && (
                  <DocumentCard 
                    title="Owner Identity" 
                    type={vendor.documents.ownerIdentity.fileName?.split('.').pop()?.toUpperCase() || 'PDF'} 
                    size="--" 
                    status={vendor.documents.ownerIdentity.status}
                    onClick={() => setSelectedDoc({ 
                      title: "Owner Identity", 
                      type: vendor.documents.ownerIdentity.fileName?.split('.').pop()?.toUpperCase() || 'PDF', 
                      size: "--",
                      url: vendor.documents.ownerIdentity.fileUrl,
                      documentType: 'ownerIdentity',
                      status: vendor.documents.ownerIdentity.status
                    })}
                  />
                )}
                {vendor.documents?.otherProofs?.map((doc, index) => (
                  <DocumentCard 
                    key={doc.documentId || index}
                    title={doc.description || `Other Document ${index + 1}`} 
                    type={doc.fileName?.split('.').pop()?.toUpperCase() || 'PDF'} 
                    size="--" 
                    status={doc.status}
                    onClick={() => setSelectedDoc({ 
                      title: doc.description || `Other Document ${index + 1}`, 
                      type: doc.fileName?.split('.').pop()?.toUpperCase() || 'PDF', 
                      size: "--",
                      url: doc.fileUrl,
                      documentType: 'otherProof',
                      documentId: doc.documentId,
                      status: doc.status
                    })}
                  />
                ))}
                {!vendor.documents?.businessLicense && !vendor.documents?.ownerIdentity && (!vendor.documents?.otherProofs || vendor.documents?.otherProofs.length === 0) && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#708aa0] bg-white rounded-[2.5rem] border-2 border-dashed border-[#e9eff1]">
                    <FileText size={40} className="mb-4 opacity-10" />
                    <p className="text-xl font-bold text-[#0b2d49]">No documents uploaded</p>
                    <p className="text-sm text-[#708aa0] mt-2">Vendor has not uploaded any documents yet.</p>
                  </div>
                )}
             </div>
           )}

             {isVerifiedVendor && activeTab === "services" && (
             <div className="bg-white rounded-[2.5rem] border border-[#e9eff1] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black text-[#0b2d49]">Service Catalog Preview</h3>
                   <div className="flex items-center gap-2 px-6 py-2 bg-[#f8fafc] rounded-full border border-[#e9eff1] text-xs font-bold text-[#0b2d49]">
                        Total Services: {vendorServicesResult?.total ?? vendorServicesResult?.services?.length ?? 0}
                   </div>
                </div>
                  {vendorServicesLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 size={28} className="animate-spin text-[#d7a444]" />
                    </div>
                  ) : vendorServicesError ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <p className="text-sm font-bold text-red-500">Failed to load services</p>
                      <p className="text-xs text-[#708aa0] mt-2 font-medium">{vendorServicesError}</p>
                      {vendorAuthId && (
                        <button
                          type="button"
                          onClick={() => dispatch(fetchVendorServicesByAuthId({ vendorAuthId, limit: 100, skip: 0 }))}
                          className="mt-6 text-[#d7a444] font-black uppercase tracking-widest text-[10px] hover:underline"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(Array.isArray(vendorServicesResult?.services) ? vendorServicesResult.services : []).length > 0 ? (
                        (vendorServicesResult.services || []).map((svc) => {
                          const svcId = svc?._id || svc?.id;
                          const price = Number(svc?.price ?? 0);
                          const formattedPrice = Number.isFinite(price) ? price.toLocaleString() : '0';
                          const normalizedServiceCategory = String(svc?.serviceCategory || vendor?.serviceCategory || '').trim();
                          const isVenueService = normalizedServiceCategory.toUpperCase() === 'VENUE'
                            || String(svc?.categoryId || '').trim().toLowerCase() === 'venues';
                          const venueLocation = String(
                            svc?.details?.locationAreaName
                              || svc?.details?.location
                              || vendor?.location
                              || 'Location not provided'
                          ).trim();

                          return (
                            <div
                              key={svcId || `${svc?.name}-${svc?.createdAt}`}
                              className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-[#e9eff1]"
                            >
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white border border-[#e9eff1] rounded-xl flex items-center justify-center text-[#d7a444]">
                                  <Briefcase size={24} />
                                </div>
                                <div>
                                  <h5 className="font-black text-[#0b2d49] text-lg line-clamp-1">
                                    {svc?.name || (isVenueService ? 'Venue' : 'Service')}
                                  </h5>
                                  <div className="flex items-center gap-3 mt-1">
                                    {isVenueService ? (
                                      <p className="text-xs font-bold text-[#708aa0] tracking-wide line-clamp-1">
                                        Venue Location: {venueLocation}
                                      </p>
                                    ) : svc?.tier ? (
                                      <p className="text-xs font-bold text-[#708aa0] uppercase tracking-widest">Tier: {svc.tier}</p>
                                    ) : (
                                      <p className="text-xs font-bold text-[#708aa0] uppercase tracking-widest">Category: {svc?.serviceCategory || vendor?.serviceCategory || '—'}</p>
                                    )}
                                    {svc?.status ? (
                                      <>
                                        <span className="w-1 h-1 bg-[#e9eff1] rounded-full" />
                                        <p className="text-xs font-bold text-[#708aa0] uppercase tracking-widest">{svc.status}</p>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-10">
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest mb-1">
                                    {isVenueService ? 'Venue Price' : 'Service Price'}
                                  </p>
                                  <p className="text-xl font-black text-[#0b2d49] flex items-center justify-end gap-1">
                                    <IndianRupee size={18} /> {formattedPrice}
                                  </p>
                                </div>
                                <ChevronRight size={20} className="text-[#e9eff1]" />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center text-[#708aa0] bg-white rounded-[2.5rem] border-2 border-dashed border-[#e9eff1]">
                          <Briefcase size={40} className="mb-4 opacity-10" />
                          <p className="text-xl font-bold text-[#0b2d49]">No services found</p>
                          <p className="text-sm text-[#708aa0] mt-2 font-medium">This vendor has not created any services yet.</p>
                        </div>
                      )}
                    </div>
                  )}
             </div>
           )}

        </div>
      </div>

      {/* Document Verification Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0b2d49]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedDoc(null)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#f8fafc] rounded-2xl flex items-center justify-center text-[#d7a444] border border-[#e9eff1]">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0b2d49]">{selectedDoc.title}</h3>
                    <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest mt-1">Reviewing {selectedDoc.type} • {selectedDoc.size}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 hover:bg-[#f8fafc] rounded-xl text-[#708aa0] transition-all"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Document Preview Area */}
              <div className="w-full bg-[#f8fafc] rounded-3xl border border-[#e9eff1] overflow-hidden mb-8 shadow-inner">
                {selectedDoc.url ? (
                  selectedDoc.type === 'PDF' ? (
                    <iframe 
                      src={selectedDoc.url}
                      title={selectedDoc.title}
                      className="w-full h-[400px]"
                    />
                  ) : (
                    <img 
                      src={selectedDoc.url} 
                      alt={selectedDoc.title} 
                      className="w-full h-auto max-h-[400px] object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-[#708aa0]">
                    <FileText size={48} className="opacity-20 mb-4" />
                    <p className="font-bold">No preview available</p>
                  </div>
                )}
                <div className="hidden flex-col items-center justify-center py-20 text-[#708aa0]">
                  <FileText size={48} className="opacity-20 mb-4" />
                  <p className="font-bold">Unable to load preview</p>
                  {selectedDoc.url && (
                    <a 
                      href={selectedDoc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-4 text-[#d7a444] font-black uppercase tracking-widest text-xs hover:underline"
                    >
                      Open in new tab
                    </a>
                  )}
                </div>
              </div>

              {/* Open in new tab button */}
              {selectedDoc.url && (
                <div className="mb-6 text-center">
                  <a 
                    href={selectedDoc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#d7a444] font-black uppercase tracking-widest text-[10px] hover:underline"
                  >
                    <ExternalLink size={14} />
                    Open document in new tab
                  </a>
                </div>
              )}

              {/* Document Status Badge */}
              {selectedDoc.status && (
                <div className="mb-6 flex items-center gap-2">
                  <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border ${
                    selectedDoc.status === 'VERIFIED' ? 'bg-green-50 text-green-600 border-green-200' :
                    selectedDoc.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {selectedDoc.status.replace('_', ' ')}
                  </span>
                </div>
              )}

              <div className="flex gap-4">
                {vendor.status !== "APPROVED" && selectedDoc.status !== 'VERIFIED' ? (
                  <>
                    <button 
                      onClick={() => setShowVerifyDocModal(true)}
                      disabled={submitting}
                      className="flex-1 py-4 bg-[#10b981] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 size={18} />
                      Verify Doc
                    </button>
                    {selectedDoc.status !== 'REJECTED' && (
                      <button 
                        onClick={() => setShowRejectDocModal(true)}
                        disabled={submitting}
                        className="flex-1 py-4 bg-white border border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    )}
                  </>
                ) : (
                  <button 
                    onClick={() => setSelectedDoc(null)}
                    className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all flex items-center justify-center gap-2"
                  >
                    Close Viewer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Approve Vendor Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0b2d49]/60 backdrop-blur-sm transition-opacity"
            onClick={() => !submitting && setShowApproveModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#10b981] border border-green-100">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0b2d49]">Approve Vendor</h3>
                    <p className="text-xs font-medium text-[#708aa0] mt-1">Confirm vendor approval</p>
                  </div>
                </div>
                {!submitting && (
                  <button 
                    onClick={() => setShowApproveModal(false)}
                    className="p-2 hover:bg-[#f8fafc] rounded-xl text-[#708aa0] transition-all"
                  >
                    <XCircle size={24} />
                  </button>
                )}
              </div>

              <div className="bg-[#f8fafc] rounded-2xl p-6 mb-6 border border-[#e9eff1]">
                <p className="text-sm font-bold text-[#0b2d49] mb-2">You are about to approve:</p>
                <p className="text-lg font-black text-[#d7a444]">{vendor?.businessName}</p>
                <p className="text-xs text-[#708aa0] mt-2">This will create a vendor account and send credentials to {vendor?.email}</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowApproveModal(false)}
                  disabled={submitting}
                  className="flex-1 py-4 bg-white border border-[#e9eff1] text-[#708aa0] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#f8fafc] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmApprove}
                  disabled={submitting}
                  className="flex-1 py-4 bg-[#10b981] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Confirm Approval
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0b2d49]/60 backdrop-blur-sm transition-opacity"
            onClick={() => !submitting && setShowRejectModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
                    <XCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0b2d49]">Reject Application</h3>
                    <p className="text-xs font-medium text-[#708aa0] mt-1">Provide rejection reason</p>
                  </div>
                </div>
                {!submitting && (
                  <button 
                    onClick={() => setShowRejectModal(false)}
                    className="p-2 hover:bg-[#f8fafc] rounded-xl text-[#708aa0] transition-all"
                  >
                    <XCircle size={24} />
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black text-[#0b2d49] uppercase tracking-widest mb-3">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this application is being rejected..."
                  disabled={submitting}
                  className="w-full px-4 py-3 border border-[#e9eff1] rounded-2xl text-sm font-medium text-[#0b2d49] placeholder-[#708aa0]/50 focus:outline-none focus:ring-2 focus:ring-[#d7a444] focus:border-transparent resize-none disabled:opacity-50 disabled:bg-[#f8fafc]"
                  rows={5}
                />
                <p className="text-[10px] text-[#708aa0] mt-2 font-medium">This reason will be sent to the vendor via email.</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  disabled={submitting}
                  className="flex-1 py-4 bg-white border border-[#e9eff1] text-[#708aa0] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#f8fafc] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmReject}
                  disabled={submitting || !rejectReason.trim()}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle size={18} />
                      Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Documents Modal */}
      {showRequestDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0b2d49]/60 backdrop-blur-sm transition-opacity"
            onClick={() => !submitting && setShowRequestDocsModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-[#d7a444] border border-amber-100">
                    <AlertCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0b2d49]">Request Documents</h3>
                    <p className="text-xs font-medium text-[#708aa0] mt-1">Specify required documents</p>
                  </div>
                </div>
                {!submitting && (
                  <button 
                    onClick={() => setShowRequestDocsModal(false)}
                    className="p-2 hover:bg-[#f8fafc] rounded-xl text-[#708aa0] transition-all"
                  >
                    <XCircle size={24} />
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black text-[#0b2d49] uppercase tracking-widest mb-3">
                  Documents Needed *
                </label>
                <textarea
                  value={requestedDocs}
                  onChange={(e) => setRequestedDocs(e.target.value)}
                  placeholder="List the documents that need to be provided or updated..."
                  disabled={submitting}
                  className="w-full px-4 py-3 border border-[#e9eff1] rounded-2xl text-sm font-medium text-[#0b2d49] placeholder-[#708aa0]/50 focus:outline-none focus:ring-2 focus:ring-[#d7a444] focus:border-transparent resize-none disabled:opacity-50 disabled:bg-[#f8fafc]"
                  rows={5}
                />
                <p className="text-[10px] text-[#708aa0] mt-2 font-medium">Example: "Please upload a clearer copy of business license" or "Additional tax registration certificate required"</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowRequestDocsModal(false);
                    setRequestedDocs("");
                  }}
                  disabled={submitting}
                  className="flex-1 py-4 bg-white border border-[#e9eff1] text-[#708aa0] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#f8fafc] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRequestDocs}
                  disabled={submitting || !requestedDocs.trim()}
                  className="flex-1 py-4 bg-[#d7a444] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#c59333] transition-all shadow-lg shadow-[#d7a444]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <AlertCircle size={18} />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Document Confirmation Modal */}
      {showVerifyDocModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#10b981]/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0b2d49]">Verify Document</h3>
                  <p className="text-xs text-[#708aa0]">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-[#708aa0] mb-6">
                Are you sure you want to verify <span className="font-bold text-[#0b2d49]">{selectedDoc.title}</span>?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowVerifyDocModal(false)}
                  disabled={submitting}
                  className="flex-1 py-4 bg-white border border-[#e9eff1] text-[#708aa0] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#f8fafc] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmVerifyDoc}
                  disabled={submitting}
                  className="flex-1 py-4 bg-[#10b981] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Verify
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Document Modal */}
      {showRejectDocModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                  <XCircle size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0b2d49]">Reject Document</h3>
                  <p className="text-xs text-[#708aa0]">Vendor will be asked to re-upload</p>
                </div>
              </div>
              <p className="text-sm text-[#708aa0] mb-4">
                Please provide a reason for rejecting <span className="font-bold text-[#0b2d49]">{selectedDoc.title}</span>:
              </p>
              <textarea
                value={docRejectReason}
                onChange={(e) => setDocRejectReason(e.target.value)}
                placeholder="e.g., Document is blurry, expired, or incomplete..."
                rows={3}
                className="w-full p-4 bg-[#f8fafc] border border-[#e9eff1] rounded-2xl text-sm text-[#0b2d49] placeholder-[#708aa0]/50 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none mb-6"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowRejectDocModal(false);
                    setDocRejectReason("");
                  }}
                  disabled={submitting}
                  className="flex-1 py-4 bg-white border border-[#e9eff1] text-[#708aa0] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#f8fafc] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRejectDoc}
                  disabled={submitting || !docRejectReason.trim()}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle size={18} />
                      Reject Doc
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const DetailItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "md:col-span-2" : ""}>
    <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-[0.2em] mb-2">{label}</p>
    <p className="text-lg font-bold text-[#0b2d49] leading-tight">{value || '--'}</p>
  </div>
);

const CheckItem = ({ title, status, message }) => {
  const iconMap = {
    verified: { icon: CheckCircle2, color: "text-[#10b981]", bg: "bg-green-50", border: "border-green-100" },
    warning: { icon: AlertCircle, color: "text-[#d7a444]", bg: "bg-amber-50", border: "border-amber-100" },
    pending: { icon: Clock, color: "text-[#708aa0]", bg: "bg-[#f8fafc]", border: "border-[#e9eff1]" }
  };
  const config = iconMap[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-start p-5 rounded-2xl border ${config.border} ${config.bg} transition-all hover:scale-[1.01]`}>
       <div className={`p-2.5 rounded-xl ${config.color} bg-white mr-4 shadow-sm`}>
          <Icon size={22} />
       </div>
       <div className="flex-1">
          <div className="flex items-center justify-between">
             <h5 className="font-black text-[#0b2d49] text-sm uppercase tracking-wider">{title}</h5>
             <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{status}</span>
          </div>
          <p className="text-xs font-medium text-[#5a5b44] mt-1 opacity-80">{message}</p>
       </div>
    </div>
  );
};

const DocumentCard = ({ title, type, size, status, onClick }) => {
  const getStatusDisplay = () => {
    const statusMap = {
      'VERIFIED': { text: 'Verified', color: 'text-[#10b981]' },
      'PENDING_VERIFICATION': { text: 'Pending', color: 'text-[#d7a444]' },
      'REJECTED': { text: 'Rejected', color: 'text-red-500' }
    };
    return statusMap[status] || { text: 'Pending', color: 'text-[#708aa0]' };
  };
  
  const statusInfo = getStatusDisplay();
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-8 rounded-3xl border border-[#e9eff1] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
       <div className="absolute top-0 right-0 p-4 opacity-10 text-[#0b2d49] group-hover:opacity-100 group-hover:text-[#d7a444] transition-all">
          <ExternalLink size={24} />
       </div>
       <div className="w-16 h-20 bg-[#f8fafc] border border-[#e9eff1] rounded-xl flex flex-col items-center justify-center mb-6 relative group-hover:border-[#d7a444] transition-colors shadow-inner">
          <FileText size={32} className="text-[#0b2d49]/20 group-hover:text-[#d7a444] transition-colors" />
          <span className="absolute bottom-1 right-1 text-[8px] font-black bg-white px-1.5 py-0.5 rounded-md border border-[#e9eff1]">{type}</span>
       </div>
       <h5 className="font-black text-[#0b2d49] text-lg mb-2 leading-tight group-hover:text-[#d7a444] transition-colors">{title}</h5>
       <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">{size}</span>
          <div className="w-1 h-1 bg-[#e9eff1] rounded-full"></div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${statusInfo.color}`}>{statusInfo.text}</span>
       </div>
    </div>
  );
};



const TrendingUp = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default VendorDetails;
