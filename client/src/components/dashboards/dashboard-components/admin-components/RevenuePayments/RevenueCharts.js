import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGetPaymentStatsQuery } from "@/store/Admin/adminPaymentsApi";
import { useGetRevenueDataQuery, useGetAdminStatsQuery, } from "@/store/Dashboard/dashboardApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, } from "recharts";
const RevenueCharts = ({ filters, }) => {
    const { data: stats, isLoading: statsLoading, isError: statsError, } = useGetPaymentStatsQuery();
    const { data: revenueData, isLoading: revenueLoading, isError: revenueError, } = useGetRevenueDataQuery("month");
    const { data: analytics, isLoading: analyticsLoading, isError: analyticsError, } = useGetAdminStatsQuery();
    // Prepare chart data
    const monthlyTrend = revenueData?.data || [];
    const paymentStatusData = [
        { name: "Pending", value: stats?.pendingPayments ?? 0 },
        { name: "Completed", value: stats?.completedPayments ?? 0 },
    ];
    const COLORS = ["#fbbf24", "#10b981", "#6366f1"];
    const topCars = analytics?.recentRentals
        ? analytics.recentRentals
            .reduce((acc, rental) => {
            const carName = `${rental.car.brand} ${rental.car.model}`;
            const found = acc.find((c) => c.name === carName);
            if (found) {
                found.revenue += rental.totalCost;
            }
            else {
                acc.push({ name: carName, revenue: rental.totalCost });
            }
            return acc;
        }, [])
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3)
        : [];
    // Top-earning owners from analytics
    const topOwners = analytics?.recentRentals
        ? analytics.recentRentals
            .reduce((acc, rental) => {
            const ownerName = rental.customer.name;
            const found = acc.find((o) => o.name === ownerName);
            if (found) {
                found.revenue += rental.totalCost;
            }
            else {
                acc.push({ name: ownerName, revenue: rental.totalCost });
            }
            return acc;
        }, [])
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3)
        : [];
    // Card data
    const totalRevenue = stats?.totalRevenue ??
        (Array.isArray(revenueData?.data)
            ? revenueData.data.reduce((sum, item) => sum + (item?.revenue ?? 0), 0)
            : "-");
    const monthlyRevenue = (Array.isArray(revenueData?.data) && revenueData.data.length > 0)
        ? revenueData.data[0].revenue
        : "-";
    const pendingPayments = stats?.pendingPayments ?? "-";
    const completedPayments = stats?.completedPayments ?? "-";
    // Loading and error states
    if (statsLoading || revenueLoading || analyticsLoading) {
        return (_jsx("div", { className: "bg-slate-800 rounded-lg p-4 text-white", children: _jsx("div", { className: "text-center py-10", children: "Loading revenue data..." }) }));
    }
    if (statsError || revenueError || analyticsError) {
        return (_jsx("div", { className: "bg-slate-800 rounded-lg p-4 text-white", children: _jsx("div", { className: "text-center py-10 text-red-400", children: "Error loading revenue data." }) }));
    }
    return (_jsxs("div", { className: "bg-slate-800 rounded-lg p-3 sm:p-4 text-white w-full", children: [_jsx("h3", { className: "text-lg sm:text-xl font-semibold mb-4", children: "Analytics & Insights" }), _jsxs("div", { className: "mb-6 p-3 sm:p-4 bg-slate-700/50 rounded-lg", children: [_jsx("h4", { className: "text-sm font-semibold mb-3 text-slate-300", children: "Key Metrics" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-slate-400 text-xs", children: "Pending" }), _jsx("div", { className: "text-yellow-400 font-semibold", children: pendingPayments })] }), _jsxs("div", { children: [_jsx("div", { className: "text-slate-400 text-xs", children: "Completed" }), _jsx("div", { className: "text-green-400 font-semibold", children: completedPayments })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("div", { className: "text-slate-400 text-xs", children: "Platform Commission" }), _jsxs("div", { className: "text-indigo-400 font-semibold", children: ["$", stats?.platformCommission ?? "-"] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 sm:p-4", children: [_jsx("div", { className: "font-semibold mb-3 text-sm sm:text-base", children: "Monthly Revenue Trend" }), monthlyTrend.length === 0 ? (_jsx("div", { className: "text-center text-slate-400 py-10 text-sm", children: "No revenue data available." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(LineChart, { data: monthlyTrend, margin: { top: 10, right: 10, left: -20, bottom: 0 }, children: [_jsx(XAxis, { dataKey: "period", stroke: "#cbd5e1", fontSize: 11 }), _jsx(YAxis, { stroke: "#cbd5e1", fontSize: 11 }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }, labelStyle: { color: '#cbd5e1' } }), _jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "#6366f1", strokeWidth: 2, dot: { fill: '#6366f1', r: 3 } })] }) }))] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 sm:p-4", children: [_jsx("div", { className: "font-semibold mb-3 text-sm sm:text-base", children: "Payments Breakdown" }), paymentStatusData.every((d) => d.value === 0) ? (_jsx("div", { className: "text-center text-slate-400 py-10 text-sm", children: "No payment data available." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: paymentStatusData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 70, label: ({ name, value, x, y }) => (_jsx("text", { x: x, y: y, fill: "#fff", fontSize: 12, textAnchor: "middle", dominantBaseline: "central", children: `${name}: ${value}` })), children: paymentStatusData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' } })] }) }))] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 sm:p-4", children: [_jsx("div", { className: "font-semibold mb-3 text-sm sm:text-base", children: "Top-Earning Cars" }), topCars.length === 0 ? (_jsx("div", { className: "text-center text-slate-400 py-10 text-sm", children: "No car revenue data available." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(BarChart, { data: topCars, margin: { top: 10, right: 10, left: -20, bottom: 0 }, children: [_jsx(XAxis, { dataKey: "name", stroke: "#cbd5e1", fontSize: 11, angle: -15, textAnchor: "end", height: 60 }), _jsx(YAxis, { stroke: "#cbd5e1", fontSize: 11 }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }, labelStyle: { color: '#cbd5e1' } }), _jsx(Bar, { dataKey: "revenue", fill: "#10b981", radius: [8, 8, 0, 0] })] }) }))] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 sm:p-4", children: [_jsx("div", { className: "font-semibold mb-3 text-sm sm:text-base", children: "Top-Earning Owners" }), topOwners.length === 0 ? (_jsx("div", { className: "text-center text-slate-400 py-10 text-sm", children: "No owner revenue data available." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(BarChart, { data: topOwners, margin: { top: 10, right: 10, left: -20, bottom: 0 }, children: [_jsx(XAxis, { dataKey: "name", stroke: "#cbd5e1", fontSize: 11, angle: -15, textAnchor: "end", height: 60 }), _jsx(YAxis, { stroke: "#cbd5e1", fontSize: 11 }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }, labelStyle: { color: '#cbd5e1' } }), _jsx(Bar, { dataKey: "revenue", fill: "#6366f1", radius: [8, 8, 0, 0] })] }) }))] })] })] }));
};
export default RevenueCharts;
