import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { toast } from 'react-toastify';
import {
  fetchBookings,
  setFilter,
  setPage,
  selectFilteredBookings,
  selectBookingStatus,
  selectBookingError,
  selectPagination,
  selectBookingFilters,
} from '../../../../store/Admin/adminBookingsSlice';
import { useUpdateBookingStatusMutation } from '../../../../store/Admin/bookingsService';

// Components will be imported as we create them
import { FilterBar } from './FilterBar';
import { BookingTable } from './BookingTable';
import { BookingDetailsModal } from './BookingDetailsModal';
import { ConfirmationModal } from './ConfirmationModal';

export const BookingsManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectFilteredBookings);
  const status = useAppSelector(selectBookingStatus);
  const error = useAppSelector(selectBookingError);
  const pagination = useAppSelector(selectPagination);
  const filters = useAppSelector(selectBookingFilters);
  
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'approve' | 'cancel';
    bookingId: string;
  } | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBookings());
    }
  }, [status, dispatch]);

  const handleFilterChange = (newFilters: typeof filters) => {
    dispatch(setFilter(newFilters));
    dispatch(setPage(1)); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsDetailsModalOpen(true);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus({ bookingId, status: newStatus }).unwrap();
      toast.success('Booking status updated successfully');
      dispatch(fetchBookings()); // Refresh the bookings list
    } catch (err) {
      toast.error('Failed to update booking status');
    }
  };

  const handleActionClick = (type: 'approve' | 'cancel', bookingId: string) => {
    setPendingAction({ type, bookingId });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const newStatus = pendingAction.type === 'approve' ? 'Confirmed' : 'Cancelled';
    await handleStatusUpdate(pendingAction.bookingId, newStatus);
    setIsConfirmModalOpen(false);
    setPendingAction(null);
  };

  if (status === 'failed') {
    return (
      <div className="p-4 text-red-600">
        Error loading bookings: {error}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bookings Management</h1>
      
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <BookingTable
        bookings={bookings}
        loading={status === 'loading'}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
        onActionClick={handleActionClick}
      />

      {selectedBookingId && (
        <BookingDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          bookingId={selectedBookingId}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={`Confirm ${pendingAction?.type === 'approve' ? 'Approval' : 'Cancellation'}`}
        message={`Are you sure you want to ${
          pendingAction?.type === 'approve' ? 'approve' : 'cancel'
        } this booking? This action cannot be undone.`}
      />
    </div>
  );
};