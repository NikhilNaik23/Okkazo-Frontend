import React from 'react';
import { BsShop } from 'react-icons/bs';

const SidePanel = () => {
    return (
        <div className="hidden lg:flex w-1/2 h-full relative bg-[#09637E] items-center justify-center overflow-hidden">
            {/* Background Image */}
            <img
                src="/vendor_hero.png"
                alt="Vendors marketplace"
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            />

            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] via-transparent to-[#09637E]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09637E]/60 to-transparent" />

            {/* Content */}
            <div className="relative z-10 p-16 text-white max-w-xl">
                <div className="bg-white/10 backdrop-blur-xl w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border border-white/20">
                    <BsShop size={32} />
                </div>
                <h2 className="text-6xl font-black mb-8 leading-[1.1]">Grow your business with Okkazo.</h2>
                <p className="text-xl text-white/80 leading-relaxed mb-12">
                    Join thousands of premium vendors offering world-class services to visionary event organizers across the globe.
                </p>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h4 className="text-3xl font-black text-[#7AB2B2]">0</h4>
                        <p className="text-sm font-bold uppercase tracking-widest text-white/60">Active Events</p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-3xl font-black text-[#7AB2B2]">24/7</h4>
                        <p className="text-sm font-bold uppercase tracking-widest text-white/60">Expert Support</p>
                    </div>
                </div>
            </div>

            {/* Branding */}
            <div className="absolute top-12 right-12 flex items-center gap-3">
                <img src="/public_logo.png" alt="Okkazo" className="h-10 w-auto opacity-80" />
            </div>
        </div>
    );
};

export default SidePanel;
