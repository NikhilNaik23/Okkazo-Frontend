import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
    CheckCircle, Clock, XCircle, MapPin, Star, RefreshCw, Send, 
    FileCheck, MessageSquare 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    fetchPlanningByEventId,
    fetchPlanningVendorSelectionByEventId,
    selectPlanningVendorSelectionByEventId,
} from '../../../../store/slices/planningSlice';
import { fetchWithAuth } from '../../../../utils/apiHandler';
import { refreshAccessToken } from '../../../../store/slices/authSlice';
import { ensureEventConversation, sendConversationMessage } from '../../../../utils/chatApi';
import { encodeRichChatMessage } from '../../../../utils/richChat';
import { computeMoneyRangeFromBase } from '../../../../utils/pricing';

const API_BASE_URL = 'http://localhost:8080';
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
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
    return `₹${n.toFixed(0)}`;
};

const formatMoneyRangeFromBasePrice = (price, { serviceLabel, guestCount } = {}) => {
    const range = computeMoneyRangeFromBase({
        basePrice: price,
        guestCount,
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

const normalizeVendorSlotServicePrice = ({ price, min, guestCount, serviceLabel } = {}) => {
    // For consistency, we derive max as min*1.5 and multiply by guestCount where per-attendee.
    // Prefer `price` (unit/base) then fallback to `min`.
    return computeMoneyRangeFromBase({
        basePrice: price ?? min,
        guestCount,
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
                [cardKey]: { status: 'failed', error: e?.message || 'Failed to load alternatives', service, alternatives: [], vendorProfiles: [] },
            }));
        }
    };

    const sendAlternativesToClient = async ({ serviceLabel, alternatives, vendorProfiles }) => {
        try {
            if (!eventId) throw new Error('Missing eventId');

            const convo = await ensureEventConversation({
                eventId,
                dispatch,
                refreshAction: refreshAccessToken,
            });

            const conversationId = String(convo?._id || convo?.id || '').trim();
            if (!conversationId) throw new Error('Invalid conversation');

            const altList = Array.isArray(alternatives) ? alternatives : [];

            // Enrich alternatives with vendor profile details if present.
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
                        businessName: a?.businessName || profile?.businessName || 'Vendor',
                        tier: a?.tier || null,
                        price: a?.price != null ? Number(a.price) : null,
                        priceMin: a?.priceMin != null ? Number(a.priceMin) : null,
                        priceMax: a?.priceMax != null ? Number(a.priceMax) : null,
                        serviceCategory: a?.serviceCategory || profile?.serviceCategory || null,
                        distanceKm: a?.distanceKm != null ? Number(a.distanceKm) : null,
                        distanceText: a?.distanceText || null,
                        services,
                        location: profile?.location || profile?.place || null,
                        country: profile?.country || null,
                        description: profile?.description || a?.description || null,
                    };
                })
                .filter((o) => o.vendorAuthId);

            // Match backend auto-send behavior: only show a radius when geo distances exist.
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

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchPlanningVendorSelectionByEventId(eventId));
    }, [dispatch, eventId]);

    useEffect(() => {
        let cancelled = false;
        if (!eventId) return () => {
            cancelled = true;
        };

        dispatch(fetchPlanningByEventId(String(eventId)))
            .then((action) => {
                if (cancelled) return;
                if (action?.meta?.requestStatus === 'fulfilled') {
                    const n = action?.payload?.guestCount;
                    setGuestCountForPricing(typeof n === 'number' ? n : null);
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [dispatch, eventId]);

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

                return {
                    id: `${service}:${vendorAuthId || 'NONE'}`,
                    service,
                    category: formatServiceLabel(service),
                    vendorAuthId: vendorAuthId || null,
                    businessName: vendorAuthId ? (profile?.businessName || 'Vendor') : 'Yet to select',
                    serviceCategory: profile?.serviceCategory || null,
                    location: profile?.location || profile?.place || null,
                    country: profile?.country || null,
                    description: profile?.description || null,
                    status,
                    availability,
                    rejectionReason: v?.rejectionReason || null,
                    alternativeNeeded: Boolean(v?.alternativeNeeded),
                    servicePrice: {
                        min: Number(v?.servicePrice?.min || 0),
                        max: Number(v?.servicePrice?.max || 0),
                    },
                    icon,
                    color,
                };
            });
    }, [vendorSelection]);

    const getAvailabilityBadge = (av) => {
        if (av === 'available') return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: '✅ Available', icon: CheckCircle };
        if (av === 'pending') return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: '⏳ Pending', icon: Clock };
        return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: '❌ Unavailable', icon: XCircle };
    };

    const handleReplaceVendor = () => {
        toast('Select this vendor from the alternatives list');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Vendor Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Verify availability, confirm vendors, and manage alternatives</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (eventId) dispatch(fetchPlanningVendorSelectionByEventId(eventId));
                        }}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button onClick={() => toast.success("Vendor summary sent to client!")} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send to Client
                    </button>
                </div>
            </div>

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

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Vendors</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{vendors.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Confirmed</p>
                    <p className="text-2xl font-extrabold text-green-700 mt-1">{vendors.filter(v => v.availability === 'available').length}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pending</p>
                    <p className="text-2xl font-extrabold text-amber-700 mt-1">{vendors.filter(v => v.availability === 'pending').length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Cost</p>
                    <p className="text-2xl font-extrabold text-teal-600 mt-1">
                        {vendorSelection?.totalMinAmount || vendorSelection?.totalMaxAmount
                            ? `${formatMoneyShort(vendorSelection?.totalMinAmount)} – ${formatMoneyShort(vendorSelection?.totalMaxAmount)}`
                            : '—'}
                    </p>
                </div>
            </div>

            {/* Vendor Cards */}
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
                                    {/* Vendor Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md
                                            ${vendor.color === 'blue' ? 'bg-blue-500' : vendor.color === 'orange' ? 'bg-orange-500' : 'bg-purple-500'}`}>
                                            {vendor.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-extrabold text-gray-900 text-lg">{vendor.businessName}</h4>
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
                                                {vendor.vendorAuthId && (
                                                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {vendor.vendorAuthId}</span>
                                                )}
                                            </div>
                                            {vendor.status === 'REJECTED' && vendor.rejectionReason && (
                                                <div className="mt-2 text-sm text-red-700 font-medium">
                                                    Rejection reason: <span className="font-bold">{vendor.rejectionReason}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Quoted Price</p>
                                        <p className="text-xl font-extrabold text-gray-900">
                                            {vendor.servicePrice?.min || vendor.servicePrice?.max
                                                ? `${formatMoneyShort(vendor.servicePrice?.min)} – ${formatMoneyShort(vendor.servicePrice?.max)}`
                                                : '—'}
                                        </p>
                                    </div>

                                    {/* Actions */}
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
                                            <span className="px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Accepted
                                            </span>
                                        )}
                                        <button
                                            onClick={() => toast.success("Contract downloaded")}
                                            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <FileCheck className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toast.success("Opening vendor chat...")}
                                            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Alternatives Panel */}
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
                                                                {String(alt?.businessName || 'VN').substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{alt?.businessName || 'Vendor'}</p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <span className="text-green-600 font-bold">Available</span>
                                                                    {alt?.tier && <span className="text-gray-400">•</span>}
                                                                    {alt?.tier && <span className="font-bold text-gray-600">{alt.tier}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <p className="font-extrabold text-gray-900">{formatMoneyRangeFromBasePrice(alt?.price)}</p>
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
        </div>
    );
};

export default VendorsTab;
