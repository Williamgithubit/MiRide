import React from 'react';
import { FaTimes, FaTrash, FaExclamationTriangle, FaCheck, FaWrench, FaCar } from 'react-icons/fa';
import { CarMaintenanceRecord } from '../../../../../store/Maintenance/maintenanceApi';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  record: CarMaintenanceRecord | null;
  loading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  loading = false
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <FaTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Maintenance Record
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <img
                src={record.car.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
                alt={`${record.car.make} ${record.car.model}`}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {record.car.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {record.type.charAt(0).toUpperCase() + record.type.slice(1)} - {record.description}
                </div>
                <div className="mt-1">
                  <MaintenanceStatusBadge status={record.status} priority={record.priority} size="sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <FaExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-300">
              <p className="font-medium">Are you sure you want to delete this maintenance record?</p>
              <p className="mt-1">This will permanently remove all maintenance history and cannot be recovered.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>Delete Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface MaintenanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CarMaintenanceRecord | null;
}

export const MaintenanceDetailsModal: React.FC<MaintenanceDetailsModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  if (!isOpen || !record) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FaWrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Maintenance Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Complete maintenance record information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Car Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FaCar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vehicle Information</h3>
            </div>
            <div className="flex items-center space-x-4">
              <img
                src={record.car.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
                alt={`${record.car.make} ${record.car.model}`}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {record.car.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {record.car.make} {record.car.model} ({record.car.year})
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Maintenance Type
                </label>
                <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {record.type.replace('_', ' ')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </label>
                <MaintenanceStatusBadge status={record.status} priority={record.priority} size="md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Cost
                </label>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(record.cost)}
                </div>
              </div>

              {record.mileage && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Mileage
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {record.mileage.toLocaleString()} miles
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Scheduled Date
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {formatDate(record.scheduledDate)}
                </div>
              </div>

              {record.completedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Completed Date
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDate(record.completedDate)}
                  </div>
                </div>
              )}

              {record.serviceProvider && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Service Provider
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {record.serviceProvider}
                  </div>
                </div>
              )}

              {record.nextServiceDue && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Next Service Due
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDate(record.nextServiceDue)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Description
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
              {record.description}
            </div>
          </div>

          {/* Notes */}
          {record.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Additional Notes
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                {record.notes}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Created
              </label>
              <div className="text-sm text-gray-900 dark:text-white">
                {formatDate(record.createdAt)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Last Updated
              </label>
              <div className="text-sm text-gray-900 dark:text-white">
                {formatDate(record.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface CompleteMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  record: CarMaintenanceRecord | null;
  loading?: boolean;
}

export const CompleteMaintenanceModal: React.FC<CompleteMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  loading = false
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <FaCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mark as Completed
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Confirm maintenance completion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <img
                src={record.car.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
                alt={`${record.car.make} ${record.car.model}`}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {record.car.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {record.type.charAt(0).toUpperCase() + record.type.slice(1)} - {record.description}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <FaCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800 dark:text-green-300">
              <p className="font-medium">Mark this maintenance as completed?</p>
              <p className="mt-1">This will update the status and set the completion date to today.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>Mark Completed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
