import React, { useState } from "react";
import { mockVendors } from "../../../data/adminData";

import {
  Search,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  Printer,
  Share2,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  Plus
} from "lucide-react";

const MOCK_VENDORS = mockVendors;

/*const MOCK_VENDORS_OLD = [
  {
    id: "V-92842",
    name: "EcoMart Solutions",
    legalName: "EcoMart Solutions LLC",
    status: "PENDING",
    submittedDate: "Oct 24, 2023",
    riskLevel: "Low Risk",
    description: "Sustainability & Eco-friendly consumer goods",
    location: "Seattle, WA",
    taxId: "88-2394851",
    registryNumber: "REG-2023-WA-0922",
    yearFounded: "2018",
    address: "1200 Innovation Way, Suite 400, Seattle, WA 98101, USA",
    checks: {
      businessLicense: { status: "valid", match: true, message: "Match found in WA State Registry" },
      ownerIdentity: { status: "valid", verified: true, message: "Verified via Persona API" },
      bankAccount: { status: "pending", linked: false, message: "Plaid connection pending auth" },
    },
    logoColor: "bg-[#0b2d49]/10 text-[#0b2d49]"
  },
  {
    id: "V-92101",
    name: "Urban Threads",
    legalName: "Urban Threads Inc.",
    status: "REVIEWING",
    submittedDate: "Oct 23, 2023",
    riskLevel: "Medium Risk",
    description: "Contemporary fashion and apparel",
    location: "Austin, TX",
    taxId: "74-1029384",
    registryNumber: "REG-2015-TX-1102",
    yearFounded: "2015",
    address: "450 Congress Ave, Austin, TX 78701, USA",
    checks: {
      businessLicense: { status: "valid", match: true, message: "Match found in TX State Registry" },
      ownerIdentity: { status: "warning", verified: false, message: "Manual review required" },
      bankAccount: { status: "valid", linked: true, message: "Verified via Plaid" },
    },
    logoColor: "bg-[#d7a444]/10 text-[#d7a444]"
  },
  {
    id: "V-91992",
    name: "Apex Electronics",
    legalName: "Apex Global Electronics Ltd",
    status: "PENDING",
    submittedDate: "Oct 22, 2023",
    riskLevel: "High Risk",
    description: "Consumer electronics wholesaler",
    location: "San Francisco, CA",
    taxId: "94-5551234",
    registryNumber: "REG-2020-CA-8833",
    yearFounded: "2020",
    address: "200 Market St, San Francisco, CA 94111, USA",
    checks: {
      businessLicense: { status: "warning", match: false, message: "Registry mismatch detected" },
      ownerIdentity: { status: "valid", verified: true, message: "Verified via Persona API" },
      bankAccount: { status: "valid", linked: true, message: "Verified via Plaid" },
    },
    logoColor: "bg-[#708aa0]/10 text-[#708aa0]"
  },
  {
    id: "V-90877",
    name: "GreenLeaf Wholesale",
    legalName: "GreenLeaf Organics Co.",
    status: "REJECTED",
    submittedDate: "Oct 21, 2023",
    riskLevel: "Sanction Flag",
    description: "Organic produce distributor",
    location: "Portland, OR",
    taxId: "93-2223344",
    registryNumber: "REG-2019-OR-4421",
    yearFounded: "2019",
    address: "1500 SW 1st Ave, Portland, OR 97201, USA",
    checks: {
      businessLicense: { status: "invalid", match: false, message: "License expired" },
      ownerIdentity: { status: "invalid", verified: false, message: "Identity flag detected" },
      bankAccount: { status: "invalid", linked: false, message: "Account frozen" },
    },
    logoColor: "bg-red-100 text-red-600"
  }
];*/

const AdminVendorVerification = () => {
  const [selectedVendorId, setSelectedVendorId] = useState(MOCK_VENDORS[0].id);
  const selectedVendor = MOCK_VENDORS.find(v => v.id === selectedVendorId) || MOCK_VENDORS[0];

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-[#f3ddb1] text-[#d7a444]";
      case "REVIEWING": return "bg-[#708aa0]/20 text-[#0b2d49]";
      case "REJECTED": return "bg-red-100 text-red-700";
      case "APPROVED": return "bg-[#0b2d49]/10 text-[#0b2d49]";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getRiskColor = (risk) => {
    if (risk.includes("Low")) return "text-[#0b2d49] bg-[#0b2d49]/5 border-[#0b2d49]/10";
    if (risk.includes("Medium")) return "text-[#d7a444] bg-[#f3ddb1]/30 border-[#d7a444]/20";
    return "text-red-600 bg-red-50 border-red-100";
  };

  const getRiskIcon = (risk) => {
    if (risk.includes("Low")) return <ShieldCheck size={14} className="mr-1.5" />;
    if (risk.includes("Medium")) return <AlertTriangle size={14} className="mr-1.5" />;
    return <XCircle size={14} className="mr-1.5" />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative overflow-hidden">
        {/* Header Section */}
        <div className="px-6 mb-6 pt-6 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                <h2 className="text-2xl font-bold text-[#0b2d49] tracking-tight">
                    Vendor Verification
                </h2>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e9eff1] rounded-lg text-sm font-medium text-[#5a5b44] hover:bg-[#e9eff1] shadow-sm transition-colors mt-4 sm:mt-0">
                    <Download size={16} />
                    Export Report
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708aa0]" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search vendors by name, ID, or tax number..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border-none rounded-xl text-sm focus:bg-white focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] focus:outline-none transition-all placeholder:text-[#708aa0] text-[#0b2d49]"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 font-medium text-13px">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0b2d49] text-white rounded-lg text-sm shadow-sm hover:bg-[#0b2d49]/90 transition-colors whitespace-nowrap">
                        All Applications
                        <span className="ml-1 opacity-80">▼</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e9eff1] text-[#5a5b44] rounded-lg text-sm hover:bg-[#f3ddb1]/20 transition-colors whitespace-nowrap">
                        Pending
                        <span className="ml-1 text-[#708aa0]">▼</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e9eff1] text-[#5a5b44] rounded-lg text-sm hover:bg-[#f3ddb1]/20 transition-colors whitespace-nowrap">
                        Under Review
                        <span className="ml-1 text-[#708aa0]">▼</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e9eff1] text-[#5a5b44] rounded-lg text-sm hover:bg-[#f3ddb1]/20 transition-colors whitespace-nowrap">
                        Risk Level
                        <span className="ml-1 text-[#708aa0]">▼</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 px-6 pb-6 overflow-hidden max-h-full">
            <div className="grid grid-cols-12 gap-6 h-full">
                {/* Left Panel: Vendor List - Added overflow handling */}
                <div className="col-span-12 lg:col-span-4 overflow-y-auto pr-2 space-y-3 custom-scrollbar h-full">
                    {MOCK_VENDORS.map((vendor) => (
                        <div 
                            key={vendor.id}
                            onClick={() => setSelectedVendorId(vendor.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                                selectedVendorId === vendor.id 
                                ? "bg-white border-[#d7a444] ring-1 ring-[#d7a444] shadow-sm" 
                                : "bg-white border-[#e9eff1] hover:border-[#d7a444]/50"
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-[#0b2d49]">{vendor.name}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(vendor.status)}`}>
                                    {vendor.status}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-xs text-[#5a5b44] mb-4">
                                <Clock size={14} />
                                <span>Submitted {vendor.submittedDate}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className={`flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getRiskColor(vendor.riskLevel)}`}>
                                    {getRiskIcon(vendor.riskLevel)}
                                    {vendor.riskLevel}
                                </span>
                                <span className="text-xs text-[#708aa0] font-mono">ID: #{vendor.id}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Panel: Vendor Details */}
                <div className="col-span-12 lg:col-span-8 bg-white border border-[#e9eff1] rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
                    {selectedVendor && (
                        <>
                            {/* Detail Header */}
                            <div className="p-6 border-b border-[#e9eff1] flex items-start justify-between shrink-0">
                                <div className="flex gap-4">
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm ${selectedVendor.logoColor}`}>
                                        <Building2 />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-xl font-bold text-[#0b2d49]">{selectedVendor.legalName}</h2>
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0b2d49]/10 text-[#0b2d49] rounded-full text-xs font-bold uppercase">
                                                <CheckCircle size={12} className="fill-current" />
                                                KYC Verified
                                            </span>
                                        </div>
                                        <p className="text-[#5a5b44] text-sm flex items-center gap-2">
                                            {selectedVendor.description}
                                            <span className="w-1 h-1 bg-[#708aa0] rounded-full"></span>
                                            {selectedVendor.location}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-[#708aa0] hover:text-[#0b2d49] hover:bg-[#e9eff1] rounded-lg transition-colors">
                                        <Printer size={20} />
                                    </button>
                                    <button className="p-2 text-[#708aa0] hover:text-[#0b2d49] hover:bg-[#e9eff1] rounded-lg transition-colors">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Business Details */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-5 bg-[#0b2d49] rounded-full"></div>
                                            <h4 className="text-xs font-bold text-[#708aa0] uppercase tracking-wider">Business Details</h4>
                                        </div>
                                        <div className="bg-[#f8fafc] rounded-xl p-5 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-[#708aa0] font-medium mb-1 uppercase">Legal Name</p>
                                                    <p className="text-sm font-semibold text-[#0b2d49]">{selectedVendor.legalName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#708aa0] font-medium mb-1 uppercase">Tax ID / EIN</p>
                                                    <p className="text-sm font-semibold text-[#0b2d49]">{selectedVendor.taxId}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#708aa0] font-medium mb-1 uppercase">Registry Number</p>
                                                    <p className="text-sm font-semibold text-[#0b2d49]">{selectedVendor.registryNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#708aa0] font-medium mb-1 uppercase">Year Founded</p>
                                                    <p className="text-sm font-semibold text-[#0b2d49]">{selectedVendor.yearFounded}</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-[#e9eff1]">
                                                <p className="text-xs text-[#708aa0] font-medium mb-1 uppercase">Registered Address</p>
                                                <p className="text-sm text-[#5a5b44] leading-relaxed">{selectedVendor.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Identity Checks */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-5 bg-[#0b2d49] rounded-full"></div>
                                            <h4 className="text-xs font-bold text-[#708aa0] uppercase tracking-wider">Identity Checks</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {/* Business License Check */}
                                            <div className="flex items-start p-4 border border-[#e9eff1] rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`p-2 rounded-lg mr-4 ${
                                                    selectedVendor.checks.businessLicense.match ? 'bg-[#0b2d49]/10 text-[#0b2d49]' : 'bg-[#f3ddb1]/50 text-[#d7a444]'
                                                }`}>
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold text-[#0b2d49]">Business License</h5>
                                                    <p className="text-xs text-[#5a5b44] mt-0.5">{selectedVendor.checks.businessLicense.message}</p>
                                                </div>
                                                <button className="text-xs font-bold text-[#d7a444] hover:text-[#d0a862] hover:underline">
                                                    View<br/>File
                                                </button>
                                            </div>

                                            {/* Owner Identity Check */}
                                            <div className="flex items-start p-4 border border-[#e9eff1] rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`p-2 rounded-lg mr-4 ${
                                                    selectedVendor.checks.ownerIdentity.verified ? 'bg-[#0b2d49]/10 text-[#0b2d49]' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold text-[#0b2d49]">Owner Identity (KYC)</h5>
                                                    <p className="text-xs text-[#5a5b44] mt-0.5">{selectedVendor.checks.ownerIdentity.message} • Oct 24</p>
                                                </div>
                                                <button className="text-xs font-bold text-[#d7a444] hover:text-[#d0a862] hover:underline">
                                                    Details
                                                </button>
                                            </div>

                                             {/* Bank Account Check */}
                                             <div className="flex items-start p-4 border border-[#e9eff1] rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`p-2 rounded-lg mr-4 ${
                                                    selectedVendor.checks.bankAccount.linked ? 'bg-[#0b2d49]/10 text-[#0b2d49]' : 'bg-[#f3ddb1]/50 text-[#d7a444]'
                                                }`}>
                                                    <MoreHorizontal size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold text-[#0b2d49]">Bank Account Linking</h5>
                                                    <p className="text-xs text-[#5a5b44] mt-0.5">{selectedVendor.checks.bankAccount.message}</p>
                                                </div>
                                                <button className="text-xs font-bold text-[#708aa0] hover:text-[#0b2d49] hover:underline">
                                                    Resend<br/>Link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Supporting Documents */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-5 bg-[#0b2d49] rounded-full"></div>
                                        <h4 className="text-xs font-bold text-[#708aa0] uppercase tracking-wider">Supporting Documents</h4>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        <div className="min-w-[140px] h-[180px] bg-[#EAE0D5] rounded-xl flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-sm">
                                            <div className="w-3/4 h-3/4 bg-white/90 shadow-md rounded-lg flex items-center justify-center transform group-hover:-translate-y-1 transition-transform">
                                                 <FileText className="text-gray-400 opacity-50" size={32} />
                                            </div>
                                        </div>
                                        <div className="min-w-[140px] h-[180px] bg-[#e9eff1] rounded-xl flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-sm">
                                             <div className="w-3/4 h-3/4 bg-white/50 rounded-lg flex items-center justify-center">
                                                 <FileText className="text-gray-500 opacity-50" size={32} />
                                            </div>
                                        </div>
                                        <div className="min-w-[140px] h-[180px] bg-[#f8fafc] border-2 border-dashed border-[#e9eff1] rounded-xl flex flex-col items-center justify-center text-[#708aa0] hover:border-[#d7a444] hover:text-[#d7a444] hover:bg-[#f3ddb1]/20 transition-all cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-white group-hover:bg-white flex items-center justify-center mb-2">
                                                <Plus size={20} />
                                            </div>
                                            <span className="text-xs font-medium">Request More</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-[#e9eff1] flex gap-4 bg-white rounded-b-2xl shrink-0">
                                <button className="flex-1 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                    <XCircle size={18} />
                                    Reject Application
                                </button>
                                 <button className="flex-1 py-3 px-4 bg-[#f8fafc] text-[#5a5b44] rounded-xl font-bold text-sm hover:bg-[#e9eff1] transition-colors flex items-center justify-center gap-2">
                                    <MoreHorizontal size={18} />
                                    Request Info
                                </button>
                                <button className="flex-[1.5] py-3 px-4 bg-[#0b2d49] text-white rounded-xl font-bold text-sm hover:bg-[#0b2d49]/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                    <CheckCircle size={18} />
                                    Approve Vendor
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
  );
};

export default AdminVendorVerification;
