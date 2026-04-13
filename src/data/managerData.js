import {
  MdDashboard,
  MdCalendarMonth,
  MdGroup,
  MdBarChart,
  MdChat,
  MdDescription,
  MdPercent,
  MdPerson,
  MdLogout,
  MdNotifications,
} from "react-icons/md";

export const managerNavItems = [
  { key: "dashboard", label: "Dashboard", icon: MdDashboard },
  { key: "events", label: "Events", icon: MdCalendarMonth },
  { key: "refund-requests", label: "Refund Requests", icon: MdDescription },
  { key: "refund-policies", label: "Refund Policies", icon: MdPercent },
  { key: "vendors", label: "Manage Vendors", icon: MdGroup },
  { key: "analytics", label: "View Analytics", icon: MdBarChart },
  { key: "chat", label: "Chat", icon: MdChat },
  { key: "reports", label: "Reports", icon: MdDescription },
];

export const managerFooterItems = [
  { key: "notifications", label: "Notifications", icon: MdNotifications, action: "toggleNotifications" },
  { key: "profile", label: "Profile", icon: MdPerson },
  { key: "logout", label: "Logout", icon: MdLogout },
];
