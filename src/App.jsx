import React from 'react'
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Home/public/Dashboard";
import Login from "./pages/Home/public/Login";
import Register from "./pages/Home/public/Register";
import AdminLayout from "./components/Layout/admin/AdminLayout";
import UserDashboard from "./pages/user/Dashboard/UserDashboard";
import PlanningWizard from "./pages/user/Events/PlanningWizard";
import PromoteEvent from "./pages/user/Events/PromoteEvent";
import EventDetails from "./pages/user/Events/EventDetails";
import EventCheckout from "./pages/user/Events/EventCheckout";
import MyEvents from "./pages/user/Dashboard/MyEvents";
import UserProfile from "./pages/user/Profile/UserProfile";
import Notifications from "./pages/user/Dashboard/Notifications";
import EditProfile from "./pages/user/Profile/EditProfile";
import AccountSettings from "./pages/user/Profile/AccountSettings";

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