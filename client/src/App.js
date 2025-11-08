import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Use the custom auth hook instead of direct Redux access
import useReduxAuth from './store/hooks/useReduxAuth';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ScrollToTop from './components/common/ScrollToTop';
// Import Home directly (not lazy) to test
import Home from './pages/Home';
// Lazy load other components
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const Dashboard = lazy(() => import('./components/Dashboard'));
// Old DashboardRouter import removed - using NewDashboardRouter instead
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const RoleProtectedRoute = lazy(() => import('./components/RoleProtectedRoute'));
const BrowseCars = lazy(() => import('./components/BrowseCars'));
const CarDetails = lazy(() => import('./components/CarDetails'));
const BookingFlow = lazy(() => import('./components/BookingFlow'));
const RoleTest = lazy(() => import('./components/RoleTest'));
const BookingSuccess = lazy(() => import('./components/pages/BookingSuccess'));
const BookingCancelled = lazy(() => import('./components/pages/BookingCancelled'));
// Lazy load dashboard components
const NewDashboardRouter = lazy(() => import('./components/dashboards/DashboardRouter'));
// Loading component
const LoadingFallback = () => {
    console.log('LoadingFallback component rendering - Suspense is active');
    return (_jsxs("div", { className: "flex items-center justify-center min-h-screen", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" }), _jsx("p", { className: "ml-4 text-gray-600", children: "Loading component..." })] }));
};
const AppContent = () => {
    // Use the custom auth hook instead of direct Redux access
    const { isAuthenticated } = useReduxAuth();
    const location = useLocation();
    console.log('AppContent rendering', {
        isAuthenticated,
        currentPath: location.pathname,
        timestamp: new Date().toISOString()
    });
    return (_jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/signup", element: _jsx(Signup, {}) }), _jsx(Route, { path: "/dashboard/*", element: _jsx(ProtectedRoute, { children: _jsx(NewDashboardRouter, {}) }) }), _jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/browse-cars", element: _jsx(BrowseCars, {}) }), _jsx(Route, { path: "/cars", element: _jsx(BrowseCars, {}) }), _jsx(Route, { path: "/car-details/:carId", element: _jsx(CarDetails, {}) }), _jsx(Route, { path: "/booking/:carId", element: _jsx(BookingFlow, {}) }), _jsx(Route, { path: "/booking-success", element: _jsx(BookingSuccess, {}) }), _jsx(Route, { path: "/booking-cancelled", element: _jsx(BookingCancelled, {}) }), _jsx(Route, { path: "/role-test", element: _jsx(ProtectedRoute, { children: _jsx(RoleTest, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
};
const App = () => {
    const location = useLocation();
    const { user, isAuthenticated, isLoading } = useReduxAuth();
    const [isInitialized, setIsInitialized] = React.useState(false);
    // Initialize app
    useEffect(() => {
        console.log('App - Auth state changed:', {
            isAuthenticated,
            hasUser: !!user,
            userRole: user?.role,
            userName: user?.name,
            isLoading,
            currentPath: location.pathname
        });
        // Mark as initialized when auth check is complete
        if (!isLoading) {
            setIsInitialized(true);
        }
    }, [isAuthenticated, user, isLoading, location.pathname]);
    // Show loading state only for protected routes or initial auth check
    const currentPath = location.pathname;
    const isProtectedRoute = currentPath.startsWith('/dashboard');
    // Only show loading for protected routes or during initial auth check with token
    if (isLoading && isProtectedRoute) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen bg-gray-50", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading application..." })] }));
    }
    const currentLocation = useLocation();
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(currentLocation.pathname);
    const isDashboardPage = currentLocation.pathname.startsWith('/dashboard');
    console.log('Rendering App component', {
        isAuthenticated,
        user,
        currentPath,
        isAuthPage,
        isDashboardPage,
        isLoading,
        isProtectedRoute
    });
    return (_jsx(DarkModeProvider, { children: _jsxs("div", { className: "app-container", style: { padding: '0', width: '100%' }, children: [!isAuthPage && !isDashboardPage && _jsx(Header, {}), _jsx(AppContent, {}), _jsx(Toaster, { position: "top-center" }), _jsx(ScrollToTop, {})] }) }));
};
export default App;
