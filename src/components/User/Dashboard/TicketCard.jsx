import React from 'react';
import { BsGeoAlt, BsQrCode } from 'react-icons/bs';
import { getCardGradient } from '../../../data/myEventsDashboardData';

const TicketCard = ({ ticket, idx }) => {
    const isCancelled = String(ticket?.ticketStatus || '').toUpperCase() === 'CANCELED'
        || String(ticket?.ticketStatus || '').toUpperCase() === 'CANCELLED';

    return (
        <div className="group relative h-[520px] rounded-[40px] overflow-hidden hover:-translate-y-2 transition-transform duration-500 shadow-xl cursor-pointer">
            {/* Background Image & Overlay */}
            <img src={ticket.image} alt={ticket.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 transition-opacity duration-300 ${getCardGradient(idx)}`} />

            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                {/* Date Badge */}
                <div className="flex justify-between items-start">
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 text-center min-w-[70px]">
                        <p className="text-[10px] font-black text-white/80 uppercase mb-0.5">{ticket.month}</p>
                        <p className="text-3xl font-serif-premium text-white leading-none">{ticket.day}</p>
                    </div>
                    <div className="w-8" />
                </div>

                {/* Content */}
                <div className="text-white drop-shadow-md">
                    <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-80 mb-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? 'bg-[#fecaca]' : 'bg-white'}`} />
                        {ticket.statusTag}
                    </p>
                    <h3 className="text-3xl font-serif-premium italic mb-4 leading-tight">{ticket.title}</h3>
                    <div className="flex items-center gap-2 text-xs opacity-80 mb-8">
                        <BsGeoAlt /> {ticket.location}
                    </div>
                    {ticket?.statusNote ? (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-90 mb-6">{ticket.statusNote}</p>
                    ) : null}

                    <button
                        onClick={() => window.location.href = `/user/ticket/${ticket.id}`}
                        className="w-full bg-[#EBF4F6] text-[#09637E] py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#7AB2B2] hover:text-white transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                        <BsQrCode size={16} />
                        {isCancelled ? 'View Details' : 'View Ticket'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
