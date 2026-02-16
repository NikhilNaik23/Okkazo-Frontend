import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { scheduleItems } from '../../../../data/managerEventDetailsData';

const ScheduleTab = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
        {/* Date Headers */}
        <div className="flex gap-4 mb-8 justify-center">
            {['Oct 24', 'Oct 25', 'Oct 26'].map((date, i) => (
                <button key={i} className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${i === 0 ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-900/20' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                    Day {i + 1} <span className={`block text-xs font-medium opacity-80`}>{date}</span>
                </button>
            ))}
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-gray-100 ml-6 space-y-8 pb-12">
            {scheduleItems.map((item, i) => (
                <div key={i} className="relative pl-8 group">
                    {/* Dot */}
                    <span className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-white border-4 border-gray-200 group-hover:border-teal-500 transition-colors shadow-sm"></span>

                    {/* Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">{item.time}</span>
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.dur}</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.loc}</span>
                            <div className="flex -space-x-2">
                                <span className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></span>
                                <span className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></span>
                                <span className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white text-[8px] flex items-center justify-center font-bold text-white">+5</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ScheduleTab;
