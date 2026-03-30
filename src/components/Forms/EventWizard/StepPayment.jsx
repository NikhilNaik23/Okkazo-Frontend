import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsArrowRight } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import {
    saveEventPlanning,
    createOrder,
    verifyPayment,
    resetPlanningCheckoutState,
    clearPlanningError,
} from '../../../store/slices/planningSlice';
import {
    fetchFeesConfig,
    selectFeesStatus,
    selectPlatformFee,
} from '../../../store/slices/feesSlice';
import {
    PaymentSummary,
    PaymentSuccess,
    PaymentMethodSelector,
} from './Payment';

// ─── Load Razorpay SDK once ───────────────────────────────────────────────────
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

// ─── Step labels for progress UI ─────────────────────────────────────────────
const STEPS = [
    { key: 'save',   label: 'Saving your event...' },
    { key: 'order',  label: 'Creating payment order...' },
    { key: 'razor',  label: 'Opening payment gateway...' },
    { key: 'verify', label: 'Verifying payment...' },
];

const MotionDiv = motion.div;
const MotionP = motion.p;

const isDraftLikeId = (value) => {
    const id = String(value || '').trim();
    return id.startsWith('draft_');
};

const clearPlanningDraftsByIds = (ids = []) => {
    const normalizedIds = new Set(
        ids
            .map((id) => String(id || '').trim())
            .filter(Boolean)
    );

    if (normalizedIds.size === 0) return;

    try {
        const drafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');
        if (!Array.isArray(drafts) || drafts.length === 0) return;

        const nextDrafts = drafts.filter((d) => !normalizedIds.has(String(d?.id || '').trim()));
        if (nextDrafts.length !== drafts.length) {
            localStorage.setItem('planningWizardDrafts', JSON.stringify(nextDrafts));
            window.dispatchEvent(new Event('savedUpdated'));
        }
    } catch {
        // non-critical
    }
};

// ─── Inline progress indicator ───────────────────────────────────────────────
const FlowProgress = ({ activeStep, error }) => (
    <div className="w-full max-w-md mx-auto mt-8">
        <div className="space-y-3">
            {STEPS.map((step, idx) => {
                const stepIdx = STEPS.findIndex(s => s.key === activeStep);
                const done    = idx < stepIdx;
                const active  = idx === stepIdx;
                const pending = idx > stepIdx;
                const failed  = active && !!error;

                return (
                    <MotionDiv
                        key={step.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: pending ? 0.3 : 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex items-center gap-3"
                    >
                        {/* Dot */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            failed  ? 'bg-red-500' :
                            done    ? 'bg-green-500' :
                            active  ? 'bg-[#09637E] animate-pulse' :
                                      'bg-gray-200'
                        }`}>
                            {done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            {failed && <span className="text-white text-[10px] font-bold">!</span>}
                        </div>
                        {/* Label */}
                        <span className={`text-[11px] font-bold uppercase tracking-widest transition-all ${
                            failed  ? 'text-red-500' :
                            done    ? 'text-green-600' :
                            active  ? 'text-[#09637E]' :
                                      'text-gray-300'
                        }`}>
                            {step.label}
                        </span>
                        {/* Spinner */}
                        {active && !error && (
                            <div className="ml-auto w-4 h-4 border-2 border-[#09637E]/20 border-t-[#09637E] rounded-full animate-spin" />
                        )}
                    </MotionDiv>
                );
            })}
        </div>
        {error && (
            <MotionP
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
            >
                {error}
            </MotionP>
        )}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StepPayment = ({ onNext, onBack, formData, handleChange }) => {
    const dispatch = useDispatch();

    const { transactionId } = useSelector((state) => state.planning);
    const platformFee = useSelector(selectPlatformFee);
    const feesStatus = useSelector(selectFeesStatus);

    const [localSuccess, setLocalSuccess] = useState(false);
    const [countdown,    setCountdown]    = useState(3);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [flowActive,   setFlowActive]   = useState(false);
    const [activeStep,   setActiveStep]   = useState(null); // 'save'|'order'|'razor'|'verify'
    const [flowError,    setFlowError]    = useState(null);

    const isSuccess = localSuccess || Boolean(formData.platformFeePaid) || Boolean(formData.isPaid);

    useEffect(() => {
        if (feesStatus === 'idle') {
            dispatch(fetchFeesConfig());
        }
    }, [dispatch, feesStatus]);

    // ── Countdown → advance wizard on success ────────────────────────────────
    useEffect(() => {
        if (!isSuccess) return;
        if (countdown <= 0) { onNext(); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [isSuccess, countdown, onNext]);

    // ── Reset slice on unmount ───────────────────────────────────────────────
    useEffect(() => {
        return () => {
            dispatch(resetPlanningCheckoutState());
        };
    }, [dispatch]);

    // ── Main payment orchestration ───────────────────────────────────────────
    const handlePayment = useCallback(async () => {
        setFlowError(null);
        setFlowActive(true);
        dispatch(clearPlanningError());

        const draftIdBeforeSave = formData.id;
        const rawFormEventId = String(formData?.id || '').trim();
        const persistedEventIdFromForm = rawFormEventId && !isDraftLikeId(rawFormEventId) ? rawFormEventId : '';
        const isPublicEvent = String(formData?.listingType || '').toLowerCase() === 'public';
        let savedEventId = persistedEventIdFromForm || null;

        // ── 1. Save event only once; retries should reuse existing PAYMENT_PENDING event ──
        if (!savedEventId) {
            setActiveStep('save');
            const saveResult = await dispatch(saveEventPlanning({ formData }));
            if (saveEventPlanning.rejected.match(saveResult)) {
                setFlowError(saveResult.payload || 'Failed to save event. Please try again.');
                setFlowActive(false);
                return;
            }

            savedEventId = String(saveResult.payload.eventId || '').trim();
            if (!savedEventId) {
                setFlowError('Failed to initialize event for payment. Please try again.');
                setFlowActive(false);
                return;
            }

            handleChange('id', savedEventId);

            // Public event becomes PAYMENT_PENDING immediately after save.
            // Remove local draft now to avoid duplicate Draft + Payment Pending cards.
            if (isPublicEvent) {
                clearPlanningDraftsByIds([draftIdBeforeSave, savedEventId]);
            }
        }

        // ── 2. Create Razorpay order ─────────────────────────────────────────
        setActiveStep('order');
        // Pass dynamic platform fee (INR) so admin updates apply immediately.
        // If not loaded yet, fallback to existing backend default.
        // Note: createOrder accepts INR; backend converts to paise.
        const feeAmount = (typeof platformFee === 'number' && Number.isFinite(platformFee)) ? platformFee : undefined;
        const orderResult = await dispatch(createOrder({ eventId: savedEventId, amount: feeAmount }));
        if (createOrder.rejected.match(orderResult)) {
            setFlowError(orderResult.payload || 'Failed to create payment order. Please try again.');
            setFlowActive(false);
            return;
        }
        const { razorpayOrderId: rzpOrderId, amount, currency, keyId: rzpKeyId } = orderResult.payload;
        const normalizedOrderId = String(rzpOrderId || '').trim();
        const normalizedKeyId = String(rzpKeyId || '').trim();
        const normalizedAmount = Number(amount);

        if (!normalizedOrderId || !normalizedKeyId || !Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
            setFlowError('Invalid payment order response. Please retry. If the issue persists, ask support to verify RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET in order-service.');
            setFlowActive(false);
            return;
        }

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
                key: normalizedKeyId,
                amount: normalizedAmount,
                currency: currency || 'INR',
                name: 'Okkazo',
                description: `Planning Fee – ${formData.title || formData.type || 'Event'}`,
                order_id: normalizedOrderId,
                theme: { color: '#09637E' },
                ...(paymentMethod === 'upi'
                    ? {
                        method: {
                            upi: true,
                            card: false,
                            netbanking: false,
                            wallet: false,
                            paylater: false,
                        },
                    }
                    : {}),
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
                    const verifyResult = await dispatch(
                        verifyPayment({
                            razorpayOrderId:  response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            eventId: savedEventId,
                        })
                    );

                    if (verifyPayment.rejected.match(verifyResult)) {
                        setFlowError(verifyResult.payload || 'Payment verification failed. Contact support.');
                        setFlowActive(false);
                        resolve();
                        return;
                    }

                    // ── Success ───────────────────────────────────────────────
                    const txnId = verifyResult.payload.transactionId;
                    handleChange('platformFeePaid', true);
                    handleChange('transactionId', txnId);

                    // Clear draft(s) once payment is successful
                    clearPlanningDraftsByIds([savedEventId, draftIdBeforeSave]);

                    setFlowActive(false);
                    setLocalSuccess(true);
                    resolve();
                },
            };

            try {
                if (!window.Razorpay) {
                    setFlowError('Payment gateway is not available. Please refresh and try again.');
                    setFlowActive(false);
                    resolve();
                    return;
                }

                const rzp = new window.Razorpay(options);

                if (typeof rzp?.on === 'function') {
                    rzp.on('payment.failed', (err) => {
                        const desc = err?.error?.description || err?.error?.reason || 'Payment failed. Please try again.';
                        setFlowError(desc);
                        setFlowActive(false);
                        resolve();
                    });
                }

                rzp.open();
            } catch (e) {
                setFlowError(e?.message || 'Unable to open payment gateway. Please try again.');
                setFlowActive(false);
                resolve();
            }
        });
    }, [dispatch, formData, handleChange, paymentMethod, platformFee]);

    // ── Derive a friendly "isProcessing" flag ────────────────────────────────
    const isProcessing = flowActive && !flowError;
    const showProgress = flowActive || (flowError && activeStep);

    return (
        <div className="w-full min-h-screen flex items-center justify-center animate-fade-in font-sans pt-32 pb-12 px-4 box-border relative z-10">
            <div className="w-full max-w-6xl min-h-[600px] flex flex-col md:flex-row bg-white rounded-[3rem] shadow-2xl overflow-hidden relative">

                {/* Left Panel: Summary */}
                <PaymentSummary onBack={onBack} formData={formData} platformFee={platformFee} />

                {/* Right Panel */}
                <div className="w-full md:w-7/12 bg-white relative p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    {!isSuccess ? (
                        <div className="max-w-md mx-auto w-full">

                            {/* Payment method tabs – shown only when not in mid-flow */}
                            {!showProgress && (
                                <PaymentMethodSelector
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                />
                            )}

                            <AnimatePresence mode="wait">
                                {showProgress ? (
                                    /* ── In-flight progress view ─────────────────────────────── */
                                    <MotionDiv
                                        key="progress"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="py-8"
                                    >
                                        <h2 className="text-2xl font-serif-premium italic text-[#09637E] mb-2">
                                            {flowError ? 'Something went wrong' : 'Processing your payment'}
                                        </h2>
                                        <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-6">
                                            {flowError ? 'Please review the error below' : 'Please do not close this window'}
                                        </p>

                                        <FlowProgress activeStep={activeStep} error={flowError} />

                                        {/* Retry / cancel after error */}
                                        {flowError && (
                                            <div className="mt-8 flex gap-4">
                                                <button
                                                    onClick={handlePayment}
                                                    className="flex-1 bg-[#09637E] text-white rounded-xl py-4 font-black tracking-[0.2em] text-[10px] uppercase hover:bg-[#088395] transition-all"
                                                >
                                                    Retry Payment
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setFlowError(null);
                                                        setActiveStep(null);
                                                        setFlowActive(false);
                                                        dispatch(resetPlanningCheckoutState());
                                                    }}
                                                    className="px-6 py-4 rounded-xl border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:border-gray-400 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </MotionDiv>
                                ) : paymentMethod === 'card' ? (
                                    /* ── Card payment CTA ────────────────────────────────────── */
                                    <MotionDiv
                                        key="card"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-8"
                                    >
                                        {/* Summary card */}
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Planning Fee</span>
                                                <span className="text-2xl font-serif-premium italic font-bold text-[#09637E]">₹{(platformFee ?? 150).toLocaleString()}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                                Secures your dates. Adjusted against final bill after vendor selection.
                                            </p>
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    Event: <span className="text-[#09637E]">{formData.title || formData.type}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Razorpay branding note */}
                                        <p className="text-[10px] text-gray-400 font-medium mb-6 text-center">
                                            You'll be redirected to a secure Razorpay payment window.
                                        </p>

                                        <button
                                            onClick={handlePayment}
                                            disabled={isProcessing}
                                            className="w-full bg-[#09637E] text-white rounded-xl py-5 font-black tracking-[0.2em] text-[10px] uppercase transition-all shadow-xl shadow-[#09637E]/10 hover:bg-[#088395] hover:shadow-2xl hover:shadow-[#09637E]/20 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3"
                                        >
                                            Complete Payment <BsArrowRight />
                                        </button>
                                    </MotionDiv>
                                ) : (
                                    /* ── UPI payment CTA (uses Razorpay UPI) ─────────────────── */
                                    <MotionDiv
                                        key="upi"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-8"
                                    >
                                        {/* Summary card */}
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Planning Fee</span>
                                                <span className="text-2xl font-serif-premium italic font-bold text-[#09637E]">₹{(platformFee ?? 150).toLocaleString()}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                                Pay securely via UPI. You can use Google Pay, PhonePe, Paytm, or any UPI app.
                                            </p>
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    Event: <span className="text-[#09637E]">{formData.title || formData.type}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Razorpay branding note */}
                                        <p className="text-[10px] text-gray-400 font-medium mb-6 text-center">
                                            You'll be redirected to a secure Razorpay payment window.
                                        </p>

                                        <button
                                            onClick={handlePayment}
                                            disabled={isProcessing}
                                            className="w-full bg-[#09637E] text-white rounded-xl py-5 font-black tracking-[0.2em] text-[10px] uppercase transition-all shadow-xl shadow-[#09637E]/10 hover:bg-[#088395] hover:shadow-2xl hover:shadow-[#09637E]/20 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3"
                                        >
                                            Continue to UPI <BsArrowRight />
                                        </button>
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <PaymentSuccess
                            displayTransactionId={transactionId || formData.transactionId}
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
