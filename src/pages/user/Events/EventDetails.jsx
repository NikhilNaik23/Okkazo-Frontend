import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { BsArrowLeft, BsCheckCircleFill, BsBookmarkHeart, BsBookmarkHeartFill } from "react-icons/bs";
import { allEvents, popularEvents } from "../../../data/eventsData";
import { toast, Toaster } from "react-hot-toast";
import EventInfoGrid from "../../../components/User/Events/EventInfoGrid";
import TicketSelector from "../../../components/User/Events/TicketSelector";

const EventDetails = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [event, setEvent] = useState(null);
    const [ticketSelection, setTicketSelection] = useState({}); // { "Category A": 2, "Category B": 0 }
    const [isSaved, setIsSaved] = useState(false);

    const resolvedDescription = String(
        event?.description || event?.eventDescription || event?.raw?.eventDescription || ""
    );

    const aboutParagraphs = resolvedDescription
        .split(/\n+/)
        .map((text) => text.trim())
        .filter(Boolean);

    const venueName = String(event?.eventLocation || event?.location || "Venue TBA");
    const eventDateText = String(event?.date || "DATE TBA");
    const eventTimeText = String(event?.eventTime || "Time TBA");

    useEffect(() => {
        const stateEvent = location?.state?.event;
        if (stateEvent && String(stateEvent.id) === String(eventId)) {
            const eventWithCategories = { ...stateEvent };
            eventWithCategories.description =
                eventWithCategories.description
                || eventWithCategories.eventDescription
                || eventWithCategories.raw?.eventDescription
                || "";
            if (!eventWithCategories.categories || eventWithCategories.categories.length === 0) {
                eventWithCategories.categories = [
                    {
                        name: "General Admission",
                        price: eventWithCategories.price || "Free"
                    }
                ];
            }
            setEvent(eventWithCategories);

            const savedItems = JSON.parse(localStorage.getItem('saved') || '[]');
            setIsSaved(savedItems.some(item => String(item.id) === String(eventWithCategories.id)));
            return;
        }

        const combinedEvents = [...allEvents, ...popularEvents];
        const foundEvent = combinedEvents.find(e => String(e.id) === String(eventId));
        if (foundEvent) {
            // Normalize event data
            const eventWithCategories = { ...foundEvent };
            eventWithCategories.description =
                eventWithCategories.description
                || eventWithCategories.eventDescription
                || eventWithCategories.raw?.eventDescription
                || "";
            if (!eventWithCategories.categories || eventWithCategories.categories.length === 0) {
                eventWithCategories.categories = [
                    {
                        name: "General Admission",
                        price: eventWithCategories.price || "Free"
                    }
                ];
            }
            setEvent(eventWithCategories);
            // Check if saved
            const savedItems = JSON.parse(localStorage.getItem('saved') || '[]');
            setIsSaved(savedItems.some(item => String(item.id) === String(foundEvent.id)));
        } else {
            toast.error("Event not found");
            navigate("/user/dashboard");
        }
    }, [eventId, location, navigate]);

    const toggleSave = () => {
        const savedItems = JSON.parse(localStorage.getItem('saved') || '[]');
        if (isSaved) {
            const newSaved = savedItems.filter(item => String(item.id) !== String(event.id));
            localStorage.setItem('saved', JSON.stringify(newSaved));
            setIsSaved(false);
            toast.success("Removed from collection");
        } else {
            const itemToSave = {
                id: event.id,
                title: event.title,
                location: event.eventLocation || "Venue TBD",
                date: event.date,
                price: event.price,
                image: event.image,
                status: "Saved"
            };
            localStorage.setItem('saved', JSON.stringify([...savedItems, itemToSave]));
            setIsSaved(true);
            toast.success("Saved to collection");
        }
        window.dispatchEvent(new Event('savedUpdated'));
    };

    if (!event) return null;

    // Simulate available tickets logic
    const availableTickets = event.id > 100 ? 50 : 150;

    // Helper to parse price reliably
    const getNumericPrice = (p) => {
        if (!p || typeof p !== 'string') return 0;
        const numeric = p.replace(/[^0-9.]/g, '');
        return numeric ? parseFloat(numeric) : 0;
    };

    const handleQuantityChange = (categoryName, delta) => {
        setTicketSelection(prev => {
            const currentQty = prev[categoryName] || 0;
            const newQty = Math.max(0, currentQty + delta);

            // Optional: Check total available tickets limit if needed
            // const totalSelected = Object.values(prev).reduce((a, b) => a + b, 0) - currentQty + newQty;
            // if (totalSelected > availableTickets) return prev;

            return { ...prev, [categoryName]: newQty };
        });
    };

    const calculateTotal = () => {
        if (!event.categories) return 0;
        return event.categories.reduce((total, cat) => {
            const qty = ticketSelection[cat.name] || 0;
            const price = getNumericPrice(cat.price);
            return total + (price * qty);
        }, 0);
    };

    const getTotalTickets = () => {
        return Object.values(ticketSelection).reduce((a, b) => a + b, 0);
    };

    const handleProceed = () => {
        const totalTickets = getTotalTickets();
        if (totalTickets === 0) {
            return;
        }

        // Pass selection state to checkout (could use location state or query params)
        // For query params, we might need a serialized format if complex
        const selectionParam = JSON.stringify(ticketSelection);
        navigate(`/user/checkout/${event.id}?qty=${totalTickets}&category=${encodeURIComponent(Object.keys(ticketSelection)[0] || 'General')}`, {
            state: { event },
        });
    };

    return (
        <div className="min-h-screen bg-[#EBF4F6] flex flex-col font-sans text-[#0b2d49] pt-28">
            <Toaster position="top-center" />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-12 pb-20">
                {/* Back Link */}
                <Link to="/user/dashboard" className="inline-flex items-center gap-2 text-[#09637E]/60 hover:text-[#09637E] font-bold text-xs uppercase tracking-widest mb-8 transition-colors group">
                    <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Selection
                </Link>

                {/* Hero Section */}
                <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl mb-16 group">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09637E]/90 via-[#09637E]/20 to-transparent"></div>

                    {/* Save Button */}
                    <button
                        onClick={toggleSave}
                        className="absolute top-10 right-10 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white hover:text-[#09637E] text-white transition-all shadow-lg active:scale-95 z-20 group/save"
                    >
                        {isSaved ? <BsBookmarkHeartFill size={24} className="text-[#09637E]" /> : <BsBookmarkHeart size={24} />}
                    </button>

                    <div className="absolute bottom-12 left-12 right-12 text-white">
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-6 inline-block">
                            Bespoke Experience
                        </span>
                        <h1 className="text-6xl md:text-8xl font-serif-premium italic mb-2 tracking-tight drop-shadow-lg leading-none">{event.title}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left: Content */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* About Section */}
                        <div>
                            <p className="text-[#09637E] font-black text-xs uppercase tracking-widest mb-6">About The Event</p>
                            <div className="text-[#0b2d49]/80 leading-loose text-lg font-serif-premium">
                                <span className="float-left text-7xl font-serif-premium text-[#09637E] mr-4 mt-[-10px] leading-none">
                                    {event.title.charAt(0)}
                                </span>
                                {aboutParagraphs.length > 0 ? (
                                    aboutParagraphs.map((paragraph, idx) => (
                                        <p key={`${event.id}-about-${idx}`} className={idx > 0 ? "mt-6" : ""}>
                                            {paragraph}
                                        </p>
                                    ))
                                ) : (
                                    <p>{`Experience an unparalleled night of elegance at ${event.title}.`}</p>
                                )}
                            </div>
                        </div>

                        {/* Venue Section */}
                        <div>
                            <p className="text-[#09637E] font-black text-xs uppercase tracking-widest mb-8">The Venue</p>
                            <div className="flex justify-between items-end gap-8 border-b border-[#09637E]/20 pb-8">
                                <div className="max-w-[68%]">
                                    <h3 className="text-2xl md:text-3xl font-serif-premium text-[#0b2d49] italic leading-tight">{venueName}</h3>
                                </div>
                                <div className="text-right shrink-0">
                                    <h3 className="text-3xl font-serif-premium text-[#0b2d49] italic mb-2">{eventDateText}</h3>
                                    <p className="text-sm text-[#09637E]/60 font-medium">{eventTimeText}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Booking Sidebar */}
                    <div className="lg:sticky lg:top-32 space-y-8 h-fit">
                        <TicketSelector
                            event={event}
                            ticketSelection={ticketSelection}
                            handleQuantityChange={handleQuantityChange}
                            availableTickets={availableTickets}
                            totalPrice={calculateTotal()}
                        />

                        <button
                            onClick={handleProceed}
                            disabled={getTotalTickets() === 0}
                            className="w-full py-5 bg-[#09637E] text-white font-black rounded-[1.5rem] shadow-xl shadow-[#09637E]/20 hover:bg-[#074d63] hover:-translate-y-1 transition-all active:scale-[0.98] text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100"
                        >
                            Proceed to Booking <BsArrowLeft className="rotate-180" size={16} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EventDetails;
