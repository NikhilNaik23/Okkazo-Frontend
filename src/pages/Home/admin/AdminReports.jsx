import React, { useState } from "react";
import { 
  Search, 
  FileText, 
  Bell, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  IndianRupee, 
  MoreHorizontal 
} from "lucide-react";

const AdminReports = () => {
  const [activeRange, setActiveRange] = useState("Last 30 Days");

  const stats = [
    {
      label: "TOTAL REVENUE",
      value: "₹1,42,830.00",
      trend: "+12.4%",
      icon: <IndianRupee size={18} className="text-[#28a785]" />,
      progress: 75
    },
    {
      label: "AVG. TRANSACTION",
      value: "₹512.40",
      trend: "+4.2%",
      icon: <TrendingUp size={18} className="text-[#28a785]" />,
      progress: 45
    },
    {
      label: "GROWTH RATE",
      value: "+18.2%",
      trend: "+0.8%",
      icon: <ArrowUpRight size={18} className="text-[#28a785]" />,
      progress: 85
    }
  ];

  const recentEntries = [
    { id: "TXN-92842", category: "Catering", date: "Oct 24, 2023", amount: "₹1,200.00" },
    { id: "TXN-92101", category: "Security", date: "Oct 23, 2023", amount: "₹850.00" },
    { id: "TXN-91992", category: "Venue", date: "Oct 22, 2023", amount: "₹2,400.00" },
    { id: "TXN-90877", category: "Decor", date: "Oct 21, 2023", amount: "₹1,100.00" }
  ];

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] overflow-hidden">
      {/* Top Header */}
      <div className="px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-[#f0f2f5] shrink-0">
        <h1 className="text-xl font-bold text-[#1a1c1e]">Financial Reports</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input 
              type="text" 
              placeholder="Find reports or transactions..." 
              className="w-64 pl-10 pr-4 py-2 bg-[#f1f5f9] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#28a785]/20 focus:outline-none transition-all placeholder:text-[#94a3b8] text-[#1a1c1e]"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-[#28a785] text-white rounded-lg text-sm font-semibold hover:bg-[#218a6e] transition-all shadow-sm">
            <FileText size={16} />
            Export PDF
          </button>
          
          <button className="p-2 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg transition-colors relative">
            <Bell size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex p-0.5 bg-white rounded-lg shadow-sm border border-[#f0f2f5]">
            {["Last 30 Days", "Last Quarter", "Year to Date"].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeRange === range 
                  ? "bg-white text-[#28a785] shadow-sm border border-[#f0f2f5]" 
                  : "text-[#64748b] hover:text-[#1a1c1e]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f5] rounded-lg text-xs font-semibold text-[#1a1c1e] hover:bg-[#f8fafc] shadow-sm transition-all group">
            <Calendar size={16} className="text-[#64748b]" />
            Custom Range
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-[#f0f2f5] flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-[#f8fafc] rounded-lg text-[#28a785] border border-[#f0f2f5]">
                  {stat.icon}
                </div>
                <div className="text-[10px] font-bold text-[#28a785] bg-[#ebf7f3] px-2 py-0.5 rounded-full">
                  {stat.trend}
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-2xl font-bold text-[#1a1c1e] mt-1">{stat.value}</h3>
              </div>
              
              <div className="w-full bg-[#f8fafc] h-1.5 rounded-full overflow-hidden mt-auto">
                <div 
                  className="bg-[#28a785] h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#f0f2f5]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <h3 className="text-lg font-bold text-[#1a1c1e]">Revenue Overview</h3>
              <p className="text-sm text-[#94a3b8]">Historical billing performance for current period</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#28a785]"></div>
                <span className="text-xs font-medium text-[#64748b]">Current Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f1f5f9]"></div>
                <span className="text-xs font-medium text-[#64748b]">Previous Period</span>
              </div>
            </div>
          </div>
          
          <div className="h-[250px] w-full flex items-end justify-between px-4">
            {[1, 2, 3, 4, 5].map((week) => (
              <div key={week} className="flex flex-col items-center gap-4 group flex-1 max-w-[100px]">
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase opacity-0 group-hover:opacity-100 transition-opacity italic">Week {week}</span>
                <div className="w-full bg-[#f8fafc] rounded-t-lg relative h-[200px]">
                  {/* Mock Chart Content */}
                </div>
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">WEEK {week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Intelligence Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-[#f0f2f5]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-base font-bold text-[#1a1c1e]">Revenue by Category</h3>
              <MoreHorizontal size={18} className="text-[#94a3b8] cursor-pointer" />
            </div>
            <div className="h-48 flex items-center justify-center">
              {/* Pie Chart Mockup Placeholder */}
              <div className="w-32 h-32 rounded-full border-8 border-t-[#28a785] border-r-[#28a785]/30 border-b-[#f1f5f9] border-l-[#f1f5f9] transform rotate-45"></div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-[#f0f2f5]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-base font-bold text-[#1a1c1e]">Recent Ledger Entries</h3>
              <button className="text-xs font-bold text-[#28a785] hover:underline">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest border-b border-[#f1f5f9]">
                    <th className="pb-4">Transaction ID</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {recentEntries.map((txn, idx) => (
                    <tr key={idx} className="group hover:bg-[#f8fafc] transition-colors">
                      <td className="py-4 text-sm font-semibold text-[#1a1c1e]">{txn.id}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#64748b] text-[10px] font-bold rounded-md uppercase">
                          {txn.category}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-[#64748b]">{txn.date}</td>
                      <td className="py-4 text-right text-sm font-bold text-[#1a1c1e]">
                        {txn.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
