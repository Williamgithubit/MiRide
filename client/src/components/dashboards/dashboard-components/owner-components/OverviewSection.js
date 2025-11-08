import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DollarSign, Calendar, TrendingUp, Car as CarIcon } from "lucide-react";
import DashboardCard from "../../shared/DashboardCard";
import Chart from "../../shared/Chart";
import Table from "../../shared/Table";
const OverviewSection = ({ totalEarnings, totalRentals, availableCars, avgRating, revenueChartData, carStatusChartData, rentalColumns, ownerRentals, }) => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(DashboardCard, { title: "Total Earnings", value: `$${totalEarnings.toLocaleString()}`, icon: DollarSign, change: { value: 12.5, type: "increase" } }), _jsx(DashboardCard, { title: "Total Rentals", value: totalRentals, icon: Calendar, change: { value: 8.3, type: "increase" } }), _jsx(DashboardCard, { title: "Available Cars", value: availableCars, icon: CarIcon }), _jsx(DashboardCard, { title: "Average Rating", value: isNaN(avgRating) ? "0.0" : avgRating.toFixed(1), icon: TrendingUp, change: { value: 2.1, type: "increase" } })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Chart, { type: "line", data: revenueChartData, options: {
                            plugins: { title: { display: true, text: "Monthly Revenue" } },
                        } }), _jsx(Chart, { type: "doughnut", data: carStatusChartData, options: {
                            plugins: {
                                title: { display: true, text: "Car Status Distribution" },
                            },
                        } })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Recent Rentals" }), _jsx(Table, { columns: rentalColumns, data: ownerRentals.slice(0, 5), pagination: false })] })] }));
};
export default OverviewSection;
