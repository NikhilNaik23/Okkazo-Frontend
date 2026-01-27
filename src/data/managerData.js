import {
  MdDashboard,
  MdCalendarMonth,
  MdGroup,
  MdBarChart,
  MdChat,
  MdDescription,
  MdPerson,
  MdLogout,
} from "react-icons/md";

export const managerNavItems = [
  { key: "dashboard", label: "Dashboard", icon: MdDashboard },
  { key: "events", label: "Events", icon: MdCalendarMonth },
  { key: "vendors", label: "Manage Vendors", icon: MdGroup },
  { key: "analytics", label: "View Analytics", icon: MdBarChart },
  { key: "chat", label: "Chat", icon: MdChat },
  { key: "reports", label: "Reports", icon: MdDescription },
];

export const managerFooterItems = [
  { key: "profile", label: "Profile", icon: MdPerson },
  { key: "logout", label: "Logout", icon: MdLogout },
];
