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

export const addVendorService = createAsyncThunk(
    'vendor/addVendorService',
    async ({ payload }, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/vendor/services`, {
                method: 'POST',
                body: JSON.stringify(payload),
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await safeJson(response);

            if (!response.ok || !data?.success) {
                const msg =
                    data?.error?.message ||
                    data?.message ||
                    `Failed to save service (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error — could not save service');
        }
    }
);

export const fetchMyVendorServices = createAsyncThunk(
    'vendor/fetchMyVendorServices',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/vendor/services/me`, {
                method: 'GET',
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await safeJson(response);

            if (!response.ok || !data?.success) {
                const msg =
                    data?.error?.message ||
                    data?.message ||
                    `Failed to fetch services (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            // Backend returns: { success, data: { services, total, limit, skip } }
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error — could not fetch services');
        }
    }
);

const vendorSlice = createSlice({
    name: 'vendor',
    initialState: {
        myServices: [],
        myServicesStatus: 'idle', // idle | loading | succeeded | failed
        myServicesError: null,
        addServiceStatus: 'idle', // idle | loading | succeeded | failed
        addServiceError: null,
    },
    reducers: {
        clearAddServiceError: (state) => {
            state.addServiceError = null;
        },
        resetAddServiceStatus: (state) => {
            state.addServiceStatus = 'idle';
            state.addServiceError = null;
        },
        updateServiceLocally: (state, action) => {
            const { id, changes } = action.payload || {};
            if (!id) return;
            const idx = state.myServices.findIndex((s) => String(s?._id) === String(id));
            if (idx === -1) return;
            state.myServices[idx] = { ...state.myServices[idx], ...changes };
        },
        deleteServiceLocally: (state, action) => {
            const { id } = action.payload || {};
            if (!id) return;
            state.myServices = state.myServices.filter((s) => String(s?._id) !== String(id));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyVendorServices.pending, (state) => {
                state.myServicesStatus = 'loading';
                state.myServicesError = null;
            })
            .addCase(fetchMyVendorServices.fulfilled, (state, action) => {
                state.myServicesStatus = 'succeeded';
                state.myServicesError = null;
                state.myServices = action.payload?.services || [];
            })
            .addCase(fetchMyVendorServices.rejected, (state, action) => {
                state.myServicesStatus = 'failed';
                state.myServicesError = action.payload || action.error.message;
            })
            .addCase(addVendorService.pending, (state) => {
                state.addServiceStatus = 'loading';
                state.addServiceError = null;
            })
            .addCase(addVendorService.fulfilled, (state, action) => {
                state.addServiceStatus = 'succeeded';
                state.addServiceError = null;
                if (action.payload) {
                    state.myServices = [action.payload, ...(state.myServices || [])];
                }
            })
            .addCase(addVendorService.rejected, (state, action) => {
                state.addServiceStatus = 'failed';
                state.addServiceError = action.payload || action.error.message;
            });
    },
});

export const {
    clearAddServiceError,
    resetAddServiceStatus,
    updateServiceLocally,
    deleteServiceLocally,
} = vendorSlice.actions;

export const selectAddServiceStatus = (state) => state.vendor.addServiceStatus;
export const selectAddServiceError = (state) => state.vendor.addServiceError;

export const selectMyServices = (state) => state.vendor.myServices;
export const selectMyServicesStatus = (state) => state.vendor.myServicesStatus;
export const selectMyServicesError = (state) => state.vendor.myServicesError;

export default vendorSlice.reducer;
