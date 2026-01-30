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