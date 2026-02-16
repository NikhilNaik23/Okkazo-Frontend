import React from 'react';
import { BsGeoAlt, BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { getCardGradient } from '../../../data/myEventsDashboardData';

const OrganizedEventCard = ({ event, idx }) => {
    const navigate = useNavigate();

    return (
        <div className="group relative h-[500px] bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-12px_rgba(9,99,126,0.2)] transition-all duration-500 border border-[#7AB2B2]/10">
            {/* Image & Gradient */}
            <div className="absolute inset-0">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className={`absolute inset-0 transition-opacity duration-500 ${getCardGradient(idx)}`} />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
                {/* Top Actions */}
                <div className="flex justify-between items-start">
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${event.status === 'Live' ? 'bg-[#7AB2B2] text-[#09637E]' :
                        event.status === 'Pending Approval' ? 'bg-[#EBF4F6] text-[#09637E]' :
                            event.status === 'Immediate Action' ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' :
                                event.status === 'Draft' ? 'bg-gray-100 text-gray-500 border border-gray-200' :
                                    'bg-slate-500/50 backdrop-blur-md text-white'
                        }`}>
                        {event.status === 'Live' && <span className="w-1.5 h-1.5 bg-[#09637E] rounded-full animate-pulse" />}
                        {event.status === 'Live' ? 'Live Event' : event.status}
                    </span>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-white/20 text-white transition-all">
                        <BsThreeDotsVertical />
                    </button>
                </div>

                {/* Center/Bottom Info */}
                <div className="mb-4 drop-shadow-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#EBF4F6] mb-2 opacity-90">{event.date}</p>
                    <h3 className="text-3xl font-serif-premium italic mb-4 leading-[1.1] text-white">{event.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                        <BsGeoAlt /> {event.location}
                    </div>
                </div>

                {/* Bottom Action Area */}
                <div className="pt-6 border-t border-white/20 flex items-center justify-between">
                    <div className="drop-shadow-sm min-h-[40px]">
                        {event.formData?.listingType !== 'Private' && (
                            <>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Tickets Sold</p>
                                <p className="text-lg font-bold text-white">{event.sold}</p>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => navigate(`/user/planning-wizard?eventId=${event.id}`)}
                        className="px-6 py-2.5 bg-[#EBF4F6] text-[#09637E] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#7AB2B2] hover:text-white transition-colors shadow-lg"
                    >
                        Manage
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrganizedEventCard;
