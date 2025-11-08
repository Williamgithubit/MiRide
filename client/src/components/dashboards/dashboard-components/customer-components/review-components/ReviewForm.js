import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import StarRating from './StarRating';
const ReviewForm = ({ isOpen, onClose, onSubmit, loading = false, review, carInfo, rentalInfo, mode }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState({});
    // Initialize form with existing review data if editing
    useEffect(() => {
        if (mode === 'edit' && review) {
            setRating(review.rating);
            setComment(review.comment);
        }
        else {
            setRating(0);
            setComment('');
        }
        setErrors({});
    }, [mode, review, isOpen]);
    const validateForm = () => {
        const newErrors = {};
        if (rating === 0) {
            newErrors.rating = 'Please select a rating';
        }
        if (!comment.trim()) {
            newErrors.comment = 'Please write a review comment';
        }
        else if (comment.trim().length < 10) {
            newErrors.comment = 'Review comment must be at least 10 characters';
        }
        else if (comment.trim().length > 1000) {
            newErrors.comment = 'Review comment must be less than 1000 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            const reviewData = {
                carId: carInfo.id,
                rentalId: rentalInfo.id,
                rating,
                comment: comment.trim(),
                ...(mode === 'edit' && review ? { id: review.id } : {})
            };
            await onSubmit(reviewData);
            toast.success(mode === 'create' ? 'Review submitted successfully!' : 'Review updated successfully!');
            onClose();
        }
        catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review. Please try again.');
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [_jsx("div", { className: "fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: "relative z-10 inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: mode === 'create' ? 'Write a Review' : 'Edit Review' }), _jsx("button", { onClick: onClose, className: "p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors", children: _jsx(FaTimes, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [_jsx("div", { className: "bg-gray-50 dark:bg-gray-700 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("img", { src: carInfo.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K', alt: `${carInfo.brand} ${carInfo.model}`, className: "w-16 h-16 rounded-lg object-cover", onError: (e) => {
                                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K';
                                                } }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium text-gray-900 dark:text-white", children: [carInfo.brand, " ", carInfo.model] }), _jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: [carInfo.year, " \u2022 Rented: ", formatDate(rentalInfo.startDate), " - ", formatDate(rentalInfo.endDate)] })] })] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Rating *" }), _jsx(StarRating, { rating: rating, interactive: true, onRatingChange: setRating, size: "lg", className: "mb-2" }), errors.rating && (_jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.rating }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "comment", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Review Comment *" }), _jsx("textarea", { id: "comment", value: comment, onChange: (e) => setComment(e.target.value), rows: 4, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none", placeholder: "Share your experience with this car...", maxLength: 1000 }), _jsxs("div", { className: "flex justify-between items-center mt-1", children: [errors.comment && (_jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.comment })), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400 ml-auto", children: [comment.length, "/1000"] })] })] }), _jsxs("div", { className: "flex space-x-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, disabled: loading, className: "flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: "flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center space-x-2", children: loading ? (_jsxs(_Fragment, { children: [_jsx(FaSpinner, { className: "w-4 h-4 animate-spin" }), _jsx("span", { children: mode === 'create' ? 'Submitting...' : 'Updating...' })] })) : (_jsxs(_Fragment, { children: [_jsx(FaSave, { className: "w-4 h-4" }), _jsx("span", { children: mode === 'create' ? 'Submit Review' : 'Update Review' })] })) })] })] })] })] }) }));
};
export default ReviewForm;
