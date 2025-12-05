import React from "react";
import {
  FaTimes,
  FaUser,
  FaCar,
  FaCalendarAlt,
  FaDollarSign,
  FaMapMarkerAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { format } from "date-fns";
import { BookingRequest } from "./BookingRequestsTable";
import BookingStatusBadge from "../../customer-components/booking-components/BookingStatusBadge";
import PaymentStatusBadge from "../../customer-components/booking-components/PaymentStatusBadge";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRequest | null;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMMM d, yyyy");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy • h:mm a");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity backdrop-blur-sm bg-gray-900/30"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative z-10 inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-xl rounded-2xl border border-gray-200/20 dark:border-gray-700/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Booking Request Details
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Booking ID: #{booking.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
            {/* Status and Payment */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookingStatusBadge status={booking.status} size="md" />
                {booking.paymentStatus && (
                  <PaymentStatusBadge
                    status={booking.paymentStatus}
                    size="md"
                  />
                )}
              </div>
              {booking.createdAt && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Requested: {formatDateTime(booking.createdAt)}
                </div>
              )}
            </div>

            {/* Car Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FaCar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Vehicle Information
                </h4>
              </div>
              <div className="flex items-start space-x-4">
                <img
                  src={
                    booking.car.image ||
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yNCAzNkg3Mkw2OCA1NEg2MFY0OEg1NFY1NEg0NVY0OEgzOVY1NEgzMFY0OEgyN1Y1NEgyNEwzNiAzNloiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K"
                  }
                  alt={`${booking.car.make} ${booking.car.model}`}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yNCAzNkg3Mkw2OCA1NEg2MFY0OEg1NFY1NEg0NVY0OEgzOVY1NEgzMFY0OEgyN1Y1NEgyNEwzNiAzNloiIGZpbGw9IiNGRkZGRkYiLz4KPHN2Zz4K";
                  }}
                />
                <div className="flex-1">
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {booking.car.make} {booking.car.model}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <div>Year: {booking.car.year}</div>
                    <div>Vehicle ID: #{booking.car.id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FaUser className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Customer Information
                </h4>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  {booking.customer.avatar ? (
                    <img
                      src={booking.customer.avatar}
                      alt={booking.customer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {booking.customer.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <div>Email: {booking.customer.email}</div>
                    <div>Customer ID: #{booking.customer.id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Period */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FaCalendarAlt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Rental Period
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Start Date & Time
                  </div>
                  <div className="text-gray-900 dark:text-white">
                    <div className="font-medium">
                      {formatDate(booking.startDate)}
                    </div>
                    <div className="text-sm">
                      {formatTime(booking.startDate)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    End Date & Time
                  </div>
                  <div className="text-gray-900 dark:text-white">
                    <div className="font-medium">
                      {formatDate(booking.endDate)}
                    </div>
                    <div className="text-sm">{formatTime(booking.endDate)}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Duration
                </div>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {calculateDuration(booking.startDate, booking.endDate)} days
                </div>
              </div>
            </div>

            {/* Pickup & Drop-off Locations */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FaMapMarkerAlt className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Pickup & Drop-off
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Pickup Location
                  </div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {booking.pickupLocation || "Not provided"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Drop-off Location
                  </div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {booking.dropoffLocation || "Not provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FaDollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Pricing Information
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${(Number(booking.totalCost) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Average per day: $
                  {(
                    (Number(booking.totalCost) || 0) /
                    calculateDuration(booking.startDate, booking.endDate)
                  ).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(booking.status === "rejected" ||
              booking.status === "cancelled") && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <FaInfoCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">
                      {booking.status === "rejected"
                        ? "Rejection Reason"
                        : "Cancellation Information"}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {booking.status === "rejected"
                        ? "This booking was rejected by the owner."
                        : "This booking was cancelled."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {booking.status === "pending_approval" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <FaInfoCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      Pending Your Approval
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      This booking request is waiting for your approval. The
                      customer has completed payment and is waiting for
                      confirmation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
