import React from 'react';
import LocationPicker from "../../Map/LocationPicker";

const VenueLocation = ({ formData, setFormData }) => {
    const handleLocationSelect = ({ lat, lng, address }) => {
        setFormData(prev => ({
            ...prev,
            lat,
            lng,
            address: address || prev.address 
        }));
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-3 font-bold text-lg mb-6">
                <div className="text-[#0b2d49] font-bold text-xl">📍</div>
                Venue Location
            </h2>
            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📍</div>
                    <input
                        type="text"
                        readOnly
                        placeholder="Click on the map to select location..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none bg-gray-100/50 text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                        value={formData.address}
                        onClick={() => alert("Please click on the map below to select the precise location.")}
                    />
                </div>
                
                <LocationPicker 
                    lat={formData.lat} 
                    lng={formData.lng} 
                    onLocationSelect={handleLocationSelect}
                    className="h-80 w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Latitude</label>
                        <input readOnly value={formData.lat.toFixed(6)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-mono" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Longitude</label>
                        <input readOnly value={formData.lng.toFixed(6)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-mono" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueLocation;
