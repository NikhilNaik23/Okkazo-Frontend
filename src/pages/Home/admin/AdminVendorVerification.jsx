import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockVendors } from "../../../data/adminData";

import {
  Search,
  Download,
  Filter,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText,
  X,
  ArrowRight
} from "lucide-react";

const MOCK_VENDORS = mockVendors;

const AdminVendorVerification = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);

    const filteredVendors = MOCK_VENDORS.filter(vendor => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = (
            vendor.name.toLowerCase().includes(query) ||
            vendor.id.toLowerCase().includes(query) ||
            vendor.description.toLowerCase().includes(query) ||
            vendor.location.toLowerCase().includes(query)
        );
        return matchesQuery && vendor.status === "APPROVED";
    });

    const pendingApplications = MOCK_VENDORS.filter(v => v.status === "PENDING" || v.status === "REVIEWING");

    return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#f8fafc]">
        {/* Header Section - Slimmed Down */}
        <div className="px-6 mb-4 pt-6 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-black text-[#0b2d49] tracking-tight">
                        Vendor Verification
                    </h2>
                    <p className="text-[#708aa0] text-xs font-medium mt-0.5">Manage and verify platform service providers</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e9eff1] rounded-xl text-xs font-bold text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white shadow-sm transition-all mt-3 sm:mt-0 active:scale-95 group">
                    <Download size={14} className="group-hover:animate-bounce" />
                    Export Report
                </button>
            </div>

            {/* Filters - Slimmed Down */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-2.5 rounded-2xl border border-[#e9eff1] shadow-sm">
                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0] group-focus-within:text-[#d7a444] transition-colors" size={16} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search vendors..." 
                        className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-transparent rounded-xl text-xs focus:bg-white focus:border-[#d7a444] focus:ring-2 focus:ring-[#d7a444]/5 focus:outline-none transition-all placeholder:text-[#708aa0] text-[#0b2d49] font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowApplicationsModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0b2d49] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all whitespace-nowrap active:scale-95"
                    >
                        <FileText size={14} />
                        Applications
                        {pendingApplications.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-[#d7a444] text-white rounded-md text-[8px]">{pendingApplications.length}</span>
                        )}
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e9eff1] text-[#0b2d49] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-[#0b2d49] transition-all whitespace-nowrap active:scale-95">
                        <Filter size={14} />
                        Filter
                    </button>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 px-6 pb-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVendors.length > 0 ? (
                    filteredVendors.map((vendor) => (
                    <div 
                        key={vendor.id}
                        className="bg-white rounded-[2rem] border border-[#708aa0]/10 shadow-sm hover:shadow-2xl hover:shadow-[#0b2d49]/10 transition-all group overflow-hidden flex flex-col h-full"
                    >
                        <div className="h-48 w-full relative overflow-hidden">
                            <img 
                                src={vendor.image} 
                                alt={vendor.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-[#0b2d49]/80 via-[#0b2d49]/20 to-transparent"></div>
                            <div className="absolute bottom-5 left-6">
                                <p className="text-[9px] font-black text-white/90 uppercase tracking-[0.2em]">ID: #{vendor.id}</p>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-black text-[#0b2d49] text-xl group-hover:text-[#d7a444] transition-colors leading-tight line-clamp-1">{vendor.name}</h3>
                                    <p className="text-[10px] font-bold text-[#708aa0] mt-1 uppercase tracking-widest">{vendor.location}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner shrink-0 ${vendor.logoColor || 'bg-[#0b2d49]/5 text-[#d7a444]'}`}>
                                    <Building2 size={20} />
                                </div>
                            </div>

                            <p className="text-[#5a5b44] text-xs font-medium mb-6 leading-relaxed line-clamp-2 h-8">
                                {vendor.description}
                            </p>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-[#e9eff1]">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-[#0b2d49] uppercase tracking-widest">
                                        <Clock size={14} className="text-[#d7a444]" />
                                        {vendor.submittedDate}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                                        <span className="text-[9px] font-black text-[#708aa0] uppercase tracking-widest">KYC Ready</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/admin/vendors/${vendor.id}`)}
                                    className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-lg shadow-[#0b2d49]/10 active:scale-95 flex items-center justify-center gap-2 group/btn"
                                >
                                    view Details 
                                    <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#708aa0] bg-white rounded-[2.5rem] border-2 border-dashed border-[#e9eff1]">
                        <Search size={40} className="mb-4 opacity-10" />
                        <p className="text-xl font-bold text-[#0b2d49]">No vendors found</p>
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="mt-6 text-[#d7a444] font-black uppercase tracking-widest text-[10px] hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Applications Modal */}
        {showApplicationsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <div 
                    className="absolute inset-0 bg-[#0b2d49]/40 backdrop-blur-md transition-opacity"
                    onClick={() => setShowApplicationsModal(false)}
                />
                <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                    {/* Modal Header */}
                    <div className="px-8 py-6 border-b border-[#e9eff1] flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="text-xl font-black text-[#0b2d49] flex items-center gap-3">
                                <FileText className="text-[#d7a444]" />
                                Pending Applications
                            </h3>
                            <p className="text-xs font-bold text-[#708aa0] uppercase tracking-widest mt-1">
                                {pendingApplications.length} Request{pendingApplications.length !== 1 ? 's' : ''} awaiting review
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowApplicationsModal(false)}
                            className="p-2 hover:bg-[#f8fafc] rounded-xl text-[#708aa0] hover:text-[#0b2d49] transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar space-y-4">
                        {pendingApplications.map((v) => (
                            <div 
                                key={v.id}
                                className="group flex items-center justify-between p-5 bg-[#f8fafc] hover:bg-white rounded-3xl border border-transparent hover:border-[#e9eff1] transition-all hover:shadow-lg"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden relative shadow-inner">
                                        <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-[#0b2d49]/20"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-[#0b2d49] text-base group-hover:text-[#d7a444] transition-colors">{v.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[9px] font-black text-[#708aa0] uppercase tracking-widest">{v.location}</span>
                                            <div className="w-1 h-1 bg-[#e9eff1] rounded-full"></div>
                                            <span className="text-[9px] font-black text-[#d7a444] uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={10} /> {v.submittedDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setShowApplicationsModal(false);
                                        navigate(`/admin/vendors/${v.id}`);
                                    }}
                                    className="px-6 py-3 bg-[#0b2d49] hover:bg-[#d7a444] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2"
                                >
                                    Review <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}

                        {pendingApplications.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <CheckCircle size={48} className="text-[#10b981] opacity-20 mb-4" />
                                <h4 className="text-lg font-black text-[#0b2d49]">All Caught Up!</h4>
                                <p className="text-sm text-[#708aa0] mt-1 font-medium">No pending vendor applications at the moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-8 py-5 bg-[#f8fafc] border-t border-[#e9eff1] flex justify-end">
                        <button 
                            onClick={() => setShowApplicationsModal(false)}
                            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#5a5b44] hover:text-[#0b2d49] transition-colors"
                        >
                            Close Window
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminVendorVerification;
