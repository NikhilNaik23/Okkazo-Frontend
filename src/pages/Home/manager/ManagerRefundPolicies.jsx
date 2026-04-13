import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Clock3 } from 'lucide-react';
import { selectUser } from '../../../store/slices/authSlice';
import RefundPolicyEditorCard from '../../../components/Refunds/RefundPolicyEditorCard';

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

const ManagerRefundPolicies = () => {
  const user = useSelector(selectUser);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const canAccessRefundPolicies = useMemo(() => {
    const assignedRole = normalizeAssignedRole(user?.assignedRole);
    return REFUND_ELIGIBLE_ASSIGNED_ROLES.has(assignedRole);
  }, [user?.assignedRole]);

  if (!canAccessRefundPolicies) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Refund Policies</h1>
          <p className="text-sm text-gray-600">
            This workspace is restricted to managers with assigned role Revenue Operations Specialist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-350 mx-auto min-h-screen space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Refund Policies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update percentages for planning and ticket cancellations. Changes apply immediately for all new calculations.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600">
          <Clock3 className="w-3.5 h-3.5" />
          Last saved: {toIstDateTime(lastUpdatedAt)}
        </div>
      </div>

      <RefundPolicyEditorCard
        title="Planning Refund Deduction Policy"
        subtitle="Revenue Operations can update deduction percentages used for planning refund requests."
        endpoint="/api/events/config/refund-policy"
        percentField="deductionPercent"
        percentLabel="Deduction %"
        saveSuccessMessage="Planning refund policy updated"
        onSaved={(data) => {
          setLastUpdatedAt(data?.updatedAt || new Date().toISOString());
        }}
      />

      <RefundPolicyEditorCard
        title="Ticket User Refund Policy"
        subtitle="Revenue Operations can update refund percentages used for user ticket cancellations."
        endpoint="/api/events/config/ticket-refund-policy"
        percentField="refundPercent"
        percentLabel="Refund %"
        saveSuccessMessage="Ticket refund policy updated"
        onSaved={(data) => {
          setLastUpdatedAt(data?.updatedAt || new Date().toISOString());
        }}
      />
    </div>
  );
};

export default ManagerRefundPolicies;
