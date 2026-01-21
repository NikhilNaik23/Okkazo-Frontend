import React from "react";
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
  MoreHorizontal
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const EventDetails = () => {
  const { id } = useParams();

  // Mock Data
  const eventData = {
    title: "Annual Tech Gala 2024",
    status: "IN PROGRESS",
    category: "Corporate Event",
    subCategory: "Private Category",
    services: [
      { type: "VENUE", name: "Crystal Hall Pavilion", icon: Building2 },
      { type: "CATERING", name: "Premium Fusion Menu", icon: Utensils },
      { type: "PHOTOGRAPHY", name: "Cinematic High-Key", icon: Camera },
    ],
    budget: {
      original: "15,000.00",
      revised: "18,200.00",
      final: "22,900.00"
    },
    transactions: [
      { id: "TXN-882190", date: "22 Oct, 2023", amount: "12,400.00", method: "Wire Transfer", status: "PAID" },
      { id: "TXN-882245", date: "28 Oct, 2023", amount: "4,500.00", method: "Credit Card", status: "PENDING" },
    ],
    manager: "Marcus Aurelius",
    vendors: [
      { name: "Luxe Catering Co.", status: "CONFIRMED" },
      { name: "Neon Sound Systems", status: "PENDING" }
    ],
    logs: [
      { title: "Contract approved by Admin", time: "Today • 10:45 AM", type: "success" },
      { title: "Vendor requested budget revision", time: "Yesterday • 4:20 PM", type: "warning" },
      { title: "Initial planning phase complete", time: "Oct 20 • 9:15 AM", type: "info" }
    ]
  };

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
                  <span className="bg-[#e9eff1] text-[#0b2d49] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      {eventData.status}
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
               <div className="flex gap-3">
                   <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0b2d49] text-white font-semibold rounded-xl hover:bg-[#0b2d49]/90 transition-colors shadow-lg shadow-[#0b2d49]/20">
                       <UserPlus size={18} />
                       Assign Manager
                   </button>
                   <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-rose-100 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition-colors">
                       <X size={18} />
                       Close Event
                   </button>
                   <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0b2d49] text-white font-semibold rounded-xl hover:bg-[#0b2d49]/90 transition-colors shadow-lg shadow-[#0b2d49]/20">
                       <CheckCircle size={18} />
                       Approve
                   </button>
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
                                       <tr key={index} className="group hover:bg-[#f8fafc] transition-colors border-b border-[#e9eff1] last:border-0 border-dashed">
                                           <td className="py-4 pl-4 text-sm font-semibold text-[#0b2d49]">{txn.id}</td>
                                           <td className="py-4 text-sm text-[#5a5b44]">{txn.date}</td>
                                           <td className="py-4 text-sm font-bold text-[#0b2d49]">${txn.amount}</td>
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
                                   <span className="text-lg font-bold text-white">${eventData.budget.original}</span>
                               </div>
                               <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                   <span className="text-sm font-medium text-[#708aa0]">Revised</span>
                                   <span className="text-lg font-bold text-white">${eventData.budget.revised}</span>
                               </div>
                               <div className="flex justify-between items-end pt-2">
                                   <span className="text-sm font-medium text-[#d7a444] mb-1">Final Amount</span>
                                   <span className="text-3xl font-bold text-white">${eventData.budget.final}</span>
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
                           <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl">
                               <div className="w-10 h-10 bg-[#0b2d49]/10 text-[#0b2d49] rounded-lg flex items-center justify-center font-bold text-sm">
                                   MA
                               </div>
                               <span className="font-bold text-[#0b2d49]">{eventData.manager}</span>
                           </div>
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
