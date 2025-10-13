import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store/store';
import { updateSecuritySettings, revokeAllSessions, SecuritySettings } from '../../../../../store/Admin/adminSettingsSlice';
import { FaLock, FaMobile, FaHistory, FaDesktop, FaMapMarkerAlt, FaClock, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

interface SecuritySettingsProps {
  settings: SecuritySettings | null;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaExclamationTriangle className={`w-6 h-6 ${isDestructive ? 'text-red-600' : 'text-yellow-600'}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const SecuritySettingsComponent: React.FC<SecuritySettingsProps> = ({ settings }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSaving } = useSelector((state: RootState) => state.adminSettings);
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(settings?.twoFactorEnabled ?? false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const handleToggle2FA = async () => {
    try {
      const newValue = !twoFactorEnabled;
      await dispatch(updateSecuritySettings({ twoFactorEnabled: newValue })).unwrap();
      setTwoFactorEnabled(newValue);
    } catch (error) {
      console.error('Failed to update 2FA setting:', error);
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await dispatch(revokeAllSessions()).unwrap();
      setShowRevokeModal(false);
    } catch (error) {
      console.error('Failed to revoke sessions:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('android') || device.toLowerCase().includes('iphone')) {
      return <FaMobile className="w-4 h-4 text-blue-600" />;
    }
    return <FaDesktop className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Security Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your account security and monitor access
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaLock className="text-green-600" />
          Two-Factor Authentication
        </h4>
        
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white">
              Enable 2FA Protection
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account with two-factor authentication
            </p>
          </div>
          <button
            onClick={handleToggle2FA}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              twoFactorEnabled
                ? 'bg-green-600'
                : 'bg-gray-200 dark:bg-gray-600'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-400 mb-2">
              <FaLock className="w-4 h-4" />
              <span className="font-medium">2FA is Active</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your account is protected with two-factor authentication. You'll need to enter a verification code when signing in.
            </p>
          </div>
        )}
      </div>

      {/* Login History */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaHistory className="text-blue-600" />
          Recent Login History
        </h4>
        
        <div className="space-y-3">
          {settings?.lastLoginHistory && settings.lastLoginHistory.length > 0 ? (
            settings.lastLoginHistory.slice(0, 5).map((login) => (
              <div
                key={login.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-4">
                  {getDeviceIcon(login.device)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {login.device}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="w-3 h-3" />
                        {login.location}
                      </span>
                      <span>IP: {login.ipAddress}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <FaClock className="w-3 h-3" />
                    {formatDate(login.timestamp)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaHistory className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No login history available</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaDesktop className="text-purple-600" />
            Active Sessions
          </h4>
          <button
            onClick={() => setShowRevokeModal(true)}
            disabled={isSaving || !settings?.activeSessions?.length}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FaTrash className="w-3 h-3" />
            Revoke All Sessions
          </button>
        </div>
        
        <div className="space-y-3">
          {settings?.activeSessions && settings.activeSessions.length > 0 ? (
            settings.activeSessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  session.isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  {getDeviceIcon(session.device)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {session.device}
                      </span>
                      {session.isCurrent && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>IP: {session.ipAddress}</span>
                      <span className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        Last active: {formatDate(session.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Revoke this session"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaDesktop className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active sessions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
        <h4 className="text-md font-semibold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
          <FaLock className="text-yellow-600" />
          Security Recommendations
        </h4>
        <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
            Enable two-factor authentication for enhanced security
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
            Regularly review your login history and active sessions
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
            Use a strong, unique password for your admin account
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
            Revoke sessions from devices you no longer use
          </li>
        </ul>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        onConfirm={handleRevokeAllSessions}
        title="Revoke All Sessions"
        message="This will sign you out of all devices except the current one. You'll need to sign in again on other devices. Are you sure you want to continue?"
        confirmText="Revoke All Sessions"
        isDestructive={true}
      />
    </div>
  );
};

export default SecuritySettingsComponent;
