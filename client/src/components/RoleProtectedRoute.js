import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import useReduxAuth from '../store/hooks/useReduxAuth';
const RoleProtectedRoute = ({ children, allowedRoles, redirectPath = '/' }) => {
    const { isAuthenticated, isLoading, user } = useReduxAuth();
    if (isLoading) {
        return _jsx("div", { className: 'flex justify-center items-center h-screen text-lg', children: _jsx("p", { children: "Loading..." }) });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    // Check if user has the required role
    if (user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        if (user.role === 'customer') {
            return _jsx(Navigate, { to: "/dashboard/customer", replace: true });
        }
        else if (user.role === 'owner') {
            return _jsx(Navigate, { to: "/dashboard/owner", replace: true });
        }
        else if (user.role === 'admin') {
            return _jsx(Navigate, { to: "/dashboard/admin", replace: true });
        }
        else {
            // Fallback to the provided redirect path
            return _jsx(Navigate, { to: redirectPath, replace: true });
        }
    }
    return _jsx(_Fragment, { children: children });
};
export default RoleProtectedRoute;
