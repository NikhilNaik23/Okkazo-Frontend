import React, { useRef, useEffect } from 'react';
import { BsX } from 'react-icons/bs';

const Modal = ({ isOpen, onClose, title, children, confirmText = "I Understand" }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09637E]/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div
                ref={modalRef}
                className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl shadow-[#09637E]/20 animate-[scaleIn_0.3s_ease-out]"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#e9eff1]">
                    <h2 className="text-lg font-black text-[#09637E]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-[#e9eff1] hover:bg-[#088395]/20 flex items-center justify-center text-[#708aa0] hover:text-[#09637E] transition-all duration-200 hover:scale-110"
                    >
                        <BsX size={20} />
                    </button>
                </div>
                {/* Modal Content */}
                <div className="p-5 overflow-y-auto max-h-[60vh] text-sm text-[#5a5b44] leading-relaxed">
                    {children}
                </div>
                {/* Modal Footer */}
                <div className="p-5 border-t border-[#e9eff1] bg-[#e9eff1]/30">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-[#09637E] to-[#088395] text-white rounded-xl font-bold text-sm hover:from-[#088395] hover:to-[#09637E] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
