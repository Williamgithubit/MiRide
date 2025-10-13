import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectBookingReport } from '../../../../../store/Admin/adminReportsSlice';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { exportToCSV, exportToPDF } from '../../../../../utils/exportUtils';

const BookingReports: React.FC = () => {
  const report = useSelector(selectBookingReport);
  const [trendView, setTrendView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No data available. Please generate a report.
        </p>
      </div>
    );
  }

  const handleExportCSV = () => {
    const data = [
      { metric: 'Total Bookings', value: report.totalBookings },
      { metric: 'Pending', value: report.pendingBookings },
      { metric: 'Confirmed', value: report.confirmedBookings },
      { metric: 'Completed', value: report.completedBookings },
      { metric: 'Cancelled', value: report.cancelledBookings },
    ];
    exportToCSV(data, 'booking_report');
  };

  const handleExportPDF = () => {
    const data = [
      { Metric: 'Total Bookings', Value: report.totalBookings },
      { Metric: 'Pending', Value: report.pendingBookings },
      { Metric: 'Confirmed', Value: report.confirmedBookings },
      { Metric: 'Completed', Value: report.completedBookings },
      { Metric: 'Cancelled', Value: report.cancelledBookings },
    ];
    exportToPDF(data, 'booking_report', 'Booking Report');
  };

  const stats = [
    {
      label: 'Total Bookings',
      value: report.totalBookings,
      icon: <FaCalendarAlt />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Pending',
      value: report.pendingBookings,
      icon: <FaHourglassHalf />,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Confirmed',
      value: report.confirmedBookings,
      icon: <FaClock />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Completed',
      value: report.completedBookings,
      icon: <FaCheckCircle />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Cancelled',
      value: report.cancelledBookings,
      icon: <FaTimesCircle />,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  const getTrendData = () => {
    switch (trendView) {
      case 'daily':
        return report.dailyTrend || [];
      case 'weekly':
        return report.weeklyTrend || [];
      case 'monthly':
        return report.monthlyTrend || [];
      default:
        return [];
    }
  };

  const trendData = getTrendData();
  const xAxisKey = trendView === 'daily' ? 'date' : trendView === 'weekly' ? 'week' : 'month';

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaFileCsv />
          <span>Export CSV</span>
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaFilePdf />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.color} text-white rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Booking Trends */}
      {trendData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Booking Trends
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTrendView('daily')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  trendView === 'daily'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTrendView('weekly')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  trendView === 'weekly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTrendView('monthly')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  trendView === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xAxisKey} stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Booking Status Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { status: 'Pending', count: report.pendingBookings },
              { status: 'Confirmed', count: report.confirmedBookings },
              { status: 'Completed', count: report.completedBookings },
              { status: 'Cancelled', count: report.cancelledBookings },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="status" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" name="Number of Bookings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Booking Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {stats.slice(1).map((stat, index) => {
                const percentage = ((stat.value / report.totalBookings) * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {stat.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {stat.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span>{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingReports;
