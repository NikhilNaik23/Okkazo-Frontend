import React from 'react';
import { BsClock, BsGeoAlt, BsInfoCircle, BsTicketPerforated } from "react-icons/bs";
import LocationPicker from "../../../Map/LocationPicker";
import CustomDatePicker from './CustomDatePicker';

const StepSchedule = ({ formData, setFormData }) => {
    // Current date for min attribute
    const minDate = new Date();

    const handleLocationSelect = ({ lat, lng, address }) => {
        setFormData({
            ...formData,
            lat,
            lng,
            address: address || formData.address
        });
    };

    const handleGMapLink = (link) => {
        // Regex to find coords in Google Maps URLs
        // Supports @lat,lng style and query=lat,lng style
        const coordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)|query=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match = link.match(coordRegex);

        if (match) {
            const lat = parseFloat(match[1] || match[3]);
            const lng = parseFloat(match[2] || match[4]);

            setFormData({
                ...formData,
                lat,
                lng,
                address: link // Or we could try reverse geocoding here
            });
        } else if (link.includes('maps')) {
            // If it's a maps link but no obvious coords, we just save the address field
            setFormData({ ...formData, address: link });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
            <h1 className="font-serif-premium text-6xl md:text-8xl italic text-[#7AB2B2] opacity-10 mb-8 absolute -top-20 -left-20 pointer-events-none select-none">Timeline</h1>

            <div className="mb-12 relative">
                <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 04 — Date & Location</p>
                <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Where & When.</h2>
            </div>

            {/* Date & Time Section - TOP */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-[#09637E]/10 shadow-xl relative group space-y-10">
                <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-[#088395]/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-[#088395]/10 transition-all duration-700" />
                </div>

                {/* Event Schedule */}
                <div className="relative z-30">
                    <div className="flex items-center gap-4 mb-8 text-[#088395]">
                        <div className="w-12 h-12 rounded-2xl bg-[#088395]/10 flex items-center justify-center">
                            <BsClock size={24} />
                        </div>
                        <h3 className="font-serif-premium italic text-3xl text-[#09637E]">Event Schedule</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <p className="text-[#088395] font-black uppercase tracking-[0.2em] text-[10px] ml-1">Starts</p>
                            <CustomDatePicker
                                selected={formData.startDate ? new Date(formData.startDate) : null}
                                onChange={(date) => setFormData({ ...formData, startDate: date })}
                                minDate={minDate}
                                placeholderText="Select Event Start..."
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[#088395] font-black uppercase tracking-[0.2em] text-[10px] ml-1">Ends</p>
                            <CustomDatePicker
                                selected={formData.endDate ? new Date(formData.endDate) : null}
                                onChange={(date) => setFormData({ ...formData, endDate: date })}
                                minDate={formData.startDate ? new Date(formData.startDate) : minDate}
                                placeholderText="Select Event End..."
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#09637E]/5 w-full relative z-20" />

                {/* Ticket Release Schedule */}
                <div className="relative z-20">
                    <div className="flex items-center gap-4 mb-8 text-[#088395]">
                        <div className="w-12 h-12 rounded-2xl bg-[#088395]/10 flex items-center justify-center">
                            <BsTicketPerforated size={24} />
                        </div>
                        <h3 className="font-serif-premium italic text-3xl text-[#09637E]">Ticket Availability</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <p className="text-[#088395] font-black uppercase tracking-[0.2em] text-[10px] ml-1">Sales Start</p>
                            <CustomDatePicker
                                selected={formData.ticketReleaseDate ? new Date(formData.ticketReleaseDate) : null}
                                onChange={(date) => setFormData({ ...formData, ticketReleaseDate: date })}
                                minDate={minDate}
                                placeholderText="When to publish tickets..."
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[#088395] font-black uppercase tracking-[0.2em] text-[10px] ml-1">Sales End (Optional)</p>
                            <CustomDatePicker
                                selected={formData.ticketSalesEndDate ? new Date(formData.ticketSalesEndDate) : null}
                                onChange={(date) => setFormData({ ...formData, ticketSalesEndDate: date })}
                                minDate={formData.ticketReleaseDate ? new Date(formData.ticketReleaseDate) : minDate}
                                placeholderText="When to close sales..."
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-[#088395]/5 p-6 rounded-2xl flex gap-4 items-start border border-[#088395]/10 relative z-10">
                    <BsInfoCircle className="text-[#088395] mt-1 shrink-0" size={18} />
                    <p className="text-[#09637E]/70 text-[11px] font-bold uppercase tracking-wider leading-relaxed">
                        Scheduled in your local timezone. Attendees will see the time converted to their local time automatically.
                    </p>
                </div>
            </div>

            {/* Location Section - BOTTOM */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-[#09637E]/10 shadow-xl relative overflow-hidden group">
                <div className="absolute left-0 bottom-0 w-64 h-64 bg-[#7AB2B2]/5 rounded-full blur-3xl -ml-32 -mb-32 group-hover:bg-[#7AB2B2]/10 transition-all duration-700" />

                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-[#088395]">
                            <div className="w-12 h-12 rounded-2xl bg-[#088395]/10 flex items-center justify-center">
                                <BsGeoAlt size={24} />
                            </div>
                            <h3 className="font-serif-premium italic text-3xl text-[#09637E]">Venue Assignment</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-xl">
                            <div className="flex-1 relative">
                                <p className="text-[#088395] font-black uppercase tracking-[0.2em] text-[9px] mb-2 ml-1">Google Maps Link (Optional)</p>
                                <input
                                    type="text"
                                    placeholder="Paste Link for Auto-Pin..."
                                    onChange={(e) => handleGMapLink(e.target.value)}
                                    className="w-full bg-[#EBF4F6] text-[#09637E] px-4 py-3 rounded-xl border border-[#09637E]/5 outline-none focus:border-[#088395] focus:bg-white transition-all text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-[450px] rounded-3xl border border-[#09637E]/20 shadow-2xl relative">
                        <LocationPicker
                            lat={formData.lat}
                            lng={formData.lng}
                            onSelect={handleLocationSelect}
                            className="w-full h-full"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[#09637E] font-bold uppercase tracking-widest text-[10px] mb-2 opacity-60">Selected Address</p>
                            <p className="text-sm font-serif-premium italic text-[#09637E] truncate border-b border-[#09637E]/10 pb-1">
                                {formData.address || 'Drop a pin or search on the map...'}
                            </p>
                        </div>
                        <div className="flex gap-4 text-[10px] text-[#09637E]/40 font-black uppercase tracking-[0.2em]">
                            <span className="bg-[#EBF4F6] px-3 py-1 rounded-lg">LAT: {formData.lat ? formData.lat.toFixed(4) : "0.0000"}</span>
                            <span className="bg-[#EBF4F6] px-3 py-1 rounded-lg">LNG: {formData.lng ? formData.lng.toFixed(4) : "0.0000"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepSchedule;
