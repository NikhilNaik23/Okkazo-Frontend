import React from "react";
import { BsCheck2 } from "react-icons/bs";

const StepIndicator = ({ currentStep }) => {
    return (
        <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
                {[1, 2, 3].map(step => (
                    <div 
                        key={step} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            step === currentStep 
                            ? 'bg-[#0b2d49] text-white' 
                            : step < currentStep 
                                ? 'bg-[#0b2d49]/20 text-[#0b2d49]' 
                                : 'bg-white text-gray-300 border border-gray-200'
                        }`}
                    >
                        {step < currentStep ? <BsCheck2 /> : step}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;
