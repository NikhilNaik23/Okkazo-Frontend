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

export const fetchManagerPlanningEvents = createAsyncThunk(
  'managerEvents/fetchManagerPlanningEvents',
  async ({ limit = 200 } = {}, { dispatch, rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({ limit: String(limit) }).toString();
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/events/planning/manager/events?${qs}`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok) {
        return rejectWithValue(data?.message || 'Failed to fetch manager planning events');
      }

      return Array.isArray(data?.data?.events) ? data.data.events : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchManagerPlanningApplications = createAsyncThunk(
  'managerEvents/fetchManagerPlanningApplications',
  async ({ limit = 200 } = {}, { dispatch, rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({ limit: String(limit) }).toString();
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/events/planning/manager/applications?${qs}`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok) {
        return rejectWithValue(data?.message || 'Failed to fetch planning applications');
      }

      return Array.isArray(data?.data?.applications) ? data.data.applications : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchManagerPromoteEvents = createAsyncThunk(
  'managerEvents/fetchManagerPromoteEvents',
  async ({ limit = 200 } = {}, { dispatch, rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({ limit: String(limit) }).toString();
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/events/promote/manager/events?${qs}`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok) {
        return rejectWithValue(data?.message || 'Failed to fetch manager promote events');
      }

      return Array.isArray(data?.data?.events) ? data.data.events : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const initialState = {
  planningEvents: [],
  promoteEvents: [],
  planningApplications: [],
  loading: false,
  error: null,
};

const managerEventsSlice = createSlice({
  name: 'managerEvents',
  initialState,
  reducers: {
    clearManagerEventsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchManagerPlanningEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerPlanningEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.planningEvents = action.payload || [];
      })
      .addCase(fetchManagerPlanningEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch planning events';
      })

      .addCase(fetchManagerPromoteEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerPromoteEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.promoteEvents = action.payload || [];
      })
      .addCase(fetchManagerPromoteEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch promote events';
      })

      .addCase(fetchManagerPlanningApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerPlanningApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.planningApplications = action.payload || [];
      })
      .addCase(fetchManagerPlanningApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch applications';
      });
  },
});

export const { clearManagerEventsError } = managerEventsSlice.actions;

export default managerEventsSlice.reducer;
