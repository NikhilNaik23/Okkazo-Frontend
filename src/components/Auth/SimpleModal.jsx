import React from 'react';
import { RiCloseLine } from 'react-icons/ri';

const SimpleModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;
    
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09637E]/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f8faFC]">
                    <h3 className="text-xl font-bold text-[#09637E]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-[#088395] transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <RiCloseLine size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar text-gray-600 leading-relaxed text-sm">
                    {content}
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#09637E] text-white rounded-lg font-semibold hover:bg-[#088395] transition-colors"
                    >
                        Understood
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimpleModal;
