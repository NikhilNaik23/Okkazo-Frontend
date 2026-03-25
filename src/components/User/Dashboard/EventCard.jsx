import React from "react";
import { useNavigate } from "react-router-dom";

const EventCard = ({ event, rank, isTopTen }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/user/event/${event.id}`, { state: { event } })}
            className={`flex-none ${isTopTen ? 'w-[280px] md:w-[320px] aspect-[4/5]' : 'w-[280px] md:w-[320px] aspect-[4/5]'} relative group cursor-pointer transition-all duration-500 hover:z-50 hover:-translate-y-2 ${isTopTen ? 'ml-16 md:ml-20' : ''}`}
        >
            {/* Rank Number for Top 10 */}
            {isTopTen && (
                <span className="absolute -left-16 bottom-0 text-[10rem] font-black text-[#09637E] leading-none z-0 opacity-100 drop-shadow-lg select-none scale-y-110 tracking-tighter"
                    style={{ WebkitTextStroke: '2px white' }}>
                    {rank}
                </span>
            )}

            <div className={`relative h-full w-full rounded-[2rem] overflow-hidden shadow-lg group-hover:shadow-2xl z-10 bg-[#09637E] transition-all duration-500`}>
                <img
                    src={event.image}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] via-[#09637E]/40 to-transparent opacity-90 transition-opacity duration-300" />

                {/* Status Badge */}
                {event.status && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black rounded-xl shadow-lg uppercase tracking-wide border border-white/20">
                        {event.status}
                    </div>
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
                    <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
                                {event.date}
                            </span>
                        </div>

                        <h3 className="text-white font-serif-premium italic text-2xl leading-tight mb-2 drop-shadow-sm group-hover:translate-x-1 transition-transform duration-300">
                            {event.title}
                        </h3>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
                            <span className="text-secondary font-black text-lg drop-shadow-md">{event.price}</span>
                            <span className="text-[9px] text-white/60 font-black uppercase tracking-[0.2em]">{event.tag}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
