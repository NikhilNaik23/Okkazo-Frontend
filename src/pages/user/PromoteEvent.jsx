import React, { useState } from "react";
import Navbar from "../../components/Layout/user/Navbar";
import Footer from "../../components/Layout/user/Footer";
import { BsCheck2, BsPlus, BsTrash, BsShieldCheck, BsCloudUpload, BsInfoCircle, BsArrowRight, BsCalendar, BsClock } from "react-icons/bs";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Reuse the Okkazo marker from Planning Wizard
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

const LocationMarker = ({ lat, lng, onSelect }) => {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return lat ? <Marker position={[lat, lng]} icon={okkazoIcon} /> : null;
};

const PromoteEvent = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        eventName: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        totalTickets: 690,
        address: "",
        lat: 40.7128,
        lng: -74.0060,
        tickets: [
            { id: 1, name: "VVIP", price: 5000, quantity: 40 },
            { id: 2, name: "VIP", price: 150, quantity: 150 },
            { id: 3, name: "Premium", price: 250, quantity: 100 },
            { id: 4, name: "General Admission", price: 200, quantity: 500 }
        ],
        banner: null
    });

    // Calculations
    const totalTicketValue = formData.tickets.reduce((acc, t) => acc + (t.price * t.quantity), 0);
    const serviceCharge = totalTicketValue * 0.05;
    const platformFee = 149.00;
    const projectedRevenue = totalTicketValue - serviceCharge;

    const handleAddTicket = () => {
        const newId = formData.tickets.length > 0 ? Math.max(...formData.tickets.map(t => t.id)) + 1 : 1;
        setFormData({
            ...formData,
            tickets: [...formData.tickets, { id: newId, name: "", price: 0, quantity: 0 }]
        });
    };

    const handleRemoveTicket = (id) => {
        setFormData({
            ...formData,
            tickets: formData.tickets.filter(t => t.id !== id)
        });
    };

    const handleTicketChange = (id, field, value) => {
        setFormData({
            ...formData,
            tickets: formData.tickets.map(t => t.id === id ? { ...t, [field]: value } : t)
        });
    };

    const handleNext = () => setCurrentStep(prev => prev + 1);

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <Navbar />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-20">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold mb-2">Public Event Promotion Form</h1>
                    <p className="text-gray-500 text-sm">Configure your event details, tickets, and publishing options.</p>
                </div>

                {currentStep === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Content (Form) */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Card 1: Event Details */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="flex items-center gap-3 font-bold text-lg mb-6">
                                    <div className="text-[#00bfa5]"><BsCheck2 size={24} /></div>
                                    Event Details
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Event Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter the name of your event..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#d7a444] transition-all"
                                            value={formData.eventName}
                                            onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Start Date & Time</label>
                                            <div className="relative group">
                                                <input 
                                                    type="datetime-local" 
                                                    className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#d7a444] transition-all"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">End Date & Time</label>
                                            <input 
                                                type="datetime-local" 
                                                className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#d7a444] transition-all"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Total Number of Tickets to be Sold</label>
                                        <input 
                                            type="number" 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#d7a444] transition-all"
                                            value={formData.totalTickets}
                                            onChange={(e) => setFormData({...formData, totalTickets: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Venue Location */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="flex items-center gap-3 font-bold text-lg mb-6">
                                    <div className="text-[#00bfa5] font-bold text-xl">📍</div>
                                    Venue Location
                                </h2>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📍</div>
                                        <input 
                                            type="text" 
                                            placeholder="Search physical address..."
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#d7a444] transition-all bg-gray-50/50"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        />
                                    </div>
                                    <div className="h-80 w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0">
                                        <MapContainer 
                                            center={[formData.lat, formData.lng]} 
                                            zoom={13} 
                                            className="h-full w-full"
                                        >
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <LocationMarker 
                                                lat={formData.lat} 
                                                lng={formData.lng} 
                                                onSelect={(lat, lng) => setFormData({...formData, lat, lng})} 
                                            />
                                        </MapContainer>
                                        <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-2xl"></div>
                                    </div>
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

                            {/* Card 3: Ticket Categories */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="flex items-center gap-3 font-bold text-lg mb-6">
                                    <div className="text-white bg-[#00bfa5] w-6 h-6 rounded flex items-center justify-center text-[10px]">🎫</div>
                                    Ticket Categories
                                </h2>
                                <div className="space-y-4">
                                    {formData.tickets.map((ticket, index) => (
                                        <div key={ticket.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="md:col-span-5">
                                                <label className="block text-[8px] font-extrabold text-gray-400 uppercase mb-1">Category Name</label>
                                                <input 
                                                    type="text" 
                                                    value={ticket.name}
                                                    onChange={(e) => handleTicketChange(ticket.id, 'name', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#d7a444] outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-[8px] font-extrabold text-gray-400 uppercase mb-1">Price per Ticket ($)</label>
                                                <input 
                                                    type="number" 
                                                    value={ticket.price}
                                                    onChange={(e) => handleTicketChange(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#d7a444] outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-[8px] font-extrabold text-gray-400 uppercase mb-1">Quantity</label>
                                                <input 
                                                    type="number" 
                                                    value={ticket.quantity}
                                                    onChange={(e) => handleTicketChange(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#d7a444] outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-1 flex justify-center pb-2">
                                                <button 
                                                    onClick={() => handleRemoveTicket(ticket.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <BsTrash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={handleAddTicket}
                                        className="w-full py-4 mt-2 border-2 border-dashed border-[#00bfa5] rounded-xl text-[#00bfa5] font-bold flex items-center justify-center gap-2 hover:bg-[#00bfa5]/5 transition-all active:scale-[0.98]"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-[#00bfa5] text-white flex items-center justify-center text-xs">
                                            <BsPlus size={18} />
                                        </div>
                                        Add Category
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Content (Sidebar) */}
                        <div className="space-y-8">
                            {/* Step Indicator (Ref 2) */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(step => (
                                        <div 
                                            key={step} 
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                step === currentStep 
                                                ? 'bg-[#00bfa5] text-white' 
                                                : step < currentStep 
                                                    ? 'bg-[#00bfa5]/20 text-[#00bfa5]' 
                                                    : 'bg-white text-gray-300 border border-gray-200'
                                            }`}
                                        >
                                            {step < currentStep ? <BsCheck2 /> : step}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Banner Upload */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="flex items-center gap-3 font-bold mb-4">
                                    <div className="text-[#00bfa5]"><BsPlus /></div>
                                    Event Banner
                                </h3>
                                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[#00bfa5]/50 transition-all">
                                    <div className="w-12 h-12 bg-[#00bfa5]/10 text-[#00bfa5] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <BsCloudUpload size={24} />
                                    </div>
                                    <p className="font-bold text-sm mb-1">Click or drag to upload</p>
                                    <p className="text-[10px] text-gray-400">SVG, PNG, JPG (Max. 800x400px)</p>
                                </div>
                                <div className="mt-4 flex items-start gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                    <BsInfoCircle className="text-[#0b2d49] mt-0.5" size={12} />
                                    <p className="text-[10px] text-gray-500 leading-tight">Events with banners have a 40% higher conversion rate.</p>
                                </div>
                            </div>

                            {/* Revenue Card */}
                            <div className="bg-[#00bfa5] rounded-3xl p-6 text-white shadow-xl shadow-teal-500/20 relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Projected Revenue</p>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <h2 className="text-4xl font-extrabold">${projectedRevenue.toLocaleString()}</h2>
                                    <span className="text-xs opacity-80">Est. Net Payout</span>
                                </div>
                                
                                <div className="space-y-3 pt-6 border-t border-white/20">
                                    <div className="flex justify-between text-xs opacity-90">
                                        <span>Total Ticket Value</span>
                                        <span>${totalTicketValue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs opacity-90 pb-4">
                                        <span>Mgmt. & Service Charge (5%)</span>
                                        <span className="font-bold">-${serviceCharge.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-4 flex justify-between items-center mt-4">
                                        <span className="text-sm font-bold">Platform Fee (One-time)</span>
                                        <span className="text-xl font-extrabold">${platformFee}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <button 
                                    onClick={handleNext}
                                    className="w-full py-4 bg-[#00bfa5] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    Pay Platform Fee Only (${platformFee}) <BsArrowRight />
                                </button>
                                <button className="w-full py-4 bg-white text-[#0b2d49] font-bold rounded-2xl border border-gray-200 hover:border-[#d7a444] transition-all">
                                    Save as Draft
                                </button>
                                <p className="text-center text-[10px] text-gray-400">Need help? <a href="#" className="underline font-bold text-gray-600">Contact Support</a></p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
};

export default PromoteEvent;
