import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Calendar, 
  Users, 
  TrendingUp, 
  ChevronDown,
  IndianRupee
} from 'lucide-react';
import { fetchWithAuth } from '../../../utils/apiHandler';
import { refreshAccessToken } from '../../../store/slices/authSlice';

import {
  fetchFeesConfig,
  updateFeesConfig,
  selectFeesError,
  selectFeesStatus,
  selectPlatformFee,
  selectServiceChargePercent,
} from '../../../store/slices/feesSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const DEFAULT_REVENUE_OVERVIEW = [
  { label: 'JAN', currentRevenue: 0, previousRevenue: 0 },
  { label: 'FEB', currentRevenue: 0, previousRevenue: 0 },
  { label: 'MAR', currentRevenue: 0, previousRevenue: 0 },
  { label: 'APR', currentRevenue: 0, previousRevenue: 0 },
  { label: 'MAY', currentRevenue: 0, previousRevenue: 0 },
  { label: 'JUN', currentRevenue: 0, previousRevenue: 0 },
];

const DEFAULT_SUMMARY_CARDS = {
  totalRevenue: 0,
  totalRevenueTrendPercent: 0,
  activeEvents: 0,
  activeEventsTrendPercent: 0,
  newVendors: 0,
  newVendorsLast7Days: 0,
  newVendorsTrendPercent: 0,
  monthlyGrowthPercent: 0,
  monthlyGrowthTrendPercent: 0,
};

const ANALYTICS_WINDOW_OPTIONS = [
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'last180', label: 'Last 6 Months' },
  { value: 'ytd', label: 'Year to Date' },
];

const formatRupeeFromPaise = (value) => {
  const amount = (Number(value || 0) || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatSignedPercent = (value, decimals = 2) => {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? '+' : '';
  return `${sign}${numeric.toFixed(decimals)}%`;
};

const formatPercentValue = (value, decimals = 2) => `${Number(value || 0).toFixed(decimals)}%`;

const formatDisplayDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const normalizeStatus = (value) => String(value || '').trim().toUpperCase();

const getStatusStyle = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized.includes('CONFIRM') || normalized.includes('ACTIVE') || normalized.includes('COMPLETE')) {
    return 'bg-[#0b2d49]/10 text-[#0b2d49]';
  }

  if (normalized.includes('PENDING') || normalized.includes('REVIEW') || normalized.includes('ACTION')) {
    return 'bg-[#f3ddb1] text-[#5a5b44]';
  }

  if (normalized.includes('REJECT') || normalized.includes('FAILED') || normalized.includes('CANCEL')) {
    return 'bg-rose-100 text-rose-700';
  }

  return 'bg-slate-100 text-slate-700';
};

const buildInitialsStyle = (source) => {
  if (source === 'PROMOTE') {
    return 'bg-[#d7a444]/10 text-[#d7a444]';
  }
  return 'bg-[#0b2d49]/10 text-[#0b2d49]';
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const platformFee = useSelector(selectPlatformFee);
  const serviceChargePercent = useSelector(selectServiceChargePercent);
  const feesStatus = useSelector(selectFeesStatus);
  const feesError = useSelector(selectFeesError);

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [analyticsWindow, setAnalyticsWindow] = useState('last180');
  const [dashboardData, setDashboardData] = useState({
    summaryCards: DEFAULT_SUMMARY_CARDS,
    revenueOverview: DEFAULT_REVENUE_OVERVIEW,
    upcomingEvents: [],
  });

  // Draft inputs: when undefined, the UI falls back to the latest store values.
  const [feeInput, setFeeInput] = useState(undefined);
  const [serviceInput, setServiceInput] = useState(undefined);

  useEffect(() => {
    if (feesStatus === 'idle') {
      dispatch(fetchFeesConfig());
    }
  }, [dispatch, feesStatus]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError('');

        const params = new URLSearchParams({
          analyticsWindow,
          limit: '150',
        });

        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/admin/dashboard?${params.toString()}`,
          { method: 'GET' },
          { dispatch, refreshAction: refreshAccessToken }
        );

        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body?.success) {
          throw new Error(body?.message || 'Failed to load admin dashboard');
        }

        setDashboardData({
          summaryCards: body?.data?.summaryCards || DEFAULT_SUMMARY_CARDS,
          revenueOverview: Array.isArray(body?.data?.revenueOverview) && body.data.revenueOverview.length > 0
            ? body.data.revenueOverview
            : DEFAULT_REVENUE_OVERVIEW,
          upcomingEvents: Array.isArray(body?.data?.upcomingEvents) ? body.data.upcomingEvents : [],
        });
      } catch (error) {
        setDashboardError(error.message || 'Failed to load admin dashboard');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
  }, [analyticsWindow, dispatch]);

  const feeInputValue = feeInput ?? (platformFee != null ? String(platformFee) : '');
  const serviceInputValue = serviceInput ?? (serviceChargePercent != null ? String(serviceChargePercent) : '');

  const isSaving = feesStatus === 'loading';
  const canSave = useMemo(() => {
    const fee = Number(feeInputValue);
    const pct = Number(serviceInputValue);
    if (!Number.isFinite(fee) || fee < 0) return false;
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) return false;
    return true;
  }, [feeInputValue, serviceInputValue]);

  const summaryCards = dashboardData.summaryCards || DEFAULT_SUMMARY_CARDS;

  const statCards = useMemo(() => ([
    {
      icon: <IndianRupee size={24} className="text-[#d7a444]" />,
      iconBg: 'bg-[#f3ddb1]/30',
      label: 'Total Revenue',
      value: formatRupeeFromPaise(summaryCards.totalRevenue),
      trend: formatSignedPercent(summaryCards.totalRevenueTrendPercent),
      trendUp: Number(summaryCards.totalRevenueTrendPercent || 0) >= 0,
      onClick: () => navigate('/admin/ledger'),
    },
    {
      icon: <Calendar size={24} className="text-[#0b2d49]" />,
      iconBg: 'bg-[#0b2d49]/10',
      label: 'Active Events',
      value: String(summaryCards.activeEvents || 0),
      trend: formatSignedPercent(summaryCards.activeEventsTrendPercent),
      trendUp: Number(summaryCards.activeEventsTrendPercent || 0) >= 0,
    },
    {
      icon: <Users size={24} className="text-[#5a5b44]" />,
      iconBg: 'bg-[#5a5b44]/10',
      label: 'New Vendors',
      value: String(summaryCards.newVendors || 0),
      subLabel: 'Last 7 days',
      subValue: String(summaryCards.newVendorsLast7Days || 0),
      trend: formatSignedPercent(summaryCards.newVendorsTrendPercent),
      trendUp: Number(summaryCards.newVendorsTrendPercent || 0) >= 0,
      trendColor: 'text-[#5a5b44] bg-[#5a5b44]/10',
    },
    {
      icon: <TrendingUp size={24} className="text-[#708aa0]" />,
      iconBg: 'bg-[#708aa0]/10',
      label: 'Monthly Growth',
      value: formatPercentValue(summaryCards.monthlyGrowthPercent),
      trend: formatSignedPercent(summaryCards.monthlyGrowthTrendPercent),
      trendUp: Number(summaryCards.monthlyGrowthTrendPercent || 0) >= 0,
    },
  ]), [navigate, summaryCards]);

  const chartRows = useMemo(() => {
    const rows = Array.isArray(dashboardData.revenueOverview)
      ? dashboardData.revenueOverview
      : DEFAULT_REVENUE_OVERVIEW;

    if (rows.length === 0) {
      return DEFAULT_REVENUE_OVERVIEW;
    }

    return rows.slice(-6).map((row, index) => ({
      label: String(row?.label || `P${index + 1}`).toUpperCase(),
      currentRevenue: Number(row?.currentRevenue || 0),
    }));
  }, [dashboardData.revenueOverview]);

  const chartMax = useMemo(() => (
    Math.max(1, ...chartRows.map((row) => Math.abs(Number(row.currentRevenue || 0))))
  ), [chartRows]);

  const chartPoints = useMemo(() => {
    const count = chartRows.length;
    if (count === 0) {
      return [];
    }

    return chartRows.map((row, index) => {
      const x = count === 1 ? 50 : (index / (count - 1)) * 100;
      const y = 90 - ((Math.abs(Number(row.currentRevenue || 0)) / chartMax) * 62);
      return {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
      };
    });
  }, [chartMax, chartRows]);

  const chartLinePath = useMemo(() => (
    chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')
  ), [chartPoints]);

  const chartAreaPath = useMemo(() => {
    if (chartPoints.length === 0) return '';

    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    return `${chartLinePath} L${last.x},100 L${first.x},100 Z`;
  }, [chartLinePath, chartPoints]);

  const upcomingEvents = useMemo(() => (
    Array.isArray(dashboardData.upcomingEvents) ? dashboardData.upcomingEvents : []
  ), [dashboardData.upcomingEvents]);

  const handleSaveFees = async () => {
    const fee = Number(feeInputValue);
    const pct = Number(serviceInputValue);
    if (!Number.isFinite(fee) || fee < 0) return;
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) return;

    const resultAction = await dispatch(updateFeesConfig({ platformFee: fee, serviceChargePercent: pct }));
    if (updateFeesConfig.fulfilled.match(resultAction)) {
      setFeeInput(undefined);
      setServiceInput(undefined);
      dispatch(fetchFeesConfig());
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#e9eff1]">
      {/* Dashboard Header */}
      <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-[#e9eff1] sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-[#0b2d49] tracking-tight">Dashboard Overview</h1>
        
        <div className="flex items-center gap-4 flex-1 md:justify-end">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708aa0]" size={18} />
            <input 
              type="text" 
              placeholder="Search analytics, events, or vendors..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] focus:outline-none transition-all placeholder:text-[#708aa0] text-[#0b2d49]"
            />
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {dashboardError && (
          <div className="px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
            {dashboardError}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <StatCard
              key={`${card.label}-${index}`}
              icon={card.icon}
              iconBg={card.iconBg}
              label={card.label}
              value={card.value}
              subLabel={card.subLabel}
              subValue={card.subValue}
              trend={card.trend}
              trendUp={card.trendUp}
              onClick={card.onClick}
              trendColor={card.trendColor}
            />
          ))}
        </div>

        {/* Middle Section: Analytics & Vendor Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Analytics Chart Area */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#e9eff1]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-[#0b2d49]">Revenue Analytics</h3>
                <p className="text-sm text-[#5a5b44]">Monthly financial performance breakdown</p>
              </div>
              <div className="relative">
                <select
                  value={analyticsWindow}
                  onChange={(event) => setAnalyticsWindow(event.target.value)}
                  className="appearance-none pr-8 pl-3 py-1.5 bg-[#f8fafc] text-[#5a5b44] text-xs font-semibold rounded-lg border border-transparent hover:bg-[#e9eff1] focus:outline-none focus:ring-1 focus:ring-[#d7a444]"
                >
                  {ANALYTICS_WINDOW_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#5a5b44]" />
              </div>
            </div>
            
            {/* Revenue Curve */}
            <div className="h-70 w-full relative flex items-end justify-between px-2 pt-10">
               {/* Grid Lines */}
               <div className="absolute inset-0 flex flex-col justify-between text-xs text-[#e9eff1] pointer-events-none pb-8 pl-0">
                  <div className="border-b border-dashed border-[#e9eff1] w-full h-full"></div>
                  <div className="border-b border-dashed border-[#e9eff1] w-full h-full"></div>
                  <div className="border-b border-dashed border-[#e9eff1] w-full h-full"></div>
                  <div className="border-b border-dashed border-[#e9eff1] w-full h-full"></div>
               </div>

               {/* SVG Curve */}
               <svg className="absolute inset-0 w-full h-full overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#d7a444" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#d7a444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {chartAreaPath && (
                    <path d={chartAreaPath} fill="url(#gradient)" />
                  )}
                  {chartLinePath && (
                    <path
                      d={chartLinePath}
                      fill="none"
                      stroke="#d7a444"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {chartPoints.map((point, index) => (
                    <circle
                      key={`${point.x}-${point.y}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="white"
                      stroke="#d7a444"
                      strokeWidth="1"
                    />
                  ))}
               </svg>

               {/* X Axis Labels */}
               <div className="w-full flex justify-between text-xs font-bold text-[#708aa0] mt-4 absolute bottom-0 left-0 px-2">
                 {chartRows.map((row, index) => (
                   <span key={`${row.label}-${index}`}>{row.label}</span>
                 ))}
               </div>
            </div>
          </div>

          {/* Fees Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e9eff1] flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#0b2d49]">Fees settings</h3>
              <p className="text-sm text-[#5a5b44]">Update platform fee and service %</p>
            </div>

            <div className="space-y-5 flex-1">
              <div className="bg-[#f8fafc] rounded-xl border border-[#e9eff1] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#708aa0] mb-2">Current</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#5a5b44]">Platform fee (₹)</p>
                    <p className="text-lg font-bold text-[#0b2d49]">{platformFee != null ? `₹${Number(platformFee).toLocaleString()}` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5a5b44]">Service charge (%)</p>
                    <p className="text-lg font-bold text-[#0b2d49]">{serviceChargePercent != null ? `${serviceChargePercent}%` : '—'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-2">Platform fee (INR)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={feeInputValue}
                    onChange={(e) => setFeeInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#e9eff1] rounded-xl text-sm focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] focus:outline-none transition-all text-[#0b2d49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-2">Service charge (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={serviceInputValue}
                    onChange={(e) => setServiceInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#e9eff1] rounded-xl text-sm focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] focus:outline-none transition-all text-[#0b2d49]"
                  />
                </div>

                {feesError && (
                  <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {feesError}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveFees}
              disabled={!canSave || isSaving}
              className="mt-6 w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#0b2d49] text-white hover:bg-[#0b2d49]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e9eff1]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0b2d49]">Upcoming Events</h3>
            <button className="px-4 py-2 border border-[#e9eff1] rounded-lg text-xs font-bold text-[#5a5b44] hover:bg-[#e9eff1] transition-colors">
              See All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-[#708aa0] uppercase tracking-wider border-b border-[#e9eff1]">
                  <th className="pb-4 pl-4">Event Name</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4 pr-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                 {dashboardLoading && (
                   <tr>
                     <td className="py-4 pl-4 text-sm font-semibold text-[#5a5b44]" colSpan={4}>Loading upcoming events...</td>
                   </tr>
                 )}

                 {!dashboardLoading && upcomingEvents.length === 0 && (
                   <tr>
                     <td className="py-4 pl-4 text-sm font-semibold text-[#5a5b44]" colSpan={4}>No upcoming events available.</td>
                   </tr>
                 )}

                 {!dashboardLoading && upcomingEvents.map((event, index) => (
                   <EventRow
                     key={`${event.eventId || event.name || 'event'}-${index}`}
                     name={event.name}
                     source={event.source}
                     status={event.status}
                     date={formatDisplayDate(event.date)}
                     revenue={formatRupeeFromPaise(event.revenue)}
                   />
                 ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({
  icon,
  iconBg,
  label,
  value,
  subLabel,
  subValue,
  trend,
  trendUp,
  onClick,
  trendColor = "text-[#d7a444] bg-[#f3ddb1]/30",
}) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl shadow-sm border border-[#e9eff1] flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${trendColor} flex items-center gap-1`}>
        {trendUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
        {trend}
      </span>
    </div>
    <div className="mt-auto">
       <span className="text-sm font-medium text-[#708aa0]">{label}</span>
       <h3 className="text-2xl font-bold text-[#0b2d49] mt-1">{value}</h3>
       {subLabel && (
         <p className="mt-1 text-xs font-semibold text-[#5a5b44]">
           {subLabel}: <span className="text-[#0b2d49]">{subValue}</span>
         </p>
       )}
    </div>
  </div>
);

const EventRow = ({ name, source, status, date, revenue }) => (
  <tr className="group hover:bg-[#f8fafc] transition-colors border-b border-[#e9eff1] last:border-0 border-dashed">
    <td className="py-4 pl-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${buildInitialsStyle(source)}`}>
          {String(name || 'E').trim().charAt(0).toUpperCase() || 'E'}
        </div>
        <span className="text-sm font-bold text-[#0b2d49]">{name}</span>
      </div>
    </td>
    <td className="py-4">
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(status)}`}>
        {normalizeStatus(status)}
      </span>
    </td>
    <td className="py-4 text-sm text-[#5a5b44] font-medium">
      {date}
    </td>
    <td className="py-4 pr-4 text-right text-sm font-bold text-[#0b2d49] group-hover:text-[#d7a444] transition-colors">
      {revenue}
    </td>
  </tr>
);

export default AdminDashboard;