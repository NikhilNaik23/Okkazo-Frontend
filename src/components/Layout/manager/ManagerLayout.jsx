import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ManagerSidebarNav from "./ManagerSidebarNav";
import ManagerNotificationsPanel from "../../Manager/Notifications/ManagerNotificationsPanel";
import { StaffUnreadProvider } from "../../../context/StaffUnreadContext";


// Generic layout wrapper for all manager pages
// Usage: <ManagerLayout title="Dashboard Overview">...</ManagerLayout>
const ManagerLayout = () => {
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <StaffUnreadProvider>
      <div className="h-screen overflow-hidden flex bg-[#f8fafc] text-[#1e293b] font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
        <ManagerSidebarNav onToggleNotifications={() => setIsNotificationsOpen(true)} />
        <main className="flex-1 flex flex-col overflow-y-auto h-full relative scroll-smooth custom-scrollbar">
          <div className="flex-1 min-h-full">
            <Outlet />
          </div>
        </main>

        <ManagerNotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </div>
    </StaffUnreadProvider>
  );
};

export default ManagerLayout;
