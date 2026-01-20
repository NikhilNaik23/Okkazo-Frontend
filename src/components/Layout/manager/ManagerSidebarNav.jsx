import React, { useState } from "react";
import {
  MdDashboard,
  MdCalendarMonth,
  MdGroup,
  MdBarChart,
  MdChat,
  MdDescription,
  MdPerson,
  MdSettings,
  MdLogout,
} from "react-icons/md";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: MdDashboard },
  { key: "events", label: "Events", icon: MdCalendarMonth },
  { key: "vendors", label: "Manage Vendors", icon: MdGroup },
  { key: "analytics", label: "View Analytics", icon: MdBarChart },
  { key: "chat", label: "Chat", icon: MdChat },
  { key: "reports", label: "Reports", icon: MdDescription },
];

const FOOTER_ITEMS = [
  { key: "profile", label: "Profile", icon: MdPerson },
  { key: "logout", label: "Logout", icon: MdLogout },
];

const ManagerSidebarNav = ({ activeKey = "dashboard", onNavigate }) => {
  const [active, setActive] = useState(activeKey);

  const handleClick = (key) => {
    setActive(key);
    onNavigate?.(key);
  };

  const Item = ({ item }) => {
    const Icon = item.icon;

    return (
      <button
        onClick={() => handleClick(item.key)}
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
      >
        <Icon className="text-[22px]" />
        {item.label}
      </button>
    );
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-400 flex flex-col">
      {/* Logo */}
      <div className="pt-4">
        <img
          src="/internal_logo.png"
          alt="Logo"
          className="w-80 h-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-2 px-4 pt-0.5 pb-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <Item key={item.key} item={item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="pt-0.5 pb-3 px-2 border-t border-gray-400 space-y-1">
        {FOOTER_ITEMS.map((item) => (
          <Item key={item.key} item={item} />
        ))}
      </div>
    </aside>
  );
};

export default ManagerSidebarNav;
