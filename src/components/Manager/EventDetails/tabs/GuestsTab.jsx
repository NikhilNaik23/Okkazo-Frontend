import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Search, Filter, Plus, Download, Check, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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

const GuestsTab = ({ onAddClick, onGuestCountChange }) => {
    const dispatch = useDispatch();
    const { id: eventId } = useParams();

    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, limit: 20, totalPages: 0 });

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
                    <button onClick={() => toast.success("Exporting guest list to CSV...")} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={onAddClick} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Guest
                    </button>
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
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs border border-white shadow-sm">
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
        </div>
    );
};

export default GuestsTab;
