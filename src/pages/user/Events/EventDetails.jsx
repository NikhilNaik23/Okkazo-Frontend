import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { BsArrowLeft, BsCheckCircleFill, BsBookmarkHeart, BsBookmarkHeartFill } from "react-icons/bs";
import { allEvents, popularEvents } from "../../../data/eventsData";
import { toast, Toaster } from "react-hot-toast";
import EventInfoGrid from "../../../components/User/Events/EventInfoGrid";
import TicketSelector from "../../../components/User/Events/TicketSelector";

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

const normalizeDayKey = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const day = raw.includes("T") ? raw.slice(0, 10) : raw;
    return DAY_KEY_RE.test(day) ? day : "";
};

const formatTicketDayLabel = (dayValue) => {
    const key = normalizeDayKey(dayValue);
    if (!key) return "Date TBA";

    const [yy, mm, dd] = key.split("-").map((v) => Number(v));
    const dt = new Date(Date.UTC(yy, (mm || 1) - 1, dd || 1));
    if (Number.isNaN(dt.getTime())) return key;

    return dt.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
};

const normalizeEventForTicketing = (rawEvent) => {
    const eventWithCategories = { ...(rawEvent || {}) };

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

    const rows = Array.isArray(eventWithCategories?.ticketDayWiseAllocations)
        ? eventWithCategories.ticketDayWiseAllocations
        : (Array.isArray(eventWithCategories?.raw?.tickets?.dayWiseAllocations)
            ? eventWithCategories.raw.tickets.dayWiseAllocations
            : []);

    eventWithCategories.ticketDayWiseAllocations = rows
        .map((row) => {
            const day = normalizeDayKey(row?.day);
            if (!day) return null;

            const ticketCountRaw = Number(row?.ticketCount || 0);
            const ticketCount = Number.isFinite(ticketCountRaw) && ticketCountRaw > 0 ? ticketCountRaw : 0;

            const tierBreakdown = (Array.isArray(row?.tierBreakdown) ? row.tierBreakdown : [])
                .map((tier) => {
                    const name = String(tier?.name || tier?.tierName || "").trim();
                    if (!name) return null;

                    const countRaw = Number(tier?.ticketCount ?? tier?.noOfTickets ?? tier?.available ?? tier?.quantity ?? 0);
                    const tierCount = Number.isFinite(countRaw) && countRaw > 0 ? countRaw : 0;
                    const priceRaw = Number(tier?.price || 0);
                    const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0;

                    return {
                        name,
                        ticketCount: tierCount,
                        price,
                    };
                })
                .filter(Boolean);

            return {
                day,
                ticketCount,
                tierBreakdown,
            };
        })
        .filter(Boolean)
        .sort((a, b) => String(a.day).localeCompare(String(b.day)));

    return eventWithCategories;
};

const EventDetails = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [event, setEvent] = useState(null);
    const [ticketSelection, setTicketSelection] = useState({}); // { "Category A": 2, "Category B": 0 }
    const [selectedTicketDay, setSelectedTicketDay] = useState("");
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
            const eventWithCategories = normalizeEventForTicketing(stateEvent);
            setEvent(eventWithCategories);

            const savedItems = JSON.parse(localStorage.getItem('saved') || '[]');
            setIsSaved(savedItems.some(item => String(item.id) === String(eventWithCategories.id)));
            return;
        }

        const combinedEvents = [...allEvents, ...popularEvents];
        const foundEvent = combinedEvents.find(e => String(e.id) === String(eventId));
        if (foundEvent) {
            const eventWithCategories = normalizeEventForTicketing(foundEvent);
            setEvent(eventWithCategories);
            // Check if saved
            const savedItems = JSON.parse(localStorage.getItem('saved') || '[]');
            setIsSaved(savedItems.some(item => String(item.id) === String(foundEvent.id)));
        } else {
            toast.error("Event not found");
            navigate("/user/dashboard");
        }
    }, [eventId, location, navigate]);

    useEffect(() => {
        if (!event) return;

        const rows = Array.isArray(event?.ticketDayWiseAllocations) ? event.ticketDayWiseAllocations : [];
        const firstDay = rows.length > 0 ? normalizeDayKey(rows[0]?.day) : "";

        setSelectedTicketDay((prev) => {
            const current = normalizeDayKey(prev);
            if (current && rows.some((row) => normalizeDayKey(row?.day) === current)) return current;
            return firstDay;
        });

        setTicketSelection({});
    }, [event?.id]);

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

    const dayWiseAllocations = Array.isArray(event?.ticketDayWiseAllocations)
        ? event.ticketDayWiseAllocations
        : [];
    const hasDayWiseTicketing = dayWiseAllocations.length > 0;

    const normalizedSelectedDay = normalizeDayKey(selectedTicketDay);
    const activeDayAllocation = hasDayWiseTicketing
        ? (dayWiseAllocations.find((row) => normalizeDayKey(row?.day) === normalizedSelectedDay) || dayWiseAllocations[0])
        : null;
    const activeDayKey = normalizeDayKey(activeDayAllocation?.day);

    // Helper to parse price reliably
    const getNumericPrice = (p) => {
        if (p == null) return 0;
        if (typeof p === 'number') return Number.isFinite(p) ? p : 0;
        if (typeof p !== 'string') return 0;
        const numeric = p.replace(/[^0-9.]/g, '');
        return numeric ? parseFloat(numeric) : 0;
    };

    const categoriesForSelection = useMemo(() => {
        const fallbackCategories = Array.isArray(event?.categories) ? event.categories : [];

        if (!activeDayAllocation || !Array.isArray(activeDayAllocation?.tierBreakdown) || activeDayAllocation.tierBreakdown.length === 0) {
            return fallbackCategories.map((cat) => ({ ...cat, available: null }));
        }

        const priceByTierName = new Map(
            fallbackCategories.map((cat) => [String(cat?.name || '').trim().toLowerCase(), cat?.price])
        );

        return activeDayAllocation.tierBreakdown
            .map((tier) => {
                const name = String(tier?.name || '').trim();
                if (!name) return null;

                const availableRaw = Number(tier?.ticketCount || 0);
                const available = Number.isFinite(availableRaw) && availableRaw > 0 ? availableRaw : 0;
                const fallbackPrice = priceByTierName.get(name.toLowerCase());
                const numericPrice = Number(tier?.price || 0);
                const price = fallbackPrice || (numericPrice > 0 ? `₹${numericPrice.toLocaleString('en-IN')}` : 'Free');

                return {
                    name,
                    price,
                    available,
                };
            })
            .filter(Boolean);
    }, [event?.categories, activeDayAllocation]);

    const categoryAvailabilityByName = useMemo(() => {
        const out = new Map();
        for (const cat of categoriesForSelection) {
            const key = String(cat?.name || '').trim();
            if (!key) continue;
            const availableRaw = Number(cat?.available);
            if (Number.isFinite(availableRaw) && availableRaw >= 0) {
                out.set(key, Math.floor(availableRaw));
            }
        }
        return out;
    }, [categoriesForSelection]);

    const baseAvailableTicketsRaw = Number(event?.raw?.tickets?.noOfTickets ?? event?.raw?.tickets?.totalTickets ?? 0);
    const baseAvailableTickets = Number.isFinite(baseAvailableTicketsRaw) && baseAvailableTicketsRaw > 0
        ? Math.floor(baseAvailableTicketsRaw)
        : 0;
    const availableTickets = activeDayAllocation
        ? Math.max(0, Number(activeDayAllocation?.ticketCount || 0))
        : baseAvailableTickets;

    const handleQuantityChange = (categoryName, delta, maxAvailableForCategory = null) => {
        setTicketSelection(prev => {
            const currentQty = prev[categoryName] || 0;
            const newQty = Math.max(0, currentQty + delta);

            if (delta > 0 && Number.isFinite(Number(maxAvailableForCategory)) && Number(maxAvailableForCategory) >= 0) {
                if (newQty > Number(maxAvailableForCategory)) {
                    return prev;
                }
            }

            const totalBefore = Object.values(prev).reduce((sum, qty) => sum + Number(qty || 0), 0);
            const totalAfter = totalBefore - currentQty + newQty;
            if (availableTickets > 0 && totalAfter > availableTickets) {
                return prev;
            }

            return { ...prev, [categoryName]: newQty };
        });
    };

    const calculateTotal = () => {
        if (!categoriesForSelection.length) return 0;
        return categoriesForSelection.reduce((total, cat) => {
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

        if (hasDayWiseTicketing && !activeDayKey) {
            toast.error('Please select an event date before booking tickets');
            return;
        }

        const selectedEntries = Object.entries(ticketSelection).filter(([, qty]) => Number(qty || 0) > 0);
        const primaryCategory = selectedEntries[0]?.[0] || 'General';

        const query = hasDayWiseTicketing && activeDayKey
            ? `?qty=${totalTickets}&category=${encodeURIComponent(primaryCategory)}&day=${encodeURIComponent(activeDayKey)}`
            : `?qty=${totalTickets}&category=${encodeURIComponent(primaryCategory)}`;

        const checkoutEvent = {
            ...event,
            categories: categoriesForSelection,
            date: hasDayWiseTicketing && activeDayKey ? formatTicketDayLabel(activeDayKey) : event.date,
        };

        navigate(`/user/checkout/${event.id}${query}`, {
            state: {
                event: checkoutEvent,
                ticketSelection,
                selectedTicketDay: hasDayWiseTicketing ? activeDayKey : null,
            },
        });
    };

    const displayEventDateText = hasDayWiseTicketing && activeDayKey
        ? formatTicketDayLabel(activeDayKey).toUpperCase()
        : eventDateText;

    if (!event) return null;

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
                                    <h3 className="text-3xl font-serif-premium text-[#0b2d49] italic mb-2">{displayEventDateText}</h3>
                                    <p className="text-sm text-[#09637E]/60 font-medium">{eventTimeText}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Booking Sidebar */}
                    <div className="lg:sticky lg:top-32 space-y-8 h-fit">
                        <TicketSelector
                            event={event}
                            categories={categoriesForSelection}
                            ticketSelection={ticketSelection}
                            handleQuantityChange={handleQuantityChange}
                            availableTickets={availableTickets}
                            totalPrice={calculateTotal()}
                            ticketDayWiseAllocations={dayWiseAllocations}
                            selectedTicketDay={activeDayKey}
                            onSelectTicketDay={(day) => {
                                setSelectedTicketDay(day);
                                setTicketSelection({});
                            }}
                            categoryAvailabilityByName={categoryAvailabilityByName}
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
