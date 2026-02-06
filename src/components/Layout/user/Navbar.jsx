import React, { useState, useRef, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BsBell, BsPersonCircle, BsSearch } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiCloseLargeFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Dashboard", path: "/user/dashboard" },
  { name: "Planning Wizard", path: "/user/planning-wizard" },
  { name: "Promote", path: "/user/promote" },
  { name: "My Events", path: "/user/my-events" },
];

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const containerRef = useRef(null);
  const linkRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const isActive = (path) => location.pathname === path;

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeLink = linkRefs.current[location.pathname];
      const container = containerRef.current;

      if (activeLink && container) {
        const activeRect = activeLink.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setIndicatorStyle({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
          opacity: 1,
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [location.pathname]);

  const isDashboard = ["/user/dashboard", "/user/my-events"].includes(location.pathname);

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-10">
      <nav className={`w-full max-w-7xl backdrop-blur-xl rounded-2xl border shadow-xl ring-1 overflow-hidden transition-all duration-300 ${isDashboard
        ? "bg-[#09637E]/95 border-[#EBF4F6]/20 ring-white/10 shadow-[#09637E]/20"
        : "bg-[#7AB2B2]/40 border-white/30 ring-white/10"
        }`}>
        <div className="flex justify-between max-w-7xl mx-auto px-6 md:px-10 h-20 items-center">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/user/dashboard" className="flex items-center gap-2">
              <img
                src="/public_logo.png"
                alt="Okkazo"
                className={`h-16 w-auto object-contain pt-2 transition-all duration-300 ${isDashboard ? "brightness-0 invert opacity-90" : ""}`}
              />
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center gap-2 relative h-10 px-1" ref={containerRef}>
              {/* Sliding Indicator */}
              <motion.div
                className={`absolute top-0 bottom-0 rounded-lg shadow-md z-0 ${isDashboard ? "bg-[#EBF4F6] shadow-none" : "bg-[#09637E]"}`}
                animate={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                  opacity: indicatorStyle.opacity,
                }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  ref={(el) => (linkRefs.current[link.path] = el)}
                  className={`relative z-10 text-xs font-bold px-4 py-2 rounded-lg transition-colors duration-300 ${isActive(link.path)
                    ? (isDashboard ? "text-[#09637E]" : "text-white")
                    : (isDashboard ? "text-[#EBF4F6]/80 hover:text-white" : "text-[#09637E] hover:text-[#088395]")
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Dashboard Search Bar */}
            {isDashboard && (
              <div className="hidden lg:flex items-center relative animate-fade-in">
                <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EBF4F6] opacity-70" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 bg-[#EBF4F6]/10 border border-[#EBF4F6]/30 rounded-full text-[#EBF4F6] placeholder-[#EBF4F6]/50 focus:outline-none focus:ring-2 focus:ring-[#EBF4F6]/50 focus:bg-[#EBF4F6]/20 transition-all w-52 xl:w-64 text-sm font-bold shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link to="/user/notifications" className={`relative transition-colors cursor-pointer p-2 ${isDashboard ? "text-[#EBF4F6] hover:text-white" : "text-[#09637E] hover:text-[#088395]"}`}>
              <BsBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-transparent translate-x-1/4 -translate-y-1/4"></span>
            </Link>

            <div className={`flex items-center gap-2 pl-3 border-l ${isDashboard ? "border-[#EBF4F6]/20" : "border-[#09637E]/20"}`}>
              <div className="text-right hidden lg:block">
                <p className={`text-xs font-bold ${isDashboard ? "text-[#EBF4F6]" : "text-[#09637E]"}`}>Alex Morgan</p>
                <p className={`text-[10px] font-medium leading-none ${isDashboard ? "text-[#EBF4F6]/70" : "text-[#088395]"}`}>Attendee</p>
              </div>
              <Link to="/user/profile" className={`w-8 h-8 rounded-full border-2 shadow-sm overflow-hidden hover:scale-105 transition-transform ${isDashboard ? "border-[#EBF4F6]/50" : "border-white"}`}>
                <img src="https://ui-avatars.com/api/?name=Alex+Morgan&background=09637E&color=EBF4F6" alt="User" />
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={`md:hidden text-xl transition-transform duration-300 ease-in-out cursor-pointer ml-2 ${isDashboard ? "text-[#EBF4F6]" : "text-[#09637E]"}`}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <RiCloseLargeFill /> : <GiHamburgerMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`md:hidden backdrop-blur-2xl border-t rounded-b-2xl shadow-xl ${isDashboard ? "bg-[#09637E]/95 border-[#EBF4F6]/20" : "bg-[#EBF4F6]/95 border-white/20"}`}
            >
              <div className="px-6 py-6 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`relative text-sm font-black py-3 rounded-xl text-center transition-all ${isActive(link.path)
                      ? (isDashboard ? "text-[#09637E] bg-[#EBF4F6]" : "text-white bg-[#09637E]")
                      : (isDashboard ? "text-[#EBF4F6] hover:bg-[#EBF4F6]/10" : "text-[#09637E] hover:bg-[#7AB2B2]/20")
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className={`border-t pt-3 mt-1 flex items-center justify-center gap-3 ${isDashboard ? "border-[#EBF4F6]/10" : "border-[#09637E]/10"}`}>
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Alex+Morgan&background=09637E&color=EBF4F6" alt="User" />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-black ${isDashboard ? "text-[#EBF4F6]" : "text-[#09637E]"}`}>Alex Morgan</p>
                    <p className={`text-xs ${isDashboard ? "text-[#EBF4F6]/70" : "text-[#088395]"}`}>Attendee</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
