import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsCalendarEvent, BsGeoAlt, BsTicketPerforated } from "react-icons/bs";

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
                <span className="px-3 py-1 rounded-full bg-[#09637E] text-white text-xs font-serif-premium italic tracking-widest uppercase shadow-lg shadow-[#09637E]/40">
                    Trending Now
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-serif-premium italic tracking-wider uppercase backdrop-blur-md">
                    {currentEvent.tag}
                </span>
            </div>

            {/* Right Side Content - Title, Date, Desc, Buttons */}
            <div className="absolute top-0 right-0 w-full md:w-2/3 h-full flex flex-col justify-start items-end px-8 md:px-16 lg:px-24 z-10 pt-28 md:pt-32 pointer-events-none">
                <div className="pointer-events-auto flex flex-col items-end space-y-6">

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif-premium italic text-white leading-none tracking-tight drop-shadow-2xl animate-slide-up text-right">
                        {currentEvent.title}
                    </h1>

                    <div className="flex items-center gap-6 text-white/90 text-lg font-serif-premium italic animate-fade-in delay-100 justify-end">
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
                        <p className="text-white text-lg md:text-xl font-serif-premium italic leading-relaxed drop-shadow-md">
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

export default HeroSlider;
