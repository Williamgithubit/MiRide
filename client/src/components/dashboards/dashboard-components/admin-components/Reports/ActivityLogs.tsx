import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectActivityLogs,
  selectReportStatus,
  selectReportFilters,
} from "../../../../../store/Admin/adminReportsSlice";
import {
  FaHistory,
  FaUser,
  FaSearch,
  FaFileCsv,
  FaFilePdf,
} from "react-icons/fa";
import {
  exportToCSV,
  exportToPDF,
  formatDateTime,
} from "../../../../../utils/exportUtils";

const ActivityLogs: React.FC = () => {
  const logs = useSelector(selectActivityLogs);
  const status = useSelector(selectReportStatus);
  const filters = useSelector(selectReportFilters);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Sync with global filters
  useEffect(() => {
    if (filters?.userType) {
      setRoleFilter(filters.userType as string);
    }
  }, [filters]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || log.userRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleExportCSV = () => {
    const data = filteredLogs.map((log) => ({
      Timestamp: formatDateTime(log.timestamp),
      User: log.userName,
      Role: log.userRole,
      Action: log.action,
      Description: log.description,
      "IP Address": log.ipAddress || "N/A",
    }));
    exportToCSV(data, "activity_logs");
  };

  const handleExportPDF = () => {
    const data = filteredLogs.map((log) => ({
      Timestamp: formatDateTime(log.timestamp),
      User: log.userName,
      Role: log.userRole,
      Action: log.action,
      Description: log.description,
    }));
    exportToPDF(data, "activity_logs", "Activity Logs Report");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300";
      case "owner":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300";
      case "customer":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  if (logs.length === 0 && status !== "loading") {
    return (
      <div className="text-center py-16">
        <FaHistory className="mx-auto text-5xl text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-lg text-gray-500 dark:text-gray-400">
          No activity logs available
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Generate a report to view user activities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters & Export Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Search + Role Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search user, action, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {/* Export Buttons - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold">{filteredLogs.length}</span> of{" "}
              <span className="font-semibold">{logs.length}</span> logs
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <FaFileCsv className="text-lg" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                <FaFilePdf className="text-lg" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Table / Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Mobile Cards */}
        <div className="block lg:hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No logs match your current filters.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <FaUser className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {log.userName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(log.timestamp)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        log.userRole
                      )}`}
                    >
                      {log.userRole}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {log.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {log.description}
                    </p>
                    {log.ipAddress && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        IP: {log.ipAddress}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No logs match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <FaUser className="text-gray-500 text-sm" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          log.userRole
                        )}`}
                      >
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                      <p className="truncate" title={log.description}>
                        {log.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {log.ipAddress || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Activities</p>
              <p className="text-3xl font-bold mt-1">{logs.length}</p>
            </div>
            <FaHistory className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Admin Actions</p>
              <p className="text-3xl font-bold mt-1">
                {logs.filter((l) => l.userRole === "admin").length}
              </p>
            </div>
            <FaUser className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Customer Actions</p>
              <p className="text-3xl font-bold mt-1">
                {logs.filter((l) => l.userRole === "customer").length}
              </p>
            </div>
            <FaUser className="text-4xl opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;