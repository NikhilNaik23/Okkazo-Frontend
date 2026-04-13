import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Save, RefreshCcw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchWithAuth } from '../../utils/apiHandler';
import { refreshAccessToken } from '../../store/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const toPercentInput = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return String(n);
};

const normalizePercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Number(n.toFixed(2))));
};

const toDateTimeIst = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
};

const formatRuleWindow = (slab) => {
  const minDays = slab?.minDays;
  const maxDays = slab?.maxDays;

  if (minDays !== null && minDays !== undefined && (maxDays === null || maxDays === undefined)) {
    return `>= ${minDays} days`;
  }
  if ((minDays === null || minDays === undefined) && maxDays !== null && maxDays !== undefined) {
    return `<= ${maxDays} days`;
  }
  if (minDays !== null && minDays !== undefined && maxDays !== null && maxDays !== undefined) {
    return `${minDays} to ${maxDays} days`;
  }
  return 'All days';
};

const RefundPolicyEditorCard = ({
  title = 'Planning Refund Deduction Policy',
  subtitle = 'Changes apply immediately for new requests and open review requests.',
  endpoint = '/api/events/config/refund-policy',
  percentField = 'deductionPercent',
  percentLabel = 'Deduction %',
  saveSuccessMessage = 'Refund policy updated',
  onSaved,
  className = '',
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [timelineLabel, setTimelineLabel] = useState('5-7 working days');
  const [draftByCode, setDraftByCode] = useState({});

  const loadPolicy = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}${endpoint}`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to load refund policy');
      }

      const nextPolicy = data?.data || {};
      const slabs = Array.isArray(nextPolicy?.slabs) ? nextPolicy.slabs : [];
      const nextDraftByCode = {};
      for (const slab of slabs) {
        const code = String(slab?.code || '').trim().toUpperCase();
        if (!code) continue;
        nextDraftByCode[code] = toPercentInput(slab?.[percentField]);
      }

      setPolicy(nextPolicy);
      setTimelineLabel(String(nextPolicy?.timelineLabel || '5-7 working days'));
      setDraftByCode(nextDraftByCode);
    } catch (error) {
      toast.error(error?.message || 'Unable to load refund policy');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  const slabs = useMemo(() => (Array.isArray(policy?.slabs) ? policy.slabs : []), [policy]);

  const onChangePercent = (code, value) => {
    setDraftByCode((prev) => ({
      ...prev,
      [code]: value,
    }));
  };

  const onSave = async () => {
    if (saving) return;

    const payloadSlabs = [];
    for (const slab of slabs) {
      const code = String(slab?.code || '').trim().toUpperCase();
      if (!code) continue;
      const nextPercent = normalizePercent(draftByCode?.[code]);
      if (nextPercent === null) {
        toast.error(`Invalid deduction percent for ${code}`);
        return;
      }
      payloadSlabs.push({ code, [percentField]: nextPercent });
    }

    setSaving(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}${endpoint}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            timelineLabel: String(timelineLabel || '').trim(),
            slabs: payloadSlabs,
          }),
        },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to update refund policy');
      }

      toast.success(saveSuccessMessage);
      await loadPolicy();
      if (typeof onSaved === 'function') {
        onSaved(data?.data || null);
      }
    } catch (error) {
      toast.error(error?.message || 'Unable to update refund policy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-100 rounded-3xl shadow-sm p-4 md:p-5 space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {toDateTimeIst(policy?.updatedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPolicy}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:border-teal-200 hover:text-teal-700 disabled:opacity-60"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-black uppercase tracking-wider hover:bg-teal-700 disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Policy'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-600 px-3 py-2">
          <div className="col-span-6">Deduction Slab</div>
          <div className="col-span-3">Window</div>
          <div className="col-span-3 text-right">{percentLabel}</div>
        </div>

        {slabs.map((slab) => {
          const code = String(slab?.code || '').trim().toUpperCase();
          const value = draftByCode?.[code] ?? toPercentInput(slab?.[percentField]);
          return (
            <div key={code} className="grid grid-cols-12 items-center border-t border-gray-100 px-3 py-3 text-sm">
              <div className="col-span-6 min-w-0">
                <p className="font-bold text-gray-900 truncate">{slab?.label || code}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{code}</p>
              </div>
              <div className="col-span-3 text-xs font-semibold text-gray-600">{formatRuleWindow(slab)}</div>
              <div className="col-span-3 flex items-center justify-end gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={value}
                  onChange={(e) => onChangePercent(code, e.target.value)}
                  className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm font-bold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400"
                />
                <span className="text-xs font-black text-gray-500">%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
        <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Refund Timeline Label</p>
        <input
          value={timelineLabel}
          onChange={(e) => setTimelineLabel(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-400"
          placeholder="e.g. 5-7 working days"
        />
      </div>
    </div>
  );
};

export default RefundPolicyEditorCard;
