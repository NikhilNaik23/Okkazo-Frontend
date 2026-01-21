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
import { Routes, Route } from "react-router";
import Dashboard from "./pages/Home/public/Dashboard";
import Login from "./pages/Home/public/Login";
import Register from "./pages/Home/public/Register";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
