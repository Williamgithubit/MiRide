import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserReport, selectReportStatus } from '../../../../../store/Admin/adminReportsSlice';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaUserCheck, FaUserSlash, FaUserPlus, FaDownload, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { exportToCSV, exportUserReportToPDF } from '../../../../../utils/exportUtils';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const UserReports: React.FC = () => {
  const report = useSelector(selectUserReport);
  const status = useSelector(selectReportStatus);

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
      { metric: 'Total Users', value: report.totalUsers },
      { metric: 'Active Users', value: report.activeUsers },
      { metric: 'Inactive Users', value: report.inactiveUsers },
      { metric: 'New Registrations', value: report.newRegistrations },
    ];
    exportToCSV(data, 'user_report');
  };

  const handleExportPDF = () => {
    exportUserReportToPDF(report);
  };

  const stats = [
    {
      label: 'Total Users',
      value: report.totalUsers,
      icon: <FaUsers />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Active Users',
      value: report.activeUsers,
      icon: <FaUserCheck />,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Inactive Users',
      value: report.inactiveUsers,
      icon: <FaUserSlash />,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'New Registrations',
      value: report.newRegistrations,
      icon: <FaUserPlus />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
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
        {/* Registration Trend */}
        {report.registrationTrend && report.registrationTrend.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Registration Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
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
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Registrations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Users by Role */}
        {report.usersByRole && report.usersByRole.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Users by Role
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) =>
                    `${props.role}: ${props.count} (${props.percent ? (props.percent * 100).toFixed(0) : 0}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {report.usersByRole.map((entry, index) => (
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

      {/* Users by Role Table */}
      {report.usersByRole && report.usersByRole.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detailed Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
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
                {report.usersByRole.map((item, index) => {
                  const percentage = ((item.count / report.totalUsers) * 100).toFixed(1);
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {item.count.toLocaleString()}
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
      )}
    </div>
  );
};

export default UserReports;
