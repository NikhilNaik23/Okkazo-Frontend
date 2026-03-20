import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { BsArrowLeft, BsFileEarmarkPdf, BsDownload, BsCheckCircleFill, BsPersonCheckFill, BsFillChatSquareTextFill, BsGraphUp, BsWallet2, BsPersonVcardFill, BsThreeDotsVertical, BsSendFill, BsClockHistory, BsCalendarEvent, BsGeoAlt } from 'react-icons/bs';
import { promotedCampaigns } from '../../../data/myEventsDashboardData';

const API_BASE_URL = 'http://localhost:8080';

const EventCommandCenter = () => {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [activeTab, setActiveTab] = useState("command_center"); // command_center | manager_sync
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { id: 1, sender: "manager", text: "Hello! checking in on your event details.", time: "10:30 AM" },
        { id: 2, sender: "user", text: "Hi Siddharth, thanks for the quick assignment.", time: "10:32 AM" },
    ]);

    const [manager, setManager] = useState({
        name: "Siddharth Mehta",
        role: "Senior Operations Lead",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        status: "Online"
    });

    useEffect(() => {
        let cancelled = false;

        const toDisplayStatus = (status) => String(status || '').trim() || 'PENDING';
        const toDateTimeLabel = (schedule) => {
            const startAt = schedule?.startAt ? new Date(schedule.startAt) : null;
            if (!startAt || Number.isNaN(startAt.getTime())) return '—';
            return `${startAt.toLocaleDateString()} • ${startAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        };

        const load = async () => {
            // 1) Try local storage / static (legacy)
            const storedCampaigns = JSON.parse(localStorage.getItem('promoted_campaigns') || '[]');
            const found = storedCampaigns.find((c) => c.id === id) || promotedCampaigns.find((c) => c.id === id);

            if (found) {
                if (!cancelled) {
                    setCampaign({
                        ...found,
                        ticketsSold: found.ticketsSold !== undefined ? found.ticketsSold : 142,
                        totalTickets: found.totalTickets !== undefined ? found.totalTickets : 500,
                        revenueGenerated: found.revenueGenerated !== undefined ? found.revenueGenerated : (found.revenue === '-' ? 0 : 213000),
                        cost: found.cost !== undefined ? found.cost : 15000,
                        daysLeft: found.daysLeft !== undefined ? found.daysLeft : 12,
                        roadmap: found.roadmap || [
                            { step: 1, label: "Application Received", status: "completed", date: "Feb 18, 2026" },
                            { step: 2, label: "Manager Assigned", status: "completed", date: "Feb 19, 2026" },
                            { step: 3, label: "Application In Review", status: "in_progress", date: "Today" },
                            { step: 4, label: "Success / Live", status: "pending", date: "Estimation: Feb 20" }
                        ],
                        documents: found.documents || [
                            { name: "Venue_Permission_Letter.pdf", type: "application/pdf", size: "2.4 MB" },
                            { name: "Organizer_ID_Proof.jpg", type: "image/jpeg", size: "1.1 MB" }
                        ],
                        description: found.description || "Join us for an evening of innovation and networking as we explore the future of corporate strategies.",
                        location: found.location || "Business Park Conference Room, Mumbai",
                        date: found.date || "March 5, 2026 • 10:00 AM"
                    });
                }
                return;
            }

            // 2) Fetch from backend promote API by eventId
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('Please log in to view promote event details');
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/events/promote/${encodeURIComponent(String(id))}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json?.data) {
                toast.error(json?.message || 'Failed to load promote event');
                return;
            }

            const pr = json.data;

            const ticketType = String(pr?.tickets?.ticketType || '').toLowerCase();
            const isFreeEvent = ticketType === 'free';
            const totalTickets = typeof pr?.tickets?.noOfTickets === 'number' ? pr.tickets.noOfTickets : 0;

            const mapped = {
                id: pr?.eventId || String(id),
                title: pr?.eventTitle || 'Promote Event',
                status: toDisplayStatus(pr?.adminDecision?.status || pr?.eventStatus),
                location: pr?.venue?.locationName || 'Location TBD',
                date: toDateTimeLabel(pr?.schedule),
                description: pr?.eventDescription || '',
                revenue: isFreeEvent ? '-' : (typeof pr?.totalAmount === 'number' ? pr.totalAmount : '-'),
                cost: typeof pr?.platformFee === 'number' ? pr.platformFee : 0,
                revenueGenerated: typeof pr?.totalAmount === 'number' ? pr.totalAmount : 0,
                ticketsSold: typeof pr?.ticketAnalytics?.sold === 'number' ? pr.ticketAnalytics.sold : 0,
                totalTickets: totalTickets,
                roadmap: [
                    { step: 1, label: "Application Received", status: "completed", date: pr?.createdAt ? new Date(pr.createdAt).toLocaleDateString() : '—' },
                    { step: 2, label: "Manager Assigned", status: pr?.assignedManagerId ? 'completed' : 'pending', date: pr?.managerAssignment?.assignedAt ? new Date(pr.managerAssignment.assignedAt).toLocaleDateString() : '—' },
                    { step: 3, label: "Application In Review", status: String(pr?.adminDecision?.status || '').toUpperCase() === 'APPROVED' ? 'completed' : 'in_progress', date: pr?.adminDecision?.decidedAt ? new Date(pr.adminDecision.decidedAt).toLocaleDateString() : 'Today' },
                    { step: 4, label: "Success / Live", status: String(pr?.eventStatus || '').toUpperCase() === 'LIVE' ? 'completed' : 'pending', date: '—' },
                ],
                documents: Array.isArray(pr?.authenticityProofs)
                    ? pr.authenticityProofs
                        .filter((p) => p?.url)
                        .map((p) => ({ name: p.publicId || 'auth-proof', type: p.mimeType || 'image/*', size: p.sizeBytes ? `${Math.round(p.sizeBytes / (1024 * 1024) * 10) / 10} MB` : '—' }))
                    : [],
                bannerUrl: pr?.eventBanner?.url || null,
            };

            if (!cancelled) setCampaign(mapped);
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        setChatHistory([...chatHistory, { id: Date.now(), sender: "user", text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setChatMessage("");
        // Mock reply
        setTimeout(() => {
            setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: "manager", text: "Thanks for the update. I'm reviewing the documents now.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }, 2000);
    };

    if (!campaign) {
        return (
            <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center">
                <p className="font-serif-premium text-2xl text-[#09637E] italic animate-pulse">Initializing Command Center...</p>
            </div>
        );
    }

    const isFreeEvent = campaign.revenue === '-';
    const profitLoss = !isFreeEvent ? (campaign.revenueGenerated - campaign.cost) : 0;

    return (
        <div className="min-h-screen bg-[#EBF4F6] text-[#09637E] font-sans px-8 pb-8 pt-24 md:px-16 md:pb-16 md:pt-28">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <Link to="/user/dashboard" className="flex items-center gap-2 text-[#09637E]/60 hover:text-[#09637E] font-bold uppercase tracking-widest text-xs transition-colors">
                        <BsArrowLeft /> Back to My Events
                    </Link>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("command_center")}
                            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "command_center" ? "bg-[#09637E] text-white shadow-lg" : "bg-white text-[#09637E] hover:bg-[#09637E]/5"}`}
                        >
                            Command Center
                        </button>
                        <button
                            onClick={() => setActiveTab("manager_sync")}
                            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "manager_sync" ? "bg-[#09637E] text-white shadow-lg" : "bg-white text-[#09637E] hover:bg-[#09637E]/5"}`}
                        >
                            Manager Sync
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6 mb-12">
                    <h1 className="text-5xl md:text-7xl font-serif-premium text-[#09637E] italic">
                        {campaign.title}
                    </h1>
                    <span className="px-4 py-2 bg-[#EBF4F6] border border-[#09637E]/20 text-[#09637E] rounded-full text-[10px] font-black uppercase tracking-widest">
                        {campaign.status}
                    </span>
                </div>

                {activeTab === "command_center" && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Roadmap */}
                        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-[#09637E]/5 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-12">
                                <h3 className="text-2xl font-serif-premium italic text-[#09637E]">Event Planning Roadmap</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/60">Tracking Status: In Progress</span>
                            </div>

                            <div className="relative">
                                {/* Line */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#09637E]/10 -translate-y-1/2 z-0" />

                                <div className="grid grid-cols-4 relative z-10">
                                    {campaign.roadmap.map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center text-center group">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${step.status === 'completed' ? 'bg-[#09637E] text-white scale-110 shadow-lg' :
                                                step.status === 'in_progress' ? 'bg-white border-4 border-[#09637E] text-[#09637E] scale-125 shadow-xl' :
                                                    'bg-[#EBF4F6] text-[#09637E]/30'
                                                }`}>
                                                {step.status === 'completed' ? <BsCheckCircleFill size={20} /> :
                                                    step.status === 'in_progress' ? <div className="w-3 h-3 bg-[#09637E] rounded-full animate-pulse" /> :
                                                        <div className="w-3 h-3 bg-[#09637E]/20 rounded-full" />}
                                            </div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${step.status === 'pending' ? 'opacity-40' : 'text-[#09637E]'}`}>
                                                {idx + 1}. {step.label}
                                            </p>
                                            <p className="text-[9px] font-bold opacity-50">{step.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Asset Preview */}
                            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#09637E]/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] via-transparent to-transparent opacity-60 z-10" />
                                <img
                                    src={campaign.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80"}
                                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    alt="Event Banner"
                                />
                                <div className="relative z-20 h-full flex flex-col justify-end text-white p-4">
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest mb-4 w-fit">Minimal Banner</span>
                                    <h2 className="text-4xl font-serif-premium italic mb-2">{campaign.title}</h2>
                                    <div className="flex items-center gap-4 text-xs font-medium opacity-90">
                                        <span className="flex items-center gap-2"><BsCalendarEvent /> {campaign.date}</span>
                                        <span className="flex items-center gap-2"><BsGeoAlt /> {campaign.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics / Highlights */}
                            <div className="space-y-6">
                                {/* Manager Card Small */}
                                <div className="bg-[#09637E] text-white rounded-[2.5rem] p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#fff]/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <BsFillChatSquareTextFill size={24} className="mb-6 opacity-80" />
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Consultation</p>
                                    <h3 className="text-2xl font-serif-premium italic mb-4">Manager Connected</h3>
                                    <p className="text-xs opacity-80 mb-6 leading-relaxed">
                                        {manager.name} is assigned to your event. Sync up for strategy and execution details.
                                    </p>
                                    <button onClick={() => setActiveTab("manager_sync")} className="w-full py-3 bg-white text-[#09637E] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EBF4F6] transition-colors">
                                        Chat with Manager
                                    </button>
                                </div>

                                {/* Quick Stats */}
                                {!isFreeEvent && (
                                    <div className="space-y-4">
                                        {/* Sales Card */}
                                        <div className="bg-white p-6 rounded-[2rem] border border-[#09637E]/5 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                                                        <BsGraphUp /> Ticket Sales
                                                    </p>
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-3xl font-serif-premium text-[#09637E]">{campaign.ticketsSold}</p>
                                                        <span className="text-xs font-bold text-[#09637E]/40">/ {campaign.totalTickets}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-widest mb-1">
                                                        {Math.round((campaign.ticketsSold / campaign.totalTickets) * 100)}% Conversion
                                                    </span>
                                                    <p className="text-[10px] font-bold text-[#09637E]/60">{campaign.totalTickets - campaign.ticketsSold} to go</p>
                                                </div>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="w-full h-2 bg-[#EBF4F6] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#09637E] to-[#7AB2B2] rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${(campaign.ticketsSold / campaign.totalTickets) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Financials Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-6 rounded-[2rem] border border-[#09637E]/5 shadow-sm">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                                                    <BsWallet2 /> Revenue
                                                </p>
                                                <p className="text-lg font-bold text-[#09637E]">₹{(campaign.revenueGenerated).toLocaleString()}</p>
                                                <p className="text-[8px] font-bold text-[#09637E]/40 mt-1">Gross Income</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-[2rem] border border-[#09637E]/5 shadow-sm">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Net P&L</p>
                                                <p className={`text-lg font-bold ${profitLoss >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {profitLoss >= 0 ? '+' : '-'}₹{Math.abs(profitLoss).toLocaleString()}
                                                </p>
                                                <p className="text-[8px] font-bold text-[#09637E]/40 mt-1">After {Math.abs(campaign.cost).toLocaleString()} fees</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Reports */}
                        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-[#09637E]/5">
                            <h3 className="text-2xl font-serif-premium italic text-[#09637E] mb-8">Campaign Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-2">Description</p>
                                    <p className="text-lg text-[#09637E]/80 leading-relaxed font-light">{campaign.description}</p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-2">Attached Documents</p>
                                        <div className="space-y-3">
                                            {campaign.documents.map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-[#EBF4F6] rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <BsFileEarmarkPdf className="text-[#09637E]" />
                                                        <span className="text-xs font-bold text-[#09637E]">{doc.name}</span>
                                                    </div>
                                                    <BsCheckCircleFill className="text-emerald-500" size={12} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "manager_sync" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        {/* Manager Profile */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#09637E]/5 h-fit text-center">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#09637E] to-[#7AB2B2] mx-auto mb-6">
                                <img src={manager.avatar} alt={manager.name} className="w-full h-full rounded-full object-cover border-4 border-white" />
                            </div>
                            <h3 className="text-2xl font-serif-premium italic text-[#09637E] mb-1">{manager.name}</h3>
                            <p className="text-xs font-black uppercase tracking-widest text-[#09637E]/40 mb-6">{manager.role}</p>

                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {manager.status}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => toast.success("Manager Contact: siddharth.m@okkazo.com", {
                                        id: 'manager-contact',
                                        icon: '📇',
                                        style: { borderRadius: '10px', background: '#333', color: '#fff' }
                                    })}
                                    className="w-10 h-10 rounded-full bg-[#EBF4F6] flex items-center justify-center text-[#09637E] hover:bg-[#09637E] hover:text-white transition-colors"
                                >
                                    <BsPersonVcardFill />
                                </button>
                                <button
                                    onClick={() => toast("Available: Mon-Fri, 9AM - 6PM", {
                                        id: 'manager-availability',
                                        icon: '🕒',
                                        style: { borderRadius: '10px', background: '#333', color: '#fff' }
                                    })}
                                    className="w-10 h-10 rounded-full bg-[#EBF4F6] flex items-center justify-center text-[#09637E] hover:bg-[#09637E] hover:text-white transition-colors"
                                >
                                    <BsClockHistory />
                                </button>
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-[#09637E]/5 overflow-hidden flex flex-col h-[600px]">
                            <div className="p-6 border-b border-[#09637E]/5 flex justify-between items-center bg-[#EBF4F6]/30">
                                <div>
                                    <h4 className="font-bold text-[#09637E]">Strategy Sync</h4>
                                    <p className="text-[10px] uppercase tracking-wider opacity-50">Last active: Just now</p>
                                </div>
                                <BsThreeDotsVertical className="text-[#09637E]/40" />
                            </div>

                            <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#FAFAFA]">
                                {chatHistory.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-[#09637E] text-white rounded-tr-none'
                                            : 'bg-white text-[#09637E] border border-[#09637E]/5 rounded-tl-none'
                                            }`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[9px] mt-2 text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-[#09637E]/40'}`}>{msg.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-white border-t border-[#09637E]/5">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-[#EBF4F6] border-none rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-[#09637E]/10 placeholder:text-[#09637E]/30 text-[#09637E]"
                                    />
                                    <button type="submit" className="w-14 h-14 bg-[#09637E] rounded-xl flex items-center justify-center text-white hover:bg-[#088395] transition-colors shadow-lg">
                                        <BsSendFill size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCommandCenter;
