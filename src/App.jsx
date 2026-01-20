import React from 'react'
import AdminDashboard from './pages/Home/admin/AdminDashboard'
import Navbar from './components/Layout/admin/Navbar'
import AdminEvents from './pages/Home/admin/AdminEvents'
import AdminLayout from './components/Layout/admin/AdminLayout'
import InternalEventCard from './components/Global/cards/InternalEventCard'
import React from "react";
import Dashboard from "./pages/Home/public/Dashboard";

const App = () => {
  return (
    <div>
      {/* <AdminEvents /> */}
      <InternalEventCard />
      <Dashboard />
    </div>
  );
};

export default App;
