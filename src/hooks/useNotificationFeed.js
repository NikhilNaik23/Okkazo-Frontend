import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  selectNotificationItems,
  selectNotificationStatus,
  selectNotificationUnreadCount,
} from '../store/slices/notificationsSlice';
import { groupNotificationsForUI } from '../utils/notificationUi';

const DEFAULT_POLL_INTERVAL_MS = (() => {
  const raw = Number(import.meta.env.VITE_NOTIFICATIONS_POLL_INTERVAL_MS ?? 20000);
  if (!Number.isFinite(raw)) return 20000;
  return Math.max(0, Math.floor(raw));
})();

export const useNotificationFeed = ({
  enabled = true,
  limit = 100,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  pollInBackground = false,
  fetchItems = true,
  fetchUnread = true,
} = {}) => {
  const dispatch = useDispatch();
  const items = useSelector(selectNotificationItems);
  const status = useSelector(selectNotificationStatus);
  const unreadCount = useSelector(selectNotificationUnreadCount);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    const requests = [];
    if (fetchItems) {
      requests.push(dispatch(fetchNotifications({ page: 1, limit })));
    }
    if (fetchUnread) {
      requests.push(dispatch(fetchUnreadCount()));
    }
    if (!requests.length) return;

    await Promise.all(requests);
  }, [dispatch, enabled, limit, fetchItems, fetchUnread]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) return undefined;
    const intervalMs = Math.max(0, Number(pollIntervalMs || 0));
    if (intervalMs < 1000) return undefined;

    const tick = async () => {
      if (!pollInBackground && typeof document !== 'undefined' && document.hidden) return;
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      try {
        await refresh();
      } finally {
        inFlightRef.current = false;
      }
    };

    const timer = setInterval(() => {
      tick();
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [enabled, pollIntervalMs, pollInBackground, refresh]);

  const grouped = useMemo(() => groupNotificationsForUI(items), [items]);

  const markAllRead = useCallback(async () => {
    if (!enabled) return;
    await dispatch(markAllNotificationsRead());
  }, [dispatch, enabled]);

  return {
    status,
    unreadCount,
    grouped,
    refresh,
    markAllRead,
  };
};

export default useNotificationFeed;