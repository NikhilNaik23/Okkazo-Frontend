import React from 'react';

const Badge = ({ children, color = 'gray', icon: Icon }) => {
    const colorStyles = {
        teal: 'bg-teal-50 text-teal-700 border-teal-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        gray: 'bg-gray-50 text-gray-700 border-gray-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
        green: 'bg-green-50 text-green-700 border-green-100',
        red: 'bg-red-50 text-red-700 border-red-100',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${colorStyles[color]} transition-colors`}>
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
};

export default Badge;
