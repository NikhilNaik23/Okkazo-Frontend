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
  ExternalLink
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { eventDetailsData } from "../../../data/eventDetailsData";

const MOCK_MANAGERS = [
  { id: 1, name: "Marcus Aurelius", initial: "MA", color: "bg-[#0b2d49]/10 text-[#0b2d49]" },
  { id: 2, name: "Alexander Great", initial: "AG", color: "bg-emerald-100 text-emerald-700" },
  { id: 3, name: "Julius Caesar", initial: "JC", color: "bg-indigo-100 text-indigo-700" },
  { id: 4, name: "Napoleon Bonaparte", initial: "NB", color: "bg-rose-100 text-rose-700" },
];

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState(eventDetailsData.status);
  const [assignedManager, setAssignedManager] = useState(MOCK_MANAGERS[0]);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [showManagerOptions, setShowManagerOptions] = useState(false);

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
                   {currentStatus === "VERIFIED" && (
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
                                                    <span className={`text-sm font-bold ${assignedManager.id === manager.id ? 'text-[#0b2d49]' : 'text-[#5a5b44]'}`}>
                                                        {manager.name}
                                                    </span>
                                                </div>
                                                {assignedManager.id === manager.id && (
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

                   {(currentStatus === "VERIFIED" || currentStatus === "REJECTED") && (
                       <button 
                           onClick={() => setCurrentStatus(eventData.status)}
                           className="flex items-center gap-2 px-5 py-2.5 bg-[#e9eff1] text-[#0b2d49] font-semibold rounded-xl hover:bg-[#dce4e8] transition-colors"
                        >
                           <RotateCcw size={18} className="w-4 h-4" />
                           Reset Status
                       </button>
                   )}
               </div>
           </div>

           <div className="grid grid-cols-12 gap-6">
               {/* Left Column (8 cols) */}
               <div className="col-span-12 lg:col-span-8 space-y-6">
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

                   {/* Financial Transactions */}
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1] min-h-[300px]">
                       <div className="flex items-center gap-3 mb-6">
                           <CreditCard className="text-[#d7a444]" size={24} />
                           <h3 className="text-lg font-bold text-[#0b2d49]">Financial Transactions</h3>
                       </div>
                       <div className="overflow-x-auto">
                           <table className="w-full">
                               <thead>
                                   <tr className="text-left text-xs font-bold text-[#708aa0] uppercase tracking-wider border-b border-[#e9eff1]">
                                       <th className="pb-4 pl-4">Transaction ID</th>
                                       <th className="pb-4">Date</th>
                                       <th className="pb-4">Amount</th>
                                       <th className="pb-4">Method</th>
                                       <th className="pb-4 pr-4 text-right">Status</th>
                                   </tr>
                               </thead>
                               <tbody className="space-y-4">
                                   {eventData.transactions.map((txn, index) => (
                                       <tr 
                                           key={index} 
                                           className="group hover:bg-[#f8fafc] transition-colors border-b border-[#e9eff1] last:border-0 border-dashed cursor-pointer"
                                           onClick={() => navigate(`/admin/ledger/${txn.id.replace('#', '')}`)}
                                       >
                                           <td className="py-4 pl-4 text-sm font-semibold text-[#0b2d49]">{txn.id}</td>
                                           <td className="py-4 text-sm text-[#5a5b44]">{txn.date}</td>
                                           <td className="py-4 text-sm font-bold text-[#0b2d49]">₹{txn.amount}</td>
                                           <td className="py-4 text-sm text-[#5a5b44]">{txn.method}</td>
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
