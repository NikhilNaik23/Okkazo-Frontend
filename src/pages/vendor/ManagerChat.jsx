import React, { useState, useRef, useEffect } from "react";
import { 
  BsTelephone, 
  BsCameraVideo, 
  BsThreeDotsVertical, 
  BsShieldLock, 
  BsPlusLg, 
  BsFileEarmarkText, 
  BsEmojiSmile, 
  BsSendFill, 
  BsEye,
  BsCheckCircleFill
} from "react-icons/bs";
import { toast } from "react-hot-toast";

const ManagerChat = () => {
  const [message, setMessage] = useState("");
  const scrollRef = useRef(null);
  
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Sarah Johnson",
      role: "Event Manager",
      text: "Hi! Regarding the Grand Wedding Gala (#EVT-2024-089), we are finalizing the vendor list. Could you please provide the updated quote for the Veg Menu including the dessert station we discussed?",
      time: "10:24 AM",
      type: "received",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
      id: 2,
      sender: "You",
      text: "Hello Sarah! Absolutely. I've just adjusted the quote to include the artisan dessert station and the additional staff members for the 200 pax count.",
      time: "10:28 AM",
      type: "sent"
    },
    {
      id: 3,
      type: "quote",
      title: "Updated Event Quote",
      project: "The Grand Wedding Gala",
      amount: "4,850.00",
      status: "Finalized Pricing",
      time: "10:30 AM"
    },
    {
      id: 4,
      sender: "Sarah Johnson",
      text: "This looks perfect. I'll pass this along to the finance team for immediate approval. Does the package also include the linens?",
      time: "11:05 AM",
      type: "received",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
        id: Date.now(),
        sender: "You",
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "sent"
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage("");
    
    // Simulate auto-reply
    setTimeout(() => {
        setChatMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: "Sarah Johnson",
            text: "Got it, checking with the team!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "received",
            avatar: "https://i.pravatar.cc/150?u=sarah"
        }]);
    }, 2000);
  };

  const handleSendQuote = () => {
    const newQuote = {
        id: Date.now(),
        type: "quote",
        title: "Revised Multi-Day Quote",
        project: "Corporate Tech Expo",
        amount: "12,400.00",
        status: "Draft Shared",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, newQuote]);
    toast.success("Quote sent successfully!", {
        style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' }
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in zoom-in duration-500">
      {/* Chat Header */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#708aa0]/5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="relative">
                <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="w-12 h-12 rounded-full border-2 border-[#d7a444]/20" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
                <div className="flex items-center gap-3">
                    <h3 className="font-black text-[#0b2d49]">Sarah Johnson</h3>
                    <span className="text-[10px] font-bold bg-[#d7a444]/10 text-[#d7a444] px-2 py-0.5 rounded-lg uppercase flex items-center gap-1">
                        <BsCheckCircleFill size={8} /> Accepted
                    </span>
                </div>
                <p className="text-[10px] font-bold text-[#708aa0] uppercase tracking-widest mt-0.5">
                    Event ID: <span className="text-[#0b2d49]">#EVT-2024-089</span> • Event Manager
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#d7a444]/5 text-[#d7a444] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#d7a444]/10 mr-2">
                <BsShieldLock /> Manager Chat Secured
            </div>
            <button className="p-3 bg-gray-50 text-[#0b2d49] rounded-xl hover:bg-[#e9eff1] transition-all border border-[#708aa0]/5">
                <BsTelephone size={18} />
            </button>
            <button className="p-3 bg-gray-50 text-[#0b2d49] rounded-xl hover:bg-[#e9eff1] transition-all border border-[#708aa0]/5">
                <BsCameraVideo size={18} />
            </button>
            <button className="p-3 bg-gray-50 text-[#708aa0] rounded-xl hover:text-[#0b2d49] transition-all">
                <BsThreeDotsVertical size={18} />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar mb-6 scroll-smooth"
      >
        <div className="flex justify-center">
            <span className="text-[10px] font-black text-[#708aa0] uppercase tracking-[0.3em] bg-[#e9eff1] px-4 py-1.5 rounded-full">October 24, 2024</span>
        </div>

        {chatMessages.map((msg) => {
          if (msg.type === 'quote') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-xl shadow-[#0b2d49]/5 border-2 border-[#d7a444]/10 animate-in slide-in-from-right-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#d7a444]/10 text-[#d7a444] rounded-2xl flex items-center justify-center">
                                <BsFileEarmarkText size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-[#0b2d49] leading-tight">{msg.title}</h4>
                                <p className="text-[10px] text-[#708aa0] font-bold uppercase tracking-wider">Project: {msg.project}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#e9eff1]/50 p-4 rounded-xl mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-[#708aa0] font-black uppercase tracking-widest leading-none mb-2">Finalized Amount</p>
                                <p className="text-2xl font-black text-[#0b2d49] tracking-tight">${msg.amount}</p>
                            </div>
                            <button className="px-4 py-2 bg-[#d7a444] text-white rounded-xl text-xs font-black shadow-lg shadow-[#d7a444]/20 hover:scale-105 transition-all flex items-center gap-2">
                                <BsEye /> Review Quote
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-[10px] text-[#708aa0] font-bold uppercase tracking-widest">
                        <span>{msg.time} • {msg.status}</span>
                    </div>
                </div>
              </div>
            );
          }

          const isSent = msg.type === 'sent';
          return (
            <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'} gap-4`}>
              {!isSent && <img src={msg.avatar} alt={msg.sender} className="w-10 h-10 rounded-full shrink-0 border-2 border-white shadow-sm" />}
              <div className={`max-w-[70%] group ${isSent ? 'text-right' : 'text-left'}`}>
                <div className={`p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm transition-all duration-300 ${isSent ? 'bg-[#d7a444] text-white rounded-tr-none' : 'bg-white text-[#5a5b44] rounded-tl-none border border-gray-50'}`}>
                    {msg.text}
                </div>
                <div className={`mt-2 text-[10px] font-black text-[#708aa0] uppercase tracking-widest ${isSent ? 'pr-2' : 'pl-2'}`}>
                    {msg.time}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="flex items-center gap-3 justify-end text-[10px] font-bold text-[#708aa0] uppercase tracking-widest animate-pulse">
            <div className="flex gap-0.5">
                <span className="w-1 h-1 bg-[#d7a444] rounded-full"></span>
                <span className="w-1 h-1 bg-[#d7a444] rounded-full"></span>
                <span className="w-1 h-1 bg-[#d7a444] rounded-full"></span>
            </div>
            Sarah is typing...
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-[#0b2d49]/5 border border-[#708aa0]/5">
        <div className="flex items-center gap-3">
            <button type="button" className="p-4 bg-[#e9eff1]/50 text-[#708aa0] rounded-[1.5rem] hover:text-[#0b2d49] hover:bg-[#e9eff1] transition-all">
                <BsPlusLg strokeWidth={1} />
            </button>
            <button 
                type="button" 
                onClick={handleSendQuote}
                className="p-4 bg-[#e9eff1]/50 text-[#708aa0] rounded-[1.5rem] hover:text-[#0b2d49] hover:bg-[#e9eff1] transition-all"
            >
                <BsFileEarmarkText />
            </button>
            <div className="flex-1 relative flex items-center">
                <input 
                    type="text" 
                    placeholder="Message event manager..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#e9eff1]/50 rounded-[1.5rem] py-4 px-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium text-[#0b2d49] placeholder:text-[#708aa0]"
                />
                <button type="button" className="absolute right-4 text-[#708aa0] hover:text-[#d7a444] transition-all p-1">
                    <BsEmojiSmile size={20} />
                </button>
            </div>
            <button 
                type="submit"
                disabled={!message.trim()}
                className={`p-4 rounded-[1.5rem] transition-all active:scale-90 shadow-lg ${message.trim() ? 'bg-[#d7a444] text-white shadow-[#d7a444]/20' : 'bg-gray-100 text-gray-300'}`}
            >
                <BsSendFill size={20} />
            </button>
        </div>
        <div className="flex items-center gap-2 px-6 mt-3">
            <BsShieldLock size={12} className="text-[#10b981]" />
            <span className="text-[10px] font-bold text-[#708aa0] uppercase tracking-widest leading-none">Communicating with verified manager for #EVT-2024-089</span>
        </div>
      </form>
    </div>
  );
};

export default ManagerChat;
