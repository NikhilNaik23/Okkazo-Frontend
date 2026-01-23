import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Premium Marker for Okkazo
const okkazoIcon = L.divIcon({
    html: `
        <div class="relative w-10 h-10 flex items-center justify-center">
            <div class="absolute inset-0 bg-[#d7a444] rounded-full scale-50 animate-ping opacity-20"></div>
            <div class="w-8 h-8 bg-[#d7a444] border-2 border-white rounded-full flex items-center justify-center shadow-lg transform -translate-y-1">
                <div class="w-2 h-2 bg-[#0b2d49] rounded-full"></div>
            </div>
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#d7a444] rounded-full"></div>
        </div>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

const InternalLocationMarker = ({ lat, lng, onLocationSelect }) => {
    const [isChecking, setIsChecking] = useState(false);
    const map = useMapEvents({
        async click(e) {
            const newLat = e.latlng.lat;
            const newLng = e.latlng.lng;
            
            // Pole check
            if (Math.abs(newLat) > 66) {
                alert("Placing events in Polar regions is not supported.");
                return;
            }

            setIsChecking(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=10`);
                const data = await response.json();
                const isValid = !!data.display_name && !data.error;
                
                if (!isValid) {
                    alert("This location seems isolated (water, desert, or forest). Please select a more accessible area.");
                }

                if (onLocationSelect) {
                    onLocationSelect({
                        lat: newLat,
                        lng: newLng,
                        address: data.display_name || `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`,
                        isValid
                    });
                }
            } catch (error) {
                console.error("Geocoding error:", error);
                if (onLocationSelect) {
                    onLocationSelect({
                        lat: newLat,
                        lng: newLng,
                        address: `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`,
                        isValid: true 
                    });
                }
            } finally {
                setIsChecking(false);
            }
        },
    });

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);

    return (
        <>
            {lat !== null && <Marker position={[lat, lng]} icon={okkazoIcon} />}
            {isChecking && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-1000 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#d7a444] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-[#0b2d49]">Verifying Area...</span>
                    </div>
                </div>
            )}
        </>
    );
};

const LocationPicker = ({ lat, lng, onLocationSelect, className }) => {
    const center = lat && lng ? [lat, lng] : [20.5937, 78.9629];

    return (
        <div className={className || "h-80 w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0 bg-gray-100"}>
            <MapContainer 
                center={center} 
                zoom={5} 
                minZoom={2}
                maxBounds={[[-90, -180], [90, 180]]}
                className="h-full w-full"
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    noWrap={true}
                />
                <InternalLocationMarker lat={lat} lng={lng} onLocationSelect={onLocationSelect} />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;
