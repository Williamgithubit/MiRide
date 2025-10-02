import React from 'react';
import { format } from 'date-fns';
import { useGetBookingByIdQuery } from '../../../../store/Admin/bookingsService';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900 mb-4"
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
                  <div className="text-red-600 text-center py-4">
                    Failed to load booking details
                  </div>
                )}

                {booking && (
                  <div className="space-y-4">
                    {/* Booking Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Booking Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Booking ID</p>
                          <p className="font-medium">{booking.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium">{booking.bookingStatus}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="font-medium">
                            {format(new Date(booking.startDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">End Date</p>
                          <p className="font-medium">
                            {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Cost</p>
                          <p className="font-medium">${booking.totalCost}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Payment Status</p>
                          <p className="font-medium">{booking.paymentStatus}</p>
                        </div>
                      </div>
                    </div>

                    {/* Car Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Car Details</h4>
                      <div className="flex items-start space-x-4">
                        <img
                          src={booking.car.imageUrl}
                          alt={booking.car.name}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{booking.car.name}</p>
                          <p className="text-gray-500">{booking.car.model}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                      <div className="space-y-1">
                        <p className="text-gray-900">{booking.customer.name}</p>
                        <p className="text-gray-500">{booking.customer.email}</p>
                      </div>
                    </div>

                    {/* Owner Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Owner Details</h4>
                      <div className="space-y-1">
                        <p className="text-gray-900">{booking.owner.name}</p>
                        <p className="text-gray-500">{booking.owner.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};