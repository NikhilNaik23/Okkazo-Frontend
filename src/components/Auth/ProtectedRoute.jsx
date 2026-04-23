import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCurrentUser,
  fetchVendorApplication,
  logout,
  selectIsAuthenticated,
  selectUserRole,
  selectUser,
  selectVendorApplication,
} from "../../store/slices/authSlice";
import { isUserProfileComplete } from "../../utils/profileCompletion";

/**
 * ProtectedRoute - Protects routes based on authentication and roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route (e.g., ['USER', 'ADMIN'])
 * @param {string} props.redirectTo - Path to redirect if not authorized (default: '/login')
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = "/login",
}) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const user = useSelector(selectUser);
  const vendorApplication = useSelector(selectVendorApplication);
  const hasStoredAccessToken = Boolean(localStorage.getItem("accessToken"));

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Fail closed when storage token is gone (manual clear, stale tab state, etc.).
    if (isAuthenticated && !hasStoredAccessToken) {
      dispatch(logout());
    }
  }, [dispatch, isAuthenticated, hasStoredAccessToken]);

  useEffect(() => {
    const finishCheck = () => {
      setTimeout(() => setIsChecking(false), 0);
    };

    // Always resolve checking state to avoid indefinite guard spinner.
    if (!isAuthenticated || !hasStoredAccessToken) {
      finishCheck();
      return;
    }

    // If role is temporarily missing, try to bootstrap user profile once.
    if (!userRole) {
      if (!user) {
        dispatch(fetchCurrentUser()).finally(() => {
          setIsChecking(false);
        });
      } else {
        finishCheck();
      }
      return;
    }

    // Fetch appropriate data based on user role
    if (userRole === 'VENDOR' && !vendorApplication) {
      // For vendors, fetch vendor application data
      dispatch(fetchVendorApplication()).finally(() => {
        setIsChecking(false);
      });
    } else if ((userRole === 'USER' || userRole === 'ADMIN' || userRole === 'MANAGER') && !user) {
      // For non-vendor roles, fetch user profile
      dispatch(fetchCurrentUser()).finally(() => {
        setIsChecking(false);
      });
    } else {
      // Data already loaded
      finishCheck();
    }
  }, [dispatch, isAuthenticated, hasStoredAccessToken, userRole, user, vendorApplication]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e9eff1]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#d7a444] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !hasStoredAccessToken) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    // User doesn't have required role
    // Redirect to appropriate dashboard based on their actual role
    if (userRole === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (userRole === "MANAGER") {
      return <Navigate to="/manager/dashboard" replace />;
    } else if (userRole === "USER") {
      return <Navigate to="/user/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  if (userRole === "USER") {
    const isOnProfileCompletionPage = location.pathname === "/user/edit-profile";
    const hasCompletedProfile = isUserProfileComplete(user);

    if (!hasCompletedProfile && !isOnProfileCompletionPage) {
      return <Navigate to="/user/edit-profile" replace state={{ from: location, forceProfileCompletion: true }} />;
    }
  }

  return children;
};

export default ProtectedRoute;
