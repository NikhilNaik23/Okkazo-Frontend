import React, { useEffect, useMemo, useState } from "react";
import { 
  ArrowLeft,
  Settings,
  X,
  CheckCircle,
  UserPlus,
  Building2,
  Utensils,
  Camera,
  TrendingUp,
  CreditCard,
  Users,
  MessageSquare,
  Clock,
  MoreHorizontal,
  RotateCcw,
  User,
  ChevronDown,
  Check,
  UserMinus,
  MessageCircle,
  ExternalLink,
  FileText,
  Info
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import AdminManagerChatTab from "../../../components/Admin/EventDetails/AdminManagerChatTab";
import {
    assignPlanningEventManager,
    assignPromoteEventManager,
    decidePromoteEventRequest,
    fetchAdminEventDashboard,
    fetchAdminEventRequestById,
    fetchTeamAccess,
    fetchEventTransactionsForAdmin,
    fetchEventVendorAlternatives,
    fetchEventVendorSelection,
    fetchUnavailableEventManagers,
    updatePromoteEventStatusForAdmin,
    unassignPlanningEventManager,
    unassignPromoteEventManager,
} from "../../../store/slices/adminSlice";

const MANAGER_BADGE_CLASSES = [
    "bg-[#0b2d49]/10 text-[#0b2d49]",
    "bg-emerald-100 text-emerald-700",
    "bg-indigo-100 text-indigo-700",
    "bg-rose-100 text-rose-700",
];

const buildInitials = (name) => {
    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || parts[0]?.[1] || "";
    return (first + second).toUpperCase() || "MG";
};

const REQUIRED_PROMOTE_MANAGER_DEPARTMENT = 'Public Event';
const REQUIRED_PLANNING_MANAGER_DEPARTMENT = {
    public: 'Public Event',
    private: 'Private Event',
};

const isEligibleAssignedRole = (assignedRole) => {
    const role = String(assignedRole || '').trim().toLowerCase();
    return role.includes('junior') || role.includes('senior');
};

const getNextAutoAssignTime = (after) => {
    const base = new Date(after);
    if (Number.isNaN(base.getTime())) return null;

    const y = base.getFullYear();
    const m = base.getMonth();
    const d = base.getDate();

    const slotMorning = new Date(y, m, d, 9, 0, 0, 0);
    const slotEvening = new Date(y, m, d, 21, 0, 0, 0);

    if (base < slotMorning) return slotMorning;
    if (base < slotEvening) return slotEvening;
    return new Date(y, m, d + 1, 9, 0, 0, 0);
};

const deriveUiStatus = (request, requestType) => {
    if (requestType === 'PLANNING') {
        const planningStatus = String(request?.status || '').toUpperCase();
        if (planningStatus === 'REJECTED') return 'REJECTED';
        if (request?.assignedManagerId) return 'VERIFIED';
        if (request?.isUrgent) return 'URGENT';
        return 'PENDING';
    }

    const decision = request?.adminDecision?.status;
    if (decision === "REJECTED") return "REJECTED";
    const promoteStatus = String(request?.eventStatus || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
    if (['CONFIRMED', 'LIVE', 'COMPLETE', 'COMPLETED', 'CLOSED'].includes(promoteStatus)) return 'VERIFIED';
    if (request?.assignedManagerId) return "VERIFIED";
    if (decision === "APPROVED") {
        const decidedAt = request?.adminDecision?.decidedAt;
        if (decidedAt) {
            const nextSlot = getNextAutoAssignTime(decidedAt);
            if (nextSlot) {
                const graceMs = 15 * 60 * 1000;
                if (Date.now() >= nextSlot.getTime() + graceMs) return "URGENT";
            }
        }
        return "REVIEWING";
    }
    return "PENDING";
};

const EventDetails = () => {
  const { id } = useParams();

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const {
        selectedEventRequest,
        selectedEventRequestType,
        selectedEventVendorSelection,
        selectedEventVendorAlternatives,
        selectedEventTransactions,
        eventRequestLoading,
        eventVendorSelectionLoading,
        eventVendorAlternativesLoading,
        eventTransactionsLoading,
        teamMembers,
        unavailableManagerIds,
    } = useSelector((state) => state.admin);
  
    const [currentStatus, setCurrentStatus] = useState("PENDING");
  
  const [assignedManager, setAssignedManager] = useState(null);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [showManagerOptions, setShowManagerOptions] = useState(false);
  const [activeTab, setActiveTab] = useState("Details");

    useEffect(() => {
        if (!id) return;
        dispatch(fetchAdminEventRequestById(id));
        dispatch(fetchAdminEventDashboard());
        dispatch(fetchUnavailableEventManagers({ eventId: id }));
        dispatch(fetchTeamAccess({ page: 1, limit: 50 }));
    }, [dispatch, id]);

    useEffect(() => {
        if (!id) return;
        dispatch(fetchEventTransactionsForAdmin(id));

        if (selectedEventRequestType === 'PLANNING') {
            dispatch(fetchEventVendorSelection(id));
        }
    }, [dispatch, id, selectedEventRequestType]);

    useEffect(() => {
        setCurrentStatus(deriveUiStatus(selectedEventRequest, selectedEventRequestType));
    }, [selectedEventRequest, selectedEventRequestType]);

    const requiredManagerDepartment = useMemo(() => {
        if (selectedEventRequestType === 'PLANNING') {
            const category = String(selectedEventRequest?.category || '').trim().toLowerCase();
            return REQUIRED_PLANNING_MANAGER_DEPARTMENT[category] || REQUIRED_PROMOTE_MANAGER_DEPARTMENT;
        }
        return REQUIRED_PROMOTE_MANAGER_DEPARTMENT;
    }, [selectedEventRequestType, selectedEventRequest?.category]);

    const unavailableSet = useMemo(() => new Set((unavailableManagerIds || []).map(String)), [unavailableManagerIds]);

    const availableManagers = useMemo(() => {
        const managers = (teamMembers || [])
            .filter((m) => m?.role === 'MANAGER' && m?.id)
            .filter((m) => String(m?.department || '').trim().toLowerCase() === String(requiredManagerDepartment || '').trim().toLowerCase())
            .filter((m) => isEligibleAssignedRole(m?.assignedRole));
        return managers
            .filter((m) => !unavailableSet.has(String(m.id)))
            .map((m, idx) => ({
                id: m.id,
                authId: m.authId || null,
                name: m.name || m.email || 'Manager',
                assignedRole: m.assignedRole || 'Manager',
                initial: buildInitials(m.name || m.email),
                color: MANAGER_BADGE_CLASSES[idx % MANAGER_BADGE_CLASSES.length],
            }));
    }, [teamMembers, unavailableSet, requiredManagerDepartment]);

    useEffect(() => {
        const assignedId = selectedEventRequest?.assignedManagerId;
        if (!assignedId) {
            setAssignedManager(null);
            return;
        }

        const member = (teamMembers || []).find((m) => String(m?.id) === String(assignedId));
        if (!member) {
            setAssignedManager({
                id: assignedId,
                name: 'Assigned Manager',
                initial: 'MG',
                color: MANAGER_BADGE_CLASSES[0],
            });
            return;
        }

        setAssignedManager({
            id: member.id,
            authId: member.authId || null,
            name: member.name || member.email || 'Manager',
            email: member.email || null,
            assignedRole: member.assignedRole || 'Manager',
            initial: buildInitials(member.name || member.email),
            color: MANAGER_BADGE_CLASSES[0],
        });
    }, [selectedEventRequest?.assignedManagerId, teamMembers]);

  const handleRemoveManager = () => {
      if (!id) return;

      if (!selectedEventRequest?.assignedManagerId) {
          toast.error('No manager assigned to remove');
          setShowManagerOptions(false);
          return;
      }

      toast.dismiss();
      const thunk = selectedEventRequestType === 'PLANNING'
          ? unassignPlanningEventManager
          : unassignPromoteEventManager;

      dispatch(thunk({ eventId: id }))
          .unwrap()
          .then(() => {
              setAssignedManager(null);
              setShowManagerOptions(false);
              toast.success('Manager removed from event', {
                  icon: '🚫',
                  style: { borderRadius: '12px', background: '#0b2d49', color: '#fff' },
              });
          })
          .catch((err) => {
              toast.error(err || 'Failed to remove manager');
              setShowManagerOptions(false);
          });
  };

  const handleViewProfile = () => {
      if (!assignedManager?.id) return;
      const search = String(assignedManager.email || assignedManager.name || assignedManager.id).trim();
      if (!search) return;

      setShowManagerOptions(false);
      navigate(`/admin/team-access?search=${encodeURIComponent(search)}`);
  };

  const handleApprove = () => {
      if (selectedEventRequestType === 'PLANNING') return;
        toast.dismiss();
        dispatch(decidePromoteEventRequest({ eventId: id, decision: 'APPROVE' }))
            .unwrap()
            .then(() => {
                setCurrentStatus('REVIEWING');
                toast.success("Event has been approved successfully!", {
                    style: {
                        borderRadius: '12px',
                        background: '#0b2d49',
                        color: '#fff',
                        fontWeight: '600'
                    },
                    iconTheme: {
                        primary: '#28a785',
                        secondary: '#fff',
                    },
                });
            })
            .catch((err) => {
                toast.error(err || 'Failed to approve event');
            });
  };

  const handleReject = () => {
      if (selectedEventRequestType === 'PLANNING') return;
        toast.dismiss();
        dispatch(decidePromoteEventRequest({ eventId: id, decision: 'REJECT' }))
            .unwrap()
            .then(() => {
                setCurrentStatus('REJECTED');
                toast.error("Event request has been rejected.", {
                    style: {
                        borderRadius: '12px',
                        background: '#fff',
                        color: '#e11d48',
                        fontWeight: '600',
                        border: '1px solid #ffe4e6'
                    },
                });
            })
            .catch((err) => {
                toast.error(err || 'Failed to reject event');
            });
  };

  const handleMarkAsClosed = () => {
      if (selectedEventRequestType === 'PLANNING') return;

      toast.dismiss();
      dispatch(updatePromoteEventStatusForAdmin({ eventId: id, eventStatus: 'CLOSED' }))
          .unwrap()
          .then(() => {
              setCurrentStatus('VERIFIED');
              toast.success('Event has been marked as closed.', {
                  style: {
                      borderRadius: '12px',
                      background: '#0b2d49',
                      color: '#fff',
                      fontWeight: '600',
                  },
              });
          })
          .catch((err) => {
              toast.error(err || 'Failed to mark event as closed');
          });
  };

    const headerTitle = selectedEventRequest?.eventTitle || (eventRequestLoading ? 'Loading event...' : 'Event Details');

    const pageCategoryLabel = useMemo(() => {
        if (selectedEventRequestType === 'PLANNING') return selectedEventRequest?.eventType || 'Planning Event';
        return selectedEventRequest?.eventCategory || 'Event';
    }, [selectedEventRequestType, selectedEventRequest?.eventType, selectedEventRequest?.eventCategory]);

    const pageSubCategoryLabel = useMemo(() => {
        if (selectedEventRequestType === 'PLANNING') return selectedEventRequest?.category || 'category';
        return selectedEventRequest?.eventField || selectedEventRequest?.customCategory || 'General';
    }, [selectedEventRequestType, selectedEventRequest?.category, selectedEventRequest?.eventField, selectedEventRequest?.customCategory]);

    const authenticityProofs = useMemo(() => {
        if (selectedEventRequestType !== 'PROMOTE') return [];
        const proofs = selectedEventRequest?.authenticityProofs;
        return Array.isArray(proofs) ? proofs : [];
    }, [selectedEventRequestType, selectedEventRequest?.authenticityProofs]);

    const vendorProfilesByAuthId = useMemo(() => {
        const profiles = selectedEventVendorSelection?.vendorProfiles;
        if (!Array.isArray(profiles)) return new Map();
        return new Map(profiles.map((v) => [String(v?.authId), v]));
    }, [selectedEventVendorSelection?.vendorProfiles]);

    const selectedServices = useMemo(() => {
        const fromSelection = selectedEventVendorSelection?.selectedServices;
        if (Array.isArray(fromSelection) && fromSelection.length > 0) return fromSelection;
        const fromPlanning = selectedEventRequest?.selectedServices;
        return Array.isArray(fromPlanning) ? fromPlanning : [];
    }, [selectedEventVendorSelection?.selectedServices, selectedEventRequest?.selectedServices]);

    useEffect(() => {
        if (!id) return;
        if (selectedEventRequestType !== 'PLANNING') return;
        if (!Array.isArray(selectedServices) || selectedServices.length === 0) return;

        dispatch(fetchEventVendorAlternatives({ eventId: id, services: selectedServices }));
    }, [dispatch, id, selectedEventRequestType, selectedServices]);

    const availableVendors = useMemo(() => {
        if (!Array.isArray(selectedEventVendorAlternatives)) return [];

        const rows = [];
        for (const bucket of selectedEventVendorAlternatives) {
            const service = String(bucket?.service || '').trim();
            const alternatives = Array.isArray(bucket?.alternatives) ? bucket.alternatives : [];
            const profiles = Array.isArray(bucket?.vendorProfiles) ? bucket.vendorProfiles : [];
            const profileByAuthId = new Map(profiles.map((p) => [String(p?.authId || ''), p]));

            for (const alt of alternatives) {
                const vendorAuthId = String(alt?.vendorAuthId || '').trim();
                if (!vendorAuthId) continue;
                const profile = profileByAuthId.get(vendorAuthId);

                rows.push({
                    vendorAuthId,
                    service,
                    businessName: profile?.businessName || alt?.businessName || 'Vendor',
                    distanceText: alt?.distanceText || null,
                    price: Number.isFinite(Number(alt?.price)) ? Number(alt.price) : null,
                });
            }
        }

        const dedup = new Map();
        for (const row of rows) {
            const key = `${row.vendorAuthId}::${row.service}`;
            if (!dedup.has(key)) dedup.set(key, row);
        }

        return Array.from(dedup.values());
    }, [selectedEventVendorAlternatives]);

    const transactions = useMemo(() => {
        const orders = Array.isArray(selectedEventTransactions?.orders) ? selectedEventTransactions.orders : [];

        const normalized = orders.map((row) => {
            const amountPaise = Number(row?.amount);
            const paidAt = row?.paidAt || null;
            const createdAt = row?.createdAt || null;
            return {
                transactionId: row?.transactionId || row?.razorpayPaymentId || null,
                orderType: row?.orderType || 'PAYMENT',
                status: String(row?.status || 'UNKNOWN').toUpperCase(),
                amountPaise: Number.isFinite(amountPaise) ? amountPaise : 0,
                paidAt,
                createdAt,
                sortTime: new Date(paidAt || createdAt || 0).getTime(),
            };
        });

        return normalized.sort((a, b) => (Number(b.sortTime || 0) - Number(a.sortTime || 0)));
    }, [selectedEventTransactions?.orders]);

    const totalDisbursedPaise = useMemo(() => {
        return transactions
            .filter((txn) => txn.status === 'PAID')
            .reduce((sum, txn) => sum + Number(txn.amountPaise || 0), 0);
    }, [transactions]);

    const formatRupees = (amount) => {
        const n = Number(amount);
        if (!Number.isFinite(n)) return '0.00';
        return (n / 100).toFixed(2);
    };

    const formatTxnDate = (value) => {
        const dt = value ? new Date(value) : null;
        if (!dt || Number.isNaN(dt.getTime())) return '—';
        return dt.toLocaleDateString();
    };

    const formatInr = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return '—';
        return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    };

    const formatInrRange = ({ min, max }) => {
        const minOk = Number.isFinite(Number(min));
        const maxOk = Number.isFinite(Number(max));
        if (!minOk && !maxOk) return '—';
        if (minOk && !maxOk) return `₹${formatInr(min)}`;
        if (!minOk && maxOk) return `₹${formatInr(max)}`;
        return `₹${formatInr(min)} - ₹${formatInr(max)}`;
    };

    const budgetSnapshot = useMemo(() => {
        if (selectedEventRequestType === 'PLANNING' && selectedEventVendorSelection) {
            const min = Number(selectedEventVendorSelection.totalMinAmount);
            const max = Number(selectedEventVendorSelection.totalMaxAmount);

            return {
                originalRange: {
                    min: Number.isFinite(min) ? min : null,
                    max: Number.isFinite(max) ? max : null,
                },
                revisedRange: null,
            };
        }

        const fallback = selectedEventRequest?.budget && typeof selectedEventRequest.budget === 'object'
            ? selectedEventRequest.budget
            : {};
        const original = {
            min: fallback.original ?? null,
            max: fallback.final ?? null,
        };

        return {
            originalRange: original,
            revisedRange: fallback.revised != null ? { min: fallback.revised, max: fallback.revised } : null,
        };
    }, [selectedEventRequestType, selectedEventVendorSelection, selectedEventRequest?.budget]);

    const normalizeServiceKey = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

    const privateBilling = useMemo(() => {
        const category = String(selectedEventRequest?.category || '').trim().toLowerCase();
        const isPlanningEvent = selectedEventRequestType === 'PLANNING';
        const isPrivatePlanning = isPlanningEvent && category === 'private';
        const isPublicPlanning = isPlanningEvent && category === 'public';
        const isPromoteEvent = selectedEventRequestType === 'PROMOTE';
        const isPlanningMilestoneBilling = isPrivatePlanning || isPublicPlanning;

        const normalizedPlanningStatus = String(selectedEventRequest?.status || '').trim().toUpperCase().replace(/_/g, ' ');
        const normalizedUiStatus = String(currentStatus || '').trim().toUpperCase().replace(/_/g, ' ');
        const allowedBillingStatuses = ['VERIFIED', 'CONFIRMED', 'COMPLETED', 'VENDOR PAYMENT PENDING'];
        const canShow = isPlanningMilestoneBilling
            ? (allowedBillingStatuses.includes(normalizedPlanningStatus) || allowedBillingStatuses.includes(normalizedUiStatus))
            : isPromoteEvent;

        if (!isPlanningMilestoneBilling && !isPromoteEvent) {
            return { enabled: false };
        }

        const toNonNegative = (value) => {
            const n = Number(value || 0);
            return Number.isFinite(n) && n > 0 ? n : 0;
        };

        const toInrFromPaise = (value) => {
            const n = Number(value || 0);
            if (!Number.isFinite(n) || n <= 0) return 0;
            return Number((n / 100).toFixed(2));
        };

        if (isPromoteEvent) {
            const promoteOrders = (Array.isArray(selectedEventTransactions?.orders) ? selectedEventTransactions.orders : [])
                .map((row) => ({
                    status: String(row?.status || '').trim().toUpperCase(),
                    orderType: String(row?.orderType || '').trim().toUpperCase(),
                    amountPaise: Number(row?.amount || 0),
                    createdAt: row?.createdAt || null,
                    paidAt: row?.paidAt || null,
                }))
                .filter((row) => row.orderType === 'PROMOTE EVENT')
                .filter((row) => Number.isFinite(row.amountPaise) && row.amountPaise > 0)
                .sort((a, b) => {
                    const at = new Date(a?.createdAt || 0).getTime();
                    const bt = new Date(b?.createdAt || 0).getTime();
                    return bt - at;
                });

            const latestPromoteOrder = promoteOrders[0] || null;
            const latestPaidPromoteOrder = [...promoteOrders]
                .filter((row) => row.status === 'PAID')
                .sort((a, b) => {
                    const at = new Date(a?.paidAt || a?.createdAt || 0).getTime();
                    const bt = new Date(b?.paidAt || b?.createdAt || 0).getTime();
                    return bt - at;
                })[0] || null;

            const promotePaidTotalInrRaw = Number(
                (
                    promoteOrders
                        .filter((row) => row.status === 'PAID')
                        .reduce((sum, row) => sum + Number(row.amountPaise || 0), 0)
                ) / 100
            );

            const settlementAmountInr = latestPaidPromoteOrder
                ? toInrFromPaise(latestPaidPromoteOrder.amountPaise)
                : (latestPromoteOrder ? toInrFromPaise(latestPromoteOrder.amountPaise) : 0);

            const promotePaidTotalInr = settlementAmountInr > 0
                ? Number(Math.min(settlementAmountInr, promotePaidTotalInrRaw || 0).toFixed(2))
                : Number((promotePaidTotalInrRaw || 0).toFixed(2));

            const settlementOutstandingInr = Number(
                Math.max(0, settlementAmountInr - promotePaidTotalInr).toFixed(2)
            );

            const hasSettlementOrders = settlementAmountInr > 0 || promotePaidTotalInr > 0;

            if (hasSettlementOrders) {
                const hasPendingCreatedOrder = promoteOrders.some((row) => row.status === 'CREATED');

                return {
                    enabled: canShow,
                    normalizedStatus: normalizedPlanningStatus,
                    billingScope: 'promote',
                    summaryText: 'Promote settlement summary for activation billing.',
                    statusNote: promotePaidTotalInr > 0
                        ? (hasPendingCreatedOrder
                            ? 'Payment is completed. Additional CREATED entries are pending retries and do not increase due amount.'
                            : 'Payment is completed for this promote event.')
                        : 'Settlement payment is pending for this promote event.',
                    totalAmountInr: settlementAmountInr,
                    paidTotalInr: promotePaidTotalInr,
                    outstandingDueInr: settlementOutstandingInr,
                    lineItems: [
                        {
                            id: 'promote-settlement',
                            serviceName: 'Promote Settlement Fee',
                            businessName: 'Platform + marketing + tax billing',
                            amountInr: settlementAmountInr,
                        },
                    ],
                    paidBreakdownRows: [
                        { label: 'Settlement Total', amountInr: settlementAmountInr },
                        { label: 'Settlement Paid', amountInr: promotePaidTotalInr },
                        { label: 'Outstanding Due', amountInr: settlementOutstandingInr },
                    ],
                };
            }

            const grossRevenueInr = toNonNegative(selectedEventRequest?.ticketSalesStats?.grossRevenueInr);
            const platformFeeInr = toNonNegative(
                selectedEventRequest?.ticketSalesStats?.platformFeeInr
                ?? selectedEventRequest?.platformFee
            );
            const serviceChargeInr = toNonNegative(selectedEventRequest?.ticketSalesStats?.serviceChargeInr);
            const totalFeesInr = toNonNegative(
                selectedEventRequest?.ticketSalesStats?.totalFeesInr
                ?? (platformFeeInr + serviceChargeInr)
            );

            const totalVendorCostInr = isPublicPlanning
                ? (Array.isArray(selectedEventVendorSelection?.vendors) ? selectedEventVendorSelection.vendors : []).reduce((sum, row) => {
                    const lockedPrice = toNonNegative(row?.vendorQuotedPrice);
                    const commissionAmount = toNonNegative(row?.commissionAmount);
                    const isLocked = Boolean(row?.priceLocked) && lockedPrice > 0;
                    if (!isLocked) return sum;
                    return sum + Math.max(0, lockedPrice - commissionAmount);
                }, 0)
                : 0;

            const payoutTotalInr = Number(
                Math.max(0, grossRevenueInr - totalFeesInr - totalVendorCostInr).toFixed(2)
            );
            const payoutStatus = String(selectedEventRequest?.generatedRevenuePayout?.status || '').trim().toUpperCase();
            const payoutPaidInr = payoutStatus === 'SUCCESS'
                ? toInrFromPaise(selectedEventRequest?.generatedRevenuePayout?.amountPaise)
                : 0;
            const outstandingDueInr = Number(Math.max(0, payoutTotalInr - payoutPaidInr).toFixed(2));

            const lineItems = [
                {
                    id: 'generated-revenue',
                    serviceName: 'Generated Ticket Revenue',
                    businessName: 'Total collected from ticket sales',
                    amountInr: grossRevenueInr,
                },
                {
                    id: 'total-fees',
                    serviceName: 'Total Platform Fees',
                    businessName: 'Platform fee + service charge',
                    amountInr: totalFeesInr,
                },
                ...(isPublicPlanning
                    ? [{
                        id: 'vendor-cost',
                        serviceName: 'Vendor Cost',
                        businessName: 'Locked vendor commitments',
                        amountInr: totalVendorCostInr,
                    }]
                    : []),
            ];

            return {
                enabled: canShow,
                normalizedStatus: normalizedPlanningStatus,
                billingScope: 'promote',
                summaryText: 'Promote event billing summary with generated revenue, fees, and payout progress.',
                statusNote: 'Payout is released from generated revenue after fee settlement.',
                totalAmountInr: payoutTotalInr,
                paidTotalInr: payoutPaidInr,
                outstandingDueInr,
                lineItems,
                paidBreakdownRows: [
                    { label: 'Platform Fee', amountInr: platformFeeInr },
                    { label: 'Service Charge', amountInr: serviceChargeInr },
                    ...(isPublicPlanning ? [{ label: 'Vendor Cost', amountInr: totalVendorCostInr }] : []),
                    { label: 'Total Fees', amountInr: totalFeesInr },
                    { label: 'Payout Released', amountInr: payoutPaidInr },
                    { label: 'Outstanding Payout', amountInr: outstandingDueInr },
                ],
            };
        }

        const vendors = Array.isArray(selectedEventVendorSelection?.vendors) ? selectedEventVendorSelection.vendors : [];
        const vendorProfiles = Array.isArray(selectedEventVendorSelection?.vendorProfiles) ? selectedEventVendorSelection.vendorProfiles : [];
        const profileByAuthId = new Map(
            vendorProfiles
                .map((profile) => [String(profile?.authId || '').trim(), profile])
                .filter(([key]) => Boolean(key))
        );

        const vendorByService = new Map(
            vendors
                .filter((row) => row?.service)
                .map((row) => [normalizeServiceKey(row.service), row])
        );

        const lineItems = (Array.isArray(selectedServices) ? selectedServices : [])
            .map((serviceName, idx) => {
                const serviceKey = normalizeServiceKey(serviceName);
                const vendorRow = vendorByService.get(serviceKey) || null;
                const vendorAuthId = String(vendorRow?.vendorAuthId || '').trim();
                const vendorProfile = vendorAuthId ? profileByAuthId.get(vendorAuthId) : null;
                const lockedPrice = Number(vendorRow?.vendorQuotedPrice || 0);
                const minPrice = Number(vendorRow?.servicePrice?.min || 0);
                const maxPrice = Number(vendorRow?.servicePrice?.max || 0);
                const safeLockedPrice = Number.isFinite(lockedPrice) && lockedPrice > 0 ? lockedPrice : 0;
                const safeEstimate = Math.max(
                    Number.isFinite(minPrice) && minPrice > 0 ? minPrice : 0,
                    Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : 0
                );
                const amountInr = safeLockedPrice || safeEstimate;

                return {
                    id: `${serviceKey || 'service'}:${idx}`,
                    serviceName: String(vendorRow?.serviceName || serviceName || 'Service').trim(),
                    businessName: vendorProfile?.businessName || (vendorAuthId ? 'Selected Vendor' : 'Vendor TBD'),
                    amountInr,
                };
            })
            .filter((item) => item.amountInr > 0 || item.businessName);

        const lineItemsTotalInr = lineItems.reduce((sum, item) => sum + Number(item?.amountInr || 0), 0);
        const lockedTotalInr = vendors.reduce((sum, row) => {
            const amount = Number(row?.vendorQuotedPrice || 0);
            return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
        }, 0);

        const selectionMaxInr = Number(selectedEventVendorSelection?.totalMaxAmount || 0);
        const requestTotalInr = Number(selectedEventRequest?.totalAmount || 0);
        const totalAmountInr = [requestTotalInr, lockedTotalInr, selectionMaxInr, lineItemsTotalInr].find((v) => Number.isFinite(v) && v > 0) || 0;

        const depositPaidInr = toInrFromPaise(selectedEventRequest?.depositPaidAmountPaise);
        const vendorConfirmationPaidInr = toInrFromPaise(selectedEventRequest?.vendorConfirmationPaidAmountPaise);
        const remainingPaymentPaidInr = toInrFromPaise(selectedEventRequest?.remainingPaymentPaidAmountPaise);
        const paidTotalInr = Number((depositPaidInr + vendorConfirmationPaidInr + remainingPaymentPaidInr).toFixed(2));
        const outstandingDueInr = Number(Math.max(0, totalAmountInr - paidTotalInr).toFixed(2));

        return {
            enabled: canShow,
            normalizedStatus: normalizedPlanningStatus,
            billingScope: isPublicPlanning ? 'planning-public' : 'planning-private',
            summaryText: isPublicPlanning
                ? 'Public event billing summary with current outstanding dues and paid milestones.'
                : 'Private event billing summary with current outstanding dues.',
            statusNote: normalizedPlanningStatus === 'CONFIRMED'
                ? (isPublicPlanning
                    ? 'Billing is now visible for confirmed public events.'
                    : 'Billing is now visible for confirmed private events.')
                : null,
            totalAmountInr,
            paidTotalInr,
            outstandingDueInr,
            depositPaidInr,
            vendorConfirmationPaidInr,
            remainingPaymentPaidInr,
            lineItems,
            paidBreakdownRows: [
                { label: 'Deposit Fee', amountInr: depositPaidInr },
                { label: 'Vendor Confirmation', amountInr: vendorConfirmationPaidInr },
                { label: 'Remaining Payment', amountInr: remainingPaymentPaidInr },
                { label: 'Total Paid', amountInr: paidTotalInr },
            ],
        };
    }, [
        selectedEventRequestType,
        selectedEventRequest?.category,
        selectedEventRequest?.status,
        selectedEventRequest?.platformFee,
        selectedEventRequest?.ticketSalesStats,
        selectedEventRequest?.generatedRevenuePayout?.status,
        selectedEventRequest?.generatedRevenuePayout?.amountPaise,
        selectedEventTransactions?.orders,
        selectedEventRequest?.totalAmount,
        selectedEventRequest?.depositPaidAmountPaise,
        selectedEventRequest?.vendorConfirmationPaidAmountPaise,
        selectedEventRequest?.remainingPaymentPaidAmountPaise,
        selectedEventVendorSelection?.vendors,
        selectedEventVendorSelection?.vendorProfiles,
        selectedEventVendorSelection?.totalMaxAmount,
        selectedServices,
        currentStatus,
    ]);

    const planningPublicRevenueBreakdown = useMemo(() => {
        const isPlanningPublic = selectedEventRequestType === 'PLANNING'
            && String(selectedEventRequest?.category || '').trim().toLowerCase() === 'public';

        if (!isPlanningPublic) {
            return { enabled: false };
        }

        const toNonNegative = (value) => {
            const n = Number(value || 0);
            return Number.isFinite(n) && n > 0 ? n : 0;
        };

        const grossRevenueInr = toNonNegative(selectedEventRequest?.ticketSalesStats?.grossRevenueInr);
        const platformFeeInr = toNonNegative(
            selectedEventRequest?.ticketSalesStats?.platformFeeInr
            ?? selectedEventRequest?.platformFee
        );
        const serviceChargeInr = toNonNegative(selectedEventRequest?.ticketSalesStats?.serviceChargeInr);
        const totalFeesInr = toNonNegative(
            selectedEventRequest?.ticketSalesStats?.totalFeesInr
            ?? (platformFeeInr + serviceChargeInr)
        );

        const payoutAmountInr = Number(Math.max(0, grossRevenueInr - totalFeesInr).toFixed(2));
        const payoutStatus = String(selectedEventRequest?.generatedRevenuePayout?.status || '').trim().toUpperCase();
        const payoutPaidInr = payoutStatus === 'SUCCESS'
            ? Number((Number(selectedEventRequest?.generatedRevenuePayout?.amountPaise || 0) / 100).toFixed(2))
            : 0;
        const payoutPendingInr = Number(Math.max(0, payoutAmountInr - payoutPaidInr).toFixed(2));

        return {
            enabled: true,
            grossRevenueInr,
            platformFeeInr,
            serviceChargeInr,
            totalFeesInr,
            payoutAmountInr,
            payoutPaidInr,
            payoutPendingInr,
        };
    }, [
        selectedEventRequestType,
        selectedEventRequest?.category,
        selectedEventRequest?.platformFee,
        selectedEventRequest?.ticketSalesStats,
        selectedEventRequest?.generatedRevenuePayout?.status,
        selectedEventRequest?.generatedRevenuePayout?.amountPaise,
    ]);

    const eventWorkflowStatusLabel = useMemo(() => {
        const rawStatus = selectedEventRequestType === 'PLANNING'
            ? selectedEventRequest?.status
            : (selectedEventRequest?.eventStatus || selectedEventRequest?.status || selectedEventRequest?.adminDecision?.status);

        const normalized = String(rawStatus || '').trim().replace(/_/g, ' ');
        if (!normalized) return 'N/A';
        return normalized.toUpperCase();
    }, [
        selectedEventRequestType,
        selectedEventRequest?.status,
        selectedEventRequest?.eventStatus,
        selectedEventRequest?.adminDecision?.status,
    ]);

    const promoteLifecycleStatusToken = useMemo(
        () => String(selectedEventRequest?.eventStatus || selectedEventRequest?.status || '').trim().toUpperCase().replace(/[\s-]+/g, '_'),
        [selectedEventRequest?.eventStatus, selectedEventRequest?.status]
    );
    const showMarkAsClosedAction = selectedEventRequestType !== 'PLANNING'
        && ['CANCELLED', 'CANCELED'].includes(promoteLifecycleStatusToken);

    const commLogs = useMemo(() => {
        const logs = [];

        if (selectedEventRequest?.createdAt) {
            logs.push({
                title: 'Request submitted',
                time: new Date(selectedEventRequest.createdAt).toLocaleString(),
                type: 'info',
            });
        }

        if (assignedManager?.name) {
            logs.push({
                title: `Assigned to ${assignedManager.name}`,
                time: 'Latest update',
                type: 'success',
            });
        }

        if (selectedEventRequest?.adminDecision?.decidedAt) {
            const decisionLabel = String(selectedEventRequest?.adminDecision?.status || 'updated').toLowerCase();
            logs.push({
                title: `Admin decision: ${decisionLabel}`,
                time: new Date(selectedEventRequest.adminDecision.decidedAt).toLocaleString(),
                type: decisionLabel === 'rejected' ? 'warning' : 'success',
            });
        }

        return logs;
    }, [selectedEventRequest?.createdAt, selectedEventRequest?.adminDecision?.status, selectedEventRequest?.adminDecision?.decidedAt, assignedManager?.name]);

    const iconForService = (serviceName) => {
        const key = String(serviceName || '').trim().toLowerCase();
        if (key.includes('cater')) return Utensils;
        if (key.includes('photo') || key.includes('camera')) return Camera;
        if (key.includes('venue') || key.includes('hall')) return Building2;
        return Settings;
    };

    if (eventRequestLoading && !selectedEventRequest) {
        return (
            <div className="flex flex-col h-full bg-transparent px-8 py-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-64 rounded-2xl bg-white border border-[#e9eff1]" />
                    <div className="h-16 rounded-2xl bg-white border border-[#e9eff1]" />
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8 h-110 rounded-3xl bg-white border border-[#e9eff1]" />
                        <div className="col-span-12 lg:col-span-4 h-110 rounded-3xl bg-white border border-[#e9eff1]" />
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="flex flex-col h-full bg-transparent">
       {/* Top Header - Custom Implementation */}
       <div className="px-8 py-6 pb-2 shrink-0">
          <div className="flex items-center gap-2 text-sm text-[#5a5b44] mb-2">
            <Link to="/admin/events" className="hover:text-[#d7a444] transition-colors flex items-center gap-1">
                <ArrowLeft size={16} />
                Back to Events
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                  <div className="flex items-center gap-4">
                      <h1 className="text-2xl font-bold text-[#0b2d49] tracking-tight">{headerTitle}</h1>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          currentStatus === 'VERIFIED' ? 'bg-[#28a785]/10 text-[#28a785]' : 
                          currentStatus === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-[#e9eff1] text-[#0b2d49]'
                      }`}>
                          {currentStatus}
                      </span>
                  </div>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#708aa0]">
                      Event Status: <span className="text-[#0b2d49]">{eventWorkflowStatusLabel}</span>
                  </p>
              </div>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
           {/* Page Title & Actions */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div>
                   <p className="text-[#d7a444] text-sm font-medium mb-1">
                       {pageCategoryLabel} <span className="text-[#e9eff1] mx-2">•</span> {pageSubCategoryLabel}
                   </p>
                   <h2 className="text-3xl font-bold text-[#0b2d49] tracking-tight">Event Intelligence View</h2>
               </div>
               <div className="flex gap-3 relative">
                                     {(((selectedEventRequestType === 'PLANNING' && currentStatus !== 'REJECTED' && currentStatus !== 'VERIFIED') || (currentStatus === "REVIEWING" || currentStatus === "URGENT")) && !assignedManager) && (
                       <div className="relative">
                            <button 
                                                                onClick={() => {
                                                                    const next = !showManagerDropdown;
                                                                    setShowManagerDropdown(next);
                                                                    if (next) {
                                                                        dispatch(fetchUnavailableEventManagers({ eventId: id }));
                                                                        dispatch(fetchTeamAccess({ page: 1, limit: 50 }));
                                                                    }
                                                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#d7a444] text-white font-semibold rounded-xl hover:bg-[#d7a444]/90 transition-colors shadow-lg shadow-[#d7a444]/20 animate-in fade-in zoom-in duration-300"
                            >
                                <UserPlus size={18} />
                                Assign Manager
                                <ChevronDown size={16} className={`ml-1 transition-transform duration-200 ${showManagerDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showManagerDropdown && (
                                <div className="absolute left-0 mt-2 w-64 bg-white border border-[#e9eff1] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 border-b border-[#f0f2f5] bg-[#f8fafc]/50">
                                        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest px-2 py-1">Select Available Manager</p>
                                    </div>
                                    <div className="py-2 max-h-60 overflow-y-auto custom-scrollbar">
                                                                                {availableManagers.map((manager) => (
                                            <button
                                                key={manager.id}
                                                onClick={() => {
                                                                                                        const action = selectedEventRequestType === 'PLANNING' ? assignPlanningEventManager : assignPromoteEventManager;
                                                                                                        dispatch(action({ eventId: id, managerId: manager.id }))
                                                                                                            .unwrap()
                                                                                                            .then(() => {
                                                                                                                setAssignedManager(manager);
                                                                                                                setCurrentStatus('VERIFIED');
                                                                                                                setShowManagerDropdown(false);
                                                                                                                toast.dismiss();
                                                                                                                toast.success(`Assigned to ${manager.name}`, {
                                                                                                                    icon: '🤝',
                                                                                                                    style: { borderRadius: '12px', background: '#0b2d49', color: '#fff' }
                                                                                                                });
                                                                                                            })
                                                                                                            .catch((err) => {
                                                                                                                toast.error(err || 'Failed to assign manager');
                                                                                                            });
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-[#f8fafc] transition-colors flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${manager.color}`}>
                                                        {manager.initial}
                                                    </div>
                                                    <span className={`text-sm font-bold ${assignedManager?.id === manager.id ? 'text-[#0b2d49]' : 'text-[#5a5b44]'}`}>
                                                        {manager.name}
                                                    </span>
                                                </div>
                                                {assignedManager?.id === manager.id && (
                                                    <Check size={16} className="text-[#28a785]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                       </div>
                   )}
                   
                   {showMarkAsClosedAction ? (
                       <button
                           onClick={handleMarkAsClosed}
                           className="flex items-center gap-2 px-5 py-2.5 bg-[#0b2d49] text-white font-semibold rounded-xl hover:bg-[#0b2d49]/90 transition-colors shadow-lg shadow-[#0b2d49]/20"
                       >
                           <CheckCircle size={18} />
                           Mark as Closed
                       </button>
                   ) : (selectedEventRequestType !== 'PLANNING' && currentStatus === "PENDING") && (
                       <>
                           <button 
                               onClick={handleReject}
                               className="flex items-center gap-2 px-5 py-2.5 bg-white border border-rose-100 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition-colors"
                           >
                               <X size={18} />
                               Reject
                           </button>
                           <button 
                               onClick={handleApprove}
                               className="flex items-center gap-2 px-5 py-2.5 bg-[#0b2d49] text-white font-semibold rounded-xl hover:bg-[#0b2d49]/90 transition-colors shadow-lg shadow-[#0b2d49]/20"
                           >
                               <CheckCircle size={18} />
                               Approve
                           </button>
                       </>
                   )}


               </div>
           </div>

            {currentStatus === "VERIFIED" && (
                <div className="flex items-center gap-1 mb-8 bg-[#f8fafc] p-1.5 rounded-2xl w-fit border border-[#e9eff1]/50">
                    {[
                        { id: 'Details', icon: Info },
                        { id: 'Chat', icon: MessageSquare },
                        { id: 'Financial', icon: CreditCard },
                        { id: 'Documents', icon: FileText }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 focus:outline-none select-none ${
                                activeTab === tab.id 
                                ? 'bg-white text-[#0b2d49] shadow-sm ring-1 ring-[#e9eff1]' 
                                : 'text-[#708aa0] hover:text-[#0b2d49] hover:bg-white/50'
                            }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? 'text-[#d7a444]' : ''} />
                            {tab.id}
                        </button>
                    ))}
                </div>
            )}

           <div className="grid grid-cols-12 gap-6">
               {/* Left Column (8 cols) */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Conditional Tab Content */}
                    {activeTab === "Details" ? (
                        <>
                            {/* Service Configuration */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Settings className="text-[#d7a444]" size={24} />
                                        <h3 className="text-lg font-bold text-[#0b2d49]">Service Configuration</h3>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {eventVendorSelectionLoading ? (
                                        <div className="col-span-full text-sm font-medium text-[#708aa0]">Loading services…</div>
                                    ) : selectedServices.length === 0 ? (
                                        <div className="col-span-full text-sm font-medium text-[#708aa0]">No services selected yet.</div>
                                    ) : (
                                        selectedServices.map((serviceName, index) => {
                                            const ServiceIcon = iconForService(serviceName);
                                            return (
                                                <div key={`${serviceName}-${index}`} className="bg-[#f8fafc] p-5 rounded-2xl border border-[#e9eff1] hover:border-[#d7a444] transition-colors group">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#708aa0] group-hover:text-[#d7a444] mb-4 transition-colors">
                                                        <ServiceIcon size={20} />
                                                    </div>
                                                    <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-1">Service</p>
                                                    <p className="text-sm font-bold text-[#0b2d49] leading-tight">{serviceName}</p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {selectedEventRequestType === 'PROMOTE' && (
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <FileText className="text-[#d7a444]" size={24} />
                                        <h3 className="text-lg font-bold text-[#0b2d49]">Authenticity Proofs</h3>
                                    </div>

                                    {authenticityProofs.length === 0 ? (
                                        <p className="text-sm font-medium text-[#708aa0]">No authenticity proofs uploaded for this promote event.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {authenticityProofs.map((proof) => (
                                                <a
                                                    key={proof?.publicId || proof?.url}
                                                    href={proof?.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="group flex items-center gap-4 p-4 bg-[#f8fafc] border border-[#e9eff1] rounded-2xl hover:border-[#d7a444] hover:bg-white hover:shadow-sm transition-all"
                                                >
                                                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#e9eff1] overflow-hidden flex items-center justify-center">
                                                        {proof?.url ? (
                                                            <img
                                                                src={proof.url}
                                                                alt="Authenticity proof"
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <FileText size={20} className="text-[#708aa0]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-1">Proof</p>
                                                        <p className="text-sm font-bold text-[#0b2d49] truncate">{proof?.publicId || 'Authenticity proof'}</p>
                                                    </div>
                                                    <ExternalLink size={16} className="text-[#94a3b8] group-hover:text-[#0b2d49] transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Financial Summary (Mini) */}
                            {privateBilling.enabled && (
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-2">Billing Overview</p>
                                            <h3 className="text-lg font-bold text-[#0b2d49]">Bills & Payment</h3>
                                            <p className="text-sm text-[#708aa0]">{privateBilling?.summaryText || 'Event billing summary with current outstanding dues.'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                        <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e9eff1]">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Total Amount</p>
                                            <p className="text-lg font-black text-[#0b2d49]">₹{formatInr(privateBilling.totalAmountInr)}</p>
                                        </div>
                                        <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e9eff1]">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Total Paid</p>
                                            <p className="text-lg font-black text-[#0b2d49]">₹{formatInr(privateBilling.paidTotalInr)}</p>
                                        </div>
                                        <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e9eff1]">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Outstanding Due</p>
                                            <p className="text-lg font-black text-[#0b2d49]">₹{formatInr(privateBilling.outstandingDueInr)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="bg-[#f8fafc] rounded-2xl border border-[#e9eff1] overflow-hidden">
                                            <div className="px-4 py-3 bg-white border-b border-[#e9eff1] text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
                                                Price Breakdown
                                            </div>
                                            {privateBilling.lineItems.length > 0 ? (
                                                <div className="divide-y divide-[#e9eff1]">
                                                    {privateBilling.lineItems.map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-[#0b2d49] truncate">{item.serviceName}</p>
                                                                <p className="text-[#708aa0] truncate">{item.businessName}</p>
                                                            </div>
                                                            <p className="font-black text-[#0b2d49] shrink-0">₹{formatInr(item.amountInr)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-4 text-xs text-[#708aa0]">Price details are being prepared.</div>
                                            )}
                                        </div>

                                        <div className="bg-[#f8fafc] rounded-2xl border border-[#e9eff1] overflow-hidden">
                                            <div className="px-4 py-3 bg-white border-b border-[#e9eff1] text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
                                                Paid Breakdown
                                            </div>
                                            <div className="divide-y divide-[#e9eff1] text-xs">
                                                {(Array.isArray(privateBilling?.paidBreakdownRows) ? privateBilling.paidBreakdownRows : []).map((row, idx) => {
                                                    const isTotalPaidRow = String(row?.label || '').trim().toLowerCase() === 'total paid';
                                                    return (
                                                        <div
                                                            key={`${row?.label || 'row'}:${idx}`}
                                                            className={`flex items-center justify-between px-4 py-3 ${isTotalPaidRow ? 'bg-white/70' : ''}`}
                                                        >
                                                            <p className={`font-bold ${isTotalPaidRow ? 'font-black' : ''} text-[#0b2d49]`}>{row?.label || 'Amount'}</p>
                                                            <p className="font-black text-[#0b2d49]">₹{formatInr(row?.amountInr)}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {privateBilling?.statusNote && (
                                        <div className="mt-4 text-[11px] font-bold text-[#0b2d49] bg-[#f8fafc] border border-[#e9eff1] rounded-xl px-4 py-3">
                                            {privateBilling.statusNote}
                                        </div>
                                    )}

                                    {privateBilling?.billingScope === 'planning-public' && planningPublicRevenueBreakdown?.enabled ? (
                                        <div className="mt-5 bg-[#f8fafc] rounded-2xl border border-[#e9eff1] overflow-hidden">
                                            <div className="px-4 py-3 bg-white border-b border-[#e9eff1]">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Revenue Generation</p>
                                                <h4 className="text-lg font-bold text-[#0b2d49]">Generated Revenue Payout Breakdown</h4>
                                                <p className="text-sm text-[#708aa0] mt-1">Generated revenue minus platform fees equals user payout.</p>
                                            </div>

                                            <div className="divide-y divide-[#e9eff1] text-xs">
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <p className="font-bold text-[#0b2d49]">Generated Revenue</p>
                                                    <p className="font-black text-[#0b2d49]">₹{formatInr(planningPublicRevenueBreakdown.grossRevenueInr)}</p>
                                                </div>
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <p className="font-bold text-[#0b2d49]">Platform Fee</p>
                                                    <p className="font-black text-[#0b2d49]">₹{formatInr(planningPublicRevenueBreakdown.platformFeeInr)}</p>
                                                </div>
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <p className="font-bold text-[#0b2d49]">Service Charge</p>
                                                    <p className="font-black text-[#0b2d49]">₹{formatInr(planningPublicRevenueBreakdown.serviceChargeInr)}</p>
                                                </div>
                                                <div className="flex items-center justify-between px-4 py-3 bg-white/60">
                                                    <p className="font-black text-[#0b2d49]">Total Fees</p>
                                                    <p className="font-black text-[#0b2d49]">₹{formatInr(planningPublicRevenueBreakdown.totalFeesInr)}</p>
                                                </div>
                                                <div className="flex items-center justify-between px-4 py-3 bg-[#e8f4f1]">
                                                    <p className="font-black text-[#0b2d49]">Payable To User</p>
                                                    <p className="font-black text-[#0b2d49]">₹{formatInr(planningPublicRevenueBreakdown.payoutAmountInr)}</p>
                                                </div>
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <p className="font-bold text-[#0b2d49]">Already Paid To User</p>
                                                    <p className="font-black text-[#0b2d49]">₹{formatInr(planningPublicRevenueBreakdown.payoutPaidInr)}</p>
                                                </div>
                                                <div className="flex items-center justify-between px-4 py-3 bg-white/60">
                                                    <p className="font-black text-[#0b2d49]">Pending Payout</p>
                                                    <p className="font-black text-[#0b2d49]">₹{formatInr(planningPublicRevenueBreakdown.payoutPendingInr)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                                <div className="flex items-center gap-3 mb-6">
                                    <CreditCard className="text-[#d7a444]" size={24} />
                                    <h3 className="text-lg font-bold text-[#0b2d49]">Recent Transactions</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-bold text-[#708aa0] uppercase tracking-wider border-b border-[#e9eff1]">
                                                <th className="pb-4 pl-4">Transaction ID</th>
                                                <th className="pb-4">Date</th>
                                                <th className="pb-4">Amount</th>
                                                <th className="pb-4 pr-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventTransactionsLoading ? (
                                                <tr>
                                                    <td colSpan="4" className="py-6 text-sm font-medium text-[#708aa0] pl-4">Loading transactions…</td>
                                                </tr>
                                            ) : transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="py-6 text-sm font-medium text-[#708aa0] pl-4">No transactions found for this event.</td>
                                                </tr>
                                            ) : (
                                                transactions.slice(0, 2).map((txn) => (
                                                    <tr key={txn.transactionId || txn.createdAt || txn.orderType} className="border-b border-[#e9eff1] last:border-0">
                                                        <td className="py-4 pl-4 text-sm font-semibold text-[#0b2d49]">{txn.transactionId || '—'}</td>
                                                        <td className="py-4 text-sm text-[#5a5b44]">{formatTxnDate(txn.paidAt || txn.createdAt)}</td>
                                                        <td className="py-4 text-sm font-bold text-[#0b2d49]">₹{formatRupees(txn.amountPaise)}</td>
                                                        <td className="py-4 pr-4 text-right">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                                                String(txn.status || '').toUpperCase() === 'PAID' ? 'bg-[#0b2d49]/10 text-[#0b2d49]' : 'bg-[#f3ddb1]/50 text-[#d7a444]'
                                                            }`}>
                                                                {String(txn.status || 'UNKNOWN').toUpperCase()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : activeTab === "Chat" ? (
                        <AdminManagerChatTab
                            eventId={id}
                            manager={assignedManager ? {
                                authId: assignedManager.authId,
                                name: assignedManager.name,
                                role: assignedManager.assignedRole || 'Manager',
                            } : null}
                        />
                    ) : activeTab === "Financial" ? (
                        <div className="space-y-6">
                             <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="text-[#d7a444]" size={24} />
                                        <h3 className="text-lg font-bold text-[#0b2d49]">Detailed Financial Ledger</h3>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-[#f8fafc] text-[#0b2d49] border border-[#e9eff1] rounded-xl text-xs font-bold hover:bg-[#e9eff1] transition-colors">
                                        <ExternalLink size={14} />
                                        Export CSV
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-black text-[#708aa0] uppercase tracking-widest border-b border-[#e9eff1]">
                                                <th className="pb-5 pl-4">Transaction Details</th>
                                                <th className="pb-5">Reference</th>
                                                <th className="pb-5 text-right font-black">Amount</th>
                                                <th className="pb-5 pr-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#f0f2f5]">
                                            {eventTransactionsLoading ? (
                                                <tr>
                                                    <td colSpan="4" className="py-8 text-sm font-medium text-[#708aa0] pl-4">Loading transactions…</td>
                                                </tr>
                                            ) : transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="py-8 text-sm font-medium text-[#708aa0] pl-4">No transactions found for this event.</td>
                                                </tr>
                                            ) : (
                                                transactions.map((txn) => {
                                                    const status = String(txn.status || 'UNKNOWN').toUpperCase();
                                                    const isPaid = status === 'PAID';
                                                    return (
                                                        <tr key={txn.transactionId || txn.createdAt || txn.orderType} className="group hover:bg-[#f8fafc]/50 transition-all cursor-pointer">
                                                            <td className="py-5 pl-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-[#0b2d49]">{String(txn.orderType || 'PAYMENT').toUpperCase()}</span>
                                                                    <span className="text-[10px] font-medium text-[#94a3b8] uppercase">{formatTxnDate(txn.paidAt || txn.createdAt)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-5">
                                                                <span className="text-xs font-mono font-bold text-[#5a5b44]">{txn.transactionId || '—'}</span>
                                                            </td>
                                                            <td className="py-5 text-right">
                                                                <span className="text-base font-black text-[#0b2d49]">₹{formatRupees(txn.amountPaise)}</span>
                                                            </td>
                                                            <td className="py-5 pr-4 text-right">
                                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                    isPaid ? 'bg-[#28a785]/10 text-[#28a785]' : 'bg-[#f3ddb1]/50 text-[#d7a444]'
                                                                }`}>
                                                                    {isPaid ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                                    {status}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                        <tfoot className="bg-[#f8fafc]/50">
                                            <tr>
                                                <td colSpan="2" className="py-5 pl-4 text-sm font-bold text-[#708aa0]">TOTAL DISBURSED</td>
                                                <td className="py-5 text-right text-lg font-black text-[#0b2d49]">₹{formatRupees(totalDisbursedPaise)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e9eff1] min-h-[500px]">
                             <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-[#d7a444]" size={24} />
                                    <h3 className="text-lg font-bold text-[#0b2d49]">Event Documents</h3>
                                </div>
                                <button className="px-5 py-2.5 bg-[#0b2d49] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#0b2d49]/20 hover:bg-[#0b2d49]/90 transition-all">
                                    Upload New
                                </button>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: "Venue_Lease_Agreement.pdf", size: "2.4 MB", type: "CONTRACT", date: "20 Oct, 2023" },
                                    { name: "Catering_Menu_Revised.pdf", size: "1.1 MB", type: "INVOICE", date: "22 Oct, 2023" },
                                    { name: "Safety_Permit_Crystal_Hall.jpg", size: "4.8 MB", type: "PERMIT", date: "15 Oct, 2023" },
                                    { name: "Event_Insurance_Policy.pdf", size: "890 KB", type: "LEGAL", date: "18 Oct, 2023" }
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-[#f8fafc] border border-[#e9eff1] rounded-2xl group hover:border-[#d7a444] hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-[#e9eff1] flex items-center justify-center text-[#708aa0] group-hover:text-[#d7a444] transition-colors shadow-sm">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-[#0b2d49] leading-tight mb-1">{doc.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-[#94a3b8] uppercase">{doc.type}</span>
                                                    <span className="w-1 h-1 rounded-full bg-[#e9eff1]"></span>
                                                    <span className="text-[10px] font-medium text-[#94a3b8]">{doc.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 text-[#94a3b8] hover:text-[#0b2d49] hover:bg-[#f8fafc] rounded-lg transition-all">
                                            <ChevronDown size={18} className="-rotate-90" />
                                        </button>
                                    </div>
                                ))}
                             </div>

                             <div className="mt-12 p-10 border-2 border-dashed border-[#e9eff1] rounded-3xl flex flex-col items-center justify-center text-center bg-[#f8fafc]/50">
                                <div className="w-16 h-16 rounded-3xl bg-white border border-[#e9eff1] flex items-center justify-center shadow-lg mb-6">
                                    <RotateCcw className="text-[#94a3b8] animate-spin-slow" size={24} />
                                </div>
                                <h4 className="text-base font-bold text-[#0b2d49] mb-2">Sync with Manager Storage</h4>
                                <p className="text-xs text-[#708aa0] max-w-xs leading-relaxed font-medium">All documents uploaded by the manager and vendors are automatically synced and secured with end-to-end encryption.</p>
                             </div>
                        </div>
                    )}
                </div>

               {/* Right Column (4 cols) */}
               <div className="col-span-12 lg:col-span-4 space-y-6">
                   {selectedEventRequestType === 'PLANNING' && (
                       <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2d49] to-[#1a4b70] rounded-3xl p-6 text-white shadow-lg shadow-[#0b2d49]/20">
                           <div className="relative z-10">
                               <div className="flex items-center gap-2 mb-6">
                                   <TrendingUp className="text-[#d7a444]" size={24} />
                                   <h3 className="text-lg font-bold text-[#f3ddb1]">Budget History</h3>
                               </div>

                               <div className="space-y-4">
                                   <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                       <span className="text-sm font-medium text-[#708aa0]">Original</span>
                                       <span className="text-lg font-bold text-white">{formatInrRange(budgetSnapshot.originalRange)}</span>
                                   </div>
                                   <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                       <span className="text-sm font-medium text-[#708aa0]">Revised</span>
                                       <span className="text-lg font-bold text-white">{budgetSnapshot.revisedRange == null ? '—' : formatInrRange(budgetSnapshot.revisedRange)}</span>
                                   </div>
                                   <div className="flex justify-between items-end pt-2">
                                       <span className="text-sm font-medium text-[#d7a444] mb-1">Final Amount</span>
                                       <span className="text-3xl font-bold text-white">{formatInrRange(budgetSnapshot.revisedRange || budgetSnapshot.originalRange)}</span>
                                   </div>
                               </div>
                           </div>

                           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                           <div className="absolute top-10 right-10 w-20 h-20 bg-[#d7a444]/10 rounded-full blur-xl"></div>
                       </div>
                   )}

                   {/* Coordination Card */}
                   {currentStatus !== "REJECTED" && (
                       <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                           <div className="flex items-center gap-3 mb-6">
                               <Users className="text-[#d7a444]" size={24} />
                               <h3 className="text-lg font-bold text-[#0b2d49]">Coordination</h3>
                           </div>

                           <div className="mb-6">
                               <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-2">Assigned Manager</p>
                               {assignedManager ? (
                                   <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-xl border border-[#e9eff1] group relative">
                                       <div className="flex items-center gap-3">
                                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${assignedManager.color}`}>
                                               {assignedManager.initial}
                                           </div>
                                           <div className="flex flex-col">
                                               <span className="font-bold text-[#0b2d49]">{assignedManager.name}</span>
                                               <span className="text-[10px] text-[#708aa0] font-medium uppercase tracking-tight">Active Manager</span>
                                           </div>
                                       </div>
                                       
                                       <div className="relative">
                                           <button 
                                               onClick={() => setShowManagerOptions(!showManagerOptions)}
                                               className="p-2 text-[#708aa0] hover:text-[#0b2d49] hover:bg-white rounded-lg transition-all"
                                           >
                                               <MoreHorizontal size={18} />
                                           </button>

                                           {showManagerOptions && (
                                               <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e9eff1] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                                   <button 
                                                       onClick={() => {
                                                           setShowManagerOptions(false);
                                                           toast.dismiss();
                                                           toast("Opening chat...", { icon: '💬' });
                                                       }}
                                                       className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#5a5b44] hover:bg-[#f8fafc] hover:text-[#0b2d49] transition-colors flex items-center gap-2"
                                                   >
                                                       <MessageCircle size={16} className="text-sky-500" />
                                                       Chat with Manager
                                                   </button>
                                                   <button 
                                                       onClick={handleViewProfile}
                                                       className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#5a5b44] hover:bg-[#f8fafc] hover:text-[#0b2d49] transition-colors flex items-center gap-2"
                                                   >
                                                       <ExternalLink size={16} className="text-emerald-500" />
                                                       View Profile
                                                   </button>
                                                   <div className="border-t border-[#f0f2f5] my-1"></div>
                                                   <button 
                                                       onClick={handleRemoveManager}
                                                       className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                                   >
                                                       <UserMinus size={16} />
                                                       Remove Manager
                                                   </button>
                                               </div>
                                           )}
                                       </div>
                                   </div>
                               ) : (
                                   <div className="p-4 bg-[#f8fafc] rounded-xl border-2 border-dashed border-[#e9eff1] flex flex-col items-center justify-center gap-2 text-center">
                                       <User className="text-[#94a3b8]" size={24} />
                                       <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider">No Manager Assigned</p>
                                       <p className="text-[10px] text-[#94a3b8] px-4 leading-relaxed">
                                           {selectedEventRequestType === 'PLANNING'
                                               ? 'Use the "Assign Manager" button above to get started.'
                                               : 'Approve the event and use the "Assign Manager" button above to get started.'}
                                       </p>
                                   </div>
                               )}
                           </div>

                           <div>
                               <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-2">Vendor Status</p>
                               <div className="space-y-4">
                                    {eventVendorSelectionLoading ? (
                                        <div className="text-sm font-medium text-[#708aa0]">Loading vendor status…</div>
                                    ) : !selectedEventVendorSelection || !Array.isArray(selectedEventVendorSelection.vendors) ? (
                                        <div className="text-sm font-medium text-[#708aa0]">No vendor selection created yet.</div>
                                    ) : selectedEventVendorSelection.vendors.length === 0 ? (
                                        <div className="text-sm font-medium text-[#708aa0]">No vendor rows yet.</div>
                                    ) : (
                                        selectedEventVendorSelection.vendors.map((row, index) => {
                                            const vendorAuthId = row?.vendorAuthId != null ? String(row.vendorAuthId) : '';
                                            const vendorProfile = vendorAuthId ? vendorProfilesByAuthId.get(vendorAuthId) : null;
                                            const vendorName = vendorProfile?.businessName || vendorAuthId || 'Not selected';
                                            const status = String(row?.status || 'YET_TO_SELECT').toUpperCase();
                                            const isConfirmed = status === 'CONFIRMED';

                                            return (
                                                <div key={`${row?.service || 'service'}-${index}`} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {isConfirmed ? (
                                                            <div className="w-5 h-5 rounded-full bg-[#0b2d49] text-white flex items-center justify-center">
                                                                <CheckCircle size={12} />
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full bg-[#e9eff1] text-[#708aa0] flex items-center justify-center">
                                                                <MoreHorizontal size={12} />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium text-[#5a5b44]">
                                                            {vendorName}
                                                            {row?.service ? <span className="text-[#94a3b8]"> {`· ${row.service}`}</span> : null}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase ${
                                                        isConfirmed ? 'text-[#0b2d49]' : 'text-[#d7a444]'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                               </div>
                           </div>

                               {selectedEventRequestType === 'PLANNING' && (
                                   <div className="mt-5 pt-5 border-t border-[#e9eff1]">
                                       <p className="text-xs font-bold text-[#708aa0] uppercase tracking-wider mb-2">Available Vendors</p>
                                       <div className="space-y-3">
                                           {eventVendorAlternativesLoading ? (
                                               <div className="text-sm font-medium text-[#708aa0]">Loading available vendors…</div>
                                           ) : availableVendors.length === 0 ? (
                                               <div className="text-sm font-medium text-[#708aa0]">No available vendors found yet.</div>
                                           ) : (
                                               availableVendors.slice(0, 8).map((vendor, idx) => (
                                                   <div key={`${vendor.vendorAuthId}-${vendor.service}-${idx}`} className="flex items-center justify-between">
                                                       <div className="flex items-center gap-2">
                                                           <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                               <CheckCircle size={12} />
                                                           </div>
                                                           <span className="text-sm font-medium text-[#5a5b44]">
                                                               {vendor.businessName}
                                                               <span className="text-[#94a3b8]"> {`· ${vendor.service}`}</span>
                                                           </span>
                                                       </div>
                                                       <span className="text-[10px] font-bold uppercase text-[#28a785]">
                                                           {vendor.distanceText || 'AVAILABLE'}
                                                       </span>
                                                   </div>
                                               ))
                                           )}
                                       </div>
                                   </div>
                               )}
                       </div>
                   )}

                   {/* Comm Log */}
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#e9eff1]">
                       <div className="flex items-center gap-3 mb-6">
                           <MessageSquare className="text-[#d7a444]" size={24} />
                           <h3 className="text-lg font-bold text-[#0b2d49]">Comm. Log</h3>
                       </div>
                       
                       <div className="space-y-6 relative pl-2">
                           {/* Vertical Line */}
                           <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-[#e9eff1]"></div>
                           
                           {commLogs.length === 0 ? (
                               <div className="relative pl-6">
                                   <p className="text-sm font-medium text-[#708aa0]">No communication logs yet.</p>
                               </div>
                           ) : commLogs.map((log, index) => (
                               <div key={index} className="relative pl-6">
                                   {/* Dot */}
                                   <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${
                                       log.type === 'success' ? 'bg-[#0b2d49]' : 
                                       log.type === 'warning' ? 'bg-[#d7a444]' : 'bg-[#708aa0]'
                                   }`}></div>
                                   
                                   <p className="text-sm font-bold text-[#0b2d49] leading-tight mb-1">{log.title}</p>
                                   <div className="flex items-center gap-1.5 text-xs text-[#708aa0]">
                                       <span>{log.time}</span>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};

export default EventDetails;
