import React, { useState, useMemo } from 'react';
import './analytics.css';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Car,
  Clock,
  Users,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Star,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGetOwnerAnalyticsQuery, useLazyGenerateReportQuery } from '../../../../store/Dashboard/dashboardApi';
import toast from 'react-hot-toast';

// Color palette for charts
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.danger,
  COLORS.purple,
  COLORS.pink,
  COLORS.indigo,
  COLORS.teal,
];

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  trend.type === 'increase' ? 'text-green-500' : 'text-red-500'
                } ${trend.type === 'decrease' ? 'rotate-180' : ''}`}
              />
              <span
                className={`text-sm font-medium ${
                  trend.type === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {title}
    </h3>
    {children}
  </div>
);

const Analytics: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useGetOwnerAnalyticsQuery({ period: timePeriod });

  // Generate report query (lazy)
  const [generateReport, { isLoading: isGeneratingReport }] = useLazyGenerateReportQuery();

  // Memoized calculations
  const summaryCards = useMemo(() => {
    if (!analyticsData) return [];

    const thisMonthBookings = analyticsData.totalBookingsThisMonth || 0;
    const lastMonthBookings = analyticsData.totalBookings - thisMonthBookings;
    const bookingsTrend = lastMonthBookings > 0 
      ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 
      : 0;

    const thisMonthRevenue = analyticsData.totalRevenueThisMonth || 0;
    const lastMonthRevenue = analyticsData.totalRevenue - thisMonthRevenue;
    const revenueTrend = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return [
      {
        title: 'Total Bookings',
        value: analyticsData.totalBookings,
        subtitle: `${thisMonthBookings} this month`,
        icon: Calendar,
        trend: {
          value: Math.round(bookingsTrend * 10) / 10,
          type: (bookingsTrend >= 0 ? 'increase' : 'decrease') as 'increase' | 'decrease',
        },
        color: 'blue',
      },
      {
        title: 'Total Revenue',
        value: `$${(analyticsData.totalRevenue || 0).toLocaleString()}`,
        subtitle: `$${(thisMonthRevenue || 0).toLocaleString()} this month`,
        icon: DollarSign,
        trend: {
          value: Math.round(revenueTrend * 10) / 10,
          type: (revenueTrend >= 0 ? 'increase' : 'decrease') as 'increase' | 'decrease',
        },
        color: 'green',
      },
      {
        title: 'Active Cars',
        value: analyticsData.activeCars || 0,
        subtitle: `${analyticsData.inactiveCars || 0} inactive`,
        icon: Car,
        color: 'purple',
      },
      {
        title: 'Pending Requests',
        value: analyticsData.pendingRequests || 0,
        subtitle: 'Awaiting approval',
        icon: Clock,
        color: 'yellow',
      },
    ];
  }, [analyticsData]);

  // Handle export functionality
  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      // Trigger the report generation
      const result = await generateReport({
        reportType: format,
        startDate: undefined, // You can add date range selection later
        endDate: undefined,
      }).unwrap();
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
      // In a real implementation, you would trigger a download here with the result
      console.log('Generated report:', result);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Failed to Load Analytics
              </h3>
              <p className="text-red-600 dark:text-red-400 mt-1">
                Unable to fetch analytics data. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Time Period Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'weekly' | 'monthly' | 'yearly')}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Export and Refresh Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting || isGeneratingReport}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>CSV</span>
            </button>
            
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting || isGeneratingReport}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => refetch()}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {summaryCards.map((card, index) => (
          <SummaryCard key={index} {...card} />
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <SummaryCard
          title="Utilization Rate"
          value={`${(analyticsData?.utilizationRate || 0).toFixed(1)}%`}
          icon={BarChart3}
          color="blue"
        />
        <SummaryCard
          title="Avg Rental Duration"
          value={`${(analyticsData?.averageRentalDuration || 0).toFixed(1)} days`}
          icon={Calendar}
          color="green"
        />
        <SummaryCard
          title="Customer Satisfaction"
          value={`${(analyticsData?.customerSatisfaction || 0).toFixed(1)}/5`}
          icon={Star}
          color="yellow"
        />
        <SummaryCard
          title="Revenue per Car"
          value={`$${(analyticsData?.revenuePerCar || 0).toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Bookings Trend Chart */}
        <ChartCard title="Bookings & Revenue Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.bookingsTrend || []}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="period" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                yAxisId="bookings"
                orientation="left"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                yAxisId="revenue"
                orientation="right"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar 
                yAxisId="bookings"
                dataKey="bookings" 
                fill={COLORS.primary} 
                name="Bookings"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                yAxisId="revenue"
                type="monotone" 
                dataKey="revenue" 
                stroke={COLORS.secondary} 
                strokeWidth={3}
                name="Revenue ($)"
                dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Booking Status Distribution */}
        <ChartCard title="Booking Status Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.bookingStatusDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(analyticsData?.bookingStatusDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Performing Cars */}
      <ChartCard title="Top Rented Cars">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData?.topRentedCars?.slice(0, 8) || []}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="carName" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              yAxisId="count"
              orientation="left"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="right"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar 
              yAxisId="count"
              dataKey="rentalCount" 
              fill={COLORS.accent} 
              name="Rental Count"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="revenue"
              dataKey="totalRevenue" 
              fill={COLORS.purple} 
              name="Revenue ($)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Recent Bookings Table */}
      <ChartCard title="Recent Bookings">
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-xs sm:text-sm text-left min-w-[640px]">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3">Booking ID</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">Customer</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">Car</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">Period</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">Amount</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(analyticsData?.recentBookings || []).slice(0, 10).map((booking) => (
                <tr key={booking.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 dark:text-white">
                    #{booking.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {booking.customerName}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {booking.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white">
                    {booking.carName}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white">
                    <div className="text-xs sm:text-sm whitespace-nowrap">
                      {new Date(booking.startDate).toLocaleDateString()} - 
                      {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 dark:text-white">
                    ${booking.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      booking.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      booking.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!analyticsData?.recentBookings || analyticsData.recentBookings.length === 0) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent bookings found
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
};

export default Analytics;
