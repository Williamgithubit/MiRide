import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BookingStatus } from '../../../../../store/Booking/bookingSlice';
import { 
  useCancelBookingMutation, 
  useModifyBookingMutation,
  useExtendBookingMutation 
} from '../../../../../store/Booking/bookingApi';
import BookingStatusBadge from '../../../../../components/dashboards/dashboard-components/customer-components/booking-components/BookingStatusBadge';
import PaymentStatusBadge from '../../../../../components/dashboards/dashboard-components/customer-components/booking-components/PaymentStatusBadge';
import BookingModificationModal from '../../../../../components/dashboards/dashboard-components/customer-components/booking-components/BookingModificationModal';

interface CurrentBookingCardProps {
  booking: BookingStatus;
}

const CurrentBookingCard: React.FC<CurrentBookingCardProps> = ({ booking }) => {
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [modifyBooking, { isLoading: isModifying }] = useModifyBookingMutation();

  const handleCancelBooking = async () => {
    try {
      await cancelBooking({ id: booking.id }).unwrap();
      toast.success('Booking cancelled successfully!');
      setShowCancelConfirm(false);
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      // Handle different error structures from RTK Query
      let errorMessage = 'Failed to cancel booking';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    }
  };

  const canModify = booking.status === 'pending_approval' || booking.status === 'approved';
  const canCancel = booking.status !== 'completed' && booking.status !== 'cancelled';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Car Image */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          {booking.car?.imageUrl ? (
            <img
              src={booking.car.imageUrl}
              alt={`${booking.car.name} ${booking.car.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}
          
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.paymentStatus} />
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-6">
          {/* Car Info */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {booking.car?.name} {booking.car?.model}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {booking.car?.make} • {booking.car?.year}
            </p>
          </div>

          {/* Rental Period */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">
                {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          {/* Locations */}
          {(booking.pickupLocation || booking.dropoffLocation) && (
            <div className="mb-4 space-y-2">
              {booking.pickupLocation && (
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">
                    Pickup: {booking.pickupLocation}
                  </span>
                </div>
              )}
              {booking.dropoffLocation && (
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">
                    Dropoff: {booking.dropoffLocation}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Add-ons */}
          {(booking.hasInsurance || booking.hasGPS || booking.hasChildSeat || booking.hasAdditionalDriver) && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add-ons:</p>
              <div className="flex flex-wrap gap-2">
                {booking.hasInsurance && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    Insurance
                  </span>
                )}
                {booking.hasGPS && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                    GPS
                  </span>
                )}
                {booking.hasChildSeat && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                    Child Seat
                  </span>
                )}
                {booking.hasAdditionalDriver && (
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                    Additional Driver
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Total Amount */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Amount
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${(Number(booking.totalAmount) || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {canModify && (
              <button
                onClick={() => setShowModifyModal(true)}
                disabled={isModifying}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isModifying ? 'Modifying...' : 'Modify'}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modification Modal */}
      {showModifyModal && (
        <BookingModificationModal
          booking={booking}
          onClose={() => setShowModifyModal(false)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cancel Booking
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrentBookingCard;
