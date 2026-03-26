import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCheck, Paperclip, Search, Send, Smile, Users, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import { io as createSocket } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAccessToken, selectUser } from '../../../store/slices/authSlice';
import {
  ensureStaffDmConversation,
  fetchConversationMessages,
  fetchStaffChatContacts,
  markConversationRead,
  sendConversationMessage,
  updateConversationMessage,
} from '../../../utils/chatApi';
import { CHAT_SOCKET_URL } from '../../../utils/chatConfig';
import { useStaffUnread } from '../../../context/useStaffUnread';

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

const toTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const msgId = (m) => String(m?._id || m?.id || '');

const ManagerChatPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
  const currentUserId = resolveAuthId({ user, accessToken });
  const selectedChannelStorageKey = useMemo(
    () => `chat:selected:manager:${String(currentUserId || 'anonymous').trim() || 'anonymous'}`,
    [currentUserId]
  );
  const shouldResetSelection = Boolean(location?.state?.resetChatSelection);

  const [activeChannel, setActiveChannel] = useState(null);
  const [conversationId, setConversationId] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([]);
  const [contactGroups, setContactGroups] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [onlineMap, setOnlineMap] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketJoined, setSocketJoined] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInput, setEditInput] = useState('');

  const { unreadByAuthId, totalUnreadCount, setActiveConversationAuthId } = useStaffUnread();

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messageMenuRef = useRef(null);
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const initialScrollDoneRef = useRef(false);

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
      return;
    }

    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance < 80;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (activeMessageMenu && messageMenuRef.current && !messageMenuRef.current.contains(event.target)) {
        setActiveMessageMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMessageMenu]);

  useEffect(() => {
    let cancelled = false;

    const loadContacts = async () => {
      if (!accessToken) return;
      try {
        const groups = await fetchStaffChatContacts({ dispatch, refreshAction: refreshAccessToken });
        if (cancelled) return;

        setContactGroups(groups);
        setExpandedGroups(
          groups.reduce((acc, group) => {
            acc[group.key] = false;
            return acc;
          }, {})
        );

        const allContacts = groups.flatMap((group) => group?.contacts || []);
        const validAuthIds = new Set(
          allContacts
            .map((c) => String(c?.authId || '').trim())
            .filter(Boolean)
        );

        if (shouldResetSelection) {
          localStorage.removeItem(selectedChannelStorageKey);
          setActiveChannel(null);
          return;
        }

        const savedAuthId = String(localStorage.getItem(selectedChannelStorageKey) || '').trim();
        const firstContact = allContacts[0];
        const preferredAuthId = validAuthIds.has(savedAuthId)
          ? savedAuthId
          : String(firstContact?.authId || '').trim();

        if (preferredAuthId) {
          setActiveChannel((prev) => prev || preferredAuthId);
        }
      } catch (error) {
        if (!cancelled) toast.error(error?.message || 'Failed to load staff contacts');
      }
    };

    loadContacts();
    return () => {
      cancelled = true;
    };
  }, [accessToken, dispatch, selectedChannelStorageKey, shouldResetSelection]);

  useEffect(() => {
    const id = String(activeChannel || '').trim();
    if (!id) return;
    localStorage.setItem(selectedChannelStorageKey, id);
  }, [activeChannel, selectedChannelStorageKey]);

  const contactByAuthId = useMemo(() => {
    const map = new Map();
    for (const group of contactGroups) {
      const contacts = Array.isArray(group?.contacts) ? group.contacts : [];
      for (const c of contacts) {
        const id = String(c?.authId || '').trim();
        if (!id) continue;
        map.set(id, {
          ...c,
          online: Boolean(onlineMap[id]),
        });
      }
    }
    return map;
  }, [contactGroups, onlineMap]);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return contactGroups;

    return contactGroups
      .map((group) => ({
        ...group,
        contacts: (group?.contacts || []).filter((c) => {
          const name = String(c?.name || '').toLowerCase();
          const role = String(c?.role || '').toLowerCase();
          const dept = String(c?.department || '').toLowerCase();
          return name.includes(term) || role.includes(term) || dept.includes(term);
        }),
      }))
      .filter((group) => (group?.contacts || []).length > 0);
  }, [contactGroups, searchTerm]);

  const currentContact = activeChannel ? contactByAuthId.get(activeChannel) || null : null;

  const presenceAuthIds = useMemo(
    () => Array.from(contactByAuthId.keys()).filter(Boolean),
    [contactByAuthId]
  );

  useEffect(() => {
    setActiveConversationAuthId(String(activeChannel || '').trim());
    return () => setActiveConversationAuthId('');
  }, [activeChannel, setActiveConversationAuthId]);

  useEffect(() => {
    let cancelled = false;

    const ensureAndLoadConversation = async () => {
      if (!activeChannel || !accessToken) return;
      try {
        const convo = await ensureStaffDmConversation({ otherAuthId: activeChannel, dispatch, refreshAction: refreshAccessToken });
        if (cancelled) return;

        const nextConversationId = String(convo?._id || '');
        if (!nextConversationId) throw new Error('Conversation unavailable');

        setConversationId(nextConversationId);

        const list = await fetchConversationMessages({
          conversationId: nextConversationId,
          limit: 120,
          dispatch,
          refreshAction: refreshAccessToken,
        });

        if (cancelled) return;

        setMessages(Array.isArray(list) ? list : []);
        await markConversationRead({ conversationId: nextConversationId, dispatch, refreshAction: refreshAccessToken });
      } catch (error) {
        if (!cancelled) toast.error(error?.message || 'Failed to load conversation');
      }
    };

    ensureAndLoadConversation();

    return () => {
      cancelled = true;
    };
  }, [activeChannel, accessToken, dispatch]);

  useEffect(() => {
    if (!accessToken) return undefined;

    const socket = createSocket(CHAT_SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      setSocketJoined(false);
      if (conversationId) {
        socket.emit('conversation:join', { conversationId });
      }
      if (presenceAuthIds.length) {
        socket.emit('presence:watch', { authIds: presenceAuthIds });
      }
    });

    socket.on('conversation:joined', ({ conversationId: joinedConversationId } = {}) => {
      if (String(joinedConversationId || '').trim() !== String(conversationId || '').trim()) return;
      setSocketJoined(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      setSocketJoined(false);
    });

    socket.on('connect_error', () => {
      setSocketConnected(false);
      setSocketJoined(false);
    });

    socket.on('presence:update', ({ authId, online }) => {
      const key = String(authId || '').trim();
      if (!key) return;
      setOnlineMap((prev) => ({ ...prev, [key]: Boolean(online) }));
    });

    socket.on('message:new', (message) => {
      // This page socket is attached to one joined conversation room,
      // so avoid strict raw id-shape checks for incoming payloads.

      setMessages((prev) => {
        const id = msgId(message);
        if (!id) return [...prev, message];
        if (prev.some((m) => msgId(m) === id)) return prev;
        return [...prev, message];
      });

      const sender = String(message?.senderAuthId || '').trim();
      if (sender && sender !== currentUserId) {
        socket.emit('messages:read', { conversationId });
      }
    });

    socket.on('messages:read', ({ authId }) => {
      const reader = String(authId || '').trim();
      if (!reader) return;

      setMessages((prev) =>
        prev.map((message) => ({
          ...message,
          readBy: Array.isArray(message?.readBy)
            ? (message.readBy.includes(reader) ? message.readBy : [...message.readBy, reader])
            : [reader],
        }))
      );
    });

    socket.on('message:updated', (updated) => {
      const updatedId = msgId(updated);
      if (!updatedId) return;
      setMessages((prev) => prev.map((message) => (msgId(message) === updatedId ? { ...message, ...updated } : message)));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
      setSocketJoined(false);
    };
  }, [accessToken, conversationId, currentUserId]);

  useEffect(() => {
    if (!socketConnected || !conversationId) return;
    const socket = socketRef.current;
    if (!socket) return;
    setSocketJoined(false);
    socket.emit('conversation:join', { conversationId });
  }, [socketConnected, conversationId]);

  useEffect(() => {
    if (!socketConnected) return;
    const socket = socketRef.current;
    if (!socket) return;
    if (!presenceAuthIds.length) return;
    socket.emit('presence:watch', { authIds: presenceAuthIds });
  }, [socketConnected, presenceAuthIds]);

  useEffect(() => {
    if (!conversationId) return;
    if (socketConnected && socketJoined) return;

    let stopped = false;

    const poll = async () => {
      try {
        const list = await fetchConversationMessages({
          conversationId,
          limit: 120,
          dispatch,
          refreshAction: refreshAccessToken,
        });

        if (!stopped) {
          setMessages(Array.isArray(list) ? list : []);
        }
      } catch {
        // ignore
      }
    };

    poll();
    const id = setInterval(poll, 2500);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [conversationId, socketConnected, socketJoined, dispatch]);

  useEffect(() => {
    if (!conversationId) return;
    stickToBottomRef.current = true;
    initialScrollDoneRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    if (!messages.length) return;
    if (!stickToBottomRef.current) return;

    const behavior = initialScrollDoneRef.current ? 'smooth' : 'auto';
    requestAnimationFrame(() => scrollToBottom(behavior));
    initialScrollDoneRef.current = true;
  }, [conversationId, messages.length]);

  const handleSend = async () => {
    const text = String(chatInput || '').trim();
    if (!text || !conversationId) return;

    try {
      const sent = await sendConversationMessage({
        conversationId,
        text,
        dispatch,
        refreshAction: refreshAccessToken,
      });

      setMessages((prev) => {
        const id = msgId(sent);
        if (!id || prev.some((m) => msgId(m) === id)) return prev;
        return [...prev, sent];
      });

      stickToBottomRef.current = true;

      setChatInput('');
      setShowEmojiPicker(false);
    } catch (error) {
      toast.error(error?.message || 'Failed to send message');
    }
  };

  const handleAttachClick = () => fileInputRef.current?.click();
  const handleEmojiClick = (emojiData) => setChatInput((prev) => prev + emojiData.emoji);

  const handleStartEdit = (message) => {
    const id = msgId(message);
    if (!id) return;
    setEditingMessageId(id);
    setEditInput(String(message?.text || ''));
    setActiveMessageMenu(null);
  };

  const submitEdit = async (message) => {
    const id = msgId(message);
    const text = String(editInput || '').trim();
    if (!id || !text || !conversationId) return;

    try {
      const updated = await updateConversationMessage({
        conversationId,
        messageId: id,
        text,
        dispatch,
        refreshAction: refreshAccessToken,
      });

      setMessages((prev) => prev.map((m) => (msgId(m) === id ? { ...m, ...updated } : m)));
      setEditingMessageId(null);
      toast.success('Message edited');
    } catch (error) {
      toast.error(error?.message || 'Failed to edit message');
    }
  };

  const renderSidebarItem = (contact) => {
    const id = String(contact?.authId || '');
    const isActive = activeChannel === id;
    const unread = Number(unreadByAuthId[id] || 0);

    return (
      <button
        key={id}
        onClick={() => setActiveChannel(id)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10 border-l-4 border-teal-300' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
      >
        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white/10 text-teal-100' : 'bg-gray-100 text-gray-500'}`}>
          <span className="text-xs font-bold">{String(contact?.name || '?').slice(0, 2).toUpperCase()}</span>
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${contact?.online ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>

        <div className="flex-1 text-left min-w-0">
          <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-700'}`}>{contact?.name || 'Unknown'}</p>
          <p className={`text-xs truncate ${isActive ? 'text-teal-100/70 font-medium' : 'text-gray-400'}`}>
            {contact?.role === 'ADMIN' ? 'Administration' : (contact?.department || 'Manager')}
          </p>
        </div>

        {unread > 0 && (
          <span className={`inline-flex min-w-5 h-5 items-center justify-center px-1.5 rounded-full text-[10px] font-black leading-none ${isActive ? 'bg-white/20 text-white' : 'bg-teal-600 text-white'}`}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-[calc(100vh)] bg-slate-50 overflow-hidden">
      <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm z-10">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Messages</h2>
            {totalUnreadCount > 0 && (
              <span className="inline-flex min-w-6 h-6 items-center justify-center px-2 rounded-full text-[11px] font-black bg-teal-600 text-white">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-teal-700/10 text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-scroll p-4 space-y-3 custom-scrollbar">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups[group.key] !== false;
            return (
              <div key={group.key} className="space-y-1">
                <button
                  onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.key]: !isExpanded }))}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-black tracking-widest text-gray-400"
                >
                  <span>{group.label}</span>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isExpanded && (group.contacts || []).map((contact) => renderSidebarItem({ ...contact, online: Boolean(onlineMap[String(contact?.authId || '')]) }))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50 relative">
        <div className="bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 text-teal-600">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">{currentContact ? currentContact.name : 'Select a chat'}</h2>
              <p className="text-sm text-gray-500 font-medium mt-0.5">
                {currentContact ? (currentContact.role === 'ADMIN' ? 'Administration' : currentContact.department) : 'Direct Message'}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="flex-1 overflow-y-auto p-8 space-y-6"
        >
          {!currentContact ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full mt-20">
              <Users size={64} className="mb-6 opacity-20" />
              <p className="font-medium text-xl text-gray-500">Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center my-6">
                <span className="bg-gray-200/50 text-gray-500 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">Chat History</span>
              </div>

              <div className="max-w-5xl mx-auto space-y-8">
                {messages.map((message) => {
                  const id = msgId(message) || String(Math.random());
                  const isMe = String(message?.senderAuthId || message?.senderId || '') === String(currentUserId || '');
                  const readBy = Array.isArray(message?.readBy) ? message.readBy : [];
                  const isRead = readBy.length > 1;

                  return (
                    <div key={id} className="group relative">
                      {isMe ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-end gap-3 max-w-[75%]">
                            <div className="bg-teal-600 text-white p-5 pr-9 rounded-2xl rounded-tr-sm shadow-sm relative group/bubble">
                              <div className="absolute top-1 right-1 z-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMessageMenu(activeMessageMenu === id ? null : id);
                                  }}
                                  className={`p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all opacity-0 group-hover/bubble:opacity-100 ${activeMessageMenu === id ? 'opacity-100 bg-black/10' : ''}`}
                                >
                                  <MoreVertical size={14} />
                                </button>

                                {activeMessageMenu === id && (
                                  <div
                                    ref={messageMenuRef}
                                    className="absolute z-60 top-full right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 min-w-32 p-2 animate-in fade-in zoom-in-95 duration-200"
                                  >
                                    <button
                                      onClick={() => handleStartEdit(message)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                )}
                              </div>

                              {editingMessageId === id ? (
                                <div className="flex flex-col gap-3">
                                  <textarea
                                    className="bg-white/10 text-white rounded-xl p-3 text-[15px] outline-none border border-white/20 min-w-62.5"
                                    value={editInput}
                                    onChange={(e) => setEditInput(e.target.value)}
                                    autoFocus
                                  />
                                  <div className="flex justify-end gap-3 text-sm">
                                    <button onClick={() => setEditingMessageId(null)} className="font-bold opacity-70 hover:opacity-100 transition-opacity">Cancel</button>
                                    <button onClick={() => submitEdit(message)} className="font-bold text-teal-100 hover:text-white transition-colors">Save</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-[15px] font-medium leading-relaxed">{message?.text || ''}</p>
                                  {(message?.editedAt || message?.isEdited) && <span className="text-[10px] opacity-40 float-right mt-1.5 ml-3 italic">edited</span>}
                                </>
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0 border border-teal-100 uppercase shadow-sm">ME</div>
                          </div>
                          <div className="flex items-center gap-1.5 mr-14">
                            <span className="text-[11px] font-bold text-gray-400">{toTime(message?.createdAt) || message?.timestamp || ''}</span>
                            {!isRead && <Check size={14} className="text-gray-400" />}
                            {isRead && <CheckCheck size={14} className="text-green-500" />}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1.5">
                          <div className="flex items-end gap-3 max-w-[75%]">
                            <div className="w-10 h-10 rounded-full bg-white text-gray-600 flex items-center justify-center text-xs font-bold shrink-0 border border-gray-200 shadow-sm">
                              {String(currentContact?.name || '?').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="bg-white border border-gray-100/50 text-gray-800 p-5 rounded-2xl rounded-tl-sm shadow-sm">
                              <p className="text-[15px] font-medium leading-relaxed">{message?.text || ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 ml-14">
                            <span className="text-[11px] font-bold text-gray-400">{toTime(message?.createdAt) || message?.timestamp || ''}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
          <div className="max-w-5xl mx-auto">
            <div className={`bg-gray-100 rounded-4xl px-3 py-2 flex items-center gap-2 border border-transparent transition-all relative shadow-inner ${currentContact ? 'focus-within:border-teal-500/20 focus-within:bg-gray-50 focus-within:shadow-md' : 'opacity-50 pointer-events-none'}`}>
              <input type="file" ref={fileInputRef} className="hidden" />
              <button onClick={handleAttachClick} className="p-2.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                <Paperclip size={22} />
              </button>

              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className={`p-2.5 rounded-full transition-colors ${showEmojiPicker ? 'text-teal-600 bg-gray-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                >
                  <Smile size={22} />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-6 shadow-2xl animate-in slide-in-from-bottom-2 duration-200 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiClick} autoFocusSearch={false} theme="light" width={340} height={420} />
                  </div>
                )}
              </div>

              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message here..."
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-[16px] font-medium text-gray-800 placeholder-gray-500 min-w-0"
              />

              <button
                onClick={handleSend}
                disabled={!chatInput.trim()}
                className="p-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-full transition-all disabled:opacity-50 disabled:scale-95 shadow-md flex items-center justify-center shrink-0"
              >
                <Send size={20} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerChatPage;
