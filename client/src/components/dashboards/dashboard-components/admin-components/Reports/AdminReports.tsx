import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../../../store/store";
import {
  setActiveTab,
  setFilters,
  resetFilters,
  selectActiveTab,
  selectReportFilters,
  selectReportStatus,
  selectReportError,
  fetchUserReport,
  fetchCarReport,
  fetchBookingReport,
  fetchRevenueReport,
  fetchActivityLogs,
} from "../../../../../store/Admin/adminReportsSlice";
import {
  FaUsers,
  FaCar,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaHistory,
  FaFilter,
  FaSync,
} from "react-icons/fa";
import UserReports from "./UserReports";
import CarReports from "./CarReports";
import BookingReports from "./BookingReports";
import RevenueReports from "./RevenueReports";
import ActivityLogs from "./ActivityLogs";
import ReportFilters from "./ReportFilters";

const AdminReports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useSelector(selectActiveTab);
  const filters = useSelector(selectReportFilters);
  const status = useSelector(selectReportStatus);
  const error = useSelector(selectReportError);
  const [showFilters, setShowFilters] = useState(false);

  const tabs = [
    { id: "users" as const, label: "User Reports", icon: <FaUsers /> },
    { id: "cars" as const, label: "Car Listings", icon: <FaCar /> },
    { id: "bookings" as const, label: "Bookings", icon: <FaCalendarAlt /> },
    {
      id: "revenue" as const,
      label: "Revenue & Payments",
      icon: <FaMoneyBillWave />,
    },
    { id: "activity" as const, label: "Activity Logs", icon: <FaHistory /> },
  ];

  useEffect(() => {
    // Fetch initial data based on active tab
    handleGenerateReport();
  }, [activeTab]);

  // Refetch when filters change for the currently active tab
  useEffect(() => {
    // Only refetch when filters are updated while a tab is active
    handleGenerateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab]);

  const handleGenerateReport = () => {
    switch (activeTab) {
      case "users":
        dispatch(fetchUserReport(filters));
        break;
      case "cars":
        dispatch(fetchCarReport(filters));
        break;
      case "bookings":
        dispatch(fetchBookingReport(filters));
        break;
      case "revenue":
        dispatch(fetchRevenueReport(filters));
        break;
      case "activity":
        dispatch(fetchActivityLogs(filters));
        break;
    }
  };

  const handleTabChange = (tabId: typeof activeTab) => {
    dispatch(setActiveTab(tabId));
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading report data...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "users":
        return <UserReports />;
      case "cars":
        return <CarReports />;
      case "bookings":
        return <BookingReports />;
      case "revenue":
        return <RevenueReports />;
      case "activity":
        return <ActivityLogs />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and export comprehensive system reports
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <FaFilter />
              <span>Filters</span>
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={status === "loading"}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={status === "loading" ? "animate-spin" : ""} />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <ReportFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              onApply={handleGenerateReport}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminReports;
