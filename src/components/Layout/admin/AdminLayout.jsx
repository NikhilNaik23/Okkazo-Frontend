import React from "react";
import { Routes, Route, Navigate } from "react-router";
import Navbar from "./Navbar";
import AdminDashboard from "../../../pages/Home/admin/AdminDashboard";
import AdminEvents from "../../../pages/Home/admin/AdminEvents";
import AdminVendorVerification from "../../../pages/Home/admin/AdminVendorVerification";

const AdminLayout = () => {
    return (
    <div className="h-screen overflow-hidden flex bg-background-light text-text-main font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col overflow-y-auto h-full relative bg-background-light scroll-smooth">
        <div className="flex-1 h-full">
            <Routes>
                <Route path="/" element={<Navigate to="/admin/events" replace />} />
                <Route path="/admin" element={<Navigate to="/admin/events" replace />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/vendors" element={<AdminVendorVerification />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
        </div>
      </main>
    </div>
  );
};
export default AdminLayout;