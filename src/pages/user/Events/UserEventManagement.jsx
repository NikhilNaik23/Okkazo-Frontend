import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BsArrowLeft, BsChatDots, BsCalendarEvent, BsGeoAlt, BsPeople, BsClock, BsSend, BsCheckCircleFill } from "react-icons/bs";
import { myOrganizedEvents } from "../../../data/myEventsData";
import { toast, Toaster } from "react-hot-toast";

const UserEventManagement = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // "overview", "chat"
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { sender: "manager", text: "Hello! I'm your dedicated event manager. How can I assist you today?", time: "10:00 AM" }
    ]);

    useEffect(() => {
        // Simulate fetching event data
        setTimeout(() => {
            const foundEvent = myOrganizedEvents.find(e => e.id === parseInt(eventId) || e.id === eventId);
            if (foundEvent) {
                setEvent(foundEvent);
            } else {
                toast.error("Event not found");
                // navigate("/user/my-events");
            }
            setLoading(false);
        }, 800);
    }, [eventId, navigate]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const newMessage = { sender: "user", text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setChatHistory([...chatHistory, newMessage]);
        setChatMessage("");

        // Simulate manager reply
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
            <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center pt-28">
                <div className="w-16 h-16 border-4 border-[#09637E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-[#EBF4F6] pt-28 font-sans text-[#09637E]">
            <Toaster position="top-center" />

            <main className="max-w-7xl mx-auto px-6 pb-20">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/user/my-events" className="inline-flex items-center gap-2 text-[#0b2d49]/60 hover:text-[#09637E] font-bold text-xs uppercase tracking-widest mb-6 transition-colors group">
                        <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to My Events
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/50 border border-[#09637E]/20 text-[#09637E]`}>
                                    {event.status}
                                </span>
                                <span className="text-[10px] font-bold text-[#0b2d49]/40 uppercase tracking-widest">Event ID: #{event.id}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif-premium italic text-[#0b2d49]">{event.title}</h1>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#09637E] text-white shadow-lg' : 'bg-white text-[#09637E] hover:bg-white/80'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("chat")}
                                className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-[#09637E] text-white shadow-lg' : 'bg-white text-[#09637E] hover:bg-white/80'}`}
                            >
                                <BsChatDots /> Chat with Manager
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Main) */}
                    <div className="lg:col-span-2 space-y-8">

                        {activeTab === "overview" && (
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#09637E]/5">
                                <div className="h-64 rounded-3xl overflow-hidden mb-8 relative">
                                    <img src={event.image || "https://images.unsplash.com/photo-1514525253440-b393452e2729?auto=format&fit=crop&w=1200&q=80"} alt={event.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#09637E]/60 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <h3 className="text-2xl font-serif-premium italic">{event.location}</h3>
                                        <p className="text-sm font-medium opacity-90">{event.date}</p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-serif-premium text-[#0b2d49] mb-4">Event Details</h3>
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="bg-[#EBF4F6]/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/60 mb-1">Expected Guests</p>
                                        <div className="flex items-center gap-2 text-[#0b2d49]">
                                            <BsPeople size={20} />
                                            <span className="font-bold">250+</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#EBF4F6]/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/60 mb-1">Time</p>
                                        <div className="flex items-center gap-2 text-[#0b2d49]">
                                            <BsClock size={20} />
                                            <span className="font-bold">{event.time || "7:00 PM - 11:00 PM"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-sm text-[#0b2d49]/80 leading-relaxed">
                                        Your event request has been received and is currently being processed by our team.
                                        We are reviewing the vendor availability for <strong>{event.formData?.vendors ? Object.keys(event.formData.vendors).length : 0} services</strong> requested.
                                    </p>

                                    <div className="border-t border-[#09637E]/10 pt-4 mt-4">
                                        <h4 className="text-sm font-bold text-[#09637E] uppercase tracking-widest mb-3">Selected Services</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {event.formData?.services?.length > 0 ? (
                                                event.formData.services.map(service => (
                                                    <span key={service} className="px-3 py-1 bg-[#EBF4F6] text-[#09637E] rounded-lg text-xs font-bold">
                                                        {service}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No specific services listed in summary</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "chat" && (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-[#09637E]/5 overflow-hidden flex flex-col h-[600px]">
                                {event.status === 'Pending Approval' ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                                        <div className="w-20 h-20 bg-[#EBF4F6] rounded-full flex items-center justify-center mb-6 text-[#09637E]">
                                            <BsChatDots size={32} />
                                        </div>
                                        <h3 className="text-xl font-serif-premium text-[#0b2d49] mb-2">Chat Unavailable</h3>
                                        <p className="text-sm text-[#09637E] max-w-sm">
                                            Chat functionality will be enabled once a dedicated event manager has been assigned to your event.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-6 border-b border-[#09637E]/10 bg-[#EBF4F6]/30 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#09637E] text-white flex items-center justify-center font-serif-premium italic">EA</div>
                                                <div>
                                                    <h4 className="font-bold text-[#0b2d49] text-sm">Event Assistant</h4>
                                                    <p className="text-[10px] text-[#09637E] uppercase font-bold tracking-widest flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
                                            {chatHistory.map((msg, index) => (
                                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#09637E] text-white rounded-br-none' : 'bg-white text-[#0b2d49] shadow-sm rounded-bl-none'}`}>
                                                        <p className="text-sm">{msg.text}</p>
                                                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-[#0b2d49]/40'}`}>{msg.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 bg-white border-t border-[#09637E]/10">
                                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                                <input
                                                    type="text"
                                                    value={chatMessage}
                                                    onChange={(e) => setChatMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className="flex-1 bg-[#EBF4F6] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#09637E]/20 text-[#0b2d49]"
                                                />
                                                <button type="submit" className="w-12 h-12 bg-[#09637E] text-white rounded-xl flex items-center justify-center hover:bg-[#088395] transition-colors shadow-lg">
                                                    <BsSend />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#09637E]/5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#09637E]/60 mb-6">
                                {event.status === 'Pending Approval' ? 'Manager Assignment' : 'Manager Assigned'}
                            </h4>

                            {event.status === 'Pending Approval' ? (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-[#EBF4F6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#09637E]">
                                        <BsClock size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-[#0b2d49] mb-2">Pending Assignment</p>
                                    <p className="text-xs text-[#09637E]/70 leading-relaxed">
                                        A dedicated event manager will be assigned to you once your event listing is approved.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" alt="Manager" className="w-14 h-14 rounded-full object-cover" />
                                        <div>
                                            <h5 className="font-bold text-[#0b2d49]">Sarah Jenkins</h5>
                                            <p className="text-xs text-[#09637E]">Senior Event Coordinator</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("chat")}
                                        className="w-full py-3 border border-[#09637E]/20 rounded-xl text-xs font-bold uppercase tracking-widest text-[#09637E] hover:bg-[#09637E] hover:text-white transition-all"
                                    >
                                        Contact Manager
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="bg-[#09637E] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <h4 className="text-xs font-black uppercase tracking-widest mb-2 opacity-60">Listing Status</h4>
                            <div className="flex items-center gap-2 mb-6">
                                <BsCheckCircleFill className="text-green-400" />
                                <span className="font-bold text-lg">{event.status}</span>
                            </div>
                            <p className="text-xs opacity-80 leading-relaxed mb-6">
                                Your event is currently visible to {event.formData?.listingType === 'Public' ? 'the public' : 'invited guests only'}.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default UserEventManagement;
