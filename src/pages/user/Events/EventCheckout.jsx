import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { BsArrowLeft, BsCheckCircleFill, BsQrCode, BsCalendarEvent } from "react-icons/bs";
import { toast, Toaster } from "react-hot-toast";
import PaymentMethod from "../../../components/Forms/Checkout/PaymentMethod";
import CheckoutOrderSummary from "../../../components/Forms/Checkout/CheckoutOrderSummary";
import { allEvents, popularEvents } from "../../../data/eventsData";

const EventCheckout = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const quantity = parseInt(queryParams.get('qty')) || 1;
    const selectedCategory = queryParams.get("category") || "General";

    const [event, setEvent] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const combinedEvents = [...allEvents, ...popularEvents];
        const foundEvent = combinedEvents.find(e => e.id === parseInt(eventId));
        if (foundEvent) {
            // Update event price if category is selected
            if (foundEvent.categories) {
                const cat = foundEvent.categories.find(c => c.name === selectedCategory);
                if (cat) foundEvent.price = cat.price;
            }
            setEvent(foundEvent);
        } else {
            toast.error("Event not found");
            navigate("/user/dashboard");
        }
    }, [eventId, navigate, selectedCategory]);

    const handleConfirmPayment = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Processing payment...',
                success: 'Payment successful! Generating your tickets...',
                error: 'Payment failed. Please try again.',
            }
        ).then(() => {
            setIsSuccess(true);
        });
    };

    if (!event && !isSuccess) return null;

    // Helper to parse price reliably
    const getNumericPrice = (p) => {
        if (!p || typeof p !== 'string') return 0;
        const numeric = p.replace(/[^0-9.]/g, '');
        return numeric ? parseFloat(numeric) : 0;
    };

    const ticketPrice = getNumericPrice(event?.price);
    const subtotal = ticketPrice * quantity;
    const totalFees = subtotal === 0 ? 0 : 622.50; // Service + Processing fees waived for free events

    // Generate QR Content
    const qrContent = `Booking for ${event?.title}. Tickets: ${quantity}. Ref: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrContent)}`;

    return (
        <div className="min-h-screen bg-[#EBF4F6] font-sans text-[#09637E] selection:bg-[#088395] selection:text-white overflow-x-hidden relative">
            <Toaster position="top-center" toastOptions={{ className: 'font-bold font-serif-premium' }} />

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
                                        <BsCheckCircleFill className="text-[#088395] drop-shadow-lg" size={48} />
                                    </div>
                                    <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Payment Successful</p>
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
                                                    <p className="text-2xl font-black text-[#09637E]">{quantity} <span className="text-sm text-[#94A3B8] font-medium">x {selectedCategory}</span></p>
                                                </div>
                                                <div className="bg-[#F8FAFC] p-5 rounded-3xl border border-[#E2E8F0]">
                                                    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Total Paid</p>
                                                    <p className="text-2xl font-black text-[#088395]">₹{(subtotal + totalFees).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate("/user/dashboard")}
                                            className="w-full group relative overflow-hidden bg-[#09637E] text-white px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#09637E]/20 hover:-translate-y-1 active:scale-95"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                Back to Dashboard <BsArrowLeft className="rotate-180 transition-transform group-hover:translate-x-1" size={16} />
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
                                        <Link to={`/user/event/${event.id}`} className="inline-flex items-center gap-2 text-[#09637E]/60 hover:text-[#09637E] font-bold text-[10px] uppercase tracking-[0.2em] transition-colors group">
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
                                    <PaymentMethod onConfirm={handleConfirmPayment} />
                                </div>
                            </div>

                            {/* Right: Summary Card (5 Cols) */}
                            <div className="lg:col-span-4 lg:sticky lg:top-32 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                                <div className="transform transition-all hover:translate-y-[-5px] duration-500">
                                    <CheckoutOrderSummary event={event} quantity={quantity} category={selectedCategory} />
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
