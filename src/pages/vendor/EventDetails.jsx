import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BsArrowLeft, 
  BsCalendarEvent, 
  BsGeoAlt, 
  BsPeople, 
  BsClock, 
  BsPerson,
  BsShieldCheck,
  BsChatDots,
  BsCheckCircle,
  BsXCircle,
  BsInfoCircle,
  BsFileEarmarkText,
  BsBagCheck
} from "react-icons/bs";
import { toast } from "react-hot-toast";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data for a specific event
  const [event] = useState({
    id: id || 1,
    title: "The Grand Wedding Gala",
    status: id === "2" ? "CONFIRMED" : "PENDING",
    date: "28 Oct, 2024",
    time: "06:00 PM - 11:30 PM",
    pax: 200,
    category: "Wedding",
    location: "Central Park Plaza, Manhattan, NY",
    client: {
      name: "Sarah Jenkins",
      org: "Individual Booking",
      email: "sarah.j@example.com",
      phone: "+1 234-567-8901",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    requestedServices: [
      { name: "Catering - Veg Menu", details: "Premium Indian buffet with 4 starters, 6 main courses, and 3 desserts." },
      { name: "Live Counter", details: "Artisan Tandoor & Pasta station for the first 2 hours." },
      { name: "Beverage Service", details: "Mocktail bar with 5 signature drinks." }
    ],
    description: "A high-profile wedding event requiring top-tier catering service. The client has specifically requested a focus on authentic flavors and elegant presentation. The venue has a service elevator and a dedicated kitchen area for vendors.",
    timeline: [
      { time: "02:00 PM", task: "Vendor Arrival & Setup" },
      { time: "05:00 PM", task: "Kitchen Preparation Complete" },
      { time: "06:00 PM", task: "Welcome Drinks Served" },
      { time: "08:30 PM", task: "Main Course Buffet Opening" }
    ]
  });

  const handleAccept = () => {
    toast.success("Event request accepted!");
    navigate("/vendor/booked-events");
  };

  const handleReject = () => {
    toast.error("Rejection reason required.");
    // In a real flow, this would open the rejection modal
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-[#708aa0] hover:text-[#0b2d49] font-black uppercase text-xs tracking-widest transition-all group"
        >
            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-[#0b2d49] group-hover:text-white transition-all">
                <BsArrowLeft size={20} />
            </div>
            Back to Events
        </button>
        
        <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${event.status === 'PENDING' ? 'bg-[#f3ddb1] text-[#d7a444]' : 'bg-green-50 text-green-600'}`}>
                {event.status}
            </span>
            <div className="p-2 bg-white rounded-xl shadow-sm text-[#708aa0]">
                <BsShieldCheck size={20} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Main Info */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <div className="mb-10">
                    <p className="text-xs font-black text-[#d7a444] uppercase tracking-[0.3em] mb-4">Event Details #E89{event.id}</p>
                    <h1 className="text-4xl font-black text-[#0b2d49] tracking-tight mb-6">{event.title}</h1>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Date</p>
                            <div className="flex items-center gap-2 font-bold text-[#0b2d49]">
                                <BsCalendarEvent className="text-[#d7a444]" />
                                {event.date}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Time Slot</p>
                            <div className="flex items-center gap-2 font-bold text-[#0b2d49]">
                                <BsClock className="text-[#d7a444]" />
                                {event.time}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Expected Pax</p>
                            <div className="flex items-center gap-2 font-bold text-[#0b2d49]">
                                <BsPeople className="text-[#d7a444]" />
                                {event.pax} Guests
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Category</p>
                            <div className="flex items-center gap-2 font-bold text-[#0b2d49]">
                                <BsBagCheck className="text-[#d7a444]" />
                                {event.category}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-10 border-t border-gray-50">
                    <h3 className="text-sm font-black text-[#0b2d49] uppercase tracking-widest flex items-center gap-3">
                        <BsInfoCircle className="text-[#d7a444]" /> Description
                    </h3>
                    <p className="text-[#5a5b44] font-medium leading-relaxed text-lg italic">
                        "{event.description}"
                    </p>
                </div>
            </div>

            {/* Requested Services */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <h3 className="text-xl font-black text-[#0b2d49] mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e9eff1] rounded-xl flex items-center justify-center text-[#d7a444]">
                        <BsFileEarmarkText />
                    </div>
                    Requested Services
                </h3>
                
                <div className="space-y-4">
                    {event.requestedServices.map((service, idx) => (
                        <div key={idx} className="p-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-[#708aa0]/10 transition-all">
                            <h4 className="font-black text-[#0b2d49] mb-2">{service.name}</h4>
                            <p className="text-sm text-[#5a5b44] font-medium">{service.details}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Client & Location */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Client Card */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-8">Primary Contact</h3>
                <div className="flex items-center gap-4 mb-8">
                    <img src={event.client.avatar} alt={event.client.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d7a444]/20 shadow-sm" />
                    <div>
                        <h4 className="font-black text-[#0b2d49] text-xl">{event.client.name}</h4>
                        <p className="text-[10px] font-bold text-[#708aa0] uppercase tracking-widest">{event.client.org}</p>
                    </div>
                </div>
                
                <div className="space-y-4 pb-8 border-b border-gray-50">
                    <div className="flex items-center gap-4 text-sm font-bold text-[#5a5b44]">
                        <div className="w-8 h-8 rounded-lg bg-[#e9eff1] flex items-center justify-center text-[#708aa0]">
                            <BsPerson />
                        </div>
                        {event.client.email}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-[#5a5b44]">
                        <div className="w-8 h-8 rounded-lg bg-[#e9eff1] flex items-center justify-center text-[#708aa0]">
                            <BsClock />
                        </div>
                        {event.client.phone}
                    </div>
                </div>

                <div className="mt-8">
                    {event.status === 'PENDING' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleReject}
                                className="py-4 bg-white border-2 border-[#e9eff1] text-[#0b2d49] rounded-2xl font-bold text-sm hover:border-red-500 hover:text-red-500 transition-all shadow-sm"
                            >
                                <BsXCircle className="inline mr-2" /> Reject
                            </button>
                            <button 
                                onClick={handleAccept}
                                className="py-4 bg-[#0b2d49] text-white rounded-2xl font-bold text-sm hover:bg-[#d7a444] transition-all shadow-lg active:scale-95"
                            >
                                <BsCheckCircle className="inline mr-2" /> Accept
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate("/vendor/messages")}
                            className="w-full py-5 bg-[#0b2d49] text-white rounded-2xl font-bold text-lg hover:bg-[#d7a444] transition-all shadow-xl shadow-[#0b2d49]/20 flex items-center justify-center gap-3"
                        >
                            <BsChatDots /> Chat with Client
                        </button>
                    )}
                </div>
            </div>

            {/* Location Card */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-6">Venue Location</h3>
                <div className="flex gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#d7a444]/10 text-[#d7a444] flex items-center justify-center shrink-0">
                        <BsGeoAlt size={20} />
                    </div>
                    <p className="text-sm font-bold text-[#0b2d49] leading-relaxed">
                        {event.location}
                    </p>
                </div>
                <div className="h-48 w-full bg-[#e9eff1] rounded-2xl border-2 border-dashed border-[#708aa0]/10 flex flex-col items-center justify-center text-center p-6 grayscale opacity-60">
                    <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Map Preview Coming Soon</p>
                </div>
            </div>

            {/* Timeline Snapshot */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-8">Event Day Timeline</h3>
                <div className="space-y-6 relative">
                    <div className="absolute left-[1.125rem] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                    {event.timeline.map((item, idx) => (
                        <div key={idx} className="flex gap-6 relative">
                            <div className="w-9 h-9 bg-white border-2 border-[#d7a444] rounded-full flex items-center justify-center text-[#d7a444] text-[10px] font-black z-10 shrink-0">
                                {item.time}
                            </div>
                            <div className="pt-1.5">
                                <p className="text-sm font-black text-[#0b2d49] leading-none mb-1">{item.task}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
