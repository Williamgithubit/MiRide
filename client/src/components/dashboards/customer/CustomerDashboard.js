import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import TopNavbar from '../shared/TopNavbar';
import CustomerOverview from '../dashboard-components/customer-components/CustomerOverview';
import BrowseCars from '../dashboard-components/customer-components/BrowseCars';
import CustomerBookings from '../dashboard-components/customer-components/CustomerBookings';
import CustomerPayments from '../dashboard-components/customer-components/CustomerPayments';
import CustomerProfile from '../dashboard-components/customer-components/CustomerProfile';
import BookingStatus from '../dashboard-components/customer-components/BookingStatus';
import MyReviews from '../dashboard-components/customer-components/MyReviews';
import Notifications from '../dashboard-components/customer-components/Notifications';
import AuthErrorMessage from '../dashboard-components/customer-components/AuthErrorMessage';
import { useCustomerData } from '../dashboard-components/customer-components/useCustomerData';
import useReduxAuth from '../../../store/hooks/useReduxAuth';
const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [selectedCar, setSelectedCar] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout } = useReduxAuth();
    const { isLoading, statsError, customerError, hasValidUserId, isAuthenticated } = useCustomerData();
    // Handle authentication errors
    const handleLogin = () => {
        navigate('/login');
    };
    const handleRetry = () => {
        // Clear any cached data and reload
        logout();
        navigate('/login');
    };
    // Loading state
    if (isLoading) {
        return (_jsxs("div", { className: "flex h-screen bg-gray-100 dark:bg-gray-900", children: [_jsx(Sidebar, { role: "customer", activeSection: activeSection, onSectionChange: setActiveSection, isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) }), _jsxs("div", { className: "flex-1 flex flex-col w-full md:ml-64", children: [_jsx(TopNavbar, { title: "Customer Dashboard", onMenuClick: () => setIsSidebarOpen(!isSidebarOpen) }), _jsx("main", { className: "flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 w-full", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" }) }) })] })] }));
    }
    // Authentication/Error state - show error message if there are auth issues
    if (!isAuthenticated || !hasValidUserId) {
        return (_jsxs("div", { className: "flex h-screen bg-gray-100 dark:bg-gray-900", children: [_jsx(Sidebar, { role: "customer", activeSection: activeSection, onSectionChange: setActiveSection, isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) }), _jsxs("div", { className: "flex-1 flex flex-col w-full md:ml-64", children: [_jsx(TopNavbar, { title: "Customer Dashboard", onMenuClick: () => setIsSidebarOpen(!isSidebarOpen) }), _jsx("main", { className: "flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 w-full", children: _jsx(AuthErrorMessage, { hasValidUserId: hasValidUserId, isAuthenticated: isAuthenticated, customerError: customerError || statsError, onRetry: handleRetry, onLogin: handleLogin }) })] })] }));
    }
    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return _jsx(CustomerOverview, { onSectionChange: setActiveSection });
            case 'browse-cars':
                return (_jsx(BrowseCars, { selectedCar: selectedCar, setSelectedCar: setSelectedCar, showBookingModal: showBookingModal, setShowBookingModal: setShowBookingModal }));
            case 'bookings':
                return _jsx(CustomerBookings, {});
            case 'booking-status':
                return _jsx(BookingStatus, {});
            case 'payments':
                return _jsx(CustomerPayments, {});
            case 'reviews':
                return _jsx(MyReviews, {});
            case 'notifications':
                return _jsx(Notifications, {});
            case 'profile':
                return _jsx(CustomerProfile, {});
            default:
                return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Select a section from the sidebar." }) }));
        }
    };
    return (_jsxs("div", { className: "flex h-screen bg-gray-100 dark:bg-gray-900", children: [_jsx(Sidebar, { role: "customer", activeSection: activeSection, onSectionChange: setActiveSection, isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) }), _jsxs("div", { className: "flex-1 flex flex-col w-full md:ml-64", children: [_jsx(TopNavbar, { title: "Customer Dashboard", onMenuClick: () => setIsSidebarOpen(!isSidebarOpen) }), _jsx("main", { className: "flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 w-full", children: renderContent() })] })] }));
};
export default CustomerDashboard;
