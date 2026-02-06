import React, { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiCloseLargeFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { publicNavMenus } from "../../../data/publicNavData";

const menus = publicNavMenus;

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isOverDarkSection, setIsOverDarkSection] = useState(false);

  const handleHamburger = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const testimonialsSection = document.getElementById("testimonials");
      const footerSection = document.getElementById("public-footer");
      const pricingDarkSection = document.getElementById("dark-section-pricing");
      const dashboardHero = document.getElementById("dashboard-hero");

      const isOverSection = (element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        // Navbar vertical range is from 24px (top-6) to 88px (top-6 + h-16)
        // Check for ANY vertical overlap
        return rect.top <= 88 && rect.bottom >= 24;
      };

      const isOver = isOverSection(testimonialsSection) || isOverSection(footerSection) || isOverSection(pricingDarkSection) || isOverSection(dashboardHero);
      setIsOverDarkSection(isOver);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const textColor = isOverDarkSection ? "text-[#EBF4F6]" : "text-[#088395]";
  const hoverColor = isOverDarkSection ? "hover:text-white" : "hover:text-[#09637E]";

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-10">
        <nav className="w-full max-w-7xl bg-[#7AB2B2]/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl transition-all duration-300 ring-1 ring-white/10">
          <div className="hidden md:flex justify-between max-w-7xl mx-auto px-10 h-20 items-center">
            <div className="flex justify-center items-center gap-12">
              <Link to="/">
                <img src="/public_logo.png" alt="Okkazo-logo" className="h-16 pt-2 w-auto object-contain" />
              </Link>
              <ul className={`flex justify-around items-center gap-8 text-sm font-bold ${textColor}`}>
                {menus.map((menu, index) => (
                  <Link to={menu.path} key={index}>
                    <li className={`cursor-pointer ${hoverColor} transition-colors`}>
                      {menu.name}
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
            <div className="flex justify-between items-center gap-6">
              <Link to="/login">
                <button
                  type="button"
                  className={`text-sm font-bold ${textColor} ${hoverColor} transition-colors`}
                >
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button
                  type="button"
                  className="bg-[#09637E] text-white py-2 px-6 rounded-lg text-sm font-bold hover:bg-[#08556d] transition-colors shadow-sm"
                >
                  Get Started
                </button>
              </Link>
            </div>
          </div>
          <div className="md:hidden flex justify-between items-center p-4">
            <div>
              <Link to="/">
                <img src="/mobile_logo.png" alt="Okkazo-logo" className="h-8 w-auto object-contain" />
              </Link>
            </div>
            {isMobileOpen ? (
              <RiCloseLargeFill className={`text-2xl cursor-pointer ${textColor}`} onClick={handleHamburger} />
            ) : (
              <GiHamburgerMenu className={`text-2xl cursor-pointer ${textColor}`} onClick={handleHamburger} />
            )}
            {isMobileOpen && (
              <div className="fixed inset-0 z-40" onClick={handleHamburger}></div>
            )}{" "}
            {isMobileOpen && (
              <div className="absolute top-16 left-0 w-full bg-[#0D47A1]/95 backdrop-blur-2xl shadow-xl z-50 animate-slide-down transition-all duration-300 ease-in-out border-t border-white/10 rounded-b-2xl">
                <ul className="flex flex-col gap-5 p-5">
                  {menus.map((menu, index) => (
                    <Link to={menu.path} key={index} onClick={handleHamburger}>
                      <li className="cursor-pointer text-[#EBF4F6] font-bold hover:text-white">
                        {menu.name}
                      </li>
                    </Link>
                  ))}
                </ul>
                <div className="flex flex-col gap-3 p-5 border-t border-white/10">
                  <Link to="/login" onClick={handleHamburger}>
                    <button
                      type="button"
                      className="text-md font-bold text-[#EBF4F6] hover:text-white py-2 w-full text-left"
                    >
                      Login
                    </button>
                  </Link>
                  <Link to="/register" onClick={handleHamburger}>
                    <button
                      type="button"
                      className="bg-[#09637E] text-white py-2 px-6 rounded-lg text-md font-bold hover:bg-[#08556d] transition-colors w-full"
                    >
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
