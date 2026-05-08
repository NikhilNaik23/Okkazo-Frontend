import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BsArrowLeft, BsCheckCircleFill, BsQrCode, BsCalendarEvent } from "react-icons/bs";
import { toast } from "react-hot-toast";
import PaymentMethod from "../../../components/Forms/Checkout/PaymentMethod";
import CheckoutOrderSummary from "../../../components/Forms/Checkout/CheckoutOrderSummary";
import { fetchWithAuth } from "../../../utils/apiHandler";
import { refreshAccessToken } from "../../../store/slices/authSlice";
import { createOrder, verifyPayment } from "../../../store/slices/planningSlice";
import {
    fetchFeesConfig,
    selectFeesStatus,
    selectServiceChargePercent,
} from "../../../store/slices/feesSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop";

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const resolveBannerUrl = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
        const s = value.trim();
        return s || null;
    }

    if (typeof value === "object") {
        const candidates = [value.url, value.fileUrl, value.secure_url, value.src, value.image];
        for (const item of candidates) {
            if (typeof item === "string" && item.trim()) return item.trim();
        }
    }

    return null;
};

const formatDateBadge = (value) => {
    if (!value) return "DATE TBA";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "DATE TBA";
    const day = d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
    const month = d.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
    const date = String(d.getDate()).padStart(2, "0");
    const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toUpperCase();
    return `${day}, ${month} ${date} • ${time}`;
};

const mapMarketplaceEventToCheckoutEvent = (event) => {
    const startAt = event?.eventScheduled?.startAt || null;
    const tiers = Array.isArray(event?.tickets?.tiers) ? event.tickets.tiers : [];
    const minTierPrice = tiers
        .map((tier) => Number(tier?.price || tier?.ticketPrice || 0))
        .filter((n) => Number.isFinite(n) && n >= 0)
        .sort((a, b) => a - b)[0] || 0;

    return {
        id: String(event?.eventId || ""),
        title: event?.eventTitle || "Untitled Event",
        date: formatDateBadge(startAt),
        location: event?.venue?.locationName || "Venue TBA",
        eventLocation: event?.venue?.locationName || "Venue TBA",
        image: resolveBannerUrl(event?.eventBanner) || DEFAULT_EVENT_IMAGE,
        price: minTierPrice > 0 ? `₹${minTierPrice.toLocaleString("en-IN")}` : "Free",
        categories: tiers.length
            ? tiers.map((tier, idx) => {
                const name = String(tier?.name || tier?.tierName || `Tier ${idx + 1}`).trim();
                const priceRaw = Number(tier?.price || tier?.ticketPrice || 0);
                return {
                    name,
                    price: priceRaw > 0 ? `₹${priceRaw.toLocaleString("en-IN")}` : "Free",
                };
            })
            : [{ name: "General", price: minTierPrice > 0 ? `₹${minTierPrice.toLocaleString("en-IN")}` : "Free" }],
        raw: event,
    };
};

const EventCheckout = () => {
    const dispatch = useDispatch();
    const serviceChargePercent = useSelector(selectServiceChargePercent);
    const feesStatus = useSelector(selectFeesStatus);
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const quantity = parseInt(queryParams.get('qty')) || 1;
    const selectedCategory = queryParams.get("category") || "General";
    const selectedTicketDay = String(location?.state?.selectedTicketDay || queryParams.get('day') || '').trim();

    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ticketId, setTicketId] = useState(null);
    const [ticketQrToken, setTicketQrToken] = useState(null);

    useEffect(() => {
        if (feesStatus === 'idle') {
            dispatch(fetchFeesConfig());
        }
    }, [dispatch, feesStatus]);

    useEffect(() => {
        let cancelled = false;

        const loadEvent = async () => {
            setIsLoading(true);
            try {
                const stateEvent = location?.state?.event;
                if (stateEvent && String(stateEvent.id) === String(eventId)) {
                    const normalizedStateEvent = { ...stateEvent };
                    if (normalizedStateEvent.categories && Array.isArray(normalizedStateEvent.categories)) {
                        const cat = normalizedStateEvent.categories.find(c => c.name === selectedCategory);
                        if (cat) normalizedStateEvent.price = cat.price;
                    }
                    if (!cancelled) setEvent(normalizedStateEvent);
                    return;
                }

                const response = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/tickets/marketplace/events?limit=300`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );
                const data = await safeJson(response);
                const events = response.ok && data?.success && Array.isArray(data?.data?.events)
                    ? data.data.events
                    : [];

                const foundEvent = events.find((e) => String(e?.eventId) === String(eventId));
                if (!foundEvent) {
                    toast.error("Event not found");
                    navigate("/user/dashboard");
                    return;
                }

                const mapped = mapMarketplaceEventToCheckoutEvent(foundEvent);
                if (mapped.categories && Array.isArray(mapped.categories)) {
                    const cat = mapped.categories.find(c => c.name === selectedCategory);
                    if (cat) mapped.price = cat.price;
                }

                if (!cancelled) setEvent(mapped);
            } catch {
                toast.error("Unable to load event checkout details");
                navigate("/user/dashboard");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadEvent();
        return () => {
            cancelled = true;
        };
    }, [dispatch, eventId, location, navigate, selectedCategory]);

    const getNumericPrice = (p) => {
        if (p === null || p === undefined) return 0;
        if (typeof p === 'number') return Number.isFinite(p) ? p : 0;
        if (typeof p !== 'string') return 0;
        const numeric = p.replace(/[^0-9.]/g, '');
        return numeric ? parseFloat(numeric) : 0;
    };

    const buildRequestedTiers = () => {
        const selected = location?.state?.ticketSelection;
        const selectedEntries = Object.entries(selected || {}).filter(([, qty]) => Number(qty || 0) > 0);

        if (selectedEntries.length > 0) {
            const categoryPriceMap = new Map(
                (Array.isArray(event?.categories) ? event.categories : []).map((cat) => [String(cat?.name || '').trim(), getNumericPrice(cat?.price)])
            );

            return selectedEntries.map(([name, qty]) => ({
                name,
                quantity: Number(qty || 0),
                price: categoryPriceMap.get(String(name).trim()) || 0,
            }));
        }

        return [
            {
                name: selectedCategory,
                quantity,
                price: getNumericPrice(event?.price),
            },
        ];
    };

    const selectedTierSummary = buildRequestedTiers().filter((tier) => Number(tier?.quantity || 0) > 0);
    const selectedTicketCount = selectedTierSummary.reduce((sum, tier) => sum + Number(tier?.quantity || 0), 0);
    const subtotal = selectedTierSummary.reduce(
        (sum, tier) => sum + (Number(tier?.price || 0) * Number(tier?.quantity || 0)),
        0
    );
    const normalizedServiceChargePercent = Number.isFinite(Number(serviceChargePercent))
        ? Math.max(0, Math.min(100, Number(serviceChargePercent)))
        : 0;
    const feeRate = normalizedServiceChargePercent / 100;
    const serviceFee = subtotal === 0 ? 0 : subtotal * feeRate;
    const processingFee = subtotal === 0 ? 0 : subtotal * feeRate;
    const totalFees = serviceFee + processingFee;
    const totalPayable = subtotal + totalFees;
    const isFreeCheckout = totalPayable <= 0;
    const ticketsDisplayText = selectedTierSummary
        .map((tier) => `${tier.quantity} x ${tier.name}`)
        .join(', ');

    const handleConfirmPayment = async () => {
        if (!event || isProcessing) return;

        const requestedTiers = buildRequestedTiers().filter((tier) => Number(tier?.quantity || 0) > 0);
        if (!requestedTiers.length) {
            toast.error('Please select at least one ticket before checkout.');
            return;
        }

        setIsProcessing(true);

        try {
            const prepareResponse = await fetchWithAuth(
                `${API_BASE_URL}/api/events/tickets/purchase/prepare`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        eventId,
                        ...(selectedTicketDay ? { selectedDay: selectedTicketDay } : {}),
                        tiers: requestedTiers.map((tier) => ({
                            name: tier.name,
                            quantity: Number(tier.quantity || 0),
                        })),
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const prepareData = await safeJson(prepareResponse);
            if (!prepareResponse.ok || !prepareData?.success) {
                throw new Error(prepareData?.message || 'Failed to initialize ticket purchase');
            }

            const preparedTicket = prepareData.data;
            if (Number(preparedTicket?.amountInPaise || 0) <= 0) {
                const confirmResponse = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/tickets/purchase/confirm-free`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            eventId,
                            ticketId: preparedTicket?.ticketId,
                        }),
                    },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const confirmData = await safeJson(confirmResponse);
                if (!confirmResponse.ok || !confirmData?.success) {
                    throw new Error(confirmData?.message || 'Failed to confirm free ticket');
                }

                const confirmedTicket = confirmData?.data || null;
                const resolvedTicketId = confirmedTicket?.ticketId || preparedTicket?.ticketId || null;
                setTicketId(resolvedTicketId);
                setTicketQrToken(confirmedTicket?.qrToken || preparedTicket?.qrToken || null);
                setIsSuccess(true);
                toast.success('Free ticket confirmed successfully!');
                return;
            }

            const payableAmountInInr = Number(totalPayable.toFixed(2));

            const orderResult = await dispatch(createOrder({
                eventId,
                orderType: 'TICKET SALE',
                amount: payableAmountInInr,
                notes: {
                    ticketId: preparedTicket?.ticketId,
                    ticketQuantity: preparedTicket?.quantity,
                    ticketTiers: JSON.stringify(preparedTicket?.tiers || []),
                    eventTitle: preparedTicket?.eventTitle,
                    eventLocation: preparedTicket?.eventLocation,
                    ticketLink: preparedTicket?.checkoutLink,
                    serviceChargePercent: normalizedServiceChargePercent,
                    baseTicketAmountInInr: Number(subtotal.toFixed(2)),
                    serviceFeeInInr: Number(serviceFee.toFixed(2)),
                    platformFeeInInr: Number(processingFee.toFixed(2)),
                    checkoutTotalInInr: payableAmountInInr,
                },
            }));

            if (createOrder.rejected.match(orderResult)) {
                throw new Error(orderResult.payload || 'Failed to create payment order');
            }

            const { razorpayOrderId: rzpOrderId, amount, currency, keyId: rzpKeyId } = orderResult.payload || {};
            const normalizedOrderId = String(rzpOrderId || '').trim();
            const normalizedKeyId = String(rzpKeyId || '').trim();
            const normalizedAmount = Number(amount);

            if (!normalizedOrderId || !normalizedKeyId || !Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
                throw new Error('Invalid payment order response. Please retry. If issue persists, contact support.');
            }

            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded) {
                throw new Error('Failed to load payment gateway. Check your internet connection and try again.');
            }

            await new Promise((resolve) => {
                const options = {
                    key: normalizedKeyId,
                    amount: normalizedAmount,
                    currency: currency || 'INR',
                    name: 'Okkazo',
                    description: `Ticket Purchase - ${event?.title || 'Event'}`,
                    order_id: normalizedOrderId,
                    modal: {
                        ondismiss: () => {
                            toast.error('Payment was cancelled. You can try again.');
                            resolve();
                        },
                    },
                    handler: async (response) => {
                        const verifyResult = await dispatch(
                            verifyPayment({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                eventId,
                            })
                        );

                        if (verifyPayment.rejected.match(verifyResult)) {
                            toast.error(verifyResult.payload || 'Payment verification failed. Contact support.');
                            resolve();
                            return;
                        }

                        const resolvedTicketId = verifyResult?.payload?.ticketId || preparedTicket?.ticketId || null;
                        setTicketId(resolvedTicketId);
                        setTicketQrToken(preparedTicket?.qrToken || null);
                        setIsSuccess(true);
                        toast.success('Payment successful! Your ticket is confirmed.');
                        resolve();
                    },
                };

                try {
                    if (!window.Razorpay) {
                        toast.error('Payment gateway is unavailable. Refresh and try again.');
                        resolve();
                        return;
                    }
                    const rzp = new window.Razorpay(options);

                    if (typeof rzp?.on === 'function') {
                        rzp.on('payment.failed', (err) => {
                            const desc = err?.error?.description || err?.error?.reason || 'Payment failed. Please try again.';
                            toast.error(desc);
                            resolve();
                        });
                    }

                    rzp.open();
                } catch (error) {
                    toast.error(error?.message || 'Failed to open payment gateway. Please try again.');
                    resolve();
                }
            });
        } catch (error) {
            toast.error(error?.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading && !isSuccess) {
        return (
            <div className="min-h-screen bg-[#EBF4F6] pt-28">
                <main className="max-w-7xl mx-auto w-full px-6 pb-32 animate-pulse space-y-8">
                    <div className="h-16 w-96 rounded-2xl bg-white/80 mx-auto" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 h-[560px] rounded-3xl bg-white/80 border border-[#7AB2B2]/15" />
                        <div className="lg:col-span-4 h-[460px] rounded-3xl bg-white/80 border border-[#7AB2B2]/15" />
                    </div>
                </main>
            </div>
        );
    }

    if (!event && !isSuccess) return null;

    // Generate QR Content
    const qrContent = ticketQrToken || `ticketId:${ticketId || 'PENDING'}|eventId:${eventId}|event:${event?.title || ''}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrContent)}`;

    return (
        <div className="min-h-screen bg-[#EBF4F6] font-sans text-[#09637E] selection:bg-[#088395] selection:text-white overflow-x-hidden relative">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#09637E]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#d7a444]/5 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-28 pb-32">
                {isSuccess ? (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
                        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(9,99,126,0.15)] border border-white/60">
                            <div className="bg-[#09637E] p-12 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-[#088395]/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7AB2B2]/40 rounded-full blur-[60px] -ml-20 -mb-20"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
                                        <BsCheckCircleFill className="text-[#22c55e] drop-shadow-lg" size={48} />
                                    </div>
                                    <p className="text-[#22c55e] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Payment Successful</p>
                                    <h2 className="text-5xl md:text-6xl font-serif-premium italic mb-4">You're Going!</h2>
                                    <p className="text-white/80 font-light text-lg tracking-wide max-w-md">Your tickets for <strong className="text-white font-serif-premium">{event.title}</strong> have been confirmed.</p>
                                </div>
                            </div>

                            <div className="p-12 md:p-16">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                                    <div className="space-y-10">
                                        <div>
                                            <p className="text-[10px] font-black text-[#09637E]/60 uppercase tracking-[0.2em] mb-6">Order Summary</p>
                                            <div className="flex items-start gap-6 mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-[#088395]/5 flex items-center justify-center text-[#088395]">
                                                    <BsCalendarEvent size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-[#09637E] mb-1">{event.title}</h3>
                                                    <p className="text-[#09637E] font-serif-premium italic text-lg">{event.date}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#F8FAFC] p-5 rounded-3xl border border-[#E2E8F0]">
                                                    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Tickets</p>
                                                    <p className="text-2xl font-black text-[#09637E]">{selectedTicketCount || quantity}</p>
                                                    <p className="text-xs text-[#94A3B8] font-medium mt-1">{ticketsDisplayText || `${quantity} x ${selectedCategory}`}</p>
                                                </div>
                                                <div className="bg-[#F8FAFC] p-5 rounded-3xl border border-[#E2E8F0]">
                                                    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Total Paid</p>
                                                    <p className="text-2xl font-black text-[#088395]">₹{totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                            </div>

                                            {ticketId ? (
                                                <div className="mt-4 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                                                    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Ticket ID</p>
                                                    <p className="text-sm font-bold text-[#09637E] break-all">{ticketId}</p>
                                                </div>
                                            ) : null}
                                        </div>

                                        <button
                                            onClick={() => navigate(ticketId ? `/user/ticket/${encodeURIComponent(ticketId)}` : "/user/dashboard")}
                                            className="w-full group relative overflow-hidden bg-[#09637E] text-white px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#09637E]/20 hover:-translate-y-1 active:scale-95"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                {ticketId ? 'View Ticket QR' : 'Back to Dashboard'} <BsArrowLeft className="rotate-180 transition-transform group-hover:translate-x-1" size={16} />
                                            </span>
                                            <div className="absolute inset-0 bg-[#088395] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                        </button>
                                    </div>

                                    <div className="relative group perspective-1000">
                                        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-[#E2E8F0] text-center transform transition-transform duration-700 hover:rotate-y-6 hover:rotate-x-6">
                                            <div className="bg-[#09637E] w-12 h-12 rounded-full absolute -top-4 -right-4 flex items-center justify-center text-white font-bold shadow-lg z-10 border-4 border-white">
                                                <BsQrCode size={20} />
                                            </div>
                                            <div className="bg-gray-50 p-6 rounded-3xl mb-6 inline-block">
                                                <img src={qrUrl} alt="Booking QR Code" className="w-48 h-48 mix-blend-multiply" />
                                            </div>
                                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-2 leading-tight">Digital Entry Pass</p>
                                            <p className="text-sm text-[#64748B] font-medium px-4">Hold near scanner for entry</p>
                                        </div>
                                        {/* Decorative ticket notch effects */}
                                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#EBF4F6] rounded-full z-20"></div>
                                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#EBF4F6] rounded-full z-20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header Section */}
                        <div className="mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
                            <div className="flex flex-col gap-8 mb-12">
                                <div className="flex justify-between items-center w-full">
                                    <div className="hidden lg:block">
                                        <Link to={`/user/event/${event.id}`} state={{ event }} className="inline-flex items-center gap-2 text-[#09637E]/60 hover:text-[#09637E] font-bold text-[10px] uppercase tracking-[0.2em] transition-colors group">
                                            <BsArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
                                            Return to Details
                                        </Link>
                                    </div>

                                    <div className="hidden lg:block">
                                        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/50 shadow-sm">
                                            <span className="text-[#09637E]/40 text-[10px] font-black uppercase tracking-widest">01 Selection</span>
                                            <span className="text-[#09637E]/20 text-xs">•</span>
                                            <span className="text-[#09637E] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-[#09637E] rounded-full animate-pulse"></span>
                                                02 Payment
                                            </span>
                                            <span className="text-[#09637E]/20 text-xs">•</span>
                                            <span className="text-[#09637E]/40 text-[10px] font-black uppercase tracking-widest">03 Confirmation</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center pt-4">
                                    <h1 className="text-6xl md:text-8xl xl:text-9xl font-serif-premium italic text-[#09637E] relative inline-block drop-shadow-sm">
                                        Secure Checkout
                                        <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-[#09637E]/20 rounded-full"></div>
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left: Payment Form (7 Cols) */}
                            <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                                {/* We wrap the existing PaymentMethod component but we might want to style its container if it wasn't already styled.
                                    Since PaymentMethod has its own container styling, we just place it here.
                                    To make it look 'premium', we rely on the clean white look it already has, ensuring it sits well against the background. */}
                                <div className="h-full transform transition-all hover:scale-[1.005] duration-500">
                                    <PaymentMethod
                                        onConfirm={handleConfirmPayment}
                                        isProcessing={isProcessing}
                                        isFreeCheckout={isFreeCheckout}
                                    />
                                </div>
                            </div>

                            {/* Right: Summary Card (5 Cols) */}
                            <div className="lg:col-span-4 lg:sticky lg:top-32 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                                <div className="transform transition-all hover:translate-y-[-5px] duration-500">
                                    <CheckoutOrderSummary
                                        event={event}
                                        quantity={quantity}
                                        category={selectedCategory}
                                        ticketSelection={location?.state?.ticketSelection || {}}
                                        selectedTicketDay={selectedTicketDay}
                                        serviceChargePercent={normalizedServiceChargePercent}
                                    />
                                </div>

                                {/* Trust Badges / Extra Info */}
                                <div className="mt-8 mx-auto w-fit flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3 text-[#09637E]">
                                        <BsCheckCircleFill size={14} className="text-[#09637E]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Bank-Level Security</span>
                                    </div>
                                    <p className="text-[9px] text-center max-w-[200px] leading-relaxed">
                                        Your transaction is encrypted. We do not store your full card details.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default EventCheckout;
