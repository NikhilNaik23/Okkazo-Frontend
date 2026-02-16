import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BsArrowLeft, BsChatDots, BsCheckCircleFill, BsClock, BsSend, BsFileEarmarkZip, BsDownload, BsCircle, BsTicketPerforated } from "react-icons/bs";
import { myOrganizedEvents } from "../../../data/myEventsData";
import { toast, Toaster } from "react-hot-toast";

const UserEventManagement = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // "overview" (Command Center) or "chat" (Manager Sync)
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { sender: "manager", text: "Hello! I'm your dedicated event manager. How can I assist you today?", time: "10:00 AM" }
    ]);

    useEffect(() => {
        setTimeout(() => {
            const foundEvent = myOrganizedEvents.find(e => e.id === parseInt(eventId) || e.id === eventId);
            if (foundEvent) {
                setEvent(foundEvent);
            } else {
                toast.error("Event not found");
                navigate("/user/my-events");
            }
            setLoading(false);
        }, 800);
    }, [eventId, navigate]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        setChatHistory([...chatHistory, { sender: "user", text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setChatMessage("");
        setTimeout(() => {
            setChatHistory(prev => [...prev, {
                sender: "manager",
                text: "Thank you for your message. I'm looking into that for you.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#eff6f7] flex items-center justify-center pt-28">
                <div className="w-16 h-16 border-4 border-[#09637E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!event) return null;

    // Roadmap Status Logic
    const steps = [
        { id: 1, label: "Submission", status: "completed" },
        { id: 2, label: "Admin Review", status: event.status === 'Pending Approval' ? 'current' : event.status !== 'Draft' ? 'completed' : 'pending' },
        { id: 3, label: "Manager Sync", status: (event.status !== 'Draft' && event.status !== 'Pending Approval') ? 'current' : 'pending' },
        { id: 4, label: "Go Live", status: event.status === 'Live' ? 'completed' : 'pending' }
    ];

    const StepIcon = ({ status }) => {
        if (status === 'completed') return <div className="w-8 h-8 rounded-full bg-[#09637E] text-white flex items-center justify-center"><BsCheckCircleFill /></div>;
        if (status === 'current') return <div className="w-8 h-8 rounded-full border-4 border-[#09637E]/20 text-[#09637E] flex items-center justify-center bg-white"><div className="w-2.5 h-2.5 rounded-full bg-[#09637E] animate-pulse" /></div>;
        return <div className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white" />;
    };

    return (
        <div className="min-h-screen bg-[#eff6f7] pt-28 font-sans text-[#09637E] selection:bg-[#7AB2B2] selection:text-white">
            <Toaster position="top-center" />

            <main className="max-w-[1400px] mx-auto px-8 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <Link to="/user/my-events" className="inline-flex items-center gap-2 text-[#09637E]/50 hover:text-[#09637E] font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors group">
                            <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            Back to My Events
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-serif-premium italic text-[#0b2d49]">{event.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${event.status === 'Pending Approval' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-[#EBF4F6] text-[#09637E] border-[#09637E]/10'}`}>
                                {event.status}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-1.5 rounded-xl flex gap-1 shadow-sm border border-[#09637E]/5">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#eff6f7] text-[#09637E] shadow-sm' : 'text-[#09637E]/40 hover:text-[#09637E]'}`}
                        >
                            Command Center
                        </button>
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-[#eff6f7] text-[#09637E] shadow-sm' : 'text-[#09637E]/40 hover:text-[#09637E]'}`}
                        >
                            Manager Sync
                        </button>
                    </div>
                </div>

                {activeTab === "overview" && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Roadmap Card */}
                        <div className="bg-white rounded-[32px] p-10 shadow-sm border border-[#09637E]/5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-12">
                                <h2 className="text-xl font-serif-premium text-[#0b2d49]">Live Promotion Roadmap</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40">Tracking Status: {event.status}</p>
                            </div>

                            <div className="relative z-10">
                                {/* Connecting Line */}
                                <div className="absolute top-4 left-0 right-0 h-[2px] bg-gray-100 -z-10" />
                                <div className="absolute top-4 left-0 h-[2px] bg-[#09637E]/20 transition-all duration-1000" style={{ width: event.status === 'Pending Approval' ? '33%' : '66%' }} />

                                <div className="grid grid-cols-4 gap-4">
                                    {steps.map((step) => (
                                        <div key={step.id} className="flex flex-col items-center gap-4 text-center">
                                            <StepIcon status={step.status} />
                                            <div>
                                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${step.status === 'completed' || step.status === 'current' ? 'text-[#09637E]' : 'text-gray-300'}`}>
                                                    {step.id}. {step.label}
                                                </p>
                                                <p className="text-[9px] font-medium text-gray-400">
                                                    {step.status === 'completed' ? 'Complete' : step.status === 'current' ? 'In Progress' : 'Upcoming'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Asset Preview */}
                                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#09637E]/5">
                                    <h3 className="text-sm font-serif-premium text-[#09637E] mb-6">Asset Preview</h3>

                                    <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-100 mb-8 border border-gray-100 group">
                                        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Minimal Banner</div>
                                        <img src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"} alt="Asset" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex flex-col justify-end p-8 text-white">
                                            <h4 className="font-serif-premium italic text-2xl">{event.title} 2024</h4>
                                            <p className="text-[10px] uppercase tracking-widest opacity-80">{event.location}</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-sm max-w-none text-[#0b2d49]/70 leading-relaxed text-xs">
                                        <h4 className="font-bold text-[#09637E] uppercase tracking-widest text-[10px] mb-2">Event Synopsis</h4>
                                        <p>
                                            The {event.title} is a bespoke experience bringing together the finest artistic and digital innovations.
                                            This event features live workshops, immersive galleries, and a curated set of interactive panels.
                                        </p>
                                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#09637E]">
                                                <div className="w-2 h-2 rounded-full bg-green-400" /> Ticket Sales Active
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400">ID: #{event.id}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Inventory */}
                                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#09637E]/5 overflow-hidden relative">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-serif-premium text-[#09637E]">Ticket Inventory</h3>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/50 hover:text-[#09637E]">View Details</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-[#eff6f7] rounded-xl p-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#09637E]/50 mb-1">General</p>
                                            <p className="text-xl font-serif-premium text-[#0b2d49]">150<span className="text-xs opacity-40 ml-1">/ 200</span></p>
                                        </div>
                                        <div className="bg-[#eff6f7] rounded-xl p-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#09637E]/50 mb-1">VIP</p>
                                            <p className="text-xl font-serif-premium text-[#0b2d49]">45<span className="text-xs opacity-40 ml-1">/ 50</span></p>
                                        </div>
                                        <div className="bg-[#09637E] rounded-xl p-4 text-white">
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Total Rev</p>
                                            <p className="text-xl font-serif-premium">₹12.5k</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content */}
                            <div className="space-y-8">
                                {/* Consultation / Manager Card */}
                                <div className="relative bg-[#09637E] text-white rounded-[32px] p-8 shadow-xl overflow-hidden flex flex-col justify-between min-h-[300px]">
                                    {/* Decorative BG */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white backdrop-blur-sm">
                                            {event.status === 'Pending Approval' ? <BsClock size={20} /> : <BsChatDots size={20} />}
                                        </div>

                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Consultation</p>
                                        <h3 className="text-2xl font-serif-premium italic mb-4">
                                            {event.status === 'Pending Approval' ? 'Manager Selection' : 'Manager Connected'}
                                        </h3>
                                        <p className="text-xs opacity-80 leading-relaxed max-w-[250px]">
                                            {event.status === 'Pending Approval'
                                                ? "A dedicated manager will be assigned to optimize your experience once your event is approved."
                                                : "Sarah Jenkins is assigned to your event. Sync up for strategy and execution details."
                                            }
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => event.status !== 'Pending Approval' && setActiveTab("chat")}
                                        disabled={event.status === 'Pending Approval'}
                                        className={`mt-8 w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${event.status === 'Pending Approval'
                                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                            : 'bg-white text-[#09637E] hover:bg-white/90'
                                            }`}
                                    >
                                        {event.status === 'Pending Approval' ? 'Assignment Pending' : 'Chat with Manager'}
                                    </button>
                                </div>

                                {/* Promotion Assets */}
                                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#09637E]/5">
                                    <h3 className="text-sm font-serif-premium text-[#09637E] mb-6">Promotion Assets</h3>

                                    <div className="space-y-3">
                                        {[
                                            { name: "Media_Kit_2024.zip", size: "24 MB" },
                                            { name: "Social_Banners.zip", size: "12 MB" },
                                            { name: "Event_Logos.ai", size: "4 MB" }
                                        ].map((file, i) => (
                                            <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-[#09637E]/20 hover:bg-[#eff6f7]/50 transition-all cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#eff6f7] text-[#09637E] flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <BsFileEarmarkZip size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-[#0b2d49]">{file.name}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{file.size}</p>
                                                    </div>
                                                </div>
                                                <button className="text-[#09637E]/40 group-hover:text-[#09637E] transition-colors">
                                                    <BsDownload size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-3 border border-dashed border-[#09637E]/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#09637E]/60 hover:text-[#09637E] hover:border-[#09637E] transition-colors">
                                        Request New Asset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "chat" && (
                    <div className="bg-white rounded-[32px] shadow-sm border border-[#09637E]/5 overflow-hidden flex flex-col h-[700px] animate-fade-in-up">
                        {event.status === 'Pending Approval' ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                                <div className="w-24 h-24 bg-[#eff6f7] rounded-full flex items-center justify-center mb-8 text-[#09637E]">
                                    <BsChatDots size={40} />
                                </div>
                                <h3 className="text-2xl font-serif-premium text-[#0b2d49] mb-3">Sync Unavailable</h3>
                                <p className="text-sm text-[#09637E] max-w-sm leading-relaxed">
                                    Manager Sync will be unlocked once your event passes the Admin Review stage.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="p-8 border-b border-[#09637E]/10 flex items-center justify-between bg-[#eff6f7]/30">
                                    <div>
                                        <h3 className="font-serif-premium text-xl text-[#0b2d49]">Manager Sync</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/50">Direct Line • Sarah Jenkins</p>
                                    </div>
                                    <Link to="#" className="px-4 py-2 bg-white border border-[#09637E]/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#09637E] hover:bg-[#09637E] hover:text-white transition-all">
                                        View Profile
                                    </Link>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#f8fafc]">
                                    <div className="flex justify-center mb-8">
                                        <span className="px-4 py-1.5 bg-[#eff6f7] text-[#09637E]/60 text-[9px] font-bold rounded-full uppercase tracking-widest">Today</span>
                                    </div>
                                    {chatHistory.map((msg, index) => (
                                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[60%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#09637E] text-white rounded-br-none' : 'bg-white text-[#0b2d49] border border-gray-100 rounded-bl-none'}`}>
                                                <p>{msg.text}</p>
                                                <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-300'}`}>{msg.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-white border-t border-[#09637E]/10">
                                    <form onSubmit={handleSendMessage} className="flex gap-4 relative">
                                        <input
                                            type="text"
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-[#eff6f7] border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-[#09637E]/20 text-[#0b2d49] placeholder:text-gray-400"
                                        />
                                        <button type="submit" className="absolute right-2 top-2 bottom-2 w-12 bg-[#09637E] text-white rounded-xl flex items-center justify-center hover:bg-[#088395] transition-all shadow-md">
                                            <BsSend size={18} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserEventManagement;
