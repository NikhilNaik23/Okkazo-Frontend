import React, { useState } from "react";
import {
	MdTrendingUp,
	MdChatBubbleOutline,
	MdGavel,
	MdAttachMoney,
	MdSensors,
	MdWarning,
	MdCheckCircle,
	MdAccessTime,
	MdCalendarMonth,
	MdArrowForward,
	MdNotifications
} from "react-icons/md";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronRight, MoreHorizontal, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const ManagerHomePage = () => {
	const [currentTime, setCurrentTime] = useState(new Date());

	React.useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const formattedDate = currentTime.toLocaleDateString('en-IN', {
		day: 'numeric', month: 'long', year: 'numeric'
	});
	const formattedTime = currentTime.toLocaleTimeString('en-IN', {
		hour: '2-digit', minute: '2-digit'
	});

	// Mock Data
	const title = "Dashboard Overview";

	const chartData = [
		{ name: 'Mon', revenue: 4000, active: 24 },
		{ name: 'Tue', revenue: 3000, active: 18 },
		{ name: 'Wed', revenue: 5000, active: 30 },
		{ name: 'Thu', revenue: 2780, active: 20 },
		{ name: 'Fri', revenue: 1890, active: 28 },
		{ name: 'Sat', revenue: 2390, active: 35 },
		{ name: 'Sun', revenue: 3490, active: 32 },
	];

	const pieData = [
		{ name: 'Weddings', value: 400 },
		{ name: 'Corporate', value: 300 },
		{ name: 'Festivals', value: 300 },
		{ name: 'Other', value: 200 },
	];
	const COLORS = ['#14b8a6', '#f59e0b', '#f43f5e', '#6366f1'];

	const pendingTasks = [
		{ id: 1, title: "Vendor Application: 'Catering Co.'", type: "Approval", priority: "High" },
		{ id: 2, title: "Sign Contract: 'Tech Summit'", type: "Action", priority: "Medium" },
		{ id: 3, title: "Refund Request: #9921", type: "Finance", priority: "Urgent" },
	];

	const recentActivity = [
		{ id: 1, user: "Sarah Smith", action: "Paid invoice #1024", time: "2 min ago", type: "finance" },
		{ id: 2, user: "John Doe", action: "Commented on 'Gala'", time: "15 min ago", type: "comment" },
		{ id: 3, user: "System", action: "New vendor registered", time: "1 hr ago", type: "system" },
		{ id: 4, user: "Mike Ross", action: "Updated event details", time: "2 hrs ago", type: "edit" },
	];

	const statsData = [
		{
			id: 1,
			label: "New Requests",
			value: "12",
			subtext: "+2 this hour",
			subtextColor: "text-emerald-500",
			topIcon: <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><div className="w-5 h-5 border-2 border-current rounded-sm"></div></div>,
			subtextIcon: <MdTrendingUp />,
		},
		{
			id: 2,
			label: "Vendor Replies",
			value: "5",
			subtext: "Awaiting Review",
			subtextColor: "text-gray-500",
			topIcon: <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><MdChatBubbleOutline className="text-xl" /></div>
		},
		{
			id: 3,
			label: "User Decisions",
			value: "3",
			subtext: "Needs Attention",
			subtextColor: "text-amber-500",
			topIcon: <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><MdGavel className="text-xl" /></div>
		},
		{
			id: 4,
			label: "Unpaid Invoices",
			value: "₹2.4k",
			subtext: "3 Overdue",
			subtextColor: "text-rose-500",
			topIcon: <div className="p-2 rounded-lg bg-rose-50 text-rose-600"><MdAttachMoney className="text-xl" /></div>
		},
		{
			id: 5,
			label: "Today's Live",
			value: "2",
			subtext: "Operational",
			subtextColor: "text-green-500",
			topIcon: <div className="p-2 rounded-lg bg-green-50 text-green-600"><MdSensors className="text-xl" /></div>
		}
	];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	return (
		<div className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto min-h-screen">
			{/* Header Section */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="flex flex-col sm:flex-row sm:items-center justify-between"
			>
				<div>
					<h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
						{title}
					</h2>
					<p className="text-gray-500 font-medium mt-1">{formattedDate} • {formattedTime}</p>
				</div>
				<div className="flex items-center gap-4 mt-4 sm:mt-0">
					<button className="p-2 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm relative">
						<MdNotifications className="text-xl" />
						<span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
					</button>
					<div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
						<div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">MK</div>
						<span className="text-sm font-bold text-gray-700">Manager Account</span>
					</div>
				</div>
			</motion.div>

			{/* Stats Grid */}
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
			>
				{statsData.map((stat) => (
					<motion.div
						key={stat.id}
						variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
						whileHover={{ y: -5 }}
						className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-[130px] relative overflow-hidden group"
					>
						<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
							{stat.topIcon}
						</div>
						<div className="flex justify-between items-start z-10">
							<span className="text-gray-500 text-xs font-bold uppercase tracking-wide">{stat.label}</span>
							{stat.topIcon}
						</div>
						<div className="z-10 mt-auto">
							<h3 className="text-3xl font-extrabold text-gray-800 tracking-tight">{stat.value}</h3>
							<div className={`flex items-center gap-1.5 text-xs mt-1 font-medium ${stat.subtextColor}`}>
								{stat.subtextIcon && <span className="text-sm">{stat.subtextIcon}</span>}
								<span>{stat.subtext}</span>
							</div>
						</div>
					</motion.div>
				))}
			</motion.div>

			{/* Main Content Layout */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

				{/* LEFT COLUMN (2/3) */}
				<div className="xl:col-span-2 space-y-8">

					{/* Action Center - Quick Tasks */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
					>
						<div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
							<h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
								<MdCheckCircle className="text-teal-500" /> Action Center
							</h3>
							<span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">3 Pending</span>
						</div>
						<div className="divide-y divide-gray-50">
							{pendingTasks.map((task) => (
								<div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
									<div className="flex items-center gap-4">
										<div className={`w-2 h-2 rounded-full ${task.priority === 'Urgent' ? 'bg-red-500' : task.priority === 'High' ? 'bg-amber-500' : 'bg-blue-500'}`} />
										<div>
											<p className="font-bold text-gray-800 text-sm">{task.title}</p>
											<p className="text-xs text-gray-500 font-medium">{task.type} • {task.priority} Priority</p>
										</div>
									</div>
									<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<button className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Details</button>
										<button className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm">Resolve</button>
									</div>
								</div>
							))}
						</div>
					</motion.div>

					{/* Revenue & Distribution Charts */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
							className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
						>
							<h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trends</h3>
							<div className="h-[250px] w-full">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
										<defs>
											<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1} />
												<stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
										<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
										<Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
										<Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
							className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
						>
							<h3 className="text-lg font-bold text-gray-900 mb-4">Event Distribution</h3>
							<div className="h-[250px] w-full relative">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={pieData}
											cx="50%"
											cy="50%"
											innerRadius={60}
											outerRadius={80}
											paddingAngle={5}
											dataKey="value"
											isAnimationActive={false}
										>
											{pieData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
											))}
										</Pie>
										<Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
									</PieChart>
								</ResponsiveContainer>
								<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
									<div className="text-center">
										<span className="block text-3xl font-bold text-gray-800">1200</span>
										<span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</span>
									</div>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Alert Banner */}
					<div className="bg-gradient-to-r from-red-50 to-white rounded-2xl p-1 shadow-sm border border-red-100">
						<div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0 animate-pulse">
									<MdWarning className="text-xl" />
								</div>
								<div>
									<h3 className="text-gray-900 font-bold text-sm">Urgent: Deposit Overdue</h3>
									<p className="text-gray-500 text-xs font-medium">Catering deposit for 'Smith Wedding' is 2 days overdue.</p>
								</div>
							</div>
							<button className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-xs transition-colors border border-red-200">
								View Details
							</button>
						</div>
					</div>

					{/* Active Events Teaser */}
					<div>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold text-gray-900">Active Events</h3>
							<button className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
								View All <MdArrowForward />
							</button>
						</div>
						{/* Placeholder for Event Cards - reusing the logic or component would go here */}
						<div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
							<p className="text-gray-400 font-medium">Event Grid Component Rendered Here</p>
						</div>
					</div>

				</div>

				{/* RIGHT COLUMN (1/3) */}
				<div className="space-y-6">

					{/* Mini Calendar Widget */}
					{/* Mini Calendar Widget */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.4 }}
						className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
					>
						<div className="flex justify-between items-center mb-6">
							<h3 className="font-bold text-gray-800">
								{currentTime.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
							</h3>
							<div className="flex gap-2">
								<button className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><ChevronRight className="rotate-180 w-4 h-4" /></button>
								<button className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><ChevronRight className="w-4 h-4" /></button>
							</div>
						</div>
						<div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400">
							<span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
						</div>
						<div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600">
							{/* Dynamic Calendar Days */}
							{(() => {
								const year = currentTime.getFullYear();
								const month = currentTime.getMonth();
								const daysInMonth = new Date(year, month + 1, 0).getDate();
								const firstDay = new Date(year, month, 1).getDay();
								const days = [];

								// Empty slots for previous month
								for (let i = 0; i < firstDay; i++) {
									days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
								}

								// Days of the current month
								for (let i = 1; i <= daysInMonth; i++) {
									const isToday = i === currentTime.getDate();
									// Mock event logic: random days have events
									const hasEvent = (i * 7) % 5 === 0 || i === 12;

									days.push(
										<div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-lg relative cursor-pointer hover:bg-gray-50 transition-colors ${isToday ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30' : ''}`}>
											<span>{i}</span>
											{hasEvent && !isToday && <span className="absolute bottom-1.5 w-1 h-1 bg-teal-500 rounded-full" />}
										</div>
									);
								}
								return days;
							})()}
						</div>
					</motion.div>

					{/* Goal Tracker Widget */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.5 }}
						className="bg-teal-900 rounded-2xl p-6 text-white shadow-lg shadow-teal-900/20 relative overflow-hidden"
					>
						{/* Background Decor */}
						<div className="absolute top-0 right-0 w-32 h-32 bg-teal-800 rounded-full translate-x-10 -translate-y-10 opacity-50" />

						<h3 className="font-bold text-teal-100 mb-1">Monthly Goal</h3>
						<p className="text-3xl font-extrabold mb-6">₹24,500 <span className="text-sm font-medium text-teal-300">/ ₹30k</span></p>

						{/* Progress Bar */}
						<div className="w-full bg-teal-800/50 rounded-full h-3 mb-2">
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: "82%" }}
								transition={{ duration: 1, delay: 0.8 }}
								className="bg-teal-400 h-3 rounded-full shadow-[0_0_12px_rgba(45,212,191,0.5)]"
							/>
						</div>
						<p className="text-right text-xs font-bold text-teal-300">82% Achieved</p>
					</motion.div>

					{/* Recent Activity Feed */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.6 }}
						className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
					>
						<div className="flex justify-between items-center mb-6">
							<h3 className="font-bold text-gray-800">Recent Activity</h3>
							<button className="text-gray-400 hover:text-teal-600"><MoreHorizontal className="w-5 h-5" /></button>
						</div>
						<div className="space-y-6">
							{recentActivity.map((activity, idx) => (
								<div key={activity.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-gray-200 before:rounded-full">
									{idx !== recentActivity.length - 1 && <div className="absolute left-[3px] top-4 bottom-[-24px] w-[1px] bg-gray-100" />}
									<p className="text-sm text-gray-800"><span className="font-bold">{activity.user}</span> {activity.action}</p>
									<span className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
										<Clock className="w-3 h-3" /> {activity.time}
									</span>
								</div>
							))}
						</div>
						<button className="w-full mt-4 py-2 text-xs font-bold text-gray-500 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
							View All History
						</button>
					</motion.div>

				</div>
			</div>
		</div>
	);
};

export default ManagerHomePage;
