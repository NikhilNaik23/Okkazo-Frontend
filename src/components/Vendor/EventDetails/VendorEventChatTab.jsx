import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Search, Volume2, Users, Briefcase, MoreVertical,
    Lock, CheckCheck, Eye, Plus, Paperclip, Send, ShieldCheck,
    ChevronDown, ChevronRight, Phone, Smile, Clock, Check
} from 'lucide-react';
import { toast } from "react-hot-toast";
import EmojiPicker from 'emoji-picker-react';

const VendorEventChatTab = () => {
    const {
        activeChannel,
        setActiveChannel,
        chatInput,
        setChatInput,
        searchTerm,
        setSearchTerm,
        groupChats,
        admins,
        clients,
        team,
        vendors,
        messages,
        handleSend
    } = useOutletContext();

    const groupChannels = ['vendors', 'general', 'internal'];
    const isGroup = groupChannels.includes(activeChannel);

    const [isVendorsOpen, setIsVendorsOpen] = useState(true);
    const [isInternalOpen, setIsInternalOpen] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = React.useRef(null);


    const filteredGroupChats = groupChats.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredAdmins = admins.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTeam = team.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleEmojiClick = (emojiData) => {
        setChatInput(prev => prev + emojiData.emoji);
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            toast.info(`Selected file: ${file.name}`);
            // In a real app, we'd upload here
        }
    };

    const renderSidebarItem = (id, name, subtext, Icon, isActive, badge, statusColor) => (
        <button
            key={id}
            onClick={() => setActiveChannel(id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-[#e7f7f5] border-l-4 border-teal-500 shadow-sm' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                {Icon ? <Icon size={18} /> : <span className="text-xs font-bold">{name.substring(0, 2).toUpperCase()}</span>}
                {statusColor && <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${statusColor}`} />}
            </div>

            <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-teal-900' : 'text-gray-700'}`}>{name}</p>
                    {badge > 0 && <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 shadow-sm animate-pulse"></div>}
                </div>
                <p className={`text-xs truncate ${isActive ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>
                    {subtext}
                </p>
            </div>
        </button>
    );



    return (
        <div className="flex h-[calc(100vh-150px)] bg-white rounded-3xl border border-[#708aa0]/10 overflow-hidden shadow-sm">
            {/* --- LEFT SIDEBAR --- */}
            <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0">
                {/* Search */}
                <div className="p-5 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/10 text-gray-700 placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-scroll p-4 space-y-6 custom-scrollbar">

                    {/* Group Chats */}
                    <div>
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Groups</h4>
                        <div className="space-y-1">
                            {filteredGroupChats.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => setActiveChannel(group.id)}
                                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${activeChannel === group.id ? 'bg-[#e7f7f5] border border-teal-100' : 'hover:bg-gray-50 border border-transparent'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${group.bg} ${group.color}`}>
                                        <group.icon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-800">{group.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <p className="text-[11px] text-gray-500">Group Chat</p>
                                        </div>

                                    </div>
                                </button>
                            ))}
                            <button
                                onClick={() => setActiveChannel('internal')}
                                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${activeChannel === 'internal' ? 'bg-[#e7f7f5] border border-teal-100' : 'hover:bg-gray-50 border border-transparent'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-600`}>
                                    <Users size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-800">All Internal Team</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <p className="text-[11px] text-gray-500">Group Chat</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Admin */}
                    <div>
                        <div className="flex justify-between items-center px-3 mb-2">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Admin</h4>
                            <Volume2 size={12} className="text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            {filteredAdmins.map((p, i) => renderSidebarItem(p.name, p.name, "Permissions updated", null, false, 0, p.online ? 'bg-green-500' : 'bg-gray-300'))}
                        </div>
                    </div>

                    {/* Client */}
                    <div>
                        <div className="flex justify-between items-center px-3 mb-2">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Client</h4>
                            <Users size={12} className="text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            {filteredClients.map((p, i) => renderSidebarItem('client', p.name, "Check the floor plan...", null, activeChannel === 'client', 0, p.online ? 'bg-green-500' : 'bg-gray-300'))}
                        </div>
                    </div>

                    {/* Internal Team */}
                    <div>
                        <button
                            onClick={() => setIsInternalOpen(!isInternalOpen)}
                            className="w-full flex justify-between items-center px-3 mb-2 hover:bg-gray-50 rounded-lg py-1 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                {isInternalOpen ? (
                                    <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                ) : (
                                    <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                )}
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">Internal Team</h4>
                                {!isInternalOpen && <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 animate-pulse ml-2" />}
                            </div>
                            <Users size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </button>

                        {isInternalOpen && (
                            <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-200 origin-top">
                                {filteredTeam.map((p, i) => renderSidebarItem(p.name, p.name, p.role, null, false, 0, p.online ? 'bg-green-500' : 'bg-gray-300'))}
                            </div>
                        )}
                    </div>

                    {/* Vendors */}
                    <div>
                        <button
                            onClick={() => setIsVendorsOpen(!isVendorsOpen)}
                            className="w-full flex justify-between items-center px-3 mb-2 hover:bg-gray-50 rounded-lg py-1 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                {isVendorsOpen ? (
                                    <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                ) : (
                                    <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                )}
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">Vendors</h4>
                            </div>
                            <Briefcase size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </button>

                        {isVendorsOpen && (
                            <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-200 origin-top">
                                {filteredVendors.map((p, i) => renderSidebarItem(
                                    'vendor_' + i,
                                    p.name,
                                    p.role === 'Catering' ? 'Menu finalized for Day 2' : 'Testing sound system now',
                                    null,
                                    false,
                                    0,
                                    p.online ? 'bg-green-500' : 'bg-gray-300'
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">

                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-[#0b2d49]">
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-gray-900">
                                    {(() => {
                                        if (activeChannel === 'vendors') return 'All Vendors';
                                        if (activeChannel === 'general') return 'All Stakeholders';
                                        if (activeChannel === 'internal') return 'All Internal Team';
                                        if (activeChannel === 'client') return clients[0]?.name || 'Client';
                                        if (activeChannel.startsWith('vendor_')) {
                                            const idx = parseInt(activeChannel.split('_')[1]);
                                            return vendors[idx]?.name || 'Vendor';
                                        }
                                        const teamMember = team.find(t => t.name === activeChannel);
                                        if (teamMember) return teamMember.name;

                                        const admin = admins.find(a => a.name === activeChannel);
                                        if (admin) return admin.name;

                                        return activeChannel;
                                    })()}
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">
                                {['vendors', 'general', 'internal'].includes(activeChannel) ? 'Group Chat' : 'Active conversation'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            <Phone size={20} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">



                    <div className="flex items-center justify-center my-6">
                        <span className="bg-gray-200/50 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Today</span>
                    </div>

                    {/* Broadcast History / Messages */}
                    <div className="max-w-4xl mx-auto space-y-6">

                        {messages.filter(m => m.channel === activeChannel).map(msg => (
                            <div key={msg.id} className="group">
                                {(msg.sender === 'You' || msg.sender === 'Manager' || msg.sender === 'me') ? (
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-end gap-3 max-w-[75%]">
                                            <div className="bg-[#0b2d49] text-white p-4 rounded-2xl rounded-tr-sm shadow-sm">
                                                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0b2d49] flex items-center justify-center text-xs font-bold shrink-0 border border-blue-100">ME</div>
                                        </div>
                                        <div className="flex items-center gap-1 mr-12">
                                            <span className="text-[10px] font-bold text-gray-400">{msg.time}</span>
                                            {msg.status === 'sending' && <Clock size={12} className="text-gray-400" />}
                                            {msg.status === 'sent' && <Check size={12} className="text-gray-400" />}
                                            {msg.status === 'delivered' && <CheckCheck size={12} className="text-gray-400" />}
                                            {(msg.status === 'read' || !msg.status) && <CheckCheck size={12} className="text-green-500" />}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-start gap-1">
                                        {isGroup && <span className="text-[10px] font-bold text-gray-500 ml-12 mb-0.5">{msg.sender}</span>}
                                        <div className="flex items-end gap-3 max-w-[75%]">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0 border border-gray-200">
                                                {msg.sender.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                                                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 ml-12">{msg.time}</span>
                                    </div>
                                )}
                            </div>
                        ))}

                    </div>
                </div>

                {/* Footer Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-100 rounded-[1.5rem] px-2 py-1.5 flex items-center gap-1 border border-transparent focus-within:border-[#0b2d49]/10 focus-within:bg-gray-50 transition-all relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={handleAttachClick}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <Paperclip size={20} />
                            </button>
                            <div className="relative">
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
                                            searchPlaceholder="Search emojis..."
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
        </div>
    );
};

export default VendorEventChatTab;
