import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { fetchWithAuth } from '../../utils/apiHandler';
import { refreshAccessToken, selectUser } from '../../store/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const toIstDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
};

const formatWindow = (slab) => {
  const minDays = slab?.minDays;
  const maxDays = slab?.maxDays;

  if (minDays !== null && minDays !== undefined && (maxDays === null || maxDays === undefined)) {
    return `${minDays}+ days before event`;
  }
  if ((minDays === null || minDays === undefined) && maxDays !== null && maxDays !== undefined) {
    if (Number(maxDays) <= 0) return 'On event day or after event date';
    return `Up to ${maxDays} days before event`;
  }
  if (minDays !== null && minDays !== undefined && maxDays !== null && maxDays !== undefined) {
    if (Number(minDays) === Number(maxDays)) {
      return Number(minDays) === 1 ? '1 day before event' : `${minDays} days before event`;
    }
    return `${minDays} to ${maxDays} days before event`;
  }

  return 'All days';
};

const toSafePercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Number(n.toFixed(2))));
};

const PolicyCard = ({
  title,
  subtitle,
  policy,
  kind = 'planning',
  paragraphs = [],
  simpleRule = null,
  keyNote = null,
}) => {
  const slabs = Array.isArray(policy?.slabs) ? policy.slabs : [];

  const resolveOutcome = (slab) => {
    if (kind === 'ticket') {
      const refundPercent = toSafePercent(slab?.refundPercent);
      const chargePercent = toSafePercent(100 - refundPercent);
      return {
        userGets: `${refundPercent.toFixed(2)}% refund`,
        charge: `${chargePercent.toFixed(2)}% cancellation charge`,
      };
    }

    const deductionPercent = toSafePercent(slab?.deductionPercent);
    const refundPercent = toSafePercent(100 - deductionPercent);
    return {
      userGets: `${refundPercent.toFixed(2)}% returned to you`,
      charge: `${deductionPercent.toFixed(2)}% deduction`,
    };
  };

  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        <p className="text-xs text-gray-500 mt-2">
          Timeline: <span className="font-semibold text-gray-700">{String(policy?.timelineLabel || '5-7 working days')}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Updated: <span className="font-semibold text-gray-700">{toIstDateTime(policy?.updatedAt)}</span>
        </p>
      </div>

      <div className="mb-4 space-y-3 text-sm text-gray-600 leading-relaxed">
        {(Array.isArray(paragraphs) && paragraphs.length > 0
          ? paragraphs
          : ['The table below reflects the currently active policy values.']
        ).map((text, idx) => (
          <p key={`${title}-intro-${idx}`}>{text}</p>
        ))}
      </div>

      {simpleRule?.text ? (
        <div className="mb-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">
            {simpleRule?.label || 'Simple Rule'}
          </p>
          <p className="mt-1 text-sm font-semibold text-blue-900">{simpleRule.text}</p>
        </div>
      ) : null}

      {keyNote?.text ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            {keyNote?.label || 'Important'}
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-900">{keyNote.text}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-gray-600">
          <div className="col-span-5">When You Cancel</div>
          <div className="col-span-3">You Get</div>
          <div className="col-span-4 text-right">Cancellation Charge</div>
        </div>

        {slabs.map((slab) => (
          <div key={String(slab?.code || Math.random())} className="grid grid-cols-12 items-center border-t border-gray-100 px-4 py-3">
            <div className="col-span-5 min-w-0">
              <p className="text-sm font-bold text-gray-900">{formatWindow(slab)}</p>
              <p className="text-[11px] text-gray-500 mt-1">{String(slab?.label || 'Refund slab')}</p>
            </div>
            <div className="col-span-3 text-xs font-semibold text-emerald-700">{resolveOutcome(slab).userGets}</div>
            <div className="col-span-4 text-right text-sm font-extrabold text-gray-900">
              {resolveOutcome(slab).charge}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const PromotePolicyCard = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-2xl font-extrabold text-gray-900">Promote Cancellation and Liability Policy</h2>
      <div className="mt-2 space-y-3 text-sm text-gray-600 leading-relaxed">
        <p>
          Promoted event refunds are handled differently from standard ticket refunds. The final outcome depends on when the
          event is cancelled and whether ticket sales have already begun.
        </p>
        <p>
          All ticket payments are held securely by Okkazo until the event is completed or cancelled.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wide text-blue-700">Simple Rule</p>
        <p className="mt-1 text-sm font-semibold text-blue-900">
          Once ticket sales begin, platform fees generated from ticket sales (including service or transaction fees) must be
          settled before the event can be closed.
        </p>
        <p className="mt-1 text-xs font-semibold text-blue-800">
          The 24-hour refund window is only applicable if no ticket sales or platform fee generation has occurred.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
        <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-gray-600">
          <div className="col-span-4">Scenarios</div>
          <div className="col-span-4">What Is Refunded</div>
          <div className="col-span-4">Liability and Settlement</div>
        </div>

        <div className="grid grid-cols-12 border-t border-gray-100 px-4 py-4 text-sm bg-emerald-50/40">
          <div className="col-span-4 pr-3">
            <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-800">
              Eligible Window
            </p>
            <p className="mt-2 font-bold text-gray-900">Cancelled within 24 hours of payment</p>
            <p className="mt-1 text-xs text-gray-600">Only applicable if event is not yet approved and ticket sales have not started.</p>
          </div>
          <div className="col-span-4 text-gray-700">
            <p>Full refund of service fee and promotion fee.</p>
          </div>
          <div className="col-span-4 text-gray-700">
            <p>No liability applies.</p>
          </div>
        </div>

        <div className="grid grid-cols-12 border-t border-gray-100 px-4 py-4 text-sm bg-emerald-50/40">
          <div className="col-span-4 pr-3">
            <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-800">
              Pre-Sales Cancellation
            </p>
            <p className="mt-2 font-bold text-gray-900">Cancelled before ticket sales begin (after 24 hours)</p>
          </div>
          <div className="col-span-4 text-gray-700 space-y-1">
            <p>Service fee is non-refundable.</p>
            <p>Promotion fee is refundable if unused.</p>
            <p>Promotion fee may be partially refundable if partially used.</p>
            <p>Promotion fee is non-refundable if fully used.</p>
          </div>
          <div className="col-span-4 text-gray-700">
            <p>No platform fee liability applies.</p>
          </div>
        </div>

        <div className="grid grid-cols-12 border-t border-gray-100 px-4 py-4 text-sm bg-rose-50/40">
          <div className="col-span-4 pr-3">
            <p className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-rose-800">
              Post-Sales Cancellation
            </p>
            <p className="mt-2 font-bold text-gray-900">Cancelled after ticket sales start</p>
          </div>
          <div className="col-span-4 text-gray-700 space-y-1">
            <p>All ticket buyers receive full refund.</p>
            <p>Event creator does not receive any refund.</p>
          </div>
          <div className="col-span-4 text-gray-700 space-y-1">
            <p>Event creator must settle platform fees generated from ticket sales and any used promotion cost.</p>
            <p>These charges are adjusted from available balances or may need separate payment before final closure.</p>
          </div>
        </div>

        <div className="grid grid-cols-12 border-t border-gray-100 px-4 py-4 text-sm bg-amber-50/40">
          <div className="col-span-4 pr-3">
            <p className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-amber-800">
              Platform Failure
            </p>
            <p className="mt-2 font-bold text-gray-900">Cancellation due to Okkazo failure</p>
          </div>
          <div className="col-span-4 text-gray-700">
            <p>Full refund to event creator, including service fee and promotion fee, and full refund to all ticket buyers.</p>
          </div>
          <div className="col-span-4 text-gray-700">
            <p>No liability applies to the event creator.</p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900">
        The event will not be considered fully closed until all outstanding liabilities are settled.
      </div>
    </section>
  );
};

const RefundPolicyCenter = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [loading, setLoading] = useState(true);
  const [planningPolicy, setPlanningPolicy] = useState(null);
  const [ticketPolicy, setTicketPolicy] = useState(null);

  const dashboardPath = useMemo(() => {
    const role = String(user?.role || localStorage.getItem('userRole') || '').trim().toUpperCase();
    if (role === 'ADMIN') return '/admin';
    if (role === 'MANAGER') return '/manager/dashboard';
    if (role === 'VENDOR') return '/vendor/dashboard';
    return '/user/dashboard';
  }, [user?.role]);

  useEffect(() => {
    let cancelled = false;

    const loadPolicies = async () => {
      setLoading(true);
      try {
        const [planningRes, ticketRes] = await Promise.all([
          fetchWithAuth(
            `${API_BASE_URL}/api/events/config/refund-policy`,
            { method: 'GET' },
            { dispatch, refreshAction: refreshAccessToken }
          ),
          fetchWithAuth(
            `${API_BASE_URL}/api/events/config/ticket-refund-policy`,
            { method: 'GET' },
            { dispatch, refreshAction: refreshAccessToken }
          ),
        ]);

        const [planningJson, ticketJson] = await Promise.all([
          safeJson(planningRes),
          safeJson(ticketRes),
        ]);

        if (cancelled) return;

        if (!planningRes.ok || !planningJson?.success) {
          throw new Error(planningJson?.message || 'Failed to load planning refund policy');
        }
        if (!ticketRes.ok || !ticketJson?.success) {
          throw new Error(ticketJson?.message || 'Failed to load ticket refund policy');
        }

        setPlanningPolicy(planningJson?.data || null);
        setTicketPolicy(ticketJson?.data || null);
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.message || 'Unable to load refund policies');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPolicies();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Refund Policy Center</h1>
            <p className="text-sm text-gray-600 mt-2">
              Understand how refunds are calculated for planning, promoted events, and ticket cancellations.
              This page is written for customers and always shows the latest active policy values.
            </p>
          </div>

          <Link
            to={dashboardPath}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:border-teal-300 hover:text-teal-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center text-sm font-semibold text-gray-600">
            Loading latest refund policies...
          </div>
        ) : (
          <>
            <PolicyCard
              title="Planning Refund Policy"
              subtitle="How planning cancellations are calculated"
              policy={planningPolicy}
              kind="planning"
              paragraphs={[
                'Planning refunds follow a clear time-window approach. The earlier you cancel before your event date, the better your refund outcome is likely to be.',
                'Each cancellation window has a fixed deduction percentage. That deduction is applied first, and the remaining eligible amount is returned to you.',
                'All refunds are calculated on the total event amount excluding applicable service charges.',
                'Cancellation charges may be used to cover planning efforts, vendor commitments, and operational costs incurred before cancellation.',
                'Use the table below to match your cancellation timing with the percentage returned and the corresponding cancellation charge.',
              ]}
              simpleRule={{
                label: 'Simple Rule',
                text: 'Cancel earlier for a higher refund. Cancel closer to the event date and the cancellation charge increases.',
              }}
            />

            <PolicyCard
              title="User Ticket Refund Policy"
              subtitle="How ticket cancellation refunds are calculated"
              policy={ticketPolicy}
              kind="ticket"
              paragraphs={[
                'Ticket refunds are also based on cancellation timing. The number of days left before the event determines how much of your ticket amount is refunded.',
                'In normal user-initiated cancellation, cancelling earlier generally gives a better refund, while cancelling near the event date can have a higher cancellation charge.',
                'Platform and service fees (if applicable) are non-refundable for user-initiated cancellations.',
                'If an event is cancelled, ticket buyers receive a full refund.',
                'Use the table below to quickly check your cancellation window, refund percentage, and cancellation charge.',
              ]}
              simpleRule={{
                label: 'Simple Rule',
                text: 'For normal ticket cancellation, earlier cancellation usually means higher refund.',
              }}
              keyNote={{
                label: 'Event Cancellation Protection',
                text: 'If the event is cancelled, users get full refund.',
              }}
            />

            <PromotePolicyCard />
          </>
        )}
      </div>
    </div>
  );
};

export default RefundPolicyCenter;