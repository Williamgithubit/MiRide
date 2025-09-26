import React, { useState, useMemo } from 'react';
import { 
  FaEye, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaBell,
  FaCheck,
  FaTimes,
  FaCar,
  FaUser,
  FaCalendarAlt,
  FaDollarSign,
  FaStar,
  FaCog
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
import { OwnerNotification } from '../../../../../store/Notification/ownerNotificationApi';
import NotificationStatusBadge from './NotificationStatusBadge';

interface NotificationsTableProps {
  notifications: OwnerNotification[];
  loading?: boolean;
  onMarkAsRead: (notificationId: number) => void;
  onMarkAsUnread: (notificationId: number) => void;
  onDelete: (notificationId: number) => void;
  onViewDetails: (notification: OwnerNotification) => void;
  updating?: Record<string, boolean>;
}

const NotificationsTable: React.FC<NotificationsTableProps> = ({
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onViewDetails,
  updating = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.relatedItem?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'read' && notification.isRead) ||
        (statusFilter === 'unread' && !notification.isRead);
      const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [notifications, searchTerm, typeFilter, statusFilter, priorityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, priorityFilter]);

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request': return FaCalendarAlt;
      case 'payment_received': return FaDollarSign;
      case 'booking_approved': return FaCheck;
      case 'booking_cancelled': return FaTimes;
      case 'customer_review': return FaStar;
      case 'system_alert': return FaCog;
      case 'maintenance_reminder': return FaCar;
      default: return FaBell;
    }
  };

  const getRelatedItemIcon = (type?: string) => {
    switch (type) {
      case 'car': return FaCar;
      case 'customer': return FaUser;
      case 'booking': return FaCalendarAlt;
      default: return FaBell;
    }
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'booking_request', label: 'Booking Requests' },
    { value: 'payment_received', label: 'Payments' },
    { value: 'booking_approved', label: 'Approved Bookings' },
    { value: 'booking_cancelled', label: 'Cancelled Bookings' },
    { value: 'customer_review', label: 'Customer Reviews' },
    { value: 'system_alert', label: 'System Alerts' },
    { value: 'maintenance_reminder', label: 'Maintenance' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FaFilter />
              <span className="hidden sm:inline">Filters:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {paginatedNotifications.length} of {filteredNotifications.length} notifications
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {paginatedNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FaBell className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No notifications available at the moment.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-2/6">
                      Message
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                      Related Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const RelatedIcon = getRelatedItemIcon(notification.relatedItem?.type);
                    
                    return (
                      <tr 
                        key={notification.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          !notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        {/* Type */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              notification.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' :
                              notification.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                              notification.priority === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              'bg-green-100 dark:bg-green-900/30'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                notification.priority === 'urgent' ? 'text-red-600 dark:text-red-400' :
                                notification.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                                notification.priority === 'medium' ? 'text-blue-600 dark:text-blue-400' :
                                'text-green-600 dark:text-green-400'
                              }`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {notification.type.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {notification.priority} priority
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Message */}
                        <td className="px-4 py-4">
                          <div className="max-w-xs">
                            <div className={`text-sm font-medium mb-1 ${
                              !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {notification.message}
                            </div>
                          </div>
                        </td>

                        {/* Related Item */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {notification.relatedItem ? (
                            <div className="flex items-center space-x-2">
                              <RelatedIcon className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm text-gray-900 dark:text-white capitalize">
                                  {notification.relatedItem.type}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                  {notification.relatedItem.name}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatTimestamp(notification.createdAt)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <NotificationStatusBadge 
                            status={notification.isRead ? 'read' : 'unread'} 
                            priority={notification.priority}
                            size="sm" 
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onViewDetails(notification)}
                              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => notification.isRead ? onMarkAsUnread(notification.id) : onMarkAsRead(notification.id)}
                              disabled={updating[notification.id.toString()]}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                notification.isRead 
                                  ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                  : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                              title={notification.isRead ? "Mark as Unread" : "Mark as Read"}
                            >
                              {notification.isRead ? <FaTimes className="w-4 h-4" /> : <FaCheck className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => onDelete(notification.id)}
                              disabled={updating[notification.id.toString()]}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete Notification"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const RelatedIcon = getRelatedItemIcon(notification.relatedItem?.type);
                
                return (
                  <div 
                    key={notification.id} 
                    className={`p-4 space-y-4 ${
                      !notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notification.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' :
                          notification.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                          notification.priority === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-green-100 dark:bg-green-900/30'
                        }`}>
                          <IconComponent className={`w-5 h-5 ${
                            notification.priority === 'urgent' ? 'text-red-600 dark:text-red-400' :
                            notification.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                            notification.priority === 'medium' ? 'text-blue-600 dark:text-blue-400' :
                            'text-green-600 dark:text-green-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium mb-1 ${
                            !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {notification.message}
                          </div>
                        </div>
                      </div>
                      <NotificationStatusBadge 
                        status={notification.isRead ? 'read' : 'unread'} 
                        priority={notification.priority}
                        size="sm" 
                      />
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Type</div>
                        <div className="text-gray-900 dark:text-white capitalize">
                          {notification.type.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Time</div>
                        <div className="text-gray-900 dark:text-white">
                          {formatTimestamp(notification.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Related Item */}
                    {notification.relatedItem && (
                      <div className="flex items-center space-x-2 text-sm">
                        <RelatedIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">Related:</span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {notification.relatedItem.type} - {notification.relatedItem.name}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => onViewDetails(notification)}
                        className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => notification.isRead ? onMarkAsUnread(notification.id) : onMarkAsRead(notification.id)}
                        disabled={updating[notification.id.toString()]}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1 ${
                          notification.isRead 
                            ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                            : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        {notification.isRead ? <FaTimes className="w-4 h-4" /> : <FaCheck className="w-4 h-4" />}
                        <span>{notification.isRead ? 'Unread' : 'Read'}</span>
                      </button>

                      <button
                        onClick={() => onDelete(notification.id)}
                        disabled={updating[notification.id.toString()]}
                        className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                      >
                        <FaTrash className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300 order-2 sm:order-1">
                    <span className="hidden sm:inline">
                      Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredNotifications.length)} of {filteredNotifications.length} results
                    </span>
                    <span className="sm:hidden">
                      {startIndex + 1}-{Math.min(startIndex + pageSize, filteredNotifications.length)} of {filteredNotifications.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 order-1 sm:order-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const isCurrentPage = page === currentPage;
                        // Show fewer pages on mobile
                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                        const showPage = isMobile 
                          ? (page === 1 || page === totalPages || page === currentPage)
                          : (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1);
                        
                        if (!showPage && page !== 2 && page !== totalPages - 1) {
                          return page === 2 || page === totalPages - 1 ? (
                            <span key={page} className="px-2 text-gray-500 hidden sm:inline">...</span>
                          ) : null;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm rounded-md ${
                              isCurrentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsTable;
