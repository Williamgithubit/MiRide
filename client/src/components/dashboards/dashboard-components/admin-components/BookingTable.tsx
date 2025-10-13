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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Booking Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Car
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {currentBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">ID: {booking.id}</p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {format(new Date(booking.startDate), 'MMM dd, yyyy')} →{' '}
                      {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">${booking.totalCost}</p>
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
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.car.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.car.model}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">{booking.customer.name}</div>
                    <div className="text-gray-500 dark:text-gray-400">{booking.customer.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">{booking.owner.name}</div>
                    <div className="text-gray-500 dark:text-gray-400">{booking.owner.email}</div>
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
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </button>
                  {booking.bookingStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => onActionClick('approve', booking.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onActionClick('cancel', booking.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
            <div key={booking.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Booking ID: {booking.id}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.car.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{booking.car.model}</p>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Customer: {booking.customer.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{booking.customer.email}</p>
              </div>

              <div className="mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Owner: {booking.owner.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{booking.owner.email}</p>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">${booking.totalCost}</p>
                  <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => onViewDetails(booking.id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </button>
                  {booking.bookingStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => onActionClick('approve', booking.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onActionClick('cancel', booking.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
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
                      ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
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