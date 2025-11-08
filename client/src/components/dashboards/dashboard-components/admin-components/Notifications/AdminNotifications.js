import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminNotifications, setFilter, setPage, clearFilters, selectAll as selectAllNotificationsAction, clearSelection, bulkDeleteNotifications, clearAllNotifications, selectCurrentPageNotifications, selectNotificationFilters, selectNotificationPagination, selectSelectedNotifications, selectNotificationStatus, selectUnreadCount, } from '../../../../../store/Admin/adminNotificationsSlice';
import NotificationsTable from './NotificationsTable';
import SendNotificationModal from './SendNotificationModal';
import { FaPlus, FaSearch, FaFilter, FaTrash, FaBell, FaSync, FaCheckDouble, } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
const AdminNotifications = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(selectCurrentPageNotifications);
    const filters = useSelector(selectNotificationFilters);
    const pagination = useSelector(selectNotificationPagination);
    const selectedNotifications = useSelector(selectSelectedNotifications);
    const status = useSelector(selectNotificationStatus);
    const unreadCount = useSelector(selectUnreadCount);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    useEffect(() => {
        dispatch(fetchAdminNotifications());
    }, [dispatch]);
    const handleSearch = (e) => {
        dispatch(setFilter({ search: e.target.value }));
    };
    const handleFilterChange = (filterName, value) => {
        dispatch(setFilter({ [filterName]: value }));
    };
    const handleClearFilters = () => {
        dispatch(clearFilters());
    };
    const handleRefresh = () => {
        dispatch(fetchAdminNotifications());
        toast.success('Notifications refreshed');
    };
    const handleSelectAll = () => {
        dispatch(selectAllNotificationsAction());
    };
    const handleClearSelection = () => {
        dispatch(clearSelection());
    };
    const handleBulkDelete = async () => {
        if (selectedNotifications.length === 0) {
            toast.error('No notifications selected');
            return;
        }
        if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) {
            try {
                await dispatch(bulkDeleteNotifications(selectedNotifications)).unwrap();
                toast.success('Notifications deleted successfully');
            }
            catch (error) {
                toast.error('Failed to delete notifications');
            }
        }
    };
    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to clear ALL notifications? This action cannot be undone.')) {
            try {
                await dispatch(clearAllNotifications()).unwrap();
                toast.success('All notifications cleared');
            }
            catch (error) {
                toast.error('Failed to clear notifications');
            }
        }
    };
    const handlePageChange = (page) => {
        dispatch(setPage(page));
    };
    const renderPagination = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(_jsx("button", { onClick: () => handlePageChange(i), className: `px-3 py-1 rounded-md ${pagination.currentPage === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`, children: i }, i));
        }
        return pages;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center", children: [_jsx(FaBell, { className: "mr-2 sm:mr-3 text-blue-600" }), "Notifications Management"] }), _jsx("p", { className: "mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400", children: "Manage and send platform-wide notifications" })] }), _jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsxs("button", { onClick: handleRefresh, className: "flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center space-x-2 text-sm", disabled: status === 'loading', children: [_jsx(FaSync, { className: status === 'loading' ? 'animate-spin' : '' }), _jsx("span", { className: "hidden sm:inline", children: "Refresh" })] }), _jsxs("button", { onClick: () => setIsSendModalOpen(true), className: "flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm", children: [_jsx(FaPlus, {}), _jsx("span", { children: "Send" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400", children: "Total Notifications" }), _jsx("p", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white", children: pagination.totalCount })] }), _jsx("div", { className: "p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full", children: _jsx(FaBell, { className: "text-blue-600 dark:text-blue-400 text-lg sm:text-xl" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400", children: "Unread Notifications" }), _jsx("p", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white", children: unreadCount })] }), _jsx("div", { className: "p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full", children: _jsx(FaBell, { className: "text-yellow-600 dark:text-yellow-400 text-lg sm:text-xl" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400", children: "Selected" }), _jsx("p", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white", children: selectedNotifications.length })] }), _jsx("div", { className: "p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full", children: _jsx(FaCheckDouble, { className: "text-green-600 dark:text-green-400 text-lg sm:text-xl" }) })] }) })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [_jsxs("div", { className: "relative flex-1 sm:max-w-md", children: [_jsx(FaSearch, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" }), _jsx("input", { type: "text", placeholder: "Search...", value: filters.search, onChange: handleSearch, className: "w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" })] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center space-x-2 text-sm whitespace-nowrap", children: [_jsx(FaFilter, {}), _jsx("span", { className: "hidden sm:inline", children: showFilters ? 'Hide Filters' : 'Show Filters' }), _jsx("span", { className: "sm:hidden", children: "Filters" })] })] }), showFilters && (_jsxs("div", { className: "mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Type" }), _jsxs("select", { value: filters.type, onChange: (e) => handleFilterChange('type', e.target.value), className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "System", children: "System" }), _jsx("option", { value: "Booking", children: "Booking" }), _jsx("option", { value: "Payment", children: "Payment" }), _jsx("option", { value: "Review", children: "Review" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Recipient" }), _jsxs("select", { value: filters.recipient, onChange: (e) => handleFilterChange('recipient', e.target.value), className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white", children: [_jsx("option", { value: "all", children: "All Recipients" }), _jsx("option", { value: "All", children: "All Users" }), _jsx("option", { value: "Owner", children: "Owners" }), _jsx("option", { value: "Customer", children: "Customers" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Status" }), _jsxs("select", { value: filters.status, onChange: (e) => handleFilterChange('status', e.target.value), className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "Read", children: "Read" }), _jsx("option", { value: "Unread", children: "Unread" })] })] }), _jsx("div", { className: "flex items-end sm:col-span-2 lg:col-span-1", children: _jsx("button", { onClick: handleClearFilters, className: "w-full px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600", children: "Clear Filters" }) })] }))] }), selectedNotifications.length > 0 && (_jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [_jsxs("p", { className: "text-xs sm:text-sm text-blue-800 dark:text-blue-200", children: [selectedNotifications.length, " selected"] }), _jsxs("div", { className: "flex items-center gap-2 sm:gap-3 flex-wrap", children: [_jsx("button", { onClick: handleClearSelection, className: "px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300", children: "Clear" }), _jsx("button", { onClick: handleSelectAll, className: "px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300", children: "Select All" }), _jsxs("button", { onClick: handleBulkDelete, className: "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-1 sm:space-x-2", children: [_jsx(FaTrash, { className: "text-xs" }), _jsx("span", { children: "Delete" })] })] })] }) })), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden", children: status === 'loading' ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) })) : (_jsx(NotificationsTable, { notifications: notifications, selectedNotifications: selectedNotifications })) }), pagination.totalPages > 1 && (_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3", children: [_jsxs("p", { className: "text-xs sm:text-sm text-gray-600 dark:text-gray-400", children: ["Page ", pagination.currentPage, " of ", pagination.totalPages] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2 flex-wrap justify-center", children: [_jsx("button", { onClick: () => handlePageChange(pagination.currentPage - 1), disabled: pagination.currentPage === 1, className: "px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed", children: "Prev" }), _jsx("div", { className: "hidden sm:flex items-center gap-1 sm:gap-2", children: renderPagination() }), _jsx("button", { onClick: () => handlePageChange(pagination.currentPage + 1), disabled: pagination.currentPage === pagination.totalPages, className: "px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed", children: "Next" })] })] })), _jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4", children: [_jsx("h3", { className: "text-base sm:text-lg font-semibold text-red-800 dark:text-red-200 mb-2", children: "Danger Zone" }), _jsx("p", { className: "text-xs sm:text-sm text-red-700 dark:text-red-300 mb-3", children: "Clear all notifications from the system. This action cannot be undone." }), _jsxs("button", { onClick: handleClearAll, className: "px-3 sm:px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2", children: [_jsx(FaTrash, {}), _jsx("span", { children: "Clear All Notifications" })] })] }), _jsx(SendNotificationModal, { isOpen: isSendModalOpen, onClose: () => setIsSendModalOpen(false) })] }));
};
export default AdminNotifications;
