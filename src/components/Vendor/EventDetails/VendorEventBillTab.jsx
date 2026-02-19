import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BsReceipt, BsPrinter, BsDownload, BsCheckCircle, BsPencilSquare, BsPercent, BsTag, BsHash, BsPerson, BsBuilding, BsEnvelope, BsPhone } from 'react-icons/bs';
import { toast } from "react-hot-toast";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const VendorEventBillTab = () => {
    const { event, services, subtotal: initialSubtotal, handlePrint: contextHandlePrint } = useOutletContext();
    const [isHovered, setIsHovered] = useState(false);
    const invoiceRef = useRef(null);

    // Editable Invoice State
    const [invoiceNo, setInvoiceNo] = useState(`${event.id}2026`);
    const [invoiceDate, setInvoiceDate] = useState('2026-02-19');
    const [clientGST, setClientGST] = useState('');
    const [clientName, setClientName] = useState(event.client?.name || '');
    const [clientOrg, setClientOrg] = useState(event.client?.org || '');
    const [clientEmail, setClientEmail] = useState(event.client?.email || '');
    const [clientPhone, setClientPhone] = useState(event.client?.phone?.startsWith('+') ? event.client.phone : `+91${event.client?.phone || ''}`);
    const [discount, setDiscount] = useState(0);
    const [cgstRate, setCgstRate] = useState(9);
    const [sgstRate, setSgstRate] = useState(9);

    // Validation States
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
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
        // Regex for optional +, then 10-13 digits (accommodates various country codes)
        const regex = /^\+?\d{10,13}$/;
        if (!phone) {
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

        if (!isEmailValid || !isPhoneValid) {
            toast.error("Please fix validation errors");
            return false;
        }
        return true;
    };

    const onPrint = () => { if (validateFields()) window.print(); };
    const onDownload = () => { if (validateFields()) handleDownload(); };

    const handleDownload = async () => {
        const element = invoiceRef.current;
        if (!element) return;

        const toastId = toast.loading("Generating PDF...");
        try {
            // Clone the element to strip problematic styles before capture
            const canvas = await html2canvas(element, {
                scale: 2, // slightly lower scale for stability if needed, or 3
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('invoice-capture');
                    if (clonedElement) {
                        try {
                            // 1. Force container styles
                            clonedElement.style.background = '#ffffff';
                            clonedElement.style.boxShadow = 'none';
                            clonedElement.style.textShadow = 'none';
                            clonedElement.style.animation = 'none';
                            clonedElement.style.transition = 'none';
                            clonedElement.style.transform = 'none';

                            // 2. Intercept getComputedStyle - Critical Fix for oklab
                            const defaultView = clonedDoc.defaultView;
                            const originalGetComputedStyle = defaultView.getComputedStyle;

                            defaultView.getComputedStyle = function (el) {
                                const styles = originalGetComputedStyle.call(this, el);
                                return new Proxy(styles, {
                                    get: function (target, prop) {
                                        const value = target[prop];
                                        if (typeof value === 'string' && (value.includes('oklab') || value.includes('oklch') || value.includes('display-p3'))) {
                                            // Safe fallbacks
                                            if (prop === 'backgroundColor' || prop === 'background') return '#ffffff';
                                            if (prop === 'color') return '#000000';
                                            if (prop.toString().toLowerCase().includes('border')) return '#e5e7eb';
                                            return 'transparent';
                                        }
                                        return value;
                                    }
                                });
                            };

                            // 3. Manual Strip of Shadows/Filters
                            const allElements = clonedElement.querySelectorAll('*');
                            allElements.forEach(el => {
                                el.style.boxShadow = 'none';
                                el.style.textShadow = 'none';
                                el.style.filter = 'none';
                                el.style.backdropFilter = 'none';
                                el.style.animation = 'none';
                                el.style.transition = 'none';

                                // Explicitly clear known problematic text colors if possible
                                if (el.style.color && el.style.color.includes('oklab')) el.style.color = '#000000';
                            });
                        } catch (err) {
                            console.warn("Clone processing warning:", err);
                        }
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${invoiceNo}.pdf`);

            toast.success("Invoice downloaded successfully!", { id: toastId });
        } catch (error) {
            console.error("PDF generation failed:", error);
            // Fallback to print which works perfectly now
            toast.error("Format error detected. Opening Print Dialog instead...", { id: toastId });
            setTimeout(() => window.print(), 500);
        }
    };

    // Calculations
    const subtotal = initialSubtotal;
    const cgstAmount = (subtotal * cgstRate) / 100;
    const sgstAmount = (subtotal * sgstRate) / 100;
    const grossTotal = subtotal + cgstAmount + sgstAmount;
    const totalPayable = grossTotal - discount;



    return (
        <div className="flex flex-row items-start justify-start gap-10 py-10 px-10 animate-in zoom-in-95 duration-700 min-h-screen bg-slate-50">
            {/* Print Specific Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    /* Base reset */
                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        overflow: hidden !important;
                    }
                    /* Hide EVERYTHING by visibility */
                    body * {
                        visibility: hidden;
                    }
                    /* Show ONLY the invoice and its children */
                    .printable-content, 
                    .printable-content * {
                        visibility: visible !important;
                    }
                    /* Position the invoice at the very top-left */
                    .printable-content {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        z-index: 9999 !important;
                        display: block !important; /* Ensure it's not hidden by display:none parents if any */
                    }
                    /* Ensure parents are visible enough to render children */
                    /* But wait, if parent is display:none, child won't render. */
                    /* So we must NOT set main containers to display:none */
                    
                    /* Print specific adjustments */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                    }
                    /* Hide specific elements completely */
                    .no-print {
                        display: none !important;
                    }
                }
            `}} />

            {/* Left Column: A4 Invoice */}
            <div
                className="relative shrink-0"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Floating Hover Actions */}
                <div className="absolute right-10 top-10 flex flex-col gap-3 no-print z-50">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrint(); }}
                        title="Print Invoice"
                        className={`p-3.5 bg-white shadow-2xl rounded-2xl text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all transform hover:scale-110 border border-gray-100 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} duration-300`}
                    >
                        <BsPrinter size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownload(); }}
                        title="Download PDF"
                        className={`p-3.5 bg-white shadow-2xl rounded-2xl text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all transform hover:scale-110 border border-gray-100 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} duration-300`}
                    >
                        <BsDownload size={20} />
                    </button>
                </div>

                {/* A4 Format Content */}
                <div ref={invoiceRef} id="invoice-capture" className="w-[210mm] min-h-[297mm] bg-white p-[20mm] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-gray-200/50 relative overflow-hidden printable-content flex flex-col">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-[#0b2d49] rounded-xl flex items-center justify-center text-white shadow-lg print:shadow-none">
                                    <BsReceipt size={24} />
                                </div>
                                <h1 className="text-3xl font-black text-[#0b2d49] tracking-tighter uppercase">Gourmet Bites</h1>
                            </div>
                            <h2 className="text-4xl font-black text-[#0b2d49] tracking-tighter uppercase border-b-4 border-[#d7a444] inline-block pb-1">Invoice</h2>
                            <p className="text-sm font-black text-[#708aa0] uppercase tracking-[0.4em] mt-3">Finalized • INV-{invoiceNo}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-[#0b2d49]">Gourmet Bites Catering</p>
                            <p className="text-xs font-bold text-[#708aa0]">Premium Food & Event Services</p>
                            <div className="mt-4 space-y-1 text-xs">
                                <p className="font-bold text-[#708aa0]">GSTIN: 08GBVAT9900B1Z1</p>
                                <p className="font-bold text-[#708aa0]">FSSAI License: 13322000000456</p>
                                <p className="font-bold text-[#708aa0]">12, Lake View Industrial Estate</p>
                                <p className="font-bold text-[#708aa0]">Udaipur, Rajasthan, 313004</p>
                                <p className="font-bold text-[#708aa0]">+91 99887 76655 | info@gourmetbites.in</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 py-6 border-y border-gray-100 mt-8 mb-8">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase text-[#708aa0] tracking-widest">Bill To:</p>
                            <div>
                                <h3 className="text-2xl font-black text-[#0b2d49] leading-tight">{clientName}</h3>
                                <p className="text-sm font-bold text-[#708aa0] mt-1">{clientOrg}</p>
                                {clientGST && (
                                    <p className="text-sm font-black text-[#0b2d49] mt-1 flex items-center gap-1 uppercase tracking-tight">
                                        GSTIN: <span className="text-teal-600">{clientGST}</span>
                                    </p>
                                )}
                                <p className="text-sm font-bold text-[#708aa0] mt-1">{clientEmail}</p>
                                <p className="text-sm font-bold text-[#708aa0]">{clientPhone}</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <p className="text-[10px] font-black uppercase text-[#708aa0] tracking-widest">Invoice Details:</p>
                            <div>
                                <p className="text-sm font-bold text-[#0b2d49]">Date: <span className="text-[#708aa0]">{new Date(invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                                <p className="text-sm font-bold text-[#0b2d49]">Event Date: <span className="text-[#708aa0]">{event.date}</span></p>
                                <p className="text-sm font-bold text-[#0b2d49]">Event Venue: <span className="text-[#708aa0]">{event.location}</span></p>
                                <p className="text-sm font-bold text-[#0b2d49]">Pax: <span className="text-[#708aa0]">{event.pax}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b-2 border-[#0b2d49]">
                                    <th className="py-4 text-[11px] font-black uppercase text-[#0b2d49]">Service / Description</th>
                                    <th className="py-4 text-center text-[11px] font-black uppercase text-[#0b2d49]">Qty</th>
                                    <th className="py-4 text-center text-[11px] font-black uppercase text-[#0b2d49]">Rate</th>
                                    <th className="py-4 text-right text-[11px] font-black uppercase text-[#0b2d49]">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 border-b border-gray-100">
                                {services.map((s, i) => (
                                    <tr key={i}>
                                        <td className="py-5 pr-6">
                                            <p className="font-black text-[#0b2d49] text-base">{s.name}</p>
                                            <p className="text-[10px] text-[#708aa0] font-bold mt-1 line-clamp-2">{s.details}</p>
                                        </td>
                                        <td className="py-5 text-center text-[#0b2d49] font-black text-sm">{s.qty}</td>
                                        <td className="py-5 text-center text-[#708aa0] font-black text-sm">₹{s.price.toLocaleString()}</td>
                                        <td className="py-5 text-right font-black text-[#0b2d49] text-sm">₹{(s.price * s.qty).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 pt-6">
                        <div className="flex justify-between items-start">
                            <div className="max-w-[400px]">
                                <div className="mt-12 pt-4 flex justify-start">
                                    <div className="text-center">
                                        <div className="w-48 h-1 px-4 border-b-2 border-[#0b2d49] mb-2 font-dancing italic text-base text-[#0b2d49] flex items-end justify-center leading-none">Gourmet Bites</div>
                                        <p className="text-[10px] font-black uppercase text-[#0b2d49] tracking-widest">Authorized Signatory</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-[300px] space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold px-2">
                                    <span className="text-[#708aa0]">Subtotal</span>
                                    <span className="text-[#0b2d49]">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs px-2">
                                    <span className="text-[#708aa0] font-bold uppercase tracking-tighter">CGST ({cgstRate}%)</span>
                                    <span className="text-[#0b2d49] font-black">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs px-2 border-b border-gray-100 pb-2">
                                    <span className="text-[#708aa0] font-bold uppercase tracking-tighter">SGST ({sgstRate}%)</span>
                                    <span className="text-[#0b2d49] font-black">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold bg-gray-50 p-2 rounded-lg">
                                    <span className="text-[#708aa0]">Gross Total</span>
                                    <span className="text-[#0b2d49]">₹{grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-xs px-2 text-rose-600 font-bold italic">
                                        <span>Discount Deduction</span>
                                        <span>- ₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center p-3 mt-4 bg-[#0b2d49] rounded-xl shadow-lg print:shadow-none print:scale-100 transform scale-105 origin-right">
                                    <span className="text-xl font-black text-white/70">Grand Total</span>
                                    <span className="text-3xl font-black text-white tracking-tighter">₹{totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-gray-100 text-center text-[10px] font-black text-[#708aa0] uppercase tracking-widest">
                            Thank you for your business!
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Invoice Editor */}
            <div className="flex-1 max-w-sm sticky top-28 no-print animate-in slide-in-from-right-10 duration-500">
                <div className="bg-white rounded-[2.5rem] border border-gray-200/50 shadow-2xl p-8 space-y-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                            <BsPencilSquare size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[#0b2d49]">Invoice Editor</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customize your bill</p>
                        </div>
                    </div>

                    {/* Editor Form */}
                    <div className="space-y-6">
                        {/* Invoice Header Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Invoice No</label>
                                <div className="relative">
                                    <BsHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        value={invoiceNo}
                                        onChange={(e) => setInvoiceNo(e.target.value)}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#0b2d49] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Invoice Date</label>
                                <input
                                    type="date"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#0b2d49] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Client Details */}
                        <div className="space-y-4 border-b border-gray-100 pb-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Client Information</p>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Client Name</label>
                                <div className="relative">
                                    <BsPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#0b2d49] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all font-sans"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Organization</label>
                                <div className="relative">
                                    <BsBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        value={clientOrg}
                                        onChange={(e) => setClientOrg(e.target.value)}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#0b2d49] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Client GSTIN</label>
                                <input
                                    type="text"
                                    placeholder="Enter Client's GSTIN"
                                    value={clientGST}
                                    onChange={(e) => setClientGST(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all placeholder:text-gray-300 uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative">
                                        <BsEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                        <input
                                            type="email"
                                            value={clientEmail}
                                            onChange={(e) => {
                                                setClientEmail(e.target.value);
                                                validateEmail(e.target.value);
                                            }}
                                            className={`w-full pl-8 pr-3 py-3 bg-gray-50 border ${emailError ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-gray-100'} rounded-xl text-[10px] font-bold text-[#0b2d49] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all`}
                                        />
                                    </div>
                                    {emailError && <p className="text-[8px] font-black text-rose-500 ml-1 mt-1 uppercase tracking-tighter">{emailError}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                    <div className="relative">
                                        <BsPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                        <input
                                            type="tel"
                                            value={clientPhone}
                                            placeholder="+91 9876543210"
                                            onChange={(e) => {
                                                setClientPhone(e.target.value);
                                                validatePhone(e.target.value);
                                            }}
                                            className={`w-full pl-8 pr-3 py-3 bg-gray-50 border ${phoneError ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-gray-100'} rounded-xl text-[10px] font-bold text-[#0b2d49] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all font-sans`}
                                        />
                                    </div>
                                    {phoneError ? (
                                        <p className="text-[8px] font-black text-rose-500 ml-1 mt-1 uppercase tracking-tighter">{phoneError}</p>
                                    ) : (
                                        <p className="text-[7px] font-bold text-gray-400 ml-1 mt-1 uppercase tracking-widest italic tracking-tight">Include country code (e.g. +91)</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Discount */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Amount (₹)</label>
                            <div className="relative">
                                <BsTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={discount}
                                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Tax Rates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CGST (%)</label>
                                <div className="relative">
                                    <BsPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={cgstRate}
                                        onChange={(e) => setCgstRate(Math.max(0, parseFloat(e.target.value) || 0))}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#0b2d49] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SGST (%)</label>
                                <div className="relative">
                                    <BsPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={sgstRate}
                                        onChange={(e) => setSgstRate(Math.max(0, parseFloat(e.target.value) || 0))}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#0b2d49] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100/50">
                                <BsCheckCircle className="text-teal-600 shrink-0" size={18} />
                                <p className="text-[10px] font-bold text-teal-800 leading-normal">
                                    Changes are applied in real-time. Review the invoice on the left before printing.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 space-y-3">
                            <button
                                onClick={onPrint}
                                className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <BsPrinter size={14} />
                                Print Invoice
                            </button>
                            <button
                                onClick={onDownload}
                                className="w-full py-4 bg-white border-2 border-[#0b2d49] text-[#0b2d49] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0b2d49] hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <BsDownload size={14} />
                                Download as PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorEventBillTab;
