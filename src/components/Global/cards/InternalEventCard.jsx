import React from 'react';
import { MdPerson } from 'react-icons/md';

const InternalEventCard = ({ 
  image = '/static/images/event-placeholder.jpg',
  category = 'MUSIC FESTIVAL',
  title = 'Summer Soundwaves 2024',
  organizer = 'Vibe Entertainment Co.',
  eventDate = 'Aug 12, 2024',
  submittedDate = 'Oct 24, 09:45 AM',
  onVerify,
  onDetails
}) => {
  return (
    <div className="max-w-[460px] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Image Section with Badges */}
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-[280px] object-cover"
        />
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
          <span className="bg-white px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide">
            {category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-3xl font-semibold text-gray-900 mb-3">
          {title}
        </h2>

        {/* Organizer */}
        <div className="flex items-center gap-2 mb-6 text-teal-600">
          <MdPerson className="text-xl" />
          <span className="text-base font-medium">{organizer}</span>
        </div>

        {/* Date Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-bold text-gray-900 uppercase mb-1">EVENT DATE</p>
            <p className="text-lg text-teal-600 font-medium">{eventDate}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-900 uppercase mb-1">SUBMITTED</p>
            <p className="text-lg text-teal-600 font-medium">{submittedDate}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={onVerify}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors"
          >
            Verify Now
          </button>
          <button 
            onClick={onDetails}
            className="px-8 py-3.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalEventCard;