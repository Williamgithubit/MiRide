import React from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";

type TopItem = { name: string; revenue: number };
type Rental = {
  car: { brand: string; model: string };
  totalCost: number;
  customer: { name: string };
};
import { useGetPaymentStatsQuery } from "@/store/Admin/adminPaymentsApi";
import {
  useGetRevenueDataQuery,
  useGetAdminStatsQuery,
} from "@/store/Dashboard/dashboardApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const RevenueCharts: React.FC<{ filters?: Record<string, any> }> = ({
  filters,
}) => {
  const { isDarkMode } = useDarkMode();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetPaymentStatsQuery();
  const {
    data: revenueData,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useGetRevenueDataQuery("month");
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useGetAdminStatsQuery();

  // Prepare chart data
  const monthlyTrend = revenueData?.data || [];
  const paymentStatusData = [
    { name: "Pending", value: stats?.pendingPayments ?? 0 },
    { name: "Completed", value: stats?.completedPayments ?? 0 },
  ];
  const COLORS = ["#fbbf24", "#10b981", "#6366f1"];

  // Top-earning cars from analytics
  type TopItem = { name: string; revenue: number };
  type Rental = {
    car: { brand: string; model: string };
    totalCost: number;
    customer: { name: string };
  };
  const topCars = analytics?.recentRentals
    ? (analytics.recentRentals as Rental[])
        .reduce((acc: TopItem[], rental: Rental) => {
          const carName = `${rental.car.brand} ${rental.car.model}`;
          const found = acc.find((c: TopItem) => c.name === carName);
          if (found) {
            found.revenue += rental.totalCost;
          } else {
            acc.push({ name: carName, revenue: rental.totalCost });
          }
          return acc;
        }, [] as TopItem[])
        .sort((a: TopItem, b: TopItem) => b.revenue - a.revenue)
        .slice(0, 3)
    : [];

  // Top-earning owners from analytics
  const topOwners = analytics?.recentRentals
    ? (analytics.recentRentals as Rental[])
        .reduce((acc: TopItem[], rental: Rental) => {
          const ownerName = rental.customer.name;
          const found = acc.find((o: TopItem) => o.name === ownerName);
          if (found) {
            found.revenue += rental.totalCost;
          } else {
            acc.push({ name: ownerName, revenue: rental.totalCost });
          }
          return acc;
        }, [] as TopItem[])
        .sort((a: TopItem, b: TopItem) => b.revenue - a.revenue)
        .slice(0, 3)
    : [];

  // Card data
    const totalRevenue =
      stats?.totalRevenue ??
      (Array.isArray((revenueData as any)?.data)
        ? (revenueData as any).data.reduce(
            (sum: number, item: any) => sum + (item?.revenue ?? 0),
            0
          )
        : "-");
    const monthlyRevenue =
      (Array.isArray((revenueData as any)?.data) && (revenueData as any).data.length > 0)
        ? (revenueData as any).data[0].revenue
        : "-";
    const pendingPayments = stats?.pendingPayments ?? "-";
    const completedPayments = stats?.completedPayments ?? "-";

  // Loading and error states
  if (statsLoading || revenueLoading || analyticsLoading) {
    return (
      <div className="rounded-lg p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-slate-700">
        <div className="text-center py-10 text-gray-600 dark:text-slate-400">Loading revenue data...</div>
      </div>
    );
  }
  if (statsError || revenueError || analyticsError) {
    return (
      <div className="rounded-lg p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-slate-700">
        <div className="text-center py-10 text-red-400">
          Error loading revenue data.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-3 sm:p-4 w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-slate-700">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Analytics & Insights</h3>
      
      {/* Key Metrics */}
      <div className="mb-6 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-transparent">
        <h4 className="text-sm font-semibold mb-3 text-gray-600 dark:text-slate-300">Key Metrics</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Pending</div>
            <div className="font-semibold text-yellow-600 dark:text-yellow-400">{pendingPayments}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Completed</div>
            <div className="font-semibold text-green-600 dark:text-green-400">{completedPayments}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-500 dark:text-slate-400">Platform Commission</div>
            <div className="font-semibold text-indigo-600 dark:text-indigo-400">${stats?.platformCommission ?? "-"}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-transparent">
          <div className="font-semibold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">Monthly Revenue Trend</div>
          {monthlyTrend.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500 dark:text-slate-400">
              No revenue data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={monthlyTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="period" stroke={isDarkMode ? "#cbd5e1" : "#6b7280"} fontSize={11} />
                <YAxis stroke={isDarkMode ? "#cbd5e1" : "#6b7280"} fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: isDarkMode ? 'none' : '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: isDarkMode ? '#cbd5e1' : '#374151' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payments Breakdown */}
        <div className="rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-transparent">
          <div className="font-semibold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">Payments Breakdown</div>
          {paymentStatusData.every((d) => d.value === 0) ? (
            <div className="text-center py-10 text-sm text-gray-500 dark:text-slate-400">
              No payment data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, value, x, y }) => (
                    <text
                      x={x}
                      y={y}
                      fill={isDarkMode ? "#fff" : "#374151"}
                      fontSize={12}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {`${name}: ${value}`}
                    </text>
                  )}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: isDarkMode ? 'none' : '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top-Earning Cars */}
        <div className="rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-transparent">
          <div className="font-semibold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">Top-Earning Cars</div>
          {topCars.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500 dark:text-slate-400">
              No car revenue data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topCars}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#6b7280"} fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke={isDarkMode ? "#cbd5e1" : "#6b7280"} fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: isDarkMode ? 'none' : '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: isDarkMode ? '#cbd5e1' : '#374151' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top-Earning Owners */}
        <div className="rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-transparent">
          <div className="font-semibold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">Top-Earning Owners</div>
          {topOwners.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500 dark:text-slate-400">
              No owner revenue data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topOwners}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#6b7280"} fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke={isDarkMode ? "#cbd5e1" : "#6b7280"} fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: isDarkMode ? 'none' : '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: isDarkMode ? '#cbd5e1' : '#374151' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueCharts;
