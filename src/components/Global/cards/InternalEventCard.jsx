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
    <div className="group relative w-full h-[380px] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 flex flex-col">
      
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
          <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            {category}
          </span>
          <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium text-white shadow-sm border border-white/10">
            {status}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-gray-900 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
            {title}
            </h2>
        </div>

        {/* Organizer Info */}
        <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs font-medium border-b border-gray-50 pb-3">
          <div className="flex items-center gap-1">
            <User size={14} className="text-indigo-500" />
            <span className="text-gray-700 truncate max-w-[100px]">{organizer}</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-gray-400" />
            <span className="truncate max-w-[80px]">{location}</span>
          </div>
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 group-hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-1.5 mb-0.5 text-gray-400">
                <Calendar size={12} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Event Date</span>
            </div>
            <p className="text-xs font-bold text-gray-900 truncate">{eventDate}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 group-hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-1.5 mb-0.5 text-gray-400">
                <Clock size={12} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Submitted</span>
            </div>
            <p className="text-xs font-bold text-gray-900 truncate">{submittedDate}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={onVerify}
            className="flex-1 bg-gray-900 hover:bg-indigo-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 shadow-md shadow-gray-200 hover:shadow-indigo-500/20 flex items-center justify-center gap-1.5 group/btn text-xs"
          >
            <ShieldCheck size={14} />
            <span>Verify</span>
          </button>
          
          <button 
            onClick={onDetails}
            className="w-10 flex items-center justify-center border border-gray-200 hover:border-indigo-200 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition-all duration-300"
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