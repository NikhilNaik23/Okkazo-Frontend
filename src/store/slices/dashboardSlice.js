import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../utils/apiHandler';
import { refreshAccessToken } from './authSlice';

const API_BASE_URL = 'http://localhost:8080';

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

export const fetchDashboardMarketplaceEvents = createAsyncThunk(
    'dashboard/fetchMarketplaceEvents',
    async ({ limit = 300 } = {}, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/tickets/marketplace/events?limit=${encodeURIComponent(String(limit))}`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                return rejectWithValue(data?.message || 'Failed to fetch marketplace events');
            }

            return Array.isArray(data?.data?.events) ? data.data.events : [];
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchDashboardInterestFields = createAsyncThunk(
    'dashboard/fetchInterestFields',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/tickets/my/interests`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                return rejectWithValue(data?.message || 'Failed to fetch ticket interests');
            }

            return Array.isArray(data?.data?.fields) ? data.data.fields : [];
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchDashboardData',
    async ({ limit = 300 } = {}, { dispatch }) => {
        const [marketRes, interestRes] = await Promise.all([
            dispatch(fetchDashboardMarketplaceEvents({ limit })),
            dispatch(fetchDashboardInterestFields()),
        ]);

        return {
            marketplaceRequestStatus: marketRes?.meta?.requestStatus || 'unknown',
            interestsRequestStatus: interestRes?.meta?.requestStatus || 'unknown',
        };
    }
);

const initialState = {
    marketplaceEvents: [],
    interestFields: [],
    loadingMarketplace: false,
    loadingInterests: false,
    loadingDashboard: false,
    marketplaceError: null,
    interestsError: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardErrors: (state) => {
            state.marketplaceError = null;
            state.interestsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardMarketplaceEvents.pending, (state) => {
                state.loadingMarketplace = true;
                state.marketplaceError = null;
            })
            .addCase(fetchDashboardMarketplaceEvents.fulfilled, (state, action) => {
                state.loadingMarketplace = false;
                state.marketplaceEvents = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchDashboardMarketplaceEvents.rejected, (state, action) => {
                state.loadingMarketplace = false;
                state.marketplaceEvents = [];
                state.marketplaceError = action.payload || action.error?.message || 'Failed to fetch marketplace events';
            })

            .addCase(fetchDashboardInterestFields.pending, (state) => {
                state.loadingInterests = true;
                state.interestsError = null;
            })
            .addCase(fetchDashboardInterestFields.fulfilled, (state, action) => {
                state.loadingInterests = false;
                state.interestFields = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchDashboardInterestFields.rejected, (state, action) => {
                state.loadingInterests = false;
                state.interestFields = [];
                state.interestsError = action.payload || action.error?.message || 'Failed to fetch ticket interests';
            })

            .addCase(fetchDashboardData.pending, (state) => {
                state.loadingDashboard = true;
            })
            .addCase(fetchDashboardData.fulfilled, (state) => {
                state.loadingDashboard = false;
            })
            .addCase(fetchDashboardData.rejected, (state) => {
                state.loadingDashboard = false;
            });
    },
});

export const { clearDashboardErrors } = dashboardSlice.actions;

export const selectDashboardMarketplaceEvents = (state) => state.dashboard.marketplaceEvents;
export const selectDashboardInterestFields = (state) => state.dashboard.interestFields;
export const selectDashboardIsLoading = (state) =>
    Boolean(state.dashboard.loadingDashboard || state.dashboard.loadingMarketplace || state.dashboard.loadingInterests);
export const selectDashboardErrors = (state) => ({
    marketplaceError: state.dashboard.marketplaceError,
    interestsError: state.dashboard.interestsError,
});

export default dashboardSlice.reducer;
