import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { BsSearch, BsBell, BsGear } from "react-icons/bs";
import { vendorSidebarMenus, vendorLayoutData } from "../../../data/vendorLayoutData.jsx";

const VendorLayout = () => {
  const location = useLocation();

  const sidebarMenus = vendorSidebarMenus;
  const vendorData = vendorLayoutData;

  return (
    <div className="flex min-h-screen bg-[#e9eff1] font-sans text-[#0b2d49]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-[#708aa0]/10 flex flex-col sticky top-0 h-screen z-20">
        <div className="p-8">
          <Link to="/vendor/dashboard" className="flex items-center gap-3 group">
            <div className="w-14 h-14 bg-[#0b2d49] rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-[#0b2d49]/20 group-hover:scale-105 transition-transform">
              <img src="/vendor_logo.png" alt="Okkazo" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#0b2d49]">Okkazo</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 mt-4">
          <ul className="space-y-1">
            {sidebarMenus.map((menu, idx) => {
              const isActive = location.pathname === menu.path;
              return (
                <li key={idx}>
                  <Link 
                    to={menu.path}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${isActive ? 'bg-[#d7a444]/10 text-[#d7a444]' : 'text-[#708aa0] hover:bg-[#e9eff1] hover:text-[#0b2d49]'}`}
                  >
                    <span className="text-xl">{menu.icon}</span>
                    {menu.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 space-y-4">
          <Link 
            to="/vendor/settings" 
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${location.pathname === '/vendor/settings' ? 'bg-[#0b2d49] text-white shadow-lg shadow-[#0b2d49]/10' : 'text-[#708aa0] hover:bg-[#e9eff1] hover:text-[#0b2d49]'}`}
          >
            <span className="text-xl"><BsGear /></span>
            Settings
          </Link>
          <div className="p-2 bg-[#f3ddb1]/30 rounded-[2rem] flex items-center gap-4 border border-[#f3ddb1]/50 shadow-sm group hover:border-[#d7a444]/50 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#d7a444] to-[#d0a862] shadow-inner border-2 border-white group-hover:scale-105 transition-transform"></div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm truncate">{vendorData.name}</p>
              <p className="text-[10px] text-[#5a5b44] font-bold uppercase tracking-wider">{vendorData.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-24 px-10 flex justify-between items-center bg-transparent shrink-0">
          <div className="flex items-center gap-4">
            {/* dynamic title could go here */}
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0]" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-12 pr-6 py-3 bg-white rounded-2xl border-none focus:ring-2 focus:ring-[#d7a444]/20 transition-all w-72 placeholder:text-[#708aa0] font-medium shadow-sm"
              />
            </div>
            <button className="relative p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-[#708aa0] hover:text-[#0b2d49] border border-[#708aa0]/10">
              <BsBell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#d7a444] rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-10 pt-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
