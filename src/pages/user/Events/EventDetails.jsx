import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Layout/user/Navbar";
import Footer from "../../../components/Layout/user/Footer";
import { BsArrowLeft, BsGeoAlt, BsCalendarEvent, BsPeople, BsClock, BsBuilding, BsCheckCircleFill  } from "react-icons/bs";
import { allEvents, popularEvents } from "../../../data/eventsData";
import { toast, Toaster } from "react-hot-toast";

const EventDetails = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [bookingQty, setBookingQty] = useState(1);

    useEffect(() => {
        const combinedEvents = [...allEvents, ...popularEvents];
        const foundEvent = combinedEvents.find(e => e.id === parseInt(eventId));
        if (foundEvent) {
            setEvent(foundEvent);
            // Default to first category if available
            if (foundEvent.categories && foundEvent.categories.length > 0) {
                setSelectedCategory(foundEvent.categories[0].name);
            }
        } else {
            toast.error("Event not found");
            navigate("/user/dashboard");
        }
    }, [eventId, navigate]);

    if (!event) return null;

    // Simulate available tickets logic
    const availableTickets = event.id > 100 ? 50 : 150; 

    // Helper to parse price reliably
    const getNumericPrice = (p) => {
        if (!p || typeof p !== 'string') return 0;
        const numeric = p.replace(/[^0-9.]/g, '');
        return numeric ? parseFloat(numeric) : 0;
    };

    const getCurrentPrice = () => {
        if (selectedCategory && event.categories) {
            const cat = event.categories.find(c => c.name === selectedCategory);
            return cat ? cat.price : event.price;
        }
        return event.price;
    };

    const handleProceed = () => {
        const queryParams = new URLSearchParams({
            qty: bookingQty,
            category: selectedCategory || "General"
        });
        navigate(`/user/checkout/${event.id}?${queryParams.toString()}`);
    };

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <Navbar />
            <Toaster position="top-center" />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-20">
                {/* Back Button */}
                <Link to="/user/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-[#0b2d49] font-bold transition-all group mb-8 w-fit">
                    <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Selection
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Event Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Banner */}
                        <div className="relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl group">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b2d49]/80 via-transparent to-transparent"></div>
                            
                            <div className="absolute bottom-10 left-10 right-10 text-white">
                                <span className="px-5 py-2 bg-[#d7a444] text-[#0b2d49] text-xs font-black rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg">
                                    {event.tag}
                                </span>
                                <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-lg">{event.title}</h1>
                                <p className="text-gray-200 text-lg flex items-center gap-2 font-medium">
                                    <BsGeoAlt className="text-[#d7a444]" /> {event.location}
                                </p>
                            </div>
                        </div>

                        {/* Description & Details */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 space-y-8">
                            <div>
                                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                    <span className="w-1.5 h-8 bg-[#d7a444] rounded-full"></span>
                                    About the Event
                                </h2>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    Join us for an unforgettable experience at the {event.title}. This event brings together the best in {event.tag} for a day of inspiration, entertainment, and networking. Whether you're a professional looking to expand your horizons or simply looking for a fun time, this is the place to be. 
                                    <br/><br/>
                                    Don't miss out on this opportunity to witness spectacular performances and engage with like-minded individuals in an amazing atmosphere.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                                <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <BsCalendarEvent className="text-[#d7a444] mb-2" size={20} />
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Date</span>
                                    <span className="font-extrabold text-[#0b2d49] text-sm">{event.date.split('•')[0]}</span>
                                </div>
                                <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <BsClock className="text-[#d7a444] mb-2" size={20} />
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Time</span>
                                    <span className="font-extrabold text-[#0b2d49] text-sm">{event.date.split('•')[1] || "6:00 PM"}</span>
                                </div>
                                <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <BsBuilding className="text-[#d7a444] mb-2" size={20} />
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Venue</span>
                                    <span className="font-extrabold text-[#0b2d49] text-sm">{event.location.split(',')[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Booking Sidebar (Sticky Container) */}
                    <div className="lg:sticky lg:top-32 space-y-8 h-fit">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                            <h3 className="text-2xl font-black mb-8">Ticket Booking</h3>
                            
                            <div className="space-y-8">
                                {/* Category Selection */}
                                {event.categories && (
                                    <div className="space-y-4">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Ticket Category</p>
                                        <div className="grid gap-3">
                                            {event.categories.map((cat) => (
                                                <button 
                                                    key={cat.name}
                                                    onClick={() => setSelectedCategory(cat.name)}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${
                                                        selectedCategory === cat.name 
                                                        ? "border-[#d7a444] bg-[#fdf8ee] shadow-sm" 
                                                        : "border-gray-50 bg-gray-50/50 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    <span className={`font-black uppercase text-xs tracking-wider ${selectedCategory === cat.name ? "text-[#d7a444]" : "text-gray-400"}`}>
                                                        {cat.name}
                                                    </span>
                                                    <span className="font-extrabold text-[#0b2d49]">{cat.price}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                                    <div>
                                        <p className="font-black text-[#0b2d49] text-xl">{getCurrentPrice()}</p>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            {selectedCategory ? `${selectedCategory} Ticket` : "Single Entry Ticket"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                        <button 
                                            onClick={() => setBookingQty(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all active:scale-95"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-black text-[#0b2d49]">{bookingQty}</span>
                                        <button 
                                            onClick={() => setBookingQty(q => Math.min(availableTickets, q + 1))}
                                            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all active:scale-95"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                     <div className="flex justify-between items-center">
                                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                            Available: {availableTickets} Tickets
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[#0b2d49]">
                                            <BsPeople />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{bookingQty} Selected</span>
                                        </div>
                                     </div>

                                     <button 
                                        onClick={handleProceed}
                                        className="w-full py-5 bg-[#0b2d49] text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-900/10 hover:bg-[#d7a444] hover:-translate-y-1 transition-all active:scale-[0.98] text-lg uppercase tracking-tight"
                                     >
                                        Proceed to Booking
                                     </button>
                                </div>

                                <div className="pt-6 mt-4 border-t border-gray-50">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400 font-bold">Total Price</span>
                                        <span className="text-[#0b2d49] font-black text-xl">${(getNumericPrice(getCurrentPrice()) * bookingQty).toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center font-medium">Extra platform and service fees will be added at checkout.</p>
                                </div>
                            </div>
                        </div>

                        {/* Guarantee Card - Inside the Same Column Stacking */}
                        <div className="bg-gradient-to-br from-[#d7a444] to-[#c59333] rounded-[2rem] p-6 text-white shadow-lg overflow-hidden relative">
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                    <BsCheckCircleFill size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-lg">Verified Event</p>
                                    <p className="text-white/80 text-xs font-medium">100% Refundable up to 24h before event.</p>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EventDetails;
