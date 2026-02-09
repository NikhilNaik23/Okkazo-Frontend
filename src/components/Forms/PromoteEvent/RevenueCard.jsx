import React from 'react';

const RevenueCard = ({ projectedRevenue, totalTicketValue, serviceCharge, platformFee }) => {
    return (
        <div className="bg-[#0b2d49]  rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Projected Revenue</p>
            <div className="flex items-baseline gap-2 mb-8">
                <h2 className="text-4xl font-extrabold">₹{projectedRevenue.toLocaleString()}</h2>
                <span className="text-xs opacity-80">Est. Net Payout</span>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/20">
                <div className="flex justify-between text-xs opacity-90">
                    <span>Total Ticket Value</span>
                    <span>₹{totalTicketValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs opacity-90 pb-4">
                    <span>Mgmt. & Service Charge (5%)</span>
                    <span className="font-bold">-₹{serviceCharge.toLocaleString()}</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 flex justify-between items-center mt-4">
                    <span className="text-sm font-bold">Platform Fee (One-time)</span>
                    <span className="text-xl font-extrabold">₹{platformFee.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default RevenueCard;
