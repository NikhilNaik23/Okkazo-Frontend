import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BsArrowLeft, 
  BsCalendarEvent, 
  BsGeoAlt, 
  BsPeople, 
  BsClock, 
  BsPerson, 
  BsShieldCheck, 
  BsChatDots, 
  BsCheckCircle, 
  BsXCircle, 
  BsInfoCircle, 
  BsFileEarmarkText, 
  BsBagCheck,
  BsWallet2,
  BsListCheck,
  BsReceipt,
  BsHash,
  BsStar,
  BsBriefcase,
  BsFillCircleFill,
  BsPlus,
  BsCircle,
  BsCheckCircleFill,
  BsCalendar4Event,
  BsShare
} from "react-icons/bs";
import { toast } from "react-hot-toast";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState("details");
  const [activeChannel, setActiveChannel] = useState("general");

  const handleShareInvoice = () => {
    setActiveChannel("internal");
    setActiveSubTab("chat");
    toast.success("Redirecting to Internal Team chat...");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAccept = () => {
    setEvent(prev => ({ ...prev, status: "CONFIRMED" }));
    toast.success("Event request accepted!");
  };

  const handleReject = () => {
    toast.error("Event request rejected.");
  };
  
  // Mock data for a specific event
  const [event, setEvent] = useState({
    id: id || 1,
    title: id === "2" ? "Bangalore Tech Summit 2026" : "The Royal Udaipur Wedding",
    status: id === "2" ? "CONFIRMED" : "PENDING", 
    date: "28 Oct, 2024",
    time: "06:00 PM - 11:30 PM",
    pax: 200,
    category: "Wedding",
    location: "Central Park Plaza, Manhattan, NY",
    client: {
      name: "Sarah Jenkins",
      org: "Individual Booking",
      email: "sarah.j@example.com",
      phone: "+1 234-567-8901",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    requestedServices: [
      { id: 1, name: "Catering - Veg Menu", details: "Premium Indian buffet with 4 starters, 6 main courses, and 3 desserts.", price: 1500, qty: 200 },
      { id: 2, name: "Live Counter", details: "Artisan Tandoor & Pasta station for the first 2 hours.", price: 45000, qty: 1 },
      { id: 3, name: "Beverage Service", details: "Mocktail bar with 5 signature drinks.", price: 350, qty: 200 }
    ],
    description: "A high-profile wedding event requiring top-tier catering service. The client has specifically requested a focus on authentic flavors and elegant presentation. The venue has a service elevator and a dedicated kitchen area for vendors.",
    timeline: [
        { time: "09:00 AM", task: "Inventory Loading", status: "completed" },
        { time: "11:30 AM", task: "Staff Briefing", status: "completed" },
        { time: "02:00 PM", task: "Vendor Arrival & Setup", status: "in-progress" },
        { time: "05:00 PM", task: "Kitchen Preparation Complete", status: "pending" },
        { time: "06:00 PM", task: "Welcome Drinks Served", status: "pending" },
        { time: "08:30 PM", task: "Main Course Buffet Opening", status: "pending" }
    ],
    chat: {
        manager: [
            { sender: "manager", text: "Hey! Any updates on the inventory for Bangalore?", time: "10:30 AM" },
            { sender: "you", text: "Yes, loading is 80% complete. Should be there by noon.", time: "10:45 AM" },
            { sender: "manager", text: "Perfect. Reminder: Client asked for extra Jain options.", time: "11:00 AM" }
        ],
        client: [
            { sender: "client", text: "Hello! Can we increase the pax to 220?", time: "Yesterday" },
            { sender: "you", text: "Sure, I will update the budget and send it for approval.", time: "Yesterday" }
        ]
    }
  });

  const [todoTasks, setTodoTasks] = useState([
    { id: 1, title: "Send vendor alternatives to client", priority: "HIGH", owner: "You", date: "Mar 17", completed: false },
    { id: 2, title: "Finalize catering menu", priority: "MEDIUM", owner: "Priya Sharma", date: "Mar 18", completed: false },
    { id: 3, title: "Confirm AV setup requirements", priority: "MEDIUM", owner: "Rahul Nair", date: "Mar 19", completed: false },
    { id: 4, title: "Send final schedule to client", priority: "MEDIUM", owner: "You", date: "Mar 20", completed: false },
    { id: 5, title: "Collect pending vendor payments", priority: "LOW", owner: "Jessica T.", date: "Mar 21", completed: false },
    { id: 6, title: "Final walkthrough with venue", priority: "HIGH", owner: "Priya Sharma", date: "Mar 23", completed: false },
    { id: 7, title: "Confirm venue booking", owner: "Priya Sharma", completed: true },
    { id: 8, title: "Verify all vendor availability", owner: "You", completed: true },
    { id: 9, title: "Check event permits with BMC", owner: "Rahul Nair", completed: true },
  ]);

  const toggleTask = (taskId) => {
    setTodoTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    toast.success("Task status updated!");
  };

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
        id: Date.now(),
        title: newTaskTitle,
        priority: "MEDIUM",
        owner: "You",
        date: "Today",
        completed: false
    };
    setTodoTasks(prev => [newTask, ...prev]);
    setNewTaskTitle("");
    toast.success("New task added!");
  };

  const [services, setServices] = useState(event.requestedServices);
  const [tempServices, setTempServices] = useState(event.requestedServices);

  const handleUpdateQuotes = () => {
    setServices([...tempServices]);
    toast.success("Quotes updated and applied to invoice!");
  };

  const handleTempServiceChange = (id, field, value) => {
    setTempServices(prev => prev.map(s => 
        s.id === id ? { ...s, [field]: parseFloat(value) || 0 } : s
    ));
  };

  const calculateSubtotal = () => services.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.18;
  const total = subtotal + tax;



  const renderDetails = () => (
    <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Main Info */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <div className="mb-10">
                    <p className="text-xs font-black text-[#d7a444] uppercase tracking-[0.3em] mb-4">Event Details #E89{event.id}</p>
                    <h1 className="text-4xl font-black text-[#0b2d49] tracking-tight mb-6">{event.title}</h1>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Date</p>
                            <div className="flex items-center gap-2 font-bold text-[#0b2d49]">
                                <BsCalendarEvent className="text-[#d7a444]" />
                                {event.date}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Time Slot</p>
                            <div className="flex items-center gap-2 font-bold text-[#0b2d49]">
                                <BsClock className="text-[#d7a444]" />
                                {event.time}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Expected Pax</p>
                            <div className="flex items-center gap-2 font-bold text-[#0b2d49]">
                                <BsPeople className="text-[#d7a444]" />
                                {event.pax} Guests
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Category</p>
                            <div className="flex items-center gap-2 font-bold text-[#0b2d49]">
                                <BsBagCheck className="text-[#d7a444]" />
                                {event.category}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-10 border-t border-gray-50">
                    <h3 className="text-sm font-black text-[#0b2d49] uppercase tracking-widest flex items-center gap-3">
                        <BsInfoCircle className="text-[#d7a444]" /> Description
                    </h3>
                    <p className="text-[#5a5b44] font-medium leading-relaxed text-lg italic">
                        "{event.description}"
                    </p>
                </div>
            </div>

            {/* Requested Services */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <h3 className="text-xl font-black text-[#0b2d49] mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e9eff1] rounded-xl flex items-center justify-center text-[#d7a444]">
                        <BsFileEarmarkText />
                    </div>
                    Requested Services
                </h3>
                
                <div className="space-y-4">
                    {services.map((service, idx) => (
                        <div key={idx} className="p-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-[#708aa0]/10 transition-all">
                            <h4 className="font-black text-[#0b2d49] mb-2">{service.name}</h4>
                            <p className="text-sm text-[#5a5b44] font-medium">{service.details}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Client & Location */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Client Card */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-8">Primary Contact</h3>
                <div className="flex items-center gap-4 mb-8">
                    <img src={event.client.avatar} alt={event.client.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d7a444]/20 shadow-sm" />
                    <div>
                        <h4 className="font-black text-[#0b2d49] text-xl">{event.client.name}</h4>
                        <p className="text-[10px] font-bold text-[#708aa0] uppercase tracking-widest">{event.client.org}</p>
                    </div>
                </div>
                
                <div className="space-y-4 pb-8 border-b border-gray-50">
                    <div className="flex items-center gap-4 text-sm font-bold text-[#5a5b44]">
                        <div className="w-8 h-8 rounded-lg bg-[#e9eff1] flex items-center justify-center text-[#708aa0]">
                            <BsPerson />
                        </div>
                        {event.client.email}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-[#5a5b44]">
                        <div className="w-8 h-8 rounded-lg bg-[#e9eff1] flex items-center justify-center text-[#708aa0]">
                            <BsClock />
                        </div>
                        {event.client.phone}
                    </div>
                </div>

                <div className="mt-8">
                    {event.status === 'PENDING' ? (
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleAccept}
                                className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-xl shadow-[#0b2d49]/20 flex items-center justify-center gap-3 active:scale-95"
                            >
                                <BsCheckCircle size={18} /> Accept Request
                            </button>
                            <button 
                                onClick={handleReject}
                                className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <BsXCircle size={18} /> Reject
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate("/vendor/messages")}
                            className="w-full py-5 bg-[#0b2d49] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-xl shadow-[#0b2d49]/20 flex items-center justify-center gap-3 active:scale-95"
                        >
                            <BsChatDots size={18} /> Chat with Client
                        </button>
                    )}
                </div>
            </div>

            {/* Location Card */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#708aa0]/5">
                <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-6">Venue Location</h3>
                <div className="flex gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#d7a444]/10 text-[#d7a444] flex items-center justify-center shrink-0">
                        <BsGeoAlt size={20} />
                    </div>
                    <p className="text-sm font-bold text-[#0b2d49] leading-relaxed">
                        {event.location}
                    </p>
                </div>
                <div className="h-48 w-full bg-[#e9eff1] rounded-2xl border-2 border-dashed border-[#708aa0]/10 flex flex-col items-center justify-center text-center p-6 grayscale opacity-60">
                    <p className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Map Preview Coming Soon</p>
                </div>
            </div>
        </div>
    </div>
  );

  const renderBudget = () => (
    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#708aa0]/5 animate-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black text-[#0b2d49] tracking-tight">Service-wise Budget</h2>
            <button 
                onClick={handleUpdateQuotes}
                className="flex items-center gap-3 px-8 py-4 bg-[#0b2d49] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] transition-all shadow-lg active:scale-95"
            >
                Update Quotes
            </button>
        </div>

        <div className="overflow-hidden border border-[#708aa0]/10 rounded-[2rem]">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 border-b border-[#708aa0]/10">
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0]">Service Item</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0]">Service Type</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0]">Unit Price</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0]">Quantity</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-[#708aa0] text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#708aa0]/5">
                    {tempServices.map((service) => (
                        <tr key={service.id} className="group hover:bg-[#e9eff1]/20 transition-all">
                            <td className="px-8 py-6">
                                <p className="font-black text-[#0b2d49]">{service.name}</p>
                                <p className="text-xs font-medium text-[#708aa0] mt-1 line-clamp-1">{service.details}</p>
                            </td>
                            <td className="px-8 py-6">
                                <span className="px-3 py-1 bg-gray-100 text-[#0b2d49] text-[10px] font-black rounded-lg uppercase">FIXED</span>
                            </td>
                            <td className="px-8 py-6">
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#0b2d49]">₹</span>
                                    <input 
                                        type="number"
                                        value={service.price}
                                        onChange={(e) => handleTempServiceChange(service.id, 'price', e.target.value)}
                                        className="w-full pl-7 pr-3 py-2 bg-white border border-[#708aa0]/10 rounded-lg font-bold text-[#0b2d49] focus:border-[#d7a444] outline-none transition-all"
                                    />
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <input 
                                    type="number"
                                    value={service.qty}
                                    onChange={(e) => handleTempServiceChange(service.id, 'qty', e.target.value)}
                                    className="w-20 px-3 py-2 bg-white border border-[#708aa0]/10 rounded-lg font-bold text-[#0b2d49] focus:border-[#d7a444] outline-none transition-all"
                                />
                            </td>
                            <td className="px-8 py-6 font-black text-[#0b2d49] text-right">₹{(service.price * service.qty).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mt-10 flex flex-col items-end gap-3 px-8">
            <div className="flex justify-between w-64 text-sm font-bold text-[#708aa0]">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-64 text-sm font-bold text-[#10b981]">
                <span>Applicable Tax (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-64 pt-4 border-t border-gray-100 text-2xl font-black text-[#0b2d49]">
                <span>Total</span>
                <span className="text-[#d7a444]">₹{total.toLocaleString()}</span>
            </div>
        </div>
    </div>
  );



  const chatChannels = [
    { id: "general", name: "General", type: "Everyone", icon: <BsHash size={20} />, count: 0 },
    { id: "internal", name: "Internal Team", type: "Private", icon: <BsShieldCheck size={18} />, count: 2 },
    { id: "client", name: "Client", type: "Direct", icon: <BsStar size={18} />, count: 1 },
    { id: "vendors", name: "Vendors", type: "All vendors", icon: <BsBriefcase size={18} />, count: 2 },
  ];

  const participants = [
    { id: 1, name: "You", role: "Manager", avatar: "YO", status: "online", isYou: true },
    { id: 2, name: "Sarah Jenkins", role: "Lead Planner", avatar: "SA", status: "online" },
    { id: 3, name: "Mike Ross", role: "Logistics", avatar: "MI", status: "online" },
    { id: 4, name: "Jessica T.", role: "Marketing", avatar: "JE", status: "online" },
    { id: 5, name: "Rajesh C.", role: "Client • CEO", avatar: "RA", status: "away" },
    { id: 6, name: "Gourmet Bites", role: "Catering", avatar: "GO", status: "busy" },
    { id: 7, name: "Crystal Clear AV", role: "Audio/Visual", avatar: "CR", status: "online" },
    { id: 8, name: "Admin", role: "Okkazo Admin", avatar: "AD", status: "online" },
  ];

  const chatMessages = [
    { 
        id: 1, 
        sender: "Priya Sharma", 
        tag: "Team", 
        tagColor: "bg-[#e2f5ee] text-[#2ba979]", 
        avatar: "PR", 
        text: "Hey everyone, catering menu is confirmed with Gourmet Bites! 🍔", 
        time: "10:30 AM",
        type: "received"
    },
    { 
        id: 2, 
        sender: "Rajesh C.", 
        tag: "Client", 
        tagColor: "bg-[#fff1d6] text-[#b47d1a]", 
        avatar: "RA", 
        text: "Great to hear! Can we also add a dessert counter?", 
        time: "10:45 AM",
        type: "received"
    },
    { 
        id: 3, 
        sender: "You", 
        avatar: "ME", 
        text: "Absolutely, I'll get a quote from the caterer.", 
        time: "10:48 AM",
        type: "sent"
    }
  ];

  const renderChat = () => (
    <div className="bg-[#f8fafb] rounded-[2.5rem] shadow-sm border border-[#708aa0]/5 overflow-hidden flex h-[750px] animate-in zoom-in-95 duration-500">
        {/* Left Sidebar: Channels */}
        <div className="w-72 bg-white border-r border-[#708aa0]/5 p-6 flex flex-col gap-6">
            <h3 className="text-lg font-black text-[#0b2d49] px-2">Channels</h3>
            <div className="flex flex-col gap-2">
                {chatChannels.map((channel) => (
                    <button
                        key={channel.id}
                        onClick={() => setActiveChannel(channel.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                            activeChannel === channel.id 
                                ? "bg-[#eefcf7]" 
                                : "hover:bg-gray-50 text-[#708aa0]"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`${activeChannel === channel.id ? "text-[#14b67b]" : "text-[#708aa0]"}`}>
                                {channel.icon}
                            </div>
                            <div className="text-left">
                                <p className={`text-sm font-black ${activeChannel === channel.id ? "text-[#14b67b]" : "text-[#0b2d49]"}`}>
                                    {channel.name}
                                </p>
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeChannel === channel.id ? "text-[#14b67b]/70" : "text-[#708aa0] opacity-60"}`}>
                                    {channel.type}
                                </p>
                            </div>
                        </div>
                        {channel.count > 0 && (
                            <div className="w-6 h-6 rounded-full bg-[#14b67b] text-white text-[10px] font-black flex items-center justify-center">
                                {channel.count}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Center: Message Area */}
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-[#708aa0]/5 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-[#0b2d49] flex items-center gap-2">
                        <span className="text-[#14b67b]"><BsHash size={24} /></span>
                        {chatChannels.find(c => c.id === activeChannel)?.name || "General"}
                    </h3>
                    <p className="text-xs font-bold text-[#708aa0]">Everyone</p>
                </div>
                <button className="p-3 rounded-xl bg-gray-50 text-[#708aa0] hover:bg-[#0b2d49] hover:text-white transition-all shadow-sm">
                    <BsPeople size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white/50 backdrop-blur-sm">
                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.type === 'sent' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${
                            msg.type === 'sent' ? 'bg-[#c7f4ed] text-[#0ea18d]' : 'bg-[#e9eff1] text-[#708aa0]'
                        }`}>
                            {msg.avatar}
                        </div>

                        {/* Message Content */}
                        <div className={`flex flex-col max-w-[70%] ${msg.type === 'sent' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {msg.type !== 'sent' && (
                                    <>
                                        <span className="text-sm font-black text-[#0b2d49]">{msg.sender}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${msg.tagColor}`}>
                                            {msg.tag}
                                        </span>
                                    </>
                                )}
                                <span className="text-[10px] font-bold text-[#708aa0]">{msg.time}</span>
                                {msg.type === 'sent' && (
                                    <span className="text-sm font-black text-[#0b2d49]">You</span>
                                )}
                            </div>
                            <div className={`p-5 rounded-[1.5rem] shadow-sm text-sm font-medium leading-relaxed ${
                                msg.type === 'sent' 
                                    ? "bg-[#0ea18d] text-white rounded-tr-none" 
                                    : "bg-white border border-[#708aa0]/10 text-[#0b2d49] rounded-tl-none"
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-[#708aa0]/5 bg-white">
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder={`Message #${activeChannel}...`}
                        className="w-full pl-6 pr-20 py-5 rounded-[1.5rem] bg-[#f8fafb] border-2 border-transparent focus:border-[#14b67b] transition-all outline-none font-bold text-[#0b2d49] text-sm"
                    />
                    <button className="absolute right-2 top-2 bottom-2 px-8 bg-[#0ea18d] text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest hover:bg-[#14b67b] transition-all shadow-lg active:scale-95">
                        Send
                    </button>
                </div>
            </div>
        </div>

        {/* Right Sidebar: Participants */}
        <div className="w-72 bg-white border-l border-[#708aa0]/5 flex flex-col p-6 overflow-y-auto">
            <div className="mb-8">
                <h3 className="text-lg font-black text-[#0b2d49] px-2 mb-1">Participants</h3>
                <p className="text-xs font-bold text-[#708aa0] px-2">8 members</p>
            </div>
            
            <div className="flex flex-col gap-4">
                {participants.map((person) => (
                    <div key={person.id} className="flex gap-4 p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                        <div className="relative">
                            <div className="w-12 h-12 bg-[#e9eff1] rounded-xl flex items-center justify-center font-black text-xs text-[#708aa0] shadow-sm">
                                {person.avatar}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${
                                person.status === 'online' ? 'bg-[#14b67b]' : 
                                person.status === 'away' ? 'bg-[#ffc107]' : 'bg-[#f44336]'
                            }`}></div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <h4 className="text-sm font-black text-[#0b2d49] leading-tight">{person.name}</h4>
                            <p className="text-[10px] font-bold text-[#708aa0] uppercase tracking-wider mt-0.5 underline decoration-[#14b67b]/20 underline-offset-2">
                                {person.role}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );



  const renderTodo = () => {
    const completedCount = todoTasks.filter(t => t.completed).length;
    const totalCount = todoTasks.length;
    const progress = Math.round((completedCount / totalCount) * 100);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Progress Header */}
            <div className="bg-white p-8 rounded-[2rem] border border-[#708aa0]/10 shadow-sm flex items-center justify-between">
                <div className="flex-1 mr-10">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h3 className="text-xl font-black text-[#0b2d49]">Event Tasks</h3>
                            <p className="text-xs font-bold text-[#708aa0] mt-1">{completedCount} of {totalCount} tasks completed</p>
                        </div>
                        <div className="text-3xl font-black text-[#14b67b]">{progress}%</div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#14b67b] transition-all duration-1000" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Add Task Input */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-[#708aa0]/10 shadow-sm flex gap-4">
                <input 
                    type="text" 
                    placeholder="Add a new task..." 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    className="flex-1 bg-white px-6 py-3 rounded-xl border border-transparent focus:border-[#14b67b]/20 outline-none font-medium text-[#0b2d49] text-sm"
                />
                <button 
                    onClick={handleAddTask}
                    className="bg-[#14b67b] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#0ea18d] transition-all shadow-md active:scale-95"
                >
                    <BsPlus size={20} /> Add
                </button>
            </div>

            {/* Active Tasks */}
            <div className="bg-white rounded-[2rem] border border-[#708aa0]/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-[#fbfcfd]">
                    <h3 className="text-sm font-black text-[#0b2d49] uppercase tracking-widest">Active Tasks ({totalCount - completedCount})</h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {todoTasks.filter(t => !t.completed).map((task) => (
                        <div key={task.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-all group">
                            <button 
                                onClick={() => toggleTask(task.id)}
                                className="mt-1 text-[#708aa0] hover:text-[#14b67b] transition-all"
                            >
                                <BsCircle size={20} />
                            </button>
                            <div className="flex-1">
                                <h4 className="font-black text-[#0b2d49] text-base group-hover:text-[#14b67b] transition-colors">{task.title}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                        task.priority === 'HIGH' ? "bg-red-50 text-red-500" :
                                        task.priority === 'MEDIUM' ? "bg-amber-50 text-amber-500" :
                                        "bg-blue-50 text-blue-500"
                                    }`}>
                                        {task.priority}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#708aa0]">
                                        <BsPerson size={12} className="opacity-60" />
                                        {task.owner}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#708aa0]">
                                        <BsCalendar4Event size={12} className="opacity-60" />
                                        {task.date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-[#f8fafb]/50 rounded-[2rem] border border-[#708aa0]/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#708aa0]/5 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#14b67b]/10 text-[#14b67b] flex items-center justify-center">
                        <BsCheckCircleFill size={14} />
                    </div>
                    <h3 className="text-sm font-black text-[#14b67b] uppercase tracking-widest">Completed ({completedCount})</h3>
                </div>
                <div className="divide-y divide-gray-50/50">
                    {todoTasks.filter(t => t.completed).map((task) => (
                        <div key={task.id} className="p-5 flex items-center justify-between gap-4 opacity-50 bg-white/30">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => toggleTask(task.id)}
                                    className="text-[#14b67b] hover:scale-110 transition-all"
                                >
                                    <BsCheckCircleFill size={18} />
                                </button>
                                <span className="text-sm font-bold text-[#0b2d49] line-through">{task.title}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#708aa0] uppercase tracking-wider">{task.owner}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  const renderBill = () => (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-in zoom-in-95 duration-700">
        {/* Main Invoice Card */}
        <div className="flex-1 bg-white p-12 lg:p-16 rounded-[4rem] shadow-2xl border border-[#708aa0]/10 relative overflow-hidden printable-content">
            {/* Invoice Top Watermark/Design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0b2d49]/5 rounded-bl-[10rem] -mr-20 -mt-20"></div>
            
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h1 className="text-4xl font-black text-[#0b2d49] tracking-tighter mb-4">PROFORMA INVOICE</h1>
                    <p className="text-sm font-black text-[#708aa0] uppercase tracking-[0.4em]">#{event.id}82941-2024</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-[#0b2d49]">Okkazo Events</p>
                    <p className="text-xs font-bold text-[#708aa0]">Vendor Partner Portal</p>
                    <p className="text-xs font-bold text-[#708aa0] mt-1">GSTIN: 08AAAAA0000A1Z5</p>
                    <p className="text-xs font-bold text-[#708aa0]">Udaipur, Rajasthan, India</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10 lg:gap-20 py-10 border-y border-gray-100 mt-12">
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-[#708aa0] tracking-widest">Client Bill To:</p>
                    <div>
                        <h3 className="text-2xl font-black text-[#0b2d49]">{event.client.name}</h3>
                        <p className="text-sm font-bold text-[#708aa0] mt-1">{event.client.org}</p>
                        <p className="text-sm font-bold text-[#708aa0]">{event.client.email}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-[#708aa0] tracking-widest">Event Summary:</p>
                    <div>
                        <h3 className="text-xl font-black text-[#0b2d49] mb-1">{event.title}</h3>
                        <p className="text-sm font-bold text-[#d7a444] uppercase">{event.date} • {event.category}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8 mt-10">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b-2 border-[#0b2d49]">
                                <th className="py-4 text-[10px] font-black uppercase text-[#708aa0]">Description</th>
                                <th className="py-4 text-center text-[10px] font-black uppercase text-[#708aa0]">Qty</th>
                                <th className="py-4 text-center text-[10px] font-black uppercase text-[#708aa0]">Rate</th>
                                <th className="py-4 text-right text-[10px] font-black uppercase text-[#708aa0]">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {services.map((s, i) => (
                                <tr key={i}>
                                    <td className="py-6 font-bold text-[#0b2d49]">{s.name}</td>
                                    <td className="py-6 text-center text-[#708aa0] font-bold">{s.qty}</td>
                                    <td className="py-6 text-center text-[#708aa0] font-bold">₹{s.price.toLocaleString()}</td>
                                    <td className="py-6 text-right font-black text-[#0b2d49]">₹{(s.price * s.qty).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-end pt-10 border-t border-gray-100">
                    <div className="max-w-md">
                        <p className="text-[10px] font-black uppercase text-[#708aa0] tracking-widest mb-3">Notes & Terms:</p>
                        <p className="text-xs font-medium text-[#708aa0] leading-relaxed italic">
                            1. This is a **Proforma Invoice** and not a formal Tax Invoice.<br/>
                            2. Prices are based on current requirements and may vary if scope changes.<br/>
                            3. Final Tax Invoice including applicable GST will be issued upon service completion.
                        </p>
                    </div>
                    <div className="w-80 space-y-4">
                        <div className="flex justify-between pt-6 border-t-2 border-[#0b2d49] text-3xl font-black text-[#0b2d49]">
                            <span>Estimated Total</span>
                            <span className="text-[#d7a444]">₹{subtotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Sidebar Actions */}
        <div className="w-full lg:w-72 flex flex-col gap-4 no-print">
            <div className="bg-white p-6 rounded-[2rem] border border-[#708aa0]/10 shadow-sm">
                <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-6 px-2">Invoice Actions</h3>
                <div className="flex flex-col gap-3">
                    <button className="w-full py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#d7a444] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">
                        <BsReceipt size={16} /> Download PDF
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="w-full py-4 bg-[#f8fafb] text-[#0b2d49] border border-[#708aa0]/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <BsReceipt size={16} /> Print Invoice
                    </button>
                    <button 
                        onClick={handleShareInvoice}
                        className="w-full py-4 bg-[#f8fafb] text-[#0b2d49] border border-[#708aa0]/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <BsShare size={16} /> Share Invoice
                    </button>
                </div>
            </div>

            <div className="bg-[#eefcf7] p-6 rounded-[2rem] border border-[#14b67b]/10 shadow-sm">
                <p className="text-[10px] font-black text-[#14b67b] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BsCheckCircle size={14} /> System Verified
                </p>
                <p className="text-xs font-bold text-[#0b2d49] leading-relaxed opacity-70">
                    This invoice is automatically generated and verified by Okkazo's finance module.
                </p>
            </div>
        </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-[#708aa0] hover:text-[#0b2d49] font-black uppercase text-xs tracking-widest transition-all group"
        >
            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-[#0b2d49] group-hover:text-white transition-all">
                <BsArrowLeft size={20} />
            </div>
            Back to Events
        </button>
        
        <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${event.status === 'PENDING' ? 'bg-[#f3ddb1] text-[#d7a444]' : 'bg-green-50 text-green-600'}`}>
                {event.status}
            </span>
            <div className="p-2 bg-white rounded-xl shadow-sm text-[#708aa0]">
                <BsShieldCheck size={20} />
            </div>
        </div>
      </div>

      {/* Confirmed Event Sub-Navigation */}
      {event.status === "CONFIRMED" && (
        <div className="flex flex-wrap bg-white/50 backdrop-blur-md p-1.5 rounded-2xl mb-10 border border-[#708aa0]/10 w-fit shadow-sm">
          {[
            { id: "details", label: "Details", icon: <BsInfoCircle /> },
            { id: "budget", label: "Budget", icon: <BsWallet2 /> },
            { id: "chat", label: "Chat", icon: <BsChatDots />, count: 3 },
            { id: "todo", label: "To-do", icon: <BsListCheck /> },
            { id: "bill", label: "Bill Generator", icon: <BsReceipt /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 relative ${
                activeSubTab === tab.id 
                  ? "bg-[#0b2d49] text-white shadow-xl shadow-[#0b2d49]/20" 
                  : "text-[#708aa0] hover:text-[#0b2d49] hover:bg-white"
              }`}
            >
              <span className={activeSubTab === tab.id ? "text-[#d7a444]" : ""}>{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && (
                <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[8px] font-black shadow-lg ml-1 ${
                  activeSubTab === tab.id ? "bg-white text-[#0b2d49]" : "bg-red-500 text-white"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {activeSubTab === "details" && renderDetails()}
      {activeSubTab === "budget" && renderBudget()}
      {activeSubTab === "chat" && renderChat()}
      {activeSubTab === "todo" && renderTodo()}
      {activeSubTab === "bill" && renderBill()}
    </div>
  );
};

export default EventDetails;
