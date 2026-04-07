import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../utils/apiHandler';
import { refreshAccessToken } from './authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const parseError = async (response, fallbackMessage) => {
  try {
    const body = await response.json();
    return body?.message || body?.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 100 } = {}, { dispatch, rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const url = `${API_BASE_URL}/api/notifications?${params.toString()}`;

      const response = await fetchWithAuth(
        url,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      if (!response.ok) {
        return rejectWithValue(await parseError(response, 'Failed to fetch notifications'));
      }

      const data = await response.json();
      return {
        notifications: Array.isArray(data?.data) ? data.data : [],
        pagination: data?.pagination || null,
      };
    } catch (error) {
      return rejectWithValue(error?.message || 'Network error');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/notifications/unread-count`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      if (!response.ok) {
        return rejectWithValue(await parseError(response, 'Failed to fetch unread count'));
      }

      const data = await response.json();
      return Number(data?.data?.unreadCount || 0);
    } catch (error) {
      return rejectWithValue(error?.message || 'Network error');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId, { dispatch, rejectWithValue }) => {
    try {
      const safeId = String(notificationId || '').trim();
      if (!safeId) {
        return rejectWithValue('Notification ID is required');
      }

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/notifications/${encodeURIComponent(safeId)}/read`,
        { method: 'PATCH' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      if (!response.ok) {
        return rejectWithValue(await parseError(response, 'Failed to mark notification as read'));
      }

      const data = await response.json();
      return data?.data || { notificationId: safeId };
    } catch (error) {
      return rejectWithValue(error?.message || 'Network error');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/notifications/mark-all-read`,
        { method: 'PATCH' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      if (!response.ok) {
        return rejectWithValue(await parseError(response, 'Failed to mark all notifications as read'));
      }

      const data = await response.json();
      return Number(data?.data?.updatedCount || 0);
    } catch (error) {
      return rejectWithValue(error?.message || 'Network error');
    }
  }
);

const initialState = {
  items: [],
  pagination: null,
  status: 'idle',
  unreadStatus: 'idle',
  actionStatus: 'idle',
  error: null,
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotificationsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchUnreadCount.pending, (state) => {
        state.unreadStatus = 'loading';
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadStatus = 'succeeded';
        state.unreadCount = Number(action.payload || 0);
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.unreadStatus = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(markNotificationRead.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const updatedId = String(action.payload?.notificationId || '').trim();
        if (!updatedId) return;

        const idx = state.items.findIndex(
          (item) => String(item?.notificationId || '').trim() === updatedId
        );

        if (idx >= 0 && state.items[idx]?.unread) {
          state.items[idx] = {
            ...state.items[idx],
            unread: false,
            readAt: action.payload?.readAt || new Date().toISOString(),
          };
          state.unreadCount = Math.max(0, Number(state.unreadCount || 0) - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.items = state.items.map((item) => ({
          ...item,
          unread: false,
          readAt: item.readAt || new Date().toISOString(),
        }));

        const updatedCount = Number(action.payload || 0);
        if (updatedCount > 0) {
          state.unreadCount = Math.max(0, Number(state.unreadCount || 0) - updatedCount);
        } else {
          state.unreadCount = 0;
        }
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { resetNotificationsState } = notificationsSlice.actions;

export const selectNotificationsState = (state) => state.notifications;
export const selectNotificationItems = (state) => state.notifications.items;
export const selectNotificationStatus = (state) => state.notifications.status;
export const selectNotificationError = (state) => state.notifications.error;
export const selectNotificationUnreadCount = (state) => Number(state.notifications.unreadCount || 0);
export const selectHasUnreadNotifications = createSelector(
  [selectNotificationUnreadCount],
  (unreadCount) => unreadCount > 0
);

export default notificationsSlice.reducer;