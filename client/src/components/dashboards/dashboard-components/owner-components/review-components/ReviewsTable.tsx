import React, { useState, useMemo } from 'react';
import { 
  FaEye, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaEyeSlash,
  FaUser
} from 'react-icons/fa';
import { format } from 'date-fns';
import { OwnerReview } from '../../../../../store/Review/ownerReviewApi';
import StarRating from './StarRating';
import ReviewStatusBadge from './ReviewStatusBadge';

interface ReviewsTableProps {
  reviews: OwnerReview[];
  loading?: boolean;
  onViewDetails: (review: OwnerReview) => void;
  onModerate: (review: OwnerReview, action: 'approve' | 'reject' | 'hide') => void;
  onDelete: (reviewId: number) => void;
  updating?: Record<string, boolean>;
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({
  reviews,
  loading = false,
  onViewDetails,
  onModerate,
  onDelete,
  updating = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter and search reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = 
        review.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${review.car.make} ${review.car.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
      
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, searchTerm, statusFilter, ratingFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, ratingFilter]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'pending', label: 'Pending' },
    { value: 'hidden', label: 'Hidden' }
  ];

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              placeholder="Search reviews by customer, car, or comment..."
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

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {ratingOptions.map((option) => (
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
          Showing {paginatedReviews.length} of {filteredReviews.length} reviews
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {paginatedReviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FaSearch className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reviews found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No reviews available at the moment.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                      Car
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-2/6">
                      Review
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12">
                      Date
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
                  {paginatedReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {/* Car */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img
                            src={review.car.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
                            alt={`${review.car.make} ${review.car.model}`}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {review.car.make} {review.car.model}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {review.car.year}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            {review.customer.avatar ? (
                              <img
                                src={review.customer.avatar}
                                alt={review.customer.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <FaUser className="text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {review.customer.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                              {review.customer.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StarRating rating={review.rating} size="sm" showNumber />
                      </td>

                      {/* Review */}
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                            {review.comment || 'No comment provided.'}
                          </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(review.createdAt)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <ReviewStatusBadge status={review.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onViewDetails(review)}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>

                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onModerate(review, 'approve')}
                                disabled={updating[review.id.toString()]}
                                className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve Review"
                              >
                                <FaCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onModerate(review, 'reject')}
                                disabled={updating[review.id.toString()]}
                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject Review"
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {review.status === 'published' && (
                            <button
                              onClick={() => onModerate(review, 'hide')}
                              disabled={updating[review.id.toString()]}
                              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Hide Review"
                            >
                              <FaEyeSlash className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onDelete(review.id)}
                            disabled={updating[review.id.toString()]}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Review"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedReviews.map((review) => (
                <div key={review.id} className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <img
                        src={review.car.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
                        alt={`${review.car.make} ${review.car.model}`}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.car.make} {review.car.model} ({review.car.year})
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {review.customer.name} • {formatDate(review.createdAt)}
                        </div>
                        <div className="mt-2">
                          <StarRating rating={review.rating} size="sm" showNumber />
                        </div>
                      </div>
                    </div>
                    <ReviewStatusBadge status={review.status} size="sm" />
                  </div>

                  {/* Review Comment */}
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {review.comment || 'No comment provided.'}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => onViewDetails(review)}
                      className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <FaEye className="w-4 h-4" />
                      <span>View</span>
                    </button>

                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onModerate(review, 'approve')}
                          disabled={updating[review.id.toString()]}
                          className="px-3 py-2 text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                        >
                          <FaCheck className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onModerate(review, 'reject')}
                          disabled={updating[review.id.toString()]}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                        >
                          <FaTimes className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {review.status === 'published' && (
                      <button
                        onClick={() => onModerate(review, 'hide')}
                        disabled={updating[review.id.toString()]}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                      >
                        <FaEyeSlash className="w-4 h-4" />
                        <span>Hide</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(review.id)}
                      disabled={updating[review.id.toString()]}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                    >
                      <FaTrash className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300 order-2 sm:order-1">
                    <span className="hidden sm:inline">
                      Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredReviews.length)} of {filteredReviews.length} results
                    </span>
                    <span className="sm:hidden">
                      {startIndex + 1}-{Math.min(startIndex + pageSize, filteredReviews.length)} of {filteredReviews.length}
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

export default ReviewsTable;
