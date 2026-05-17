import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
	MdTrendingUp,
	MdChatBubbleOutline,
	MdGavel,
	MdSensors,
	MdCalendarMonth,
} from "react-icons/md";
import { ChevronRight, Clock, MoreHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../../utils/apiHandler";
import { refreshAccessToken, selectUser } from "../../../store/slices/authSlice";
import {
	fetchManagerPlanningApplications,
	fetchManagerPlanningEvents,
	fetchManagerPromoteEvents,
} from "../../../store/slices/managerEventsSlice";
import { fetchManagerPlanningRefundRequests } from "../../../store/slices/managerRefundsSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const PIE_COLORS = ["#14b8a6", "#f59e0b", "#f43f5e", "#6366f1", "#0ea5e9", "#22c55e"];
const REFUND_COLORS = {
	Planning: "#14b8a6",
	Promote: "#f59e0b",
	"User Ticket Cancellation": "#6366f1",
};
const MotionDiv = motion.div;

const safeJson = async (response) => {
	try {
		return await response.json();
	} catch {
		return null;
	}
};

const normalizeUpper = (value) => String(value || "").trim().toUpperCase().replace(/[_-]/g, " ");
const normalizeAssignedRole = (value) => String(value || "").trim().toUpperCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

const REVOPS_ASSIGNED_ROLES = new Set([
	"REVENUE OPERATIONS SPECIALIST",
	"REVENUE OPERATION SPECIALIST",
	"REVENUE OPERATIONS SPECIALISTS",
	"REVENUE OPERATION SPECIALISTS",
]);

const REFUND_DONE_STATUSES = new Set(["REFUNDED", "REJECTED", "CANCELLED", "CANCELED", "COMPLETED", "COMPLETE", "CLOSED"]);
const PLANNING_REFUND_ACTION_STATUSES = new Set(["PENDING REVIEW", "PENDING_REVIEW", "APPROVED", "PROCESSING"]);

const toDateOrNull = (value) => {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const CANCELLED_STATUSES = new Set([
	"CANCELLED",
	"CANCELED",
	"REFUNDED",
	"COMPLETED",
	"COMPLETE",
	"CLOSED",
]);

const isCancelledStatus = (value) => CANCELLED_STATUSES.has(normalizeUpper(value));

const isCancelledEvent = (event) => isCancelledStatus(event?.status);

const isSameDay = (a, b) => {
	if (!a || !b) return false;
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
};

const getDayBounds = (value) => {
	const date = toDateOrNull(value) || new Date();
	const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
	const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
	return { start, end };
};

const isWithin = (dateValue, start, end) => {
	const date = toDateOrNull(dateValue);
	if (!date || !start || !end) return false;
	const ts = date.getTime();
	return ts >= start.getTime() && ts <= end.getTime();
};

const formatInrFromPaise = (value) => {
	const n = Number(value || 0);
	if (!Number.isFinite(n) || n === 0) return "INR 0";
	const amount = Math.round(Math.abs(n) / 100).toLocaleString("en-IN");
	return `${n < 0 ? "-" : ""}INR ${amount}`;
};

const formatInrValue = (value) => {
	const n = Number(value || 0);
	if (!Number.isFinite(n) || n === 0) return "INR 0";
	const amount = Math.round(Math.abs(n)).toLocaleString("en-IN");
	return `${n < 0 ? "-" : ""}INR ${amount}`;
};

const humanizeStatus = (value) => {
	const normalized = normalizeUpper(value);
	if (!normalized) return "Pending";
	return normalized
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
};

const getRefundRequestedAt = (request) => (
	request?.refundRequest?.requestedAt
	|| request?.requestedAt
	|| request?.refundRequestedAt
	|| request?.updatedAt
	|| request?.createdAt
);

const getRefundStatus = (request) => request?.refundRequest?.status || request?.refundStatus || request?.status;

const isRefundDone = (request) => REFUND_DONE_STATUSES.has(normalizeUpper(getRefundStatus(request)));

const isPlanningRefundNeedsAction = (request) => {
	if (normalizeUpper(request?.refundEventType) !== "PLANNING") return false;
	const status = normalizeUpper(getRefundStatus(request));
	if (!status) return true;
	if (REFUND_DONE_STATUSES.has(status)) return false;
	return PLANNING_REFUND_ACTION_STATUSES.has(status) || !REFUND_DONE_STATUSES.has(status);
};

const getRefundTitle = (request) => (
	String(request?.eventTitle || request?.title || request?.eventName || request?.eventId || "Refund request").trim()
	|| "Refund request"
);

const getRefundAmountPaise = (request) => {
	const amount =
		request?.refundRequest?.amountPaise
		?? request?.refundRequest?.refundAmountPaise
		?? request?.refundRequest?.result?.refundAmountPaise
		?? request?.refundRequest?.result?.userRefundAmountPaise
		?? request?.refundAmountPaise
		?? request?.amountPaise
		?? 0;
	const n = Number(amount || 0);
	return Number.isFinite(n) ? n : 0;
};

const getLedgerRefundCategory = (row) => {
	if (normalizeUpper(row?.status) !== "REFUNDED") return null;

	const type = normalizeUpper(row?.type);
	if (type === "PLANNING REFUND" || type === "PLANNING_REFUND") return "Planning";
	if (type === "REFUND" || type === "TICKET SALE") return "User Ticket Cancellation";
	return "User Ticket Cancellation";
};

const isRefundedLedgerRow = (row) => Boolean(getLedgerRefundCategory(row));

const formatMoney = (value) => {
	const n = Number(value || 0);
	if (!Number.isFinite(n) || n <= 0) return "₹0";
	return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

const toDisplayTitle = (event) => String(event?.eventTitle || "Event").trim() || "Event";

const toDisplayLocation = (event, type) => {
	if (type === "promote") {
		return String(event?.venue?.locationName || "—").trim() || "—";
	}
	return String(event?.location?.name || "—").trim() || "—";
};

const toEventCategory = (event, type) => {
	if (type === "promote") {
		const category = String(event?.eventCategory || "").trim();
		if (normalizeUpper(category) === "OTHER") {
			return String(event?.customCategory || "Other").trim() || "Other";
		}
		return category || "Other";
	}

	const eventType = String(event?.eventType || "").trim();
	if (normalizeUpper(eventType) === "OTHER") {
		return String(event?.customEventType || "Other").trim() || "Other";
	}
	return eventType || String(event?.category || "Other").trim() || "Other";
};

const getEventStartAt = (event, type) => {
	if (type === "promote") {
		return toDateOrNull(event?.schedule?.startAt || event?.createdAt);
	}
	return toDateOrNull(event?.schedule?.startAt || event?.eventDate || event?.createdAt);
};

const getEventEndAt = (event, type) => {
	if (type === "promote") {
		return toDateOrNull(event?.schedule?.endAt || event?.schedule?.startAt || event?.createdAt);
	}
	return toDateOrNull(event?.schedule?.endAt || event?.schedule?.startAt || event?.eventDate || event?.createdAt);
};

const toRelativeTime = (value, now) => {
	const date = toDateOrNull(value);
	if (!date) return "just now";

	const diffMs = Math.max(0, now.getTime() - date.getTime());
	const mins = Math.floor(diffMs / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins} min ago`;

	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours} hr ago`;

	const days = Math.floor(hours / 24);
	return `${days} day${days > 1 ? "s" : ""} ago`;
};

const getDayStart = (value) => {
	const d = toDateOrNull(value);
	if (!d) return null;
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const isDayWithinEventRange = (day, event) => {
	const dayStart = getDayStart(day);
	const startDay = getDayStart(event?.startAt);
	if (!dayStart || !startDay) return false;

	const endCandidate = toDateOrNull(event?.endAt);
	const endDay = endCandidate && endCandidate.getTime() >= startDay.getTime()
		? getDayStart(endCandidate)
		: startDay;

	if (!endDay) return false;
	return dayStart.getTime() >= startDay.getTime() && dayStart.getTime() <= endDay.getTime();
};

const formatDateTimeShort = (value) => {
	const d = toDateOrNull(value);
	if (!d) return "—";
	return d.toLocaleString("en-IN", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

const getInitials = (name) => {
	const clean = String(name || "").trim();
	if (!clean) return "MG";
	const parts = clean.split(/\s+/).filter(Boolean);
	const first = parts[0]?.[0] || "M";
	const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || "") : "";
	return `${first}${last}`.toUpperCase();
};

const getPlanningPaidAmountInr = (event) => {
	const deposit = Number(event?.depositPaidAmountPaise || 0) / 100;
	const vendorConfirmation = Number(event?.vendorConfirmationPaidAmountPaise || 0) / 100;
	const remaining = Number(event?.remainingPaymentPaidAmountPaise || 0) / 100;
	const platformFee = event?.platformFeePaid ? Number(event?.platformFee || 0) : 0;
	const total = deposit + vendorConfirmation + remaining + platformFee;
	return Number.isFinite(total) ? Math.max(0, total) : 0;
};

const getPromotePaidAmountInr = (event) => {
	const ticketRevenue = Number(event?.ticketAnalytics?.grossRevenueInr || 0);
	const fallbackTotal = Number(event?.totalAmount || 0);
	const amount = ticketRevenue > 0 ? ticketRevenue : fallbackTotal;
	return Number.isFinite(amount) ? Math.max(0, amount) : 0;
};

const isLiveNow = (item, now) => {
	if (!item?.startAt) return false;

	if (item?.endAt) {
		return now.getTime() >= item.startAt.getTime() && now.getTime() <= item.endAt.getTime();
	}

	return isSameDay(item.startAt, now);
};

const getUpcomingEventStatusChip = (event, now) => {
	const status = normalizeUpper(event?.status);

	if (status === "LIVE" || isLiveNow(event, now)) {
		return {
			label: "Live",
			className: "bg-emerald-50 text-emerald-700 border-emerald-200",
		};
	}

	if (status === "CONFIRMED" || status === "APPROVED") {
		return {
			label: "Confirmed",
			className: "bg-amber-50 text-amber-700 border-amber-200",
		};
	}

	return {
		label: "Planning",
		className: "bg-sky-50 text-sky-700 border-sky-200",
	};
};

const ManagerHomePage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector(selectUser);
	const { planningEvents, promoteEvents, loading, error } = useSelector((state) => state.managerEvents);
	const {
		requests: refundRequests = [],
		loading: refundLoading,
		error: refundError,
	} = useSelector((state) => state.managerRefunds || {});

	const [currentTime, setCurrentTime] = useState(new Date());
	const [calendarCursor, setCalendarCursor] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});
	const [vendorSelectionsByEventId, setVendorSelectionsByEventId] = useState({});
	const [vendorSelectionLoading, setVendorSelectionLoading] = useState(false);
	const [revopsLedgerRows, setRevopsLedgerRows] = useState([]);
	const [revopsLedgerLoading, setRevopsLedgerLoading] = useState(false);
	const [revopsLedgerError, setRevopsLedgerError] = useState("");

	const isRevenueOperationsSpecialist = REVOPS_ASSIGNED_ROLES.has(normalizeAssignedRole(user?.assignedRole || user?.roleTitle || user?.role));

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 30000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!isRevenueOperationsSpecialist) return undefined;

		const POLL_MS = 30000;
		const poll = () => {
			dispatch(fetchManagerPlanningRefundRequests({ limit: 250 }));
		};

		poll();
		const intervalId = setInterval(poll, POLL_MS);
		return () => clearInterval(intervalId);
	}, [dispatch, isRevenueOperationsSpecialist]);

	useEffect(() => {
		if (!isRevenueOperationsSpecialist) return undefined;

		let cancelled = false;
		const POLL_MS = 30000;

		const loadLedgerRows = async () => {
			const now = new Date();
			const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
			const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
			const rows = [];
			let page = 1;
			let totalPages = 1;

			setRevopsLedgerLoading(true);
			setRevopsLedgerError("");

			try {
				while (page <= totalPages && page <= 20) {
					const params = new URLSearchParams({
						page: String(page),
						limit: "100",
						from: from.toISOString(),
						to: to.toISOString(),
						sortBy: "createdAt",
						sortDir: "asc",
					});

					// eslint-disable-next-line no-await-in-loop
					const response = await fetchWithAuth(
						`${API_BASE_URL}/api/orders/admin/ledger?${params.toString()}`,
						{ method: "GET" },
						{ dispatch, refreshAction: refreshAccessToken }
					);
					// eslint-disable-next-line no-await-in-loop
					const json = await safeJson(response);

					if (!response.ok) {
						throw new Error(json?.message || "Failed to fetch ledger transactions");
					}

					const pageRows = Array.isArray(json?.transactions)
						? json.transactions
						: Array.isArray(json?.data?.transactions)
							? json.data.transactions
							: [];

					rows.push(...pageRows);
					totalPages = Math.max(1, Number(json?.pagination?.totalPages || json?.data?.pagination?.totalPages || totalPages));
					if (pageRows.length === 0) break;
					page += 1;
				}

				if (!cancelled) {
					setRevopsLedgerRows(rows);
					setRevopsLedgerLoading(false);
				}
			} catch (err) {
				if (!cancelled) {
					setRevopsLedgerError(err?.message || "Failed to fetch ledger transactions");
					setRevopsLedgerLoading(false);
				}
			}
		};

		loadLedgerRows();
		const intervalId = setInterval(loadLedgerRows, POLL_MS);
		return () => {
			cancelled = true;
			clearInterval(intervalId);
		};
	}, [dispatch, isRevenueOperationsSpecialist]);

	useEffect(() => {
		if (isRevenueOperationsSpecialist) return undefined;

		const POLL_MS = 30000;

		const poll = () => {
			dispatch(fetchManagerPlanningEvents({ limit: 200 }));
			dispatch(fetchManagerPromoteEvents({ limit: 200 }));
			dispatch(fetchManagerPlanningApplications({ limit: 200 }));
		};

		poll();
		const intervalId = setInterval(poll, POLL_MS);
		return () => clearInterval(intervalId);
	}, [dispatch, isRevenueOperationsSpecialist]);

	const planningEventIds = useMemo(() => {
		return Array.from(new Set(
			(planningEvents || [])
				.map((event) => String(event?.eventId || "").trim())
				.filter(Boolean)
		));
	}, [planningEvents]);

	useEffect(() => {
		if (isRevenueOperationsSpecialist || !planningEventIds.length) {
			return undefined;
		}

		let cancelled = false;

		const fetchVendorSelections = async () => {
			setVendorSelectionLoading(true);
			const results = await Promise.allSettled(
				planningEventIds.map(async (eventId) => {
					const response = await fetchWithAuth(
						`${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(eventId)}?includeVendors=true`,
						{ method: "GET" },
						{ dispatch, refreshAction: refreshAccessToken }
					);

					const json = await safeJson(response);
					if (!response.ok || !json?.success) return [eventId, null];
					return [eventId, json.data || null];
				})
			);

			if (cancelled) return;

			const nextMap = {};
			results.forEach((result) => {
				if (result.status !== "fulfilled") return;
				const [eventId, selection] = result.value || [];
				if (!eventId || !selection) return;
				nextMap[eventId] = selection;
			});

			setVendorSelectionsByEventId(nextMap);
			setVendorSelectionLoading(false);
		};

		fetchVendorSelections();

		return () => {
			cancelled = true;
		};
	}, [planningEventIds, dispatch, isRevenueOperationsSpecialist]);

	const managerName = String(user?.name || user?.fullName || "Manager").trim() || "Manager";
	const managerInitials = getInitials(managerName);

	const formattedDate = currentTime.toLocaleDateString("en-IN", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	const formattedTime = currentTime.toLocaleTimeString("en-IN", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const combinedEvents = useMemo(() => {
		const planning = (planningEvents || []).map((event) => {
			const startAt = getEventStartAt(event, "planning");
			const endAt = getEventEndAt(event, "planning");
			return {
				id: String(event?.eventId || "").trim(),
				type: "planning",
				title: toDisplayTitle(event),
				status: String(event?.status || "").trim(),
				category: toEventCategory(event, "planning"),
				location: toDisplayLocation(event, "planning"),
				startAt,
				endAt,
				createdAt: toDateOrNull(event?.createdAt),
				paidAmountInr: getPlanningPaidAmountInr(event),
				raw: event,
			};
		});

		const promote = (promoteEvents || []).map((event) => {
			const startAt = getEventStartAt(event, "promote");
			const endAt = getEventEndAt(event, "promote");
			return {
				id: String(event?.eventId || "").trim(),
				type: "promote",
				title: toDisplayTitle(event),
				status: String(event?.eventStatus || event?.status || "").trim(),
				category: toEventCategory(event, "promote"),
				location: toDisplayLocation(event, "promote"),
				startAt,
				endAt,
				createdAt: toDateOrNull(event?.createdAt),
				paidAmountInr: getPromotePaidAmountInr(event),
				ticketSold: Number(event?.ticketAnalytics?.ticketsSold || 0),
				raw: event,
			};
		});

		return [...planning, ...promote]
			.filter((event) => event.id)
			.sort((a, b) => {
				const at = a.createdAt?.getTime() || 0;
				const bt = b.createdAt?.getTime() || 0;
				return bt - at;
			});
	}, [planningEvents, promoteEvents]);

	const nowMs = currentTime.getTime();

	const newRequestsCount = useMemo(() => {
		const cutoffMs = nowMs - (24 * 60 * 60 * 1000);
		return combinedEvents.filter((event) => {
			const createdAtMs = event.createdAt?.getTime() || 0;
			return createdAtMs >= cutoffMs;
		}).length;
	}, [combinedEvents, nowMs]);

	const userDecisionCount = useMemo(() => {
		const targetStatuses = new Set(["IMMEDIATE ACTION", "PENDING APPROVAL"]);
		return (planningEvents || []).filter((event) => {
			const status = normalizeUpper(event?.status);
			return targetStatuses.has(status);
		}).length;
	}, [planningEvents]);

	const vendorRepliesCount = useMemo(() => {
		const pendingTokens = new Set(["YET TO ACCEPT", "YET TO SELECT"]);

		return (planningEvents || []).reduce((count, event) => {
			const eventId = String(event?.eventId || "").trim();
			if (!eventId) return count;

			const selection = vendorSelectionsByEventId[eventId];
			const vendors = Array.isArray(selection?.vendors) ? selection.vendors : [];
			const hasPending = vendors.some((row) => pendingTokens.has(normalizeUpper(row?.status)));

			return hasPending ? count + 1 : count;
		}, 0);
	}, [planningEvents, vendorSelectionsByEventId]);

	const todaysLiveCount = useMemo(() => {
		return combinedEvents.filter((event) => isLiveNow(event, currentTime)).length;
	}, [combinedEvents, currentTime]);

	const todaysEvents = useMemo(() => {
		return combinedEvents
			.filter((event) => !isCancelledEvent(event))
			.filter((event) => isDayWithinEventRange(currentTime, event))
			.sort((a, b) => {
				const at = a.startAt?.getTime() || 0;
				const bt = b.startAt?.getTime() || 0;
				return at - bt;
			});
	}, [combinedEvents, currentTime]);

	const upcomingEvents = useMemo(() => {
		return combinedEvents
			.filter((event) => !isCancelledEvent(event))
			.filter((event) => {
				const startMs = event?.startAt?.getTime?.() || 0;
				return startMs > nowMs;
			})
			.sort((a, b) => {
				const at = a.startAt?.getTime() || 0;
				const bt = b.startAt?.getTime() || 0;
				return at - bt;
			})
			.slice(0, 4);
	}, [combinedEvents, nowMs]);

	const eventDistributionData = useMemo(() => {
		const byCategory = combinedEvents.reduce((acc, event) => {
			const key = String(event?.category || "Other").trim() || "Other";
			acc[key] = (acc[key] || 0) + 1;
			return acc;
		}, {});

		return Object.entries(byCategory)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value)
			.slice(0, 6);
	}, [combinedEvents]);

	const revenueChartData = useMemo(() => {
		const dayBuckets = [];
		const dayKeyToRevenue = new Map();

		for (let i = 6; i >= 0; i -= 1) {
			const date = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - i);
			const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
			dayBuckets.push({
				key,
				name: date.toLocaleDateString("en-IN", { weekday: "short" }),
				date,
			});
			dayKeyToRevenue.set(key, 0);
		}

		const addRevenue = (dateValue, amount) => {
			const date = toDateOrNull(dateValue);
			const n = Number(amount || 0);
			if (!date || !Number.isFinite(n) || n <= 0) return;
			const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
			if (!dayKeyToRevenue.has(key)) return;
			dayKeyToRevenue.set(key, Number(dayKeyToRevenue.get(key) || 0) + n);
		};

		(planningEvents || []).forEach((event) => {
			addRevenue(event?.depositPaidAt, Number(event?.depositPaidAmountPaise || 0) / 100);
			addRevenue(event?.vendorConfirmationPaidAt, Number(event?.vendorConfirmationPaidAmountPaise || 0) / 100);
			addRevenue(event?.remainingPaymentPaidAt, Number(event?.remainingPaymentPaidAmountPaise || 0) / 100);

			if (event?.platformFeePaid) {
				addRevenue(event?.createdAt, Number(event?.platformFee || 0));
			}
		});

		(promoteEvents || []).forEach((event) => {
			const amount = getPromotePaidAmountInr(event);
			const paidAt = event?.schedule?.startAt || event?.createdAt;
			addRevenue(paidAt, amount);
		});

		return dayBuckets.map((bucket) => ({
			name: bucket.name,
			revenue: Number((dayKeyToRevenue.get(bucket.key) || 0).toFixed(2)),
		}));
	}, [planningEvents, promoteEvents, currentTime]);

	const hasRevenueTimeline = useMemo(() => {
		return revenueChartData.some((row) => Number(row?.revenue || 0) > 0);
	}, [revenueChartData]);

	const calendarEventCountByDay = useMemo(() => {
		const year = calendarCursor.getFullYear();
		const month = calendarCursor.getMonth();
		const map = {};

		combinedEvents.forEach((event) => {
			if (isCancelledEvent(event)) return;
			const startDay = getDayStart(event?.startAt);
			if (!startDay) return;

			const endCandidate = toDateOrNull(event?.endAt);
			const endDay = endCandidate && endCandidate.getTime() >= startDay.getTime()
				? getDayStart(endCandidate)
				: startDay;

			if (!endDay) return;

			const cursor = new Date(startDay);
			while (cursor.getTime() <= endDay.getTime()) {
				if (cursor.getFullYear() === year && cursor.getMonth() === month) {
					const day = cursor.getDate();
					map[day] = (map[day] || 0) + 1;
				}
				cursor.setDate(cursor.getDate() + 1);
			}
		});

		return map;
	}, [combinedEvents, calendarCursor]);

	const recentActivities = useMemo(() => {
		const activities = [];

		combinedEvents.forEach((event) => {
			if (event?.createdAt) {
				activities.push({
					id: `assigned-${event.id}`,
					timestamp: event.createdAt,
					message: `You were assigned to event ${event.title}`,
				});
			}

			if (event.type === "promote") {
				const sold = Number(event?.ticketSold || 0);
				if (sold > 0) {
					activities.push({
						id: `tickets-${event.id}`,
						timestamp: event.startAt || event.createdAt,
						message: `Users bought ${sold} ticket${sold > 1 ? "s" : ""} for ${event.title}`,
					});
				}
				return;
			}

			const raw = event.raw || {};
			const deposit = Number(raw?.depositPaidAmountPaise || 0) / 100;
			if (raw?.depositPaid && deposit > 0) {
				activities.push({
					id: `deposit-${event.id}`,
					timestamp: toDateOrNull(raw?.depositPaidAt) || event.createdAt,
					message: `Client paid deposit ${formatMoney(deposit)} for ${event.title}`,
				});
			}

			const remaining = Number(raw?.remainingPaymentPaidAmountPaise || 0) / 100;
			if (raw?.remainingPaymentPaid && remaining > 0) {
				activities.push({
					id: `remaining-${event.id}`,
					timestamp: toDateOrNull(raw?.remainingPaymentPaidAt) || event.createdAt,
					message: `Client paid remaining ${formatMoney(remaining)} for ${event.title}`,
				});
			}
		});

		return activities
			.filter((row) => row.timestamp)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			.slice(0, 4);
	}, [combinedEvents]);

	const todayBounds = useMemo(() => getDayBounds(currentTime), [currentTime]);

	const revopsRefundRequestRows = useMemo(() => {
		return (refundRequests || []).map((request, index) => {
			const type = normalizeUpper(request?.refundEventType) === "PROMOTE" ? "Promote" : "Planning";
			const requestedAt = getRefundRequestedAt(request);
			const needsAction = type === "Planning" && isPlanningRefundNeedsAction(request);
			const done = isRefundDone(request);

			return {
				id: String(request?.eventId || request?._id || request?.id || `${type}-${requestedAt || index}`).trim(),
				eventId: String(request?.eventId || "").trim(),
				type,
				title: getRefundTitle(request),
				status: humanizeStatus(getRefundStatus(request)),
				requestedAt,
				amountPaise: getRefundAmountPaise(request),
				needsAction,
				done,
				autoProcessed: type === "Promote",
			};
		});
	}, [refundRequests]);

	const revopsLedgerRefundRows = useMemo(() => {
		return (revopsLedgerRows || [])
			.filter(isRefundedLedgerRow)
			.map((row) => {
				const category = getLedgerRefundCategory(row) || "User Ticket Cancellation";
				return {
					id: String(row?.transactionId || row?.eventId || row?.createdAt || "ticket-refund").trim(),
					eventId: String(row?.eventId || "").trim(),
					type: category,
					title: String(row?.eventId ? `${category} - ${row.eventId}` : row?.transactionId || category).trim() || category,
					status: humanizeStatus(row?.status),
					requestedAt: row?.refundedAt || row?.createdAt,
					amountPaise: Math.abs(Number(row?.amount || 0)),
					needsAction: false,
					done: true,
					autoProcessed: category !== "Planning",
					source: "ledger",
				};
			});
	}, [revopsLedgerRows]);

	const revopsAllRequestRows = useMemo(() => {
		const ledgerCompletedKeys = new Set(
			revopsLedgerRefundRows
				.map((row) => (row.eventId ? `${row.type}:${row.eventId}` : ""))
				.filter(Boolean)
		);
		const requestRows = revopsRefundRequestRows.filter((row) => {
			if (!row.done || !row.eventId) return true;
			return !ledgerCompletedKeys.has(`${row.type}:${row.eventId}`);
		});

		return [...requestRows, ...revopsLedgerRefundRows]
			.sort((a, b) => {
				const at = toDateOrNull(a?.requestedAt)?.getTime() || 0;
				const bt = toDateOrNull(b?.requestedAt)?.getTime() || 0;
				return bt - at;
			});
	}, [revopsRefundRequestRows, revopsLedgerRefundRows]);

	const revopsTodayRequestRows = useMemo(() => (
		revopsAllRequestRows.filter((row) => isWithin(row?.requestedAt, todayBounds.start, todayBounds.end))
	), [revopsAllRequestRows, todayBounds]);

	const revopsPlanningNeedsActionCount = useMemo(() => (
		revopsRefundRequestRows.filter((row) => row.type === "Planning" && row.needsAction).length
	), [revopsRefundRequestRows]);

	const revopsAutoProcessedTodayCount = useMemo(() => (
		revopsTodayRequestRows.filter((row) => row.autoProcessed).length
	), [revopsTodayRequestRows]);

	const revopsCompletedTodayCount = useMemo(() => (
		revopsTodayRequestRows.filter((row) => row.done || row.autoProcessed).length
	), [revopsTodayRequestRows]);

	const revopsRevenueChartData = useMemo(() => {
		const buckets = [];
		const revenueByDay = new Map();

		const keyForDate = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

		for (let i = 29; i >= 0; i -= 1) {
			const date = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - i);
			const key = keyForDate(date);
			buckets.push({
				key,
				name: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
			});
			revenueByDay.set(key, 0);
		}

		(revopsLedgerRows || []).forEach((row) => {
			const date = toDateOrNull(row?.paidAt || row?.createdAt);
			if (!date) return;
			const key = keyForDate(date);
			if (!revenueByDay.has(key)) return;
			revenueByDay.set(key, Number(revenueByDay.get(key) || 0) + Number(row?.amount || 0));
		});

		return buckets.map((bucket) => ({
			name: bucket.name,
			revenue: Number(((revenueByDay.get(bucket.key) || 0) / 100).toFixed(2)),
		}));
	}, [currentTime, revopsLedgerRows]);

	const hasRevopsRevenueTimeline = useMemo(() => (
		revopsRevenueChartData.some((row) => Number(row?.revenue || 0) !== 0)
	), [revopsRevenueChartData]);

	const revopsRefundBreakdownData = useMemo(() => {
		const breakdown = new Map([
			["Planning", { name: "Planning", value: 0, amountPaise: 0 }],
			["Promote", { name: "Promote", value: 0, amountPaise: 0 }],
			["User Ticket Cancellation", { name: "User Ticket Cancellation", value: 0, amountPaise: 0 }],
		]);

		revopsAllRequestRows.forEach((row) => {
			const current = breakdown.get(row.type);
			if (!current) return;
			current.value += 1;
			current.amountPaise += Math.abs(Number(row?.amountPaise || 0));
		});

		return Array.from(breakdown.values()).filter((row) => row.value > 0);
	}, [revopsAllRequestRows]);

	const revopsStatsData = [
		{
			id: "revops-new-requests",
			label: "New Requests",
			value: String(revopsTodayRequestRows.length),
			subtext: "Today refund and cancellation requests",
			subtextColor: "text-emerald-500",
			topIcon: (
				<div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
					<div className="w-5 h-5 border-2 border-current rounded-sm" />
				</div>
			),
			subtextIcon: <MdTrendingUp />,
		},
		{
			id: "revops-auto-processed",
			label: "Auto Processed",
			value: String(revopsAutoProcessedTodayCount),
			subtext: "Promote and ticket cancellation",
			subtextColor: "text-blue-500",
			topIcon: (
				<div className="p-2 rounded-lg bg-blue-50 text-blue-600">
					<MdSensors className="text-xl" />
				</div>
			),
		},
		{
			id: "revops-need-action",
			label: "Today's Live",
			value: String(revopsPlanningNeedsActionCount),
			subtext: "Planning refunds need confirmation",
			subtextColor: "text-amber-500",
			topIcon: (
				<div className="p-2 rounded-lg bg-amber-50 text-amber-600">
					<MdGavel className="text-xl" />
				</div>
			),
		},
		{
			id: "revops-completed",
			label: "Done / Completed",
			value: String(revopsCompletedTodayCount),
			subtext: "Completed today",
			subtextColor: "text-green-500",
			topIcon: (
				<div className="p-2 rounded-lg bg-green-50 text-green-600">
					<MdChatBubbleOutline className="text-xl" />
				</div>
			),
		},
	];

	const statsData = [
		{
			id: "new-requests",
			label: "New Requests",
			value: String(newRequestsCount),
			subtext: "Assigned in last 24 hrs",
			subtextColor: "text-emerald-500",
			topIcon: (
				<div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
					<div className="w-5 h-5 border-2 border-current rounded-sm" />
				</div>
			),
			subtextIcon: <MdTrendingUp />,
		},
		{
			id: "vendor-replies",
			label: "Vendor Replies",
			value: String(vendorRepliesCount),
			subtext: vendorSelectionLoading ? "Syncing vendor statuses..." : "Vendor status yet_to_accept",
			subtextColor: "text-gray-500",
			topIcon: (
				<div className="p-2 rounded-lg bg-blue-50 text-blue-600">
					<MdChatBubbleOutline className="text-xl" />
				</div>
			),
		},
		{
			id: "user-decisions",
			label: "User Decisions",
			value: String(userDecisionCount),
			subtext: "Immediate_Action + Pending_Approval",
			subtextColor: "text-amber-500",
			topIcon: (
				<div className="p-2 rounded-lg bg-amber-50 text-amber-600">
					<MdGavel className="text-xl" />
				</div>
			),
		},
		{
			id: "todays-live",
			label: "Today's Live",
			value: String(todaysLiveCount),
			subtext: "Requested timeline is live now",
			subtextColor: "text-green-500",
			topIcon: (
				<div className="p-2 rounded-lg bg-green-50 text-green-600">
					<MdSensors className="text-xl" />
				</div>
			),
		},
	];

	const frontendBaseUrl = String(import.meta.env.VITE_FRONTEND_URL || window.location.origin || "")
		.trim()
		.replace(/\/$/, "");

	const handleManageEvent = (eventId) => {
		const trimmedEventId = String(eventId || "").trim();
		if (!trimmedEventId) return;

		if (frontendBaseUrl) {
			window.location.assign(`${frontendBaseUrl}/manager/event/${encodeURIComponent(trimmedEventId)}`);
			return;
		}

		navigate(`/manager/event/${encodeURIComponent(trimmedEventId)}`);
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.08 },
		},
	};

	if (isRevenueOperationsSpecialist) {
		return (
			<div className="px-6 py-8 space-y-8 max-w-480 mx-auto min-h-screen">
				<MotionDiv
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="flex flex-col sm:flex-row sm:items-center justify-between"
				>
					<div>
						<h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h2>
						<p className="text-gray-500 font-medium mt-1">{formattedDate} - {formattedTime}</p>
					</div>

					<div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm mt-4 sm:mt-0">
						<div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
							{managerInitials}
						</div>
						<span className="text-sm font-bold text-gray-700">{managerName}</span>
					</div>
				</MotionDiv>

				{(refundError || revopsLedgerError) && (
					<div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
						{String(refundError || revopsLedgerError)}
					</div>
				)}

				<MotionDiv
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
				>
					{revopsStatsData.map((stat) => (
						<MotionDiv
							key={stat.id}
							variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
							whileHover={{ y: -4 }}
							className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group"
						>
							<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
								{stat.topIcon}
							</div>
							<div className="flex justify-between items-start z-10">
								<span className="text-gray-500 text-xs font-bold uppercase tracking-wide">{stat.label}</span>
								{stat.topIcon}
							</div>
							<div className="z-10 mt-auto">
								<h3 className="text-3xl font-extrabold text-gray-800 tracking-tight">{stat.value}</h3>
								<div className={`flex items-center gap-1.5 text-xs mt-1 font-medium ${stat.subtextColor}`}>
									{stat.subtextIcon && <span className="text-sm">{stat.subtextIcon}</span>}
									<span>{stat.subtext}</span>
								</div>
							</div>
						</MotionDiv>
					))}
				</MotionDiv>

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
					<div className="xl:col-span-2 space-y-8">
						<MotionDiv
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
						>
							<div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/60">
								<h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
									<MdCalendarMonth className="text-teal-500" /> Today&apos;s Requests
								</h3>
								<span className="bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full">
									{revopsTodayRequestRows.length} total
								</span>
							</div>

							<div className="divide-y divide-gray-50">
								{revopsTodayRequestRows.length === 0 && (
									<div className="p-6 text-sm text-gray-500">No refund or cancellation requests for today.</div>
								)}

								{revopsTodayRequestRows.map((row) => {
									const stateLabel = row.needsAction
										? "Need to be done"
										: row.autoProcessed
											? "Automatically processed"
											: "Done / Completed";
									const stateClass = row.needsAction
										? "bg-amber-50 text-amber-700"
										: row.autoProcessed
											? "bg-blue-50 text-blue-700"
											: "bg-emerald-50 text-emerald-700";

									return (
										<div key={`${row.type}-${row.id}`} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
											<div className="min-w-0 space-y-1">
												<div className="flex flex-wrap items-center gap-2">
													<p className="font-bold text-gray-800 text-sm truncate">{row.title}</p>
													<span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-600 uppercase">
														{row.type}
													</span>
													<span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${stateClass}`}>
														{stateLabel}
													</span>
												</div>
												<p className="text-xs text-gray-500">
													{formatDateTimeShort(row.requestedAt)} - {row.status}
												</p>
											</div>

											<div className="shrink-0 text-right">
												<p className="text-sm font-extrabold text-gray-900">{formatInrFromPaise(row.amountPaise)}</p>
												<p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">View only</p>
											</div>
										</div>
									);
								})}
							</div>
						</MotionDiv>

						<MotionDiv
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.16 }}
							className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
						>
							<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-6">
								<div>
									<h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
									<p className="text-sm text-gray-500">Daily financial performance for last 30 days</p>
								</div>
								<span className="self-start px-3 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-700">
									Last 30 Days
								</span>
							</div>

							<div className="h-85 w-full">
								{hasRevopsRevenueTimeline ? (
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={revopsRevenueChartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
											<defs>
												<linearGradient id="revopsRevenueGradient" x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor="#d99a2b" stopOpacity={0.18} />
													<stop offset="95%" stopColor="#d99a2b" stopOpacity={0} />
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5edf2" />
											<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b87a0", fontSize: 11 }} minTickGap={22} />
											<YAxis
												axisLine={false}
												tickLine={false}
												tick={{ fill: "#6b87a0", fontSize: 11 }}
												tickFormatter={(value) => formatInrValue(value).replace("INR ", "")}
											/>
											<Tooltip
												formatter={(value) => [formatInrValue(value), "Revenue"]}
												contentStyle={{
													borderRadius: "12px",
													border: "none",
													boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
												}}
											/>
											<Area type="monotone" dataKey="revenue" stroke="#d99a2b" strokeWidth={3} fillOpacity={1} fill="url(#revopsRevenueGradient)" />
										</AreaChart>
									</ResponsiveContainer>
								) : (
									<div className="h-full flex items-center justify-center text-sm text-gray-500">
										No revenue analytics data yet.
									</div>
								)}
							</div>
						</MotionDiv>

						<MotionDiv
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
						>
							<h3 className="text-lg font-bold text-gray-900 mb-1">Refund Analysis</h3>
							<p className="text-sm text-gray-500 mb-5">Breakdown by planning, promote, and user ticket cancellation refunds.</p>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
								<div className="h-72 w-full relative">
									{revopsRefundBreakdownData.length > 0 ? (
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={revopsRefundBreakdownData}
													cx="50%"
													cy="50%"
													innerRadius={66}
													outerRadius={96}
													paddingAngle={4}
													dataKey="value"
													isAnimationActive={false}
												>
													{revopsRefundBreakdownData.map((entry) => (
														<Cell key={`refund-${entry.name}`} fill={REFUND_COLORS[entry.name] || "#94a3b8"} />
													))}
												</Pie>
												<Tooltip
													formatter={(value, name, item) => [
														`${value} request${Number(value) === 1 ? "" : "s"} - ${formatInrFromPaise(item?.payload?.amountPaise)}`,
														name,
													]}
													contentStyle={{
														borderRadius: "12px",
														border: "none",
														boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
													}}
												/>
											</PieChart>
										</ResponsiveContainer>
									) : (
										<div className="h-full flex items-center justify-center text-sm text-gray-500">
											No refund data yet.
										</div>
									)}

									{revopsRefundBreakdownData.length > 0 && (
										<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
											<div className="text-center">
												<span className="block text-3xl font-bold text-gray-800">{revopsAllRequestRows.length}</span>
												<span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Requests</span>
											</div>
										</div>
									)}
								</div>

								<div className="space-y-3">
									{revopsRefundBreakdownData.length === 0 && (
										<div className="text-sm text-gray-500">Refund categories will appear here once data is available.</div>
									)}

									{revopsRefundBreakdownData.map((row) => (
										<div key={`refund-row-${row.name}`} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-3">
											<div className="flex items-center gap-3 min-w-0">
												<span
													className="w-3 h-3 rounded-full shrink-0"
													style={{ backgroundColor: REFUND_COLORS[row.name] || "#94a3b8" }}
												/>
												<div className="min-w-0">
													<p className="text-sm font-bold text-gray-800 truncate">{row.name}</p>
													<p className="text-xs text-gray-500">{row.value} request{row.value === 1 ? "" : "s"}</p>
												</div>
											</div>
											<p className="text-sm font-extrabold text-gray-900">{formatInrFromPaise(row.amountPaise)}</p>
										</div>
									))}
								</div>
							</div>
						</MotionDiv>
					</div>

					<div className="space-y-6">
						<MotionDiv
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.22 }}
							className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
						>
							<h3 className="font-bold text-gray-800 mb-5">Processing Snapshot</h3>
							<div className="space-y-3">
								<div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
									<p className="text-xs font-bold uppercase tracking-wide text-amber-700">Need to be done</p>
									<p className="text-3xl font-extrabold text-gray-900 mt-1">{revopsPlanningNeedsActionCount}</p>
									<p className="text-xs text-gray-500 mt-1">Planning refunds waiting for RevOps confirmation.</p>
								</div>
								<div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
									<p className="text-xs font-bold uppercase tracking-wide text-blue-700">Automatically processed today</p>
									<p className="text-3xl font-extrabold text-gray-900 mt-1">{revopsAutoProcessedTodayCount}</p>
									<p className="text-xs text-gray-500 mt-1">Promote refunds and user ticket cancellations.</p>
								</div>
								<div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
									<p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Done / completed today</p>
									<p className="text-3xl font-extrabold text-gray-900 mt-1">{revopsCompletedTodayCount}</p>
									<p className="text-xs text-gray-500 mt-1">Completed items from today&apos;s request stream.</p>
								</div>
							</div>
						</MotionDiv>

						<MotionDiv
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.28 }}
							className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
						>
							<div className="flex justify-between items-center mb-5">
								<h3 className="font-bold text-gray-800">Recent Requests</h3>
								<span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-700">
									{revopsAllRequestRows.length}
								</span>
							</div>

							<div className="space-y-3">
								{revopsAllRequestRows.slice(0, 5).length === 0 && (
									<div className="text-sm text-gray-500">No recent refund activity yet.</div>
								)}

								{revopsAllRequestRows.slice(0, 5).map((row) => (
									<div key={`recent-revops-${row.type}-${row.id}`} className="relative pl-5 py-1.5 before:absolute before:left-0 before:top-3 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">
										<p className="text-sm text-gray-800 leading-snug font-semibold">
											{row.type}: {row.title.length > 46 ? `${row.title.slice(0, 46)}...` : row.title}
										</p>
										<span className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
											<Clock className="w-3 h-3" /> {toRelativeTime(row.requestedAt, currentTime)}
										</span>
									</div>
								))}
							</div>
						</MotionDiv>
					</div>
				</div>

				{(refundLoading || revopsLedgerLoading) && (
					<div className="text-xs text-gray-400 font-medium">Refreshing RevOps dashboard data...</div>
				)}
			</div>
		);
	}

	const showDashboardSkeleton = loading
		&& (planningEvents || []).length === 0
		&& (promoteEvents || []).length === 0;

	if (showDashboardSkeleton) {
		return (
			<div className="px-6 py-8 space-y-8 max-w-480 mx-auto min-h-screen animate-pulse">
				<div className="h-12 w-80 rounded-2xl bg-white border border-gray-100" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={`manager-home-stat-skeleton-${index}`} className="h-32 rounded-2xl bg-white border border-gray-100" />
					))}
				</div>
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
					<div className="xl:col-span-2 h-115 rounded-2xl bg-white border border-gray-100" />
					<div className="h-115 rounded-2xl bg-white border border-gray-100" />
				</div>
			</div>
		);
	}

	return (
		<div className="px-6 py-8 space-y-8 max-w-480 mx-auto min-h-screen">
			<MotionDiv
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex flex-col sm:flex-row sm:items-center justify-between"
			>
				<div>
					<h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h2>
					<p className="text-gray-500 font-medium mt-1">{formattedDate} • {formattedTime}</p>
				</div>

				<div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm mt-4 sm:mt-0">
					<div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
						{managerInitials}
					</div>
					<span className="text-sm font-bold text-gray-700">{managerName}</span>
				</div>
			</MotionDiv>

			{!!error && (
				<div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
					{String(error)}
				</div>
			)}

			<MotionDiv
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
			>
				{statsData.map((stat) => (
					<MotionDiv
						key={stat.id}
						variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
						whileHover={{ y: -4 }}
						className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group"
					>
						<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
							{stat.topIcon}
						</div>
						<div className="flex justify-between items-start z-10">
							<span className="text-gray-500 text-xs font-bold uppercase tracking-wide">{stat.label}</span>
							{stat.topIcon}
						</div>
						<div className="z-10 mt-auto">
							<h3 className="text-3xl font-extrabold text-gray-800 tracking-tight">{stat.value}</h3>
							<div className={`flex items-center gap-1.5 text-xs mt-1 font-medium ${stat.subtextColor}`}>
								{stat.subtextIcon && <span className="text-sm">{stat.subtextIcon}</span>}
								<span>{stat.subtext}</span>
							</div>
						</div>
					</MotionDiv>
				))}
			</MotionDiv>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
				<div className="xl:col-span-2 space-y-8">
					<MotionDiv
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
					>
						<div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/60">
							<h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
								<MdCalendarMonth className="text-teal-500" /> Today&apos;s Events
							</h3>
							<span className="bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full">
								{todaysEvents.length} Assigned
							</span>
						</div>

						<div className="divide-y divide-gray-50">
							{todaysEvents.length === 0 && (
								<div className="p-6 text-sm text-gray-500">No events assigned for today.</div>
							)}

							{todaysEvents.map((event) => (
								<div key={event.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<p className="font-bold text-gray-800 text-sm">{event.title}</p>
											<span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-600 uppercase">
												{event.type}
											</span>
											<span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 uppercase">
												{event.status || "STATUS"}
											</span>
										</div>
										<p className="text-xs text-gray-500">
											{event.startAt
												? event.startAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
												: "--:--"}
											{event.endAt ? ` - ${event.endAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
										</p>
										<p className="text-xs text-gray-500">{event.location || "—"}</p>
									</div>

									<button
										type="button"
										onClick={() => handleManageEvent(event.id)}
										className="shrink-0 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
									>
										Manage Event
									</button>
								</div>
							))}
						</div>
					</MotionDiv>

					<div className={`grid gap-6 ${hasRevenueTimeline ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
						{hasRevenueTimeline && (
							<MotionDiv
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.2 }}
								className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
							>
								<h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trends</h3>
								<div className="h-62.5 w-full">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
											<defs>
												<linearGradient id="managerRevenueGradient" x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
													<stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
											<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
											<Tooltip
												formatter={(value) => [formatMoney(value), "Paid"]}
												contentStyle={{
													borderRadius: "12px",
													border: "none",
													boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
												}}
											/>
											<Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#managerRevenueGradient)" />
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</MotionDiv>
						)}

						<MotionDiv
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
						>
							<h3 className="text-lg font-bold text-gray-900 mb-4">Event Distribution</h3>
							<div className="h-62.5 w-full relative">
								{eventDistributionData.length > 0 ? (
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={eventDistributionData}
												cx="50%"
												cy="50%"
												innerRadius={62}
												outerRadius={86}
												paddingAngle={4}
												dataKey="value"
												isAnimationActive={false}
											>
												{eventDistributionData.map((entry, index) => (
													<Cell key={`dist-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
												))}
											</Pie>
											<Tooltip
												formatter={(value, name) => [value, name]}
												contentStyle={{
													borderRadius: "12px",
													border: "none",
													boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
												}}
											/>
										</PieChart>
									</ResponsiveContainer>
								) : (
									<div className="h-full flex items-center justify-center text-sm text-gray-500">
										No event distribution data yet.
									</div>
								)}

								{eventDistributionData.length > 0 && (
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<div className="text-center">
											<span className="block text-3xl font-bold text-gray-800">{combinedEvents.length}</span>
											<span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Events</span>
										</div>
									</div>
								)}
							</div>
						</MotionDiv>
					</div>

					<MotionDiv
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.24 }}
						className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="font-bold text-gray-800">Upcoming Events</h3>
							<span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-700">{upcomingEvents.length}</span>
						</div>

						<div className="space-y-3">
							{upcomingEvents.length === 0 && (
								<div className="text-sm text-gray-500">No upcoming events.</div>
							)}

							{upcomingEvents.map((event) => (
								<div key={`upcoming-${event.id}`} className="rounded-xl border border-gray-100 p-3">
									<div className="flex items-start justify-between gap-3">
										<div>
											<div className="flex flex-wrap items-center gap-2">
												<p className="text-sm font-bold text-gray-800 leading-snug">{event.title}</p>
												{(() => {
													const chip = getUpcomingEventStatusChip(event, currentTime);
													return (
														<span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${chip.className}`}>
															{chip.label}
														</span>
													);
												})()}
											</div>
											<p className="text-xs text-gray-500 mt-1">
												{formatDateTimeShort(event.startAt)}
												{event.endAt ? ` - ${formatDateTimeShort(event.endAt)}` : ""}
											</p>
										</div>
										<button
											type="button"
											onClick={() => handleManageEvent(event.id)}
											className="shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
										>
											Manage
										</button>
									</div>
								</div>
							))}
						</div>
					</MotionDiv>
				</div>

				<div className="space-y-6">
					<MotionDiv
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.25 }}
						className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
					>
						<div className="flex justify-between items-center mb-6">
							<h3 className="font-bold text-gray-800">
								{calendarCursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
							</h3>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
									className="p-1 rounded-md hover:bg-gray-100 text-gray-400"
								>
									<ChevronRight className="rotate-180 w-4 h-4" />
								</button>
								<button
									type="button"
									onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
									className="p-1 rounded-md hover:bg-gray-100 text-gray-400"
								>
									<ChevronRight className="w-4 h-4" />
								</button>
							</div>
						</div>

						<div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400">
							<span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
						</div>

						<div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600">
							{(() => {
								const year = calendarCursor.getFullYear();
								const month = calendarCursor.getMonth();
								const daysInMonth = new Date(year, month + 1, 0).getDate();
								const firstDay = new Date(year, month, 1).getDay();
								const nodes = [];

								for (let i = 0; i < firstDay; i += 1) {
									nodes.push(<div key={`empty-${i}`} className="aspect-square" />);
								}

								for (let day = 1; day <= daysInMonth; day += 1) {
									const isToday =
										day === currentTime.getDate() &&
										month === currentTime.getMonth() &&
										year === currentTime.getFullYear();
									const dayEvents = Number(calendarEventCountByDay[day] || 0);
									const dayHasEvents = dayEvents > 0;

									nodes.push(
										<div
											key={`day-${day}`}
											className={`aspect-square flex flex-col items-center justify-center rounded-lg relative transition-colors ${
												isToday
													? "bg-teal-600 text-white shadow-md shadow-teal-500/30"
													: dayHasEvents
														? "bg-teal-50 text-teal-700 hover:bg-teal-100"
														: "hover:bg-gray-50"
											}`}
										>
											<span>{day}</span>
											{dayHasEvents && (
												<>
													<span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : "bg-teal-500"}`} />
													{dayEvents > 1 && (
														<span className={`absolute top-0.5 right-0.5 text-[9px] font-bold ${isToday ? "text-white" : "text-teal-700"}`}>
															{dayEvents}
														</span>
													)}
												</>
											)}
										</div>
									);
								}

								return nodes;
							})()}
						</div>

						<div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
							Today&apos;s scheduled events: <span className="font-bold text-gray-700">{todaysEvents.length}</span>
						</div>
					</MotionDiv>

					<MotionDiv
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 }}
						className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
					>
						<div className="flex justify-between items-center mb-6">
							<h3 className="font-bold text-gray-800">Recent Activity</h3>
							<button type="button" className="text-gray-400 hover:text-teal-600">
								<MoreHorizontal className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-3">
							{recentActivities.length === 0 && (
								<div className="text-sm text-gray-500">No recent manager activities yet.</div>
							)}

							{recentActivities.map((activity, idx) => (
								<div
									key={activity.id}
									className="relative pl-5 py-1.5 before:absolute before:left-0 before:top-3 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full"
								>
									{idx !== recentActivities.length - 1 && (
										<div className="absolute left-0.5 top-4 -bottom-2 w-px bg-gray-100" />
									)}
									<p className="text-sm text-gray-800 leading-snug">
										{activity.message.length > 74 ? `${activity.message.slice(0, 74)}...` : activity.message}
									</p>
									<span className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
										<Clock className="w-3 h-3" /> {toRelativeTime(activity.timestamp, currentTime)}
									</span>
								</div>
							))}
						</div>
					</MotionDiv>
				</div>
			</div>

			{loading && (
				<div className="text-xs text-gray-400 font-medium">Refreshing dashboard data...</div>
			)}
		</div>
	);
};

export default ManagerHomePage;
