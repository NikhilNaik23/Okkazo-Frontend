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

export const updateVendorService = createAsyncThunk(
    'vendor/updateVendorService',
    async ({ id, payload }, { dispatch, rejectWithValue }) => {
        try {
            if (!id) return rejectWithValue('Service ID is required');

            const response = await fetchWithAuth(`${API_BASE_URL}/api/vendor/services/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload || {}),
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await safeJson(response);

            if (!response.ok || !data?.success) {
                const msg =
                    data?.error?.message ||
                    data?.message ||
                    `Failed to update service (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error — could not update service');
        }
    }
);

export const deleteVendorService = createAsyncThunk(
    'vendor/deleteVendorService',
    async ({ id }, { dispatch, rejectWithValue }) => {
        try {
            if (!id) return rejectWithValue('Service ID is required');

            const response = await fetchWithAuth(`${API_BASE_URL}/api/vendor/services/${id}`, {
                method: 'DELETE',
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await safeJson(response);

            if (!response.ok || !data?.success) {
                const msg =
                    data?.error?.message ||
                    data?.message ||
                    `Failed to delete service (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            // Backend returns: { success, data: { serviceId } }
            return data.data || { serviceId: id };
        } catch (error) {
            return rejectWithValue(error.message || 'Network error — could not delete service');
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
        updateServiceStatus: 'idle', // idle | loading | succeeded | failed
        updateServiceError: null,
        deleteServiceStatus: 'idle', // idle | loading | succeeded | failed
        deleteServiceError: null,
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
            })
            .addCase(updateVendorService.pending, (state) => {
                state.updateServiceStatus = 'loading';
                state.updateServiceError = null;
            })
            .addCase(updateVendorService.fulfilled, (state, action) => {
                state.updateServiceStatus = 'succeeded';
                state.updateServiceError = null;
                const updated = action.payload;
                const id = updated?._id || updated?.id;
                if (!id) return;
                const idx = state.myServices.findIndex((s) => String(s?._id) === String(id));
                if (idx !== -1) state.myServices[idx] = updated;
            })
            .addCase(updateVendorService.rejected, (state, action) => {
                state.updateServiceStatus = 'failed';
                state.updateServiceError = action.payload || action.error.message;
            })
            .addCase(deleteVendorService.pending, (state) => {
                state.deleteServiceStatus = 'loading';
                state.deleteServiceError = null;
            })
            .addCase(deleteVendorService.fulfilled, (state, action) => {
                state.deleteServiceStatus = 'succeeded';
                state.deleteServiceError = null;
                const serviceId = action.payload?.serviceId;
                if (!serviceId) return;
                state.myServices = state.myServices.filter((s) => String(s?._id) !== String(serviceId));
            })
            .addCase(deleteVendorService.rejected, (state, action) => {
                state.deleteServiceStatus = 'failed';
                state.deleteServiceError = action.payload || action.error.message;
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

export const selectUpdateServiceStatus = (state) => state.vendor.updateServiceStatus;
export const selectUpdateServiceError = (state) => state.vendor.updateServiceError;
export const selectDeleteServiceStatus = (state) => state.vendor.deleteServiceStatus;
export const selectDeleteServiceError = (state) => state.vendor.deleteServiceError;

export default vendorSlice.reducer;
