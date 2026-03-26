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

export const fetchFeesConfig = createAsyncThunk(
  'fees/fetchFeesConfig',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/events/config/fees`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok || !data?.success) {
        return rejectWithValue(data?.message || 'Failed to fetch fees');
      }

      return data?.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateFeesConfig = createAsyncThunk(
  'fees/updateFeesConfig',
  async ({ platformFee, serviceChargePercent }, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/events/config/fees`,
        {
          method: 'PATCH',
          body: JSON.stringify({ platformFee, serviceChargePercent }),
        },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok || !data?.success) {
        return rejectWithValue(data?.message || 'Failed to update fees');
      }

      return data?.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const feesSlice = createSlice({
  name: 'fees',
  initialState: {
    platformFee: null,
    serviceChargePercent: null,
    status: 'idle',
    error: null,
    lastUpdatedAt: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeesConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFeesConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.platformFee = action.payload?.platformFee ?? null;
        state.serviceChargePercent = action.payload?.serviceChargePercent ?? null;
        state.lastUpdatedAt = action.payload?.updatedAt ?? null;
      })
      .addCase(fetchFeesConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updateFeesConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.platformFee = action.payload?.platformFee ?? state.platformFee;
        state.serviceChargePercent = action.payload?.serviceChargePercent ?? state.serviceChargePercent;
        state.lastUpdatedAt = action.payload?.updatedAt ?? state.lastUpdatedAt;
      })
      .addCase(updateFeesConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateFeesConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const selectPlatformFee = (state) => state.fees.platformFee;
export const selectServiceChargePercent = (state) => state.fees.serviceChargePercent;
export const selectFeesStatus = (state) => state.fees.status;
export const selectFeesError = (state) => state.fees.error;

export default feesSlice.reducer;
