import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store/store';
import { updateSystemControls, triggerBackup, SystemControls } from '../../../../../store/Admin/adminSettingsSlice';
import { 
  FaServer, 
  FaTools, 
  FaDatabase, 
  FaCloudDownloadAlt, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock,
  FaCode,
  FaHeartbeat,
  FaSync
} from 'react-icons/fa';

interface SystemControlsProps {
  controls: SystemControls | null;
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

const SystemControlsComponent: React.FC<SystemControlsProps> = ({ controls }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSaving } = useSelector((state: RootState) => state.adminSettings);
  
  const [maintenanceMode, setMaintenanceMode] = useState(controls?.maintenanceMode ?? false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const handleToggleMaintenanceMode = async () => {
    try {
      const newValue = !maintenanceMode;
      await dispatch(updateSystemControls({ maintenanceMode: newValue })).unwrap();
      setMaintenanceMode(newValue);
      setShowMaintenanceModal(false);
    } catch (error) {
      console.error('Failed to update maintenance mode:', error);
    }
  };

  const handleTriggerBackup = async () => {
    try {
      await dispatch(triggerBackup()).unwrap();
      setShowBackupModal(false);
    } catch (error) {
      console.error('Failed to trigger backup:', error);
    }
  };

  const getHealthStatusColor = (status: string) => {
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

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <FaCheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <FaExclamationTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <FaHeartbeat className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatUptime = (uptime: string) => {
    // Assuming uptime is in a format like "5d 12h 30m"
    return uptime || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          System Controls
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Monitor system health and manage advanced system operations
        </p>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Version</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {controls?.systemVersion || 'v1.0.0'}
              </p>
            </div>
            <FaCode className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Health</p>
              <p className={`text-2xl font-bold capitalize ${getHealthStatusColor(controls?.apiHealthStatus || 'unknown')}`}>
                {controls?.apiHealthStatus || 'Unknown'}
              </p>
            </div>
            {getHealthStatusIcon(controls?.apiHealthStatus || 'unknown')}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatUptime(controls?.uptime || '')}
              </p>
            </div>
            <FaClock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Backup</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {formatDate(controls?.lastBackup || '')}
              </p>
            </div>
            <FaDatabase className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaTools className="text-orange-600" />
          Maintenance Mode
        </h4>
        
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white">
              System Maintenance Mode
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {maintenanceMode 
                ? 'The system is currently in maintenance mode. Users cannot access the platform.'
                : 'Enable maintenance mode to perform system updates and maintenance tasks.'
              }
            </p>
          </div>
          <button
            onClick={() => setShowMaintenanceModal(true)}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              maintenanceMode
                ? 'bg-orange-600'
                : 'bg-gray-200 dark:bg-gray-600'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {maintenanceMode && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400 mb-2">
              <FaExclamationTriangle className="w-4 h-4" />
              <span className="font-medium">Maintenance Mode Active</span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              The platform is currently unavailable to users. Remember to disable maintenance mode when you're done.
            </p>
          </div>
        )}
      </div>

      {/* Backup & Restore */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaDatabase className="text-blue-600" />
          Backup & Restore
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
              Database Backup
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create a backup of the entire database including all user data, bookings, and system configurations.
            </p>
            <button
              onClick={() => setShowBackupModal(true)}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Backup...
                </>
              ) : (
                <>
                  <FaCloudDownloadAlt className="w-4 h-4" />
                  Create Backup
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
              System Restore
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Restore the system from a previous backup. This will replace all current data.
            </p>
            <button
              disabled
              className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaSync className="w-4 h-4" />
              Restore (Coming Soon)
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 mb-2">
            <FaDatabase className="w-4 h-4" />
            <span className="font-medium">Last Backup</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {controls?.lastBackup 
              ? `Last backup was created on ${formatDate(controls.lastBackup)}`
              : 'No backup has been created yet. It\'s recommended to create regular backups.'
            }
          </p>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaServer className="text-gray-600" />
          System Information
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Platform Version:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {controls?.systemVersion || 'v1.0.0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">API Status:</span>
              <span className={`font-medium capitalize ${getHealthStatusColor(controls?.apiHealthStatus || 'unknown')}`}>
                {controls?.apiHealthStatus || 'Unknown'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">System Uptime:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatUptime(controls?.uptime || '')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Maintenance Mode:</span>
              <span className={`font-medium ${maintenanceMode ? 'text-orange-600' : 'text-green-600'}`}>
                {maintenanceMode ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        onConfirm={handleToggleMaintenanceMode}
        title={maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
        message={
          maintenanceMode 
            ? "This will make the platform available to users again. Are you sure you want to disable maintenance mode?"
            : "This will make the platform unavailable to users. Only administrators will be able to access the system. Are you sure you want to enable maintenance mode?"
        }
        confirmText={maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
        isDestructive={!maintenanceMode}
      />

      <ConfirmationModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onConfirm={handleTriggerBackup}
        title="Create System Backup"
        message="This will create a complete backup of the database and system files. The process may take several minutes depending on the amount of data. Do you want to proceed?"
        confirmText="Create Backup"
      />
    </div>
  );
};

export default SystemControlsComponent;
