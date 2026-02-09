import React from "react";
import { BsCheck2 } from "react-icons/bs";

const PaymentConfirmation = ({ formData, platformFee, setCurrentStep, handlePaymentSuccess }) => {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 shadow-sm text-center animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0b2d49]">
                <span className="text-4xl">💳</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-4 text-[#0b2d49]">Confirm Payment</h2>
            <p className="text-gray-500 mb-8 text-lg">
                You are about to pay <b className="text-[#0b2d49]">₹{platformFee.toLocaleString()}</b> to publish your event <br/>
                <span className="italic">"{formData.eventName}"</span>
            </p>
            
            <div className="space-y-4">
                <button 
                    onClick={handlePaymentSuccess}
                    className="w-full py-4 bg-[#0b2d49] text-white font-bold rounded-2xl shadow-xl hover:bg-[#d7a444] hover:-translate-y-1 transition-all"
                >
                    Pay & Publish
                </button>
                <button 
                    onClick={() => setCurrentStep(1)}
                    className="text-gray-400 hover:text-[#0b2d49] font-bold text-sm"
                >
                    Back to Edit
                </button>
            </div>
        </div>
    );
};

export default PaymentConfirmation;
