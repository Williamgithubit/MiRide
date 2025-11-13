import React, { useEffect } from 'react';
import { useGetOwnerActiveRentalsQuery, Rental } from '../../../../store/Rental/rentalApi';
import RentalExpirationProgressBar from './RentalExpirationProgressBar';
import { FaCar, FaUser } from 'react-icons/fa';
import LoadingSpinner from '../../../common/LoadingSpinner';

const ActiveRentalsSection: React.FC = () => {
  const { data: activeRentals, isLoading, error, refetch } = useGetOwnerActiveRentalsQuery();

  // Refetch every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">
          Failed to load active rentals. Please try again.
        </p>
      </div>
    );
  }

  if (!activeRentals || activeRentals.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <FaCar className="mx-auto text-4xl text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Active Rentals
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          You don't have any active rentals at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Active Rentals ({activeRentals.length})
        </h3>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeRentals.map((rental: Rental) => (
          <div
            key={rental.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Car Image */}
            <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
              {rental.car?.images?.[0]?.imageUrl ? (
                <img
                  src={rental.car.images[0].imageUrl}
                  alt={`${rental.car.name} ${rental.car.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FaCar className="text-4xl text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  {rental.status === 'active' ? 'Active' : 'Approved'}
                </span>
              </div>
            </div>

            {/* Rental Details */}
            <div className="p-4">
              {/* Car Info */}
              <div className="mb-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rental.car?.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {rental.car?.year} {rental.car?.brand} {rental.car?.model}
                </p>
              </div>

              {/* Customer Info */}
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <FaUser className="text-gray-400" />
                <span>{rental.customer?.name}</span>
              </div>

              {/* Rental Amount */}
              <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Total Amount
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    ${Number(rental.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Expiration Progress Bar */}
              <RentalExpirationProgressBar
                startDate={rental.startDate}
                endDate={rental.endDate}
                customerName={rental.customer?.name || 'Customer'}
                carName={rental.car?.name || 'Car'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveRentalsSection;
