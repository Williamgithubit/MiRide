import React, { useEffect, useMemo } from "react";
import { TrendingUp, DollarSign, Calendar, Loader2 } from "lucide-react";
import {
  useGetOwnerStatsQuery,
  useGetRevenueDataQuery,
} from "../../../../store/Dashboard/dashboardApi";
import { toast } from "react-hot-toast";
import DashboardCard from "../../../dashboards/shared/DashboardCard";
import Chart from "../../../dashboards/shared/Chart";
import { useStore } from "react-redux";
import { getPrimaryImageUrl } from "../../../../utils/imageUtils";

interface OwnerCar {
  id?: string | number;
  rating?: number;
  rentalPricePerDay?: number;
  imageUrl?: string;
  model?: string;
  year?: number | string;
  brand?: string;
}

interface EarningsSectionProps {
  totalEarnings: number;
  ownerCars: OwnerCar[];
}

// Core earnings component that uses RTK Query hooks. Kept as a separate component so
// we can guard rendering it until we're sure `state.dashboardApi` exists in the store.
const EarningsSectionCore: React.FC<EarningsSectionProps> = React.memo(
  ({ totalEarnings, ownerCars }) => {
    // Use RTK Query hooks for data fetching with polling disabled for better performance
    const {
      data: ownerStats,
      isLoading: statsLoading,
      error: statsError,
    } = useGetOwnerStatsQuery(undefined, {
      pollingInterval: 0, // Disable automatic polling
      refetchOnFocus: false, // Don't refetch when window gains focus
      refetchOnReconnect: false, // Don't refetch on reconnect
    });

    const {
      data: revenueResponse,
      isLoading: revenueLoading,
      error: revenueError,
    } = useGetRevenueDataQuery("monthly", {
      pollingInterval: 0,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    });

    const loading = statsLoading || revenueLoading;
    // Memoize revenue data so useMemo dependencies are stable
    const revenueData = useMemo(
      () => revenueResponse?.data ?? [],
      [revenueResponse?.data]
    );

    // Memoize calculations to prevent unnecessary re-computations
    const calculations = useMemo(() => {
      const currentMonthEarnings =
        revenueData.length > 0
          ? revenueData[revenueData.length - 1].revenue
          : 0;

      const previousMonthEarnings =
        revenueData.length > 1
          ? revenueData[revenueData.length - 2].revenue
          : 0;

      const monthlyChange =
        previousMonthEarnings > 0
          ? ((currentMonthEarnings - previousMonthEarnings) /
              previousMonthEarnings) *
            100
          : 0;

      const pendingPayouts = ownerStats ? ownerStats.totalEarnings * 0.1 : 0;

      return {
        currentMonthEarnings,
        previousMonthEarnings,
        monthlyChange,
        pendingPayouts,
      };
    }, [revenueData, ownerStats]);

    // Handle errors
    useEffect(() => { 
      if (statsError) {
        console.error("Error fetching owner stats:", statsError);
        toast.error("Failed to load owner statistics");
      }
      if (revenueError) {
        console.error("Error fetching revenue data:", revenueError);
        toast.error("Failed to load revenue data");
      }
    }, [statsError, revenueError]);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          <DashboardCard
            title="This Month"
            value={`$${calculations.currentMonthEarnings.toLocaleString()}`}
            icon={DollarSign}
            change={{
              value: Math.abs(calculations.monthlyChange),
              type: calculations.monthlyChange >= 0 ? "increase" : "decrease",
            }}
          />
          <DashboardCard
            title="Total Earnings"
            value={`$${(
              ownerStats?.totalEarnings || totalEarnings
            ).toLocaleString()}`}
            icon={TrendingUp}
          />
          <DashboardCard
            title="Pending Payouts"
            value={`$${calculations.pendingPayouts.toLocaleString()}`}
            icon={Calendar}
          />
        </div>

        <Chart
          type="bar"
          data={{
            labels: revenueData.map((item) => item.period),
            datasets: [
              {
                label: "Monthly Earnings",
                data: revenueData.map((item) => item.revenue),
                backgroundColor: "rgba(59, 130, 246, 0.8)",
              },
            ],
          }}
          options={{
            plugins: {
              title: { display: true, text: "Monthly Earnings Overview" },
            },
          }}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 md:p-8 lg:p-10">
          <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6">Earnings Breakdown</h4>
          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            {ownerCars.map((car, index) => {
              // Calculate estimated earnings per car based on rental price and rating
              const estimatedRentals = Math.floor((car.rating || 0) * 5);
              const estimatedEarnings =
                estimatedRentals * (car.rentalPricePerDay || 0);

              return (
                <div
                  key={String(car.id ?? index)}
                  className="flex justify-between items-center p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                    <img
                      src={getPrimaryImageUrl((car as any).images, car.imageUrl)}
                      alt={car.model}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-car.jpg";
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {car.year} {car.brand} {car.model}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {estimatedRentals} rentals
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      ${estimatedEarnings.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total earned</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

// Wrapper ensures we only render the RTK Query hook-using component when the
// dashboard API reducer is present on the store. This prevents the "No data
// found at state.dashboardApi" selector error in dev if the store hasn't been
// restarted after a code change.
const EarningsSection: React.FC<EarningsSectionProps> = ({
  totalEarnings,
  ownerCars,
}) => {
  const store = useStore();
  // Safely check for the dashboardApi slice without using `any`
  let hasDashboardApi = false;
  if (typeof store.getState === "function") {
    const state = store.getState() as Record<string, unknown>;
    hasDashboardApi = Boolean(
      state && Object.prototype.hasOwnProperty.call(state, "dashboardApi")
    );
  }

  if (!hasDashboardApi) {
    return (
      <div className="flex items-center justify-center h-48">
        <div>
          <p className="text-sm text-gray-500">
            Dashboard data not yet available. If you're running the dev server,
            try restarting it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EarningsSectionCore totalEarnings={totalEarnings} ownerCars={ownerCars} />
  );
};

export default React.memo(EarningsSection);
