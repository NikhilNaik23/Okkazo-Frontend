import React from 'react'
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Home/public/Dashboard";
import Login from "./pages/Home/public/Login";
import Register from "./pages/Home/public/Register";
import AdminLayout from "./components/Layout/admin/AdminLayout";
import UserDashboard from "./pages/user/UserDashboard";
import PlanningWizard from "./pages/user/PlanningWizard";
import PromoteEvent from "./pages/user/PromoteEvent";
import EventDetails from "./pages/user/EventDetails";
import EventCheckout from "./pages/user/EventCheckout";
import MyEvents from "./pages/user/MyEvents";
import UserProfile from "./pages/user/UserProfile";
import Notifications from "./pages/user/Notifications";
import EditProfile from "./pages/user/EditProfile";
import AccountSettings from "./pages/user/AccountSettings";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/*" element={<AdminLayout />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/user/planning-wizard" element={<PlanningWizard />} />
      <Route path="/user/promote" element={<PromoteEvent />} />
      <Route path="/user/event/:eventId" element={<EventDetails />} />
      <Route path="/user/checkout/:eventId" element={<EventCheckout />} />
      <Route path="/user/my-events" element={<MyEvents />} />
      <Route path="/user/profile" element={<UserProfile />} />
      <Route path="/user/notifications" element={<Notifications />} />
      <Route path="/user/edit-profile" element={<EditProfile />} />
      <Route path="/user/account-settings" element={<AccountSettings />} />
    </Routes>
    
  );
};

export default App;