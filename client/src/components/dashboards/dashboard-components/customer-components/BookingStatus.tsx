import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { 
  useGetCurrentBookingsQuery, 
  useGetBookingHistoryQuery, 
  useGetActiveBookingQuery,
  useGetBookingStatsQuery 
} from '../../../../store/Booking/bookingApi';
import { 
  setCurrentBookings, 
  setPastBookings, 
  setActiveBooking, 
  setLoading, 
  setError 
} from '../../../../store/Booking/bookingSlice';
import CurrentBookingCard from './booking-components/CurrentBookingCard';
import BookingStatsOverview from '../customer-components/booking-components/BookingStatsOverview';
import BookingHistoryTable from '../customer-components/booking-components/BookingHistoryTable';
import BookingFilters from '../customer-components/booking-components/BookingFilters';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import { FaFileAlt } from 'react-icons/fa';

const BookingStatus: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    currentBookings, 
    pastBookings, 
    activeBooking, 
    loading, 
    error, 
    statusFilter, 
    realTimeEnabled, 
    updateInterval 
  } = useSelector((state: RootState) => state.booking);

  // API queries
  const { 
    data: currentBookingsData, 
    error: currentBookingsError, 
    isLoading: currentBookingsLoading,
    refetch: refetchCurrentBookings 
  } = useGetCurrentBookingsQuery();

  const { 
    data: bookingHistoryData, 
    error: bookingHistoryError, 
    isLoading: bookingHistoryLoading,
    refetch: refetchBookingHistory 
  } = useGetBookingHistoryQuery();

  const { 
    data: activeBookingData, 
    error: activeBookingError, 
    isLoading: activeBookingLoading,
    refetch: refetchActiveBooking 
  } = useGetActiveBookingQuery();

  const { 
    data: bookingStatsData, 
    error: bookingStatsError, 
    isLoading: bookingStatsLoading 
  } = useGetBookingStatsQuery();

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

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
      .map(err => (err as any)?.message || 'Unknown error')
      .join(', ');
    
    dispatch(setError(errors || null));
  }, [currentBookingsError, bookingHistoryError, activeBookingError, bookingStatsError, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Booking Status
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your current and past car rental bookings
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <BookingFilters />
        </div>
      </div>

      {/* Booking Statistics Overview */}
      <BookingStatsOverview stats={bookingStatsData} />

      {/* Current/Active Booking */}
      {activeBooking && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Booking
          </h2>
          <CurrentBookingCard booking={activeBooking} />
        </div>
      )}

      {/* Current Bookings (Pending/Approved) */}
      {currentBookings && currentBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Bookings
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentBookings.map((booking) => (
              <CurrentBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Booking History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Booking History
        </h2>
        <BookingHistoryTable bookings={pastBookings} />
      </div>

      {/* Empty State */}
      {!activeBooking && (!currentBookings || currentBookings.length === 0) && (!pastBookings || pastBookings.length === 0) && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <FaFileAlt className="text-2xl text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No bookings yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start by browsing our available cars and make your first booking.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingStatus;
