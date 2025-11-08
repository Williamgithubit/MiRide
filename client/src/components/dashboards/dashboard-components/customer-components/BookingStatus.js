import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCurrentBookingsQuery, useGetBookingHistoryQuery, useGetActiveBookingQuery, useGetBookingStatsQuery } from '../../../../store/Booking/bookingApi';
import { setCurrentBookings, setPastBookings, setActiveBooking, setLoading, setError } from '../../../../store/Booking/bookingSlice';
import CurrentBookingCard from './booking-components/CurrentBookingCard';
import BookingStatsOverview from '../customer-components/booking-components/BookingStatsOverview';
import BookingHistoryTable from '../customer-components/booking-components/BookingHistoryTable';
import BookingFilters from '../customer-components/booking-components/BookingFilters';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import { FaFileAlt } from 'react-icons/fa';
const BookingStatus = () => {
    const dispatch = useDispatch();
    const { currentBookings, pastBookings, activeBooking, loading, error, statusFilter, realTimeEnabled, updateInterval } = useSelector((state) => state.booking);
    // API queries
    const { data: currentBookingsData, error: currentBookingsError, isLoading: currentBookingsLoading, refetch: refetchCurrentBookings } = useGetCurrentBookingsQuery();
    const { data: bookingHistoryData, error: bookingHistoryError, isLoading: bookingHistoryLoading, refetch: refetchBookingHistory } = useGetBookingHistoryQuery();
    const { data: activeBookingData, error: activeBookingError, isLoading: activeBookingLoading, refetch: refetchActiveBooking } = useGetActiveBookingQuery();
    const { data: bookingStatsData, error: bookingStatsError, isLoading: bookingStatsLoading } = useGetBookingStatsQuery();
    // Real-time updates
    useEffect(() => {
        if (!realTimeEnabled)
            return;
        const interval = setInterval(() => {
            refetchCurrentBookings();
            refetchBookingHistory();
            refetchActiveBooking();
        }, updateInterval);
        return () => clearInterval(interval);
    }, [realTimeEnabled, updateInterval, refetchCurrentBookings, refetchBookingHistory, refetchActiveBooking]);
    // Update Redux store when data changes
    useEffect(() => {
        if (currentBookingsData) {
            dispatch(setCurrentBookings(currentBookingsData));
        }
    }, [currentBookingsData, dispatch]);
    useEffect(() => {
        if (bookingHistoryData) {
            dispatch(setPastBookings(bookingHistoryData));
        }
    }, [bookingHistoryData, dispatch]);
    useEffect(() => {
        if (activeBookingData) {
            dispatch(setActiveBooking(activeBookingData));
        }
    }, [activeBookingData, dispatch]);
    // Handle loading states
    useEffect(() => {
        const isLoading = currentBookingsLoading || bookingHistoryLoading || activeBookingLoading || bookingStatsLoading;
        dispatch(setLoading(isLoading));
    }, [currentBookingsLoading, bookingHistoryLoading, activeBookingLoading, bookingStatsLoading, dispatch]);
    // Handle errors
    useEffect(() => {
        const errors = [currentBookingsError, bookingHistoryError, activeBookingError, bookingStatsError]
            .filter(Boolean)
            .map(err => err?.message || 'Unknown error')
            .join(', ');
        dispatch(setError(errors || null));
    }, [currentBookingsError, bookingHistoryError, activeBookingError, bookingStatsError, dispatch]);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(LoadingSpinner, { size: "lg" }) }));
    }
    if (error) {
        return (_jsx("div", { className: "p-6", children: _jsx(ErrorMessage, { message: error }) }));
    }
    return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Booking Status" }), _jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Manage your current and past car rental bookings" })] }), _jsx("div", { className: "mt-4 sm:mt-0", children: _jsx(BookingFilters, {}) })] }), _jsx(BookingStatsOverview, { stats: bookingStatsData }), activeBooking && activeBooking.id && (_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Current Booking" }), _jsx(CurrentBookingCard, { booking: activeBooking })] })), currentBookings && currentBookings.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Upcoming Bookings" }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: currentBookings.map((booking) => (_jsx(CurrentBookingCard, { booking: booking }, booking.id))) })] })), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Booking History" }), _jsx(BookingHistoryTable, { bookings: pastBookings })] }), !activeBooking && (!currentBookings || currentBookings.length === 0) && (!pastBookings || pastBookings.length === 0) && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4", children: _jsx(FaFileAlt, { className: "text-2xl text-gray-400" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900 dark:text-white", children: "No bookings yet" }), _jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Start by browsing our available cars and make your first booking." })] }))] }));
};
export default BookingStatus;
