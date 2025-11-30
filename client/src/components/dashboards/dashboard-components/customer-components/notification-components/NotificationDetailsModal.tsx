import React from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { Notification } from '../../../../../store/Notification/notificationApi';

interface NotificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
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
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notification Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                  {notification.type.replace(/_/g, ' ')}
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

export default NotificationDetailsModal;
