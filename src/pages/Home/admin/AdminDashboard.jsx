import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  ChevronRight,
  ChevronDown,
  IndianRupee
} from 'lucide-react';

import {
  fetchFeesConfig,
  updateFeesConfig,
  selectFeesError,
  selectFeesStatus,
  selectPlatformFee,
  selectServiceChargePercent,
} from '../../../store/slices/feesSlice';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const platformFee = useSelector(selectPlatformFee);
  const serviceChargePercent = useSelector(selectServiceChargePercent);
  const feesStatus = useSelector(selectFeesStatus);
  const feesError = useSelector(selectFeesError);

  // Draft inputs: when undefined, the UI falls back to the latest store values.
  const [feeInput, setFeeInput] = useState(undefined);
  const [serviceInput, setServiceInput] = useState(undefined);

  useEffect(() => {
    if (feesStatus === 'idle') {
      dispatch(fetchFeesConfig());
    }
  }, [dispatch, feesStatus]);

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<IndianRupee size={24} className="text-[#d7a444]" />}
            iconBg="bg-[#f3ddb1]/30"
            label="Total Revenue"
            value="₹1,28,430"
            trend="+12%"
            trendUp={true}
            onClick={() => navigate('/admin/ledger')}
          />
          <StatCard 
            icon={<Calendar size={24} className="text-[#0b2d49]" />}
            iconBg="bg-[#0b2d49]/10"
            label="Active Events"
            value="42"
            trend="+5%"
            trendUp={true}
          />
          <StatCard 
            icon={<Users size={24} className="text-[#5a5b44]" />}
            iconBg="bg-[#5a5b44]/10"
            label="New Vendors"
            value="12"
            trend="~2%"
            trendUp={true}
            trendColor="text-[#5a5b44] bg-[#5a5b44]/10"
          />
          <StatCard 
            icon={<TrendingUp size={24} className="text-[#708aa0]" />}
            iconBg="bg-[#708aa0]/10"
            label="Monthly Growth"
            value="14.5%"
            trend="+1.5%"
            trendUp={true}
          />
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
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] text-[#5a5b44] text-xs font-semibold rounded-lg hover:bg-[#e9eff1] transition-colors">
                Last 6 Months
                <ChevronDown size={14} />
              </button>
            </div>
            
            {/* Smooth Curve Chart Mockup */}
            <div className="h-[280px] w-full relative flex items-end justify-between px-2 pt-10">
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
                  <path 
                    d="M0,80 C15,70 20,40 30,40 C40,40 50,60 60,60 C70,60 80,20 100,30 L100,100 L0,100 Z" 
                    fill="url(#gradient)" 
                  />
                  <path 
                    d="M0,80 C15,70 20,40 30,40 C40,40 50,60 60,60 C70,60 80,20 100,30" 
                    fill="none" 
                    stroke="#d7a444" 
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Data Points */}
                  <circle cx="30" cy="40" r="2" fill="white" stroke="#d7a444" strokeWidth="1" />
                  <circle cx="60" cy="62" r="2" fill="white" stroke="#d7a444" strokeWidth="1" />
                  <circle cx="92" cy="28" r="2" fill="white" stroke="#d7a444" strokeWidth="1" />
               </svg>

               {/* X Axis Labels */}
               <div className="w-full flex justify-between text-xs font-bold text-[#708aa0] mt-4 absolute bottom-0 left-0 px-2">
                 <span>JAN</span>
                 <span>FEB</span>
                 <span>MAR</span>
                 <span>APR</span>
                 <span>MAY</span>
                 <span>JUN</span>
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
                 <EventRow 
                    name="Corporate Gala 2024"
                    initial="C"
                    initialBg="bg-[#0b2d49]/10 text-[#0b2d49]"
                    status="CONFIRMED"
                    statusStyle="bg-[#0b2d49]/10 text-[#0b2d49]"
                    date="Mar 12, 2024"
                    revenue="₹12,400.00"
                 />
                 <EventRow 
                    name="Spring Music Festival"
                    initial="S"
                    initialBg="bg-[#d7a444]/10 text-[#d7a444]"
                    status="PENDING"
                    statusStyle="bg-[#f3ddb1] text-[#5a5b44]"
                    date="Mar 24, 2024"
                    revenue="₹45,000.00"
                 />
                 <EventRow 
                    name="Tech Summit 2024"
                    initial="T"
                    initialBg="bg-[#0b2d49]/10 text-[#0b2d49]"
                    status="ACTIVE"
                    statusStyle="bg-[#0b2d49]/10 text-[#0b2d49]"
                    date="Apr 02, 2024"
                    revenue="₹32,150.00"
                 />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, iconBg, label, value, trend, trendUp, onClick, trendColor = "text-[#d7a444] bg-[#f3ddb1]/30" }) => (
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
    </div>
  </div>
);

const EventRow = ({ name, initial, initialBg, status, statusStyle, date, revenue }) => (
  <tr className="group hover:bg-[#f8fafc] transition-colors border-b border-[#e9eff1] last:border-0 border-dashed">
    <td className="py-4 pl-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${initialBg}`}>
          {initial}
        </div>
        <span className="text-sm font-bold text-[#0b2d49]">{name}</span>
      </div>
    </td>
    <td className="py-4">
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyle}`}>
        {status}
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