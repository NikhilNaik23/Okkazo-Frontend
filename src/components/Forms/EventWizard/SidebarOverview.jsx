import React from 'react';
import { BsCircleFill } from "react-icons/bs";

const SidebarOverview = ({ selectedVendors }) => {
    const categories = [
        { name: 'Venue', color: '#09637E' },
        { name: 'Catering', color: '#088395' },
        { name: 'Florals', color: '#7AB2B2' },
        { name: 'Photography', color: '#09637E' },
        { name: 'Music', color: '#088395' },
        { name: 'Decor', color: '#7AB2B2' },
    ];

    return (
        <aside className="hidden lg:block w-72 h-fit sticky top-32 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-[1px] bg-surface -z-10"></div>

                {categories.map((cat, idx) => {
                    const isSelected = !!selectedVendors[cat.name];
                    return (
                        <div key={cat.name} className="flex items-center gap-4 group">
                            <div
                                className="w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-all duration-500 z-10"
                                style={{
                                    borderColor: isSelected ? cat.color : 'var(--color-surface)',
                                    boxShadow: isSelected ? `0 0 10px ${cat.color}40` : 'none'
                                }}
                            >
                                {isSelected && (
                                    <div
                                        className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                )}
                            </div>
                            <span
                                className={`text-[11px] font-black tracking-[0.2em] uppercase transition-colors duration-300 ${isSelected ? 'opacity-100' : 'opacity-30'}`}
                                style={{ color: isSelected ? cat.color : '#9CA3AF' }}
                            >
                                {cat.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default SidebarOverview;
