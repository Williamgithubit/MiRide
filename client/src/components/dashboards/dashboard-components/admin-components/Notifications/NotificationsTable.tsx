import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store/store';
import {
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification,
  toggleNotificationSelection,
  AdminNotification,
} from '../../../../../store/Admin/adminNotificationsSlice';
import { FaCheck, FaEnvelope, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface NotificationsTableProps {
  notifications: AdminNotification[];
  selectedNotifications: string[];
}

const NotificationsTable: React.FC<NotificationsTableProps> = ({
  notifications,
  selectedNotifications,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleMarkAsRead = async (id: string) => {
    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      await dispatch(markNotificationAsUnread(id)).unwrap();
      toast.success('Notification marked as unread');
    } catch (error) {
      toast.error('Failed to mark notification as unread');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await dispatch(deleteNotification(id)).unwrap();
        toast.success('Notification deleted');
      } catch (error) {
        toast.error('Failed to delete notification');
      }
    }
  };

  const handleToggleSelection = (id: string) => {
    dispatch(toggleNotificationSelection(id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'System':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Booking':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Payment':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRecipientColor = (recipient: string) => {
    switch (recipient) {
      case 'All':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Owner':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Customer':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <FaEnvelope className="mx-auto text-gray-400 text-4xl sm:text-5xl mb-4" />
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No notifications found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600"
                onChange={(e) => {
                  // This will be handled by the parent component
                }}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recipient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <tr
              key={notification.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                notification.status === 'Unread' ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleToggleSelection(notification.id)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {notification.status === 'Unread' && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 max-w-md">
                  {notification.message}
                </p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRecipientColor(
                    notification.recipient
                  )}`}
                >
                  {notification.recipient}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                    notification.type
                  )}`}
                >
                  {notification.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    notification.status === 'Unread'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {notification.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDate(notification.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {notification.link && (
                    <button
                      onClick={() => window.open(notification.link, '_blank')}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Open link"
                    >
                      <FaExternalLinkAlt />
                    </button>
                  )}
                  {notification.status === 'Unread' ? (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      title="Mark as read"
                    >
                      <FaCheck />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkAsUnread(notification.id)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      title="Mark as unread"
                    >
                      <FaEnvelope />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 ${
              notification.status === 'Unread' ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-900'
            }`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-2 flex-1">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleToggleSelection(notification.id)}
                  className="mt-1 rounded border-gray-300 dark:border-gray-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {notification.status === 'Unread' && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRecipientColor(
                  notification.recipient
                )}`}
              >
                {notification.recipient}
              </span>
              <span
                className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                  notification.type
                )}`}
              >
                {notification.type}
              </span>
              <span
                className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  notification.status === 'Unread'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {notification.status}
              </span>
            </div>

            {/* Footer Row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(notification.createdAt)}
              </span>
              <div className="flex items-center space-x-3">
                {notification.link && (
                  <button
                    onClick={() => window.open(notification.link, '_blank')}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Open link"
                  >
                    <FaExternalLinkAlt className="text-sm" />
                  </button>
                )}
                {notification.status === 'Unread' ? (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    title="Mark as read"
                  >
                    <FaCheck className="text-sm" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsUnread(notification.id)}
                    className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                    title="Mark as unread"
                  >
                    <FaEnvelope className="text-sm" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationsTable;
