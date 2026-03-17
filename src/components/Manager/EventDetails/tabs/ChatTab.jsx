import React, { useState } from 'react';
import {
    Hash, ShieldCheck, Star, Briefcase, Users, Send, Paperclip, Smile,
    Search, Volume2, MoreVertical, GripVertical, CheckCheck, Eye, Plus, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { chatChannels, chatParticipants, initialChatMessages } from '../../../../data/managerEventDetailsData';

const ChatTab = () => {
    const [activeChannel, setActiveChannel] = useState('vendors'); // Default to vendors for the demo
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState(initialChatMessages);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Derived Data for Sidebar ---
    const broadcastGroups = [
        { id: 'general', name: 'All Stakeholders', count: 45, icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'vendors', name: 'All Vendors', count: 15, icon: Volume2, color: 'text-teal-600', bg: 'bg-teal-50', activeBroadcast: true }
    ];

    const admins = chatParticipants.filter(p => p.type === 'admin');
    const clients = chatParticipants.filter(p => p.type === 'client');
    const team = chatParticipants.filter(p => p.type === 'team');
    const vendors = chatParticipants.filter(p => p.type === 'vendor');

    // --- Logic ---
    const handleSend = () => {
        if (!input.trim()) return;

        const isBroadcast = activeChannel === 'vendors';

        setMessages([...messages, {
            id: messages.length + 1,
            sender: "You",
            role: "Manager",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: input,
            channel: activeChannel,
            badge: 'bg-teal-100 text-teal-700',
            isBroadcast: isBroadcast
        }]);

        setInput('');

        if (isBroadcast) {
            toast.success("Broadcast sent to all vendors!");
        } else {
            toast.success("Message sent!");
        }
    };

    // --- Render Helpers ---
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
                    {badge && <span className="text-[10px] font-bold bg-teal-500 text-white px-1.5 rounded-full">{badge}</span>}
                </div>
                <p className={`text-xs truncate ${isActive ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>
                    {subtext}
                </p>
            </div>
        </button>
    );

    return (
        <div className="flex h-[750px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

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

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

                    {/* Broadcast Groups */}
                    <div>
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Broadcast Groups</h4>
                        <div className="space-y-1">
                            {broadcastGroups.map(group => (
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
                                            <p className="text-[11px] text-gray-500">Broadcast to {group.count} members</p>
                                        </div>
                                        {group.activeBroadcast && (
                                            <p className="text-[10px] font-bold text-teal-600 mt-1">Active Broadcast</p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Admin */}
                    <div>
                        <div className="flex justify-between items-center px-3 mb-2">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Admin</h4>
                            <Volume2 size={12} className="text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            {admins.map((p, i) => renderSidebarItem(p.name, p.name, "Permissions updated", null, false, 0, p.online ? 'bg-green-500' : 'bg-gray-300'))}
                        </div>
                    </div>

                    {/* Client */}
                    <div>
                        <div className="flex justify-between items-center px-3 mb-2">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Client</h4>
                            <Users size={12} className="text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            {clients.map((p, i) => renderSidebarItem('client', p.name, "Check the floor plan...", null, activeChannel === 'client', 0, p.online ? 'bg-green-500' : 'bg-gray-300'))}
                        </div>
                    </div>

                    {/* Internal Team */}
                    <div>
                        <div className="flex justify-between items-center px-3 mb-2">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Internal Team</h4>
                            <Users size={12} className="text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            {renderSidebarItem('internal', 'On-site Staff', 'Marcus: Setup is starting...', Users, activeChannel === 'internal', 2, 'bg-green-500')}
                            {team.slice(0, 2).map((p, i) => renderSidebarItem(p.name, p.name, p.role, null, false, 0, p.online ? 'bg-green-500' : 'bg-gray-300'))}
                        </div>
                    </div>

                    {/* Vendors */}
                    <div>
                        <div className="flex justify-between items-center px-3 mb-2">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vendors</h4>
                            <Briefcase size={12} className="text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            {vendors.map((p, i) => renderSidebarItem(
                                'vendor_' + i,
                                p.name,
                                p.role === 'Catering' ? 'Menu finalized for Day 2' : 'Testing sound system now',
                                null,
                                false,
                                0,
                                p.online ? 'bg-green-500' : 'bg-gray-300'
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">

                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeChannel === 'vendors' ? 'bg-[#e7f7f5] text-teal-600' : 'bg-rose-50 text-rose-500'}`}>
                            {activeChannel === 'vendors' ? <Volume2 size={24} /> : <Users size={24} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-gray-900">
                                    {activeChannel === 'vendors' ? 'All Vendors' : 'All Stakeholders'}
                                </h2>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${activeChannel === 'vendors' ? 'bg-[#e7f7f5] text-teal-700 border border-teal-100' : 'bg-gray-100 text-gray-600'}`}>
                                    Broadcast Group
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">
                                Broadcast to {activeChannel === 'vendors' ? '15 vendors' : '45 members'} • Gourmet Bites, Crystal Clear AV +13 more
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Users size={16} /> Manage Recipients
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Info Banner */}
                    <div className="mx-auto max-w-3xl bg-[#e7f7f5] border border-teal-100 rounded-xl p-4 flex items-start gap-4 text-teal-900">
                        <div className="p-1 bg-teal-200 rounded-full mt-0.5">
                            <Lock size={12} className="text-teal-800" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                Messages sent here will be delivered individually to all members of the <span className="font-bold">'{activeChannel === 'vendors' ? 'All Vendors' : 'All Stakeholders'}'</span> group.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center my-6">
                        <span className="bg-gray-200/50 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Today's Broadcasts</span>
                    </div>

                    {/* Broadcast History */}
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Mock Broadcast Message */}
                        {activeChannel === 'vendors' && (
                            <div className="group">
                                <div className="flex items-center justify-end gap-2 mb-2">
                                    <span className="text-xs font-bold text-gray-400">10:30 AM</span>
                                    <span className="text-xs font-bold text-gray-900">You (Manager)</span>
                                    <div className="w-8 h-8 rounded-full bg-[#e7f7f5] text-teal-700 flex items-center justify-center text-xs font-bold">ME</div>
                                </div>

                                <div className="bg-[#1cac78] rounded-2xl p-0 overflow-hidden shadow-sm text-white">
                                    <div className="bg-[#158f63] px-5 py-3 flex items-center gap-2">
                                        <Volume2 size={16} className="text-white/80" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-white/90">Vendor Update Notification</span>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[15px] font-medium leading-relaxed">
                                            Attention all vendors: The loading dock schedule for tomorrow has been updated. Please check the Logistics tab for your new 30-minute time slot. All deliveries must be completed by 10 AM.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end items-center gap-4 mt-2 pr-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600">
                                        <CheckCheck size={14} /> 15/15 Delivered
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                        <Eye size={14} /> 9 Read
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Sent Messages */}
                        {messages.filter(m => m.channel === activeChannel && m.isBroadcast).map(msg => (
                            <div key={msg.id} className="group">
                                <div className="flex items-center justify-end gap-2 mb-2">
                                    <span className="text-xs font-bold text-gray-400">{msg.time}</span>
                                    <span className="text-xs font-bold text-gray-900">You (Manager)</span>
                                    <div className="w-8 h-8 rounded-full bg-[#e7f7f5] text-teal-700 flex items-center justify-center text-xs font-bold">ME</div>
                                </div>

                                <div className="bg-[#1cac78] rounded-2xl p-0 overflow-hidden shadow-sm text-white">
                                    <div className="bg-[#158f63] px-5 py-3 flex items-center gap-2">
                                        <Volume2 size={16} className="text-white/80" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-white/90">Custom Broadcast</span>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end items-center gap-4 mt-2 pr-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600">
                                        <CheckCheck size={14} /> Sent
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* Footer Input */}
                <div className="p-6 bg-white border-t border-gray-100">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <Volume2 size={14} className="text-teal-600" />
                            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Broadcasting to {activeChannel === 'vendors' ? '15' : '45'} members</span>
                        </div>

                        <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all p-2 flex items-center gap-2">
                            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                <Plus size={20} />
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Send a broadcast to all vendors..."
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-800 placeholder-gray-400 h-full py-2"
                            />
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                    <Paperclip size={18} />
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="px-6 py-2.5 bg-[#1cac78] hover:bg-[#158f63] text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1cac78]/20"
                                >
                                    SEND BROADCAST <Send size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-3 opacity-60">
                            <ShieldCheck size={12} className="text-gray-500" />
                            <p className="text-[10px] text-gray-500">Encrypted broadcast message. Recipients see this as a direct message from you.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChatTab;
