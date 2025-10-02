import React from 'react';
import { Users, Car, DollarSign, TrendingUp } from 'lucide-react';
import DashboardCard from '../../shared/DashboardCard';
import Chart from '../../shared/Chart';
import { useGetAdminStatsQuery } from '../../../../store/Dashboard/dashboardApi';
import type { AdminStats } from '../../../../store/Dashboard/dashboardApi';

const AdminOverview: React.FC = () => {
  const { data: stats, isLoading: loading, error } = useGetAdminStatsQuery();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (() => {
      if ('data' in error) {
        const errorData = error.data as any;
        return errorData?.message || errorData?.error || 'Unknown error';
      }
      if ('error' in error) {
        return error.error || 'Network error';
      }
      return 'An unexpected error occurred';
    })();

    return (
      <div className="text-red-500 text-center p-4">
        Error loading dashboard data: {errorMessage}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Prepare chart data
  const revenueChartData = {
    labels: stats.recentRentals.map((rental: AdminStats['recentRentals'][0]) => new Date(rental.startDate).toLocaleDateString()),
    datasets: [{
      label: 'Revenue',
      data: stats.recentRentals.map((rental: AdminStats['recentRentals'][0]) => rental.totalCost),
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.1
    }]
  };

  const bookingTrendsData = {
    labels: stats.recentRentals.slice(0, 7).map((rental: AdminStats['recentRentals'][0]) => new Date(rental.startDate).toLocaleDateString()),
    datasets: [{
      label: 'Bookings',
      data: stats.recentRentals.slice(0, 7).map(() => 1),
      backgroundColor: 'rgb(59, 130, 246)',
    }]
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Users"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
          change={{ value: stats.newCustomersThisMonth, type: 'increase' }}
        />
        <DashboardCard
          title="Active Cars"
          value={stats.availableCars}
          icon={Car}
          change={{ 
            value: ((stats.availableCars - stats.unavailableCars) / stats.totalCars) * 100, 
            type: stats.availableCars > stats.unavailableCars ? 'increase' : 'decrease' 
          }}
        />
        <DashboardCard
          title="Total Revenue"
          value={`$${stats.revenueThisMonth.toLocaleString()}`}
          icon={DollarSign}
          change={{ value: stats.revenueGrowth, type: stats.revenueGrowth >= 0 ? 'increase' : 'decrease' }}
        />
        <DashboardCard
          title="Active Rentals"
          value={stats.activeRentals}
          icon={TrendingUp}
          change={{ 
            value: (stats.activeRentals / stats.totalRentals) * 100,
            type: stats.activeRentals > 0 ? 'increase' : 'decrease'
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          type="line"
          data={revenueChartData}
          options={{ plugins: { title: { display: true, text: 'Platform Revenue' } } }}
        />
        <Chart
          type="bar"
          data={bookingTrendsData}
          options={{ plugins: { title: { display: true, text: 'Weekly Booking Trends' } } }}
        />
      </div>

      {/* Recent Users and System Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold mb-4">Recent Users</h4>
          <div className="space-y-3">
            {stats.recentRentals.slice(0, 5).map((rental: AdminStats['recentRentals'][0]) => (
              <div key={rental.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium">{rental.customer.name}</p>
                  <p className="text-sm text-gray-500">{rental.customer.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{rental.car.brand} {rental.car.model}</p>
                  <p className="text-xs text-gray-500">${rental.totalCost.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold mb-4">System Stats</h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Car Utilization</span>
              <span className="font-semibold">{((stats.availableCars / stats.totalCars) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Active Users</span>
              <span className="font-semibold">{stats.totalCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Revenue</span>
              <span className="font-semibold">${stats.revenueThisMonth.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Rentals</span>
              <span className="font-semibold">{stats.totalRentals}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
