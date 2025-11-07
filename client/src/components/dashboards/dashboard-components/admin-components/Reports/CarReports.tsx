import React from 'react';
import { useSelector } from 'react-redux';
import { selectCarReport } from '../../../../../store/Admin/adminReportsSlice';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaCar, FaCheckCircle, FaTimesCircle, FaTools, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { exportToCSV, exportToPDF } from '../../../../../utils/exportUtils';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CarReports: React.FC = () => {
  const report = useSelector(selectCarReport);

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
      { metric: 'Total Cars', value: report.totalCars },
      { metric: 'Available Cars', value: report.availableCars },
      { metric: 'Rented Cars', value: report.rentedCars },
      { metric: 'Under Maintenance', value: report.maintenanceCars },
    ];
    exportToCSV(data, 'car_report');
  };

  const handleExportPDF = () => {
    const data = [
      { Metric: 'Total Cars', Value: report.totalCars },
      { Metric: 'Available Cars', Value: report.availableCars },
      { Metric: 'Rented Cars', Value: report.rentedCars },
      { Metric: 'Under Maintenance', Value: report.maintenanceCars },
    ];
    exportToPDF(data, 'car_report', 'Car Listings Report');
  };

  const stats = [
    {
      label: 'Total Cars',
      value: report.totalCars,
      icon: <FaCar />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Available',
      value: report.availableCars,
      icon: <FaCheckCircle />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Rented',
      value: report.rentedCars,
      icon: <FaTimesCircle />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Maintenance',
      value: report.maintenanceCars,
      icon: <FaTools />,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cars by Category */}
        {report.carsByCategory && report.carsByCategory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cars by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.carsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Number of Cars" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cars by Status */}
        {report.carsByStatus && report.carsByStatus.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cars by Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.carsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) =>
                    `${props.status}: ${props.count} (${props.percent ? (props.percent * 100).toFixed(0) : 0}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {report.carsByStatus.map((entry, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        {report.carsByCategory && report.carsByCategory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Category Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {report.carsByCategory.map((item: { category: string; count: number }, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {item.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status Breakdown */}
        {report.carsByStatus && report.carsByStatus.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Status Breakdown
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
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {report.carsByStatus.map((item: { status: string; count: number }, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {item.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {item.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarReports;
