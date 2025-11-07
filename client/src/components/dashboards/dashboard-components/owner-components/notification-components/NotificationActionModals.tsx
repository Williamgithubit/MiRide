import React from 'react';
import { FaTimes, FaTrash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { OwnerNotification } from '../../../../../store/Notification/ownerNotificationApi';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
}

interface DeleteConfirmationModalProps extends BaseModalProps {
  notification: OwnerNotification | null;
  onConfirm: () => void;
}

interface ClearAllConfirmationModalProps extends BaseModalProps {
  notificationCount: number;
  onConfirm: () => void;
}

interface NotificationDetailsModalProps extends BaseModalProps {
  notification: OwnerNotification | null;
}

// Delete Single Notification Modal
export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  notification,
  loading = false
}) => {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <FaTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Notification
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this notification? This action cannot be undone.
            </p>
            
            {/* Notification Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {notification.title}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {notification.message}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clear All Notifications Modal
export const ClearAllConfirmationModal: React.FC<ClearAllConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  notificationCount,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Clear All Notifications
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to clear all {notificationCount} notifications? This action cannot be undone.
            </p>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-800 dark:text-orange-300">
                  <strong>Warning:</strong> This will permanently delete all your notifications, including unread ones.
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Clearing...</span>
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4" />
                  <span>Clear All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Details Modal
export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  isOpen,
  onClose,
  notification
}) => {
  if (!isOpen || !notification) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-blue-600 dark:text-blue-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Helper function to render additional data in a readable format
  const renderAdditionalData = (data: any) => {
    if (!data) return null;

    // If it's already a string, return it
    if (typeof data === 'string') {
      return <p className="text-sm text-gray-900 dark:text-white">{data}</p>;
    }

    // If it's an object, render it in a user-friendly way
    if (typeof data === 'object') {
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {key.replace(/_/g, ' ')}:{' '}
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-sm text-gray-900 dark:text-white">{String(data)}</p>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notification Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Title and Message */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {notification.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {notification.message}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                  {notification.type.replace('_', ' ')}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                <div className={`mt-1 text-sm font-medium capitalize ${getPriorityColor(notification.priority)}`}>
                  {notification.priority}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white">
                  {notification.isRead ? 'Read' : 'Unread'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(notification.createdAt)}
                </div>
              </div>
            </div>

            {/* Related Item */}
            {notification.relatedItem && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Related Item</label>
                <div className="mt-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {notification.relatedItem.type}: {notification.relatedItem.name}
                  </div>
                  {notification.relatedItem.details && (
                    <div className="mt-2">
                      {renderAdditionalData(notification.relatedItem.details)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Data */}
            {notification.data && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                  Additional Information
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  {renderAdditionalData(notification.data)}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaCheck className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
