import React from 'react'
import AdminDashboard from './pages/Home/admin/AdminDashboard'
import Navbar from './components/Layout/admin/Navbar'
import AdminEvents from './pages/Home/admin/AdminEvents'
import AdminLayout from './components/Layout/admin/AdminLayout'
import InternalEventCard from './components/Global/cards/InternalEventCard'
import Dashboard from "./pages/Home/public/Dashboard";
import AdminVendorVerification from './pages/Home/admin/AdminVendorVerification'

const App = () => {
  return (
    <div>
      
      {/* <InternalEventCard /> */}
      {/* <Dashboard /> */}
      <AdminLayout />
    </div>
  );
};

export default App;
