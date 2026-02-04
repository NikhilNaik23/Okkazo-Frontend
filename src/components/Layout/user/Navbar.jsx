import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BsBell, BsPersonCircle } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiCloseLargeFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Dashboard", path: "/user/dashboard" },
    { name: "Planning Wizard", path: "/user/planning-wizard" },
    { name: "Promote", path: "/user/promote" },
    { name: "My Events", path: "/user/my-events" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b2d49] shadow-md border-b border-[#071d30]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/user/dashboard" className="flex items-center gap-2 bg-white rounded-md px-3 py-1 shadow-sm">
          <img src="/public_logo.png" alt="Okkazo" className="hidden md:block h-8 w-auto object-contain" />
          <img src="/mobile_logo.png" alt="Okkazo" className="block md:hidden h-8 w-auto object-contain" />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-sm font-bold px-4 py-2 rounded-lg transition-colors duration-300 ${
                isActive(link.path) ? "text-[#0b2d49]" : "text-gray-300 hover:text-[#d7a444]"
              }`}
            >
              <span className="relative z-10">{link.name}</span>
              {isActive(link.path) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#d7a444] rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/user/notifications" className="relative text-gray-300 hover:text-[#d7a444] transition-colors cursor-pointer">
            <BsBell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0b2d49] translate-x-1/3 -translate-y-1/3"></span>
          </Link>

          <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-[#1c3f5e]">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">Alex Morgan</p>
              <p className="text-xs text-gray-400">Attendee</p>
            </div>
            <Link to="/user/profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1c3f5e] flex items-center justify-center text-gray-400 overflow-hidden border-2 border-[#d7a444] shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                <img src="https://ui-avatars.com/api/?name=Alex+Morgan&background=d7a444&color=0b2d49" alt="User" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden text-gray-300 text-2xl transition-transform duration-300 ease-in-out cursor-pointer ${isMobileOpen ? 'rotate-90' : 'rotate-0'}`} 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <RiCloseLargeFill /> : <GiHamburgerMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileOpen && (
        <div className="md:hidden bg-[#0b2d49] border-t border-[#1c3f5e] shadow-lg animate-slide-down">
          <div className="px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[#1c3f5e] sm:hidden">
               <div className="w-10 h-10 rounded-full bg-[#1c3f5e] flex items-center justify-center text-gray-400 overflow-hidden border-2 border-[#d7a444]">
                   <img src="https://ui-avatars.com/api/?name=Alex+Morgan&background=d7a444&color=0b2d49" alt="User" />
               </div>
               <div>
                  <p className="text-sm font-bold text-white">Alex Morgan</p>
                  <p className="text-xs text-gray-400">Attendee</p>
               </div>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={`relative text-sm font-bold px-4 py-3 rounded-lg text-center transition-all ${
                  isActive(link.path) ? "text-[#0b2d49]" : "text-gray-300 hover:text-[#d7a444]"
                }`}
              >
                <span className="relative z-10">{link.name}</span>
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeTabMobile"
                    className="absolute inset-0 bg-[#d7a444] rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
