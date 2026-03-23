import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Save, Trash2, PlusCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPromotionsConfig,
  updatePromotionsConfig,
  selectPromotionsConfigStatus,
  selectPromotionsConfigError,
  selectPromotePackages,
  selectPublicPromotionOptions,
} from '../../../store/slices/promotionsConfigSlice';

const createRowId = () => {
  if (globalThis?.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const toEditableList = (list) => {
  if (!Array.isArray(list)) return [];

  const seenIds = new Set();
  return list.map((it, idx) => {
    const rawValue = typeof it?.value === 'string' ? it.value : '';
    const baseId = rawValue
      ? `v_${String(rawValue).trim().toLowerCase()}`
      : `v_empty_${idx}`;

    let id = baseId;
    let suffix = 1;
    while (seenIds.has(id)) {
      suffix += 1;
      id = `${baseId}__${suffix}`;
    }
    seenIds.add(id);

    return {
      id,
      value: rawValue,
      fee: it?.fee ?? '',
      label: it?.label ?? null,
      active: it?.active !== false,
    };
  });
};

const normalizeValue = (raw) => String(raw ?? '').trim();

const normalizeFeeInput = (raw) => {
  const s = String(raw ?? '');
  if (s === '') return '';
  return s.replace(/[^0-9.]/g, '');
};

const parseFee = (raw) => {
  if (raw === '' || raw === null || raw === undefined) return NaN;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
};

const hasDuplicateValues = (items) => {
  const seen = new Set();
  for (const it of items) {
    const v = normalizeValue(it?.value).toLowerCase();
    if (!v) continue;
    if (seen.has(v)) return true;
    seen.add(v);
  }
  return false;
};

const listHasInvalidRows = (items) => {
  for (const it of items) {
    const value = normalizeValue(it?.value);
    if (!value) return true;
    const fee = parseFee(it?.fee);
    if (!Number.isFinite(fee) || fee < 0) return true;
  }
  return false;
};

const stripRowIds = (items) => (Array.isArray(items)
  ? items.map(({ id, ...rest }) => rest)
  : []);

const PromotionSection = ({ title, subtitle, items, setItems, addLabel }) => (
  <div className="bg-white rounded-2xl border border-[#f0f2f5] shadow-sm overflow-hidden max-w-5xl">
    <div className="px-6 py-5 border-b border-[#f0f2f5] flex items-center justify-between gap-4">
      <div>
        <h2 className="text-base font-bold text-[#1a1c1e]">{title}</h2>
        <p className="text-xs font-medium text-[#94a3b8]">{subtitle}</p>
      </div>

      <button
        type="button"
        onClick={() => setItems((prev) => ([...prev, { id: createRowId(), value: '', fee: '', label: null, active: true }]))}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f5] rounded-lg text-xs font-semibold text-[#64748b] hover:text-[#1a1c1e] hover:bg-[#f8fafc] transition-all"
      >
        <PlusCircle size={16} className="text-[#28a785]" />
        {addLabel}
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#fcfdfe] border-b border-[#f1f5f9]">
            <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Type</th>
            <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Fee (₹)</th>
            <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f5f9]/60">
          {items.length === 0 ? (
            <tr>
              <td className="px-6 py-6 text-sm text-[#64748b]" colSpan={3}>
                No items configured.
              </td>
            </tr>
          ) : items.map((it) => {
            const value = normalizeValue(it.value);
            const fee = it.fee;
            const feeNum = parseFee(fee);
            const isFeeValid = Number.isFinite(feeNum) && feeNum >= 0;
            const isValueValid = Boolean(value);

            return (
              <tr key={it.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    value={it.value}
                    onChange={(e) => {
                      const next = e.target.value;
                      setItems((prev) => prev.map((row) => row.id === it.id ? { ...row, value: next } : row));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border shadow-sm bg-white text-sm font-semibold text-[#1a1c1e] outline-none transition-all ${
                      isValueValid
                        ? 'border-[#f0f2f5] focus:ring-2 focus:ring-[#28a785]/20 focus:border-[#28a785]/30'
                        : 'border-red-200 focus:ring-2 focus:ring-red-200'
                    }`}
                    placeholder="e.g., featured placement"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    inputMode="decimal"
                    value={fee}
                    onChange={(e) => {
                      const next = normalizeFeeInput(e.target.value);
                      setItems((prev) => prev.map((row) => row.id === it.id ? { ...row, fee: next } : row));
                    }}
                    className={`w-full max-w-[160px] px-3 py-2 rounded-lg border shadow-sm bg-white text-sm font-semibold text-[#1a1c1e] outline-none transition-all ${
                      isFeeValid
                        ? 'border-[#f0f2f5] focus:ring-2 focus:ring-[#28a785]/20 focus:border-[#28a785]/30'
                        : 'border-red-200 focus:ring-2 focus:ring-red-200'
                    }`}
                    placeholder="0"
                  />
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((row) => row.id !== it.id))}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#f0f2f5] text-xs font-semibold text-[#64748b] hover:bg-[#f8fafc] hover:text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminPromotions = () => {
  const dispatch = useDispatch();

  const status = useSelector(selectPromotionsConfigStatus);
  const loadError = useSelector(selectPromotionsConfigError);
  const promotePackages = useSelector(selectPromotePackages);
  const publicPromotionOptions = useSelector(selectPublicPromotionOptions);

  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [editItems, setEditItems] = useState(null);

  const isLoading = status === 'loading';

  const storePromote = useMemo(() => toEditableList(promotePackages), [promotePackages]);
  const storePublic = useMemo(() => toEditableList(publicPromotionOptions), [publicPromotionOptions]);

  // Single source list (prefer promotePackages; fall back to public list)
  const storeItems = useMemo(() => {
    return storePromote.length > 0 ? storePromote : storePublic;
  }, [storePromote, storePublic]);

  const items = editItems ?? storeItems;

  const updateItems = (updater) => {
    setEditItems((prev) => {
      const base = prev ?? storeItems;
      return typeof updater === 'function' ? updater(base) : updater;
    });
  };

  useEffect(() => {
    dispatch(fetchPromotionsConfig());
  }, [dispatch]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(stripRowIds(items)) !== JSON.stringify(stripRowIds(storeItems));
  }, [items, storeItems]);

  const itemsInvalid = useMemo(() => listHasInvalidRows(items) || hasDuplicateValues(items), [items]);
  const canSave = hasChanges && !itemsInvalid && !isLoading;

  const onRefresh = () => {
    setSaveError('');
    setSaveSuccess('');
    dispatch(fetchPromotionsConfig());
  };

  const onReset = () => {
    setSaveError('');
    setSaveSuccess('');
    setEditItems(null);
  };

  const onSave = async () => {
    setSaveError('');
    setSaveSuccess('');

    if (itemsInvalid) {
      setSaveError('Fix invalid or duplicate promotion values before saving.');
      return;
    }

    const normalizeOut = (items) => items.map((it) => ({
      value: normalizeValue(it.value),
      fee: Number(parseFee(it.fee)),
      label: it.label ?? null,
      active: it.active !== false,
    }));

    const result = await dispatch(updatePromotionsConfig({
      // Write once, used in both places
      promotePackages: normalizeOut(items),
      publicPromotionOptions: normalizeOut(items),
    }));

    if (updatePromotionsConfig.rejected.match(result)) {
      setSaveError(result.payload || 'Failed to save promotions config');
      return;
    }

    setSaveSuccess('Promotions updated.');
    setEditItems(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] overflow-hidden">
      <div className="px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-[#f0f2f5] shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#94a3b8] font-medium">Financials</span>
            <span className="text-[#cbd5e1]">/</span>
            <span className="text-[#1a1c1e] font-bold">Promotions</span>
          </div>
          <h1 className="text-xl font-bold text-[#1a1c1e]">Promotion Types & Fees</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f5] rounded-lg text-sm font-semibold text-[#1a1c1e] hover:bg-[#f8fafc] shadow-sm transition-all disabled:opacity-60"
            disabled={isLoading}
          >
            <RefreshCw size={16} className="text-[#64748b]" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 bg-white border border-[#f0f2f5] rounded-lg text-sm font-semibold text-[#64748b] hover:text-[#1a1c1e] hover:bg-[#f8fafc] transition-all disabled:opacity-60"
            disabled={!hasChanges || isLoading}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#28a785] text-white rounded-lg text-sm font-semibold hover:bg-[#218a6e] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!canSave}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <div className="max-w-5xl">
          <p className="text-[#64748b] text-sm font-medium">
            Configure promotion types and their fees. This single list is used in the public Planning Wizard and in the Promote flow.
          </p>
        </div>

        {(loadError || saveError || saveSuccess || itemsInvalid) && (
          <div className="max-w-5xl space-y-3">
            {loadError && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-semibold">
                {loadError}
              </div>
            )}
            {itemsInvalid && !saveError && (
              <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-xl px-4 py-3 text-sm font-semibold">
                Fix invalid rows (empty type, negative/invalid fee) and remove duplicates.
              </div>
            )}
            {saveError && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-semibold">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="bg-[#ebf7f3] border border-[#28a785]/20 text-[#218a6e] rounded-xl px-4 py-3 text-sm font-semibold">
                {saveSuccess}
              </div>
            )}
          </div>
        )}

        <PromotionSection
          title="Promotions"
          subtitle="Used in both Planning Wizard (Public) and Promote Event"
          items={items}
          setItems={updateItems}
          addLabel="Add promotion"
        />
      </div>
    </div>
  );
};

export default AdminPromotions;
