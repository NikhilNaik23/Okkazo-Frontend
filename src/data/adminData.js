import { MdDashboard, MdEvent, MdStorefront, MdBarChart, MdAccountBalanceWallet, MdSecurity, MdSettings, MdPerson } from "react-icons/md";

export const adminMenuSections = [
  {
    title: "General",
    items: [
      { path: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
      { path: "/admin/events", label: "Events", icon: MdEvent },
      { path: "/admin/vendors", label: "Vendors", icon: MdStorefront }
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
  { path: "/admin/profile", label: "Profile", icon: MdPerson }
];

export const mockVendors = [
  {
    id: "V-92842",
    name: "EcoMart Solutions",
    legalName: "EcoMart Solutions LLC",
    status: "PENDING",
    submittedDate: "Oct 24, 2023",
    riskLevel: "Low Risk",
    description: "Sustainability & Eco-friendly consumer goods",
    location: "Seattle, WA",
    taxId: "88-2394851",
    registryNumber: "REG-2023-WA-0922",
    yearFounded: "2018",
    address: "1200 Innovation Way, Suite 400, Seattle, WA 98101, USA",
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
    status: "REVIEWING",
    submittedDate: "Oct 23, 2023",
    riskLevel: "Medium Risk",
    description: "Contemporary fashion and apparel",
    location: "Austin, TX",
    taxId: "74-1029384",
    registryNumber: "REG-2015-TX-1102",
    yearFounded: "2015",
    address: "450 Congress Ave, Austin, TX 78701, USA",
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
    checks: {
      businessLicense: { status: "invalid", match: false, message: "License expired" },
      ownerIdentity: { status: "invalid", verified: false, message: "Identity flag detected" },
      bankAccount: { status: "invalid", linked: false, message: "Account frozen" },
    },
    logoColor: "bg-red-100 text-red-600"
  }
];

export const mockAdminEvents = [
  {
    id: 1,
    title: "Summer Soundwaves 2024",
    organizer: "Vibe Entertainment Co.",
    date: "Aug 12, 2024",
    submitted: "Oct 24, 09:45 AM",
    category: "MUSIC FESTIVAL",
    status: "URGENT",
    image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Future Tech Expo 2024",
    organizer: "Silicon Valley Events",
    date: "Nov 05, 2024",
    submitted: "Oct 25, 02:20 PM",
    category: "CONFERENCE",
    status: "REVIEWING",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Ethereal Art Nights",
    organizer: "Canvas & Clay Hub",
    date: "Dec 01, 2024",
    submitted: "Oct 26, 11:15 AM",
    category: "EXHIBITION",
    status: "PENDING",
    image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Gourmet Garden Series",
    organizer: "Culinary Masters",
    date: "Sept 18, 2024",
    submitted: "Oct 26, 04:40 PM",
    category: "WORKSHOP",
    status: "PENDING",
    image: "https://images.unsplash.com/photo-1628194380993-97ae0c868427?q=80&w=1000&auto=format&fit=crop"
  }
];
