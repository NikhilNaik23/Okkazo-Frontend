import React from 'react';
import { BsCheck2 } from "react-icons/bs";

const SidebarProgress = ({ currentStep, steps }) => {
    return (
        <aside className="hidden lg:block w-72 h-fit sticky top-32 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-[#0b2d49]">Progress</h2>
                <div className="w-10 h-10 rounded-full border-4 border-gray-100 flex items-center justify-center text-xs font-bold text-[#d7a444]">
                    {Math.round(((currentStep - 1) / 4) * 100)}%
                </div>
            </div>

            <div className="space-y-6 relative">
                <div className="absolute left-3.75 top-4 bottom-4 w-0.5 bg-gray-100 -z-10"></div>
                {steps.map((step) => (
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
    );
};

export default SidebarProgress;
