import React, { useState } from "react";
import { 
  Search, 
  Download, 
  Bell, 
  HelpCircle, 
  Filter, 
  Calendar, 
  Ticket, 
  RotateCcw, 
  Utensils, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  TrendingUp,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * AdminLedger Component
 * A professional transaction tracking interface following a clean, table-first design.
 */
const AdminLedger = () => {
  const [activePage, setActivePage] = useState(1);
  const [activeRange, setActiveRange] = useState("Last 30 Days");
  const navigate = useNavigate();

  const transactions = [
    { 
      date: "2023-10-24", 
      id: "#TXN-9921", 
      type: "Ticket Sale", 
      typeIcon: <Ticket size={16} className="text-[#28a785]" />,
      vendor: "North Arena", 
      amount: "+₹450.00", 
      status: "COMPLETED",
      statusColor: "bg-[#ebf7f3] text-[#28a785]"
    },
    { 
      date: "2023-10-23", 
      id: "#TXN-9920", 
      type: "Refund", 
      typeIcon: <RotateCcw size={16} className="text-[#f59e0b]" />,
      vendor: "City Hall", 
      amount: "-₹120.00", 
      status: "PROCESSED",
      statusColor: "bg-[#f1f5f9] text-[#64748b]"
    },
    { 
      date: "2023-10-23", 
      id: "#TXN-9919", 
      type: "Food Vendor", 
      typeIcon: <Utensils size={16} className="text-[#0d9488]" />,
      vendor: "Gourmet Alley", 
      amount: "+₹1,280.50", 
      status: "COMPLETED",
      statusColor: "bg-[#ebf7f3] text-[#28a785]"
    },
    { 
      date: "2023-10-22", 
      id: "#TXN-9918", 
      type: "Ticket Sale", 
      typeIcon: <Ticket size={16} className="text-[#28a785]" />,
      vendor: "Riverside Stage", 
      amount: "+₹85.00", 
      status: "PENDING",
      statusColor: "bg-[#fefce8] text-[#f59e0b]"
    },
    { 
      date: "2023-10-22", 
      id: "#TXN-9917", 
      type: "Service Fee", 
      typeIcon: <ShieldCheck size={16} className="text-[#3b82f6]" />,
      vendor: "System Auto", 
      amount: "+₹12.00", 
      status: "COMPLETED",
      statusColor: "bg-[#ebf7f3] text-[#28a785]"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-[#f0f2f5] shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#94a3b8] font-medium hover:text-[#0b2d49] cursor-pointer transition-colors">Financials</span>
          <span className="text-[#cbd5e1]">/</span>
          <span className="text-[#1a1c1e] font-bold">Ledger</span>
        </div>

        <div className="flex-1 max-w-2xl px-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input 
              type="text" 
              placeholder="Search transactions, vendors or IDs..." 
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-sm focus:bg-white focus:ring-4 focus:ring-[#28a785]/5 focus:border-[#28a785]/30 focus:outline-none transition-all placeholder:text-[#cbd5e1] text-[#1a1c1e]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#28a785] text-white rounded-lg text-sm font-bold hover:bg-[#218a6e] transition-all shadow-sm active:scale-95">
            <Download size={16} />
            Export CSV
          </button>
          
          <div className="h-6 w-px bg-[#f0f2f5] mx-1"></div>

          <div className="flex items-center gap-1">
            <button className="p-2 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0b2d49] rounded-lg relative transition-all">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>
            <button className="p-2 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0b2d49] rounded-lg transition-all">
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* Main Title Section */}
        <div className="max-w-4xl">
          <h1 className="text-[28px] font-black text-[#1a1c1e] tracking-tight leading-tight">Transaction Ledger</h1>
          <p className="text-[#64748b] mt-2 text-base font-medium">
            Manage and track all platform transactions with precision. Use the filters to refine the view.
          </p>
        </div>

        {/* Statistical Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Total Ledger Volume", value: "₹128,430.00", trend: "12.5%", color: "text-[#28a785]", bg: "bg-[#ebf7f3]" },
            { label: "Pending Settlements", value: "₹12,400.00", trend: "3.2%", color: "text-[#28a785]", bg: "bg-[#ebf7f3]" },
            { label: "Active Vendors", value: "42", trend: "1.5%", color: "text-[#ef4444]", bg: "bg-red-50", down: true }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-7 rounded-2xl border border-[#f0f2f5] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] flex flex-col justify-between group hover:border-[#28a785]/20 transition-all">
              <p className="text-[13px] font-bold text-[#94a3b8] uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline justify-between mt-4">
                <h3 className="text-3xl font-black text-[#1a1c1e] tracking-tight">{stat.value}</h3>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${stat.bg} ${stat.color} shadow-sm`}>
                   <Activity size={10} className={stat.down ? "rotate-180" : ""} />
                   {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ledger Table Section */}
        <div className="bg-white rounded-[20px] border border-[#f0f2f5] shadow-sm overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="px-6 py-5 border-b border-[#f0f2f5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f5] rounded-xl text-sm font-bold text-[#64748b] hover:border-[#28a785] hover:text-[#0b2d49] transition-all shadow-sm">
                <Filter size={16} />
                Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f5] rounded-xl text-sm font-bold text-[#64748b] hover:border-[#28a785] hover:text-[#0b2d49] transition-all shadow-sm group">
                <Calendar size={16} />
                {activeRange}
                <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
            <span className="text-[11px] font-bold text-[#c1c9d2] uppercase tracking-widest bg-[#f8fafc] px-3 py-1 rounded-full border border-[#f0f2f5]">
              Showing 10 of 2,491 results
            </span>
          </div>

          {/* Transaction List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#fcfdfe] border-b border-[#f1f5f9]">
                  <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Transaction ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Vendor</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]/60">
                {transactions.map((txn, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-[#f8fafc]/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/ledger/${txn.id.replace('#', '')}`)}
                  >
                    <td className="px-8 py-5 text-sm font-medium text-[#64748b]">{txn.date}</td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-[#28a785] hover:text-[#0d9488] transition-colors">{txn.id}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#f0f2f5] group-hover:bg-white transition-colors">
                           {txn.typeIcon}
                        </div>
                        <span className="text-sm font-bold text-[#1a1c1e]">{txn.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-[#1a1c1e]">{txn.vendor}</td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-black ${txn.amount.startsWith('+') ? 'text-[#28a785]' : 'text-[#ef4444]'}`}>
                        {txn.amount}
                      </span>
                    </td>
                    <td className="px-8 py-5 pr-8">
                       <div className="flex justify-start">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-tight ${txn.statusColor} shadow-sm inline-block`}>
                            {txn.status}
                          </span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Pagination Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-4">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center border border-[#f0f2f5] rounded-xl text-[#94a3b8] hover:bg-white hover:text-[#0b2d49] hover:shadow-md transition-all active:scale-90">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {[1, 2, 3, "...", 249].map((p, i) => (
                <button 
                  key={i}
                  onClick={() => typeof p === 'number' && setActivePage(p)}
                  className={`min-w-[40px] h-10 px-2 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                    activePage === p 
                    ? "bg-[#28a785] text-white shadow-lg shadow-[#28a785]/20" 
                    : "bg-white border border-[#f0f2f5] text-[#64748b] hover:border-[#28a785]/30 hover:text-[#0b2d49] hover:shadow-md"
                  } ${p === "..." ? "cursor-default border-none bg-transparent hover:shadow-none" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="w-10 h-10 flex items-center justify-center border border-[#f0f2f5] rounded-xl text-[#64748b] hover:bg-white hover:text-[#0b2d49] hover:shadow-md transition-all active:scale-90">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-[#f0f2f5] shadow-sm">
            <span className="text-xs font-bold text-[#94a3b8]">Rows per page:</span>
            <div className="flex items-center gap-2 text-sm font-black text-[#1a1c1e] cursor-pointer hover:text-[#28a785] transition-colors">
              10
              <ChevronDown size={14} className="text-[#cbd5e1]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLedger;
