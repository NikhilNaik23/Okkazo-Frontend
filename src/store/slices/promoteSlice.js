import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../utils/apiHandler';
import { refreshAccessToken } from './authSlice';

const API_BASE_URL = 'http://localhost:8080';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

/** Convert a JS Date or ISO string to a local-time ISO string (prevents UTC shift) */
const toLocalIso = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000Z`;
};

/**
 * Build the FormData for the promote creation request.
 * - eventBanner → File
 * - authProofs  → File[]
 * - tickets, schedule, ticketAvailability, venue, promotion → JSON strings
 */
const buildPromoteFormData = (formData) => {
    const tiers = (formData.tickets || [])
        .filter((t) => t && t.name && Number(t.quantity) > 0)
        .map((t) => ({
            name: t.name,
            price: Number(t.price || 0),
            quantity: Number(t.quantity),
        }));

    const ticketType = (formData.ticketType || 'paid').toLowerCase() === 'free' ? 'free' : 'paid';

    // Map promotion toggles → package strings expected by backend
    const promotionArr = [];
    if (formData.promotions?.featured) promotionArr.push('featured placement');
    if (formData.promotions?.email)    promotionArr.push('email blast');
    if (formData.promotions?.social)   promotionArr.push('social synergy');
    if (formData.promotions?.insights) promotionArr.push('advanced analytics');

    const jsonPayload = {
        eventTitle: formData.eventName,
        eventDescription: formData.eventDescription || '',
        eventCategory: formData.category || 'Other',
        customCategory: formData.category === 'Other' ? (formData.customCategory || '') : undefined,
        eventField: (typeof formData.eventField === 'string' && formData.eventField.trim())
            ? formData.eventField.trim()
            : ((Array.isArray(formData.interests) && typeof formData.interests[0] === 'string')
                ? formData.interests[0].trim()
                : undefined),
        tickets: {
            noOfTickets: Number(formData.totalCapacity || 0),
            ticketType,
            tiers: ticketType === 'paid' ? tiers : [],
        },
        schedule: {
            startAt: toLocalIso(formData.startDate),
            endAt: toLocalIso(formData.endDate),
        },
        ticketAvailability: {
            startAt: toLocalIso(formData.ticketReleaseDate),
            endAt: toLocalIso(formData.ticketSalesEndDate),
        },
        venue: {
            locationName: formData.address || formData.location || '',
            latitude: Number(formData.lat || 0),
            longitude: Number(formData.lng || 0),
        },
        promotion: promotionArr,
    };

    const fd = new FormData();

    // Attach banner file (required)
    if (formData.bannerFile instanceof File) {
        fd.append('eventBanner', formData.bannerFile);
    } else if (formData.banner instanceof File) {
        fd.append('eventBanner', formData.banner);
    }

    // Attach authenticity proof files
    const docs = formData.authDocuments || [];
    for (const doc of docs) {
        if (doc.file instanceof File) {
            fd.append('authProofs', doc.file);
        }
    }

    // JSON-serialise nested objects (backend's parseJsonFields will parse them)
    const JSON_FIELDS = ['tickets', 'schedule', 'ticketAvailability', 'venue', 'promotion'];

    for (const [key, value] of Object.entries(jsonPayload)) {
        if (value === undefined || value === null) continue;
        if (JSON_FIELDS.includes(key)) {
            fd.append(key, JSON.stringify(value));
        } else {
            fd.append(key, String(value));
        }
    }

    return fd;
};

// ─── Step 1: Save the promote record ─────────────────────────────────────────

export const savePromoteEvent = createAsyncThunk(
    'promote/savePromoteEvent',
    async ({ formData }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return rejectWithValue('No access token — please log in first.');

            const body = buildPromoteFormData(formData);

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/promote`,
                { method: 'POST', body },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.errors?.join(', ') || data?.message || 'Failed to save promote event';
                return rejectWithValue(msg);
            }

            return {
                eventId: data.data?.eventId,
                promoteId: data.data?.promoteId,
                totalAmount: data.data?.totalAmount,
                estimatedNetRevenue: data.data?.estimatedNetRevenue,
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save promote event');
        }
    }
);

// ─── Step 2: Create Razorpay order (reuses order-service) ────────────────────

export const createPromoteOrder = createAsyncThunk(
    'promote/createPromoteOrder',
    async ({ eventId, amount }, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/orders/create`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        eventId,
                        orderType: 'PROMOTE EVENT',
                        // IMPORTANT: order-service expects `amount` in INR (it converts to paise internally)
                        amount: (typeof amount === 'number' && Number.isFinite(amount))
                            ? Number(amount.toFixed(2))
                            : undefined,
                        currency: 'INR',
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                return rejectWithValue(data?.message || 'Failed to create payment order');
            }

            return {
                razorpayOrderId: data.data?.razorpayOrderId,
                amount: data.data?.amount,
                currency: data.data?.currency,
                keyId: data.data?.keyId,
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create order');
        }
    }
);

// ─── Step 3: Verify payment ───────────────────────────────────────────────────

export const verifyPromotePayment = createAsyncThunk(
    'promote/verifyPromotePayment',
    async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature, eventId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/orders/verify`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        eventId,
                        razorpay_order_id: razorpayOrderId,
                        razorpay_payment_id: razorpayPaymentId,
                        razorpay_signature: razorpaySignature,
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                return rejectWithValue(data?.message || 'Payment verification failed');
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

// ─── Fetch own promote records ────────────────────────────────────────────────

export const fetchMyPromotes = createAsyncThunk(
    'promote/fetchMyPromotes',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/promote/me`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );
            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                return rejectWithValue(data?.message || 'Failed to fetch promotes');
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// ─── Platform fee config ─────────────────────────────────────────────────────

export const fetchPromotePlatformFee = createAsyncThunk(
    'promote/fetchPromotePlatformFee',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/promote/platform-fee`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );
            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                return rejectWithValue(data?.message || 'Failed to fetch platform fee');
            }
            return data?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updatePromotePlatformFee = createAsyncThunk(
    'promote/updatePromotePlatformFee',
    async ({ platformFee }, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/promote/platform-fee`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ platformFee }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );
            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                return rejectWithValue(data?.message || 'Failed to update platform fee');
            }
            return data?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const promoteSlice = createSlice({
    name: 'promote',
    initialState: {
        // Checkout flow
        saveStatus:   'idle',   // idle | loading | succeeded | failed
        orderStatus:  'idle',
        verifyStatus: 'idle',

        eventId:        null,
        promoteId:      null,
        razorpayOrderId: null,
        razorpayKeyId:  null,
        transactionId:  null,
        totalAmount:    null,
        estimatedNetRevenue: null,

        error: null,

        // My promotes list
        myPromotes: [],
        myPromotesStatus: 'idle',
        myPromotesError: null,

        // Promote platform fee
        platformFee: null,
        platformFeeStatus: 'idle',
        platformFeeError: null,
    },
    reducers: {
        resetPromoteCheckoutState: (state) => {
            state.saveStatus   = 'idle';
            state.orderStatus  = 'idle';
            state.verifyStatus = 'idle';
            state.eventId        = null;
            state.promoteId      = null;
            state.razorpayOrderId = null;
            state.razorpayKeyId  = null;
            state.transactionId  = null;
            state.totalAmount    = null;
            state.estimatedNetRevenue = null;
            state.error          = null;
        },
        clearPromoteError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Save promote event
        builder
            .addCase(savePromoteEvent.pending, (state) => {
                state.saveStatus = 'loading';
                state.error = null;
            })
            .addCase(savePromoteEvent.fulfilled, (state, action) => {
                state.saveStatus = 'succeeded';
                state.eventId = action.payload.eventId;
                state.promoteId = action.payload.promoteId;
                state.totalAmount = action.payload.totalAmount;
                state.estimatedNetRevenue = action.payload.estimatedNetRevenue;
            })
            .addCase(savePromoteEvent.rejected, (state, action) => {
                state.saveStatus = 'failed';
                state.error = action.payload || action.error.message;
            });

        // Create order
        builder
            .addCase(createPromoteOrder.pending, (state) => {
                state.orderStatus = 'loading';
                state.error = null;
            })
            .addCase(createPromoteOrder.fulfilled, (state, action) => {
                state.orderStatus = 'succeeded';
                state.razorpayOrderId = action.payload.razorpayOrderId;
                state.razorpayKeyId = action.payload.keyId;
            })
            .addCase(createPromoteOrder.rejected, (state, action) => {
                state.orderStatus = 'failed';
                state.error = action.payload || action.error.message;
            });

        // Verify payment
        builder
            .addCase(verifyPromotePayment.pending, (state) => {
                state.verifyStatus = 'loading';
                state.error = null;
            })
            .addCase(verifyPromotePayment.fulfilled, (state, action) => {
                state.verifyStatus = 'succeeded';
                state.transactionId = action.payload.transactionId;
            })
            .addCase(verifyPromotePayment.rejected, (state, action) => {
                state.verifyStatus = 'failed';
                state.error = action.payload || action.error.message;
            });

        // My promotes
        builder
            .addCase(fetchMyPromotes.pending, (state) => {
                state.myPromotesStatus = 'loading';
                state.myPromotesError = null;
            })
            .addCase(fetchMyPromotes.fulfilled, (state, action) => {
                state.myPromotesStatus = 'succeeded';
                state.myPromotes = action.payload?.promotes || [];
            })
            .addCase(fetchMyPromotes.rejected, (state, action) => {
                state.myPromotesStatus = 'failed';
                state.myPromotesError = action.payload || action.error.message;
            });

        // Platform fee
        builder
            .addCase(fetchPromotePlatformFee.pending, (state) => {
                state.platformFeeStatus = 'loading';
                state.platformFeeError = null;
            })
            .addCase(fetchPromotePlatformFee.fulfilled, (state, action) => {
                state.platformFeeStatus = 'succeeded';
                state.platformFee = action.payload?.platformFee ?? null;
            })
            .addCase(fetchPromotePlatformFee.rejected, (state, action) => {
                state.platformFeeStatus = 'failed';
                state.platformFeeError = action.payload || action.error.message;
            })
            .addCase(updatePromotePlatformFee.fulfilled, (state, action) => {
                state.platformFee = action.payload?.platformFee ?? state.platformFee;
            });
    },
});

export const { resetPromoteCheckoutState, clearPromoteError } = promoteSlice.actions;

// Selectors
export const selectPromoteCheckout = (state) => state.promote;
export const selectMyPromotes = (state) => state.promote.myPromotes;
export const selectMyPromotesStatus = (state) => state.promote.myPromotesStatus;
export const selectPromotePlatformFee = (state) => state.promote.platformFee;
export const selectPromotePlatformFeeStatus = (state) => state.promote.platformFeeStatus;
export const selectPromotePlatformFeeError = (state) => state.promote.platformFeeError;

export default promoteSlice.reducer;
