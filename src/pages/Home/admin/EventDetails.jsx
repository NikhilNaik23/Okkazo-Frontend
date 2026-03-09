import React, { useState } from "react";
import { 
  ArrowLeft,
  Settings,
  X,
  CheckCircle,
  UserPlus,
  Building2,
  Utensils,
  Camera,
  TrendingUp,
  CreditCard,
  Users,
  MessageSquare,
  Clock,
  MoreHorizontal,
  RotateCcw,
  User,
  ChevronDown,
  Check,
  UserMinus,
  MessageCircle,
  ExternalLink,
  FileText,
  Info
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { eventDetailsData } from "../../../data/eventDetailsData";
import { mockAdminEvents } from "../../../data/adminData";

const MOCK_MANAGERS = [
  { id: 1, name: "Marcus Aurelius", initial: "MA", color: "bg-[#0b2d49]/10 text-[#0b2d49]" },
  { id: 2, name: "Alexander Great", initial: "AG", color: "bg-emerald-100 text-emerald-700" },
  { id: 3, name: "Julius Caesar", initial: "JC", color: "bg-indigo-100 text-indigo-700" },
  { id: 4, name: "Napoleon Bonaparte", initial: "NB", color: "bg-rose-100 text-rose-700" },
];

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the actual event status from mockAdminEvents if possible
  const mockEvent = mockAdminEvents.find(e => e.id.toString() === id);
  const [currentStatus, setCurrentStatus] = useState(mockEvent ? mockEvent.status : eventDetailsData.status);
  
  const [assignedManager, setAssignedManager] = useState(null);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [showManagerOptions, setShowManagerOptions] = useState(false);
  const [activeTab, setActiveTab] = useState("Details");

  const handleRemoveManager = () => {
    setAssignedManager(null);
    setShowManagerOptions(false);
    toast.success("Manager removed from event", {
        icon: '🚫',
        style: { borderRadius: '12px', background: '#0b2d49', color: '#fff' }
    });
  };

  const handleApprove = () => {
    setCurrentStatus("VERIFIED");
    toast.dismiss();
    toast.success("Event has been approved successfully!", {
        style: {
            borderRadius: '12px',
            background: '#0b2d49',
            color: '#fff',
            fontWeight: '600'
        },
        iconTheme: {
            primary: '#28a785',
            secondary: '#fff',
        },
    });
  };

  const handleReject = () => {
    setCurrentStatus("REJECTED");
    toast.dismiss();
    toast.error("Event request has been rejected.", {
        style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#e11d48',
            fontWeight: '600',
            border: '1px solid #ffe4e6'
        },
    });
  };

  // Mock Data
  const eventData = eventDetailsData;

  return (
    <div className="flex flex-col h-full bg-transparent">
       {/* Top Header - Custom Implementation */}
       <div className="px-8 py-6 pb-2 shrink-0">
          <div className="flex items-center gap-2 text-sm text-[#5a5b44] mb-2">
            <Link to="/admin/events" className="hover:text-[#d7a444] transition-colors flex items-center gap-1">
                <ArrowLeft size={16} />
                Back to Events
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-[#0b2d49] tracking-tight">{eventData.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      currentStatus === 'VERIFIED' ? 'bg-[#28a785]/10 text-[#28a785]' : 
                      currentStatus === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-[#e9eff1] text-[#0b2d49]'
                  }`}>
                      {currentStatus}
                  </span>
              </div>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
           {/* Page Title & Actions */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div>
                   <p className="text-[#d7a444] text-sm font-medium mb-1">
                       {eventData.category} <span className="text-[#e9eff1] mx-2">•</span> {eventData.subCategory}
                   </p>
                   <h2 className="text-3xl font-bold text-[#0b2d49] tracking-tight">Event Intelligence View</h2>
               </div>
               <div className="flex gap-3 relative">
                   {currentStatus === "VERIFIED" && !assignedManager && (
                       <div className="relative">
                            <button 
                                onClick={() => setShowManagerDropdown(!showManagerDropdown)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#d7a444] text-white font-semibold rounded-xl hover:bg-[#d7a444]/90 transition-colors shadow-lg shadow-[#d7a444]/20 animate-in fade-in zoom-in duration-300"
                            >
                                <UserPlus size={18} />
                                Assign Manager
                                <ChevronDown size={16} className={`ml-1 transition-transform duration-200 ${showManagerDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showManagerDropdown && (
                                <div className="absolute left-0 mt-2 w-64 bg-white border border-[#e9eff1] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 border-b border-[#f0f2f5] bg-[#f8fafc]/50">
                                        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest px-2 py-1">Select Available Manager</p>
                                    </div>
                                    <div className="py-2 max-h-60 overflow-y-auto custom-scrollbar">
                                        {MOCK_MANAGERS.map((manager) => (
                                            <button
                                                key={manager.id}
                                                onClick={() => {
                                                    setAssignedManager(manager);
                                                    setShowManagerDropdown(false);
                                                    toast.dismiss();
                                                    toast.success(`Assigned to ${manager.name}`, {
                                                        icon: '🤝',
                                                        style: { borderRadius: '12px', background: '#0b2d49', color: '#fff' }
                                                    });
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-[#f8fafc] transition-colors flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${manager.color}`}>
                                                        {manager.initial}
                                                    </div>
                                                    <span className={`text-sm font-bold ${assignedManager?.id === manager.id ? 'text-[#0b2d49]' : 'text-[#5a5b44]'}`}>
                                                        {manager.name}
                                                    </span>
                                                </div>
                                                {assignedManager?.id === manager.id && (
                                                    <Check size={16} className="text-[#28a785]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                       </div>
                   )}
                   
                   {currentStatus !== "VERIFIED" && currentStatus !== "REJECTED" && (
                       <>
                           <button 
                               onClick={handleReject}
                               className="flex items-center gap-2 px-5 py-2.5 bg-white border border-rose-100 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition-colors"
                           >
                               <X size={18} />
                               Reject
                           </button>
                           <button 
                               onClick={handleApprove}
                               className="flex items-center gap-2 px-5 py-2.5 bg-[#0b2d49] text-white font-semibold rounded-xl hover:bg-[#0b2d49]/90 transition-colors shadow-lg shadow-[#0b2d49]/20"
                           >
                               <CheckCircle size={18} />
                               Approve
                           </button>
                       </>
                   )}


               </div>
           </div>

            {currentStatus === "VERIFIED" && (
                <div className="flex items-center gap-1 mb-8 bg-[#f8fafc] p-1.5 rounded-2xl w-fit border border-[#e9eff1]/50">
                    {[
                        { id: 'Details', icon: Info },
                        { id: 'Chat', icon: MessageSquare },
                        { id: 'Financial', icon: CreditCard },
                        { id: 'Documents', icon: FileText }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 focus:outline-none select-none ${
                                activeTab === tab.id 
                                ? 'bg-white text-[#0b2d49] shadow-sm ring-1 ring-[#e9eff1]' 
                                : 'text-[#708aa0] hover:text-[#0b2d49] hover:bg-white/50'
                            }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? 'text-[#d7a444]' : ''} />
                            {tab.id}
                        </button>
                    ))}
                </div>
            )}

           <div className="grid grid-cols-12 gap-6">
               {/* Left Column (8 cols) */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Conditional Tab Content */}
                    {activeTab === "Details" ? (
                        <>
                            {/* Service Configuration */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Settings className="text-[#d7a444]" size={24} />
                                        <h3 className="text-lg font-bold text-[#0b2d49]">Service Configuration</h3>
                                    </div>
                                    <button className="text-sm font-bold text-[#d7a444] hover:text-[#0b2d49] transition-colors">
                                        Edit Services
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {eventData.services.map((service, index) => (
                                        <div key={index} className="bg-[#f8fafc] p-5 rounded-2xl border border-[#e9eff1] hover:border-[#d7a444] transition-colors group">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#708aa0] group-hover:text-[#d7a444] mb-4 transition-colors">
                                                <service.icon size={20} />
                                            </div>
                                            <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-1">{service.type}</p>
                                            <p className="text-sm font-bold text-[#0b2d49] leading-tight">{service.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Financial Summary (Mini) */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                                <div className="flex items-center gap-3 mb-6">
                                    <CreditCard className="text-[#d7a444]" size={24} />
                                    <h3 className="text-lg font-bold text-[#0b2d49]">Recent Transactions</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-bold text-[#708aa0] uppercase tracking-wider border-b border-[#e9eff1]">
                                                <th className="pb-4 pl-4">Transaction ID</th>
                                                <th className="pb-4">Date</th>
                                                <th className="pb-4">Amount</th>
                                                <th className="pb-4 pr-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventData.transactions.slice(0, 2).map((txn, index) => (
                                                <tr key={index} className="border-b border-[#e9eff1] last:border-0">
                                                    <td className="py-4 pl-4 text-sm font-semibold text-[#0b2d49]">{txn.id}</td>
                                                    <td className="py-4 text-sm text-[#5a5b44]">{txn.date}</td>
                                                    <td className="py-4 text-sm font-bold text-[#0b2d49]">₹{txn.amount}</td>
                                                    <td className="py-4 pr-4 text-right">
                                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                                            txn.status === 'PAID' ? 'bg-[#0b2d49]/10 text-[#0b2d49]' : 'bg-[#f3ddb1]/50 text-[#d7a444]'
                                                        }`}>
                                                            {txn.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : activeTab === "Chat" ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-[#e9eff1] h-[600px] flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-[#e9eff1] flex items-center justify-between bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#0b2d49]/10 flex items-center justify-center">
                                        <Users className="text-[#0b2d49]" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0b2d49]">Event Coordination Chat</h3>
                                        <p className="text-xs text-[#28a785] font-bold uppercase tracking-wider">● 4 Members Active</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]/30">
                                <div className="flex flex-col items-center mb-4">
                                    <span className="px-4 py-1.5 bg-white border border-[#e9eff1] rounded-full text-[10px] font-bold text-[#708aa0] uppercase tracking-widest shadow-sm">Yesterday</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">LC</div>
                                    <div className="max-w-[70%] space-y-2">
                                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-[#e9eff1] shadow-sm">
                                            <p className="text-xs font-black text-[#d7a444] uppercase mb-1">Luxe Catering Co.</p>
                                            <p className="text-sm text-[#5a5b44] leading-relaxed">The revised menu has been uploaded. Please check the "Documents" tab for the pricing details.</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#94a3b8] ml-1 uppercase">10:45 AM</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-end">
                                    <div className="max-w-[70%] space-y-2">
                                        <div className="bg-[#0b2d49] p-4 rounded-2xl rounded-tr-none shadow-lg shadow-[#0b2d49]/10">
                                            <p className="text-sm text-white leading-relaxed font-medium">Understood. I will review it with the finance team today.</p>
                                        </div>
                                        <div className="flex justify-end pr-1">
                                            <span className="text-[10px] font-bold text-[#94a3b8] uppercase">11:02 AM • Read</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-[#0b2d49]/10 text-[#0b2d49] flex items-center justify-center font-bold text-sm shrink-0">MA</div>
                                </div>
                            </div>
                            <div className="p-4 bg-white border-t border-[#e9eff1]">
                                <div className="relative flex items-center gap-3">
                                    <input 
                                        placeholder="Type a message..." 
                                        className="w-full bg-[#f8fafc]/80 border border-[#e9eff1] rounded-2xl py-3.5 pl-6 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d7a444]/20 focus:border-[#d7a444] transition-all"
                                    />
                                    <button className="absolute right-2 p-2.5 bg-[#d7a444] text-white rounded-xl shadow-lg shadow-[#d7a444]/30 hover:bg-[#0b2d49] transition-all">
                                        <MessageSquare size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === "Financial" ? (
                        <div className="space-y-6">
                             <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="text-[#d7a444]" size={24} />
                                        <h3 className="text-lg font-bold text-[#0b2d49]">Detailed Financial Ledger</h3>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-[#f8fafc] text-[#0b2d49] border border-[#e9eff1] rounded-xl text-xs font-bold hover:bg-[#e9eff1] transition-colors">
                                        <ExternalLink size={14} />
                                        Export CSV
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-black text-[#708aa0] uppercase tracking-widest border-b border-[#e9eff1]">
                                                <th className="pb-5 pl-4">Transaction Details</th>
                                                <th className="pb-5">Reference</th>
                                                <th className="pb-5 text-right font-black">Amount</th>
                                                <th className="pb-5 pr-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#f0f2f5]">
                                            {eventData.transactions.map((txn, index) => (
                                                <tr key={index} className="group hover:bg-[#f8fafc]/50 transition-all cursor-pointer">
                                                    <td className="py-5 pl-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[#0b2d49]">{txn.method}</span>
                                                            <span className="text-[10px] font-medium text-[#94a3b8] uppercase">{txn.date}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5">
                                                        <span className="text-xs font-mono font-bold text-[#5a5b44]">{txn.id}</span>
                                                    </td>
                                                    <td className="py-5 text-right">
                                                        <span className="text-base font-black text-[#0b2d49]">₹{txn.amount}</span>
                                                    </td>
                                                    <td className="py-5 pr-4 text-right">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            txn.status === 'PAID' ? 'bg-[#28a785]/10 text-[#28a785]' : 'bg-[#f3ddb1]/50 text-[#d7a444]'
                                                        }`}>
                                                            {txn.status === 'PAID' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                            {txn.status}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-[#f8fafc]/50">
                                            <tr>
                                                <td colSpan="2" className="py-5 pl-4 text-sm font-bold text-[#708aa0]">TOTAL DISBURSED</td>
                                                <td className="py-5 text-right text-lg font-black text-[#0b2d49]">₹16,900.00</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e9eff1] min-h-[500px]">
                             <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-[#d7a444]" size={24} />
                                    <h3 className="text-lg font-bold text-[#0b2d49]">Event Documents</h3>
                                </div>
                                <button className="px-5 py-2.5 bg-[#0b2d49] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#0b2d49]/20 hover:bg-[#0b2d49]/90 transition-all">
                                    Upload New
                                </button>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: "Venue_Lease_Agreement.pdf", size: "2.4 MB", type: "CONTRACT", date: "20 Oct, 2023" },
                                    { name: "Catering_Menu_Revised.pdf", size: "1.1 MB", type: "INVOICE", date: "22 Oct, 2023" },
                                    { name: "Safety_Permit_Crystal_Hall.jpg", size: "4.8 MB", type: "PERMIT", date: "15 Oct, 2023" },
                                    { name: "Event_Insurance_Policy.pdf", size: "890 KB", type: "LEGAL", date: "18 Oct, 2023" }
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-[#f8fafc] border border-[#e9eff1] rounded-2xl group hover:border-[#d7a444] hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-[#e9eff1] flex items-center justify-center text-[#708aa0] group-hover:text-[#d7a444] transition-colors shadow-sm">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-[#0b2d49] leading-tight mb-1">{doc.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-[#94a3b8] uppercase">{doc.type}</span>
                                                    <span className="w-1 h-1 rounded-full bg-[#e9eff1]"></span>
                                                    <span className="text-[10px] font-medium text-[#94a3b8]">{doc.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 text-[#94a3b8] hover:text-[#0b2d49] hover:bg-[#f8fafc] rounded-lg transition-all">
                                            <ChevronDown size={18} className="-rotate-90" />
                                        </button>
                                    </div>
                                ))}
                             </div>

                             <div className="mt-12 p-10 border-2 border-dashed border-[#e9eff1] rounded-3xl flex flex-col items-center justify-center text-center bg-[#f8fafc]/50">
                                <div className="w-16 h-16 rounded-3xl bg-white border border-[#e9eff1] flex items-center justify-center shadow-lg mb-6">
                                    <RotateCcw className="text-[#94a3b8] animate-spin-slow" size={24} />
                                </div>
                                <h4 className="text-base font-bold text-[#0b2d49] mb-2">Sync with Manager Storage</h4>
                                <p className="text-xs text-[#708aa0] max-w-xs leading-relaxed font-medium">All documents uploaded by the manager and vendors are automatically synced and secured with end-to-end encryption.</p>
                             </div>
                        </div>
                    )}
                </div>

               {/* Right Column (4 cols) */}
               <div className="col-span-12 lg:col-span-4 space-y-6">
                   {/* Budget History Card - Gradient */}
                   <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2d49] to-[#1a4b70] rounded-3xl p-6 text-white shadow-lg shadow-[#0b2d49]/20">
                       <div className="relative z-10">
                           <div className="flex items-center gap-2 mb-6">
                               <TrendingUp className="text-[#d7a444]" size={24} />
                               <h3 className="text-lg font-bold text-[#f3ddb1]">Budget History</h3>
                           </div>
                           
                           <div className="space-y-4">
                               <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                   <span className="text-sm font-medium text-[#708aa0]">Original</span>
                                   <span className="text-lg font-bold text-white">₹{eventData.budget.original}</span>
                               </div>
                               <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                   <span className="text-sm font-medium text-[#708aa0]">Revised</span>
                                   <span className="text-lg font-bold text-white">₹{eventData.budget.revised}</span>
                               </div>
                               <div className="flex justify-between items-end pt-2">
                                   <span className="text-sm font-medium text-[#d7a444] mb-1">Final Amount</span>
                                   <span className="text-3xl font-bold text-white">₹{eventData.budget.final}</span>
                               </div>
                           </div>
                       </div>
                       
                       {/* Background Decorations */}
                       <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                       <div className="absolute top-10 right-10 w-20 h-20 bg-[#d7a444]/10 rounded-full blur-xl"></div>
                   </div>

                   {/* Coordination Card */}
                   {currentStatus !== "REJECTED" && (
                       <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                           <div className="flex items-center gap-3 mb-6">
                               <Users className="text-[#d7a444]" size={24} />
                               <h3 className="text-lg font-bold text-[#0b2d49]">Coordination</h3>
                           </div>

                           <div className="mb-6">
                               <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-2">Assigned Manager</p>
                               {assignedManager ? (
                                   <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-xl border border-[#e9eff1] group relative">
                                       <div className="flex items-center gap-3">
                                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${assignedManager.color}`}>
                                               {assignedManager.initial}
                                           </div>
                                           <div className="flex flex-col">
                                               <span className="font-bold text-[#0b2d49]">{assignedManager.name}</span>
                                               <span className="text-[10px] text-[#708aa0] font-medium uppercase tracking-tight">Active Manager</span>
                                           </div>
                                       </div>
                                       
                                       <div className="relative">
                                           <button 
                                               onClick={() => setShowManagerOptions(!showManagerOptions)}
                                               className="p-2 text-[#708aa0] hover:text-[#0b2d49] hover:bg-white rounded-lg transition-all"
                                           >
                                               <MoreHorizontal size={18} />
                                           </button>

                                           {showManagerOptions && (
                                               <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e9eff1] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                                   <button 
                                                       onClick={() => {
                                                           setShowManagerOptions(false);
                                                           toast.dismiss();
                                                           toast("Opening chat...", { icon: '💬' });
                                                       }}
                                                       className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#5a5b44] hover:bg-[#f8fafc] hover:text-[#0b2d49] transition-colors flex items-center gap-2"
                                                   >
                                                       <MessageCircle size={16} className="text-sky-500" />
                                                       Chat with Manager
                                                   </button>
                                                   <button 
                                                       onClick={() => {
                                                           setShowManagerOptions(false);
                                                           toast.dismiss();
                                                           toast("Redirecting to profile...", { icon: '👤' });
                                                       }}
                                                       className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#5a5b44] hover:bg-[#f8fafc] hover:text-[#0b2d49] transition-colors flex items-center gap-2"
                                                   >
                                                       <ExternalLink size={16} className="text-emerald-500" />
                                                       View Profile
                                                   </button>
                                                   <div className="border-t border-[#f0f2f5] my-1"></div>
                                                   <button 
                                                       onClick={handleRemoveManager}
                                                       className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                                   >
                                                       <UserMinus size={16} />
                                                       Remove Manager
                                                   </button>
                                               </div>
                                           )}
                                       </div>
                                   </div>
                               ) : (
                                   <div className="p-4 bg-[#f8fafc] rounded-xl border-2 border-dashed border-[#e9eff1] flex flex-col items-center justify-center gap-2 text-center">
                                       <User className="text-[#94a3b8]" size={24} />
                                       <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider">No Manager Assigned</p>
                                       <p className="text-[10px] text-[#94a3b8] px-4 leading-relaxed">Approve the event and use the "Assign Manager" button above to get started.</p>
                                   </div>
                               )}
                           </div>

                           <div>
                               <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-2">Vendor Status</p>
                               <div className="space-y-4">
                                   {eventData.vendors.map((vendor, index) => (
                                       <div key={index} className="flex items-center justify-between">
                                           <div className="flex items-center gap-2">
                                                {vendor.status === 'CONFIRMED' ? (
                                                    <div className="w-5 h-5 rounded-full bg-[#0b2d49] text-white flex items-center justify-center">
                                                        <CheckCircle size={12} />
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-[#e9eff1] text-[#708aa0] flex items-center justify-center">
                                                        <MoreHorizontal size={12} />
                                                    </div>
                                                )}
                                               <span className="text-sm font-medium text-[#5a5b44]">{vendor.name}</span>
                                           </div>
                                           <span className={`text-[10px] font-bold uppercase ${
                                               vendor.status === 'CONFIRMED' ? 'text-[#0b2d49]' : 'text-[#d7a444]'
                                           }`}>
                                               {vendor.status}
                                           </span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       </div>
                   )}

                   {/* Comm Log */}
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                       <div className="flex items-center gap-3 mb-6">
                           <MessageSquare className="text-[#d7a444]" size={24} />
                           <h3 className="text-lg font-bold text-[#0b2d49]">Comm. Log</h3>
                       </div>
                       
                       <div className="space-y-6 relative pl-2">
                           {/* Vertical Line */}
                           <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-[#e9eff1]"></div>
                           
                           {eventData.logs.map((log, index) => (
                               <div key={index} className="relative pl-6">
                                   {/* Dot */}
                                   <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${
                                       log.type === 'success' ? 'bg-[#0b2d49]' : 
                                       log.type === 'warning' ? 'bg-[#d7a444]' : 'bg-[#708aa0]'
                                   }`}></div>
                                   
                                   <p className="text-sm font-bold text-[#0b2d49] leading-tight mb-1">{log.title}</p>
                                   <div className="flex items-center gap-1.5 text-xs text-[#708aa0]">
                                       <span>{log.time}</span>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};

export default EventDetails;
