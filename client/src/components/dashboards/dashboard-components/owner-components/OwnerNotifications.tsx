import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  useGetOwnerNotificationsQuery,
  useGetOwnerUnreadCountQuery,
  useMarkOwnerNotificationAsReadMutation,
  useMarkOwnerNotificationAsUnreadMutation,
  useMarkAllOwnerNotificationsAsReadMutation,
  useDeleteOwnerNotificationMutation,
  useClearAllOwnerNotificationsMutation,
  OwnerNotification,
  NotificationFilters
} from "../../../../store/Notification/ownerNotificationApi";
import NotificationsTable from './notification-components/NotificationsTable';
import { 
  DeleteConfirmationModal, 
  ClearAllConfirmationModal, 
  NotificationDetailsModal 
} from './notification-components/NotificationActionModals';
import { FaSync, FaCheckDouble, FaTrash, FaBell } from 'react-icons/fa';

export const OwnerNotifications = () => {
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    status: 'all',
    priority: 'all',
    limit: 10,
    offset: 0,
    search: ''
  });
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [selectedNotification, setSelectedNotification] = useState<OwnerNotification | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Use RTK Query hooks
  const {
    data: notificationResponse,
    isLoading: loading,
    error: notificationsError,
    refetch
  } = useGetOwnerNotificationsQuery(filters);

  const {
    data: unreadCountData,
    refetch: refetchUnreadCount
  } = useGetOwnerUnreadCountQuery();

  const [markAsRead] = useMarkOwnerNotificationAsReadMutation();
  const [markAsUnread] = useMarkOwnerNotificationAsUnreadMutation();
  const [markAllAsRead] = useMarkAllOwnerNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteOwnerNotificationMutation();
  const [clearAllNotifications] = useClearAllOwnerNotificationsMutation();

  const notifications = notificationResponse?.notifications || [];
  const totalNotifications = notificationResponse?.total || 0;
  const unreadCount = unreadCountData?.unreadCount || 0;

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
      refetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch, refetchUnreadCount]);

  // Handle errors
  useEffect(() => {
    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError);
      toast.error("Failed to load notifications");
    }
  }, [notificationsError]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      setUpdating(prev => ({ ...prev, [notificationId.toString()]: true }));
      await markAsRead(notificationId).unwrap();
      toast.success("Notification marked as read");
      refetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    } finally {
      setUpdating(prev => ({ ...prev, [notificationId.toString()]: false }));
    }
  };

  const handleMarkAsUnread = async (notificationId: number) => {
    try {
      setUpdating(prev => ({ ...prev, [notificationId.toString()]: true }));
      await markAsUnread(notificationId).unwrap();
      toast.success("Notification marked as unread");
      refetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification as unread:", error);
      toast.error("Failed to mark notification as unread");
    } finally {
      setUpdating(prev => ({ ...prev, [notificationId.toString()]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead().unwrap();
      toast.success(`${result.updatedCount} notifications marked as read`);
      refetchUnreadCount();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleDelete = (notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      setSelectedNotification(notification);
      setShowDeleteModal(true);
    }
  };

  const handleViewDetails = (notification: OwnerNotification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    
    // Mark as read if it's unread
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const confirmDelete = async () => {
    if (!selectedNotification) return;
    
    try {
      setUpdating(prev => ({ ...prev, [selectedNotification.id.toString()]: true }));
      await deleteNotification(selectedNotification.id).unwrap();
      toast.success("Notification deleted successfully");
      setShowDeleteModal(false);
      setSelectedNotification(null);
      refetchUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    } finally {
      setUpdating(prev => ({ ...prev, [selectedNotification.id.toString()]: false }));
    }
  };

  const handleClearAll = () => {
    if (totalNotifications > 0) {
      setShowClearAllModal(true);
    }
  };

  const confirmClearAll = async () => {
    try {
      const result = await clearAllNotifications().unwrap();
      toast.success(`${result.deletedCount} notifications cleared`);
      setShowClearAllModal(false);
      refetchUnreadCount();
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      toast.error("Failed to clear all notifications");
    }
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Notifications
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your notifications and stay updated on important events
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg">
              <FaBell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                {unreadCount} unread
              </span>
            </div>
          )}
          
          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title={autoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled"}
          >
            <span>Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>

          {/* Action Buttons */}
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-1.5 sm:gap-2"
          >
            <FaCheckDouble className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Mark All Read</span>
            <span className="sm:hidden">Read</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={totalNotifications === 0}
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center gap-1.5 sm:gap-2"
          >
            <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Clear All</span>
          </button>

          <button
            onClick={() => {
              refetch();
              refetchUnreadCount();
            }}
            disabled={loading}
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-1.5 sm:gap-2"
          >
            <FaSync className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FaBell className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-2 sm:ml-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Notifications
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {totalNotifications}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <FaBell className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="ml-2 sm:ml-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Unread
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {unreadCount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FaCheckDouble className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-2 sm:ml-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Read
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {totalNotifications - unreadCount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <FaBell className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-2 sm:ml-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                High Priority
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <NotificationsTable
        notifications={notifications}
        loading={loading}
        onMarkAsRead={handleMarkAsRead}
        onMarkAsUnread={handleMarkAsUnread}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        updating={updating}
      />

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedNotification(null);
        }}
        onConfirm={confirmDelete}
        notification={selectedNotification}
        loading={updating[selectedNotification?.id.toString() || '']}
      />

      <ClearAllConfirmationModal
        isOpen={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={confirmClearAll}
        notificationCount={totalNotifications}
        loading={false}
      />

      <NotificationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />
    </div>
  );
};
