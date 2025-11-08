import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// client/src/components/dashboards/dashboard-components/owner-components/ReviewsSection.tsx
import { useState, useEffect } from "react";
import Table from "../../shared/Table";
import toast from "react-hot-toast";
import { Star, MessageSquare, Reply, TrendingUp, Award, BarChart3, Trash2, } from "lucide-react";
import { useGetReviewsByOwnerQuery, useGetReviewStatsQuery, useUpdateReviewResponseMutation, useDeleteReviewMutation, } from "../../../../store/Review/reviewApi";
// ReviewStats intentionally omitted — inferred from API response where used.
export const ReviewsSection = () => {
    console.log("ReviewsSection component is rendering");
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseText, setResponseText] = useState("");
    // Use RTK Query hooks
    const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError, refetch: refetchReviews, } = useGetReviewsByOwnerQuery();
    const { data: stats, isLoading: statsLoading, error: statsError, } = useGetReviewStatsQuery();
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
    const handleSubmitResponse = async (reviewId) => {
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
        }
        catch (error) {
            console.error("Error submitting response:", error);
            toast.error("Failed to submit response");
        }
    };
    const handleDeleteReview = async (reviewId) => {
        if (!confirm("Are you sure you want to delete this review?")) {
            return;
        }
        try {
            await deleteReview(reviewId).unwrap();
            toast.success("Review deleted successfully");
        }
        catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review");
        }
    };
    const renderStars = (rating) => {
        return (_jsx("div", { className: "flex items-center gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `h-4 w-4 ${star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"}` }, star))) }));
    };
    const getRatingColor = (rating) => {
        if (rating >= 4)
            return "text-green-500";
        if (rating >= 3)
            return "text-yellow-500";
        return "text-red-500";
    };
    const columns = [
        {
            key: "car",
            label: "Vehicle",
            render: (value, row) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: row.car.imageUrl || "/placeholder-car.jpg", alt: `${row.car.make} ${row.car.model}`, className: "w-12 h-12 rounded-md object-cover" }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium text-white", children: [row.car.make, " ", row.car.model] }), _jsx("div", { className: "text-sm text-gray-400", children: row.car.year })] })] })),
        },
        {
            key: "customer",
            label: "Customer",
            render: (value, row) => (_jsxs("div", { children: [_jsx("div", { className: "font-medium text-white", children: row.customer.name }), _jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "Verified" })] })),
        },
        {
            key: "rating",
            label: "Rating",
            render: (value, row) => (_jsxs("div", { className: "flex items-center gap-2", children: [renderStars(row.rating), _jsxs("span", { className: `font-medium ${getRatingColor(row.rating)}`, children: [row.rating, "/5"] })] })),
        },
        {
            key: "review",
            label: "Review",
            render: (value, row) => (_jsxs("div", { className: "max-w-md", children: [_jsx("div", { className: "text-sm text-gray-300", children: row.comment }), _jsx("div", { className: "text-xs text-gray-400 mt-1", children: new Date(row.createdAt).toLocaleDateString() })] })),
        },
        {
            key: "response",
            label: "Response",
            render: (value, row) => (_jsx("div", { className: "max-w-md", children: row.response ? (_jsxs("div", { className: "text-sm text-gray-300", children: [_jsx("div", { className: "font-medium text-blue-400 mb-1", children: "Owner Response:" }), row.response] })) : (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800", children: "No Response" })) })),
        },
        {
            key: "actions",
            label: "Actions",
            render: (value, row) => (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setRespondingTo(row.id), className: "p-1 text-blue-600 hover:bg-blue-100 rounded", title: "Reply", children: _jsx(Reply, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleDeleteReview(row.id), className: "p-1 text-red-600 hover:bg-red-100 rounded", title: "Delete", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })),
        },
    ];
    // Show loading state
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" }) }));
    }
    // Show error state
    if (reviewsError || statsError) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-red-500 mb-4", children: reviewsError
                        ? "Failed to load reviews"
                        : "Failed to load review statistics" }), _jsx("button", { onClick: () => refetchReviews(), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Retry" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight text-white", children: "Customer Reviews" }), _jsx("button", { onClick: () => refetchReviews(), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Refresh" })] }), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-gray-800 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "h-5 w-5 text-blue-500" }), _jsx("h3", { className: "font-medium text-white", children: "Total Reviews" })] }), _jsx("p", { className: "text-2xl font-bold text-white mt-2", children: stats.totalReviews })] }), _jsxs("div", { className: "bg-gray-800 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Award, { className: "h-5 w-5 text-yellow-500" }), _jsx("h3", { className: "font-medium text-white", children: "Average Rating" })] }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("p", { className: "text-2xl font-bold text-white", children: stats.averageRating.toFixed(1) }), renderStars(stats.averageRating)] })] }), _jsxs("div", { className: "bg-gray-800 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Reply, { className: "h-5 w-5 text-orange-500" }), _jsx("h3", { className: "font-medium text-white", children: "Pending Responses" })] }), _jsx("p", { className: "text-2xl font-bold text-white mt-2", children: "0" })] }), _jsxs("div", { className: "bg-gray-800 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-green-500" }), _jsx("h3", { className: "font-medium text-white", children: "5-Star Reviews" })] }), _jsx("p", { className: "text-2xl font-bold text-white mt-2", children: stats.ratingDistribution[5] || 0 })] })] })), stats && (_jsxs("div", { className: "bg-gray-800 p-6 rounded-lg", children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "Rating Distribution"] }), _jsx("div", { className: "space-y-3", children: [5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.ratingDistribution[rating] || 0;
                            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                            return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-1 w-16", children: [_jsx("span", { className: "text-white", children: rating }), _jsx(Star, { className: "h-4 w-4 fill-yellow-400 text-yellow-400" })] }), _jsx("div", { className: "flex-1 bg-gray-700 rounded-full h-2", children: _jsx("div", { className: "bg-yellow-400 h-2 rounded-full transition-all duration-300", style: { width: `${percentage}%` } }) }), _jsx("span", { className: "text-gray-300 w-12 text-sm", children: count })] }, rating));
                        }) })] })), _jsx("div", { className: "bg-gray-800 rounded-lg", children: _jsx(Table, { columns: columns, data: reviews, searchable: true, pagination: true, pageSize: 10, loading: loading }) }), respondingTo && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Respond to Review" }), _jsx("textarea", { value: responseText, onChange: (e) => setResponseText(e.target.value), placeholder: "Enter your response...", className: "w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none resize-none", rows: 4 }), _jsxs("div", { className: "flex gap-3 mt-4", children: [_jsx("button", { onClick: () => handleSubmitResponse(respondingTo), className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Submit Response" }), _jsx("button", { onClick: () => {
                                        setRespondingTo(null);
                                        setResponseText("");
                                    }, className: "flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700", children: "Cancel" })] })] }) }))] }));
};
