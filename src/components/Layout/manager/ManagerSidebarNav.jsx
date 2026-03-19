import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { managerNavItems, managerFooterItems } from "../../../data/managerData";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";

const NAV_ITEMS = managerNavItems;
const FOOTER_ITEMS = managerFooterItems;

const SidebarItem = ({ item, location, onLogout }) => {
  const Icon = item.icon;
  const path = item.key === 'dashboard' ? 'dashboard' : item.key;
  const fullPath = `/manager/${path}`;
  const isActive = location.pathname.includes(fullPath);

  if (item.key === "logout") {
    return (
      <button
        type="button"
        onClick={onLogout}
        className="relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all w-full text-left group text-gray-600 hover:bg-red-50 hover:text-red-600"
      >
        <Icon className="text-[20px] transition-colors text-gray-400 group-hover:text-red-600" />
        <span className="transition-colors font-medium">{item.label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={fullPath}
      className={({ isActive: navActive }) =>
        `relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all w-full text-left group
                ${isActive ? "bg-teal-50/50 text-teal-800" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
      }
    >
      {/* Active Indicator Strip */}
      {isActive && (
        <motion.div
          layoutId="active-nav-strip"
          className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r-md"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}

      <Icon className={`text-[20px] transition-colors ${isActive ? "text-teal-600" : "text-gray-400 group-hover:text-gray-600"}`} />
      <span className={`transition-colors ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
    </NavLink>
  );
};

const ManagerSidebarNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
      {/* Logo */}
      <div className="pt-8 pb-6 px-6">
        <img
          src="/internal_logo.png"
          alt="Logo"
          className="w-40 h-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-2 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.key} item={item} location={location} onLogout={handleLogout} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 pb-6 pt-4 border-t border-gray-50 space-y-1">
        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Settings</p>
        {FOOTER_ITEMS.map((item) => (
          <SidebarItem key={item.key} item={item} location={location} onLogout={handleLogout} />
        ))}
      </div>
    </aside>
  );
};

export default ManagerSidebarNav;
