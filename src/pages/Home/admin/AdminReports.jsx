import React, { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  FileText, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  IndianRupee, 
  MoreHorizontal 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchWithAuth } from "../../../utils/apiHandler";
import { refreshAccessToken } from "../../../store/slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const RANGE_QUERY_MAP = {
  "Last 30 Days": "last30",
  "Last Quarter": "last90",
  "Year to Date": "ytd",
};

const DEFAULT_REVENUE_OVERVIEW = [
  { label: 'WEEK 1', currentRevenue: 0, previousRevenue: 0 },
  { label: 'WEEK 2', currentRevenue: 0, previousRevenue: 0 },
  { label: 'WEEK 3', currentRevenue: 0, previousRevenue: 0 },
  { label: 'WEEK 4', currentRevenue: 0, previousRevenue: 0 },
  { label: 'WEEK 5', currentRevenue: 0, previousRevenue: 0 },
];

const CATEGORY_COLORS = ['#28a785', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444'];

const formatRupeeFromPaise = (value) => {
  const amount = Number(value || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatSignedPercent = (value) => {
  const num = Number(value || 0);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

const formatReportDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCategory = (value) => String(value || 'OTHER').replace(/_/g, ' ').trim();

const AdminReports = () => {
  const dispatch = useDispatch();
  const [activeRange, setActiveRange] = useState("Last 30 Days");
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState({
    summary: {
      totalRevenue: 0,
      averageTransaction: 0,
      growthRatePercent: 0,
      totalTransactions: 0,
    },
    revenueOverview: DEFAULT_REVENUE_OVERVIEW,
    categoryBreakdown: [],
    recentEntries: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const timerId = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timerId);
  }, [searchInput]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          range: RANGE_QUERY_MAP[activeRange] || 'last30',
        });

        if (search) {
          params.set('search', search);
        }

        const response = await fetchWithAuth(`${API_BASE_URL}/api/orders/admin/reports?${params.toString()}`, {
          method: 'GET',
        }, { dispatch, refreshAction: refreshAccessToken });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.message || 'Failed to fetch reports');
        }

        const payload = body.data || {};
        setReportData({
          summary: payload.summary || {
            totalRevenue: 0,
            averageTransaction: 0,
            growthRatePercent: 0,
            totalTransactions: 0,
          },
          revenueOverview: Array.isArray(payload.revenueOverview) && payload.revenueOverview.length > 0
            ? payload.revenueOverview
            : DEFAULT_REVENUE_OVERVIEW,
          categoryBreakdown: Array.isArray(payload.categoryBreakdown) ? payload.categoryBreakdown : [],
          recentEntries: Array.isArray(payload.recentEntries) ? payload.recentEntries : [],
        });
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [activeRange, dispatch, search]);

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const params = new URLSearchParams({
        range: RANGE_QUERY_MAP[activeRange] || 'last30',
      });

      if (search) {
        params.set('search', search);
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/orders/admin/reports/export/csv?${params.toString()}`, {
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
      link.download = `admin-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError.message || 'Failed to export CSV');
    } finally {
      setExportingCsv(false);
    }
  };

  const stats = useMemo(() => ([
    {
      label: "TOTAL REVENUE",
      value: formatRupeeFromPaise(reportData.summary.totalRevenue),
      trend: `${reportData.summary.totalTransactions || 0} txns`,
      icon: <IndianRupee size={18} className="text-[#28a785]" />,
      progress: 75,
    },
    {
      label: "AVG. TRANSACTION",
      value: formatRupeeFromPaise(reportData.summary.averageTransaction),
      trend: activeRange,
      icon: <TrendingUp size={18} className="text-[#28a785]" />,
      progress: 45,
    },
    {
      label: "GROWTH RATE",
      value: formatSignedPercent(reportData.summary.growthRatePercent),
      trend: formatSignedPercent(reportData.summary.growthRatePercent),
      icon: <ArrowUpRight size={18} className="text-[#28a785]" />,
      progress: Math.min(100, Math.max(8, Math.round(Math.abs(Number(reportData.summary.growthRatePercent || 0)) + 20))),
    },
  ]), [activeRange, reportData.summary]);

  const revenueOverview = useMemo(() => (
    Array.isArray(reportData.revenueOverview) && reportData.revenueOverview.length > 0
      ? reportData.revenueOverview
      : DEFAULT_REVENUE_OVERVIEW
  ), [reportData.revenueOverview]);

  const maxRevenueMagnitude = useMemo(() => {
    const values = revenueOverview.flatMap((row) => [Math.abs(Number(row.currentRevenue || 0)), Math.abs(Number(row.previousRevenue || 0))]);
    return Math.max(1, ...values);
  }, [revenueOverview]);

  const categoryBreakdown = useMemo(() => {
    const rows = Array.isArray(reportData.categoryBreakdown) ? reportData.categoryBreakdown : [];
    return rows.slice(0, 5);
  }, [reportData.categoryBreakdown]);

  const categoryChartBackground = useMemo(() => {
    if (categoryBreakdown.length === 0) {
      return 'conic-gradient(#e2e8f0 0% 100%)';
    }

    let cursor = 0;
    const segments = categoryBreakdown.map((row, index) => {
      const size = Number(row.percentage || 0);
      const start = cursor;
      const end = Math.min(100, start + size);
      cursor = end;
      return `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} ${start}% ${end}%`;
    });

    if (cursor < 100) {
      segments.push(`#e2e8f0 ${cursor}% 100%`);
    }

    return `conic-gradient(${segments.join(', ')})`;
  }, [categoryBreakdown]);

  const recentEntries = useMemo(() => (
    Array.isArray(reportData.recentEntries) ? reportData.recentEntries : []
  ), [reportData.recentEntries]);

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
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Find reports or transactions..." 
              className="w-64 pl-10 pr-4 py-2 bg-[#f1f5f9] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#28a785]/20 focus:outline-none transition-all placeholder:text-[#94a3b8] text-[#1a1c1e]"
            />
          </div>
          
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="flex items-center gap-2 px-4 py-2 bg-[#28a785] text-white rounded-lg text-sm font-semibold hover:bg-[#218a6e] transition-all shadow-sm disabled:opacity-60"
          >
            <FileText size={16} />
            {exportingCsv ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 text-[#ef4444] text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

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
          
          <div className="h-65 w-full flex items-end justify-between gap-4 px-2">
            {revenueOverview.map((row, index) => {
              const currentHeight = Math.max(4, Math.round((Math.abs(Number(row.currentRevenue || 0)) / maxRevenueMagnitude) * 100));
              const previousHeight = Math.max(4, Math.round((Math.abs(Number(row.previousRevenue || 0)) / maxRevenueMagnitude) * 100));

              return (
                <div key={`${row.label}-${index}`} className="flex flex-col items-center gap-3 group flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#94a3b8] uppercase opacity-0 group-hover:opacity-100 transition-opacity italic">
                    {formatRupeeFromPaise(row.currentRevenue || 0)}
                  </span>
                  <div className="w-full bg-[#f8fafc] rounded-lg h-45 px-2 py-2 flex items-end gap-2 border border-[#f1f5f9]">
                    <div
                      className="w-1/2 bg-[#f1f5f9] rounded-sm transition-all duration-700"
                      style={{ height: `${previousHeight}%` }}
                    ></div>
                    <div
                      className="w-1/2 bg-[#28a785] rounded-sm transition-all duration-700"
                      style={{ height: `${currentHeight}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider truncate">{row.label}</span>
                </div>
              );
            })}
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
              <div className="w-34 h-34 rounded-full flex items-center justify-center" style={{ background: categoryChartBackground }}>
                <div className="w-22 h-22 bg-white rounded-full border border-[#f0f2f5]"></div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {categoryBreakdown.length === 0 && (
                <p className="text-xs text-[#94a3b8] font-semibold">No category distribution available for this range.</p>
              )}

              {categoryBreakdown.map((row, index) => (
                <div key={`${row.category}-${index}`} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    ></span>
                    <span className="font-semibold text-[#64748b] truncate">{formatCategory(row.category)}</span>
                  </div>
                  <span className="font-bold text-[#1a1c1e]">{formatRupeeFromPaise(row.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-[#f0f2f5]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-base font-bold text-[#1a1c1e]">Recent Ledger Entries</h3>
              <button 
                onClick={() => navigate('/admin/ledger')}
                className="text-xs font-bold text-[#28a785] hover:underline"
              >
                View All
              </button>
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
                  {loading && (
                    <tr>
                      <td className="py-4 text-sm text-[#64748b] font-semibold" colSpan={4}>Loading report entries...</td>
                    </tr>
                  )}

                  {!loading && recentEntries.length === 0 && (
                    <tr>
                      <td className="py-4 text-sm text-[#64748b] font-semibold" colSpan={4}>No transactions found for this period.</td>
                    </tr>
                  )}

                  {recentEntries.map((txn, idx) => (
                    <tr 
                      key={`${txn.transactionId || txn.id || idx}`} 
                      className="group hover:bg-[#f8fafc] transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/ledger/${encodeURIComponent(txn.transactionId || txn.id || '')}`)}
                    >
                      <td className="py-4 text-sm font-semibold text-[#1a1c1e]">{txn.transactionId || txn.id}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#64748b] text-[10px] font-bold rounded-md uppercase">
                          {formatCategory(txn.category)}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-[#64748b]">{formatReportDate(txn.date)}</td>
                      <td className="py-4 text-right text-sm font-bold text-[#1a1c1e]">
                        {formatRupeeFromPaise(txn.amount)}
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
