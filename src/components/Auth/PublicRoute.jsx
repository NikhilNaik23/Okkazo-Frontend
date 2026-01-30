import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../../store/slices/authSlice';

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

    // If route is restricted and user is authenticated, redirect based on role
    if (restricted && isAuthenticated) {
        const from = location.state?.from?.pathname;
        
        // If there's a saved location, go back there
        if (from) {
            return <Navigate to={from} replace />;
        }
        
        // Otherwise redirect based on role
        if (userRole === 'ADMIN') {
            return <Navigate to="/admin" replace />;
        } else if (userRole === 'USER') {
            return <Navigate to="/user/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default PublicRoute;
