import React, { useState } from 'react';
import {
    BarChart3, TrendingUp, Users, Calendar, ArrowUpRight,
    ArrowDownRight, DollarSign, Download, Share2, Filter,
    MoreHorizontal, Activity, Target
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Sector, LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';

// --- Custom Components ---

const BentoCard = ({ children, className = "", title, icon: Icon, action }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all ${className}`}
    >
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
                {Icon && <div className="p-2 bg-gray-50 text-gray-600 rounded-xl"><Icon className="w-5 h-5" /></div>}
                {title && <h3 className="font-bold text-gray-900 text-lg">{title}</h3>}
            </div>
            {action && <button className="text-gray-400 hover:text-gray-900 transition-colors">{action}</button>}
        </div>
        {children}
    </motion.div>
);

const MetricPill = ({ label, value, trend, positive }) => (
    <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
        <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-extrabold text-gray-900 leading-none">{value}</span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trend}
            </span>
        </div>
    </div>
);

// --- Main Analytics Component ---

const ManagerAnalytics = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Mock Data
    const revenueData = [
        { name: 'Jan', revenue: 42000, expenses: 30000 },
        { name: 'Feb', revenue: 38000, expenses: 28000 },
        { name: 'Mar', revenue: 55000, expenses: 35000 },
        { name: 'Apr', revenue: 48000, expenses: 32000 },
        { name: 'May', revenue: 62000, expenses: 40000 },
        { name: 'Jun', revenue: 75000, expenses: 45000 },
        { name: 'Jul', revenue: 82000, expenses: 48000 },
        { name: 'Aug', revenue: 78000, expenses: 46000 },
        { name: 'Sep', revenue: 95000, expenses: 55000 },
        { name: 'Oct', revenue: 88000, expenses: 52000 },
        { name: 'Nov', revenue: 105000, expenses: 60000 },
        { name: 'Dec', revenue: 120000, expenses: 70000 },
    ];

    const categoryData = [
        { name: 'Weddings', value: 45, color: '#0d9488' }, // teal-600
        { name: 'Corp', value: 30, color: '#f59e0b' },     // amber-500
        { name: 'Social', value: 15, color: '#db2777' },    // pink-600
        { name: 'Other', value: 10, color: '#6366f1' },     // indigo-500
    ];

    const onPieEnter = (_, index) => setActiveIndex(index);

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 max-w-[1920px] mx-auto">

            {/* 1. Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Performance</h1>
                    <p className="text-gray-500 font-medium text-lg">Real-time insights across all your events and vendors.</p>
                </div>

                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                        All Time
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                        Year to Date
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                        Last 30 Days
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-2"></div>
                    <button className="p-2 text-gray-500 hover:text-teal-600 rounded-lg">
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-teal-700 shadow-lg shadow-teal-900/20">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {/* 2. Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">

                {/* A. Key Metrics (Top Row) */}
                <BentoCard className="xl:col-span-1" title="Total Revenue" icon={DollarSign}>
                    <div className="mt-2">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">₹8.5M</h2>
                        <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-4 h-4" /> +12.5% <span className="text-gray-400 font-medium">vs last year</span>
                        </div>
                    </div>
                    <div className="h-16 mt-8 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData.slice(6)}>
                                <defs>
                                    <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2} fill="url(#miniGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </BentoCard>

                <BentoCard className="xl:col-span-1" title="Active Vendors" icon={Users}>
                    <div className="mt-2 text-center relative py-6">
                        <div className="relative inline-block">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                                <circle cx="64" cy="64" r="56" stroke="#14b8a6" strokeWidth="8" fill="none" strokeDasharray="351" strokeDashoffset="70" />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="block text-3xl font-extrabold text-gray-900">84</span>
                                <span className="text-xs font-bold text-gray-400 uppercase">Active</span>
                            </div>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard className="xl:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none" title="Upcoming Highlights" icon={Target} action={<MoreHorizontal className="text-gray-400" />}>
                    <div className="grid grid-cols-3 gap-6 mt-4">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Next Big Event</p>
                            <p className="text-lg font-bold text-white truncate">Tech Summit '24</p>
                            <p className="text-sm text-teal-400 font-medium mt-1">In 12 Days</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pending Invoices</p>
                            <p className="text-lg font-bold text-white">₹45,200</p>
                            <p className="text-sm text-amber-400 font-medium mt-1">3 Overdue</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/20 transition-colors">
                            <div className="bg-teal-500 rounded-full p-2 mb-2 text-white shadow-lg shadow-teal-500/30">
                                <ArrowUpRight className="w-5 h-5 block" />
                            </div>
                            <p className="text-xs font-bold">View Reports</p>
                        </div>
                    </div>
                </BentoCard>

                {/* B. Main Charts (Middle Row) */}
                <BentoCard className="xl:col-span-3 xl:row-span-2" title="Financial Overview" icon={TrendingUp} action={
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Revenue</span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Expenses</span>
                    </div>
                }>
                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="expenses" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </BentoCard>

                <BentoCard className="xl:col-span-1 xl:row-span-2" title="Event Distribution" icon={Activity}>
                    <div className="h-[250px] w-full relative mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={props => {
                                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
                                        return (
                                            <g>
                                                <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#111827" className="text-xl font-bold">{payload.value}%</text>
                                                <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#9ca3af" className="text-xs font-bold uppercase">{payload.name}</text>
                                                <Sector
                                                    cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
                                                    startAngle={startAngle} endAngle={endAngle} fill={fill}
                                                />
                                            </g>
                                        );
                                    }}
                                    data={categoryData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    paddingAngle={5}
                                    cornerRadius={5}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4 mt-6">
                        {categoryData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                </div>
                                <span className="font-bold text-gray-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </BentoCard>
            </div>
        </div>
    );
};

export default ManagerAnalytics;
