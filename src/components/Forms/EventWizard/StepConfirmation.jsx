import React from 'react';
import { BsCheck2 } from "react-icons/bs";

const StepConfirmation = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-500 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <BsCheck2 size={48} className="animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-[#0b2d49] mb-4">Event Planned Successfully!</h2>
            <p className="text-gray-500 max-w-md mb-10 leading-relaxed">
                Your request has been received. An Event Manager will contact you soon.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                <button
                    onClick={() => window.location.href = '/user/dashboard'}
                    className="px-8 py-4 bg-[#0b2d49] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                >
                    Go to Dashboard
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-white text-[#0b2d49] border-2 border-gray-100 font-bold rounded-2xl hover:border-[#d7a444] transition-all active:scale-95"
                >
                    Plan Another Event
                </button>
            </div>
        </div>
    );
};

export default StepConfirmation;
