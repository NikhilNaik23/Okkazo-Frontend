import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
    CheckCircle, Clock, XCircle, MapPin, Star, RefreshCw, Send, Wallet,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    fetchPlanningByEventId,
    fetchPlanningVendorSelectionByEventId,
    selectPlanningVendorSelectionByEventId,
} from '../../../../store/slices/planningSlice';
import { fetchWithAuth } from '../../../../utils/apiHandler';
import { refreshAccessToken } from '../../../../store/slices/authSlice';
import { ensureEventConversation, ensureEventDmConversation, sendConversationMessage } from '../../../../utils/chatApi';
import { encodeRichChatMessage } from '../../../../utils/richChat';
import { computeMoneyRangeFromBase, derivePricingDemandFromEvent } from '../../../../utils/pricing';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const DEFAULT_VENDOR_RADIUS_KM = 120;

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const formatServiceLabel = (service) => {
    const raw = String(service || '').trim();
    if (!raw) return 'Service';
    return raw
        .toLowerCase()
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
};

const formatMoneyShort = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return '—';
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const toPayoutKey = (vendorAuthId, service) => {
    const a = String(vendorAuthId || '').trim().toLowerCase();
    const b = String(service || '').trim().toLowerCase();
    if (!a || !b) return null;
    return `${a}::${b}`;
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

const buildAlternativesMessage = ({ serviceLabel, alternatives = [], radiusKm } = {}) => {
    const count = Array.isArray(alternatives) ? alternatives.length : 0;
    if (count === 0) return `No alternative vendors found for ${serviceLabel} right now.`;
    const n = Number(radiusKm);
    const withinText = Number.isFinite(n) && n > 0 ? ` (within ${n} km of the event)` : '';
    return `The vendor for ${serviceLabel} is not available. Please select one of the alternatives${withinText}.`;
};

const normalizeVendorSlotServicePrice = ({ price, min, guestCount, dayCount, serviceLabel } = {}) => {
    return computeMoneyRangeFromBase({
        basePrice: price ?? min,
        guestCount,
        dayCount,
        serviceLabel,
    });
};

const VendorsTab = () => {
    const { id: eventId } = useParams();
    const dispatch = useDispatch();

    const vendorSelection = useSelector((state) => selectPlanningVendorSelectionByEventId(state, eventId));
    const vendorSelectionStatus = useSelector((state) => state?.planning?.vendorSelectionStatus);
    const vendorSelectionError = useSelector((state) => state?.planning?.vendorSelectionError);

    const [showAlternatives, setShowAlternatives] = useState(null);
    const [alternativesByKey, setAlternativesByKey] = useState({});
    const [guestCountForPricing, setGuestCountForPricing] = useState(null);
    const [dayCountForPricing, setDayCountForPricing] = useState(1);
    const [clientAuthId, setClientAuthId] = useState('');
    const [planningStatus, setPlanningStatus] = useState('');
    const [isSendingQuotationEmail, setIsSendingQuotationEmail] = useState(false);
    const [payoutsByKey, setPayoutsByKey] = useState({});
    const [payoutLoadingByKey, setPayoutLoadingByKey] = useState({});
    const [vendorPayoutMode, setVendorPayoutMode] = useState('DEMO');

    // Make Manual Payout Modal state
    const [manualPayoutVendor, setManualPayoutVendor] = useState(null);
    const [manualPayoutAmountInr, setManualPayoutAmountInr] = useState('');
    const [isSubmittingManualPayout, setIsSubmittingManualPayout] = useState(false);
    const [cancellationBalance, setCancellationBalance] = useState({
        available: false,
        grossPaidInr: 0,
        refundAmountInr: 0,
        remainingAfterRefundInr: 0,
    });

    const applyCancellationBalanceFromPlanning = useCallback((planningPayload) => {
        const grossPaidPaise = Number(planningPayload?.refundRequest?.result?.grossPaidAmountPaise || 0);
        const refundAmountPaise = Number(planningPayload?.refundRequest?.result?.refundAmountPaise || 0);

        const grossPaidInr = Number.isFinite(grossPaidPaise) && grossPaidPaise > 0
            ? grossPaidPaise / 100
            : 0;
        const refundAmountInr = Number.isFinite(refundAmountPaise) && refundAmountPaise > 0
            ? refundAmountPaise / 100
            : 0;
        const remainingAfterRefundInr = Math.max(0, grossPaidInr - refundAmountInr);

        setCancellationBalance({
            available: grossPaidInr > 0 || refundAmountInr > 0,
            grossPaidInr,
            refundAmountInr,
            remainingAfterRefundInr,
        });
    }, []);

    const selectVendorForService = async ({ service, vendorAuthId, serviceId, price }) => {
        if (!eventId) return;

        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}/vendors`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service,
                        vendorAuthId,
                        serviceId: serviceId || null,
                        status: 'YET_TO_SELECT',
                        rejectionReason: null,
                        alternativeNeeded: false,
                        servicePrice: normalizeVendorSlotServicePrice({
                            price,
                            guestCount: guestCountForPricing,
                            dayCount: dayCountForPricing,
                            serviceLabel: service,
                        }),
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to select vendor');
            }

            dispatch(fetchPlanningVendorSelectionByEventId(eventId));
            toast.success('Vendor selected');
        } catch (e) {
            toast.error(e?.message || 'Failed to select vendor');
        }
    };

    const fetchAlternatives = async ({ service, cardKey }) => {
        if (!eventId || !service || !cardKey) return;

        setAlternativesByKey((prev) => ({
            ...prev,
            [cardKey]: { status: 'loading', error: null, service, alternatives: [], vendorProfiles: [] },
        }));

        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(String(eventId))}/alternatives?service=${encodeURIComponent(String(service))}&limit=50`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to load alternatives');
            }

            const data = json.data || {};
            setAlternativesByKey((prev) => ({
                ...prev,
                [cardKey]: {
                    status: 'succeeded',
                    error: null,
                    service,
                    alternatives: Array.isArray(data.alternatives) ? data.alternatives : [],
                    vendorProfiles: Array.isArray(data.vendorProfiles) ? data.vendorProfiles : [],
                },
            }));
        } catch (e) {
            setAlternativesByKey((prev) => ({
                ...prev,
                [cardKey]: {
                    status: 'failed',
                    error: e?.message || 'Failed to load alternatives',
                    service,
                    alternatives: [],
                    vendorProfiles: [],
                },
            }));
        }
    };

    const sendAlternativesToClient = async ({ serviceLabel, alternatives, vendorProfiles }) => {
        try {
            if (!eventId) throw new Error('Missing eventId');

            const convo = clientAuthId
                ? await ensureEventDmConversation({
                    eventId,
                    otherAuthId: clientAuthId,
                    dispatch,
                    refreshAction: refreshAccessToken,
                })
                : await ensureEventConversation({
                    eventId,
                    dispatch,
                    refreshAction: refreshAccessToken,
                });

            const conversationId = String(convo?._id || convo?.id || '').trim();
            if (!conversationId) throw new Error('Invalid conversation');

            const altList = Array.isArray(alternatives) ? alternatives : [];

            const profileByAuthId = new Map(
                (Array.isArray(vendorProfiles) ? vendorProfiles : [])
                    .map((p) => [String(p?.authId || '').trim(), p])
                    .filter(([k]) => Boolean(k))
            );

            const options = altList
                .slice(0, 10)
                .map((a) => {
                    const vendorAuthId = String(a?.vendorAuthId || a?.authId || '').trim();
                    const profile = vendorAuthId ? profileByAuthId.get(vendorAuthId) : null;

                    const services = Array.isArray(a?.services)
                        ? a.services
                            .slice(0, 12)
                            .map((s) => ({
                                serviceId: s?.serviceId || s?._id || s?.id || null,
                                name: s?.name || null,
                                tier: s?.tier || null,
                                price: s?.price != null ? Number(s.price) : null,
                                description: s?.description || null,
                                details: s?.details || null,
                                rating: s?.rating != null ? Number(s.rating) : null,
                            }))
                        : [];

                    return {
                        vendorAuthId: vendorAuthId || null,
                        serviceId: a?.serviceId || null,
                        name: a?.name || null,
                        businessName: a?.businessName || profile?.businessName || 'Vendor',
                        tier: a?.tier || null,
                        price: a?.price != null ? Number(a.price) : null,
                        priceMin: a?.priceMin != null ? Number(a.priceMin) : null,
                        priceMax: a?.priceMax != null ? Number(a.priceMax) : null,
                        serviceCategory: a?.serviceCategory || profile?.serviceCategory || null,
                        distanceKm: a?.distanceKm != null ? Number(a.distanceKm) : null,
                        distanceText: a?.distanceText || null,
                        services,
                        // Prefer per-option (service-level) location when present.
                        location: a?.location || profile?.location || profile?.place || null,
                        country: profile?.country || null,
                        description: profile?.description || a?.description || null,
                    };
                })
                .filter((o) => o.vendorAuthId);

            const derivedRadiusKm = options.some((o) => Number.isFinite(Number(o?.distanceKm)))
                ? DEFAULT_VENDOR_RADIUS_KM
                : null;

            const fallbackText = buildAlternativesMessage({ serviceLabel, alternatives: altList, radiusKm: derivedRadiusKm });
            const rich = encodeRichChatMessage({
                kind: 'vendorAlternatives',
                payload: {
                    eventId: String(eventId),
                    serviceLabel,
                    radiusKm: derivedRadiusKm,
                    options,
                },
            });

            const text = `${fallbackText}\n\n${rich}`;
            await sendConversationMessage({
                conversationId,
                text,
                dispatch,
                refreshAction: refreshAccessToken,
            });

            toast.success('Sent options to client');
        } catch (e) {
            toast.error(e?.message || 'Failed to send options');
        }
    };

    const sendQuotationMailToClient = async () => {
        if (!eventId || isSendingQuotationEmail) return;

        setIsSendingQuotationEmail(true);
        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(eventId))}/quote/send-email`,
                {
                    method: 'POST',
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to send quotation email');
            }

            toast.success(json?.message || 'Quotation email sent');
        } catch (e) {
            toast.error(e?.message || 'Failed to send quotation email');
        } finally {
            setIsSendingQuotationEmail(false);
        }
    };

    const fetchEventPayouts = useCallback(async () => {
        if (!eventId) return;

        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL}/api/orders/vendor-payouts/event/${encodeURIComponent(String(eventId))}`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                return;
            }

            const rows = Array.isArray(json?.data?.payouts) ? json.data.payouts : [];
            const next = {};
            rows.forEach((row) => {
                const key = toPayoutKey(row?.vendorAuthId, row?.service);
                if (key) next[key] = row;
            });
            setPayoutsByKey(next);
        } catch {
            // best-effort only
        }
    }, [dispatch, eventId]);

    const fetchPaymentSettings = useCallback(async () => {
        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL}/api/orders/settings`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                return;
            }

            const mode = String(json?.data?.vendorPayoutMode || 'DEMO').trim().toUpperCase();
            setVendorPayoutMode(mode === 'RAZORPAY' ? 'RAZORPAY' : 'DEMO');
        } catch {
            // best-effort only
        }
    }, [dispatch]);

    const handleReleaseVendorPayout = async (vendor) => {
        if (!eventId || !vendor?.vendorAuthId || !vendor?.service) return;

        if (normalizedPlanningStatus === 'CANCELLED' && !manualPayoutVendor) {
            if (remainingVendorBudgetInr <= 0) {
                toast.error('No amount remains after refund to release vendor payouts.');
                return;
            }

            setManualPayoutVendor(vendor);
            const suggestedAmount = Math.min(
                Math.max(0, Number(vendor.payoutAmount || 0)),
                remainingVendorBudgetInr
            );
            setManualPayoutAmountInr(String(Math.round(suggestedAmount)));
            return;
        }

        const overrideInr = Number(manualPayoutAmountInr);
        const hasOverride = manualPayoutVendor && Number.isFinite(overrideInr) && overrideInr > 0;
        const targetVendor = manualPayoutVendor || vendor;
        const targetKey = toPayoutKey(targetVendor.vendorAuthId, targetVendor.service);
        if (!targetKey) return;

        if (hasOverride && overrideInr > remainingVendorBudgetInr) {
            toast.error(`Entered payout exceeds remaining balance (${formatMoneyShort(remainingVendorBudgetInr)}).`);
            return;
        }

        if (hasOverride) {
            setIsSubmittingManualPayout(true);
        } else {
            setPayoutLoadingByKey((prev) => ({ ...prev, [targetKey]: true }));
        }

        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL}/api/orders/vendor-payouts/release`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        eventId: String(eventId),
                        vendorAuthId: String(targetVendor.vendorAuthId),
                        service: String(targetVendor.service),
                        ...(hasOverride && { overrideAmountPaise: Math.round(overrideInr * 100) }),
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to release vendor payout');
            }

            const payout = json?.data?.payout;
            if (payout) {
                setPayoutsByKey((prev) => ({ ...prev, [targetKey]: payout }));
            }

            const responseMode = String(json?.data?.payoutMode || '').trim().toUpperCase();
            if (responseMode === 'DEMO' || responseMode === 'RAZORPAY') {
                setVendorPayoutMode(responseMode);
            }

            const successMessage = responseMode === 'DEMO'
                ? 'Demo payout marked successfully'
                : (json?.message || 'Vendor payout processed');
            toast.success(successMessage);
            fetchEventPayouts();

            if (manualPayoutVendor) {
                setManualPayoutVendor(null);
                setManualPayoutAmountInr('');
            }
        } catch (e) {
            toast.error(e?.message || 'Failed to release vendor payout');
        } finally {
            if (hasOverride) {
                setIsSubmittingManualPayout(false);
            }
            setPayoutLoadingByKey((prev) => ({ ...prev, [targetKey]: false }));
        }
    };

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchPlanningVendorSelectionByEventId(eventId));
        fetchEventPayouts();
        fetchPaymentSettings();
    }, [dispatch, eventId, fetchEventPayouts, fetchPaymentSettings]);

    useEffect(() => {
        let cancelled = false;
        if (!eventId) return () => {
            cancelled = true;
        };

        dispatch(fetchPlanningByEventId(String(eventId)))
            .then((action) => {
                if (cancelled) return;
                if (action?.meta?.requestStatus === 'fulfilled') {
                    const planningPayload = action?.payload || {};
                    const resolvedClientAuthId = String(
                        planningPayload?.authId
                        || planningPayload?.userAuthId
                        || planningPayload?.ownerAuthId
                        || ''
                    ).trim();
                    const status = String(planningPayload?.status || '').trim();
                    const pricingDemand = derivePricingDemandFromEvent(planningPayload);
                    setClientAuthId(resolvedClientAuthId);
                    setPlanningStatus(status);
                    setGuestCountForPricing(pricingDemand?.attendeeCount ?? null);
                    setDayCountForPricing(pricingDemand?.dayCount ?? 1);
                    applyCancellationBalanceFromPlanning(planningPayload);
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [applyCancellationBalanceFromPlanning, dispatch, eventId]);

    const vendors = useMemo(() => {
        const selectedServices = Array.isArray(vendorSelection?.selectedServices) ? vendorSelection.selectedServices : [];
        const selectionVendors = Array.isArray(vendorSelection?.vendors) ? vendorSelection.vendors : [];
        const profiles = Array.isArray(vendorSelection?.vendorProfiles) ? vendorSelection.vendorProfiles : [];
        const profileByAuthId = new Map(
            profiles
                .map((p) => [String(p?.authId || '').trim(), p])
                .filter(([k]) => Boolean(k))
        );

        const vendorByService = new Map(
            selectionVendors
                .filter((v) => v?.service)
                .map((v) => [String(v.service).trim(), v])
        );

        return selectedServices
            .map((svc) => String(svc || '').trim())
            .filter(Boolean)
            .map((service) => {
                const v = vendorByService.get(service) || null;
                const vendorAuthId = v?.vendorAuthId != null ? String(v.vendorAuthId).trim() : '';
                const profile = vendorAuthId ? profileByAuthId.get(vendorAuthId) : null;

                const status = String(v?.status || 'YET_TO_SELECT');
                const availability =
                    status === 'ACCEPTED'
                        ? 'available'
                        : status === 'REJECTED'
                            ? 'unavailable'
                            : 'pending';

                const icon = (profile?.businessName || formatServiceLabel(service)).substring(0, 2).toUpperCase();
                const color = availability === 'available' ? 'blue' : availability === 'unavailable' ? 'orange' : 'purple';
                const serviceNameRaw = v?.serviceName != null ? String(v.serviceName).trim() : '';
                const serviceName = serviceNameRaw || formatServiceLabel(service);
                const normalizedServiceCategory = String(v?.serviceCategory || profile?.serviceCategory || '').trim().toLowerCase();
                const isVenueService = String(service || '').trim().toLowerCase() === 'venue' || normalizedServiceCategory === 'venue';
                const serviceLocationRaw = v?.serviceLocation != null ? String(v.serviceLocation).trim() : '';
                const locationFromProfile = profile?.location || profile?.place || null;
                const resolvedLocation = isVenueService && serviceLocationRaw ? serviceLocationRaw : locationFromProfile;
                const resolvedCountry = isVenueService && serviceLocationRaw ? null : (profile?.country || null);
                const displayName = vendorAuthId
                    ? (profile?.businessName || 'Vendor')
                    : 'Yet to select';

                const quotedPriceRaw = Number(v?.vendorQuotedPrice);
                const quotedPrice = Number.isFinite(quotedPriceRaw) && quotedPriceRaw > 0 ? quotedPriceRaw : 0;

                const commissionAmountRaw = Number(v?.commissionAmount);
                const commissionAmount = Number.isFinite(commissionAmountRaw) && commissionAmountRaw >= 0
                    ? commissionAmountRaw
                    : 0;

                const commissionPercentRaw = Number(v?.commissionPercent);
                const commissionPercent = Number.isFinite(commissionPercentRaw) && commissionPercentRaw >= 0
                    ? commissionPercentRaw
                    : 0;

                const minRaw = Number(v?.servicePrice?.min);
                const maxRaw = Number(v?.servicePrice?.max);
                const minPrice = Number.isFinite(minRaw) && minRaw > 0 ? minRaw : 0;
                const maxPrice = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : 0;

                const isPriceLocked = Boolean(v?.priceLocked) && quotedPrice > 0;
                const totalFees = isPriceLocked ? quotedPrice : 0;
                const payoutAmount = isPriceLocked ? Math.max(0, quotedPrice - commissionAmount) : 0;
                const payoutKey = vendorAuthId ? toPayoutKey(vendorAuthId, service) : null;
                const payout = payoutKey ? payoutsByKey[payoutKey] || null : null;

                return {
                    id: `${service}:${vendorAuthId || 'NONE'}`,
                    service,
                    category: formatServiceLabel(service),
                    serviceName,
                    serviceId: v?.serviceId || null,
                    vendorAuthId: vendorAuthId || null,
                    businessName: vendorAuthId ? (profile?.businessName || 'Vendor') : 'Yet to select',
                    displayName,
                    serviceCategory: v?.serviceCategory || profile?.serviceCategory || null,
                    location: resolvedLocation,
                    country: resolvedCountry,
                    description: profile?.description || null,
                    status,
                    availability,
                    rejectionReason: v?.rejectionReason || null,
                    alternativeNeeded: Boolean(v?.alternativeNeeded),
                    servicePrice: {
                        min: minPrice,
                        max: maxPrice,
                    },
                    lockedPrice: quotedPrice,
                    commissionAmount,
                    commissionPercent,
                    totalFees,
                    payoutAmount,
                    payoutKey,
                    payout,
                    priceLocked: isPriceLocked,
                    icon,
                    color,
                };
            });
    }, [vendorSelection, payoutsByKey]);

    const getAvailabilityBadge = (av) => {
        if (av === 'available') return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: '✅ Available', icon: CheckCircle };
        if (av === 'pending') return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: '⏳ Pending', icon: Clock };
        return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: '❌ Unavailable', icon: XCircle };
    };

    const normalizedPlanningStatus = String(planningStatus || '').trim().toUpperCase().replace(/_/g, ' ');
    const totalPaidToVendorsInr = useMemo(
        () => Object.values(payoutsByKey || {}).reduce((sum, row) => {
            const status = String(row?.status || '').trim().toUpperCase();
            if (status !== 'SUCCESS' && status !== 'INITIATED') return sum;

            const payoutAmountPaise = Number(row?.payoutAmountPaise || 0);
            if (!Number.isFinite(payoutAmountPaise) || payoutAmountPaise <= 0) return sum;
            return sum + (payoutAmountPaise / 100);
        }, 0),
        [payoutsByKey]
    );
    const remainingVendorBudgetInr = normalizedPlanningStatus === 'CANCELLED'
        ? Math.max(0, Number(cancellationBalance.remainingAfterRefundInr || 0) - totalPaidToVendorsInr)
        : 0;
    const canShowPayoutAction = normalizedPlanningStatus === 'VENDOR PAYMENT PENDING' || normalizedPlanningStatus === 'CANCELLED';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Vendor Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Verify availability, confirm vendors, and manage alternatives</p>
                    <p className="text-xs font-bold uppercase tracking-wide mt-1 text-indigo-600">Payout mode: {vendorPayoutMode}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={sendQuotationMailToClient}
                        disabled={isSendingQuotationEmail}
                        className="px-4 py-2.5 bg-teal-600 border border-teal-600 rounded-xl text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" /> {isSendingQuotationEmail ? 'Sending...' : 'Send Quotation Mail'}
                    </button>
                    <button
                        onClick={() => {
                            if (eventId) {
                                dispatch(fetchPlanningVendorSelectionByEventId(eventId));
                                dispatch(fetchPlanningByEventId(String(eventId))).then((action) => {
                                    if (action?.meta?.requestStatus === 'fulfilled') {
                                        const planningPayload = action?.payload || {};
                                        const status = String(planningPayload?.status || '').trim();
                                        setPlanningStatus(status);
                                        applyCancellationBalanceFromPlanning(planningPayload);
                                    }
                                });
                                fetchEventPayouts();
                                fetchPaymentSettings();
                            }
                        }}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            {normalizedPlanningStatus === 'CANCELLED' && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
                    <p className="text-sm font-semibold text-sky-800">
                        This event is cancelled. Vendor reservation days have been released, so vendors are available for those dates again.
                    </p>
                </div>
            )}

            {vendorSelectionStatus === 'loading' && vendors.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-sm text-gray-600 font-medium">Loading vendor details…</p>
                </div>
            )}

            {vendorSelectionStatus === 'failed' && (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                    <p className="text-sm text-red-700 font-bold">Failed to load vendors</p>
                    <p className="text-sm text-gray-600 mt-1">{vendorSelectionError || 'Please try again.'}</p>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Vendors</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{vendors.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Accepted</p>
                    <p className="text-2xl font-extrabold text-green-700 mt-1">{vendors.filter((v) => v.availability === 'available').length}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pending</p>
                    <p className="text-2xl font-extrabold text-amber-700 mt-1">{vendors.filter((v) => v.availability === 'pending').length}</p>
                </div>
                {normalizedPlanningStatus === 'CANCELLED' && cancellationBalance.available && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Remaining After Refund</p>
                        <p className="text-2xl font-extrabold text-indigo-700 mt-1">{formatMoneyShort(cancellationBalance.remainingAfterRefundInr)}</p>
                        <p className="text-[11px] font-semibold text-indigo-500 mt-1">
                            Paid to vendors: {formatMoneyShort(totalPaidToVendorsInr)}
                        </p>
                    </div>
                )}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Cost</p>
                    <p className="text-2xl font-extrabold text-teal-600 mt-1">
                        {vendorSelection?.totalMinAmount || vendorSelection?.totalMaxAmount
                            ? `${formatMoneyShort(vendorSelection?.totalMinAmount)} – ${formatMoneyShort(vendorSelection?.totalMaxAmount)}`
                            : '—'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {vendors.map((vendor) => {
                    const badge = getAvailabilityBadge(vendor.availability);
                    const altState = alternativesByKey[vendor.id] || null;
                    const showServiceCategoryChip =
                        vendor.serviceCategory &&
                        String(vendor.serviceCategory).trim() &&
                        String(vendor.serviceCategory).trim().toLowerCase() !== String(vendor.category || '').trim().toLowerCase();

                    return (
                        <div key={vendor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div
                                            className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md
                                            ${vendor.color === 'blue' ? 'bg-blue-500' : vendor.color === 'orange' ? 'bg-orange-500' : 'bg-purple-500'}`}
                                        >
                                            {vendor.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-extrabold text-gray-900 text-lg">{vendor.displayName || vendor.businessName}</h4>
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg} ${badge.text}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-gray-500">{vendor.category}</span>
                                                {showServiceCategoryChip && (
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-gray-500">{vendor.serviceCategory}</span>
                                                )}
                                                {vendor.location && (
                                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {vendor.location}{vendor.country ? `, ${vendor.country}` : ''}</span>
                                                )}
                                                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> Service: {vendor.serviceName}</span>
                                            </div>
                                            {vendor.status === 'REJECTED' && vendor.rejectionReason && (
                                                <div className="mt-2 text-sm text-red-700 font-medium">
                                                    Rejection reason: <span className="font-bold">{vendor.rejectionReason}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Quoted Price</p>
                                        <p className="text-xl font-extrabold text-gray-900">
                                            {vendor.servicePrice?.min || vendor.servicePrice?.max
                                                ? `${formatMoneyShort(vendor.servicePrice?.min)} – ${formatMoneyShort(vendor.servicePrice?.max)}`
                                                : '—'}
                                        </p>
                                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">Locked Price</p>
                                        <p className={`text-sm font-extrabold ${vendor.priceLocked && vendor.lockedPrice ? 'text-teal-700' : 'text-gray-500'}`}>
                                            {vendor.priceLocked && vendor.lockedPrice ? formatMoneyShort(vendor.lockedPrice) : '—'}
                                        </p>
                                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">Commission Fee</p>
                                        <p className={`text-sm font-extrabold ${vendor.priceLocked ? 'text-amber-700' : 'text-gray-500'}`}>
                                            {vendor.priceLocked
                                                ? `${formatMoneyShort(vendor.commissionAmount)}${vendor.commissionPercent > 0 ? ` (${vendor.commissionPercent}%)` : ''}`
                                                : '—'}
                                        </p>
                                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">Client Total</p>
                                        <p className={`text-sm font-extrabold ${vendor.priceLocked ? 'text-teal-700' : 'text-gray-500'}`}>
                                            {vendor.priceLocked ? formatMoneyShort(vendor.totalFees) : '—'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        {vendor.availability === 'unavailable' && (
                                            <button
                                                onClick={() => {
                                                    const next = showAlternatives === vendor.id ? null : vendor.id;
                                                    setShowAlternatives(next);
                                                    if (next && (!altState || altState.status === 'failed' || altState.status === 'idle')) {
                                                        fetchAlternatives({ service: vendor.service, cardKey: vendor.id });
                                                    }
                                                }}
                                                className="px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-100 border border-amber-200 flex items-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" /> View Alternatives
                                            </button>
                                        )}
                                        {vendor.availability === 'pending' && (
                                            <span className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold border border-gray-200 flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Yet to select
                                            </span>
                                        )}
                                        {vendor.availability === 'available' && (
                                            <div className="flex flex-col gap-2">
                                                <span className="px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Accepted
                                                </span>
                                                {canShowPayoutAction && (
                                                    <button
                                                        onClick={() => handleReleaseVendorPayout(vendor)}
                                                        disabled={
                                                            !vendor.priceLocked
                                                            || !(vendor.payoutAmount > 0)
                                                            || !vendor.vendorAuthId
                                                            || payoutLoadingByKey[vendor.payoutKey]
                                                            || (normalizedPlanningStatus === 'CANCELLED' && remainingVendorBudgetInr <= 0)
                                                            || String(vendor?.payout?.status || '').trim().toUpperCase() === 'SUCCESS'
                                                            || String(vendor?.payout?.status || '').trim().toUpperCase() === 'INITIATED'
                                                        }
                                                        className="px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        <Wallet className="w-4 h-4" />
                                                        {String(vendor?.payout?.status || '').trim().toUpperCase() === 'SUCCESS'
                                                            ? (vendorPayoutMode === 'DEMO' ? 'Demo Paid' : 'Paid')
                                                            : (String(vendor?.payout?.status || '').trim().toUpperCase() === 'INITIATED' || payoutLoadingByKey[vendor.payoutKey])
                                                                ? 'Processing...'
                                                                : `${vendorPayoutMode === 'DEMO' ? 'Demo Pay' : 'Pay Vendor'} ${formatMoneyShort(vendor.payoutAmount)}`}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {showAlternatives === vendor.id && (
                                <div className="border-t border-gray-100 bg-amber-50/30 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 text-amber-600" /> Alternative {vendor.category} Vendors
                                        </h4>
                                        <button
                                            onClick={() => sendAlternativesToClient({
                                                serviceLabel: vendor.category,
                                                alternatives: altState?.alternatives || [],
                                                vendorProfiles: altState?.vendorProfiles || [],
                                            })}
                                            className="text-sm font-bold text-teal-600 hover:underline flex items-center gap-1"
                                        >
                                            <Send className="w-3.5 h-3.5" /> Send Options to Client
                                        </button>
                                    </div>

                                    {altState?.status === 'loading' && (
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <p className="text-sm text-gray-700 font-medium">Loading alternatives…</p>
                                        </div>
                                    )}

                                    {altState?.status === 'failed' && (
                                        <div className="bg-white rounded-xl p-4 border border-red-200">
                                            <p className="text-sm text-red-700 font-bold">Failed to load alternatives</p>
                                            <p className="text-sm text-gray-700 mt-1">{altState?.error || 'Please try again.'}</p>
                                            <button
                                                onClick={() => fetchAlternatives({ service: vendor.service, cardKey: vendor.id })}
                                                className="mt-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    )}

                                    {(!altState || altState.status === 'succeeded') && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {(altState?.alternatives || []).length === 0 ? (
                                                <div className="bg-white rounded-xl p-4 border border-gray-200 md:col-span-3">
                                                    <p className="text-sm text-gray-700 font-medium">No alternatives found for this date.</p>
                                                </div>
                                            ) : (
                                                (altState?.alternatives || []).map((alt) => (
                                                    <div key={alt.serviceId || alt.vendorAuthId} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all group">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center font-bold text-sm">
                                                                {String(alt?.name || alt?.businessName || 'VN').substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{alt?.name || alt?.businessName || 'Vendor'}</p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <span className="text-green-600 font-bold">Available</span>
                                                                    {alt?.tier && <span className="text-gray-400">•</span>}
                                                                    {alt?.tier && <span className="font-bold text-gray-600">{alt.tier}</span>}
                                                                </div>
                                                                {alt?.location && (
                                                                    <div className="mt-1 text-xs text-gray-500 font-medium flex items-center gap-1">
                                                                        <MapPin className="w-3.5 h-3.5" /> {alt.location}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <p className="font-extrabold text-gray-900">{formatMoneyRangeFromBasePrice(alt?.price, { serviceLabel: vendor.service, guestCount: guestCountForPricing, dayCount: dayCountForPricing })}</p>
                                                            <button
                                                                onClick={() => selectVendorForService({
                                                                    service: vendor.service,
                                                                    vendorAuthId: alt?.vendorAuthId,
                                                                    serviceId: alt?.serviceId,
                                                                    price: alt?.price,
                                                                })}
                                                                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                Select
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Manual Payout Modal for Cancelled Events */}
            {manualPayoutVendor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Wallet size={24} />
                            </div>
                            <button
                                onClick={() => setManualPayoutVendor(null)}
                                disabled={isSubmittingManualPayout}
                                className="p-2 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <h3 className="text-xl font-black text-gray-900 mb-2">Adjust Vendor Payout</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Event is cancelled. Enter the final adjusted payout amount to transfer to <span className="font-bold text-gray-900">{manualPayoutVendor.businessName || 'the vendor'}</span>.
                        </p>

                        <div className="mb-6">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                Final Payout Amount (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={manualPayoutAmountInr}
                                onChange={(e) => setManualPayoutAmountInr(e.target.value)}
                                disabled={isSubmittingManualPayout}
                                placeholder="e.g. 500"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Original derived payout: <span className="font-semibold px-1">{formatMoneyShort(manualPayoutVendor.payoutAmount)}</span>
                            </p>
                            <p className="text-xs text-indigo-600 mt-1 font-semibold">
                                Remaining balance after refund: {formatMoneyShort(remainingVendorBudgetInr)}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setManualPayoutVendor(null)}
                                disabled={isSubmittingManualPayout}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReleaseVendorPayout(manualPayoutVendor)}
                                disabled={
                                    isSubmittingManualPayout
                                    || !manualPayoutAmountInr
                                    || Number(manualPayoutAmountInr) <= 0
                                    || Number(manualPayoutAmountInr) > remainingVendorBudgetInr
                                }
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isSubmittingManualPayout ? 'Processing...' : 'Confirm Payout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorsTab;
