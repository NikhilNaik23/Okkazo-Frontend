import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCurrentUser,
  fetchVendorApplication,
  selectIsAuthenticated,
  selectUserRole,
  selectIsLoading,
  selectUser,
  selectVendorApplication,
} from "../../store/slices/authSlice";

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
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);
  const vendorApplication = useSelector(selectVendorApplication);

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Fetch appropriate data based on user role
    if (isAuthenticated && userRole) {
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
        setIsChecking(false);
      }
    } else if (!isAuthenticated) {
      setIsChecking(false);
    }
  }, [dispatch, isAuthenticated, userRole, user, vendorApplication]);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
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
  if (!isAuthenticated) {
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

  return children;
};

export default ProtectedRoute;
