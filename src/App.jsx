import React from 'react'
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Home/public/Dashboard";
import Login from "./pages/Home/public/Login";
import Register from "./pages/Home/public/Register";
import AdminLayout from "./components/Layout/admin/AdminLayout";
import UserDashboard from "./pages/user/Dashboard";
import PlanningWizard from "./pages/user/PlanningWizard";
import PromoteEvent from "./pages/user/PromoteEvent";

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
    </Routes>
    
  );
};

export default App;