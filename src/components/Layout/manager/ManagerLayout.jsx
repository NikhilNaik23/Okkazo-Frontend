import React from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebarNav from "./ManagerSidebarNav";

// Generic layout wrapper for all manager pages
// Usage: <ManagerLayout title="Dashboard Overview">...</ManagerLayout>
const ManagerLayout = () => {
  return (
    <div className="min-h-screen flex bg-background-light text-text-main font-sans">
      <ManagerSidebarNav />
      <main className="flex-1 flex flex-col overflow-y-auto h-full relative bg-background-light">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
