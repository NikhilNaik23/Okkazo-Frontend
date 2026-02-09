import React, { useRef } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import EventCard from "./EventCard";

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

export default EventRow;
