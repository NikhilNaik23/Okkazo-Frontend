import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole, selectVendorApplication, selectUser } from '../../store/slices/authSlice';
import { isUserProfileComplete } from '../../utils/profileCompletion';

/**
 * PublicRoute - Redirects authenticated users away from public pages (login, register)
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.restricted - If true, authenticated users will be redirected
 */
const PublicRoute = ({ children, restricted = false }) => {
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const userRole = useSelector(selectUserRole);
    const user = useSelector(selectUser);
    const vendorApplication = useSelector(selectVendorApplication);
    const hasStoredAccessToken = Boolean(localStorage.getItem('accessToken'));
    const hasActiveSession = isAuthenticated && hasStoredAccessToken;

    // If route is restricted and user is authenticated, redirect based on role
    if (restricted && hasActiveSession) {
        const from = location.state?.from?.pathname;
        
        // If there's a saved location, go back there
        if (from) {
            return <Navigate to={from} replace />;
        }
        
        // Otherwise redirect based on role
        if (userRole === 'ADMIN') {
            return <Navigate to="/admin" replace />;
        } else if (userRole === 'MANAGER') {
            return <Navigate to="/manager/dashboard" replace />;
        } else if (userRole === 'USER') {
            if (user && !isUserProfileComplete(user)) {
                return <Navigate to="/user/edit-profile" replace state={{ forceProfileCompletion: true }} />;
            }
            return <Navigate to="/user/dashboard" replace />;
        } else if (userRole === 'VENDOR') {
            // For vendors, check their application status
            if (vendorApplication?.status === 'APPROVED') {
                return <Navigate to="/vendor/dashboard" replace />;
            } else {
                // For all other statuses (PENDING_REVIEW, DOCUMENTS_REQUESTED, UNDER_VERIFICATION, REJECTED, SUSPENDED)
                return <Navigate to="/vendor/application-status" replace />;
            }
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default PublicRoute;
