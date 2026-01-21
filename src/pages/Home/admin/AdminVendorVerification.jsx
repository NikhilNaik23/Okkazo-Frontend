import React, { useState } from "react";

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

const MOCK_VENDORS = [
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
    logoColor: "bg-emerald-100 text-emerald-600"
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
    logoColor: "bg-blue-100 text-blue-600"
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
    logoColor: "bg-indigo-100 text-indigo-600"
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
    logoColor: "bg-orange-100 text-orange-600"
  }
];

const AdminVendorVerification = () => {
  const [selectedVendorId, setSelectedVendorId] = useState(MOCK_VENDORS[0].id);
  const selectedVendor = MOCK_VENDORS.find(v => v.id === selectedVendorId) || MOCK_VENDORS[0];

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "REVIEWING": return "bg-blue-100 text-blue-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      case "APPROVED": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getRiskColor = (risk) => {
    if (risk.includes("Low")) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (risk.includes("Medium")) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getRiskIcon = (risk) => {
    if (risk.includes("Low")) return <ShieldCheck size={14} className="mr-1.5" />;
    if (risk.includes("Medium")) return <AlertTriangle size={14} className="mr-1.5" />;
    return <XCircle size={14} className="mr-1.5" />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header Section */}
        <div className="px-6 mb-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Vendor Verification
                </h2>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors mt-4 sm:mt-0">
                    <Download size={16} />
                    Export Report
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search vendors by name, ID, or tax number..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 font-medium text-13px">
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm shadow-sm hover:bg-emerald-700 transition-colors whitespace-nowrap">
                        All Applications
                        <span className="ml-1 opacity-80">▼</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Pending
                        <span className="ml-1 text-gray-400">▼</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Under Review
                        <span className="ml-1 text-gray-400">▼</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Risk Level
                        <span className="ml-1 text-gray-400">▼</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 px-6 pb-6 overflow-hidden">
            <div className="grid grid-cols-12 gap-6 h-full">
                {/* Left Panel: Vendor List */}
                <div className="col-span-12 lg:col-span-4 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {MOCK_VENDORS.map((vendor) => (
                        <div 
                            key={vendor.id}
                            onClick={() => setSelectedVendorId(vendor.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                                selectedVendorId === vendor.id 
                                ? "bg-white border-emerald-500 ring-1 ring-emerald-500 shadow-sm" 
                                : "bg-white border-gray-200 hover:border-emerald-200"
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(vendor.status)}`}>
                                    {vendor.status}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                                <Clock size={14} />
                                <span>Submitted {vendor.submittedDate}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className={`flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getRiskColor(vendor.riskLevel)}`}>
                                    {getRiskIcon(vendor.riskLevel)}
                                    {vendor.riskLevel}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">ID: #{vendor.id}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Panel: Vendor Details */}
                <div className="col-span-12 lg:col-span-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
                    {selectedVendor && (
                        <>
                            {/* Detail Header */}
                            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm ${selectedVendor.logoColor}`}>
                                        <Building2 />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-xl font-bold text-gray-900">{selectedVendor.legalName}</h2>
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                                                <CheckCircle size={12} className="fill-current" />
                                                KYC Verified
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm flex items-center gap-2">
                                            {selectedVendor.description}
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            {selectedVendor.location}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Printer size={20} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                                            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business Details</h4>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase">Legal Name</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedVendor.legalName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase">Tax ID / EIN</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedVendor.taxId}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase">Registry Number</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedVendor.registryNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase">Year Founded</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedVendor.yearFounded}</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-200">
                                                <p className="text-xs text-gray-400 font-medium mb-1 uppercase">Registered Address</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">{selectedVendor.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Identity Checks */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identity Checks</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {/* Business License Check */}
                                            <div className="flex items-start p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`p-2 rounded-lg mr-4 ${
                                                    selectedVendor.checks.businessLicense.match ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold text-gray-900">Business License</h5>
                                                    <p className="text-xs text-gray-500 mt-0.5">{selectedVendor.checks.businessLicense.message}</p>
                                                </div>
                                                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                                                    View<br/>File
                                                </button>
                                            </div>

                                            {/* Owner Identity Check */}
                                            <div className="flex items-start p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`p-2 rounded-lg mr-4 ${
                                                    selectedVendor.checks.ownerIdentity.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold text-gray-900">Owner Identity (KYC)</h5>
                                                    <p className="text-xs text-gray-500 mt-0.5">{selectedVendor.checks.ownerIdentity.message} • Oct 24</p>
                                                </div>
                                                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                                                    Details
                                                </button>
                                            </div>

                                             {/* Bank Account Check */}
                                             <div className="flex items-start p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`p-2 rounded-lg mr-4 ${
                                                    selectedVendor.checks.bankAccount.linked ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    <MoreHorizontal size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold text-gray-900">Bank Account Linking</h5>
                                                    <p className="text-xs text-gray-500 mt-0.5">{selectedVendor.checks.bankAccount.message}</p>
                                                </div>
                                                <button className="text-xs font-bold text-gray-400 hover:text-gray-600 hover:underline">
                                                    Resend<br/>Link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Supporting Documents */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Supporting Documents</h4>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        <div className="min-w-[140px] h-[180px] bg-[#EAE0D5] rounded-xl flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-sm">
                                            <div className="w-3/4 h-3/4 bg-white/90 shadow-md rounded-lg flex items-center justify-center transform group-hover:-translate-y-1 transition-transform">
                                                 <FileText className="text-gray-400 opacity-50" size={32} />
                                            </div>
                                        </div>
                                        <div className="min-w-[140px] h-[180px] bg-[#E3E8EF] rounded-xl flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-sm">
                                             <div className="w-3/4 h-3/4 bg-white/50 rounded-lg flex items-center justify-center">
                                                 <FileText className="text-gray-500 opacity-50" size={32} />
                                            </div>
                                        </div>
                                        <div className="min-w-[140px] h-[180px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center mb-2">
                                                <Plus size={20} />
                                            </div>
                                            <span className="text-xs font-medium">Request More</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-gray-100 flex gap-4 bg-white rounded-b-2xl">
                                <button className="flex-1 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                    <XCircle size={18} />
                                    Reject Application
                                </button>
                                 <button className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                    <MoreHorizontal size={18} />
                                    Request Info
                                </button>
                                <button className="flex-[1.5] py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
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
