import React, { useState, useEffect, useRef } from 'react';
import {
    Search, MoreVertical, Phone, Video, Image, Paperclip,
    Send, Mic, Circle, CheckCheck, Clock, Hash, Users,
    ChevronDown, Plus, Settings, Smile, Globe, MapPin,
    FileText, X, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ManagerChatPage = () => {
    const [selectedChat, setSelectedChat] = useState("dm-1");
    const [messageInput, setMessageInput] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const messagesEndRef = useRef(null);

    // Mock Data
    const channels = [
        { id: "ch-1", name: "general", unread: 0 },
        { id: "ch-2", name: "announcements", unread: 2 },
        { id: "ch-3", name: "vendor-updates", unread: 0 },
        { id: "ch-4", name: "budget-approvals", unread: 5 },
    ];

    const dms = [
        { id: "dm-1", name: "Epicurean Catering", status: "online", avatar: "EC", role: "Vendor", lastMsg: "Menu confirmed.", time: "10:30 AM", unread: 0 },
        { id: "dm-2", name: "Sarah Jenkins", status: "busy", avatar: "SJ", role: "Admin", lastMsg: "Please review the...", time: "9:15 AM", unread: 3 },
        { id: "dm-3", name: "Mike Ross", status: "offline", avatar: "MR", role: "Logistics", lastMsg: "On my way.", time: "Yesterday", unread: 0 },
    ];

    const [messages, setMessages] = useState([
        { id: 1, sender: "Epicurean Catering", senderId: "dm-1", text: "Hi! We've finalized the menu for the Gala.", time: "10:30 AM", type: "text" },
        { id: 2, sender: "You", senderId: "me", text: "That's great news! Can you send over the PDF?", time: "10:32 AM", type: "text" },
        { id: 3, sender: "Epicurean Catering", senderId: "dm-1", text: "Here it is. Let me know if you need changes.", time: "10:33 AM", type: "file", fileName: "Gala_Menu_Final_v2.pdf", fileSize: "2.4 MB" },
        { id: 4, sender: "You", senderId: "me", text: "Received. Looks perfect. I'll approve the invoice.", time: "10:35 AM", type: "text" },
    ]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const newMsg = {
            id: messages.length + 1,
            sender: "You",
            senderId: "me",
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "text"
        };

        setMessages([...messages, newMsg]);
        setMessageInput('');

        // Mock Reply
        setTimeout(() => {
            const replyMsg = {
                id: messages.length + 2,
                sender: "Epicurean Catering",
                senderId: "dm-1",
                text: "Thanks! We'll proceed with the prep.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: "text"
            };
            setMessages(prev => [...prev, replyMsg]);
            toast("New message from Epicurean Catering", { icon: '💬' });
        }, 3000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] max-h-[900px] overflow-hidden bg-white border-t border-gray-100">

            {/* 1. Sidebar */}
            <motion.div
                initial={false}
                animate={{ width: showSidebar ? 320 : 0, opacity: showSidebar ? 1 : 0 }}
                className="border-r border-gray-100 bg-gray-50/50 flex flex-col overflow-hidden"
            >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-extrabold text-xl text-gray-900 tracking-tight">Messages</h2>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Settings className="w-5 h-5" /></button>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Jump to..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
                    {/* Channels Section */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2 group cursor-pointer">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide group-hover:text-gray-600 transition-colors flex items-center gap-1">
                                <ChevronDown className="w-3 h-3" /> Channels
                            </span>
                            <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-0.5">
                            {channels.map((ch) => (
                                <button
                                    key={ch.id}
                                    onClick={() => setSelectedChat(ch.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedChat === ch.id ? 'bg-teal-50 text-teal-900 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Hash className={`w-4 h-4 ${selectedChat === ch.id ? 'text-teal-500' : 'text-gray-400'}`} />
                                        {ch.name}
                                    </div>
                                    {ch.unread > 0 && <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 rounded-full">{ch.unread}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DMs Section */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2 group cursor-pointer">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide group-hover:text-gray-600 transition-colors flex items-center gap-1">
                                <ChevronDown className="w-3 h-3" /> Direct Messages
                            </span>
                            <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-1">
                            {dms.map((dm) => (
                                <button
                                    key={dm.id}
                                    onClick={() => setSelectedChat(dm.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${selectedChat === dm.id ? 'bg-teal-50 border-l-2 border-teal-500 rounded-l-none' : 'hover:bg-gray-100 border-l-2 border-transparent'}`}
                                >
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                                            {dm.avatar}
                                        </div>
                                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${dm.status === 'online' ? 'bg-green-500' : dm.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                                            }`}></span>
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm truncate ${selectedChat === dm.id ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{dm.name}</span>
                                            {dm.unread > 0 && <span className="w-2 h-2 rounded-full bg-teal-500"></span>}
                                        </div>
                                        <p className="text-xs text-gray-400 truncate opacity-0 group-hover:opacity-100 transition-opacity">{dm.lastMsg}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 2. Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative z-0">
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        {!showSidebar && (
                            <button onClick={() => setShowSidebar(true)} className="p-2 hover:bg-gray-50 rounded-lg mr-2 lg:hidden">
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        <Hash className="w-5 h-5 text-gray-400" />
                        <div>
                            <h3 className="font-bold text-gray-900">Epicurean Catering</h3>
                            <p className="text-xs text-gray-500 font-medium">Vendor • San Francisco • 9:42 AM Local</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 border-l border-gray-100 pl-4">
                        <button onClick={() => toast.success("Calling Epicurean Catering...")} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Phone className="w-5 h-5" /></button>
                        <button onClick={() => toast.success("Starting video call...")} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Video className="w-5 h-5" /></button>
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className={`p-2 rounded-lg transition-colors ${showInfo ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex justify-center my-6">
                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">Today, Oct 24</span>
                    </div>

                    {messages.map((msg) => {
                        const isMe = msg.senderId === "me";
                        return (
                            <div key={msg.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600 shrink-0 self-end mb-1">
                                    {isMe ? "ME" : msg.sender.substring(0, 2).toUpperCase()}
                                </div>
                                <div className={`flex flex-col text-sm max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2 mb-1 px-1">
                                        <span className="font-bold text-gray-900">{isMe ? 'You' : msg.sender}</span>
                                        <span className="text-xs text-gray-400 font-medium">{msg.time}</span>
                                    </div>

                                    {msg.type === 'text' && (
                                        <div className={`px-4 py-3 rounded-2xl shadow-sm ${isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    )}

                                    {msg.type === 'file' && (
                                        <div onClick={() => toast.success("Downloading file...")} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 w-64 shadow-sm hover:border-teal-500 cursor-pointer transition-colors">
                                            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{msg.fileName}</p>
                                                <p className="text-xs text-gray-500">{msg.fileSize} • PDF</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all bg-gray-50 focus-within:bg-white overflow-hidden">
                        {/* Toolbar */}
                        <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200/50">
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded font-bold text-xs">B</button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded italic text-xs font-serif">I</button>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded"><Paperclip className="w-4 h-4" /></button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded"><Image className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-end gap-2 p-2">
                            <textarea
                                placeholder="Message Epicurean Catering..."
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 resize-none min-h-[40px] max-h-32 py-2 px-2"
                                rows={1}
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="flex items-center gap-2 pb-1">
                                <button className="p-2 text-gray-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-colors">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    className={`p-2 rounded-lg transition-all shadow-sm flex items-center justify-center ${messageInput.trim() ? 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    disabled={!messageInput.trim()}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
                        <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line
                    </p>
                </div>
            </div>

            {/* 3. Info Sidebar (Right) */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="w-80 border-l border-gray-100 bg-white shadow-xl z-20 flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Details</h3>
                            <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 flex flex-col items-center border-b border-gray-50">
                            <div className="w-24 h-24 rounded-2xl bg-teal-100 flex items-center justify-center font-bold text-2xl text-teal-700 mb-4 shadow-inner">EC</div>
                            <h3 className="text-xl font-extrabold text-gray-900">Epicurean Catering</h3>
                            <p className="text-sm font-medium text-gray-500">Premium Vendor</p>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => toast.success("Dialing vendor...")} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                                    <Phone className="w-3 h-3" /> Call
                                </button>
                                <button onClick={() => toast("Viewing vendor profile...")} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                                    <Globe className="w-3 h-3" /> Profile
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">About</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                        <MapPin className="w-4 h-4 text-gray-400" /> San Francisco, CA
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                        <Clock className="w-4 h-4 text-gray-400" /> 10:42 AM Local Time
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Shared Files</h4>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-700 truncate group-hover:text-gray-900">Menu_Draft_{i}.pdf</p>
                                                <p className="text-xs text-gray-400">2.4 MB • Oct 2{i}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManagerChatPage;
