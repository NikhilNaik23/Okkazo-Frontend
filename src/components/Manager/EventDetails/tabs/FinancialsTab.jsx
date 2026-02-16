import React from 'react';
import { DollarSign, Send, Download, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { StatCard } from '../ui';
import { vendorCosts } from '../../../../data/managerEventDetailsData';

const FinancialsTab = ({ event }) => {
    const totalCost = vendorCosts.reduce((sum, v) => sum + v.price, 0);
    const markup = 0.18;
    const clientPrice = Math.round(totalCost * (1 + markup));
    const profit = clientPrice - totalCost;
    const paidAmount = vendorCosts.filter(v => v.status === 'Paid').reduce((sum, v) => sum + v.price, 0);

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Vendor Cost" value={`₹${(totalCost / 100000).toFixed(1)}L`} color="blue" icon={DollarSign} />
                <StatCard label="Client Quote" value={`₹${(clientPrice / 100000).toFixed(1)}L`} color="green" icon={TrendingUp} subtext={`${(markup * 100).toFixed(0)}% markup`} />
                <StatCard label="Projected Profit" value={`₹${(profit / 1000).toFixed(0)}k`} color="teal" icon={TrendingUp} trend={18} />
                <StatCard label="Outstanding" value={`₹${((totalCost - paidAmount) / 1000).toFixed(0)}k`} color="rose" icon={AlertCircle} subtext={`${vendorCosts.filter(v => v.status !== 'Paid').length} vendors unpaid`} />
            </div>

            {/* Per-Vendor Cost Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Vendor Cost Breakdown</h3>
                        <p className="text-sm text-gray-500 mt-1">Per-vendor pricing and payment status</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => toast.success("Downloading invoice PDF...")} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <button onClick={() => toast.success("Quote sent to client!")} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                            <Send className="w-4 h-4" /> Send Quote to Client
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Quoted Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vendorCosts.map((item, i) => (
                                <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${item.color} text-white font-bold text-xs flex items-center justify-center shadow-sm`}>{item.icon}</div>
                                            <span className="font-bold text-gray-900 text-sm">{item.vendor}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.service}</td>
                                    <td className="px-6 py-4 text-right font-extrabold text-gray-900">₹{(item.price / 1000).toFixed(0)}k</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold
                                            ${item.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                    'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                            {item.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => toast.success(`Invoice for ${item.vendor} downloaded`)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-gray-900 text-white">
                                <td className="px-6 py-4 font-bold" colSpan={2}>Total Event Cost</td>
                                <td className="px-6 py-4 text-right font-extrabold text-lg">₹{(totalCost / 100000).toFixed(1)}L</td>
                                <td colSpan={2}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Client Quote + Profit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Client Quote */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Client Quote Breakdown</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">Vendor Costs</span>
                            <span className="font-bold text-gray-900">₹{(totalCost / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">Management Fee ({(markup * 100).toFixed(0)}%)</span>
                            <span className="font-bold text-gray-900">₹{((clientPrice - totalCost) / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-teal-50 px-4 -mx-4 rounded-xl">
                            <span className="font-bold text-teal-700">Client Total</span>
                            <span className="text-xl font-extrabold text-teal-700">₹{(clientPrice / 100000).toFixed(1)}L</span>
                        </div>
                    </div>
                </div>

                {/* Profit Estimate */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-gray-400 mb-1 uppercase tracking-wide text-xs">Net Profit Estimate</h3>
                        <p className="text-4xl font-extrabold text-white mb-4">₹{(profit / 1000).toFixed(0)}k</p>
                        <div className="mb-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Payment Collected</span>
                                <span className="font-bold text-green-400">₹{(paidAmount / 1000).toFixed(0)}k / ₹{(totalCost / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(paidAmount / totalCost * 100).toFixed(0)}%` }}></div>
                            </div>
                        </div>
                        <button onClick={() => toast.success("Downloading Financial Report PDF...")} className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" /> Download Financial Report
                        </button>
                    </div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

export default FinancialsTab;
