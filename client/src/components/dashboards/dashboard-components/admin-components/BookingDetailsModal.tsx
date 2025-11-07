import React from "react";
import ReactDOM from "react-dom";
import { format } from "date-fns";
import { Car as CarIcon } from 'lucide-react';
import { useGetBookingByIdQuery } from "../../../../store/Admin/bookingsService";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  bookingId,
}) => {
  const { data: booking, isLoading, error } = useGetBookingByIdQuery(bookingId);
  // Debug info
  console.log("BookingDetailsModal bookingId:", bookingId);
  console.log("BookingDetailsModal booking:", booking);
  console.log("BookingDetailsModal isLoading:", isLoading);
  console.log("BookingDetailsModal error:", error);

  if (!isOpen) return null;
  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal overlay */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div
            className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative border-2 border-blue-400 dark:border-blue-600 shadow-2xl z-[100]"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-[101]"
              aria-label="Close"
              style={{ position: "absolute" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4"
                  id="modal-title"
                >
                  Booking Details
                </h3>

                {isLoading && (
                  <div className="w-full h-32 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-center py-4">
                    Failed to load booking details
                  </div>
                )}

                {booking ? (
                  <div className="space-y-4">
                    {/* Booking Information */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Booking Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Booking ID</p>
                          <p className="font-medium text-gray-900 dark:text-white">{booking.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Status</p>
                          <p className="font-medium text-gray-900 dark:text-white">{booking.bookingStatus}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Start Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {format(
                              new Date(booking.startDate),
                              "MMM dd, yyyy"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">End Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {format(new Date(booking.endDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Total Cost</p>
                          <p className="font-medium text-gray-900 dark:text-white">${booking.totalCost}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Payment Status</p>
                          <p className="font-medium text-gray-900 dark:text-white">{booking.paymentStatus}</p>
                        </div>
                      </div>
                    </div>

                    {/* Car Details */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Car Details
                      </h4>
                      <div className="flex items-start space-x-4">
                        <div className="h-20 w-20 flex-shrink-0">
                          {booking.car.imageUrl ? (
                            <img
                              src={booking.car.imageUrl}
                              alt={booking.car.name}
                              className="h-20 w-20 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`h-20 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center ${booking.car.imageUrl ? 'hidden' : ''}`}>
                            <CarIcon className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {booking.car.name}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">{booking.car.model}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Customer Details
                      </h4>
                      <div className="space-y-1">
                        <p className="text-gray-900 dark:text-white">{booking.customer.name}</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {booking.customer.email}
                        </p>
                      </div>
                    </div>

                    {/* Owner Details */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Owner Details
                      </h4>
                      <div className="space-y-1">
                        <p className="text-gray-900 dark:text-white">{booking.owner.name}</p>
                        <p className="text-gray-500 dark:text-gray-400">{booking.owner.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No booking details found for this ID.
                    <br />
                    <button
                      onClick={onClose}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
