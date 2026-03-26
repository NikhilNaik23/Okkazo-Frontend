import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { BsArrowLeft, BsCalendarEvent, BsGeoAlt, BsDownload, BsShare, BsClock } from 'react-icons/bs';
import { motion } from 'framer-motion';
import { fetchWithAuth } from '../../../utils/apiHandler';
import { refreshAccessToken } from '../../../store/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const formatDate = (iso) => {
    if (!iso) return 'Date TBA';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Date TBA';
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
};

const formatTimeRange = (startAt, endAt) => {
    const start = startAt ? new Date(startAt) : null;
    const end = endAt ? new Date(endAt) : null;
    if (!start || Number.isNaN(start.getTime())) return 'Time TBA';

    const startText = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    if (!end || Number.isNaN(end.getTime())) return startText;
    const endText = end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${startText} - ${endText}`;
};

const TicketDetails = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleGetDirections = () => {
        if (ticket?.lat && ticket?.lng) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${ticket.lat},${ticket.lng}`, '_blank');
        } else {
            // Fallback to searching by location name if coords missing
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket?.location || '')}`, '_blank');
        }
    };

    useEffect(() => {
        let active = true;

        const loadTicket = async () => {
            setLoading(true);

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/tickets/my/${encodeURIComponent(id)}`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!active) return;

            if (!response.ok || !data?.success || !data?.data) {
                setTicket(null);
                setLoading(false);
                return;
            }

            const raw = data.data;
            const tierLabel = Array.isArray(raw?.tickets?.tiers) && raw.tickets.tiers.length > 0
                ? raw.tickets.tiers.map((tier) => `${tier.name} x${tier.noOfTickets}`).join(', ')
                : 'General Admission';

            const qrPayload = raw?.qrToken || raw?.qrPayload || JSON.stringify({
                ticketId: raw?.ticketId,
                eventId: raw?.eventId,
                eventTitle: raw?.eventTitle,
            });

            const normalizedTicket = {
                id: raw?.ticketId,
                title: raw?.eventTitle || 'Event Ticket',
                date: formatDate(raw?.schedule?.startAt),
                time: formatTimeRange(raw?.schedule?.startAt, raw?.schedule?.endAt),
                location: raw?.venue?.locationName || 'Venue TBA',
                image: raw?.eventBanner?.url || 'https://images.unsplash.com/photo-1459749411177-3c2ea04d1a52?q=80&w=2070&auto=format&fit=crop',
                ticketType: tierLabel,
                price: `₹${Number(raw?.tickets?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                orderId: raw?.ticketId,
                attendeeName: 'Ticket Holder',
                lat: Number(raw?.venue?.latitude),
                lng: Number(raw?.venue?.longitude),
                qrPayload,
                quantity: Number(raw?.tickets?.noOfTickets || 0),
            };

            setTicket(normalizedTicket);
            setLoading(false);
        };

        loadTicket();

        return () => {
            active = false;
        };
    }, [dispatch, id]);

    const qrUrl = ticket?.qrPayload
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qrPayload)}`
        : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#09637E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-[#EBF4F6] flex flex-col items-center justify-center p-8 text-[#09637E]">
                <h2 className="text-3xl font-serif-premium mb-4">Ticket Not Found</h2>
                <Link to="/user/my-events" className="text-lg underline">Return to My Events</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EBF4F6] text-[#09637E] font-sans px-6 py-12 md:px-12 md:py-20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#7AB2B2]/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#09637E]/10 blur-[100px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10 pt-4">
                {/* Back Button */}
                <Link to="/user/my-events" className="inline-flex items-center gap-2 text-[#09637E]/60 hover:text-[#09637E] transition-colors mb-8 group">
                    <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to Events</span>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">

                    {/* Left Column: Ticket Visual */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        {/* Ticket Card Container */}
                        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden relative border border-[#09637E]/10">
                            {/* Gradient Overlay for texture */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-10" />

                            {/* Ticket Header Image */}
                            <div className="h-64 relative">
                                <img src={ticket.image} alt={ticket.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] to-transparent opacity-90" />
                                <div className="absolute bottom-0 left-0 p-8 w-full">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 inline-block border border-white/20">
                                        {ticket.ticketType}
                                    </span>
                                    <h1 className="text-4xl md:text-5xl font-serif-premium italic text-white leading-none mb-2">{ticket.title}</h1>
                                </div>
                            </div>

                            {/* Tear Line */}
                            <div className="relative h-8 bg-[#EBF4F6] -mx-4 flex items-center justify-between">
                                <div className="w-8 h-8 rounded-full bg-[#EBF4F6] -ml-4" />
                                <div className="border-t-2 border-dashed border-[#09637E]/20 w-full" />
                                <div className="w-8 h-8 rounded-full bg-[#EBF4F6] -mr-4" />
                            </div>

                            {/* Ticket Body: QR and Details */}
                            <div className="bg-white p-8 pt-4 pb-12 flex flex-col items-center text-center relative">
                                <div className="mb-8 p-4 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(9,99,126,0.15)] border border-[#09637E]/5">
                                    {qrUrl ? (
                                        <img src={qrUrl} alt="Ticket QR" className="w-[180px] h-[180px]" />
                                    ) : null}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-2">Scan at Entry</p>
                                <p className="text-sm font-bold text-[#09637E]">{ticket.attendeeName}</p>
                                <p className="text-xs text-[#09637E]/60 mt-1">Order ID: {ticket.orderId}</p>
                                <p className="text-xs text-[#09637E]/60 mt-1">Tickets: {ticket.quantity}</p>
                            </div>
                        </div>

                        {/* Floating Action Buttons (Mobile friendly) */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                            <button className="bg-[#09637E] text-white p-4 rounded-full shadow-lg hover:scanale-110 transition-transform hover:shadow-xl group" title="Download Ticket">
                                <BsDownload size={20} className="group-hover:animate-bounce" />
                            </button>
                            <button className="bg-white text-[#09637E] p-4 rounded-full shadow-lg hover:scale-110 transition-transform hover:shadow-xl border border-[#09637E]/10" title="Share Ticket">
                                <BsShare size={20} />
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Column: Event Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="pt-8 md:pt-12"
                    >
                        <h2 className="text-2xl font-serif-premium text-[#09637E] mb-8 italic">Event Details</h2>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#09637E] group-hover:scale-110 transition-transform duration-300 border border-[#09637E]/10">
                                    <BsCalendarEvent size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-1">Date & Time</p>
                                    <p className="text-xl font-bold text-[#09637E]">{ticket.date}</p>
                                    <p className="text-sm text-[#09637E]/70 mt-1">{ticket.time} (Entry starts 1hr prior)</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#09637E] group-hover:scale-110 transition-transform duration-300 border border-[#09637E]/10">
                                    <BsGeoAlt size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-1">Location</p>
                                    <p className="text-xl font-bold text-[#09637E]">{ticket.location}</p>
                                    <div className="mt-3 h-32 w-full md:w-80 bg-gray-200 rounded-2xl overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" alt="Map Preview" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button
                                                onClick={handleGetDirections}
                                                className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-transform text-[#09637E]"
                                            >
                                                Get Directions
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#09637E] group-hover:scale-110 transition-transform duration-300 border border-[#09637E]/10">
                                    <BsClock size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-1">Duration</p>
                                    <p className="text-lg font-bold text-[#09637E]">approx. 4 Hours</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-white rounded-3xl border border-[#09637E]/10 shadow-sm">
                            <h3 className="text-lg font-bold text-[#09637E] mb-2">Important Notes</h3>
                            <ul className="list-disc list-inside text-sm text-[#09637E]/70 space-y-2">
                                <li>Please carry a valid government ID.</li>
                                <li>Gates close 30 minutes after the event starts.</li>
                                <li>No outside food or beverages allowed.</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
