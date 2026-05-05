import React, { useState } from "react";
import { useParams, useNavigate, Outlet, useLocation, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
    BsArrowLeft,
    BsWallet2,
    BsChatDots,
    BsReceipt,
    BsShieldCheck,
    BsInfoCircle
} from "react-icons/bs";
import {
    Volume2, Users, Briefcase
} from 'lucide-react';
import { toast } from "react-hot-toast";
import {
    acceptVendorEventRequest,
    fetchVendorEventRequestDetails,
    fetchVendorEventRequests,
    lockVendorEventServicePrice,
    rejectVendorEventRequest,
    selectSelectedVendorEventRequest,
    selectSelectedVendorEventRequestError,
    selectSelectedVendorEventRequestStatus,
} from '../../store/slices/vendorEventsSlice';
import {
    fetchMyVendorServices,
    fetchPublicServiceById,
    selectMyServices,
    selectPublicServicesById,
    selectPublicServiceStatusById,
} from '../../store/slices/vendorSlice';
import { refreshAccessToken, selectUser } from '../../store/slices/authSlice';
import { ensureEventDmConversation, fetchConversationMessages } from '../../utils/chatApi';

const decodeJwtPayload = (token) => {
    try {
        const parts = String(token || '').split('.');
        if (parts.length < 2) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const json = atob(padded);
        return JSON.parse(json);
    } catch {
        return null;
    }
};

const resolveAuthId = ({ user, accessToken }) => {
    const fromUser = String(user?.authId || '').trim();
    if (fromUser) return fromUser;
    const payload = decodeJwtPayload(accessToken);
    return String(payload?.authId || payload?.sub || payload?.userId || payload?.id || '').trim();
};

const formatEventDateLabel = (value) => {
    if (!value) return 'TBD';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'TBD';
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatPublicDayLabel = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return 'TBD';

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const d = new Date(`${raw}T12:00:00`);
        if (!Number.isNaN(d.getTime())) {
            return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
        }
    }

    return formatEventDateLabel(raw);
};

const getInclusiveDayCount = (startAt, endAt) => {
    if (!startAt || !endAt) return 0;

    const start = new Date(startAt);
    const end = new Date(endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

    const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    if (endUtc < startUtc) return 0;

    return Math.floor((endUtc - startUtc) / (24 * 60 * 60 * 1000)) + 1;
};

const formatEventDateRangeLabel = (startAt, endAt) => {
    const startLabel = formatEventDateLabel(startAt);
    const endLabel = formatEventDateLabel(endAt || startAt);

    if (startLabel === 'TBD' && endLabel === 'TBD') return 'TBD';
    if (startLabel === 'TBD') return endLabel;
    if (endLabel === 'TBD') return startLabel;
    if (startLabel === endLabel) return startLabel;
    return `${startLabel} - ${endLabel}`;
};

const formatEventTimeLabel = ({ eventTime, scheduleStartAt, scheduleEndAt }) => {
    const rawTime = String(eventTime || '').trim();
    if (rawTime) {
        const match = rawTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
        if (match) {
            const hh = Number(match[1]);
            const mm = match[2];
            const ampm = hh >= 12 ? 'PM' : 'AM';
            const hour12 = ((hh + 11) % 12) + 1;
            return `${hour12}:${mm} ${ampm}`;
        }
        return rawTime;
    }

    const start = scheduleStartAt ? new Date(scheduleStartAt) : null;
    const end = scheduleEndAt ? new Date(scheduleEndAt) : null;

    if (start && !Number.isNaN(start.getTime())) {
        const startText = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toUpperCase();
        if (end && !Number.isNaN(end.getTime())) {
            const endText = end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toUpperCase();
            return `${startText} - ${endText}`;
        }
        return startText;
    }

    return 'TBD';
};

const parseGoogleMapsLatLng = (rawUrl) => {
    if (!rawUrl) return null;
    try {
        const url = new URL(String(rawUrl));
        const atMatch = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
        if (atMatch) return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) };

        const qParam = url.searchParams.get('q') || url.searchParams.get('query');
        if (qParam) {
            const qMatch = qParam.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
            if (qMatch) return { lat: Number(qMatch[1]), lng: Number(qMatch[2]) };
        }
    } catch {
        return null;
    }
    return null;
};

const isVenueService = (item, serviceDoc) => {
    const tokens = [
        item?.service,
        item?.serviceName,
        item?.serviceCategory,
        serviceDoc?.categoryId,
        serviceDoc?.serviceCategory,
        serviceDoc?.category,
    ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

    return tokens.some((value) => value.includes('venue') || value.includes('location'));
};

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
    const currentUserAuthId = resolveAuthId({ user, accessToken });

    // Determine active tab based on current path
    // path format: /vendor/event/:id/:tab
    const currentPath = location.pathname.split('/').pop();
    const activeSubTab = ['details', 'budget', 'chat', 'bill'].includes(currentPath) ? currentPath : 'details';

    const [activeChannel, setActiveChannel] = useState("vendors"); // Default to vendors to show broadcast
    const [chatInput, setChatInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const selected = useSelector(selectSelectedVendorEventRequest);
    const selectedStatus = useSelector(selectSelectedVendorEventRequestStatus);
    const selectedError = useSelector(selectSelectedVendorEventRequestError);
    const myServices = useSelector(selectMyServices);
    const publicServicesById = useSelector(selectPublicServicesById);
    const publicServiceStatusById = useSelector(selectPublicServiceStatusById);

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectSubmitting, setRejectSubmitting] = useState(false);
    const [vendorChatUnreadCount, setVendorChatUnreadCount] = useState(0);

    const managerAuthId = selected?.managerProfile?.authId != null
        ? String(selected.managerProfile.authId).trim()
        : String(selected?.assignedManagerId || '').trim();

    const chatParticipantAuthIds = React.useMemo(() => {
        const ids = new Set();

        const managerId = String(managerAuthId || '').trim();
        if (managerId) ids.add(managerId);

        const coordinatorProfiles = Array.isArray(selected?.coreStaffProfiles) ? selected.coreStaffProfiles : [];
        for (const profile of coordinatorProfiles) {
            const authId = String(profile?.authId || '').trim();
            if (authId) ids.add(authId);
        }

        return Array.from(ids);
    }, [managerAuthId, selected?.coreStaffProfiles]);

    React.useEffect(() => {
        if (id) {
            dispatch(fetchVendorEventRequestDetails({ eventId: id }));
        }
        dispatch(fetchMyVendorServices());
    }, [dispatch, id]);

    React.useEffect(() => {
        if (!id) return;

        const timer = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            dispatch(fetchVendorEventRequestDetails({ eventId: id }));
        }, 10000);

        return () => clearInterval(timer);
    }, [dispatch, id]);

    React.useEffect(() => {
        const vendorItems = Array.isArray(selected?.vendorItems) ? selected.vendorItems : [];
        if (vendorItems.length === 0) return;

        const idsToFetch = vendorItems
            .map((v) => String(v?.serviceId || '').trim())
            .filter(Boolean)
            .filter((serviceId) => !myServices.some((s) => String(s?._id) === String(serviceId)))
            .filter((serviceId) => !publicServicesById?.[serviceId])
            .filter((serviceId) => {
                const st = publicServiceStatusById?.[serviceId];
                return st !== 'loading' && st !== 'succeeded';
            });

        if (idsToFetch.length === 0) return;
        idsToFetch.forEach((serviceId) => dispatch(fetchPublicServiceById({ serviceId })));
    }, [dispatch, myServices, publicServiceStatusById, publicServicesById, selected]);

    React.useEffect(() => {
        if (selectedStatus === 'failed' && selectedError) {
            toast.error(String(selectedError));
        }
    }, [selectedStatus, selectedError]);

    React.useEffect(() => {
        const eventId = String(id || '').trim();
        const viewerAuthId = String(currentUserAuthId || '').trim();
        const participantIds = Array.isArray(chatParticipantAuthIds)
            ? chatParticipantAuthIds.map((value) => String(value || '').trim()).filter(Boolean)
            : [];

        if (!eventId || !viewerAuthId || participantIds.length === 0 || selected?.summary?.summaryStatus !== 'ACCEPTED') {
            setVendorChatUnreadCount(0);
            return;
        }

        if (activeSubTab === 'chat') {
            setVendorChatUnreadCount(0);
            return;
        }

        let cancelled = false;

        const loadUnread = async () => {
            try {
                const unreadCounts = await Promise.all(participantIds.map(async (participantAuthId) => {
                    try {
                        const convo = await ensureEventDmConversation({
                            eventId,
                            otherAuthId: participantAuthId,
                            dispatch,
                            refreshAction: refreshAccessToken,
                        });

                        const convoId = String(convo?._id || convo?.id || '').trim();
                        if (!convoId) return 0;

                        const msgs = await fetchConversationMessages({
                            conversationId: convoId,
                            limit: 200,
                            dispatch,
                            refreshAction: refreshAccessToken,
                        });

                        return (Array.isArray(msgs) ? msgs : []).filter((m) => {
                            const sender = String(m?.senderAuthId || m?.senderId || '').trim();
                            if (!sender || sender === viewerAuthId) return false;
                            if (sender !== participantAuthId) return false;
                            const readBy = Array.isArray(m?.readBy) ? m.readBy.map((v) => String(v || '').trim()) : [];
                            return !readBy.includes(viewerAuthId);
                        }).length;
                    } catch {
                        return 0;
                    }
                }));

                if (cancelled) return;

                const unread = unreadCounts.reduce((sum, value) => sum + Number(value || 0), 0);
                setVendorChatUnreadCount(unread);
            } catch {
                if (!cancelled) setVendorChatUnreadCount(0);
            }
        };

        loadUnread();
        const timer = setInterval(loadUnread, 20000);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [id, currentUserAuthId, chatParticipantAuthIds, activeSubTab, dispatch, selected?.summary?.summaryStatus]);

    const handleShareInvoice = () => {
        setActiveChannel("internal");
        navigate(`../chat`);
        toast.success("Redirecting to Internal Team chat...");
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAccept = async () => {
        try {
            await dispatch(acceptVendorEventRequest({ eventId: id })).unwrap();
            toast.success("Event request accepted!");
            dispatch(fetchVendorEventRequests());
            dispatch(fetchVendorEventRequestDetails({ eventId: id }));
            navigate("details");
        } catch (e) {
            toast.error(String(e || 'Failed to accept request'));
        }
    };

    const handleReject = async () => {
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleLockServicePrice = async (serviceRowId, quotePrice, priceHikeReason = '') => {
        const target = tempServices.find((s) => s.id === serviceRowId);
        if (!target) {
            throw new Error('Service not found');
        }

        const service = String(target.serviceKey || target.name || '').trim();
        if (!service) {
            throw new Error('Service is required');
        }

        const result = await dispatch(
            lockVendorEventServicePrice({
                eventId: id,
                service,
                price: Number(quotePrice),
                priceHikeReason,
            })
        ).unwrap();

        const quotedPriceRaw = Number(result?.quotedPrice);
        const quotedPrice = Number.isFinite(quotedPriceRaw) && quotedPriceRaw > 0
            ? quotedPriceRaw
            : Number(quotePrice);

        const commissionPercentRaw = Number(result?.commissionPercent);
        const commissionPercent = Number.isFinite(commissionPercentRaw) && commissionPercentRaw >= 0
            ? commissionPercentRaw
            : 0;

        const commissionAmountRaw = Number(result?.commissionAmount);
        const commissionAmount = Number.isFinite(commissionAmountRaw) && commissionAmountRaw >= 0
            ? commissionAmountRaw
            : 0;

        const lockedPriceRaw = Number(result?.lockedPrice);
        const lockedPrice = Number.isFinite(lockedPriceRaw) && lockedPriceRaw > 0
            ? lockedPriceRaw
            : Number(quotePrice);

        const applyLockedPrice = (row) => {
            if (row.id !== serviceRowId) return row;
            return {
                ...row,
                price: lockedPrice,
                quotedPrice,
                totalPrice: lockedPrice,
                commissionPercent,
                commissionAmount,
                priceHikeReason: String(result?.priceHikeReason || '').trim() || null,
                isLocked: true,
            };
        };

        setTempServices((prev) => prev.map(applyLockedPrice));
        setServices((prev) => prev.map(applyLockedPrice));

        dispatch(fetchVendorEventRequestDetails({ eventId: id }));

        return {
            lockedPrice,
            quotedPrice,
            commissionPercent,
            commissionAmount,
        };
    };

    const handleConfirmReject = async () => {
        const trimmed = String(rejectReason || '').trim();
        if (!trimmed) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            setRejectSubmitting(true);
            await dispatch(rejectVendorEventRequest({ eventId: id, reason: trimmed })).unwrap();
            toast.error('Event request rejected.');
            setShowRejectModal(false);
            dispatch(fetchVendorEventRequests());
            dispatch(fetchVendorEventRequestDetails({ eventId: id }));
            navigate('details');
        } catch (e) {
            toast.error(String(e || 'Failed to reject request'));
        } finally {
            setRejectSubmitting(false);
        }
    };

    const [event, setEvent] = useState({
        id: id || null,
        title: "Event",
        status: "PENDING",
        vendorSummaryStatus: 'PENDING',
        date: "TBD",
        time: "TBD",
        pax: 0,
        category: "Event",
        location: "—",
        locationLat: null,
        locationLng: null,
        locationMapsUrl: null,
        client: {
            name: "—",
            org: "—",
            email: "—",
            phone: "—",
            avatar: "https://i.pravatar.cc/150?u=client"
        },
        requestedServices: [],
        description: "",
        timeline: [],
        amountReceived: 0,
        ledger: [],
        isPublic: false,
        publicDayCount: 0,
        publicTicketDayAllocations: [],
        chat: {
            manager: [],
            client: []
        }
    });

    const [services, setServices] = useState([]);
    const [tempServices, setTempServices] = useState([]);

    React.useEffect(() => {
        if (!selected || String(selected.eventId || '') !== String(id || '')) return;

        const planning = selected.planning || {};
        const vendorItems = Array.isArray(selected.vendorItems) ? selected.vendorItems : [];
        const summaryStatus = selected.summary?.summaryStatus;

        const categoryRaw = String(planning?.category || '').trim().toLowerCase();
        const isPublicEvent = categoryRaw === 'public';
        const publicDayCount = isPublicEvent
            ? getInclusiveDayCount(planning?.schedule?.startAt, planning?.schedule?.endAt)
            : 0;
        const publicDateRangeLabel = isPublicEvent
            ? formatEventDateRangeLabel(planning?.schedule?.startAt, planning?.schedule?.endAt)
            : null;

        const totalTickets = Number(planning?.tickets?.totalTickets || 0);
        const guestCount = Number(planning?.guestCount || 0);
        const paxCount = isPublicEvent
            ? (totalTickets > 0 ? totalTickets : guestCount)
            : guestCount;

        const fallbackPublicTiers = Array.isArray(planning?.tickets?.tiers)
            ? planning.tickets.tiers
                .map((tier) => {
                    const tierName = String(tier?.tierName || tier?.name || '').trim();
                    const tierCountRaw = Number(tier?.ticketCount ?? tier?.quantity ?? 0);
                    const tierCount = Number.isFinite(tierCountRaw) && tierCountRaw > 0 ? tierCountRaw : 0;
                    if (!tierName || tierCount <= 0) return null;
                    return { tierName, ticketCount: tierCount };
                })
                .filter(Boolean)
            : [];

        const parsedDayAllocationRows = (() => {
            const arraySource = [
                planning?.tickets?.dayWiseAllocations,
                planning?.tickets?.ticketDayWiseAllocations,
                planning?.ticketDayWiseAllocations,
            ].find(Array.isArray);

            if (Array.isArray(arraySource) && arraySource.length > 0) {
                return arraySource;
            }

            const dayAllocationMap = planning?.ticketDayAllocations && typeof planning.ticketDayAllocations === 'object'
                ? planning.ticketDayAllocations
                : null;
            const dayTierMap = planning?.ticketDayTierAllocations && typeof planning.ticketDayTierAllocations === 'object'
                ? planning.ticketDayTierAllocations
                : null;

            if (!dayAllocationMap || Object.keys(dayAllocationMap).length === 0) {
                return [];
            }

            return Object.keys(dayAllocationMap)
                .sort()
                .map((dayKey) => {
                    const tierObj = dayTierMap && dayTierMap[dayKey] && typeof dayTierMap[dayKey] === 'object'
                        ? dayTierMap[dayKey]
                        : null;

                    const tierBreakdown = tierObj
                        ? Object.entries(tierObj)
                            .map(([tierName, count]) => {
                                const tierCountRaw = Number(count || 0);
                                const tierCount = Number.isFinite(tierCountRaw) && tierCountRaw > 0 ? tierCountRaw : 0;
                                const safeName = String(tierName || '').trim();
                                if (!safeName || tierCount <= 0) return null;
                                return { tierName: safeName, ticketCount: tierCount };
                            })
                            .filter(Boolean)
                        : [];

                    return {
                        day: dayKey,
                        ticketCount: Number(dayAllocationMap?.[dayKey] || 0),
                        tierBreakdown,
                    };
                });
        })();

        const publicTicketDayAllocationsFromRows = isPublicEvent && parsedDayAllocationRows.length > 0
            ? parsedDayAllocationRows
                .map((row) => {
                    const day = String(row?.day || '').trim();
                    const ticketCountRaw = Number(row?.ticketCount || 0);
                    const ticketCount = Number.isFinite(ticketCountRaw) && ticketCountRaw > 0 ? ticketCountRaw : 0;

                    const tierBreakdown = Array.isArray(row?.tierBreakdown) && row.tierBreakdown.length > 0
                        ? row.tierBreakdown
                            .map((tier) => {
                                const tierName = String(tier?.tierName || '').trim();
                                const tierCountRaw = Number(tier?.ticketCount || 0);
                                const tierCount = Number.isFinite(tierCountRaw) && tierCountRaw > 0 ? tierCountRaw : 0;
                                if (!tierName || tierCount <= 0) return null;
                                return { tierName, ticketCount: tierCount };
                            })
                            .filter(Boolean)
                        : fallbackPublicTiers;

                    if (!day && ticketCount <= 0 && tierBreakdown.length === 0) return null;

                    return {
                        day,
                        dayLabel: formatPublicDayLabel(day),
                        ticketCount,
                        tiers: tierBreakdown,
                    };
                })
                .filter(Boolean)
            : [];

        const fallbackTotalTickets = (() => {
            const byTotal = Number(totalTickets);
            if (Number.isFinite(byTotal) && byTotal > 0) return byTotal;
            const byTiers = fallbackPublicTiers.reduce((sum, tier) => sum + Number(tier?.ticketCount || 0), 0);
            return Number.isFinite(byTiers) && byTiers > 0 ? byTiers : 0;
        })();

        const publicTicketDayAllocations = publicTicketDayAllocationsFromRows.length > 0
            ? publicTicketDayAllocationsFromRows
            : (isPublicEvent
                ? [{
                    day: null,
                    dayLabel: publicDateRangeLabel || 'TBD',
                    ticketCount: fallbackTotalTickets,
                    tiers: fallbackPublicTiers,
                }]
                : []);

        const planningStatus = String(planning?.status || '').trim();
        const nextStatus = planningStatus
            || (summaryStatus === 'ACCEPTED'
                ? 'CONFIRMED'
                : summaryStatus === 'REJECTED'
                    ? 'REJECTED'
                    : 'PENDING');

        const manager = selected.managerProfile || null;

        const toNumber = (v) => {
            if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
            if (typeof v === 'string') {
                const cleaned = v.replace(/[^0-9.-]/g, '');
                const num = Number(cleaned);
                return Number.isFinite(num) ? num : 0;
            }
            return 0;
        };

        const toOptionalNumber = (v) => {
            if (v == null || v === '') return null;
            const num = Number(v);
            return Number.isFinite(num) ? num : null;
        };

        const receivedAmount = Number(
            selected?.summary?.amountReceived ??
            selected?.summary?.receivedAmount ??
            selected?.summary?.amountPaid ??
            selected?.summary?.paidAmount ??
            selected?.payment?.amountReceived ??
            selected?.payment?.receivedAmount ??
            selected?.payments?.amountReceived ??
            selected?.payments?.receivedAmount ??
            0
        ) || 0;

        const rawLedger =
            selected?.ledgerEntries ??
            selected?.ledger?.entries ??
            selected?.ledger ??
            selected?.payments?.entries ??
            selected?.payments?.transactions ??
            selected?.payments ??
            selected?.transactions ??
            selected?.paymentHistory ??
            [];

        const rawLedgerEntries = Array.isArray(rawLedger)
            ? rawLedger
            : Array.isArray(rawLedger?.entries)
                ? rawLedger.entries
                : [];

        const normalizedLedger = rawLedgerEntries
            .map((e, idx) => {
                const dateRaw = e?.date || e?.createdAt || e?.created_at || e?.timestamp || e?.time;
                const when = dateRaw ? new Date(dateRaw) : null;
                const dateLabel = when && !Number.isNaN(when.getTime())
                    ? when.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';

                const desc =
                    e?.description ||
                    e?.note ||
                    e?.remarks ||
                    e?.message ||
                    e?.purpose ||
                    e?.event ||
                    e?.title ||
                    'Transaction';

                const status = (e?.status || e?.state || e?.paymentStatus || '').toString() || '—';

                const hasExplicitSignedAmount = Object.prototype.hasOwnProperty.call(e || {}, 'signedAmount');
                const signedAmountRaw = hasExplicitSignedAmount ? toNumber(e?.signedAmount) : null;
                const amountInrRaw = toNumber(e?.amountInr ?? e?.amountReceived ?? e?.paidAmount);
                const paiseRaw = Number(e?.payoutAmountPaise || 0);
                const amountFromPaise = Number.isFinite(paiseRaw) && paiseRaw > 0
                    ? Number((paiseRaw / 100).toFixed(2))
                    : 0;
                const fallbackAmountRaw = toNumber(e?.amount ?? e?.value ?? e?.total ?? e?.receivedAmount ?? 0);

                const amountNum = hasExplicitSignedAmount
                    ? Number(signedAmountRaw || 0)
                    : (amountInrRaw || amountFromPaise || fallbackAmountRaw || 0);

                const typeRaw = (e?.type || e?.direction || e?.txnType || '').toString().toLowerCase();
                const isDebit = amountNum < 0 || typeRaw.includes('debit') || typeRaw.includes('fee') || typeRaw.includes('charge');
                const signedAmount = isDebit ? -Math.abs(amountNum) : Math.abs(amountNum);
                const payoutModeRaw = String(e?.payoutMode || e?.mode || '').trim().toUpperCase();
                const payoutMode = payoutModeRaw === 'RAZORPAY' ? 'RAZORPAY' : (payoutModeRaw === 'DEMO' ? 'DEMO' : null);

                return {
                    id: String(e?.id || e?._id || e?.transactionId || e?.txnId || idx + 1),
                    dateLabel,
                    description: String(desc),
                    status: String(status),
                    type: isDebit ? 'Debit' : 'Credit',
                    signedAmount,
                    payoutMode,
                    eventId: String(e?.eventId || selected?.eventId || id || '').trim() || null,
                    eventTitle: String(e?.eventTitle || planning?.eventTitle || '').trim() || null,
                };
            })
            .filter((x) => x && (x.description || x.signedAmount !== 0));

        const previousRows = Array.isArray(tempServices) && tempServices.length > 0
            ? tempServices
            : (Array.isArray(services) ? services : []);

        const previousByServiceCompositeKey = new Map(
            previousRows.map((row) => {
                const key = `${String(row?.serviceKey || '').trim().toLowerCase()}::${String(row?.serviceId || '').trim()}`;
                return [key, row];
            })
        );

        const hikeRateRaw = Number(selected?.pricingConfig?.vendorHikeRate);
        const vendorHikeRate = Number.isFinite(hikeRateRaw) && hikeRateRaw >= 1
            ? hikeRateRaw
            : 1.25;

        const nextRequestedServices = vendorItems.map((v, idx) => {
            const serviceId = String(v?.serviceId || '').trim();
            const serviceKey = String(v?.service || '').trim();
            const previousRow = previousByServiceCompositeKey.get(`${serviceKey.toLowerCase()}::${serviceId}`)
                || previousByServiceCompositeKey.get(`${serviceKey.toLowerCase()}::`)
                || null;
            const serviceDoc =
                myServices.find((s) => String(s?._id) === String(serviceId)) ||
                publicServicesById?.[serviceId] ||
                null;

            const resolvedServiceName =
                String(serviceDoc?.name || '').trim() ||
                String(v?.serviceName || '').trim() ||
                String(v?.service || '').trim() ||
                'Service';

            const resolvedServiceTier =
                String(serviceDoc?.tier || '').trim() ||
                String(v?.serviceTier || '').trim() ||
                null;

            const min = Number(v?.servicePrice?.min || 0);
            const max = Number(v?.servicePrice?.max || 0);
            const explicitLocked = Boolean(v?.priceLocked);
            const isLocked = explicitLocked;

            const previousLockedPrice = Number(previousRow?.totalPrice || previousRow?.price || 0);

            const quotedPriceRaw = Number(v?.vendorQuotedPrice);
            const previousQuotedPrice = Number(previousRow?.quotedPrice || 0);
            let quotedPrice = Number.isFinite(quotedPriceRaw) && quotedPriceRaw > 0
                ? quotedPriceRaw
                : (Number.isFinite(previousQuotedPrice) && previousQuotedPrice > 0 ? previousQuotedPrice : 0);

            const commissionAmountRaw = Number(v?.commissionAmount);
            const previousCommissionAmount = Number(previousRow?.commissionAmount || 0);
            let commissionAmount = Number.isFinite(commissionAmountRaw) && commissionAmountRaw >= 0
                ? commissionAmountRaw
                : (Number.isFinite(previousCommissionAmount) && previousCommissionAmount >= 0 ? previousCommissionAmount : 0);

            const commissionPercentRaw = Number(v?.commissionPercent);
            const previousCommissionPercent = Number(previousRow?.commissionPercent || 0);
            let commissionPercent = Number.isFinite(commissionPercentRaw) && commissionPercentRaw >= 0
                ? commissionPercentRaw
                : (Number.isFinite(previousCommissionPercent) && previousCommissionPercent >= 0 ? previousCommissionPercent : 0);

            let lockedPrice = 0;
            if (quotedPrice > 0) {
                lockedPrice = Number(quotedPrice.toFixed(2));
            } else if (Number.isFinite(previousLockedPrice) && previousLockedPrice > 0) {
                lockedPrice = previousLockedPrice;
            } else if (min > 0 && min === max) {
                // Legacy fallback for older rows where lock used to overwrite min/max.
                lockedPrice = min;
            }

            if ((!quotedPrice || quotedPrice <= 0) && lockedPrice > 0) {
                quotedPrice = lockedPrice;
            }

            if ((commissionAmount <= 0 || !Number.isFinite(commissionAmount)) && lockedPrice > 0 && quotedPrice > 0) {
                if (commissionPercent > 0) {
                    commissionAmount = Number(((quotedPrice * commissionPercent) / 100).toFixed(2));
                } else {
                    // Legacy fallback for older additive records.
                    commissionAmount = Math.max(0, lockedPrice - quotedPrice);
                }
            }

            if ((commissionPercent <= 0 || !Number.isFinite(commissionPercent)) && quotedPrice > 0 && commissionAmount > 0) {
                commissionPercent = Number(((commissionAmount / quotedPrice) * 100).toFixed(2));
            }

            const totalPrice = isLocked
                ? (lockedPrice > 0 ? lockedPrice : quotedPrice)
                : 0;

            const quoteCap = min > 0 && max > min
                ? Number((Math.min(max, min * vendorHikeRate)).toFixed(2))
                : max;
            const defaultQuotePrice = min > 0 ? min : Number(serviceDoc?.price || 0);

            const qtyRaw = Number(v?.pricingQuantity);
            const qty = Number.isFinite(qtyRaw) && qtyRaw > 0
                ? qtyRaw
                : (Number(previousRow?.qty || 1) || 1);

            return {
                id: idx + 1,
                serviceKey,
                serviceId,
                name: resolvedServiceName,
                serviceName: resolvedServiceName,
                serviceTier: resolvedServiceTier,
                details: v?.status === 'REJECTED'
                    ? `Rejected: ${v?.rejectionReason || 'No reason provided'}`
                    : (serviceDoc?.description || 'Service request for this event.'),
                price: isLocked ? totalPrice : (quotedPrice > 0 ? quotedPrice : defaultQuotePrice),
                quotedPrice,
                totalPrice,
                commissionPercent,
                commissionAmount,
                priceHikeReason: String(v?.priceHikeReason || '').trim() || null,
                minBudget: min,
                maxBudget: quoteCap > 0 ? quoteCap : max,
                vendorHikeRate,
                basePrice: Number(serviceDoc?.price || 0),
                qty,
                isLocked,
                fullService: serviceDoc,
            };
        });

        const acceptedVenue = vendorItems.find((v) => {
            const status = String(v?.status || '').trim().toUpperCase();
            if (status !== 'ACCEPTED') return false;
            const serviceId = String(v?.serviceId || '').trim();
            const serviceDoc =
                myServices.find((s) => String(s?._id) === String(serviceId)) ||
                publicServicesById?.[serviceId] ||
                null;
            return isVenueService(v, serviceDoc);
        });

        const resolveVenueLocation = () => {
            if (!acceptedVenue) return null;
            const serviceId = String(acceptedVenue?.serviceId || '').trim();
            const serviceDoc =
                myServices.find((s) => String(s?._id) === String(serviceId)) ||
                publicServicesById?.[serviceId] ||
                null;

            const locationName = String(
                serviceDoc?.details?.location ||
                serviceDoc?.location ||
                acceptedVenue?.serviceLocation ||
                acceptedVenue?.location ||
                ''
            ).trim();

            let lat = toOptionalNumber(
                serviceDoc?.details?.locationLat ??
                serviceDoc?.details?.lat ??
                acceptedVenue?.locationLat ??
                acceptedVenue?.lat ??
                acceptedVenue?.latitude
            );
            let lng = toOptionalNumber(
                serviceDoc?.details?.locationLng ??
                serviceDoc?.details?.lng ??
                acceptedVenue?.locationLng ??
                acceptedVenue?.lng ??
                acceptedVenue?.longitude
            );

            const mapsUrl = String(
                serviceDoc?.details?.locationMapsUrl ||
                serviceDoc?.details?.mapsUrl ||
                acceptedVenue?.locationMapsUrl ||
                acceptedVenue?.mapsUrl ||
                ''
            ).trim();

            if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && mapsUrl) {
                const coords = parseGoogleMapsLatLng(mapsUrl);
                if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
                    lat = coords.lat;
                    lng = coords.lng;
                }
            }

            const fallbackLabel = Number.isFinite(lat) && Number.isFinite(lng)
                ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                : '';

            return {
                name: locationName || fallbackLabel,
                lat,
                lng,
                mapsUrl: mapsUrl || null,
            };
        };

        const venueLocation = resolveVenueLocation();

        setEvent((prev) => {
            const timeLabel = formatEventTimeLabel({
                eventTime: planning.eventTime,
                scheduleStartAt: planning.schedule?.startAt,
                scheduleEndAt: planning.schedule?.endAt,
            });
            const nextEvent = {
                ...prev,
                id: selected.eventId || prev.id,
                title: planning.eventTitle || prev.title,
                status: nextStatus,
                vendorSummaryStatus: String(summaryStatus || prev.vendorSummaryStatus || 'PENDING').trim().toUpperCase(),
                date: isPublicEvent
                    ? (publicDateRangeLabel || prev.date)
                    : (formatEventDateLabel(planning.eventDate || planning.schedule?.startAt) || prev.date),
                time: timeLabel !== 'TBD' ? timeLabel : prev.time,
                pax: paxCount > 0 ? paxCount : prev.pax,
                isPublic: isPublicEvent,
                publicDayCount,
                publicTicketDayAllocations,
                category: planning.eventType || planning.category || prev.category,
                location: venueLocation?.name || planning.location?.name || prev.location,
                locationLat: venueLocation?.lat ?? prev.locationLat,
                locationLng: venueLocation?.lng ?? prev.locationLng,
                locationMapsUrl: venueLocation?.mapsUrl ?? prev.locationMapsUrl,
                description: planning.eventDescription || prev.description,
                amountReceived: receivedAmount,
                ledger: normalizedLedger,
                requestedServices: nextRequestedServices.length > 0 ? nextRequestedServices : prev.requestedServices,
                client: manager
                    ? {
                        name: manager?.name || manager?.username || 'Assigned Manager',
                        org: 'Assigned Manager',
                        email: manager?.email || '—',
                        phone: manager?.phone || '—',
                        avatar: manager?.avatar || 'https://i.pravatar.cc/150?u=manager'
                    }
                    : prev.client,
            };

            const nextServices = nextRequestedServices.length > 0 ? nextRequestedServices : nextEvent.requestedServices;
            setServices(nextServices);
            setTempServices(nextServices);

            return nextEvent;
        });
    }, [selected, id, myServices, publicServicesById]);

    const handleUpdateQuotes = () => {
        setServices([...tempServices]);
        toast.success("Quotes updated and applied to invoice!");
    };

    const handleTempServiceChange = (id, field, value) => {
        const nextValue = parseFloat(value) || 0;
        setTempServices(prev => prev.map((s) => {
            if (s.id !== id) return s;
            if (field === 'price') {
                return {
                    ...s,
                    price: nextValue,
                    quotedPrice: nextValue,
                };
            }
            return { ...s, [field]: nextValue };
        }));
    };

    const calculateSubtotal = () => services.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.18;
    const total = subtotal + tax;


    /* --- NEW CHAT DATA & LOGIC --- */

    // Group Chats for Sidebar
    const groupChats = [
        { id: 'general', name: 'All Stakeholders', count: 45, icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'vendors', name: 'All Vendors', count: 15, icon: Volume2, color: 'text-teal-600', bg: 'bg-teal-50' }
    ];

    const chatParticipants = React.useMemo(() => {
        const rows = [];

        if (selected?.managerProfile?.name) {
            rows.push({ name: selected.managerProfile.name, type: 'team', online: true });
        }

        if (event?.client?.name && event.client.name !== '—') {
            rows.push({ name: event.client.name, type: 'client', online: true });
        }

        const coordinators = Array.isArray(selected?.coreStaffProfiles) ? selected.coreStaffProfiles : [];
        coordinators.forEach((staff) => {
            const name = String(staff?.name || '').trim();
            if (!name) return;
            rows.push({ name, role: staff?.assignedRole || 'Coordinator', type: 'team', online: true });
        });

        return rows;
    }, [selected?.managerProfile?.name, selected?.coreStaffProfiles, event?.client?.name]);

    const admins = chatParticipants.filter(p => p.type === 'admin');
    const clients = chatParticipants.filter(p => p.type === 'client');
    const team = chatParticipants.filter(p => p.type === 'team');
    const vendors = chatParticipants.filter(p => p.type === 'vendor');

    const [messages, setMessages] = useState([]);

    const handleSend = () => {
        if (!chatInput.trim()) return;

        const isBroadcast = activeChannel === 'vendors';
        const tempId = Date.now();

        const newMessage = {
            id: tempId,
            sender: "You",
            role: "Vendor",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: chatInput,
            channel: activeChannel,
            badge: 'bg-teal-100 text-teal-700',
            isBroadcast: isBroadcast,
            status: 'sending',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);
        setChatInput('');

        // Simulate status updates
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m));
        }, 1000);
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'delivered' } : m));
        }, 2500);
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'read' } : m));
        }, 4000);

    };

    const handleDeleteMessage = (messageId) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        toast.success("Message deleted");
    };

    const handleEditMessage = (messageId, newText) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, isEdited: true } : m));
        toast.success("Message updated");
    };

    // Shared Context to pass to lower components
    const contextValue = {
        event,
        services,
        tempServices,
        subtotal,
        tax,
        total,
        handleAccept,
        handleReject,
        handleLockServicePrice,
        handleUpdateQuotes,
        handleTempServiceChange,
        handlePrint,
        handleShareInvoice,
        // Chat
        activeChannel,
        setActiveChannel,
        chatInput,
        setChatInput,
        searchTerm,
        setSearchTerm,
        groupChats,
        admins,
        clients,
        team,
        vendors,
        messages,
        handleSend,
        handleDeleteMessage,
        handleEditMessage,
    };

    const normalizedEventStatus = String(event?.status || '').trim().toUpperCase().replace(/_/g, ' ');
    const normalizedVendorSummaryStatus = String(event?.vendorSummaryStatus || '').trim().toUpperCase().replace(/_/g, ' ');
    const isPendingEventStatus = normalizedEventStatus === 'PENDING' || normalizedEventStatus === 'PENDING APPROVAL';
    const isConfirmedEventStatus = normalizedEventStatus === 'CONFIRMED';
    const isRejectedEventStatus = normalizedEventStatus === 'REJECTED';
    const canShowPostAcceptTabs = isConfirmedEventStatus || normalizedVendorSummaryStatus === 'ACCEPTED';

    const showSkeleton = (selectedStatus === 'loading' || selectedStatus === 'idle') && !selected;
    if (showSkeleton) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0 overflow-x-hidden p-10 pt-28">
                <div className="animate-pulse space-y-6">
                    <div className="h-14 rounded-2xl bg-white border border-[#708aa0]/10" />
                    <div className="h-130 rounded-3xl bg-white border border-[#708aa0]/10" />
                </div>
            </div>
        );
    }

    if (selectedStatus === 'failed' && !selected) {
        return (
            <div className="p-10 pt-28">
                <div className="bg-white border border-red-100 rounded-3xl p-8">
                    <h2 className="text-lg font-black text-red-600 mb-2">Unable to load event details</h2>
                    <p className="text-sm text-[#708aa0] mb-5">The backend request failed. Please retry.</p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchVendorEventRequestDetails({ eventId: id }))}
                        className="px-5 py-2.5 rounded-xl bg-[#0b2d49] text-white text-[10px] font-black uppercase tracking-widest"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0 overflow-x-hidden">
            {showRejectModal && (
                <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-white/20 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-black tracking-wide text-[#0b2d49]">Reject Event Request</h3>
                            <p className="text-xs text-[#708aa0] font-medium mt-1">
                                Please share a short reason. This will be visible to the team.
                            </p>
                        </div>

                        <div className="p-6">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#708aa0] mb-2">
                                Reason
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="e.g. Not available on requested date / Budget mismatch / Insufficient details"
                                className="w-full rounded-2xl bg-[#f6f8f9] border border-[#708aa0]/10 px-4 py-3 text-sm text-[#0b2d49] placeholder:text-[#708aa0]/60 focus:outline-none focus:ring-2 focus:ring-[#0b2d49]/10"
                                autoFocus
                            />
                            <div className="mt-2 text-[10px] font-bold text-[#708aa0] text-right">
                                {String(rejectReason || '').length}/500
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => !rejectSubmitting && setShowRejectModal(false)}
                                className="px-5 py-3 rounded-2xl border border-[#708aa0]/20 text-[10px] font-black uppercase tracking-widest text-[#708aa0] hover:text-[#0b2d49] hover:border-[#0b2d49]/20 transition-all"
                                disabled={rejectSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReject}
                                className="px-6 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-60"
                                disabled={rejectSubmitting || !String(rejectReason || '').trim()}
                            >
                                {rejectSubmitting ? 'Rejecting…' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header Navigation */}
            <div className="fixed top-0 right-0 left-72 z-30 bg-[#e9eff1]/90 backdrop-blur-md px-10 pt-6 pb-0 flex items-center justify-between gap-6 transition-all border-b border-white/20">
                <div className="flex-1 flex items-center bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-[#708aa0]/10 shadow-sm overflow-x-auto min-w-0">
                    <button
                        onClick={() => navigate("/vendor/booked-events")}
                        className="flex items-center gap-3 px-4 py-3 text-[#708aa0] hover:text-[#0b2d49] font-black uppercase text-[10px] tracking-widest transition-all group border-r border-[#708aa0]/10 mr-1 shrink-0"
                    >
                        <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-[#0b2d49] group-hover:text-white transition-all">
                            <BsArrowLeft size={16} />
                        </div>
                    </button>

                    {canShowPostAcceptTabs && (
                        <>
                            <div className="flex flex-1 items-center justify-start gap-1 px-1">
                                {[
                                    { id: "details", label: "Details", icon: <BsInfoCircle /> },
                                    { id: "budget", label: "Budget", icon: <BsWallet2 /> },
                                    { id: "bill", label: "Bill Generator", icon: <BsReceipt /> },
                                ].map((tab) => (
                                    <NavLink
                                        key={tab.id}
                                        to={tab.id}
                                        className={({ isActive }) => `flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 relative whitespace-nowrap ${isActive
                                            ? "bg-[#0b2d49] text-white shadow-xl shadow-[#0b2d49]/20"
                                            : "text-[#708aa0] hover:text-[#0b2d49] hover:bg-white"
                                            }`}
                                    >
                                        <span className={activeSubTab === tab.id ? "text-[#d7a444]" : ""}>{tab.icon}</span>
                                        {tab.label}
                                    </NavLink>
                                ))}
                            </div>

                            <NavLink
                                to="chat"
                                className={({ isActive }) => `flex items-center justify-center p-3 rounded-xl transition-all relative shrink-0 ml-4 mr-2 ${isActive
                                    ? "bg-[#0b2d49] text-white shadow-xl shadow-[#0b2d49]/20"
                                    : "text-[#708aa0] hover:text-[#0b2d49] hover:bg-white"
                                    }`}
                            >

                                <BsChatDots size={20} />
                                {vendorChatUnreadCount > 0 ? (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-3.5 h-3.5 px-0.5 rounded-full text-[8px] font-black shadow-lg bg-red-500 text-white">
                                        {vendorChatUnreadCount > 99 ? '99+' : vendorChatUnreadCount}
                                    </span>
                                ) : null}
                            </NavLink>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${isPendingEventStatus
                        ? 'bg-[#f3ddb1] text-[#d7a444]'
                        : isRejectedEventStatus
                            ? 'bg-red-50 text-red-600'
                            : 'bg-green-50 text-green-600'
                        }`}>
                        {event.status}
                    </span>
                    <div className="p-2 bg-white rounded-xl shadow-sm text-[#708aa0]">
                        <BsShieldCheck size={20} />
                    </div>
                </div>
            </div>
            <div className="px-10 pt-28">
                <Outlet context={contextValue} />
            </div>
        </div>
    );
};

export default EventDetails;
