import React, { useState, useEffect, useRef } from 'react';
import {
  Search, MoreVertical, Phone, Video, Image, Paperclip,
  Send, Hash, ChevronDown, Plus, Settings, Smile,
  Globe, MapPin, FileText, X, Menu, Clock, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ManagerChat = () => {
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
    { id: "dm-1", name: "Sarah Johnson", status: "online", avatar: "SJ", role: "Event Organizer", lastMsg: "I'll pass this along...", time: "11:05 AM", unread: 0 },
    { id: "dm-2", name: "Mike Reynolds", status: "busy", avatar: "MR", role: "Client", lastMsg: "Budget approved!", time: "9:15 AM", unread: 3 },
    { id: "dm-3", name: "Lisa Chen", status: "offline", avatar: "LC", role: "Venue Coordinator", lastMsg: "See you tomorrow.", time: "Yesterday", unread: 0 },
  ];

  const chatPartners = {
    "dm-1": { name: "Sarah Johnson", role: "Event Organizer", subtitle: "Event Organizer • #EVT-2024-089", location: "New York, NY", localTime: "11:05 AM Local Time" },
    "dm-2": { name: "Mike Reynolds", role: "Client", subtitle: "Client • #EVT-2024-112", location: "Chicago, IL", localTime: "10:05 AM Local Time" },
    "dm-3": { name: "Lisa Chen", role: "Venue Coordinator", subtitle: "Venue Coordinator • #EVT-2024-095", location: "Los Angeles, CA", localTime: "8:05 AM Local Time" },
  };

  const [messages, setMessages] = useState([
    { id: 1, sender: "Sarah Johnson", senderId: "dm-1", text: "Hi! Regarding the Grand Wedding Gala (#EVT-2024-089), we are finalizing the vendor list. Could you please provide the updated quote for the Veg Menu including the dessert station we discussed?", time: "10:24 AM", type: "text" },
    { id: 2, sender: "You", senderId: "me", text: "Hello Sarah! Absolutely. I've just adjusted the quote to include the artisan dessert station and the additional staff members for the 200 pax count.", time: "10:28 AM", type: "text" },
    { id: 3, sender: "Sarah Johnson", senderId: "dm-1", text: "Here's the finalized menu document for your review.", time: "10:33 AM", type: "file", fileName: "Gala_Menu_Final_v2.pdf", fileSize: "2.4 MB" },
    { id: 4, sender: "You", senderId: "me", text: "Received. Looks perfect. I'll approve the invoice.", time: "10:35 AM", type: "text" },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeDM = dms.find(dm => dm.id === selectedChat);
  const activePartner = chatPartners[selectedChat] || { name: "Channel", subtitle: "Group conversation", role: "" };

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
        sender: activePartner.name,
        senderId: selectedChat,
        text: "Got it, checking with the team!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text"
      };
      setMessages(prev => [...prev, replyMsg]);
      toast(`New message from ${activePartner.name}`, {
        icon: '💬',
        style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' }
      });
    }, 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* 1. Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: showSidebar ? 300 : 0, opacity: showSidebar ? 1 : 0 }}
        className="border-r border-[#708aa0]/10 bg-[#f7f9fa] flex flex-col overflow-hidden shrink-0"
      >
        <div className="p-5 border-b border-[#708aa0]/10 flex items-center justify-between">
          <h2 className="font-black text-xl text-[#0b2d49] tracking-tight">Messages</h2>
          <button className="p-2 hover:bg-[#e9eff1] rounded-xl text-[#708aa0] transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#708aa0]" />
            <input
              type="text"
              placeholder="Jump to..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#708aa0]/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#d7a444]/20 focus:border-[#d7a444] transition-all shadow-sm text-[#0b2d49] placeholder:text-[#708aa0]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
          {/* Channels Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2 group cursor-pointer">
              <span className="text-[10px] font-black text-[#708aa0] uppercase tracking-[0.15em] group-hover:text-[#0b2d49] transition-colors flex items-center gap-1">
                <ChevronDown className="w-3 h-3" /> Channels
              </span>
              <Plus className="w-4 h-4 text-[#708aa0] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-0.5">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChat(ch.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedChat === ch.id ? 'bg-[#d7a444]/10 text-[#0b2d49]' : 'text-[#708aa0] hover:bg-[#e9eff1]'}`}
                >
                  <div className="flex items-center gap-2">
                    <Hash className={`w-4 h-4 ${selectedChat === ch.id ? 'text-[#d7a444]' : 'text-[#708aa0]'}`} />
                    {ch.name}
                  </div>
                  {ch.unread > 0 && <span className="bg-[#d7a444] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{ch.unread}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* DMs Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2 group cursor-pointer">
              <span className="text-[10px] font-black text-[#708aa0] uppercase tracking-[0.15em] group-hover:text-[#0b2d49] transition-colors flex items-center gap-1">
                <ChevronDown className="w-3 h-3" /> Direct Messages
              </span>
              <Plus className="w-4 h-4 text-[#708aa0] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              {dms.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => setSelectedChat(dm.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group/dm ${selectedChat === dm.id ? 'bg-[#d7a444]/10 border-l-[3px] border-[#d7a444] rounded-l-none' : 'hover:bg-[#e9eff1] border-l-[3px] border-transparent'}`}
                >
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${selectedChat === dm.id ? 'bg-[#0b2d49] text-white' : 'bg-[#e9eff1] text-[#708aa0]'}`}>
                      {dm.avatar}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[#f7f9fa] rounded-full ${dm.status === 'online' ? 'bg-emerald-500' : dm.status === 'busy' ? 'bg-red-500' : 'bg-[#708aa0]/40'}`}></span>
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm truncate ${selectedChat === dm.id ? 'font-black text-[#0b2d49]' : 'font-bold text-[#0b2d49]/80'}`}>{dm.name}</span>
                      {dm.unread > 0 && <span className="w-2 h-2 rounded-full bg-[#d7a444]"></span>}
                    </div>
                    <p className="text-[10px] text-[#5a5b44] font-bold uppercase tracking-wider truncate">{dm.role}</p>
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
        <div className="h-[72px] border-b border-[#708aa0]/10 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button onClick={() => setShowSidebar(true)} className="p-2 hover:bg-[#e9eff1] rounded-xl mr-2">
                <Menu className="w-5 h-5 text-[#708aa0]" />
              </button>
            )}
            <Hash className="w-5 h-5 text-[#708aa0]" />
            <div>
              <h3 className="font-black text-[#0b2d49]">{activeDM ? activeDM.name : selectedChat.replace('ch-', '#')}</h3>
              <p className="text-[10px] text-[#708aa0] font-bold uppercase tracking-widest">{activePartner.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 border-l border-[#708aa0]/10 pl-4">
            <button onClick={() => toast.success("Starting call...")} className="p-2.5 text-[#708aa0] hover:text-[#d7a444] hover:bg-[#d7a444]/10 rounded-xl transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button onClick={() => toast.success("Starting video call...")} className="p-2.5 text-[#708aa0] hover:text-[#d7a444] hover:bg-[#d7a444]/10 rounded-xl transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2.5 rounded-xl transition-colors ${showInfo ? 'bg-[#0b2d49] text-white' : 'text-[#708aa0] hover:text-[#0b2d49] hover:bg-[#e9eff1]'}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="flex justify-center my-4">
            <span className="bg-[#e9eff1] text-[#708aa0] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em]">Today, Oct 24</span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === "me";
            return (
              <div key={msg.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 self-end mb-1 ${isMe ? 'bg-[#d7a444] text-white' : 'bg-[#0b2d49] text-white'}`}>
                  {isMe ? "ME" : msg.sender.split(' ').map(w => w[0]).join('').toUpperCase()}
                </div>
                <div className={`flex flex-col text-sm max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-baseline gap-2 mb-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="font-black text-[#0b2d49] text-[13px]">{isMe ? 'You' : msg.sender}</span>
                    <span className="text-[10px] text-[#708aa0] font-bold">{msg.time}</span>
                  </div>

                  {msg.type === 'text' && (
                    <div className={`px-5 py-3.5 shadow-sm font-medium leading-relaxed ${isMe
                      ? 'bg-[#d7a444] text-white rounded-[1.5rem] rounded-br-sm'
                      : 'bg-white border border-[#708aa0]/10 text-[#0b2d49]/80 rounded-[1.5rem] rounded-bl-sm'
                      }`}>
                      {msg.text}
                    </div>
                  )}

                  {msg.type === 'file' && (
                    <div onClick={() => toast.success("Downloading file...")} className="bg-white border border-[#708aa0]/10 rounded-2xl p-4 flex items-center gap-3 w-72 shadow-sm hover:border-[#d7a444] cursor-pointer transition-all group/file">
                      <div className="w-11 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover/file:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[#0b2d49] text-sm truncate">{msg.fileName}</p>
                        <p className="text-[10px] text-[#708aa0] font-bold uppercase tracking-wider">{msg.fileSize} • PDF</p>
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
        <div className="p-4 bg-white border-t border-[#708aa0]/10">
          <div className="border border-[#708aa0]/15 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#d7a444]/20 focus-within:border-[#d7a444] transition-all bg-[#f7f9fa] focus-within:bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2.5 bg-[#f7f9fa] border-b border-[#708aa0]/5">
              <button className="p-1.5 text-[#708aa0] hover:text-[#0b2d49] hover:bg-[#e9eff1] rounded-lg font-black text-xs transition-colors">B</button>
              <button className="p-1.5 text-[#708aa0] hover:text-[#0b2d49] hover:bg-[#e9eff1] rounded-lg italic text-xs font-serif transition-colors">I</button>
              <div className="w-px h-4 bg-[#708aa0]/20 mx-1"></div>
              <button className="p-1.5 text-[#708aa0] hover:text-[#0b2d49] hover:bg-[#e9eff1] rounded-lg transition-colors"><Paperclip className="w-4 h-4" /></button>
              <button className="p-1.5 text-[#708aa0] hover:text-[#0b2d49] hover:bg-[#e9eff1] rounded-lg transition-colors"><Image className="w-4 h-4" /></button>
            </div>
            <div className="flex items-end gap-2 p-3">
              <textarea
                placeholder={`Message ${activeDM ? activeDM.name : 'channel'}...`}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#0b2d49] placeholder:text-[#708aa0] resize-none min-h-[40px] max-h-32 py-2 px-2"
                rows={1}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center gap-2 pb-1">
                <button className="p-2 text-[#708aa0] hover:text-[#d7a444] rounded-xl hover:bg-[#d7a444]/10 transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center ${messageInput.trim() ? 'bg-[#d7a444] text-white hover:bg-[#c49a3d] hover:scale-105 shadow-[#d7a444]/20' : 'bg-[#e9eff1] text-[#708aa0] cursor-not-allowed'}`}
                  disabled={!messageInput.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-[#708aa0] mt-2 font-bold">
            <strong className="text-[#0b2d49]">Enter</strong> to send • <strong className="text-[#0b2d49]">Shift + Enter</strong> for new line
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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-80 border-l border-[#708aa0]/10 bg-white shadow-xl z-20 flex flex-col shrink-0"
          >
            <div className="p-5 border-b border-[#708aa0]/10 flex items-center justify-between">
              <h3 className="font-black text-[#0b2d49]">Details</h3>
              <button onClick={() => setShowInfo(false)} className="p-1.5 hover:bg-[#e9eff1] rounded-lg text-[#708aa0] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center border-b border-[#708aa0]/5">
              <div className="w-24 h-24 rounded-[1.5rem] bg-[#d7a444]/10 flex items-center justify-center font-black text-2xl text-[#d7a444] mb-4 shadow-inner border border-[#d7a444]/10">
                {activeDM?.avatar || "CH"}
              </div>
              <h3 className="text-xl font-black text-[#0b2d49]">{activePartner.name}</h3>
              <p className="text-[10px] font-bold text-[#708aa0] uppercase tracking-widest mt-1">{activePartner.role}</p>
              <div className="flex gap-2 mt-5 w-full">
                <button onClick={() => toast.success("Dialing...")} className="flex-1 px-4 py-2.5 bg-[#e9eff1] hover:bg-[#0b2d49] hover:text-white text-[#0b2d49] rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all">
                  <Phone className="w-3.5 h-3.5" /> Call
                </button>
                <button onClick={() => toast("Viewing profile...")} className="flex-1 px-4 py-2.5 bg-[#e9eff1] hover:bg-[#0b2d49] hover:text-white text-[#0b2d49] rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all">
                  <Globe className="w-3.5 h-3.5" /> Profile
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <h4 className="text-[10px] font-black text-[#708aa0] uppercase tracking-[0.15em] mb-3">About</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-[#0b2d49]/80">
                    <MapPin className="w-4 h-4 text-[#708aa0]" /> {activePartner.location}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-[#0b2d49]/80">
                    <Clock className="w-4 h-4 text-[#708aa0]" /> {activePartner.localTime}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-[#708aa0] uppercase tracking-[0.15em] mb-3">Shared Files</h4>
                <div className="space-y-3">
                  {[
                    { name: "Gala_Menu_Final_v2.pdf", size: "2.4 MB", date: "Oct 24" },
                    { name: "Invoice_Q4_2024.pdf", size: "1.8 MB", date: "Oct 22" },
                    { name: "Venue_Layout_Draft.pdf", size: "3.1 MB", date: "Oct 20" },
                  ].map((file, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-pointer">
                      <div className="p-2.5 bg-[#e9eff1] rounded-xl text-[#708aa0] group-hover:bg-[#d7a444]/10 group-hover:text-[#d7a444] transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[#0b2d49] truncate group-hover:text-[#d7a444] transition-colors">{file.name}</p>
                        <p className="text-[10px] text-[#708aa0] font-bold">{file.size} • {file.date}</p>
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

export default ManagerChat;
