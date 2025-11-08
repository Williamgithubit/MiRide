import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useDispatch } from 'react-redux';
import { markNotificationAsRead, markNotificationAsUnread, deleteNotification, toggleNotificationSelection, } from '../../../../../store/Admin/adminNotificationsSlice';
import { FaCheck, FaEnvelope, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
const NotificationsTable = ({ notifications, selectedNotifications, }) => {
    const dispatch = useDispatch();
    const handleMarkAsRead = async (id) => {
        try {
            await dispatch(markNotificationAsRead(id)).unwrap();
            toast.success('Notification marked as read');
        }
        catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };
    const handleMarkAsUnread = async (id) => {
        try {
            await dispatch(markNotificationAsUnread(id)).unwrap();
            toast.success('Notification marked as unread');
        }
        catch (error) {
            toast.error('Failed to mark notification as unread');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await dispatch(deleteNotification(id)).unwrap();
                toast.success('Notification deleted');
            }
            catch (error) {
                toast.error('Failed to delete notification');
            }
        }
    };
    const handleToggleSelection = (id) => {
        dispatch(toggleNotificationSelection(id));
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'System':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Booking':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Payment':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Review':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    const getRecipientColor = (recipient) => {
        switch (recipient) {
            case 'All':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
            case 'Owner':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'Customer':
                return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };
    if (notifications.length === 0) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(FaEnvelope, { className: "mx-auto text-gray-400 text-4xl sm:text-5xl mb-4" }), _jsx("p", { className: "text-sm sm:text-base text-gray-500 dark:text-gray-400", children: "No notifications found" })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden lg:block overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-800", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: _jsx("input", { type: "checkbox", className: "rounded border-gray-300 dark:border-gray-600", onChange: (e) => {
                                                // This will be handled by the parent component
                                            } }) }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Title" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Message" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Recipient" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Type" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Timestamp" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700", children: notifications.map((notification) => (_jsxs("tr", { className: `hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${notification.status === 'Unread' ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`, children: [_jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: _jsx("input", { type: "checkbox", checked: selectedNotifications.includes(notification.id), onChange: () => handleToggleSelection(notification.id), className: "rounded border-gray-300 dark:border-gray-600" }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center", children: [notification.status === 'Unread' && (_jsx("span", { className: "w-2 h-2 bg-blue-500 rounded-full mr-2" })), _jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: notification.title })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 line-clamp-2 max-w-md", children: notification.message }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRecipientColor(notification.recipient)}`, children: notification.recipient }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(notification.type)}`, children: notification.type }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.status === 'Unread'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`, children: notification.status }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: formatDate(notification.createdAt) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsxs("div", { className: "flex items-center justify-end space-x-2", children: [notification.link && (_jsx("button", { onClick: () => window.open(notification.link, '_blank'), className: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300", title: "Open link", children: _jsx(FaExternalLinkAlt, {}) })), notification.status === 'Unread' ? (_jsx("button", { onClick: () => handleMarkAsRead(notification.id), className: "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300", title: "Mark as read", children: _jsx(FaCheck, {}) })) : (_jsx("button", { onClick: () => handleMarkAsUnread(notification.id), className: "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300", title: "Mark as unread", children: _jsx(FaEnvelope, {}) })), _jsx("button", { onClick: () => handleDelete(notification.id), className: "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300", title: "Delete", children: _jsx(FaTrash, {}) })] }) })] }, notification.id))) })] }) }), _jsx("div", { className: "lg:hidden divide-y divide-gray-200 dark:divide-gray-700", children: notifications.map((notification) => (_jsxs("div", { className: `p-4 ${notification.status === 'Unread' ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-900'}`, children: [_jsx("div", { className: "flex items-start justify-between mb-3", children: _jsxs("div", { className: "flex items-start space-x-2 flex-1", children: [_jsx("input", { type: "checkbox", checked: selectedNotifications.includes(notification.id), onChange: () => handleToggleSelection(notification.id), className: "mt-1 rounded border-gray-300 dark:border-gray-600" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [notification.status === 'Unread' && (_jsx("span", { className: "w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" })), _jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white truncate", children: notification.title })] }), _jsx("p", { className: "text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2", children: notification.message })] })] }) }), _jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [_jsx("span", { className: `px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRecipientColor(notification.recipient)}`, children: notification.recipient }), _jsx("span", { className: `px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(notification.type)}`, children: notification.type }), _jsx("span", { className: `px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.status === 'Unread'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`, children: notification.status })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: formatDate(notification.createdAt) }), _jsxs("div", { className: "flex items-center space-x-3", children: [notification.link && (_jsx("button", { onClick: () => window.open(notification.link, '_blank'), className: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300", title: "Open link", children: _jsx(FaExternalLinkAlt, { className: "text-sm" }) })), notification.status === 'Unread' ? (_jsx("button", { onClick: () => handleMarkAsRead(notification.id), className: "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300", title: "Mark as read", children: _jsx(FaCheck, { className: "text-sm" }) })) : (_jsx("button", { onClick: () => handleMarkAsUnread(notification.id), className: "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300", title: "Mark as unread", children: _jsx(FaEnvelope, { className: "text-sm" }) })), _jsx("button", { onClick: () => handleDelete(notification.id), className: "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300", title: "Delete", children: _jsx(FaTrash, { className: "text-sm" }) })] })] })] }, notification.id))) })] }));
};
export default NotificationsTable;
