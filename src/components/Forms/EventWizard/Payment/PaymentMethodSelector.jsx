import React from 'react';
import { BsCreditCard, BsQrCodeScan } from 'react-icons/bs';

const PaymentMethodSelector = ({ paymentMethod, setPaymentMethod }) => {
    return (
        <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 border border-gray-100">
            <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all 
                ${paymentMethod === 'card' ? 'bg-white text-[#09637E] shadow-lg shadow-gray-200/50' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <BsCreditCard size={14} /> Card
            </button>
            <button
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all 
                ${paymentMethod === 'upi' ? 'bg-white text-[#09637E] shadow-lg shadow-gray-200/50' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <BsQrCodeScan size={14} /> UPI
            </button>
        </div>
    );
};

export default PaymentMethodSelector;
