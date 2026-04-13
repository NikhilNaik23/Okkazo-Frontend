import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Search, RefreshCcw, Clock3, IndianRupee, CheckCircle2, XCircle } from 'lucide-react';
import { fetchWithAuth } from '../../../utils/apiHandler';
import { refreshAccessToken, selectUser } from '../../../store/slices/authSlice';
import { fetchManagerPlanningRefundRequests } from '../../../store/slices/managerRefundsSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const REFUND_ELIGIBLE_ASSIGNED_ROLES = new Set([
  'REVENUE OPERATIONS SPECIALIST',
  'REVENUE OPERATION SPECIALIST',
  'REVENUE OPERATIONS SPECIALISTS',
  'REVENUE OPERATION SPECIALISTS',
]);

const normalizeAssignedRole = (value) => String(value || '')
  .trim()
  .toUpperCase()
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ');

const formatInrFromPaise = (value) => {
  const paise = Number(value || 0);
  const inr = Number.isFinite(paise) && paise > 0 ? paise / 100 : 0;
  return inr.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
};

const toStatusChipClass = (status) => {
  const normalized = String(status || '').trim().toUpperCase();
  if (normalized === 'PENDING_REVIEW') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (normalized === 'APPROVED') return 'bg-sky-50 text-sky-700 border-sky-200';
  if (normalized === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (normalized === 'REFUNDED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const humanizeStatus = (status) => String(status || '')
  .trim()
  .replace(/_/g, ' ')
  .toLowerCase()
  .replace(/\b\w/g, (c) => c.toUpperCase());

const ManagerRefundRequests = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { requests, loading, error } = useSelector((state) => state.managerRefunds);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingEventId, setUpdatingEventId] = useState(null);

  const canAccessRefundQueue = useMemo(() => {
    const assignedRole = normalizeAssignedRole(user?.assignedRole);
    return REFUND_ELIGIBLE_ASSIGNED_ROLES.has(assignedRole);
  }, [user?.assignedRole]);

  const loadRequests = () => {
    dispatch(fetchManagerPlanningRefundRequests({ limit: 250 }));
  };

  useEffect(() => {
    if (!canAccessRefundQueue) return;

    loadRequests();
    const intervalId = setInterval(loadRequests, 15000);
    return () => clearInterval(intervalId);
  }, [canAccessRefundQueue, dispatch]);

  const filtered = useMemo(() => {
    const search = String(query || '').trim().toLowerCase();
    return (Array.isArray(requests) ? requests : []).filter((item) => {
      const refundStatus = String(item?.refundRequest?.status || '').trim().toUpperCase();
      const matchesStatus = statusFilter === 'ALL' ? true : refundStatus === statusFilter;

      const title = String(item?.eventTitle || '').toLowerCase();
      const eventId = String(item?.eventId || '').toLowerCase();
      const requestId = String(item?.refundRequest?.requestId || '').toLowerCase();
      const reason = String(item?.refundRequest?.cancellationReason || '').toLowerCase();
      const matchesSearch = !search
        || title.includes(search)
        || eventId.includes(search)
        || requestId.includes(search)
        || reason.includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [requests, query, statusFilter]);

  const updateRefundStatus = async ({ eventId, status, refundEventType = 'PLANNING', refundTransactionRef = null }) => {
    try {
      setUpdatingEventId(String(eventId || '').trim() || null);
      const eventType = String(refundEventType || 'PLANNING').trim().toUpperCase();
      const basePath = eventType === 'PROMOTE' ? 'promote' : 'planning';
      const payload = {
        status,
        ...(String(refundTransactionRef || '').trim() ? { refundTransactionRef: String(refundTransactionRef).trim() } : {}),
      };

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/events/${basePath}/${encodeURIComponent(String(eventId || '').trim())}/refund-request`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to update refund request status');
      }

      toast.success(`Refund request marked as ${humanizeStatus(status)}`);
      loadRequests();
    } catch (err) {
      toast.error(err?.message || 'Unable to update refund request');
    } finally {
      setUpdatingEventId(null);
    }
  };

  const handleManualRefund = async ({ eventId, refundEventType }) => {
    const refInput = window.prompt('Enter manual refund transaction reference');
    if (refInput == null) return;

    const refundTransactionRef = String(refInput || '').trim();
    if (!refundTransactionRef) {
      toast.error('Refund transaction reference is required for manual refund.');
      return;
    }

    await updateRefundStatus({ eventId, status: 'REFUNDED', refundEventType, refundTransactionRef });
  };

  if (!canAccessRefundQueue) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Refund Requests</h1>
          <p className="text-sm text-gray-600">
            This workspace is restricted to managers with assigned role Revenue Operations Specialist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-350 mx-auto min-h-screen space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Refund Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Planning and promote cancellation requests assigned to Revenue Operations.</p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-teal-200 hover:text-teal-700 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-4 md:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1 min-w-50">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by event, request id, reason..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500 text-center">
            Loading refund requests...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500 text-center">
            No refund requests found.
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item) => {
              const request = item?.refundRequest || {};
              const status = String(request?.status || '').trim().toUpperCase();
              const result = request?.result || {};
              const busy = updatingEventId === String(item?.eventId || '').trim();
              const refundEventType = String(item?.refundEventType || 'PLANNING').trim().toUpperCase();
              const isPromoteRefund = refundEventType === 'PROMOTE';

              return (
                <div key={`${item?.eventId}:${request?.requestId || ''}`} className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <p className="text-xs font-black uppercase tracking-widest text-teal-700/70">
                        Event ID: {item?.eventId || '—'}
                      </p>
                      <h3 className="text-lg font-extrabold text-gray-900 truncate">{item?.eventTitle || 'Untitled Event'}</h3>
                      <p className="text-xs text-gray-500">Request ID: {request?.requestId || '—'}</p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-widest bg-gray-50 text-gray-700 border-gray-200">
                          {refundEventType}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-widest ${toStatusChipClass(status)}`}>
                          {humanizeStatus(status)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Clock3 className="w-3.5 h-3.5" />
                          Requested: {formatDateTime(request?.requestedAt)}
                        </span>
                      </div>

                      {request?.cancellationReason && (
                        <p className="text-sm text-gray-600">
                          Reason: <span className="font-semibold text-gray-700">{request.cancellationReason}</span>
                        </p>
                      )}
                    </div>

                    <div className="w-full xl:w-90 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Gross Paid</p>
                        <p className="text-base font-extrabold text-gray-900 inline-flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {formatInrFromPaise(result?.grossPaidAmountPaise)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Refund Amount</p>
                        <p className="text-base font-extrabold text-emerald-700 inline-flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {formatInrFromPaise(result?.refundAmountPaise)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 md:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Policy Applied</p>
                        {isPromoteRefund ? (
                          <p className="text-sm font-semibold text-gray-700">
                            Scenario: {result?.scenarioLabel || '—'} • Liability: ₹{formatInrFromPaise(result?.promoterLiabilityAmountPaise)} • Timeline: {result?.timelineLabel || '5-7 working days'}
                          </p>
                        ) : (
                          <p className="text-sm font-semibold text-gray-700">
                            Deduction: {Number(result?.deductionPercent || 0)}% • Timeline: {result?.timelineLabel || '5-7 working days'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {status === 'PENDING_REVIEW' && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateRefundStatus({ eventId: item?.eventId, status: 'APPROVED', refundEventType })}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateRefundStatus({ eventId: item?.eventId, status: 'REJECTED', refundEventType })}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 disabled:opacity-60"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {status === 'APPROVED' && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateRefundStatus({ eventId: item?.eventId, status: 'REFUNDED', refundEventType })}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Automatic Refund
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleManualRefund({ eventId: item?.eventId, refundEventType })}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-800 text-white text-xs font-black uppercase tracking-widest hover:bg-gray-900 disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Manual Refund
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerRefundRequests;
