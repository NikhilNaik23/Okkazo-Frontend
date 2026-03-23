import React, { useEffect, useMemo, useState } from "react";
import { Percent, RefreshCw, Save } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCommissionConfig,
  updateCommissionConfig,
} from "../../../store/slices/adminSlice";

const SERVICE_CATEGORIES = [
  "Venue",
  "Catering & Drinks",
  "Photography",
  "Videography",
  "Decor & Styling",
  "Entertainment & Artists",
  "Makeup & Grooming",
  "Invitations & Printing",
  "Sound & Lighting",
  "Equipment Rental",
  "Security & Safety",
  "Transportation",
  "Live Streaming & Media",
  "Cake & Desserts",
  "Other",
];

const DEFAULT_COMMISSION_PERCENT = "";

const toRateMap = (entries) => {
  const base = Object.fromEntries(SERVICE_CATEGORIES.map((c) => [c, ""]));
  if (!entries || typeof entries !== "object") return base;

  for (const category of SERVICE_CATEGORIES) {
    const v = entries[category];
    if (v === null || v === undefined) continue;
    base[category] = String(v);
  }

  return base;
};

const isValidPercent = (value) => {
  if (value === "") return false;
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (n < 0 || n > 100) return false;
  return true;
};

const normalizePercentInput = (raw) => {
  const s = String(raw ?? "");
  if (s === "") return "";
  return s.replace(/[^0-9.]/g, "");
};

const AdminCommission = () => {
  const dispatch = useDispatch();

  const commissionConfig = useSelector((s) => s.admin?.commissionConfig);
  const commissionLoading = useSelector((s) => Boolean(s.admin?.commissionLoading));
  const commissionUpdating = useSelector((s) => Boolean(s.admin?.commissionUpdating));
  const commissionError = useSelector((s) => s.admin?.commissionError);

  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [initialRates, setInitialRates] = useState(() => toRateMap(null));
  const [rates, setRates] = useState(() => toRateMap(null));

  const hasChanges = useMemo(() => {
    for (const c of SERVICE_CATEGORIES) {
      if (String(rates[c] ?? "") !== String(initialRates[c] ?? "")) return true;
    }
    return false;
  }, [rates, initialRates]);

  const invalidCategories = useMemo(() => {
    return SERVICE_CATEGORIES.filter((c) => !isValidPercent(rates[c]));
  }, [rates]);

  const isLoading = commissionLoading;
  const loadError = commissionError;

  const canSave =
    hasChanges && invalidCategories.length === 0 && !isLoading && !commissionUpdating;

  const loadRates = () => {
    setSaveError("");
    setSaveSuccess("");
    dispatch(fetchCommissionConfig());
  };

  useEffect(() => {
    loadRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!commissionConfig) return;
    const mapped = toRateMap(commissionConfig?.rates ?? commissionConfig);
    setInitialRates(mapped);
    setRates(mapped);
  }, [commissionConfig]);

  const onReset = () => {
    setSaveError("");
    setSaveSuccess("");
    setRates(initialRates);
  };

  const onSave = async () => {
    setSaveError("");
    setSaveSuccess("");

    try {
      if (invalidCategories.length > 0) {
        setSaveError("Fix invalid commission values before saving.");
        return;
      }

      const payloadRates = Object.fromEntries(
        SERVICE_CATEGORIES.map((c) => [c, Number(rates[c])])
      );

      const result = await dispatch(updateCommissionConfig({ rates: payloadRates }));
      if (updateCommissionConfig.rejected.match(result)) {
        setSaveError(result.payload || "Failed to save commission rates");
        return;
      }

      const mapped = toRateMap(result.payload?.rates ?? payloadRates);
      setInitialRates(mapped);
      setRates(mapped);
      setSaveSuccess("Commission rates updated.");
    } catch (e) {
      setSaveError(e?.message || "Failed to save commission rates");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] overflow-hidden">
      <div className="px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-[#f0f2f5] shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#94a3b8] font-medium">Financials</span>
            <span className="text-[#cbd5e1]">/</span>
            <span className="text-[#1a1c1e] font-bold">Commission</span>
          </div>
          <h1 className="text-xl font-bold text-[#1a1c1e]">Commission Fees</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadRates}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f5] rounded-lg text-sm font-semibold text-[#1a1c1e] hover:bg-[#f8fafc] shadow-sm transition-all disabled:opacity-60"
            disabled={isLoading}
          >
            <RefreshCw size={16} className="text-[#64748b]" />
            Refresh
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
        <div className="max-w-4xl">
          <p className="text-[#64748b] text-sm font-medium">
            Set the commission percentage for each service category. Values must be between 0 and 100.
          </p>
        </div>

        {(loadError || saveError || saveSuccess) && (
          <div className="max-w-4xl space-y-3">
            {loadError && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-semibold">
                {loadError}
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

        <div className="bg-white rounded-2xl border border-[#f0f2f5] shadow-sm overflow-hidden max-w-4xl">
          <div className="px-6 py-5 border-b border-[#f0f2f5] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f8fafc] rounded-lg border border-[#f0f2f5]">
                <Percent size={18} className="text-[#28a785]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1a1c1e]">Service Categories</h2>
                <p className="text-xs font-medium text-[#94a3b8]">
                  Commission applies platform-wide.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 bg-white border border-[#f0f2f5] rounded-lg text-xs font-semibold text-[#64748b] hover:text-[#1a1c1e] hover:bg-[#f8fafc] transition-all disabled:opacity-60"
              disabled={!hasChanges || isLoading}
            >
              Reset
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#fcfdfe] border-b border-[#f1f5f9]">
                  <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">
                    Category
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">
                    Commission (%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]/60">
                {SERVICE_CATEGORIES.map((category) => {
                  const value = rates[category] ?? "";
                  const valid = isValidPercent(value);

                  return (
                    <tr key={category} className="hover:bg-[#f8fafc]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#1a1c1e]">{category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-55">
                          <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm bg-white transition-all ${
                              valid
                                ? "border-[#f0f2f5] focus-within:ring-2 focus-within:ring-[#28a785]/20 focus-within:border-[#28a785]/30"
                                : "border-red-200 focus-within:ring-2 focus-within:ring-red-200"
                            }`}
                          >
                            <input
                              inputMode="decimal"
                              value={value}
                              onChange={(e) => {
                                const next = normalizePercentInput(e.target.value);
                                setRates((prev) => ({ ...prev, [category]: next }));
                              }}
                              className="w-full bg-transparent text-sm font-semibold text-[#1a1c1e] outline-none placeholder:text-[#cbd5e1]"
                              placeholder="e.g. 10"
                              aria-label={`${category} commission percent`}
                              disabled={isLoading}
                            />
                            <span className="text-xs font-bold text-[#94a3b8]">%</span>
                          </div>
                          {!valid && (
                            <div className="mt-1 text-[11px] font-semibold text-red-600">
                              Enter 0–100
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-5 border-t border-[#f0f2f5] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-semibold text-[#94a3b8]">
              {invalidCategories.length > 0
                ? "Fix invalid commission values to save."
                : hasChanges
                  ? "Unsaved changes."
                  : "All changes saved."}
            </div>

            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#28a785] text-white rounded-lg text-sm font-semibold hover:bg-[#218a6e] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!canSave}
            >
              <Save size={16} />
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommission;
