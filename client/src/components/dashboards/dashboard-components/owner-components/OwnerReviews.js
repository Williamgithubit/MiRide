import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaSync, FaStar, FaEye, FaCheck, FaClock, FaEyeSlash } from 'react-icons/fa';
import { useGetOwnerReviewsQuery, useGetReviewStatsQuery, useModerateReviewMutation, useDeleteOwnerReviewMutation } from '../../../../store/Review/ownerReviewApi';
import ReviewsTable from './review-components/ReviewsTable';
import { ReviewDetailsModal, ModerationModal, DeleteConfirmationModal } from './review-components/ReviewActionModals';
export const OwnerReviews = () => {
    const [updating, setUpdating] = useState({});
    const [selectedReview, setSelectedReview] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showModerationModal, setShowModerationModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [moderationAction, setModerationAction] = useState('approve');
    // API hooks
    const { data: reviewsResponse, isLoading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useGetOwnerReviewsQuery({ limit: 50, offset: 0 });
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetReviewStatsQuery();
    const [moderateReview] = useModerateReviewMutation();
    const [deleteReview] = useDeleteOwnerReviewMutation();
    const reviews = reviewsResponse?.reviews || [];
    const totalReviews = reviewsResponse?.total || 0;
    // Handle moderation
    const handleModerate = (review, action) => {
        setSelectedReview(review);
        setModerationAction(action);
        setShowModerationModal(true);
    };
    const confirmModeration = async (action, reason) => {
        if (!selectedReview)
            return;
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
        }
        catch (error) {
            console.error(`Error ${action}ing review:`, error);
            toast.error(`Failed to ${action} review`);
        }
        finally {
            setUpdating(prev => ({ ...prev, [selectedReview.id]: false }));
        }
    };
    // Handle delete
    const handleDelete = (reviewId) => {
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
            setSelectedReview(review);
            setShowDeleteModal(true);
        }
    };
    const confirmDelete = async () => {
        if (!selectedReview)
            return;
        try {
            setUpdating(prev => ({ ...prev, [selectedReview.id]: true }));
            await deleteReview(selectedReview.id).unwrap();
            toast.success('Review deleted successfully!');
            setShowDeleteModal(false);
            setSelectedReview(null);
            refetchReviews();
            refetchStats();
        }
        catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
        finally {
            setUpdating(prev => ({ ...prev, [selectedReview.id]: false }));
        }
    };
    // Handle view details
    const handleViewDetails = (review) => {
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight text-gray-900 dark:text-white", children: "Customer Reviews" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: "Manage and moderate customer reviews for your vehicles" })] }), _jsx("div", { className: "flex items-center justify-end", children: _jsxs("button", { onClick: () => {
                                refetchReviews();
                                refetchStats();
                            }, disabled: reviewsLoading, className: "px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2", children: [_jsx(FaSync, { className: `w-4 h-4 ${reviewsLoading ? 'animate-spin' : ''}` }), _jsx("span", { className: "hidden sm:inline", children: reviewsLoading ? "Refreshing..." : "Refresh" }), _jsx("span", { className: "sm:hidden", children: "\u21BB" })] }) })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center", children: _jsx(FaEye, { className: "w-4 h-4 text-blue-600 dark:text-blue-400" }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Total Reviews" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: statsLoading ? '...' : stats?.totalReviews || 0 })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center", children: _jsx(FaStar, { className: "w-4 h-4 text-yellow-600 dark:text-yellow-400" }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Average Rating" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: statsLoading ? '...' : (stats?.averageRating || 0).toFixed(1) })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center", children: _jsx(FaCheck, { className: "w-4 h-4 text-green-600 dark:text-green-400" }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Published" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: statsLoading ? '...' : stats?.publishedReviews || 0 })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center", children: _jsx(FaClock, { className: "w-4 h-4 text-yellow-600 dark:text-yellow-400" }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Pending" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: statsLoading ? '...' : stats?.pendingReviews || 0 })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center", children: _jsx(FaEyeSlash, { className: "w-4 h-4 text-gray-600 dark:text-gray-400" }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Hidden" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: statsLoading ? '...' : stats?.hiddenReviews || 0 })] })] }) })] }), _jsx(ReviewsTable, { reviews: reviews, loading: reviewsLoading, onViewDetails: handleViewDetails, onModerate: handleModerate, onDelete: handleDelete, updating: updating }), _jsx(ReviewDetailsModal, { isOpen: showDetailsModal, onClose: () => {
                    setShowDetailsModal(false);
                    setSelectedReview(null);
                }, review: selectedReview }), _jsx(ModerationModal, { isOpen: showModerationModal, onClose: () => {
                    setShowModerationModal(false);
                    setSelectedReview(null);
                }, onConfirm: confirmModeration, review: selectedReview, action: moderationAction, loading: updating[selectedReview?.id || ''] }), _jsx(DeleteConfirmationModal, { isOpen: showDeleteModal, onClose: () => {
                    setShowDeleteModal(false);
                    setSelectedReview(null);
                }, onConfirm: confirmDelete, review: selectedReview, loading: updating[selectedReview?.id || ''] })] }));
};
