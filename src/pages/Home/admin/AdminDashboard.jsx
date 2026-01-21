import React from 'react';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Dashboard Header */}
      <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        
        <div className="flex items-center gap-4 flex-1 md:justify-end">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search analytics, events, or vendors..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<DollarSign size={24} className="text-emerald-600" />}
            iconBg="bg-emerald-100"
            label="Total Revenue"
            value="$128,430"
            trend="+12%"
            trendUp={true}
          />
          <StatCard 
            icon={<Calendar size={24} className="text-blue-600" />}
            iconBg="bg-blue-100"
            label="Active Events"
            value="42"
            trend="+5%"
            trendUp={true}
          />
          <StatCard 
            icon={<Users size={24} className="text-orange-600" />}
            iconBg="bg-orange-100"
            label="New Vendors"
            value="12"
            trend="~2%"
            trendUp={true}
            trendColor="text-orange-600 bg-orange-50"
          />
          <StatCard 
            icon={<TrendingUp size={24} className="text-teal-600" />}
            iconBg="bg-teal-100"
            label="Monthly Growth"
            value="14.5%"
            trend="+1.5%"
            trendUp={true}
          />
        </div>

        {/* Middle Section: Analytics & Vendor Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Analytics Chart Area */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
                <p className="text-sm text-gray-500">Monthly financial performance breakdown</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Last 6 Months
                <ChevronDown size={14} />
              </button>
            </div>
            
            {/* Smooth Curve Chart Mockup */}
            <div className="h-[280px] w-full relative flex items-end justify-between px-2 pt-10">
               {/* Grid Lines */}
               <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300 pointer-events-none pb-8 pl-0">
                  <div className="border-b border-dashed border-gray-100 w-full h-full"></div>
                  <div className="border-b border-dashed border-gray-100 w-full h-full"></div>
                  <div className="border-b border-dashed border-gray-100 w-full h-full"></div>
                  <div className="border-b border-dashed border-gray-100 w-full h-full"></div>
               </div>

               {/* SVG Curve */}
               <svg className="absolute inset-0 w-full h-full overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,80 C15,70 20,40 30,40 C40,40 50,60 60,60 C70,60 80,20 100,30 L100,100 L0,100 Z" 
                    fill="url(#gradient)" 
                  />
                  <path 
                    d="M0,80 C15,70 20,40 30,40 C40,40 50,60 60,60 C70,60 80,20 100,30" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Data Points */}
                  <circle cx="30" cy="40" r="2" fill="white" stroke="#10b981" strokeWidth="1" />
                  <circle cx="60" cy="62" r="2" fill="white" stroke="#10b981" strokeWidth="1" />
                  <circle cx="92" cy="28" r="2" fill="white" stroke="#10b981" strokeWidth="1" />
               </svg>

               {/* X Axis Labels */}
               <div className="w-full flex justify-between text-xs font-bold text-gray-400 mt-4 absolute bottom-0 left-0 px-2">
                 <span>JAN</span>
                 <span>FEB</span>
                 <span>MAR</span>
                 <span>APR</span>
                 <span>MAY</span>
                 <span>JUN</span>
               </div>
            </div>
          </div>

          {/* Vendor Health */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Vendor performance</h3>
              <p className="text-sm text-gray-500">Partner performance scores</p>
            </div>

            <div className="space-y-6 flex-1">
              <HealthBar label="Catering Elite" percentage={94} color="bg-emerald-500" />
              <HealthBar label="Global AV Systems" percentage={82} color="bg-emerald-500" />
              <HealthBar label="Urban Decor Ltd" percentage={68} color="bg-amber-500" />
            </div>

            <button className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 mt-6 group">
              View all vendors
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              See All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
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
                    initialBg="bg-teal-100 text-teal-700"
                    status="CONFIRMED"
                    statusStyle="bg-blue-100 text-blue-700"
                    date="Mar 12, 2024"
                    revenue="$12,400.00"
                 />
                 <EventRow 
                    name="Spring Music Festival"
                    initial="S"
                    initialBg="bg-orange-100 text-orange-700"
                    status="PENDING"
                    statusStyle="bg-amber-100 text-amber-700"
                    date="Mar 24, 2024"
                    revenue="$45,000.00"
                 />
                 <EventRow 
                    name="Tech Summit 2024"
                    initial="T"
                    initialBg="bg-emerald-100 text-emerald-700"
                    status="ACTIVE"
                    statusStyle="bg-emerald-100 text-emerald-700"
                    date="Apr 02, 2024"
                    revenue="$32,150.00"
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
const StatCard = ({ icon, iconBg, label, value, trend, trendUp, trendColor = "text-emerald-600 bg-emerald-50" }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md">
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
       <span className="text-sm font-medium text-gray-500">{label}</span>
       <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

const HealthBar = ({ label, percentage, color }) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <span className={`text-sm font-bold ${percentage > 80 ? 'text-emerald-600' : 'text-amber-500'}`}>{percentage}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${color}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

const EventRow = ({ name, initial, initialBg, status, statusStyle, date, revenue }) => (
  <tr className="group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 border-dashed">
    <td className="py-4 pl-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${initialBg}`}>
          {initial}
        </div>
        <span className="text-sm font-bold text-gray-900">{name}</span>
      </div>
    </td>
    <td className="py-4">
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyle}`}>
        {status}
      </span>
    </td>
    <td className="py-4 text-sm text-gray-500 font-medium">
      {date}
    </td>
    <td className="py-4 pr-4 text-right text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
      {revenue}
    </td>
  </tr>
);

export default AdminDashboard;