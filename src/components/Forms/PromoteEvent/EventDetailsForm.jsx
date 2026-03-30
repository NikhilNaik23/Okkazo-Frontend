import React from 'react';
import { BsCheck2 } from "react-icons/bs";
import { toIstDateTimeLocalInput } from '../../../utils/istDateTime';

const EventDetailsForm = ({ formData, setFormData }) => {
    // Keep datetime-local constraints pinned to IST.
    const minDate = toIstDateTimeLocalInput(new Date()) || '';

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-3 font-bold text-lg mb-6">
                <div className="text-[#09637E]"><BsCheck2 size={24} /></div>
                Event Details
            </h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Event Name</label>
                    <input
                        type="text"
                        placeholder="Enter the name of your event..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#088395] transition-all"
                        value={formData.eventName}
                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Start Date & Time</label>
                        <div className="relative group">
                            <input
                                type="datetime-local"
                                min={minDate}
                                className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#088395] transition-all"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">End Date & Time</label>
                        <input
                            type="datetime-local"
                            min={formData.startDate || minDate}
                            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#088395] transition-all"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Total Number of Tickets to be Sold</label>
                    <input
                        type="number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#088395] transition-all"
                        value={formData.totalTickets}
                        onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventDetailsForm;
