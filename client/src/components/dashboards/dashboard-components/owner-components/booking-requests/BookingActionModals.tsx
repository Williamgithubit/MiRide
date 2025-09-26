import React, { useState } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { BookingRequest } from './BookingRequestsTable';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: BookingRequest | null;
  loading?: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  loading = false
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative z-10 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <FaCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Approve Booking Request
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Confirm approval for this booking request
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={booking.car.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiAxOEgzNkwzNCAyN0gzMFYyNEgyN1YyN0gyMlYyNEgxOVYyN0gxNVYyNEgxM1YyN0gxMkwxOCAxOFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiAxOEgzNkwzNCAyN0gzMFYyNEgyN1YyN0gyMlYyNEgxOVYyN0gxNVYyNEgxM1YyN0gxMkwxOCAxOFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K';
                }}
                alt={`${booking.car.make} ${booking.car.model}`}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {booking.car.make} {booking.car.model} ({booking.car.year})
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Customer: {booking.customer.name}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div>Total Cost: <span className="font-medium">${(Number(booking.totalCost) || 0).toFixed(2)}</span></div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Approving this booking will make the car unavailable for the selected dates 
              and notify the customer that their booking has been confirmed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4" />
                  <span>Approve Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  booking: BookingRequest | null;
  loading?: boolean;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  loading = false
}) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const predefinedReasons = [
    'Car is not available for the selected dates',
    'Maintenance required during rental period',
    'Customer does not meet rental requirements',
    'Pricing error in the booking',
    'Other (please specify)'
  ];

  const handleConfirm = () => {
    const finalReason = reason === 'Other (please specify)' ? customReason : reason;
    if (finalReason.trim()) {
      onConfirm(finalReason.trim());
      setReason('');
      setCustomReason('');
    }
  };

  const handleClose = () => {
    setReason('');
    setCustomReason('');
    onClose();
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative z-10 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <FaTimes className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Reject Booking Request
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please provide a reason for rejection
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={booking.car.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiAxOEgzNkwzNCAyN0gzMFYyNEgyN1YyN0gyMlYyNEgxOVYyN0gxNVYyNEgxM1YyN0gxMkwxOCAxOFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiAxOEgzNkwzNCAyN0gzMFYyNEgyN1YyN0gyMlYyNEgxOVYyN0gxNVYyNEgxM1YyN0gxMkwxOCAxOFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K';
                }}
                alt={`${booking.car.make} ${booking.car.model}`}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {booking.car.make} {booking.car.model} ({booking.car.year})
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Customer: {booking.customer.name}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div>Total Cost: <span className="font-medium">${(Number(booking.totalCost) || 0).toFixed(2)}</span></div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Reason for rejection:
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((predefinedReason) => (
                <label key={predefinedReason} className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="reason"
                    value={predefinedReason}
                    checked={reason === predefinedReason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {predefinedReason}
                  </span>
                </label>
              ))}
            </div>

            {reason === 'Other (please specify)' && (
              <div className="mt-3">
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify the reason..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <FaExclamationTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Rejecting this booking will notify the customer and may initiate 
                a refund process if payment has been processed.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !reason || (reason === 'Other (please specify)' && !customReason.trim())}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <>
                  <FaTimes className="w-4 h-4" />
                  <span>Reject Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
