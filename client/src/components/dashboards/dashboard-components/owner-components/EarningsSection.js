import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo } from "react";
import { TrendingUp, DollarSign, Calendar, Loader2 } from "lucide-react";
import { useGetOwnerStatsQuery, useGetRevenueDataQuery, } from "../../../../store/Dashboard/dashboardApi";
import { toast } from "react-hot-toast";
import DashboardCard from "../../../dashboards/shared/DashboardCard";
import Chart from "../../../dashboards/shared/Chart";
import { useStore } from "react-redux";
// Core earnings component that uses RTK Query hooks. Kept as a separate component so
// we can guard rendering it until we're sure `state.dashboardApi` exists in the store.
const EarningsSectionCore = React.memo(({ totalEarnings, ownerCars }) => {
    // Use RTK Query hooks for data fetching with polling disabled for better performance
    const { data: ownerStats, isLoading: statsLoading, error: statsError, } = useGetOwnerStatsQuery(undefined, {
        pollingInterval: 0, // Disable automatic polling
        refetchOnFocus: false, // Don't refetch when window gains focus
        refetchOnReconnect: false, // Don't refetch on reconnect
    });
    const { data: revenueResponse, isLoading: revenueLoading, error: revenueError, } = useGetRevenueDataQuery("monthly", {
        pollingInterval: 0,
        refetchOnFocus: false,
        refetchOnReconnect: false,
    });
    const loading = statsLoading || revenueLoading;
    // Memoize revenue data so useMemo dependencies are stable
    const revenueData = useMemo(() => revenueResponse?.data ?? [], [revenueResponse?.data]);
    // Memoize calculations to prevent unnecessary re-computations
    const calculations = useMemo(() => {
        const currentMonthEarnings = revenueData.length > 0
            ? revenueData[revenueData.length - 1].revenue
            : 0;
        const previousMonthEarnings = revenueData.length > 1
            ? revenueData[revenueData.length - 2].revenue
            : 0;
        const monthlyChange = previousMonthEarnings > 0
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
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(DashboardCard, { title: "This Month", value: `$${calculations.currentMonthEarnings.toLocaleString()}`, icon: DollarSign, change: {
                            value: Math.abs(calculations.monthlyChange),
                            type: calculations.monthlyChange >= 0 ? "increase" : "decrease",
                        } }), _jsx(DashboardCard, { title: "Total Earnings", value: `$${(ownerStats?.totalEarnings || totalEarnings).toLocaleString()}`, icon: TrendingUp }), _jsx(DashboardCard, { title: "Pending Payouts", value: `$${calculations.pendingPayouts.toLocaleString()}`, icon: Calendar })] }), _jsx(Chart, { type: "bar", data: {
                    labels: revenueData.map((item) => item.period),
                    datasets: [
                        {
                            label: "Monthly Earnings",
                            data: revenueData.map((item) => item.revenue),
                            backgroundColor: "rgba(59, 130, 246, 0.8)",
                        },
                    ],
                }, options: {
                    plugins: {
                        title: { display: true, text: "Monthly Earnings Overview" },
                    },
                } }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6", children: [_jsx("h4", { className: "text-lg font-semibold mb-4", children: "Earnings Breakdown" }), _jsx("div", { className: "space-y-4", children: ownerCars.map((car, index) => {
                            // Calculate estimated earnings per car based on rental price and rating
                            const estimatedRentals = Math.floor((car.rating || 0) * 5);
                            const estimatedEarnings = estimatedRentals * (car.rentalPricePerDay || 0);
                            return (_jsxs("div", { className: "flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("img", { src: car.imageUrl || "/placeholder-car.jpg", alt: car.model, className: "w-12 h-12 rounded-lg object-cover", onError: (e) => {
                                                    e.target.src =
                                                        "/placeholder-car.jpg";
                                                } }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: [car.year, " ", car.brand, " ", car.model] }), _jsxs("p", { className: "text-sm text-gray-500", children: [estimatedRentals, " rentals"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold", children: ["$", estimatedEarnings.toLocaleString()] }), _jsx("p", { className: "text-sm text-gray-500", children: "Total earned" })] })] }, String(car.id ?? index)));
                        }) })] })] }));
});
// Wrapper ensures we only render the RTK Query hook-using component when the
// dashboard API reducer is present on the store. This prevents the "No data
// found at state.dashboardApi" selector error in dev if the store hasn't been
// restarted after a code change.
const EarningsSection = ({ totalEarnings, ownerCars, }) => {
    const store = useStore();
    // Safely check for the dashboardApi slice without using `any`
    let hasDashboardApi = false;
    if (typeof store.getState === "function") {
        const state = store.getState();
        hasDashboardApi = Boolean(state && Object.prototype.hasOwnProperty.call(state, "dashboardApi"));
    }
    if (!hasDashboardApi) {
        return (_jsx("div", { className: "flex items-center justify-center h-48", children: _jsx("div", { children: _jsx("p", { className: "text-sm text-gray-500", children: "Dashboard data not yet available. If you're running the dev server, try restarting it." }) }) }));
    }
    return (_jsx(EarningsSectionCore, { totalEarnings: totalEarnings, ownerCars: ownerCars }));
};
export default React.memo(EarningsSection);
