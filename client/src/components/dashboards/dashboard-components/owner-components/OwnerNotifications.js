import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useGetOwnerNotificationsQuery, useGetOwnerUnreadCountQuery, useMarkOwnerNotificationAsReadMutation, useMarkOwnerNotificationAsUnreadMutation, useMarkAllOwnerNotificationsAsReadMutation, useDeleteOwnerNotificationMutation, useClearAllOwnerNotificationsMutation } from "../../../../store/Notification/ownerNotificationApi";
import NotificationsTable from './notification-components/NotificationsTable';
import { DeleteConfirmationModal, ClearAllConfirmationModal, NotificationDetailsModal } from './notification-components/NotificationActionModals';
import { FaSync, FaCheckDouble, FaTrash, FaBell } from 'react-icons/fa';
export const OwnerNotifications = () => {
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        priority: 'all',
        limit: 10,
        offset: 0,
        search: ''
    });
    const [updating, setUpdating] = useState({});
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showClearAllModal, setShowClearAllModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    // Use RTK Query hooks
    const { data: notificationResponse, isLoading: loading, error: notificationsError, refetch } = useGetOwnerNotificationsQuery(filters);
    const { data: unreadCountData, refetch: refetchUnreadCount } = useGetOwnerUnreadCountQuery();
    const [markAsRead] = useMarkOwnerNotificationAsReadMutation();
    const [markAsUnread] = useMarkOwnerNotificationAsUnreadMutation();
    const [markAllAsRead] = useMarkAllOwnerNotificationsAsReadMutation();
    const [deleteNotification] = useDeleteOwnerNotificationMutation();
    const [clearAllNotifications] = useClearAllOwnerNotificationsMutation();
    const notifications = notificationResponse?.notifications || [];
    const totalNotifications = notificationResponse?.total || 0;
    const unreadCount = unreadCountData?.unreadCount || 0;
    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh)
            return;
        const interval = setInterval(() => {
            refetch();
            refetchUnreadCount();
        }, 30000);
        return () => clearInterval(interval);
    }, [autoRefresh, refetch, refetchUnreadCount]);
    // Handle errors
    useEffect(() => {
        if (notificationsError) {
            console.error("Error fetching notifications:", notificationsError);
            toast.error("Failed to load notifications");
        }
    }, [notificationsError]);
    const handleMarkAsRead = async (notificationId) => {
        try {
            setUpdating(prev => ({ ...prev, [notificationId.toString()]: true }));
            await markAsRead(notificationId).unwrap();
            toast.success("Notification marked as read");
            refetchUnreadCount();
        }
        catch (error) {
            console.error("Error marking notification as read:", error);
            toast.error("Failed to mark notification as read");
        }
        finally {
            setUpdating(prev => ({ ...prev, [notificationId.toString()]: false }));
        }
    };
    const handleMarkAsUnread = async (notificationId) => {
        try {
            setUpdating(prev => ({ ...prev, [notificationId.toString()]: true }));
            await markAsUnread(notificationId).unwrap();
            toast.success("Notification marked as unread");
            refetchUnreadCount();
        }
        catch (error) {
            console.error("Error marking notification as unread:", error);
            toast.error("Failed to mark notification as unread");
        }
        finally {
            setUpdating(prev => ({ ...prev, [notificationId.toString()]: false }));
        }
    };
    const handleMarkAllAsRead = async () => {
        try {
            const result = await markAllAsRead().unwrap();
            toast.success(`${result.updatedCount} notifications marked as read`);
            refetchUnreadCount();
        }
        catch (error) {
            console.error("Error marking all notifications as read:", error);
            toast.error("Failed to mark all notifications as read");
        }
    };
    const handleDelete = (notificationId) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            setSelectedNotification(notification);
            setShowDeleteModal(true);
        }
    };
    const handleViewDetails = (notification) => {
        setSelectedNotification(notification);
        setShowDetailsModal(true);
        // Mark as read if it's unread
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
    };
    const confirmDelete = async () => {
        if (!selectedNotification)
            return;
        try {
            setUpdating(prev => ({ ...prev, [selectedNotification.id.toString()]: true }));
            await deleteNotification(selectedNotification.id).unwrap();
            toast.success("Notification deleted successfully");
            setShowDeleteModal(false);
            setSelectedNotification(null);
            refetchUnreadCount();
        }
        catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Failed to delete notification");
        }
        finally {
            setUpdating(prev => ({ ...prev, [selectedNotification.id.toString()]: false }));
        }
    };
    const handleClearAll = () => {
        if (totalNotifications > 0) {
            setShowClearAllModal(true);
        }
    };
    const confirmClearAll = async () => {
        try {
            const result = await clearAllNotifications().unwrap();
            toast.success(`${result.deletedCount} notifications cleared`);
            setShowClearAllModal(false);
            refetchUnreadCount();
        }
        catch (error) {
            console.error("Error clearing all notifications:", error);
            toast.error("Failed to clear all notifications");
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight text-gray-900 dark:text-white", children: "Notifications" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: "Manage your notifications and stay updated on important events" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [unreadCount > 0 && (_jsxs("div", { className: "flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg", children: [_jsx(FaBell, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm font-medium", children: [unreadCount, " unread"] })] })), _jsxs("button", { onClick: () => setAutoRefresh(!autoRefresh), className: `px-3 py-2 text-sm rounded-lg transition-colors ${autoRefresh
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`, title: autoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled", children: [_jsx("span", { className: "hidden sm:inline", children: "Auto-refresh" }), _jsx("span", { className: "sm:hidden", children: "Auto" }), _jsx("span", { className: "ml-1", children: autoRefresh ? 'ON' : 'OFF' })] }), _jsxs("button", { onClick: handleMarkAllAsRead, disabled: unreadCount === 0, className: "px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2", children: [_jsx(FaCheckDouble, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "Mark All Read" }), _jsx("span", { className: "sm:hidden", children: "Read All" })] }), _jsxs("button", { onClick: handleClearAll, disabled: totalNotifications === 0, className: "px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center space-x-2", children: [_jsx(FaTrash, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "Clear All" }), _jsx("span", { className: "sm:hidden", children: "Clear" })] }), _jsxs("button", { onClick: () => {
                                    refetch();
                                    refetchUnreadCount();
                                }, disabled: loading, className: "px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2", children: [_jsx(FaSync, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), _jsx("span", { className: "hidden sm:inline", children: loading ? "Refreshing..." : "Refresh" }), _jsx("span", { className: "sm:hidden", children: "\u21BB" })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center", children: _jsx(FaBell, { className: "w-4 h-4 text-blue-600 dark:text-blue-400" }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Total Notifications" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: totalNotifications })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center", children: _jsx(FaBell, { className: "w-4 h-4 text-orange-600 dark:text-orange-400" }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Unread" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: unreadCount })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center", children: _jsx(FaCheckDouble, { className: "w-4 h-4 text-green-600 dark:text-green-400" }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Read" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: totalNotifications - unreadCount })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center", children: _jsx(FaBell, { className: "w-4 h-4 text-red-600 dark:text-red-400" }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "High Priority" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length })] })] }) })] }), _jsx(NotificationsTable, { notifications: notifications, loading: loading, onMarkAsRead: handleMarkAsRead, onMarkAsUnread: handleMarkAsUnread, onDelete: handleDelete, onViewDetails: handleViewDetails, updating: updating }), _jsx(DeleteConfirmationModal, { isOpen: showDeleteModal, onClose: () => {
                    setShowDeleteModal(false);
                    setSelectedNotification(null);
                }, onConfirm: confirmDelete, notification: selectedNotification, loading: updating[selectedNotification?.id.toString() || ''] }), _jsx(ClearAllConfirmationModal, { isOpen: showClearAllModal, onClose: () => setShowClearAllModal(false), onConfirm: confirmClearAll, notificationCount: totalNotifications, loading: false }), _jsx(NotificationDetailsModal, { isOpen: showDetailsModal, onClose: () => {
                    setShowDetailsModal(false);
                    setSelectedNotification(null);
                }, notification: selectedNotification })] }));
};
