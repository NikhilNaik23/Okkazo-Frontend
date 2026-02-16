import React, { useState } from 'react';
import { Hash, ShieldCheck, Star, Briefcase, Users, Send, Paperclip, Smile } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { chatChannels, chatParticipants, initialChatMessages } from '../../../../data/managerEventDetailsData';

const ChatTab = () => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState(initialChatMessages);

    const iconMap = {
        Hash: Hash,
        ShieldCheck: ShieldCheck,
        Star: Star,
        Briefcase: Briefcase,
    };

    const typeColors = { team: 'bg-green-500', client: 'bg-amber-500', vendor: 'bg-blue-500', admin: 'bg-rose-500' };

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, {
            id: messages.length + 1, sender: "You", role: "Manager",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: input, channel: activeChannel, badge: 'bg-teal-100 text-teal-700'
        }]);
        setInput('');
        toast.success("Message sent to #" + chatChannels.find(c => c.id === activeChannel).name);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[640px]">
            {/* Channel Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-sm">Channels</h3>
                </div>
                <div className="p-2 space-y-1 flex-1">
                    {chatChannels.map(channel => {
                        const Icon = iconMap[channel.icon] || Hash;
                        return (
                            <button key={channel.id} onClick={() => setActiveChannel(channel.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeChannel === channel.id ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <span className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 opacity-60" />
                                    <div className="text-left">
                                        <p className="text-sm font-bold">{channel.name}</p>
                                        <p className="text-[10px] font-medium opacity-60">{channel.desc}</p>
                                    </div>
                                </span>
                                {channel.unread > 0 && <span className="bg-teal-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{channel.unread}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-teal-600" />
                            {chatChannels.find(c => c.id === activeChannel).name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">{chatChannels.find(c => c.id === activeChannel).desc}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Users className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                    {messages.filter(m => m.channel === activeChannel).map((msg) => {
                        const isMe = msg.sender === 'You';
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {isMe ? 'ME' : msg.sender.substring(0, 2).toUpperCase()}
                                </div>
                                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-900">{msg.sender}</span>
                                        {!isMe && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${msg.badge}`}>{msg.role}</span>}
                                        <span className="text-[10px] text-gray-400">{msg.time}</span>
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${isMe ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                        <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><Paperclip className="w-5 h-5" /></button>
                        <div className="flex-1 relative">
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={`Message #${chatChannels.find(c => c.id === activeChannel).name}...`}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"><Smile className="w-4 h-4" /></button>
                        </div>
                        <button onClick={handleSend} disabled={!input.trim()} className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-teal-900/20"><Send className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            {/* Participants */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-sm">Participants</h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">{chatParticipants.length} members</p>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-1">
                    {chatParticipants.map((p, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="relative">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-600">{p.name.substring(0, 2).toUpperCase()}</div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${p.online ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                                <div className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${typeColors[p.type]}`}></span>
                                    <p className="text-[10px] text-gray-500 font-medium truncate">{p.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatTab;
