import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaSync,
  FaStar,
  FaEye,
  FaCheck,
  FaClock,
  FaEyeSlash
} from 'react-icons/fa';
import {
  useGetOwnerReviewsQuery,
  useGetReviewStatsQuery,
  useModerateReviewMutation,
  useDeleteOwnerReviewMutation,
  OwnerReview
} from '../../../../store/Review/ownerReviewApi';
import ReviewsTable from './review-components/ReviewsTable';
import {
  ReviewDetailsModal,
  ModerationModal,
  DeleteConfirmationModal
} from './review-components/ReviewActionModals';

export const OwnerReviews = () => {
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [selectedReview, setSelectedReview] = useState<OwnerReview | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'hide'>('approve');

  // API hooks
  const {
    data: reviewsResponse,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews
  } = useGetOwnerReviewsQuery({ limit: 50, offset: 0 });

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useGetReviewStatsQuery();

  const [moderateReview] = useModerateReviewMutation();
  const [deleteReview] = useDeleteOwnerReviewMutation();

  const reviews = reviewsResponse?.reviews || [];
  const totalReviews = reviewsResponse?.total || 0;

  // Handle moderation
  const handleModerate = (review: OwnerReview, action: 'approve' | 'reject' | 'hide') => {
    setSelectedReview(review);
    setModerationAction(action);
    setShowModerationModal(true);
  };

  const confirmModeration = async (action: 'approve' | 'reject' | 'hide', reason?: string) => {
    if (!selectedReview) return;

    try {
      setUpdating(prev => ({ ...prev, [selectedReview.id]: true }));
      await moderateReview({
        id: selectedReview.id,
        action,
        reason
      }).unwrap();
      
      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'hidden';
      toast.success(`Review ${actionText} successfully!`);
      setShowModerationModal(false);
      setSelectedReview(null);
      refetchReviews();
      refetchStats();
    } catch (error) {
      console.error(`Error ${action}ing review:`, error);
      toast.error(`Failed to ${action} review`);
    } finally {
      setUpdating(prev => ({ ...prev, [selectedReview.id]: false }));
    }
  };

  // Handle delete
  const handleDelete = (reviewId: number) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      setSelectedReview(review);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!selectedReview) return;

    try {
      setUpdating(prev => ({ ...prev, [selectedReview.id]: true }));
      await deleteReview(selectedReview.id).unwrap();
      toast.success('Review deleted successfully!');
      setShowDeleteModal(false);
      setSelectedReview(null);
      refetchReviews();
      refetchStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setUpdating(prev => ({ ...prev, [selectedReview.id]: false }));
    }
  };

  // Handle view details
  const handleViewDetails = (review: OwnerReview) => {
    setSelectedReview(review);
    setShowDetailsModal(true);
  };

  // Handle errors
  React.useEffect(() => {
    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      toast.error('Failed to load reviews');
    }
  }, [reviewsError]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Customer Reviews
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and moderate customer reviews for your vehicles
          </p>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={() => {
              refetchReviews();
              refetchStats();
            }}
            disabled={reviewsLoading}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
          >
            <FaSync className={`w-3 h-3 sm:w-4 sm:h-4 ${reviewsLoading ? 'animate-spin' : ''}`} />
            <span>{reviewsLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FaEye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-2 sm:ml-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Reviews
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : stats?.totalReviews || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <FaStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-2 sm:ml-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Rating
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : (stats?.averageRating || 0).toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-2 sm:ml-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Published
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : stats?.publishedReviews || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <FaClock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-2 sm:ml-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : stats?.pendingReviews || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <FaEyeSlash className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="ml-2 sm:ml-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Hidden
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? '...' : stats?.hiddenReviews || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <ReviewsTable
        reviews={reviews}
        loading={reviewsLoading}
        onViewDetails={handleViewDetails}
        onModerate={handleModerate}
        onDelete={handleDelete}
        updating={updating}
      />

      {/* Modals */}
      <ReviewDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
      />

      <ModerationModal
        isOpen={showModerationModal}
        onClose={() => {
          setShowModerationModal(false);
          setSelectedReview(null);
        }}
        onConfirm={confirmModeration}
        review={selectedReview}
        action={moderationAction}
        loading={updating[selectedReview?.id || '']}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReview(null);
        }}
        onConfirm={confirmDelete}
        review={selectedReview}
        loading={updating[selectedReview?.id || '']}
      />
    </div>
  );
};
