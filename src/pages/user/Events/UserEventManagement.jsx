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
import { BsArrowLeft, BsChatDots, BsCheckCircleFill, BsClock, BsSend, BsFileEarmarkZip, BsDownload, BsCircle, BsTicketPerforated, BsPaperclip, BsThreeDotsVertical } from "react-icons/bs";
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

const UserEventManagement = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
    const currentUserId = resolveAuthId({ user, accessToken }) || String(user?.id || user?._id || '').trim();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // "overview" (Command Center) or "chat" (Manager Sync)
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

    const lastAltSyncRef = useRef({});

    const pricingDemand = React.useMemo(() => derivePricingDemandFromEvent(event || {}), [event]);

    const latestAltMessageIdByService = React.useMemo(() => {
        const latestByService = {};
        const list = Array.isArray(messages) ? messages : [];

        const normalizeServiceKey = (value) => String(value || '').trim().toLowerCase();
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
            const serviceKey = normalizeServiceKey(payload?.serviceLabel || payload?.service || payload?.serviceCategory);
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

    const selectVendorForService = async ({ serviceLabel, vendorAuthId, serviceId, price, sourceMessageId }) => {
        if (!eventId) return;

        try {
            const normalizedServiceId = serviceId != null && String(serviceId).trim() ? String(serviceId).trim() : null;
            setSelectingAltKey(`${serviceLabel}:${vendorAuthId}:${normalizedServiceId || ''}`);

            const servicePrice = computeMoneyRangeFromBase({
                basePrice: price,
                guestCount: pricingDemand?.attendeeCount,
                dayCount: pricingDemand?.dayCount,
                serviceLabel,
            });

            const res = await fetchWithAuth(
                `${EVENTS_API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}/vendors`,
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

            dispatch(fetchPlanningVendorSelectionByEventId(String(eventId)));
            setLockedAltByService((prev) => ({
                ...prev,
                [String(serviceLabel || '').trim().toLowerCase()]: String(vendorAuthId || '').trim(),
            }));
            setLockedAltServiceIdByService((prev) => ({
                ...prev,
                [String(serviceLabel || '').trim().toLowerCase()]: normalizedServiceId,
            }));
            setLockedAltMessageIdByService((prev) => ({
                ...prev,
                [String(serviceLabel || '').trim().toLowerCase()]: sourceMessageId != null ? String(sourceMessageId).trim() : null,
            }));
            toast.success('Vendor selected');
        } catch (e) {
            toast.error(e?.message || 'Failed to select vendor');
        } finally {
            setSelectingAltKey(null);
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

        const normalizeService = (s) => String(s || '').trim().toLowerCase();
        const normalizeServiceId = (id) => {
            const s = id != null ? String(id).trim() : '';
            return s || null;
        };
        const serviceKey = normalizeService(serviceLabel);
        const statusForService = (() => {
            const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
            const match = list.find((v) => normalizeService(v?.service) === serviceKey);
            return String(match?.status || '').trim().toUpperCase();
        })();
        const isRejected = Boolean(statusForService) && statusForService.includes('REJECT');

        const latestIdForService = latestAltMessageIdByService?.[serviceKey] || null;
        const localLockMsgId = lockedAltMessageIdByService?.[serviceKey] != null ? String(lockedAltMessageIdByService[serviceKey]).trim() : null;
        const isLocalLockValid = !latestIdForService ? true : (Boolean(localLockMsgId) && localLockMsgId === latestIdForService);

        const lockedVendorAuthIdLocal = (isRejected || !isLocalLockValid) ? null : (lockedAltByService?.[serviceKey] || null);
        const lockedVendorAuthIdFromStore = (() => {
            const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
            const match = list.find((v) => normalizeService(v?.service) === serviceKey);
            const status = String(match?.status || '').trim().toUpperCase();
            if (status && status.includes('REJECT')) return null;
            if (match?.alternativeNeeded === true) return null;
            const id = match?.vendorAuthId != null ? String(match.vendorAuthId).trim() : '';
            return id || null;
        })();
        const lockedVendorAuthId = lockedVendorAuthIdLocal || lockedVendorAuthIdFromStore || null;

        const lockedServiceIdFromStore = (() => {
            const list = Array.isArray(planningVendorSelection?.vendors) ? planningVendorSelection.vendors : [];
            const match = list.find((v) => normalizeService(v?.service) === serviceKey);
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
                            vendorConfirmationPaid: Boolean(p?.vendorConfirmationPaid),
                            assignedManagerId: p?.assignedManagerId || null,
                            managerProfile: p?.managerProfile || null,
                            guestCount: typeof p?.guestCount === 'number' ? p.guestCount : null,
                            ticketTiers: Array.isArray(p?.tickets?.tiers) ? p.tickets.tiers : [],
                            ticketDayWiseAllocations: Array.isArray(p?.tickets?.dayWiseAllocations) ? p.tickets.dayWiseAllocations : [],
                            eventDescription: typeof p?.eventDescription === 'string' ? p.eventDescription : null,
                            selectedServices,
                            selectedVendors,
                            vendorSelectionVendors: [],
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
                            selectedServices: [],
                            selectedVendors: [],
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
    const isApproved = normalizedStatus === 'APPROVED';
    const vendorConfirmationPaid = Boolean(event?.vendorConfirmationPaid);
    const depositPaid = Boolean(event?.depositPaid);

    const quoteLatest = useSelector((state) => selectPlanningQuoteLatestByEventId(state, planningEventId));

    const [confirmFlowActive, setConfirmFlowActive] = useState(false);
    const [confirmFlowError, setConfirmFlowError] = useState(null);

    useEffect(() => {
        if (!planningEventId) return;
        if (!isApproved || vendorConfirmationPaid) return;
        dispatch(fetchPlanningQuoteLatest(planningEventId));
    }, [dispatch, planningEventId, isApproved, vendorConfirmationPaid]);

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

        const toKey = (vendorAuthId, service) => {
            const vendorKey = String(vendorAuthId || '').trim().toLowerCase();
            const serviceKey = String(service || '').trim().toLowerCase();
            if (!vendorKey || !serviceKey) return null;
            return `${vendorKey}::${serviceKey}`;
        };

        const selectionMetaByKey = new Map();
        for (const row of selectionVendors) {
            const vendorAuthId = String(row?.vendorAuthId || '').trim();
            const key = toKey(vendorAuthId, row?.service);
            if (!key) continue;

            const quantityNumber = Number(row?.pricingQuantity);
            const hasQuantityNumber = Number.isFinite(quantityNumber) && quantityNumber > 0;
            const quantityUnit = String(row?.pricingQuantityUnit || row?.pricingUnit || '').trim();
            const quantity = hasQuantityNumber
                ? `${quantityNumber}${quantityUnit ? ` ${quantityUnit}` : ''}`
                : (quantityUnit || '—');

            const profile = profileByAuthId.get(vendorAuthId) || null;
            const businessName = String(
                profile?.businessName ||
                profile?.name ||
                row?.businessName ||
                ''
            ).trim();
            const serviceName = String(row?.serviceName || row?.service || '').trim();

            selectionMetaByKey.set(key, {
                businessName: businessName || 'Vendor',
                serviceName: serviceName || 'Service',
                quantity,
            });
        }

        const lineItems = (Array.isArray(quoteLatest?.items) ? quoteLatest.items : []).map((item, idx) => {
            const vendorAuthId = String(item?.vendorAuthId || '').trim();
            const key = toKey(vendorAuthId, item?.service);
            const meta = key ? selectionMetaByKey.get(key) : null;

            const amountPaise = Number(
                item?.clientTotal?.minPaise ??
                item?.clientTotal?.maxPaise ??
                0
            );

            return {
                id: `${vendorAuthId || 'vendor'}:${String(item?.service || 'service')}:${idx}`,
                businessName: meta?.businessName || 'Vendor',
                serviceName: meta?.serviceName || String(item?.service || 'Service').trim() || 'Service',
                quantity: meta?.quantity || '—',
                amountPaise: Number.isFinite(amountPaise) ? amountPaise : 0,
            };
        });

        const promotions = (Array.isArray(quoteLatest?.promotions) ? quoteLatest.promotions : []).map((promotion, idx) => ({
            id: `${String(promotion?.value || 'promotion')}:${idx}`,
            name: String(promotion?.value || '').trim() || 'Promotion',
            feePaise: Number(promotion?.feePaise || 0),
        }));

        const grandTotalPaise = Number(
            quoteLatest?.clientGrandTotal?.minPaise ??
            quoteLatest?.clientGrandTotal?.maxPaise ??
            0
        );

        return {
            lineItems,
            promotions,
            grandTotalPaise: Number.isFinite(grandTotalPaise) ? grandTotalPaise : 0,
        };
    }, [quoteLatest, planningVendorSelection]);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center pt-28">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!event) return null;

    const isPromote = String(event?.kind || '').toUpperCase() === 'PROMOTE';
    const isPublicListing = isPromote || String(event?.listingType || '').toLowerCase() === 'public';
    const isPrivateListing = !isPromote && String(event?.listingType || '').toLowerCase() === 'private';
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
    const selectedVendors = Array.isArray(event?.selectedVendors) ? event.selectedVendors : [];
    const vendorByService = new Map(selectedVendors.map((v) => [String(v?.service || '').trim(), v]));

    const vendorSelectionVendors = Array.isArray(event?.vendorSelectionVendors) ? event.vendorSelectionVendors : [];
    const vendorSelectionByService = new Map(vendorSelectionVendors.map((v) => [String(v?.service || '').trim(), v]));

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

    const toVendorStatus = (raw) => {
        const s = String(raw || '').trim().toUpperCase();
        if (s === 'ACCEPTED') return { key: 'accepted', label: 'accepted', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        if (s === 'REJECTED') return { key: 'reject', label: 'reject', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
        // Backend uses YET_TO_SELECT; UI requirement says yet_to_accept.
        return { key: 'yet_to_accept', label: 'yet_to_accept', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
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

    const displayStatus = isPendingApproval
        ? 'Pending Approval'
        : isLive
            ? 'Live'
            : isRejected
                ? 'Rejected'
                : isCompleted
                    ? 'Completed'
                : (event?.status || '');

    const steps = [
        {
            id: 1,
            label: 'Application Received',
            status: hasManagerAssigned || isLive || isRejected || isCompleted ? 'completed' : 'current',
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
                ? (isPendingApproval ? 'current' : (isLive || isRejected || isCompleted) ? 'completed' : 'current')
                : 'pending',
        },
        {
            id: 4,
            label: isRejected ? 'Rejected' : isCompleted ? 'Completed' : 'Success / Live',
            status: (isLive || isRejected || isCompleted) ? 'completed' : 'pending',
        },
    ];

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
                                        {confirmFlowActive ? 'Processing…' : 'Pay Vendor Confirmation (25%)'}
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

                                {quoteLatest && (
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
                                            <div className="flex items-center justify-between gap-6">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Total Amount</p>
                                                    <p className="text-3xl font-black text-[#0b2d49]">{formatMoneyFromPaise(quoteDisplay.grandTotalPaise)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Demand Tier</p>
                                                    <p className="text-xs font-black text-primary">{String(quoteLatest?.demandTier || 'NORMAL').replace(/_/g, ' ')}</p>
                                                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary/40">Locked Version</p>
                                                    <p className="text-xs font-black text-primary">v{quoteLatest?.version || 1}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                <div className="absolute top-4 left-0 h-0.5 bg-primary/20 transition-all duration-1000" style={{ width: isPendingApproval ? '33%' : '66%' }} />

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
                                        <h3 className="text-sm font-serif-premium text-primary mb-6">Services & Vendors</h3>

                                        {selectedServices.length === 0 ? (
                                            <div className="bg-surface rounded-xl p-6 text-sm text-[#0b2d49]/70">
                                                No services selected yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedServices.map((serviceName, i) => {
                                                    const key = String(serviceName || '').trim();
                                                    const vendor = vendorByService.get(key);
                                                    const vendorSel = vendorSelectionByService.get(key);
                                                    const optedServiceName = String(vendorSel?.service || vendor?.service || key || '').trim() || 'Service';
                                                    const servicePriceMinRaw = Number(vendorSel?.servicePrice?.min ?? vendor?.servicePrice?.min ?? 0);
                                                    const servicePriceMaxRaw = Number(vendorSel?.servicePrice?.max ?? vendor?.servicePrice?.max ?? 0);
                                                    const servicePriceMin = Number.isFinite(servicePriceMinRaw) && servicePriceMinRaw > 0
                                                        ? servicePriceMinRaw
                                                        : 0;
                                                    const servicePriceMax = Number.isFinite(servicePriceMaxRaw) && servicePriceMaxRaw > 0
                                                        ? servicePriceMaxRaw
                                                        : (servicePriceMin > 0 ? Math.ceil(servicePriceMin * 1.5) : 0);
                                                    const hasQuotedPrice = servicePriceMin > 0 || servicePriceMax > 0;
                                                    const vendorStatusRaw = vendorSel?.status || (vendor?.vendorAuthId ? 'ACCEPTED' : 'YET_TO_SELECT');
                                                    const vendorStatus = toVendorStatus(vendorStatusRaw);
                                                    const vendorAuthId = vendorSel?.vendorAuthId || vendor?.vendorAuthId || null;

                                                    return (
                                                        <div key={`${key}-${i}`} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-surface/50 transition-all">
                                                            <div>
                                                                <p className="text-xs font-bold text-[#0b2d49]">{key || 'Service'}</p>
                                                                <p className="text-[9px] font-bold text-primary/55 uppercase tracking-widest">
                                                                    Opted: {optedServiceName}
                                                                </p>
                                                                <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">
                                                                    Price: {hasQuotedPrice ? `₹${formatInr(servicePriceMin)} - ₹${formatInr(servicePriceMax)}` : 'Not quoted yet'}
                                                                </p>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                    Vendor: {vendorAuthId ? String(vendorAuthId).slice(0, 10) + '…' : 'Not selected'}
                                                                </p>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${vendorStatus.badge}`}>
                                                                {vendorStatus.label}
                                                            </span>
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
