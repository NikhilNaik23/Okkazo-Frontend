import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsCalendarEvent,
  BsGeoAlt,
  BsBriefcase,
  BsChatDots,
  BsCheckCircle,
  BsXCircle,
  BsEye,
  BsThreeDots,
  BsSend,
  BsSearch,
  BsBell
} from "react-icons/bs";
import { RiCloseLine } from "react-icons/ri";
import { toast } from "react-hot-toast";
import { initialBookedEvents } from "../../data/bookedEventsData";

const EventRequestsModal = ({ isOpen, onClose, requests, onAccept, onReject }) => {
  const navigate = useNavigate();
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b2d49]/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-[#f8faFC] rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in duration-300 border border-white/20" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-3xl font-black text-[#0b2d49] tracking-tight">Event Requests</h3>
            <p className="text-sm font-bold text-[#708aa0] uppercase tracking-widest mt-1">{requests.length} Pending requests</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#d7a444] transition-all p-2 rounded-xl hover:bg-gray-100">
            <RiCloseLine size={28} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {requests.length > 0 ? requests.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#708aa0]/10 transition-all hover:border-[#0b2d49]/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                  {/* Thumbnail & Date Box */}
                  <div className="relative shrink-0">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-20 h-20 rounded-[1.5rem] object-cover border-2 border-white shadow-md"
                    />
                    <div className="absolute -bottom-2 -right-2 flex flex-col items-center justify-center w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100">
                      <span className="text-[10px] font-black text-[#0b2d49] leading-none mb-0.5">{event.date}</span>
                      <span className="text-[6px] font-bold text-[#708aa0] uppercase">{event.month}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#0b2d49] mb-1">{event.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-[#708aa0]">
                      <span className="flex items-center gap-1"><BsCalendarEvent /> {event.category}</span>
                      <span className="flex items-center gap-1"><BsGeoAlt /> {event.location}</span>
                      <span className="flex items-center gap-1 text-[#0b2d49]"><BsBriefcase className="text-[#10b981]" /> {event.service}</span>
                    </div>
                  </div>
                </div>

                {rejectingId !== event.id ? (
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button
                      onClick={() => navigate(`/vendor/event/${event.id}`)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-gray-200 text-[#0b2d49] rounded-xl font-bold text-sm hover:border-[#0b2d49] transition-all flex items-center justify-center gap-2"
                    >
                      <BsEye />
                      Details
                    </button>
                    <button
                      onClick={() => setRejectingId(event.id)}
                      className="flex-1 md:flex-none px-6 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onAccept(event.id)}
                      className="flex-1 md:flex-none px-8 py-2.5 bg-[#0b2d49] text-white rounded-xl font-bold text-sm hover:bg-[#d7a444] transition-all shadow-lg shadow-[#0b2d49]/10 active:scale-95"
                    >
                      Accept Request
                    </button>
                  </div>
                ) : (
                  <div className="w-full md:w-[450px] animate-in slide-in-from-right-4">
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Please mention the reason for rejection..."
                          className="w-full p-4 rounded-xl bg-[#e9eff1]/50 border-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all resize-none text-sm font-medium h-24"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setRejectingId(null); setReason(""); }}
                          className="flex-1 py-2.5 bg-white border border-gray-200 text-[#708aa0] rounded-lg font-bold text-xs hover:border-[#708aa0] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={!reason.trim()}
                          onClick={() => {
                            onReject(event.id, reason);
                            setRejectingId(null);
                            setReason("");
                          }}
                          className={`flex-[2] py-2.5 rounded-lg font-bold text-xs text-white transition-all flex items-center justify-center gap-2 ${reason.trim() ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20" : "bg-gray-300 cursor-not-allowed"}`}
                        >
                          <BsSend size={14} />
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-[#e9eff1] rounded-full flex items-center justify-center text-[#708aa0] mb-6">
                <BsBell size={40} />
              </div>
              <h4 className="text-2xl font-black text-[#0b2d49]">All Caught Up!</h4>
              <p className="text-[#708aa0] font-bold mt-2">You don't have any pending event requests at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BookedEvents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [bookedEventsData, setBookedEventsData] = useState(initialBookedEvents);

  const stats = {
    pending: bookedEventsData.filter(e => e.status === "PENDING").length,
    confirmed: bookedEventsData.filter(e => e.status === "CONFIRMED").length
  };

  const filteredEvents = bookedEventsData.filter(event => {
    const isConfirmed = event.status === "CONFIRMED";
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return isConfirmed && matchesSearch;
  });

  const pendingRequests = bookedEventsData.filter(e => e.status === "PENDING");

  const handleAccept = (eventId) => {
    setBookedEventsData(prev => prev.map(event =>
      event.id === eventId ? { ...event, status: "CONFIRMED" } : event
    ));
    toast.success("Event request accepted successfully!", {
      style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' }
    });
  };

  const handleReject = (eventId, reason) => {
    setBookedEventsData(prev => prev.filter(event => event.id !== eventId));
    toast.error("Event request rejected. Reason: " + reason, {
      icon: '🚫',
      style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' }
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search Header */}
      <div className="mb-8 p-6 bg-white rounded-[2rem] shadow-sm border border-[#708aa0]/5 flex items-center gap-4">
        <BsSearch className="text-[#708aa0] ml-2" size={20} />
        <input
          type="text"
          placeholder="Search confirmed events by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold text-[#0b2d49] placeholder:text-[#708aa0]"
        />
      </div>

      {/* Header & Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0b2d49]">Booked Events</h1>
          <p className="text-sm font-bold text-[#708aa0] mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#0b2d49] rounded-full"></span>
            Manage your {stats.confirmed} confirmed event bookings
          </p>
        </div>

        <button
          onClick={() => setIsRequestsModalOpen(true)}
          className="relative group flex items-center gap-3 px-8 py-4 bg-[#0b2d49] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all active:scale-95"
        >
          <BsBell size={18} className={stats.pending > 0 ? "animate-bounce" : ""} />
          <span>Event Requests</span>
          {stats.pending > 0 && (
            <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full ring-4 ring-[#f8f9fa] shadow-lg">
              {stats.pending}
            </span>
          )}
        </button>
      </div>

      {/* Confirmed Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.length > 0 ? filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-[2.5rem] shadow-sm border border-[#708aa0]/5 hover:shadow-2xl hover:shadow-[#0b2d49]/10 transition-all duration-500 group overflow-hidden flex flex-col">
            {/* Image Header */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b2d49]/40 to-transparent"></div>
              <div className="absolute top-4 left-4 flex flex-col items-center justify-center w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
                <span className="text-lg font-black text-[#0b2d49] leading-none mb-0.5">{event.date}</span>
                <span className="text-[8px] font-bold text-[#708aa0] uppercase tracking-tighter">{event.month}</span>
              </div>

              {/* Manager Chat Notification Icon */}
              <div
                className="absolute top-4 right-4 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/vendor/event/${event.id}/chat`);
                }}
              >
                <div className="relative p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:bg-white transition-all text-[#0b2d49]">
                  <BsChatDots size={20} />
                  {event.managerUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                      {event.managerUnreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold px-3 py-1 bg-[#e9eff1] text-[#0b2d49] rounded-lg uppercase tracking-widest">
                  {event.category}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2.5 bg-gray-50 text-[#708aa0] rounded-xl hover:bg-[#0b2d49] hover:text-white transition-all">
                    <BsThreeDots />
                  </button>
                </div>
              </div>

              <h3
                className="text-xl font-black text-[#0b2d49] mb-4 line-clamp-2 leading-tight group-hover:text-[#d7a444] transition-colors cursor-pointer"
                onClick={() => navigate(`/vendor/event/${event.id}`)}
              >
                {event.title}
              </h3>

              <div className="space-y-4 mb-2">
                <div className="flex items-center gap-3 text-xs text-[#708aa0] font-bold">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <BsGeoAlt size={14} />
                  </div>
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#0b2d49] font-black">
                  <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center shrink-0">
                    <BsBriefcase size={14} className="text-[#10b981]" />
                  </div>
                  <span className="truncate">{event.service}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50/50 border-t border-gray-100">
              <button
                onClick={() => navigate(`/vendor/event/${event.id}`)}
                className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-bold text-sm hover:bg-[#d7a444] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#0b2d49]/10 active:scale-[0.98]"
              >
                <BsEye size={18} />
                View Event Details
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full p-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-[#708aa0]/10">
            <div className="w-24 h-24 bg-[#e9eff1] rounded-full flex items-center justify-center text-[#708aa0] mb-8">
              <BsCalendarEvent size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#0b2d49]">No Confirmed Events</h3>
            <p className="text-sm text-[#708aa0] font-bold mt-2 max-w-md mx-auto">
              When you accept event requests, they will appear here as confirmed bookings.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 text-[#d7a444] font-black text-sm hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredEvents.length > 0 && filteredEvents.length >= 3 && (
        <div className="mt-12 flex justify-center">
          <button className="px-10 py-4 bg-white border border-[#708aa0]/10 rounded-2xl text-[#0b2d49] font-black text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 shadow-sm">
            Load More Events
          </button>
        </div>
      )}

      {/* Event Requests Modal */}
      <EventRequestsModal
        isOpen={isRequestsModalOpen}
        onClose={() => setIsRequestsModalOpen(false)}
        requests={pendingRequests}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
};

export default BookedEvents;
