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

// Public: fetch a service by id (sanitized)
// GET /api/vendor/public/services/:serviceId
export const fetchPublicServiceById = createAsyncThunk(
    'vendor/fetchPublicServiceById',
    async ({ serviceId }, { rejectWithValue }) => {
        try {
            const id = String(serviceId || '').trim();
            if (!id) return rejectWithValue('Service ID is required');

            const response = await fetch(`${API_BASE_URL}/api/vendor/public/services/${encodeURIComponent(id)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                const msg =
                    data?.error?.message ||
                    data?.message ||
                    `Failed to fetch service (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            const service = data?.data?.service || null;
            return { serviceId: id, service };
        } catch (error) {
            return rejectWithValue(error.message || 'Network error — could not fetch service');
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

export const uploadVenueServiceImages = createAsyncThunk(
    'vendor/uploadVenueServiceImages',
    async ({ id, files }, { dispatch, rejectWithValue }) => {
        try {
            if (!id) return rejectWithValue('Service ID is required');

            const fileList = Array.isArray(files) ? files : Array.from(files || []);
            if (fileList.length === 0) {
                return rejectWithValue('At least one image file is required');
            }

            const formData = new FormData();
            fileList.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/vendor/services/${id}/images`,
                {
                    method: 'POST',
                    body: formData,
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);

            if (!response.ok || !data?.success) {
                const msg =
                    data?.error?.message ||
                    data?.message ||
                    `Failed to upload images (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error — could not upload images');
        }
    }
);

export const deleteVenueServiceImage = createAsyncThunk(
    'vendor/deleteVenueServiceImage',
    async ({ id, publicId }, { dispatch, rejectWithValue }) => {
        try {
            if (!id) return rejectWithValue('Service ID is required');
            if (!publicId) return rejectWithValue('publicId is required');

            const url = `${API_BASE_URL}/api/vendor/services/${id}/images?publicId=${encodeURIComponent(String(publicId))}`;
            const response = await fetchWithAuth(url, { method: 'DELETE' }, { dispatch, refreshAction: refreshAccessToken });
            const data = await safeJson(response);

            if (!response.ok || !data?.success) {
                const msg =
                    data?.error?.message ||
                    data?.message ||
                    `Failed to delete image (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error — could not delete image');
        }
    }
);

export const setVenueServiceProfileImage = createAsyncThunk(
    'vendor/setVenueServiceProfileImage',
    async ({ id, publicId }, { dispatch, rejectWithValue }) => {
        try {
            if (!id) return rejectWithValue('Service ID is required');
            if (!publicId) return rejectWithValue('publicId is required');

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/vendor/services/${id}/images/profile`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ publicId: String(publicId) }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);

            if (!response.ok || !data?.success) {
                const msg =
                    data?.error?.message ||
                    data?.message ||
                    `Failed to set profile image (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error — could not set profile image');
        }
    }
);

export const resolveGoogleMapsUrl = createAsyncThunk(
    'vendor/resolveGoogleMapsUrl',
    async ({ url }, { dispatch, rejectWithValue }) => {
        try {
            if (!url) return rejectWithValue('url is required');

            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/vendor/utils/resolve-maps-url?url=${encodeURIComponent(String(url))}`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            const data = await safeJson(response);

            if (!response.ok || !data?.success) {
                const msg =
                    data?.error?.message ||
                    data?.message ||
                    `Failed to resolve url (HTTP ${response.status})`;
                return rejectWithValue(msg);
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error — could not resolve url');
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

        publicServicesById: {},
        publicServiceStatusById: {}, // { [serviceId]: idle|loading|succeeded|failed }
        publicServiceErrorById: {},

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
            .addCase(fetchPublicServiceById.pending, (state, action) => {
                const serviceId = action.meta?.arg?.serviceId;
                if (!serviceId) return;
                state.publicServiceStatusById[serviceId] = 'loading';
                state.publicServiceErrorById[serviceId] = null;
            })
            .addCase(fetchPublicServiceById.fulfilled, (state, action) => {
                const serviceId = action.payload?.serviceId;
                const service = action.payload?.service || null;
                if (!serviceId) return;
                state.publicServiceStatusById[serviceId] = 'succeeded';
                state.publicServiceErrorById[serviceId] = null;
                if (service) state.publicServicesById[serviceId] = service;
            })
            .addCase(fetchPublicServiceById.rejected, (state, action) => {
                const serviceId = action.meta?.arg?.serviceId;
                if (!serviceId) return;
                state.publicServiceStatusById[serviceId] = 'failed';
                state.publicServiceErrorById[serviceId] = action.payload || action.error.message;
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
            })
            .addCase(uploadVenueServiceImages.fulfilled, (state, action) => {
                // Treat image upload as a service update: backend returns updated service doc
                const updated = action.payload;
                const id = updated?._id || updated?.id;
                if (!id) return;
                const idx = state.myServices.findIndex((s) => String(s?._id) === String(id));
                if (idx !== -1) state.myServices[idx] = updated;
            })
            .addCase(deleteVenueServiceImage.fulfilled, (state, action) => {
                const updated = action.payload;
                const id = updated?._id || updated?.id;
                if (!id) return;
                const idx = state.myServices.findIndex((s) => String(s?._id) === String(id));
                if (idx !== -1) state.myServices[idx] = updated;
            })
            .addCase(setVenueServiceProfileImage.fulfilled, (state, action) => {
                const updated = action.payload;
                const id = updated?._id || updated?.id;
                if (!id) return;
                const idx = state.myServices.findIndex((s) => String(s?._id) === String(id));
                if (idx !== -1) state.myServices[idx] = updated;
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

export const selectPublicServicesById = (state) => state.vendor.publicServicesById;
export const selectPublicServiceStatusById = (state) => state.vendor.publicServiceStatusById;
export const selectPublicServiceErrorById = (state) => state.vendor.publicServiceErrorById;

export const selectUpdateServiceStatus = (state) => state.vendor.updateServiceStatus;
export const selectUpdateServiceError = (state) => state.vendor.updateServiceError;
export const selectDeleteServiceStatus = (state) => state.vendor.deleteServiceStatus;
export const selectDeleteServiceError = (state) => state.vendor.deleteServiceError;

export default vendorSlice.reducer;
