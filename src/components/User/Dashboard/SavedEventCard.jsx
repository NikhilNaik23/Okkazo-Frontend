import React from 'react';
import { Link } from 'react-router-dom';

const SavedEventCard = ({ item }) => {
    return (
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-[30px] shadow-sm hover:shadow-lg transition-all group border border-[#09637E]/5">
            {/* Image Circle */}
            <div className="relative w-24 h-24 shrink-0">
                <div className="absolute inset-0 rounded-full border-4 border-[#EBF4F6] shadow-inner overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#7AB2B2]/20 text-[#09637E]">
                        Saved
                    </span>
                </div>
                <h3 className="text-2xl font-serif-premium text-[#09637E] mb-1">{item.title}</h3>
                <p className="text-xs text-[#088395] font-medium">{item.location} • {item.date}</p>
            </div>

            {/* Price & Action */}
            <div className="flex flex-col items-end gap-3 min-w-[140px]">
                {item.price && (
                    <p className="text-sm font-black text-[#09637E]/60 uppercase tracking-widest text-right w-full mb-1">
                        {item.price}
                    </p>
                )}
                <Link to={`/user/event/${item.id}`} className="w-full">
                    <button className="px-6 py-3 bg-[#09637E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#088395] transition-all shadow-lg w-full">
                        View and Book Event
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default SavedEventCard;
