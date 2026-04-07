import React, { useEffect, useMemo, useState } from 'react';
import {
    TrendingUp, Calendar, ArrowUpRight,
    ArrowDownRight, DollarSign, Download,
    MoreHorizontal, Activity, Target, CheckCircle2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Sector
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchManagerPlanningEvents,
    fetchManagerPromoteEvents,
} from '../../../store/slices/managerEventsSlice';

// --- Custom Components ---

const MotionDiv = motion.div;
const PIE_COLORS = ['#0d9488', '#f59e0b', '#db2777', '#6366f1', '#0891b2', '#22c55e'];

const TERMINAL_STATUSES = new Set(['COMPLETED', 'COMPLETE', 'CANCELLED', 'REJECTED', 'CLOSED']);

const normalizeUpper = (value) => String(value || '').trim().toUpperCase().replace(/[_-]/g, ' ');

const toDateOrNull = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatMoney = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return '₹0';
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const toDisplayTitle = (event) => String(event?.eventTitle || 'Event').trim() || 'Event';

const toEventCategory = (event, type) => {
    if (type === 'promote') {
        const category = String(event?.eventCategory || '').trim();
        if (normalizeUpper(category) === 'OTHER') {
            return String(event?.customCategory || 'Other').trim() || 'Other';
        }
        return category || 'Other';
    }

    const eventType = String(event?.eventType || '').trim();
    if (normalizeUpper(eventType) === 'OTHER') {
        return String(event?.customEventType || 'Other').trim() || 'Other';
    }
    return eventType || String(event?.category || 'Other').trim() || 'Other';
};

const getEventStartAt = (event, type) => {
    if (type === 'promote') {
        return toDateOrNull(event?.schedule?.startAt || event?.createdAt);
    }
    return toDateOrNull(event?.schedule?.startAt || event?.eventDate || event?.createdAt);
};

const toStartOfDay = (value) => {
    const date = toDateOrNull(value);
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

const toStartOfMonth = (value) => {
    const date = toDateOrNull(value);
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 0, 0, 0, 0);
const addMonths = (date, months) => new Date(date.getFullYear(), date.getMonth() + months, 1, 0, 0, 0, 0);

const getPlanningFinance = (event) => {
    const transactions = [];
    const pushTxn = (dateValue, amount, label) => {
        const date = toDateOrNull(dateValue);
        const numericAmount = Number(amount || 0);
        if (!date || !Number.isFinite(numericAmount) || numericAmount <= 0) return;
        transactions.push({ date, amount: numericAmount, label });
    };

    pushTxn(event?.depositPaidAt, Number(event?.depositPaidAmountPaise || 0) / 100, 'Deposit');
    pushTxn(event?.vendorConfirmationPaidAt, Number(event?.vendorConfirmationPaidAmountPaise || 0) / 100, 'Vendor confirmation');
    pushTxn(event?.remainingPaymentPaidAt, Number(event?.remainingPaymentPaidAmountPaise || 0) / 100, 'Remaining payment');

    if (event?.platformFeePaid) {
        pushTxn(event?.createdAt, Number(event?.platformFee || 0), 'Platform fee');
    }

    const collectedAmountInr = transactions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const totalAmountInr = Number(event?.totalAmount || 0);
    const expectedAmountInr = totalAmountInr > 0 ? totalAmountInr : collectedAmountInr;

    return {
        transactions,
        collectedAmountInr: Number(collectedAmountInr.toFixed(2)),
        expectedAmountInr: Number(expectedAmountInr.toFixed(2)),
    };
};

const getPromoteFinance = (event) => {
    const grossRevenue = Number(event?.ticketAnalytics?.grossRevenueInr || 0);
    const totalAmount = Number(event?.totalAmount || 0);
    const collectedAmountInr = grossRevenue > 0 ? grossRevenue : Math.max(0, totalAmount);
    const expectedAmountInr = totalAmount > 0 ? totalAmount : collectedAmountInr;

    const paymentDate = toDateOrNull(event?.schedule?.startAt || event?.createdAt);
    const transactions = paymentDate && collectedAmountInr > 0
        ? [{ date: paymentDate, amount: Number(collectedAmountInr.toFixed(2)), label: 'Ticket revenue' }]
        : [];

    return {
        transactions,
        collectedAmountInr: Number(collectedAmountInr.toFixed(2)),
        expectedAmountInr: Number(expectedAmountInr.toFixed(2)),
    };
};

const toExportDateRangeLabel = (rangeKey) => {
    if (rangeKey === 'month') return 'Last 30 Days';
    if (rangeKey === 'year') return 'Year to Date';
    return 'All Time';
};

const buildCurrentBounds = (rangeKey, now) => {
    const current = toDateOrNull(now) || new Date();
    if (rangeKey === 'month') {
        const end = new Date(current);
        const start = addDays(toStartOfDay(current), -29);
        return { start, end };
    }

    if (rangeKey === 'year') {
        return {
            start: new Date(current.getFullYear(), 0, 1, 0, 0, 0, 0),
            end: new Date(current),
        };
    }

    return { start: null, end: new Date(current) };
};

const buildEventBounds = (rangeKey, now) => {
    const current = toDateOrNull(now) || new Date();

    if (rangeKey === 'month') {
        return {
            start: addDays(toStartOfDay(current), -29),
            end: addDays(toStartOfDay(current), 30),
        };
    }

    if (rangeKey === 'year') {
        return {
            start: new Date(current.getFullYear(), 0, 1, 0, 0, 0, 0),
            end: new Date(current.getFullYear(), 11, 31, 23, 59, 59, 999),
        };
    }

    return { start: null, end: null };
};

const buildPreviousBounds = (rangeKey, now) => {
    const current = toDateOrNull(now) || new Date();

    if (rangeKey === 'month') {
        const currentStart = addDays(toStartOfDay(current), -29);
        const previousEnd = addDays(currentStart, -1);
        const previousStart = addDays(previousEnd, -29);
        return { start: previousStart, end: previousEnd };
    }

    if (rangeKey === 'year') {
        const end = new Date(current.getFullYear() - 1, current.getMonth(), current.getDate(), current.getHours(), current.getMinutes(), current.getSeconds(), current.getMilliseconds());
        const start = new Date(current.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
        return { start, end };
    }

    return null;
};

const isInBounds = (value, bounds) => {
    const date = toDateOrNull(value);
    if (!date) return false;
    if (!bounds?.start && !bounds?.end) return true;

    const ms = date.getTime();
    if (bounds?.start && ms < bounds.start.getTime()) return false;
    if (bounds?.end && ms > bounds.end.getTime()) return false;
    return true;
};

const formatEventStartShort = (value) => {
    const date = toDateOrNull(value);
    if (!date) return 'Date TBD';
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const getDaysUntil = (value, now) => {
    const target = toDateOrNull(value);
    const current = toDateOrNull(now) || new Date();
    if (!target) return null;
    const diffMs = target.getTime() - current.getTime();
    return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
};

const buildTimeSeries = ({ rangeKey, now, events, transactions }) => {
    const current = toDateOrNull(now) || new Date();

    if (rangeKey === 'month') {
        const start = addDays(toStartOfDay(current), -29);
        const buckets = [];
        const keyToRow = new Map();

        for (let i = 0; i < 30; i += 1) {
            const date = addDays(start, i);
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const row = {
                key,
                label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                collected: 0,
                expected: 0,
            };
            buckets.push(row);
            keyToRow.set(key, row);
        }

        transactions.forEach((txn) => {
            const date = toDateOrNull(txn?.date);
            const amount = Number(txn?.amount || 0);
            if (!date || amount <= 0) return;
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const row = keyToRow.get(key);
            if (!row) return;
            row.collected += amount;
        });

        events.forEach((event) => {
            const anchor = toDateOrNull(event?.startAt || event?.createdAt);
            const amount = Number(event?.expectedAmountInr || 0);
            if (!anchor || amount <= 0) return;
            const key = `${anchor.getFullYear()}-${anchor.getMonth()}-${anchor.getDate()}`;
            const row = keyToRow.get(key);
            if (!row) return;
            row.expected += amount;
        });

        return buckets.map((row) => ({
            ...row,
            collected: Number(row.collected.toFixed(2)),
            expected: Number(row.expected.toFixed(2)),
        }));
    }

    let startMonth;
    let endMonth;

    if (rangeKey === 'year') {
        startMonth = new Date(current.getFullYear(), 0, 1, 0, 0, 0, 0);
        endMonth = new Date(current.getFullYear(), 11, 1, 0, 0, 0, 0);
    } else {
        const eventDates = events
            .map((event) => toStartOfMonth(event?.startAt || event?.createdAt))
            .filter(Boolean);
        const txnDates = transactions
            .map((txn) => toStartOfMonth(txn?.date))
            .filter(Boolean);

        const allDates = [...eventDates, ...txnDates, toStartOfMonth(current)].filter(Boolean);
        const earliest = allDates.reduce((min, date) => (date.getTime() < min.getTime() ? date : min));
        const latest = allDates.reduce((max, date) => (date.getTime() > max.getTime() ? date : max));

        const maxMonths = 24;
        const diffMonths = (latest.getFullYear() - earliest.getFullYear()) * 12 + (latest.getMonth() - earliest.getMonth());
        startMonth = diffMonths + 1 > maxMonths ? addMonths(latest, -(maxMonths - 1)) : earliest;
        endMonth = latest;
    }

    const buckets = [];
    const keyToRow = new Map();

    for (
        let cursor = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1, 0, 0, 0, 0);
        cursor.getTime() <= endMonth.getTime();
        cursor = addMonths(cursor, 1)
    ) {
        const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
        const row = {
            key,
            label: cursor.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
            collected: 0,
            expected: 0,
        };
        buckets.push(row);
        keyToRow.set(key, row);
    }

    transactions.forEach((txn) => {
        const date = toDateOrNull(txn?.date);
        const amount = Number(txn?.amount || 0);
        if (!date || amount <= 0) return;
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const row = keyToRow.get(key);
        if (!row) return;
        row.collected += amount;
    });

    events.forEach((event) => {
        const anchor = toDateOrNull(event?.startAt || event?.createdAt);
        const amount = Number(event?.expectedAmountInr || 0);
        if (!anchor || amount <= 0) return;
        const key = `${anchor.getFullYear()}-${anchor.getMonth()}`;
        const row = keyToRow.get(key);
        if (!row) return;
        row.expected += amount;
    });

    return buckets.map((row) => ({
        ...row,
        collected: Number(row.collected.toFixed(2)),
        expected: Number(row.expected.toFixed(2)),
    }));
};

const BentoCard = ({ children, className = "", title, icon: Icon, action }) => (
    <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all ${className}`}
    >
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
                {Icon && <div className="p-2 bg-gray-50 text-gray-600 rounded-xl"><Icon className="w-5 h-5" /></div>}
                {title && <h3 className="font-bold text-gray-900 text-lg">{title}</h3>}
            </div>
            {action && <button className="text-gray-400 hover:text-gray-900 transition-colors">{action}</button>}
        </div>
        {children}
    </MotionDiv>
);

// --- Main Analytics Component ---

const ManagerAnalytics = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { planningEvents, promoteEvents, loading, error } = useSelector((state) => state.managerEvents);

    const [activeIndex, setActiveIndex] = useState(0);
    const [dateRange, setDateRange] = useState('year'); // 'all', 'year', 'month'
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const POLL_MS = 60000;

        const poll = () => {
            dispatch(fetchManagerPlanningEvents({ limit: 300 }));
            dispatch(fetchManagerPromoteEvents({ limit: 300 }));
        };

        poll();
        const intervalId = setInterval(poll, POLL_MS);
        return () => clearInterval(intervalId);
    }, [dispatch]);

    const currentBounds = useMemo(() => buildCurrentBounds(dateRange, currentTime), [dateRange, currentTime]);
    const previousBounds = useMemo(() => buildPreviousBounds(dateRange, currentTime), [dateRange, currentTime]);
    const eventBounds = useMemo(() => buildEventBounds(dateRange, currentTime), [dateRange, currentTime]);

    const combinedEvents = useMemo(() => {
        const planning = (planningEvents || []).map((event) => {
            const finance = getPlanningFinance(event);
            const status = String(event?.status || '').trim();
            return {
                id: String(event?.eventId || '').trim(),
                type: 'planning',
                title: toDisplayTitle(event),
                category: toEventCategory(event, 'planning'),
                status,
                startAt: getEventStartAt(event, 'planning'),
                createdAt: toDateOrNull(event?.createdAt),
                collectedAmountInr: finance.collectedAmountInr,
                expectedAmountInr: finance.expectedAmountInr,
                outstandingAmountInr: Number(Math.max(0, finance.expectedAmountInr - finance.collectedAmountInr).toFixed(2)),
                transactions: finance.transactions,
            };
        });

        const promote = (promoteEvents || []).map((event) => {
            const finance = getPromoteFinance(event);
            const status = String(event?.eventStatus || event?.status || '').trim();
            return {
                id: String(event?.eventId || '').trim(),
                type: 'promote',
                title: toDisplayTitle(event),
                category: toEventCategory(event, 'promote'),
                status,
                startAt: getEventStartAt(event, 'promote'),
                createdAt: toDateOrNull(event?.createdAt),
                collectedAmountInr: finance.collectedAmountInr,
                expectedAmountInr: finance.expectedAmountInr,
                outstandingAmountInr: Number(Math.max(0, finance.expectedAmountInr - finance.collectedAmountInr).toFixed(2)),
                transactions: finance.transactions,
            };
        });

        return [...planning, ...promote]
            .filter((event) => event.id)
            .sort((a, b) => {
                const at = (a.startAt || a.createdAt)?.getTime?.() || 0;
                const bt = (b.startAt || b.createdAt)?.getTime?.() || 0;
                return bt - at;
            });
    }, [planningEvents, promoteEvents]);

    const scopedEvents = useMemo(() => {
        return combinedEvents.filter((event) => {
            const anchor = event.startAt || event.createdAt;
            return isInBounds(anchor, eventBounds);
        });
    }, [combinedEvents, eventBounds]);

    const allTransactions = useMemo(() => {
        return combinedEvents.flatMap((event) => {
            const rows = Array.isArray(event.transactions) ? event.transactions : [];
            return rows.map((row) => ({ ...row, eventId: event.id, eventTitle: event.title }));
        });
    }, [combinedEvents]);

    const collectedTransactions = useMemo(() => {
        return allTransactions.filter((row) => isInBounds(row.date, currentBounds));
    }, [allTransactions, currentBounds]);

    const totalRevenue = useMemo(() => {
        return Number(
            collectedTransactions
                .reduce((sum, row) => sum + Number(row.amount || 0), 0)
                .toFixed(2)
        );
    }, [collectedTransactions]);

    const previousRevenue = useMemo(() => {
        if (!previousBounds) return 0;

        return Number(
            allTransactions
                .filter((row) => isInBounds(row.date, previousBounds))
                .reduce((sum, row) => sum + Number(row.amount || 0), 0)
                .toFixed(2)
        );
    }, [allTransactions, previousBounds]);

    const revenueDeltaPct = useMemo(() => {
        if (previousRevenue <= 0) return null;
        const delta = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
        return Number(delta.toFixed(1));
    }, [totalRevenue, previousRevenue]);

    const assignedEventsCount = scopedEvents.length;

    const completedEventsCount = useMemo(() => {
        return scopedEvents.filter((event) => TERMINAL_STATUSES.has(normalizeUpper(event.status))).length;
    }, [scopedEvents]);

    const activeEventsCount = Math.max(0, assignedEventsCount - completedEventsCount);

    const totalExpectedFinance = useMemo(() => {
        return Number(
            scopedEvents
                .reduce((sum, event) => sum + Number(event.expectedAmountInr || 0), 0)
                .toFixed(2)
        );
    }, [scopedEvents]);

    const pendingInvoices = useMemo(() => {
        const rows = scopedEvents.filter((event) => Number(event.outstandingAmountInr || 0) > 0);
        const amount = rows.reduce((sum, event) => sum + Number(event.outstandingAmountInr || 0), 0);
        return {
            count: rows.length,
            amount: Number(amount.toFixed(2)),
        };
    }, [scopedEvents]);

    const upcomingEvents = useMemo(() => {
        const current = new Date();
        return scopedEvents
            .filter((event) => {
                const startMs = event.startAt?.getTime?.() || 0;
                return startMs > current.getTime();
            })
            .sort((a, b) => {
                const at = a.startAt?.getTime?.() || 0;
                const bt = b.startAt?.getTime?.() || 0;
                return at - bt;
            })
            .slice(0, 3);
    }, [scopedEvents]);

    const nextBigEvent = upcomingEvents[0] || null;

    const chartData = useMemo(() => {
        return buildTimeSeries({
            rangeKey: dateRange,
            now: currentTime,
            events: scopedEvents,
            transactions: collectedTransactions,
        });
    }, [dateRange, currentTime, scopedEvents, collectedTransactions]);

    const miniRevenueData = useMemo(() => {
        return chartData.slice(-6).map((row) => ({ label: row.label, value: row.collected }));
    }, [chartData]);

    const categoryData = useMemo(() => {
        const grouped = scopedEvents.reduce((acc, event) => {
            const key = String(event.category || 'Other').trim() || 'Other';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const total = scopedEvents.length || 1;
        return Object.entries(grouped)
            .map(([name, count], index) => ({
                name,
                count,
                value: Number(((count / total) * 100).toFixed(1)),
                color: PIE_COLORS[index % PIE_COLORS.length],
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [scopedEvents]);

    const onPieEnter = (_, index) => setActiveIndex(index);

    const completionRatio = assignedEventsCount > 0 ? Math.min(1, completedEventsCount / assignedEventsCount) : 0;
    const ringCircumference = 2 * Math.PI * 56;
    const ringOffset = ringCircumference * (1 - completionRatio);

    const handleExport = () => {
        try {
            const payload = {
                generatedAt: new Date().toISOString(),
                range: toExportDateRangeLabel(dateRange),
                summary: {
                    assignedEvents: assignedEventsCount,
                    activeEvents: activeEventsCount,
                    completedEvents: completedEventsCount,
                    totalRevenue,
                    totalExpectedFinance,
                    pendingInvoices: pendingInvoices.count,
                    pendingAmount: pendingInvoices.amount,
                },
                financeTimeline: chartData,
                eventDistribution: categoryData,
                upcomingEvents: upcomingEvents.map((event) => ({
                    eventId: event.id,
                    eventType: event.type,
                    title: event.title,
                    status: event.status,
                    category: event.category,
                    startAt: event.startAt?.toISOString?.() || null,
                    expectedAmountInr: event.expectedAmountInr,
                    collectedAmountInr: event.collectedAmountInr,
                    outstandingAmountInr: event.outstandingAmountInr,
                })),
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `manager-analytics-${dateRange}-${Date.now()}.json`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
            toast.success('Analytics report exported.');
        } catch {
            toast.error('Export failed.');
        }
    };

    const formatDelta = (value) => {
        if (value === null) return 'No previous baseline';
        const absolute = Math.abs(value);
        return `${value >= 0 ? '+' : '-'}${absolute.toFixed(1)}%`;
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 max-w-480 mx-auto">

            {/* 1. Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Performance</h1>
                    <p className="text-gray-500 font-medium text-lg">Events and finance insights for requests assigned to you.</p>
                </div>

                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-2">
                    <button
                        onClick={() => setDateRange('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${dateRange === 'all' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                        All Time
                    </button>
                    <button
                        onClick={() => setDateRange('year')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${dateRange === 'year' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                        Year to Date
                    </button>
                    <button
                        onClick={() => setDateRange('month')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${dateRange === 'month' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                        Last 30 Days
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-2"></div>
                    <button className="p-2 text-gray-500 hover:text-teal-600 rounded-lg">
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button onClick={handleExport} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-teal-700 shadow-lg shadow-teal-900/20">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {!!error && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-semibold">
                    {String(error)}
                </div>
            )}

            {/* 2. Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">

                {/* A. Key Metrics (Top Row) */}
                <BentoCard className="xl:col-span-1" title="Total Revenue" icon={DollarSign}>
                    <div className="mt-2">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{formatMoney(totalRevenue)}</h2>
                        <div
                            className={`flex items-center gap-2 text-sm font-bold w-fit px-2 py-1 rounded-lg ${
                                revenueDeltaPct === null
                                    ? 'text-gray-600 bg-gray-100'
                                    : revenueDeltaPct >= 0
                                        ? 'text-green-600 bg-green-50'
                                        : 'text-rose-600 bg-rose-50'
                            }`}
                        >
                            {revenueDeltaPct === null ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : revenueDeltaPct >= 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                            ) : (
                                <ArrowDownRight className="w-4 h-4" />
                            )}
                            {formatDelta(revenueDeltaPct)}
                            <span className="text-gray-400 font-medium">vs previous period</span>
                        </div>
                    </div>
                    <div className="h-16 mt-8 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={miniRevenueData}>
                                <defs>
                                    <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} fill="url(#miniGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </BentoCard>

                <BentoCard className="xl:col-span-1" title="Assigned Events" icon={CheckCircle2}>
                    <div className="mt-2 text-center relative py-6">
                        <div className="relative inline-block">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="#14b8a6"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={ringCircumference}
                                    strokeDashoffset={ringOffset}
                                />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="block text-3xl font-extrabold text-gray-900">{assignedEventsCount}</span>
                                <span className="text-xs font-bold text-gray-400 uppercase">In Scope</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-500 font-semibold -mt-2">
                        {completedEventsCount} completed • {activeEventsCount} active
                    </div>
                </BentoCard>

                <BentoCard className="xl:col-span-2 bg-linear-to-br from-gray-900 to-gray-800 text-white border-none" title="Upcoming Highlights" icon={Target} action={<MoreHorizontal className="text-gray-400" />}>
                    <div className="grid grid-cols-3 gap-6 mt-4">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Next Big Event</p>
                            <p className="text-lg font-bold text-white truncate">{nextBigEvent ? nextBigEvent.title : 'No upcoming event'}</p>
                            <p className="text-sm text-teal-400 font-medium mt-1">
                                {nextBigEvent
                                    ? `In ${getDaysUntil(nextBigEvent.startAt, currentTime)} day(s)`
                                    : 'Awaiting schedules'}
                            </p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pending Invoices</p>
                            <p className="text-lg font-bold text-white">{formatMoney(pendingInvoices.amount)}</p>
                            <p className="text-sm text-amber-400 font-medium mt-1">{pendingInvoices.count} Outstanding</p>
                        </div>
                        <div
                            onClick={() => navigate('/manager/reports')}
                            className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/20 transition-colors"
                        >
                            <div className="bg-teal-500 rounded-full p-2 mb-2 text-white shadow-lg shadow-teal-500/30">
                                <ArrowUpRight className="w-5 h-5 block" />
                            </div>
                            <p className="text-xs font-bold">View Reports</p>
                        </div>
                    </div>
                </BentoCard>

                {/* B. Main Charts (Middle Row) */}
                <BentoCard className="xl:col-span-3 xl:row-span-2" title="Financial Overview" icon={TrendingUp} action={
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Collected</span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-indigo-300"></span> Expected</span>
                    </div>
                }>
                    <div className="h-87.5 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.18} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} tickFormatter={(val) => `₹${Math.round(val / 1000)}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                                    formatter={(value, key) => [formatMoney(value), key === 'collected' ? 'Collected' : 'Expected']}
                                />
                                <Area type="monotone" dataKey="collected" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="expected" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorExpected)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </BentoCard>

                <BentoCard className="xl:col-span-1 xl:row-span-2" title="Event Distribution" icon={Activity}>
                    <div className="h-62.5 w-full relative mt-6">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        activeIndex={activeIndex}
                                        activeShape={(props) => {
                                            const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
                                            return (
                                                <g>
                                                    <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#111827" className="text-xl font-bold">{payload.value}%</text>
                                                    <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#9ca3af" className="text-xs font-bold uppercase">{payload.name}</text>
                                                    <Sector
                                                        cx={cx}
                                                        cy={cy}
                                                        innerRadius={innerRadius}
                                                        outerRadius={outerRadius + 8}
                                                        startAngle={startAngle}
                                                        endAngle={endAngle}
                                                        fill={fill}
                                                    />
                                                </g>
                                            );
                                        }}
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        dataKey="value"
                                        onMouseEnter={onPieEnter}
                                        paddingAngle={5}
                                        cornerRadius={5}
                                    >
                                        {categoryData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-500 font-medium">
                                No events in this range.
                            </div>
                        )}
                    </div>
                    <div className="space-y-4 mt-6">
                        {categoryData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                </div>
                                <span className="font-bold text-gray-900">{item.value}%</span>
                            </div>
                        ))}
                        {categoryData.length === 0 && (
                            <div className="text-sm text-gray-500 font-medium">Distribution appears once assigned events are available.</div>
                        )}
                    </div>
                </BentoCard>
            </div>

            {loading && scopedEvents.length === 0 && (
                <div className="mt-6 text-sm text-gray-500 font-semibold">Loading assigned event analytics...</div>
            )}

            {nextBigEvent && (
                <div className="mt-6 bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-600 font-medium shadow-sm">
                    Next event: <span className="font-bold text-gray-900">{nextBigEvent.title}</span> • {formatEventStartShort(nextBigEvent.startAt)}
                </div>
            )}
        </div>
    );
};

export default ManagerAnalytics;
