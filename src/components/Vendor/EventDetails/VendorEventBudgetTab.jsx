import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BsCheckCircleFill, BsWallet2, BsReceipt } from 'react-icons/bs';

const VendorEventBudgetTab = () => {
    const {
        event,
        tempServices,
        handleTempServiceChange,
        subtotal
    } = useOutletContext();

    const normalizedStatus = String(event?.status || '').toUpperCase();
    const isReadOnly = normalizedStatus !== 'PENDING';
    const isConfirmed = normalizedStatus === 'CONFIRMED';
    const receivedAmount = Math.max(0, Number(event?.amountReceived || 0) || 0);
    const remainingAmount = Math.max(0, (Number(subtotal) || 0) - receivedAmount);

    const eventLedger = Array.isArray(event?.ledger) ? event.ledger : [];
    const ledgerRows = React.useMemo(() => {
        let balance = 0;
        return eventLedger.map((row) => {
            const signed = Number(row?.signedAmount || 0) || 0;
            balance += signed;
            return {
                id: String(row?.id || ''),
                dateLabel: row?.dateLabel || '—',
                description: row?.description || 'Transaction',
                status: row?.status || '—',
                type: row?.type || (signed < 0 ? 'Debit' : 'Credit'),
                signedAmount: signed,
                balance,
            };
        });
    }, [eventLedger]);

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-linear-to-r from-[#0b2d49] to-[#12426e] p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md mb-4">
                        <BsWallet2 size={12} className="text-[#d7a444]" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-white/90">Financial Dashboard</span>
                    </div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-gray-300">
                        Service Budget
                    </h2>
                    <p className="text-sm text-white/70 mt-2 max-w-md leading-relaxed">
                        Manage and allocate your structured costs per service to ensure accurate quoting and premium event delivery.
                    </p>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT — Services List + Ledger */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="flex items-center justify-between px-2 mb-2 text-xs font-black uppercase tracking-widest text-[#708aa0]">
                        <span className="flex-1">Service Details</span>
                        <div className="hidden sm:grid grid-cols-2 gap-4 w-70">
                            <span className="text-center">Unit Price</span>
                            <span className="text-right">Total</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {tempServices.map((service, idx) => (
                            <div
                                key={service.id}
                                className="group relative bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(11,45,73,0.08)] hover:border-[#0b2d49]/10 transition-all duration-300"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-[#d7a444] to-[#0b2d49] rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    {/* Service Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#f8fafb] flex items-center justify-center text-[#d7a444] border border-gray-100 group-hover:bg-[#d7a444]/10 group-hover:border-[#d7a444]/20 transition-colors">
                                                <BsCheckCircleFill size={14} className="opacity-50 group-hover:opacity-100 scale-90 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#0b2d49] text-base group-hover:text-[#d7a444] transition-colors">{service.name}</h3>
                                                <p className="text-xs text-[#708aa0] mt-1 line-clamp-1">{service.details}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inputs Section */}
                                    <div className="flex flex-row items-center gap-4 w-full sm:w-70 shrink-0">
                                        {/* Price & Qty Stack */}
                                        <div className="flex flex-col gap-2 w-1/2">
                                            <div className="relative group/input">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708aa0] font-bold text-sm group-focus-within/input:text-[#d7a444] transition-colors">
                                                    ₹
                                                </span>
                                                <input
                                                    type="number"
                                                    value={service.price}
                                                    onChange={(e) =>
                                                        !isReadOnly && handleTempServiceChange(service.id, 'price', e.target.value)
                                                    }
                                                    disabled={isReadOnly}
                                                    className={`w-full pl-8 pr-3 py-2.5 bg-[#f8fafb] rounded-xl border border-transparent text-sm font-bold text-[#0b2d49] outline-none transition-all placeholder:text-gray-300 ${
                                                        isReadOnly
                                                            ? 'opacity-60 cursor-not-allowed'
                                                            : 'hover:border-gray-200 focus:bg-white focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/10'
                                                    }`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="inline-flex items-center justify-start gap-2">
                                                <span className="px-3 py-2 bg-[#f8fafb] rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-[#708aa0]">
                                                    Qty 1
                                                </span>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="w-1/2 flex items-center justify-end">
                                            <div className="text-right">
                                                <p className="text-[10px] text-[#708aa0] font-bold uppercase tracking-wider mb-1 sm:hidden">Total</p>
                                                <span className="text-lg font-black text-[#0b2d49]">
                                                    ₹{(service.price * service.qty).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Ledger (placed under services to avoid large empty gap) */}
                    <div className="bg-white rounded-4xl shadow-sm border border-[#708aa0]/5 overflow-hidden">
                        <div className="p-8 border-b border-[#708aa0]/5 flex items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-black text-[#0b2d49]">Ledger</h3>
                                <p className="text-xs font-bold text-[#708aa0] mt-1">
                                    Transactions for this event.
                                </p>
                            </div>
                            {isConfirmed && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600">
                                    Confirmed
                                </span>
                            )}
                        </div>

                        {ledgerRows.length === 0 ? (
                            <div className="p-8 text-sm font-bold text-[#708aa0]">
                                No ledger entries for this event yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[10px] font-black text-[#708aa0] uppercase tracking-[0.2em] border-b border-[#708aa0]/5">
                                            <th className="px-8 py-6">Date</th>
                                            <th className="px-8 py-6">Description</th>
                                            <th className="px-8 py-6">Status</th>
                                            <th className="px-8 py-6">Type</th>
                                            <th className="px-8 py-6 text-right">Amount</th>
                                            <th className="px-8 py-6 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#708aa0]/5">
                                        {ledgerRows.map((row) => {
                                            const isDebit = String(row.type).toLowerCase() === 'debit' || row.signedAmount < 0;
                                            const amountAbs = Math.abs(Number(row.signedAmount || 0));
                                            return (
                                                <tr key={row.id} className="hover:bg-[#e9eff1]/30 transition-all">
                                                    <td className="px-8 py-6">
                                                        <span className="text-sm font-bold text-[#5a5b44]">{row.dateLabel}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="font-black text-sm text-[#0b2d49]">{row.description}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#f8fafb] text-[#708aa0]">
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                            isDebit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                                        }`}>
                                                            {isDebit ? 'Debit' : 'Credit'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className={`font-black text-sm ${isDebit ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                            {isDebit ? '-' : ''}₹{amountAbs.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className="font-black text-sm text-[#0b2d49]">₹{Number(row.balance || 0).toLocaleString()}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT — Sticky Summary Widget */}
                <div className="lg:col-span-4">
                    <div className="sticky top-8 bg-white p-8 rounded-4xl border border-[#708aa0]/10 shadow-[0_20px_40px_rgba(11,45,73,0.06)] overflow-hidden group">

                        {/* Summary background texture */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#f8fafb] to-transparent rounded-bl-[100px] pointer-events-none"></div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-3 bg-linear-to-br from-[#0b2d49] to-[#1a4b77] rounded-xl shadow-lg relative overflow-hidden">
                                <BsReceipt className="text-[#d7a444] relative z-10" size={20} />
                            </div>
                            <h3 className="text-xl font-black text-[#0b2d49]">Budget Summary</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-sm font-semibold text-[#708aa0] py-4 border-b border-gray-100">
                                <span>{isConfirmed ? 'Confirmed Subtotal' : 'Operational Subtotal'}</span>
                                <span className="text-[#0b2d49] font-bold">₹{subtotal.toLocaleString()}</span>
                            </div>

                            {isConfirmed && (
                                <>
                                    <div className="flex justify-between items-center text-sm font-semibold text-[#708aa0] py-4 border-b border-gray-100">
                                        <span>Amount Received</span>
                                        <span className="text-[#0b2d49] font-bold">₹{receivedAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-semibold text-[#708aa0] py-4 border-b border-gray-100">
                                        <span>Remaining Amount</span>
                                        <span className="text-[#0b2d49] font-bold">₹{remainingAmount.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-8 pt-6 relative z-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#708aa0] mb-2">{isConfirmed ? 'Total Confirmed Amount' : 'Total Project Estimate'}</p>
                            <div className="mt-1">
                                <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#0b2d49] to-[#1a4b77] tracking-tight">
                                    ₹{subtotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
};

export default VendorEventBudgetTab;