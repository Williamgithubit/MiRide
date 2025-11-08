import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNotificationPreferences } from '../../../../../store/Admin/adminSettingsSlice';
import { FaBell, FaEnvelope, FaMobile, FaDesktop, FaCalendarCheck, FaUserPlus, FaCreditCard, FaSync } from 'react-icons/fa';
const ToggleSwitch = ({ enabled, onChange, disabled = false }) => {
    return (_jsx("button", { onClick: () => !disabled && onChange(!enabled), disabled: disabled, className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enabled
            ? 'bg-blue-600'
            : 'bg-gray-200 dark:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`, children: _jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}` }) }));
};
const NotificationPreferencesComponent = ({ preferences }) => {
    const dispatch = useDispatch();
    const { isSaving } = useSelector((state) => state.adminSettings);
    const [formData, setFormData] = useState({
        emailNotifications: preferences?.emailNotifications ?? true,
        pushNotifications: preferences?.pushNotifications ?? true,
        inAppNotifications: preferences?.inAppNotifications ?? true,
        newBookings: preferences?.newBookings ?? true,
        ownerRegistrations: preferences?.ownerRegistrations ?? true,
        paymentConfirmations: preferences?.paymentConfirmations ?? true,
        systemUpdates: preferences?.systemUpdates ?? true,
    });
    const [hasChanges, setHasChanges] = useState(false);
    const handleToggleChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value,
        }));
        setHasChanges(true);
    };
    const handleSave = async () => {
        try {
            await dispatch(updateNotificationPreferences(formData)).unwrap();
            setHasChanges(false);
        }
        catch (error) {
            console.error('Failed to update notification preferences:', error);
        }
    };
    const handleReset = () => {
        setFormData({
            emailNotifications: preferences?.emailNotifications ?? true,
            pushNotifications: preferences?.pushNotifications ?? true,
            inAppNotifications: preferences?.inAppNotifications ?? true,
            newBookings: preferences?.newBookings ?? true,
            ownerRegistrations: preferences?.ownerRegistrations ?? true,
            paymentConfirmations: preferences?.paymentConfirmations ?? true,
            systemUpdates: preferences?.systemUpdates ?? true,
        });
        setHasChanges(false);
    };
    const notificationChannels = [
        {
            key: 'emailNotifications',
            title: 'Email Notifications',
            description: 'Receive notifications via email',
            icon: _jsx(FaEnvelope, { className: "w-5 h-5 text-blue-600" }),
        },
        {
            key: 'pushNotifications',
            title: 'Push Notifications',
            description: 'Receive push notifications on mobile devices',
            icon: _jsx(FaMobile, { className: "w-5 h-5 text-green-600" }),
        },
        {
            key: 'inAppNotifications',
            title: 'In-App Notifications',
            description: 'Show notifications within the dashboard',
            icon: _jsx(FaDesktop, { className: "w-5 h-5 text-purple-600" }),
        },
    ];
    const notificationTypes = [
        {
            key: 'newBookings',
            title: 'New Bookings',
            description: 'Get notified when customers make new bookings',
            icon: _jsx(FaCalendarCheck, { className: "w-5 h-5 text-blue-600" }),
        },
        {
            key: 'ownerRegistrations',
            title: 'Owner Registrations',
            description: 'Get notified when new car owners register and need approval',
            icon: _jsx(FaUserPlus, { className: "w-5 h-5 text-green-600" }),
        },
        {
            key: 'paymentConfirmations',
            title: 'Payment Confirmations',
            description: 'Get notified about payment transactions and confirmations',
            icon: _jsx(FaCreditCard, { className: "w-5 h-5 text-yellow-600" }),
        },
        {
            key: 'systemUpdates',
            title: 'System Updates',
            description: 'Get notified about system maintenance and updates',
            icon: _jsx(FaSync, { className: "w-5 h-5 text-red-600" }),
        },
    ];
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Notification Preferences" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Configure how and when you want to receive notifications" })] }), hasChanges && (_jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [_jsx("button", { onClick: handleReset, className: "w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors", children: "Reset" }), _jsx("button", { onClick: handleSave, disabled: isSaving, className: "w-full sm:w-auto px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2", children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Saving..."] })) : ('Save Changes') })] }))] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: [_jsxs("h4", { className: "text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(FaBell, { className: "text-blue-600" }), "Notification Channels"] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-6", children: "Choose how you want to receive notifications" }), _jsx("div", { className: "space-y-4", children: notificationChannels.map((channel) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow", children: [_jsxs("div", { className: "flex items-center gap-4", children: [channel.icon, _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-900 dark:text-white", children: channel.title }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: channel.description })] })] }), _jsx(ToggleSwitch, { enabled: formData[channel.key], onChange: (enabled) => handleToggleChange(channel.key, enabled), disabled: isSaving })] }, channel.key))) })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: [_jsxs("h4", { className: "text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [_jsx(FaBell, { className: "text-green-600" }), "Notification Types"] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-6", children: "Select which types of notifications you want to receive" }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: notificationTypes.map((type) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow", children: [_jsxs("div", { className: "flex items-center gap-4", children: [type.icon, _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-900 dark:text-white", children: type.title }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: type.description })] })] }), _jsx(ToggleSwitch, { enabled: formData[type.key], onChange: (enabled) => handleToggleChange(type.key, enabled), disabled: isSaving })] }, type.key))) })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600", children: [_jsx("h4", { className: "text-md font-semibold text-gray-900 dark:text-white mb-4", children: "Quick Actions" }), _jsxs("div", { className: "flex flex-col sm:flex-row flex-wrap gap-3", children: [_jsx("button", { onClick: () => {
                                    const allEnabled = {
                                        emailNotifications: true,
                                        pushNotifications: true,
                                        inAppNotifications: true,
                                        newBookings: true,
                                        ownerRegistrations: true,
                                        paymentConfirmations: true,
                                        systemUpdates: true,
                                    };
                                    setFormData(allEnabled);
                                    setHasChanges(true);
                                }, className: "w-full sm:w-auto px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors", children: "Enable All" }), _jsx("button", { onClick: () => {
                                    const allDisabled = {
                                        emailNotifications: false,
                                        pushNotifications: false,
                                        inAppNotifications: false,
                                        newBookings: false,
                                        ownerRegistrations: false,
                                        paymentConfirmations: false,
                                        systemUpdates: false,
                                    };
                                    setFormData(allDisabled);
                                    setHasChanges(true);
                                }, className: "w-full sm:w-auto px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors", children: "Disable All" }), _jsx("button", { onClick: () => {
                                    const essentialOnly = {
                                        emailNotifications: true,
                                        pushNotifications: false,
                                        inAppNotifications: true,
                                        newBookings: true,
                                        ownerRegistrations: true,
                                        paymentConfirmations: true,
                                        systemUpdates: false,
                                    };
                                    setFormData(essentialOnly);
                                    setHasChanges(true);
                                }, className: "w-full sm:w-auto px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "Essential Only" })] })] })] }));
};
export default NotificationPreferencesComponent;
