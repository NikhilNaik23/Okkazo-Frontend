import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:8080';

// Async thunk for fetching all vendor applications (Admin only)
export const fetchVendorApplications = createAsyncThunk(
    'admin/fetchVendorApplications',
    async ({ status, limit = 50, skip = 0 } = {}, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            
            if (!accessToken) {
                return rejectWithValue('No access token found');
            }

            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (limit) params.append('limit', limit);
            if (skip) params.append('skip', skip);

            const url = `${API_BASE_URL}/api/vendor/applications${params.toString() ? `?${params.toString()}` : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch vendor applications');
            }

            return data.data; // returns { applications, total, limit, skip }
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for fetching a single vendor application by ID
export const fetchVendorApplicationById = createAsyncThunk(
    'admin/fetchVendorApplicationById',
    async (applicationId, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            
            if (!accessToken) {
                return rejectWithValue('No access token found');
            }

            const response = await fetch(`${API_BASE_URL}/api/vendor/registration/status/${applicationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch vendor application');
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for approving a vendor application
export const approveVendorApplication = createAsyncThunk(
    'admin/approveVendorApplication',
    async (applicationId, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetch(`${API_BASE_URL}/api/vendor/applications/${applicationId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to approve vendor');

            dispatch(fetchVendorApplications());
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for rejecting a vendor application
export const rejectVendorApplication = createAsyncThunk(
    'admin/rejectVendorApplication',
    async ({ applicationId, rejectionReason }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetch(`${API_BASE_URL}/api/vendor/applications/${applicationId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ rejectionReason }),
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to reject application');

            dispatch(fetchVendorApplications());
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for requesting documents from a vendor
export const requestVendorDocuments = createAsyncThunk(
    'admin/requestVendorDocuments',
    async ({ applicationId, requestedDocuments }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetch(`${API_BASE_URL}/api/vendor/applications/${applicationId}/request-documents`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ requestedDocuments }),
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to request documents');

            dispatch(fetchVendorApplications());
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for verifying a document
export const verifyDocument = createAsyncThunk(
    'admin/verifyDocument',
    async ({ applicationId, documentType, documentId }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetch(`${API_BASE_URL}/api/vendor/applications/${applicationId}/documents/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ documentType, documentId }),
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to verify document');

            dispatch(fetchVendorApplications());
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for rejecting a document
export const rejectDocument = createAsyncThunk(
    'admin/rejectDocument',
    async ({ applicationId, documentType, documentId, rejectionReason }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetch(`${API_BASE_URL}/api/vendor/applications/${applicationId}/documents/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ documentType, documentId, rejectionReason }),
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to reject document');

            dispatch(fetchVendorApplications());
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const initialState = {
    // Vendor applications
    vendorApplications: [],
    selectedVendorApplication: null,
    vendorApplicationsTotal: 0,
    
    // Loading states
    loading: false,
    loadingDetails: false,
    submitting: false,
    
    // Error states
    error: null,
    detailsError: null,
    submitError: null,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearSelectedVendorApplication: (state) => {
            state.selectedVendorApplication = null;
            state.detailsError = null;
        },
        clearAdminError: (state) => {
            state.error = null;
            state.detailsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all vendor applications
            .addCase(fetchVendorApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.vendorApplications = action.payload.applications;
                state.vendorApplicationsTotal = action.payload.total;
            })
            .addCase(fetchVendorApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch single vendor application
            .addCase(fetchVendorApplicationById.pending, (state) => {
                state.loadingDetails = true;
                state.detailsError = null;
            })
            .addCase(fetchVendorApplicationById.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.selectedVendorApplication = action.payload;
            })
            .addCase(fetchVendorApplicationById.rejected, (state, action) => {
                state.loadingDetails = false;
                state.detailsError = action.payload;
            })
            // Approve vendor application
            .addCase(approveVendorApplication.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(approveVendorApplication.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(approveVendorApplication.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })
            // Reject vendor application
            .addCase(rejectVendorApplication.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(rejectVendorApplication.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(rejectVendorApplication.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })
            // Request vendor documents
            .addCase(requestVendorDocuments.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(requestVendorDocuments.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(requestVendorDocuments.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })
            // Verify document
            .addCase(verifyDocument.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(verifyDocument.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(verifyDocument.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })
            // Reject document
            .addCase(rejectDocument.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(rejectDocument.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(rejectDocument.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            });
    },
});

export const { clearSelectedVendorApplication, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
