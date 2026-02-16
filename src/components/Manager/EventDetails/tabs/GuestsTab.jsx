import React from 'react';
import { Search, Filter, Plus, Download, Edit, MoreVertical, Check, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '../ui';
import { generateGuests } from '../../../../data/managerEventDetailsData';

const GuestsTab = ({ onAddClick }) => {
    const guests = generateGuests();

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button onClick={() => toast.success("Exporting guest list to CSV...")} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={onAddClick} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Guest
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-10">
                                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Registrant</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {guests.map((guest) => (
                            <tr key={guest.id} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs border border-white shadow-sm">
                                            {guest.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{guest.name}</p>
                                            <p className="text-xs text-gray-500">{guest.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {guest.ticket}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                    {guest.company}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        color={guest.status === 'Confirmed' ? 'green' : guest.status === 'Checked In' ? 'blue' : guest.status === 'Pending' ? 'amber' : 'red'}
                                        icon={guest.status === 'Confirmed' ? Check : guest.status === 'Checked In' ? CheckCircle : AlertCircle}
                                    >
                                        {guest.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                        <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors shadow-sm border border-transparent hover:border-gray-100"><Edit className="w-4 h-4" /></button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors shadow-sm border border-transparent hover:border-gray-100"><MoreVertical className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                <span className="text-xs font-bold text-gray-500">Showing 1-8 of 2,450</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">Next</button>
                </div>
            </div>
        </div>
    );
};

export default GuestsTab;
