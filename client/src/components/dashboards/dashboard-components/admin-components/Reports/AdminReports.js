import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, setFilters, resetFilters, selectActiveTab, selectReportFilters, selectReportStatus, selectReportError, fetchUserReport, fetchCarReport, fetchBookingReport, fetchRevenueReport, fetchActivityLogs, } from '../../../../../store/Admin/adminReportsSlice';
import { FaUsers, FaCar, FaCalendarAlt, FaMoneyBillWave, FaHistory, FaFilter, FaSync } from 'react-icons/fa';
import UserReports from './UserReports';
import CarReports from './CarReports';
import BookingReports from './BookingReports';
import RevenueReports from './RevenueReports';
import ActivityLogs from './ActivityLogs';
import ReportFilters from './ReportFilters';
const AdminReports = () => {
    const dispatch = useDispatch();
    const activeTab = useSelector(selectActiveTab);
    const filters = useSelector(selectReportFilters);
    const status = useSelector(selectReportStatus);
    const error = useSelector(selectReportError);
    const [showFilters, setShowFilters] = useState(false);
    const tabs = [
        { id: 'users', label: 'User Reports', icon: _jsx(FaUsers, {}) },
        { id: 'cars', label: 'Car Listings', icon: _jsx(FaCar, {}) },
        { id: 'bookings', label: 'Bookings', icon: _jsx(FaCalendarAlt, {}) },
        { id: 'revenue', label: 'Revenue & Payments', icon: _jsx(FaMoneyBillWave, {}) },
        { id: 'activity', label: 'Activity Logs', icon: _jsx(FaHistory, {}) },
    ];
    useEffect(() => {
        // Fetch initial data based on active tab
        handleGenerateReport();
    }, [activeTab]);
    const handleGenerateReport = () => {
        switch (activeTab) {
            case 'users':
                dispatch(fetchUserReport(filters));
                break;
            case 'cars':
                dispatch(fetchCarReport(filters));
                break;
            case 'bookings':
                dispatch(fetchBookingReport(filters));
                break;
            case 'revenue':
                dispatch(fetchRevenueReport(filters));
                break;
            case 'activity':
                dispatch(fetchActivityLogs(filters));
                break;
        }
    };
    const handleTabChange = (tabId) => {
        dispatch(setActiveTab(tabId));
    };
    const handleFilterChange = (newFilters) => {
        dispatch(setFilters(newFilters));
    };
    const handleResetFilters = () => {
        dispatch(resetFilters());
    };
    const renderContent = () => {
        if (status === 'loading') {
            return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Loading report data..." })] }) }));
        }
        if (error) {
            return (_jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center", children: [_jsx("p", { className: "text-red-600 dark:text-red-400 mb-4", children: error }), _jsx("button", { onClick: handleGenerateReport, className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: "Retry" })] }));
        }
        switch (activeTab) {
            case 'users':
                return _jsx(UserReports, {});
            case 'cars':
                return _jsx(CarReports, {});
            case 'bookings':
                return _jsx(BookingReports, {});
            case 'revenue':
                return _jsx(RevenueReports, {});
            case 'activity':
                return _jsx(ActivityLogs, {});
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2", children: "Reports & Analytics" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Generate and export comprehensive system reports" })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("button", { onClick: () => setShowFilters(!showFilters), className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`, children: [_jsx(FaFilter, {}), _jsx("span", { children: "Filters" })] }), _jsxs("button", { onClick: handleGenerateReport, disabled: status === 'loading', className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(FaSync, { className: status === 'loading' ? 'animate-spin' : '' }), _jsx("span", { children: "Generate Report" })] })] })] }), showFilters && (_jsx("div", { className: "mt-6 pt-6 border-t border-gray-200 dark:border-gray-700", children: _jsx(ReportFilters, { filters: filters, onFilterChange: handleFilterChange, onReset: handleResetFilters, onApply: handleGenerateReport }) }))] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden", children: [_jsx("div", { className: "border-b border-gray-200 dark:border-gray-700", children: _jsx("div", { className: "flex overflow-x-auto", children: tabs.map((tab) => (_jsxs("button", { onClick: () => handleTabChange(tab.id), className: `flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`, children: [_jsx("span", { className: "text-lg", children: tab.icon }), _jsx("span", { children: tab.label })] }, tab.id))) }) }), _jsx("div", { className: "p-6", children: renderContent() })] })] }));
};
export default AdminReports;
