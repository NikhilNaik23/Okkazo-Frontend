import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { BsShieldCheck, BsArrowLeft, BsGem, BsArrowRight } from "react-icons/bs";
import {
    savePromoteEvent,
    createPromoteOrder,
    verifyPromotePayment,
    resetPromoteCheckoutState,
    clearPromoteError,
} from "../../../store/slices/promoteSlice";
import { promotePrices } from "../../../data/promoteEventData";

// ─── Load Razorpay once ───────────────────────────────────────────────────────
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

// ─── Flow step labels ─────────────────────────────────────────────────────────
const STEPS = [
    { key: 'save',   label: 'Saving your event...' },
    { key: 'order',  label: 'Creating payment order...' },
    { key: 'razor',  label: 'Opening payment gateway...' },
    { key: 'verify', label: 'Verifying payment...' },
];

const FlowProgress = ({ activeStep, error }) => (
    <div className="w-full max-w-md mx-auto mt-6 space-y-3">
        {STEPS.map((step, idx) => {
            const stepIdx = STEPS.findIndex((s) => s.key === activeStep);
            const done   = idx < stepIdx;
            const active = idx === stepIdx;
            const pending = idx > stepIdx;
            const failed  = active && !!error;
            return (
                <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: pending ? 0.3 : 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3"
                >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        failed  ? 'bg-red-500' :
                        done    ? 'bg-green-500' :
                        active  ? 'bg-[#09637E] animate-pulse' :
                                  'bg-gray-200'
                    }`}>
                        {done && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {failed && <span className="text-white text-[10px] font-bold">!</span>}
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-widest transition-all ${
                        failed  ? 'text-red-500' :
                        done    ? 'text-green-600' :
                        active  ? 'text-[#09637E]' :
                                  'text-gray-300'
                    }`}>{step.label}</span>
                    {active && !error && (
                        <div className="ml-auto w-4 h-4 border-2 border-[#09637E]/20 border-t-[#09637E] rounded-full animate-spin" />
                    )}
                </motion.div>
            );
        })}
        {error && (
            <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
            >
                {error}
            </motion.p>
        )}
    </div>
);

// ─── Payment Confirmation Component ──────────────────────────────────────────
const PaymentConfirmation = ({ formData, platformFee, setCurrentStep, handlePaymentSuccess }) => {
    const dispatch = useDispatch();

    const { saveStatus, orderStatus, verifyStatus, error } =
        useSelector((state) => state.promote);

    const [flowActive, setFlowActive]   = useState(false);
    const [activeStep, setActiveStep]   = useState(null);
    const [flowError, setFlowError]     = useState(null);
    const [isSuccess, setIsSuccess]     = useState(false);
    const [savedEventId, setSavedEventId] = useState(null);

    // Reset slice on unmount
    useEffect(() => () => { dispatch(resetPromoteCheckoutState()); }, [dispatch]);

    // Promotion costs
    const promoCosts = Object.keys(formData.promotions || {}).reduce((acc, key) => {
        if (formData.promotions[key] === true && promotePrices[key]) {
            return acc + promotePrices[key];
        }
        return acc;
    }, 0);

    const subtotal  = platformFee + promoCosts;
    const tax       = subtotal * 0.05;
    const finalTotal = subtotal + tax;

    // ─── Main payment orchestration ───────────────────────────────────────────
    const handleTransact = useCallback(async () => {
        setFlowError(null);
        setFlowActive(true);
        dispatch(clearPromoteError());

        // ── 1. Save promote event ─────────────────────────────────────────────
        setActiveStep('save');

        let eventIdToUse = savedEventId; // Reuse if already saved (retry case)
        if (!eventIdToUse) {
            const saveResult = await dispatch(savePromoteEvent({ formData }));
            if (savePromoteEvent.rejected.match(saveResult)) {
                setFlowError(saveResult.payload || 'Failed to save event. Please try again.');
                setFlowActive(false);
                return;
            }
            eventIdToUse = saveResult.payload.eventId;
            setSavedEventId(eventIdToUse);
        }

        // ── 2. Create Razorpay order ──────────────────────────────────────────
        setActiveStep('order');
        const orderResult = await dispatch(createPromoteOrder({
            eventId: eventIdToUse,
            amount: finalTotal, // ₹ amount; backend converts to paise and returns paise
        }));
        if (createPromoteOrder.rejected.match(orderResult)) {
            setFlowError(orderResult.payload || 'Failed to create payment order. Please try again.');
            setFlowActive(false);
            return;
        }
        const { razorpayOrderId: rzpOrderId, amount, currency, keyId: rzpKeyId } = orderResult.payload;

        // ── 3. Load Razorpay SDK & open popup ────────────────────────────────
        setActiveStep('razor');
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
            setFlowError('Failed to load payment gateway. Check your internet connection.');
            setFlowActive(false);
            return;
        }

        await new Promise((resolve) => {
            const options = {
                key: rzpKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount,
                currency: currency || 'INR',
                name: 'Okkazo',
                description: `Platform Fee — ${formData.eventName || 'Promote Event'}`,
                order_id: rzpOrderId,
                theme: { color: '#09637E' },
                modal: {
                    ondismiss: () => {
                        setFlowError('Payment was cancelled. You can try again.');
                        setFlowActive(false);
                        resolve();
                    },
                },
                handler: async (response) => {
                    // ── 4. Verify payment ─────────────────────────────────────
                    setActiveStep('verify');
                    const verifyResult = await dispatch(verifyPromotePayment({
                        razorpayOrderId:   response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                        eventId: eventIdToUse,
                    }));

                    if (verifyPromotePayment.rejected.match(verifyResult)) {
                        setFlowError(verifyResult.payload || 'Payment verification failed. Contact support.');
                        setFlowActive(false);
                        resolve();
                        return;
                    }

                    // ── Success ───────────────────────────────────────────────
                    setFlowActive(false);
                    setIsSuccess(true);
                    handlePaymentSuccess(eventIdToUse, verifyResult.payload.transactionId);
                    resolve();
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        });
    }, [dispatch, formData, finalTotal, savedEventId, handlePaymentSuccess]);

    const isProcessing = flowActive && !flowError;
    const showProgress = flowActive || (flowError && activeStep);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border border-[#09637E]/10 relative overflow-hidden group">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#088395]/5 rounded-full blur-3xl -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-[#088395]/10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7AB2B2]/10 rounded-full blur-3xl -ml-32 -mb-32 group-hover:bg-[#7AB2B2]/20" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        {/* Left Column */}
                        <div className="flex-1 space-y-8">
                            <div>
                                <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Secure Checkout</p>
                                <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">
                                    Authorize Publication.
                                </h2>
                            </div>

                            {/* Event card */}
                            <div className="p-8 bg-[#09637E] rounded-3xl text-[#EBF4F6] relative overflow-hidden group/card shadow-xl">
                                <div className="absolute top-4 right-4 text-[#7AB2B2]/20 group-hover/card:scale-110 transition-transform duration-500">
                                    <BsShieldCheck size={120} />
                                </div>
                                <div className="relative z-10">
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Event Title</span>
                                    <h3 className="text-2xl font-serif-premium italic mb-6">{formData.eventName || 'Untitled Event'}</h3>

                                    <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <BsGem className="text-[#7AB2B2]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Status</p>
                                            <p className="text-sm font-bold tracking-wide">Ready to Launch</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress / error */}
                            <AnimatePresence>
                                {showProgress && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/60 mb-3">
                                            {flowError ? 'Something went wrong' : 'Processing your payment…'}
                                        </p>
                                        <FlowProgress activeStep={activeStep} error={flowError} />
                                        {flowError && (
                                            <button
                                                onClick={handleTransact}
                                                className="mt-6 w-full py-4 bg-[#088395] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#09637E] transition-all"
                                            >
                                                Retry Payment
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex items-center gap-2 text-[#09637E]/40 hover:text-[#09637E] transition-all font-bold uppercase tracking-widest text-[10px] group/back"
                            >
                                <BsArrowLeft className="group-hover/back:-translate-x-1 transition-transform" />
                                Return to editing
                            </button>
                        </div>

                        {/* Right / Bill Column */}
                        <div className="w-full md:w-80 bg-[#EBF4F6] rounded-[2.5rem] p-8 border border-[#09637E]/5 flex flex-col justify-between shadow-inner">
                            <div>
                                <h4 className="font-serif-premium text-2xl italic text-[#09637E] mb-8">Summary</h4>
                                <ul className="space-y-5">
                                    <li className="flex justify-between items-center text-[#09637E]/70">
                                        <span className="text-xs font-bold uppercase tracking-wider">Platform</span>
                                        <span className="font-mono text-sm">₹{platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </li>
                                    {promoCosts > 0 && (
                                        <li className="flex justify-between items-center text-[#09637E]/70">
                                            <span className="text-xs font-bold uppercase tracking-wider">Marketing</span>
                                            <span className="font-mono text-sm">₹{promoCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </li>
                                    )}
                                    <li className="flex justify-between items-center text-[#09637E]/70">
                                        <span className="text-xs font-bold uppercase tracking-wider">Tax (5%)</span>
                                        <span className="font-mono text-sm">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-12 pt-8 border-t border-[#09637E]/10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-2 text-right">Settlement Total</p>
                                <div className="text-right">
                                    <span className="text-5xl font-serif-premium italic text-[#09637E]">
                                        ₹{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {!showProgress && !isSuccess && (
                                    <button
                                        onClick={handleTransact}
                                        disabled={isProcessing}
                                        className="w-full mt-8 py-5 bg-[#088395] text-[#EBF4F6] font-black uppercase tracking-[0.15em] text-xs rounded-2xl shadow-xl hover:bg-[#09637E] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group/pay disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/pay:translate-x-full transition-transform duration-700" />
                                        <span className="relative z-10">Confirm &amp; Transact</span>
                                        <BsArrowRight className="relative z-10" />
                                    </button>
                                )}

                                {isSuccess && (
                                    <div className="mt-8 text-center">
                                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Payment Successful</p>
                                    </div>
                                )}

                                <p className="mt-6 text-[9px] text-center text-[#09637E]/40 px-4 leading-relaxed font-bold uppercase tracking-widest">
                                    Secure encryption provided. By transacting, you agree to Okkazo terms.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmation;
