import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCheck, BsArrowRight } from "react-icons/bs";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWithAuth } from '../../../utils/apiHandler';
import { refreshAccessToken } from '../../../store/slices/authSlice';
import {
    clearPlanningError,
    confirmPlanning,
    createOrder,
    fetchPlanningByEventId,
    fetchPlanningVendorSelectionByEventId,
    resetPlanningCheckoutState,
    verifyPayment,
} from '../../../store/slices/planningSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

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

const StepConfirmation = ({ eventId, totalMin, totalMax }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const vendorSelection = useSelector((state) => state.planning?.vendorSelectionByEventId?.[eventId] || null);
    const [planning, setPlanning] = useState(null);

    const [settingsStatus, setSettingsStatus] = useState('idle');
    const [depositPercent, setDepositPercent] = useState(25);
    const [settingsError, setSettingsError] = useState(null);

    const [flowActive, setFlowActive] = useState(false);
    const [activeStep, setActiveStep] = useState(null); // 'settings'|'order'|'razor'|'verify'|'confirm'
    const [flowError, setFlowError] = useState(null);
    const [localDepositSuccess, setLocalDepositSuccess] = useState(false);

    const vendorTotals = useMemo(() => {
        const min = Number(vendorSelection?.totalMinAmount ?? (Number.isFinite(Number(totalMin)) ? Number(totalMin) : 0));
        const max = Number(vendorSelection?.totalMaxAmount ?? (Number.isFinite(Number(totalMax)) ? Number(totalMax) : 0));
        return {
            totalMinAmount: Number.isFinite(min) ? min : 0,
            totalMaxAmount: Number.isFinite(max) ? max : 0,
        };
    }, [vendorSelection?.totalMaxAmount, vendorSelection?.totalMinAmount, totalMax, totalMin]);

    const hasTotals = (vendorTotals.totalMinAmount > 0 || vendorTotals.totalMaxAmount > 0);
    const computedDepositAmount = useMemo(() => {
        const base = vendorTotals.totalMinAmount;
        const pct = Number(depositPercent);
        if (!Number.isFinite(base) || base <= 0) return 0;
        if (!Number.isFinite(pct) || pct <= 0) return 0;
        return Math.round((base * pct) / 100);
    }, [depositPercent, vendorTotals.totalMinAmount]);

    const getNiceAmountLimitHint = useCallback(() => {
        // Razorpay accounts can have per-transaction limits; we don't know it client-side.
        // Provide a helpful hint using a common 50,000 INR limit seen in some setups.
        const assumedLimitInr = 50000;
        const base = vendorTotals.totalMinAmount;
        if (!Number.isFinite(base) || base <= 0) return null;
        const suggested = Math.floor((assumedLimitInr / base) * 100);
        if (!Number.isFinite(suggested) || suggested <= 0) return null;
        return {
            assumedLimitInr,
            suggestedPercent: Math.min(100, Math.max(1, suggested)),
        };
    }, [vendorTotals.totalMinAmount]);

    const isDepositPaid = Boolean(planning?.depositPaid) || localDepositSuccess;

    const fetchDepositSettings = useCallback(async () => {
        const response = await fetchWithAuth(
            `${API_BASE_URL}/api/orders/settings?ts=${Date.now()}`,
            { method: 'GET', cache: 'no-store' },
            { dispatch, refreshAction: refreshAccessToken }
        );

        const data = await safeJson(response);
        if (!response.ok || !data?.success) {
            throw new Error(data?.message || 'Failed to load deposit settings');
        }

        const percent = Number(data?.data?.planningDepositPercent ?? 25);
        const safePercent = Number.isFinite(percent) && percent > 0 ? percent : 25;
        setDepositPercent(safePercent);
        return safePercent;
    }, [dispatch]);

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchPlanningVendorSelectionByEventId(eventId));
        dispatch(fetchPlanningByEventId(eventId)).then((res) => {
            if (res?.meta?.requestStatus === 'fulfilled') {
                setPlanning(res.payload);
            }
        });

        return () => {
            dispatch(resetPlanningCheckoutState());
        };
    }, [dispatch, eventId]);

    useEffect(() => {
        if (!eventId) return;
        if (settingsStatus !== 'idle') return;

        let cancelled = false;
        const loadSettings = async () => {
            setSettingsStatus('loading');
            setSettingsError(null);
            try {
                await fetchDepositSettings();
                if (!cancelled) setSettingsStatus('succeeded');
            } catch (e) {
                if (!cancelled) {
                    setSettingsError(e?.message || 'Failed to load deposit settings');
                    setSettingsStatus('failed');
                }
            }
        };

        loadSettings();
        return () => {
            cancelled = true;
        };
    }, [eventId, fetchDepositSettings, settingsStatus]);

    const handlePayDeposit = useCallback(async () => {
        if (!eventId) return;
        setFlowError(null);
        setFlowActive(true);
        dispatch(clearPlanningError());

        // Always refetch settings right before payment so UI stays consistent
        // even if admin changed percent while this page is open.
        setActiveStep('settings');
        let latestPercent;
        try {
            latestPercent = await fetchDepositSettings();
            setSettingsStatus('succeeded');
            setSettingsError(null);
        } catch (e) {
            setSettingsStatus('failed');
            setSettingsError(e?.message || 'Failed to load deposit settings');
            setFlowError(e?.message || 'Failed to load deposit settings');
            setFlowActive(false);
            return;
        }

        const expectedDepositAmount = Math.round((Number(vendorTotals.totalMinAmount || 0) * Number(latestPercent || 0)) / 100);
        if (!expectedDepositAmount || expectedDepositAmount <= 0) {
            setFlowError('Deposit amount is not available yet. Please ensure you have selected vendors with pricing.');
            setFlowActive(false);
            return;
        }

        // 1) Create provider order (amount computed server-side)
        setActiveStep('order');
        const orderResult = await dispatch(createOrder({ eventId, orderType: 'PLANNING EVENT DEPOSIT FEE' }));
        if (createOrder.rejected.match(orderResult)) {
            setFlowError(orderResult.payload || 'Failed to create deposit payment order. Please try again.');
            setFlowActive(false);
            return;
        }
        const { razorpayOrderId: rzpOrderId, amount, currency, keyId: rzpKeyId } = orderResult.payload;

        // 2) Load Razorpay SDK
        setActiveStep('razor');
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
            setFlowError('Failed to load payment gateway. Check your internet connection.');
            setFlowActive(false);
            return;
        }

        // 3) Open Razorpay Checkout
        await new Promise((resolve) => {
            const options = {
                key: rzpKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount,
                currency: currency || 'INR',
                name: 'Okkazo',
                description: `Planning Deposit – ${planning?.eventTitle || planning?.eventType || 'Event'}`,
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
                    // 4) Verify payment
                    setActiveStep('verify');
                    const verifyResult = await dispatch(
                        verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            eventId,
                        })
                    );

                    if (verifyPayment.rejected.match(verifyResult)) {
                        setFlowError(verifyResult.payload || 'Payment verification failed. Contact support.');
                        setFlowActive(false);
                        resolve();
                        return;
                    }

                    // Optimistically mark success locally (Kafka update is async)
                    setLocalDepositSuccess(true);

                    // 5) Confirm planning after successful deposit
                    setActiveStep('confirm');
                    const confirmResult = await dispatch(confirmPlanning({ eventId }));
                    if (confirmPlanning.rejected.match(confirmResult)) {
                        setFlowError(confirmResult.payload || 'Deposit paid, but failed to confirm planning. Please retry from Dashboard.');
                        setFlowActive(false);
                        resolve();
                        return;
                    }

                    // Refresh planning snapshot
                    dispatch(fetchPlanningByEventId(eventId)).then((res) => {
                        if (res?.meta?.requestStatus === 'fulfilled') {
                            setPlanning(res.payload);
                        }
                    });

                    setFlowActive(false);
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

                // Ensure we always unblock UI if Razorpay reports a failure event.
                if (typeof rzp?.on === 'function') {
                    rzp.on('payment.failed', (err) => {
                        const desc = err?.error?.description || err?.error?.reason || 'Payment failed. Please try again.';
                        const lower = String(desc || '').toLowerCase();
                        if (lower.includes('maximum amount')) {
                            const hint = getNiceAmountLimitHint();
                            const extra = hint
                                ? ` Try reducing the deposit percent in admin settings (suggested ~${hint.suggestedPercent}% for a ₹${hint.assumedLimitInr.toLocaleString()} limit).`
                                : ' Try reducing the deposit percent in admin settings.';
                            setFlowError(`${desc}.${extra}`);
                        } else {
                            setFlowError(desc);
                        }
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
    }, [dispatch, eventId, fetchDepositSettings, getNiceAmountLimitHint, planning?.eventTitle, planning?.eventType, vendorTotals.totalMinAmount]);

    return (
        <div className="w-full h-screen bg-surface relative flex flex-col overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-secondary/5 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
                <AnimatePresence mode="wait">
                    {!isDepositPaid ? (
                        <motion.div
                            key="deposit"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="w-full max-w-2xl bg-white/60 backdrop-blur-sm border border-primary/10 rounded-[2.5rem] p-10 text-center"
                        >
                            <p className="text-[10px] font-black tracking-[0.3em] text-primary/50 uppercase mb-3">Deposit Payment</p>
                            <h1 className="text-5xl md:text-6xl font-serif-premium italic text-primary mb-5">Complete Your Deposit</h1>
                            <p className="text-primary/60 max-w-xl mx-auto leading-relaxed font-medium mb-10">
                                Pay {Number(depositPercent || 25)}% of your minimum estimate to confirm your planning request.
                            </p>

                            <div className="bg-white/70 border border-primary/10 rounded-3xl px-10 py-6 text-center mb-8">
                                <p className="text-[10px] font-black tracking-[0.3em] text-primary/50 uppercase mb-3">Deposit Amount</p>
                                <div className="text-3xl md:text-4xl font-black text-primary font-serif-premium">
                                    ₹{Number(computedDepositAmount || 0).toLocaleString()}
                                </div>
                                {hasTotals && (
                                    <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mt-3">
                                        Based on minimum estimate ₹{Number(vendorTotals.totalMinAmount).toLocaleString()}
                                    </p>
                                )}
                            </div>

                            {settingsError && (
                                <p className="text-xs font-bold text-red-500 mb-6">{settingsError}</p>
                            )}
                            {flowError && (
                                <p className="text-xs font-bold text-red-500 mb-6">{flowError}</p>
                            )}

                            <button
                                type="button"
                                onClick={handlePayDeposit}
                                disabled={flowActive}
                                className={`w-full bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-4 py-5 ${flowActive ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
                            >
                                {flowActive ? (
                                    <>Processing… <BsArrowRight /></>
                                ) : (
                                    <>Pay Deposit <BsArrowRight /></>
                                )}
                            </button>

                            {flowActive && activeStep && (
                                <p className="mt-6 text-[10px] font-black tracking-[0.3em] text-primary/40 uppercase">
                                    {activeStep === 'settings' ? 'Loading settings…'
                                        : activeStep === 'order' ? 'Creating order…'
                                        : activeStep === 'razor' ? 'Opening gateway…'
                                        : activeStep === 'verify' ? 'Verifying payment…'
                                        : activeStep === 'confirm' ? 'Confirming planning…'
                                        : ''}
                                </p>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="flex flex-col items-center"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                className="w-24 h-24 rounded-full border border-primary/20 flex items-center justify-center mb-12 relative"
                            >
                                <div className="absolute inset-2 border border-dashed border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                                    <BsCheck size={40} strokeWidth={1} />
                                </div>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-7xl font-serif-premium italic text-primary mb-6"
                            >
                                Success!
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-primary/60 max-w-lg text-center leading-relaxed font-medium mb-12"
                            >
                                Your event has been mapped into existence. A dedicated concierge will reach out to orchestrate the final details for your celebration within 24 hours.
                            </motion.p>

                            {hasTotals && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="mb-12 bg-white/60 backdrop-blur-sm border border-primary/10 rounded-3xl px-10 py-6 text-center"
                                >
                                    <p className="text-[10px] font-black tracking-[0.3em] text-primary/50 uppercase mb-3">Estimated Total Investment</p>
                                    <div className="text-3xl md:text-4xl font-black text-primary font-serif-premium">
                                        ₹{Number(vendorTotals.totalMinAmount).toLocaleString()} – ₹{Number(vendorTotals.totalMaxAmount).toLocaleString()}
                                    </div>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-6"
                            >
                                <Link
                                    to="/user/dashboard"
                                    className="px-10 py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-4"
                                >
                                    Go to Dashboard <BsArrowRight />
                                </Link>

                                <button
                                    onClick={() => navigate(`/user/event-management/${eventId}`)}
                                    className="px-10 py-4 bg-white border border-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:border-primary/30 hover:bg-gray-50 transition-all"
                                >
                                    Track Event Status
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Metrics/Info */}
            <div className="relative z-10 border-t border-primary/5 bg-white/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Step 1</span>
                        <h4 className="text-xl font-serif-premium text-primary">Concierge</h4>
                        <p className="text-xs text-primary/60 leading-relaxed">
                            An expert planner is currently reviewing your preferences and will prepare a tailored proposal.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Step 2</span>
                        <h4 className="text-xl font-serif-premium text-primary">Verification</h4>
                        <p className="text-xs text-primary/60 leading-relaxed">
                            We are confirming availability with your selected vendors to ensure seamless execution.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col gap-2 items-start"
                    >
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Support</span>
                        <h4 className="text-xl font-serif-premium text-primary">Need Help?</h4>
                        <button className="w-10 h-10 rounded-full bg-white border border-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                            <BsArrowRight className="-rotate-45" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default StepConfirmation;
