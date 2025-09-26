import React from 'react';
import { CreditCard } from 'lucide-react';
import DashboardCard from '../../shared/DashboardCard';
import { useCustomerData } from './useCustomerData';

const CustomerPayments: React.FC = () => {
  const { totalSpent, totalBookings, recentBookings } = useCustomerData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="Total Spent"
          value={`$${(Number(totalSpent) || 0).toFixed(2)}`}
          icon={CreditCard}
        />
        <DashboardCard
          title="Average per Booking"
          value={`$${totalBookings > 0 ? ((Number(totalSpent) || 0) / totalBookings).toFixed(2) : '0.00'}`}
          icon={CreditCard}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold mb-4">Payment History</h4>
        <div className="space-y-4">
          {recentBookings.map(booking => (
            <div key={booking.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">Booking #{booking.id.toString().padStart(4, '0')}</p>
                <p className="text-sm text-gray-500">{booking.carDetails}</p>
                <p className="text-sm text-gray-500">{booking.startDate} - {booking.endDate}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${(Number(booking.totalCost) || 0).toFixed(2)}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerPayments;
