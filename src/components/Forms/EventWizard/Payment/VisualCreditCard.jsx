import React from 'react';

const VisualCreditCard = ({ cardName, cardNumber, expiry }) => {
    return (
        <div className="mb-10 perspective-1000 group">
            <div className="w-full aspect-[1.586] rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] shadow-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between text-white border border-white/10">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                <div className="mt-1 flex justify-between items-start">
                    <div className="w-10 h-7 rounded bg-white/20 backdrop-blur-sm border border-white/10" />
                    <span className="font-mono text-lg tracking-widest opacity-80 italic">VISA</span>
                </div>

                <div>
                    <div className="font-mono text-xl md:text-2xl tracking-[0.14em] mb-6 drop-shadow-md text-white/90">
                        {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end uppercase text-[9px] tracking-[0.2em] opacity-60 font-medium">
                        <div>
                            <span className="block text-[7px] mb-1">Card Holder</span>
                            {cardName || 'YOUR NAME'}
                        </div>
                        <div>
                            <span className="block text-[7px] mb-1">Expires</span>
                            {expiry || 'MM/YY'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualCreditCard;
