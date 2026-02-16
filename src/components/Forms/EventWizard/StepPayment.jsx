import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCreditCard, BsLock, BsArrowRight } from 'react-icons/bs';
import {
    VisualCreditCard,
    PaymentSummary,
    PaymentSuccess,
    UPIPlaceholder,
    PaymentMethodSelector
} from './Payment';

const StepPayment = ({ onNext, onBack, formData, handleChange }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [countdown, setCountdown] = useState(3);

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

        if (!cardName.trim()) {
            newErrors.cardName = 'Cardholder name is required';
        }

        const cleanCardNum = cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cleanCardNum)) {
            newErrors.cardNumber = 'Card number must be 16 digits';
        }

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
        if (!validateForm()) return;

        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            handleChange('isPaid', true);
            handleChange('transactionId', tempTransactionId);

            try {
                const existingEvents = JSON.parse(localStorage.getItem('my_organized_events') || '[]');
                const newEvent = {
                    id: `evt-${Date.now()}`,
                    title: formData.title || `${formData.type} Planning`,
                    date: formData.date || "Date Pending",
                    location: formData.location || "Location TBD",
                    status: "Immediate Action",
                    formData: { ...formData, isPaid: true, transactionId: tempTransactionId },
                    image: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=2574&auto=format&fit=crop",
                    sold: "0"
                };
                const updatedEvents = [newEvent, ...existingEvents];
                localStorage.setItem('my_organized_events', JSON.stringify(updatedEvents));
                window.dispatchEvent(new Event('savedUpdated'));
            } catch (err) {
                console.error("Failed to update draft payment status", err);
            }
        }, 2000);
    };

    const PaymentFormInput = ({ name, label, value, placeholder, maxLength, type = 'text', showIcon = false, iconComponent: IconComponent }) => (
        <div className="relative group">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-focus-within:text-[#09637E] transition-colors flex justify-between">
                {label}
                {errors[name] && <span className="text-red-500 font-bold">{errors[name]}</span>}
            </label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={(e) => {
                        handleInputChange(e);
                        if (errors[name]) setErrors({ ...errors, [name]: null });
                    }}
                    onFocus={() => setFocusedField(name)}
                    onBlur={() => setFocusedField(null)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`w-full bg-transparent border-b py-3 text-sm font-bold text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 ${name === 'cardName' ? 'tracking-wider' : 'font-mono tracking-wider'} ${errors[name] ? 'border-red-300 text-red-900' : 'border-gray-200 focus:border-[#09637E]'}`}
                    required
                />
                {showIcon && IconComponent && (
                    <IconComponent className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" size={name === 'cvv' ? 14 : undefined} />
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen flex items-center justify-center animate-fade-in font-sans pt-32 pb-12 px-4 box-border relative z-10">
            <div className="w-full max-w-6xl min-h-[600px] flex flex-col md:flex-row bg-white rounded-[3rem] shadow-2xl overflow-hidden relative">
                {/* Left Panel: Summary */}
                <PaymentSummary onBack={onBack} formData={formData} />

                {/* Right Panel: Payment Form */}
                <div className="w-full md:w-7/12 bg-white relative p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    {!isSuccess ? (
                        <div className="max-w-md mx-auto w-full">
                            <PaymentMethodSelector paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

                            <AnimatePresence mode='wait'>
                                {paymentMethod === 'card' ? (
                                    <motion.div
                                        key="card"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <VisualCreditCard
                                            cardName={paymentData.cardName}
                                            cardNumber={paymentData.cardNumber}
                                            expiry={paymentData.expiry}
                                        />

                                        <form onSubmit={handlePayment} className="space-y-6">
                                            <div className="space-y-5">
                                                <PaymentFormInput
                                                    name="cardName"
                                                    label="Name on Card"
                                                    value={paymentData.cardName}
                                                    placeholder="JANE DOE"
                                                />
                                                <PaymentFormInput
                                                    name="cardNumber"
                                                    label="Card Number"
                                                    value={paymentData.cardNumber}
                                                    placeholder="0000 0000 0000 0000"
                                                    maxLength="19"
                                                    showIcon
                                                    iconComponent={BsCreditCard}
                                                />
                                                <div className="flex gap-6">
                                                    <div className="flex-1">
                                                        <PaymentFormInput
                                                            name="expiry"
                                                            label="Expiry"
                                                            value={paymentData.expiry}
                                                            placeholder="MM/YY"
                                                            maxLength="5"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <PaymentFormInput
                                                            name="cvv"
                                                            label="CVV"
                                                            value={paymentData.cvv}
                                                            placeholder="123"
                                                            maxLength="3"
                                                            showIcon
                                                            iconComponent={BsLock}
                                                        />
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
                                    <UPIPlaceholder />
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <PaymentSuccess
                            displayTransactionId={displayTransactionId}
                            countdown={countdown}
                            onNext={onNext}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepPayment;
