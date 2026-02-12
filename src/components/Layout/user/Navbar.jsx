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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isDashboard = ["/user/dashboard", "/user/my-events"].includes(location.pathname);
  const isWizard = location.pathname === "/user/planning-wizard";

  // Scroll Detection logic
  useLayoutEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 50);

      if (currentScrollY > 100) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showFullNav = isAtTop || isHovered;
  const isExpandingOnHover = isWizard && !isAtTop && isHovered;

  return (
    <header className="fixed top-6 left-0 right-0 z-[100] flex justify-start px-8 pointer-events-none transition-all duration-500" style={{ paddingRight: isWizard ? 'calc(var(--sidebar-width, 0px) + 32px)' : '32px' }}>
      <motion.nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{
          width: showFullNav ? (isExpandingOnHover ? "calc(100% - 380px)" : "100%") : "70px",
          maxWidth: showFullNav ? (isExpandingOnHover ? "calc(100% - 380px)" : "100%") : "70px",
          height: "70px",
          borderRadius: showFullNav ? "24px" : "35px",
        }}
        className={`pointer-events-auto backdrop-blur-3xl border shadow-2xl overflow-hidden transition-all duration-500 flex items-center
                    ${isDashboard
            ? "bg-[#09637E]/90 border-[#EBF4F6]/20 shadow-[#09637E]/20"
            : "bg-[#EBF4F6]/90 border-[#09637E]/10 shadow-[#09637E]/5"
          }`}
      >
        <div className={`flex items-center w-full h-full px-5 transition-all duration-500 ${showFullNav ? "justify-between" : "justify-center"}`}>

          {/* LEFT SECTION: LOGO OR HAMBURGER */}
          <Link to="/user/dashboard" className="flex items-center shrink-0">
            <AnimatePresence mode="wait">
              {showFullNav ? (
                <motion.img
                  key="logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  src="/public_logo.png"
                  alt="Okkazo"
                  className={`h-10 w-auto object-contain transition-all duration-300 ${isDashboard ? "brightness-0 invert" : ""}`}
                />
              ) : (
                <motion.div
                  key="hamburger"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                >
                  <GiHamburgerMenu size={24} className={isDashboard ? "text-white" : "text-[#09637E]"} />
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* FULL CONTENT (HIDDEN WHEN COLLAPSED) */}
          <AnimatePresence>
            {showFullNav && (
              <motion.div
                initial={{ opacity: 0, x: isWizard ? -20 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isWizard ? -20 : 0 }}
                className="flex-1 flex items-center justify-between ml-10"
              >
                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl transition-all
                                                ${isActive(link.path)
                          ? (isDashboard ? "text-[#09637E]" : "text-white")
                          : (isDashboard ? "text-white/60 hover:text-white" : "text-[#09637E]/40 hover:text-[#09637E]")
                        }`}
                    >
                      {isActive(link.path) && (
                        <motion.div
                          layoutId="nav-pill"
                          className={`absolute inset-0 rounded-xl z-[-1] shadow-lg ${isDashboard ? "bg-white" : "bg-[#09637E]"}`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-5">
                  {isDashboard && (
                    <div className="hidden lg:flex items-center relative group">
                      <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" />
                      <input
                        type="text"
                        placeholder="Search..."
                        className="pl-11 pr-4 py-2 bg-white/10 border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all w-32 xl:w-40 text-[10px] font-bold"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button className={`p-2 rounded-xl transition-colors ${isDashboard ? "text-white/60 hover:text-white hover:bg-white/10" : "text-[#09637E]/40 hover:text-[#09637E] hover:bg-black/5"}`}>
                      <BsBell size={18} />
                    </button>
                    <div className={`h-6 w-[1px] ${isDashboard ? "bg-white/10" : "bg-[#09637E]/10"}`} />
                    <Link to="/user/profile" className="flex items-center pl-1 group ml-3">
                      <div className="w-10 h-10 rounded-xl border-2 border-[#09637E]/20 overflow-hidden shadow-lg group-hover:scale-105 transition-all duration-300 flex items-center justify-center bg-[#09637E] text-white text-[11px] font-black">
                        AM
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMobileOpen && showFullNav && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-white/95 border-t border-gray-100 overflow-hidden"
            >
              <div className="px-8 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => setIsMobileOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-[#09637E] py-2">
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header >
  );
};

export default Navbar;
