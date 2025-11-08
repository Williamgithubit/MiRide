import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSystemControls, triggerBackup } from '../../../../../store/Admin/adminSettingsSlice';
import { FaServer, FaTools, FaDatabase, FaCloudDownloadAlt, FaExclamationTriangle, FaCheckCircle, FaClock, FaCode, FaHeartbeat, FaSync } from 'react-icons/fa';
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive = false, }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(FaExclamationTriangle, { className: `w-6 h-6 ${isDestructive ? 'text-red-600' : 'text-yellow-600'}` }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: title })] }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: message }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors", children: "Cancel" }), _jsx("button", { onClick: onConfirm, className: `px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDestructive
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'}`, children: confirmText })] })] }) }));
};
const SystemControlsComponent = ({ controls }) => {
    const dispatch = useDispatch();
    const { isSaving } = useSelector((state) => state.adminSettings);
    const [maintenanceMode, setMaintenanceMode] = useState(controls?.maintenanceMode ?? false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const handleToggleMaintenanceMode = async () => {
        try {
            const newValue = !maintenanceMode;
            await dispatch(updateSystemControls({ maintenanceMode: newValue })).unwrap();
            setMaintenanceMode(newValue);
            setShowMaintenanceModal(false);
        }
        catch (error) {
            console.error('Failed to update maintenance mode:', error);
        }
    };
    const handleTriggerBackup = async () => {
        try {
            await dispatch(triggerBackup()).unwrap();
            setShowBackupModal(false);
        }
        catch (error) {
            console.error('Failed to trigger backup:', error);
        }
    };
    const getHealthStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };
    const getHealthStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
                return _jsx(FaCheckCircle, { className: "w-5 h-5 text-green-600" });
            case 'warning':
                return _jsx(FaExclamationTriangle, { className: "w-5 h-5 text-yellow-600" });
            case 'error':
                return _jsx(FaExclamationTriangle, { className: "w-5 h-5 text-red-600" });
            default:
                return _jsx(FaHeartbeat, { className: "w-5 h-5 text-gray-600" });
        }
    };
    const formatUptime = (uptime) => {
        // Assuming uptime is in a format like "5d 12h 30m"
        return uptime || 'Unknown';
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return 'Never';
        return new Date(dateString).toLocaleString();
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "System Controls" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Monitor system health and manage advanced system operations" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "System Version" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: controls?.systemVersion || 'v1.0.0' })] }), _jsx(FaCode, { className: "w-8 h-8 text-blue-600" })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "API Health" }), _jsx("p", { className: `text-2xl font-bold capitalize ${getHealthStatusColor(controls?.apiHealthStatus || 'unknown')}`, children: controls?.apiHealthStatus || 'Unknown' })] }), getHealthStatusIcon(controls?.apiHealthStatus || 'unknown')] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Uptime" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: formatUptime(controls?.uptime || '') })] }), _jsx(FaClock, { className: "w-8 h-8 text-green-600" })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Last Backup" }), _jsx("p", { className: "text-sm font-bold text-gray-900 dark:text-white", children: formatDate(controls?.lastBackup || '') })] }), _jsx(FaDatabase, { className: "w-8 h-8 text-purple-600" })] }) })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: [_jsxs("h4", { className: "text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(FaTools, { className: "text-orange-600" }), "Maintenance Mode"] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-900 dark:text-white", children: "System Maintenance Mode" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: maintenanceMode
                                            ? 'The system is currently in maintenance mode. Users cannot access the platform.'
                                            : 'Enable maintenance mode to perform system updates and maintenance tasks.' })] }), _jsx("button", { onClick: () => setShowMaintenanceModal(true), disabled: isSaving, className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${maintenanceMode
                                    ? 'bg-orange-600'
                                    : 'bg-gray-200 dark:bg-gray-600'} ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`, children: _jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}` }) })] }), maintenanceMode && (_jsxs("div", { className: "mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 text-orange-800 dark:text-orange-400 mb-2", children: [_jsx(FaExclamationTriangle, { className: "w-4 h-4" }), _jsx("span", { className: "font-medium", children: "Maintenance Mode Active" })] }), _jsx("p", { className: "text-sm text-orange-700 dark:text-orange-300", children: "The platform is currently unavailable to users. Remember to disable maintenance mode when you're done." })] }))] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: [_jsxs("h4", { className: "text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(FaDatabase, { className: "text-blue-600" }), "Backup & Restore"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600", children: [_jsx("h5", { className: "font-medium text-gray-900 dark:text-white mb-2", children: "Database Backup" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Create a backup of the entire database including all user data, bookings, and system configurations." }), _jsx("button", { onClick: () => setShowBackupModal(true), disabled: isSaving, className: "w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2", children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Creating Backup..."] })) : (_jsxs(_Fragment, { children: [_jsx(FaCloudDownloadAlt, { className: "w-4 h-4" }), "Create Backup"] })) })] }), _jsxs("div", { className: "p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600", children: [_jsx("h5", { className: "font-medium text-gray-900 dark:text-white mb-2", children: "System Restore" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Restore the system from a previous backup. This will replace all current data." }), _jsxs("button", { disabled: true, className: "w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2", children: [_jsx(FaSync, { className: "w-4 h-4" }), "Restore (Coming Soon)"] })] })] }), _jsxs("div", { className: "mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 text-blue-800 dark:text-blue-400 mb-2", children: [_jsx(FaDatabase, { className: "w-4 h-4" }), _jsx("span", { className: "font-medium", children: "Last Backup" })] }), _jsx("p", { className: "text-sm text-blue-700 dark:text-blue-300", children: controls?.lastBackup
                                    ? `Last backup was created on ${formatDate(controls.lastBackup)}`
                                    : 'No backup has been created yet. It\'s recommended to create regular backups.' })] })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600", children: [_jsxs("h4", { className: "text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(FaServer, { className: "text-gray-600" }), "System Information"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Platform Version:" }), _jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: controls?.systemVersion || 'v1.0.0' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "API Status:" }), _jsx("span", { className: `font-medium capitalize ${getHealthStatusColor(controls?.apiHealthStatus || 'unknown')}`, children: controls?.apiHealthStatus || 'Unknown' })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "System Uptime:" }), _jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: formatUptime(controls?.uptime || '') })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Maintenance Mode:" }), _jsx("span", { className: `font-medium ${maintenanceMode ? 'text-orange-600' : 'text-green-600'}`, children: maintenanceMode ? 'Active' : 'Inactive' })] })] })] })] }), _jsx(ConfirmationModal, { isOpen: showMaintenanceModal, onClose: () => setShowMaintenanceModal(false), onConfirm: handleToggleMaintenanceMode, title: maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode", message: maintenanceMode
                    ? "This will make the platform available to users again. Are you sure you want to disable maintenance mode?"
                    : "This will make the platform unavailable to users. Only administrators will be able to access the system. Are you sure you want to enable maintenance mode?", confirmText: maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode", isDestructive: !maintenanceMode }), _jsx(ConfirmationModal, { isOpen: showBackupModal, onClose: () => setShowBackupModal(false), onConfirm: handleTriggerBackup, title: "Create System Backup", message: "This will create a complete backup of the database and system files. The process may take several minutes depending on the amount of data. Do you want to proceed?", confirmText: "Create Backup" })] }));
};
export default SystemControlsComponent;
