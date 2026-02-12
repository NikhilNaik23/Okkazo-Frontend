import React from 'react';
import { BsCheck2, BsCalendar, BsClock } from "react-icons/bs";
import LocationPicker from "../../Map/LocationPicker";

const StepEventDetails = ({ formData, handleChange, setFormData, minDateString }) => {

    const handleLocationSelect = (locationData) => {
        setFormData(prev => ({
            ...prev,
            lat: locationData.lat,
            lng: locationData.lng,
            location: locationData.address,
            locationValid: locationData.isValid
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Step 1: Form Content */}
            <section>
                <h3 className="flex items-center gap-3 font-bold text-[#0b2d49] mb-6 text-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0b2d49] flex items-center justify-center">1</div>
                    Event Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Are you opting for tickets?</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, listingType: 'Public', type: 'Concert' }))}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.listingType === 'Public' ? 'border-[#d7a444] bg-orange-50 text-[#0b2d49]' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                            >
                                Yes, Public Event
                                <span className="block text-xs font-normal opacity-70">Tickets will be sold</span>
                            </button>
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, listingType: 'Private', type: 'Birthday' }))}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.listingType === 'Private' ? 'border-[#d7a444] bg-orange-50 text-[#0b2d49]' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                            >
                                No, Private Event
                                <span className="block text-xs font-normal opacity-70">Guest list only</span>
                            </button>
                        </div>
                    </div>

                    {formData.listingType === 'Public' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Event Title <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/10 outline-none transition-all placeholder:text-gray-300" placeholder="e.g. Annual Tech Conference 2024" onChange={(e) => handleChange('title', e.target.value)} value={formData.title} />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Event Type</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/10 outline-none transition-all bg-white"
                            onChange={(e) => handleChange('type', e.target.value)}
                            value={formData.type}
                        >
                            {formData.listingType === 'Public' ? (
                                <>
                                    <option value="Expo">Expo</option>
                                    <option value="Concert">Concert</option>
                                    <option value="Hackathon">Hackathon</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Festival">Festival</option>
                                </>
                            ) : (
                                <>
                                    <option value="Birthday">Birthday</option>
                                    <option value="Wedding">Wedding</option>
                                    <option value="Anniversary">Anniversary</option>
                                    <option value="Reunion">Reunion</option>
                                    <option value="Baby Shower">Baby Shower</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="flex items-center gap-3 font-bold text-[#0b2d49] mb-6 text-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0b2d49] flex items-center justify-center">2</div>
                    Date & Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 text-nowrap">Date <span className="lowercase font-normal">(min 20 days ahead)</span></label>
                        <div className="relative group">
                            <input
                                type="date"
                                min={minDateString}
                                className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/10 outline-none transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                onChange={(e) => handleChange('date', e.target.value)}
                                value={formData.date}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-50 rounded-lg group-focus-within:bg-[#d7a444]/10 transition-colors pointer-events-none">
                                <BsCalendar size={16} className="text-gray-400 group-focus-within:text-[#d7a444]" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Time</label>
                        <div className="relative group">
                            <input
                                type="time"
                                className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/10 outline-none transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                onChange={(e) => handleChange('startTime', e.target.value)}
                                value={formData.startTime}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-50 rounded-lg group-focus-within:bg-[#d7a444]/10 transition-colors pointer-events-none">
                                <BsClock size={16} className="text-gray-400 group-focus-within:text-[#d7a444]" />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Venue Location <span className="text-red-500">*</span></label>
                    <div className="p-4 bg-gray-50 rounded-xl mb-4 border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Latitude</p>
                                    <p className="font-mono text-xs text-[#0b2d49]">{formData.lat ? formData.lat.toFixed(6) : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Longitude</p>
                                    <p className="font-mono text-xs text-[#0b2d49]">{formData.lng ? formData.lng.toFixed(6) : "—"}</p>
                                </div>
                            </div>
                            {formData.locationValid && (
                                <div className="flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-md">
                                    <BsCheck2 size={14} />
                                    <span>Verified Area</span>
                                </div>
                            )}
                        </div>
                        {formData.location && (
                            <div className="pt-3 border-t border-gray-200/50">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Detected Address</p>
                                <p className="text-xs text-[#0b2d49] line-clamp-1 italic">{formData.location}</p>
                            </div>
                        )}
                    </div>

                    <LocationPicker
                        lat={formData.lat}
                        lng={formData.lng}
                        onLocationSelect={handleLocationSelect}
                        className="h-64 md:h-80 w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0 bg-gray-100"
                    />

                    <p className="mt-3 text-[11px] text-gray-400 flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        Click anywhere on the map to pin your event's exact location.
                    </p>
                </div>
            </section>

            <section>
                <h3 className="flex items-center gap-3 font-bold text-[#0b2d49] mb-6 text-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0b2d49] flex items-center justify-center">3</div>
                    Required Services
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['Venue', 'Catering', 'Photography', 'Decor', 'Entertainment', 'Transport'].map(service => (
                        <label key={service} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer hover:border-[#d7a444] hover:bg-orange-50/30 transition-all select-none group ${formData.services.includes(service) ? 'border-[#d7a444] bg-orange-50/10' : 'border-gray-200'}`}>
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded text-[#d7a444] focus:ring-[#d7a444] border-gray-300"
                                onChange={(e) => {
                                    const newServices = e.target.checked
                                        ? [...formData.services, service]
                                        : formData.services.filter(s => s !== service);
                                    handleChange('services', newServices);
                                }}
                                checked={formData.services.includes(service)}
                            />
                            <span className="font-bold text-[#0b2d49] group-hover:text-[#d7a444] transition-colors">{service}</span>
                        </label>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default StepEventDetails;
