import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io as createSocket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAccessToken, selectUser } from '../../../store/slices/authSlice';
import {
  ensureEventDmConversation,
  fetchConversationMessages,
  markConversationRead,
  sendConversationMessage,
} from '../../../utils/chatApi';
import { CHAT_SOCKET_URL } from '../../../utils/chatConfig';

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

const formatMessageTime = (value) => {
  if (!value) return '';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AdminManagerChatTab = ({ eventId, manager }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
  const currentUserAuthId = resolveAuthId({ user, accessToken });

  const managerAuthId = String(manager?.authId || '').trim();
  const managerName = String(manager?.name || 'Assigned Manager').trim();

  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const hasManagerChat = Boolean(eventId && managerAuthId);

  const sortedMessages = useMemo(() => {
    return [...(Array.isArray(messages) ? messages : [])].sort((a, b) => {
      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();
      return at - bt;
    });
  }, [messages]);

  const scrollToBottom = (behavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [sortedMessages.length]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!hasManagerChat) {
        setConversationId('');
        setMessages([]);
        return;
      }

      try {
        setLoading(true);
        const convo = await ensureEventDmConversation({
          eventId,
          otherAuthId: managerAuthId,
          dispatch,
          refreshAction: refreshAccessToken,
        });

        const convoId = String(convo?._id || convo?.id || '').trim();
        if (!convoId) throw new Error('Failed to initialize conversation');
        if (cancelled) return;

        setConversationId(convoId);

        const msgs = await fetchConversationMessages({
          conversationId: convoId,
          limit: 200,
          dispatch,
          refreshAction: refreshAccessToken,
        });

        if (cancelled) return;
        setMessages(Array.isArray(msgs) ? msgs : []);

        markConversationRead({
          conversationId: convoId,
          dispatch,
          refreshAction: refreshAccessToken,
        }).catch(() => {});
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.message || 'Failed to load manager chat');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, eventId, hasManagerChat, managerAuthId]);

  useEffect(() => {
    if (!conversationId || !accessToken) return;

    const socket = createSocket(CHAT_SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('conversation:join', { conversationId });
    });

    socket.on('message:new', (msg) => {
      const msgId = String(msg?._id || msg?.id || '').trim();
      setMessages((prev) => {
        if (msgId && prev.some((row) => String(row?._id || row?.id || '').trim() === msgId)) {
          return prev;
        }
        return [...prev, msg];
      });

      if (String(msg?.senderAuthId || '').trim() !== currentUserAuthId) {
        markConversationRead({
          conversationId,
          dispatch,
          refreshAction: refreshAccessToken,
        }).catch(() => {});
      }
    });

    socket.on('message:updated', (updated) => {
      const updatedId = String(updated?._id || updated?.id || '').trim();
      if (!updatedId) return;
      setMessages((prev) => prev.map((row) => (
        String(row?._id || row?.id || '').trim() === updatedId ? { ...row, ...updated } : row
      )));
    });

    socket.on('message:deleted', ({ conversationId: convoId, messageId } = {}) => {
      if (String(convoId || '').trim() !== String(conversationId || '').trim()) return;
      const deletedId = String(messageId || '').trim();
      if (!deletedId) return;
      setMessages((prev) => prev.filter((row) => String(row?._id || row?.id || '').trim() !== deletedId));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, conversationId, currentUserAuthId, dispatch]);

  const handleSend = async () => {
    if (!conversationId || !chatInput.trim() || sending) return;

    try {
      setSending(true);
      const sent = await sendConversationMessage({
        conversationId,
        text: chatInput.trim(),
        files: [],
        dispatch,
        refreshAction: refreshAccessToken,
      });

      setChatInput('');

      const msgId = String(sent?._id || sent?.id || '').trim();
      setMessages((prev) => {
        if (msgId && prev.some((row) => String(row?._id || row?.id || '').trim() === msgId)) return prev;
        return [...prev, sent];
      });
    } catch (error) {
      toast.error(error?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!hasManagerChat) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-[#e9eff1] h-[600px] flex flex-col items-center justify-center px-6 text-center">
        <Users className="text-[#94a3b8] mb-3" size={32} />
        <p className="text-base font-bold text-[#0b2d49]">Assigned manager required</p>
        <p className="text-sm text-[#708aa0] mt-1">Assign a manager to enable admin-manager chat for this event.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#e9eff1] h-[600px] flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[#e9eff1] flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0b2d49]/10 flex items-center justify-center">
            <Users className="text-[#0b2d49]" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0b2d49]">Event Coordination Chat</h3>
            <p className="text-xs text-[#28a785] font-bold uppercase tracking-wider">● Admin + Assigned Manager</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]/30">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm font-medium text-[#708aa0]">Loading chat…</div>
        ) : sortedMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm font-medium text-[#708aa0]">No messages yet. Start the conversation with {managerName}.</div>
        ) : (
          sortedMessages.map((msg) => {
            const messageId = String(msg?._id || msg?.id || '').trim();
            const isMe = String(msg?.senderAuthId || '').trim() === currentUserAuthId;
            const timestamp = formatMessageTime(msg?.createdAt);

            return (
              <div key={messageId || `${timestamp}-${String(msg?.senderAuthId || '')}`} className={`flex gap-4 ${isMe ? 'justify-end' : ''}`}>
                {!isMe && (
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {managerName.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div className={`max-w-[70%] space-y-2 ${isMe ? 'items-end' : ''}`}>
                  <div className={`${isMe ? 'bg-[#0b2d49] text-white rounded-2xl rounded-tr-none' : 'bg-white text-[#5a5b44] rounded-2xl rounded-tl-none border border-[#e9eff1]'} p-4 shadow-sm`}>
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap wrap-anywhere">{msg?.text || ''}</p>
                  </div>
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} pr-1 pl-1`}>
                    <span className="text-[10px] font-bold text-[#94a3b8] uppercase">{timestamp}</span>
                  </div>
                </div>

                {isMe && (
                  <div className="w-10 h-10 rounded-xl bg-[#0b2d49]/10 text-[#0b2d49] flex items-center justify-center font-bold text-sm shrink-0">
                    {String(user?.name || 'AD').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-[#e9eff1]">
        <div className="relative flex items-center gap-3">
          <input
            placeholder={`Message ${managerName}...`}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="w-full bg-[#f8fafc]/80 border border-[#e9eff1] rounded-2xl py-3.5 pl-6 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d7a444]/20 focus:border-[#d7a444] transition-all"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!chatInput.trim() || sending}
            className="absolute right-2 p-2.5 bg-[#d7a444] text-white rounded-xl shadow-lg shadow-[#d7a444]/30 hover:bg-[#0b2d49] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminManagerChatTab;
