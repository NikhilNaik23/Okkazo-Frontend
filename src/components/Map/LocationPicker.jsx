import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BsSearch, BsGeoAlt, BsX } from 'react-icons/bs';
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

// Component to handle map center updates
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
};

const InternalLocationMarker = ({ lat, lng, onSelect }) => {
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
                // Add User-Agent and identification to comply with Nominatim policy
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`, {
                    headers: { 'User-Agent': 'Okkazo-Frontend/1.0 (legendash@gmail.com)' }
                });
                const data = await response.json();
                const isValid = !!data.display_name && !data.error;

                if (!isValid) {
                    alert("This location seems isolated (water, desert, or forest). Please select a more accessible area.");
                }

                if (onSelect) {
                    onSelect({
                        lat: newLat,
                        lng: newLng,
                        address: data.display_name || `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`,
                        isValid
                    });
                }
            } catch (error) {
                console.error("Geocoding error:", error);
                if (onSelect) {
                    onSelect({
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
            {lat !== null && lat !== undefined && lng !== null && lng !== undefined && (
                <Marker position={[lat, lng]} icon={okkazoIcon} />
            )}
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

const LocationPicker = ({ lat: initialLat, lng: initialLng, onSelect, className }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState(initialLat && initialLng ? [initialLat, initialLng] : [20.5937, 78.9629]);
    const [markerPos, setMarkerPos] = useState(initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null);

    // Sync with external coordinate changes (e.g. from Google Maps link)
    useEffect(() => {
        if (initialLat && initialLng) {
            setMapCenter([initialLat, initialLng]);
            setMarkerPos({ lat: initialLat, lng: initialLng });
        }
    }, [initialLat, initialLng]);

    const triggerSearch = async (query) => {
        if (!query || query.length < 3) return;
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                { headers: { 'User-Agent': 'Okkazo-Frontend/1.0 (legendash@gmail.com)' } }
            );
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search logic
    useEffect(() => {
        const timer = setTimeout(() => {
            triggerSearch(searchQuery);
        }, 800);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearchInput = (query) => {
        setSearchQuery(query);
    };

    const handleSelectSuggestion = (suggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);

        setMapCenter([lat, lon]);
        setMarkerPos({ lat, lng: lon });
        setSearchQuery(suggestion.display_name);
        setSuggestions([]);

        if (onSelect) {
            onSelect({
                lat: lat,
                lng: lon,
                address: suggestion.display_name,
                isValid: true
            });
        }
    };

    const handleManualOnSelect = (data) => {
        setMarkerPos({ lat: data.lat, lng: data.lng });
        if (onSelect) onSelect(data);
    };

    return (
        <div className={className || "h-80 w-full rounded-2xl overflow-visible border border-gray-200 relative z-0 bg-gray-100"}>
            {/* Search Bar Overlay - Integrated into the map area top-left */}
            <div className="absolute top-4 left-4 right-4 md:right-auto md:w-full md:max-w-md z-[1000]">
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-900/30 group-focus-within:text-teal-700 transition-colors">
                        <BsSearch size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a venue or city..."
                        className="w-full h-12 pl-14 pr-12 bg-white backdrop-blur-xl border border-teal-900/10 shadow-xl rounded-2xl outline-none text-teal-900 font-medium placeholder:text-teal-900/20 focus:ring-2 focus:ring-teal-700/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && triggerSearch(searchQuery)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-teal-900/40"
                        >
                            <BsX size={20} />
                        </button>
                    )}

                    {/* Suggestions Dropdown */}
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-teal-900/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            {suggestions.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectSuggestion(item)}
                                    className="w-full px-6 py-4 flex items-start gap-4 hover:bg-teal-50 text-left transition-colors border-b last:border-b-0 border-teal-900/5 group"
                                >
                                    <div className="mt-1 text-teal-700/40 group-hover:text-teal-700">
                                        <BsGeoAlt />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-teal-900 truncate">{item.display_name.split(',')[0]}</p>
                                        <p className="text-[10px] text-teal-900/40 truncate">{item.display_name.split(',').slice(1).join(',')}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <MapContainer
                center={mapCenter}
                zoom={5}
                minZoom={2}
                maxBounds={[[-90, -180], [90, 180]]}
                className="h-full w-full"
                scrollWheelZoom={true}
            >
                <ChangeView center={mapCenter} zoom={(mapCenter[0] === 20.5937 || mapCenter[0] === 28.6139) ? 5 : 13} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    noWrap={true}
                />
                <InternalLocationMarker
                    lat={markerPos?.lat}
                    lng={markerPos?.lng}
                    onSelect={handleManualOnSelect}
                />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;

