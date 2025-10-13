import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../store/store';
import {
  fetchAdminSettings,
  clearError,
  clearSuccessMessage,
} from '../../../../../store/Admin/adminSettingsSlice';
import AdminProfileSettings from './AdminProfileSettings';
import PlatformConfiguration from './PlatformConfiguration';
import NotificationPreferences from './NotificationPreferences';
import SecuritySettings from './SecuritySettings';
import SystemControls from './SystemControls';
import { FaUserCog, FaCog, FaBell, FaLock, FaServer } from 'react-icons/fa';
import Toast from '../../../shared/Toast';
  
const AdminSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    profile,
    platformConfig,
    notificationPreferences,
    securitySettings,
    systemControls,
    isLoading,
    error,
    successMessage,
  } = useSelector((state: RootState) => state.adminSettings);

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
      icon: <FaUserCog className="w-5 h-5" />,
      component: <AdminProfileSettings profile={profile} />,
    },
    {
      id: 'platform',
      label: 'Platform Config',
      icon: <FaCog className="w-5 h-5" />,
      component: <PlatformConfiguration config={platformConfig} />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <FaBell className="w-5 h-5" />,
      component: <NotificationPreferences preferences={notificationPreferences} />,
    },
    {
      id: 'security',
      label: 'Security',
      icon: <FaLock className="w-5 h-5" />,
      component: <SecuritySettings settings={securitySettings} />,
    },
    {
      id: 'system',
      label: 'System Controls',
      icon: <FaServer className="w-5 h-5" />,
      component: <SystemControls controls={systemControls} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage your profile, platform configuration, and system settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* Mobile Tab Navigation */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full px-4 py-3 text-base border-0 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Desktop Tab Navigation */}
          <nav className="hidden sm:flex sm:space-x-4 lg:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors flex-shrink-0`}
              >
                <span className="hidden lg:block">{tab.icon}</span>
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>

      {/* Toast Notifications */}
      {successMessage && (
        <Toast
          type="success"
          message={successMessage}
          onClose={() => dispatch(clearSuccessMessage())}
        />
      )}

      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => dispatch(clearError())}
        />
      )}
    </div>
  );
};

export default AdminSettings;
