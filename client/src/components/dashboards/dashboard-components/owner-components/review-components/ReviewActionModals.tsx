import React, { useState } from 'react';
import { FaTimes, FaCheck, FaEyeSlash, FaTrash, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import { OwnerReview } from '../../../../../store/Review/ownerReviewApi';
import StarRating from './StarRating';
import ReviewStatusBadge from './ReviewStatusBadge';
import { format } from 'date-fns';

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: OwnerReview | null;
}

export const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  isOpen,
  onClose,
  review
}) => {
  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Review Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Car and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Car Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Car Details
              </h4>
              <div className="flex items-center space-x-3">
                <img
                  src={(review.car as any).images?.[0]?.imageUrl || review.car.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
                  alt={`${(review.car as any).brand || review.car.make} ${review.car.model}`}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K';
                  }}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {(review.car as any).brand || review.car.make} {review.car.model}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {review.car.year}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer Details
              </h4>
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  {review.customer.avatar ? (
                    <img
                      src={review.customer.avatar}
                      alt={review.customer.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 text-lg font-semibold">
                      {review.customer.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {review.customer.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {review.customer.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Review Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                <StarRating rating={review.rating} size="lg" showNumber />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                <ReviewStatusBadge status={review.status} size="md" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Date</div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {format(new Date(review.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Review Comment</div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white leading-relaxed">
                  {review.comment || 'No comment provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'approve' | 'reject' | 'hide', reason?: string) => void;
  review: OwnerReview | null;
  action: 'approve' | 'reject' | 'hide';
  loading?: boolean;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  review,
  action,
  loading = false
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !review) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Approve Review',
          message: 'Are you sure you want to approve this review? It will be visible to all customers.',
          icon: FaCheck,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          requiresReason: false
        };
      case 'reject':
        return {
          title: 'Reject Review',
          message: 'Are you sure you want to reject this review? Please provide a reason.',
          icon: FaTimes,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-100',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          requiresReason: true
        };
      case 'hide':
        return {
          title: 'Hide Review',
          message: 'Are you sure you want to hide this review? It will not be visible to customers.',
          icon: FaEyeSlash,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-100',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          requiresReason: false
        };
    }
  };

  const config = getActionConfig();
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm(action, reason || undefined);
    setReason('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
              <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {config.message}
          </p>

          {/* Review Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {review.customer.name}
              </div>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {review.comment}
            </p>
          </div>

          {/* Reason Input */}
          {config.requiresReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for rejection *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this review..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || (config.requiresReason && !reason.trim())}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 ${config.buttonColor}`}
          >
            {loading ? 'Processing...' : config.title}
          </button>
        </div>
      </div>
    </div>
  );
};

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  review: OwnerReview | null;
  loading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  review,
  loading = false
}) => {
  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FaTrash className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <FaExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">
              This action cannot be undone. The review will be permanently deleted.
            </p>
          </div>

          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this review from <strong>{review.customer.name}</strong>?
          </p>

          {/* Review Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {review.customer.name}
              </div>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {review.comment}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Review'}
          </button>
        </div>
      </div>
    </div>
  );
};
