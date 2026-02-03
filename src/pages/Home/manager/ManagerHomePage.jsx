import React from "react";
import {
	MdTrendingUp,
	MdChatBubbleOutline,
	MdGavel,
	MdAttachMoney,
	MdSensors,
	MdWarning,
} from "react-icons/md";

const ManagerHomePage = () => {
	// Mock Data for specific Date/Time to match design
	const currentDate = "October 24, 2023 • 09:41 AM";
	const title = "Dashboard Overview";

	const statsData = [
		{
			id: 1,
			label: "New Requests",
			value: "12",
			subtext: "+2 this hour",
			subtextColor: "text-green-500",
			topIcon: <div className="p-1 rounded bg-teal-50 text-teal-600"><div className="w-4 h-4 border-2 border-current rounded-sm"></div></div>,
			subtextIcon: <MdTrendingUp className="text-green-500" />,
		},
		{
			id: 2,
			label: "Vendor Replies",
			value: "5",
			subtext: "Awaiting Review",
			subtextColor: "text-gray-500",
			topIcon: <div className="p-1.5 rounded bg-teal-50 text-teal-600"><MdChatBubbleOutline className="text-lg" /></div>
		},
		{
			id: 3,
			label: "User Decisions",
			value: "3",
			subtext: "Needs Attention",
			subtextColor: "text-orange-500",
			topIcon: <div className="p-1.5 rounded bg-teal-50 text-teal-600"><MdGavel className="text-lg" /></div>
		},
		{
			id: 4,
			label: "Unpaid Invoices",
			value: "$2.4k",
			subtext: "3 Overdue",
			subtextColor: "text-red-500",
			topIcon: <div className="p-1.5 rounded bg-teal-50 text-teal-600"><MdAttachMoney className="text-lg" /></div>
		},
		{
			id: 5,
			label: "Today's Live",
			value: "2",
			subtext: "Operational",
			subtextColor: "text-green-500",
			topIcon: <div className="p-1.5 rounded bg-teal-50 text-teal-600"><MdSensors className="text-lg" /></div>
		}
	];

	const eventsData = [
		{
			id: 1,
			title: "Alpha Tech Conf",
			dateLines: ["Oct 24, 2023", "San Francisco"],
			status: "Planning",
			statusColor: "bg-teal-600",
			image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
		{
			id: 2,
			title: "Johnson Wedding",
			dateLines: ["Nov 12, 2023", "Austin, TX"],
			status: "Finalizing",
			statusColor: "bg-amber-500",
			image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
		{
			id: 3,
			title: "Neon Music Fest",
			dateLines: ["Oct 24-26, 2023", "Miami, FL"],
			status: "Live Now",
			statusColor: "bg-green-600",
			image: "https://images.unsplash.com/photo-1459749411177-0473ef7161cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
		{
			id: 4,
			title: "Global Summit",
			dateLines: ["Dec 05, 2023", "London, UK"],
			status: "Review",
			statusColor: "bg-purple-600",
			image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
		{
			id: 5,
			title: "DevOps Connect",
			dateLines: ["Dec 10, 2023", "Seattle, WA"],
			status: "Planning",
			statusColor: "bg-teal-600",
			image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
		{
			id: 6,
			title: "Winter Gala",
			dateLines: ["Dec 15, 2023", "New York, NY"],
			status: "Finalizing",
			statusColor: "bg-amber-500",
			image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
		{
			id: 7,
			title: "Indie Rock Expo",
			dateLines: ["Oct 25, 2023", "Austin, TX"],
			status: "Live Now",
			statusColor: "bg-green-600",
			image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
		{
			id: 8,
			title: "Tech Leaders Retreat",
			dateLines: ["Jan 10, 2024", "Denver, CO"],
			status: "Review",
			statusColor: "bg-purple-600",
			image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
		},
	];

	return (
		<div className="px-6 py-6 pb-2 space-y-6">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-text-main tracking-tight">
						{title}
					</h2>
					<p className="text-text-muted text-sm mt-1">{currentDate}</p>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				{statsData.map((stat) => (
					<div
						key={stat.id}
						className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-[130px]"
					>
						<div className="flex justify-between items-start">
							<span className="text-gray-500 text-sm font-medium">{stat.label}</span>
							{stat.topIcon}
						</div>
						<div>
							<h3 className="text-3xl font-bold text-gray-800 tracking-tight">{stat.value}</h3>
							<div className={`flex items-center gap-1 text-xs mt-1 ${stat.subtextColor}`}>
								{stat.subtextIcon && <span className="text-sm">{stat.subtextIcon}</span>}
								<span className="font-medium">{stat.subtext}</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Alert Banner */}
			<div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-start gap-4">
					<div className="p-2 bg-red-50 rounded-full shrink-0">
						<MdWarning className="text-red-400 text-xl" />
					</div>
					<div>
						<h3 className="text-gray-900 font-bold mb-0.5">Urgent Alert: Deposit Overdue</h3>
						<p className="text-gray-500 text-sm">Catering deposit for 'Smith Wedding' is 2 days overdue. Immediate action required.</p>
					</div>
				</div>
				<button className="bg-[#D96C55] hover:bg-[#c55b46] text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors shrink-0">
					Resolve Now
				</button>
			</div>

			{/* Active Events Header */}
			<div className="flex justify-between items-center pt-2">
				<h3 className="text-lg font-bold text-gray-800">Active Events</h3>
				<button className="text-teal-600 text-sm font-semibold hover:text-teal-700">View All</button>
			</div>

			{/* Active Events Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
				{eventsData.map((event) => (
					<div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
						{/* Image Container */}
						<div className="h-40 bg-gray-200 relative overflow-hidden">
							<img
								src={event.image}
								alt={event.title}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							/>
							<div className="absolute top-3 right-3">
								<span className={`${event.statusColor} text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm tracking-wide`}>
									{event.status}
								</span>
							</div>
						</div>

						{/* Content */}
						<div className="p-4 flex flex-col flex-1">
							<h4 className="font-bold text-gray-900 text-lg mb-1">{event.title}</h4>
							<div className="text-gray-500 text-sm mb-4">
								{event.dateLines.map((line, idx) => (
									<span key={idx}>
										{line}{idx < event.dateLines.length - 1 ? " • " : ""}
									</span>
								))}
							</div>

							<div className="mt-auto">
								<button className="w-full bg-[#279B78] hover:bg-[#208264] text-white font-medium py-2 rounded-lg transition-colors text-sm shadow-sm">
									Manage Event
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

		</div>
	);
};

export default ManagerHomePage;
