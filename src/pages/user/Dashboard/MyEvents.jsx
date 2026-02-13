import React, { useState, useEffect } from "react";
import { BsCalendarEvent, BsGeoAlt, BsQrCode, BsCheckCircleFill, BsThreeDotsVertical, BsPlusLg } from "react-icons/bs";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { myOrganizedEvents, myTickets as myTicketsData } from "../../../data/myEventsData";

const MyEvents = () => {
    const [activeTab, setActiveTab] = useState("organized"); // "organized" or "tickets"
    const [isLoading, setIsLoading] = useState(true);
    const [organizedEvents, setOrganizedEvents] = useState([]);
    const [myTickets, setMyTickets] = useState([]);

    // Simulate fetching data from backend
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Simulated API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock Organized Events response
                const organizedResponse = [...myOrganizedEvents];

                // Fetch Drafts from LocalStorage
                const savedDrafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');

                // Combine mocked events with local drafts
                const finalEvents = [...savedDrafts, ...organizedResponse];

                // Mock Tickets response
                const ticketsResponse = myTicketsData;

                setOrganizedEvents(finalEvents);
                setMyTickets(ticketsResponse);

            } catch (error) {
                toast.error("Failed to load your events");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <Toaster position="top-center" />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-12 pb-20">
                {/* Header Tabs */}
                <div className="flex items-center gap-12 border-b border-gray-200 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <button
                        onClick={() => setActiveTab("organized")}
                        className={`flex items-center gap-3 pb-4 px-2 font-bold transition-all relative ${activeTab === "organized" ? "text-[#0b2d49]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <BsCalendarEvent size={20} className={activeTab === "organized" ? "text-[#d7a444]" : ""} />
                        <span>Organized by Me</span>
                        <span className="bg-gray-100 text-[10px] px-2 py-0.5 rounded-full text-gray-400 font-black">{isLoading ? "..." : organizedEvents.length}</span>
                        {activeTab === "organized" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#d7a444] rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab("tickets")}
                        className={`flex items-center gap-3 pb-4 px-2 font-bold transition-all relative ${activeTab === "tickets" ? "text-[#0b2d49]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <BsQrCode size={20} className={activeTab === "tickets" ? "text-[#d7a444]" : ""} />
                        <span>My Tickets</span>
                        <span className="bg-gray-100 text-[10px] px-2 py-0.5 rounded-full text-gray-400 font-black">{isLoading ? "..." : myTickets.length}</span>
                        {activeTab === "tickets" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#d7a444] rounded-t-full"></div>}
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
                        <div className="w-12 h-12 border-4 border-[#d7a444] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Fetching Events...</p>
                    </div>
                ) : (
                    activeTab === "organized" ? (
                        <div className="animate-in fade-in duration-500">
                            {/* Organized Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <h2 className="text-2xl font-black tracking-tight">Managing {organizedEvents.length} Events</h2>
                                <button className="flex items-center justify-center gap-2 bg-[#d7a444]/10 text-[#d7a444] px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#d7a444] hover:text-[#0b2d49] transition-all border border-[#d7a444]/20 group">
                                    <BsPlusLg className="group-hover:rotate-90 transition-transform" />
                                    Create New Event
                                </button>
                            </div>

                            {/* Organized Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {organizedEvents.length > 0 ? (
                                    organizedEvents.map((event) => (
                                        <div key={event.id} className="relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer">
                                            {/* Full Background Image */}
                                            <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] via-[#09637E]/50 to-transparent opacity-90"></div>

                                            {/* Top Right Action */}
                                            <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#09637E] transition-all z-10">
                                                <BsThreeDotsVertical />
                                            </button>

                                            {/* Bottom Content */}
                                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 ${event.status === 'Live' ? 'bg-emerald-500/80 text-white' :
                                                        event.status === 'Draft' ? 'bg-gray-500/80 text-white' :
                                                            'bg-amber-500/80 text-white'
                                                        }`}>
                                                        {event.status === 'Live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse"></span>}
                                                        {event.status}
                                                    </span>
                                                    <span className="text-[10px] font-black tracking-widest uppercase text-[#d7a444]">{event.date}</span>
                                                </div>

                                                <h3 className="text-3xl font-serif-premium italic mb-3 leading-tight">{event.title}</h3>

                                                <div className="flex items-center gap-2 text-xs text-white/70 font-medium mb-8">
                                                    <BsGeoAlt size={14} className="text-[#d7a444]" />
                                                    {event.location}
                                                </div>

                                                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Tickets Sold</p>
                                                        <p className="text-lg font-black">{event.sold}</p>
                                                    </div>
                                                    <button className="px-6 py-3 bg-white text-[#09637E] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d7a444] transition-colors">
                                                        Manage
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No organized events found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500">
                            {/* Tickets Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black tracking-tight">My Tickets (Upcoming)</h2>
                                <button className="text-sm font-black text-[#d7a444] hover:underline">Past Events</button>
                            </div>

                            {/* Tickets Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {myTickets.length > 0 ? (
                                    myTickets.map((ticket) => (
                                        <div key={ticket.id} className="relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer">
                                            {/* Full Background Image */}
                                            <img src={ticket.image} alt={ticket.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] via-[#09637E]/50 to-transparent opacity-90"></div>

                                            {/* Date Badge - Top Right */}
                                            <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center min-w-[60px]">
                                                <p className="text-[8px] font-black text-white/60 uppercase leading-none mb-1">{ticket.date.split(' ')[0]}</p>
                                                <p className="text-xl font-black text-white leading-none">{ticket.date.split(' ')[1]}</p>
                                            </div>

                                            {/* Status Badge - Top Left */}
                                            <div className="absolute top-6 left-6 flex items-center gap-2 bg-[#d7a444] text-[#09637E] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                                                <BsCheckCircleFill size={12} />
                                                Confirmed
                                            </div>

                                            {/* Bottom Content */}
                                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                                <div className="flex items-center gap-2 text-xs font-black text-[#d7a444] mb-2">
                                                    <span className="w-1.5 h-1.5 bg-[#d7a444] rounded-full"></span>
                                                    {ticket.time}
                                                </div>

                                                <h3 className="text-3xl font-serif-premium italic mb-3 leading-tight">{ticket.title}</h3>

                                                <div className="flex items-center gap-2 text-xs text-white/70 font-medium mb-6">
                                                    <BsGeoAlt size={14} />
                                                    {ticket.location}
                                                </div>

                                                <div className="flex gap-2 mb-6">
                                                    <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white border border-white/10">{ticket.tickets}</span>
                                                    <span className="px-3 py-1.5 bg-[#d7a444]/20 backdrop-blur-sm rounded-lg text-[10px] font-bold text-[#d7a444] border border-[#d7a444]/30">{ticket.type}</span>
                                                </div>

                                                <button className="w-full flex items-center justify-center gap-3 bg-white text-[#09637E] py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all active:scale-95">
                                                    <BsQrCode size={16} />
                                                    View Ticket
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No tickets found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default MyEvents;
