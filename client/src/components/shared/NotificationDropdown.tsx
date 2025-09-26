import React, { useState } from 'react';
import { 
  FaBell, 
  FaCheck, 
  FaCheckDouble, 
  FaCar, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCreditCard, 
  FaKey, 
  FaFlag,
  FaBullhorn,
  FaExclamationTriangle,
  FaWrench,
  FaStar,
  FaInfoCircle
} from 'react-icons/fa';
import { 
  useGetNotificationsQuery, 
  useGetUnreadCountQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation,
  Notification 
} from '../../store/Notification/notificationApi';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadData } = useGetUnreadCountQuery();
  const { data: notificationsData, refetch } = useGetNotificationsQuery({ limit: 10 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const unreadCount = unreadData?.unreadCount || 0;
  const notifications = notificationsData?.notifications || [];

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId).unwrap();
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Union type to support both customer and owner notification types
  type AllNotificationTypes = 
    | 'booking_request'        // Owner only
    | 'payment_received'       // Owner only  
    | 'customer_review'        // Owner only
    | 'booking_approved'       // Both
    | 'booking_rejected'       // Customer only
    | 'booking_cancelled'      // Both
    | 'payment_successful'     // Customer only
    | 'payment_failed'         // Customer only
    | 'rental_started'         // Customer only
    | 'rental_completed'       // Customer only
    | 'system_alert'           // Both
    | 'maintenance_reminder';  // Both

  const getNotificationIcon = (type: AllNotificationTypes) => {
    const iconClass = "w-5 h-5";
    
    switch (type) {
      case 'booking_request':
        return <FaCar className={`${iconClass} text-blue-600`} />;
      case 'booking_approved':
        return <FaCheckCircle className={`${iconClass} text-green-600`} />;
      case 'booking_rejected':
        return <FaTimesCircle className={`${iconClass} text-red-600`} />;
      case 'booking_cancelled':
        return <FaTimesCircle className={`${iconClass} text-orange-600`} />;
      case 'payment_successful':
      case 'payment_received':
        return <FaCreditCard className={`${iconClass} text-green-600`} />;
      case 'payment_failed':
        return <FaCreditCard className={`${iconClass} text-red-600`} />;
      case 'rental_started':
        return <FaKey className={`${iconClass} text-blue-600`} />;
      case 'rental_completed':
        return <FaFlag className={`${iconClass} text-purple-600`} />;
      case 'customer_review':
        return <FaStar className={`${iconClass} text-yellow-600`} />;
      case 'system_alert':
        return <FaExclamationTriangle className={`${iconClass} text-orange-600`} />;
      case 'maintenance_reminder':
        return <FaWrench className={`${iconClass} text-gray-600`} />;
      default:
        return <FaBullhorn className={`${iconClass} text-gray-600`} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400';
      case 'low':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <FaCheckDouble className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      !notification.isRead 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                        {getNotificationIcon(notification.type as AllNotificationTypes)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                title="Mark as read"
                              >
                                <FaCheck className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full notifications page if you have one
                  }}
                  className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-center"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
