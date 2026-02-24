import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BsReceipt, BsPrinter, BsDownload, BsPencilSquare,
    BsPercent, BsTag, BsHash, BsPerson,
    BsEnvelope, BsPhone, BsBuilding
} from 'react-icons/bs';
import { toast } from "react-hot-toast";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const VendorEventBillTab = () => {

    const { event, services, subtotal: initialSubtotal } = useOutletContext();
    const invoiceRef = useRef(null);

    const [invoiceNo, setInvoiceNo] = useState(`${event.id}2026`);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [clientName, setClientName] = useState(event.client?.name || '');
    const [clientEmail, setClientEmail] = useState(event.client?.email || '');
    const [clientPhone, setClientPhone] = useState(
        event.client?.phone?.startsWith('+')
            ? event.client.phone
            : `+91${event.client?.phone || ''}`
    );
    const [clientCompany, setClientCompany] = useState('');
    const [discount, setDiscount] = useState(0);
    const [cgstRate, setCgstRate] = useState(9);
    const [sgstRate, setSgstRate] = useState(9);

    /* ---------- VALIDATION ---------- */
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setEmailError('Email is required');
            return false;
        } else if (!regex.test(email)) {
            setEmailError('Invalid email format');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePhone = (phone) => {
        const regex = /^\+?\d{10,14}$/;
        if (!phone.trim()) {
            setPhoneError('Phone is required');
            return false;
        } else if (!regex.test(phone.replace(/\s/g, ''))) {
            setPhoneError('Invalid phone (use +XX format)');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const validateFields = () => {
        const isEmailValid = validateEmail(clientEmail);
        const isPhoneValid = validatePhone(clientPhone);

        if (!isEmailValid || !isPhoneValid || !clientName.trim()) {
            toast.error("Please fill in valid client details before proceeding");
            return false;
        }
        return true;
    };

    /* ---------- CALCULATIONS ---------- */

    const subtotal = initialSubtotal || 0;
    const cgstAmount = (subtotal * cgstRate) / 100;
    const sgstAmount = (subtotal * sgstRate) / 100;
    const grossTotal = subtotal + cgstAmount + sgstAmount;
    const totalPayable = Math.max(0, grossTotal - discount);

    /* ---------- PDF ---------- */

    const handleDownload = async () => {
        if (!validateFields()) return;

        const element = invoiceRef.current;
        if (!element) return;

        const toastId = toast.loading("Generating premium PDF...");

        try {
            const canvas = await html2canvas(element, {
                scale: 3,
                backgroundColor: "#ffffff",
                useCORS: true,
                onclone: (_doc, clonedElement) => {
                    clonedElement.style.transform = 'none';
                    clonedElement.style.boxShadow = 'none';
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Invoice_${invoiceNo}.pdf`);
            toast.success("Invoice downloaded", { id: toastId });

        } catch (err) {
            toast.error("PDF failed. Opening print format...", { id: toastId });
            window.print();
        }
    };

    const handlePrint = () => {
        if (!validateFields()) return;
        window.print();
    };

    return (
        <div className="flex flex-col xl:flex-row items-center xl:items-start justify-center gap-12 px-6 py-12 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

            {/* PRINT CSS */}
            <style>
                {`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body * { visibility: hidden !important; }
                    html, body {
                        background-color: white !important;
                        margin: 0;
                        padding: 0;
                    }
                    .printable-content, .printable-content * { visibility: visible !important; }
                    .printable-content {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 20mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                        scale: 1 !important;
                    }
                    /* Ensure exact colors are printed */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
                `}
            </style>

            {/* ================= INVOICE ================= */}

            <div className="relative shrink-0 overflow-x-auto print:overflow-visible">
                <div
                    ref={invoiceRef}
                    id="invoice-capture"
                    className="printable-content w-[210mm] min-h-[297mm] bg-white p-[20mm] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col transition-all origin-top shrink-0"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 bg-[#0b2d49] rounded-xl flex items-center justify-center text-white shadow-lg print:shadow-none">
                                    <BsReceipt size={28} />
                                </div>
                                <h1 className="text-4xl font-black text-[#0b2d49] uppercase tracking-tight">
                                    Okkazo
                                </h1>
                            </div>

                            <h2 className="text-3xl font-black text-[#0b2d49] border-b-4 border-[#d7a444] inline-block pb-1 uppercase">
                                Invoice
                            </h2>

                            <p className="text-xs font-bold text-[#708aa0] tracking-[0.3em] mt-3 uppercase">
                                INV-{invoiceNo}
                            </p>
                        </div>

                        <div className="text-right flex flex-col items-end">
                            <p className="font-bold text-[#0b2d49] text-lg">Okkazo Events & Catering</p>
                            <p className="text-[#708aa0] font-semibold text-xs mt-2 max-w-[200px]">
                                12, Lake View Estate, Udaipur, Rajasthan, 313004
                            </p>
                            <p className="text-[#708aa0] font-semibold text-xs mt-1">
                                +91 99887 76655 | info@okkazo.in
                            </p>
                            <p className="text-[#708aa0] font-semibold text-xs mt-1">
                                GSTIN: 08GBVAT9900B1Z1
                            </p>
                        </div>
                    </div>

                    {/* Client & Event Info Row */}
                    <div className="flex justify-between border-y-2 border-slate-100 py-6 mb-10">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-[#708aa0] font-black mb-2">
                                Bill To
                            </p>
                            <h3 className="text-xl font-black text-[#0b2d49]">
                                {clientName || 'Client Name'}
                            </h3>
                            {clientCompany && (
                                <p className="text-sm font-bold text-[#0b2d49]">
                                    {clientCompany}
                                </p>
                            )}
                            <p className="text-sm text-[#708aa0] font-semibold">
                                {clientEmail || 'client@email.com'}
                            </p>
                            <p className="text-sm text-[#708aa0] font-semibold">
                                {clientPhone || '+91 90000 00000'}
                            </p>
                        </div>

                        <div className="text-right space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-[#708aa0] font-black mb-2">
                                Event Details
                            </p>
                            <p className="text-sm text-[#0b2d49] font-bold">
                                Issue Date: <span className="text-[#708aa0] ml-2">{new Date(invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </p>
                            <p className="text-sm text-[#0b2d49] font-bold">
                                Event Date: <span className="text-[#708aa0] ml-2">{event.date}</span>
                            </p>
                            <p className="text-sm text-[#0b2d49] font-bold">
                                Venue: <span className="text-[#708aa0] ml-2">{event.location}</span>
                            </p>
                            <p className="text-sm text-[#0b2d49] font-bold">
                                Guests: <span className="text-[#708aa0] ml-2">{event.pax} Pax</span>
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-[#0b2d49] text-xs font-black uppercase text-[#0b2d49] tracking-widest">
                                    <th className="py-4 text-left">Service/Description</th>
                                    <th className="py-4 text-center">Qty</th>
                                    <th className="py-4 text-right">Rate</th>
                                    <th className="py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((s, i) => (
                                    <tr key={i} className="border-b border-gray-100">
                                        <td className="py-5">
                                            <p className="font-bold text-[#0b2d49] text-sm">{s.name}</p>
                                            {s.details && (
                                                <p className="text-[11px] text-[#708aa0] font-medium mt-1 leading-snug max-w-[280px]">
                                                    {s.details}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-5 text-center font-semibold text-[#0b2d49] text-sm">{s.qty}</td>
                                        <td className="py-5 text-right font-semibold text-[#708aa0] text-sm">₹{s.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className="py-5 text-right font-black text-[#0b2d49] text-sm">
                                            ₹{(s.price * s.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-8 pt-8 flex justify-between items-end">
                        <div className="w-[200px] text-center">
                            <div className="w-full h-px bg-[#0b2d49] mb-3"></div>
                            <p className="text-[10px] font-black uppercase text-[#0b2d49] tracking-widest">Authorized Signatory</p>
                            <p className="text-[#d7a444] font-dancing italic text-2xl mt-1 -mb-1 opacity-80">Okkazo</p>
                        </div>

                        <div className="w-[320px] space-y-3">
                            <div className="flex justify-between text-sm font-semibold px-2">
                                <span className="text-[#708aa0]">Subtotal</span>
                                <span className="text-[#0b2d49]">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold px-2">
                                <span className="text-[#708aa0]">CGST ({cgstRate}%)</span>
                                <span className="text-[#0b2d49]">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold border-b border-gray-100 pb-3 px-2">
                                <span className="text-[#708aa0]">SGST ({sgstRate}%)</span>
                                <span className="text-[#0b2d49]">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between text-sm font-bold text-rose-600 px-2 italic">
                                    <span>Discount/Adjustment</span>
                                    <span>-₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center bg-[#0b2d49] text-white p-4 rounded-xl mt-4 shadow-lg print:shadow-none print:scale-100 scale-105 origin-right transition-transform">
                                <span className="font-semibold text-sm uppercase tracking-widest text-white/80">Grand Total</span>
                                <span className="text-2xl font-black">
                                    ₹{totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom disclaimer */}
                    <div className="mt-12 text-center border-t-2 border-slate-100 pt-6">
                        <p className="text-[10px] uppercase font-bold text-[#708aa0] tracking-[0.2em]">
                            Thank you for your business!
                        </p>
                    </div>
                </div>
            </div>

            {/* ================= SIDEBAR ================= */}

            <div className="w-full xl:w-[380px] shrink-0 sticky top-24 bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 flex flex-col items-stretch z-10 print:hidden relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7a444]/10 rounded-bl-full -z-10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#0b2d49]/5 rounded-tr-full -z-10 blur-xl"></div>

                <div className="flex items-center gap-4 border-b border-gray-100 pb-5 mb-6">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-[#d7a444] shadow-sm">
                        <BsPencilSquare size={22} />
                    </div>
                    <div>
                        <h3 className="font-black text-[#0b2d49] text-xl tracking-tight">
                            Invoice Editor
                        </h3>
                        <p className="text-[11px] font-bold text-[#708aa0] uppercase tracking-widest mt-1">
                            Customize & Export
                        </p>
                    </div>
                </div>

                <div className="space-y-6 text-sm flex-1 overflow-y-auto pb-4 pr-1 styling-scrollbar">

                    {/* Invoice Meta */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-[#708aa0] font-bold pl-1">Inv Number</label>
                            <div className="relative">
                                <BsHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    value={invoiceNo}
                                    onChange={(e) => setInvoiceNo(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0b2d49]/30 rounded-xl font-bold text-[#0b2d49] transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-[#708aa0] font-bold pl-1">Issue Date</label>
                            <input
                                type="date"
                                value={invoiceDate}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0b2d49]/30 rounded-xl font-bold text-[#0b2d49] transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    {/* Client Information */}
                    <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-widest text-[#0b2d49] font-black border-l-2 border-[#d7a444] pl-2">Client Details</p>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-[#708aa0] font-bold pl-1">Full Name</label>
                            <div className="relative">
                                <BsPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="e.g. Rahul Sharma"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0b2d49]/30 rounded-xl font-bold text-[#0b2d49] transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-[#708aa0] font-bold pl-1">Email Address</label>
                            <div className="relative">
                                <BsEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="email"
                                    placeholder="client@email.com"
                                    value={clientEmail}
                                    onChange={(e) => {
                                        setClientEmail(e.target.value);
                                        validateEmail(e.target.value);
                                    }}
                                    className={`w-full pl-9 pr-4 py-3 bg-slate-50 border-none ring-1 ${emailError ? 'ring-rose-400 focus:ring-rose-500' : 'ring-slate-200 focus:ring-[#0b2d49]/30'} rounded-xl font-bold text-[#0b2d49] transition-all outline-none`}
                                />
                            </div>
                            {emailError && <p className="text-[10px] font-bold text-rose-500 pl-2">{emailError}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-[#708aa0] font-bold pl-1">Phone Number</label>
                            <div className="relative">
                                <BsPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="tel"
                                    placeholder="+91 90000 00000"
                                    value={clientPhone}
                                    onChange={(e) => {
                                        setClientPhone(e.target.value);
                                        validatePhone(e.target.value);
                                    }}
                                    className={`w-full pl-9 pr-4 py-3 bg-slate-50 border-none ring-1 ${phoneError ? 'ring-rose-400 focus:ring-rose-500' : 'ring-slate-200 focus:ring-[#0b2d49]/30'} rounded-xl font-bold text-[#0b2d49] transition-all outline-none tracking-wide`}
                                />
                            </div>
                            {phoneError ? (
                                <p className="text-[10px] font-bold text-rose-500 pl-2">{phoneError}</p>
                            ) : (
                                <p className="text-[9px] font-bold text-slate-400 pl-2 italic">Format: +91...</p>
                            )}
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    {/* Finance Settings */}
                    <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-widest text-[#0b2d49] font-black border-l-2 border-[#d7a444] pl-2">Taxes & Discount</p>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-[#708aa0] font-bold pl-1">Discount Amount (₹)</label>
                            <div className="relative">
                                <BsTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" size={14} />
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={discount || ''}
                                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                    placeholder="0"
                                    className="w-full pl-9 pr-4 py-3 bg-rose-50/30 border-none ring-1 ring-rose-200 focus:ring-2 focus:ring-rose-400/40 rounded-xl font-black text-rose-600 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-[#708aa0] font-bold pl-1">CGST (%)</label>
                                <div className="relative">
                                    <BsPercent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={cgstRate}
                                        onChange={(e) => setCgstRate(Math.max(0, parseFloat(e.target.value) || 0))}
                                        className="w-full pl-8 pr-3 py-3 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0b2d49]/30 rounded-xl font-bold text-[#0b2d49] transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-[#708aa0] font-bold pl-1">SGST (%)</label>
                                <div className="relative">
                                    <BsPercent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={sgstRate}
                                        onChange={(e) => setSgstRate(Math.max(0, parseFloat(e.target.value) || 0))}
                                        className="w-full pl-8 pr-3 py-3 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0b2d49]/30 rounded-xl font-bold text-[#0b2d49] transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-6 mt-2 space-y-3 shrink-0">
                    <button
                        onClick={handlePrint}
                        className="w-full bg-[#0b2d49] text-white py-4 rounded-2xl font-black tracking-[0.2em] uppercase text-[10px] hover:bg-[#d7a444] hover:shadow-lg hover:shadow-[#d7a444]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <BsPrinter size={16} />
                        Print Document
                    </button>

                    <button
                        onClick={handleDownload}
                        className="w-full bg-white border-2 border-[#0b2d49] text-[#0b2d49] py-3.5 rounded-2xl font-black tracking-[0.2em] uppercase text-[10px] hover:bg-[#0b2d49] hover:text-white transition-all hover:shadow-lg hover:shadow-[#0b2d49]/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <BsDownload size={16} />
                        Save as PDF
                    </button>

                </div>
            </div>
        </div>
    );
};

export default VendorEventBillTab;