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

export const fetchManagerPlanningRefundRequests = createAsyncThunk(
  'managerRefunds/fetchManagerPlanningRefundRequests',
  async ({ limit = 200, statuses = [] } = {}, { dispatch, rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));

      if (Array.isArray(statuses) && statuses.length > 0) {
        params.set('statuses', statuses.map((status) => String(status || '').trim()).filter(Boolean).join(','));
      }

      const [planningResponse, promoteResponse] = await Promise.all([
        fetchWithAuth(
          `${API_BASE_URL}/api/events/planning/manager/refund-requests?${params.toString()}`,
          { method: 'GET' },
          { dispatch, refreshAction: refreshAccessToken }
        ),
        fetchWithAuth(
          `${API_BASE_URL}/api/events/promote/manager/refund-requests?${params.toString()}`,
          { method: 'GET' },
          { dispatch, refreshAction: refreshAccessToken }
        ),
      ]);

      const [planningData, promoteData] = await Promise.all([
        safeJson(planningResponse),
        safeJson(promoteResponse),
      ]);

      if (!planningResponse.ok) {
        return rejectWithValue(planningData?.message || 'Failed to fetch planning refund requests');
      }

      if (!promoteResponse.ok) {
        return rejectWithValue(promoteData?.message || 'Failed to fetch promote refund requests');
      }

      const planningRequests = Array.isArray(planningData?.data?.requests)
        ? planningData.data.requests.map((request) => ({ ...request, refundEventType: 'PLANNING' }))
        : [];
      const promoteRequests = Array.isArray(promoteData?.data?.requests)
        ? promoteData.data.requests.map((request) => ({ ...request, refundEventType: 'PROMOTE' }))
        : [];

      return [...planningRequests, ...promoteRequests]
        .sort((a, b) => {
          const left = Date.parse(a?.refundRequest?.requestedAt || a?.createdAt || 0) || 0;
          const right = Date.parse(b?.refundRequest?.requestedAt || b?.createdAt || 0) || 0;
          return right - left;
        });
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const initialState = {
  requests: [],
  loading: false,
  error: null,
};

const managerRefundsSlice = createSlice({
  name: 'managerRefunds',
  initialState,
  reducers: {
    clearManagerRefundsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchManagerPlanningRefundRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerPlanningRefundRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload || [];
      })
      .addCase(fetchManagerPlanningRefundRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch refund requests';
      });
  },
});

export const { clearManagerRefundsError } = managerRefundsSlice.actions;

export default managerRefundsSlice.reducer;
