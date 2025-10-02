import React from 'react';
import { format } from 'date-fns';
import { Booking } from '../../../../store/Admin/adminBookingsSlice';

interface BookingTableProps {
  bookings: Booking[];
  loading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
  onPageChange: (page: number) => void;
  onViewDetails: (bookingId: string) => void;
  onActionClick: (type: 'approve' | 'cancel', bookingId: string) => void;
}

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  loading,
  pagination,
  onPageChange,
  onViewDetails,
  onActionClick,
}) => {
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const currentBookings = bookings.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Car
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">ID: {booking.id}</p>
                    <p className="text-gray-500">
                      {format(new Date(booking.startDate), 'MMM dd, yyyy')} →{' '}
                      {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="font-medium text-gray-900">${booking.totalCost}</p>
                    <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-full" src={booking.car.imageUrl} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{booking.car.name}</div>
                      <div className="text-sm text-gray-500">{booking.car.model}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{booking.customer.name}</div>
                    <div className="text-gray-500">{booking.customer.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{booking.owner.name}</div>
                    <div className="text-gray-500">{booking.owner.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <button
                    onClick={() => onViewDetails(booking.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  {booking.bookingStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => onActionClick('approve', booking.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onActionClick('cancel', booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="grid grid-cols-1 gap-4 sm:px-6 py-4">
          {currentBookings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 rounded-lg border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">Booking ID: {booking.id}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(booking.startDate), 'MMM dd, yyyy')} →{' '}
                    {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                  {booking.bookingStatus}
                </span>
              </div>

              <div className="flex items-center mb-2">
                <img className="h-10 w-10 rounded-full mr-3" src={booking.car.imageUrl} alt="" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{booking.car.name}</p>
                  <p className="text-sm text-gray-500">{booking.car.model}</p>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-sm font-medium text-gray-900">Customer: {booking.customer.name}</p>
                <p className="text-sm text-gray-500">{booking.customer.email}</p>
              </div>

              <div className="mb-2">
                <p className="text-sm font-medium text-gray-900">Owner: {booking.owner.name}</p>
                <p className="text-sm text-gray-500">{booking.owner.email}</p>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="font-medium text-gray-900">${booking.totalCost}</p>
                  <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => onViewDetails(booking.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  {booking.bookingStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => onActionClick('approve', booking.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onActionClick('cancel', booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(endIndex, bookings.length)}
              </span>{' '}
              of <span className="font-medium">{bookings.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === pagination.currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};