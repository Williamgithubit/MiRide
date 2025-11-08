import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminSettings, clearError, clearSuccessMessage, } from '../../../../../store/Admin/adminSettingsSlice';
import AdminProfileSettings from './AdminProfileSettings';
import PlatformConfiguration from './PlatformConfiguration';
import NotificationPreferences from './NotificationPreferences';
import SecuritySettings from './SecuritySettings';
import SystemControls from './SystemControls';
import { FaUserCog, FaCog, FaBell, FaLock, FaServer } from 'react-icons/fa';
import Toast from '../../../shared/Toast';
const AdminSettings = () => {
    const dispatch = useDispatch();
    const { profile, platformConfig, notificationPreferences, securitySettings, systemControls, isLoading, error, successMessage, } = useSelector((state) => state.adminSettings);
    const [activeTab, setActiveTab] = useState('profile');
    useEffect(() => {
        dispatch(fetchAdminSettings());
    }, [dispatch]);
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                dispatch(clearSuccessMessage());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);
    const tabs = [
        {
            id: 'profile',
            label: 'Admin Profile',
            icon: _jsx(FaUserCog, { className: "w-5 h-5" }),
            component: _jsx(AdminProfileSettings, { profile: profile }),
        },
        {
            id: 'platform',
            label: 'Platform Config',
            icon: _jsx(FaCog, { className: "w-5 h-5" }),
            component: _jsx(PlatformConfiguration, { config: platformConfig }),
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: _jsx(FaBell, { className: "w-5 h-5" }),
            component: _jsx(NotificationPreferences, { preferences: notificationPreferences }),
        },
        {
            id: 'security',
            label: 'Security',
            icon: _jsx(FaLock, { className: "w-5 h-5" }),
            component: _jsx(SecuritySettings, { settings: securitySettings }),
        },
        {
            id: 'system',
            label: 'System Controls',
            icon: _jsx(FaServer, { className: "w-5 h-5" }),
            component: _jsx(SystemControls, { controls: systemControls }),
        },
    ];
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "space-y-4 sm:space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6", children: [_jsx("h1", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2", children: "Admin Settings" }), _jsx("p", { className: "text-sm sm:text-base text-gray-600 dark:text-gray-400", children: "Manage your profile, platform configuration, and system settings" })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "border-b border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "sm:hidden", children: _jsx("select", { value: activeTab, onChange: (e) => setActiveTab(e.target.value), className: "block w-full px-4 py-3 text-base border-0 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500", children: tabs.map((tab) => (_jsx("option", { value: tab.id, children: tab.label }, tab.id))) }) }), _jsx("nav", { className: "hidden sm:flex sm:space-x-4 lg:space-x-8 px-4 sm:px-6 overflow-x-auto", "aria-label": "Tabs", children: tabs.map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors flex-shrink-0`, children: [_jsx("span", { className: "hidden lg:block", children: tab.icon }), _jsx("span", { className: "text-xs sm:text-sm", children: tab.label })] }, tab.id))) })] }), _jsx("div", { className: "p-3 sm:p-4 lg:p-6", children: tabs.find((tab) => tab.id === activeTab)?.component })] }), successMessage && (_jsx(Toast, { type: "success", message: successMessage, onClose: () => dispatch(clearSuccessMessage()) })), error && (_jsx(Toast, { type: "error", message: error, onClose: () => dispatch(clearError()) }))] }));
};
export default AdminSettings;
