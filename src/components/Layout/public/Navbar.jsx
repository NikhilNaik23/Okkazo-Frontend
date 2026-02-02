import React, { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiCloseLargeFill } from "react-icons/ri";
import { Link } from "react-router-dom";

const menus = [
  { name: "ExploreEvents", path: "#exploreEvents" },
];

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const handleHamburger = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full bg-white z-50">
        <div className="hidden md:flex justify-between max-w-7xl mx-auto px-10 h-16 items-center">
          <div className="flex justify-center items-center gap-12">
            <Link to="/">
              <img src="/public_logo.png" alt="Okkazo-logo" className="h-12 w-auto object-contain" />
            </Link>
            <ul className="flex justify-around items-center gap-8 text-sm font-semibold text-gray-400">
              {menus.map((menu, index) => (
                <Link to={menu.path} key={index}>
                  <li className="cursor-pointer hover:text-[#d7a444] transition-colors">
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
                className="text-sm font-semibold text-gray-400 hover:text-[#d7a444] transition-colors"
              >
                Login
              </button>
            </Link>
            <Link to="/register">
              <button
                type="button"
                className="bg-[#0b2d49] text-white py-2 px-6 rounded-lg text-sm font-bold hover:bg-[#d7a444] transition-colors shadow-sm"
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
        <div className="md:hidden flex justify-between items-center p-5">
          <div>
            <Link to="/">
              <img src="/mobile_logo.png" alt="Okkazo-logo" className="h-8 w-auto object-contain" />
            </Link>
          </div>
          {isMobileOpen ? (
            <RiCloseLargeFill className="text-2xl cursor-pointer" onClick={handleHamburger} />
          ) : (
            <GiHamburgerMenu className="text-2xl cursor-pointer" onClick={handleHamburger} />
          )}
          {isMobileOpen && (
            <div className="fixed inset-0 z-40" onClick={handleHamburger}></div>
          )}{" "}
          {isMobileOpen && (
            <div className="absolute top-16 left-0 w-full bg-white shadow-lg z-50 animate-slide-down transition-all duration-300 ease-in-out border-t border-gray-100">
              <ul className="flex flex-col gap-5 p-5">
                {menus.map((menu, index) => (
                  <Link to={menu.path} key={index} onClick={handleHamburger}>
                    <li className="cursor-pointer text-gray-400 font-semibold hover:text-[#d7a444]">
                      {menu.name}
                    </li>
                  </Link>
                ))}
              </ul>
              <div className="flex flex-col gap-3 p-5 border-t border-gray-100">
                <Link to="/login" onClick={handleHamburger}>
                  <button
                    type="button"
                    className="text-md font-semibold text-gray-400 hover:text-[#d7a444] py-2 w-full text-left"
                  >
                    Login
                  </button>
                </Link>
                <Link to="/register" onClick={handleHamburger}>
                  <button
                    type="button"
                    className="bg-[#0b2d49] text-white py-2 px-6 rounded-lg text-md font-bold hover:bg-[#d7a444] transition-colors w-full"
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
