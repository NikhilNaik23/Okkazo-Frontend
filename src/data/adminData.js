import { MdDashboard, MdEvent, MdStorefront, MdBarChart, MdAccountBalanceWallet, MdSecurity, MdSettings, MdPerson, MdNotifications, MdChat } from "react-icons/md";

export const adminMenuSections = [
  {
    title: "General",
    items: [
      { path: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
      { path: "/admin/events", label: "Events", icon: MdEvent },
      { path: "/admin/vendors", label: "Vendors", icon: MdStorefront },
      { path: "/admin/chat", label: "Chat", icon: MdChat }
    ]
  },
  {
    title: "Financial",
    items: [
      { path: "/admin/reports", label: "Reports", icon: MdBarChart },
      { path: "/admin/ledger", label: "Ledger", icon: MdAccountBalanceWallet }
    ]
  },
  {
    title: "System",
    items: [
      { path: "/admin/team-access", label: "Team Access", icon: MdSecurity },
      { path: "/admin/settings", label: "Settings", icon: MdSettings }
    ]
  }
];

export const adminBottomItems = [
  { action: "toggleNotifications", label: "Notifications", icon: MdNotifications },
  { path: "/admin/profile", label: "Profile", icon: MdPerson }
];

export const mockVendors = [
  {
    id: "V-92842",
    name: "EcoMart Solutions",
    legalName: "EcoMart Solutions LLC",
    status: "APPROVED",
    submittedDate: "Oct 24, 2023",
    riskLevel: "Low Risk",
    description: "Sustainability & Eco-friendly consumer goods",
    location: "Seattle, WA",
    taxId: "88-2394851",
    registryNumber: "REG-2023-WA-0922",
    yearFounded: "2018",
    address: "1200 Innovation Way, Suite 400, Seattle, WA 98101, USA",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?q=80&w=1000&auto=format&fit=crop",
    checks: {
      businessLicense: { status: "valid", match: true, message: "Match found in WA State Registry" },
      ownerIdentity: { status: "valid", verified: true, message: "Verified via Persona API" },
      bankAccount: { status: "pending", linked: false, message: "Plaid connection pending auth" },
    },
    logoColor: "bg-[#0b2d49]/10 text-[#0b2d49]"
  },
  {
    id: "V-92101",
    name: "Urban Threads",
    legalName: "Urban Threads Inc.",
    status: "APPROVED",
    submittedDate: "Oct 23, 2023",
    riskLevel: "Medium Risk",
    description: "Contemporary fashion and apparel",
    location: "Austin, TX",
    taxId: "74-1029384",
    registryNumber: "REG-2015-TX-1102",
    yearFounded: "2015",
    address: "450 Congress Ave, Austin, TX 78701, USA",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
    checks: {
      businessLicense: { status: "valid", match: true, message: "Match found in TX State Registry" },
      ownerIdentity: { status: "warning", verified: false, message: "Manual review required" },
      bankAccount: { status: "valid", linked: true, message: "Verified via Plaid" },
    },
    logoColor: "bg-[#d7a444]/10 text-[#d7a444]"
  },
  {
    id: "V-91992",
    name: "Apex Electronics",
    legalName: "Apex Global Electronics Ltd",
    status: "PENDING",
    submittedDate: "Oct 22, 2023",
    riskLevel: "High Risk",
    description: "Consumer electronics wholesaler",
    location: "San Francisco, CA",
    taxId: "94-5551234",
    registryNumber: "REG-2020-CA-8833",
    yearFounded: "2020",
    address: "200 Market St, San Francisco, CA 94111, USA",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1000&auto=format&fit=crop",
    checks: {
      businessLicense: { status: "warning", match: false, message: "Registry mismatch detected" },
      ownerIdentity: { status: "valid", verified: true, message: "Verified via Persona API" },
      bankAccount: { status: "valid", linked: true, message: "Verified via Plaid" },
    },
    logoColor: "bg-[#708aa0]/10 text-[#708aa0]"
  },
  {
    id: "V-90877",
    name: "GreenLeaf Wholesale",
    legalName: "GreenLeaf Organics Co.",
    status: "REJECTED",
    submittedDate: "Oct 21, 2023",
    riskLevel: "Sanction Flag",
    description: "Organic produce distributor",
    location: "Portland, OR",
    taxId: "93-2223344",
    registryNumber: "REG-2019-OR-4421",
    yearFounded: "2019",
    address: "1500 SW 1st Ave, Portland, OR 97201, USA",
    image: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1000&auto=format&fit=crop",
    checks: {
      businessLicense: { status: "invalid", match: false, message: "License expired" },
      ownerIdentity: { status: "invalid", verified: false, message: "Identity flag detected" },
      bankAccount: { status: "invalid", linked: false, message: "Account frozen" },
    },
    logoColor: "bg-red-100 text-red-600"
  },
  {
    id: "V-89212",
    name: "Nebula Catering",
    legalName: "Nebula Hospitality Services LLC",
    status: "APPROVED",
    submittedDate: "Oct 25, 2023",
    riskLevel: "Low Risk",
    description: "Premium corporate catering and events",
    location: "Chicago, IL",
    taxId: "36-1294857",
    registryNumber: "REG-2022-IL-4421",
    yearFounded: "2020",
    address: "500 N Michigan Ave, Suite 1200, Chicago, IL 60611, USA",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000&auto=format&fit=crop",
    checks: {
      businessLicense: { status: "valid", match: true, message: "Match found in IL State Registry" },
      ownerIdentity: { status: "valid", verified: true, message: "Verified via Persona API" },
      bankAccount: { status: "valid", linked: true, message: "Verified via Plaid" },
    },
    logoColor: "bg-[#0b2d49]/10 text-[#0b2d49]"
  },
  {
    id: "V-88102",
    name: "Titan Security Group",
    legalName: "Titan Guard Services Inc.",
    status: "REVIEWING",
    submittedDate: "Oct 26, 2023",
    riskLevel: "Medium Risk",
    description: "Event security and crowd management",
    location: "Miami, FL",
    taxId: "59-1029348",
    registryNumber: "REG-2018-FL-0021",
    yearFounded: "2018",
    address: "100 Biscayne Blvd, Suite 2500, Miami, FL 33132, USA",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop",
    checks: {
      businessLicense: { status: "valid", match: true, message: "Match found in FL State Registry" },
      ownerIdentity: { status: "warning", verified: false, message: "Background check in progress" },
      bankAccount: { status: "valid", linked: true, message: "Verified via Plaid" },
    },
    logoColor: "bg-[#d7a444]/10 text-[#d7a444]"
  },
  {
    id: "V-87991",
    name: "Velvet Venues",
    legalName: "Velvet Event Spaces LLC",
    status: "PENDING",
    submittedDate: "Oct 27, 2023",
    riskLevel: "Low Risk",
    description: "Luxury venue management and booking",
    location: "New York, NY",
    taxId: "13-5556677",
    registryNumber: "REG-2021-NY-9911",
    yearFounded: "2021",
    address: "75 Rockefeller Plaza, Floor 14, New York, NY 10019, USA",
    image: "https://images.unsplash.com/photo-1519167758481-83fb55ef23d3?q=80&w=1000&auto=format&fit=crop",
    checks: {
      businessLicense: { status: "valid", match: true, message: "Match found in NY State Registry" },
      ownerIdentity: { status: "valid", verified: true, message: "Verified via Persona API" },
      bankAccount: { status: "pending", linked: false, message: "Awaiting bank verification" },
    },
    logoColor: "bg-[#708aa0]/10 text-[#708aa0]"
  }
];

export const mockAdminEvents = [
  {
    id: 1,
    title: "Summer Soundwaves 2026",
    organizer: "Vibe Entertainment Co.",
    date: "Aug 12, 2026",
    submitted: "Feb 10, 09:45 AM",
    category: "MUSIC FESTIVAL",
    status: "URGENT",
    image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Future Tech Expo 2026",
    organizer: "Silicon Valley Events",
    date: "Nov 05, 2026",
    submitted: "Feb 10, 02:20 PM",
    category: "CONFERENCE",
    status: "REVIEWING",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Ethereal Art Nights",
    organizer: "Canvas & Clay Hub",
    date: "Dec 01, 2026",
    submitted: "Feb 11, 11:15 AM",
    category: "EXHIBITION",
    status: "PENDING",
    image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Gourmet Garden Series",
    organizer: "Culinary Masters",
    date: "Sept 18, 2026",
    submitted: "Feb 11, 04:40 PM",
    category: "WORKSHOP",
    status: "PENDING",
    image: "https://images.unsplash.com/photo-1628194380993-97ae0c868427?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Midnight Jazz Session",
    organizer: "Blue Note Collective",
    date: "Aug 20, 2026",
    submitted: "Feb 09, 11:30 PM",
    category: "MUSIC CONCERT",
    status: "VERIFIED",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Startup Founders Gala",
    organizer: "Elevate Network",
    date: "Oct 12, 2026",
    submitted: "Feb 08, 09:00 AM",
    category: "NETWORKING",
    status: "VERIFIED",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 7,
    title: "Underground Racing League",
    organizer: "Speed Demons",
    date: "July 04, 2026",
    submitted: "Feb 07, 02:15 PM",
    category: "SPORTS",
    status: "REJECTED",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 8,
    title: "Secret Rooftop Party",
    organizer: "Hidden Gems",
    date: "July 12, 2026",
    submitted: "Feb 06, 06:45 PM",
    category: "PARTY",
    status: "REJECTED",
    image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 9,
    title: "Neon Night Run 2026",
    organizer: "Velocity Sports",
    date: "Mar 15, 2026",
    submitted: "Feb 05, 10:00 AM",
    category: "SPORTS",
    status: "VERIFIED",
    image: "https://images.unsplash.com/photo-1530143311094-34d807799e8f?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 10,
    title: "Coastal Culinary Festival",
    organizer: "Pacific Eats",
    date: "Jun 22, 2026",
    submitted: "Feb 04, 02:30 PM",
    category: "FOOD & DRINK",
    status: "VERIFIED",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 11,
    title: "Eco-Tech Summit",
    organizer: "Green Future Org",
    date: "Oct 10, 2026",
    submitted: "Feb 03, 09:15 AM",
    category: "TECHNOLOGY",
    status: "VERIFIED",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 12,
    title: "Winter Wonderland Ball",
    organizer: "Everest Events",
    date: "Dec 20, 2026",
    submitted: "Feb 02, 11:45 AM",
    category: "GALA",
    status: "VERIFIED",
    image: "https://images.unsplash.com/photo-1519671482749-309e525f333c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 13,
    title: "Indie Film Showcase",
    organizer: "Cinema Collective",
    date: "May 05, 2026",
    submitted: "Feb 01, 04:20 PM",
    category: "CINEMA",
    status: "VERIFIED",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 14,
    title: "Yoga in the Park",
    organizer: "Zen Life",
    date: "Apr 12, 2026",
    submitted: "Jan 31, 08:30 AM",
    category: "WELLNESS",
    status: "VERIFIED",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop"
  }
];
