import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Volume2, Users, Briefcase, MoreVertical,
    CheckCheck, Plus, Paperclip, Send, Smile, Clock, Check, ChevronDown, ChevronRight
} from 'lucide-react';
import { toast } from "react-hot-toast";
import EmojiPicker from 'emoji-picker-react';
import { chatContacts, chatMessages as initialMessages } from '../../data/chatData';

const ManagerChat = () => {
    // Current logged in vendor mock ('v1' represents Gourmet Catering in our mock data)
    const currentUserId = 'v1';

    // The active channel should default to manager 'u1' (or 'manager' in the mock) if available
    const [activeChannel, setActiveChannel] = useState('manager');
    const [chatInput, setChatInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState(initialMessages);
        
    // UI states
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    // Interaction states
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editInput, setEditInput] = useState('');
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false, msgId: null });

    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const contextMenuRef = useRef(null);
    const messageMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (contextMenu.show && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu(prev => ({ ...prev, show: false }));
            }
            if (activeMessageMenu && messageMenuRef.current && !messageMenuRef.current.contains(event.target)) {
                setActiveMessageMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, contextMenu.show, activeMessageMenu]);

    const handleContextMenu = (e, msgId) => {
        e.preventDefault();
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            show: true,
            msgId: msgId
        });
    };

    // Since this is a vendor, we should filter the contact list to relevant parties 
    // such as the manager and maybe specific other vendors/teams they work closely with.
    // For this demo, let's include the manager and the client.
    
    // Add the manager to the local contacts list for the vendor since the manager isn't explicitly in the chatContacts array as an ID, 
    // or we can map them.
    const vendorContacts = [
        {
            id: 'manager',
            name: 'Event Manager',
            role: 'Main Coordinator',
            type: 'admin',
            online: true,
            lastSeen: 'online'
        },
        ...chatContacts.filter(c => c.id !== currentUserId)
    ].filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Get current active chat context
    const currentContact = vendorContacts.find(c => c.id === activeChannel);

    const handleSend = () => {
        if (!chatInput.trim() || !activeChannel) return;

        const newMsg = {
            id: Date.now(),
            senderId: currentUserId,
            receiverId: activeChannel,
            text: chatInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            date: Date.now()
        };

        setMessages([...messages, newMsg]);
        setChatInput('');
        toast.success("Message sent");
    };

    const handleDeleteMessage = (id) => {
        setMessages(messages.filter(m => m.id !== id));
        toast.success("Message deleted");
    };

    const handleEditMessage = (id, newText) => {
        setMessages(messages.map(m => m.id === id ? { ...m, text: newText, isEdited: true } : m));
        toast.success("Message edited");
    };

    const handleEmojiClick = (emojiData) => {
        setChatInput(prev => prev + emojiData.emoji);
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            toast.info(`Attached: ${file.name}`);
        }
    };

    const handleStartEdit = (msg) => {
        setEditingMessageId(msg.id);
        setEditInput(msg.text);
        setActiveMessageMenu(null);
    };

    const submitEdit = (id) => {
        if (editInput.trim()) {
            handleEditMessage(id, editInput);
            setEditingMessageId(null);
        }
    };

    const renderMessageActions = (msg, isMe) => {
        const isEditable = isMe; // Allow edits for demo purposes
        
        return (
            <div className={`absolute top-1 right-1 z-20`}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id);
                    }}
                    className={`p-1 ${isMe ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-black/5'} rounded-full transition-all opacity-0 group-hover/bubble:opacity-100 ${activeMessageMenu === msg.id ? 'opacity-100 bg-black/5' : ''}`}
                >
                    <MoreVertical size={14} />
                </button>

                {activeMessageMenu === msg.id && (
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
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderSidebarItem = (contact, Icon) => {
        const isActive = activeChannel === contact.id;
        const unreadCount = 0; 

        return (
            <button
                key={contact.id}
                onClick={() => setActiveChannel(contact.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-[#0b2d49] text-[#d7a444] shadow-md shadow-[#0b2d49]/10 border-l-4 border-[#d7a444]' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
            >
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white/10 text-[#d7a444]' : 'bg-gray-100 text-gray-500'}`}>
                    {Icon ? <Icon size={18} /> : <span className="text-xs font-bold">{contact.name.substring(0, 2).toUpperCase()}</span>}
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${contact.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>

                <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-[#d7a444]' : 'text-gray-700'}`}>{contact.name}</p>
                        {unreadCount > 0 && <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 shadow-sm animate-pulse"></div>}
                    </div>
                    <p className={`text-xs truncate ${isActive ? 'text-[#d7a444]/60 font-medium' : 'text-gray-400'}`}>
                        {contact.role || contact.lastSeen}
                    </p>
                </div>
            </button>
        )
    };

    return (
        <div className="flex h-[calc(100vh)] bg-slate-50 overflow-hidden">
            {/* --- LEFT SIDEBAR --- */}
            <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm z-10">
                {/* Header Context */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Messages</h2>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#0b2d49]/10 text-gray-700 placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-scroll p-4 space-y-2 custom-scrollbar">
                    {/* Render exact contacts for Vendor */}
                    <div className="space-y-1">
                        {vendorContacts.map(c => renderSidebarItem(c, null))}
                    </div>
                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">

                {/* Header */}
                <div className="bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-[#0b2d49]">
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-gray-900">
                                    {currentContact ? currentContact.name : 'Select a chat'}
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">
                                {currentContact?.role || 'Direct Message'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">

                    {currentContact ? (
                        <>
                            <div className="flex items-center justify-center my-6">
                                <span className="bg-gray-200/50 text-gray-500 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">Chat History</span>
                            </div>

                            <div className="max-w-5xl mx-auto space-y-8">
                                {/* Only show messages between currentUser and currentContact */}
                                {messages.filter(m => 
                                    (m.senderId === currentUserId && m.receiverId === currentContact.id) ||
                                    (m.receiverId === currentUserId && m.senderId === currentContact.id)
                                ).map(msg => {
                                    const isMe = msg.senderId === currentUserId;

                                    return (
                                        <div
                                            key={msg.id}
                                            className="group relative"
                                            onContextMenu={(e) => handleContextMenu(e, msg.id)}
                                        >
                                            {isMe ? (
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <div className="flex items-end gap-3 max-w-[75%]">
                                                        <div className="bg-[#0b2d49] text-white p-5 pr-8 rounded-2xl rounded-tr-sm shadow-sm relative group/bubble">
                                                            {renderMessageActions(msg, true)}
                                                            {editingMessageId === msg.id ? (
                                                                <div className="flex flex-col gap-3">
                                                                    <textarea
                                                                        className="bg-white/10 text-white rounded-xl p-3 text-[15px] outline-none border border-white/20 min-w-62.5"
                                                                        value={editInput}
                                                                        onChange={(e) => setEditInput(e.target.value)}
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex justify-end gap-3 text-sm">
                                                                        <button onClick={() => setEditingMessageId(null)} className="font-bold opacity-70 hover:opacity-100 transition-opacity">Cancel</button>
                                                                        <button onClick={() => submitEdit(msg.id)} className="font-bold text-[#d7a444] hover:text-[#f3c15c] transition-colors">Save</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>
                                                                    {msg.isEdited && <span className="text-[10px] opacity-40 float-right mt-1.5 ml-3 italic">edited</span>}
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0b2d49] flex items-center justify-center text-xs font-bold shrink-0 border border-blue-100 uppercase shadow-sm">ME</div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mr-14">
                                                        <span className="text-[11px] font-bold text-gray-400">{msg.timestamp}</span>
                                                        {msg.status === 'sending' && <Clock size={14} className="text-gray-400" />}
                                                        {msg.status === 'sent' && <Check size={14} className="text-gray-400" />}
                                                        {(msg.status === 'delivered' || msg.status === 'read') && <CheckCheck size={14} className={msg.status === 'read' ? 'text-green-500' : 'text-gray-400'} />}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-start gap-1.5">
                                                    <div className="flex items-end gap-3 max-w-[75%]">
                                                        <div className="w-10 h-10 rounded-full bg-white text-gray-600 flex items-center justify-center text-xs font-bold shrink-0 border border-gray-200 shadow-sm">
                                                            {currentContact.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="bg-white border border-gray-100/50 text-gray-800 p-5 pr-8 rounded-2xl rounded-tl-sm shadow-sm relative group/bubble">
                                                            {renderMessageActions(msg, false)}
                                                            <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 ml-14">
                                                        <span className="text-[11px] font-bold text-gray-400">{msg.timestamp}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full mt-20">
                            <Users size={64} className="mb-6 opacity-20" />
                            <p className="font-medium text-xl text-gray-500">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>

                {/* Footer Input */}
                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className={`bg-gray-100 rounded-4xl px-3 py-2 flex items-center gap-2 border border-transparent transition-all relative shadow-inner ${currentContact ? 'focus-within:border-[#0b2d49]/10 focus-within:bg-gray-50 focus-within:shadow-md' : 'opacity-50 pointer-events-none'}`}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={handleAttachClick}
                                className="p-2.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <Paperclip size={22} />
                            </button>
                            <div className="relative" ref={emojiPickerRef}>
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2.5 rounded-full transition-colors ${showEmojiPicker ? 'text-[#0b2d49] bg-gray-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <Smile size={22} />
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-6 shadow-2xl animate-in slide-in-from-bottom-2 duration-200 z-50">
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            autoFocusSearch={false}
                                            theme="light"
                                            width={340}
                                            height={420}
                                        />
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your message here..."
                                className="flex-1 bg-transparent border-none focus:ring-0 outline-none focus:outline-none text-[16px] font-medium text-gray-800 placeholder-gray-500 min-w-0"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!chatInput.trim()}
                                className="p-3.5 bg-[#0b2d49] hover:bg-[#1a3b55] text-white rounded-full transition-all disabled:opacity-50 disabled:scale-95 shadow-md flex items-center justify-center shrink-0"
                            >
                                <Send size={20} className="ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- CONTEXT MENU --- */}
            {contextMenu.show && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-100 bg-white rounded-2xl shadow-2xl border border-gray-100 min-w-40 p-2 animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {(() => {
                        const msg = messages.find(m => m.id === contextMenu.msgId);
                        if (!msg) return null;
                        const isMe = msg.senderId === currentUserId;
                        const isEditable = isMe;

                        return (
                            <>
                                {isEditable && (
                                    <button
                                        onClick={() => {
                                            handleStartEdit(msg);
                                            setContextMenu(prev => ({ ...prev, show: false }));
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                    >
                                        Edit Message
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        handleDeleteMessage(contextMenu.msgId);
                                        setContextMenu(prev => ({ ...prev, show: false }));
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

export default ManagerChat;
