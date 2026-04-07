import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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
import { toast } from "react-hot-toast";
import { fetchWithAuth } from "../../utils/apiHandler";
import { refreshAccessToken } from "../../store/slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const toAmountInr = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const formatInr = (value) => `₹${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;

const Ledger = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [filter, setFilter] = useState("All Transactions");
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalReceived: 0,
    pendingClearance: 0,
    failedAmount: 0,
    successfulPayoutCount: 0,
  });

  const loadLedger = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/events/vendor/requests/ledger`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to load ledger');
      }

      const nextRows = Array.isArray(data?.data?.rows) ? data.data.rows : [];
      setRows(nextRows);

      const successfulRows = nextRows.filter((row) => String(row?.status || '').trim().toUpperCase() === 'SUCCESS');
      const pendingRows = nextRows.filter((row) => String(row?.status || '').trim().toUpperCase() === 'INITIATED');
      const failedRows = nextRows.filter((row) => String(row?.status || '').trim().toUpperCase() === 'FAILED');

      setSummary({
        totalReceived: successfulRows.reduce((sum, row) => sum + toAmountInr(row?.amountInr), 0),
        pendingClearance: pendingRows.reduce((sum, row) => sum + toAmountInr(row?.amountInr), 0),
        failedAmount: failedRows.reduce((sum, row) => sum + toAmountInr(row?.amountInr), 0),
        successfulPayoutCount: successfulRows.length,
      });
    } catch (error) {
      toast.error(error?.message || 'Failed to load ledger');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const filteredRows = useMemo(() => {
    const query = String(searchTerm || '').trim().toLowerCase();

    return rows
      .filter((row) => {
        const status = String(row?.status || '').trim().toUpperCase();
        if (filter === 'Received' && status !== 'SUCCESS') return false;
        if (filter === 'Processing' && status !== 'INITIATED') return false;
        if (filter === 'Failed' && status !== 'FAILED') return false;
        if (filter === 'Demo Only' && String(row?.payoutMode || '').trim().toUpperCase() !== 'DEMO') return false;
        if (filter === 'Razorpay Only' && String(row?.payoutMode || '').trim().toUpperCase() !== 'RAZORPAY') return false;
        return true;
      })
      .filter((row) => {
        if (!query) return true;
        const haystack = [
          row?.payoutId,
          row?.eventId,
          row?.eventTitle,
          row?.service,
          row?.status,
          row?.payoutMode,
        ]
          .map((value) => String(value || '').toLowerCase())
          .join(' ');
        return haystack.includes(query);
      });
  }, [filter, rows, searchTerm]);

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
          <p className="text-sm font-bold text-[#708aa0] mb-2 uppercase tracking-widest leading-none">Amount Received</p>
          <h3 className="text-3xl font-black tracking-tight">{formatInr(summary.totalReceived)}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500">
            <span className="p-1 bg-emerald-50 rounded-lg"><BsArrowUpRight /></span>
            {summary.successfulPayoutCount} successful payouts
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5">
          <p className="text-sm font-bold text-[#708aa0] mb-2 uppercase tracking-widest leading-none">Pending Clearance</p>
          <h3 className="text-3xl font-black tracking-tight">{formatInr(summary.pendingClearance)}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500">
            <span className="p-1 bg-amber-50 rounded-lg"><BsCalendar4Week /></span>
            Awaiting settlement completion
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5">
          <p className="text-sm font-bold text-[#708aa0] mb-2 uppercase tracking-widest leading-none">Failed Transfers</p>
          <h3 className="text-3xl font-black tracking-tight">{formatInr(summary.failedAmount)}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-500">
            <span className="p-1 bg-rose-50 rounded-lg"><BsArrowDownLeft /></span>
            Retry failed payout entries
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by payout ID, event or mode..."
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
              <option>Received</option>
              <option>Processing</option>
              <option>Failed</option>
              <option>Demo Only</option>
              <option>Razorpay Only</option>
            </select>
            <button onClick={loadLedger} className="p-3 bg-white border border-[#708aa0]/10 rounded-xl text-[#0b2d49] hover:bg-[#e9eff1] transition-all">
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
                <th className="px-8 py-6">Mode</th>
                <th className="px-8 py-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#708aa0]/5">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-8 py-8 text-sm font-bold text-[#708aa0]">Loading ledger...</td>
                </tr>
              )}

              {!isLoading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-8 text-sm font-bold text-[#708aa0]">No payout ledger rows found.</td>
                </tr>
              )}

              {!isLoading && filteredRows.map((txn) => {
                const status = String(txn?.status || '').trim().toUpperCase();
                const statusTone = status === 'SUCCESS'
                  ? 'bg-emerald-50 text-emerald-600'
                  : (status === 'INITIATED' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600');

                return (
                <tr key={txn.id} className="group hover:bg-[#e9eff1]/30 transition-all cursor-pointer">
                  <td className="px-8 py-6">
                    <span className="font-black text-sm text-[#0b2d49]">{txn.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-[#5a5b44]">{txn.dateLabel || '—'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-black text-sm text-[#0b2d49]">{txn.eventTitle || `Event ${txn.eventId || '—'}`}</p>
                      <p className="text-xs text-[#708aa0] font-bold">{txn.service || 'Service'} • {txn.eventId || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusTone}`}>
                      {status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600">
                      {String(txn?.payoutMode || '—').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`font-black text-sm ${status === 'FAILED' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {formatInr(txn.amountInr)}
                    </span>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-[#708aa0]/5 flex items-center justify-between">
          <span className="text-xs font-bold text-[#708aa0]">Showing {filteredRows.length} ledger entries</span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-[#708aa0]/10 rounded-xl text-sm font-bold disabled:opacity-50" disabled>Previous</button>
            <button className="px-4 py-2 bg-[#0b2d49] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
