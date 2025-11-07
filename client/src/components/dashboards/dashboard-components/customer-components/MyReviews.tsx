import React, { useState, useMemo } from 'react';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaSpinner, 
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
  FaCar
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  useGetReviewsByCustomerQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  Review,
  CreateReview,
  UpdateReview
} from '@/store/Review/reviewApi';
import { useGetCustomerRentalsQuery, Rental } from '@/store/Rental/rentalApi';
import ReviewCard from './review-components/ReviewCard';
import ReviewForm from './review-components/ReviewForm';
import StarRating from './review-components/StarRating';

const MyReviews: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const itemsPerPage = 6;

  // API hooks
  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews
  } = useGetReviewsByCustomerQuery(user?.id || '', {
    skip: !user?.id
  });

  const {
    data: rentals = [],
    isLoading: rentalsLoading,
    error: rentalsError
  } = useGetCustomerRentalsQuery();

  const [createReview, { isLoading: createLoading }] = useCreateReviewMutation();
  const [updateReview, { isLoading: updateLoading }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: deleteLoading }] = useDeleteReviewMutation();

  // Get completed rentals that can be reviewed
  const completedRentals = useMemo(() => {
    if (!rentals || !Array.isArray(rentals)) {
      console.log('MyReviews - No rentals data or not an array:', rentals);
      return [];
    }
    
    console.log('MyReviews - Total rentals:', rentals.length);
    console.log('MyReviews - Rentals data:', rentals);
    
    const reviewedRentalIds = new Set(reviews.map(review => review.rentalId));
    const now = new Date();
    // Set to start of today for proper date comparison
    now.setHours(0, 0, 0, 0);
    
    const reviewableRentals = rentals.filter(rental => {
      if (!rental || !rental.id) return false;
      
      // Check if rental has already been reviewed
      if (reviewedRentalIds.has(rental.id)) {
        console.log(`MyReviews - Rental ${rental.id} already reviewed`);
        return false;
      }
      
      // Don't allow reviews for cancelled or rejected rentals
      if (rental.status === 'cancelled' || rental.status === 'rejected') {
        console.log(`MyReviews - Rental ${rental.id} is ${rental.status}, not reviewable`);
        return false;
      }
      
      // A rental is reviewable if:
      // 1. It has status 'completed', OR
      // 2. Its endDate has passed (regardless of status being 'active' or 'approved')
      const endDate = new Date(rental.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of the day
      const isCompleted = rental.status === 'completed';
      const hasEnded = endDate < now;
      
      console.log(`MyReviews - Rental ${rental.id}:`, {
        status: rental.status,
        endDate: rental.endDate,
        endDateObj: endDate,
        nowObj: now,
        isCompleted,
        hasEnded,
        isReviewable: isCompleted || hasEnded
      });
      
      return isCompleted || hasEnded;
    });
    
    console.log('MyReviews - Reviewable rentals:', reviewableRentals.length);
    return reviewableRentals;
  }, [rentals, reviews]);

  // Filter and search reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = searchTerm === '' || 
        (review.car?.brand && review.car.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.car?.model && review.car.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRating = ratingFilter === null || review.rating === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, ratingFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const handleCreateReview = (rental: Rental) => {
    setSelectedRental(rental);
    setSelectedReview(null);
    setFormMode('create');
    setShowReviewForm(true);
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setSelectedRental({
      id: review.rentalId,
      startDate: review.rental?.startDate || '',
      endDate: review.rental?.endDate || '',
      carId: review.carId,
      customerId: review.customerId, // Keep as string (UUID)
      status: 'completed',
      totalCost: review.rental?.totalCost || 0,
      createdAt: review.rental?.createdAt || new Date().toISOString(), // Add required field
      updatedAt: review.rental?.updatedAt || new Date().toISOString(), // Add required field
      car: review.car
    } as Rental);
    setFormMode('edit');
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId).unwrap();
      toast.success('Review deleted successfully!');
      refetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review. Please try again.');
    }
  };

  const handleSubmitReview = async (reviewData: CreateReview | UpdateReview) => {
    try {
      if (formMode === 'create') {
        await createReview(reviewData as CreateReview).unwrap();
      } else {
        await updateReview(reviewData as UpdateReview).unwrap();
      }
      refetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const handleCloseForm = () => {
    setShowReviewForm(false);
    setSelectedReview(null);
    setSelectedRental(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (reviewsLoading || rentalsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load reviews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Reviews</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your car rental reviews and feedback
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaStar className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{reviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarRating rating={averageRating} size="md" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {(Number(averageRating) || 0).toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaPlus className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Can Review</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedRentals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews Section */}
      {completedRentals.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Completed Rentals - Write Reviews
            </h3>
            <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {completedRentals.length} pending
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedRentals.slice(0, 6).map((rental) => (
              <div
                key={rental.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={rental.car?.images?.[0]?.imageUrl || rental.car?.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiAxOEgzNkwzNCAyN0gzMFYyNEgyN1YyN0gyMlYyNEgxOVYyN0gxNVYyNEgxM1YyN0gxMkwxOCAxOFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K'}
                    alt={`${rental.car?.brand} ${rental.car?.model}`}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiAxOEgzNkwzNCAyN0gzMFYyNEgyN1YyN0gyMlYyNEgxOVYyN0gxNVYyNEgxM1YyN0gxMkwxOCAxOFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {rental.car?.brand} {rental.car?.model}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCreateReview(rental)}
                  className="w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>Write Review</span>
                </button>
              </div>
            ))}
          </div>
          {completedRentals.length > 6 && (
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-4">
              And {completedRentals.length - 6} more completed rentals...
            </p>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reviews by car or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-400 w-4 h-4" />
          <select
            value={ratingFilter || ''}
            onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <FaCar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {reviews.length === 0 ? 'No reviews yet' : 'No reviews found'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {reviews.length === 0 
              ? 'Complete a rental to write your first review'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {completedRentals.length > 0 && (
            <button
              onClick={() => handleCreateReview(completedRentals[0])}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>Write Your First Review</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paginatedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                loading={deleteLoading}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Review Form Modal */}
      {showReviewForm && selectedRental && (
        <ReviewForm
          isOpen={showReviewForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitReview}
          loading={createLoading || updateLoading}
          review={selectedReview}
          carInfo={{
            id: selectedRental.carId || selectedReview?.carId || 0,
            name: selectedRental.car?.name || `${selectedReview?.car?.brand || ''} ${selectedReview?.car?.model || ''}`.trim() || 'Unknown Car',
            model: selectedRental.car?.model || selectedReview?.car?.model || '',
            brand: selectedRental.car?.brand || selectedReview?.car?.brand || '',
            year: selectedRental.car?.year || selectedReview?.car?.year || new Date().getFullYear(),
            imageUrl: selectedRental.car?.images?.[0]?.imageUrl || selectedRental.car?.imageUrl || selectedReview?.car?.images?.[0]?.imageUrl || selectedReview?.car?.imageUrl
          }}
          rentalInfo={{
            id: selectedRental.id,
            startDate: selectedRental.startDate,
            endDate: selectedRental.endDate
          }}
          mode={formMode}
        />
      )}
    </div>
  );
};

export default MyReviews;
