import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchCurrentUser, selectIsAuthenticated, selectUser } from './store/slices/authSlice';

// Route Guards
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';

// Public Pages
import Dashboard from "./pages/Home/public/Dashboard";
import Login from "./pages/Home/public/Login";
import Register from "./pages/Home/public/Register";

// Admin Pages
import AdminLayout from "./components/Layout/admin/AdminLayout";

// User Pages
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
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Fetch user data on app load if authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, user]);

  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 4000,
        }}
        containerStyle={{
          top: 20,
        }}
      />
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Auth Routes - Redirect if already logged in */}
        <Route 
          path="/login" 
          element={
            <PublicRoute restricted>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute restricted>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Admin Routes - Only for ADMIN role */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          } 
        />

        {/* User Routes - Only for USER role */}
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/planning-wizard" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <PlanningWizard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/promote" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <PromoteEvent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/event/:eventId" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <EventDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/checkout/:eventId" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <EventCheckout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/my-events" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyEvents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/profile" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/notifications" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/edit-profile" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <EditProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/account-settings" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <AccountSettings />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
    </>
  );
};

export default App;