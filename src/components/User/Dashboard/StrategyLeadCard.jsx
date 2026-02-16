import React from 'react';
import { BsClock } from 'react-icons/bs';

const StrategyLeadCard = () => {
    return (
        <div className="relative bg-gradient-to-br from-[#7AB2B2]/20 to-[#EBF4F6] rounded-[40px] p-8 flex flex-col justify-between overflow-hidden border border-[#09637E]/5">
            <div>
                <div className="w-12 h-12 rounded-full border-2 border-[#09637E] flex items-center justify-center text-[#09637E] mb-8">
                    <BsClock size={20} />
                </div>
                <h3 className="text-3xl font-serif-premium text-[#09637E] mb-4 leading-tight">Your Dedicated Strategy Lead</h3>
                <p className="text-xs text-[#09637E]/60 leading-relaxed font-medium">
                    Direct access to your assigned account manager for high-tier campaign optimizations and bespoke requests.
                </p>
            </div>
            <div className="flex items-center gap-4 bg-white/50 p-4 rounded-3xl backdrop-blur-sm border border-white/40">
                <div className="w-12 h-12 bg-[#0b2d49] rounded-xl flex items-center justify-center text-white shadow-lg">
                    {/* Placeholder Avatar */}
                    <span className="font-bold text-xs">SM</span>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]">Sarah Miller</p>
                    <p className="text-[9px] font-bold text-[#09637E]/50 uppercase tracking-wider">Senior Strategist</p>
                </div>
            </div>
        </div>
    );
};

export default StrategyLeadCard;
