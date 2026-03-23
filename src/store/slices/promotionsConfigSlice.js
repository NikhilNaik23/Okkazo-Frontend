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

export const fetchPromotionsConfig = createAsyncThunk(
  'promotionsConfig/fetchPromotionsConfig',
  async ({ force } = {}, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/events/config/promotions`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok || !data?.success) {
        return rejectWithValue(data?.message || 'Failed to fetch promotions config');
      }

      return data?.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  },
  {
    condition: ({ force } = {}, { getState }) => {
      const state = getState();
      const status = state?.promotionsConfig?.status;
      if (status === 'loading') return false;

      if (force) return true;

      const lastFetchedAt = state?.promotionsConfig?.lastFetchedAt;
      // Prevent spamming if multiple components mount together.
      if (typeof lastFetchedAt === 'number' && Number.isFinite(lastFetchedAt)) {
        const ageMs = Date.now() - lastFetchedAt;
        if (ageMs >= 0 && ageMs < 5_000) return false;
      }

      return true;
    },
  }
);

export const updatePromotionsConfig = createAsyncThunk(
  'promotionsConfig/updatePromotionsConfig',
  async ({ publicPromotionOptions, promotePackages }, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/events/config/promotions`,
        {
          method: 'PATCH',
          body: JSON.stringify({ publicPromotionOptions, promotePackages }),
        },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok || !data?.success) {
        return rejectWithValue(data?.message || 'Failed to update promotions config');
      }

      return data?.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const promotionsConfigSlice = createSlice({
  name: 'promotionsConfig',
  initialState: {
    publicPromotionOptions: [],
    promotePackages: [],
    status: 'idle',
    error: null,
    lastUpdatedAt: null,
    lastFetchedAt: null,
    updatedByAuthId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromotionsConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPromotionsConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.publicPromotionOptions = action.payload?.publicPromotionOptions || [];
        state.promotePackages = action.payload?.promotePackages || [];
        state.lastUpdatedAt = action.payload?.updatedAt ?? null;
        state.lastFetchedAt = Date.now();
        state.updatedByAuthId = action.payload?.updatedByAuthId ?? null;
      })
      .addCase(fetchPromotionsConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updatePromotionsConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updatePromotionsConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.publicPromotionOptions = action.payload?.publicPromotionOptions || state.publicPromotionOptions;
        state.promotePackages = action.payload?.promotePackages || state.promotePackages;
        state.lastUpdatedAt = action.payload?.updatedAt ?? state.lastUpdatedAt;
        state.updatedByAuthId = action.payload?.updatedByAuthId ?? state.updatedByAuthId;
      })
      .addCase(updatePromotionsConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const selectPromotionsConfigStatus = (state) => state.promotionsConfig.status;
export const selectPromotionsConfigError = (state) => state.promotionsConfig.error;
export const selectPublicPromotionOptions = (state) => {
  const pub = state.promotionsConfig.publicPromotionOptions;
  if (Array.isArray(pub) && pub.length > 0) return pub;
  return state.promotionsConfig.promotePackages;
};
export const selectPromotePackages = (state) => state.promotionsConfig.promotePackages;

export default promotionsConfigSlice.reducer;
