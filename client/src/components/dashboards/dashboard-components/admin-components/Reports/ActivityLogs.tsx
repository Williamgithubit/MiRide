import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectActivityLogs, selectReportStatus } from '../../../../../store/Admin/adminReportsSlice';
import { FaHistory, FaUser, FaSearch, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { exportToCSV, exportToPDF, formatDateTime } from '../../../../../utils/exportUtils';

const ActivityLogs: React.FC = () => {
  const logs = useSelector(selectActivityLogs);
  const status = useSelector(selectReportStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleExportCSV = () => {
    const data = filteredLogs.map((log) => ({
      Timestamp: formatDateTime(log.timestamp),
      User: log.userName,
      Role: log.userRole,
      Action: log.action,
      Description: log.description,
      'IP Address': log.ipAddress || 'N/A',
    }));
    exportToCSV(data, 'activity_logs');
  };

  const handleExportPDF = () => {
    const data = filteredLogs.map((log) => ({
      Timestamp: formatDateTime(log.timestamp),
      User: log.userName,
      Role: log.userRole,
      Action: log.action,
      Description: log.description,
    }));
    exportToPDF(data, 'activity_logs', 'Activity Logs Report');
  };

  if (logs.length === 0 && status !== 'loading') {
    return (
      <div className="text-center py-12">
        <FaHistory className="mx-auto text-4xl text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          No activity logs available. Please generate a report.
        </p>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'owner':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'customer':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user, action, or description..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaFileCsv />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaFilePdf />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredLogs.length} of {logs.length} activity logs
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No activity logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          log.userRole
                        )}`}
                      >
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {log.ipAddress || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</h4>
            <FaHistory className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{logs.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Actions</h4>
            <FaUser className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {logs.filter((log) => log.userRole === 'admin').length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Owner Actions</h4>
            <FaUser className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {logs.filter((log) => log.userRole === 'owner').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
