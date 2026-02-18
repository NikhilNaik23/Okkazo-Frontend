import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    BsCalendarEvent, BsClock, BsPeople, BsBagCheck, BsInfoCircle,
    BsFileEarmarkText, BsPerson, BsCheckCircle, BsXCircle, BsChatDots, BsGeoAlt
} from 'react-icons/bs';

const VendorEventDetailsTab = () => {
    const { event, handleAccept, handleReject, services } = useOutletContext();
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Full Width Hero: Event Details */}
            <div className="col-span-12 bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <div className="mb-10 border-b border-gray-100 pb-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-black text-[#d7a444] uppercase tracking-[0.3em] mb-4">Event Details #E89{event.id}</p>
                            <h1 className="text-5xl font-black text-[#0b2d49] tracking-tight">{event.title}</h1>
                        </div>
                        {event.status === 'PENDING' && (
                            <div className="px-6 py-3 bg-[#f3ddb1]/30 text-[#d7a444] rounded-2xl font-black text-xs uppercase tracking-widest">
                                Pending
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Stats Grid */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Date</p>
                            <div className="flex items-center gap-2 font-bold text-lg text-[#0b2d49]">
                                <BsCalendarEvent className="text-[#d7a444]" />
                                {event.date}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Time Slot</p>
                            <div className="flex items-center gap-2 font-bold text-lg text-[#0b2d49]">
                                <BsClock className="text-[#d7a444]" />
                                {event.time}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Expected Pax</p>
                            <div className="flex items-center gap-2 font-bold text-lg text-[#0b2d49]">
                                <BsPeople className="text-[#d7a444]" />
                                {event.pax} Guests
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Category</p>
                            <div className="flex items-center gap-2 font-bold text-lg text-[#0b2d49]">
                                <BsBagCheck className="text-[#d7a444]" />
                                {event.category}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="lg:col-span-5 relative pl-0 lg:pl-12 lg:border-l border-gray-100">
                        <h3 className="text-sm font-black text-[#0b2d49] uppercase tracking-widest flex items-center gap-3 mb-4">
                            <BsInfoCircle className="text-[#d7a444]" /> Description
                        </h3>
                        <p className="text-[#5a5b44] font-medium leading-relaxed text-lg italic">
                            "{event.description}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Left Column: Requested Services */}
            <div className="col-span-12 lg:col-span-8">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5 h-full">
                    <h3 className="text-xl font-black text-[#0b2d49] mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e9eff1] rounded-xl flex items-center justify-center text-[#d7a444]">
                            <BsFileEarmarkText />
                        </div>
                        Requested Services
                    </h3>

                    <div className="space-y-4">
                        {services.map((service, idx) => (
                            <div key={idx} className="p-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-[#708aa0]/10 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                <div>
                                    <h4 className="font-black text-[#0b2d49] mb-1">{service.name}</h4>
                                    <p className="text-sm text-[#5a5b44] font-medium">{service.details}</p>
                                </div>
                                <div className="shrink-0 px-4 py-2 bg-white rounded-xl text-xs font-bold text-[#0b2d49] shadow-sm border border-gray-100">
                                    Qty: {service.qty}
                                </div>
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
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-xl shadow-[#0b2d49]/20 flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <BsCheckCircle size={18} /> Accept Request
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <BsXCircle size={18} /> Reject
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate("../chat")}
                                className="w-full py-5 bg-[#0b2d49] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-xl shadow-[#0b2d49]/20 flex items-center justify-center gap-3 active:scale-95"
                            >
                                <BsChatDots size={18} /> Chat with Client
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
            </div>
        </div>
    );
};

export default VendorEventDetailsTab;
