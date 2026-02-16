import React from 'react';
import { BsClock, BsCheckCircleFill } from 'react-icons/bs';

const CampaignCard = ({ camp }) => {
    return (
        <div className={`relative rounded-[40px] p-8 flex flex-col justify-between overflow-hidden text-white ${camp.gradient} shadow-lg hover:-translate-y-2 transition-transform duration-500`}>
            {/* Status Pill */}
            <div className="flex justify-start">
                <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${camp.status.includes('Live') ? 'bg-emerald-400 text-[#09637E]' :
                    camp.status.includes('Sold Out') ? 'bg-emerald-600 text-white' : 'bg-[#d7a444] text-[#0b2d49]'
                    }`}>
                    {camp.status.includes('Live') && <span className="w-1.5 h-1.5 bg-[#09637E] rounded-full animate-pulse" />}
                    {camp.status}
                </span>
            </div>

            {/* Title Section */}
            <div className="mt-8 relative z-10">
                <h3 className="text-3xl font-serif-premium mb-2 leading-none text-[#09637E] mix-blend-color-burn">{camp.title}</h3>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mix-blend-overlay text-[#09637E]">{camp.subtitle}</p>
            </div>

            {/* Center Graphic/Stats */}
            <div className="flex-1 flex items-center justify-center my-8 relative z-10">
                {camp.centerText === 'Locked' ? (
                    <div className="text-center opacity-50 text-[#09637E]">
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md mx-auto mb-2 border border-[#09637E]/20">
                            <BsClock size={30} />
                        </div>
                    </div>
                ) : camp.centerText === 'Check' ? (
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl mx-auto">
                            <BsCheckCircleFill size={40} className="text-[#09637E]" />
                        </div>
                    </div>
                ) : (
                    <div className="relative w-24 h-24 rounded-full border-4 border-white/40 flex items-center justify-center backdrop-blur-sm text-[#09637E]">
                        <span className="text-2xl font-bold">{camp.centerText}</span>
                    </div>
                )}
            </div>

            {/* Bottom Stats & Action */}
            <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1 text-[#09637E]">{camp.revenueLabel}</p>
                <h4 className="text-3xl font-serif-premium mb-4 text-[#09637E]">{camp.revenue}</h4>

                <div className="flex justify-between items-end">
                    <div>
                        {camp.conversion && (
                            <div className="bg-white/30 backdrop-blur-md px-3 py-2 rounded-xl border border-white/40">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5 text-[#09637E]">ROI</p>
                                <p className="text-xs font-bold text-[#09637E]">{camp.conversion}</p>
                            </div>
                        )}
                    </div>
                    <button className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${camp.status === 'Sold Out' ? 'bg-[#09637E] text-white hover:bg-[#074d63]' : 'bg-white text-[#09637E] hover:bg-gray-100 shadow-lg'
                        }`}>
                        {camp.buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;
