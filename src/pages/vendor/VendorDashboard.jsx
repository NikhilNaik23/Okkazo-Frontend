import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    BsCashStack,
    BsCalendarCheck,
    BsClock,
    BsCheckCircleFill,
    BsBoxArrowUpRight
} from "react-icons/bs";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { toast } from "react-hot-toast";
import VendorAvailabilityCalendar from "../../components/Global/VendorAvailabilityCalendar";
import { fetchWithAuth } from "../../utils/apiHandler";
import { refreshAccessToken } from "../../store/slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const DAY_MS = 24 * 60 * 60 * 1000;

const ANALYTICS_WINDOW_OPTIONS = [
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'last90', label: 'Last 90 Days' },
    { value: 'last180', label: 'Last 180 Days' },
    { value: 'ytd', label: 'YTD' },
];

const getAnalyticsWindowLabel = (value) => {
    const option = ANALYTICS_WINDOW_OPTIONS.find((item) => item.value === value);
    return option?.label || 'Last 30 Days';
};

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const toAmountInr = (value) => {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n : 0;
};

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const toDayKey = (value) => {
    const date = toDate(value);
    if (!date) return null;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const toMonthKey = (value) => {
    const date = toDate(value);
    if (!date) return null;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
};

const startOfDay = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const endOfDay = (value) => {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
};

const resolveWindowRange = (windowKey = 'last30') => {
    const normalized = ANALYTICS_WINDOW_OPTIONS.some((item) => item.value === windowKey)
        ? windowKey
        : 'last30';

    const to = endOfDay(new Date());
    const from = startOfDay(to);

    if (normalized === 'last30') {
        from.setDate(from.getDate() - 29);
    } else if (normalized === 'last90') {
        from.setDate(from.getDate() - 89);
    } else if (normalized === 'last180') {
        from.setDate(from.getDate() - 179);
    } else if (normalized === 'ytd') {
        from.setMonth(0, 1);
    }

    const spanDays = Math.max(1, Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS) + 1);

    const previousTo = new Date(from.getTime() - 1);
    const previousFrom = startOfDay(previousTo);
    previousFrom.setDate(previousFrom.getDate() - (spanDays - 1));

    return {
        key: normalized,
        label: getAnalyticsWindowLabel(normalized),
        from,
        to,
        previousFrom,
        previousTo,
        spanDays,
    };
};

const getSummaryStatus = (row) => {
    const raw = String(row?.summary?.summaryStatus || '').trim().toUpperCase();
    if (raw) return raw;

    const vendorItems = Array.isArray(row?.vendorItems) ? row.vendorItems : [];
    const hasPending = vendorItems.some((v) => String(v?.status || '').trim().toUpperCase() === 'YET_TO_SELECT');
    const hasRejected = vendorItems.some((v) => String(v?.status || '').trim().toUpperCase() === 'REJECTED');
    if (hasPending) return 'PENDING';
    if (hasRejected) return 'REJECTED';
    return vendorItems.length > 0 ? 'ACCEPTED' : 'UNKNOWN';
};

const summarizeServices = (vendorItems = []) => {
    const items = Array.isArray(vendorItems) ? vendorItems : [];
    const accepted = items
        .filter((item) => String(item?.status || '').trim().toUpperCase() === 'ACCEPTED')
        .map((item) => String(item?.service || '').trim())
        .filter(Boolean);

    const pending = items
        .filter((item) => String(item?.status || '').trim().toUpperCase() === 'YET_TO_SELECT')
        .map((item) => String(item?.service || '').trim())
        .filter(Boolean);

    const preferred = accepted.length ? accepted : pending;
    if (!preferred.length) return 'Service details unavailable';
    if (preferred.length === 1) return preferred[0];
    return `${preferred.slice(0, 2).join(', ')}${preferred.length > 2 ? ` +${preferred.length - 2} more` : ''}`;
};

const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const VendorDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [analyticsWindow, setAnalyticsWindow] = useState('last30');
    const [ledgerRows, setLedgerRows] = useState([]);
    const [vendorRequests, setVendorRequests] = useState([]);

    const windowRange = useMemo(() => resolveWindowRange(analyticsWindow), [analyticsWindow]);

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            setIsLoading(true);
            setLoadError('');

            try {
                const [ledgerResponse, requestsResponse] = await Promise.all([
                    fetchWithAuth(
                        `${API_BASE_URL}/api/events/vendor/requests/ledger`,
                        { method: 'GET' },
                        { dispatch, refreshAction: refreshAccessToken }
                    ),
                    fetchWithAuth(
                        `${API_BASE_URL}/api/events/vendor/requests`,
                        { method: 'GET' },
                        { dispatch, refreshAction: refreshAccessToken }
                    ),
                ]);

                const [ledgerData, requestsData] = await Promise.all([
                    safeJson(ledgerResponse),
                    safeJson(requestsResponse),
                ]);

                if (!ledgerResponse.ok || !ledgerData?.success) {
                    throw new Error(ledgerData?.message || 'Failed to load revenue ledger');
                }

                if (!requestsResponse.ok || !requestsData?.success) {
                    throw new Error(requestsData?.message || 'Failed to load vendor requests');
                }

                if (cancelled) return;

                setLedgerRows(Array.isArray(ledgerData?.data?.rows) ? ledgerData.data.rows : []);
                setVendorRequests(Array.isArray(requestsData?.data?.requests) ? requestsData.data.requests : []);
            } catch (error) {
                if (cancelled) return;
                const message = error?.message || 'Unable to load dashboard data';
                setLoadError(message);
                toast.error(message);
                setLedgerRows([]);
                setVendorRequests([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    const todayDayKey = useMemo(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const revenueStats = useMemo(() => {
        let currentAmount = 0;
        let previousAmount = 0;

        (Array.isArray(ledgerRows) ? ledgerRows : []).forEach((row) => {
            const status = String(row?.status || '').trim().toUpperCase();
            if (status !== 'SUCCESS') return;

            const amount = toAmountInr(row?.amountInr);
            const paidAt = toDate(row?.paidAt || row?.createdAt);
            if (!paidAt) return;

            if (paidAt >= windowRange.from && paidAt <= windowRange.to) currentAmount += amount;
            else if (paidAt >= windowRange.previousFrom && paidAt <= windowRange.previousTo) previousAmount += amount;
        });

        const normalizedCurrent = Number(currentAmount.toFixed(2));
        const normalizedPrevious = Number(previousAmount.toFixed(2));

        let changePct = null;
        if (normalizedPrevious > 0) {
            changePct = ((normalizedCurrent - normalizedPrevious) / normalizedPrevious) * 100;
        }

        return {
            amount: normalizedCurrent,
            changePct,
            changeLabel: changePct == null ? windowRange.label : `${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%`,
        };
    }, [ledgerRows, windowRange]);

    const activeBookingsCount = useMemo(() => {
        const rows = Array.isArray(vendorRequests) ? vendorRequests : [];
        return rows.filter((row) => {
            const summaryStatus = getSummaryStatus(row);
            const planningStatus = String(row?.planningStatus || '').trim().toUpperCase();
            return summaryStatus === 'ACCEPTED' && planningStatus !== 'CLOSED';
        }).length;
    }, [vendorRequests]);

    const pendingRequestsCount = useMemo(() => {
        const rows = Array.isArray(vendorRequests) ? vendorRequests : [];
        return rows.filter((row) => getSummaryStatus(row) === 'PENDING').length;
    }, [vendorRequests]);

    const isMonthlyView = useMemo(() => windowRange.spanDays > 31, [windowRange.spanDays]);

    const revenueSeries = useMemo(() => {
        if (isMonthlyView) {
            const monthCursor = new Date(windowRange.from.getFullYear(), windowRange.from.getMonth(), 1);
            const monthEnd = new Date(windowRange.to.getFullYear(), windowRange.to.getMonth(), 1);
            const points = [];
            const byMonth = new Map();

            while (monthCursor.getTime() <= monthEnd.getTime()) {
                const key = toMonthKey(monthCursor);
                byMonth.set(key, 0);
                points.push({
                    monthKey: key,
                    bucketType: 'month',
                    label: monthCursor.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
                    monthLabel: monthCursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
                    value: 0,
                });
                monthCursor.setMonth(monthCursor.getMonth() + 1);
            }

            (Array.isArray(ledgerRows) ? ledgerRows : []).forEach((row) => {
                const status = String(row?.status || '').trim().toUpperCase();
                if (status !== 'SUCCESS') return;

                const date = toDate(row?.paidAt || row?.createdAt);
                if (!date || date < windowRange.from || date > windowRange.to) return;

                const key = toMonthKey(date);
                if (!key || !byMonth.has(key)) return;

                const nextValue = Number(byMonth.get(key) || 0) + toAmountInr(row?.amountInr);
                byMonth.set(key, nextValue);
            });

            return points.map((point) => ({
                ...point,
                value: Number((byMonth.get(point.monthKey) || 0).toFixed(2)),
            }));
        }

        const start = startOfDay(windowRange.from);

        const points = [];
        const byDay = new Map();

        for (let i = 0; i < windowRange.spanDays; i += 1) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            const key = toDayKey(day);
            byDay.set(key, 0);
            points.push({
                dayKey: key,
                bucketType: 'day',
                label: day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                value: 0,
            });
        }

        (Array.isArray(ledgerRows) ? ledgerRows : []).forEach((row) => {
            const status = String(row?.status || '').trim().toUpperCase();
            if (status !== 'SUCCESS') return;

            const date = toDate(row?.paidAt || row?.createdAt);
            const key = toDayKey(date);
            if (!key || !byDay.has(key)) return;

            const nextValue = Number(byDay.get(key) || 0) + toAmountInr(row?.amountInr);
            byDay.set(key, nextValue);
        });

        return points.map((point) => ({
            ...point,
            value: Number((byDay.get(point.dayKey) || 0).toFixed(2)),
        }));
    }, [isMonthlyView, ledgerRows, windowRange]);

    const xAxisInterval = useMemo(() => {
        if (isMonthlyView) return 0;
        if (windowRange.spanDays <= 35) return 4;
        if (windowRange.spanDays <= 100) return 9;
        if (windowRange.spanDays <= 200) return 14;
        return 20;
    }, [isMonthlyView, windowRange.spanDays]);

    const todayEvents = useMemo(() => {
        const rows = Array.isArray(vendorRequests) ? vendorRequests : [];
        return rows
            .filter((row) => toDayKey(row?.eventDate) === todayDayKey)
            .sort((a, b) => {
                const at = toDate(a?.eventDate)?.getTime() || 0;
                const bt = toDate(b?.eventDate)?.getTime() || 0;
                return at - bt;
            });
    }, [todayDayKey, vendorRequests]);

    const showSkeleton = isLoading || (Boolean(loadError) && ledgerRows.length === 0 && vendorRequests.length === 0);

    if (showSkeleton) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-10 w-72 rounded-2xl bg-white/80" />
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="h-48 rounded-4xl bg-white/80 border border-[#7AB2B2]/15" />
                        <div className="h-48 rounded-4xl bg-white/80 border border-[#7AB2B2]/15" />
                        <div className="h-48 rounded-4xl bg-white/80 border border-[#7AB2B2]/15" />
                    </div>
                    <div className="col-span-12 lg:col-span-7 h-[420px] rounded-4xl bg-white/80 border border-[#7AB2B2]/15" />
                    <div className="col-span-12 lg:col-span-5 h-[420px] rounded-4xl bg-white/80 border border-[#7AB2B2]/15" />
                    <div className="col-span-12 h-[360px] rounded-4xl bg-white/80 border border-[#7AB2B2]/15" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black mb-10 tracking-tight">Dashboard Overview</h1>

            {loadError && (
                <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold">
                    {loadError}
                </div>
            )}

            {/* Dashboard Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* Stats Section */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div 
                        onClick={() => navigate("/vendor/dashboard/ledger")}
                        className="bg-white p-8 rounded-4xl shadow-sm border border-[#708aa0]/5 hover:shadow-xl hover:shadow-[#0b2d49]/5 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-[#d7a444]/10 text-[#d7a444] rounded-2xl group-hover:scale-110 transition-transform">
                                <BsCashStack size={24} />
                            </div>
                            <span className="text-xs font-bold text-[#d7a444] px-2 py-1 bg-[#d7a444]/10 rounded-lg">{revenueStats.changeLabel}</span>
                        </div>
                        <p className="text-sm font-bold text-[#5a5b44] mb-2 uppercase tracking-widest leading-none">Total Revenue ({windowRange.label})</p>
                        <p className="text-3xl font-black tracking-tight">{isLoading ? 'Loading...' : formatInr(revenueStats.amount)}</p>
                    </div>

                    <div
                        onClick={() => navigate("/vendor/booked-events")}
                        className="bg-white p-8 rounded-4xl shadow-sm border border-[#708aa0]/5 hover:shadow-xl hover:shadow-[#0b2d49]/5 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-[#0b2d49]/10 text-[#0b2d49] rounded-2xl group-hover:scale-110 transition-transform">
                                <BsCalendarCheck size={24} />
                            </div>
                            <span className="text-xs font-bold text-[#0b2d49] px-2 py-1 bg-[#0b2d49]/10 rounded-lg">Accepted</span>
                        </div>
                        <p className="text-sm font-bold text-[#5a5b44] mb-2 uppercase tracking-widest leading-none">Active Bookings</p>
                        <p className="text-3xl font-black tracking-tight">{isLoading ? 'Loading...' : activeBookingsCount}</p>
                    </div>

                    <div
                        onClick={() => navigate("/vendor/booked-events")}
                        className="bg-white p-8 rounded-4xl shadow-sm border border-[#708aa0]/5 hover:shadow-xl hover:shadow-[#0b2d49]/5 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-[#d0a862]/10 text-[#d0a862] rounded-2xl group-hover:scale-110 transition-transform">
                                <BsClock size={24} />
                            </div>
                            <span className="text-xs font-bold text-red-500 px-2 py-1 bg-red-50 rounded-lg uppercase">Action Needed</span>
                        </div>
                        <p className="text-sm font-bold text-[#5a5b44] mb-2 uppercase tracking-widest leading-none">Pending Requests</p>
                        <p className="text-3xl font-black tracking-tight">{isLoading ? 'Loading...' : pendingRequestsCount}</p>
                    </div>
                </div>

                {/* Revenue Overview Chart */}
                <div className="col-span-12 lg:col-span-7 bg-white p-8 rounded-4xl shadow-sm border border-[#708aa0]/5">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black">Revenue Overview ({windowRange.label})</h3>
                        <select
                            value={analyticsWindow}
                            onChange={(e) => setAnalyticsWindow(e.target.value)}
                            className="bg-[#e9eff1] border border-[#d7dfe3] rounded-xl px-4 py-2 text-sm font-bold text-[#0b2d49] focus:ring-0 cursor-pointer"
                        >
                            {ANALYTICS_WINDOW_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={revenueSeries}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0b2d49" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0b2d49" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eff1" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#708aa0', fontSize: 10, fontWeight: 800 }}
                                    interval={xAxisInterval}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#708aa0', fontSize: 10, fontWeight: 800 }}
                                    tickFormatter={(value) => `₹${Number(value || 0).toLocaleString('en-IN', { notation: 'compact', maximumFractionDigits: 1 })}`}
                                />
                                <Tooltip
                                    formatter={(value) => [formatInr(value), 'Received']}
                                    labelFormatter={(label, payload) => {
                                        const point = payload?.[0]?.payload;
                                        if (!point) return label;

                                        if (point.bucketType === 'month') {
                                            return point.monthLabel || label;
                                        }

                                        const dayKey = point.dayKey;
                                        if (!dayKey) return label;
                                        const date = toDate(dayKey);
                                        return date
                                            ? date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
                                            : label;
                                    }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#0b2d49"
                                    strokeWidth={4}
                                    activeDot={{ r: 6, fill: '#d7a444', stroke: '#ffffff', strokeWidth: 2 }}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vendor Availability Calendar */}
                <div className="col-span-12 lg:col-span-5">
                    <VendorAvailabilityCalendar compact />
                </div>

                {/* Today's Events */}
                <div className="col-span-12 bg-white rounded-4xl shadow-sm border border-[#708aa0]/5 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-black">Today's Events & Details</h3>
                        <button
                            onClick={() => navigate('/vendor/booked-events')}
                            className="text-[#d7a444] font-bold text-sm hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="p-8 text-sm font-bold text-[#708aa0]">Loading today's events...</div>
                    ) : todayEvents.length === 0 ? (
                        <div className="p-8 text-sm font-bold text-[#708aa0]">No events scheduled for today.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {todayEvents.map((event) => {
                                const status = getSummaryStatus(event);
                                const statusTone = status === 'ACCEPTED'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : status === 'PENDING'
                                        ? 'bg-amber-50 text-amber-600'
                                        : 'bg-rose-50 text-rose-600';

                                const eventDate = toDate(event?.eventDate);
                                const eventDateText = eventDate
                                    ? eventDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : 'Date TBD';

                                return (
                                    <div key={event?.eventId} className="p-8 flex items-start justify-between gap-4 group hover:bg-[#e9eff1]/30 transition-all">
                                        <div className="flex gap-6">
                                            <div className="p-4 rounded-2xl bg-[#0b2d49]/10 text-[#0b2d49]">
                                                <BsCheckCircleFill size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-black text-[#0b2d49]">{event?.eventTitle || 'Event'}</h4>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${statusTone}`}>
                                                        {status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#5a5b44] font-medium mb-3">
                                                    {event?.eventType || event?.category || 'Event'} • {event?.locationName || 'Location TBD'} • {summarizeServices(event?.vendorItems)}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#708aa0] font-bold uppercase tracking-widest leading-none">
                                                    <span className="flex items-center gap-1"><BsClock /> {event?.eventTime || eventDateText}</span>
                                                    <span>Guests: {Number(event?.guestCount || 0) > 0 ? Number(event.guestCount) : 'TBD'}</span>
                                                    <span>Planning: {String(event?.planningStatus || 'Unknown').toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/vendor/event/${encodeURIComponent(String(event?.eventId || ''))}`)}
                                            className="flex items-center gap-2 px-6 py-3 bg-[#0b2d49] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#0b2d49]/10 hover:bg-[#d7a444] transition-all"
                                        >
                                            Open Event <BsBoxArrowUpRight />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
