import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AddGuestModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Add New Guest</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                        <input type="text" placeholder="e.g. John Doe" className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                        <input type="email" placeholder="john@example.com" className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Ticket Type</label>
                            <select className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white">
                                <option>General Admission</option>
                                <option>VIP Pass</option>
                                <option>Speaker</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <select className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white">
                                <option>Confirmed</option>
                                <option>Pending</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={() => { toast.success("Guest added to list!"); onClose(); }} className="px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-lg">Add Guest</button>
                </div>
            </motion.div>
        </div>
    );
};

export default AddGuestModal;
