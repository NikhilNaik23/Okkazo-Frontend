import React, { useState } from "react";
import { useParams, useNavigate, Outlet, useLocation, NavLink } from "react-router-dom";
import {
    BsArrowLeft,
    BsWallet2,
    BsChatDots,
    BsListCheck,
    BsReceipt,
    BsShieldCheck,
    BsInfoCircle
} from "react-icons/bs";
import {
    Volume2, Users, Briefcase
} from 'lucide-react';
import { toast } from "react-hot-toast";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab based on current path
    // path format: /vendor/event/:id/:tab
    const currentPath = location.pathname.split('/').pop();
    const activeSubTab = ['details', 'budget', 'chat', 'todo', 'bill'].includes(currentPath) ? currentPath : 'details';

    const [activeChannel, setActiveChannel] = useState("vendors"); // Default to vendors to show broadcast
    const [chatInput, setChatInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleShareInvoice = () => {
        setActiveChannel("internal");
        navigate(`../chat`);
        toast.success("Redirecting to Internal Team chat...");
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAccept = () => {
        setEvent(prev => ({ ...prev, status: "CONFIRMED" }));
        toast.success("Event request accepted!");
        navigate("details");
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

    /* --- NEW CHAT DATA & LOGIC --- */

    // Group Chats for Sidebar
    const groupChats = [
        { id: 'general', name: 'All Stakeholders', count: 45, icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'vendors', name: 'All Vendors', count: 15, icon: Volume2, color: 'text-teal-600', bg: 'bg-teal-50' }
    ];

    // Mock Participants Data (Extended for the new design)
    const chatParticipants = [
        { name: 'David H. (System Admin)', type: 'admin', online: false },
        { name: 'Elena Wells (Host)', type: 'client', online: true },
        { name: 'Marcus', role: 'Setup is starting...', type: 'team', online: true },
        { name: 'Sarah Jenkins', role: 'Lead Planner', type: 'team', online: true },
        { name: 'Mike Ross', role: 'Logistics', type: 'team', online: true },
        { name: 'Gourmet Bites', role: 'Catering', type: 'vendor', online: false },
        { name: 'Crystal Clear AV', role: 'Audio/Visual', type: 'vendor', online: true },
        { name: 'Luxe Decor', role: 'Decor', type: 'vendor', online: true },
    ];

    const admins = chatParticipants.filter(p => p.type === 'admin');
    const clients = chatParticipants.filter(p => p.type === 'client');
    const team = chatParticipants.filter(p => p.type === 'team');
    const vendors = chatParticipants.filter(p => p.type === 'vendor');

    // Initial Messages
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "Priya Sharma",
            role: "Team",
            time: "10:30 AM",
            text: "Hey everyone, catering menu is confirmed with Gourmet Bites! 🍔",
            channel: 'internal',
            isBroadcast: false,
            badge: 'bg-teal-100 text-teal-700',
            status: 'read'
        },
        {
            id: 2,
            sender: "Manager",
            role: "You",
            time: "10:30 AM",
            text: "Attention all vendors: The loading dock schedule for tomorrow has been updated. Please check the Logistics tab for your new 30-minute time slot. All deliveries must be completed by 10 AM.",
            channel: 'vendors',
            isBroadcast: true,
            badge: 'bg-teal-100 text-teal-700',
            status: 'read'
        },
        {
            id: 3,
            sender: "Elena Wells",
            role: "Client",
            time: "11:00 AM",
            text: "Hi! Can we confirm the timeline for the speeches?",
            channel: 'client',
            isBroadcast: false,
            badge: '',
            status: 'read'
        },
        {
            id: 4,
            sender: "You",
            role: "Vendor",
            time: "11:05 AM",
            text: "Absolutely. I'll send over the updated run of show in a moment.",
            channel: 'client',
            isBroadcast: false,
            badge: 'bg-teal-100 text-teal-700',
            status: 'read'
        },
        {
            id: 5,
            sender: "You",
            role: "Vendor",
            time: "11:06 AM",
            text: "Just let me know if you need any other changes.",
            channel: 'client',
            isBroadcast: false,
            badge: 'bg-teal-100 text-teal-700',
            status: 'delivered'
        }
    ]);

    const handleSend = () => {
        if (!chatInput.trim()) return;

        const isBroadcast = activeChannel === 'vendors';
        const tempId = Date.now();

        const newMessage = {
            id: tempId,
            sender: "You",
            role: "Vendor",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: chatInput,
            channel: activeChannel,
            badge: 'bg-teal-100 text-teal-700',
            isBroadcast: isBroadcast,
            status: 'sending'
        };

        setMessages(prev => [...prev, newMessage]);
        setChatInput('');

        // Simulate status updates
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m));
        }, 1000);
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'delivered' } : m));
        }, 2500);
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'read' } : m));
        }, 4000);


    };

    // Shared Context to pass to lower components
    const contextValue = {
        event,
        services,
        tempServices,
        subtotal,
        tax,
        total,
        handleAccept,
        handleReject,
        handleUpdateQuotes,
        handleTempServiceChange,
        handlePrint,
        handleShareInvoice,
        // Chat
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
        handleSend,
        // Todo
        todoTasks,
        toggleTask,
        newTaskTitle,
        setNewTaskTitle,
        handleAddTask
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Navigation */}
            <div className="fixed top-0 right-0 left-72 z-30 bg-[#e9eff1]/90 backdrop-blur-md px-10 pt-6 pb-0 flex items-center justify-between gap-6 transition-all border-b border-white/20">
                <div className="flex-1 flex items-center bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-[#708aa0]/10 shadow-sm overflow-x-auto min-w-0">
                    <button
                        onClick={() => navigate("/vendor/booked-events")}
                        className="flex items-center gap-3 px-4 py-3 text-[#708aa0] hover:text-[#0b2d49] font-black uppercase text-[10px] tracking-widest transition-all group border-r border-[#708aa0]/10 mr-1 shrink-0"
                    >
                        <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-[#0b2d49] group-hover:text-white transition-all">
                            <BsArrowLeft size={16} />
                        </div>
                    </button>

                    {event.status === "CONFIRMED" && (
                        <>
                            <div className="flex flex-1 items-center justify-start gap-1 px-1">
                                {[
                                    { id: "details", label: "Details", icon: <BsInfoCircle /> },
                                    { id: "budget", label: "Budget", icon: <BsWallet2 /> },
                                    { id: "todo", label: "To-do", icon: <BsListCheck /> },
                                    { id: "bill", label: "Bill Generator", icon: <BsReceipt /> },
                                ].map((tab) => (
                                    <NavLink
                                        key={tab.id}
                                        to={tab.id}
                                        className={({ isActive }) => `flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 relative whitespace-nowrap ${isActive
                                            ? "bg-[#0b2d49] text-white shadow-xl shadow-[#0b2d49]/20"
                                            : "text-[#708aa0] hover:text-[#0b2d49] hover:bg-white"
                                            }`}
                                    >
                                        <span className={activeSubTab === tab.id ? "text-[#d7a444]" : ""}>{tab.icon}</span>
                                        {tab.label}
                                    </NavLink>
                                ))}
                            </div>

                            <NavLink
                                to="chat"
                                className={({ isActive }) => `flex items-center justify-center p-3 rounded-xl transition-all relative shrink-0 ml-4 mr-2 ${isActive
                                    ? "bg-[#0b2d49] text-white shadow-xl shadow-[#0b2d49]/20"
                                    : "text-[#708aa0] hover:text-[#0b2d49] hover:bg-white"
                                    }`}
                            >
                                <BsChatDots size={20} />
                                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full text-[8px] font-black shadow-lg bg-red-500 text-white">
                                    3
                                </span>
                            </NavLink>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${event.status === 'PENDING' ? 'bg-[#f3ddb1] text-[#d7a444]' : 'bg-green-50 text-green-600'}`}>
                        {event.status}
                    </span>
                    <div className="p-2 bg-white rounded-xl shadow-sm text-[#708aa0]">
                        <BsShieldCheck size={20} />
                    </div>
                </div>
            </div>

            <div className="px-10 pt-28">
                <Outlet context={contextValue} />
            </div>
        </div>
    );
};

export default EventDetails;
