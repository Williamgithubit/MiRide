import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Users, Car, DollarSign, TrendingUp } from 'lucide-react';
import DashboardCard from '../../shared/DashboardCard';
import Chart from '../../shared/Chart';
import { useGetAdminStatsQuery } from '../../../../store/Dashboard/dashboardApi';
const AdminOverview = () => {
    const { data: stats, isLoading: loading, error } = useGetAdminStatsQuery();
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        const errorMessage = (() => {
            if ('data' in error) {
                const errorData = error.data;
                return errorData?.message || errorData?.error || 'Unknown error';
            }
            if ('error' in error) {
                return error.error || 'Network error';
            }
            return 'An unexpected error occurred';
        })();
        return (_jsxs("div", { className: "text-red-500 text-center p-4", children: ["Error loading dashboard data: ", errorMessage] }));
    }
    if (!stats) {
        return null;
    }
    // Prepare chart data
    const revenueChartData = {
        labels: stats.recentRentals.map((rental) => new Date(rental.startDate).toLocaleDateString()),
        datasets: [{
                label: 'Revenue',
                data: stats.recentRentals.map((rental) => rental.totalCost),
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.1
            }]
    };
    const bookingTrendsData = {
        labels: stats.recentRentals.slice(0, 7).map((rental) => new Date(rental.startDate).toLocaleDateString()),
        datasets: [{
                label: 'Bookings',
                data: stats.recentRentals.slice(0, 7).map(() => 1),
                backgroundColor: 'rgb(59, 130, 246)',
            }]
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(DashboardCard, { title: "Total Users", value: stats.totalCustomers.toLocaleString(), icon: Users, change: { value: stats.newCustomersThisMonth, type: 'increase' } }), _jsx(DashboardCard, { title: "Active Cars", value: stats.availableCars, icon: Car, change: {
                            value: ((stats.availableCars - stats.unavailableCars) / stats.totalCars) * 100,
                            type: stats.availableCars > stats.unavailableCars ? 'increase' : 'decrease'
                        } }), _jsx(DashboardCard, { title: "Total Revenue", value: `$${stats.revenueThisMonth.toLocaleString()}`, icon: DollarSign, change: { value: stats.revenueGrowth, type: stats.revenueGrowth >= 0 ? 'increase' : 'decrease' } }), _jsx(DashboardCard, { title: "Active Rentals", value: stats.activeRentals, icon: TrendingUp, change: {
                            value: (stats.activeRentals / stats.totalRentals) * 100,
                            type: stats.activeRentals > 0 ? 'increase' : 'decrease'
                        } })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Chart, { type: "line", data: revenueChartData, options: { plugins: { title: { display: true, text: 'Platform Revenue' } } } }), _jsx(Chart, { type: "bar", data: bookingTrendsData, options: { plugins: { title: { display: true, text: 'Weekly Booking Trends' } } } })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6", children: [_jsx("h4", { className: "text-lg font-semibold mb-4", children: "Recent Users" }), _jsx("div", { className: "space-y-3", children: stats.recentRentals.slice(0, 5).map((rental) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: rental.customer.name }), _jsx("p", { className: "text-sm text-gray-500", children: rental.customer.email })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-medium", children: [rental.car.brand, " ", rental.car.model] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["$", rental.totalCost.toLocaleString()] })] })] }, rental.id))) })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6", children: [_jsx("h4", { className: "text-lg font-semibold mb-4", children: "System Stats" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Car Utilization" }), _jsxs("span", { className: "font-semibold", children: [((stats.availableCars / stats.totalCars) * 100).toFixed(1), "%"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Active Users" }), _jsx("span", { className: "font-semibold", children: stats.totalCustomers })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Monthly Revenue" }), _jsxs("span", { className: "font-semibold", children: ["$", stats.revenueThisMonth.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Total Rentals" }), _jsx("span", { className: "font-semibold", children: stats.totalRentals })] })] })] })] })] }));
};
export default AdminOverview;
