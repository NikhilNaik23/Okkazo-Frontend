import React, { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  Ticket, 
  RotateCcw, 
  Utensils, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchWithAuth } from "../../../utils/apiHandler";
import { refreshAccessToken } from "../../../store/slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const PAGE_SIZE = 10;

const RANGE_TO_DAYS = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 90 Days": 90,
  "Last 365 Days": 365,
};

const toRupeeFromPaise = (value) => {
  const amount = Number(value || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatLedgerAmount = (value) => {
  const numeric = Number(value || 0);
  const formatted = toRupeeFromPaise(Math.abs(numeric));
  return `${numeric >= 0 ? '+' : '-'}${formatted}`;
};

const getTypeIcon = (type) => {
  const normalized = String(type || '').toUpperCase();
  if (normalized === 'TICKET SALE') {
    return <Ticket size={16} className="text-[#28a785]" />;
  }

  if (normalized === 'REFUND' || normalized === 'PLANNING_REFUND') {
    return <RotateCcw size={16} className="text-[#f59e0b]" />;
  }

  if (normalized.includes('VENDOR')) {
    return <Utensils size={16} className="text-[#0d9488]" />;
  }

  return <ShieldCheck size={16} className="text-[#3b82f6]" />;
};

const formatTypeLabel = (type) => {
  const normalized = String(type || '').trim().toUpperCase();
  if (!normalized) return '—';
  if (normalized === 'PLANNING_REFUND') return 'PLANNING_REFUND';
  return normalized;
};

const getStatusColor = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID' || normalized === 'COMPLETED') {
    return 'bg-[#ebf7f3] text-[#28a785]';
  }

  if (normalized === 'REFUNDED') {
    return 'bg-[#fff7ed] text-[#f97316]';
  }

  if (normalized === 'CREATED' || normalized === 'PENDING') {
    return 'bg-[#fefce8] text-[#f59e0b]';
  }

  if (normalized === 'FAILED' || normalized === 'REFUND_FAILED') {
    return 'bg-red-50 text-[#ef4444]';
  }

  return 'bg-[#f1f5f9] text-[#64748b]';
};

/**
 * AdminLedger Component
 * A professional transaction tracking interface following a clean, table-first design.
 */
const AdminLedger = () => {
  const dispatch = useDispatch();
  const [activePage, setActivePage] = useState(1);
  const [activeRange, setActiveRange] = useState("Last 30 Days");
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ledger, setLedger] = useState({
    summary: {
      totalLedgerVolume: 0,
      pendingSettlements: 0,
      activeVendors: 0,
    },
    pagination: {
      page: 1,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    transactions: [],
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput.trim());
      setActivePage(1);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          page: String(activePage),
          limit: String(PAGE_SIZE),
          days: String(RANGE_TO_DAYS[activeRange] || 30),
        });

        if (search) {
          params.set('search', search);
        }

        const response = await fetchWithAuth(`${API_BASE_URL}/api/orders/admin/ledger?${params.toString()}`, {
          method: 'GET',
        }, { dispatch, refreshAction: refreshAccessToken });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch ledger data');
        }

        const payload = data.data || {};
        setLedger({
          summary: payload.summary || { totalLedgerVolume: 0, pendingSettlements: 0, activeVendors: 0 },
          pagination: payload.pagination || { page: 1, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
          transactions: Array.isArray(payload.transactions) ? payload.transactions : [],
        });
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load ledger data');
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [activePage, activeRange, dispatch, search]);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({
        days: String(RANGE_TO_DAYS[activeRange] || 30),
      });

      if (search) {
        params.set('search', search);
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/orders/admin/ledger/export/csv?${params.toString()}`, {
        method: 'GET',
      }, { dispatch, refreshAction: refreshAccessToken });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const stats = useMemo(() => ([
    {
      label: 'Total Ledger Volume',
      value: toRupeeFromPaise(ledger.summary.totalLedgerVolume),
      trend: `${ledger.pagination.total || 0} txns`,
      color: 'text-[#28a785]',
      bg: 'bg-[#ebf7f3]',
      down: false,
    },
    {
      label: 'Pending Settlements',
      value: toRupeeFromPaise(ledger.summary.pendingSettlements),
      trend: activeRange,
      color: 'text-[#f59e0b]',
      bg: 'bg-[#fefce8]',
      down: false,
    },
    {
      label: 'Active Vendors',
      value: String(ledger.summary.activeVendors || 0),
      trend: activeRange,
      color: 'text-[#0b2d49]',
      bg: 'bg-[#e8f2f9]',
      down: false,
    },
  ]), [activeRange, ledger]);

  const paginationNumbers = useMemo(() => {
    const totalPages = Number(ledger.pagination.totalPages || 1);
    const current = Number(ledger.pagination.page || 1);

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const pages = new Set([1, totalPages, current, current - 1, current + 1]);
    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b)
      .reduce((acc, page, idx, arr) => {
        if (idx > 0 && page - arr[idx - 1] > 1) {
          acc.push('...');
        }
        acc.push(page);
        return acc;
      }, []);
  }, [ledger.pagination.page, ledger.pagination.totalPages]);

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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search transactions, vendors or IDs..." 
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#f0f2f5] rounded-lg text-sm focus:bg-white focus:ring-4 focus:ring-[#28a785]/5 focus:border-[#28a785]/30 focus:outline-none transition-all placeholder:text-[#cbd5e1] text-[#1a1c1e]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#28a785] text-white rounded-lg text-sm font-bold hover:bg-[#218a6e] transition-all shadow-sm active:scale-95 disabled:opacity-60"
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
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
          {stats.map((stat, i) => (
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
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f5] rounded-xl text-sm font-bold text-[#64748b] hover:border-[#28a785] hover:text-[#0b2d49] transition-all shadow-sm group">
                <Calendar size={16} />
                <select
                  value={activeRange}
                  onChange={(e) => {
                    setActiveRange(e.target.value);
                    setActivePage(1);
                  }}
                  className="bg-transparent outline-none cursor-pointer"
                >
                  {Object.keys(RANGE_TO_DAYS).map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#c1c9d2] uppercase tracking-widest bg-[#f8fafc] px-3 py-1 rounded-full border border-[#f0f2f5]">
              Showing {ledger.transactions.length} of {ledger.pagination.total || 0} results
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
                {!loading && ledger.transactions.length === 0 && (
                  <tr>
                    <td className="px-8 py-8 text-sm font-semibold text-[#64748b]" colSpan={6}>
                      No ledger transactions found for current filters.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td className="px-8 py-8 text-sm font-semibold text-[#64748b]" colSpan={6}>
                      Loading ledger transactions...
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td className="px-8 py-8 text-sm font-semibold text-[#ef4444]" colSpan={6}>
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && ledger.transactions.map((txn) => (
                  <tr 
                    key={txn.transactionId} 
                    className="hover:bg-[#f8fafc]/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/ledger/${encodeURIComponent(txn.transactionId)}`)}
                  >
                    <td className="px-8 py-5 text-sm font-medium text-[#64748b]">{new Date(txn.createdAt).toISOString().slice(0, 10)}</td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-[#28a785] hover:text-[#0d9488] transition-colors">#{txn.transactionId}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#f0f2f5] group-hover:bg-white transition-colors">
                           {getTypeIcon(txn.type)}
                        </div>
                        <span className="text-sm font-bold text-[#1a1c1e]">{formatTypeLabel(txn.type)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-[#1a1c1e]">{txn.vendor || 'System Auto'}</td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-black ${Number(txn.amount || 0) >= 0 ? 'text-[#28a785]' : 'text-[#ef4444]'}`}>
                        {formatLedgerAmount(txn.amount)}
                      </span>
                    </td>
                    <td className="px-8 py-5 pr-8">
                       <div className="flex justify-start">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-tight ${getStatusColor(txn.status)} shadow-sm inline-block`}>
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
            <button
              disabled={!ledger.pagination.hasPrev || loading}
              onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
              className="w-10 h-10 flex items-center justify-center border border-[#f0f2f5] rounded-xl text-[#94a3b8] hover:bg-white hover:text-[#0b2d49] hover:shadow-md transition-all active:scale-90 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {paginationNumbers.map((p, i) => (
                <button 
                  key={i}
                  onClick={() => typeof p === 'number' && setActivePage(p)}
                  className={`min-w-10 h-10 px-2 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                    activePage === p 
                    ? "bg-[#28a785] text-white shadow-lg shadow-[#28a785]/20" 
                    : "bg-white border border-[#f0f2f5] text-[#64748b] hover:border-[#28a785]/30 hover:text-[#0b2d49] hover:shadow-md"
                  } ${p === "..." ? "cursor-default border-none bg-transparent hover:shadow-none" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              disabled={!ledger.pagination.hasNext || loading}
              onClick={() => setActivePage((prev) => prev + 1)}
              className="w-10 h-10 flex items-center justify-center border border-[#f0f2f5] rounded-xl text-[#64748b] hover:bg-white hover:text-[#0b2d49] hover:shadow-md transition-all active:scale-90 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-[#f0f2f5] shadow-sm">
            <span className="text-xs font-bold text-[#94a3b8]">Rows per page:</span>
            <div className="flex items-center gap-2 text-sm font-black text-[#1a1c1e] cursor-pointer hover:text-[#28a785] transition-colors">
              {PAGE_SIZE}
              <ChevronDown size={14} className="text-[#cbd5e1]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLedger;
