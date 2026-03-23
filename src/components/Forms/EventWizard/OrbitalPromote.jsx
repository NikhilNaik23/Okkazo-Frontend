import React, { useEffect, useMemo } from 'react';
import { BsRocketTakeoff, BsEnvelope, BsShare, BsGraphUp } from "react-icons/bs";
import { promotePrices } from '../../../data/promoteEventData';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPromotionsConfig,
    selectPromotionsConfigStatus,
    selectPublicPromotionOptions,
} from '../../../store/slices/promotionsConfigSlice';

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

const OrbitalPromote = ({ formData, setFormData }) => {
    const dispatch = useDispatch();
    const status = useSelector(selectPromotionsConfigStatus);
    const publicPromotionOptions = useSelector(selectPublicPromotionOptions);

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
        { value: 'featured placement', label: 'Featured Placement', fee: promotePrices.featured, desc: 'Top-tier visibility in discovery feed.' },
        { value: 'email blast', label: 'Email Blast', fee: promotePrices.email, desc: 'Spotlight in weekly newsletter.' },
        { value: 'social synergy', label: 'Social Synergy', fee: promotePrices.social, desc: 'Automated posts across networks.' },
        { value: 'advanced analytics', label: 'Advanced Analytics', fee: promotePrices.insights, desc: 'Heatmaps and conversion tracking.' },
    ]), []);

    const promotionOptions = useMemo(() => {
        const src = Array.isArray(publicPromotionOptions) && publicPromotionOptions.length > 0
            ? publicPromotionOptions.filter((o) => o && o.active !== false && o.value)
            : fallbackOptions;

        return src.map((o) => ({
            value: String(o.value),
            label: (o.label && String(o.label).trim()) ? String(o.label).trim() : titleize(o.value),
            price: Number(o.fee ?? 0),
            icon: iconForValue(o.value),
            desc: 'Visibility boost for your event.',
        }));
    }, [publicPromotionOptions, fallbackOptions]);

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
                        key={opt.value}
                        onClick={() => handleToggle(opt.value)}
                        className={`bg-white/80 backdrop-blur-md rounded-[20px] p-4 border cursor-pointer transition-all duration-300 shadow-sm flex flex-col relative group ${formData.promotions?.[opt.value] ? 'border-[#088395] bg-[#EBF4F6]' : 'border-[#09637E]/10 hover:border-[#088395]/40'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            {/* Icon Box */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.promotions?.[opt.value] ? 'bg-[#088395] text-white shadow-md' : 'bg-[#EBF4F6] text-[#088395] group-hover:bg-[#088395]/10'}`}>
                                {opt.icon}
                            </div>

                            {/* Toggle Switch */}
                            <div className="flex flex-col items-end gap-1.5">
                                <div className={`w-11 h-[24px] rounded-full p-1 transition-colors duration-300 ${formData.promotions?.[opt.value] ? 'bg-[#088395]' : 'bg-[#09637E]/10'}`}>
                                    <div className={`w-[16px] h-[16px] rounded-full bg-white transition-transform duration-300 shadow-sm ${formData.promotions?.[opt.value] ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                </div>
                                <span className={`text-[9px] font-black tracking-widest uppercase ${formData.promotions?.[opt.value] ? 'text-[#088395]' : 'text-[#09637E]/40'}`}>
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
