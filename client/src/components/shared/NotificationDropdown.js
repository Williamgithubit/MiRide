import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { FaBell, FaCheck, FaCheckDouble, FaCar, FaCheckCircle, FaTimesCircle, FaCreditCard, FaKey, FaFlag, FaBullhorn, FaExclamationTriangle, FaWrench, FaStar } from 'react-icons/fa';
import { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '../../store/Notification/notificationApi';
const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: unreadData } = useGetUnreadCountQuery();
    const { data: notificationsData, refetch } = useGetNotificationsQuery({ limit: 10 });
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const unreadCount = unreadData?.unreadCount || 0;
    const notifications = notificationsData?.notifications || [];
    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId).unwrap();
            refetch();
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead().unwrap();
            refetch();
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };
    const getNotificationIcon = (type) => {
        const iconClass = "w-5 h-5";
        switch (type) {
            case 'booking_request':
                return _jsx(FaCar, { className: `${iconClass} text-blue-600` });
            case 'booking_approved':
                return _jsx(FaCheckCircle, { className: `${iconClass} text-green-600` });
            case 'booking_rejected':
                return _jsx(FaTimesCircle, { className: `${iconClass} text-red-600` });
            case 'booking_cancelled':
                return _jsx(FaTimesCircle, { className: `${iconClass} text-orange-600` });
            case 'payment_successful':
            case 'payment_received':
                return _jsx(FaCreditCard, { className: `${iconClass} text-green-600` });
            case 'payment_failed':
                return _jsx(FaCreditCard, { className: `${iconClass} text-red-600` });
            case 'rental_started':
                return _jsx(FaKey, { className: `${iconClass} text-blue-600` });
            case 'rental_completed':
                return _jsx(FaFlag, { className: `${iconClass} text-purple-600` });
            case 'customer_review':
                return _jsx(FaStar, { className: `${iconClass} text-yellow-600` });
            case 'system_alert':
                return _jsx(FaExclamationTriangle, { className: `${iconClass} text-orange-600` });
            case 'maintenance_reminder':
                return _jsx(FaWrench, { className: `${iconClass} text-gray-600` });
            default:
                return _jsx(FaBullhorn, { className: `${iconClass} text-gray-600` });
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'text-red-600 dark:text-red-400';
            case 'high':
                return 'text-orange-600 dark:text-orange-400';
            case 'medium':
                return 'text-blue-600 dark:text-blue-400';
            case 'low':
                return 'text-gray-600 dark:text-gray-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        if (diffInMinutes < 1)
            return 'Just now';
        if (diffInMinutes < 60)
            return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors", children: [_jsx(FaBell, { className: "w-6 h-6" }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center", children: unreadCount > 99 ? '99+' : unreadCount }))] }), isOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setIsOpen(false) }), _jsxs("div", { className: "absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Notifications" }), unreadCount > 0 && (_jsxs("button", { onClick: handleMarkAllAsRead, className: "text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1", children: [_jsx(FaCheckDouble, { className: "w-4 h-4" }), "Mark all read"] }))] }), _jsx("div", { className: "max-h-96 overflow-y-auto", children: notifications.length === 0 ? (_jsx("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400", children: "No notifications yet" })) : (notifications.map((notification) => (_jsx("div", { className: `p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${!notification.isRead
                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} transition-colors`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700", children: getNotificationIcon(notification.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("h4", { className: `text-sm font-medium ${getPriorityColor(notification.priority)}`, children: notification.title }), _jsxs("div", { className: "flex items-center gap-1 ml-2", children: [_jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: formatTimeAgo(notification.createdAt) }), !notification.isRead && (_jsx("button", { onClick: () => handleMarkAsRead(notification.id), className: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300", title: "Mark as read", children: _jsx(FaCheck, { className: "w-3 h-3" }) }))] })] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2", children: notification.message }), !notification.isRead && (_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full mt-2" }))] })] }) }, notification.id)))) }), notifications.length > 0 && (_jsx("div", { className: "p-3 border-t border-gray-200 dark:border-gray-700", children: _jsx("button", { onClick: () => {
                                        setIsOpen(false);
                                        // Navigate to full notifications page if you have one
                                    }, className: "w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-center", children: "View all notifications" }) }))] })] }))] }));
};
export default NotificationDropdown;
