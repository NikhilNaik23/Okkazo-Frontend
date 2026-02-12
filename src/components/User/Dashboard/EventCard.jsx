import React from "react";
import { useNavigate } from "react-router-dom";

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

                        <h3 className="text-white font-serif-premium italic text-lg leading-snug mb-1 drop-shadow-md">{event.title}</h3>

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

export default EventCard;
