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
                const organizedResponse = myOrganizedEvents;

                // Mock Tickets response
                const ticketsResponse = myTicketsData;

                setOrganizedEvents(organizedResponse);
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
                                        <div key={event.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                                            <div className="relative h-56 overflow-hidden">
                                                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                <button className="absolute top-4 right-4 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#0b2d49] transition-all">
                                                    <BsThreeDotsVertical />
                                                </button>
                                            </div>
                                            <div className="p-8">
                                                <p className="text-[10px] font-black text-[#d7a444] uppercase tracking-widest mb-2">{event.date}</p>
                                                <h3 className="text-xl font-black mb-2 group-hover:text-[#d7a444] transition-colors">{event.title}</h3>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-6">
                                                    <BsGeoAlt size={14} />
                                                    {event.location}
                                                </div>
                                                
                                                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        event.status === 'Live' ? 'bg-green-50 text-green-600' : 
                                                        event.status === 'Draft' ? 'bg-gray-100 text-gray-500' : 
                                                        'bg-[#fdf8ee] text-[#d7a444]'
                                                    }`}>
                                                        {event.status === 'Live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>}
                                                        {event.status}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-400">{event.sold}</span>
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
                                        <div key={ticket.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                                            <div className="relative h-64 overflow-hidden">
                                                <div className="absolute top-4 right-4 bg-white rounded-2xl p-2 text-center shadow-lg z-10 w-14 border border-gray-50">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase leading-none mb-1">{ticket.date.split(' ')[0]}</p>
                                                    <p className="text-xl font-black text-[#0b2d49] leading-none">{ticket.date.split(' ')[1]}</p>
                                                </div>
                                                <img src={ticket.image} alt={ticket.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#d7a444] text-[#0b2d49] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                                                    <BsCheckCircleFill size={12} />
                                                    Confirmed
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <div className="flex items-center gap-2 text-xs font-black text-[#d7a444] mb-3">
                                                    <span className="w-1.5 h-1.5 bg-[#d7a444] rounded-full"></span>
                                                    {ticket.time}
                                                </div>
                                                <h3 className="text-xl font-black mb-2 group-hover:text-[#d7a444] transition-colors">{ticket.title}</h3>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-8">
                                                    <BsGeoAlt size={14} />
                                                    {ticket.location}
                                                </div>

                                                <div className="flex gap-3 mb-8">
                                                    <span className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-bold text-[#0b2d49] border border-gray-100">{ticket.tickets}</span>
                                                    <span className="px-3 py-1.5 bg-[#f3ddb1]/30 rounded-xl text-[10px] font-bold text-[#d0a862] border border-[#f3ddb1]/50">{ticket.type}</span>
                                                </div>

                                                <button className="w-full flex items-center justify-center gap-3 bg-[#d7a444] text-[#0b2d49] py-4 rounded-2xl font-black text-sm hover:bg-[#0b2d49] hover:text-white transition-all shadow-lg shadow-[#d7a444]/20 active:scale-95">
                                                    <BsQrCode size={18} />
                                                    View QR Code
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
