import React from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBan, 
  FaCreditCard, 
  FaExclamationTriangle, 
  FaCar, 
  FaFlag, 
  FaTools,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaInfoCircle
} from 'react-icons/fa';
import { Notification } from '../../../../../store/Notification/notificationApi';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (notification: Notification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onView,
}) => {
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_approved':
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'booking_rejected':
        return <FaTimesCircle className="w-5 h-5 text-red-500" />;
      case 'booking_cancelled':
        return <FaBan className="w-5 h-5 text-orange-500" />;
      case 'payment_successful':
        return <FaCreditCard className="w-5 h-5 text-green-500" />;
      case 'payment_failed':
        return <FaCreditCard className="w-5 h-5 text-red-500" />;
      case 'rental_started':
        return <FaCar className="w-5 h-5 text-blue-500" />;
      case 'rental_completed':
        return <FaFlag className="w-5 h-5 text-purple-500" />;
      case 'system_alert':
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      case 'maintenance_reminder':
        return <FaTools className="w-5 h-5 text-gray-500" />;
      default:
        return <FaFlag className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={`
        relative border-l-4 rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md
        ${getPriorityColor(notification.priority)}
        ${notification.isRead 
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm'
        }
      `}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                notification.isRead 
                  ? 'text-gray-900 dark:text-gray-100' 
                  : 'text-gray-900 dark:text-white font-semibold'
              }`}>
                {notification.title}
              </h4>
              <p className={`mt-1 text-sm ${
                notification.isRead 
                  ? 'text-gray-600 dark:text-gray-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {notification.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onView(notification)}
                className="p-1.5 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title="View details"
              >
                <FaEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
              >
                {notification.isRead ? (
                  <FaEyeSlash className="w-4 h-4" />
                ) : (
                  <FaCheckCircle className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onDelete(notification.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Delete notification"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timestamp and Priority */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(notification.createdAt)}
            </span>
            {notification.priority !== 'low' && (
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${notification.priority === 'urgent' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : notification.priority === 'high'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }
              `}>
                {notification.priority.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
