// client/src/components/dashboards/dashboard-components/owner-components/ReviewsSection.tsx
import { useState, useEffect } from "react";
import Table from "../../shared/Table";
import toast from "react-hot-toast";
import {
  Star,
  MessageSquare,
  Reply,
  TrendingUp,
  Award,
  BarChart3,
  Trash2,
} from "lucide-react";
import {
  useGetReviewsByOwnerQuery,
  useGetReviewStatsQuery,
  useUpdateReviewResponseMutation,
  useDeleteReviewMutation,
} from "../../../../store/Review/reviewApi";

interface Review {
  id: number;
  carId: number;
  customerId: string;
  rentalId: number;
  rating: number;
  comment: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  car: {
    id: number;
    name: string;
    model: string;
    brand: string;
    year: number;
    imageUrl: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  rental: {
    id: number;
    startDate: string;
    endDate: string;
    totalCost: number;
  };
}

// ReviewStats intentionally omitted — inferred from API response where used.

export const ReviewsSection = () => {
  console.log("ReviewsSection component is rendering");

  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");

  // Use RTK Query hooks
  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useGetReviewsByOwnerQuery();

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useGetReviewStatsQuery();

  const [updateReviewResponse] = useUpdateReviewResponseMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const loading = reviewsLoading || statsLoading;

  // Handle errors and debug
  useEffect(() => {
    console.log("Reviews data:", reviews);
    console.log("Reviews loading:", reviewsLoading);
    console.log("Reviews error:", reviewsError);
    console.log("Stats data:", stats);
    console.log("Stats loading:", statsLoading);
    console.log("Stats error:", statsError);

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      toast.error("Failed to load reviews");
    }
    if (statsError) {
      console.error("Error fetching review stats:", statsError);
      toast.error("Failed to load review statistics");
    }
  }, [reviews, reviewsLoading, reviewsError, stats, statsLoading, statsError]);

  const handleSubmitResponse = async (reviewId: number) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      await updateReviewResponse({
        id: reviewId,
        response: responseText,
      }).unwrap();
      setRespondingTo(null);
      setResponseText("");
      toast.success("Response submitted successfully");
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Failed to submit response");
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await deleteReview(reviewId).unwrap();
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500";
    if (rating >= 3) return "text-yellow-500";
    return "text-red-500";
  };

  const columns = [
    {
      key: "car",
      label: "Vehicle",
      render: (value: unknown, row: Review) => (
        <div className="flex items-center gap-3">
          <img
            src={row.car.imageUrl || "/placeholder-car.jpg"}
            alt={`${row.car.brand} ${row.car.model}`}
            className="w-12 h-12 rounded-md object-cover"
          />
          <div>
            <div className="font-medium text-white">
              {row.car.brand} {row.car.model}
            </div>
            <div className="text-sm text-gray-400">{row.car.year}</div>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: unknown, row: Review) => (
        <div>
          <div className="font-medium text-white">{row.customer.name}</div>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Verified
          </span>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: unknown, row: Review) => (
        <div className="flex items-center gap-2">
          {renderStars(row.rating)}
          <span className={`font-medium ${getRatingColor(row.rating)}`}>
            {row.rating}/5
          </span>
        </div>
      ),
    },
    {
      key: "review",
      label: "Review",
      render: (value: unknown, row: Review) => (
        <div className="max-w-md">
          <div className="text-sm text-gray-300">{row.comment}</div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(row.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: "response",
      label: "Response",
      render: (value: unknown, row: Review) => (
        <div className="max-w-md">
          {row.response ? (
            <div className="text-sm text-gray-300">
              <div className="font-medium text-blue-400 mb-1">
                Owner Response:
              </div>
              {row.response}
            </div>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              No Response
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: unknown, row: Review) => (
        <div className="flex gap-2">
          <button
            onClick={() => setRespondingTo(row.id)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Reply"
          >
            <Reply className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteReview(row.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (reviewsError || statsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          {reviewsError
            ? "Failed to load reviews"
            : "Failed to load review statistics"}
        </p>
        <button
          onClick={() => refetchReviews()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Customer Reviews
        </h2>
        <button
          onClick={() => refetchReviews()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-white">Total Reviews</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.totalReviews}
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <h3 className="font-medium text-white">Average Rating</h3>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-bold text-white">
                {stats.averageRating.toFixed(1)}
              </p>
              {renderStars(stats.averageRating)}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Reply className="h-5 w-5 text-orange-500" />
              <h3 className="font-medium text-white">Pending Responses</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">0</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-white">5-Star Reviews</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.ratingDistribution[5] || 0}
            </p>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                stats.ratingDistribution[
                  rating as keyof typeof stats.ratingDistribution
                ] || 0;
              const percentage =
                stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-white">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-300 w-12 text-sm">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-gray-800 rounded-lg">
        <Table
          columns={columns}
          data={reviews}
          searchable={true}
          pagination={true}
          pageSize={10}
          loading={loading}
        />
      </div>

      {/* Response Modal */}
      {respondingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Respond to Review
            </h3>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Enter your response..."
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleSubmitResponse(respondingTo)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Response
              </button>
              <button
                onClick={() => {
                  setRespondingTo(null);
                  setResponseText("");
                }}
                className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
