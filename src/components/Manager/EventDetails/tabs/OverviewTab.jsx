import React, { useMemo, useState } from 'react';
import { 
    CheckCircle, Clock, ChevronRight, Star, ExternalLink, 
    Mail, Phone, Download, Send, Plus, MessageSquare, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '../ui';
import { pipelineStages } from '../../../../data/managerEventDetailsData';
import { CircleDot, ShieldCheck } from 'lucide-react';

const promotePipelineStages = [
    { id: 'draft', label: 'Draft' },
    { id: 'promoting', label: 'Promoting' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'live', label: 'Live' },
    { id: 'completed', label: 'Completed' },
];

const PROMOTION_BUTTONS = [
    'Featured Placement',
    'Email Blast',
    'Social Synergy',
    'Advanced Analytics',
];

const normalizeSelectionLabel = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    return raw
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
};

const formatInr = (value) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return '₹0.00';
    return `₹${new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n)}`;
};

const OverviewTab = ({
    event,
    onAddTeamMember,
    onRemoveTeamMember,
    getInitials,
    onMessageClient,
    onPromotionAction,
    promotionActionLoadingKey,
    privateBilling,
    generatedRevenuePayout,
    onQuickSendAnnouncement,
    onQuickDownloadAttendeeList,
    onQuickContactVenue,
    onQuickSendQuoteToClient,
    enablePlanningVendorQuickActions = true,
}) => {
    const [addingTeam, setAddingTeam] = useState(false);
    const [pickedStaffKey, setPickedStaffKey] = useState('');
    const [savingTeam, setSavingTeam] = useState(false);

    const pipeline = useMemo(() => {
        const normalizeStatus = (value) => {
            const s = String(value || '').trim();
            if (!s) return '';
            return s
                .toUpperCase()
                .replace(/_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };

        const status = normalizeStatus(event?.status);
        const isPromote = String(event?.type || '').toLowerCase() === 'promote';
        const basePipeline = isPromote ? promotePipelineStages : pipelineStages;

        const activeStageId = (() => {
            if (isPromote) {
                if (status === 'MANAGER UNASSIGNED') return 'draft';
                if (status === 'IN REVIEW') return 'promoting';
                if (status === 'CONFIRMED') return 'confirmed';
                if (status === 'LIVE') return 'live';
                if (status === 'COMPLETED' || status === 'COMPLETE') return 'completed';
                return 'promoting';
            }

            if (status === 'PENDING APPROVAL') return 'vendor_confirm';
            if (status === 'APPROVED') return 'client_review';
            if (status === 'CONFIRMED') return 'confirmed';
            if (status === 'DRAFT') return 'draft';
            if (status === 'PLANNING') return 'planning';
            if (status === 'IN REVIEW') return 'vendor_confirm';
            if (status === 'LIVE') return 'live';
            if (status === 'COMPLETED') return 'completed';

            return 'planning';
        })();

        const activeIndex = Math.max(0, basePipeline.findIndex((s) => s?.id === activeStageId));

        return basePipeline.map((stage, i) => ({
            ...stage,
            done: i < activeIndex,
            active: i === activeIndex,
        }));
    }, [event?.status, event?.type]);

    const servicesOpted = useMemo(() => {
        return Array.isArray(event?.servicesOpted) ? event.servicesOpted : [];
    }, [event?.servicesOpted]);

    const selectedPromotions = useMemo(() => {
        const rows = Array.isArray(event?.selectedPromotions) ? event.selectedPromotions : [];
        const seen = new Set();
        const normalized = [];

        rows.forEach((row) => {
            const raw = typeof row === 'string'
                ? row
                : (row?.label || row?.name || row?.title || row?.value || '');
            const label = normalizeSelectionLabel(raw);
            if (!label) return;

            const key = label.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            normalized.push(label);
        });

        return normalized;
    }, [event?.selectedPromotions]);

    const selectedPromotionSet = useMemo(() => {
        return new Set(selectedPromotions.map((value) => String(value || '').trim().toLowerCase()));
    }, [selectedPromotions]);

    const shouldShowPromotions = useMemo(() => {
        const type = String(event?.type || '').trim().toLowerCase();
        if (type === 'promote') return true;
        if (type !== 'planning') return false;
        return String(event?.listingType || '').trim().toLowerCase() === 'public';
    }, [event?.type, event?.listingType]);

    const isPromotionActionStatusAllowed = useMemo(() => {
        return String(event?.status || '').trim().toUpperCase() === 'CONFIRMED';
    }, [event?.status]);

    const client = event?.client || null;
    const clientName = client?.name || client?.fullName || '—';
    const clientEmail = client?.email || '—';
    const clientPhone = client?.phone || '—';
    const initialsFn = typeof getInitials === 'function' ? getInitials : (name) => {
        const n = String(name || '').trim();
        if (!n) return 'NA';
        const parts = n.split(/\s+/).filter(Boolean);
        const first = parts[0]?.[0] || 'N';
        const last = (parts.length > 1 ? parts[parts.length - 1]?.[0] : '') || '';
        return `${first}${last}`.toUpperCase();
    };

    const availableStaff = Array.isArray(event?.availableCoreStaff) ? event.availableCoreStaff : [];
    const selectedTeam = Array.isArray(event?.selectedTeamMembers) ? event.selectedTeamMembers : [];

    const handleConfirmAddTeamMember = async () => {
        if (!pickedStaffKey || savingTeam) return;
        const staffMember = availableStaff.find((s) => String(s?.id || s?._id) === String(pickedStaffKey));
        if (!staffMember) {
            toast.error('Selected staff not available');
            return;
        }
        if (typeof onAddTeamMember === 'function') {
            try {
                setSavingTeam(true);
                await onAddTeamMember(staffMember);
                toast.success('Team member added');
            } catch (err) {
                toast.error(err?.message || 'Failed to add team member');
                return;
            } finally {
                setSavingTeam(false);
            }
        }
        setPickedStaffKey('');
        setAddingTeam(false);
    };

    const handleRemoveMember = async (member) => {
        if (!member || savingTeam) return;
        if (typeof onRemoveTeamMember !== 'function') return;
        try {
            setSavingTeam(true);
            await onRemoveTeamMember(member);
            toast.success('Team member removed');
        } catch (err) {
            toast.error(err?.message || 'Failed to remove team member');
        } finally {
            setSavingTeam(false);
        }
    };

    const showPlanningVendorActions = String(event?.type || '').trim().toLowerCase() === 'planning' && enablePlanningVendorQuickActions;

    return (
        <div className="space-y-8">
            {/* Event Pipeline */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-teal-600" /> Event Pipeline
                </h3>
                <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {pipeline.map((stage, i) => (
                        <div key={stage.id} className="flex items-center shrink-0">
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer
                            ${stage.done ? 'bg-teal-50 border-teal-200 text-teal-700' :
                                    stage.active ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-md shadow-amber-100 ring-2 ring-amber-200' :
                                        'bg-gray-50 border-gray-200 text-gray-400'}`}
                                onClick={() => toast(stage.done ? `${stage.label} completed ✓` : stage.active ? `Currently in ${stage.label}` : `${stage.label} upcoming`)}
                            >
                                {stage.done ? <CheckCircle className="w-4 h-4" /> : stage.active ? <Clock className="w-4 h-4 animate-pulse" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                                {stage.label}
                            </div>
                            {i < pipeline.length - 1 && (
                                <ChevronRight className={`w-5 h-5 mx-1 shrink-0 ${stage.done ? 'text-teal-400' : 'text-gray-300'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Col */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Client Requirements */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" /> Client Requirements
                            </h3>
                            <Badge color="amber" icon={ShieldCheck}>From Client Brief</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Event Type</p>
                                    <p className="font-bold text-gray-900">{event?.type === 'promote' ? 'Promote' : 'Planning'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Expected Guests</p>
                                    <p className="font-bold text-gray-900">{Number.isFinite(Number(event?.expectedGuests)) ? Number(event.expectedGuests).toLocaleString() : '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Services Opted</p>
                                    {servicesOpted.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {servicesOpted.map((s) => (
                                                <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-800">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="font-bold text-gray-900">—</p>
                                    )}
                                </div>
                                {shouldShowPromotions ? (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Promotions Opted</p>
                                        {selectedPromotions.length ? (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPromotions.map((promotion) => (
                                                    <span key={promotion} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-800">
                                                        {promotion}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="font-bold text-gray-900">—</p>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Preferred Location</p>
                                    <p className="font-bold text-gray-900">{event?.preferredLocation || event?.location || '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Requested Timeline</p>
                                    <p className="font-bold text-gray-900">{event?.date || '—'} – {event?.endDate || '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Ticket Availability</p>
                                    <p className="font-bold text-gray-900">Start: {event?.ticketAvailabilityStart || '—'}</p>
                                    <p className="font-bold text-gray-900">End: {event?.ticketAvailabilityEnd || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Event Details */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
                            <button className="text-teal-600 font-bold text-sm hover:underline flex items-center gap-1">
                                View Public Page <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Promotion Actions</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {PROMOTION_BUTTONS.map((label) => {
                                                    const actionKey = String(label).toLowerCase();
                                                    const isOpted = selectedPromotionSet.has(String(label).toLowerCase());
                                                    const isEnabled = isOpted && isPromotionActionStatusAllowed;
                                                    const isLoading = String(promotionActionLoadingKey || '').toLowerCase() === actionKey;
                                    return (
                                        <button
                                            key={label}
                                            type="button"
                                                            disabled={!isEnabled || isLoading}
                                                            onClick={async () => {
                                                if (!isEnabled) return;
                                                                if (typeof onPromotionAction === 'function') {
                                                                    await onPromotionAction(label);
                                                                    return;
                                                                }
                                                                toast('Action for this promotion button will be configured next.', { icon: 'ℹ️' });
                                            }}
                                                            className={`px-3.5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${isEnabled
                                                ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                                        >
                                                            {isLoading ? 'Sending…' : label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Organizer</p>
                                <p className="font-bold text-gray-900">{event?.organizer || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Start Date</p>
                                <p className="font-bold text-gray-900">{event?.date || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">End Date</p>
                                <p className="font-bold text-gray-900">{event?.endDate || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Venue ID</p>
                                <p className="font-bold text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded-md w-fit">SF-MOS-01</p>
                            </div>
                        </div>
                    </section>

                    {privateBilling?.enabled ? (
                        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Billing Overview</p>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Bills & Payment</h3>
                                    <p className="text-sm text-gray-600">
                                        {privateBilling?.summaryText || 'Event billing summary with outstanding dues and paid milestones.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Amount</p>
                                    <p className="text-lg font-black text-gray-900">{formatInr(privateBilling.totalAmountInr)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Paid</p>
                                    <p className="text-lg font-black text-gray-900">{formatInr(privateBilling.paidTotalInr)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Outstanding Due</p>
                                    <p className="text-lg font-black text-teal-700">{formatInr(privateBilling.outstandingDueInr)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="px-4 py-3 bg-white border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Price Breakdown
                                    </div>
                                    {Array.isArray(privateBilling.lineItems) && privateBilling.lineItems.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {privateBilling.lineItems.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 truncate">{item.serviceName}</p>
                                                        <p className="text-gray-500 truncate">{item.businessName}</p>
                                                    </div>
                                                    <p className="font-black text-gray-900 shrink-0">{formatInr(item.amountInr)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-4 text-xs text-gray-500">Price details are being prepared.</div>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="px-4 py-3 bg-white border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Paid Breakdown
                                    </div>
                                    <div className="divide-y divide-gray-100 text-xs">
                                        {(Array.isArray(privateBilling?.paidBreakdownRows) ? privateBilling.paidBreakdownRows : []).map((row, idx) => {
                                            const isTotalPaidRow = String(row?.label || '').trim().toLowerCase() === 'total paid';
                                            return (
                                                <div
                                                    key={`${row?.label || 'row'}:${idx}`}
                                                    className={`flex items-center justify-between px-4 py-3 ${isTotalPaidRow ? 'bg-white/70' : ''}`}
                                                >
                                                    <p className={`font-bold ${isTotalPaidRow ? 'font-black' : ''} text-gray-900`}>{row?.label || 'Amount'}</p>
                                                    <p className={`font-black ${isTotalPaidRow ? 'text-teal-700' : 'text-gray-900'}`}>{formatInr(row?.amountInr)}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {privateBilling?.statusNote ? (
                                <div className="mt-4 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                                    {privateBilling.statusNote}
                                </div>
                            ) : null}

                            {generatedRevenuePayout?.isSupported ? (
                                <div className="mt-6 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="px-4 py-3 bg-white border-b border-gray-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Revenue Generation</p>
                                        <h4 className="text-sm font-black text-gray-900">Generated Revenue Payout Breakdown</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Generated revenue minus platform fees equals user payout.
                                        </p>
                                    </div>

                                    <div className="divide-y divide-gray-100 text-xs">
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <p className="font-bold text-gray-900">Generated Revenue</p>
                                            <p className="font-black text-gray-900">{formatInr(generatedRevenuePayout.generatedRevenueInr)}</p>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <p className="font-bold text-gray-900">Platform Fee</p>
                                            <p className="font-black text-gray-900">{formatInr(generatedRevenuePayout.platformFeeInr)}</p>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <p className="font-bold text-gray-900">Service Charge</p>
                                            <p className="font-black text-gray-900">{formatInr(generatedRevenuePayout.serviceChargeInr)}</p>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3 bg-white/60">
                                            <p className="font-black text-gray-900">Total Fees</p>
                                            <p className="font-black text-gray-900">{formatInr(generatedRevenuePayout.totalFeesInr)}</p>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3 bg-teal-50">
                                            <p className="font-black text-teal-800">Payable To User</p>
                                            <p className="font-black text-teal-800">{formatInr(generatedRevenuePayout.payoutAmountInr)}</p>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <p className="font-bold text-gray-900">Already Paid To User</p>
                                            <p className="font-black text-gray-900">{formatInr(generatedRevenuePayout.payoutPaidInr)}</p>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3 bg-white/60">
                                            <p className="font-black text-gray-900">Pending Payout</p>
                                            <p className="font-black text-gray-900">{formatInr(generatedRevenuePayout.payoutPendingInr)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </section>
                    ) : null}

                </div>

                {/* Right Col */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-lg shadow-teal-900/20">
                        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    if (typeof onQuickSendAnnouncement === 'function') {
                                        onQuickSendAnnouncement();
                                        return;
                                    }
                                    toast.success('Open Guest List to send announcement.');
                                }}
                                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group"
                            >
                                <span className="font-bold text-sm">Send Announcement</span>
                                <Mail className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button
                                onClick={() => {
                                    if (typeof onQuickDownloadAttendeeList === 'function') {
                                        onQuickDownloadAttendeeList();
                                        return;
                                    }
                                    toast.success('Open Guest List to export attendee list.');
                                }}
                                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group"
                            >
                                <span className="font-bold text-sm">Download Attendee List</span>
                                <Download className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                            {showPlanningVendorActions ? (
                                <button
                                    onClick={() => {
                                        if (typeof onQuickContactVenue === 'function') {
                                            onQuickContactVenue();
                                            return;
                                        }
                                        toast.success('Open Vendors tab to contact venue/vendor.');
                                    }}
                                    className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group"
                                >
                                    <span className="font-bold text-sm">Contact Venue</span>
                                    <Phone className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                                </button>
                            ) : null}
                            {showPlanningVendorActions ? (
                                <button
                                    onClick={() => {
                                        if (typeof onQuickSendQuoteToClient === 'function') {
                                            onQuickSendQuoteToClient();
                                            return;
                                        }
                                        toast.success('Open Vendors tab to send quotation mail.');
                                    }}
                                    className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group"
                                >
                                    <span className="font-bold text-sm">Send Quote to Client</span>
                                    <Send className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Team Members</h3>
                            <button onClick={() => setAddingTeam((v) => !v)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><Plus className="w-5 h-5" /></button>
                        </div>
                        {addingTeam ? (
                            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Add Team Staff (Coordinator)</p>
                                <div className="flex gap-2">
                                    <select
                                        value={pickedStaffKey}
                                        onChange={(e) => setPickedStaffKey(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-700 outline-none"
                                    >
                                        <option value="">Select coordinator...</option>
                                        {availableStaff.map((s) => {
                                            const key = String(s?.id || s?._id || '');
                                            const name = String(s?.name || 'Staff');
                                            const dept = String(s?.department || '').trim();
                                            const assignedRole = String(s?.assignedRole || '').trim();
                                            return (
                                                <option key={key} value={key}>
                                                    {assignedRole ? `${name} • ${assignedRole}` : (dept ? `${name} • ${dept}` : name)}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <button
                                        onClick={handleConfirmAddTeamMember}
                                        disabled={!pickedStaffKey || savingTeam}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-60"
                                    >
                                        {savingTeam ? 'Saving…' : 'Add'}
                                    </button>
                                </div>
                                {!availableStaff.length ? (
                                    <p className="mt-2 text-xs font-medium text-gray-500">No available coordinators for this event date.</p>
                                ) : null}
                            </div>
                        ) : null}
                        <div className="space-y-4">
                            {selectedTeam.length ? selectedTeam.map((member, i) => (
                                <div key={String(member?.id || member?._id || member?.authId || i)} className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs shadow-inner">
                                            {initialsFn(member?.name || '—')}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{member?.name || '—'}</p>
                                        <p className="text-xs text-gray-500 font-medium">{member?.department || 'Core Staff'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMember(member)}
                                        disabled={savingTeam}
                                        className="ml-auto text-gray-400 hover:text-red-600 disabled:opacity-60"
                                        title="Remove team member"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )) : (
                                <p className="text-sm font-medium text-gray-500">No team members selected yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Client</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">{initialsFn(clientName)}</div>
                            <div>
                                <p className="font-bold text-gray-900">{clientName}</p>
                                <p className="text-xs text-gray-500">{client?.location || '—'}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" /> {clientEmail}</div>
                            <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" /> {clientPhone}</div>
                        </div>
                        <button
                            onClick={() => {
                                if (typeof onMessageClient === 'function') {
                                    onMessageClient();
                                    return;
                                }
                                toast.success('Opening client chat...');
                            }}
                            className="w-full mt-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" /> Message Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
