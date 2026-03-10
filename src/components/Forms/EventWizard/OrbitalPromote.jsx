import React from 'react';
import { BsRocketTakeoff, BsEnvelope, BsShare, BsGraphUp } from "react-icons/bs";
import { promotePrices } from '../../../data/promoteEventData';

const OrbitalPromote = ({ formData, setFormData }) => {
    const handleToggle = (key) => {
        setFormData({
            ...formData,
            promotions: {
                ...formData.promotions,
                [key]: !formData.promotions[key]
            }
        });
    };

    const promotionOptions = [
        { key: 'featured', label: 'Featured Placement', price: promotePrices.featured, icon: <BsRocketTakeoff size={18} />, desc: 'Top-tier visibility in discovery feed.' },
        { key: 'email', label: 'Email Blast', price: promotePrices.email, icon: <BsEnvelope size={18} />, desc: 'Spotlight in weekly newsletter.' },
        { key: 'social', label: 'Social Synergy', price: promotePrices.social, icon: <BsShare size={18} />, desc: 'Automated posts across networks.' },
        { key: 'insights', label: 'Advanced Analytics', price: promotePrices.insights, icon: <BsGraphUp size={18} />, desc: 'Heatmaps and conversion tracking.' },
    ];

    return (
        <div className="max-w-2xl w-full animate-in fade-in">
            {/* Header */}
            <div className="mb-8">
                <h3 className="text-4xl font-serif-premium italic text-[#09637E] leading-tight">Amplify Reach</h3>
                <p className="text-[10px] font-black uppercase text-[#7AB2B2] tracking-widest mt-1">Visibility Boost</p>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
                {promotionOptions.map((opt) => (
                    <div
                        key={opt.key}
                        onClick={() => handleToggle(opt.key)}
                        className={`bg-white/80 backdrop-blur-md rounded-[20px] p-4 border cursor-pointer transition-all duration-300 shadow-sm flex flex-col relative group ${formData.promotions[opt.key] ? 'border-[#088395] bg-[#EBF4F6]' : 'border-[#09637E]/10 hover:border-[#088395]/40'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            {/* Icon Box */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.promotions[opt.key] ? 'bg-[#088395] text-white shadow-md' : 'bg-[#EBF4F6] text-[#088395] group-hover:bg-[#088395]/10'}`}>
                                {opt.icon}
                            </div>

                            {/* Toggle Switch */}
                            <div className="flex flex-col items-end gap-1.5">
                                <div className={`w-11 h-[24px] rounded-full p-1 transition-colors duration-300 ${formData.promotions[opt.key] ? 'bg-[#088395]' : 'bg-[#09637E]/10'}`}>
                                    <div className={`w-[16px] h-[16px] rounded-full bg-white transition-transform duration-300 shadow-sm ${formData.promotions[opt.key] ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                </div>
                                <span className={`text-[9px] font-black tracking-widest uppercase ${formData.promotions[opt.key] ? 'text-[#088395]' : 'text-[#09637E]/40'}`}>
                                    ₹{opt.price}
                                </span>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 flex flex-col justify-end">
                            <h3 className="text-lg font-serif-premium italic text-[#09637E] mb-1 leading-tight">
                                {opt.label}
                            </h3>
                            <p className="text-[10px] leading-relaxed font-semibold text-[#09637E]/50 tracking-wide">
                                {opt.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrbitalPromote;
