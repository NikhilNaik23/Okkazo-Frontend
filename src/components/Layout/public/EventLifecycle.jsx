import React, { useState } from "react";
import {
    FaCalendarCheck,
    FaBullhorn,
    FaClipboardList,
    FaChartLine
} from "react-icons/fa";

const EventLifecycle = () => {
    const [activeStage, setActiveStage] = useState(0);

    const stages = [
        {
            id: 0,
            title: "Planning",
            icon: <FaCalendarCheck />,
            description: "Streamline your entire planning workflow from venue selection to budgeting.",
            features: [
                "Venue Sourcing & Selection",
                "Vendor Management Portal",
                "Budgeting & Approval Flows",
                "Seating & Floor Layouts"
            ],
            color: "bg-[#09637E]",
            textColor: "text-[#09637E]",
            position: "top-0 right-0 rounded-tr-full"
        },
        {
            id: 1,
            title: "Promotion",
            icon: <FaBullhorn />,
            description: "Boost attendance and engagement with powerful marketing tools.",
            features: [
                "Custom Event Websites",
                "Email Marketing Campaigns",
                "Social Media Integration",
                "Dynamic Registration Forms"
            ],
            color: "bg-[#088395]",
            textColor: "text-[#088395]",
            position: "bottom-0 right-0 rounded-br-full"
        },
        {
            id: 2,
            title: "Day of Event",
            icon: <FaClipboardList />,
            description: "Ensure a flawless on-site experience for every attendee.",
            features: [
                "Fast Onsite Check-in",
                "Badge Printing & Scanning",
                "Attendees Mobile App",
                "Live Polls & Q&A"
            ],
            color: "bg-[#7AB2B2]",
            textColor: "text-[#7AB2B2]",
            position: "bottom-0 left-0 rounded-bl-full"
        },
        {
            id: 3,
            title: "Post Event",
            icon: <FaChartLine />,
            description: "Measure success and gather insights for future improvements.",
            features: [
                "Advanced Analytics Dashboard",
                "Attendee Feedback Surveys",
                "ROI Measurement Tools",
                "Data Export & Integration"
            ],
            color: "bg-[#A8D1D1]", // Slightly lighter version of 7AB2B2 or distinct
            // Let's stick to the palette requested: #09637E, #088395, #7AB2B2, #EBF4F6
            // We need a 4th distinctive color or reuse.
            // Let's use the lightest teal #7AB2B2 for Day of event and maybe a mix or Opacity?
            // Actually, let's gradients or rotate the palette slightly.
            // Let's use #09637E for Planning, #088395 for Promotion, #7AB2B2 for Day of Event.
            // For Post Event, maybe a lighter slate or reusing #088395 with opacity? 
            // Or lets use #4C8F9E (midpoint). 
            // Re-reading user request: "we will use #09637E, #088395, #7AB2B2, #EBF4F6 palette"
            // EBF4F6 is background. So we have 3 main colors.
            // I will recycle #09637E for Post Event but maybe simpler styling or just strict cycle.
            // Let's use #2C7A8E mixed. 
            // Actually, Day of Event could be #088395 and Post Event #7AB2B2?
            // Let's try:
            // Planning: #09637E (Darkest)
            // Promotion: #088395 (Medium)
            // Day of Event: #459EA5 (Custom blend or just #7AB2B2)
            // Post Event: #7AB2B2 (Lightest)
            // Wait, 4 stages, 3 colors. I will make Post Event loop back to dark or use a distinct shade. 
            // Let's use #09637E and #088395 alternating or gradient.
            // Let's assign specific hexes:
            // Planning: #09637E
            // Promotion: #088395
            // Day of Event: #7AB2B2
            // Post Event: #5C9EAD (Interpolated) or just #09637E again? No.
            // Let's use #4A90A4.
            // I will put a custom color for Post Event to make it distinct but harmonious.
            color: "bg-[#5D9C9F]",
            textColor: "text-[#5D9C9F]",
            position: "top-0 left-0 rounded-tl-full"
        }
    ];

    return (
        <section className="py-20 bg-white flex justify-center overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#09637E] mb-4">
                        The Complete Event Lifecycle
                    </h2>
                    <p className="text-[#088395] text-lg">
                        Manage every stage of your event with our integrated platform.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">

                    {/* Interactive Circular Diagram */}
                    <div className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px] flex-shrink-0">
                        {/* Center Circle (Brand/Logo Placeholder) */}
                        <div className="absolute inset-0 m-auto w-24 h-24 md:w-32 md:h-32 bg-white rounded-full z-20 shadow-lg flex flex-col items-center justify-center p-2 text-center">
                            <span className="text-[#09637E] font-bold text-xs md:text-sm uppercase tracking-wider leading-tight">
                                Event<br />Lifecycle
                            </span>
                        </div>

                        {/* Segments */}
                        <div className="absolute inset-0 w-full h-full rotate-45">
                            {stages.map((stage, index) => (
                                <div
                                    key={stage.id}
                                    className={`absolute w-1/2 h-1/2 ${stage.position} ${stage.color}
                    cursor-pointer transition-all duration-300 transform
                    ${activeStage === index ? "scale-105 shadow-xl z-10 brightness-110" : "opacity-90 hover:opacity-100 hover:scale-102"}
                    flex items-center justify-center border-4 border-white`}
                                    onClick={() => setActiveStage(index)}
                                    onMouseEnter={() => setActiveStage(index)}
                                >
                                    {/* Icon & Label content - unrotate to appear straight */}
                                    <div className={`transform -rotate-45 flex flex-col items-center gap-1 md:gap-2 text-white
                    ${(index === 0 || index === 2) ? "translate-x-0 translate-y-0" : ""}
                     // Adjust positioning based on quadrant if needed
                  `}>
                                        <div className="text-2xl md:text-4xl drop-shadow-md">
                                            {stage.icon}
                                        </div>
                                        <span className="text-xs md:text-sm font-bold uppercase tracking-wide drop-shadow-md">
                                            {stage.title}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Outline Circle/Decorations */}
                        <div className="absolute inset-[-20px] border-2 border-dashed border-[#088395]/30 rounded-full animate-spin-slow pointer-events-none"></div>
                    </div>

                    {/* Details Panel */}
                    <div className="flex-1 w-full lg:max-w-xl">
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-100 flex flex-col min-h-[500px] transition-colors duration-300 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${stages[activeStage].color} transition-colors duration-300`}></div>

                            <div className="flex items-center gap-4 mb-6 pl-4">
                                <div className={`p-4 rounded-2xl ${stages[activeStage].color} text-white shadow-md transition-colors duration-300`}>
                                    <div className="text-2xl">
                                        {stages[activeStage].icon}
                                    </div>
                                </div>
                                <div>
                                    <h3 className={`text-2xl md:text-3xl font-bold ${stages[activeStage].textColor} transition-colors duration-300`}>
                                        {stages[activeStage].title}
                                    </h3>
                                    <div className="h-1 w-20 bg-gray-100 mt-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${stages[activeStage].color} w-2/3 transition-colors duration-300`}></div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 text-lg mb-8 leading-relaxed pl-4">
                                {stages[activeStage].description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-auto pl-4">
                                {stages[activeStage].features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-[#EBF4F6] transition-colors duration-200">
                                        <div className={`w-2 h-2 rounded-full ${stages[activeStage].color} transition-colors duration-300`}></div>
                                        <span className="text-gray-700 font-medium text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center pl-4">
                                <button
                                    onClick={() => setActiveStage((prev) => (prev - 1 + 4) % 4)}
                                    className="text-gray-400 hover:text-[#09637E] transition-colors font-medium flex items-center gap-2"
                                >
                                    ← Prev
                                </button>
                                <div className="flex gap-2">
                                    {stages.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-2 rounded-full transition-all duration-300 ${activeStage === idx ? `w-8 ${stages[activeStage].color}` : "w-2 bg-gray-200"}`}
                                        ></div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setActiveStage((prev) => (prev + 1) % 4)}
                                    className="text-gray-400 hover:text-[#09637E] transition-colors font-medium flex items-center gap-2"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default EventLifecycle;
