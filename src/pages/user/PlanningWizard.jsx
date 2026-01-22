import React, { useState } from "react";
import Navbar from "../../components/Layout/user/Navbar";
import Footer from "../../components/Layout/user/Footer";
import { BsCheck2, BsArrowRight, BsGeoAlt, BsCalendar, BsClock } from "react-icons/bs";
import { dummyVendors } from "../../utils/dummyData";
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

const LocationMarker = ({ formData, setFormData }) => {
    const [isChecking, setIsChecking] = useState(false);
    const map = useMapEvents({
        async click(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Pole check
            if (Math.abs(lat) > 66) {
                alert("Placing events in Polar regions is not supported.");
                return;
            }

            setIsChecking(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
                const data = await response.json();
                const isValid = !!data.display_name && !data.error;
                
                if (!isValid) {
                    alert("This location seems isolated (water, desert, or forest). Please select a more accessible area.");
                }

                setFormData(prev => ({
                    ...prev,
                    lat: lat,
                    lng: lng,
                    location: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    locationValid: isValid
                }));
            } catch (error) {
                console.error("Geocoding error:", error);
                setFormData(prev => ({ ...prev, lat, lng, locationValid: true }));
            } finally {
                setIsChecking(false);
            }
        },
    });

    // Fix for Leaflet rendering issues on load
    React.useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);

    return (
        <>
            {formData.lat !== null && <Marker position={[formData.lat, formData.lng]} icon={okkazoIcon} />}
            {isChecking && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-[1000] flex items-center justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#d7a444] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-[#0b2d49]">Verifying Area...</span>
                    </div>
                </div>
            )}
        </>
    );
};

const PlanningWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeServiceTab, setActiveServiceTab] = useState(0); // Index of active service tab
  
  // Date calculation for 20 days validation
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 20);
  const minDateString = minDate.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: "",
    type: "Birthday", // Default private type
    listingType: "Private", // Private (No tickets) by default
    location: "",
    lat: null,
    lng: null,
    locationValid: false,
    date: "",
    startTime: "",
    endTime: "",
    services: ['Venue', 'Catering'], // Default selections for demo
    vendors: {}, // { 'Venue': vendorObj, 'Catering': vendorObj }
  });
  
  const steps = [
    { id: 1, title: "Event Details", desc: "Basic info & preferences" },
    { id: 2, title: "Vendor Selection", desc: "Choose your team" },
    { id: 3, title: "Review & Bill", desc: "Finalize your plan" },
    { id: 4, title: "Confirmation", desc: "All set!" }
  ];

  // Ensure active tab is valid
  React.useEffect(() => {
    if (formData.services.length > 0 && activeServiceTab >= formData.services.length) {
        setActiveServiceTab(0);
    }
  }, [formData.services, activeServiceTab]);

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => setCurrentStep(prev => prev - 1);
  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });
  
  const handleSelectVendor = (service, vendor) => {
      setFormData(prev => ({
          ...prev,
          vendors: { ...prev.vendors, [service]: vendor }
      }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-10 flex gap-8">
        
        {/* Sidebar Progress */}
        <aside className="hidden lg:block w-72 h-fit sticky top-32 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-[#0b2d49]">Progress</h2>
            <div className="w-10 h-10 rounded-full border-4 border-gray-100 flex items-center justify-center text-xs font-bold text-[#d7a444]">
                {Math.round(((currentStep - 1) / 4) * 100)}%
            </div>
          </div>
          
          <div className="space-y-6 relative">
             <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 -z-10"></div>
             {steps.map((step, idx) => (
                <div key={step.id} className={`flex gap-4 relative ${currentStep >= step.id ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${currentStep > step.id ? 'bg-[#d7a444] border-[#d7a444] text-white' : currentStep === step.id ? 'bg-[#0b2d49] border-[#0b2d49] text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                        {currentStep > step.id ? <BsCheck2 /> : step.id}
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${currentStep === step.id ? 'text-[#0b2d49]' : 'text-gray-500'}`}>{step.title}</p>
                        <p className="text-xs text-gray-400">{step.desc}</p>
                    </div>
                </div>
             ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
             <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl">
                <span className="text-green-500 text-lg">💡</span>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Tip: Accurate location data helps attendees find your event and enables precise weather forecasts.
                </p>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
           {/* Header */}
           <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-[#0b2d49] mb-2">Plan Your Perfect Event</h1>
              <p className="text-gray-500">Step {currentStep}: {steps[currentStep-1]?.title || 'Done'}</p>
           </div>
           
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[600px]">
               {currentStep === 1 && (
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
                                            onClick={() => setFormData({...formData, listingType: 'Public', type: 'Concert'})}
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.listingType === 'Public' ? 'border-[#d7a444] bg-orange-50 text-[#0b2d49]' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                                       >
                                           Yes, Public Event
                                           <span className="block text-xs font-normal opacity-70">Tickets will be sold</span>
                                       </button>
                                       <button 
                                            onClick={() => setFormData({...formData, listingType: 'Private', type: 'Birthday'})}
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
                                       <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/10 outline-none transition-all placeholder:text-gray-300" placeholder="e.g. Annual Tech Conference 2024" onChange={(e) => handleChange('title', e.target.value)} value={formData.title}/>
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
                                
                                <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0 bg-gray-100">
                                    <MapContainer 
                                        center={[20.5937, 78.9629]} // India center
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
                                        <LocationMarker formData={formData} setFormData={setFormData} />
                                    </MapContainer>
                                </div>
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
               )}
               
               {currentStep === 2 && (
                   <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                      {/* Services Navigation */}
                      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-gray-100">
                          {formData.services.length === 0 ? (
                              <p className="text-red-500">Please select services in Step 1 first.</p>
                          ) : formData.services.map((service, idx) => (
                              <button 
                                key={service}
                                onClick={() => setActiveServiceTab(idx)}
                                className={`px-5 py-2 whitespace-nowrap rounded-full text-sm font-bold transition-all ${
                                    activeServiceTab === idx 
                                    ? 'bg-[#0b2d49] text-white shadow-md' 
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-[#d7a444]'
                                }`}
                              >
                                {service}
                                {formData.vendors[service] && <BsCheck2 className="inline ml-2" />}
                              </button>
                          ))}
                      </div>

                      {/* Vendor Grid */}
                      {formData.services.length > 0 && dummyVendors[formData.services[activeServiceTab]] ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                              {dummyVendors[formData.services[activeServiceTab]].map((vendor) => {
                                  const isSelected = formData.vendors[formData.services[activeServiceTab]]?.id === vendor.id;
                                  return (
                                    <div 
                                        key={vendor.id} 
                                        className={`group rounded-2xl overflow-hidden border transition-all cursor-pointer ${isSelected ? 'border-[#d7a444] ring-2 ring-[#d7a444]/20 shadow-lg' : 'border-gray-200 hover:shadow-md hover:border-[#d7a444]/50'}`}
                                        onClick={() => handleSelectVendor(formData.services[activeServiceTab], vendor)}
                                    >
                                        <div className="relative h-48 bg-gray-200">
                                            <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            {isSelected && (
                                                <div className="absolute top-3 right-3 w-8 h-8 bg-[#d7a444] text-[#0b2d49] rounded-full flex items-center justify-center font-bold shadow-lg animate-in zoom-in">
                                                    <BsCheck2 size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-[#0b2d49] text-lg leading-tight">{vendor.name}</h4>
                                                <span className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
                                                    ★ {vendor.rating.toFixed(1)}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                                Premium service provider with {vendor.reviews} verfied reviews.
                                            </p>
                                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">Estimated Range</p>
                                                    <p className="text-[#0b2d49] font-bold text-lg">${vendor.priceMin} - ${vendor.priceMax}</p>
                                                </div>
                                                <button className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isSelected ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600 group-hover:bg-[#0b2d49] group-hover:text-white'}`}>
                                                    {isSelected ? 'Selected' : 'Select'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                  );
                              })}
                           </div>
                      ) : (
                          <div className="text-center py-20 text-gray-400">
                              No vendors found for this category.
                          </div>
                      )}
                   </div>
               )}
               
               {currentStep === 3 && (
                   <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
                       <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 mb-8 relative overflow-hidden">
                           {/* Decorative Paper Edge (CSS trick) */}
                           <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0b2d49] to-[#d7a444]"></div>
                           
                           <div className="flex justify-between items-start mb-10 border-b border-gray-200 pb-8">
                               <div>
                                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice Preview</p>
                                   <h2 className="text-3xl font-bold text-[#0b2d49]">Event Summary</h2>
                                   <p className="text-gray-500 mt-2">
                                       {formData.title || (formData.listingType === 'Private' ? `${formData.type} Event` : 'Untitled Public Event')}
                                   </p>
                               </div>
                               <div className="text-right">
                                   <div className="inline-block bg-[#e9eff1] text-[#0b2d49] font-bold px-3 py-1 rounded-md text-sm mb-1">DRAFT</div>
                                   <p className="text-gray-400 text-sm">{new Date().toLocaleDateString()}</p>
                               </div>
                           </div>

                           <div className="space-y-6">
                               {Object.keys(formData.vendors).length === 0 ? (
                                   <div className="text-center text-gray-400 italic py-10">No vendors selected.</div>
                               ) : Object.entries(formData.vendors).map(([service, vendor]) => (
                                   <div key={service} className="flex justify-between items-center">
                                       <div className="flex items-center gap-4">
                                           <img src={vendor.image} alt={vendor.name} className="w-12 h-12 rounded-lg object-cover bg-gray-200" />
                                           <div>
                                               <p className="font-bold text-[#0b2d49] text-sm">{service}</p>
                                               <p className="text-gray-500 text-xs">{vendor.name}</p>
                                           </div>
                                       </div>
                                       <div className="font-medium text-[#0b2d49] text-right">
                                           ${vendor.priceMin} - ${vendor.priceMax}
                                       </div>
                                   </div>
                               ))}
                           </div>

                           <div className="border-t-2 border-dashed border-gray-200 mt-10 pt-6">
                               <div className="flex justify-between items-end">
                                   <p className="text-gray-500 font-medium">Total Estimated Cost</p>
                                   <div className="text-right">
                                       <p className="text-3xl font-extrabold text-[#0b2d49]">
                                          ${Object.values(formData.vendors).reduce((acc, v) => acc + v.priceMin, 0)} - 
                                          ${Object.values(formData.vendors).reduce((acc, v) => acc + v.priceMax, 0)}
                                       </p>
                                       <p className="text-xs text-gray-400">*Final cost depends on actual guest count and customizations</p>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
               
               {currentStep === 4 && (
                   <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-500 text-center">
                       <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
                           <BsCheck2 size={48} className="animate-bounce" />
                       </div>
                       <h2 className="text-3xl font-bold text-[#0b2d49] mb-4">Event Planned Successfully!</h2>
                       <p className="text-gray-500 max-w-md mb-10 leading-relaxed">
                           Your request has been received. An Event Manager will contact you soon.
                       </p>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                           <button 
                               onClick={() => window.location.href = '/user/dashboard'}
                               className="px-8 py-4 bg-[#0b2d49] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                           >
                               Go to Dashboard
                           </button>
                           <button 
                               onClick={() => window.location.reload()}
                               className="px-8 py-4 bg-white text-[#0b2d49] border-2 border-gray-100 font-bold rounded-2xl hover:border-[#d7a444] transition-all active:scale-95"
                           >
                               Plan Another Event
                           </button>
                       </div>
                   </div>
               )}
           </div>

            {/* Navigation Actions */}
            <div className="flex flex-col gap-4 mt-8">
                {currentStep === 2 && Object.keys(formData.vendors).length < formData.services.length && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                        <span className="text-sm">ℹ️</span>
                        Please select a vendor for all {formData.services.length} services to proceed ({Object.keys(formData.vendors).length}/{formData.services.length} selected)
                    </div>
                )}
                {currentStep < 4 && (
                    <div className="flex justify-between items-center">
                   <button 
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className={`font-bold text-gray-500 hover:text-[#0b2d49] disabled:opacity-30 disabled:hover:text-gray-500 transition-colors ${currentStep === 1 ? 'cursor-not-allowed' : ''}`}
                   >
                       Back
                   </button>
                   <button 
                      onClick={handleNext}
                      disabled={
                          (currentStep === 1 && (
                              !formData.date || 
                              formData.date < minDateString ||
                              !formData.startTime || 
                              !formData.lat || 
                              !formData.lng || 
                              !formData.locationValid ||
                              (formData.listingType === 'Public' && !formData.title) ||
                              formData.services.length === 0
                          )) ||
                           (currentStep === 2 && Object.keys(formData.vendors).length < formData.services.length)
                      }
                      className="px-8 py-3 bg-[#0b2d49] hover:bg-[#163a5a] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 flex items-center gap-2 transition-all active:scale-95"
                   >
                       {currentStep === 3 ? 'Finish' : 'Next Step'} <BsArrowRight />
                   </button>
               </div>
                )}
            </div>
         </div>

      </main>
      <Footer />
    </div>
  );
};

export default PlanningWizard;
