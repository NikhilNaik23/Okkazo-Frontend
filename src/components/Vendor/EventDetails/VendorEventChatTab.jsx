import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Search,
    Users,
    MoreVertical,
    Paperclip,
    Send,
    Smile,
    Check,
    CheckCheck,
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-hot-toast';
import { io as createSocket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { refreshAccessToken, selectUser } from '../../../store/slices/authSlice';
import { selectSelectedVendorEventRequest } from '../../../store/slices/vendorEventsSlice';
import {
    ensureEventDmConversation,
    fetchConversationMessages,
    sendConversationMessage,
    markConversationRead,
} from '../../../utils/chatApi';
import { CHAT_API_BASE_URL, CHAT_SOCKET_URL } from '../../../utils/chatConfig';

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
    const fromToken = String(payload?.authId || payload?.sub || payload?.userId || payload?.id || '').trim();
    return fromToken;
};

const VendorEventChatTab = () => {
    const { id: eventIdParam } = useParams();
    const routeEventId = String(eventIdParam || '').trim();

    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
    const currentUserId = resolveAuthId({ user, accessToken });

    const selected = useSelector(selectSelectedVendorEventRequest);

    const eventId = useMemo(() => {
        const fromSelected = String(selected?.eventId || '').trim();
        return fromSelected || routeEventId;
    }, [selected, routeEventId]);

    const managerAuthId = useMemo(() => {
        const authId = selected?.managerProfile?.authId != null ? String(selected.managerProfile.authId).trim() : '';
        return authId || '';
    }, [selected]);

    const managerName = selected?.managerProfile?.name || selected?.managerProfile?.fullName || 'Event Manager';

    const [activeChannel, setActiveChannel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [chatInput, setChatInput] = useState('');

    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [socketJoined, setSocketJoined] = useState(false);
    const [presenceByAuthId, setPresenceByAuthId] = useState({});

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editInput, setEditInput] = useState('');
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false, msgId: null });

    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const contextMenuRef = useRef(null);
    const messageMenuRef = useRef(null);

    const messagesViewportRef = useRef(null);
    const messagesEndRef = useRef(null);
    const stickToBottomRef = useRef(true);
    const initialScrollDoneRef = useRef(false);

    const handleMessagesScroll = () => {
        const el = messagesViewportRef.current;
        if (!el) return;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        stickToBottomRef.current = distance < 140;
    };

    const scrollToBottom = (behavior = 'auto') => {
        const el = messagesViewportRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    const contacts = useMemo(() => {
        if (!managerAuthId) return [];
        return [
            {
                id: managerAuthId,
                name: managerName,
                role: 'Manager',
                online: false,
                lastSeen: 'online',
            },
        ];
    }, [managerAuthId, managerName]);

    const filteredContacts = useMemo(() => {
        const q = String(searchTerm || '').trim().toLowerCase();
        if (!q) return contacts;
        return contacts.filter((c) => String(c?.name || '').toLowerCase().includes(q));
    }, [contacts, searchTerm]);

    useEffect(() => {
        if (!activeChannel && contacts.length) setActiveChannel(contacts[0].id);
    }, [activeChannel, contacts]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (contextMenu.show && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu((prev) => ({ ...prev, show: false }));
            }
            if (activeMessageMenu && messageMenuRef.current && !messageMenuRef.current.contains(event.target)) {
                setActiveMessageMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker, contextMenu.show, activeMessageMenu]);

    const handleContextMenu = (e, msgId) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, show: true, msgId });
    };

    useEffect(() => {
        if (!eventId || !activeChannel) return;
        let cancelled = false;

        const load = async () => {
            try {
                setMessages([]);
                const convo = await ensureEventDmConversation({
                    eventId,
                    otherAuthId: activeChannel,
                    dispatch,
                    refreshAction: refreshAccessToken,
                });

                const convoId = String(convo?._id || convo?.id || '').trim();
                if (!convoId) throw new Error('Invalid conversation');
                if (cancelled) return;
                setConversationId(convoId);

                const msgs = await fetchConversationMessages({
                    conversationId: convoId,
                    limit: 200,
                    dispatch,
                    refreshAction: refreshAccessToken,
                });
                if (cancelled) return;
                setMessages(msgs);

                markConversationRead({ conversationId: convoId, dispatch, refreshAction: refreshAccessToken }).catch(() => {});
            } catch (e) {
                toast.error(e?.message || 'Failed to load chat');
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [eventId, activeChannel, dispatch]);

    useEffect(() => {
        if (!conversationId || !accessToken) return;

        const socket = createSocket(CHAT_SOCKET_URL, {
            auth: { token: accessToken },
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setSocketConnected(true);
            setSocketJoined(false);
            socket.emit('conversation:join', { conversationId });
        });

        socket.on('conversation:joined', (payload) => {
            const joinedId = String(payload?.conversationId || '').trim();
            if (joinedId && joinedId === String(conversationId)) {
                setSocketJoined(true);
            }
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
            setSocketJoined(false);
        });

        socket.on('connect_error', () => {
            setSocketConnected(false);
            setSocketJoined(false);
        });

        socket.on('message:new', (msg) => {
            const msgId = String(msg?._id || msg?.id || '');
            setMessages((prev) => {
                if (msgId && prev.some((m) => String(m?._id || m?.id || '') === msgId)) return prev;
                return [...prev, msg];
            });

            if (String(msg?.senderAuthId || '') !== currentUserId) {
                socket.emit('messages:read', { conversationId });
                markConversationRead({ conversationId, dispatch, refreshAction: refreshAccessToken }).catch(() => {});
            }
        });

        socket.on('messages:read', ({ conversationId: convoId, authId } = {}) => {
            const readerAuthId = String(authId || '').trim();
            if (!readerAuthId) return;
            if (String(convoId || '').trim() !== String(conversationId)) return;

            setMessages((prev) => prev.map((m) => {
                const sender = String(m?.senderAuthId || '').trim();
                if (!sender || sender === readerAuthId) return m;
                const readBy = Array.isArray(m?.readBy) ? m.readBy.map(String) : [];
                if (readBy.includes(readerAuthId)) return m;
                return { ...m, readBy: [...readBy, readerAuthId] };
            }));
        });

        socket.on('presence:update', ({ authId, online } = {}) => {
            const id = String(authId || '').trim();
            if (!id) return;
            setPresenceByAuthId((prev) => ({ ...prev, [id]: Boolean(online) }));
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setSocketConnected(false);
            setSocketJoined(false);
        };
    }, [conversationId, accessToken, currentUserId, dispatch]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socketConnected || !socket) return;

        const authIds = contacts
            .map((c) => (c?.id != null ? String(c.id).trim() : ''))
            .filter(Boolean);

        socket.emit('presence:watch', { authIds });
    }, [socketConnected, contacts]);

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

    // Fallback polling when socket isn't connected (e.g. JWT secret mismatch in chat-service)
    useEffect(() => {
        if (!conversationId) return;
        if (socketConnected && socketJoined) return;

        let stopped = false;
        const poll = async () => {
            try {
                const msgs = await fetchConversationMessages({
                    conversationId,
                    limit: 200,
                    dispatch,
                    refreshAction: refreshAccessToken,
                });
                if (!stopped) setMessages(msgs);
            } catch {
                // ignore
            }
        };

        // immediate + interval
        poll();
        const id = setInterval(poll, 2500);
        return () => {
            stopped = true;
            clearInterval(id);
        };
    }, [conversationId, socketConnected, socketJoined, dispatch]);

    const getMessageTimestamp = (msg) => {
        const createdAt = msg?.createdAt || msg?.date;
        if (!createdAt) return msg?.timestamp || '';
        const dt = new Date(createdAt);
        if (Number.isNaN(dt.getTime())) return msg?.timestamp || '';
        return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const resolveChatAssetUrl = (url) => {
        if (!url) return '';
        const s = String(url);
        return s.startsWith('http') ? s : `${CHAT_API_BASE_URL}${s}`;
    };

    const openAttachmentWithAuth = async ({ url, filename, mimetype }) => {
        const resolvedUrl = resolveChatAssetUrl(url);
        if (!resolvedUrl) return;

        if (String(url).startsWith('http') && !resolvedUrl.startsWith(CHAT_API_BASE_URL)) {
            window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        try {
            const { fetchWithAuth } = await import('../../../utils/apiHandler');
            const res = await fetchWithAuth(
                resolvedUrl,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                throw new Error(msg || `Failed to open attachment (${res.status})`);
            }

            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const safeName = String(filename || 'attachment');
            const type = String(mimetype || res.headers.get('content-type') || '').toLowerCase();
            const isPreviewable = type.startsWith('image/') || type.includes('pdf') || type.startsWith('text/');

            if (isPreviewable) {
                const win = window.open(objectUrl, '_blank', 'noopener,noreferrer');
                if (!win) {
                    const a = document.createElement('a');
                    a.href = objectUrl;
                    a.download = safeName;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }
            } else {
                const a = document.createElement('a');
                a.href = objectUrl;
                a.download = safeName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }

            setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        } catch (e) {
            toast.error(e?.message || 'Unable to open attachment');
        }
    };

    const renderAttachments = (attachments = []) => {
        if (!Array.isArray(attachments) || attachments.length === 0) return null;

        return (
            <div className="mt-3 space-y-2">
                {attachments.map((a) => {
                    const url = a?.url;
                    const name = a?.originalName || a?.filename || 'Attachment';
                    const type = (a?.mimetype || '').toLowerCase();
                    if (!url) return null;

                    const resolvedUrl = resolveChatAssetUrl(url);
                    const isImage = type.startsWith('image/') || (resolvedUrl && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(resolvedUrl));

                    return isImage ? (
                        <button
                            key={`${String(url)}-${name}`}
                            type="button"
                            onClick={() => openAttachmentWithAuth({ url, filename: name, mimetype: type })}
                            className="block"
                            title="Open image"
                        >
                            <img src={resolvedUrl} alt={name} className="max-h-60 rounded-xl border border-black/5" />
                        </button>
                    ) : (
                        <button
                            key={`${String(url)}-${name}`}
                            type="button"
                            onClick={() => openAttachmentWithAuth({ url, filename: name, mimetype: type })}
                            className="block text-left text-sm font-bold underline underline-offset-2"
                            title="Open attachment"
                        >
                            {name}
                        </button>
                    );
                })}
            </div>
        );
    };

    const handleSend = async () => {
        if (!chatInput.trim() || !conversationId) return;
        try {
            const data = await sendConversationMessage({
                conversationId,
                text: chatInput.trim(),
                dispatch,
                refreshAction: refreshAccessToken,
            });
            setChatInput('');
            const msgId = String(data?._id || data?.id || '');
            setMessages((prev) => {
                if (msgId && prev.some((m) => String(m?._id || m?.id || '') === msgId)) return prev;
                return [...prev, data];
            });
        } catch (e) {
            toast.error(e?.message || 'Failed to send message');
        }
    };

    const handleAttachClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const fileList = Array.from(e.target.files || []);
        if (!fileList.length || !conversationId) return;

        try {
            const data = await sendConversationMessage({
                conversationId,
                text: chatInput.trim(),
                files: fileList,
                dispatch,
                refreshAction: refreshAccessToken,
            });
            setChatInput('');
            const msgId = String(data?._id || data?.id || '');
            setMessages((prev) => {
                if (msgId && prev.some((m) => String(m?._id || m?.id || '') === msgId)) return prev;
                return [...prev, data];
            });
        } catch (err) {
            toast.error(err?.message || 'Failed to upload');
        } finally {
            e.target.value = '';
        }
    };

    const handleEmojiClick = (emojiData) => setChatInput((prev) => prev + emojiData.emoji);

    const handleDeleteMessage = (id) => {
        const deleteId = String(id);
        setMessages((prev) => prev.filter((m) => String(m?._id || m?.id || '') !== deleteId));
        toast.success('Message deleted');
    };

    const handleEditMessage = (id, newText) => {
        const editId = String(id);
        setMessages((prev) =>
            prev.map((m) => (String(m?._id || m?.id || '') === editId ? { ...m, text: newText, isEdited: true } : m))
        );
        toast.success('Message edited');
    };

    const handleStartEdit = (msg) => {
        const msgId = String(msg?._id || msg?.id || '');
        setEditingMessageId(msgId);
        setEditInput(msg?.text || '');
        setActiveMessageMenu(null);
    };

    const submitEdit = (id) => {
        if (editInput.trim()) {
            handleEditMessage(id, editInput);
            setEditingMessageId(null);
        }
    };

    const renderMessageActions = (msg, isMe) => {
        const msgId = String(msg?._id || msg?.id || '');
        const isEditable = isMe;

        return (
            <div className="absolute top-1 right-1 z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveMessageMenu(activeMessageMenu === msgId ? null : msgId);
                    }}
                    className={`p-1 ${isMe ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-black/5'} rounded-full transition-all opacity-0 group-hover/bubble:opacity-100 ${activeMessageMenu === msgId ? 'opacity-100 bg-black/5' : ''}`}
                >
                    <MoreVertical size={14} />
                </button>

                {activeMessageMenu === msgId && (
                    <div
                        ref={messageMenuRef}
                        className={`absolute z-60 top-full ${isMe ? 'right-0' : 'left-0'} mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 min-w-35 p-2 animate-in fade-in zoom-in-95 duration-200`}
                    >
                        {isEditable && (
                            <button
                                onClick={() => handleStartEdit(msg)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                            >
                                Edit
                            </button>
                        )}
                        <button
                            onClick={() => handleDeleteMessage(msgId)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const currentContact = contacts.find((c) => c.id === activeChannel) || contacts[0] || null;

    if (!managerAuthId) {
        return (
            <div className="p-8 bg-white rounded-3xl border border-[#708aa0]/10 shadow-sm">
                <div className="text-sm font-bold text-[#708aa0]">Manager is not assigned yet for this event.</div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-150px)] bg-white rounded-3xl border border-[#708aa0]/10 overflow-hidden shadow-sm">
            <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0">
                <div className="p-5 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/10 text-gray-700 placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    <div className="px-3 mb-2 flex items-center justify-between">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Manager</h4>
                        <Users size={12} className="text-gray-300" />
                    </div>
                    <div className="space-y-1">
                        {filteredContacts.map((contact) => {
                            const isActive = activeChannel === contact.id;
                            return (
                                <button
                                    key={contact.id}
                                    onClick={() => setActiveChannel(contact.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-[#e7f7f5] border-l-4 border-teal-500 shadow-sm' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                                >
                                    <div
                                        className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white text-teal-600' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        <span className="text-xs font-bold">{String(contact.name || 'M').substring(0, 2).toUpperCase()}</span>
                                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${presenceByAuthId?.[String(contact.id)] ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className={`text-sm font-bold truncate ${isActive ? 'text-teal-900' : 'text-gray-700'}`}>{contact.name}</p>
                                        <p className={`text-xs truncate ${isActive ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>{contact.role}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-slate-50 relative">
                <div className="bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-[#0b2d49]">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900">{currentContact?.name || 'Manager'}</h2>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">Direct Message</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6" ref={messagesViewportRef} onScroll={handleMessagesScroll}>
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.map((msg) => {
                            const msgId = String(msg?._id || msg?.id || '');
                            const isMe = String(msg?.senderAuthId || msg?.senderId || '') === currentUserId;
                            const timestamp = getMessageTimestamp(msg);
                            const readBy = Array.isArray(msg?.readBy) ? msg.readBy.map(String) : [];
                            const isReadByOther = isMe ? readBy.some((id) => id && id !== currentUserId) : false;

                            return (
                                <div
                                    key={msgId || `${timestamp}-${String(msg?.senderAuthId || '')}`}
                                    className="group relative"
                                    onContextMenu={(e) => handleContextMenu(e, msgId)}
                                >
                                    {isMe ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-end gap-3 max-w-[75%]">
                                                <div className="bg-[#0b2d49] text-white p-4 pr-7 rounded-2xl rounded-tr-sm shadow-sm relative group/bubble">
                                                    {renderMessageActions(msg, true)}
                                                    {editingMessageId === msgId ? (
                                                        <div className="flex flex-col gap-2">
                                                            <textarea
                                                                className="bg-white/10 text-white rounded-xl p-2 text-sm outline-none border border-white/20 min-w-50"
                                                                value={editInput}
                                                                onChange={(e) => setEditInput(e.target.value)}
                                                                autoFocus
                                                            />
                                                            <div className="flex justify-end gap-2 text-xs">
                                                                <button onClick={() => setEditingMessageId(null)} className="font-bold opacity-70">
                                                                    Cancel
                                                                </button>
                                                                <button onClick={() => submitEdit(msgId)} className="font-bold">
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm font-medium leading-relaxed">{msg?.text}</p>
                                                            {renderAttachments(msg?.attachments)}
                                                            {msg?.isEdited && (
                                                                <span className="text-[9px] opacity-40 float-right mt-1 ml-2 italic">edited</span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0b2d49] flex items-center justify-center text-xs font-bold shrink-0 border border-blue-100 uppercase">
                                                    ME
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 mr-12">
                                                <span className="text-[10px] font-bold text-gray-400">{timestamp}</span>
                                                {isReadByOther ? <CheckCheck size={12} className="text-green-500" /> : <Check size={12} className="text-gray-400" />}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="flex items-end gap-3 max-w-[75%]">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0 border border-gray-200">
                                                    {String(currentContact?.name || 'M').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="bg-gray-100 text-gray-800 p-4 pr-7 rounded-2xl rounded-tl-sm shadow-sm relative group/bubble">
                                                    {renderMessageActions(msg, false)}
                                                    <p className="text-sm font-medium leading-relaxed">{msg?.text}</p>
                                                    {renderAttachments(msg?.attachments)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-12">
                                                <span className="text-[10px] font-bold text-gray-400">{timestamp}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-100 rounded-3xl px-2 py-1.5 flex items-center gap-1 border border-transparent focus-within:border-[#0b2d49]/10 focus-within:bg-gray-50 transition-all relative">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                            <button
                                onClick={handleAttachClick}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <Paperclip size={20} />
                            </button>
                            <div className="relative" ref={emojiPickerRef}>
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-[#0b2d49] bg-gray-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <Smile size={20} />
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-4 shadow-2xl animate-in slide-in-from-bottom-2 duration-200 z-50">
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            autoFocusSearch={false}
                                            theme="light"
                                            width={320}
                                            height={400}
                                        />
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 outline-none focus:outline-none text-[15px] font-medium text-gray-800 placeholder-gray-500 min-w-0"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!chatInput.trim()}
                                className="p-3 bg-[#0b2d49] hover:bg-[#1a3b55] text-white rounded-full transition-all disabled:opacity-50 disabled:scale-95 shadow-md flex items-center justify-center shrink-0"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {contextMenu.show && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-100 bg-white rounded-2xl shadow-2xl border border-gray-100 min-w-40 p-2 animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {(() => {
                        const msg = messages.find((m) => String(m?._id || m?.id || '') === String(contextMenu.msgId));
                        if (!msg) return null;
                        const isMe = String(msg?.senderAuthId || '') === currentUserId;

                        return (
                            <>
                                {isMe && (
                                    <button
                                        onClick={() => {
                                            handleStartEdit(msg);
                                            setContextMenu((prev) => ({ ...prev, show: false }));
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                    >
                                        Edit Message
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        handleDeleteMessage(contextMenu.msgId);
                                        setContextMenu((prev) => ({ ...prev, show: false }));
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                                >
                                    Delete Message
                                </button>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default VendorEventChatTab;
