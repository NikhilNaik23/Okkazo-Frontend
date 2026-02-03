import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchCurrentUser, refreshAccessToken, selectIsAuthenticated, selectUser } from './store/slices/authSlice';

// Route Guards
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';

// Public Pages
import Dashboard from "./pages/Home/public/Dashboard";
import Login from "./pages/Home/public/Login";
import Register from "./pages/Home/public/Register";
import ForgotPassword from "./pages/Home/public/ForgotPassword";
import ResetPassword from "./pages/Home/public/ResetPassword";
import VerifyEmail from "./pages/Home/public/VerifyEmail";
import ResendVerification from "./pages/Home/public/ResendVerification";

// Admin Pages
import AdminLayout from "./components/Layout/admin/AdminLayout";

// Manager Pages
import ManagerLayout from "./components/Layout/manager/ManagerLayout";

import UserLayout from "./components/Layout/user/UserLayout";

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
import VendorRegistration from "./pages/vendor/VendorRegistration";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorLayout from "./components/Layout/vendor/VendorLayout";
import BookedEvents from "./pages/vendor/BookedEvents";
import ServiceManagement from "./pages/vendor/ServiceManagement";
import ManagerChat from "./pages/vendor/ManagerChat";
import BusinessProfile from "./pages/vendor/BusinessProfile";
import VendorEventDetails from "./pages/vendor/EventDetails";
import AccountSettingsPage from "./pages/vendor/AccountSettings";

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Try to refresh token on app load if we have a refresh token
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      
      if (refreshToken && !accessToken) {
        // We have refresh token but no access token - try to refresh
        const result = await dispatch(refreshAccessToken());
        if (refreshAccessToken.fulfilled.match(result)) {
          // Successfully got new access token, fetch user data
          dispatch(fetchCurrentUser());
        }
      } else if (accessToken) {
        // We have access token - fetch user
        dispatch(fetchCurrentUser());
      }
      
      setIsInitializing(false);
    };

    initAuth();
  }, [dispatch]);

  // Fetch user data when authenticated but no user data
  useEffect(() => {
    if (isAuthenticated && !user && !isInitializing) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, user, isInitializing]);

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
        {/* Public Routes - Redirect authenticated users to their dashboard */}
        <Route 
          path="/" 
          element={
            <PublicRoute restricted>
              <Dashboard />
            </PublicRoute>
          } 
        />
        
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
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute restricted>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute restricted>
              <ResetPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="/verify-email" 
          element={
            <PublicRoute>
              <VerifyEmail />
            </PublicRoute>
          } 
        />
        <Route 
          path="/resend-verification" 
          element={
            <PublicRoute restricted>
              <ResendVerification />
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

        {/* Manager Routes - Only for MANAGER role */}
        <Route 
          path="/manager/*" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <ManagerLayout />
            </ProtectedRoute>
          } 
        />

        {/* User Routes - Only for USER role */}
        <Route 
          path="/user" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserLayout />
            </ProtectedRoute>
          } 
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="planning-wizard" element={<PlanningWizard />} />
          <Route path="promote" element={<PromoteEvent />} />
          <Route path="event/:eventId" element={<EventDetails />} />
          <Route path="checkout/:eventId" element={<EventCheckout />} />
          <Route path="my-events" element={<MyEvents />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="account-settings" element={<AccountSettings />} />
        </Route>


        {/* Vendor Routes - For VENDOR role */}
        <Route 
          path="/vendor/register" 
          element={
            <PublicRoute>
              <VendorRegistration />
            </PublicRoute>
          } 
        />
        <Route 
          path="/vendor" 
          element={
            <ProtectedRoute allowedRoles={['VENDOR']}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="booked-events" element={<BookedEvents />} />
          <Route path="service-management" element={<ServiceManagement />} />
          <Route path="messages" element={<ManagerChat />} />
          <Route path="profile" element={<BusinessProfile />} />
          <Route path="event/:id" element={<VendorEventDetails />} />
          <Route path="settings" element={<AccountSettingsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
    </>
    
  );
};

export default App;