import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetReviewsByCustomerQuery, useCreateReviewMutation } from '../../../../../store/Review/reviewApi';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import ReviewForm from '../review-components/ReviewForm';
import { toast } from 'react-hot-toast';
const BookingHistoryTable = ({ bookings }) => {
    const { user } = useSelector((state) => state.auth);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    // Get customer reviews to check which bookings have been reviewed
    const { data: reviews = [] } = useGetReviewsByCustomerQuery(user?.id || '', {
        skip: !user?.id
    });
    const [createReview, { isLoading: createLoading }] = useCreateReviewMutation();
    // Create a set of reviewed booking IDs for quick lookup
    const reviewedBookingIds = useMemo(() => {
        return new Set(reviews.map(review => review.rentalId));
    }, [reviews]);
    // Sort bookings
    const sortedBookings = [...bookings].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        // Handle undefined/null values - put them at the end
        if (aValue == null && bValue == null)
            return 0;
        if (aValue == null)
            return sortDirection === 'asc' ? 1 : -1;
        if (bValue == null)
            return sortDirection === 'asc' ? -1 : 1;
        if (aValue < bValue)
            return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue)
            return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    // Pagination
    const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBookings = sortedBookings.slice(startIndex, startIndex + itemsPerPage);
    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    const canReview = (booking) => {
        return booking.status === 'completed' && !reviewedBookingIds.has(booking.id);
    };
    const handleWriteReview = (booking) => {
        setSelectedBooking(booking);
        setShowReviewForm(true);
    };
    const handleCloseReviewForm = () => {
        setShowReviewForm(false);
        setSelectedBooking(null);
    };
    const handleSubmitReview = async (reviewData) => {
        try {
            await createReview(reviewData).unwrap();
            toast.success('Review submitted successfully!');
            handleCloseReviewForm();
        }
        catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review. Please try again.');
        }
    };
    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return _jsx("span", { className: "text-gray-400", children: "\u2195\uFE0F" });
        }
        return _jsx("span", { children: sortDirection === 'asc' ? '↑' : '↓' });
    };
    if (!bookings || bookings.length === 0) {
        return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center", children: [_jsx("div", { className: "text-gray-400 text-4xl mb-4", children: "\uD83D\uDCCB" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No booking history" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Your completed and cancelled bookings will appear here." })] }));
    }
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsx("div", { className: "hidden md:block overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600", onClick: () => handleSort('car'), children: _jsxs("div", { className: "flex items-center gap-1", children: ["Car ", _jsx(SortIcon, { field: "car" })] }) }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600", onClick: () => handleSort('startDate'), children: _jsxs("div", { className: "flex items-center gap-1", children: ["Dates ", _jsx(SortIcon, { field: "startDate" })] }) }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Payment" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600", onClick: () => handleSort('totalAmount'), children: _jsxs("div", { className: "flex items-center gap-1", children: ["Amount ", _jsx(SortIcon, { field: "totalAmount" })] }) }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: paginatedBookings.map((booking) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0 h-10 w-10", children: booking.car?.imageUrl ? (_jsx("img", { className: "h-10 w-10 rounded-lg object-cover", src: booking.car.imageUrl, alt: `${booking.car.name} ${booking.car.model}` })) : (_jsx("div", { className: "h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center", children: _jsx("svg", { className: "w-6 h-6 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7V3" }) }) })) }), _jsxs("div", { className: "ml-4", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [booking.car?.name, " ", booking.car?.model] }), _jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: [booking.car?.brand, " \u2022 ", booking.car?.year] })] })] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsxs("div", { className: "text-sm text-gray-900 dark:text-white", children: [formatDate(booking.startDate), " - ", formatDate(booking.endDate)] }), _jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: [booking.totalDays, " ", booking.totalDays === 1 ? 'day' : 'days'] })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx(BookingStatusBadge, { status: booking.status, size: "sm" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx(PaymentStatusBadge, { status: booking.paymentStatus, size: "sm" }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white", children: ["$", (Number(booking.totalAmount) || 0).toFixed(2)] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300", children: "View Details" }), canReview(booking) && (_jsx("button", { onClick: () => handleWriteReview(booking), className: "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300", children: "Write Review" }))] }) })] }, booking.id))) })] }) }), _jsx("div", { className: "md:hidden", children: paginatedBookings.map((booking) => (_jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0 h-12 w-12 mr-3", children: booking.car?.imageUrl ? (_jsx("img", { className: "h-12 w-12 rounded-lg object-cover", src: booking.car.imageUrl, alt: `${booking.car.name} ${booking.car.model}` })) : (_jsx("div", { className: "h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center", children: _jsx("svg", { className: "w-6 h-6 text-gray-400", fill: "none", viewBox: "0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7V3" }) }) })) }), _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [booking.car?.name, " ", booking.car?.model] }), _jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [booking.car?.brand, " \u2022 ", booking.car?.year] })] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "text-sm font-medium text-gray-900 dark:text-white", children: ["$", (Number(booking.totalAmount) || 0).toFixed(2)] }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Dates:" }), _jsxs("span", { className: "text-gray-900 dark:text-white", children: [formatDate(booking.startDate), " - ", formatDate(booking.endDate)] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400 text-sm", children: "Status:" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(BookingStatusBadge, { status: booking.status, size: "sm" }), _jsx(PaymentStatusBadge, { status: booking.paymentStatus, size: "sm" })] })] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex gap-2", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium", children: "View Details" }), canReview(booking) && (_jsx("button", { onClick: () => handleWriteReview(booking), className: "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium", children: "Write Review" }))] })] }, booking.id))) }), totalPages > 1 && (_jsx("div", { className: "px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-300", children: ["Showing ", startIndex + 1, " to ", Math.min(startIndex + itemsPerPage, bookings.length), " of ", bookings.length, " results"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700", children: "Previous" }), _jsxs("span", { className: "px-3 py-1 text-sm text-gray-700 dark:text-gray-300", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages, className: "px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700", children: "Next" })] })] }) })), showReviewForm && selectedBooking && (_jsx(ReviewForm, { isOpen: showReviewForm, onClose: handleCloseReviewForm, onSubmit: handleSubmitReview, loading: createLoading, review: null, carInfo: {
                    id: selectedBooking.carId,
                    name: selectedBooking.car?.name || '',
                    model: selectedBooking.car?.model || '',
                    brand: selectedBooking.car?.brand || '',
                    year: selectedBooking.car?.year || new Date().getFullYear(),
                    imageUrl: selectedBooking.car?.images?.[0]?.imageUrl || selectedBooking.car?.imageUrl
                }, rentalInfo: {
                    id: selectedBooking.id,
                    startDate: selectedBooking.startDate,
                    endDate: selectedBooking.endDate
                }, mode: "create" }))] }));
};
export default BookingHistoryTable;
