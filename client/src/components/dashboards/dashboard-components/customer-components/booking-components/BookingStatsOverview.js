import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaChartBar, FaCar, FaCheckCircle, FaDollarSign, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
const BookingStatsOverview = ({ stats }) => {
    if (!stats) {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4", children: [...Array(6)].map((_, index) => (_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" }), _jsx("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded" })] }) }, index))) }));
    }
    const statCards = [
        {
            title: 'Total Bookings',
            value: stats.totalBookings || 0,
            icon: FaChartBar,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        },
        {
            title: 'Active Bookings',
            value: stats.activeBookings || 0,
            icon: FaCar,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/20'
        },
        {
            title: 'Completed',
            value: stats.completedBookings || 0,
            icon: FaCheckCircle,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-900/20'
        },
        {
            title: 'Total Spent',
            value: `$${(Number(stats.totalSpent) || 0).toFixed(2)}`,
            icon: FaDollarSign,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20'
        },
        {
            title: 'Average Value',
            value: `$${(Number(stats.averageBookingValue) || 0).toFixed(2)}`,
            icon: FaChartLine,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20'
        },
        {
            title: 'Upcoming',
            value: stats.upcomingBookings || 0,
            icon: FaCalendarAlt,
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
        }
    ];
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4", children: statCards.map((stat, index) => (_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: stat.title }), _jsx("p", { className: `text-2xl font-bold ${stat.color}`, children: stat.value })] }), _jsx("div", { className: `p-3 rounded-lg ${stat.bgColor}`, children: _jsx(stat.icon, { className: `text-xl ${stat.color}` }) })] }) }, index))) }));
};
export default BookingStatsOverview;
