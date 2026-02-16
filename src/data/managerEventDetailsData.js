// Mock data for Manager Event Details page

export const mockEvent = {
    title: "Global Tech Summit 2024",
    id: "EVT-24-8821",
    status: "Planning",
    date: "Oct 24, 2023",
    endDate: "Oct 26, 2023",
    time: "09:00 AM PST",
    location: "Moscone Center, San Francisco",
    description: "The premier technology conference bringing together startups, enterprise leaders, and investors. Featuring 50+ keynote speakers and 200+ exhibitors.",
    organizer: "TechEvents Inc.",
    attendees: { registered: 2450, capacity: 3000, checkedIn: 120 },
    budget: { total: 150000, spent: 89400, committed: 12000 },
    tasks: { total: 145, completed: 89, pending: 56 }
};

export const tabs = [
    { id: 'overview', label: 'Overview', icon: 'FileText' },
    { id: 'guests', label: 'Guest List', icon: 'Users', count: 2450 },
    { id: 'vendors', label: 'Vendors', icon: 'Briefcase', count: 4 },
    { id: 'chat', label: 'Event Chat', icon: 'MessageSquare', count: 5 },
    { id: 'todo', label: 'To-Do', icon: 'ListTodo', count: 8 },
    { id: 'schedule', label: 'Schedule', icon: 'CalendarDays' },
    { id: 'financials', label: 'Financials', icon: 'DollarSign' },
    { id: 'documents', label: 'Documents', icon: 'FolderOpen', count: 6 },
];

export const pipelineStages = [
    { id: 'draft', label: 'Draft', done: true },
    { id: 'planning', label: 'Planning', done: true },
    { id: 'vendor_confirm', label: 'Vendor Confirmation', done: false, active: true },
    { id: 'client_review', label: 'Client Review', done: false },
    { id: 'confirmed', label: 'Confirmed', done: false },
    { id: 'live', label: 'Live', done: false },
    { id: 'completed', label: 'Completed', done: false },
];

export const teamMembers = [
    { name: "Sarah Jenkins", role: "Lead Planner", online: true },
    { name: "Mike Ross", role: "Logistics", online: false },
    { name: "Jessica T.", role: "Marketing", online: true },
];

export const clientInfo = {
    name: "Rajesh Chandrasekhar",
    initials: "RC",
    company: "TechEvents Inc.",
    title: "CEO",
    email: "rajesh@techevents.com",
    phone: "+91 98765 43210"
};

export const generateGuests = () => Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: ["Alexander Mitchell", "Isabella Chen", "Marcus Johnson", "Sophia Williams", "Ethan Brown", "Olivia Davis", "Liam Wilson", "Emma Taylor"][i],
    email: `guest${i}@example.com`,
    ticket: ["VIP Pass", "General Admission", "Speaker", "Exhibitor"][i % 4],
    status: ["Confirmed", "Checked In", "Pending", "Cancelled"][i % 4],
    company: ["Google", "Stripe", "Amazon", "Meta", "Netflix"][i % 5],
    date: "Oct 12, 2023"
}));

export const initialVendors = [
    { id: 1, name: "Gourmet Bites", category: "CATERING", availability: "available", status: "Confirmed", contact: "Sarah Jenkins", email: "sarah@gourmetbites.com", icon: "GB", color: "blue", price: 250000, rating: 4.8 },
    { id: 2, name: "Crystal Clear AV", category: "AUDIO/VISUAL", availability: "pending", status: "Checking", contact: "Mike Ross", phone: "(555) 123-4567", icon: "CC", color: "orange", price: 180000, rating: 4.5 },
    { id: 3, name: "The Grand Hall", category: "VENUE", availability: "available", status: "Confirmed", contact: "Elena Gilbert", address: "San Francisco, CA", icon: "GH", color: "purple", price: 500000, rating: 4.9 },
    { id: 4, name: "Lens Focus", category: "PHOTOGRAPHY", availability: "unavailable", status: "Unavailable", contact: "Dave Chen", icon: "LF", color: "blue", price: 75000, rating: 4.2 },
];

export const vendorAlternatives = {
    PHOTOGRAPHY: [
        { id: 101, name: "SnapPro Studio", price: 85000, rating: 4.6, available: true },
        { id: 102, name: "Golden Hour Films", price: 95000, rating: 4.8, available: true },
        { id: 103, name: "PixelPerfect", price: 65000, rating: 4.3, available: true },
    ],
    "AUDIO/VISUAL": [
        { id: 201, name: "SoundWave Pro", price: 200000, rating: 4.7, available: true },
        { id: 202, name: "TechAV Solutions", price: 160000, rating: 4.4, available: true },
    ],
    CATERING: [
        { id: 301, name: "Feast & Co.", price: 280000, rating: 4.6, available: true },
        { id: 302, name: "Royal Kitchen", price: 220000, rating: 4.5, available: true },
    ],
};

export const scheduleItems = [
    { time: "08:00 AM", title: "Registration & Breakfast", loc: "Main Lobby", dur: "1h 30m" },
    { time: "09:30 AM", title: "Opening Keynote: Future of AI", loc: "Grand Ballroom", dur: "1h" },
    { time: "11:00 AM", title: "Breakout Sessions A/B/C", loc: "Conference Rooms 1-3", dur: "45m" },
    { time: "12:00 PM", title: "Networking Lunch", loc: "Garden Terrace", dur: "1h 30m" },
];

export const vendorCosts = [
    { vendor: "The Grand Hall", service: "Venue & Infrastructure", price: 500000, status: "Paid", icon: "GH", color: "bg-purple-500" },
    { vendor: "Gourmet Bites", service: "Catering & Buffet", price: 250000, status: "Paid", icon: "GB", color: "bg-blue-500" },
    { vendor: "Crystal Clear AV", service: "Audio/Visual Setup", price: 180000, status: "Pending", icon: "CC", color: "bg-orange-500" },
    { vendor: "Lens Focus", service: "Photography & Video", price: 75000, status: "Negotiating", icon: "LF", color: "bg-blue-500" },
    { vendor: "Staff & Logistics", service: "Event coordination team", price: 120000, status: "Paid", icon: "SL", color: "bg-teal-500" },
    { vendor: "Marketing & PR", service: "Promotions & design", price: 95000, status: "Pending", icon: "MP", color: "bg-pink-500" },
];

export const chatChannels = [
    { id: 'general', name: 'General', icon: 'Hash', desc: 'Everyone', unread: 0 },
    { id: 'internal', name: 'Internal Team', icon: 'ShieldCheck', desc: 'Private', unread: 2 },
    { id: 'client', name: 'Client', icon: 'Star', desc: 'Direct', unread: 1 },
    { id: 'vendors', name: 'Vendors', icon: 'Briefcase', desc: 'All vendors', unread: 2 },
];

export const chatParticipants = [
    { name: "You", role: "Manager", type: "team", online: true },
    { name: "Sarah Jenkins", role: "Lead Planner", type: "team", online: true },
    { name: "Mike Ross", role: "Logistics", type: "team", online: false },
    { name: "Jessica T.", role: "Marketing", type: "team", online: true },
    { name: "Rajesh C.", role: "Client • CEO", type: "client", online: true },
    { name: "Gourmet Bites", role: "Catering", type: "vendor", online: false },
    { name: "Crystal Clear AV", role: "Audio/Visual", type: "vendor", online: true },
    { name: "Admin", role: "Okkazo Admin", type: "admin", online: true },
];

export const initialChatMessages = [
    { id: 1, sender: "Sarah Jenkins", role: "Team", time: "10:30 AM", text: "Hey everyone, catering menu is confirmed with Gourmet Bites! 🍔", channel: 'general', badge: 'bg-green-100 text-green-700' },
    { id: 2, sender: "Rajesh C.", role: "Client", time: "10:45 AM", text: "Great to hear! Can we also add a dessert counter?", channel: 'general', badge: 'bg-amber-100 text-amber-700' },
    { id: 3, sender: "You", role: "Manager", time: "10:48 AM", text: "Absolutely, I'll get a quote from the caterer.", channel: 'general', badge: 'bg-teal-100 text-teal-700' },
    { id: 4, sender: "Sarah Jenkins", role: "Team", time: "11:00 AM", text: "Heads up — Lens Focus photography cancelled. Do we go with SnapPro Studio or Golden Hour Films?", channel: 'internal', badge: 'bg-green-100 text-green-700' },
    { id: 5, sender: "Mike Ross", role: "Team", time: "11:05 AM", text: "SnapPro has better availability. Let's go with them.", channel: 'internal', badge: 'bg-green-100 text-green-700' },
    { id: 6, sender: "You", role: "Manager", time: "11:10 AM", text: "Hi Rajesh, we have 2 photographer options for you. I'll send details shortly.", channel: 'client', badge: 'bg-teal-100 text-teal-700' },
    { id: 7, sender: "Rajesh C.", role: "Client", time: "11:20 AM", text: "Sounds good, please share pricing too.", channel: 'client', badge: 'bg-amber-100 text-amber-700' },
    { id: 8, sender: "Gourmet Bites", role: "Vendor", time: "09:00 AM", text: "Dessert counter quote: ₹35,000 for 200 portions. Menu attached.", channel: 'vendors', badge: 'bg-blue-100 text-blue-700' },
    { id: 9, sender: "Crystal Clear AV", role: "Vendor", time: "09:15 AM", text: "AV setup confirmed for Oct 24. Need access by 6 AM.", channel: 'vendors', badge: 'bg-blue-100 text-blue-700' },
];

export const initialTasks = [
    { id: 1, text: "Confirm venue booking", priority: "high", assignee: "Sarah Jenkins", due: "Oct 15", done: true },
    { id: 2, text: "Verify all vendor availability", priority: "high", assignee: "You", due: "Oct 16", done: true },
    { id: 3, text: "Send vendor alternatives to client", priority: "high", assignee: "You", due: "Oct 17", done: false },
    { id: 4, text: "Finalize catering menu", priority: "medium", assignee: "Sarah Jenkins", due: "Oct 18", done: false },
    { id: 5, text: "Confirm AV setup requirements", priority: "medium", assignee: "Mike Ross", due: "Oct 19", done: false },
    { id: 6, text: "Send final schedule to client", priority: "medium", assignee: "You", due: "Oct 20", done: false },
    { id: 7, text: "Collect pending vendor payments", priority: "low", assignee: "Jessica T.", due: "Oct 21", done: false },
    { id: 8, text: "Final walkthrough with venue", priority: "high", assignee: "Sarah Jenkins", due: "Oct 23", done: false },
];

export const documents = [
    { id: 1, name: "Vendor_Contract_GourmetBites.pdf", type: "Contract", size: "2.4 MB", uploadedBy: "Sarah Jenkins", date: "Oct 10", shared: true, iconType: "FileText" },
    { id: 2, name: "VenueFloorPlan_GrandHall.pdf", type: "Floor Plan", size: "5.1 MB", uploadedBy: "Elena Gilbert", date: "Oct 8", shared: true, iconType: "MapPin" },
    { id: 3, name: "Invoice_CrystalClearAV.pdf", type: "Invoice", size: "1.2 MB", uploadedBy: "Mike Ross", date: "Oct 12", shared: false, iconType: "DollarSign" },
    { id: 4, name: "EventSchedule_v3.xlsx", type: "Schedule", size: "890 KB", uploadedBy: "You", date: "Oct 14", shared: true, iconType: "Calendar" },
    { id: 5, name: "Photography_Contract_LensFocus.pdf", type: "Contract", size: "1.8 MB", uploadedBy: "Sarah Jenkins", date: "Oct 9", shared: false, iconType: "FileText" },
    { id: 6, name: "CityPermit_Oct24.pdf", type: "Permit", size: "420 KB", uploadedBy: "Mike Ross", date: "Oct 11", shared: false, iconType: "ShieldCheck" },
];

export const documentCategories = ['All', 'Contract', 'Invoice', 'Floor Plan', 'Schedule', 'Permit'];
