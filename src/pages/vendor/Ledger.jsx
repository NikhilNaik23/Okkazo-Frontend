import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BsArrowLeft, 
  BsDownload, 
  BsFilter, 
  BsSearch, 
  BsGraphUp, 
  BsArrowUpRight, 
  BsArrowDownLeft,
  BsCalendar4Week
} from "react-icons/bs";

const Ledger = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const transactions = [
    { id: "TX-4521", date: "Oct 24, 2023", client: "Sarah Smith", event: "Wedding Gala", amount: "₹45,000", status: "Completed", type: "Credit" },
    { id: "TX-4522", date: "Oct 22, 2023", client: "Tech Corp", event: "Annual Meeting", amount: "₹1,20,000", status: "Pending", type: "Credit" },
    { id: "TX-4523", date: "Oct 20, 2023", client: "System", event: "Platform Fee", amount: "-₹2,500", status: "Completed", type: "Debit" },
    { id: "TX-4524", date: "Oct 18, 2023", client: "John Doe", event: "Birthday Party", amount: "₹35,000", status: "Completed", type: "Credit" },
    { id: "TX-4525", date: "Oct 15, 2023", client: "Global AV", event: "Equipment Rent", amount: "-₹15,000", status: "Completed", type: "Debit" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate("/vendor/dashboard")}
            className="flex items-center gap-2 text-[#708aa0] font-bold text-sm mb-4 hover:text-[#0b2d49] transition-colors group"
          >
            <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-4">
            Financial Ledger
            <span className="text-xs font-bold px-3 py-1 bg-[#d7a444]/10 text-[#d7a444] rounded-full uppercase tracking-wider">Verified</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[#708aa0]/10 rounded-2xl font-bold text-sm hover:shadow-lg transition-all">
            <BsDownload /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#0b2d49] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#0b2d49]/20 hover:bg-[#d7a444] transition-all">
            <BsGraphUp /> Revenue Analytics
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5">
          <p className="text-sm font-bold text-[#708aa0] mb-2 uppercase tracking-widest leading-none">Net Revenue</p>
          <h3 className="text-3xl font-black tracking-tight">₹37,58,240</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500">
            <span className="p-1 bg-emerald-50 rounded-lg"><BsArrowUpRight /></span>
            +12.5% from last month
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5">
          <p className="text-sm font-bold text-[#708aa0] mb-2 uppercase tracking-widest leading-none">Pending Clearance</p>
          <h3 className="text-3xl font-black tracking-tight">₹1,24,000</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500">
            <span className="p-1 bg-amber-50 rounded-lg"><BsCalendar4Week /></span>
            Clearing in next 3 days
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5">
          <p className="text-sm font-bold text-[#708aa0] mb-2 uppercase tracking-widest leading-none">Total Outflow</p>
          <h3 className="text-3xl font-black tracking-tight">₹45,210</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-500">
            <span className="p-1 bg-rose-50 rounded-lg"><BsArrowDownLeft /></span>
            Platform & Service fees
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-[#708aa0]/5 overflow-hidden">
        <div className="p-8 border-b border-[#708aa0]/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0]" />
            <input 
              type="text" 
              placeholder="Search by ID, client or event..."
              className="w-full pl-12 pr-4 py-3 bg-[#e9eff1]/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#d7a444] transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#e9eff1]/50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#0b2d49] focus:ring-0 cursor-pointer min-w-[140px]"
            >
              <option>All Transactions</option>
              <option>Credits</option>
              <option>Debits</option>
            </select>
            <button className="p-3 bg-white border border-[#708aa0]/10 rounded-xl text-[#0b2d49] hover:bg-[#e9eff1] transition-all">
              <BsFilter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-black text-[#708aa0] uppercase tracking-[0.2em] border-b border-[#708aa0]/5">
                <th className="px-8 py-6">Transaction ID</th>
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Description</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#708aa0]/5">
              {transactions.map((txn) => (
                <tr key={txn.id} className="group hover:bg-[#e9eff1]/30 transition-all cursor-pointer">
                  <td className="px-8 py-6">
                    <span className="font-black text-sm text-[#0b2d49]">{txn.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-[#5a5b44]">{txn.date}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-black text-sm text-[#0b2d49]">{txn.event}</p>
                      <p className="text-xs text-[#708aa0] font-bold">{txn.client}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      txn.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`font-black text-sm ${
                      txn.type === 'Credit' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {txn.amount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-[#708aa0]/5 flex items-center justify-between">
          <span className="text-xs font-bold text-[#708aa0]">Showing 5 of 124 transactions</span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-[#708aa0]/10 rounded-xl text-sm font-bold disabled:opacity-50" disabled>Previous</button>
            <button className="px-4 py-2 bg-[#0b2d49] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
