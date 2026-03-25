import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { managerNavItems, managerFooterItems } from "../../../data/managerData";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";
import { chatMessages } from "../../../data/chatData";
import { notificationsData } from "../../../data/notificationsData";

const MotionDiv = motion.div;

const NAV_ITEMS = managerNavItems;
const FOOTER_ITEMS = managerFooterItems;

const SidebarItem = ({ item, location, onLogout }) => {
  const Icon = item.icon;
  const path = item.key === 'dashboard' ? 'dashboard' : item.key;
  const fullPath = `/manager/${path}`;
  const isActive = location.pathname.includes(fullPath);

  if (item.action === 'toggleNotifications') {
    return (
      <button
        type="button"
        onClick={item.onAction}
        className="relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all w-full text-left group text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      >
        <div className="relative">
          <Icon className="text-[20px] transition-colors text-gray-400 group-hover:text-gray-600" />
          {item.hasUnread && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
          )}
        </div>
        <span className="transition-colors font-medium">{item.label}</span>
      </button>
    );
  }

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
      state={item.key === 'chat' ? { resetChatSelection: true } : undefined}
      className={() =>
        `relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all w-full text-left group
                ${isActive ? "bg-teal-50/50 text-teal-800" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
      }
    >
      {/* Active Indicator Strip */}
      {isActive && (
        <MotionDiv
          layoutId="active-nav-strip"
          className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r-md"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}

      <div className="relative">
        <Icon className={`text-[20px] transition-colors ${isActive ? "text-teal-600" : "text-gray-400 group-hover:text-gray-600"}`} />
        {item.hasUnread && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
        )}
      </div>
      <span className={`transition-colors flex-1 ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
      {item.unreadCount > 0 && (
        <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.unreadCount}</span>
      )}
    </NavLink>
  );
};

const ManagerSidebarNav = ({ onToggleNotifications }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const unreadChatCount = chatMessages.filter(
    (m) => m.receiverId === 'manager' && m.status !== 'read'
  ).length;
  const hasUnreadNotifications = notificationsData.new.some((n) => n.unread);

  const enrichItems = (items) =>
    items.map((item) => ({
      ...item,
      unreadCount: item.key === 'chat' ? unreadChatCount : 0,
      hasUnread: item.key === 'notifications' ? hasUnreadNotifications : false,
      onAction: item.action === 'toggleNotifications' ? onToggleNotifications : undefined,
    }));

  const NAV_ITEMS_ENRICHED = enrichItems(NAV_ITEMS);
  const FOOTER_ITEMS_ENRICHED = enrichItems(FOOTER_ITEMS);

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
          {NAV_ITEMS_ENRICHED.map((item) => (
            <SidebarItem key={item.key} item={item} location={location} onLogout={handleLogout} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 pb-6 pt-4 border-t border-gray-50 space-y-1">
        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Settings</p>
        {FOOTER_ITEMS_ENRICHED.map((item) => (
          <SidebarItem key={item.key} item={item} location={location} onLogout={handleLogout} />
        ))}
      </div>
    </aside>
  );
};

export default ManagerSidebarNav;
