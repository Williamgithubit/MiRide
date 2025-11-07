import React from 'react';
import { Car, Calendar, CreditCard, User, Star } from 'lucide-react';
import DashboardCard from '../../shared/DashboardCard';
import { useCustomerData } from './useCustomerData';

interface CustomerOverviewProps {
  onSectionChange: (section: string) => void;
}

const CustomerOverview: React.FC<CustomerOverviewProps> = ({ onSectionChange }) => {
  const { 
    customer, 
    activeRentals, 
    totalBookings, 
    totalSpent, 
    customerStats, 
    recentBookings,
    availableCars // Get the calculated available cars from the hook
  } = useCustomerData();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {customer?.name || 'User'}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your account and recent activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard
          title="Active Rentals"
          value={activeRentals}
          icon={Calendar}
        />
        <DashboardCard
          title="Total Bookings"
          value={totalBookings}
          icon={Car}
        />
        <DashboardCard
          title="Total Spent"
          value={`$${(Number(totalSpent) || 0).toFixed(2)}`}
          icon={CreditCard}
        />
        <DashboardCard
          title="Available Cars"
          value={availableCars?.length || 0}
          icon={Car}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {recentBookings.slice(0, 3).map(booking => (
              <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">#{booking.id.toString().padStart(4, '0')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{booking.carDetails}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{booking.startDate}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  booking.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onSectionChange('bookings')}
            className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            View all bookings →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => onSectionChange('browse-cars')}
              className="w-full flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Car className="w-5 h-5 text-black dark:text-white mr-3" />
              <span className="text-black dark:text-white font-medium">Browse Available Cars</span>
            </button>
            <button 
              onClick={() => onSectionChange('bookings')}
              className="w-full flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-green-600 dark:text-green-400 font-medium">Manage Bookings</span>
            </button>
            <button 
              onClick={() => onSectionChange('payments')}
              className="w-full flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
              <span className="text-purple-600 dark:text-purple-400 font-medium">Payment History</span>
            </button>
            <button 
              onClick={() => onSectionChange('reviews')}
              className="w-full flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">My Reviews</span>
            </button>
            <button 
              onClick={() => onSectionChange('profile')}
              className="w-full flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <User className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3" />
              <span className="text-orange-600 dark:text-orange-400 font-medium">Update Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
