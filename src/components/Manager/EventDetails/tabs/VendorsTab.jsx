import React, { useState } from 'react';
import { 
    CheckCircle, Clock, XCircle, Users, Star, RefreshCw, Send, Eye, 
    FileCheck, MessageSquare 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { initialVendors, vendorAlternatives } from '../../../../data/managerEventDetailsData';

const VendorsTab = () => {
    const [vendors, setVendors] = useState(initialVendors);
    const [showAlternatives, setShowAlternatives] = useState(null);

    const getAvailabilityBadge = (av) => {
        if (av === 'available') return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: '✅ Available', icon: CheckCircle };
        if (av === 'pending') return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: '⏳ Pending', icon: Clock };
        return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: '❌ Unavailable', icon: XCircle };
    };

    const handleCheckAvailability = (vendorId) => {
        setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, availability: 'pending', status: 'Checking' } : v));
        toast("Checking vendor availability...", { icon: '🔍' });
        setTimeout(() => {
            const isAvailable = Math.random() > 0.4;
            setVendors(prev => prev.map(v => v.id === vendorId ? {
                ...v,
                availability: isAvailable ? 'available' : 'unavailable',
                status: isAvailable ? 'Available' : 'Unavailable'
            } : v));
            toast[isAvailable ? 'success' : 'error'](isAvailable ? "Vendor is available! ✅" : "Vendor is unavailable ❌");
        }, 1500);
    };

    const handleConfirmVendor = (vendorId) => {
        setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'Confirmed', availability: 'available' } : v));
        toast.success("Vendor confirmed for this event! 🎉");
    };

    const handleReplaceVendor = (vendorId, alt) => {
        setVendors(prev => prev.map(v => v.id === vendorId ? {
            ...v, name: alt.name, price: alt.price, rating: alt.rating,
            availability: 'available', status: 'Confirmed', icon: alt.name.substring(0, 2).toUpperCase()
        } : v));
        setShowAlternatives(null);
        toast.success(`Replaced with ${alt.name}! Now confirmed.`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Vendor Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Verify availability, confirm vendors, and manage alternatives</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.success("All vendors re-checked!")} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Re-check All
                    </button>
                    <button onClick={() => toast.success("Vendor summary sent to client!")} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send to Client
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Vendors</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{vendors.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Confirmed</p>
                    <p className="text-2xl font-extrabold text-green-700 mt-1">{vendors.filter(v => v.availability === 'available').length}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pending</p>
                    <p className="text-2xl font-extrabold text-amber-700 mt-1">{vendors.filter(v => v.availability === 'pending').length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Cost</p>
                    <p className="text-2xl font-extrabold text-teal-600 mt-1">₹{(vendors.reduce((sum, v) => sum + v.price, 0) / 100000).toFixed(1)}L</p>
                </div>
            </div>

            {/* Vendor Cards */}
            <div className="space-y-4">
                {vendors.map((vendor) => {
                    const badge = getAvailabilityBadge(vendor.availability);
                    return (
                        <div key={vendor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Vendor Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md
                                            ${vendor.color === 'blue' ? 'bg-blue-500' : vendor.color === 'orange' ? 'bg-orange-500' : 'bg-purple-500'}`}>
                                            {vendor.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-extrabold text-gray-900 text-lg">{vendor.name}</h4>
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg} ${badge.text}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-gray-500">{vendor.category}</span>
                                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {vendor.contact}</span>
                                                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {vendor.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Quoted Price</p>
                                        <p className="text-xl font-extrabold text-gray-900">₹{(vendor.price / 1000).toFixed(0)}k</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 shrink-0">
                                        {vendor.availability === 'unavailable' && (
                                            <button
                                                onClick={() => setShowAlternatives(showAlternatives === vendor.id ? null : vendor.id)}
                                                className="px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-100 border border-amber-200 flex items-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" /> Find Alternatives
                                            </button>
                                        )}
                                        {vendor.availability === 'pending' && (
                                            <button disabled className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold flex items-center gap-2 cursor-wait">
                                                <Clock className="w-4 h-4 animate-spin" /> Checking...
                                            </button>
                                        )}
                                        {vendor.availability !== 'available' && vendor.availability !== 'pending' && (
                                            <button
                                                onClick={() => handleCheckAvailability(vendor.id)}
                                                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" /> Check Availability
                                            </button>
                                        )}
                                        {vendor.availability === 'available' && vendor.status !== 'Confirmed' && (
                                            <button
                                                onClick={() => handleConfirmVendor(vendor.id)}
                                                className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Confirm
                                            </button>
                                        )}
                                        {vendor.status === 'Confirmed' && (
                                            <span className="px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Confirmed
                                            </span>
                                        )}
                                        <button
                                            onClick={() => toast.success("Contract downloaded")}
                                            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <FileCheck className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toast.success("Opening vendor chat...")}
                                            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Alternatives Panel */}
                            {showAlternatives === vendor.id && vendorAlternatives[vendor.category] && (
                                <div className="border-t border-gray-100 bg-amber-50/30 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 text-amber-600" /> Alternative {vendor.category} Vendors
                                        </h4>
                                        <button onClick={() => toast.success(`Alternatives sent to client for ${vendor.category}`)} className="text-sm font-bold text-teal-600 hover:underline flex items-center gap-1">
                                            <Send className="w-3.5 h-3.5" /> Send Options to Client
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {vendorAlternatives[vendor.category].map((alt) => (
                                            <div key={alt.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center font-bold text-sm">
                                                        {alt.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{alt.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Star className="w-3 h-3 text-amber-400" /> {alt.rating}
                                                            <span className="text-green-600 font-bold">Available</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="font-extrabold text-gray-900">₹{(alt.price / 1000).toFixed(0)}k</p>
                                                    <button
                                                        onClick={() => handleReplaceVendor(vendor.id, alt)}
                                                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        Select
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VendorsTab;
