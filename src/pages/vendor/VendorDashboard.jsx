import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BsCashStack,
    BsCalendarCheck,
    BsClock,
    BsCheckCircleFill,
    BsChatDots,
    BsGrid,
    BsBoxArrowUpRight
} from "react-icons/bs";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { toast } from "react-hot-toast";
import {
    revenueData as importedRevenueData,
    vendorDashboardStats,
    servicePerformance,
    recentActivity,
    upcomingConsultations
} from "../../data/vendorDashboardData";
import VendorAvailabilityCalendar from "../../components/Global/VendorAvailabilityCalendar";

const VendorDashboard = () => {
    const navigate = useNavigate();
    const revenueData = importedRevenueData;

    const [timeRange, setTimeRange] = useState("Last 6 Months");
    const [dashboardData] = useState({
        stats: vendorDashboardStats,
        servicePerformance: servicePerformance,
        recentActivity: recentActivity,
        upcomingConsultations: upcomingConsultations
    });

    const handleRangeChange = (e) => {
        setTimeRange(e.target.value);
        toast.success(`Data updated for ${e.target.value}`, {
            icon: '📊',
            style: { borderRadius: '16px', background: '#0b2d49', color: '#fff' }
        });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black mb-10 tracking-tight">Dashboard Overview</h1>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* Stats Section */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div 
                        onClick={() => navigate("/vendor/dashboard/ledger")}
                        className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5 hover:shadow-xl hover:shadow-[#0b2d49]/5 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-[#d7a444]/10 text-[#d7a444] rounded-2xl group-hover:scale-110 transition-transform">
                                <BsCashStack size={24} />
                            </div>
                            <span className="text-xs font-bold text-[#d7a444] px-2 py-1 bg-[#d7a444]/10 rounded-lg">{dashboardData.stats.totalRevenue.change}</span>
                        </div>
                        <p className="text-sm font-bold text-[#5a5b44] mb-2 uppercase tracking-widest leading-none">Total Revenue</p>
                        <p className="text-3xl font-black tracking-tight">{dashboardData.stats.totalRevenue.value}</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5 hover:shadow-xl hover:shadow-[#0b2d49]/5 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-[#0b2d49]/10 text-[#0b2d49] rounded-2xl group-hover:scale-110 transition-transform">
                                <BsCalendarCheck size={24} />
                            </div>
                            <span className="text-xs font-bold text-[#0b2d49] px-2 py-1 bg-[#0b2d49]/10 rounded-lg">{dashboardData.stats.activeBookings.status}</span>
                        </div>
                        <p className="text-sm font-bold text-[#5a5b44] mb-2 uppercase tracking-widest leading-none">Active Bookings</p>
                        <p className="text-3xl font-black tracking-tight">{dashboardData.stats.activeBookings.value}</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5 hover:shadow-xl hover:shadow-[#0b2d49]/5 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-[#d0a862]/10 text-[#d0a862] rounded-2xl group-hover:scale-110 transition-transform">
                                <BsClock size={24} />
                            </div>
                            <span className="text-xs font-bold text-red-500 px-2 py-1 bg-red-50 rounded-lg uppercase">{dashboardData.stats.pendingRequests.priority}</span>
                        </div>
                        <p className="text-sm font-bold text-[#5a5b44] mb-2 uppercase tracking-widest leading-none">Pending Requests</p>
                        <p className="text-3xl font-black tracking-tight">{dashboardData.stats.pendingRequests.value}</p>
                    </div>
                </div>

                {/* Revenue Overview Chart */}
                <div className="col-span-12 lg:col-span-7 bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black">Revenue Overview</h3>
                        <select
                            value={timeRange}
                            onChange={handleRangeChange}
                            className="bg-[#e9eff1] border-none rounded-xl px-4 py-2 text-sm font-bold text-[#0b2d49] focus:ring-0 cursor-pointer"
                        >
                            <option>Last 3 Months</option>
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                key={timeRange}
                                data={revenueData[timeRange]}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0b2d49" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0b2d49" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eff1" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#708aa0', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#0b2d49"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vendor Availability Calendar */}
                <div className="col-span-12 lg:col-span-5">
                    <VendorAvailabilityCalendar compact />
                </div>

                {/* Recent Activity */}
                <div className="col-span-12 lg:col-span-7 bg-white rounded-[2rem] shadow-sm border border-[#708aa0]/5 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-black">Recent Activity & Events</h3>
                        <button
                            onClick={() => toast("Redirecting to all activity...")}
                            className="text-[#d7a444] font-bold text-sm hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {dashboardData.recentActivity.map((activity) => (
                            <div key={activity.id} className="p-8 flex items-start justify-between group hover:bg-[#e9eff1]/30 transition-all cursor-pointer">
                                <div className="flex gap-6">
                                    <div className={`p-4 rounded-2xl ${activity.type === 'booking' ? 'bg-[#0b2d49]/10 text-[#0b2d49]' : 'bg-[#d7a444]/10 text-[#d7a444]'}`}>
                                        <BsCheckCircleFill size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-black text-[#0b2d49]">{activity.title}</h4>
                                            {activity.status && (
                                                <span className="text-[10px] font-bold bg-[#d7a444]/10 text-[#d7a444] px-2 py-0.5 rounded-lg">{activity.status}</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#5a5b44] font-medium mb-3">{activity.details}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-[#708aa0] font-bold uppercase tracking-widest leading-none">
                                            <BsClock /> {activity.time}
                                        </div>
                                    </div>
                                </div>
                                {['booking', 'success'].includes(activity.type) && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/vendor/event/${activity.id}/chat`); }}
                                        className="flex items-center gap-2 px-6 py-3 bg-[#0b2d49] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all"
                                    >
                                        <BsChatDots /> Chat with Manager
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Service Performance */}
                <div className="col-span-12 lg:col-span-5 self-start bg-white p-8 rounded-[2rem] shadow-sm border border-[#708aa0]/5">
                    <h3 className="text-xl font-black mb-8">Service Performance</h3>
                    <div className="space-y-8">
                        {dashboardData.servicePerformance.map((service, idx) => (
                            <div key={idx} className="group cursor-default">
                                <div className="flex justify-between mb-3 transition-transform group-hover:translate-x-1">
                                    <span className="text-sm font-bold text-[#0b2d49]">{service.name}</span>
                                    <span className="text-sm font-black text-[#0b2d49]">{service.percentage}%</span>
                                </div>
                                <div className="h-2 bg-[#e9eff1] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 shadow-sm"
                                        style={{ width: `${service.percentage}%`, backgroundColor: service.color }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
