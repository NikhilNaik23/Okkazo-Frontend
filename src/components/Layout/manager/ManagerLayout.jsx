import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ManagerSidebarNav from "./ManagerSidebarNav";

// Generic layout wrapper for all manager pages
// Usage: <ManagerLayout title="Dashboard Overview">...</ManagerLayout>
const ManagerLayout = () => {
  const location = useLocation();

  return (
    <div className="h-screen overflow-hidden flex bg-[#f8fafc] text-[#1e293b] font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      <ManagerSidebarNav />
      <main className="flex-1 flex flex-col overflow-y-auto h-full relative scroll-smooth custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ManagerLayout;
