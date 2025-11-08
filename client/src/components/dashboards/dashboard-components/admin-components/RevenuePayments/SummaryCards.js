import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGetPaymentStatsQuery } from "@/store/Admin/adminPaymentsApi";
const SummaryCards = ({ filters, }) => {
    const { data: stats, isLoading } = useGetPaymentStatsQuery();
    const cards = [
        {
            title: "Total Revenue",
            value: stats ? stats.totalRevenue : "-",
            className: "bg-gradient-to-r from-green-700 to-green-600",
        },
        {
            title: "Monthly Revenue",
            value: stats ? stats.monthlyRevenue : "-",
            className: "bg-gradient-to-r from-indigo-600 to-indigo-500",
        },
        {
            title: "Pending Payments",
            value: stats ? stats.pendingPayments : "-",
            className: "bg-gradient-to-r from-yellow-600 to-yellow-500",
        },
        {
            title: "Completed Payments",
            value: stats ? stats.completedPayments : "-",
            className: "bg-gradient-to-r from-teal-600 to-teal-500",
        },
    ];
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: cards.map((c) => (_jsxs("div", { className: `rounded-lg p-4 text-white ${c.className}`, children: [_jsx("div", { className: "text-sm opacity-90", children: c.title }), _jsx("div", { className: "text-2xl font-bold mt-2", children: isLoading ? "Loading..." : c.value })] }, c.title))) }));
};
export default SummaryCards;
