import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import useReduxAuth from '../store/hooks/useReduxAuth';
import CustomerDashboard from './dashboards/customer/CustomerDashboard';
import OwnerDashboard from './dashboards/owner/OwnerDashboard';
import AdminDashboard from './dashboards/admin/AdminDashboard';
const DashboardRouter = ({ role }) => {
    // Use Redux auth hook instead of context
    const { user, isLoading } = useReduxAuth();
    if (isLoading) {
        return _jsx("div", { className: "flex justify-center items-center h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" }) });
    }
    // If no specific role is requested, show the dashboard based on user's role
    if (!role) {
        if (!user) {
            return _jsx(Navigate, { to: "/login", replace: true });
        }
        switch (user.role) {
            case 'customer':
                return _jsx(Navigate, { to: "/dashboard/customer", replace: true });
            case 'owner':
                return _jsx(Navigate, { to: "/dashboard/owner", replace: true });
            case 'admin':
                return _jsx(Navigate, { to: "/dashboard/admin", replace: true });
            default:
                return _jsx(Navigate, { to: "/", replace: true });
        }
    }
    // If a specific role is requested, check if user has that role
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    // Check if user has the required role
    if (user.role !== role) {
        // Redirect to the dashboard matching their actual role
        switch (user.role) {
            case 'customer':
                return _jsx(Navigate, { to: "/dashboard/customer", replace: true });
            case 'owner':
                return _jsx(Navigate, { to: "/dashboard/owner", replace: true });
            case 'admin':
                return _jsx(Navigate, { to: "/dashboard/admin", replace: true });
            default:
                return _jsx(Navigate, { to: "/", replace: true });
        }
    }
    // Show the appropriate dashboard based on the requested role
    switch (role) {
        case 'customer':
            return _jsx(CustomerDashboard, {});
        case 'owner':
            return _jsx(OwnerDashboard, {});
        case 'admin':
            return _jsx(AdminDashboard, {});
        default:
            return _jsx(Navigate, { to: "/", replace: true });
    }
};
export default DashboardRouter;
