import React from 'react';

const StepReview = ({ formData }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 mb-8 relative overflow-hidden">
                {/* Decorative Paper Edge (CSS trick) */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#0b2d49] to-[#d7a444]"></div>

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
                                ₹{vendor.priceMin * 83} - ₹{vendor.priceMax * 83}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t-2 border-dashed border-gray-200 mt-10 pt-6">
                    <div className="flex justify-between items-end">
                        <p className="text-gray-500 font-medium">Total Estimated Cost</p>
                        <div className="text-right">
                            <p className="text-3xl font-extrabold text-[#0b2d49]">
                                ₹{Object.values(formData.vendors).reduce((acc, v) => acc + v.priceMin, 0) * 83} -
                                ₹{Object.values(formData.vendors).reduce((acc, v) => acc + v.priceMax, 0) * 83}
                            </p>
                            <p className="text-xs text-gray-400">*Final cost depends on actual guest count and customizations</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepReview;
