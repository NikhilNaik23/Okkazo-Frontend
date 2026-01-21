import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MdMenu } from "react-icons/md";
import Navbar from "./Navbar";
import AdminDashboard from "../../../pages/Home/admin/AdminDashboard";
import AdminEvents from "../../../pages/Home/admin/AdminEvents";
import AdminVendorVerification from "../../../pages/Home/admin/AdminVendorVerification";
import EventDetails from "../../../pages/Home/admin/EventDetails";

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
    <div className="h-screen overflow-hidden flex bg-[#e9eff1] text-[#0b2d49] font-sans">
      <Navbar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col overflow-y-auto h-full relative scroll-smooth w-full">
        {/* Mobile Header */}
        <div className="md:hidden p-4 flex items-center justify-between bg-white border-b border-[#e9eff1] sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-[#0b2d49] hover:bg-[#e9eff1] rounded-lg transition-colors"
                >
                    <MdMenu size={24} />
                </button>
                <span className="font-bold text-lg text-[#0b2d49]">Okkazo Admin</span>
            </div>
            <img src="/internal_logo.png" alt="Logo" className="h-8 w-auto" />
        </div>

        <div className="flex-1 h-full p-0">
            <Routes>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="events/:id" element={<EventDetails />} />
                <Route path="vendors" element={<AdminVendorVerification />} />
                <Route path="dashboard" element={<AdminDashboard />} />
            </Routes>
        </div>
      </main>
    </div>
  );
};
export default AdminLayout;