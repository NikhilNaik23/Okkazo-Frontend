import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { BsArrowLeft, BsCheckCircleFill, BsQrCode, BsCalendarEvent  } from "react-icons/bs";
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
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <Toaster position="top-center" />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-12 pb-20">
                {isSuccess ? (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
                            <div className="bg-[#0b2d49] p-10 text-white text-center relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                                        <BsCheckCircleFill className="text-[#d7a444]" size={40} />
                                    </div>
                                    <h2 className="text-4xl font-black mb-2">Booking Confirmed!</h2>
                                    <p className="text-[#f3ddb1] font-medium tracking-wide">Your tickets are ready for the big day.</p>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d7a444]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            </div>

                            <div className="p-10 md:p-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Event Details</p>
                                            <h3 className="text-3xl font-black mb-2">{event.title}</h3>
                                            <p className="text-gray-500 font-medium flex items-center gap-2">
                                                <BsCalendarEvent /> {event.date}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-4">
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Tickets</p>
                                                <p className="text-2xl font-black">{quantity} Units</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Paid</p>
                                                <p className="text-2xl font-black text-[#d7a444]">₹{(subtotal + totalFees).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => navigate("/user/dashboard")}
                                            className="w-full bg-[#0b2d49] text-white px-8 py-5 rounded-[1.5rem] font-bold hover:bg-[#d7a444] transition-all shadow-xl shadow-[#0b2d49]/20 hover:-translate-y-1 active:scale-95 text-lg"
                                        >
                                            Back to Dashboard
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center">
                                        <div className="bg-white p-6 rounded-3xl shadow-sm mb-6">
                                            <img src={qrUrl} alt="Booking QR Code" className="w-48 h-48 md:w-56 md:h-56" />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-tight">Digital Entry Pass</p>
                                        <p className="text-xs text-gray-500 font-medium px-4">Present this QR code at the entrance to scan your <span className="font-bold text-[#0b2d49]">{quantity} tickets</span>.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header Section */}
                        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <Link to={`/user/event/${event.id}`} className="flex items-center gap-2 text-gray-400 hover:text-[#0b2d49] font-bold transition-all group mb-4 w-fit">
                                    <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                    Back to Event Details
                                </Link>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Secure Checkout</h1>
                                <p className="text-gray-500 text-lg">Complete your purchase for <span className="font-bold text-[#0b2d49]">{event.title}</span>.</p>
                            </div>
                            
                            {/* Simple breadcrumb */}
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span className="text-gray-400 line-through">Select Tickets</span>
                                <span className="text-gray-200">/</span>
                                <span className="text-[#d7a444]">Payment</span>
                                <span className="text-gray-200">/</span>
                                <span>Confirmation</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left: Payment Form */}
                            <div className="lg:col-span-2">
                                <PaymentMethod onConfirm={handleConfirmPayment} />
                            </div>

                            {/* Right: Summary Card */}
                            <div>
                                <CheckoutOrderSummary event={event} quantity={quantity} category={selectedCategory} />
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default EventCheckout;
