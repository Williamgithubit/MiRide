import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store/store';
import {
  fetchAdminNotifications,
  setFilter,
  setPage,
  clearFilters,
  selectAll as selectAllNotificationsAction,
  clearSelection,
  bulkDeleteNotifications,
  clearAllNotifications,
  selectCurrentPageNotifications,
  selectNotificationFilters,
  selectNotificationPagination,
  selectSelectedNotifications,
  selectNotificationStatus,
  selectUnreadCount,
} from '../../../../../store/Admin/adminNotificationsSlice';
import NotificationsTable from './NotificationsTable';
import SendNotificationModal from './SendNotificationModal';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaTrash,
  FaBell,
  FaSync,
  FaCheckDouble,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AdminNotifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(selectCurrentPageNotifications);
  const filters = useSelector(selectNotificationFilters);
  const pagination = useSelector(selectNotificationPagination);
  const selectedNotifications = useSelector(selectSelectedNotifications);
  const status = useSelector(selectNotificationStatus);
  const unreadCount = useSelector(selectUnreadCount);

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminNotifications());
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter({ search: e.target.value }));
  };

  const handleFilterChange = (filterName: string, value: string) => {
    dispatch(setFilter({ [filterName]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleRefresh = () => {
    dispatch(fetchAdminNotifications());
    toast.success('Notifications refreshed');
  };

  const handleSelectAll = () => {
    dispatch(selectAllNotificationsAction());
  };

  const handleClearSelection = () => {
    dispatch(clearSelection());
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      toast.error('No notifications selected');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedNotifications.length} notification(s)?`
      )
    ) {
      try {
        await dispatch(bulkDeleteNotifications(selectedNotifications)).unwrap();
        toast.success('Notifications deleted successfully');
      } catch (error) {
        toast.error('Failed to delete notifications');
      }
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        'Are you sure you want to clear ALL notifications? This action cannot be undone.'
      )
    ) {
      try {
        await dispatch(clearAllNotifications()).unwrap();
        toast.success('All notifications cleared');
      } catch (error) {
        toast.error('Failed to clear notifications');
      }
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            pagination.currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaBell className="mr-2 sm:mr-3 text-blue-600" />
            Notifications Management
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Manage and send platform-wide notifications
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleRefresh}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center space-x-2 text-sm"
            disabled={status === 'loading'}
          >
            <FaSync className={status === 'loading' ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setIsSendModalOpen(true)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm"
          >
            <FaPlus />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Notifications
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {pagination.totalCount}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FaBell className="text-blue-600 dark:text-blue-400 text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Unread Notifications
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <FaBell className="text-yellow-600 dark:text-yellow-400 text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Selected
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedNotifications.length}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <FaCheckDouble className="text-green-600 dark:text-green-400 text-lg sm:text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center space-x-2 text-sm whitespace-nowrap"
          >
            <FaFilter />
            <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            <span className="sm:hidden">Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="System">System</option>
                <option value="Booking">Booking</option>
                <option value="Payment">Payment</option>
                <option value="Review">Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recipient
              </label>
              <select
                value={filters.recipient}
                onChange={(e) => handleFilterChange('recipient', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Recipients</option>
                <option value="All">All Users</option>
                <option value="Owner">Owners</option>
                <option value="Customer">Customers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="Read">Read</option>
                <option value="Unread">Unread</option>
              </select>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              {selectedNotifications.length} selected
            </p>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleClearSelection}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear
              </button>
              <button
                onClick={handleSelectAll}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Select All
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-1 sm:space-x-2"
              >
                <FaTrash className="text-xs" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {status === 'loading' ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <NotificationsTable
            notifications={notifications}
            selectedNotifications={selectedNotifications}
          />
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              {renderPagination()}
            </div>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Danger Zone
        </h3>
        <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mb-3">
          Clear all notifications from the system. This action cannot be undone.
        </p>
        <button
          onClick={handleClearAll}
          className="px-3 sm:px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
        >
          <FaTrash />
          <span>Clear All Notifications</span>
        </button>
      </div>

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />
    </div>
  );
};

export default AdminNotifications;
