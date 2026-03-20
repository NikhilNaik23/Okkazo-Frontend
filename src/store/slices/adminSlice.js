import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:8080';

const isPendingInvite = (member) => typeof member?.authId === 'string' && member.authId.startsWith('pending:');

const buildOptimisticManagerInvite = ({ name, email, department, assignedRole }) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (name || '').trim();

    return {
        authId: `pending:${normalizedEmail}`,
        name: trimmedName,
        email: normalizedEmail,
        role: 'MANAGER',
        assignedRole: assignedRole || 'Manager',
        department,
        isActive: true,
        status: 'UNVERIFIED',
        lastActive: null,
        access: assignedRole || 'Manager Access',
    };
};

// Async thunk for fetching Team Access data (Admin only)
export const fetchTeamAccess = createAsyncThunk(
    'admin/fetchTeamAccess',
    async ({ search = '', page = 1, limit = 10 } = {}, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('page', page);
            params.append('limit', limit);

            const response = await fetch(`${API_BASE_URL}/api/users/team-access?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch team access data');

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const blockTeamMember = createAsyncThunk(
    'admin/blockTeamMember',
    async (authId, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetch(`${API_BASE_URL}/api/users/team-access/${authId}/block`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to block team member');

            dispatch(fetchTeamAccess({ page: 1, limit: 50 }));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const unblockTeamMember = createAsyncThunk(
    'admin/unblockTeamMember',
    async (authId, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetch(`${API_BASE_URL}/api/users/team-access/${authId}/unblock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to unblock team member');

            dispatch(fetchTeamAccess({ page: 1, limit: 50 }));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for creating a manager (Admin only)
export const createManager = createAsyncThunk(
    'admin/createManager',
    async ({ name, email, department, assignedRole }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetch(`${API_BASE_URL}/api/admin/managers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ name, email, department, assignedRole }),
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to create manager');

            // Backend returns 202 and processes creation asynchronously (Kafka).
            // We still trigger a refresh, but the UI will also optimistically show the invite.
            dispatch(fetchTeamAccess({ page: 1, limit: 50 }));

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

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

// Admin/Manager: fetch a vendor's services by authId
export const fetchVendorServicesByAuthId = createAsyncThunk(
    'admin/fetchVendorServicesByAuthId',
    async ({ vendorAuthId, limit = 100, skip = 0 } = {}, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');
            if (!vendorAuthId) return rejectWithValue('vendorAuthId is required');

            const params = new URLSearchParams();
            if (limit != null) params.append('limit', String(limit));
            if (skip != null) params.append('skip', String(skip));

            const url = `${API_BASE_URL}/api/vendor/services/vendor/${encodeURIComponent(String(vendorAuthId))}${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data?.message || 'Failed to fetch vendor services');

            return { vendorAuthId: String(vendorAuthId), result: data.data };
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const initialState = {
    // Team access
    teamMembers: [],
    teamStats: {
        totalMembers: 0,
        admins: 0,
        managers: 0,
        activeMembers: 0,
        pendingInvites: 0,
    },
    teamPagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    // Vendor applications
    vendorApplications: [],
    selectedVendorApplication: null,
    vendorApplicationsTotal: 0,

    // Vendor services (by vendor authId)
    vendorServicesByAuthId: {},
    vendorServicesLoadingByAuthId: {},
    vendorServicesErrorByAuthId: {},

    // Manager creation
    createManagerSuccess: false,
    
    // Loading states
    teamLoading: false,
    loading: false,
    loadingDetails: false,
    submitting: false,
    
    // Error states
    teamError: null,
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
            state.teamError = null;
            state.error = null;
            state.detailsError = null;
        },
        resetCreateManager: (state) => {
            state.createManagerSuccess = false;
            state.submitError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch team access
            .addCase(fetchTeamAccess.pending, (state) => {
                state.teamLoading = true;
                state.teamError = null;
            })
            .addCase(fetchTeamAccess.fulfilled, (state, action) => {
                state.teamLoading = false;
                const incomingMembers = action.payload.members || [];
                const incomingStats = action.payload.stats || state.teamStats;
                const incomingPagination = action.payload.pagination || state.teamPagination;

                const incomingEmails = new Set(incomingMembers.map((m) => (m?.email || '').toLowerCase()));
                const pendingInvites = (state.teamMembers || []).filter((m) => isPendingInvite(m) && !incomingEmails.has((m?.email || '').toLowerCase()));

                state.teamMembers = [...pendingInvites, ...incomingMembers];

                const pendingCount = pendingInvites.length;
                if (pendingCount > 0) {
                    state.teamStats = {
                        ...incomingStats,
                        totalMembers: (incomingStats.totalMembers || 0) + pendingCount,
                        managers: (incomingStats.managers || 0) + pendingCount,
                        activeMembers: (incomingStats.activeMembers || 0) + pendingCount,
                        pendingInvites: (incomingStats.pendingInvites || 0) + pendingCount,
                    };

                    state.teamPagination = {
                        ...incomingPagination,
                        total: (incomingPagination.total || 0) + pendingCount,
                    };
                } else {
                    state.teamStats = incomingStats;
                    state.teamPagination = incomingPagination;
                }
            })
            .addCase(fetchTeamAccess.rejected, (state, action) => {
                state.teamLoading = false;
                state.teamError = action.payload;
            })
            .addCase(blockTeamMember.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(blockTeamMember.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(blockTeamMember.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })
            .addCase(unblockTeamMember.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(unblockTeamMember.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(unblockTeamMember.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })
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
            })

            // Vendor services (by authId)
            .addCase(fetchVendorServicesByAuthId.pending, (state, action) => {
                const vendorAuthId = action.meta?.arg?.vendorAuthId;
                if (!vendorAuthId) return;
                state.vendorServicesLoadingByAuthId[vendorAuthId] = true;
                state.vendorServicesErrorByAuthId[vendorAuthId] = null;
            })
            .addCase(fetchVendorServicesByAuthId.fulfilled, (state, action) => {
                const vendorAuthId = action.payload?.vendorAuthId;
                if (!vendorAuthId) return;
                state.vendorServicesLoadingByAuthId[vendorAuthId] = false;
                state.vendorServicesErrorByAuthId[vendorAuthId] = null;
                state.vendorServicesByAuthId[vendorAuthId] = action.payload?.result || { services: [], total: 0 };
            })
            .addCase(fetchVendorServicesByAuthId.rejected, (state, action) => {
                const vendorAuthId = action.meta?.arg?.vendorAuthId;
                if (!vendorAuthId) return;
                state.vendorServicesLoadingByAuthId[vendorAuthId] = false;
                state.vendorServicesErrorByAuthId[vendorAuthId] = action.payload;
            })
            // Create manager
            .addCase(createManager.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
                state.createManagerSuccess = false;
            })
            .addCase(createManager.fulfilled, (state, action) => {
                state.submitting = false;
                state.createManagerSuccess = true;

                const payload = action.payload || {};
                const name = payload.name || action.meta?.arg?.name;
                const email = payload.email || action.meta?.arg?.email;
                const department = payload.department || action.meta?.arg?.department;
                const assignedRole = payload.assignedRole || action.meta?.arg?.assignedRole;

                const normalizedEmail = (email || '').trim().toLowerCase();
                if (!normalizedEmail) return;

                const existsAlready = (state.teamMembers || []).some((m) => (m?.email || '').toLowerCase() === normalizedEmail);
                if (!existsAlready) {
                    const optimistic = buildOptimisticManagerInvite({ name, email: normalizedEmail, department, assignedRole });
                    state.teamMembers = [optimistic, ...(state.teamMembers || [])];

                    state.teamStats = {
                        ...state.teamStats,
                        totalMembers: (state.teamStats.totalMembers || 0) + 1,
                        managers: (state.teamStats.managers || 0) + 1,
                        activeMembers: (state.teamStats.activeMembers || 0) + 1,
                        pendingInvites: (state.teamStats.pendingInvites || 0) + 1,
                    };

                    state.teamPagination = {
                        ...state.teamPagination,
                        total: (state.teamPagination.total || 0) + 1,
                    };
                }
            })
            .addCase(createManager.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            });
    },
});

export const { clearSelectedVendorApplication, clearAdminError, resetCreateManager } = adminSlice.actions;
export default adminSlice.reducer;