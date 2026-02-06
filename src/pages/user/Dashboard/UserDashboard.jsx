import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BsPlayFill, BsInfoCircle, BsChevronLeft, BsChevronRight, BsGeoAlt, BsCalendarEvent, BsTicketPerforated } from "react-icons/bs";
import { popularEvents, allEvents } from "../../../data/eventsData";
import { selectUser } from "../../../store/slices/authSlice";

// --- Components ---

const HeroSlider = ({ events }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % events.length);
        }, 5000); // Auto-scroll every 5 seconds
        return () => clearInterval(interval);
    }, [events.length]);

    const currentEvent = events[currentIndex];

    if (!currentEvent) return null;

    return (
        <div id="dashboard-hero" className="relative h-screen w-full overflow-hidden group">
            {/* Background Image with Smooth Transition */}
            <div className="absolute inset-0 bg-black">
                {events.map((event, index) => (
                    <div
                        key={event.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-linear"
                        />
                    </div>
                ))}
                {/* Subtle Gradient for Text Readability Only */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent opacity-80 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#EBF4F6] via-transparent to-transparent opacity-20 pointer-events-none"></div>
            </div>

            {/* Fixed Tags Position - Top Left */}
            <div className="absolute top-28 md:top-32 left-8 md:left-16 lg:left-24 z-20 flex items-center gap-3 animate-slide-down">
                <span className="px-3 py-1 rounded-full bg-[#09637E] text-white text-xs font-black tracking-widest uppercase shadow-lg shadow-[#09637E]/40">
                    Trending Now
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                    {currentEvent.tag}
                </span>
            </div>

            {/* Right Side Content - Title, Date, Desc, Buttons */}
            <div className="absolute top-0 right-0 w-full md:w-2/3 h-full flex flex-col justify-start items-end px-8 md:px-16 lg:px-24 z-10 pt-28 md:pt-32 pointer-events-none">
                <div className="pointer-events-auto flex flex-col items-end space-y-6">

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight drop-shadow-2xl animate-slide-up text-right">
                        {currentEvent.title}
                    </h1>

                    <div className="flex items-center gap-6 text-white/90 text-lg font-medium animate-fade-in delay-100 justify-end">
                        <div className="flex items-center gap-2">
                            <BsCalendarEvent className="text-[#7AB2B2]" />
                            <span>{currentEvent.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BsGeoAlt className="text-[#7AB2B2]" />
                            <span>{currentEvent.location}</span>
                        </div>
                    </div>

                    <div className="max-w-xl bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl animate-fade-in delay-200 text-right">
                        <p className="text-white text-lg md:text-xl font-light leading-relaxed drop-shadow-md">
                            Experience the ultimate {currentEvent.tag} event.
                            Join thousands of others for an unforgettable moment tailored just for you.
                            Tickets starting at <span className="font-bold text-[#7AB2B2]">{currentEvent.price}</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 animate-fade-in delay-300 pt-2">
                        <button
                            onClick={() => navigate(`/user/event/${currentEvent.id}`)}
                            className="flex items-center gap-3 px-8 py-5 bg-[#09637E] text-white rounded-xl hover:bg-[#088395] transition-all transform hover:scale-105 hover:shadow-lg font-black text-lg border border-white/10"
                        >
                            <BsTicketPerforated size={22} /> Get Tickets
                        </button>
                        <button
                            onClick={() => navigate(`/user/event/${currentEvent.id}`)}
                            className="flex items-center gap-3 px-8 py-5 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-bold text-lg backdrop-blur-md"
                        >
                            More Info
                        </button>
                    </div>
                </div>
            </div>

            {/* Pagination Indicators */}
            <div className="absolute bottom-10 right-12 flex gap-3 z-20">
                {events.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-500 ease-out ${idx === currentIndex ? 'w-12 bg-[#7AB2B2] shadow-[0_0_10px_#7AB2B2]' : 'w-3 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const EventCard = ({ event, rank, isTopTen }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/user/event/${event.id}`)}
            className={`flex-none ${isTopTen ? 'w-[280px] md:w-[320px] aspect-video' : 'w-[200px] md:w-[240px] aspect-[2/3]'} relative group cursor-pointer transition-all duration-300 hover:z-50 hover:scale-105 ${isTopTen ? 'ml-16 md:ml-20' : ''}`}
        >
            {/* Rank Number for Top 10 */}
            {isTopTen && (
                <span className="absolute -left-16 -bottom-8 text-[10rem] font-black text-[#09637E] leading-none z-0 opacity-100 drop-shadow-lg select-none scale-y-110 tracking-tighter"
                    style={{ WebkitTextStroke: '2px white' }}>
                    {rank}
                </span>
            )}

            <div className={`relative h-full w-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-[0_0_30px_rgba(9,99,126,0.3)] z-10 bg-[#09637E] ring-1 ring-white/10 transition-all duration-300`}>
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />

                {/* Brand-style Hover Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-[#09637E] via-[#09637E]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#EBF4F6] text-xs font-bold uppercase tracking-wider">{event.date}</span>
                        </div>

                        <h3 className="text-white font-black text-lg leading-snug mb-1 drop-shadow-md">{event.title}</h3>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                            <span className="text-[#7AB2B2] font-bold text-sm bg-[#09637E]/50 px-2 py-0.5 rounded">{event.price}</span>
                            <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{event.tag}</span>
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                {event.status && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-[#09637E]/90 backdrop-blur text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wide border border-white/10">
                        {event.status}
                    </div>
                )}
            </div>
        </div>
    );
};

const EventRow = ({ title, events, isTopTen = false }) => {
    const rowRef = useRef(null);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = direction === 'left'
                ? -current.offsetWidth / 2
                : current.offsetWidth / 2;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className={`py-8 relative group/row ${isTopTen ? 'overflow-y-hidden' : ''}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-[#09637E] mb-4 px-4 md:px-12 flex items-center gap-3">
                {title}
                <BsChevronRight className="text-sm mt-1 opacity-0 group-hover/row:opacity-100 transition-opacity text-[#088395] font-black" />
            </h2>

            <div className="relative group/slider">
                {/* Left Arrow */}
                <button
                    className="absolute left-0 top-0 bottom-0 z-40 w-12 flex items-center justify-center hidden md:flex opacity-0 group-hover/slider:opacity-100 transition-all text-[#09637E] hover:scale-125 hover:text-[#088395]"
                    onClick={() => scroll('left')}
                >
                    <BsChevronLeft size={40} />
                </button>

                {/* Scrollable Container */}
                <div
                    ref={rowRef}
                    className="flex overflow-x-auto gap-5 px-4 md:px-12 pb-8 scrollbar-hide scroll-smooth scroll-p-12 items-center"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {events.map((event, idx) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            rank={idx + 1}
                            isTopTen={isTopTen}
                        />
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    className="absolute right-0 top-0 bottom-0 z-40 w-12 flex items-center justify-center hidden md:flex opacity-0 group-hover/slider:opacity-100 transition-all text-[#09637E] hover:scale-125 hover:text-[#088395]"
                    onClick={() => scroll('right')}
                >
                    <BsChevronRight size={40} />
                </button>
            </div>
        </div>
    );
};

// --- Main Dashboard ---

const UserDashboard = () => {
    const user = useSelector(selectUser);

    // Grouping events
    const topTenEvents = allEvents.slice(0, 10);
    const musicEvents = allEvents.filter(e => ['Music', 'Concert', 'Festival', 'Entertainment'].includes(e.tag));
    const businessEvents = allEvents.filter(e => ['Business', 'Tech', 'Conference', 'Workshop'].includes(e.tag));
    const creativeEvents = allEvents.filter(e => ['Art', 'Arts', 'Painting', 'Photography'].includes(e.tag));

    return (
        <div className="min-h-screen bg-[#EBF4F6] pb-20 overflow-x-hidden overflow-y-hidden">
            {/* Hero Section */}
            <HeroSlider events={popularEvents} />

            {/* Content Stacks */}
            <div className="relative z-30 space-y-8 px-4 md:px-8 mt-8 pb-12">
                <EventRow title="Top 10 Trending Events Near You" events={topTenEvents} isTopTen={true} />
                <EventRow title="Music & Entertainment" events={musicEvents} />
                <EventRow title="Business & Technology" events={businessEvents} />
                <EventRow title="Creative Arts & Culture" events={creativeEvents} />

                {/* "Because you watched..." style recommendation but statically named for now */}
                <EventRow title="Recommended for You" events={[...allEvents].reverse().slice(0, 8)} />
            </div>
        </div>
    );
};

export default UserDashboard;
