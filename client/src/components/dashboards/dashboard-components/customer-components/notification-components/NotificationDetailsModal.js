import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaTimes, FaCheck } from 'react-icons/fa';
const NotificationDetailsModal = ({ isOpen, onClose, notification }) => {
    if (!isOpen || !notification)
        return null;
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 dark:text-red-400';
            case 'high': return 'text-orange-600 dark:text-orange-400';
            case 'medium': return 'text-blue-600 dark:text-blue-400';
            case 'low': return 'text-green-600 dark:text-green-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };
    // Helper function to render additional data in a readable format
    const renderAdditionalData = (data) => {
        if (!data)
            return null;
        // If it's already a string, return it
        if (typeof data === 'string') {
            return _jsx("p", { className: "text-sm text-gray-900 dark:text-white", children: data });
        }
        // If it's an object, render it in a user-friendly way
        if (typeof data === 'object') {
            return (_jsx("div", { className: "space-y-2", children: Object.entries(data).map(([key, value]) => (_jsxs("div", { children: [_jsxs("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 capitalize", children: [key.replace(/_/g, ' '), ":", ' '] }), _jsx("span", { className: "text-sm text-gray-900 dark:text-white", children: typeof value === 'object' ? JSON.stringify(value) : String(value) })] }, key))) }));
        }
        return _jsx("p", { className: "text-sm text-gray-900 dark:text-white", children: String(data) });
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "Notification Details" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors", children: _jsx(FaTimes, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: notification.title }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: notification.message })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Type" }), _jsx("div", { className: "mt-1 text-sm text-gray-900 dark:text-white capitalize", children: notification.type.replace(/_/g, ' ') })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Priority" }), _jsx("div", { className: `mt-1 text-sm font-medium capitalize ${getPriorityColor(notification.priority)}`, children: notification.priority })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Status" }), _jsx("div", { className: "mt-1 text-sm text-gray-900 dark:text-white", children: notification.isRead ? 'Read' : 'Unread' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Created" }), _jsx("div", { className: "mt-1 text-sm text-gray-900 dark:text-white", children: formatDate(notification.createdAt) })] })] }), notification.data && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block", children: "Additional Information" }), _jsx("div", { className: "bg-gray-50 dark:bg-gray-700 rounded-lg p-4", children: renderAdditionalData(notification.data) })] }))] }), _jsx("div", { className: "flex items-center justify-end mt-8", children: _jsxs("button", { onClick: onClose, className: "px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2", children: [_jsx(FaCheck, { className: "w-4 h-4" }), _jsx("span", { children: "Close" })] }) })] }) }) }));
};
export default NotificationDetailsModal;
