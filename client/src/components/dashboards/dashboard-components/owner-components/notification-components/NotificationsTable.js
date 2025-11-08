import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import { FaEye, FaTrash, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaBell, FaCheck, FaTimes, FaCar, FaUser, FaCalendarAlt, FaDollarSign, FaStar, FaCog } from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
import NotificationStatusBadge from './NotificationStatusBadge';
const NotificationsTable = ({ notifications, loading = false, onMarkAsRead, onMarkAsUnread, onDelete, onViewDetails, updating = {} }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    // Filter and search notifications
    const filteredNotifications = useMemo(() => {
        return notifications.filter(notification => {
            const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.relatedItem?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.type.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || notification.type === typeFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'read' && notification.isRead) ||
                (statusFilter === 'unread' && !notification.isRead);
            const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
            return matchesSearch && matchesType && matchesStatus && matchesPriority;
        });
    }, [notifications, searchTerm, typeFilter, statusFilter, priorityFilter]);
    // Pagination
    const totalPages = Math.ceil(filteredNotifications.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + pageSize);
    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, typeFilter, statusFilter, priorityFilter]);
    const formatTimestamp = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 24) {
            return formatDistanceToNow(date, { addSuffix: true });
        }
        else {
            return format(date, 'MMM d, yyyy');
        }
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking_request': return FaCalendarAlt;
            case 'payment_received': return FaDollarSign;
            case 'booking_approved': return FaCheck;
            case 'booking_cancelled': return FaTimes;
            case 'customer_review': return FaStar;
            case 'system_alert': return FaCog;
            case 'maintenance_reminder': return FaCar;
            default: return FaBell;
        }
    };
    const getRelatedItemIcon = (type) => {
        switch (type) {
            case 'car': return FaCar;
            case 'customer': return FaUser;
            case 'booking': return FaCalendarAlt;
            default: return FaBell;
        }
    };
    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'booking_request', label: 'Booking Requests' },
        { value: 'payment_received', label: 'Payments' },
        { value: 'booking_approved', label: 'Approved Bookings' },
        { value: 'booking_cancelled', label: 'Cancelled Bookings' },
        { value: 'customer_review', label: 'Customer Reviews' },
        { value: 'system_alert', label: 'System Alerts' },
        { value: 'maintenance_reminder', label: 'Maintenance' }
    ];
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'unread', label: 'Unread' },
        { value: 'read', label: 'Read' }
    ];
    const priorityOptions = [
        { value: 'all', label: 'All Priorities' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
    ];
    if (loading) {
        return (_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: _jsx("div", { className: "p-6", children: _jsx("div", { className: "animate-pulse space-y-4", children: [...Array(5)].map((_, index) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" }), _jsx("div", { className: "h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" })] }), _jsx("div", { className: "w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded" })] }, index))) }) }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative w-full", children: [_jsx(FaSearch, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" }), _jsx("input", { type: "text", placeholder: "Search notifications...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 items-start sm:items-center", children: [_jsxs("div", { className: "flex items-center gap-2 text-gray-400 text-sm", children: [_jsx(FaFilter, {}), _jsx("span", { className: "hidden sm:inline", children: "Filters:" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 w-full sm:w-auto", children: [_jsx("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: "w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm", children: typeOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), _jsx("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm", children: statusOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), _jsx("select", { value: priorityFilter, onChange: (e) => setPriorityFilter(e.target.value), className: "w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm", children: priorityOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] })] })] }), _jsxs("div", { className: "mt-4 text-sm text-gray-600 dark:text-gray-400", children: ["Showing ", paginatedNotifications.length, " of ", filteredNotifications.length, " notifications"] })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden", children: paginatedNotifications.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx("div", { className: "mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4", children: _jsx(FaBell, { className: "text-2xl text-gray-400" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No notifications found" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'No notifications available at the moment.' })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden md:block overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[800px]", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6", children: "Type" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-2/6", children: "Message" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6", children: "Related Item" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8", children: "Timestamp" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: paginatedNotifications.map((notification) => {
                                            const IconComponent = getNotificationIcon(notification.type);
                                            const RelatedIcon = getRelatedItemIcon(notification.relatedItem?.type);
                                            return (_jsxs("tr", { className: `hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`, children: [_jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center ${notification.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' :
                                                                        notification.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                                                            notification.priority === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                                                'bg-green-100 dark:bg-green-900/30'}`, children: _jsx(IconComponent, { className: `w-5 h-5 ${notification.priority === 'urgent' ? 'text-red-600 dark:text-red-400' :
                                                                            notification.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                                                                                notification.priority === 'medium' ? 'text-blue-600 dark:text-blue-400' :
                                                                                    'text-green-600 dark:text-green-400'}` }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900 dark:text-white capitalize", children: notification.type.replace('_', ' ') }), _jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400 capitalize", children: [notification.priority, " priority"] })] })] }) }), _jsx("td", { className: "px-4 py-4", children: _jsxs("div", { className: "max-w-xs", children: [_jsx("div", { className: `text-sm font-medium mb-1 ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`, children: notification.title }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400 truncate", children: notification.message })] }) }), _jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: notification.relatedItem ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RelatedIcon, { className: "w-4 h-4 text-gray-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-900 dark:text-white capitalize", children: notification.relatedItem.type }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]", children: notification.relatedItem.name })] })] })) : (_jsx("span", { className: "text-sm text-gray-400", children: "\u2014" })) }), _jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900 dark:text-white", children: formatTimestamp(notification.createdAt) }) }), _jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: _jsx(NotificationStatusBadge, { status: notification.isRead ? 'read' : 'unread', priority: notification.priority, size: "sm" }) }), _jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => onViewDetails(notification), className: "p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors", title: "View Details", children: _jsx(FaEye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => notification.isRead ? onMarkAsUnread(notification.id) : onMarkAsRead(notification.id), disabled: updating[notification.id.toString()], className: `p-2 rounded-lg transition-colors disabled:opacity-50 ${notification.isRead
                                                                        ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                                        : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'}`, title: notification.isRead ? "Mark as Unread" : "Mark as Read", children: notification.isRead ? _jsx(FaTimes, { className: "w-4 h-4" }) : _jsx(FaCheck, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => onDelete(notification.id), disabled: updating[notification.id.toString()], className: "p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50", title: "Delete Notification", children: _jsx(FaTrash, { className: "w-4 h-4" }) })] }) })] }, notification.id));
                                        }) })] }) }), _jsx("div", { className: "md:hidden divide-y divide-gray-200 dark:divide-gray-700", children: paginatedNotifications.map((notification) => {
                                const IconComponent = getNotificationIcon(notification.type);
                                const RelatedIcon = getRelatedItemIcon(notification.relatedItem?.type);
                                return (_jsxs("div", { className: `p-4 space-y-4 ${!notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3 flex-1", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' :
                                                                notification.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                                                    notification.priority === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                                        'bg-green-100 dark:bg-green-900/30'}`, children: _jsx(IconComponent, { className: `w-5 h-5 ${notification.priority === 'urgent' ? 'text-red-600 dark:text-red-400' :
                                                                    notification.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                                                                        notification.priority === 'medium' ? 'text-blue-600 dark:text-blue-400' :
                                                                            'text-green-600 dark:text-green-400'}` }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: `text-sm font-medium mb-1 ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`, children: notification.title }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: notification.message })] })] }), _jsx(NotificationStatusBadge, { status: notification.isRead ? 'read' : 'unread', priority: notification.priority, size: "sm" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-gray-500 dark:text-gray-400", children: "Type" }), _jsx("div", { className: "text-gray-900 dark:text-white capitalize", children: notification.type.replace('_', ' ') })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-500 dark:text-gray-400", children: "Time" }), _jsx("div", { className: "text-gray-900 dark:text-white", children: formatTimestamp(notification.createdAt) })] })] }), notification.relatedItem && (_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(RelatedIcon, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Related:" }), _jsxs("span", { className: "text-gray-900 dark:text-white capitalize", children: [notification.relatedItem.type, " - ", notification.relatedItem.name] })] })), _jsxs("div", { className: "flex items-center justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700", children: [_jsxs("button", { onClick: () => onViewDetails(notification), className: "px-3 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center space-x-1", children: [_jsx(FaEye, { className: "w-4 h-4" }), _jsx("span", { children: "View" })] }), _jsxs("button", { onClick: () => notification.isRead ? onMarkAsUnread(notification.id) : onMarkAsRead(notification.id), disabled: updating[notification.id.toString()], className: `px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1 ${notification.isRead
                                                        ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                        : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'}`, children: [notification.isRead ? _jsx(FaTimes, { className: "w-4 h-4" }) : _jsx(FaCheck, { className: "w-4 h-4" }), _jsx("span", { children: notification.isRead ? 'Unread' : 'Read' })] }), _jsxs("button", { onClick: () => onDelete(notification.id), disabled: updating[notification.id.toString()], className: "px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1", children: [_jsx(FaTrash, { className: "w-4 h-4" }), _jsx("span", { children: "Delete" })] })] })] }, notification.id));
                            }) }), totalPages > 1 && (_jsx("div", { className: "px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-300 order-2 sm:order-1", children: [_jsxs("span", { className: "hidden sm:inline", children: ["Showing ", startIndex + 1, " to ", Math.min(startIndex + pageSize, filteredNotifications.length), " of ", filteredNotifications.length, " results"] }), _jsxs("span", { className: "sm:hidden", children: [startIndex + 1, "-", Math.min(startIndex + pageSize, filteredNotifications.length), " of ", filteredNotifications.length] })] }), _jsxs("div", { className: "flex items-center space-x-2 order-1 sm:order-2", children: [_jsx("button", { onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)), disabled: currentPage === 1, className: "p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed", children: _jsx(FaChevronLeft, { className: "w-4 h-4" }) }), _jsx("div", { className: "flex items-center space-x-1", children: [...Array(totalPages)].map((_, index) => {
                                                    const page = index + 1;
                                                    const isCurrentPage = page === currentPage;
                                                    // Show fewer pages on mobile
                                                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                                                    const showPage = isMobile
                                                        ? (page === 1 || page === totalPages || page === currentPage)
                                                        : (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1);
                                                    if (!showPage && page !== 2 && page !== totalPages - 1) {
                                                        return page === 2 || page === totalPages - 1 ? (_jsx("span", { className: "px-2 text-gray-500 hidden sm:inline", children: "..." }, page)) : null;
                                                    }
                                                    return (_jsx("button", { onClick: () => setCurrentPage(page), className: `px-3 py-1 text-sm rounded-md ${isCurrentPage
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`, children: page }, page));
                                                }) }), _jsx("button", { onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, className: "p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed", children: _jsx(FaChevronRight, { className: "w-4 h-4" }) })] })] }) }))] })) })] }));
};
export default NotificationsTable;
