import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ManagerSidebarNav from "./ManagerSidebarNav";
import ManagerNotificationsPanel from "../../Manager/Notifications/ManagerNotificationsPanel";

const MotionDiv = motion.div;

// Generic layout wrapper for all manager pages
// Usage: <ManagerLayout title="Dashboard Overview">...</ManagerLayout>
const ManagerLayout = () => {
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex bg-[#f8fafc] text-[#1e293b] font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      <ManagerSidebarNav onToggleNotifications={() => setIsNotificationsOpen(true)} />
      <main className="flex-1 flex flex-col overflow-y-auto h-full relative scroll-smooth custom-scrollbar">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 min-h-full"
          >
            <Outlet />
          </MotionDiv>
        </AnimatePresence>
      </main>

      <ManagerNotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default ManagerLayout;
