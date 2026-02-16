import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ label, value, subtext, trend, icon: Icon, color = 'teal' }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
            </div>
            {trend && (
                <span className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-600' : 'text-red-600'} bg-${trend > 0 ? 'green' : 'red'}-50 px-2 py-0.5 rounded-full`}>
                    {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
        <h4 className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</h4>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">{label}</p>
        {subtext && <p className="text-xs text-gray-500 mt-2 font-medium">{subtext}</p>}
    </div>
);

export default StatCard;
