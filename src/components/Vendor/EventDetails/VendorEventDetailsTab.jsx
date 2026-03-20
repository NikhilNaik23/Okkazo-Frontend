import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    BsCalendarEvent, BsClock, BsPeople, BsBagCheck, BsInfoCircle,
    BsFileEarmarkText, BsPerson, BsCheckCircle, BsXCircle, BsChatDots, BsGeoAlt, BsArrowRight
} from 'react-icons/bs';

const VendorEventDetailsTab = () => {
    const { event, handleAccept, handleReject, services } = useOutletContext();
    const navigate = useNavigate();

    const primaryContactName = String(event?.client?.name || '').trim();
    const primaryContactInitial = (primaryContactName[0] || 'M').toUpperCase();

    return (
        <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Full Width Hero: Event Details */}
            <div className="col-span-12 relative overflow-hidden bg-gradient-to-br from-[#0b2d49] to-[#12426e] p-10 rounded-[3rem] shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#d7a444] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-[#4ea8de] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 mb-10 pb-10 border-b border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">
                                    Event ID #E89{event.id}
                                </span>
                                {event.status === 'PENDING' && (
                                    <span className="px-3 py-1 bg-[#d7a444]/20 border border-[#d7a444]/30 rounded-full backdrop-blur-md text-[10px] font-black text-[#d7a444] uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(215,164,68,0.3)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d7a444] animate-pulse"></span>
                                        Pending Review
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight leading-tight">
                                {event.title}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                    {/* Stats Grid */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                            { icon: BsCalendarEvent, label: "Date", value: event.date },
                            { icon: BsClock, label: "Time Slot", value: event.time.split(' - ')[0] },
                            { icon: BsPeople, label: "Expected Pax", value: `${event.pax} Guests` },
                            { icon: BsBagCheck, label: "Category", value: event.category }
                        ].map((stat, idx) => (
                            <div key={idx} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-full bg-[#d7a444]/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#d7a444]/20 transition-all">
                                    <stat.icon className="text-[#d7a444] text-sm" />
                                </div>
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="font-bold text-sm text-white group-hover:text-[#d7a444] transition-colors">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="lg:col-span-5 relative pl-0 lg:pl-10 lg:border-l border-white/10 flex flex-col justify-center">
                        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <BsInfoCircle className="text-[#d7a444]" /> Executive Summary
                        </h3>
                        <p className="text-white/80 font-medium leading-relaxed text-sm italic">
                            "{event.description}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Left Column: Requested Services */}
            <div className="col-span-12 lg:col-span-8">
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f8fafb] to-transparent rounded-bl-[100px] pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-[#0b2d49] flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#0b2d49] to-[#1a4b77] rounded-xl flex items-center justify-center text-[#d7a444] shadow-lg">
                                <BsFileEarmarkText size={20} />
                            </div>
                            Requested Services
                        </h3>
                        <span className="px-4 py-1.5 bg-[#f8fafb] rounded-full text-xs font-bold text-[#708aa0] border border-gray-100">
                            {services.length} items
                        </span>
                    </div>

                    <div className="space-y-4">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                className="group/item relative p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#0b2d49]/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between overflow-hidden"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d7a444] to-[#0b2d49] opacity-0 group-hover/item:opacity-100 transition-opacity"></div>

                                <div className="flex-1 pr-4">
                                    <h4 className="font-bold text-[#0b2d49] text-base mb-1 group-hover/item:text-[#d7a444] transition-colors">{service.name}</h4>
                                    <p className="text-[13px] text-[#708aa0] leading-relaxed">{service.details}</p>
                                </div>
                                <div className="shrink-0 px-5 py-2.5 bg-[#f8fafb] group-hover/item:bg-[#0b2d49] rounded-xl text-xs font-black text-[#0b2d49] group-hover/item:text-white shadow-inner uppercase tracking-widest transition-colors flex items-center gap-2">
                                    <span className="opacity-50">Qty</span>
                                    <span className="text-sm">{service.qty}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Client & Location */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
                {/* Client Card */}
                <div className="bg-white p-8 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f8fafb] to-transparent rounded-bl-[100px] pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest">Primary Contact</h3>
                        <div className="w-8 h-8 rounded-full bg-[#e9eff1] flex items-center justify-center text-[#d7a444]">
                            <BsPerson size={14} />
                        </div>
                    </div>

                    <div className="flex items-center gap-5 mb-8">
                        <div className="relative">
                            <div
                                className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg relative z-10 bg-gradient-to-br from-[#0b2d49] to-[#12426e] flex items-center justify-center"
                                aria-label={primaryContactName || 'Primary contact'}
                            >
                                <span className="text-3xl font-black text-white">{primaryContactInitial}</span>
                            </div>
                            <div className="absolute inset-0 bg-[#d7a444] rounded-2xl blur-md opacity-30 transform translate-y-2"></div>
                        </div>
                        <div>
                            <h4 className="font-black text-[#0b2d49] text-xl">{event.client.name}</h4>
                            <p className="text-[10px] font-black text-[#d7a444] uppercase tracking-widest mt-1">{event.client.org}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pb-8 border-b border-gray-100">
                        <a href={`mailto:${event.client.email}`} className="flex items-center gap-4 text-sm font-bold text-[#708aa0] hover:text-[#0b2d49] transition-colors group/link p-3 -mx-3 rounded-xl hover:bg-[#f8fafb]">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover/link:text-[#d7a444] group-hover/link:border-[#d7a444]/20 transition-all">
                                @
                            </div>
                            <span className="truncate">{event.client.email}</span>
                        </a>
                        <a href={`tel:${event.client.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-4 text-sm font-bold text-[#708aa0] hover:text-[#0b2d49] transition-colors group/link p-3 -mx-3 rounded-xl hover:bg-[#f8fafb]">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover/link:text-[#d7a444] group-hover/link:border-[#d7a444]/20 transition-all">
                                <BsClock />
                            </div>
                            {event.client.phone}
                        </a>
                    </div>

                    <div className="mt-8">
                        {event.status === 'PENDING' ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="w-full py-4 bg-gradient-to-r from-[#0b2d49] to-[#12426e] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(11,45,73,0.3)] transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <BsCheckCircle size={16} className="text-[#d7a444]" /> Accept Request
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="w-full py-4 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <BsXCircle size={16} /> Decline
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate("../chat")}
                                className="group w-full py-4 bg-gradient-to-r from-[#0b2d49] to-[#12426e] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(11,45,73,0.15)] hover:shadow-[0_15px_30px_rgba(11,45,73,0.25)] transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <BsChatDots size={16} className="text-[#d7a444]" />
                                Open Discussion
                                <BsArrowRight className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#d7a444]" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Location Card */}
                <div className="bg-white p-8 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-6">Venue Location</h3>
                    <div className="flex gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f8fafb] to-gray-100 border border-gray-200 text-[#d7a444] flex items-center justify-center shrink-0 shadow-inner">
                            <BsGeoAlt size={20} />
                        </div>
                        <p className="text-sm font-bold text-[#0b2d49] leading-relaxed pt-1">
                            {event.location}
                        </p>
                    </div>
                    {/* Simulated Map Container with Premium styling */}
                    <div className="relative h-48 w-full bg-[#f8fafb] rounded-2xl border border-gray-100 overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/40 backdrop-blur-[2px] group-hover:bg-white/10 transition-colors duration-500">
                            <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[#d7a444]/20 group-hover:text-[#d7a444] transition-all duration-300">
                                <BsGeoAlt size={16} />
                            </div>
                            <p className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest">Interactive Map</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorEventDetailsTab;
