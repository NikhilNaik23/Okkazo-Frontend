import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth, fetchWithNgrok } from '../../utils/apiHandler';
import { refreshAccessToken } from './authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/users/team-access?${params.toString()}`, {
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

// Commission config (Admin only)
export const fetchCommissionConfig = createAsyncThunk(
    'admin/fetchCommissionConfig',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            if (!accessToken && !refreshToken) return rejectWithValue('No access token found');

            const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/commission`, {
                method: 'GET',
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch commission config');

            return data.data || data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateCommissionConfig = createAsyncThunk(
    'admin/updateCommissionConfig',
    async ({ rates, vendorHikeRate }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            if (!accessToken && !refreshToken) return rejectWithValue('No access token found');

            const payload = {};
            if (rates && typeof rates === 'object') payload.rates = rates;
            if (vendorHikeRate !== undefined && vendorHikeRate !== null && vendorHikeRate !== '') {
                payload.vendorHikeRate = Number(vendorHikeRate);
            }

            const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/commission`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to update commission config');

            return data.data || data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchDemandPricingConfig = createAsyncThunk(
    'admin/fetchDemandPricingConfig',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            if (!accessToken && !refreshToken) return rejectWithValue('No access token found');

            const response = await fetchWithAuth(`${API_BASE_URL}/api/events/config/fees`, {
                method: 'GET',
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch demand pricing config');

            return data.data || data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateDemandPricingConfig = createAsyncThunk(
    'admin/updateDemandPricingConfig',
    async ({ demandPricingMultipliers }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            if (!accessToken && !refreshToken) return rejectWithValue('No access token found');

            const response = await fetchWithAuth(`${API_BASE_URL}/api/events/config/fees`, {
                method: 'PATCH',
                body: JSON.stringify({ demandPricingMultipliers }),
            }, { dispatch, refreshAction: refreshAccessToken });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to update demand pricing config');

            return data.data || data;
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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/users/team-access/${authId}/block`, {
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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/users/team-access/${authId}/unblock`, {
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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/admin/managers`, {
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
            // Trigger immediate + delayed refreshes so Team Access updates as soon as
            // backend persistence completes.
            const refreshArgs = { page: 1, limit: 50 };
            dispatch(fetchTeamAccess(refreshArgs));
            setTimeout(() => dispatch(fetchTeamAccess(refreshArgs)), 1500);
            setTimeout(() => dispatch(fetchTeamAccess(refreshArgs)), 4000);

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

            const response = await fetchWithNgrok(url, {
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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/vendor/registration/status/${applicationId}`, {
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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/vendor/applications/${applicationId}/approve`, {
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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/vendor/applications/${applicationId}/reject`, {
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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/vendor/applications/${applicationId}/request-documents`, {
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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/vendor/applications/${applicationId}/documents/verify`, {
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

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/vendor/applications/${applicationId}/documents/reject`, {
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
            const response = await fetchWithNgrok(url, {
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

// ─── Admin Event (Promote) workflow ─────────────────────────────────────────

export const fetchAdminEventDashboard = createAsyncThunk(
    'admin/fetchAdminEventDashboard',
    async ({ limit = 200 } = {}, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const params = new URLSearchParams();
            if (limit) params.append('limit', limit);

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            };

            const [promoteRes, planningRes] = await Promise.all([
                fetchWithNgrok(`${API_BASE_URL}/api/events/promote/admin/dashboard?${params.toString()}`, { method: 'GET', headers }),
                fetchWithNgrok(`${API_BASE_URL}/api/events/planning/admin/dashboard?${params.toString()}`, { method: 'GET', headers }),
            ]);

            const [promoteJson, planningJson] = await Promise.all([
                promoteRes.json().catch(() => ({})),
                planningRes.json().catch(() => ({})),
            ]);

            if (!promoteRes.ok) {
                return rejectWithValue(promoteJson.message || 'Failed to fetch promote dashboard');
            }

            // Planning dashboard is best-effort; keep admin page usable even if planning endpoint is missing.
            const planningData = planningRes.ok ? planningJson.data : { assigned: [], applications: [], rejected: [] };
            const promoteData = promoteJson.data;

            const tag = (items, requestType) => (Array.isArray(items) ? items.map((i) => ({ ...i, requestType })) : []);

            return {
                assigned: [...tag(promoteData?.assigned, 'PROMOTE'), ...tag(planningData?.assigned, 'PLANNING')],
                applications: [...tag(promoteData?.applications, 'PROMOTE'), ...tag(planningData?.applications, 'PLANNING')],
                rejected: [...tag(promoteData?.rejected, 'PROMOTE'), ...tag(planningData?.rejected, 'PLANNING')],
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// ─── Manager auto-assign toggle (Admin only) ───────────────────────────────

export const fetchManagerAutoAssignConfig = createAsyncThunk(
    'admin/fetchManagerAutoAssignConfig',
    async (_, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/events/config/manager-autoassign`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch auto-assign config');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const setManagerAutoAssignEnabled = createAsyncThunk(
    'admin/setManagerAutoAssignEnabled',
    async ({ enabled }, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/events/config/manager-autoassign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ enabled: Boolean(enabled) }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to update auto-assign config');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchAdminEventRequestById = createAsyncThunk(
    'admin/fetchAdminEventRequestById',
    async (eventId, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            };

            const promoteRes = await fetchWithNgrok(`${API_BASE_URL}/api/events/promote/${encodeURIComponent(eventId)}`, {
                method: 'GET',
                headers,
            });

            const promoteJson = await promoteRes.json().catch(() => ({}));
            if (promoteRes.ok) return { requestType: 'PROMOTE', request: promoteJson.data };

            if (promoteRes.status !== 404) {
                return rejectWithValue(promoteJson.message || 'Failed to fetch event request');
            }

            const planningRes = await fetchWithNgrok(`${API_BASE_URL}/api/events/planning/${encodeURIComponent(eventId)}`, {
                method: 'GET',
                headers,
            });

            const planningJson = await planningRes.json().catch(() => ({}));
            if (!planningRes.ok) return rejectWithValue(planningJson.message || 'Failed to fetch planning request');

            return { requestType: 'PLANNING', request: planningJson.data };
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchPromoteEventRequestById = createAsyncThunk(
    'admin/fetchPromoteEventRequestById',
    async (eventId, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/events/promote/${encodeURIComponent(eventId)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch event request');

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const decidePromoteEventRequest = createAsyncThunk(
    'admin/decidePromoteEventRequest',
    async ({ eventId, decision, rejectionReason, managerId }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/events/promote/${encodeURIComponent(eventId)}/decision`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ decision, rejectionReason, managerId }),
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to update decision');

            dispatch(fetchAdminEventDashboard());
            dispatch(fetchPromoteEventRequestById(eventId));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const assignPromoteEventManager = createAsyncThunk(
    'admin/assignPromoteEventManager',
    async ({ eventId, managerId }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/events/promote/${encodeURIComponent(eventId)}/assign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ managerId }),
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to assign manager');

            dispatch(fetchAdminEventDashboard());
            dispatch(fetchUnavailableEventManagers({ eventId }));
            dispatch(fetchPromoteEventRequestById(eventId));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const assignPlanningEventManager = createAsyncThunk(
    'admin/assignPlanningEventManager',
    async ({ eventId, managerId }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/events/planning/${encodeURIComponent(eventId)}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ assignedManagerId: managerId }),
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to assign manager');

            dispatch(fetchAdminEventDashboard());
            dispatch(fetchUnavailableEventManagers({ eventId }));
            dispatch(fetchAdminEventRequestById(eventId));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const unassignPromoteEventManager = createAsyncThunk(
    'admin/unassignPromoteEventManager',
    async ({ eventId }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');
            if (!eventId) return rejectWithValue('Event ID is required');

            const response = await fetchWithNgrok(
                `${API_BASE_URL}/api/events/promote/${encodeURIComponent(eventId)}/unassign-manager`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to unassign manager');

            dispatch(fetchAdminEventDashboard());
            dispatch(fetchUnavailableEventManagers({ eventId }));
            dispatch(fetchAdminEventRequestById(eventId));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const unassignPlanningEventManager = createAsyncThunk(
    'admin/unassignPlanningEventManager',
    async ({ eventId }, { dispatch, rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');
            if (!eventId) return rejectWithValue('Event ID is required');

            const response = await fetchWithNgrok(
                `${API_BASE_URL}/api/events/planning/${encodeURIComponent(eventId)}/unassign-manager`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to unassign manager');

            dispatch(fetchAdminEventDashboard());
            dispatch(fetchUnavailableEventManagers({ eventId }));
            dispatch(fetchAdminEventRequestById(eventId));
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchUnavailableEventManagers = createAsyncThunk(
    'admin/fetchUnavailableEventManagers',
    async ({ eventId } = {}, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');

            const query = eventId
                ? `?eventId=${encodeURIComponent(String(eventId).trim())}`
                : '';

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/events/promote/admin/unavailable-managers${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch unavailable managers');

            return data.data?.managerIds || [];
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchEventVendorSelection = createAsyncThunk(
    'admin/fetchEventVendorSelection',
    async (eventId, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');
            if (!eventId) return rejectWithValue('Event ID is required');

            const response = await fetchWithNgrok(
                `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(eventId)}?includeVendors=true`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch vendor selection');

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchEventVendorAlternatives = createAsyncThunk(
    'admin/fetchEventVendorAlternatives',
    async ({ eventId, services = [] }, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');
            if (!eventId) return rejectWithValue('Event ID is required');

            const uniqueServices = Array.from(
                new Set(
                    (Array.isArray(services) ? services : [])
                        .map((s) => String(s || '').trim())
                        .filter(Boolean)
                )
            );

            if (uniqueServices.length === 0) return [];

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            };

            const responses = await Promise.all(
                uniqueServices.map(async (service) => {
                    const url = `${API_BASE_URL}/api/events/vendor-selection/${encodeURIComponent(eventId)}/alternatives?service=${encodeURIComponent(service)}&limit=8`;
                    const response = await fetchWithNgrok(url, { method: 'GET', headers });
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        return {
                            service,
                            alternatives: [],
                            vendorProfiles: [],
                            error: data.message || 'Failed to fetch alternatives',
                        };
                    }

                    return {
                        service,
                        alternatives: Array.isArray(data?.data?.alternatives) ? data.data.alternatives : [],
                        vendorProfiles: Array.isArray(data?.data?.vendorProfiles) ? data.data.vendorProfiles : [],
                    };
                })
            );

            return responses;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchEventTransactionsForAdmin = createAsyncThunk(
    'admin/fetchEventTransactionsForAdmin',
    async (eventId, { rejectWithValue }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return rejectWithValue('No access token found');
            if (!eventId) return rejectWithValue('Event ID is required');

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/orders/admin/${encodeURIComponent(eventId)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch transactions');

            return data.data;
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

    // Admin event requests (Promote)
    eventDashboard: {
        assigned: [],
        applications: [],
        rejected: [],
    },
    selectedEventRequest: null,
    selectedEventRequestType: null,
    selectedEventVendorSelection: null,
    selectedEventVendorAlternatives: [],
    selectedEventTransactions: null,
    unavailableManagerIds: [],
    
    // Loading states
    teamLoading: false,
    loading: false,
    loadingDetails: false,
    submitting: false,

    eventDashboardLoading: false,
    eventRequestLoading: false,
    unavailableManagersLoading: false,

    eventVendorSelectionLoading: false,
    eventVendorAlternativesLoading: false,
    eventTransactionsLoading: false,

    managerAutoAssignLoading: false,
    managerAutoAssignUpdating: false,
    
    // Error states
    teamError: null,
    error: null,
    detailsError: null,
    submitError: null,

    eventDashboardError: null,
    eventRequestError: null,
    unavailableManagersError: null,

    eventVendorSelectionError: null,
    eventVendorAlternativesError: null,
    eventTransactionsError: null,

    managerAutoAssignError: null,
    managerAutoAssignConfig: null,

    // Commission config
    commissionConfig: null,
    commissionLoading: false,
    commissionUpdating: false,
    commissionError: null,
    commissionUpdateError: null,

    // Demand pricing config
    demandPricingConfig: null,
    demandPricingLoading: false,
    demandPricingUpdating: false,
    demandPricingError: null,
    demandPricingUpdateError: null,
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
        clearSelectedEventRequest: (state) => {
            state.selectedEventRequest = null;
            state.selectedEventRequestType = null;
            state.selectedEventVendorSelection = null;
            state.selectedEventVendorAlternatives = [];
            state.selectedEventTransactions = null;
            state.eventRequestError = null;
            state.eventVendorSelectionError = null;
            state.eventVendorAlternativesError = null;
            state.eventTransactionsError = null;
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
            })

            // Admin event dashboard
            .addCase(fetchAdminEventDashboard.pending, (state) => {
                state.eventDashboardLoading = true;
                state.eventDashboardError = null;
            })
            .addCase(fetchAdminEventDashboard.fulfilled, (state, action) => {
                state.eventDashboardLoading = false;
                state.eventDashboard = action.payload || state.eventDashboard;
            })
            .addCase(fetchAdminEventDashboard.rejected, (state, action) => {
                state.eventDashboardLoading = false;
                state.eventDashboardError = action.payload;
            })

            // Manager auto-assign config
            .addCase(fetchManagerAutoAssignConfig.pending, (state) => {
                state.managerAutoAssignLoading = true;
                state.managerAutoAssignError = null;
            })
            .addCase(fetchManagerAutoAssignConfig.fulfilled, (state, action) => {
                state.managerAutoAssignLoading = false;
                state.managerAutoAssignConfig = action.payload || null;
            })
            .addCase(fetchManagerAutoAssignConfig.rejected, (state, action) => {
                state.managerAutoAssignLoading = false;
                state.managerAutoAssignError = action.payload;
            })
            .addCase(setManagerAutoAssignEnabled.pending, (state) => {
                state.managerAutoAssignUpdating = true;
                state.managerAutoAssignError = null;
            })
            .addCase(setManagerAutoAssignEnabled.fulfilled, (state, action) => {
                state.managerAutoAssignUpdating = false;
                state.managerAutoAssignConfig = action.payload || state.managerAutoAssignConfig;
            })
            .addCase(setManagerAutoAssignEnabled.rejected, (state, action) => {
                state.managerAutoAssignUpdating = false;
                state.managerAutoAssignError = action.payload;
            })

            // Single event request
            .addCase(fetchAdminEventRequestById.pending, (state) => {
                state.eventRequestLoading = true;
                state.eventRequestError = null;
                state.selectedEventVendorSelection = null;
                state.selectedEventVendorAlternatives = [];
                state.selectedEventTransactions = null;
                state.eventVendorSelectionError = null;
                state.eventVendorAlternativesError = null;
                state.eventTransactionsError = null;
            })
            .addCase(fetchAdminEventRequestById.fulfilled, (state, action) => {
                state.eventRequestLoading = false;
                state.selectedEventRequest = action.payload?.request || null;
                state.selectedEventRequestType = action.payload?.requestType || null;
            })
            .addCase(fetchAdminEventRequestById.rejected, (state, action) => {
                state.eventRequestLoading = false;
                state.eventRequestError = action.payload;
            })
            .addCase(fetchPromoteEventRequestById.pending, (state) => {
                state.eventRequestLoading = true;
                state.eventRequestError = null;
            })
            .addCase(fetchPromoteEventRequestById.fulfilled, (state, action) => {
                state.eventRequestLoading = false;
                state.selectedEventRequest = action.payload;
                state.selectedEventRequestType = 'PROMOTE';
            })
            .addCase(fetchPromoteEventRequestById.rejected, (state, action) => {
                state.eventRequestLoading = false;
                state.eventRequestError = action.payload;
            })

            // Decide / assign manager
            .addCase(decidePromoteEventRequest.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(decidePromoteEventRequest.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(decidePromoteEventRequest.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })
            .addCase(assignPromoteEventManager.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(assignPromoteEventManager.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(assignPromoteEventManager.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })

            .addCase(assignPlanningEventManager.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(assignPlanningEventManager.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(assignPlanningEventManager.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })

            .addCase(unassignPromoteEventManager.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(unassignPromoteEventManager.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(unassignPromoteEventManager.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })

            .addCase(unassignPlanningEventManager.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(unassignPlanningEventManager.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(unassignPlanningEventManager.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })

            // Unavailable managers
            .addCase(fetchUnavailableEventManagers.pending, (state) => {
                state.unavailableManagersLoading = true;
                state.unavailableManagersError = null;
            })
            .addCase(fetchUnavailableEventManagers.fulfilled, (state, action) => {
                state.unavailableManagersLoading = false;
                state.unavailableManagerIds = action.payload || [];
            })
            .addCase(fetchUnavailableEventManagers.rejected, (state, action) => {
                state.unavailableManagersLoading = false;
                state.unavailableManagersError = action.payload;
            })

            // Vendor selection (planning)
            .addCase(fetchEventVendorSelection.pending, (state) => {
                state.eventVendorSelectionLoading = true;
                state.eventVendorSelectionError = null;
            })
            .addCase(fetchEventVendorSelection.fulfilled, (state, action) => {
                state.eventVendorSelectionLoading = false;
                state.selectedEventVendorSelection = action.payload || null;
            })
            .addCase(fetchEventVendorSelection.rejected, (state, action) => {
                state.eventVendorSelectionLoading = false;
                state.eventVendorSelectionError = action.payload;
            })

            // Vendor alternatives (planning)
            .addCase(fetchEventVendorAlternatives.pending, (state) => {
                state.eventVendorAlternativesLoading = true;
                state.eventVendorAlternativesError = null;
            })
            .addCase(fetchEventVendorAlternatives.fulfilled, (state, action) => {
                state.eventVendorAlternativesLoading = false;
                state.selectedEventVendorAlternatives = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchEventVendorAlternatives.rejected, (state, action) => {
                state.eventVendorAlternativesLoading = false;
                state.eventVendorAlternativesError = action.payload;
            })

            // Transactions (admin)
            .addCase(fetchEventTransactionsForAdmin.pending, (state) => {
                state.eventTransactionsLoading = true;
                state.eventTransactionsError = null;
            })
            .addCase(fetchEventTransactionsForAdmin.fulfilled, (state, action) => {
                state.eventTransactionsLoading = false;
                state.selectedEventTransactions = action.payload || null;
            })
            .addCase(fetchEventTransactionsForAdmin.rejected, (state, action) => {
                state.eventTransactionsLoading = false;
                state.eventTransactionsError = action.payload;
            })

            // Commission config
            .addCase(fetchCommissionConfig.pending, (state) => {
                state.commissionLoading = true;
                state.commissionError = null;
            })
            .addCase(fetchCommissionConfig.fulfilled, (state, action) => {
                state.commissionLoading = false;
                state.commissionConfig = action.payload || null;
            })
            .addCase(fetchCommissionConfig.rejected, (state, action) => {
                state.commissionLoading = false;
                state.commissionError = action.payload;
            })
            .addCase(updateCommissionConfig.pending, (state) => {
                state.commissionUpdating = true;
                state.commissionUpdateError = null;
            })
            .addCase(updateCommissionConfig.fulfilled, (state, action) => {
                state.commissionUpdating = false;
                state.commissionConfig = action.payload || state.commissionConfig;
            })
            .addCase(updateCommissionConfig.rejected, (state, action) => {
                state.commissionUpdating = false;
                state.commissionUpdateError = action.payload;
            })

            // Demand pricing config
            .addCase(fetchDemandPricingConfig.pending, (state) => {
                state.demandPricingLoading = true;
                state.demandPricingError = null;
            })
            .addCase(fetchDemandPricingConfig.fulfilled, (state, action) => {
                state.demandPricingLoading = false;
                state.demandPricingConfig = action.payload || null;
            })
            .addCase(fetchDemandPricingConfig.rejected, (state, action) => {
                state.demandPricingLoading = false;
                state.demandPricingError = action.payload;
            })
            .addCase(updateDemandPricingConfig.pending, (state) => {
                state.demandPricingUpdating = true;
                state.demandPricingUpdateError = null;
            })
            .addCase(updateDemandPricingConfig.fulfilled, (state, action) => {
                state.demandPricingUpdating = false;
                state.demandPricingConfig = action.payload || state.demandPricingConfig;
            })
            .addCase(updateDemandPricingConfig.rejected, (state, action) => {
                state.demandPricingUpdating = false;
                state.demandPricingUpdateError = action.payload;
            });
    },
});

export const { clearSelectedVendorApplication, clearAdminError, resetCreateManager, clearSelectedEventRequest } = adminSlice.actions;
export default adminSlice.reducer;
