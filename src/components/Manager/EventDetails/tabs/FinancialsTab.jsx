import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import {
    DollarSign,
    Download,
    CheckCircle,
    Clock,
    TrendingUp,
    AlertCircle,
    RefreshCw,
    XCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { StatCard } from '../ui';
import {
    fetchPlanningVendorSelectionByEventId,
    selectPlanningVendorSelectionByEventId,
} from '../../../../store/slices/planningSlice';

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

const formatMoneyCompact = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return '₹0';
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
    return `₹${Math.round(n)}`;
};

const toNonNegative = (value) => {
    const n = Number(value || 0);
    return Number.isFinite(n) && n >= 0 ? n : 0;
};

const fileNameSafe = (value) => String(value || 'financial-tab')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'financial-tab';

const normalizeTierName = (tier, idx = 0) => {
    const name = String(tier?.tierName || tier?.name || '').trim();
    return name || `Tier ${idx + 1}`;
};

const normalizeTierCount = (tierLike) => {
    const raw = Number(tierLike?.ticketCount ?? tierLike?.quantity ?? tierLike?.count ?? 0);
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
};

const normalizeTierPrice = (tierLike) => {
    const raw = Number(tierLike?.ticketPrice ?? tierLike?.price ?? 0);
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
};

const normalizePromotionKey = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const PROMOTION_FEE_INR = {
    'featured placement': 500,
    'email blast': 250,
    'social synergy': 150,
    'advanced analytics': 100,
};

const getPromotionSpendInr = (selectedPromotions) => {
    const rows = Array.isArray(selectedPromotions) ? selectedPromotions : [];
    return rows.reduce((sum, row) => {
        const key = normalizePromotionKey(
            typeof row === 'string'
                ? row
                : (row?.value || row?.name || row?.label || row?.title || '')
        );
        const fee = Number(PROMOTION_FEE_INR[key] || 0);
        return sum + (Number.isFinite(fee) && fee > 0 ? fee : 0);
    }, 0);
};

const buildExpectedTicketRevenue = ({ ticketType, tiers, dayWiseAllocations, totalTicketCapacity }) => {
    const normalizedTicketType = String(ticketType || '').trim().toLowerCase();
    const isPaid = normalizedTicketType === 'paid';

    const normalizedTiers = (Array.isArray(tiers) ? tiers : []).map((tier, idx) => ({
        tierName: normalizeTierName(tier, idx),
        ticketCount: normalizeTierCount(tier),
        ticketPrice: normalizeTierPrice(tier),
    }));

    const priceByTierName = new Map(
        normalizedTiers.map((tier) => [String(tier.tierName || '').trim().toLowerCase(), toNonNegative(tier.ticketPrice)])
    );

    const dayRows = Array.isArray(dayWiseAllocations) ? dayWiseAllocations : [];

    let expectedTickets = 0;
    let expectedRevenueInr = 0;

    const hasTierBreakdown = dayRows.some((row) => Array.isArray(row?.tierBreakdown) && row.tierBreakdown.length > 0);

    if (isPaid && hasTierBreakdown) {
        dayRows.forEach((row) => {
            const breakdown = Array.isArray(row?.tierBreakdown) ? row.tierBreakdown : [];
            if (breakdown.length === 0) {
                expectedTickets += toNonNegative(row?.ticketCount);
                return;
            }

            let dayCountFromBreakdown = 0;
            breakdown.forEach((tierRow) => {
                const tierKey = String(tierRow?.tierName || '').trim().toLowerCase();
                const count = normalizeTierCount(tierRow);
                const unitPrice = toNonNegative(priceByTierName.get(tierKey));
                dayCountFromBreakdown += count;
                expectedRevenueInr += count * unitPrice;
            });

            expectedTickets += dayCountFromBreakdown > 0 ? dayCountFromBreakdown : toNonNegative(row?.ticketCount);
        });
    } else if (isPaid && normalizedTiers.length > 0) {
        normalizedTiers.forEach((tier) => {
            expectedTickets += tier.ticketCount;
            expectedRevenueInr += tier.ticketCount * tier.ticketPrice;
        });
    } else if (dayRows.length > 0) {
        expectedTickets = dayRows.reduce((sum, row) => sum + toNonNegative(row?.ticketCount), 0);
    }

    const fallbackCapacity = toNonNegative(totalTicketCapacity);
    if (expectedTickets <= 0 && fallbackCapacity > 0) {
        expectedTickets = fallbackCapacity;
    }

    return {
        expectedTickets,
        expectedRevenueInr: Number(expectedRevenueInr.toFixed(2)),
    };
};

const FinancialsTab = ({ event, exportUiOnLoad = false }) => {
    const { id: eventId } = useParams();
    const dispatch = useDispatch();
    const exportRootRef = useRef(null);
    const autoExportDoneRef = useRef(false);
    const [exportingUi, setExportingUi] = useState(false);

    const vendorSelection = useSelector((state) => selectPlanningVendorSelectionByEventId(state, eventId));
    const vendorSelectionStatus = useSelector((state) => state?.planning?.vendorSelectionStatus);
    const vendorSelectionError = useSelector((state) => state?.planning?.vendorSelectionError);

    const isPlanning = String(event?.type || '').toLowerCase() === 'planning';
    const isPromote = String(event?.type || '').toLowerCase() === 'promote';
    const isPublicListing = isPromote || String(event?.listingType || '').trim().toLowerCase() === 'public';
    const shouldShowTicketFinance = isPublicListing;
    const shouldShowVendorFinance = isPlanning;

    useEffect(() => {
        if (!eventId) return;
        if (!isPlanning) return;
        dispatch(fetchPlanningVendorSelectionByEventId(eventId));
    }, [dispatch, eventId, isPlanning]);

    const ticketFinance = useMemo(() => {
        const stats = event?.ticketSalesStats && typeof event.ticketSalesStats === 'object'
            ? event.ticketSalesStats
            : null;

        const expected = buildExpectedTicketRevenue({
            ticketType: event?.ticketType,
            tiers: event?.ticketTiers,
            dayWiseAllocations: event?.ticketDayWiseAllocations,
            totalTicketCapacity: event?.totalTicketCapacity ?? stats?.totalTickets,
        });

        const generatedRevenueInr = toNonNegative(stats?.grossRevenueInr);
        const serviceChargePercentRaw = Number(stats?.serviceChargePercent ?? event?.serviceChargePercent ?? 0);
        const serviceChargePercent = Number.isFinite(serviceChargePercentRaw)
            ? Math.max(0, Math.min(100, serviceChargePercentRaw))
            : 0;
        const platformFeeInr = toNonNegative(stats?.platformFeeInr ?? event?.platformFee);
        const promotionSpendInr = isPlanning && isPublicListing ? getPromotionSpendInr(event?.selectedPromotions) : 0;

        const expectedServiceChargeInr = Number(((expected.expectedRevenueInr * serviceChargePercent) / 100).toFixed(2));
        const expectedTotalFeesInr = Number((expectedServiceChargeInr + platformFeeInr + promotionSpendInr).toFixed(2));
        const expectedNetPnlInr = Number((expected.expectedRevenueInr - expectedTotalFeesInr).toFixed(2));

        const totalTickets = Math.max(toNonNegative(stats?.totalTickets), toNonNegative(expected.expectedTickets));
        const ticketsSold = Math.min(
            totalTickets > 0 ? totalTickets : Number.POSITIVE_INFINITY,
            toNonNegative(stats?.ticketsSold)
        );
        const ticketsRemaining = totalTickets > 0
            ? Math.max(0, totalTickets - ticketsSold)
            : toNonNegative(stats?.ticketsRemaining);

        const conversionRatePercentRaw = Number(stats?.conversionRatePercent || 0);
        const conversionRatePercent = Number.isFinite(conversionRatePercentRaw) && conversionRatePercentRaw > 0
            ? conversionRatePercentRaw
            : (totalTickets > 0 ? Number(((ticketsSold / totalTickets) * 100).toFixed(2)) : 0);

        return {
            expectedRevenueInr: expected.expectedRevenueInr,
            generatedRevenueInr,
            expectedNetPnlInr,
            expectedServiceChargeInr,
            expectedTotalFeesInr,
            serviceChargePercent,
            platformFeeInr,
            promotionSpendInr,
            totalTickets,
            ticketsSold,
            ticketsRemaining,
            conversionRatePercent,
        };
    }, [
        event?.ticketSalesStats,
        event?.ticketType,
        event?.ticketTiers,
        event?.ticketDayWiseAllocations,
        event?.totalTicketCapacity,
        event?.serviceChargePercent,
        event?.platformFee,
        event?.selectedPromotions,
        isPlanning,
        isPublicListing,
    ]);

    const rows = useMemo(() => {
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
                const vendorAuthId = String(v?.vendorAuthId || '').trim();
                const profile = vendorAuthId ? profileByAuthId.get(vendorAuthId) : null;

                const minPrice = toNonNegative(v?.servicePrice?.min);
                const maxPrice = toNonNegative(v?.servicePrice?.max);
                const lockedPrice = toNonNegative(v?.vendorQuotedPrice);
                const commissionAmount = toNonNegative(v?.commissionAmount);
                const commissionPercent = toNonNegative(v?.commissionPercent);
                const priceLocked = Boolean(v?.priceLocked) && lockedPrice > 0;
                const totalFee = priceLocked ? lockedPrice : 0;
                const vendorPayout = priceLocked ? Math.max(0, lockedPrice - commissionAmount) : 0;
                const status = String(v?.status || 'YET_TO_SELECT').trim().toUpperCase();

                return {
                    id: `${service}:${vendorAuthId || 'NONE'}`,
                    vendor: profile?.businessName || 'Yet to select',
                    service: String(v?.serviceName || '').trim() || formatServiceLabel(service),
                    status,
                    minPrice,
                    maxPrice,
                    lockedPrice,
                    commissionAmount,
                    commissionPercent,
                    totalFee,
                    vendorPayout,
                    priceLocked,
                };
            });
    }, [vendorSelection]);

    const metrics = useMemo(() => {
        const lockedRows = rows.filter((row) => row.priceLocked);

        const totalVendorCost = lockedRows.reduce((sum, row) => sum + row.vendorPayout, 0);
        const clientQuote = lockedRows.reduce((sum, row) => sum + row.totalFee, 0);
        const projectedProfit = Math.max(0, clientQuote - totalVendorCost);
        const paidAmount = rows
            .filter((row) => row.status === 'ACCEPTED' && row.priceLocked)
            .reduce((sum, row) => sum + row.totalFee, 0);
        const outstanding = Math.max(0, clientQuote - paidAmount);
        const unpaidCount = rows.filter((row) => row.status !== 'ACCEPTED').length;

        const totalMin = toNonNegative(vendorSelection?.totalMinAmount);
        const totalMax = toNonNegative(vendorSelection?.totalMaxAmount);

        return {
            totalVendorCost,
            clientQuote,
            projectedProfit,
            paidAmount,
            outstanding,
            unpaidCount,
            totalMin,
            totalMax,
        };
    }, [rows, vendorSelection?.totalMinAmount, vendorSelection?.totalMaxAmount]);

    const paymentProgress = metrics.clientQuote > 0
        ? Math.min(100, Math.round((metrics.paidAmount / metrics.clientQuote) * 100))
        : 0;

    const isFinancialUiReady = useMemo(() => {
        if (shouldShowVendorFinance && vendorSelectionStatus === 'loading' && rows.length === 0) {
            return false;
        }
        return true;
    }, [shouldShowVendorFinance, vendorSelectionStatus, rows.length]);

    const handleDownloadFinancialUi = useCallback(async ({ silent = false } = {}) => {
        const rootNode = exportRootRef.current;
        if (!rootNode) {
            if (!silent) toast.error('Financial UI is not ready for export yet.');
            return false;
        }

        try {
            setExportingUi(true);

            // Wait for fonts/layout to settle before capture so graphs/cards are fully painted.
            await document.fonts?.ready;
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

            const exportWidth = Math.max(rootNode.scrollWidth, rootNode.clientWidth);
            const exportHeight = Math.max(rootNode.scrollHeight, rootNode.clientHeight);

            const imageUrl = await toPng(rootNode, {
                cacheBust: true,
                backgroundColor: '#f8fafc',
                pixelRatio: 2,
                width: exportWidth,
                height: exportHeight,
                canvasWidth: exportWidth * 2,
                canvasHeight: exportHeight * 2,
            });

            const anchor = document.createElement('a');
            const title = String(event?.title || event?.eventTitle || eventId || 'financial-tab').trim();
            anchor.href = imageUrl;
            anchor.download = `${fileNameSafe(title)}-financial-tab-ui.png`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

            if (!silent) toast.success('Financial tab UI downloaded.');
            return true;
        } catch (error) {
            if (!silent) {
                toast.error('Failed to export financial tab UI.');
            }
            console.error('Financial UI export failed:', error);
            return false;
        } finally {
            setExportingUi(false);
        }
    }, [event?.eventTitle, event?.title, eventId]);

    useEffect(() => {
        if (!exportUiOnLoad || autoExportDoneRef.current || !isFinancialUiReady) return;

        let cancelled = false;
        let attempts = 0;
        const maxAttempts = 6;

        const tryExport = async () => {
            if (cancelled || autoExportDoneRef.current) return;

            // If tab is backgrounded, wait until user focuses it before attempting download.
            if (document.visibilityState !== 'visible') {
                setTimeout(tryExport, 400);
                return;
            }

            attempts += 1;
            const isFinalAttempt = attempts >= maxAttempts;
            const ok = await handleDownloadFinancialUi({ silent: !isFinalAttempt });

            if (ok) {
                autoExportDoneRef.current = true;
                return;
            }

            if (!isFinalAttempt) {
                setTimeout(tryExport, 700);
                return;
            }

            autoExportDoneRef.current = true;
            toast('Auto-download was blocked. Click "Download Financial Tab UI".', { icon: '⬇️' });
        };

        const timer = setTimeout(tryExport, 700);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [exportUiOnLoad, isFinancialUiReady, handleDownloadFinancialUi]);

    useEffect(() => {
        if (!exportUiOnLoad) {
            autoExportDoneRef.current = false;
        }
    }, [exportUiOnLoad, eventId]);

    if (!shouldShowVendorFinance && !shouldShowTicketFinance) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Financial details are not available for this event type yet.</p>
            </div>
        );
    }

    return (
        <div ref={exportRootRef} className="space-y-6">
            {shouldShowTicketFinance && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Total Revenue Expected"
                            value={ticketFinance.expectedRevenueInr > 0 ? formatMoneyCompact(ticketFinance.expectedRevenueInr) : '₹0'}
                            color="teal"
                            icon={TrendingUp}
                            subtext={`${ticketFinance.totalTickets} total tickets`}
                        />
                        <StatCard
                            label="Revenue Generated"
                            value={ticketFinance.generatedRevenueInr > 0 ? formatMoneyCompact(ticketFinance.generatedRevenueInr) : '₹0'}
                            color="blue"
                            icon={DollarSign}
                            subtext={`${ticketFinance.ticketsSold} sold`}
                        />
                        <StatCard
                            label="Expected Net P&L"
                            value={formatMoneyCompact(Math.abs(ticketFinance.expectedNetPnlInr))}
                            color={ticketFinance.expectedNetPnlInr >= 0 ? 'green' : 'rose'}
                            icon={TrendingUp}
                            subtext={`${ticketFinance.expectedNetPnlInr >= 0 ? '+' : '-'}${formatMoneyShort(Math.abs(ticketFinance.expectedNetPnlInr))}`}
                        />
                        <StatCard
                            label="Ticket Conversion"
                            value={`${Math.max(0, Math.min(100, ticketFinance.conversionRatePercent)).toFixed(0)}%`}
                            color="amber"
                            icon={CheckCircle}
                            subtext={`${ticketFinance.ticketsRemaining} tickets remaining`}
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Ticket Revenue Forecast</h3>
                                <p className="text-sm text-gray-500 mt-1">Expected revenue uses ticket tiers and day-wise allocations.</p>
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-gray-600">Ticket Sales</span>
                                <span className="font-bold text-gray-900">
                                    {ticketFinance.ticketsSold} / {ticketFinance.totalTickets}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                    className="bg-teal-500 h-2.5 rounded-full"
                                    style={{ width: `${Math.max(0, Math.min(100, ticketFinance.conversionRatePercent))}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Expected Fees</p>
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service Charge ({ticketFinance.serviceChargePercent}%)</span>
                                        <span className="font-bold text-gray-900">{formatMoneyShort(ticketFinance.expectedServiceChargeInr)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Platform Fee</span>
                                        <span className="font-bold text-gray-900">{formatMoneyShort(ticketFinance.platformFeeInr)}</span>
                                    </div>
                                    {ticketFinance.promotionSpendInr > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Promotion Spend</span>
                                            <span className="font-bold text-gray-900">{formatMoneyShort(ticketFinance.promotionSpendInr)}</span>
                                        </div>
                                    )}
                                    <div className="pt-1 border-t border-gray-200 flex justify-between">
                                        <span className="font-bold text-gray-700">Total Fees</span>
                                        <span className="font-extrabold text-gray-900">{formatMoneyShort(ticketFinance.expectedTotalFeesInr)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-teal-100 p-4 bg-teal-50">
                                <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Expected Net P&L</p>
                                <p className={`mt-2 text-3xl font-extrabold ${ticketFinance.expectedNetPnlInr >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
                                    {ticketFinance.expectedNetPnlInr >= 0 ? '' : '-'}{formatMoneyShort(Math.abs(ticketFinance.expectedNetPnlInr))}
                                </p>
                                <p className="mt-2 text-xs font-medium text-teal-700/70">Expected revenue minus expected fees</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {shouldShowVendorFinance && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Total Vendor Cost"
                            value={metrics.totalVendorCost > 0 ? formatMoneyCompact(metrics.totalVendorCost) : (metrics.totalMin > 0 ? `${formatMoneyShort(metrics.totalMin)} – ${formatMoneyShort(metrics.totalMax)}` : '—')}
                            color="blue"
                            icon={DollarSign}
                        />
                        <StatCard
                            label="Client Quote"
                            value={metrics.clientQuote > 0 ? formatMoneyCompact(metrics.clientQuote) : (metrics.totalMin > 0 ? `${formatMoneyShort(metrics.totalMin)} – ${formatMoneyShort(metrics.totalMax)}` : '—')}
                            color="green"
                            icon={TrendingUp}
                            subtext={metrics.clientQuote > 0 ? 'Locked quotations' : 'Awaiting locked quotations'}
                        />
                        <StatCard
                            label="Projected Profit"
                            value={formatMoneyCompact(metrics.projectedProfit)}
                            color="teal"
                            icon={TrendingUp}
                        />
                        <StatCard
                            label="Outstanding"
                            value={formatMoneyCompact(metrics.outstanding)}
                            color="rose"
                            icon={AlertCircle}
                            subtext={`${metrics.unpaidCount} vendors pending`}
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Vendor Cost Breakdown</h3>
                                <p className="text-sm text-gray-500 mt-1">Sourced from vendor selection and locked quotation details</p>
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
                            </div>
                        </div>

                        {vendorSelectionStatus === 'loading' && rows.length === 0 ? (
                            <div className="p-6 text-sm text-gray-600 font-medium">Loading financial data...</div>
                        ) : vendorSelectionStatus === 'failed' ? (
                            <div className="p-6">
                                <p className="text-sm font-bold text-red-700">Failed to load financial details</p>
                                <p className="text-sm text-gray-600 mt-1">{vendorSelectionError || 'Please try again.'}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Service</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Quoted Price</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total Fee</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Selection Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-sm font-medium text-gray-500">No vendor financial rows available yet.</td>
                                            </tr>
                                        ) : (
                                            rows.map((item) => {
                                                const isAccepted = item.status === 'ACCEPTED';
                                                const isRejected = item.status === 'REJECTED';
                                                const badgeClass = isAccepted
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : isRejected
                                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200';

                                                return (
                                                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">{item.vendor}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.service}</td>
                                                        <td className="px-6 py-4 text-right font-extrabold text-gray-900">
                                                            {item.minPrice > 0 || item.maxPrice > 0
                                                                ? `${formatMoneyShort(item.minPrice)} – ${formatMoneyShort(item.maxPrice)}`
                                                                : '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-extrabold text-gray-900">
                                                            {item.priceLocked
                                                                ? `${formatMoneyShort(item.totalFee)}${item.commissionPercent > 0 ? ` (incl. ${item.commissionPercent}% commission)` : ''}`
                                                                : '—'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${badgeClass}`}>
                                                                {isAccepted ? <CheckCircle className="w-3 h-3" /> : isRejected ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                                {isAccepted ? 'Accepted' : isRejected ? 'Rejected' : 'Pending'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}

                                        <tr className="bg-gray-900 text-white">
                                            <td className="px-6 py-4 font-bold" colSpan={2}>Total Event Cost</td>
                                            <td className="px-6 py-4 text-right font-extrabold text-lg" colSpan={2}>
                                                {metrics.clientQuote > 0
                                                    ? formatMoneyCompact(metrics.clientQuote)
                                                    : (metrics.totalMin > 0 ? `${formatMoneyShort(metrics.totalMin)} – ${formatMoneyShort(metrics.totalMax)}` : '—')}
                                            </td>
                                            <td />
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Client Quote Breakdown</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Vendor Costs</span>
                                    <span className="font-bold text-gray-900">{formatMoneyShort(metrics.totalVendorCost)}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Management Fee</span>
                                    <span className="font-bold text-gray-900">{formatMoneyShort(metrics.projectedProfit)}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 bg-teal-50 px-4 -mx-4 rounded-xl">
                                    <span className="font-bold text-teal-700">Client Total</span>
                                    <span className="text-xl font-extrabold text-teal-700">{formatMoneyShort(metrics.clientQuote)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-gray-400 mb-1 uppercase tracking-wide text-xs">Net Profit Estimate</h3>
                                <p className="text-4xl font-extrabold text-white mb-4">{formatMoneyCompact(metrics.projectedProfit)}</p>
                                <div className="mb-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Payment Collected</span>
                                        <span className="font-bold text-green-400">{formatMoneyShort(metrics.paidAmount)} / {formatMoneyShort(metrics.clientQuote)}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-400 h-2 rounded-full" style={{ width: `${paymentProgress}%` }} />
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownloadFinancialUi()}
                                    disabled={exportingUi}
                                    className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> {exportingUi ? 'Preparing UI Export...' : 'Download Financial Tab UI'}
                                </button>
                            </div>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black/20 to-transparent" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FinancialsTab;
