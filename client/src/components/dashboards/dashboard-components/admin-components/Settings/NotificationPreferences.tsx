import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store/store';
import { updateNotificationPreferences, NotificationPreferences } from '../../../../../store/Admin/adminSettingsSlice';
import { FaBell, FaEnvelope, FaMobile, FaDesktop, FaCalendarCheck, FaUserPlus, FaCreditCard, FaSync } from 'react-icons/fa';

interface NotificationPreferencesProps {
  preferences: NotificationPreferences | null;
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, disabled = false }) => {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled
          ? 'bg-blue-600'
          : 'bg-gray-200 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

const NotificationPreferencesComponent: React.FC<NotificationPreferencesProps> = ({ preferences }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSaving } = useSelector((state: RootState) => state.adminSettings);
  
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

  const handleToggleChange = (key: keyof typeof formData, value: boolean) => {
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
    } catch (error) {
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
      key: 'emailNotifications' as keyof typeof formData,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <FaEnvelope className="w-5 h-5 text-blue-600" />,
    },
    {
      key: 'pushNotifications' as keyof typeof formData,
      title: 'Push Notifications',
      description: 'Receive push notifications on mobile devices',
      icon: <FaMobile className="w-5 h-5 text-green-600" />,
    },
    {
      key: 'inAppNotifications' as keyof typeof formData,
      title: 'In-App Notifications',
      description: 'Show notifications within the dashboard',
      icon: <FaDesktop className="w-5 h-5 text-purple-600" />,
    },
  ];

  const notificationTypes = [
    {
      key: 'newBookings' as keyof typeof formData,
      title: 'New Bookings',
      description: 'Get notified when customers make new bookings',
      icon: <FaCalendarCheck className="w-5 h-5 text-blue-600" />,
    },
    {
      key: 'ownerRegistrations' as keyof typeof formData,
      title: 'Owner Registrations',
      description: 'Get notified when new car owners register and need approval',
      icon: <FaUserPlus className="w-5 h-5 text-green-600" />,
    },
    {
      key: 'paymentConfirmations' as keyof typeof formData,
      title: 'Payment Confirmations',
      description: 'Get notified about payment transactions and confirmations',
      icon: <FaCreditCard className="w-5 h-5 text-yellow-600" />,
    },
    {
      key: 'systemUpdates' as keyof typeof formData,
      title: 'System Updates',
      description: 'Get notified about system maintenance and updates',
      icon: <FaSync className="w-5 h-5 text-red-600" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notification Preferences
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure how and when you want to receive notifications
          </p>
        </div>
        {hasChanges && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Notification Channels */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaBell className="text-blue-600" />
          Notification Channels
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose how you want to receive notifications
        </p>

        <div className="space-y-4">
          {notificationChannels.map((channel) => (
            <div
              key={channel.key}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-4">
                {channel.icon}
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {channel.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {channel.description}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={formData[channel.key]}
                onChange={(enabled) => handleToggleChange(channel.key, enabled)}
                disabled={isSaving}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaBell className="text-green-600" />
          Notification Types
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Select which types of notifications you want to receive
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-4">
                {type.icon}
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {type.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={formData[type.key]}
                onChange={(enabled) => handleToggleChange(type.key, enabled)}
                disabled={isSaving}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h4>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <button
            onClick={() => {
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
            }}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Enable All
          </button>
          <button
            onClick={() => {
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
            }}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Disable All
          </button>
          <button
            onClick={() => {
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
            }}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesComponent;
