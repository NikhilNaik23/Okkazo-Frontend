import React, { useEffect, useMemo } from 'react';
import { BsRocketTakeoff, BsEnvelope, BsShare, BsGraphUp } from "react-icons/bs";
import { promotePrices } from '../../../../data/promoteEventData';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPromotionsConfig,
    selectPromotionsConfigStatus,
    selectPromotePackages,
} from '../../../../store/slices/promotionsConfigSlice';

const titleize = (value) => {
    const s = String(value || '').trim();
    if (!s) return '';
    return s
        .split(/\s+/)
        .map((w) => w ? (w[0].toUpperCase() + w.slice(1)) : '')
        .join(' ');
};

const iconForValue = (value) => {
    const v = String(value || '').toLowerCase();
    if (v.includes('email')) return <BsEnvelope size={18} />;
    if (v.includes('social')) return <BsShare size={18} />;
    if (v.includes('analytic') || v.includes('analysis') || v.includes('insight')) return <BsGraphUp size={18} />;
    return <BsRocketTakeoff size={18} />;
};

const StepPromote = ({ formData, setFormData }) => {
    const dispatch = useDispatch();
    const status = useSelector(selectPromotionsConfigStatus);
    const promotePackages = useSelector(selectPromotePackages);

    useEffect(() => {
        dispatch(fetchPromotionsConfig({ force: true }));
    }, [dispatch]);

    const handleToggle = (value) => {
        setFormData({
            ...formData,
            promotions: {
                ...formData.promotions,
                [value]: !formData.promotions?.[value]
            }
        });
    };

    const fallbackOptions = useMemo(() => ([
        { value: 'featured placement', label: 'Featured Placement', fee: promotePrices.featured, desc: 'Top-tier visibility in the discovery feed and curated collections.' },
        { value: 'email blast', label: 'Email Blast', fee: promotePrices.email, desc: 'Dedicated spotlight in our weekly newsletter to local subscribers.' },
        { value: 'social synergy', label: 'Social Synergy', fee: promotePrices.social, desc: 'Automated high-engagement posts across partner networks.' },
        { value: 'advanced analytics', label: 'Advanced Analytics', fee: promotePrices.insights, desc: 'Real-time heatmaps and conversion tracking for your event page.' },
    ]), []);

    const promotionOptions = useMemo(() => {
        const src = Array.isArray(promotePackages) && promotePackages.length > 0
            ? promotePackages.filter((o) => o && o.active !== false && o.value)
            : fallbackOptions;

        return src.map((o) => ({
            value: String(o.value),
            label: (o.label && String(o.label).trim()) ? String(o.label).trim() : titleize(o.value),
            price: Number(o.fee ?? 0),
            icon: iconForValue(o.value),
            desc: o.desc || 'Visibility boost for your event.',
        }));
    }, [promotePackages, fallbackOptions]);

    return (
        <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-serif-premium text-6xl md:text-8xl italic text-[#7AB2B2] opacity-10 mb-8 absolute -top-20 -left-20 pointer-events-none select-none">Amplify</h1>

            <div className="mb-12 relative">
                <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 05 — Visibility Boost</p>
                <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Amplify your reach.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {promotionOptions.map((opt) => (
                    <div
                        key={opt.value}
                        onClick={() => handleToggle(opt.value)}
                        className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all duration-500 group relative overflow-hidden ${formData.promotions?.[opt.value]
                            ? 'bg-[#09637E] border-[#088395] shadow-2xl scale-[1.02]'
                            : 'bg-white border-[#09637E]/10 hover:border-[#088395] shadow-sm hover:shadow-xl'
                            }`}
                    >
                        {/* Background Pulse for active state */}
                        {formData.promotions?.[opt.value] && (
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#088395]/20 rounded-full blur-3xl animate-pulse" />
                        )}

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <span className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${formData.promotions?.[opt.value]
                                ? 'bg-[#088395] text-[#EBF4F6] rotate-12 shadow-lg shadow-[#088395]/40'
                                : 'bg-[#088395]/10 text-[#088395] group-hover:rotate-6'
                                }`}>
                                {opt.icon}
                            </span>

                            <div className="flex flex-col items-end gap-2">
                                <div className={`w-14 h-7 rounded-full transition-colors duration-300 relative ${formData.promotions?.[opt.value] ? 'bg-[#088395]' : 'bg-[#09637E]/10'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-500 shadow-md ${formData.promotions?.[opt.value] ? 'translate-x-8' : 'translate-x-1'}`} />
                                </div>
                                <span className={`text-[10px] font-black tracking-widest uppercase transition-colors duration-500 ${formData.promotions?.[opt.value] ? 'text-[#EBF4F6]' : 'text-[#088395]'}`}>
                                    ₹{opt.price}
                                </span>
                            </div>
                        </div>

                        <h3 className={`text-2xl font-serif-premium mb-2 italic transition-colors duration-500 ${formData.promotions?.[opt.value] ? 'text-[#EBF4F6]' : 'text-[#09637E]'}`}>
                            {opt.label}
                        </h3>
                        <p className={`text-sm leading-relaxed transition-colors duration-500 ${formData.promotions?.[opt.value] ? 'text-[#EBF4F6]/80' : 'text-[#09637E]/70'}`}>
                            {opt.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepPromote;
