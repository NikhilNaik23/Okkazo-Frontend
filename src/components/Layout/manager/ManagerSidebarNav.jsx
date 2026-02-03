import React from "react";
import { NavLink } from "react-router-dom";
import { managerNavItems, managerFooterItems } from "../../../data/managerData";

const NAV_ITEMS = managerNavItems;
const FOOTER_ITEMS = managerFooterItems;

const ManagerSidebarNav = () => {

  const Item = ({ item }) => {
    const Icon = item.icon;
    const path = item.key === 'dashboard' ? 'dashboard' : item.key;

    return (
      <NavLink
        to={`/manager/${path}`}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors w-full text-left ${isActive
            ? "bg-teal-50 text-teal-700"
            : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <Icon className="text-[22px]" />
        {item.label}
      </NavLink>
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
