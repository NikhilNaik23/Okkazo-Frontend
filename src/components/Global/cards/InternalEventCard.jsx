import React from 'react';
import { Calendar, Clock, User, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';

const InternalEventCard = ({ 
  image = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000&auto=format&fit=crop', // Better placeholder
  category = 'Music Festival',
  title = 'Summer Soundwaves 2024',
  organizer = 'Vibe Entertainment Co.',
  location = 'Austin, TX',
  eventDate = 'Aug 12, 2024',
  submittedDate = 'Oct 24, 09:45 AM',
  status = 'Pending Review',
  onVerify,
  onDetails
}) => {
  return (
    <div className="group relative w-full h-[380px] bg-white rounded-2xl overflow-hidden border border-[#e9eff1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 flex flex-col">
      
      {/* Image Section */}
      <div className="relative h-[160px] w-full shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60 transition-opacity group-hover:opacity-40" />
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
          <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#0b2d49] shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d7a444] animate-pulse"></span>
            {category}
          </span>
          <span className="bg-[#0b2d49]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium text-white shadow-sm border border-white/10">
            {status}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-[#0b2d49] leading-tight tracking-tight group-hover:text-[#d7a444] transition-colors line-clamp-1">
            {title}
            </h2>
        </div>

        {/* Organizer Info */}
        <div className="flex items-center gap-2 mb-3 text-[#5a5b44] text-xs font-medium border-b border-[#e9eff1] pb-3">
          <div className="flex items-center gap-1">
            <User size={14} className="text-[#d7a444]" />
            <span className="text-[#0b2d49] truncate max-w-[100px]">{organizer}</span>
          </div>
          <span className="text-[#e9eff1]">•</span>
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-[#708aa0]" />
            <span className="truncate max-w-[80px] text-[#5a5b44]">{location}</span>
          </div>
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#e9eff1]/30 rounded-lg p-2 border border-[#e9eff1] group-hover:border-[#d7a444]/30 transition-colors">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#708aa0]">
                <Calendar size={12} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Event Date</span>
            </div>
            <p className="text-xs font-bold text-[#0b2d49] truncate">{eventDate}</p>
          </div>
          <div className="bg-[#e9eff1]/30 rounded-lg p-2 border border-[#e9eff1] group-hover:border-[#d7a444]/30 transition-colors">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#708aa0]">
                <Clock size={12} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Submitted</span>
            </div>
            <p className="text-xs font-bold text-[#0b2d49] truncate">{submittedDate}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={onVerify}
            className="flex-1 bg-[#0b2d49] hover:bg-[#d7a444] text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 shadow-md shadow-[#0b2d49]/10 hover:shadow-[#d7a444]/20 flex items-center justify-center gap-1.5 group/btn text-xs"
          >
            <ShieldCheck size={14} />
            <span>Verify</span>
          </button>
          
          <button 
            onClick={onDetails}
            className="w-10 flex items-center justify-center border border-[#e9eff1] hover:border-[#d7a444] text-[#708aa0] hover:text-[#d7a444] hover:bg-[#f3ddb1]/20 font-semibold rounded-lg transition-all duration-300"
            aria-label="View Details"
          >
           <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalEventCard;