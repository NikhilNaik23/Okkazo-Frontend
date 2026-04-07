import {
    createOrder,
    verifyPayment,
    fetchPlanningByEventId,
    fetchPlanningVendorSelectionByEventId,
    selectPlanningVendorSelectionByEventId,
    fetchPlanningQuoteLatest,
    selectPlanningQuoteLatestByEventId,
    clearPlanningError,
} from '../../../store/slices/planningSlice';
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BsArrowLeft, BsChatDots, BsCheckCircleFill, BsClock, BsSend, BsFileEarmarkZip, BsDownload, BsCircle, BsTicketPerforated, BsPaperclip, BsThreeDotsVertical, BsStar, BsStarFill } from "react-icons/bs";
import { myOrganizedEvents } from "../../../data/myEventsData";
import { toast, Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchPromoteByEventId } from "../../../store/slices/promoteSlice";
import { io as createSocket } from 'socket.io-client';
import { refreshAccessToken, selectUser } from "../../../store/slices/authSlice";
import { fetchWithAuth } from "../../../utils/apiHandler";
import {
    ensureEventConversation,
    ensureEventDmConversation,
    fetchConversationMessages,
    sendConversationMessage,
    markConversationRead,
    updateConversationMessage,
} from "../../../utils/chatApi";
import { CHAT_API_BASE_URL, CHAT_SOCKET_URL } from "../../../utils/chatConfig";
import { extractRichChatMessage, stripRichChatMessage } from "../../../utils/richChat";
import { computeMoneyRangeFromBase, derivePricingDemandFromEvent } from "../../../utils/pricing";

const EVENTS_API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const formatMoneyShort = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return '—';
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
    return `₹${n.toFixed(0)}`;
};

const formatMoneyRangeFromBasePrice = (price, { serviceLabel, guestCount, dayCount } = {}) => {
    const range = computeMoneyRangeFromBase({
        basePrice: price,
        guestCount,
        dayCount,
        serviceLabel,
    });

    const min = Number(range?.min ?? 0);
    const max = Number(range?.max ?? 0);
    if (!Number.isFinite(min) || min <= 0) return '—';

    const fmt = (n) => (n < 10000 ? `₹${Math.round(n)}` : formatMoneyShort(n));
    return `${fmt(min)} – ${fmt(max)}`;
};

const formatMoneyRangeFromMinMax = (minRaw, _maxRaw, { serviceLabel, guestCount, dayCount } = {}) => {
    // For consistency, max is derived as min*1.5 (and multiplied by guestCount when per-attendee).
    return formatMoneyRangeFromBasePrice(minRaw, { serviceLabel, guestCount, dayCount });
};

const normalizeTicketTierName = (tier, idx = 0) => {
    const name = String(tier?.tierName || tier?.name || '').trim();
    return name || `Tier ${idx + 1}`;
};

const normalizeTicketTierCount = (tierLike) => {
    const raw = Number(tierLike?.ticketCount ?? tierLike?.quantity ?? tierLike?.count ?? 0);
    return Number.isFinite(raw) && raw >= 0 ? raw : 0;
};

const normalizeDayKey = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const day = raw.includes('T') ? raw.slice(0, 10) : raw;
    return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : raw;
};

const formatTicketDayLabel = (dayValue) => {
    const key = normalizeDayKey(dayValue);
    if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return key || 'Day';

    const [yy, mm, dd] = key.split('-').map((v) => Number(v));
    const date = new Date(Date.UTC(yy, (mm || 1) - 1, dd || 1));
    if (Number.isNaN(date.getTime())) return key;

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    });
};

const normalizePromotionLabel = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
};

const normalizeGeneratedRevenuePayout = (rawPayout) => {
    if (!rawPayout || typeof rawPayout !== 'object') return null;

    const statusRaw = String(rawPayout?.status || '').trim().toUpperCase();
    const modeRaw = String(rawPayout?.mode || '').trim().toUpperCase();
    const amountPaiseRaw = Number(rawPayout?.amountPaise || 0);

    return {
        status: ['PENDING', 'SUCCESS', 'FAILED'].includes(statusRaw) ? statusRaw : null,
        mode: modeRaw === 'RAZORPAY' ? 'RAZORPAY' : (modeRaw === 'DEMO' ? 'DEMO' : null),
        amountPaise: Number.isFinite(amountPaiseRaw) && amountPaiseRaw > 0 ? Math.round(amountPaiseRaw) : 0,
        currency: String(rawPayout?.currency || 'INR').trim().toUpperCase() || 'INR',
        paidAt: rawPayout?.paidAt || null,
        transactionRef: rawPayout?.transactionRef || null,
    };
};

const toManagerBadge = (name) => {
    const text = String(name || '').trim();
    if (!text) return 'M';

    const managerWithNumber = text.match(/\bmanager\b\s*(\d+)/i);
    if (managerWithNumber) return `M${managerWithNumber[1]}`;

    const firstAlpha = text.match(/[A-Za-z]/);
    const firstLetter = firstAlpha ? firstAlpha[0].toUpperCase() : 'M';
    const number = text.match(/(\d+)/);

    return number ? `${firstLetter}${number[1]}` : firstLetter;
};

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
    const fromToken = String(payload?.authId || payload?.sub || payload?.userId || payload?.id || '').trim();
    return fromToken;
};

const PLANNING_SERVICE_OPTIONS = [
    'Venue',
    'Catering & Drinks',
    'Photography',
    'Videography',
    'Decor & Styling',
    'Entertainment & Artists',
    'Makeup & Grooming',
    'Invitations & Printing',
    'Sound & Lighting',
    'Equipment Rental',
    'Security & Safety',
    'Transportation',
    'Live Streaming & Media',
    'Cake & Desserts',
    'Other',
];

const toServiceKey = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'catering and drinks' || raw === 'catering') return 'catering & drinks';
    return raw;
};

const UserEventManagement = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
    const currentUserId = resolveAuthId({ user, accessToken }) || String(user?.id || user?._id || '').trim();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // "overview" (Command Center), "billing" (Bills & Payment), "chat" (Manager Sync)
    const [chatMessage, setChatMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editInput, setEditInput] = useState('');
    const [managerSyncUnreadCount, setManagerSyncUnreadCount] = useState(0);
    const [managerOnline, setManagerOnline] = useState(false);
    const socketRef = useRef(null);
    const fileInputRef = useRef(null);

    const messagesViewportRef = useRef(null);
    const messagesEndRef = useRef(null);
    const stickToBottomRef = useRef(true);
    const initialScrollDoneRef = useRef(false);

    const handleMessagesScroll = () => {
        const el = messagesViewportRef.current;
        if (!el) return;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        stickToBottomRef.current = distance < 140;
    };

    const scrollToBottom = (behavior = 'auto') => {
        const el = messagesViewportRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    const [expandedAltKeys, setExpandedAltKeys] = useState({});
    const [selectingAltKey, setSelectingAltKey] = useState(null);
    const [lockedAltByService, setLockedAltByService] = useState({});
    const [lockedAltServiceIdByService, setLockedAltServiceIdByService] = useState({});
    const [lockedAltMessageIdByService, setLockedAltMessageIdByService] = useState({});
    const [serviceDraft, setServiceDraft] = useState([]);
    const [pendingServiceToAdd, setPendingServiceToAdd] = useState('');
    const [serviceChangeReason, setServiceChangeReason] = useState('');
    const [serviceChangeSubmitting, setServiceChangeSubmitting] = useState(false);
    const [expandedServicePickerKey, setExpandedServicePickerKey] = useState(null);
    const [serviceAlternativesByKey, setServiceAlternativesByKey] = useState({});
    const [servicePickerSelectKey, setServicePickerSelectKey] = useState(null);
    const [servicePanelLockByService, setServicePanelLockByService] = useState({});

    const lastAltSyncRef = useRef({});

    const pricingDemand = React.useMemo(() => derivePricingDemandFromEvent(event || {}), [event]);

    const latestAltMessageIdByService = React.useMemo(() => {
        const latestByService = {};
        const list = Array.isArray(messages) ? messages : [];

        const toTs = (m) => {
            const raw = m?.createdAt;
            if (raw == null) return null;
            if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
            const t = Date.parse(String(raw));
            return Number.isFinite(t) ? t : null;
        };

        for (let idx = 0; idx < list.length; idx++) {
            const m = list[idx];
            const msgId = String(m?._id || m?.id || '').trim();
            if (!msgId) continue;

            const rich = extractRichChatMessage(m?.text);
            if (!rich || rich.kind !== 'vendorAlternatives') continue;

            const payload = rich.payload && typeof rich.payload === 'object' ? rich.payload : null;
            const serviceKey = toServiceKey(payload?.serviceLabel || payload?.service || payload?.serviceCategory);
            if (!serviceKey) continue;

            const ts = toTs(m);
            const prev = latestByService[serviceKey];
            const shouldReplace = !prev
                || (ts != null && (prev.ts == null || ts > prev.ts))
                || (ts != null && prev.ts != null && ts === prev.ts && idx > prev.idx)
                || (ts == null && prev.ts == null && idx > prev.idx);

            if (shouldReplace) {
                latestByService[serviceKey] = { id: msgId, ts, idx };
            }
        }

        const out = {};
        for (const [k, v] of Object.entries(latestByService)) {
            out[k] = v.id;
        }
        return out;
    }, [messages]);

    const selectVendorForService = async ({ serviceLabel, vendorAuthId, serviceId, price, sourceMessageId = null, selectionScope = 'chat' }) => {
        if (!planningEventId) return;

        try {
            const normalizedServiceId = serviceId != null && String(serviceId).trim() ? String(serviceId).trim() : null;
            const selectionKey = `${serviceLabel}:${vendorAuthId}:${normalizedServiceId || ''}`;
            if (selectionScope === 'service-panel') {
                setServicePickerSelectKey(selectionKey);
            } else {
                setSelectingAltKey(selectionKey);
            }

            const servicePrice = computeMoneyRangeFromBase({
                basePrice: price,
                guestCount: pricingDemand?.attendeeCount,
                dayCount: pricingDemand?.dayCount,
                serviceLabel,
            });

            const res = await fetchWithAuth(
                `${EVENTS_API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(planningEventId))}/vendors`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service: serviceLabel,
                        vendorAuthId,
                        serviceId: normalizedServiceId,
                        status: 'YET_TO_SELECT',
                        rejectionReason: null,
                        alternativeNeeded: false,
                        servicePrice,
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to select vendor');
            }

            dispatch(fetchPlanningVendorSelectionByEventId(String(planningEventId)));
            if (selectionScope === 'chat') {
                const serviceKey = toServiceKey(serviceLabel);
                setLockedAltByService((prev) => ({
                    ...prev,
                    [serviceKey]: String(vendorAuthId || '').trim(),
                }));
                setLockedAltServiceIdByService((prev) => ({
                    ...prev,
                    [serviceKey]: normalizedServiceId,
                }));
                setLockedAltMessageIdByService((prev) => ({
                    ...prev,
                    [serviceKey]: sourceMessageId != null ? String(sourceMessageId).trim() : null,
                }));
            } else {
                const serviceKey = toServiceKey(serviceLabel);
                setServicePanelLockByService((prev) => ({
                    ...prev,
                    [serviceKey]: {
                        vendorAuthId: String(vendorAuthId || '').trim() || null,
                        serviceId: normalizedServiceId,
                    },
                }));
            }
            toast.success('Vendor selected');
        } catch (e) {
            toast.error(e?.message || 'Failed to select vendor');
        } finally {
            if (selectionScope === 'service-panel') {
                setServicePickerSelectKey(null);
            } else {
                setSelectingAltKey(null);
            }
        }
    };

    const fetchServiceAlternatives = async (serviceLabel) => {
        const service = String(serviceLabel || '').trim();
        const serviceKey = toServiceKey(service);
        if (!planningEventId || !serviceKey) return;

        setServiceAlternativesByKey((prev) => ({
            ...prev,
            [serviceKey]: {
                status: 'loading',
                error: null,
                service,
                alternatives: [],
                vendorProfiles: [],
            },
        }));

        try {
            const res = await fetchWithAuth(
                `${EVENTS_API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(planningEventId))}/alternatives?service=${encodeURIComponent(service)}&limit=50`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to load alternatives');
            }

            const payload = json?.data || {};
            setServiceAlternativesByKey((prev) => ({
                ...prev,
                [serviceKey]: {
                    status: 'succeeded',
                    error: null,
                    service,
                    alternatives: Array.isArray(payload?.alternatives) ? payload.alternatives : [],
                    vendorProfiles: Array.isArray(payload?.vendorProfiles) ? payload.vendorProfiles : [],
                },
            }));
        } catch (error) {
            setServiceAlternativesByKey((prev) => ({
                ...prev,
                [serviceKey]: {
                    status: 'failed',
                    error: error?.message || 'Failed to load alternatives',
                    service,
                    alternatives: [],
                    vendorProfiles: [],
                },
            }));
        }
    };

    const toggleServiceVendorPicker = (serviceLabel) => {
        const key = toServiceKey(serviceLabel);
        if (!key) return;

        const nextOpen = expandedServicePickerKey === key ? null : key;
        setExpandedServicePickerKey(nextOpen);
        if (!nextOpen) return;

        const current = serviceAlternativesByKey[key];
        if (!current || current.status === 'failed') {
            fetchServiceAlternatives(serviceLabel);
        }
    };

    const renderRichAlternatives = (msg, isMe) => {
        const rich = extractRichChatMessage(msg?.text);
        if (!rich || rich.kind !== 'vendorAlternatives') return null;

        const payload = rich.payload && typeof rich.payload === 'object' ? rich.payload : null;
        const serviceLabel = String(payload?.serviceLabel || '').trim();
        const options = Array.isArray(payload?.options) ? payload.options : [];
        const radiusKmRaw = Number(payload?.radiusKm);
        const radiusKm = Number.isFinite(radiusKmRaw) && radiusKmRaw > 0 ? radiusKmRaw : null;
        if (!serviceLabel || options.length === 0) return null;

        const normalizeServiceId = (id) => {
            const s = id != null ? String(id).trim() : '';
            return s || null;
        };
        const serviceKey = toServiceKey(serviceLabel);
        const statusForService = (() => {
            const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
            const match = list.find((v) => toServiceKey(v?.service) === serviceKey);
            return String(match?.status || '').trim().toUpperCase();
        })();
        const isRejected = Boolean(statusForService) && statusForService.includes('REJECT');

        const latestIdForService = latestAltMessageIdByService?.[serviceKey] || null;
        const localLockMsgId = lockedAltMessageIdByService?.[serviceKey] != null ? String(lockedAltMessageIdByService[serviceKey]).trim() : null;
        const isLocalLockValid = !latestIdForService ? true : (Boolean(localLockMsgId) && localLockMsgId === latestIdForService);

        const lockedVendorAuthIdLocal = (isRejected || !isLocalLockValid) ? null : (lockedAltByService?.[serviceKey] || null);
        const lockedVendorAuthIdFromStore = (() => {
            const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
            const match = list.find((v) => toServiceKey(v?.service) === serviceKey);
            const status = String(match?.status || '').trim().toUpperCase();
            if (status && status.includes('REJECT')) return null;
            if (match?.alternativeNeeded === true) return null;
            const id = match?.vendorAuthId != null ? String(match.vendorAuthId).trim() : '';
            return id || null;
        })();
        const lockedVendorAuthId = lockedVendorAuthIdLocal || lockedVendorAuthIdFromStore || null;

        const lockedServiceIdFromStore = (() => {
            const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
            const match = list.find((v) => toServiceKey(v?.service) === serviceKey);
            const status = String(match?.status || '').trim().toUpperCase();
            if (status && status.includes('REJECT')) return null;
            if (match?.alternativeNeeded === true) return null;
            return normalizeServiceId(match?.serviceId);
        })();

        const lockedServiceIdLocal = (isRejected || !isLocalLockValid) ? null : (lockedAltServiceIdByService?.[serviceKey] || null);
        const lockedServiceId = lockedServiceIdLocal || lockedServiceIdFromStore || null;

        const formatDistance = (km) => {
            const n = Number(km);
            if (!Number.isFinite(n)) return null;
            if (n < 1) return `${Math.round(n * 1000)} m`;
            return `${n.toFixed(1)} km`;
        };

        const isVenue = serviceKey === 'venue';

        return (
            <div className="space-y-3">
                <div className={`text-sm font-black ${isMe ? 'text-white' : 'text-[#0b2d49]'}`}>Alternative options for {serviceLabel}</div>
                {radiusKm != null && (
                    <div className={`text-xs ${isMe ? 'text-white/70' : 'text-primary/60'}`}>Showing options within {radiusKm} km of the event location</div>
                )}
                <div className="space-y-3">
                    {options.slice(0, 6).map((o) => {
                        const vendorAuthId = String(o?.vendorAuthId || '').trim();
                        const msgId = String(msg?._id || msg?.id || '').trim();
                        const optionServiceId = normalizeServiceId(o?.serviceId);
                        const key = `${msgId}:${serviceLabel}:${vendorAuthId}:${optionServiceId || ''}`;
                        const expanded = Boolean(expandedAltKeys[key]);
                        const selecting = selectingAltKey === `${serviceLabel}:${vendorAuthId}:${optionServiceId || ''}`;
                        const latestId = latestAltMessageIdByService?.[serviceKey] || null;
                        const isLatestForService = !msgId || !latestId ? true : latestId === msgId;
                        const isLocked = Boolean(lockedVendorAuthId);
                        const isSelected = isLocked
                            && vendorAuthId
                            && lockedVendorAuthId === vendorAuthId
                            && (!lockedServiceId || !optionServiceId || lockedServiceId === optionServiceId);
                        const isDisabled = !vendorAuthId || selecting || !isLatestForService || (isLocked && !isSelected);
                        const displayName = isVenue ? (o?.name || o?.businessName || 'Venue') : (o?.businessName || 'Vendor');
                        const displayVendorName = isVenue
                            && o?.businessName
                            && o?.name
                            && String(o.name).trim()
                            && String(o.businessName).trim()
                            && String(o.name).trim() !== String(o.businessName).trim()
                            ? String(o.businessName).trim()
                            : null;
                        const tier = o?.tier ? String(o.tier) : '';
                        const priceText = formatMoneyRangeFromMinMax(o?.priceMin ?? o?.price, o?.priceMax, {
                            serviceLabel,
                            guestCount: pricingDemand?.attendeeCount,
                            dayCount: pricingDemand?.dayCount,
                        });
                        const distanceText = o?.distanceText || formatDistance(o?.distanceKm);
                        const services = Array.isArray(o?.services) ? o.services : [];
                        const showServices = !isVenue && services.length > 0;
                        const showExpandedPanel = expanded;
                        const showVendorSummaryLine = !(showServices && showExpandedPanel);
                        const locationName = (() => {
                            const loc = o?.location;
                            if (!loc) return '';
                            if (typeof loc === 'string') return loc;
                            if (typeof loc === 'object' && typeof loc?.name === 'string') return loc.name;
                            return '';
                        })();

                        return (
                            <div key={key} className="bg-white rounded-2xl border border-gray-100 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-black text-[#0b2d49] truncate">{displayName}</div>
                                        {displayVendorName ? (
                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary/50 mt-1">
                                                {displayVendorName}
                                            </div>
                                        ) : null}
                                        {showVendorSummaryLine && (
                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 mt-1">
                                                {tier ? tier : '—'} {tier ? '• ' : ''}{priceText}
                                            </div>
                                        )}
                                        {distanceText ? (
                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary/50 mt-1">{distanceText} from event</div>
                                        ) : null}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedAltKeys((prev) => ({ ...prev, [key]: !prev[key] }))}
                                            className="px-3 py-2 bg-white border border-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary hover:bg-surface transition-all"
                                        >
                                            Explore
                                        </button>
                                        {isVenue ? (
                                            <button
                                                type="button"
                                                disabled={isDisabled}
                                                onClick={() => selectVendorForService({
                                                    serviceLabel,
                                                    vendorAuthId,
                                                    serviceId: o?.serviceId,
                                                    price: o?.price,
                                                    sourceMessageId: msgId,
                                                })}
                                                className="px-3 py-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-60"
                                            >
                                                {selecting ? 'Selecting…' : (isSelected ? 'Selected' : (isLocked || !isLatestForService ? 'Locked' : 'Select'))}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                {showExpandedPanel && (
                                    <div className="mt-3 text-xs text-primary/70 space-y-1">
                                        {(locationName || o?.country) && (
                                            <div><span className="font-black">Location:</span> {locationName}{o?.country ? `, ${o.country}` : ''}</div>
                                        )}
                                        {distanceText && (
                                            <div><span className="font-black">Distance:</span> {distanceText} from event</div>
                                        )}
                                        {o?.description && (
                                            <div className="text-primary/60">{String(o.description)}</div>
                                        )}

                                        {showServices && (
                                            <div className="pt-2">
                                                <div className="font-black text-primary/80 mb-1 uppercase tracking-widest text-[10px]">Services</div>
                                                <div className="space-y-2">
                                                    {services.slice(0, 10).map((s, idx) => {
                                                        const svcId = s?.serviceId || s?.id || `${idx}`;
                                                        const normalizedSvcId = normalizeServiceId(svcId);
                                                        const svcSelecting = selectingAltKey === `${serviceLabel}:${vendorAuthId}:${normalizedSvcId || ''}`;
                                                        const svcDisabled = !normalizedSvcId || svcSelecting || !isLatestForService || (isLocked && (!isSelected || (lockedServiceId && lockedServiceId !== normalizedSvcId)));
                                                        const svcSelected = isLocked && isSelected && lockedServiceId && lockedServiceId === normalizedSvcId;
                                                        const svcTier = s?.tier ? String(s.tier) : '';
                                                        const svcName = s?.name ? String(s.name) : '';
                                                        const svcPrice = s?.price;
                                                        return (
                                                            <div key={String(normalizedSvcId)} className="flex items-start justify-between gap-2 border border-primary/10 rounded-xl p-3 bg-white">
                                                                <div className="min-w-0">
                                                                    <div className="font-black text-[#0b2d49] truncate">{svcTier || svcName || 'Service'}</div>
                                                                    <div className="text-[9px] font-black uppercase tracking-widest text-primary/60 mt-1">
                                                                        {svcName && svcTier ? `${svcName} • ` : ''}{formatMoneyRangeFromBasePrice(svcPrice, {
                                                                            serviceLabel,
                                                                            guestCount: pricingDemand?.attendeeCount,
                                                                            dayCount: pricingDemand?.dayCount,
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    disabled={svcDisabled}
                                                                    onClick={() => selectVendorForService({
                                                                        serviceLabel,
                                                                        vendorAuthId,
                                                                        serviceId: normalizedSvcId,
                                                                        price: svcPrice,
                                                                        sourceMessageId: msgId,
                                                                    })}
                                                                    className="px-3 py-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-60 shrink-0"
                                                                >
                                                                    {svcSelecting ? 'Selecting…' : (svcSelected ? 'Selected' : (isLocked || !isLatestForService ? 'Locked' : 'Select'))}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {stripRichChatMessage(msg?.text) ? (
                    <div className={`text-xs whitespace-pre-wrap ${isMe ? 'text-white/70' : 'text-primary/60'}`}>{stripRichChatMessage(msg?.text)}</div>
                ) : null}
            </div>
        );
    };

    const resolveChatAssetUrl = (url) => {
        if (!url) return '';
        const s = String(url);
        return s.startsWith('http') ? s : `${CHAT_API_BASE_URL}${s}`;
    };

    const openAttachmentWithAuth = async ({ url, filename, mimetype }) => {
        const resolvedUrl = resolveChatAssetUrl(url);
        if (!resolvedUrl) return;

        // Cloudinary / external URLs should be opened directly (no auth header, avoids CORS preflight issues)
        if (String(url).startsWith('http') && !resolvedUrl.startsWith(CHAT_API_BASE_URL)) {
            window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        try {
            const res = await fetchWithAuth(
                resolvedUrl,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                throw new Error(msg || `Failed to open attachment (${res.status})`);
            }

            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const safeName = String(filename || 'attachment');
            const type = String(mimetype || res.headers.get('content-type') || '').toLowerCase();
            const isPreviewable = type.startsWith('image/') || type.includes('pdf') || type.startsWith('text/');

            if (isPreviewable) {
                const win = window.open(objectUrl, '_blank', 'noopener,noreferrer');
                if (!win) {
                    const a = document.createElement('a');
                    a.href = objectUrl;
                    a.download = safeName;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }
            } else {
                const a = document.createElement('a');
                a.href = objectUrl;
                a.download = safeName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }

            setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        } catch (e) {
            toast.error(e?.message || 'Unable to open attachment');
        }
    };

    useEffect(() => {
        let cancelled = false;

        const toDisplayStatus = (status) => {
            const s = String(status || '').trim();
            if (!s) return '';
            // Keep original spacing/format if backend already returns a readable status.
            return s;
        };

        const load = async () => {
            setLoading(true);
            try {
                // 1) Prefer backend planning fetch (UUID eventId route)
                if (eventId && String(eventId).trim()) {
                    const result = await dispatch(fetchPlanningByEventId(String(eventId).trim()));
                    if (result.meta?.requestStatus === 'fulfilled' && result.payload) {
                        const p = result.payload;
                        const selectedServices = Array.isArray(p?.selectedServices) ? p.selectedServices : [];
                        const selectedVendors = Array.isArray(p?.selectedVendors) ? p.selectedVendors : [];
                        const planningEventId = p?.eventId || eventId;
                        if (planningEventId) {
                            dispatch(fetchPlanningVendorSelectionByEventId(planningEventId));
                        }

                        const mapped = {
                            kind: 'PLANNING',
                            id: planningEventId,
                            title: p?.eventTitle || 'Event',
                            location: p?.location?.name || 'Location TBD',
                            image:
                                p?.eventBanner?.url ||
                                p?.eventBanner ||
                                p?.banner?.url ||
                                p?.banner ||
                                null,
                            status: toDisplayStatus(p?.status || 'PENDING APPROVAL'),
                            listingType: String(p?.category || '').toLowerCase() === 'public' ? 'Public' : 'Private',
                            depositPaid: Boolean(p?.depositPaid || p?.depositPaidAt || p?.depositPaidAmountPaise),
                            depositPaidAmountPaise: Number(p?.depositPaidAmountPaise || 0),
                            depositPaidCurrency: p?.depositPaidCurrency || 'INR',
                            depositPaidAt: p?.depositPaidAt || null,
                            vendorConfirmationPaid: Boolean(p?.vendorConfirmationPaid),
                            vendorConfirmationPaidAmountPaise: Number(p?.vendorConfirmationPaidAmountPaise || 0),
                            remainingPaymentPaid: Boolean(p?.remainingPaymentPaid),
                            remainingPaymentPaidAmountPaise: Number(p?.remainingPaymentPaidAmountPaise || 0),
                            assignedManagerId: p?.assignedManagerId || null,
                            managerProfile: p?.managerProfile || null,
                            guestCount: typeof p?.guestCount === 'number' ? p.guestCount : null,
                            ticketTiers: Array.isArray(p?.tickets?.tiers) ? p.tickets.tiers : [],
                            ticketDayWiseAllocations: Array.isArray(p?.tickets?.dayWiseAllocations) ? p.tickets.dayWiseAllocations : [],
                            eventDescription: typeof p?.eventDescription === 'string' ? p.eventDescription : null,
                            ticketSalesStats: p?.ticketSalesStats && typeof p.ticketSalesStats === 'object'
                                ? p.ticketSalesStats
                                : null,
                            generatedRevenuePayout: normalizeGeneratedRevenuePayout(p?.generatedRevenuePayout),
                            selectedPromotions: (Array.isArray(p?.promotionType) ? p.promotionType : [])
                                .map(normalizePromotionLabel)
                                .filter(Boolean),
                            selectedServices,
                            selectedVendors,
                            vendorSelectionVendors: [],
                            feedback: p?.feedback && typeof p.feedback === 'object'
                                ? p.feedback
                                : { platform: null, vendors: [] },
                        };

                        if (!cancelled) setEvent(mapped);
                        return;
                    }
                }

                // 2) Try Promote event by eventId
                if (eventId && String(eventId).trim()) {
                    const result = await dispatch(fetchPromoteByEventId(String(eventId).trim()));
                    if (result.meta?.requestStatus === 'fulfilled' && result.payload) {
                        const pr = result.payload;
                        const mapped = {
                            kind: 'PROMOTE',
                            id: pr?.eventId || eventId,
                            title: pr?.eventTitle || 'Event',
                            location: pr?.venue?.locationName || 'Location TBD',
                            image: pr?.eventBanner?.url || null,
                            status: toDisplayStatus(pr?.adminDecision?.status || pr?.eventStatus || 'PENDING'),
                            listingType: 'Public',
                            assignedManagerId: pr?.assignedManagerId || null,
                            managerProfile: pr?.managerProfile || null,
                            guestCount: null,
                            ticketTiers: Array.isArray(pr?.tickets?.tiers) ? pr.tickets.tiers : [],
                            ticketDayWiseAllocations: Array.isArray(pr?.tickets?.dayWiseAllocations) ? pr.tickets.dayWiseAllocations : [],
                            eventDescription: typeof pr?.eventDescription === 'string' ? pr.eventDescription : null,
                            ticketSalesStats: pr?.ticketSalesStats && typeof pr.ticketSalesStats === 'object'
                                ? pr.ticketSalesStats
                                : null,
                            generatedRevenuePayout: normalizeGeneratedRevenuePayout(pr?.generatedRevenuePayout),
                            selectedPromotions: [],
                            selectedServices: [],
                            selectedVendors: [],
                            feedback: { platform: null, vendors: [] },
                        };

                        if (!cancelled) setEvent(mapped);
                        return;
                    }
                }

                // 3) Fallback to legacy dummy/local data
                const parsed = Number.isFinite(Number(eventId)) ? parseInt(eventId, 10) : null;
                const foundEvent = myOrganizedEvents.find((e) => e.id === parsed || e.id === eventId);
                if (foundEvent) {
                    if (!cancelled) setEvent(foundEvent);
                    return;
                }

                toast.error("Event not found");
                navigate("/user/my-events");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [dispatch, eventId, navigate]);

    const planningVendorSelection = useSelector((state) => {
        if (!event || String(event?.kind || '').toUpperCase() !== 'PLANNING') return null;
        return selectPlanningVendorSelectionByEventId(state, event?.id);
    });

    const planningEventId = String(event?.kind || '').toUpperCase() === 'PLANNING'
        ? String(event?.id || eventId || '').trim()
        : '';

    const managerDetails = React.useMemo(() => {
        const profile = event?.managerProfile && typeof event.managerProfile === 'object'
            ? event.managerProfile
            : null;

        const name = profile?.name || profile?.fullName || 'Event Manager';
        const role = profile?.assignedRole || profile?.department || profile?.role || 'Manager';
        const email = profile?.email || null;
        const authId = profile?.authId || event?.assignedManagerId || null;
        const phone = profile?.phone || null;

        return {
            name,
            role,
            email,
            authId,
            phone,
            badge: toManagerBadge(name),
        };
    }, [event?.managerProfile, event?.assignedManagerId]);

    const managerAuthId = String(managerDetails?.authId || '').trim();
    const hasManagerAssigned = Boolean(event?.assignedManagerId);

    const ensureActiveUserChatConversation = async (resolvedEventId) => {
        const safeEventId = String(resolvedEventId || '').trim();

        if (managerAuthId) {
            return ensureEventDmConversation({
                eventId: safeEventId,
                otherAuthId: managerAuthId,
                dispatch,
                refreshAction: refreshAccessToken,
            });
        }

        // Fallback for legacy data where manager authId is temporarily unavailable.
        return ensureEventConversation({
            eventId: safeEventId,
            dispatch,
            refreshAction: refreshAccessToken,
        });
    };

    // Roadmap Status Logic
    const normalizedStatus = String(event?.status || '').toUpperCase().replace(/_/g, ' ').trim();
    const isPendingApproval = normalizedStatus === 'PENDING APPROVAL' || normalizedStatus === 'PENDING_APPROVAL';
    const isLive = normalizedStatus === 'LIVE';
    const isRejected = normalizedStatus === 'REJECTED';
    const isCompleted = normalizedStatus === 'COMPLETED';
    const isConfirmedStatus = normalizedStatus === 'CONFIRMED';
    const isVendorPaymentPending = normalizedStatus === 'VENDOR PAYMENT PENDING';
    const isUserCompletedStatus = isCompleted || isVendorPaymentPending;
    const isApproved = normalizedStatus === 'APPROVED';
    const isPrivatePlanningEvent =
        String(event?.kind || '').toUpperCase() === 'PLANNING'
        && String(event?.listingType || '').toLowerCase() === 'private';
    const vendorConfirmationPaid = Boolean(event?.vendorConfirmationPaid);
    const depositPaid = Boolean(event?.depositPaid);
    const remainingPaymentPaid = Boolean(event?.remainingPaymentPaid);

    const quoteLatest = useSelector((state) => selectPlanningQuoteLatestByEventId(state, planningEventId));

    const [confirmFlowActive, setConfirmFlowActive] = useState(false);
    const [confirmFlowError, setConfirmFlowError] = useState(null);
    const [remainingFlowActive, setRemainingFlowActive] = useState(false);
    const [remainingFlowError, setRemainingFlowError] = useState(null);
    const [platformRating, setPlatformRating] = useState(0);
    const [platformReview, setPlatformReview] = useState('');
    const [vendorFeedbackDraft, setVendorFeedbackDraft] = useState([]);
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

    useEffect(() => {
        if (!planningEventId) return;
        const needsVendorConfirmationQuote = isApproved && !vendorConfirmationPaid;
        const needsRemainingPaymentQuote = isPrivatePlanningEvent && isCompleted && !remainingPaymentPaid;
        if (!needsVendorConfirmationQuote && !needsRemainingPaymentQuote) return;
        dispatch(fetchPlanningQuoteLatest(planningEventId));
    }, [dispatch, planningEventId, isApproved, vendorConfirmationPaid, isPrivatePlanningEvent, isCompleted, remainingPaymentPaid]);

    useEffect(() => {
        const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
        const rejectedKeys = list
            .map((v) => {
                const serviceKey = String(v?.service || '').trim().toLowerCase();
                const status = String(v?.status || '').trim().toUpperCase();
                if (!serviceKey) return null;
                if (!status || !status.includes('REJECT')) return null;
                return serviceKey;
            })
            .filter(Boolean);

        if (rejectedKeys.length === 0) return;

        setLockedAltByService((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const k of rejectedKeys) {
                if (next[k] != null) {
                    delete next[k];
                    changed = true;
                }
            }
            return changed ? next : prev;
        });

        setLockedAltServiceIdByService((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const k of rejectedKeys) {
                if (next[k] != null) {
                    delete next[k];
                    changed = true;
                }
            }
            return changed ? next : prev;
        });

        setLockedAltMessageIdByService((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const k of rejectedKeys) {
                if (next[k] != null) {
                    delete next[k];
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [planningVendorSelection]);

    useEffect(() => {
        if (!planningVendorSelection) return;
        setEvent((prev) => {
            if (!prev || String(prev?.kind || '').toUpperCase() !== 'PLANNING') return prev;
            const selectedServices = Array.isArray(planningVendorSelection?.selectedServices)
                ? planningVendorSelection.selectedServices
                : prev.selectedServices;
            const vendors = Array.isArray(planningVendorSelection?.vendors)
                ? planningVendorSelection.vendors
                : prev.vendorSelectionVendors;

            const sameServices = Array.isArray(prev.selectedServices) && Array.isArray(selectedServices)
                ? prev.selectedServices.length === selectedServices.length && prev.selectedServices.every((v, i) => v === selectedServices[i])
                : prev.selectedServices === selectedServices;
            const sameVendors = Array.isArray(prev.vendorSelectionVendors) && Array.isArray(vendors)
                ? prev.vendorSelectionVendors.length === vendors.length
                : prev.vendorSelectionVendors === vendors;

            if (sameServices && sameVendors) return prev;

            return {
                ...prev,
                selectedServices,
                vendorSelectionVendors: vendors,
            };
        });
    }, [planningVendorSelection]);

    useEffect(() => {
        const selectedServices = Array.isArray(planningVendorSelection?.selectedServices)
            ? planningVendorSelection.selectedServices.map((s) => toServiceKey(s)).filter(Boolean)
            : [];
        const rows = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];

        setServicePanelLockByService((prev) => {
            const next = {};
            const selectedSet = new Set(selectedServices);

            rows.forEach((row) => {
                const serviceKey = toServiceKey(row?.service);
                if (!serviceKey || (selectedSet.size > 0 && !selectedSet.has(serviceKey))) return;

                const vendorAuthId = String(row?.vendorAuthId || '').trim() || null;
                if (!vendorAuthId) return;

                const backendServiceIdRaw = row?.serviceId != null ? String(row.serviceId).trim() : '';
                const backendServiceId = backendServiceIdRaw || null;
                const prevLock = prev?.[serviceKey] || null;
                const keptServiceId = (!backendServiceId && prevLock?.vendorAuthId === vendorAuthId)
                    ? (prevLock?.serviceId || null)
                    : null;

                next[serviceKey] = {
                    vendorAuthId,
                    serviceId: backendServiceId || keptServiceId,
                };
            });

            return next;
        });
    }, [planningVendorSelection]);

    useEffect(() => {
        const source = Array.isArray(event?.selectedServices)
            ? event.selectedServices.map((s) => String(s || '').trim()).filter(Boolean)
            : [];

        setServiceDraft((prev) => {
            const prevList = Array.isArray(prev)
                ? prev.map((s) => String(s || '').trim()).filter(Boolean)
                : [];

            const same = prevList.length === source.length && prevList.every((v, i) => v === source[i]);
            return same ? prev : source;
        });
    }, [event?.id, event?.selectedServices]);

    useEffect(() => {
        if (activeTab !== 'chat') return;
        if (!eventId) return;

        let cancelled = false;
        const load = async () => {
            try {
                const convo = await ensureActiveUserChatConversation(eventId);
                const convoId = String(convo?._id || convo?.id || '').trim();
                if (!convoId) throw new Error('Invalid conversation');
                if (cancelled) return;
                setConversationId(convoId);

                const msgs = await fetchConversationMessages({ conversationId: convoId, limit: 200, dispatch, refreshAction: refreshAccessToken });
                if (cancelled) return;
                setMessages(msgs);

                markConversationRead({ conversationId: convoId, dispatch, refreshAction: refreshAccessToken }).catch(() => {});
            } catch (e) {
                toast.error(e?.message || 'Failed to load chat');
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [activeTab, eventId, dispatch, managerAuthId]);

    useEffect(() => {
        if (activeTab !== 'chat') return;
        if (!conversationId || !accessToken) return;

        const socket = createSocket(CHAT_SOCKET_URL, {
            auth: { token: accessToken },
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('conversation:join', { conversationId });
            if (managerAuthId) {
                socket.emit('presence:watch', { authIds: [managerAuthId] });
            }
        });

        socket.on('disconnect', () => {
            setManagerOnline(false);
        });

        socket.on('presence:update', ({ authId, online } = {}) => {
            if (!managerAuthId) return;
            if (String(authId || '').trim() !== managerAuthId) return;
            setManagerOnline(Boolean(online));
        });

        socket.on('message:new', (msg) => {
            const msgId = String(msg?._id || msg?.id || '');
            setMessages((prev) => {
                if (msgId && prev.some((m) => String(m?._id || m?.id || '') === msgId)) return prev;
                return [...prev, msg];
            });

            // If this is an alternatives message, refresh vendor-selection state immediately.
            // Otherwise the UI may still think a previous vendor is selected and show "Locked" until a full refresh.
            try {
                const rich = extractRichChatMessage(msg?.text);
                if (rich?.kind === 'vendorAlternatives') {
                    const payload = rich.payload && typeof rich.payload === 'object' ? rich.payload : null;
                    const serviceKey = String(payload?.serviceLabel || payload?.service || '').trim().toLowerCase();
                    const planningEventId = String(event?.id || eventId || '').trim();
                    if (planningEventId) {
                        const prev = lastAltSyncRef.current || {};
                        const lastMsgId = prev[serviceKey || '_all'] || null;
                        if (!msgId || lastMsgId !== msgId) {
                            lastAltSyncRef.current = { ...prev, [serviceKey || '_all']: msgId || String(Date.now()) };
                            dispatch(fetchPlanningVendorSelectionByEventId(planningEventId));
                        }
                    }
                }
            } catch {
                // ignore
            }

            if (String(msg?.senderAuthId || '') !== currentUserId) {
                socket.emit('messages:read', { conversationId });
                markConversationRead({ conversationId, dispatch, refreshAction: refreshAccessToken }).catch(() => {});
            }
        });

        socket.on('messages:read', ({ conversationId: convoId, authId } = {}) => {
            const readerAuthId = String(authId || '').trim();
            if (!readerAuthId) return;
            if (String(convoId || '').trim() !== String(conversationId)) return;

            setMessages((prev) => prev.map((m) => {
                const sender = String(m?.senderAuthId || '').trim();
                if (!sender || sender === readerAuthId) return m;
                const readBy = Array.isArray(m?.readBy) ? m.readBy.map(String) : [];
                if (readBy.includes(readerAuthId)) return m;
                return { ...m, readBy: [...readBy, readerAuthId] };
            }));
        });

        socket.on('message:updated', (updated) => {
            const updatedId = String(updated?._id || updated?.id || '').trim();
            if (!updatedId) return;
            setMessages((prev) => prev.map((m) => (String(m?._id || m?.id || '') === updatedId ? { ...m, ...updated } : m)));
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [activeTab, conversationId, accessToken, currentUserId, dispatch, eventId, event?.id, managerAuthId]);

    useEffect(() => {
        if (activeTab !== 'chat' || !hasManagerAssigned || !managerAuthId) {
            setManagerOnline(false);
        }
    }, [activeTab, hasManagerAssigned, managerAuthId]);

    useEffect(() => {
        if (activeTab !== 'chat') return;
        if (!conversationId) return;
        stickToBottomRef.current = true;
        initialScrollDoneRef.current = false;
    }, [activeTab, conversationId]);

    useEffect(() => {
        if (activeTab !== 'chat') return;
        if (!conversationId) return;
        if (!messages.length) return;
        if (!stickToBottomRef.current) return;

        const behavior = initialScrollDoneRef.current ? 'smooth' : 'auto';
        requestAnimationFrame(() => scrollToBottom(behavior));
        initialScrollDoneRef.current = true;
    }, [activeTab, conversationId, messages.length]);

    useEffect(() => {
        const resolvedEventId = String(event?.id || eventId || '').trim();
        const viewerAuthId = String(currentUserId || '').trim();

        if (!resolvedEventId || !hasManagerAssigned || !viewerAuthId) {
            setManagerSyncUnreadCount(0);
            return;
        }

        if (activeTab === 'chat') {
            setManagerSyncUnreadCount(0);
            return;
        }

        let cancelled = false;

        const loadUnread = async () => {
            try {
                const convo = await ensureActiveUserChatConversation(resolvedEventId);

                const convoId = String(convo?._id || convo?.id || '').trim();
                if (!convoId) {
                    if (!cancelled) setManagerSyncUnreadCount(0);
                    return;
                }

                const msgs = await fetchConversationMessages({
                    conversationId: convoId,
                    limit: 200,
                    dispatch,
                    refreshAction: refreshAccessToken,
                });

                if (cancelled) return;

                const managerId = String(managerAuthId || '').trim();
                const unread = (Array.isArray(msgs) ? msgs : []).filter((m) => {
                    const sender = String(m?.senderAuthId || m?.senderId || '').trim();
                    if (!sender || sender === viewerAuthId) return false;
                    if (managerId && sender !== managerId) return false;
                    const readBy = Array.isArray(m?.readBy) ? m.readBy.map((v) => String(v || '').trim()) : [];
                    return !readBy.includes(viewerAuthId);
                }).length;

                setManagerSyncUnreadCount(unread);
            } catch {
                if (!cancelled) setManagerSyncUnreadCount(0);
            }
        };

        loadUnread();
        const timer = setInterval(loadUnread, 20000);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [event?.id, eventId, hasManagerAssigned, activeTab, currentUserId, managerAuthId, dispatch]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim() || !conversationId) return;

        try {
            const data = await sendConversationMessage({
                conversationId,
                text: chatMessage.trim(),
                dispatch,
                refreshAction: refreshAccessToken,
            });

            setChatMessage("");

            if (!socketRef.current?.connected) {
                setMessages((prev) => [...prev, data]);
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to send message');
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleStartEdit = (message) => {
        const id = String(message?._id || message?.id || '').trim();
        if (!id) return;
        setEditingMessageId(id);
        setEditInput(String(message?.text || ''));
    };

    const handleSubmitEdit = async (message) => {
        const id = String(message?._id || message?.id || '').trim();
        const text = String(editInput || '').trim();
        if (!id || !text || !conversationId) return;

        try {
            const updated = await updateConversationMessage({
                conversationId,
                messageId: id,
                text,
                dispatch,
                refreshAction: refreshAccessToken,
            });

            setMessages((prev) => prev.map((m) => (String(m?._id || m?.id || '') === id ? { ...m, ...updated } : m)));
            setEditingMessageId(null);
            toast.success('Message edited');
        } catch (error) {
            toast.error(error?.message || 'Failed to edit message');
        }
    };

    const handleFileChange = async (e) => {
        const fileList = Array.from(e.target.files || []);
        if (!fileList.length || !conversationId) return;

        try {
            const data = await sendConversationMessage({
                conversationId,
                text: chatMessage.trim(),
                files: fileList,
                dispatch,
                refreshAction: refreshAccessToken,
            });

            setChatMessage('');

            if (!socketRef.current?.connected) {
                setMessages((prev) => [...prev, data]);
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to upload');
        } finally {
            e.target.value = '';
        }
    };

    const quoteDisplay = React.useMemo(() => {
        const selectionVendors = Array.isArray(planningVendorSelection?.vendors)
            ? planningVendorSelection.vendors
            : [];
        const vendorProfiles = Array.isArray(planningVendorSelection?.vendorProfiles)
            ? planningVendorSelection.vendorProfiles
            : [];

        const selectedFromEvent = Array.isArray(event?.selectedServices)
            ? event.selectedServices.map((s) => String(s || '').trim()).filter(Boolean)
            : [];
        const selectedFromDraft = Array.isArray(serviceDraft)
            ? serviceDraft.map((s) => String(s || '').trim()).filter(Boolean)
            : [];
        const requestedServices = selectedFromDraft.length > 0 ? selectedFromDraft : selectedFromEvent;

        const isDraftDifferent = selectedFromEvent.length === requestedServices.length
            ? !selectedFromEvent.every((v, i) => v === requestedServices[i])
            : true;

        const requestedServiceKeySet = new Set(requestedServices.map((s) => toServiceKey(s)).filter(Boolean));

        const profileByAuthId = new Map();
        for (const profile of vendorProfiles) {
            const keys = [profile?.authId, profile?.vendorAuthId, profile?.userAuthId]
                .map((v) => String(v || '').trim())
                .filter(Boolean);

            for (const key of keys) {
                if (!profileByAuthId.has(key)) {
                    profileByAuthId.set(key, profile);
                }
            }
        }

        const selectionByService = new Map();
        for (const row of selectionVendors) {
            const serviceKey = toServiceKey(row?.service);
            if (!serviceKey) continue;
            if (!selectionByService.has(serviceKey)) selectionByService.set(serviceKey, row);
        }

        const lineItemsFromSelection = requestedServices.map((serviceName, idx) => {
            const serviceKey = toServiceKey(serviceName);
            const row = selectionByService.get(serviceKey) || null;
            const vendorAuthId = String(row?.vendorAuthId || '').trim();
            const profile = vendorAuthId ? profileByAuthId.get(vendorAuthId) : null;

            const quantityNumber = Number(row?.pricingQuantity);
            const hasQuantityNumber = Number.isFinite(quantityNumber) && quantityNumber > 0;
            const quantityUnit = String(row?.pricingQuantityUnit || row?.pricingUnit || '').trim();
            const quantity = hasQuantityNumber
                ? `${quantityNumber}${quantityUnit ? ` ${quantityUnit}` : ''}`
                : (quantityUnit || '—');

            const businessName = String(
                profile?.businessName ||
                profile?.name ||
                row?.businessName ||
                ''
            ).trim() || 'Vendor';

            const quotedInr = Number(row?.vendorQuotedPrice || 0);
            const isLocked = Boolean(row?.priceLocked) && Number.isFinite(quotedInr) && quotedInr > 0;
            const fallbackMinInr = Number(row?.servicePrice?.min || 0);
            const amountPaise = isLocked
                ? Math.max(0, Math.round(quotedInr * 100))
                : (Number.isFinite(fallbackMinInr) && fallbackMinInr > 0 ? Math.round(fallbackMinInr * 100) : 0);

            return {
                id: `${serviceKey || 'service'}:${vendorAuthId || 'vendor'}:${idx}`,
                businessName,
                serviceName: String(row?.serviceName || row?.service || serviceName || 'Service').trim() || 'Service',
                quantity,
                amountPaise,
            };
        });

        const lineItemsFromSnapshot = (Array.isArray(quoteLatest?.items) ? quoteLatest.items : [])
            .filter((item) => {
                if (requestedServiceKeySet.size === 0) return true;
                const itemKey = toServiceKey(item?.service);
                return requestedServiceKeySet.has(itemKey);
            })
            .map((item, idx) => {
                const itemServiceKey = toServiceKey(item?.service);
                const row = selectionByService.get(itemServiceKey) || null;
                const vendorAuthId = String(item?.vendorAuthId || row?.vendorAuthId || '').trim();
                const profile = vendorAuthId ? profileByAuthId.get(vendorAuthId) : null;

                const quantityNumber = Number(row?.pricingQuantity);
                const hasQuantityNumber = Number.isFinite(quantityNumber) && quantityNumber > 0;
                const quantityUnit = String(row?.pricingQuantityUnit || row?.pricingUnit || '').trim();
                const quantity = hasQuantityNumber
                    ? `${quantityNumber}${quantityUnit ? ` ${quantityUnit}` : ''}`
                    : (quantityUnit || '—');

                const quotedInr = Number(row?.vendorQuotedPrice || 0);
                const isLocked = Boolean(row?.priceLocked) && Number.isFinite(quotedInr) && quotedInr > 0;
                const fallbackAmountPaise = Number(
                    item?.clientTotal?.minPaise ??
                    item?.clientTotal?.maxPaise ??
                    item?.vendorTotal?.minPaise ??
                    item?.vendorTotal?.maxPaise ??
                    0
                );
                const amountPaise = isLocked
                    ? Math.max(0, Math.round(quotedInr * 100))
                    : (Number.isFinite(fallbackAmountPaise) && fallbackAmountPaise > 0 ? fallbackAmountPaise : 0);

                return {
                    id: `${vendorAuthId || 'vendor'}:${String(item?.service || 'service')}:${idx}`,
                    businessName: String(profile?.businessName || profile?.name || row?.businessName || '').trim() || 'Vendor',
                    serviceName: String(row?.serviceName || item?.service || 'Service').trim() || 'Service',
                    quantity,
                    amountPaise,
                };
            });

        const promotions = (Array.isArray(quoteLatest?.promotions) ? quoteLatest.promotions : []).map((promotion, idx) => ({
            id: `${String(promotion?.value || 'promotion')}:${idx}`,
            name: String(promotion?.value || '').trim() || 'Promotion',
            feePaise: Number(promotion?.feePaise || 0),
        }));

        const promotionsTotalPaise = promotions.reduce((sum, promo) => {
            const fee = Number(promo?.feePaise || 0);
            return sum + (Number.isFinite(fee) && fee > 0 ? fee : 0);
        }, 0);

        const lineItems = isDraftDifferent
            ? lineItemsFromSelection
            : (lineItemsFromSnapshot.length > 0 ? lineItemsFromSnapshot : lineItemsFromSelection);
        const lineItemsTotalPaise = lineItems.reduce((sum, row) => {
            const amount = Number(row?.amountPaise || 0);
            return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
        }, 0);

        const fallbackGrandTotalPaise = Number(
            quoteLatest?.clientGrandTotal?.minPaise ??
            quoteLatest?.clientGrandTotal?.maxPaise ??
            0
        );

        const grandTotalPaise = lineItemsTotalPaise > 0
            ? Math.max(0, lineItemsTotalPaise) + Math.max(0, promotionsTotalPaise)
            : fallbackGrandTotalPaise;

        return {
            lineItems,
            promotions,
            grandTotalPaise: Number.isFinite(grandTotalPaise) ? grandTotalPaise : 0,
            isDraftDifferent,
        };
    }, [quoteLatest, planningVendorSelection, serviceDraft, event?.selectedServices]);

    const isPromote = String(event?.kind || '').toUpperCase() === 'PROMOTE';
    const isPublicListing = isPromote || String(event?.listingType || '').toLowerCase() === 'public';
    const isPrivateListing = !isPromote && String(event?.listingType || '').toLowerCase() === 'private';

    useEffect(() => {
        if (!isPublicListing) return;

        const resolvedEventId = String(event?.id || eventId || '').trim();
        const eventKind = String(event?.kind || '').trim().toUpperCase();
        if (!resolvedEventId || !eventKind) return;

        let cancelled = false;

        const refreshPublicPayoutState = async () => {
            try {
                if (eventKind === 'PLANNING') {
                    const result = await dispatch(fetchPlanningByEventId(resolvedEventId));
                    if (result.meta?.requestStatus === 'fulfilled' && result.payload && !cancelled) {
                        const p = result.payload;
                        setEvent((prev) => prev ? {
                            ...prev,
                            status: String(p?.status || prev.status || ''),
                            ticketSalesStats: p?.ticketSalesStats && typeof p.ticketSalesStats === 'object'
                                ? p.ticketSalesStats
                                : prev.ticketSalesStats,
                            generatedRevenuePayout: normalizeGeneratedRevenuePayout(p?.generatedRevenuePayout),
                        } : prev);
                    }
                    return;
                }

                if (eventKind === 'PROMOTE') {
                    const result = await dispatch(fetchPromoteByEventId(resolvedEventId));
                    if (result.meta?.requestStatus === 'fulfilled' && result.payload && !cancelled) {
                        const pr = result.payload;
                        setEvent((prev) => prev ? {
                            ...prev,
                            status: String(pr?.adminDecision?.status || pr?.eventStatus || prev.status || ''),
                            ticketSalesStats: pr?.ticketSalesStats && typeof pr.ticketSalesStats === 'object'
                                ? pr.ticketSalesStats
                                : prev.ticketSalesStats,
                            generatedRevenuePayout: normalizeGeneratedRevenuePayout(pr?.generatedRevenuePayout),
                        } : prev);
                    }
                }
            } catch {
                // Silent polling refresh for live payout state.
            }
        };

        refreshPublicPayoutState();
        const intervalId = setInterval(refreshPublicPayoutState, 20000);
        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [dispatch, event?.id, event?.kind, eventId, isPublicListing]);

    const selectedPublicPromotions = (!isPromote && isPublicListing)
        ? (Array.isArray(event?.selectedPromotions) ? event.selectedPromotions : [])
        : [];
    const resolveBannerUrl = (value) => {
        if (!value) return null;
        if (typeof value === 'string') {
            const s = value.trim();
            return s || null;
        }

        if (typeof value === 'object') {
            const candidates = [value.url, value.fileUrl, value.secure_url, value.src, value.image];
            for (const item of candidates) {
                if (typeof item === 'string' && item.trim()) return item.trim();
            }
        }

        return null;
    };
    const publicBannerUrl = isPublicListing ? resolveBannerUrl(event?.image) : null;
    const eventBannerSrc = publicBannerUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80";

    const selectedServices = Array.isArray(event?.selectedServices) ? event.selectedServices : [];
    const selectedServicesDraft = Array.isArray(serviceDraft) && serviceDraft.length > 0
        ? serviceDraft
        : selectedServices;
    const selectedServicesDraftKeySet = new Set(
        selectedServicesDraft.map((s) => toServiceKey(s)).filter(Boolean)
    );
    const selectableServiceOptions = PLANNING_SERVICE_OPTIONS.filter(
        (serviceName) => !selectedServicesDraftKeySet.has(toServiceKey(serviceName))
    );
    const selectedVendors = Array.isArray(event?.selectedVendors) ? event.selectedVendors : [];
    const vendorByService = new Map(
        selectedVendors
            .map((v) => [toServiceKey(v?.service), v])
            .filter(([key]) => Boolean(key))
    );

    const vendorSelectionVendors = Array.isArray(event?.vendorSelectionVendors) ? event.vendorSelectionVendors : [];
    const vendorSelectionByService = new Map(
        vendorSelectionVendors
            .map((v) => [toServiceKey(v?.service), v])
            .filter(([key]) => Boolean(key))
    );
    const vendorProfiles = Array.isArray(planningVendorSelection?.vendorProfiles)
        ? planningVendorSelection.vendorProfiles
        : [];
    const vendorProfileByAuthId = new Map(
        vendorProfiles
            .map((p) => [String(p?.authId || '').trim().toLowerCase(), p])
            .filter(([authId]) => Boolean(authId))
    );

    const optedVendorsForFeedback = React.useMemo(() => {
        const rows = Array.isArray(selectedVendors) ? selectedVendors : [];
        const vendorRows = Array.isArray(vendorSelectionVendors) ? vendorSelectionVendors : [];
        const profileMap = new Map(
            (Array.isArray(vendorProfiles) ? vendorProfiles : [])
                .map((p) => [String(p?.authId || '').trim().toLowerCase(), p])
                .filter(([authId]) => Boolean(authId))
        );
        const vendorRowByService = new Map(
            vendorRows
                .map((row) => [toServiceKey(row?.service), row])
                .filter(([key]) => Boolean(key))
        );

        const seen = new Set();
        const result = [];

        for (const row of rows) {
            const service = String(row?.service || '').trim();
            const vendorAuthId = String(row?.vendorAuthId || '').trim();
            if (!service || !vendorAuthId) continue;

            const key = `${vendorAuthId.toLowerCase()}::${service.toLowerCase()}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const profile = profileMap.get(vendorAuthId.toLowerCase()) || null;
            const vendorRow = vendorRowByService.get(toServiceKey(service)) || null;
            const businessName = String(
                profile?.businessName
                || vendorRow?.businessName
                || vendorRow?.vendorName
                || `${vendorAuthId.slice(0, 8)}...`
            ).trim();

            result.push({
                vendorAuthId,
                service,
                businessName,
            });
        }

        return result;
    }, [selectedVendors, vendorSelectionVendors, vendorProfiles]);

    useEffect(() => {
        if (!event || String(event?.kind || '').toUpperCase() !== 'PLANNING') return;

        const savedPlatform = event?.feedback?.platform && typeof event.feedback.platform === 'object'
            ? event.feedback.platform
            : null;
        const savedVendorFeedback = Array.isArray(event?.feedback?.vendors)
            ? event.feedback.vendors
            : [];
        const savedVendorFeedbackByKey = new Map(
            savedVendorFeedback.map((row) => {
                const vendorAuthId = String(row?.vendorAuthId || '').trim();
                const service = String(row?.service || '').trim();
                const key = `${vendorAuthId.toLowerCase()}::${service.toLowerCase()}`;
                return [key, row];
            })
        );

        setPlatformRating(Number(savedPlatform?.rating || 0));
        setPlatformReview(String(savedPlatform?.review || ''));
        setVendorFeedbackDraft(
            optedVendorsForFeedback.map((vendor) => {
                const key = `${vendor.vendorAuthId.toLowerCase()}::${vendor.service.toLowerCase()}`;
                const existing = savedVendorFeedbackByKey.get(key);
                return {
                    ...vendor,
                    rating: Number(existing?.rating || 0),
                    review: String(existing?.review || ''),
                };
            })
        );
    }, [event?.id, event?.feedback, event?.kind, optedVendorsForFeedback]);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center pt-28">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!event) return null;

    const normalizedTicketTiers = (Array.isArray(event?.ticketTiers) ? event.ticketTiers : []).map((tier, idx) => ({
        name: normalizeTicketTierName(tier, idx),
        ticketCount: normalizeTicketTierCount(tier),
    }));

    const dayWiseTicketRows = (Array.isArray(event?.ticketDayWiseAllocations) ? event.ticketDayWiseAllocations : [])
        .map((row, idx) => {
            const dayKey = normalizeDayKey(row?.day);
            const rowTierBreakdown = (Array.isArray(row?.tierBreakdown) ? row.tierBreakdown : []).map((tier, tierIdx) => ({
                name: normalizeTicketTierName(tier, tierIdx),
                ticketCount: normalizeTicketTierCount(tier),
            }));

            const totalTicketsRaw = Number(row?.ticketCount);
            const totalTickets = Number.isFinite(totalTicketsRaw) && totalTicketsRaw >= 0
                ? totalTicketsRaw
                : rowTierBreakdown.reduce((sum, t) => sum + t.ticketCount, 0);

            return {
                id: `${dayKey || 'day'}-${idx}`,
                dayKey,
                dayLabel: formatTicketDayLabel(dayKey),
                totalTickets,
                tierBreakdown: rowTierBreakdown,
            };
        })
        .sort((a, b) => String(a.dayKey || '').localeCompare(String(b.dayKey || '')));

    const ticketRows = dayWiseTicketRows.length > 0
        ? dayWiseTicketRows
        : (normalizedTicketTiers.length > 0
            ? [{
                id: 'overall',
                dayKey: '',
                dayLabel: 'Overall Allocation',
                totalTickets: normalizedTicketTiers.reduce((sum, t) => sum + t.ticketCount, 0),
                tierBreakdown: normalizedTicketTiers,
            }]
            : []);

    const toSafeCount = (value) => {
        const n = Number(value || 0);
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    };

    const fallbackTotalTickets = ticketRows.reduce((sum, row) => {
        const count = Number(row?.totalTickets || 0);
        return sum + (Number.isFinite(count) && count > 0 ? count : 0);
    }, 0);

    const ticketStats = (isPublicListing && event?.ticketSalesStats && typeof event.ticketSalesStats === 'object')
        ? event.ticketSalesStats
        : null;

    const totalTicketsForKpi = Math.max(
        toSafeCount(ticketStats?.totalTickets),
        toSafeCount(fallbackTotalTickets)
    );
    const ticketsSoldForKpi = Math.min(
        totalTicketsForKpi > 0 ? totalTicketsForKpi : Number.POSITIVE_INFINITY,
        toSafeCount(ticketStats?.ticketsSold)
    );
    const ticketsRemainingForKpi = totalTicketsForKpi > 0
        ? Math.max(0, totalTicketsForKpi - ticketsSoldForKpi)
        : toSafeCount(ticketStats?.ticketsRemaining);

    const conversionPercentRaw = Number(ticketStats?.conversionRatePercent || 0);
    const conversionPercent = Number.isFinite(conversionPercentRaw) && conversionPercentRaw > 0
        ? conversionPercentRaw
        : (totalTicketsForKpi > 0 ? Number(((ticketsSoldForKpi / totalTicketsForKpi) * 100).toFixed(2)) : 0);
    const conversionProgress = Math.max(0, Math.min(100, conversionPercent));

    const grossRevenueInr = Number(ticketStats?.grossRevenueInr || 0);
    const platformFeeInr = Number(ticketStats?.platformFeeInr || 0);
    const totalFeesInrRaw = Number(ticketStats?.totalFeesInr);
    const totalFeesInr = Number.isFinite(totalFeesInrRaw)
        ? totalFeesInrRaw
        : (Number.isFinite(platformFeeInr) ? platformFeeInr : 0);
    const netPnlInr = Number.isFinite(Number(ticketStats?.netPnlInr))
        ? Number(ticketStats?.netPnlInr)
        : Math.max(0, (Number.isFinite(grossRevenueInr) ? grossRevenueInr : 0) - (Number.isFinite(platformFeeInr) ? platformFeeInr : 0));

    const generatedRevenuePayout = event?.generatedRevenuePayout && typeof event.generatedRevenuePayout === 'object'
        ? event.generatedRevenuePayout
        : null;
    const generatedRevenuePayoutStatus = String(generatedRevenuePayout?.status || '').trim().toUpperCase();
    const generatedRevenuePayoutMode = String(generatedRevenuePayout?.mode || '').trim().toUpperCase();
    const generatedRevenuePayoutAmountInr = Number(generatedRevenuePayout?.amountPaise || 0) / 100;
    const generatedRevenuePayoutPaidAtLabel = generatedRevenuePayout?.paidAt
        ? new Date(generatedRevenuePayout.paidAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
        })
        : null;
    const generatedRevenuePayoutTone = generatedRevenuePayoutStatus === 'SUCCESS'
        ? 'text-emerald-600'
        : (generatedRevenuePayoutStatus === 'FAILED' ? 'text-rose-600' : 'text-primary');

    const formatInrWithSign = (amount) => {
        const n = Number(amount || 0);
        if (!Number.isFinite(n)) return '₹0';
        if (n > 0) return `+₹${formatInr(n)}`;
        if (n < 0) return `-₹${formatInr(Math.abs(n))}`;
        return '₹0';
    };

    const toVendorStatus = (raw, hasSelectedVendor = false) => {
        const s = String(raw || '').trim().toUpperCase();
        if (s === 'ACCEPTED') return { key: 'accepted', label: 'accepted', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        if (s === 'REJECTED') return { key: 'reject', label: 'reject', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
        if (hasSelectedVendor) return { key: 'yet_to_accept', label: 'yet_to_accept', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
        // For pending/unselected frontend state, show action-oriented copy.
        return { key: 'select_vendor', label: 'select_vendor', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    };

    const toInr = (paise) => {
        const n = Number(paise || 0);
        if (!Number.isFinite(n)) return 0;
        return Math.round(n) / 100;
    };

    const formatInr = (amount) => {
        const n = Number(amount || 0);
        const safe = Number.isFinite(n) ? n : 0;
        return safe.toLocaleString('en-IN');
    };

    const formatMoneyFromPaise = (paise) => `₹${formatInr(toInr(paise))}`;

    const loadRazorpayScript = () =>
        new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handlePayVendorConfirmation = async () => {
        if (!planningEventId) return;
        setConfirmFlowError(null);
        setConfirmFlowActive(true);
        dispatch(clearPlanningError());

        // Ensure we have the latest quote (so totals shown match amount charged)
        await dispatch(fetchPlanningQuoteLatest(planningEventId));

        const orderResult = await dispatch(createOrder({
            eventId: planningEventId,
            orderType: 'PLANNING EVENT VENDOR CONFIRMATION FEE',
        }));

        if (createOrder.rejected.match(orderResult)) {
            setConfirmFlowError(orderResult.payload || 'Failed to create payment order');
            setConfirmFlowActive(false);
            return;
        }

        const { razorpayOrderId: rzpOrderId, amount, currency, keyId: rzpKeyId } = orderResult.payload;

        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
            setConfirmFlowError('Failed to load payment gateway. Check your internet connection.');
            setConfirmFlowActive(false);
            return;
        }

        await new Promise((resolve) => {
            const options = {
                key: rzpKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount,
                currency: currency || 'INR',
                name: 'Okkazo',
                description: `Vendor Confirmation – ${event?.title || 'Event'}`,
                order_id: rzpOrderId,
                modal: {
                    ondismiss: () => {
                        setConfirmFlowError('Payment was cancelled. You can try again.');
                        setConfirmFlowActive(false);
                        resolve();
                    },
                },
                handler: async (response) => {
                    const verifyResult = await dispatch(
                        verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            eventId: planningEventId,
                        })
                    );

                    if (verifyPayment.rejected.match(verifyResult)) {
                        setConfirmFlowError(verifyResult.payload || 'Payment verification failed. Contact support.');
                        setConfirmFlowActive(false);
                        resolve();
                        return;
                    }

                    // Optimistically reflect success; Kafka update is async.
                    setEvent((prev) => (prev ? { ...prev, vendorConfirmationPaid: true, status: 'CONFIRMED' } : prev));
                    dispatch(fetchPlanningQuoteLatest(planningEventId));

                    setConfirmFlowActive(false);
                    resolve();
                },
            };

            try {
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (e) {
                setConfirmFlowError(e?.message || 'Failed to open payment gateway. Please try again.');
                setConfirmFlowActive(false);
                resolve();
            }
        });
    };

    const handlePayRemainingAmount = async () => {
        if (!planningEventId) return;
        setRemainingFlowError(null);
        setRemainingFlowActive(true);
        dispatch(clearPlanningError());

        await dispatch(fetchPlanningQuoteLatest(planningEventId));

        const orderResult = await dispatch(createOrder({
            eventId: planningEventId,
            orderType: 'PLANNING EVENT REMAINING FEE',
        }));

        if (createOrder.rejected.match(orderResult)) {
            setRemainingFlowError(orderResult.payload || 'Failed to create payment order');
            setRemainingFlowActive(false);
            return;
        }

        const { razorpayOrderId: rzpOrderId, amount, currency, keyId: rzpKeyId } = orderResult.payload;

        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
            setRemainingFlowError('Failed to load payment gateway. Check your internet connection.');
            setRemainingFlowActive(false);
            return;
        }

        await new Promise((resolve) => {
            const options = {
                key: rzpKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount,
                currency: currency || 'INR',
                name: 'Okkazo',
                description: `Remaining Payment - ${event?.title || 'Event'}`,
                order_id: rzpOrderId,
                modal: {
                    ondismiss: () => {
                        setRemainingFlowError('Payment was cancelled. You can try again.');
                        setRemainingFlowActive(false);
                        resolve();
                    },
                },
                handler: async (response) => {
                    const verifyResult = await dispatch(
                        verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            eventId: planningEventId,
                        })
                    );

                    if (verifyPayment.rejected.match(verifyResult)) {
                        setRemainingFlowError(verifyResult.payload || 'Payment verification failed. Contact support.');
                        setRemainingFlowActive(false);
                        resolve();
                        return;
                    }

                    setEvent((prev) => (
                        prev
                            ? {
                                ...prev,
                                status: 'COMPLETED',
                                remainingPaymentPaid: true,
                                remainingPaymentPaidAmountPaise: Number(amount || 0),
                                feedback: prev.feedback || { platform: null, vendors: [] },
                            }
                            : prev
                    ));

                    setRemainingFlowActive(false);
                    resolve();
                },
            };

            try {
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (e) {
                setRemainingFlowError(e?.message || 'Failed to open payment gateway. Please try again.');
                setRemainingFlowActive(false);
                resolve();
            }
        });
    };

    const displayStatus = isPendingApproval
        ? 'Pending Approval'
        : isLive
            ? 'Live'
            : isRejected
                ? 'Rejected'
                : isUserCompletedStatus
                    ? 'Completed'
                : (event?.status || '');

    const vendorConfirmationPercent = 25;
    const depositPaidAmountPaise = Math.max(0, Number(event?.depositPaidAmountPaise || 0));
    const vendorConfirmationBasePaise = Math.max(0, quoteDisplay.grandTotalPaise - depositPaidAmountPaise);
    const vendorConfirmationDuePaise = Math.max(0, Math.round((vendorConfirmationBasePaise * vendorConfirmationPercent) / 100));
    const vendorConfirmationPaidAmountPaise = Math.max(0, Number(event?.vendorConfirmationPaidAmountPaise || 0));
    const remainingPaymentPaidAmountPaise = Math.max(0, Number(event?.remainingPaymentPaidAmountPaise || 0));
    const remainingDuePaise = Math.max(0, quoteDisplay.grandTotalPaise - depositPaidAmountPaise - vendorConfirmationPaidAmountPaise);
    const paidMilestonesTotalPaise = depositPaidAmountPaise + vendorConfirmationPaidAmountPaise + remainingPaymentPaidAmountPaise;
    const outstandingDuePaise = Math.max(0, quoteDisplay.grandTotalPaise - paidMilestonesTotalPaise);

    const stickyStages = new Set(['CONFIRMED', 'VENDOR PAYMENT PENDING', 'COMPLETED', 'CLOSED']);
    const showFeedbackPrompt = !isPromote && isPrivateListing && isUserCompletedStatus && remainingPaymentPaid;
    const canShowBillingDetails = isConfirmedStatus || isUserCompletedStatus;
    const hasExistingFeedback = Boolean(
        Number(event?.feedback?.platform?.rating || 0) > 0
        || (Array.isArray(event?.feedback?.vendors) && event.feedback.vendors.length > 0)
    );
    const canDirectServiceEdit = !isPromote && !vendorConfirmationPaid && (isApproved || isPendingApproval);
    const canSubmitServiceChangeRequest = !isPromote && (vendorConfirmationPaid || stickyStages.has(normalizedStatus));
    const isServiceEditingLockedStage = normalizedStatus === 'CONFIRMED';
    const canEditServicesUI = !isServiceEditingLockedStage && (canDirectServiceEdit || canSubmitServiceChangeRequest);
    const serviceDraftChanged = selectedServicesDraft.length === selectedServices.length
        ? !selectedServicesDraft.every((v, i) => v === selectedServices[i])
        : true;
    const removedDraftServices = selectedServices.filter((serviceName) => !selectedServicesDraft.includes(serviceName));
    const addedDraftServices = selectedServicesDraft.filter((serviceName) => !selectedServices.includes(serviceName));

    const handleAddServiceToDraft = () => {
        const next = String(pendingServiceToAdd || '').trim();
        if (!next) return;

        setServiceDraft((prev) => {
            const list = Array.isArray(prev) && prev.length > 0 ? prev : selectedServices;
            if (list.includes(next)) return list;
            return [...list, next];
        });
        setPendingServiceToAdd('');
    };

    const handleRemoveServiceFromDraft = (serviceName) => {
        const target = String(serviceName || '').trim();
        if (!target) return;

        setServiceDraft((prev) => {
            const list = Array.isArray(prev) && prev.length > 0 ? prev : selectedServices;
            const next = list.filter((item) => String(item || '').trim() !== target);
            return next.length > 0 ? next : list;
        });
    };

    const handleSubmitServiceChanges = async () => {
        if (!planningEventId || !serviceDraftChanged) return;
        if (isServiceEditingLockedStage) {
            toast.error('Service edits are locked after event confirmation.');
            return;
        }

        try {
            setServiceChangeSubmitting(true);

            if (canDirectServiceEdit) {
                const response = await fetchWithAuth(
                    `${EVENTS_API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(planningEventId))}/services`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ selectedServices: selectedServicesDraft }),
                    },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const data = await response.json().catch(() => null);
                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || 'Failed to update selected services');
                }

                const nextStatus = String(data?.data?.policy?.nextPlanningStatus || '').trim();
                const statusReset = Boolean(data?.data?.policy?.planningStatusReset);
                toast.success(statusReset
                    ? `Services updated. Event moved to ${nextStatus || 'PENDING APPROVAL'} for re-approval.`
                    : 'Services updated successfully.');
            } else if (canSubmitServiceChangeRequest) {
                const reason = String(serviceChangeReason || '').trim();
                if (!reason) {
                    throw new Error('Please add a reason for this change request.');
                }

                const response = await fetchWithAuth(
                    `${EVENTS_API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(planningEventId))}/change-request`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            selectedServices: selectedServicesDraft,
                            reason,
                        }),
                    },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const data = await response.json().catch(() => null);
                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || 'Failed to submit change request');
                }

                const deltaPaise = Number(data?.data?.preview?.priceDelta?.deltaPaise || 0);
                const deltaLabel = deltaPaise === 0
                    ? 'no bill change'
                    : (deltaPaise > 0
                        ? `+${formatMoneyFromPaise(deltaPaise)}`
                        : `-${formatMoneyFromPaise(Math.abs(deltaPaise))}`);

                toast.success(`Change request submitted (${deltaLabel}).`);
                setServiceChangeReason('');
            } else {
                throw new Error('Service edits are not allowed in the current stage.');
            }

            const planningResult = await dispatch(fetchPlanningByEventId(String(planningEventId)));
            if (planningResult.meta?.requestStatus === 'fulfilled' && planningResult.payload) {
                const payload = planningResult.payload;
                const refreshedServices = Array.isArray(payload?.selectedServices)
                    ? payload.selectedServices
                    : selectedServicesDraft;
                const refreshedStatus = String(payload?.status || '').trim().toUpperCase().replace(/_/g, ' ');

                setEvent((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        status: payload?.status || prev.status,
                        selectedServices: refreshedServices,
                        vendorConfirmationPaid: Boolean(payload?.vendorConfirmationPaid),
                        vendorConfirmationPaidAmountPaise: Number(payload?.vendorConfirmationPaidAmountPaise || 0),
                        remainingPaymentPaid: Boolean(payload?.remainingPaymentPaid),
                        remainingPaymentPaidAmountPaise: Number(payload?.remainingPaymentPaidAmountPaise || 0),
                        feedback: payload?.feedback && typeof payload.feedback === 'object'
                            ? payload.feedback
                            : prev.feedback,
                    };
                });

                setServiceDraft(refreshedServices);

                if (refreshedStatus === 'APPROVED') {
                    dispatch(fetchPlanningQuoteLatest(String(planningEventId)));
                }
            }

            dispatch(fetchPlanningVendorSelectionByEventId(String(planningEventId)));
        } catch (error) {
            toast.error(error?.message || 'Failed to update service choices');
        } finally {
            setServiceChangeSubmitting(false);
        }
    };

    const updateVendorFeedbackField = ({ vendorAuthId, service, field, value }) => {
        if (hasExistingFeedback) return;

        const key = `${String(vendorAuthId || '').trim().toLowerCase()}::${String(service || '').trim().toLowerCase()}`;
        if (!key) return;

        setVendorFeedbackDraft((prev) => (Array.isArray(prev) ? prev : []).map((row) => {
            const rowKey = `${String(row?.vendorAuthId || '').trim().toLowerCase()}::${String(row?.service || '').trim().toLowerCase()}`;
            if (rowKey !== key) return row;
            return {
                ...row,
                [field]: value,
            };
        }));
    };

    const handleSubmitFeedback = async () => {
        if (!planningEventId) return;
        if (hasExistingFeedback) {
            toast.error('Feedback already submitted. Updates are disabled.');
            return;
        }

        const platformStars = Math.round(Number(platformRating || 0));
        if (!Number.isFinite(platformStars) || platformStars < 1 || platformStars > 5) {
            toast.error('Please provide a platform rating between 1 and 5 stars.');
            return;
        }

        const trimmedPlatformReview = String(platformReview || '').trim();
        if (!trimmedPlatformReview) {
            toast.error('Please provide platform review details.');
            return;
        }

        if (optedVendorsForFeedback.length === 0) {
            toast.error('Vendor feedback details are required before submission.');
            return;
        }

        const vendorRows = Array.isArray(vendorFeedbackDraft) ? vendorFeedbackDraft : [];
        if (vendorRows.length !== optedVendorsForFeedback.length) {
            toast.error('Please provide feedback for all opted vendors.');
            return;
        }

        const missingVendorRatings = vendorRows
            .filter((row) => {
                const rating = Math.round(Number(row?.rating || 0));
                return !Number.isFinite(rating) || rating < 1 || rating > 5;
            });

        const missingVendorReviews = vendorRows
            .filter((row) => !String(row?.review || '').trim());

        if (optedVendorsForFeedback.length > 0 && missingVendorRatings.length > 0) {
            toast.error('Please rate all opted vendors before submitting feedback.');
            return;
        }

        if (missingVendorReviews.length > 0) {
            toast.error('Please add review details for all opted vendors.');
            return;
        }

        try {
            setFeedbackSubmitting(true);

            const payload = {
                platformFeedback: {
                    rating: platformStars,
                    review: trimmedPlatformReview,
                },
                vendorFeedback: vendorRows
                    .map((row) => ({
                        vendorAuthId: String(row?.vendorAuthId || '').trim(),
                        service: String(row?.service || '').trim(),
                        rating: Math.round(Number(row?.rating || 0)),
                        review: String(row?.review || '').trim(),
                    })),
            };

            const response = await fetchWithAuth(
                `${EVENTS_API_BASE_URL}/api/events/planning/${encodeURIComponent(String(planningEventId))}/feedback`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                throw new Error(data?.message || 'Failed to submit feedback');
            }

            setEvent((prev) => {
                if (!prev) return prev;
                const next = data?.data || {};
                return {
                    ...prev,
                    status: next?.status || prev.status,
                    feedback: next?.feedback && typeof next.feedback === 'object'
                        ? next.feedback
                        : prev.feedback,
                };
            });

            toast.success('Thank you! Your feedback has been submitted.');
        } catch (error) {
            toast.error(error?.message || 'Unable to submit feedback right now.');
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    const steps = [
        {
            id: 1,
            label: 'Application Received',
            status: hasManagerAssigned || isLive || isRejected || isUserCompletedStatus ? 'completed' : 'current',
        },
        {
            id: 2,
            label: 'Manager Assigned',
            status: hasManagerAssigned ? 'completed' : 'pending',
        },
        {
            id: 3,
            label: 'Application in Review',
            status: hasManagerAssigned
                ? (isPendingApproval ? 'current' : (isLive || isRejected || isUserCompletedStatus) ? 'completed' : 'current')
                : 'pending',
        },
        {
            id: 4,
            label: isRejected ? 'Rejected' : isUserCompletedStatus ? 'Completed' : 'Success / Live',
            status: (isLive || isRejected || isUserCompletedStatus) ? 'completed' : 'pending',
        },
    ];

    const roadmapProgressWidth = (isLive || isRejected || isUserCompletedStatus)
        ? '100%'
        : hasManagerAssigned
            ? '66%'
            : '33%';

    const StepIcon = ({ status }) => {
        if (status === 'completed') return <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"><BsCheckCircleFill /></div>;
        if (status === 'current') return <div className="w-8 h-8 rounded-full border-4 border-primary/20 text-primary flex items-center justify-center bg-white"><div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" /></div>;
        return <div className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white" />;
    };

    return (
        <div className="min-h-screen bg-surface pt-28 font-sans text-primary selection:bg-accent selection:text-white">
            <Toaster position="top-center" />

            <main className="max-w-350 mx-auto px-8 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <Link to="/user/my-events" className="inline-flex items-center gap-2 text-primary/50 hover:text-primary font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors group">
                            <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            Back to My Events
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-serif-premium italic text-[#0b2d49]">{event.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isPendingApproval ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-surface text-primary border-primary/10'}`}>
                                {displayStatus}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-1.5 rounded-xl flex gap-1 shadow-sm border border-primary/5">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-surface text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}
                        >
                            Command Center
                        </button>
                        <button
                            onClick={() => setActiveTab("billing")}
                            className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'billing' ? 'bg-surface text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}
                        >
                            Bills & Payment
                        </button>
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-surface text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}
                        >
                            Manager Sync
                            {managerSyncUnreadCount > 0 ? (
                                <span className={`inline-flex min-w-5 h-5 items-center justify-center px-1.5 rounded-full text-[10px] leading-none ${activeTab === 'chat' ? 'bg-primary/15 text-primary' : 'bg-gray-200 text-gray-600'}`}>
                                    {managerSyncUnreadCount > 99 ? '99+' : managerSyncUnreadCount}
                                </span>
                            ) : null}
                        </button>
                    </div>
                </div>

                {activeTab === "overview" && (
                    <div className="space-y-8 animate-fade-in-up">
                        {!isPromote && isApproved && !vendorConfirmationPaid && (
                            <div className="bg-white rounded-4xl p-10 shadow-sm border border-primary/5">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div>
                                        <h2 className="text-xl font-serif-premium text-[#0b2d49] mb-1">Vendor Confirmation</h2>
                                        <p className="text-xs text-primary/60">
                                            Pay the vendor confirmation fee to lock vendors and move your event to <span className="font-bold">CONFIRMED</span>.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handlePayVendorConfirmation}
                                        disabled={confirmFlowActive || !depositPaid}
                                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                            (confirmFlowActive || !depositPaid)
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-primary text-white hover:opacity-95'
                                        }`}
                                    >
                                        {confirmFlowActive
                                            ? 'Processing…'
                                            : `Pay Vendor Confirmation (${formatMoneyFromPaise(vendorConfirmationDuePaise)})`}
                                    </button>
                                </div>

                                {!depositPaid && (
                                    <div className="mt-6 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                                        Deposit must be paid before vendor confirmation.
                                    </div>
                                )}

                                {confirmFlowError && (
                                    <div className="mt-6 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                        {confirmFlowError}
                                    </div>
                                )}

                                <div className="mt-8 space-y-4">
                                        <div className="bg-surface rounded-3xl border border-primary/5 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <div className="min-w-[720px]">
                                                    <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-white border-b border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/45">
                                                        <div className="col-span-4">Service name</div>
                                                        <div className="col-span-3">Business name</div>
                                                        <div className="col-span-2">Quantity</div>
                                                        <div className="col-span-3 text-right">Amount</div>
                                                    </div>

                                                    {quoteDisplay.lineItems.length > 0 ? (
                                                        <div className="divide-y divide-primary/10">
                                                            {quoteDisplay.lineItems.map((item) => (
                                                                <div key={item.id} className="grid grid-cols-12 gap-3 px-5 py-4 text-sm">
                                                                    <div className="col-span-4 font-bold text-[#0b2d49]">{item.serviceName}</div>
                                                                    <div className="col-span-3 text-primary/80">{item.businessName}</div>
                                                                    <div className="col-span-2 text-primary/80">{item.quantity}</div>
                                                                    <div className="col-span-3 text-right font-black text-[#0b2d49]">{formatMoneyFromPaise(item.amountPaise)}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="px-5 py-5 text-sm text-primary/60">No vendor line items available.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {quoteDisplay.promotions.length > 0 && (
                                            <div className="bg-surface rounded-3xl border border-primary/5 overflow-hidden">
                                                <div className="px-5 py-3 bg-white border-b border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/45">
                                                    Opted promotions
                                                </div>
                                                <div className="divide-y divide-primary/10">
                                                    {quoteDisplay.promotions.map((promotion) => (
                                                        <div key={promotion.id} className="flex items-center justify-between px-5 py-4 text-sm">
                                                            <div className="font-bold text-[#0b2d49]">{promotion.name}</div>
                                                            <div className="font-black text-[#0b2d49]">{formatMoneyFromPaise(promotion.feePaise)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-white rounded-3xl p-6 border border-primary/5">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Total Amount</p>
                                                    <p className="text-3xl font-black text-[#0b2d49]">{formatMoneyFromPaise(quoteDisplay.grandTotalPaise)}</p>
                                                </div>
                                                <div className="md:text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Deposit Fee Paid</p>
                                                    <p className="text-sm font-black text-[#0b2d49]">{formatMoneyFromPaise(depositPaidAmountPaise)}</p>
                                                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary/40">Vendor Confirmation Due ({vendorConfirmationPercent}%)</p>
                                                    <p className="text-sm font-black text-primary">{formatMoneyFromPaise(vendorConfirmationDuePaise)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Demand Tier</p>
                                                    <p className="text-xs font-black text-primary">{String(quoteLatest?.demandTier || 'NORMAL').replace(/_/g, ' ')}</p>
                                                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary/40">Locked Version</p>
                                                    <p className="text-xs font-black text-primary">{quoteLatest?.version ? `v${quoteLatest.version}` : 'draft'}</p>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        )}

                        {!isPromote && isPrivateListing && isUserCompletedStatus && !remainingPaymentPaid && (
                            <div className="bg-white rounded-4xl p-10 shadow-sm border border-primary/5">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div>
                                        <h2 className="text-xl font-serif-premium text-[#0b2d49] mb-1">Final Settlement</h2>
                                        <p className="text-xs text-primary/60">
                                            Event is marked as <span className="font-bold">COMPLETED</span>. Pay the remaining amount to finish vendor settlement for this event.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handlePayRemainingAmount}
                                        disabled={remainingFlowActive || remainingDuePaise <= 0}
                                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                            (remainingFlowActive || remainingDuePaise <= 0)
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-primary text-white hover:opacity-95'
                                        }`}
                                    >
                                        {remainingFlowActive
                                            ? 'Processing…'
                                            : `Pay Remaining (${formatMoneyFromPaise(remainingDuePaise)})`}
                                    </button>
                                </div>

                                {remainingFlowError && (
                                    <div className="mt-6 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                        {remainingFlowError}
                                    </div>
                                )}

                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-surface rounded-2xl p-4 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-1">Total Amount</p>
                                        <p className="text-lg font-black text-[#0b2d49]">{formatMoneyFromPaise(quoteDisplay.grandTotalPaise)}</p>
                                    </div>
                                    <div className="bg-surface rounded-2xl p-4 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-1">Already Paid</p>
                                        <p className="text-lg font-black text-[#0b2d49]">
                                            {formatMoneyFromPaise(paidMilestonesTotalPaise)}
                                        </p>
                                    </div>
                                    <div className="bg-surface rounded-2xl p-4 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-1">Remaining Due</p>
                                        <p className="text-lg font-black text-primary">{formatMoneyFromPaise(remainingDuePaise)}</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="bg-surface rounded-2xl border border-primary/10 overflow-hidden">
                                        <div className="px-4 py-3 bg-white border-b border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/45">
                                            Price Breakdown
                                        </div>
                                        {quoteDisplay.lineItems.length > 0 ? (
                                            <div className="divide-y divide-primary/10">
                                                {quoteDisplay.lineItems.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-[#0b2d49] truncate">{item.serviceName}</p>
                                                            <p className="text-primary/60 truncate">{item.businessName}</p>
                                                        </div>
                                                        <p className="font-black text-[#0b2d49] shrink-0">{formatMoneyFromPaise(item.amountPaise)}</p>
                                                    </div>
                                                ))}
                                                {quoteDisplay.promotions.map((promotion) => (
                                                    <div key={promotion.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                                                        <p className="font-bold text-[#0b2d49]">Promotion: {promotion.name}</p>
                                                        <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(promotion.feePaise)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-4 py-4 text-xs text-primary/60">Price details are being prepared.</div>
                                        )}
                                    </div>

                                    <div className="bg-surface rounded-2xl border border-primary/10 overflow-hidden">
                                        <div className="px-4 py-3 bg-white border-b border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/45">
                                            Paid So Far
                                        </div>
                                        <div className="divide-y divide-primary/10 text-xs">
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <p className="font-bold text-[#0b2d49]">Deposit Fee</p>
                                                <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(depositPaidAmountPaise)}</p>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <p className="font-bold text-[#0b2d49]">Vendor Confirmation</p>
                                                <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(vendorConfirmationPaidAmountPaise)}</p>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <p className="font-bold text-[#0b2d49]">Remaining Payment</p>
                                                <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(remainingPaymentPaidAmountPaise)}</p>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3 bg-white/70">
                                                <p className="font-black text-[#0b2d49]">Total Paid</p>
                                                <p className="font-black text-primary">{formatMoneyFromPaise(paidMilestonesTotalPaise)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isPromote && isPrivateListing && isUserCompletedStatus && remainingPaymentPaid && (
                            <div className="bg-white rounded-4xl p-10 shadow-sm border border-primary/5">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div>
                                        <h2 className="text-xl font-serif-premium text-[#0b2d49] mb-1">Final Settlement Summary</h2>
                                        <p className="text-xs text-primary/60">
                                            All payments are completed. Review your final price breakdown below.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-surface rounded-2xl p-4 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-1">Total Amount</p>
                                        <p className="text-lg font-black text-[#0b2d49]">{formatMoneyFromPaise(quoteDisplay.grandTotalPaise)}</p>
                                    </div>
                                    <div className="bg-surface rounded-2xl p-4 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-1">Total Paid</p>
                                        <p className="text-lg font-black text-[#0b2d49]">{formatMoneyFromPaise(paidMilestonesTotalPaise)}</p>
                                    </div>
                                    <div className="bg-surface rounded-2xl p-4 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-1">Outstanding Due</p>
                                        <p className="text-lg font-black text-primary">{formatMoneyFromPaise(outstandingDuePaise)}</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="bg-surface rounded-2xl border border-primary/10 overflow-hidden">
                                        <div className="px-4 py-3 bg-white border-b border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/45">
                                            Price Breakdown
                                        </div>
                                        {quoteDisplay.lineItems.length > 0 ? (
                                            <div className="divide-y divide-primary/10">
                                                {quoteDisplay.lineItems.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-[#0b2d49] truncate">{item.serviceName}</p>
                                                            <p className="text-primary/60 truncate">{item.businessName}</p>
                                                        </div>
                                                        <p className="font-black text-[#0b2d49] shrink-0">{formatMoneyFromPaise(item.amountPaise)}</p>
                                                    </div>
                                                ))}
                                                {quoteDisplay.promotions.map((promotion) => (
                                                    <div key={promotion.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                                                        <p className="font-bold text-[#0b2d49]">Promotion: {promotion.name}</p>
                                                        <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(promotion.feePaise)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-4 py-4 text-xs text-primary/60">Price details are being prepared.</div>
                                        )}
                                    </div>

                                    <div className="bg-surface rounded-2xl border border-primary/10 overflow-hidden">
                                        <div className="px-4 py-3 bg-white border-b border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/45">
                                            Paid Breakdown
                                        </div>
                                        <div className="divide-y divide-primary/10 text-xs">
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <p className="font-bold text-[#0b2d49]">Deposit Fee</p>
                                                <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(depositPaidAmountPaise)}</p>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <p className="font-bold text-[#0b2d49]">Vendor Confirmation</p>
                                                <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(vendorConfirmationPaidAmountPaise)}</p>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <p className="font-bold text-[#0b2d49]">Remaining Payment</p>
                                                <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(remainingPaymentPaidAmountPaise)}</p>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3 bg-white/70">
                                                <p className="font-black text-[#0b2d49]">Total Paid</p>
                                                <p className="font-black text-primary">{formatMoneyFromPaise(paidMilestonesTotalPaise)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showFeedbackPrompt && (
                            <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5 space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-2">Post Event Feedback</p>
                                    <h3 className="text-xl font-serif-premium text-[#0b2d49]">Rate Your Experience</h3>
                                    <p className="text-xs text-primary/60 mt-1">
                                        Share your feedback for Okkazo and the vendors you opted for. Your ratings help us improve every event.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-primary/10 bg-surface p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-3">Platform Rating</p>
                                    <div className="flex items-center gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={`platform-star-${star}`}
                                                type="button"
                                                onClick={() => setPlatformRating(star)}
                                                disabled={hasExistingFeedback}
                                                className="text-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {platformRating >= star
                                                    ? <BsStarFill className="text-amber-400" />
                                                    : <BsStar className="text-primary/25" />}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={platformReview}
                                        onChange={(e) => setPlatformReview(e.target.value)}
                                        rows={2}
                                        placeholder="Tell us about your experience with Okkazo"
                                        disabled={hasExistingFeedback}
                                        className="w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-xs font-medium text-primary"
                                    />
                                </div>

                                {optedVendorsForFeedback.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45">Vendor Ratings</p>
                                        {vendorFeedbackDraft.map((row, idx) => (
                                            <div key={`${row.vendorAuthId}:${row.service}:${idx}`} className="rounded-2xl border border-primary/10 bg-surface p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                                    <div>
                                                        <p className="text-xs font-bold text-[#0b2d49]">{row.businessName}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50">{row.service}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={`${row.vendorAuthId}:${row.service}:star-${star}`}
                                                                type="button"
                                                                onClick={() => updateVendorFeedbackField({
                                                                    vendorAuthId: row.vendorAuthId,
                                                                    service: row.service,
                                                                    field: 'rating',
                                                                    value: star,
                                                                })}
                                                                disabled={hasExistingFeedback}
                                                                className="text-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                                            >
                                                                {Number(row.rating || 0) >= star
                                                                    ? <BsStarFill className="text-amber-400" />
                                                                    : <BsStar className="text-primary/25" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={row.review || ''}
                                                    onChange={(e) => updateVendorFeedbackField({
                                                        vendorAuthId: row.vendorAuthId,
                                                        service: row.service,
                                                        field: 'review',
                                                        value: e.target.value,
                                                    })}
                                                    rows={2}
                                                    placeholder="Write a short review for this vendor"
                                                    disabled={hasExistingFeedback}
                                                    className="w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-xs font-medium text-primary"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-primary/10 bg-surface p-4 text-xs text-primary/60">
                                        Vendor list is not available yet, but you can still submit platform feedback.
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/45">
                                        {hasExistingFeedback ? 'Feedback submitted successfully.' : 'All feedback details are mandatory.'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSubmitFeedback}
                                        disabled={feedbackSubmitting || hasExistingFeedback}
                                        className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-white hover:opacity-95 disabled:opacity-60"
                                    >
                                        {feedbackSubmitting
                                            ? 'Submitting...'
                                            : (hasExistingFeedback ? 'Feedback Submitted' : 'Submit Feedback')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Roadmap Card */}
                        <div className="bg-white rounded-4xl p-10 shadow-sm border border-primary/5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h2 className="text-xl font-serif-premium text-[#0b2d49] mb-1">Event Planning Roadmap</h2>
                                    {isRejected && (
                                        <Link to="/refund-policy" className="text-[10px] font-bold uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">
                                            Refer Refund Policy details
                                        </Link>
                                    )}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Tracking Status: {displayStatus}</p>
                            </div>

                            <div className="relative z-10">
                                {/* Connecting Line */}
                                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 -z-10" />
                                <div className="absolute top-4 left-0 h-0.5 bg-primary/20 transition-all duration-1000" style={{ width: roadmapProgressWidth }} />

                                <div className="grid grid-cols-4 gap-4">
                                    {steps.map((step) => (
                                        <div key={step.id} className="flex flex-col items-center gap-4 text-center">
                                            <StepIcon status={step.status} />
                                            <div>
                                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${step.status === 'completed' || step.status === 'current' ? 'text-primary' : 'text-gray-300'}`}>
                                                    {step.id}. {step.label}
                                                </p>
                                                <p className="text-[9px] font-medium text-gray-400">
                                                    {step.status === 'completed' ? 'Complete' : step.status === 'current' ? 'In Progress' : 'Upcoming'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Event Details */}
                                <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5">
                                    <h3 className="text-sm font-serif-premium text-primary mb-6">Event Details</h3>

                                    <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-100 mb-8 border border-gray-100 group">
                                        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            {isPublicListing ? 'Event Banner' : 'Minimal Banner'}
                                        </div>
                                        <img
                                            src={eventBannerSrc}
                                            alt={`${event?.title || 'Event'} banner`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 to-transparent flex flex-col justify-end p-8 text-white">
                                            <h4 className="font-serif-premium italic text-2xl">{event.title} </h4>
                                            <p className="text-[10px] uppercase tracking-widest opacity-80">{event.location}</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-sm max-w-none text-[#0b2d49]/70 leading-relaxed text-xs">
                                        <h4 className="font-bold text-primary uppercase tracking-widest text-[10px] mb-2">Overview</h4>
                                        {isPublicListing && typeof event?.eventDescription === 'string' && event.eventDescription.trim() ? (
                                            <p>{event.eventDescription.trim()}</p>
                                        ) : (!isPublicListing ? (
                                            <p className="text-[#0b2d49]/60">
                                                This is a private planning event. Details will be coordinated with your manager.
                                            </p>
                                        ) : null)}
                                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
                                            {isPublicListing && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                                                    <div className="w-2 h-2 rounded-full bg-green-400" /> Ticket Sales Active
                                                </div>
                                            )}
                                            <div className="text-[10px] font-bold text-gray-400">ID: #{event.id}</div>
                                        </div>

                                        {selectedPublicPromotions.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <h4 className="font-bold text-primary uppercase tracking-widest text-[10px] mb-3">Selected Promotions</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPublicPromotions.map((promotion) => (
                                                        <span
                                                            key={promotion}
                                                            className="px-3 py-1 bg-[#d7a444]/20 text-[#0b2d49] text-[10px] font-black rounded-lg uppercase tracking-wide border border-[#d7a444]/40"
                                                        >
                                                            {promotion}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ticket Inventory */}
                                {isPrivateListing ? (
                                    <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5 overflow-hidden relative">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-sm font-serif-premium text-primary">Guest Count</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-surface rounded-xl p-4">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">Guests</p>
                                                <p className="text-2xl font-serif-premium text-[#0b2d49]">
                                                    {typeof event?.guestCount === 'number' ? event.guestCount : '—'}
                                                </p>
                                            </div>
                                            <div className="bg-surface rounded-xl p-4">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">Listing Type</p>
                                                <p className="text-2xl font-serif-premium text-[#0b2d49]">Private</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5 overflow-hidden relative">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-sm font-serif-premium text-primary">Tickets</h3>
                                        </div>

                                        {ticketRows.length > 0 ? (
                                            <div className="space-y-4">
                                                {ticketRows.map((dayRow, dayIdx) => (
                                                    <div key={dayRow.id || dayIdx} className="bg-surface rounded-2xl p-4 border border-primary/10">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">
                                                                    {dayRow.dayKey ? `Day ${dayIdx + 1}` : 'Summary'}
                                                                </p>
                                                                <p className="text-sm font-bold text-[#0b2d49]">{dayRow.dayLabel || 'Day Allocation'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">Total Tickets</p>
                                                                <p className="text-sm font-bold text-[#0b2d49]">{Number.isFinite(dayRow.totalTickets) ? dayRow.totalTickets : '—'}</p>
                                                            </div>
                                                        </div>

                                                        {Array.isArray(dayRow.tierBreakdown) && dayRow.tierBreakdown.length > 0 ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {dayRow.tierBreakdown.map((tier, idx) => (
                                                                    <div key={`${dayRow.id}-tier-${idx}`} className="flex items-center justify-between bg-white rounded-xl p-3 border border-primary/5">
                                                                        <div>
                                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">Tier</p>
                                                                            <p className="text-xs font-bold text-[#0b2d49]">{tier.name}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/50 mb-1">Quantity</p>
                                                                            <p className="text-xs font-bold text-[#0b2d49]">{tier.ticketCount}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white rounded-xl p-3 text-xs text-[#0b2d49]/60 border border-primary/5">
                                                                No tier breakdown for this day.
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-surface rounded-xl p-6 text-sm text-[#0b2d49]/70">
                                                No day-wise ticket allocation configured.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Content */}
                            <div className="space-y-8">
                                {/* Consultation / Manager Card */}
                                <div className="relative bg-primary text-white rounded-4xl p-8 shadow-xl overflow-hidden flex flex-col justify-between min-h-75">
                                    {/* Decorative BG */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white backdrop-blur-sm">
                                            {isPendingApproval ? <BsClock size={20} /> : <BsChatDots size={20} />}
                                        </div>

                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Consultation</p>
                                        <h3 className="text-2xl font-serif-premium italic mb-4">
                                            {!hasManagerAssigned
                                                ? 'Manager Selection'
                                                : isRejected
                                                    ? 'Application Closed'
                                                    : 'Manager Connected'
                                            }
                                        </h3>
                                        <p className="text-xs opacity-80 leading-relaxed max-w-62.5">
                                            {!hasManagerAssigned
                                                ? "A dedicated manager will be assigned once your event moves forward in the review process."
                                                : isRejected
                                                    ? "Your application was not approved. A refund has been processed according to our policy."
                                                    : "Your manager is assigned to your event. Sync up for strategy and execution details."
                                            }
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => hasManagerAssigned && !isRejected && setActiveTab("chat")}
                                        disabled={!hasManagerAssigned || isRejected}
                                        className={`mt-8 w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${!hasManagerAssigned || isRejected
                                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                            : 'bg-white text-primary hover:bg-white/90'
                                            }`}
                                    >
                                        {!hasManagerAssigned ? 'Assignment Pending' : isRejected ? 'Refund Processed' : 'Chat with Manager'}
                                    </button>
                                </div>

                                {isPublicListing && ticketStats && (
                                    <>
                                        <div className="bg-white rounded-4xl p-6 shadow-sm border border-primary/5">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/45">Ticket Sales</p>
                                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                                                    {conversionProgress.toFixed(0)}% Conversion
                                                </span>
                                            </div>

                                            <div className="flex items-end justify-between mb-3">
                                                <p className="text-4xl font-serif-premium text-[#0b2d49]">
                                                    {ticketsSoldForKpi}
                                                    <span className="text-base text-primary/40"> / {totalTicketsForKpi}</span>
                                                </p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/45">{ticketsRemainingForKpi} to go</p>
                                            </div>

                                            <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${conversionProgress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-white rounded-4xl p-6 shadow-sm border border-primary/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-2">Revenue</p>
                                                <p className="text-3xl font-serif-premium text-[#0b2d49]">₹{formatInr(grossRevenueInr)}</p>
                                                <p className="mt-2 text-[10px] font-bold text-primary/45">Gross Income</p>
                                            </div>

                                            <div className="bg-white rounded-4xl p-6 shadow-sm border border-primary/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-2">Net P&L</p>
                                                <p className={`text-3xl font-serif-premium ${netPnlInr >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {formatInrWithSign(netPnlInr)}
                                                </p>
                                                <p className="mt-2 text-[10px] font-bold text-primary/45">After ₹{formatInr(totalFeesInr)} fees</p>
                                            </div>

                                            <div className="bg-white rounded-4xl p-6 shadow-sm border border-primary/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-2">Revenue Received</p>
                                                <p className={`text-3xl font-serif-premium ${generatedRevenuePayoutTone}`}>
                                                    {generatedRevenuePayoutStatus === 'SUCCESS' && generatedRevenuePayoutAmountInr > 0
                                                        ? `₹${formatInr(generatedRevenuePayoutAmountInr)}`
                                                        : '—'}
                                                </p>
                                                <p className="mt-2 text-[10px] font-bold text-primary/45">
                                                    {generatedRevenuePayoutStatus === 'SUCCESS'
                                                        ? `${generatedRevenuePayoutMode || 'DEMO'}${generatedRevenuePayoutPaidAtLabel ? ` • ${generatedRevenuePayoutPaidAtLabel}` : ''}`
                                                        : (generatedRevenuePayoutStatus === 'FAILED'
                                                            ? 'Payout failed. Contact support.'
                                                            : (generatedRevenuePayoutStatus === 'PENDING'
                                                                ? 'Manager will release this payout soon.'
                                                                : 'Not released yet'))}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isPromote ? (
                                    <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5">
                                        <h3 className="text-sm font-serif-premium text-primary mb-6">Promotion Assets</h3>

                                        <div className="space-y-3">
                                            {[
                                                { name: "Media_Kit_2024.zip", size: "24 MB" },
                                                { name: "Social_Banners.zip", size: "12 MB" },
                                                { name: "Event_Logos.ai", size: "4 MB" }
                                            ].map((file, i) => (
                                                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-surface/50 transition-all cursor-pointer">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-surface text-primary flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <BsFileEarmarkZip size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[#0b2d49]">{file.name}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{file.size}</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-primary/40 group-hover:text-primary transition-colors">
                                                        <BsDownload size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-6 py-3 border border-dashed border-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:border-primary transition-colors">
                                            Request New Asset
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5">
                                        <div className="flex items-start justify-between gap-4 mb-6">
                                            <h3 className="text-sm font-serif-premium text-primary">Services & Vendors</h3>
                                            {canEditServicesUI && (
                                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-surface text-primary border-primary/10">
                                                    {canDirectServiceEdit ? 'Editable' : 'Change Request Mode'}
                                                </span>
                                            )}
                                        </div>

                                        {canEditServicesUI && (
                                            <div className="mb-6 rounded-2xl border border-primary/10 bg-surface p-4 space-y-3">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">
                                                    {canDirectServiceEdit
                                                        ? 'Add or remove services. Bill preview updates instantly.'
                                                        : 'Direct edits are locked. Submit a managed change request.'}
                                                </p>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <select
                                                        value={pendingServiceToAdd}
                                                        onChange={(e) => setPendingServiceToAdd(e.target.value)}
                                                        disabled={serviceChangeSubmitting || selectableServiceOptions.length === 0}
                                                        className="flex-1 rounded-xl border border-primary/15 bg-white px-3 py-2 text-xs font-bold text-primary"
                                                    >
                                                        <option value="">Select service to add</option>
                                                        {selectableServiceOptions.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddServiceToDraft}
                                                        disabled={!pendingServiceToAdd || serviceChangeSubmitting || selectableServiceOptions.length === 0}
                                                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-white hover:opacity-95 disabled:opacity-60"
                                                    >
                                                        Add Service
                                                    </button>
                                                </div>

                                                {canSubmitServiceChangeRequest && serviceDraftChanged && (
                                                    <textarea
                                                        value={serviceChangeReason}
                                                        onChange={(e) => setServiceChangeReason(e.target.value)}
                                                        placeholder="Tell us why this post-confirmation change is needed"
                                                        rows={2}
                                                        className="w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-xs font-medium text-primary"
                                                    />
                                                )}

                                                {serviceDraftChanged && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleSubmitServiceChanges}
                                                            disabled={serviceChangeSubmitting}
                                                            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-white hover:opacity-95 disabled:opacity-60"
                                                        >
                                                            {serviceChangeSubmitting
                                                                ? 'Submitting…'
                                                                : (canDirectServiceEdit ? 'Save Service Changes' : 'Submit Change Request')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setServiceDraft(selectedServices)}
                                                            disabled={serviceChangeSubmitting}
                                                            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 text-primary bg-white hover:bg-surface disabled:opacity-60"
                                                        >
                                                            Revert Draft
                                                        </button>
                                                        {(addedDraftServices.length > 0 || removedDraftServices.length > 0) && (
                                                            <p className="text-[10px] font-bold text-primary/60">
                                                                Added: {addedDraftServices.length} • Removed: {removedDraftServices.length}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedServicesDraft.length === 0 ? (
                                            <div className="bg-surface rounded-xl p-6 text-sm text-[#0b2d49]/70">
                                                No services selected yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedServicesDraft.map((serviceName, i) => {
                                                    const key = String(serviceName || '').trim();
                                                    const serviceKey = toServiceKey(key);
                                                    const vendor = vendorByService.get(serviceKey);
                                                    const vendorSel = vendorSelectionByService.get(serviceKey);
                                                    const vendorAuthId = String(vendorSel?.vendorAuthId || vendor?.vendorAuthId || '').trim() || null;
                                                    const vendorProfile = vendorAuthId
                                                        ? vendorProfileByAuthId.get(String(vendorAuthId).toLowerCase())
                                                        : null;
                                                    const selectedServiceId = (() => {
                                                        const raw = vendorSel?.serviceId || vendor?.serviceId || null;
                                                        const s = raw != null ? String(raw).trim() : '';
                                                        return s || null;
                                                    })();
                                                    const isVenueService = serviceKey === 'venue';
                                                    const optedServiceName = String(
                                                        vendorSel?.serviceName
                                                        || vendorSel?.name
                                                        || vendorSel?.service
                                                        || vendor?.serviceName
                                                        || key
                                                        || ''
                                                    ).trim() || 'Service';
                                                    const optedLocation = String(
                                                        vendorSel?.serviceLocation
                                                        || vendorSel?.location
                                                        || vendorProfile?.location?.name
                                                        || vendorProfile?.place
                                                        || ''
                                                    ).trim();
                                                    const servicePriceMinRaw = Number(vendorSel?.servicePrice?.min ?? vendor?.servicePrice?.min ?? 0);
                                                    const servicePriceMaxRaw = Number(vendorSel?.servicePrice?.max ?? vendor?.servicePrice?.max ?? 0);
                                                    const servicePriceMin = Number.isFinite(servicePriceMinRaw) && servicePriceMinRaw > 0
                                                        ? servicePriceMinRaw
                                                        : 0;
                                                    const servicePriceMax = Number.isFinite(servicePriceMaxRaw) && servicePriceMaxRaw > 0
                                                        ? servicePriceMaxRaw
                                                        : (servicePriceMin > 0 ? Math.ceil(servicePriceMin * 1.5) : 0);
                                                    const hasQuotedPrice = servicePriceMin > 0 || servicePriceMax > 0;
                                                    const hasSelectedVendor = Boolean(vendorAuthId);
                                                    const vendorStatusRaw = vendorSel?.status || 'YET_TO_SELECT';
                                                    const vendorStatus = toVendorStatus(vendorStatusRaw, hasSelectedVendor);
                                                    const vendorDisplayName = vendorAuthId
                                                        ? (vendorProfile?.businessName || `${String(vendorAuthId).slice(0, 10)}…`)
                                                        : 'Not selected';
                                                    const persistedInSelection = selectedServices.some((s) => toServiceKey(s) === serviceKey);
                                                    const canOpenPicker = Boolean(planningEventId) && persistedInSelection;
                                                    const pickerState = serviceAlternativesByKey?.[serviceKey] || null;
                                                    const pickerOpen = expandedServicePickerKey === serviceKey;
                                                    const pickerTitle = isVenueService
                                                        ? (hasSelectedVendor ? 'Change Service' : 'View Services')
                                                        : (hasSelectedVendor ? 'Change Vendor' : 'View Vendors');
                                                    const pickerHelp = !persistedInSelection
                                                        ? 'Save service changes first to select vendor options.'
                                                        : null;

                                                    const getLocationLabel = (value) => {
                                                        if (!value) return '';
                                                        if (typeof value === 'string') return value;
                                                        if (typeof value === 'object' && typeof value?.name === 'string') return value.name;
                                                        return '';
                                                    };

                                                    return (
                                                        <div key={`${key}-${i}`} className="p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-surface/50 transition-all">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="text-xs font-bold text-[#0b2d49]">{key || 'Service'}</p>
                                                                    <p className="text-[9px] font-bold text-primary/55 uppercase tracking-widest">
                                                                        Opted: {optedServiceName}
                                                                    </p>
                                                                    {isVenueService && optedLocation && (
                                                                        <p className="text-[9px] font-bold text-primary/45 uppercase tracking-widest">
                                                                            Location: {optedLocation}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">
                                                                        Price: {hasQuotedPrice ? `₹${formatInr(servicePriceMin)} - ₹${formatInr(servicePriceMax)}` : 'Not quoted yet'}
                                                                    </p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                        Vendor: {vendorDisplayName}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                                                    {vendorStatus.key !== 'accepted' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleServiceVendorPicker(key)}
                                                                            disabled={!canOpenPicker || serviceChangeSubmitting}
                                                                            className="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/20 bg-white text-primary hover:bg-surface disabled:opacity-60"
                                                                        >
                                                                            {pickerOpen ? 'Hide Options' : pickerTitle}
                                                                        </button>
                                                                    )}
                                                                    {canEditServicesUI && selectedServicesDraft.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveServiceFromDraft(key)}
                                                                            disabled={serviceChangeSubmitting}
                                                                            className="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    )}
                                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${vendorStatus.badge}`}>
                                                                        {vendorStatus.label}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {pickerHelp && (
                                                                <p className="mt-2 text-[10px] font-bold text-primary/50">{pickerHelp}</p>
                                                            )}

                                                            {vendorStatus.key !== 'accepted' && pickerOpen && canOpenPicker && (
                                                                <div className="mt-3 rounded-2xl border border-primary/10 bg-white p-3 space-y-3">
                                                                    {pickerState?.status === 'loading' && (
                                                                        <p className="text-xs font-medium text-primary/70">Loading options...</p>
                                                                    )}

                                                                    {pickerState?.status === 'failed' && (
                                                                        <div className="space-y-2">
                                                                            <p className="text-xs font-bold text-rose-600">{pickerState?.error || 'Failed to load options'}</p>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => fetchServiceAlternatives(key)}
                                                                                className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/20 bg-white text-primary hover:bg-surface"
                                                                            >
                                                                                Retry
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {(!pickerState || pickerState?.status === 'succeeded') && (
                                                                        <>
                                                                            {Array.isArray(pickerState?.alternatives) && pickerState.alternatives.length > 0 ? (
                                                                                <div className="space-y-2">
                                                                                    {pickerState.alternatives.map((alt, altIndex) => {
                                                                                        const optionVendorAuthId = String(alt?.vendorAuthId || '').trim();
                                                                                        const optionServiceId = alt?.serviceId != null ? String(alt.serviceId).trim() : null;
                                                                                        const optionVendorProfile = optionVendorAuthId
                                                                                            ? vendorProfileByAuthId.get(optionVendorAuthId.toLowerCase())
                                                                                            : null;

                                                                                        const vendorTitle = isVenueService
                                                                                            ? String(alt?.name || 'Venue Service').trim()
                                                                                            : String(alt?.businessName || optionVendorProfile?.businessName || 'Vendor').trim();
                                                                                        const vendorSubtitle = isVenueService
                                                                                            ? String(alt?.businessName || optionVendorProfile?.businessName || '').trim()
                                                                                            : '';
                                                                                        const optionLocation = getLocationLabel(alt?.location)
                                                                                            || String(optionVendorProfile?.location?.name || optionVendorProfile?.place || '').trim();

                                                                                        const optionRows = !isVenueService && Array.isArray(alt?.services) && alt.services.length > 0
                                                                                            ? alt.services.map((svc, svcIndex) => ({
                                                                                                id: (() => {
                                                                                                    const rawId = svc?.serviceId ?? svc?.id ?? svc?._id ?? null;
                                                                                                    const id = rawId != null ? String(rawId).trim() : '';
                                                                                                    return id || null;
                                                                                                })(),
                                                                                                title: String(svc?.tier || svc?.name || `Option ${svcIndex + 1}`).trim(),
                                                                                                caption: svc?.name && svc?.tier ? String(svc.name).trim() : '',
                                                                                                price: Number(svc?.price || 0),
                                                                                            }))
                                                                                            : [{
                                                                                                id: optionServiceId,
                                                                                                title: String(alt?.tier || alt?.name || 'Select Vendor').trim(),
                                                                                                caption: '',
                                                                                                price: Number(alt?.price || 0),
                                                                                            }];

                                                                                        return (
                                                                                            <div key={`${serviceKey}:${optionVendorAuthId || 'none'}:${optionServiceId || altIndex}`} className="rounded-xl border border-primary/10 p-3 bg-surface/30">
                                                                                                <div className="flex items-start justify-between gap-3">
                                                                                                    <div>
                                                                                                        <p className="text-xs font-bold text-[#0b2d49]">{vendorTitle || 'Vendor'}</p>
                                                                                                        {vendorAuthId && vendorAuthId === optionVendorAuthId && !selectedServiceId && !isVenueService && (
                                                                                                            <p className="text-[9px] font-bold text-primary/55 uppercase tracking-widest">Selected Vendor</p>
                                                                                                        )}
                                                                                                        {vendorSubtitle && (
                                                                                                            <p className="text-[9px] font-bold text-primary/50 uppercase tracking-widest">{vendorSubtitle}</p>
                                                                                                        )}
                                                                                                        {optionLocation && (
                                                                                                            <p className="text-[9px] font-bold text-primary/45 uppercase tracking-widest">{optionLocation}</p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="mt-2 space-y-1.5">
                                                                                                    {optionRows.map((row, rowIndex) => {
                                                                                                        const rowServiceId = row?.id ? String(row.id).trim() : null;
                                                                                                        const selectionKey = `${key}:${optionVendorAuthId}:${rowServiceId || ''}`;
                                                                                                        const isSelecting = servicePickerSelectKey === selectionKey;
                                                                                                        const backendSelected = Boolean(vendorAuthId)
                                                                                                            && vendorAuthId === optionVendorAuthId
                                                                                                            && Boolean(selectedServiceId)
                                                                                                            && Boolean(rowServiceId)
                                                                                                            && selectedServiceId === rowServiceId;
                                                                                                        const localLock = servicePanelLockByService?.[serviceKey] || null;
                                                                                                        const localSelected = Boolean(localLock?.vendorAuthId)
                                                                                                            && localLock.vendorAuthId === optionVendorAuthId
                                                                                                            && Boolean(localLock?.serviceId)
                                                                                                            && Boolean(rowServiceId)
                                                                                                            && localLock.serviceId === rowServiceId;
                                                                                                        const isSelected = backendSelected || localSelected;

                                                                                                        return (
                                                                                                            <div key={`${selectionKey}:${rowIndex}`} className="flex items-center justify-between gap-3 rounded-lg border border-white bg-white px-3 py-2">
                                                                                                                <div>
                                                                                                                    <p className="text-[11px] font-bold text-primary">{row?.title || 'Service Option'}</p>
                                                                                                                    {row?.caption && (
                                                                                                                        <p className="text-[9px] font-bold text-primary/50 uppercase tracking-widest">{row.caption}</p>
                                                                                                                    )}
                                                                                                                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                                                                                                        {formatMoneyRangeFromBasePrice(row?.price, {
                                                                                                                            serviceLabel: key,
                                                                                                                            guestCount: pricingDemand?.attendeeCount,
                                                                                                                            dayCount: pricingDemand?.dayCount,
                                                                                                                        })}
                                                                                                                    </p>
                                                                                                                </div>
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() => selectVendorForService({
                                                                                                                        serviceLabel: key,
                                                                                                                        vendorAuthId: optionVendorAuthId,
                                                                                                                        serviceId: rowServiceId,
                                                                                                                        price: row?.price,
                                                                                                                        selectionScope: 'service-panel',
                                                                                                                    })}
                                                                                                                    disabled={!optionVendorAuthId || isSelecting || isSelected}
                                                                                                                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-primary text-white hover:opacity-95 disabled:opacity-60"
                                                                                                                >
                                                                                                                    {isSelecting ? 'Locking…' : (isSelected ? 'Locked' : 'Select')}
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        );
                                                                                                    })}
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-xs font-medium text-primary/70">No options found for this date and service.</p>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "billing" && (
                    <div className="space-y-8 animate-fade-in-up">
                        {!canShowBillingDetails ? (
                            <div className="bg-white rounded-4xl p-10 shadow-sm border border-primary/5">
                                <h2 className="text-xl font-serif-premium text-[#0b2d49] mb-2">Bills & Payment</h2>
                                <p className="text-xs text-primary/60">
                                    Billing details are available once this event reaches <span className="font-bold">CONFIRMED</span> status.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-4xl p-10 shadow-sm border border-primary/5">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-2">Billing Overview</p>
                                        <h2 className="text-xl font-serif-premium text-[#0b2d49] mb-1">
                                            {isUserCompletedStatus
                                                ? (remainingPaymentPaid ? 'Final Settlement Summary' : 'Final Settlement')
                                                : 'Payment Snapshot'}
                                        </h2>
                                        <p className="text-xs text-primary/60">
                                            {isUserCompletedStatus
                                                ? (remainingPaymentPaid
                                                    ? 'All captured payments and final dues for this event.'
                                                    : 'Event is completed. Pay remaining dues to finish vendor settlement.')
                                                : 'Event is confirmed. Track paid milestones and outstanding amount for this event.'}
                                        </p>
                                    </div>

                                    {isUserCompletedStatus && !remainingPaymentPaid && (
                                        <button
                                            onClick={handlePayRemainingAmount}
                                            disabled={remainingFlowActive || remainingDuePaise <= 0}
                                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                                (remainingFlowActive || remainingDuePaise <= 0)
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-primary text-white hover:opacity-95'
                                            }`}
                                        >
                                            {remainingFlowActive
                                                ? 'Processing…'
                                                : `Pay Remaining (${formatMoneyFromPaise(remainingDuePaise)})`}
                                        </button>
                                    )}
                                </div>

                                {isUserCompletedStatus && !remainingPaymentPaid && remainingFlowError && (
                                    <div className="mt-6 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                        {remainingFlowError}
                                    </div>
                                )}

                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-surface rounded-2xl p-4 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-1">Total Amount</p>
                                        <p className="text-lg font-black text-[#0b2d49]">{formatMoneyFromPaise(quoteDisplay.grandTotalPaise)}</p>
                                    </div>
                                    <div className="bg-surface rounded-2xl p-4 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-1">Total Paid</p>
                                        <p className="text-lg font-black text-[#0b2d49]">{formatMoneyFromPaise(paidMilestonesTotalPaise)}</p>
                                    </div>
                                    <div className="bg-surface rounded-2xl p-4 border border-primary/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/45 mb-1">Outstanding Due</p>
                                        <p className="text-lg font-black text-primary">{formatMoneyFromPaise(outstandingDuePaise)}</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="bg-surface rounded-2xl border border-primary/10 overflow-hidden">
                                        <div className="px-4 py-3 bg-white border-b border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/45">
                                            Price Breakdown
                                        </div>
                                        {quoteDisplay.lineItems.length > 0 ? (
                                            <div className="divide-y divide-primary/10">
                                                {quoteDisplay.lineItems.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-[#0b2d49] truncate">{item.serviceName}</p>
                                                            <p className="text-primary/60 truncate">{item.businessName}</p>
                                                        </div>
                                                        <p className="font-black text-[#0b2d49] shrink-0">{formatMoneyFromPaise(item.amountPaise)}</p>
                                                    </div>
                                                ))}
                                                {quoteDisplay.promotions.map((promotion) => (
                                                    <div key={promotion.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                                                        <p className="font-bold text-[#0b2d49]">Promotion: {promotion.name}</p>
                                                        <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(promotion.feePaise)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-4 py-4 text-xs text-primary/60">Price details are being prepared.</div>
                                        )}
                                    </div>

                                    <div className="bg-surface rounded-2xl border border-primary/10 overflow-hidden">
                                        <div className="px-4 py-3 bg-white border-b border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/45">
                                            Paid Breakdown
                                        </div>
                                        <div className="divide-y divide-primary/10 text-xs">
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <p className="font-bold text-[#0b2d49]">Deposit Fee</p>
                                                <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(depositPaidAmountPaise)}</p>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <p className="font-bold text-[#0b2d49]">Vendor Confirmation</p>
                                                <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(vendorConfirmationPaidAmountPaise)}</p>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <p className="font-bold text-[#0b2d49]">Remaining Payment</p>
                                                <p className="font-black text-[#0b2d49]">{formatMoneyFromPaise(remainingPaymentPaidAmountPaise)}</p>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3 bg-white/70">
                                                <p className="font-black text-[#0b2d49]">Total Paid</p>
                                                <p className="font-black text-primary">{formatMoneyFromPaise(paidMilestonesTotalPaise)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isConfirmedStatus && (
                                    <div className="mt-6 text-[11px] font-bold text-primary bg-surface border border-primary/10 rounded-xl px-4 py-3">
                                        Remaining payment is shown now and will be payable once this event reaches completed status.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "chat" && (
                    <div className="animate-fade-in-up">
                        {!hasManagerAssigned || isRejected ? (
                            <div className="bg-white rounded-4xl shadow-sm border border-primary/5 overflow-hidden flex flex-col h-175">
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-8 text-primary">
                                    <BsChatDots size={40} />
                                </div>
                                <h3 className="text-2xl font-serif-premium text-[#0b2d49] mb-3">Sync Unavailable</h3>
                                <p className="text-sm text-primary max-w-sm leading-relaxed">
                                    {!hasManagerAssigned
                                        ? 'Manager Sync will be unlocked once a manager is assigned to your event.'
                                        : 'This event is not eligible for Manager Sync.'}
                                </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="bg-white rounded-4xl p-8 shadow-sm border border-primary/5 h-fit text-center">
                                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-accent mx-auto mb-6">
                                        <div className="w-full h-full rounded-full border-4 border-white bg-white flex items-center justify-center">
                                            <span className="text-4xl font-black text-primary tracking-wider">{managerDetails.badge}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-serif-premium italic text-primary mb-1">{managerDetails.name}</h3>
                                    <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-6">{managerDetails.role}</p>

                                    <div
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 ${managerOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${managerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                        {managerOnline ? 'Online' : 'Offline'}
                                    </div>
                                </div>

                                <div className="lg:col-span-2 bg-white rounded-4xl shadow-sm border border-primary/5 overflow-hidden flex flex-col h-[600px]">
                                    <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-surface/30">
                                        <div>
                                            <h4 className="font-bold text-primary">Strategy Sync</h4>
                                            <p className="text-[10px] uppercase tracking-wider text-primary/50">
                                                Last active: {managerOnline ? 'Now' : 'Recently'}
                                            </p>
                                        </div>
                                        <BsThreeDotsVertical className="text-primary/40" />
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-surface" ref={messagesViewportRef} onScroll={handleMessagesScroll}>
                                        <div className="flex justify-center mb-8">
                                            <span className="px-4 py-1.5 bg-surface text-primary/60 text-[9px] font-bold rounded-full uppercase tracking-widest">Today</span>
                                        </div>
                                        {messages.map((msg, idx) => {
                                            const msgId = String(msg?._id || msg?.id || idx);
                                            const isMe = String(msg?.senderAuthId || msg?.senderId || '') === currentUserId;
                                            const dt = msg?.createdAt ? new Date(msg.createdAt) : null;
                                            const time = dt && !Number.isNaN(dt.getTime())
                                                ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : '';
                                            const attachments = Array.isArray(msg?.attachments) ? msg.attachments : [];

                                            return (
                                                <div key={msgId} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[60%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white text-[#0b2d49] border border-gray-100 rounded-bl-none'}`}>
                                                        {editingMessageId === msgId ? (
                                                            <div className="space-y-3">
                                                                <textarea
                                                                    className={`w-full rounded-xl p-3 text-sm outline-none border ${isMe ? 'bg-white/10 text-white border-white/20' : 'bg-gray-50 text-[#0b2d49] border-gray-200'}`}
                                                                    value={editInput}
                                                                    onChange={(e) => setEditInput(e.target.value)}
                                                                    autoFocus
                                                                />
                                                                <div className="flex justify-end gap-3 text-[10px] font-black uppercase tracking-widest">
                                                                    <button type="button" onClick={() => setEditingMessageId(null)} className={isMe ? 'text-white/70' : 'text-[#0b2d49]/60'}>Cancel</button>
                                                                    <button type="button" onClick={() => handleSubmitEdit(msg)} className={isMe ? 'text-white' : 'text-[#0b2d49]'}>Save</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            renderRichAlternatives(msg, isMe) || (msg?.text ? <p>{msg.text}</p> : null)
                                                        )}
                                                        {attachments.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                {attachments.map((a) => {
                                                                    const url = a?.url;
                                                                    const name = a?.originalName || a?.filename || 'Attachment';
                                                                    const type = (a?.mimetype || '').toLowerCase();
                                                                    const resolvedUrl = resolveChatAssetUrl(url);
                                                                    const isImage = type.startsWith('image/') || (resolvedUrl && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(resolvedUrl));
                                                                    if (!url) return null;

                                                                    return isImage ? (
                                                                        <button
                                                                            key={`${String(url)}-${name}`}
                                                                            type="button"
                                                                            onClick={() => openAttachmentWithAuth({ url, filename: name, mimetype: type })}
                                                                            className="block"
                                                                            title="Open image"
                                                                        >
                                                                            <img src={resolvedUrl} alt={name} className="max-h-60 rounded-xl border border-black/5" />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            key={`${String(url)}-${name}`}
                                                                            type="button"
                                                                            onClick={() => openAttachmentWithAuth({ url, filename: name, mimetype: type })}
                                                                            className={`block text-left text-xs font-black uppercase tracking-widest underline underline-offset-4 ${isMe ? 'text-white/80' : 'text-primary/60'}`}
                                                                            title="Open attachment"
                                                                        >
                                                                            {name}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                        <div className="mt-2 flex items-center justify-end gap-3">
                                                            {(msg?.editedAt || msg?.isEdited) ? (
                                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isMe ? 'text-white/60' : 'text-gray-300'}`}>edited</span>
                                                            ) : null}
                                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${isMe ? 'text-white/60' : 'text-gray-300'}`}>{time}</p>
                                                            {isMe && editingMessageId !== msgId ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleStartEdit(msg)}
                                                                    className={`text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-white/70 hover:text-white' : 'text-[#0b2d49]/60 hover:text-[#0b2d49]'}`}
                                                                >
                                                                    Edit
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="p-6 bg-white border-t border-primary/10">
                                        <form onSubmit={handleSendMessage} className="flex gap-4 relative">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAttachClick}
                                                className="w-12 bg-surface text-primary rounded-2xl flex items-center justify-center hover:bg-surface/80 transition-all"
                                                title="Attach files"
                                            >
                                                <BsPaperclip size={16} />
                                            </button>
                                            <input
                                                type="text"
                                                value={chatMessage}
                                                onChange={(e) => setChatMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1 bg-surface border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 text-[#0b2d49] placeholder:text-gray-400"
                                            />
                                            <button type="submit" className="absolute right-2 top-2 bottom-2 w-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all shadow-md">
                                                <BsSend size={18} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
    };

export default UserEventManagement;
