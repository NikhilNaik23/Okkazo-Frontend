import React from "react";
import { BsGeoAlt } from "react-icons/bs";
import LocationPicker from "../../Map/LocationPicker";

const LocationSection = ({ formData, showLocationPicker, setShowLocationPicker, handleLocationSelect }) => {
    return (
        <div className="space-y-4 mb-10">
            <label className="text-xs font-black text-[#0b2d49] uppercase tracking-widest pl-2">Location</label>
            
            {/* Current Location Display */}
            <div className="flex items-center gap-4">
                <div className="flex-1 px-6 py-4 bg-white rounded-2xl border-2 border-gray-50 font-bold text-[#0b2d49] flex items-center gap-3">
                    <BsGeoAlt className="text-[#d7a444] shrink-0" size={18} />
                    <span className={formData.location ? "" : "text-gray-400 font-medium"}>
                        {formData.location || "No location selected"}
                    </span>
                </div>
                <button 
                    type="button"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    className={`px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                        showLocationPicker 
                            ? "bg-[#0b2d49] text-white" 
                            : "bg-[#d7a444]/10 text-[#d7a444] hover:bg-[#d7a444] hover:text-white border border-[#d7a444]/20"
                    }`}
                >
                    {showLocationPicker ? "Close Map" : "Pick on Map"}
                </button>
            </div>

            {/* Location Picker Map */}
            {showLocationPicker && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-gray-400 font-medium mb-3 pl-2">
                        Click on the map to select your location. We'll automatically detect the address.
                    </p>
                    <LocationPicker 
                        lat={null} 
                        lng={null} 
                        onLocationSelect={handleLocationSelect}
                        className="h-80 w-full rounded-2xl overflow-hidden border-2 border-gray-50 relative z-0 bg-gray-100"
                    />
                </div>
            )}
        </div>
    );
};

export default LocationSection;
