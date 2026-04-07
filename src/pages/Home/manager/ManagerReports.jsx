import React, { useEffect, useMemo, useState } from 'react';
import {
    FileText,
    BarChart2,
    DollarSign,
    Download,
    Grid,
    List,
    Search,
    Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchManagerPlanningEvents,
    fetchManagerPromoteEvents,
} from '../../../store/slices/managerEventsSlice';

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;

const REPORT_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'finance', label: 'Finance' },
    { id: 'event', label: 'Events' },
];

const toDateOrNull = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toTimestamp = (value) => {
    const parsed = toDateOrNull(value);
    return parsed ? parsed.getTime() : 0;
};

const formatShortDate = (value) => {
    const parsed = toDateOrNull(value);
    if (!parsed) return '—';
    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const toNonNegativeNumber = (value) => {
    const n = Number(value || 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
};

const formatMoney = (value) => {
    const n = Number(value || 0);
    return `₹${Math.round(Math.max(0, n)).toLocaleString('en-IN')}`;
};

const normalizeUpper = (value) => String(value || '').trim().toUpperCase().replace(/[_-]/g, ' ');

const estimateSizeBytes = (payload) => {
    try {
        const text = JSON.stringify(payload);
        return new TextEncoder().encode(text).length;
    } catch {
        return 0;
    }
};

const formatSize = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
};

const getPlanningFinanceSummary = (event) => {
    const deposit = toNonNegativeNumber(event?.depositPaidAmountPaise) / 100;
    const vendorConfirmation = toNonNegativeNumber(event?.vendorConfirmationPaidAmountPaise) / 100;
    const remaining = toNonNegativeNumber(event?.remainingPaymentPaidAmountPaise) / 100;
    const platformFee = event?.platformFeePaid ? toNonNegativeNumber(event?.platformFee) : 0;

    const generatedRevenueInr = Number((deposit + vendorConfirmation + remaining + platformFee).toFixed(2));
    const expectedRevenueInr = Number((toNonNegativeNumber(event?.totalAmount) || generatedRevenueInr).toFixed(2));
    const outstandingInr = Number(Math.max(0, expectedRevenueInr - generatedRevenueInr).toFixed(2));

    return {
        expectedRevenueInr,
        generatedRevenueInr,
        outstandingInr,
        paymentMilestones: {
            depositInr: Number(deposit.toFixed(2)),
            vendorConfirmationInr: Number(vendorConfirmation.toFixed(2)),
            remainingPaymentInr: Number(remaining.toFixed(2)),
            platformFeeInr: Number(platformFee.toFixed(2)),
        },
    };
};

const getPromoteFinanceSummary = (event) => {
    const generatedRevenueInr = toNonNegativeNumber(event?.ticketAnalytics?.grossRevenueInr)
        || toNonNegativeNumber(event?.totalAmount);
    const expectedRevenueInr = toNonNegativeNumber(event?.totalAmount) || generatedRevenueInr;
    const outstandingInr = Number(Math.max(0, expectedRevenueInr - generatedRevenueInr).toFixed(2));

    return {
        expectedRevenueInr: Number(expectedRevenueInr.toFixed(2)),
        generatedRevenueInr: Number(generatedRevenueInr.toFixed(2)),
        outstandingInr,
        ticketAnalytics: {
            ticketsSold: toNonNegativeNumber(event?.ticketAnalytics?.ticketsSold),
            grossRevenueInr: Number(toNonNegativeNumber(event?.ticketAnalytics?.grossRevenueInr).toFixed(2)),
        },
    };
};

const getPlanningCategory = (event) => {
    const eventType = String(event?.eventType || '').trim();
    if (normalizeUpper(eventType) === 'OTHER') {
        return String(event?.customEventType || 'Other').trim() || 'Other';
    }
    return eventType || String(event?.category || 'Other').trim() || 'Other';
};

const getPromoteCategory = (event) => {
    const category = String(event?.eventCategory || '').trim();
    if (normalizeUpper(category) === 'OTHER') {
        return String(event?.customCategory || 'Other').trim() || 'Other';
    }
    return category || 'Other';
};

const buildReportsFromEvents = ({ planningEvents, promoteEvents }) => {
    const reports = [];

    (planningEvents || []).forEach((event) => {
        const eventId = String(event?.eventId || '').trim();
        if (!eventId) return;

        const title = String(event?.eventTitle || 'Planning Event').trim() || 'Planning Event';
        const anchorDate = event?.schedule?.startAt || event?.eventDate || event?.createdAt || null;
        const finance = getPlanningFinanceSummary(event);

        const eventPayload = {
            reportType: 'event',
            source: 'manager-events-planning',
            generatedAt: new Date().toISOString(),
            event: {
                eventId,
                title,
                eventType: 'planning',
                category: getPlanningCategory(event),
                status: String(event?.status || '').trim(),
                startAt: event?.schedule?.startAt || event?.eventDate || null,
                endAt: event?.schedule?.endAt || null,
                createdAt: event?.createdAt || null,
            },
        };

        const financePayload = {
            reportType: 'finance',
            source: 'manager-events-planning',
            generatedAt: new Date().toISOString(),
            event: {
                eventId,
                title,
                eventType: 'planning',
                category: getPlanningCategory(event),
                status: String(event?.status || '').trim(),
            },
            finance,
        };

        reports.push({
            id: `event-planning-${eventId}`,
            eventId,
            title: `${title} - Event Summary`,
            category: 'event',
            typeLabel: 'Event',
            dateLabel: formatShortDate(anchorDate),
            icon: BarChart2,
            iconClass: 'bg-blue-50 text-blue-600',
            payload: eventPayload,
            sortTs: toTimestamp(anchorDate || event?.createdAt),
            sizeLabel: formatSize(estimateSizeBytes(eventPayload)),
            eventType: 'planning',
        });

        reports.push({
            id: `finance-planning-${eventId}`,
            eventId,
            title: `${title} - Financial Summary`,
            category: 'finance',
            typeLabel: `Finance • ${formatMoney(finance.generatedRevenueInr)} / ${formatMoney(finance.expectedRevenueInr)}`,
            dateLabel: formatShortDate(anchorDate),
            icon: DollarSign,
            iconClass: 'bg-emerald-50 text-emerald-600',
            payload: financePayload,
            sortTs: toTimestamp(anchorDate || event?.createdAt),
            sizeLabel: formatSize(estimateSizeBytes(financePayload)),
            eventType: 'planning',
        });
    });

    (promoteEvents || []).forEach((event) => {
        const eventId = String(event?.eventId || '').trim();
        if (!eventId) return;

        const title = String(event?.eventTitle || 'Promote Event').trim() || 'Promote Event';
        const anchorDate = event?.schedule?.startAt || event?.createdAt || null;
        const finance = getPromoteFinanceSummary(event);

        const eventPayload = {
            reportType: 'event',
            source: 'manager-events-promote',
            generatedAt: new Date().toISOString(),
            event: {
                eventId,
                title,
                eventType: 'promote',
                category: getPromoteCategory(event),
                status: String(event?.eventStatus || event?.status || '').trim(),
                startAt: event?.schedule?.startAt || null,
                endAt: event?.schedule?.endAt || null,
                createdAt: event?.createdAt || null,
            },
        };

        const financePayload = {
            reportType: 'finance',
            source: 'manager-events-promote',
            generatedAt: new Date().toISOString(),
            event: {
                eventId,
                title,
                eventType: 'promote',
                category: getPromoteCategory(event),
                status: String(event?.eventStatus || event?.status || '').trim(),
            },
            finance,
        };

        reports.push({
            id: `event-promote-${eventId}`,
            eventId,
            title: `${title} - Event Summary`,
            category: 'event',
            typeLabel: 'Event',
            dateLabel: formatShortDate(anchorDate),
            icon: BarChart2,
            iconClass: 'bg-blue-50 text-blue-600',
            payload: eventPayload,
            sortTs: toTimestamp(anchorDate || event?.createdAt),
            sizeLabel: formatSize(estimateSizeBytes(eventPayload)),
            eventType: 'promote',
        });

        reports.push({
            id: `finance-promote-${eventId}`,
            eventId,
            title: `${title} - Financial Summary`,
            category: 'finance',
            typeLabel: `Finance • ${formatMoney(finance.generatedRevenueInr)} / ${formatMoney(finance.expectedRevenueInr)}`,
            dateLabel: formatShortDate(anchorDate),
            icon: DollarSign,
            iconClass: 'bg-emerald-50 text-emerald-600',
            payload: financePayload,
            sortTs: toTimestamp(anchorDate || event?.createdAt),
            sizeLabel: formatSize(estimateSizeBytes(financePayload)),
            eventType: 'promote',
        });
    });

    return reports.sort((a, b) => b.sortTs - a.sortTs);
};

const ManagerReports = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { planningEvents, promoteEvents, loading, error } = useSelector((state) => state.managerEvents);

    const [viewMode, setViewMode] = useState('grid');
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const POLL_MS = 60000;

        const poll = () => {
            dispatch(fetchManagerPlanningEvents({ limit: 300 }));
            dispatch(fetchManagerPromoteEvents({ limit: 300 }));
        };

        poll();
        const timer = setInterval(poll, POLL_MS);
        return () => clearInterval(timer);
    }, [dispatch]);

    const reports = useMemo(() => {
        return buildReportsFromEvents({ planningEvents, promoteEvents });
    }, [planningEvents, promoteEvents]);

    const filteredReports = useMemo(() => {
        const q = String(searchQuery || '').trim().toLowerCase();

        return reports.filter((report) => {
            const matchesFilter = activeFilter === 'all' || report.category === activeFilter;
            const matchesSearch = !q
                || String(report.title || '').toLowerCase().includes(q)
                || String(report.eventId || '').toLowerCase().includes(q)
                || String(report.eventType || '').toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
        });
    }, [reports, activeFilter, searchQuery]);

    const handleViewReport = (report) => {
        const eventId = String(report?.eventId || '').trim();
        if (!eventId) return;

        const tab = report?.category === 'finance' ? 'financials' : 'overview';
        navigate(`/manager/events/${encodeURIComponent(eventId)}?tab=${encodeURIComponent(tab)}`);
    };

    const handleDownloadFinancialUi = (report) => {
        const eventId = String(report?.eventId || '').trim();
        if (!eventId) return;

        const target = `/manager/events/${encodeURIComponent(eventId)}?tab=financials&exportUi=1`;
        const opened = window.open(target, '_blank');
        if (!opened) {
            navigate(target);
            return;
        }
        opened.focus();
    };

    return (
        <div className="p-6 lg:p-8 max-w-480 mx-auto min-h-screen bg-gray-50/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <MotionH1
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-extrabold text-gray-900 tracking-tight"
                    >
                        Report Library
                    </MotionH1>
                    <MotionP
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.05 }}
                        className="text-gray-500 font-medium"
                    >
                        Access detailed insights for Events and Financials.
                    </MotionP>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 max-w-sm">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-gray-900">{reports.length}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Reports</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-gray-100/50 rounded-xl overflow-x-auto max-w-full">
                    {REPORT_FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                activeFilter === filter.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search report name..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-teal-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center border-l border-gray-200 pl-3 gap-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {String(error)}
                </div>
            )}

            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredReports.map((report) => {
                        const Icon = report.icon;
                        return (
                            <MotionDiv
                                key={report.id}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${report.iconClass}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate" title={report.title}>{report.title}</h3>
                                    <p className="text-sm font-medium text-gray-400">{report.sizeLabel} • {report.typeLabel}</p>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                                    <span className="text-xs font-bold text-gray-400">{report.dateLabel}</span>
                                    <div className="flex items-center gap-2">
                                        {report.category === 'finance' && (
                                            <button
                                                type="button"
                                                onClick={() => handleDownloadFinancialUi(report)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                                                title="Download financial tab UI"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Download
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleViewReport(report)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                                            title="View report"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                    </div>
                                </div>
                            </MotionDiv>
                        );
                    })}
                </div>
            )}

            {viewMode === 'list' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400">
                        <span className="col-span-5">Report</span>
                        <span className="col-span-2">Type</span>
                        <span className="col-span-2">Date</span>
                        <span className="col-span-2">Size</span>
                        <span className="col-span-1 text-right">Action</span>
                    </div>

                    {filteredReports.map((report) => {
                        const Icon = report.icon;
                        return (
                            <div key={`row-${report.id}`} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 last:border-none items-center">
                                <div className="col-span-5 flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${report.iconClass}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate" title={report.title}>{report.title}</p>
                                        <p className="text-xs text-gray-400">{report.eventId}</p>
                                    </div>
                                </div>
                                <span className="col-span-2 text-sm font-semibold text-gray-600 capitalize">{report.category}</span>
                                <span className="col-span-2 text-sm font-semibold text-gray-600">{report.dateLabel}</span>
                                <span className="col-span-2 text-sm font-semibold text-gray-600">{report.sizeLabel}</span>
                                <div className="col-span-1 flex justify-end">
                                    <div className="flex items-center gap-2">
                                        {report.category === 'finance' && (
                                            <button
                                                type="button"
                                                onClick={() => handleDownloadFinancialUi(report)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                                                title="Download financial tab UI"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleViewReport(report)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                                            title="View report"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {loading && reports.length === 0 && (
                <div className="mt-6 text-xs font-semibold text-gray-400">Loading reports from assigned events...</div>
            )}

            {!loading && filteredReports.length === 0 && (
                <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                    <p className="font-bold text-gray-700">No reports found for the current filters.</p>
                    <p className="text-sm text-gray-500 mt-1">Try another search term or switch between Finance and Events.</p>
                </div>
            )}
        </div>
    );
};

export default ManagerReports;
