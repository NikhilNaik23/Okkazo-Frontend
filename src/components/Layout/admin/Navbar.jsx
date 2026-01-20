import React from "react";
import { Link, useLocation } from "react-router";
import { MdDashboard, MdEvent, MdStorefront, MdBarChart, MdAccountBalanceWallet, MdSecurity, MdSettings, MdPerson, MdLogout } from "react-icons/md";

const Navbar = () => {
  const location = useLocation();

  const menuSections = [
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

  const bottomItems = [
    { path: "/admin/profile", label: "Profile", icon: MdPerson }
  ];

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="py-4 flex justify-center mt-2">
        <img 
          src="../public/internal_logo.png" 
          alt="Logo" 
          className="w-32 h-auto"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-3 space-y-6 overflow-y-auto">
        {menuSections.map((section, index) => (
          <div key={index}>
            <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`flex items-center justify-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="text-[22px]" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="pt-0.5 pb-3 border-t border-gray-200 space-y-1">
        <div className="space-y-3">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center justify-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="text-[22px]" />
                {item.label}
              </Link>
            );
          })}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdLogout className="text-[22px]" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Navbar;