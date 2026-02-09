import React from "react";
import { BsGeoAlt, BsCalendarEvent, BsPeople, BsClock, BsBuilding } from "react-icons/bs";

const EventInfoGrid = ({ event }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
            <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <BsCalendarEvent className="text-[#d7a444] mb-2" size={20} />
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Date</span>
                <span className="font-extrabold text-[#0b2d49] text-sm">{event.date.split('•')[0]}</span>
            </div>
            <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <BsClock className="text-[#d7a444] mb-2" size={20} />
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Time</span>
                <span className="font-extrabold text-[#0b2d49] text-sm">{event.date.split('•')[1] || "6:00 PM"}</span>
            </div>
            <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <BsBuilding className="text-[#d7a444] mb-2" size={20} />
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Venue</span>
                <span className="font-extrabold text-[#0b2d49] text-sm">{event.location.split(',')[0]}</span>
            </div>
        </div>
    );
};

export default EventInfoGrid;
