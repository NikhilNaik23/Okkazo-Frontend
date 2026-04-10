import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Search, Filter, Download, Bell, Check, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '../ui';
import { fetchWithAuth } from '../../../../utils/apiHandler';
import { refreshAccessToken } from '../../../../store/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const getInitials = (name) => {
    const normalized = String(name || '').trim();
    if (!normalized) return 'NA';

    const parts = normalized.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || 'N';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
    return `${first}${last}`.toUpperCase();
};

const formatPaidAmount = (amount, currency) => {
    const value = Number(amount || 0);
    const safeAmount = Number.isFinite(value) && value >= 0 ? value : 0;
    const safeCurrency = String(currency || 'INR').trim() || 'INR';

    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: safeCurrency,
            maximumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
        }).format(safeAmount);
    } catch {
        return `₹${safeAmount.toLocaleString('en-IN')}`;
    }
};

const getStatusBadgeConfig = (status) => {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'confirmed') return { color: 'green', icon: Check };
    if (normalized === 'checked in') return { color: 'blue', icon: CheckCircle };
    if (normalized === 'cancelled') return { color: 'red', icon: AlertCircle };
    return { color: 'amber', icon: AlertCircle };
};

const getFilenameFromContentDisposition = (headerValue, fallback = 'guest-list.csv') => {
    const header = String(headerValue || '').trim();
    if (!header) return fallback;

    const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
        try {
            return decodeURIComponent(String(utfMatch[1]).trim());
        } catch {
            return String(utfMatch[1]).trim();
        }
    }

    const basicMatch = header.match(/filename="?([^";]+)"?/i);
    if (basicMatch?.[1]) {
        return String(basicMatch[1]).trim();
    }

    return fallback;
};

const downloadBlob = ({ blob, filename }) => {
    const safeFilename = String(filename || '').trim() || 'guest-list.csv';
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = safeFilename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
};

const GuestsTab = ({
    onGuestCountChange,
    canNotifyGuests = false,
    eventTitle = 'Event',
    triggerExportSignal = 0,
    triggerNotifySignal = 0,
}) => {
    const dispatch = useDispatch();
    const { id: eventId } = useParams();

    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, limit: 20, totalPages: 0 });
    const [exporting, setExporting] = useState(false);
    const [notifyModalOpen, setNotifyModalOpen] = useState(false);
    const [notifySubmitting, setNotifySubmitting] = useState(false);
    const [notifyForm, setNotifyForm] = useState({
        title: `Update for ${String(eventTitle || '').trim() || 'your event'}`,
        message: '',
        actionUrl: '',
    });

    useEffect(() => {
        setNotifyForm((prev) => ({
            ...prev,
            title: prev.title || `Update for ${String(eventTitle || '').trim() || 'your event'}`,
        }));
    }, [eventTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchInput.trim());
            setPage(1);
        }, 250);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (!eventId) {
            setGuests([]);
            setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
            onGuestCountChange?.(0);
            return;
        }

        let cancelled = false;

        const loadGuests = async () => {
            setLoading(true);
            setError('');

            try {
                const params = new URLSearchParams();
                params.set('page', String(page));
                params.set('limit', String(pagination.limit || 20));
                if (debouncedQuery) params.set('query', debouncedQuery);

                const res = await fetchWithAuth(
                    `${API_BASE_URL}/api/events/tickets/events/${encodeURIComponent(String(eventId))}/guests?${params.toString()}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const json = await safeJson(res);
                if (!res.ok || !json?.success) {
                    throw new Error(json?.message || 'Failed to fetch guest list');
                }

                const data = json?.data || {};
                const rows = Array.isArray(data?.guests) ? data.guests : [];
                const total = Number(data?.total || 0);
                const totalPages = Number(data?.totalPages || 0);
                const limit = Number(data?.limit || pagination.limit || 20);

                if (cancelled) return;

                setGuests(rows);
                setPagination({ total, totalPages, limit });
                if (!debouncedQuery) {
                    onGuestCountChange?.(total);
                }
            } catch (err) {
                if (cancelled) return;
                setGuests([]);
                setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
                setError(err?.message || 'Failed to load guest list');
                if (!debouncedQuery) {
                    onGuestCountChange?.(0);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadGuests();

        return () => {
            cancelled = true;
        };
    }, [eventId, page, debouncedQuery, dispatch, pagination.limit, onGuestCountChange]);

    const showing = useMemo(() => {
        const total = Number(pagination.total || 0);
        if (total === 0) return 'Showing 0 of 0';

        const start = (page - 1) * pagination.limit + 1;
        const end = Math.min(total, start + guests.length - 1);
        return `Showing ${start}-${end} of ${total}`;
    }, [page, pagination.total, pagination.limit, guests.length]);

    const handleExportGuests = async () => {
        if (!eventId) {
            toast.error('Event ID is missing');
            return;
        }

        setExporting(true);
        try {
            const params = new URLSearchParams();
            if (debouncedQuery) params.set('query', debouncedQuery);

            const endpoint = `${API_BASE_URL}/api/events/tickets/events/${encodeURIComponent(String(eventId))}/guests/export${params.toString() ? `?${params.toString()}` : ''}`;

            const res = await fetchWithAuth(
                endpoint,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            if (!res.ok) {
                const json = await safeJson(res);
                throw new Error(json?.message || 'Failed to export guest list');
            }

            const blob = await res.blob();
            const fallback = `guest-list-${String(eventTitle || 'event').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'event'}.csv`;
            const filename = getFilenameFromContentDisposition(res.headers.get('content-disposition'), fallback);

            downloadBlob({ blob, filename });
            toast.success('Guest list exported successfully');
        } catch (error) {
            toast.error(error?.message || 'Failed to export guest list');
        } finally {
            setExporting(false);
        }
    };

    const handleOpenNotifyModal = () => {
        if (!canNotifyGuests) return;

        setNotifyForm({
            title: `Update for ${String(eventTitle || '').trim() || 'your event'}`,
            message: '',
            actionUrl: '',
        });
        setNotifyModalOpen(true);
    };

    const handleNotifyGuests = async (event) => {
        event.preventDefault();

        if (!eventId) {
            toast.error('Event ID is missing');
            return;
        }

        const title = String(notifyForm.title || '').trim();
        const message = String(notifyForm.message || '').trim();
        const actionUrl = String(notifyForm.actionUrl || '').trim();

        if (!title || !message) {
            toast.error('Title and message are required');
            return;
        }

        setNotifySubmitting(true);
        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL}/api/events/tickets/events/${encodeURIComponent(String(eventId))}/guests/notify`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        title,
                        message,
                        actionUrl: actionUrl || undefined,
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const json = await safeJson(res);
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to notify guests');
            }

            const delivered = Number(json?.data?.delivered || 0);
            const failed = Number(json?.data?.failed || 0);
            const targeted = Number(json?.data?.targetedGuests || 0);

            if (targeted === 0) {
                toast('No confirmed guests found for this event.', { icon: 'ℹ️' });
            } else if (failed > 0) {
                toast.success(`Notification sent to ${delivered} guests (${failed} failed).`);
            } else {
                toast.success(`Notification sent to ${delivered} guests.`);
            }

            setNotifyModalOpen(false);
        } catch (error) {
            toast.error(error?.message || 'Failed to notify guests');
        } finally {
            setNotifySubmitting(false);
        }
    };

    useEffect(() => {
        if (!triggerExportSignal) return;
        handleExportGuests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerExportSignal]);

    useEffect(() => {
        if (!triggerNotifySignal) return;

        if (!canNotifyGuests) {
            toast.error('Only assigned manager can notify guests for this event.');
            return;
        }

        setNotifyForm({
            title: `Update for ${String(eventTitle || '').trim() || 'your event'}`,
            message: '',
            actionUrl: '',
        });
        setNotifyModalOpen(true);
    }, [triggerNotifySignal, canNotifyGuests, eventTitle]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by name, email, ticket, or status..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                        />
                    </div>
                    <button onClick={() => toast('Filters coming soon')} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={handleExportGuests}
                        disabled={exporting || loading}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export Excel'}
                    </button>
                    {canNotifyGuests ? (
                        <button
                            onClick={handleOpenNotifyModal}
                            disabled={notifySubmitting || loading}
                            className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Bell className="w-4 h-4" /> Notify Guests
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Data Grid */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-10">
                                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Registrant</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Price Paid</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-sm text-gray-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading guest list...
                                    </div>
                                </td>
                            </tr>
                        )}

                        {!loading && error && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-red-600">
                                    {error}
                                </td>
                            </tr>
                        )}

                        {!loading && !error && guests.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                                    No guests found for this event.
                                </td>
                            </tr>
                        )}

                        {!loading && !error && guests.map((guest) => {
                            const name = guest?.registrant?.name || 'Guest';
                            const email = guest?.registrant?.email || '—';
                            const statusConfig = getStatusBadgeConfig(guest?.status);
                            const StatusIcon = statusConfig.icon;
                            return (
                            <tr key={`${guest?.ticketId || ''}-${guest?.userAuthId || ''}-${guest?.createdAt || ''}`} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs border border-white shadow-sm">
                                            {getInitials(name)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{name}</p>
                                            <p className="text-xs text-gray-500">{email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {guest?.ticketType || 'Ticket'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                    {Number(guest?.quantity || 0)}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        color={statusConfig.color}
                                        icon={StatusIcon}
                                    >
                                        {guest?.status || 'Pending'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                    {formatPaidAmount(guest?.paidAmount, guest?.currency)}
                                </td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                <span className="text-xs font-bold text-gray-500">{showing}</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={loading || page <= 1}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={loading || page >= Number(pagination.totalPages || 0)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {notifyModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-100 shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Notify Guests</h3>
                            <button
                                type="button"
                                onClick={() => setNotifyModalOpen(false)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                disabled={notifySubmitting}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleNotifyGuests} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={notifyForm.title}
                                    onChange={(e) => setNotifyForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter notification title"
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    maxLength={120}
                                    disabled={notifySubmitting}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Message</label>
                                <textarea
                                    value={notifyForm.message}
                                    onChange={(e) => setNotifyForm((prev) => ({ ...prev, message: e.target.value }))}
                                    placeholder="Write the message guests should receive"
                                    className="w-full min-h-28 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-y"
                                    maxLength={1200}
                                    disabled={notifySubmitting}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Action URL (optional)</label>
                                <input
                                    type="url"
                                    value={notifyForm.actionUrl}
                                    onChange={(e) => setNotifyForm((prev) => ({ ...prev, actionUrl: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    disabled={notifySubmitting}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setNotifyModalOpen(false)}
                                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
                                    disabled={notifySubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={notifySubmitting}
                                    className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {notifySubmitting ? 'Sending...' : 'Send Notification'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default GuestsTab;
