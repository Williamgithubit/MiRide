import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { FaBell, FaFilter, FaSearch, FaCheckDouble, FaTrash, FaSyncAlt, FaChevronLeft, FaChevronRight, FaInbox } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation, useClearAllNotificationsMutation } from '../../../../store/Notification/notificationApi';
import NotificationCard from './notification-components/NotificationCard';
import ConfirmationModal from './notification-components/ConfirmationModal';
import NotificationDetailsModal from './notification-components/NotificationDetailsModal';
const Notifications = () => {
    // State management
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showClearAllModal, setShowClearAllModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedNotificationId, setSelectedNotificationId] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isClearing, setIsClearing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 10;
    const offset = (currentPage - 1) * itemsPerPage;
    // API hooks
    const { data: notificationsData, isLoading, error, refetch } = useGetNotificationsQuery({
        limit: itemsPerPage,
        offset,
        unreadOnly: statusFilter === 'unread'
    });
    const { data: unreadCountData } = useGetUnreadCountQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    const [clearAllNotifications] = useClearAllNotificationsMutation();
    // Real-time polling (every 30 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 30000);
        return () => clearInterval(interval);
    }, [refetch]);
    // Filter notifications
    const filteredNotifications = useMemo(() => {
        if (!notificationsData?.notifications)
            return [];
        return notificationsData.notifications.filter(notification => {
            const matchesSearch = searchTerm === '' ||
                notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.message.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || notification.type === typeFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'read' && notification.isRead) ||
                (statusFilter === 'unread' && !notification.isRead);
            const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
            return matchesSearch && matchesType && matchesStatus && matchesPriority;
        });
    }, [notificationsData?.notifications, searchTerm, typeFilter, statusFilter, priorityFilter]);
    // Pagination
    const totalPages = Math.ceil((notificationsData?.total || 0) / itemsPerPage);
    // Handlers
    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id).unwrap();
            toast.success('Notification updated');
        }
        catch (error) {
            toast.error('Failed to update notification');
        }
    };
    const handleDelete = (id) => {
        setSelectedNotificationId(id);
        setShowDeleteModal(true);
    };
    const confirmDelete = async () => {
        if (!selectedNotificationId)
            return;
        setIsDeleting(true);
        try {
            await deleteNotification(selectedNotificationId).unwrap();
            toast.success('Notification deleted');
            setShowDeleteModal(false);
            setSelectedNotificationId(null);
        }
        catch (error) {
            toast.error('Failed to delete notification');
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleMarkAllAsRead = async () => {
        try {
            const result = await markAllAsRead().unwrap();
            toast.success(`Marked ${result.updatedCount} notifications as read`);
        }
        catch (error) {
            toast.error('Failed to mark all as read');
        }
    };
    const handleClearAll = () => {
        setShowClearAllModal(true);
    };
    const confirmClearAll = async () => {
        setIsClearing(true);
        try {
            const result = await clearAllNotifications().unwrap();
            toast.success(`Deleted ${result.deletedCount} notifications`);
            setCurrentPage(1);
            setShowClearAllModal(false);
        }
        catch (error) {
            toast.error('Failed to clear notifications');
        }
        finally {
            setIsClearing(false);
        }
    };
    const handleRefresh = () => {
        refetch();
        toast.info('Notifications refreshed');
    };
    const handleView = async (notification) => {
        setSelectedNotification(notification);
        setShowDetailsModal(true);
        // Mark as read when viewing
        if (!notification.isRead) {
            try {
                await markAsRead(notification.id).unwrap();
            }
            catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
    };
    // Notification type options
    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'booking_approved', label: 'Booking Approved' },
        { value: 'booking_rejected', label: 'Booking Rejected' },
        { value: 'booking_cancelled', label: 'Booking Cancelled' },
        { value: 'payment_successful', label: 'Payment Successful' },
        { value: 'payment_failed', label: 'Payment Failed' },
        { value: 'rental_started', label: 'Rental Started' },
        { value: 'rental_completed', label: 'Rental Completed' },
        { value: 'system_alert', label: 'System Alert' },
        { value: 'maintenance_reminder', label: 'Maintenance Reminder' },
    ];
    const priorityOptions = [
        { value: 'all', label: 'All Priorities' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
    ];
    if (error) {
        return (_jsx("div", { className: "p-6", children: _jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FaBell, { className: "w-5 h-5 text-red-500 mr-2" }), _jsx("span", { className: "text-red-700 dark:text-red-400", children: "Failed to load notifications. Please try again." })] }) }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FaBell, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Notifications" }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [unreadCountData?.unreadCount || 0, " unread notifications"] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("button", { onClick: handleRefresh, className: "px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2", children: [_jsx(FaSyncAlt, { className: "w-4 h-4" }), _jsx("span", { children: "Refresh" })] }), _jsxs("button", { onClick: handleMarkAllAsRead, className: "px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center space-x-2", children: [_jsx(FaCheckDouble, { className: "w-4 h-4" }), _jsx("span", { children: "Mark All Read" })] }), _jsxs("button", { onClick: handleClearAll, className: "px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-2", children: [_jsx(FaTrash, { className: "w-4 h-4" }), _jsx("span", { children: "Clear All" })] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(FaSearch, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", placeholder: "Search notifications...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors", children: [_jsx(FaFilter, { className: "w-4 h-4" }), _jsx("span", { children: "Filters" })] }), (typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') && (_jsx("button", { onClick: () => {
                                    setTypeFilter('all');
                                    setStatusFilter('all');
                                    setPriorityFilter('all');
                                }, className: "text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300", children: "Clear Filters" }))] }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Type" }), _jsx("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: typeOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Status" }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "unread", children: "Unread" }), _jsx("option", { value: "read", children: "Read" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Priority" }), _jsx("select", { value: priorityFilter, onChange: (e) => setPriorityFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: priorityOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] })] }))] }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: isLoading ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: "Loading notifications..." })] })) : filteredNotifications.length === 0 ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx(FaInbox, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No notifications found" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'You\'re all caught up! No new notifications.' })] })) : (_jsx("div", { className: "p-4", children: filteredNotifications.map((notification) => (_jsx(NotificationCard, { notification: notification, onMarkAsRead: handleMarkAsRead, onDelete: handleDelete, onView: handleView }, notification.id))) })) }), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3", children: [_jsx("div", { className: "flex items-center space-x-2", children: _jsxs("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: ["Showing ", offset + 1, " to ", Math.min(offset + itemsPerPage, notificationsData?.total || 0), " of ", notificationsData?.total || 0, " notifications"] }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("button", { onClick: () => setCurrentPage(currentPage - 1), disabled: currentPage === 1, className: "px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1", children: [_jsx(FaChevronLeft, { className: "w-3 h-3" }), _jsx("span", { children: "Previous" })] }), _jsxs("span", { className: "px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300", children: ["Page ", currentPage, " of ", totalPages] }), _jsxs("button", { onClick: () => setCurrentPage(currentPage + 1), disabled: currentPage === totalPages, className: "px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1", children: [_jsx("span", { children: "Next" }), _jsx(FaChevronRight, { className: "w-3 h-3" })] })] })] })), _jsx(ConfirmationModal, { isOpen: showClearAllModal, onClose: () => setShowClearAllModal(false), onConfirm: confirmClearAll, title: "Clear All Notifications", message: "Are you sure you want to delete all notifications? This action cannot be undone and will permanently remove all your notifications.", confirmText: "Clear All", cancelText: "Cancel", type: "danger", isLoading: isClearing }), _jsx(ConfirmationModal, { isOpen: showDeleteModal, onClose: () => {
                    setShowDeleteModal(false);
                    setSelectedNotificationId(null);
                }, onConfirm: confirmDelete, title: "Delete Notification", message: "Are you sure you want to delete this notification? This action cannot be undone.", confirmText: "Delete", cancelText: "Cancel", type: "danger", isLoading: isDeleting }), _jsx(NotificationDetailsModal, { isOpen: showDetailsModal, onClose: () => {
                    setShowDetailsModal(false);
                    setSelectedNotification(null);
                }, notification: selectedNotification })] }));
};
export default Notifications;
