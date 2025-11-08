import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  useGetOwnerBookingsQuery,
  useApproveBookingMutation,
  useRejectBookingMutation,
  Rental
} from "../../../../store/Rental/rentalApi";
import BookingRequestsTable, { BookingRequest } from './booking-requests/BookingRequestsTable';
import { ApprovalModal, RejectionModal } from './booking-requests/BookingActionModals';
import BookingDetailsModal from './booking-requests/BookingDetailsModal';
import { FaSync } from 'react-icons/fa';
import { API_BASE_URL } from '../../../../config/api';

export const BookingRequestsSection = () => {
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Use RTK Query hooks
  const {
    data: rentals = [],
    isLoading: loading,
    error: rentalsError,
    refetch
  } = useGetOwnerBookingsQuery();

  const [approveBooking] = useApproveBookingMutation();
  const [rejectBooking] = useRejectBookingMutation();

  // Transform Rental[] to BookingRequest[] with filtering
  const allBookings: BookingRequest[] = rentals.map((rental: Rental) => {
    // Extract image URL from car.images array or use imageUrl directly
    let carImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNiAyNEg0OEw0NiAzNkg0MFYzMkgzNlYzNkgzMFYzMkgyNlYzNkgyMFYzMkgxOFYzNkgxNkwyNCAyNFoiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K';
    
    if (rental.car?.images && Array.isArray(rental.car.images) && rental.car.images.length > 0) {
      // Find primary image or use first image
      const primaryImage = rental.car.images.find((img: any) => img.isPrimary);
      const rawImageUrl = primaryImage?.imageUrl || rental.car.images[0]?.imageUrl;
      
      // Convert relative URLs to absolute URLs
      if (rawImageUrl) {
        carImageUrl = rawImageUrl.startsWith('http') ? rawImageUrl : `${API_BASE_URL}${rawImageUrl}`;
      }
    } else if (rental.car?.imageUrl) {
      // Convert relative URLs to absolute URLs
      carImageUrl = rental.car.imageUrl.startsWith('http') ? rental.car.imageUrl : `${API_BASE_URL}${rental.car.imageUrl}`;
    }

    return {
      id: rental.id.toString(),
      car: {
        id: rental.car?.id?.toString() || rental.carId.toString(),
        make: rental.car?.brand || rental.car?.brand || rental.car?.name?.split(" ")[0] || "Unknown",
        model: rental.car?.model || rental.car?.name || "Unknown",
        year: rental.car?.year || new Date().getFullYear(),
        image: carImageUrl,
      },
      customer: {
        id: rental.customer?.id?.toString() || rental.customerId.toString(),
        name: rental.customer?.name || "Unknown Customer",
        email: rental.customer?.email || "unknown@email.com",
      },
      startDate: rental.startDate,
      endDate: rental.endDate,
      totalCost: Number(rental.totalAmount) || Number(rental.totalCost) || 0,
      status: rental.status,
      createdAt: rental.createdAt,
      paymentStatus: rental.paymentStatus,
    };
  });

  // Filter bookings based on status
  const bookings = React.useMemo(() => {
    if (statusFilter === 'all') {
      return allBookings;
    }
    return allBookings.filter(booking => booking.status === statusFilter);
  }, [allBookings, statusFilter]);

  const handleApprove = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setShowApprovalModal(true);
    }
  };

  const handleReject = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setShowRejectionModal(true);
    }
  };

  const handleViewDetails = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedBooking) return;
    
    try {
      setUpdating(prev => ({ ...prev, [selectedBooking.id]: true }));
      await approveBooking(parseInt(selectedBooking.id)).unwrap();
      toast.success("Booking approved successfully!");
      setShowApprovalModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error approving booking:", error);
      toast.error("Failed to approve booking");
    } finally {
      setUpdating(prev => ({ ...prev, [selectedBooking.id]: false }));
    }
  };

  const confirmRejection = async (reason: string) => {
    if (!selectedBooking) return;
    
    try {
      setUpdating(prev => ({ ...prev, [selectedBooking.id]: true }));
      await rejectBooking({ 
        id: parseInt(selectedBooking.id), 
        reason 
      }).unwrap();
      toast.success("Booking rejected successfully!");
      setShowRejectionModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error("Failed to reject booking");
    } finally {
      setUpdating(prev => ({ ...prev, [selectedBooking.id]: false }));
    }
  };


  // Handle errors
  React.useEffect(() => {
    if (rentalsError) {
      console.error("Error fetching rentals:", rentalsError);
      toast.error("Failed to load booking requests");
    }
  }, [rentalsError]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Booking Requests
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and review customer booking requests ({bookings.length} {statusFilter === 'all' ? 'total' : statusFilter.replace('_', ' ')} bookings)
          </p>
        </div>
        <div className="flex items-center justify-end gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
          >
            <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? "Refreshing..." : "Refresh"}</span>
            <span className="sm:hidden">↻</span>
          </button>
        </div>
      </div>

      {/* Enhanced Booking Requests Table */}
      <BookingRequestsTable
        bookings={bookings}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewDetails={handleViewDetails}
        updating={updating}
      />

      {/* Modals */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedBooking(null);
        }}
        onConfirm={confirmApproval}
        booking={selectedBooking}
        loading={updating[selectedBooking?.id || '']}
      />

      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          setSelectedBooking(null);
        }}
        onConfirm={confirmRejection}
        booking={selectedBooking}
        loading={updating[selectedBooking?.id || '']}
      />

      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </div>
  );
};
