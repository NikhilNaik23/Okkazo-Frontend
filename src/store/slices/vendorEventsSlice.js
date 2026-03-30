import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../utils/apiHandler';
import { refreshAccessToken } from './authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

export const fetchVendorEventRequests = createAsyncThunk(
    'vendorEvents/fetchVendorEventRequests',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/vendor/requests`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || `Failed to load event requests (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return data.data?.requests || [];
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to load event requests');
        }
    }
);

export const fetchVendorEventRequestDetails = createAsyncThunk(
    'vendorEvents/fetchVendorEventRequestDetails',
    async ({ eventId }, { dispatch, rejectWithValue }) => {
        try {
            if (!eventId) return rejectWithValue('Event ID is required');

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/vendor/requests/${encodeURIComponent(String(eventId))}`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || `Failed to load event details (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to load event details');
        }
    }
);

export const acceptVendorEventRequest = createAsyncThunk(
    'vendorEvents/acceptVendorEventRequest',
    async ({ eventId, service }, { dispatch, rejectWithValue }) => {
        try {
            if (!eventId) return rejectWithValue('Event ID is required');

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/vendor/requests/${encodeURIComponent(String(eventId))}/accept`,
                {
                    method: 'POST',
                    body: JSON.stringify(service ? { service } : {}),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || `Failed to accept request (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return { eventId, result: data.data };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to accept request');
        }
    }
);

export const lockVendorEventServicePrice = createAsyncThunk(
    'vendorEvents/lockVendorEventServicePrice',
    async ({ eventId, service, price }, { dispatch, rejectWithValue }) => {
        try {
            if (!eventId) return rejectWithValue('Event ID is required');
            if (!service || !String(service).trim()) return rejectWithValue('Service is required');

            const quote = Number(price);
            if (!Number.isFinite(quote) || quote <= 0) {
                return rejectWithValue('Price must be greater than 0');
            }

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/vendor/requests/${encodeURIComponent(String(eventId))}/lock-price`,
                {
                    method: 'POST',
                    body: JSON.stringify({ service: String(service).trim(), price: quote }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || `Failed to lock price (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return data.data || {};
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to lock price');
        }
    }
);

export const rejectVendorEventRequest = createAsyncThunk(
    'vendorEvents/rejectVendorEventRequest',
    async ({ eventId, service, reason }, { dispatch, rejectWithValue }) => {
        try {
            if (!eventId) return rejectWithValue('Event ID is required');
            if (!reason || !String(reason).trim()) return rejectWithValue('Reason is required');

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/vendor/requests/${encodeURIComponent(String(eventId))}/reject`,
                {
                    method: 'POST',
                    body: JSON.stringify({ ...(service ? { service } : {}), reason: String(reason).trim() }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg = data?.message || `Failed to reject request (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return { eventId, result: data.data };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject request');
        }
    }
);

const vendorEventsSlice = createSlice({
    name: 'vendorEvents',
    initialState: {
        requests: [],
        requestsStatus: 'idle', // idle | loading | succeeded | failed
        requestsError: null,

        selected: null,
        selectedStatus: 'idle',
        selectedError: null,

        respondStatus: 'idle',
        respondError: null,
    },
    reducers: {
        clearVendorEventsErrors: (state) => {
            state.requestsError = null;
            state.selectedError = null;
            state.respondError = null;
        },
        resetRespondStatus: (state) => {
            state.respondStatus = 'idle';
            state.respondError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVendorEventRequests.pending, (state) => {
                state.requestsStatus = 'loading';
                state.requestsError = null;
            })
            .addCase(fetchVendorEventRequests.fulfilled, (state, action) => {
                state.requestsStatus = 'succeeded';
                state.requestsError = null;
                state.requests = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchVendorEventRequests.rejected, (state, action) => {
                state.requestsStatus = 'failed';
                state.requestsError = action.payload || action.error.message;
            })

            .addCase(fetchVendorEventRequestDetails.pending, (state) => {
                state.selectedStatus = 'loading';
                state.selectedError = null;
            })
            .addCase(fetchVendorEventRequestDetails.fulfilled, (state, action) => {
                state.selectedStatus = 'succeeded';
                state.selectedError = null;
                state.selected = action.payload || null;
            })
            .addCase(fetchVendorEventRequestDetails.rejected, (state, action) => {
                state.selectedStatus = 'failed';
                state.selectedError = action.payload || action.error.message;
            })

            .addCase(acceptVendorEventRequest.pending, (state) => {
                state.respondStatus = 'loading';
                state.respondError = null;
            })
            .addCase(acceptVendorEventRequest.fulfilled, (state) => {
                state.respondStatus = 'succeeded';
                state.respondError = null;
            })
            .addCase(acceptVendorEventRequest.rejected, (state, action) => {
                state.respondStatus = 'failed';
                state.respondError = action.payload || action.error.message;
            })

            .addCase(rejectVendorEventRequest.pending, (state) => {
                state.respondStatus = 'loading';
                state.respondError = null;
            })
            .addCase(rejectVendorEventRequest.fulfilled, (state) => {
                state.respondStatus = 'succeeded';
                state.respondError = null;
            })
            .addCase(rejectVendorEventRequest.rejected, (state, action) => {
                state.respondStatus = 'failed';
                state.respondError = action.payload || action.error.message;
            });
    },
});

export const { clearVendorEventsErrors, resetRespondStatus } = vendorEventsSlice.actions;

export const selectVendorEventRequests = (state) => state.vendorEvents.requests;
export const selectVendorEventRequestsStatus = (state) => state.vendorEvents.requestsStatus;
export const selectVendorEventRequestsError = (state) => state.vendorEvents.requestsError;

export const selectSelectedVendorEventRequest = (state) => state.vendorEvents.selected;
export const selectSelectedVendorEventRequestStatus = (state) => state.vendorEvents.selectedStatus;
export const selectSelectedVendorEventRequestError = (state) => state.vendorEvents.selectedError;

export const selectVendorEventRespondStatus = (state) => state.vendorEvents.respondStatus;
export const selectVendorEventRespondError = (state) => state.vendorEvents.respondError;

export default vendorEventsSlice.reducer;
