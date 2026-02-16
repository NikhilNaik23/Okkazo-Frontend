import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCheck, BsCreditCard, BsLock, BsShieldCheck, BsArrowLeft, BsArrowRight, BsQrCodeScan } from 'react-icons/bs';

const StepPayment = ({ onNext, onBack, formData, handleChange }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
    const [countdown, setCountdown] = useState(3);

    // Stable ID for this component instance in case it wasn't saved to formData yet
    const tempTransactionId = useMemo(() => Math.floor(Math.random() * 1000000), []);
    const displayTransactionId = formData.transactionId || tempTransactionId;

    const [paymentData, setPaymentData] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        const { cardName, cardNumber, expiry, cvv } = paymentData;

        // Card Name
        if (!cardName.trim()) {
            newErrors.cardName = 'Cardholder name is required';
        }

        // Card Number (Simple length check + Luhn algorithm ideally, but length is fine for now)
        const cleanCardNum = cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cleanCardNum)) {
            newErrors.cardNumber = 'Card number must be 16 digits';
        }

        // Expiry Date (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            newErrors.expiry = 'Invalid format (MM/YY)';
        } else {
            const [month, year] = expiry.split('/').map(Number);
            const now = new Date();
            const currentYear = now.getFullYear() % 100;
            const currentMonth = now.getMonth() + 1;

            if (month < 1 || month > 12) {
                newErrors.expiry = 'Invalid month';
            } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                newErrors.expiry = 'Card has expired';
            }
        }

        // CVV
        if (!/^\d{3}$/.test(cvv)) {
            newErrors.cvv = 'CVV must be 3 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (formData.isPaid) {
            setIsSuccess(true);
        }
    }, [formData.isPaid]);

    // Countdown logic for auto-redirect
    useEffect(() => {
        let timer;
        if (isSuccess && countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (isSuccess && countdown === 0) {
            onNext();
        }
        return () => clearTimeout(timer);
    }, [isSuccess, countdown, onNext]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = value.replace(/\D/g, '').substring(0, 16);
            formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
        } else if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4);
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
            }
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').substring(0, 3);
        }

        setPaymentData({ ...paymentData, [name]: formattedValue });
    };

    const handlePayment = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // Shake animation or focus first error could go here
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            handleChange('isPaid', true);
            handleChange('transactionId', tempTransactionId); // Persist the ID

            // Save Event to LocalStorage for "My Events" Dashboard
            try {
                const existingEvents = JSON.parse(localStorage.getItem('my_organized_events') || '[]');

                // Check if this specific event (by temporary ID or title/date combo) already exists to avoid dupes on re-renders
                // Since this is a simple flow, we'll just append. refactor for robust ID check if needed.
                const newEvent = {
                    id: `evt-${Date.now()}`,
                    title: formData.title || `${formData.type} Planning`,
                    date: formData.date || "Date Pending",
                    location: formData.location || "Location TBD",
                    status: "Immediate Action",
                    formData: { ...formData, isPaid: true, transactionId: tempTransactionId }, // Save full state
                    image: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=2574&auto=format&fit=crop", // Default event image
                    sold: "0"
                };

                const updatedEvents = [newEvent, ...existingEvents];
                localStorage.setItem('my_organized_events', JSON.stringify(updatedEvents));

                // Dispatch event so other tabs/windows can update if needed (MyEvents listens to 'storage' and 'savedUpdated')
                window.dispatchEvent(new Event('savedUpdated'));

            } catch (err) {
                console.error("Failed to save event to local storage", err);
            }

            // Auto redirect handled by useEffect
        }, 2000);
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center animate-fade-in font-sans pt-32 pb-12 px-4 box-border relative z-10">
            <div className="w-full max-w-6xl min-h-[600px] flex flex-col md:flex-row bg-white rounded-[3rem] shadow-2xl overflow-hidden relative">

                {/* --- Left Panel: Experience & Summary --- */}
                <div className="w-full md:w-5/12 bg-[#09637E] relative p-12 text-white flex flex-col justify-between overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <motion.button
                            onClick={onBack}
                            whileHover={{ x: -4 }}
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors uppercase text-[10px] font-black tracking-[0.2em] mb-12"
                        >
                            <BsArrowLeft size={14} /> Back
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest mb-6">
                                Secure Transaction
                            </span>
                            <h1 className="text-5xl font-serif-premium italic leading-tight mb-4">
                                Confirm Your <br /> Reservation
                            </h1>
                            <p className="text-white/60 text-sm leading-relaxed max-w-sm font-medium">
                                This payment serves as a service confirmation to secure your dates. The amount will be adjusted against your overall event cost after vendor selection.
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Rescheduling Flexibility</p>
                                <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                                    You may update your event date after booking. Moving to an earlier, non-peak date is complimentary. Rescheduling to a high-demand date will incur an adjustment fee.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="relative z-10 space-y-6 mt-12 md:mt-0">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Service Type</p>
                                    <p className="text-lg font-serif-premium truncate max-w-[150px]">{formData.title || formData.type} Planning</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Date</p>
                                    <p className="text-sm font-bold">{formData.date || "TBD"}</p>
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Due</span>
                                <span className="text-3xl font-serif-premium font-bold italic">₹15,000</span>
                            </div>
                            <p className="text-[10px] text-white/50 mt-3 font-medium leading-relaxed">
                                *Adjustable against final bill
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                            <BsShieldCheck size={14} className="text-teal-300" />
                            <span>256-Bit SSL Encrypted Payment</span>
                        </div>
                    </div>
                </div>

                {/* --- Right Panel: Payment Form --- */}
                <div className="w-full md:w-7/12 bg-white relative p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    {!isSuccess ? (
                        <div className="max-w-md mx-auto w-full">

                            {/* Payment Method Selector */}
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

                            <AnimatePresence mode='wait'>
                                {paymentMethod === 'card' ? (
                                    <motion.div
                                        key="card"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Visual Card */}
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
                                                        {paymentData.cardNumber || '•••• •••• •••• ••••'}
                                                    </div>
                                                    <div className="flex justify-between items-end uppercase text-[9px] tracking-[0.2em] opacity-60 font-medium">
                                                        <div>
                                                            <span className="block text-[7px] mb-1">Card Holder</span>
                                                            {paymentData.cardName || 'YOUR NAME'}
                                                        </div>
                                                        <div>
                                                            <span className="block text-[7px] mb-1">Expires</span>
                                                            {paymentData.expiry || 'MM/YY'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePayment} className="space-y-6">
                                            <div className="space-y-5">
                                                <div className="relative group">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-focus-within:text-[#09637E] transition-colors flex justify-between">
                                                        Name on Card
                                                        {errors.cardName && <span className="text-red-500 font-bold">{errors.cardName}</span>}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="cardName"
                                                        value={paymentData.cardName}
                                                        onChange={(e) => {
                                                            handleInputChange(e);
                                                            if (errors.cardName) setErrors({ ...errors, cardName: null });
                                                        }}
                                                        onFocus={() => setFocusedField('cardName')}
                                                        onBlur={() => setFocusedField(null)}
                                                        placeholder="JANE DOE"
                                                        className={`w-full bg-transparent border-b py-3 text-sm font-bold text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 tracking-wider ${errors.cardName ? 'border-red-300 text-red-900' : 'border-gray-200 focus:border-[#09637E]'}`}
                                                        required
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-focus-within:text-[#09637E] transition-colors flex justify-between">
                                                        Card Number
                                                        {errors.cardNumber && <span className="text-red-500 font-bold">{errors.cardNumber}</span>}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            name="cardNumber"
                                                            value={paymentData.cardNumber}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.cardNumber) setErrors({ ...errors, cardNumber: null });
                                                            }}
                                                            onFocus={() => setFocusedField('cardNumber')}
                                                            onBlur={() => setFocusedField(null)}
                                                            placeholder="0000 0000 0000 0000"
                                                            maxLength="19"
                                                            className={`w-full bg-transparent border-b py-3 text-sm font-bold text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 font-mono tracking-wider ${errors.cardNumber ? 'border-red-300 text-red-900' : 'border-gray-200 focus:border-[#09637E]'}`}
                                                            required
                                                        />
                                                        <BsCreditCard className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="flex-1 relative group">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-focus-within:text-[#09637E] transition-colors flex justify-between">
                                                            Expiry
                                                            {errors.expiry && <span className="text-red-500 font-bold">{errors.expiry}</span>}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="expiry"
                                                            value={paymentData.expiry}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                if (errors.expiry) setErrors({ ...errors, expiry: null });
                                                            }}
                                                            onFocus={() => setFocusedField('expiry')}
                                                            onBlur={() => setFocusedField(null)}
                                                            placeholder="MM/YY"
                                                            maxLength="5"
                                                            className={`w-full bg-transparent border-b py-3 text-sm font-bold text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 font-mono tracking-wider ${errors.expiry ? 'border-red-300 text-red-900' : 'border-gray-200 focus:border-[#09637E]'}`}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex-1 relative group">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-focus-within:text-[#09637E] transition-colors flex justify-between">
                                                            CVV
                                                            {errors.cvv && <span className="text-red-500 font-bold">{errors.cvv}</span>}
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                name="cvv"
                                                                value={paymentData.cvv}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.cvv) setErrors({ ...errors, cvv: null });
                                                                }}
                                                                onFocus={() => setFocusedField('cvv')}
                                                                onBlur={() => setFocusedField(null)}
                                                                placeholder="123"
                                                                maxLength="3"
                                                                className={`w-full bg-transparent border-b py-3 text-sm font-bold text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 font-mono tracking-wider ${errors.cvv ? 'border-red-300 text-red-900' : 'border-gray-200 focus:border-[#09637E]'}`}
                                                                required
                                                            />
                                                            <BsLock className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="w-full mt-8 bg-[#09637E] text-white rounded-xl py-5 font-black tracking-[0.2em] text-[10px] uppercase transition-all shadow-xl shadow-[#09637E]/10 hover:bg-[#088395] hover:shadow-2xl hover:shadow-[#09637E]/20 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-wait relative overflow-hidden group"
                                            >
                                                <span className={`relative z-10 flex items-center justify-center gap-3 transition-opacity ${isProcessing ? 'opacity-0' : 'opacity-100'}`}>
                                                    Complete Payment <BsArrowRight />
                                                </span>
                                                {isProcessing && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="upi"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="py-12 flex flex-col items-center justify-center text-center opacity-40 select-none"
                                    >
                                        <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
                                            <BsQrCodeScan size={32} className="text-gray-300" />
                                        </div>
                                        <h3 className="font-serif-premium italic text-2xl text-gray-400 mb-2">UPI Integration</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 max-w-[200px]">
                                            Instant bank transfers using UPI apps will be available shortly.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center max-w-md mx-auto"
                        >
                            <div className="w-32 h-32 relative mb-8">
                                <motion.div
                                    className="absolute inset-0 bg-green-50 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                />
                                <motion.div
                                    className="absolute inset-0 border border-green-200 rounded-full"
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-green-600">
                                    <BsCheck size={64} />
                                </div>
                            </div>

                            <h2 className="text-4xl font-serif-premium italic text-[#09637E] mb-4">Payment Confirmed</h2>
                            <p className="text-gray-400 font-medium leading-relaxed mb-4">
                                Thank you! Your reservation fee has been successfully processed. You may now proceed to curate your team.
                            </p>

                            <div className="mb-8">
                                <span className="text-xs font-bold text-[#09637E] animate-pulse">
                                    Redirecting in {countdown}...
                                </span>
                            </div>

                            <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Transaction ID</span>
                                    <span className="text-xs font-mono font-bold text-gray-700">TXN-{displayTransactionId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount Paid</span>
                                    <span className="text-xs font-bold text-gray-700">₹15,000</span>
                                </div>
                            </div>

                            <button
                                onClick={onNext}
                                className="w-full bg-[#09637E] text-white rounded-xl py-4 font-black tracking-[0.2em] text-xs uppercase transition-all shadow-lg hover:bg-[#088395] hover:-translate-y-1"
                            >
                                Continue Now
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepPayment;
