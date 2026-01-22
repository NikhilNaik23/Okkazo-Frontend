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
  BsSearch
} from "react-icons/bs";
import { RiCloseLine } from "react-icons/ri";
import { toast } from "react-hot-toast";

const RejectionModal = ({ isOpen, onClose, onSend, eventTitle }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b2d49]/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in duration-300 border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#f8faFC]">
          <div>
            <h3 className="text-2xl font-black text-[#0b2d49] tracking-tight">Reject Request</h3>
            <p className="text-xs font-bold text-[#708aa0] uppercase tracking-widest mt-1">{eventTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#d7a444] transition-all p-2 rounded-xl hover:bg-gray-100">
            <RiCloseLine size={28} />
          </button>
        </div>
        
        <div className="p-8 space-y-4">
          <label className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Reason for Rejection</label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a brief reason for rejecting this event request..."
            className="w-full h-40 p-5 rounded-2xl bg-[#e9eff1]/50 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all resize-none font-medium text-[#0b2d49] placeholder:text-[#708aa0]"
          />
        </div>

        <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 py-3.5 bg-white border-2 border-[#e9eff1] text-[#0b2d49] rounded-xl font-bold hover:border-[#0b2d49] transition-all">
            Cancel
          </button>
          <button 
            disabled={!reason.trim()}
            onClick={() => {
              onSend(reason);
              setReason("");
              onClose();
            }}
            className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95
              ${reason.trim() 
                ? "bg-[#0b2d49] text-white hover:bg-[#d7a444] shadow-[#0b2d49]/10" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}`}
          >
            <span>Send Reason</span>
            <BsSend />
          </button>
        </div>
      </div>
    </div>
  );
};

const BookedEvents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectionModalData, setRejectionModalData] = useState({ isOpen: false, event: null });

  const [bookedEventsData, setBookedEventsData] = useState([
    {
      id: 1,
      title: "The Grand Wedding Gala",
      status: "PENDING",
      date: "28",
      month: "OCT",
      category: "Wedding",
      location: "Central Park Plaza, NY",
      service: "Catering - Veg Menu (200 pax)",
      pax: 200
    },
    {
      id: 2,
      title: "Tech Frontier Summit 2024",
      status: "CONFIRMED",
      date: "04",
      month: "NOV",
      category: "Conference",
      location: "Brooklyn Expo Center",
      service: "Beverage Package - Gold",
      pax: 500
    },
    {
      id: 3,
      title: "Corporate Anniversary Dinner",
      status: "PENDING",
      date: "12",
      month: "NOV",
      category: "Corporate",
      location: "Manhattan Skylounge",
      service: "Full Course Premium Buffet",
      pax: 150
    }
  ]);

  const stats = {
    pending: bookedEventsData.filter(e => e.status === "PENDING").length,
    confirmed: bookedEventsData.filter(e => e.status === "CONFIRMED").length
  };

  const filteredEvents = bookedEventsData.filter(event => {
    const matchesTab = activeTab === "All Requests" || 
                      (activeTab === "Pending" && event.status === "PENDING") || 
                      (activeTab === "Confirmed" && event.status === "CONFIRMED");
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAccept = (eventId) => {
    setBookedEventsData(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: "CONFIRMED" } : event
    ));
    toast.success("Event request accepted successfully!", {
        style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' }
    });
  };

  const handleReject = (reason) => {
    const eventId = rejectionModalData.event?.id;
    setBookedEventsData(prev => prev.filter(event => event.id !== eventId));
    toast.error("Event request rejected and reason sent.", {
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
            placeholder="Search events by name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold text-[#0b2d49] placeholder:text-[#708aa0]"
        />
      </div>

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <h1 className="text-3xl font-black tracking-tight">Booked Events</h1>
        
        <div className="flex flex-wrap items-center gap-6">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-[#708aa0]/10">
                {["All Requests", "Pending", "Confirmed"].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab ? 'bg-[#0b2d49] text-white shadow-lg' : 'text-[#708aa0] hover:text-[#0b2d49]'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#d7a444] rounded-full"></span>
                    <span className="text-[#d7a444]">{stats.pending} Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#0b2d49] rounded-full"></span>
                    <span className="text-[#0b2d49]">{stats.confirmed} Confirmed</span>
                </div>
            </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {filteredEvents.length > 0 ? filteredEvents.map((event) => (
          <div key={event.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-[#708aa0]/5 hover:shadow-xl hover:shadow-[#0b2d49]/5 transition-all duration-500 group">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Date Box */}
              <div className="flex flex-col items-center justify-center w-24 h-24 bg-[#e9eff1] rounded-[2rem] border border-white shadow-inner shrink-0 group-hover:bg-[#f3ddb1]/30 transition-colors">
                <span className="text-2xl font-black text-[#0b2d49] tracking-tighter">{event.date}</span>
                <span className="text-[10px] font-bold text-[#708aa0] uppercase tracking-widest">{event.month}</span>
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-black truncate">{event.title}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tighter ${event.status === 'PENDING' ? 'bg-[#f3ddb1] text-[#d7a444]' : 'bg-[#e9eff1] text-[#0b2d49]'}`}>
                        {event.status}
                    </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                    <div className="flex items-center gap-2 text-sm text-[#5a5b44] font-medium">
                        <BsCalendarEvent className="text-[#708aa0]" />
                        <span>{event.category}</span>
                        <span className="w-1.5 h-1.5 bg-[#708aa0]/30 rounded-full mx-1"></span>
                        <BsGeoAlt className="text-[#708aa0]" />
                        <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#0b2d49] font-bold">
                        <BsBriefcase className="text-[#10b981]" />
                        <span>{event.service}</span>
                    </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                {event.status === 'PENDING' ? (
                    <>
                        <button 
                            onClick={() => navigate(`/vendor/event/${event.id}`)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#e9eff1] text-[#0b2d49] rounded-2xl font-bold text-sm hover:border-[#0b2d49] transition-all group/btn"
                        >
                            <BsEye className="group-hover/btn:scale-110 transition-transform" />
                            View Details
                        </button>
                        <button 
                            onClick={() => setRejectionModalData({ isOpen: true, event })}
                            className="flex items-center justify-center px-4 py-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                            <BsXCircle size={18} />
                        </button>
                        <button 
                            onClick={() => handleAccept(event.id)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0b2d49] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all hover:-translate-y-0.5"
                        >
                            <BsCheckCircle />
                            Accept
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            onClick={() => navigate("/vendor/messages")}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0b2d49] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all flex-row-reverse"
                        >
                            Chat
                            <BsChatDots />
                        </button>
                        <button 
                            onClick={() => navigate(`/vendor/event/${event.id}`)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#e9eff1] text-[#0b2d49] rounded-2xl font-bold text-sm hover:border-[#0b2d49] transition-all group/btn"
                        >
                            <BsEye className="group-hover/btn:scale-110 transition-transform" />
                            View Details
                        </button>
                        <button className="p-3.5 bg-gray-50 text-[#708aa0] rounded-2xl hover:bg-white hover:text-[#0b2d49] hover:shadow-md transition-all border border-transparent hover:border-[#708aa0]/10">
                            <BsThreeDots />
                        </button>
                    </>
                )}
              </div>
            </div>
          </div>
        )) : (
            <div className="p-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-[#708aa0]/5">
                <div className="w-20 h-20 bg-[#e9eff1] rounded-full flex items-center justify-center text-[#708aa0] mb-6">
                    <BsCalendarEvent size={32} />
                </div>
                <h3 className="text-xl font-black text-[#0b2d49]">No events found</h3>
                <p className="text-sm text-[#708aa0] font-bold mt-2">Try adjusting your search or filters to see more results.</p>
            </div>
        )}

        {filteredEvents.length > 0 && (
            <div className="pt-4 flex justify-center">
                <button className="px-10 py-4 bg-white/50 backdrop-blur-sm border border-[#708aa0]/10 rounded-2xl text-[#0b2d49] font-bold text-sm hover:bg-white hover:shadow-lg transition-all active:scale-95">
                    Load 12 more events
                </button>
            </div>
        )}
      </div>

      {/* Rejection Modal */}
      <RejectionModal 
        isOpen={rejectionModalData.isOpen}
        onClose={() => setRejectionModalData({ isOpen: false, event: null })}
        onSend={handleReject}
        eventTitle={rejectionModalData.event?.title}
      />
    </div>
  );
};

export default BookedEvents;
