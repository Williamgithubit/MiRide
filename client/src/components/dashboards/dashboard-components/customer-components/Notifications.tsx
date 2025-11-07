import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaBell, 
  FaFilter, 
  FaSearch, 
  FaCheckDouble, 
  FaTrash, 
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaInbox
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  Notification
} from '../../../../store/Notification/notificationApi';
import NotificationCard from './notification-components/NotificationCard';
import ConfirmationModal from './notification-components/ConfirmationModal';
import NotificationDetailsModal from './notification-components/NotificationDetailsModal';

const Notifications: React.FC = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  // API hooks
  const { 
    data: notificationsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetNotificationsQuery({ 
    limit: itemsPerPage, 
    offset,
    unreadOnly: statusFilter === 'unread'
  });

  const { data: unreadCountData } = useGetUnreadCountQuery();
  
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAllNotifications] = useClearAllNotificationsMutation();

  // Real-time polling (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (!notificationsData?.notifications) return [];

    return notificationsData.notifications.filter(notification => {
      const matchesSearch = searchTerm === '' || 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'read' && notification.isRead) ||
        (statusFilter === 'unread' && !notification.isRead);

      const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;

      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [notificationsData?.notifications, searchTerm, typeFilter, statusFilter, priorityFilter]);

  // Pagination
  const totalPages = Math.ceil((notificationsData?.total || 0) / itemsPerPage);

  // Handlers
  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id).unwrap();
      toast.success('Notification updated');
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleDelete = (id: number) => {
    setSelectedNotificationId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedNotificationId) return;
    
    setIsDeleting(true);
    try {
      await deleteNotification(selectedNotificationId).unwrap();
      toast.success('Notification deleted');
      setShowDeleteModal(false);
      setSelectedNotificationId(null);
    } catch (error) {
      toast.error('Failed to delete notification');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead().unwrap();
      toast.success(`Marked ${result.updatedCount} notifications as read`);
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = () => {
    setShowClearAllModal(true);
  };

  const confirmClearAll = async () => {
    setIsClearing(true);
    try {
      const result = await clearAllNotifications().unwrap();
      toast.success(`Deleted ${result.deletedCount} notifications`);
      setCurrentPage(1);
      setShowClearAllModal(false);
    } catch (error) {
      toast.error('Failed to clear notifications');
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info('Notifications refreshed');
  };

  const handleView = async (notification: Notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    
    // Mark as read when viewing
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id).unwrap();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  // Notification type options
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'booking_approved', label: 'Booking Approved' },
    { value: 'booking_rejected', label: 'Booking Rejected' },
    { value: 'booking_cancelled', label: 'Booking Cancelled' },
    { value: 'payment_successful', label: 'Payment Successful' },
    { value: 'payment_failed', label: 'Payment Failed' },
    { value: 'rental_started', label: 'Rental Started' },
    { value: 'rental_completed', label: 'Rental Completed' },
    { value: 'system_alert', label: 'System Alert' },
    { value: 'maintenance_reminder', label: 'Maintenance Reminder' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <FaBell className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">
              Failed to load notifications. Please try again.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <FaBell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {unreadCountData?.unreadCount || 0} unread notifications
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <FaSyncAlt className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleMarkAllAsRead}
            className="px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center space-x-2"
          >
            <FaCheckDouble className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
          
          <button
            onClick={handleClearAll}
            className="px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-2"
          >
            <FaTrash className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FaFilter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          {(typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'read' | 'unread')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <FaInbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You\'re all caught up! No new notifications.'}
            </p>
          </div>
        ) : (
          <div className="p-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing {offset + 1} to {Math.min(offset + itemsPerPage, notificationsData?.total || 0)} of {notificationsData?.total || 0} notifications
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              <FaChevronLeft className="w-3 h-3" />
              <span>Previous</span>
            </button>
            
            <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              <span>Next</span>
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={confirmClearAll}
        title="Clear All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone and will permanently remove all your notifications."
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
        isLoading={isClearing}
      />

      {/* Delete Notification Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedNotificationId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Notification Details Modal */}
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

export default Notifications;
