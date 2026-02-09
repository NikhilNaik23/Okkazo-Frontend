import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BsArrowLeft, BsCheckCircleFill } from "react-icons/bs";
import { allEvents, popularEvents } from "../../../data/eventsData";
import { toast, Toaster } from "react-hot-toast";
import EventInfoGrid from "../../../components/User/Events/EventInfoGrid";
import TicketSelector from "../../../components/User/Events/TicketSelector";

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
            <Toaster position="top-center" />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-12 pb-20">
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

                            <EventInfoGrid event={event} />
                        </div>
                    </div>

                    {/* Right: Booking Sidebar (Sticky Container) */}
                    <div className="lg:sticky lg:top-32 space-y-8 h-fit">
                        <TicketSelector
                            event={event}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            bookingQty={bookingQty}
                            setBookingQty={setBookingQty}
                            availableTickets={availableTickets}
                            getCurrentPrice={getCurrentPrice}
                        />

                        <button 
                            onClick={handleProceed}
                            className="w-full py-5 bg-[#0b2d49] text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-900/10 hover:bg-[#d7a444] hover:-translate-y-1 transition-all active:scale-[0.98] text-lg uppercase tracking-tight"
                        >
                            Proceed to Booking
                        </button>

                        <div className="pt-6 mt-4 border-t border-gray-50 bg-white rounded-[2rem] p-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400 font-bold">Total Price</span>
                                <span className="text-[#0b2d49] font-black text-xl">₹{(getNumericPrice(getCurrentPrice()) * bookingQty * 83).toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 text-center font-medium">Extra platform and service fees will be added at checkout.</p>
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
        </div>
    );
};

export default EventDetails;
