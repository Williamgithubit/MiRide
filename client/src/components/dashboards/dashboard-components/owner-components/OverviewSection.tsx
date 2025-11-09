import React from "react";
import { DollarSign, Calendar, TrendingUp, Car as CarIcon } from "lucide-react";
import DashboardCard from "../../shared/DashboardCard";
import Chart from "../../shared/Chart";
import Table, { Column } from "../../shared/Table";

interface OverviewSectionProps {
  totalEarnings: number;
  totalRentals: number;
  availableCars: number;
  avgRating: number;
  revenueChartData: unknown;
  carStatusChartData: unknown;
  rentalColumns: Column[];
  ownerRentals: unknown[];
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  totalEarnings,
  totalRentals,
  availableCars,
  avgRating,
  revenueChartData,
  carStatusChartData,
  rentalColumns,
  ownerRentals,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <DashboardCard
          title="Total Earnings"
          value={`$${totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          change={{ value: 12.5, type: "increase" }}
        />
        <DashboardCard
          title="Total Rentals"
          value={totalRentals}
          icon={Calendar}
          change={{ value: 8.3, type: "increase" }}
        />
        <DashboardCard
          title="Available Cars"
          value={availableCars}
          icon={CarIcon}
        />
        <DashboardCard
          title="Average Rating"
          value={isNaN(avgRating) ? "0.0" : avgRating.toFixed(1)}
          icon={TrendingUp}
          change={{ value: 2.1, type: "increase" }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Chart
          type="line"
          data={revenueChartData}
          options={{
            plugins: { title: { display: true, text: "Monthly Revenue" } },
          }}
        />
        <Chart
          type="doughnut"
          data={carStatusChartData}
          options={{
            plugins: {
              title: { display: true, text: "Car Status Distribution" },
            },
          }}
        />
      </div>

      {/* Recent Rentals */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Recent Rentals
        </h3>
        <Table
          columns={rentalColumns}
          data={ownerRentals.slice(0, 5)}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default OverviewSection;
