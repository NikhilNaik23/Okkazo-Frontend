import React from 'react'
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Home/public/Dashboard";
import Login from "./pages/Home/public/Login";
import Register from "./pages/Home/public/Register";
import AdminLayout from "./components/Layout/admin/AdminLayout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/*" element={<AdminLayout />} />
    </Routes>
    
  );
};

export default App;