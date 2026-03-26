import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAccessToken, selectUser } from '../store/slices/authSlice';
import {
  ensureStaffDmConversation,
  fetchConversationMessages,
  fetchStaffChatContacts,
} from '../utils/chatApi';
import StaffUnreadContext from './staffUnreadContextObject';

const decodeJwtPayload = (token) => {
  try {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const resolveAuthId = ({ user, accessToken }) => {
  const fromUser = String(user?.authId || '').trim();
  if (fromUser) return fromUser;
  const payload = decodeJwtPayload(accessToken);
  return String(payload?.authId || payload?.sub || payload?.userId || payload?.id || '').trim();
};

export const StaffUnreadProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
  const currentUserId = useMemo(() => resolveAuthId({ user, accessToken }), [user, accessToken]);

  const [activeConversationAuthId, setActiveConversationAuthId] = useState('');
  const [unreadByAuthId, setUnreadByAuthId] = useState({});

  const refreshUnreadCounts = useMemo(() => async () => {
    if (!accessToken || !currentUserId) {
      setUnreadByAuthId({});
      return;
    }

    try {
      const groups = await fetchStaffChatContacts({ dispatch, refreshAction: refreshAccessToken });
      const contactAuthIds = Array.from(
        new Set(
          (Array.isArray(groups) ? groups : [])
            .flatMap((group) => group?.contacts || [])
            .map((c) => String(c?.authId || '').trim())
            .filter(Boolean)
        )
      );

      if (!contactAuthIds.length) {
        setUnreadByAuthId({});
        return;
      }

      const entries = await Promise.all(
        contactAuthIds.map(async (authId) => {
          if (authId === activeConversationAuthId) return [authId, 0];

          const convo = await ensureStaffDmConversation({
            otherAuthId: authId,
            dispatch,
            refreshAction: refreshAccessToken,
          });

          const conversationId = String(convo?._id || convo?.id || '').trim();
          if (!conversationId) return [authId, 0];

          const messages = await fetchConversationMessages({
            conversationId,
            limit: 120,
            dispatch,
            refreshAction: refreshAccessToken,
          });

          const unread = (Array.isArray(messages) ? messages : []).filter((m) => {
            const sender = String(m?.senderAuthId || m?.senderId || '').trim();
            if (!sender || sender === String(currentUserId)) return false;
            const readBy = Array.isArray(m?.readBy)
              ? m.readBy.map((v) => String(v || '').trim())
              : [];
            return !readBy.includes(String(currentUserId));
          }).length;

          return [authId, unread];
        })
      );

      setUnreadByAuthId(Object.fromEntries(entries));
    } catch {
      // Keep previous unread counts on transient network failures.
    }
  }, [accessToken, activeConversationAuthId, currentUserId, dispatch]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await refreshUnreadCounts();
      if (cancelled) return;
    };

    run();
    const timer = setInterval(run, 20000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [refreshUnreadCounts]);

  const value = useMemo(() => {
    const totalUnreadCount = Object.values(unreadByAuthId).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0
    );

    return {
      unreadByAuthId,
      totalUnreadCount,
      setActiveConversationAuthId,
      refreshUnreadCounts,
    };
  }, [refreshUnreadCounts, unreadByAuthId]);

  return <StaffUnreadContext.Provider value={value}>{children}</StaffUnreadContext.Provider>;
};
