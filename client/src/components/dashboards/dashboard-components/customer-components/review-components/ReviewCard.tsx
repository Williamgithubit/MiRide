import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCalendar, FaCar, FaEllipsisV, FaCheckCircle, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import StarRating from './StarRating';
import { Review } from '@/store/Review/reviewApi';

interface ReviewCardProps {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: number) => void;
  loading?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  loading = false
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  const getStatusBadge = () => {
    // For now, we'll assume all reviews are published
    // This can be extended based on backend implementation
    return (
      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
        <FaCheckCircle className="w-3 h-3" />
        <span className="text-xs font-medium">Published</span>
      </div>
    );
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit(review);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      onDelete(review.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <img
            src={review.car.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
            alt={`${review.car.make} ${review.car.model}`}
            className="w-16 h-16 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K';
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <FaCar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {review.car.make} {review.car.model}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({review.car.year})
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <FaCalendar className="w-3 h-3" />
                <span>
                  {review.rental 
                    ? `${formatDate(review.rental.startDate)} - ${formatDate(review.rental.endDate)}`
                    : 'Rental dates unavailable'
                  }
                </span>
              </div>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaEllipsisV className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Edit Review</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <FaTrash className="w-4 h-4" />
                  <span>Delete Review</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={review.rating} size="md" />
      </div>

      {/* Review Comment */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {review.comment}
        </p>
      </div>

      {/* Owner Response */}
      {review.response && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <FaCar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Owner Response
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {review.response}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span>
          Reviewed on {formatDateTime(review.createdAt)}
        </span>
        {review.updatedAt !== review.createdAt && (
          <span>
            Updated {formatDateTime(review.updatedAt)}
          </span>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ReviewCard;
