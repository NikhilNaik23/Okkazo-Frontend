import React from 'react';
import { BsCheck2 } from "react-icons/bs";
import { dummyVendors } from "../../../data/vendorData";

const StepVendorSelection = ({ formData, activeServiceTab, setActiveServiceTab, handleSelectVendor }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Services Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-gray-100">
                {formData.services.length === 0 ? (
                    <p className="text-red-500">Please select services in Step 1 first.</p>
                ) : formData.services.map((service, idx) => (
                    <button
                        key={service}
                        onClick={() => setActiveServiceTab(idx)}
                        className={`px-5 py-2 whitespace-nowrap rounded-full text-sm font-bold transition-all ${activeServiceTab === idx
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
    );
};

export default StepVendorSelection;
