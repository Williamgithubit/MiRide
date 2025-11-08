import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectActivityLogs, selectReportStatus } from '../../../../../store/Admin/adminReportsSlice';
import { FaHistory, FaUser, FaSearch, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { exportToCSV, exportToPDF, formatDateTime } from '../../../../../utils/exportUtils';
const ActivityLogs = () => {
    const logs = useSelector(selectActivityLogs);
    const status = useSelector(selectReportStatus);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const filteredLogs = logs.filter((log) => {
        const matchesSearch = searchTerm === '' ||
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;
        return matchesSearch && matchesRole;
    });
    const handleExportCSV = () => {
        const data = filteredLogs.map((log) => ({
            Timestamp: formatDateTime(log.timestamp),
            User: log.userName,
            Role: log.userRole,
            Action: log.action,
            Description: log.description,
            'IP Address': log.ipAddress || 'N/A',
        }));
        exportToCSV(data, 'activity_logs');
    };
    const handleExportPDF = () => {
        const data = filteredLogs.map((log) => ({
            Timestamp: formatDateTime(log.timestamp),
            User: log.userName,
            Role: log.userRole,
            Action: log.action,
            Description: log.description,
        }));
        exportToPDF(data, 'activity_logs', 'Activity Logs Report');
    };
    if (logs.length === 0 && status !== 'loading') {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(FaHistory, { className: "mx-auto text-4xl text-gray-400 mb-4" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No activity logs available. Please generate a report." })] }));
    }
    const getRoleBadgeColor = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
            case 'owner':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
            case 'customer':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-4 flex-1", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(FaSearch, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Search by user, action, or description...", className: "w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("select", { value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "all", children: "All Roles" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "owner", children: "Owner" }), _jsx("option", { value: "customer", children: "Customer" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: handleExportCSV, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: [_jsx(FaFileCsv, {}), _jsx("span", { children: "CSV" })] }), _jsxs("button", { onClick: handleExportPDF, className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: [_jsx(FaFilePdf, {}), _jsx("span", { children: "PDF" })] })] })] }), _jsxs("div", { className: "mt-4 text-sm text-gray-600 dark:text-gray-400", children: ["Showing ", filteredLogs.length, " of ", logs.length, " activity logs"] })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Timestamp" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "User" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Role" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Action" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Description" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "IP Address" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: filteredLogs.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "px-6 py-12 text-center text-gray-500 dark:text-gray-400", children: "No activity logs found matching your filters." }) })) : (filteredLogs.map((log) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700/50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: formatDateTime(log.timestamp) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FaUser, { className: "text-gray-400" }), _jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: log.userName })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(log.userRole)}`, children: log.userRole }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white", children: log.action }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate", children: log.description }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: log.ipAddress || 'N/A' })] }, log.id)))) })] }) }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Total Activities" }), _jsx(FaHistory, { className: "text-blue-500" })] }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: logs.length })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Admin Actions" }), _jsx(FaUser, { className: "text-red-500" })] }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: logs.filter((log) => log.userRole === 'admin').length })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Owner Actions" }), _jsx(FaUser, { className: "text-blue-500" })] }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: logs.filter((log) => log.userRole === 'owner').length })] })] })] }));
};
export default ActivityLogs;
