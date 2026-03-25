import { fetchWithAuth } from './apiHandler';
import { CHAT_API_BASE_URL } from './chatConfig';

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const ensureEventConversation = async ({ eventId, dispatch, refreshAction }) => {
  const res = await fetchWithAuth(
    `${CHAT_API_BASE_URL}/api/chat/conversations/event/${encodeURIComponent(String(eventId))}/ensure`,
    { method: 'POST' },
    { dispatch, refreshAction }
  );

  const json = await safeJson(res);
  if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to create chat');
  return json.data;
};

export const ensureEventDmConversation = async ({ eventId, otherAuthId, dispatch, refreshAction }) => {
  const res = await fetchWithAuth(
    `${CHAT_API_BASE_URL}/api/chat/conversations/event/${encodeURIComponent(String(eventId))}/dm/${encodeURIComponent(String(otherAuthId))}/ensure`,
    { method: 'POST' },
    { dispatch, refreshAction }
  );

  const json = await safeJson(res);
  if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to create chat');
  return json.data;
};

export const fetchStaffChatContacts = async ({ dispatch, refreshAction }) => {
  const res = await fetchWithAuth(
    `${CHAT_API_BASE_URL}/api/chat/contacts/staff`,
    { method: 'GET' },
    { dispatch, refreshAction }
  );

  const json = await safeJson(res);
  if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load chat contacts');
  return Array.isArray(json?.data?.groups) ? json.data.groups : [];
};

export const ensureStaffDmConversation = async ({ otherAuthId, dispatch, refreshAction }) => {
  const res = await fetchWithAuth(
    `${CHAT_API_BASE_URL}/api/chat/conversations/staff/dm/${encodeURIComponent(String(otherAuthId))}/ensure`,
    { method: 'POST' },
    { dispatch, refreshAction }
  );

  const json = await safeJson(res);
  if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to create chat');
  return json.data;
};

export const fetchConversationMessages = async ({ conversationId, limit = 100, dispatch, refreshAction }) => {
  const res = await fetchWithAuth(
    `${CHAT_API_BASE_URL}/api/chat/conversations/${encodeURIComponent(String(conversationId))}/messages?limit=${encodeURIComponent(String(limit))}`,
    { method: 'GET' },
    { dispatch, refreshAction }
  );

  const json = await safeJson(res);
  if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load messages');
  return Array.isArray(json.data) ? json.data : [];
};

export const sendConversationMessage = async ({ conversationId, text, files = [], dispatch, refreshAction }) => {
  const hasFiles = Array.isArray(files) && files.length > 0;

  const body = hasFiles ? new FormData() : JSON.stringify({ text });
  const options = {
    method: 'POST',
    body,
  };

  if (hasFiles) {
    body.append('text', text || '');
    files.forEach((f) => body.append('files', f));
  } else {
    options.headers = { 'Content-Type': 'application/json' };
  }

  const res = await fetchWithAuth(
    `${CHAT_API_BASE_URL}/api/chat/conversations/${encodeURIComponent(String(conversationId))}/messages`,
    options,
    { dispatch, refreshAction }
  );

  const json = await safeJson(res);
  if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to send message');
  return json.data;
};

export const markConversationRead = async ({ conversationId, dispatch, refreshAction }) => {
  const res = await fetchWithAuth(
    `${CHAT_API_BASE_URL}/api/chat/conversations/${encodeURIComponent(String(conversationId))}/read`,
    { method: 'POST' },
    { dispatch, refreshAction }
  );

  const json = await safeJson(res);
  if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to mark read');
  return true;
};
