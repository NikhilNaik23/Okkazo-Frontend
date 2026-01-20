import React from "react";
import Navbar from "./Navbar";
const AdminLayout = ({ title, subtitle, children }) => {
    return (
    <div className="min-h-screen flex bg-background-light text-text-main font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col overflow-y-auto h-full relative bg-background-light">
        <div className="px-6 py-6 pb-2">
          {title && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-600 text-text-main tracking-tight">
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
export default AdminLayout;