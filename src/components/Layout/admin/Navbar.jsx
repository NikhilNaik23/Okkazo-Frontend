import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdEvent, MdStorefront, MdBarChart, MdAccountBalanceWallet, MdSecurity, MdSettings, MdPerson, MdLogout, MdClose } from "react-icons/md";

const Navbar = ({ isOpen, onClose }) => {
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

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e9eff1] flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-xl md:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo Section */}
        <div className="py-6 flex justify-between items-center px-6 mt-2 relative">
          <div className="flex justify-center w-full md:w-auto">
             <img 
               src="/internal_logo.png" 
               alt="Logo" 
               className="w-32 h-auto"
             />
          </div>
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={onClose}
            className="md:hidden text-[#0b2d49] hover:text-[#d7a444] transition-colors absolute right-4 top-6"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-3 space-y-6 overflow-y-auto custom-scrollbar">
          {menuSections.map((section, index) => (
            <div key={index}>
              <h3 className="px-3 mb-3 text-xs font-bold text-[#708aa0] uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link 
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && window.innerWidth < 768 && onClose()}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                        active
                          ? "bg-[#0b2d49] text-[#d7a444] shadow-md shadow-[#0b2d49]/10"
                          : "text-[#5a5b44] hover:bg-[#e9eff1] hover:text-[#0b2d49]"
                      }`}
                    >
                      <Icon className={`text-[22px] ${active ? "text-[#d7a444]" : "text-[#708aa0] group-hover:text-[#0b2d49]"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#e9eff1] space-y-1 bg-[#f8fafc]">
          <div className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link 
                  key={item.path}
                  to={item.path} 
                  onClick={() => onClose && window.innerWidth < 768 && onClose()}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    active
                      ? "bg-[#0b2d49] text-[#d7a444]"
                      : "text-[#5a5b44] hover:bg-[#e9eff1] hover:text-[#0b2d49]"
                  }`}
                >
                  <Icon className={`text-[22px] ${active ? "text-[#d7a444]" : "text-[#708aa0]"}`} />
                  {item.label}
                </Link>
              );
            })}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#5a5b44] rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <MdLogout className="text-[22px]" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;