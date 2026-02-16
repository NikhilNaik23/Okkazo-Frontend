import React from 'react';

const BrandingPanel = () => {
    return (
        <div className="hidden lg:flex w-1/2 h-full relative bg-[#09637E] items-center justify-center overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 opacity-40">
                <img
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop"
                    alt="Event Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Branding Content */}
            <div className="relative z-10 p-12 text-white text-right">
                <div className="flex items-center gap-3 mb-6 justify-end">
                    {/* Logo */}
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                        <img
                            src="/public_logo.png"
                            alt="Okkazo"
                            className="h-8 md:h-10 w-auto"
                        />
                    </div>
                </div>
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                    Join the future of <br /> event management.
                </h1>
                <p className="text-lg text-gray-200 max-w-md leading-relaxed ml-auto">
                    Experience seamless ticketing, real-time analytics, and
                    unparalleled engagement tools designed for the modern organizer.
                </p>

                {/* Testimonial */}
                <div className="mt-12 ml-auto bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 max-w-sm text-left">
                    <p className="text-lg italic font-light mb-4">
                        "Okkazo transformed how we handle our annual tech summit. It's
                        simply brilliant."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Sarah Jenkins</p>
                            <p className="text-xs text-[#088395]">
                                Event Director, TechFlow
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="absolute bottom-8 right-12 text-xs text-gray-400">
                © 2026 OKKAZO GLOBAL INC.
            </p>
        </div>
    );
};

export default BrandingPanel;
