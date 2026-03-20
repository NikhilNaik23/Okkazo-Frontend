import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const EditEventModal = ({ isOpen, onClose, event, onSave }) => {
    if (!isOpen) return null;

    const [title, setTitle] = useState('');
    const [locationName, setLocationName] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setTitle(String(event?.title || ''));
        setLocationName(String(event?.location || ''));
        setDescription(String(event?.description || ''));
    }, [event]);

    const handleSave = async () => {
        if (!onSave) {
            toast.error('Save handler not configured');
            return;
        }

        setSaving(true);
        try {
            await onSave({
                eventTitle: title,
                locationName,
                eventDescription: description,
            });
            toast.success('Event updated successfully!');
            onClose();
        } catch (err) {
            toast.error(err?.message || 'Failed to update event');
        } finally {
            setSaving(false);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Edit Event Details</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Event Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                            <input
                                type="date"
                                disabled
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-gray-50 text-gray-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                            <input
                                type="text"
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-lg disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default EditEventModal;
