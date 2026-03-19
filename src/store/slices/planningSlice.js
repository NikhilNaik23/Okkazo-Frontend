import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../utils/apiHandler';
import { refreshAccessToken } from './authSlice';

const API_BASE_URL = 'http://localhost:8080';

// ─── Helpers ────────────────────────────────────────────────────────────────

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const normalizeEventType = (listingType, typeValue) => {
    if (!typeValue) return 'Other';
    const type = String(typeValue).trim();
    if (listingType === 'Public') {
        if (type === 'Expo') return 'Exhibition';
        if (type === 'Hackathon') return 'Seminar';
        if (['Concert', 'Festival', 'Exhibition', 'Workshop', 'Seminar', 'Other'].includes(type)) return type;
        return 'Other';
    }
    if (type === 'Reunion' || type === 'Baby Shower') return 'Party';
    if (['Birthday', 'Wedding', 'Anniversary', 'Party', 'Dinner', 'Other'].includes(type)) return type;
    return 'Other';
};

const buildPublicDescription = (formData) => {
    if (formData.eventDescription && String(formData.eventDescription).trim()) {
        return String(formData.eventDescription).trim().slice(0, 1000);
    }
    const composed = `${formData.title || formData.type || 'Public Event'} at ${formData.location || 'TBA'} on ${formData.publicStartTime || formData.date || 'upcoming date'}.`;
    return composed.slice(0, 1000);
};

const mapPromotions = (promotions = {}) => {
    const mapped = [];
    if (promotions.featured) mapped.push('featured placement');
    if (promotions.email) mapped.push('email blast');
    if (promotions.social) mapped.push('Social Synergy');
    if (promotions.insights) mapped.push('advance analysis');
    return mapped;
};

const toIso = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    
    // To prevent the "shifting day" issue when converting to UTC (GMT) for payload,
    // we format the ISO string using local time components. This ensures that 
    // March 25 00:00 IST stays "2026-03-25" in the payload string without -1 day shift.
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000Z`;
};

/**
 * Build the JSON body for private events (no banner file needed).
 */
const buildPrivatePayload = (formData, authState) => {
    const normalizedType = normalizeEventType(formData.listingType, formData.type);
    const eventField = (typeof formData.eventField === 'string' && formData.eventField.trim())
        ? formData.eventField.trim()
        : (Array.isArray(formData.interests) && typeof formData.interests[0] === 'string' ? formData.interests[0].trim() : undefined);
    return {
        authId:
            authState?.user?.authId ||
            authState?.user?.id ||
            authState?.profile?.authId ||
            localStorage.getItem('authId') ||
            localStorage.getItem('userId') ||
            undefined,
        category: 'private',
        eventTitle: formData.title,
        eventType: normalizedType,
        ...(eventField ? { eventField } : {}),
        customEventType: normalizedType === 'Other' ? (formData.customType || formData.type || 'Other') : undefined,
        location: {
            name: formData.location,
            latitude: Number(formData.lat),
            longitude: Number(formData.lng),
        },
        selectedServices: formData.services || [],
        eventDate: formData.date,
        eventTime: formData.startTime,
        guestCount: Number(formData.guests),
    };
};

/**
 * Build a FormData object for public events.
 * The banner file (formData.bannerFile) is attached as the 'eventBanner' field.
 * All other JSON fields are serialised and attached as 'data'.
 * The backend controller reads req.file (multer) + req.body.
 */
const buildPublicFormData = (formData, authState) => {
    const normalizedType = normalizeEventType('Public', formData.type);
    const eventField = (typeof formData.eventField === 'string' && formData.eventField.trim())
        ? formData.eventField.trim()
        : (Array.isArray(formData.interests) && typeof formData.interests[0] === 'string' ? formData.interests[0].trim() : undefined);
    // Wizard flow uses: publicStartTime, publicEndTime, salesStartTime, salesEndTime
    // Promote flow uses: startDate, endDate, ticketReleaseDate, ticketSalesEndDate
    const scheduleStart = toIso(formData.publicStartTime || formData.startDate);
    const scheduleEnd   = toIso(formData.publicEndTime || formData.endDate);
    const salesStart    = toIso(formData.salesStartTime || formData.ticketReleaseDate);
    const salesEnd      = toIso(formData.salesEndTime || formData.ticketSalesEndDate) ||
        (scheduleStart
            ? toIso(new Date(new Date(scheduleStart).getTime() - 60 * 1000))
            : null);

    const tiers = (formData.tickets || [])
        .filter((t) => t && t.name && Number(t.quantity) > 0)
        .map((t) => ({
            tierName:    t.name,
            ticketPrice: Number(t.price || 0),
            ticketCount: Number(t.quantity),
        }));

    const ticketType = (formData.ticketType || 'paid').toLowerCase() === 'free' ? 'free' : 'paid';

    const jsonPayload = {
        authId:
            authState?.user?.authId ||
            authState?.user?.id ||
            authState?.profile?.authId ||
            localStorage.getItem('authId') ||
            localStorage.getItem('userId') ||
            undefined,
        category: 'public',
        eventTitle: formData.title,
        eventType: normalizedType,
        ...(eventField ? { eventField } : {}),
        customEventType: normalizedType === 'Other' ? (formData.customType || formData.type || 'Other') : undefined,
        eventDescription: buildPublicDescription(formData),
        location: {
            name:      formData.location || formData.address,
            latitude:  Number(formData.lat),
            longitude: Number(formData.lng),
        },
        selectedServices: formData.services || [],
        schedule: {
            startAt: scheduleStart,
            endAt:   scheduleEnd,
        },
        ticketAvailability: {
            startAt: salesStart,
            endAt:   salesEnd,
        },
        tickets: {
            totalTickets: Number(formData.totalCapacity),
            ticketType,
            tiers: ticketType === 'paid' ? tiers : [],
        },
        promotionType: mapPromotions(formData.promotions),
    };

    const fd = new FormData();

    // Attach banner file (field name MUST match multer's upload.single('eventBanner'))
    if (formData.bannerFile instanceof File) {
        fd.append('eventBanner', formData.bannerFile);
    }

    // The backend planningValidation.js `parseJsonFields` expects nested objects
    // to arrive as JSON *strings* so it can JSON.parse them.
    // Simple scalar fields are appended as plain strings.
    const JSON_FIELDS = ['location', 'schedule', 'ticketAvailability', 'tickets', 'selectedServices', 'promotionType'];

    for (const [key, value] of Object.entries(jsonPayload)) {
        if (value === undefined || value === null) continue;
        if (JSON_FIELDS.includes(key)) {
            // Send as JSON string — backend will JSON.parse it
            fd.append(key, JSON.stringify(value));
        } else {
            fd.append(key, String(value));
        }
    }

    return fd;
};

// ─── Step 1: Save event in event-service ────────────────────────────────────

export const saveEventPlanning = createAsyncThunk(
    'planning/saveEventPlanning',
    async ({ formData }, { dispatch, rejectWithValue, getState }) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return rejectWithValue('No access token found. Please login first.');

            const authState = getState().auth;
            const isPublic  = formData.listingType === 'Public';

            let body;
            let headers = { Authorization: `Bearer ${token}` };

            if (isPublic) {
                // multipart/form-data — let the browser set the Content-Type with boundary
                body = buildPublicFormData(formData, authState);
                // Do NOT set Content-Type; browser will add multipart boundary automatically
            } else {
                body    = JSON.stringify(buildPrivatePayload(formData, authState));
                headers = { ...headers, 'Content-Type': 'application/json' };
            }

            const response = await fetchWithAuth(`${API_BASE_URL}/api/events/planning`, {
                method: 'POST',
                headers,
                body,
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.errors?.join(', ') || data?.message || 'Failed to save event';
                return rejectWithValue(msg);
            }

            return { eventId: data.data?.eventId };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save event');
        }
    }
);

// ─── Step 2: Create Razorpay order in order-service ─────────────────────────
// Backend schema: { eventId, orderType (required), amount?, currency? }
// Returns: { razorpayOrderId, amount, currency, keyId }

export const createOrder = createAsyncThunk(
    'planning/createOrder',
    async ({ eventId, amount }, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/orders/create`, {
                method: 'POST',
                body: JSON.stringify({
                    eventId,
                    orderType: 'PLANNING EVENT', // required enum in PaymentOrder model
                    currency:  'INR',
                    ...(amount !== undefined && amount !== null ? { amount } : {}),
                }),
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || 'Failed to create payment order';
                return rejectWithValue(msg);
            }

            return {
                razorpayOrderId: data.data?.razorpayOrderId,
                amount:          data.data?.amount,          // in paise
                currency:        data.data?.currency,
                keyId:           data.data?.keyId,           // backend field name is 'keyId'
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create order');
        }
    }
);

// ─── Step 3: Verify payment in order-service (triggers Kafka server-side) ───
// Backend schema: { eventId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
// All field names are snake_case to match Razorpay's handler response object directly.

export const verifyPayment = createAsyncThunk(
    'planning/verifyPayment',
    async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature, eventId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/orders/verify`, {
                method: 'POST',
                body: JSON.stringify({
                    eventId,
                    // Backend Joi schema uses snake_case (matches Razorpay handler response keys)
                    razorpay_order_id:   razorpayOrderId,
                    razorpay_payment_id: razorpayPaymentId,
                    razorpay_signature:  razorpaySignature,
                }),
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || 'Payment verification failed';
                return rejectWithValue(msg);
            }

            return {
                transactionId: data.data?.transactionId || razorpayPaymentId,
                eventId,
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Payment verification failed');
        }
    }
);

// ─── My Events: fetch plannings for current user ───────────────────────────

export const fetchMyPlannings = createAsyncThunk(
    'planning/fetchMyPlannings',
    async ({ page = 1, limit = 50 } = {}, { dispatch, rejectWithValue }) => {
        try {
            const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
            const response = await fetchWithAuth(`${API_BASE_URL}/api/events/planning/me?${qs}`, {
                method: 'GET',
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || 'Failed to load your events';
                return rejectWithValue(msg);
            }

            return {
                plannings: Array.isArray(data.data) ? data.data : [],
                pagination: data.pagination || null,
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to load your events');
        }
    }
);

// ─── Planning: fetch a single planning by eventId ──────────────────────────

export const fetchPlanningByEventId = createAsyncThunk(
    'planning/fetchPlanningByEventId',
    async (eventId, { dispatch, rejectWithValue }) => {
        try {
            if (!eventId) return rejectWithValue('Event ID is required');

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(eventId))}`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || 'Failed to load event';
                return rejectWithValue(msg);
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to load event');
        }
    }
);

// ─── Planning: confirm (Finalized Selection → Finish) ─────────────────────

export const confirmPlanning = createAsyncThunk(
    'planning/confirmPlanning',
    async ({ eventId }, { dispatch, rejectWithValue }) => {
        try {
            if (!eventId) return rejectWithValue('Event ID is required');

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/planning/${encodeURIComponent(String(eventId))}/confirm`,
                { method: 'POST' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || 'Failed to confirm planning';
                return rejectWithValue(msg);
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to confirm planning');
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const planningSlice = createSlice({
    name: 'planning',
    initialState: {
        saveStatus:   'idle',   // idle | loading | succeeded | failed
        orderStatus:  'idle',   // idle | loading | succeeded | failed
        verifyStatus: 'idle',   // idle | loading | succeeded | failed

        eventId:        null,
        razorpayOrderId: null,
        razorpayKeyId:  null,
        transactionId:  null,

        myPlanningsStatus: 'idle', // idle | loading | succeeded | failed
        myPlannings: [],
        myPlanningsPagination: null,
        myPlanningsError: null,

        confirmStatus: 'idle', // idle | loading | succeeded | failed
        confirmedPlanning: null,
        confirmError: null,

        error: null,
    },
    reducers: {
        resetPlanningCheckoutState: (state) => {
            state.saveStatus   = 'idle';
            state.orderStatus  = 'idle';
            state.verifyStatus = 'idle';
            state.eventId        = null;
            state.razorpayOrderId = null;
            state.razorpayKeyId  = null;
            state.transactionId  = null;
            state.error          = null;
        },
        clearPlanningError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Save event
        builder
            .addCase(saveEventPlanning.pending, (state) => {
                state.saveStatus = 'loading';
                state.error = null;
            })
            .addCase(saveEventPlanning.fulfilled, (state, action) => {
                state.saveStatus = 'succeeded';
                state.eventId    = action.payload.eventId;
            })
            .addCase(saveEventPlanning.rejected, (state, action) => {
                state.saveStatus = 'failed';
                state.error      = action.payload || action.error.message;
            });

        // Create order
        builder
            .addCase(createOrder.pending, (state) => {
                state.orderStatus = 'loading';
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.orderStatus    = 'succeeded';
                state.razorpayOrderId = action.payload.razorpayOrderId;
                state.razorpayKeyId  = action.payload.keyId;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.orderStatus = 'failed';
                state.error       = action.payload || action.error.message;
            });

        // Verify payment
        builder
            .addCase(verifyPayment.pending, (state) => {
                state.verifyStatus = 'loading';
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.verifyStatus = 'succeeded';
                state.transactionId = action.payload.transactionId;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.verifyStatus = 'failed';
                state.error        = action.payload || action.error.message;
            });

        // Fetch my plannings
        builder
            .addCase(fetchMyPlannings.pending, (state) => {
                state.myPlanningsStatus = 'loading';
                state.myPlanningsError = null;
            })
            .addCase(fetchMyPlannings.fulfilled, (state, action) => {
                state.myPlanningsStatus = 'succeeded';
                state.myPlannings = action.payload.plannings;
                state.myPlanningsPagination = action.payload.pagination;
            })
            .addCase(fetchMyPlannings.rejected, (state, action) => {
                state.myPlanningsStatus = 'failed';
                state.myPlanningsError = action.payload || action.error.message;
            });

        // Confirm planning
        builder
            .addCase(confirmPlanning.pending, (state) => {
                state.confirmStatus = 'loading';
                state.confirmError = null;
            })
            .addCase(confirmPlanning.fulfilled, (state, action) => {
                state.confirmStatus = 'succeeded';
                state.confirmedPlanning = action.payload;
            })
            .addCase(confirmPlanning.rejected, (state, action) => {
                state.confirmStatus = 'failed';
                state.confirmError = action.payload || action.error.message;
            });
    },
});

export const { resetPlanningCheckoutState, clearPlanningError } = planningSlice.actions;
export default planningSlice.reducer;
