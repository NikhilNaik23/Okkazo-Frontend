import React from 'react';
import { motion } from 'framer-motion';
import { BsArrowRight } from 'react-icons/bs';
import LocationPicker from '../../../Map/LocationPicker';

const MapModal = ({ isOpen, onClose, handleChange }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#eff6f7] flex items-center justify-center p-0 md:p-12"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-none md:rounded-[60px] shadow-2xl w-full max-w-6xl h-full md:h-[85vh] overflow-hidden relative flex flex-col"
            >
                <div className="p-10 border-b flex flex-col md:flex-row gap-8 justify-between items-start md:items-center relative z-20 bg-white">
                    <div className="flex items-center gap-12 flex-1 w-full text-center">
                        <div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-teal-600/40 mb-1">Venue Pin</p>
                            <h2 className="text-4xl font-serif-premium italic text-teal-900 whitespace-nowrap">Map the Venue</h2>
                        </div>
                        <div id="map-search-portal" className="flex-1 max-w-md hidden md:block" />
                    </div>
                    <button onClick={onClose} className="absolute top-10 right-10 w-14 h-14 rounded-full border flex items-center justify-center text-teal-900 hover:bg-teal-50 transition-colors">
                        <BsArrowRight className="rotate-45" size={24} />
                    </button>
                </div>
                <div className="flex-1 relative bg-gray-50 overflow-visible">
                    <LocationPicker
                        className="absolute inset-0 w-full h-full"
                        onSelect={(data) => {
                            handleChange('location', data.address);
                            handleChange('lat', data.lat);
                            handleChange('lng', data.lng);
                            handleChange('locationValid', true);
                        }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MapModal;
