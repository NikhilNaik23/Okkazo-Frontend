import React from "react";
import ManagerSidebarNav from "./ManagerSidebarNav";

// Generic layout wrapper for all manager pages
// Usage: <ManagerLayout title="Dashboard Overview">...</ManagerLayout>
const ManagerLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex bg-background-light text-text-main font-sans">
      <ManagerSidebarNav />
      <main className="flex-1 flex flex-col overflow-y-auto h-full relative bg-background-light">
        <div className="px-6 py-6 pb-2">
          {title && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-main tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-text-muted text-sm mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          )}
        </div>
        {children}
      </main>
    </div>
  );
};

export default ManagerLayout;
