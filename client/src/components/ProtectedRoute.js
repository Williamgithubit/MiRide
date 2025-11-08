import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useReduxAuth from '../store/hooks/useReduxAuth';
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, isLoading, user } = useReduxAuth();
    const [initialCheckComplete, setInitialCheckComplete] = useState(false);
    const location = useLocation();
    // Check if user has the required role if specified
    const hasRequiredRole = !requiredRole || user?.role === requiredRole;
    // Add a small delay to prevent flash of login page
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialCheckComplete(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);
    // Show loading state while checking auth
    if (isLoading || !initialCheckComplete) {
        return (_jsx("div", { className: "flex justify-center items-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" }) }));
    }
    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    // Check if user has the required role
    if (!hasRequiredRole) {
        // Redirect to dashboard or home if user doesn't have required role
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
