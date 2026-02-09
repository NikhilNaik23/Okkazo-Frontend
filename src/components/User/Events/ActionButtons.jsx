import React from "react";
import { BsArrowRight } from "react-icons/bs";

const ActionButtons = ({ isFormComplete, handleNext, handleSaveDraft, platformFee }) => {
    return (
        <div className="space-y-4">
            <button 
                onClick={handleNext}
                disabled={!isFormComplete}
                className={`w-full py-4 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all ${
                    isFormComplete
                    ? 'bg-[#0b2d49] hover:bg-[#d7a444] text-white hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                Pay Platform Fee Only (₹{platformFee.toLocaleString()}) <BsArrowRight />
            </button>
            <button 
                onClick={handleSaveDraft}
                className="w-full py-4 bg-white text-[#0b2d49] font-bold rounded-2xl border border-gray-200 hover:border-[#d7a444] transition-all hover:bg-gray-50 active:scale-[0.98]"
            >
                Save as Draft
            </button>
            <p className="text-center text-[10px] text-gray-400">Need help? <a href="#" className="underline font-bold text-gray-600">Contact Support</a></p>
        </div>
    );
};

export default ActionButtons;
