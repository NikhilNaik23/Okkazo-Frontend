import React from 'react';
import { Mail, Phone, Star, MoreHorizontal, Edit, ExternalLink, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const ManagerVendorCard = ({
    logo,
    name = 'Vendor Name',
    category = 'Category',
    status = 'Active',
    rating = 0,
    reviewCount = 0,
    email = 'email@example.com',
    phone = '+1 234 567 8900',
    onEdit,
    onUpdateStatus
}) => {

    // Professional Status Styles
    const getStatusStyle = (s) => {
        switch (s) {
            case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Inactive': return 'bg-slate-50 text-slate-600 border-slate-200';
            case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden"
        >
            <div className="p-5 flex flex-col h-full">

                {/* Header: Logo, Info, Menu */}
                <div className="flex gap-4 mb-4">
                    {/* Minimal Logo Area */}
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-lg text-gray-400 overflow-hidden">
                        {logo ? (
                            <img src={logo} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            name.charAt(0)
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 leading-tight truncate pr-2 group-hover:text-teal-700 transition-colors">
                                    {name}
                                </h3>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-0.5">
                                    {category}
                                </p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="flex items-center gap-4 mb-5 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(status)}`}>
                        {status}
                    </span>
                    <div className="w-px h-3 bg-gray-200" />
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-gray-900 fill-gray-900" />
                        <span className="font-bold text-gray-900">{rating}</span>
                        <span className="text-gray-400 text-xs">({reviewCount})</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-50 mb-4" />

                {/* Contact Compact */}
                <div className="mt-auto space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{phone}</span>
                    </div>
                </div>
            </div>

            {/* Footer Actions - Slight off-white background */}
            <div className="bg-gray-50 border-t border-gray-100 flex divide-x divide-gray-100">
                <button
                    onClick={onEdit}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
                >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                </button>
                <button
                    onClick={onUpdateStatus}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Profile
                </button>
            </div>
        </motion.div>
    );
};

export default ManagerVendorCard;
