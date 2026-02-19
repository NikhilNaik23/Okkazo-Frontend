import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockVendors } from "../../../data/adminData";
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
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    const foundVendor = mockVendors.find(v => v.id === id);
    if (foundVendor) {
      setVendor(foundVendor);
    } else {
      toast.error("Vendor not found");
      navigate("/admin/vendors");
    }
  }, [id, navigate]);

  if (!vendor) return null;

  const handleApprove = () => {
    setVendor(prev => ({ ...prev, status: "APPROVED" }));
    toast.success(`${vendor.name} has been approved successfully!`);
  };

  const handleReject = () => {
    toast.error(`${vendor.name} application has been rejected.`);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "services", label: "Services & Pricing", icon: Briefcase },
    ...(vendor?.status === "APPROVED" ? [{ id: "history", label: "Activity Logs", icon: Clock }] : []),
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
              <span className="text-[#d7a444]">{vendor.id}</span>
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
                        if(window.confirm(`Are you sure you want to remove ${vendor.name}?`)) {
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
                <div className={`w-32 h-32 rounded-[2.5rem] ${vendor.logoColor || 'bg-[#0b2d49]/5 text-[#d7a444]'} flex items-center justify-center text-5xl font-black shadow-inner relative overflow-hidden`}>
                   <img 
                    src={vendor.image} 
                    alt={vendor.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                   />
                   <div className="absolute inset-0 bg-linear-to-t from-[#0b2d49]/40 to-transparent"></div>
                   <Building2 size={48} className="relative z-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-4 border-[#f8fafc] rounded-full flex items-center justify-center text-[#10b981] shadow-md">
                   <ShieldCheck size={20} />
                </div>
              </div>

              {/* Identity Details */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                   <h1 className="text-4xl font-black text-[#0b2d49] tracking-tight">{vendor.name}</h1>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                     vendor.status === "APPROVED" 
                       ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20" 
                       : "bg-[#f3ddb1] text-[#0b2d49] border-[#d7a444]/20"
                   }`}>
                     <span className={`w-2 h-2 rounded-full ${vendor.status === "APPROVED" ? "bg-[#10b981]" : "bg-[#d7a444] animate-pulse"}`}></span>
                     {vendor.status === "APPROVED" 
                       ? "VERIFIED VENDOR" 
                       : vendor.status === "REVIEWING" 
                         ? "UNDER REVIEW" 
                         : "PENDING REVIEW"}
                   </span>
                </div>
                
                <p className="text-lg text-[#5a5b44] font-medium max-w-2xl leading-relaxed">
                  {vendor.description}
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
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Founded</p>
                      <p className="text-sm font-bold text-[#0b2d49]">{vendor.yearFounded || '2018'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#708aa0]">
                    <div className="w-10 h-10 rounded-xl bg-[#f8fafc] flex items-center justify-center text-[#0b2d49]"><BadgeCheck size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Status</p>
                      <p className="text-sm font-bold text-[#0b2d49]">KYC Ready</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Actions Box */}
              {vendor.status !== "APPROVED" && (
                <div className="w-full md:w-auto min-w-[300px] bg-[#f8fafc] border border-[#e9eff1] rounded-3xl p-8 flex flex-col gap-4">
                  <button 
                   onClick={handleApprove}
                   className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-xl shadow-[#0b2d49]/10 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Approve Vendor
                  </button>
                  <button 
                   onClick={handleReject}
                   className="w-full py-4 bg-white border border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject Application
                  </button>
                  <button className="w-full py-4 bg-[#e9eff1] text-[#0b2d49] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 mt-4">
                    <AlertCircle size={18} />
                    Request Documents
                  </button>
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
                      <DetailItem label="Legal Entity Name" value={vendor.legalName} />
                      <DetailItem label="Tax ID / PAN Number" value={vendor.taxId} />
                      <DetailItem label="Registry Number" value={vendor.registryNumber} />
                      <DetailItem label="Contact Email" value="verification@company.com" />
                      <DetailItem label="Primary Phone" value="+91 98765 43210" />
                      <DetailItem label="Registered Address" value={vendor.address} fullWidth />
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
                        status={vendor.checks?.businessLicense?.match ? 'verified' : 'pending'} 
                        message={vendor.checks?.businessLicense?.message}
                       />
                       <CheckItem 
                        title="Individual Identity (KYC)" 
                        status={vendor.checks?.ownerIdentity?.verified ? 'verified' : 'warning'} 
                        message={vendor.checks?.ownerIdentity?.message}
                       />
                       <CheckItem 
                        title="Bank Account Linking" 
                        status={vendor.checks?.bankAccount?.linked ? 'verified' : 'pending'} 
                        message={vendor.checks?.bankAccount?.message}
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
                <DocumentCard 
                  title="Certificate of Incorporation" type="PDF" size="1.2 MB" 
                  onClick={() => setSelectedDoc({ title: "Certificate of Incorporation", type: "PDF", size: "1.2 MB" })}
                />
                <DocumentCard 
                  title="Pan Card (Business)" type="JPG" size="450 KB" 
                  onClick={() => setSelectedDoc({ title: "Pan Card (Business)", type: "JPG", size: "450 KB" })}
                />
                <DocumentCard 
                  title="GST Registration Certificate" type="PDF" size="890 KB" 
                  onClick={() => setSelectedDoc({ title: "GST Registration Certificate", type: "PDF", size: "890 KB" })}
                />
                <DocumentCard 
                  title="Utility Bill (Address Proof)" type="PDF" size="2.1 MB" 
                  onClick={() => setSelectedDoc({ title: "Utility Bill (Address Proof)", type: "PDF", size: "2.1 MB" })}
                />
                <DocumentCard 
                  title="Cancelled Cheque (Bank)" type="PNG" size="560 KB" 
                  onClick={() => setSelectedDoc({ title: "Cancelled Cheque (Bank)", type: "PNG", size: "560 KB" })}
                />
             </div>
           )}

           {activeTab === "services" && (
             <div className="bg-white rounded-[2.5rem] border border-[#e9eff1] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black text-[#0b2d49]">Service Catalog Preview</h3>
                   <div className="flex items-center gap-2 px-6 py-2 bg-[#f8fafc] rounded-full border border-[#e9eff1] text-xs font-bold text-[#0b2d49]">
                      Total Services: 12
                   </div>
                </div>
                <div className="space-y-4">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-[#e9eff1] group cursor-pointer">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-white border border-[#e9eff1] rounded-xl flex items-center justify-center text-[#d7a444]">
                              <Briefcase size={24} />
                           </div>
                           <div>
                              <h5 className="font-black text-[#0b2d49] text-lg group-hover:text-[#d7a444] transition-colors line-clamp-1">Premium Event Catering {i}</h5>
                              <p className="text-xs font-bold text-[#708aa0] uppercase tracking-widest mt-1">Tier: Diamond Plus</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-10">
                           <div className="text-right">
                              <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest mb-1">Base Price</p>
                              <p className="text-xl font-black text-[#0b2d49] flex items-center justify-end gap-1"><IndianRupee size={18} /> 45,000</p>
                           </div>
                           <ChevronRight size={20} className="text-[#e9eff1] group-hover:text-[#d7a444] transition-all" />
                        </div>
                     </div>
                   ))}
                </div>
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
              <div className="w-full bg-[#f8fafc] rounded-3xl border border-[#e9eff1] overflow-hidden mb-8 shadow-inner group">
                <img 
                  src="https://images.unsplash.com/photo-1618044733300-947215c038d7?q=80&w=1000&auto=format&fit=crop" 
                  alt="Document Preview" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex gap-4">
                {vendor.status !== "APPROVED" ? (
                  <>
                    <button 
                      onClick={() => {
                        toast.success("Document verified successfully");
                        setSelectedDoc(null);
                      }}
                      className="flex-1 py-4 bg-[#10b981] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Verify Doc
                    </button>
                    <button 
                      onClick={() => {
                        toast.error("Document rejected");
                        setSelectedDoc(null);
                      }}
                      className="flex-1 py-4 bg-white border border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
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

const DocumentCard = ({ title, type, size, onClick }) => (
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
        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Verified Vault</span>
     </div>
  </div>
);



const TrendingUp = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default VendorDetails;
