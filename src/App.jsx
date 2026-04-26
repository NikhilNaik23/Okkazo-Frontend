import React, { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { io as createSocket } from 'socket.io-client';
import { fetchCurrentUser, fetchVendorApplication, logout, refreshAccessToken, selectIsAuthenticated, selectUser } from './store/slices/authSlice';
import { CHAT_SOCKET_URL } from './utils/chatConfig';
import { fetchWithNgrok } from './utils/apiHandler';

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
import Pricing from "./pages/Home/public/Pricing";
import QuoteSuccess from "./pages/Home/public/QuoteSuccess";
import NotFound from "./pages/Home/public/NotFound";
import ServerUnavailable from "./pages/Home/public/ServerUnavailable";

// Admin Pages
import AdminLayout from "./components/Layout/admin/AdminLayout";

// Manager Pages
import ManagerLayout from "./components/Layout/manager/ManagerLayout";
import ManagerHomePage from "./pages/Home/manager/ManagerHomePage";
import ManagerEvents from "./pages/Home/manager/ManagerEvents";
import ManagerEventDetails from "./pages/Home/manager/ManagerEventDetails";
import ManagerVendors from "./pages/Home/manager/ManagerVendors";
import ManagerAnalytics from "./pages/Home/manager/ManagerAnalytics";
import ManagerChatPage from "./pages/Home/manager/ManagerChatPage";
import ManagerNotifications from "./pages/Home/manager/ManagerNotifications";
import ManagerReports from "./pages/Home/manager/ManagerReports";
import ManagerProfile from "./pages/Home/manager/ManagerProfile";
import ManagerLogout from "./pages/Home/manager/ManagerLogout";
import ManagerRefundRequests from "./pages/Home/manager/ManagerRefundRequests";
import ManagerRefundPolicies from "./pages/Home/manager/ManagerRefundPolicies";

import UserLayout from "./components/Layout/user/UserLayout";

// User Pages
import UserDashboard from "./pages/user/Dashboard/UserDashboard";
import PlanningWizard from "./pages/user/Events/PlanningWizard";
import PromoteEvent from "./pages/user/Events/PromoteEvent";
import EventDetails from "./pages/user/Events/EventDetails";
import EventCheckout from "./pages/user/Events/EventCheckout";
import UserEventManagement from "./pages/user/Events/UserEventManagement";
import MyEvents from "./pages/user/Dashboard/MyEvents";
import TicketDetails from "./pages/user/Events/TicketDetails";
import UserProfile from "./pages/user/Profile/UserProfile";
import ViewProof from "./pages/user/Events/ViewProof";
import Notifications from "./pages/user/Dashboard/Notifications";
import EditProfile from "./pages/user/Profile/EditProfile";
import AccountSettings from "./pages/user/Profile/AccountSettings";
import VendorRegistration from "./pages/vendor/VendorRegistration";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorApplicationStatus from "./pages/vendor/VendorApplicationStatus";
import VendorLayout from "./components/Layout/vendor/VendorLayout";
import BookedEvents from "./pages/vendor/BookedEvents";
import ServiceManagement from "./pages/vendor/ServiceManagement";
import ManagerChat from "./pages/vendor/ManagerChat";
import BusinessProfile from "./pages/vendor/BusinessProfile";
import VendorEventDetails from "./pages/vendor/EventDetails";
import VendorEventDetailsTab from "./components/Vendor/EventDetails/VendorEventDetailsTab";
import VendorEventBudgetTab from "./components/Vendor/EventDetails/VendorEventBudgetTab";
import VendorEventChatTab from "./components/Vendor/EventDetails/VendorEventChatTab";
import VendorEventTodoTab from "./components/Vendor/EventDetails/VendorEventTodoTab";
import VendorEventBillTab from "./components/Vendor/EventDetails/VendorEventBillTab";
import AccountSettingsPage from "./pages/vendor/AccountSettings";
import VendorNotifications from "./pages/vendor/Notifications";
import Ledger from "./pages/vendor/Ledger";
import RefundPolicyCenter from "./pages/shared/RefundPolicyCenter";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [isServerDown, setIsServerDown] = React.useState(false);
  const presenceSocketRef = React.useRef(null);

  // Try to refresh token on app load if we have a refresh token
  useEffect(() => {
    let isMounted = true;

    const checkGatewayHealth = async () => {
      const normalizedBaseUrl = String(API_BASE_URL || '').trim().replace(/\/$/, '');

      if (!normalizedBaseUrl) {
        return false;
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetchWithNgrok(`${normalizedBaseUrl}/gateway/health`, {
          method: 'GET',
          signal: controller.signal,
        });

        return response.status === 200;
      } catch {
        return false;
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    const initAuth = async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');
        const userRole = localStorage.getItem('userRole');
        const hasStoredSession = Boolean(refreshToken || accessToken);

        const isGatewayHealthy = await checkGatewayHealth();
        
        if (!isGatewayHealthy) {
          setIsServerDown(true);
          if (hasStoredSession) {
            dispatch(logout());
          }
          return;
        }

        if (hasStoredSession) {
          if (refreshToken && !accessToken) {
            // We have refresh token but no access token - try to refresh
            const result = await dispatch(refreshAccessToken());
            if (refreshAccessToken.fulfilled.match(result)) {
              // Successfully got new access token, fetch appropriate data based on role
              if (userRole === 'VENDOR') {
                dispatch(fetchVendorApplication());
              } else {
                dispatch(fetchCurrentUser());
              }
            }
          } else if (accessToken) {
            // We have access token - fetch data based on role
            if (userRole === 'VENDOR') {
              dispatch(fetchVendorApplication());
            } else {
              dispatch(fetchCurrentUser());
            }
          }
        }

      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Fetch user data when authenticated but no user data
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (isAuthenticated && !user && !isInitializing && userRole !== 'VENDOR') {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, user, isInitializing]);

  // Keep a global socket alive while authenticated so presence reflects platform activity,
  // not only when users open the chat page.
  useEffect(() => {
    if (!accessToken) {
      if (presenceSocketRef.current) {
        presenceSocketRef.current.disconnect();
        presenceSocketRef.current = null;
      }
      return undefined;
    }

    if (presenceSocketRef.current) {
      return () => {
        if (presenceSocketRef.current) {
          presenceSocketRef.current.disconnect();
          presenceSocketRef.current = null;
        }
      };
    }

    const socket = createSocket(CHAT_SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    presenceSocketRef.current = socket;

    return () => {
      if (presenceSocketRef.current) {
        presenceSocketRef.current.disconnect();
        presenceSocketRef.current = null;
      }
    };
  }, [accessToken]);

  if (isServerDown) {
    return <ServerUnavailable />;
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-secondary uppercase tracking-widest text-xs">
            Preparing session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
        containerStyle={{
          top: 20,
        }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location}>
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
          <Route
            path="/pricing"
            element={
              <PublicRoute>
                <Pricing />
              </PublicRoute>
            }
          />

          <Route
            path="/quote-success"
            element={
              <PublicRoute>
                <QuoteSuccess />
              </PublicRoute>
            }
          />

          <Route
            path="/refund-policy"
            element={
              <ProtectedRoute allowedRoles={['USER', 'VENDOR', 'ADMIN', 'MANAGER']}>
                <RefundPolicyCenter />
              </ProtectedRoute>
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
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>

              <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManagerHomePage />} />
            <Route path="events" element={<ManagerEvents />} />
            <Route path="events/:id" element={<ManagerEventDetails />} />
            <Route path="event/:id" element={<ManagerEventDetails />} />
            <Route path="refund-requests" element={<ManagerRefundRequests />} />
            <Route path="refund-policies" element={<ManagerRefundPolicies />} />
            <Route path="vendors" element={<ManagerVendors />} />
            <Route path="analytics" element={<ManagerAnalytics />} />
            <Route path="chat" element={<ManagerChatPage />} />
            <Route path="notifications" element={<ManagerNotifications />} />
            <Route path="reports" element={<ManagerReports />} />
            <Route path="profile" element={<ManagerProfile />} />
            <Route path="logout" element={<ManagerLogout />} />
          </Route>



          {/* User Routes - Only for USER role */}
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
              <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="planning-wizard" element={<PlanningWizard />} />
            <Route path="promote" element={<PromoteEvent />} />
            <Route path="promote-event/:id" element={<ViewProof />} />
            <Route path="event/:eventId" element={<EventDetails />} />
            <Route path="checkout/:eventId" element={<EventCheckout />} />
            <Route path="my-events" element={<MyEvents />} />
            <Route
              path="ticket/:id"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <TicketDetails />
                </ProtectedRoute>
              }
            />
            <Route path="event-management/:eventId" element={<UserEventManagement />} />
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
            path="/vendor/application-status"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorApplicationStatus />
              </ProtectedRoute>
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
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="booked-events" element={<BookedEvents />} />
            <Route path="service-management" element={<ServiceManagement />} />
            <Route path="messages" element={<ManagerChat />} />
            <Route path="profile" element={<BusinessProfile />} />
            <Route path="event/:id" element={<VendorEventDetails />}>
              <Route index element={<Navigate to="details" replace />} />
              <Route path="details" element={<VendorEventDetailsTab />} />
              <Route path="budget" element={<VendorEventBudgetTab />} />
              <Route path="chat" element={<VendorEventChatTab />} />
              <Route path="todo" element={<VendorEventTodoTab />} />
              <Route path="bill" element={<VendorEventBillTab />} />
            </Route>
            <Route path="settings" element={<AccountSettingsPage />} />
            <Route path="notifications" element={<VendorNotifications />} />
            <Route path="dashboard/ledger" element={<Ledger />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

    </>


  );
};

export default App;