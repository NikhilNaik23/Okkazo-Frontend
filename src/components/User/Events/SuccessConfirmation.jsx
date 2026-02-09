import React from "react";
import { BsCheck2 } from "react-icons/bs";

const SuccessConfirmation = () => {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 shadow-sm text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <BsCheck2 size={48} />
            </div>
            <h2 className="text-3xl font-extrabold mb-4 text-[#0b2d49]">Event Published!</h2>
            <p className="text-gray-500 mb-8">
                Your event is now live and tickets are available for purchase.
            </p>
            <button 
                onClick={() => window.location.reload()}
                className="bg-[#0b2d49] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default SuccessConfirmation;
