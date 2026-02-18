import React, { useEffect, useRef } from 'react';

const VerticalStepTransition = ({ currentStep, steps, onStepClick }) => {
    const listRef = useRef(null);

    // Calculate position to center the active step
    // Assuming each step item has a fixed height, e.g., 80px (h-20)
    const activeIndex = currentStep;

    // We want the active step to be roughly vertically centered.
    // If the container is 100vh, center is 50vh.

    return (
        <div className="h-screen w-80 fixed left-0 top-0 flex flex-col justify-center bg-[#09637E] text-[#EBF4F6] z-50 shadow-2xl overflow-hidden border-r border-[#EBF4F6]/10">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-50%] w-[100%] h-[50%] bg-[#7AB2B2] blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-50%] w-[100%] h-[50%] bg-[#088395] blur-[100px] rounded-full" />
            </div>

            {/* Steps Container */}
            <div
                className="relative h-[60vh] w-full"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
                }}
            >
                {/* The "Lens" or Active Indicator Line */}
                <div className="absolute top-1/2 left-0 w-1 h-20 bg-[#7AB2B2] -translate-y-1/2 rounded-r-full shadow-[0_0_20px_#7AB2B2] z-20 transition-all duration-500" />

                <div
                    className="absolute w-full top-1/2 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
                    style={{ transform: `translateY(calc(-50px - ${activeIndex * 100}px))` }} // 100px is step height
                >
                    {steps.map((step, idx) => {
                        // idx is 0-based index from the steps array passed in.
                        // However, currentStep in parent is 1-based usually. Let's assume passed steps has correct length.
                        // Assuming currentStep is an index or id. Let's align on 0-based index for logic.
                        // If currentStep is 1 (Details), activeIndex should be 0.

                        // We will map based on the array index.
                        const distanceFromActive = Math.abs(currentStep - idx);
                        const isActive = currentStep === idx;

                        return (
                            <div
                                key={idx}
                                onClick={() => onStepClick && onStepClick(idx)}
                                className={`h-[100px] flex items-center pl-10 pr-4 cursor-pointer transition-all duration-500 group ${isActive ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    {/* Number / Status */}
                                    <div className={`relative transition-all duration-500 ${isActive ? 'scale-125' : 'scale-100'}`}>
                                        <span className={`font-serif-premium text-3xl italic ${isActive ? 'text-[#EBF4F6]' : 'text-[#7AB2B2]'}`}>
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        {isActive && (
                                            <div className="absolute -inset-4 bg-[#7AB2B2]/20 blur-xl rounded-full -z-10" />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="flex flex-col">
                                        <span className={`font-bold uppercase tracking-widest text-xs transition-all duration-300 ${isActive ? 'text-[#7AB2B2] translate-x-2' : ''}`}>
                                            Step {idx + 1}
                                        </span>
                                        <span className={`font-serif-premium text-2xl transition-all duration-300 ${isActive ? 'text-[#EBF4F6] translate-x-2' : 'text-[#EBF4F6]/80'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer / Progress percentage */}
            <div className="absolute bottom-8 left-8">
                <div className="flex items-end gap-2 text-[#EBF4F6]">
                    <span className="text-5xl font-serif-premium italic">{Math.round(((currentStep + 1) / steps.length) * 100)}</span>
                    <span className="text-xl mb-2">%</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest opacity-50">Completion</span>
            </div>
        </div>
    );
};

export default VerticalStepTransition;
