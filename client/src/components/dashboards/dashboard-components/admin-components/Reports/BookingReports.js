import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectBookingReport } from '../../../../../store/Admin/adminReportsSlice';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { exportToCSV, exportToPDF } from '../../../../../utils/exportUtils';
const BookingReports = () => {
    const report = useSelector(selectBookingReport);
    const [trendView, setTrendView] = useState('daily');
    if (!report) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No data available. Please generate a report." }) }));
    }
    const handleExportCSV = () => {
        const data = [
            { metric: 'Total Bookings', value: report.totalBookings },
            { metric: 'Pending', value: report.pendingBookings },
            { metric: 'Confirmed', value: report.confirmedBookings },
            { metric: 'Completed', value: report.completedBookings },
            { metric: 'Cancelled', value: report.cancelledBookings },
        ];
        exportToCSV(data, 'booking_report');
    };
    const handleExportPDF = () => {
        const data = [
            { Metric: 'Total Bookings', Value: report.totalBookings },
            { Metric: 'Pending', Value: report.pendingBookings },
            { Metric: 'Confirmed', Value: report.confirmedBookings },
            { Metric: 'Completed', Value: report.completedBookings },
            { Metric: 'Cancelled', Value: report.cancelledBookings },
        ];
        exportToPDF(data, 'booking_report', 'Booking Report');
    };
    const stats = [
        {
            label: 'Total Bookings',
            value: report.totalBookings,
            icon: _jsx(FaCalendarAlt, {}),
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Pending',
            value: report.pendingBookings,
            icon: _jsx(FaHourglassHalf, {}),
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        },
        {
            label: 'Confirmed',
            value: report.confirmedBookings,
            icon: _jsx(FaClock, {}),
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
            label: 'Completed',
            value: report.completedBookings,
            icon: _jsx(FaCheckCircle, {}),
            color: 'bg-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Cancelled',
            value: report.cancelledBookings,
            icon: _jsx(FaTimesCircle, {}),
            color: 'bg-red-500',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
        },
    ];
    const getTrendData = () => {
        switch (trendView) {
            case 'daily':
                return report.dailyTrend || [];
            case 'weekly':
                return report.weeklyTrend || [];
            case 'monthly':
                return report.monthlyTrend || [];
            default:
                return [];
        }
    };
    const trendData = getTrendData();
    const xAxisKey = trendView === 'daily' ? 'date' : trendView === 'weekly' ? 'week' : 'month';
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-end gap-3", children: [_jsxs("button", { onClick: handleExportCSV, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: [_jsx(FaFileCsv, {}), _jsx("span", { children: "Export CSV" })] }), _jsxs("button", { onClick: handleExportPDF, className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: [_jsx(FaFilePdf, {}), _jsx("span", { children: "Export PDF" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: stats.map((stat, index) => (_jsxs("div", { className: `${stat.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700`, children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("div", { className: `p-3 ${stat.color} text-white rounded-lg`, children: stat.icon }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-1", children: stat.value.toLocaleString() }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: stat.label })] }, index))) }), trendData.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Booking Trends" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setTrendView('daily'), className: `px-4 py-2 rounded-lg transition-colors ${trendView === 'daily'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`, children: "Daily" }), _jsx("button", { onClick: () => setTrendView('weekly'), className: `px-4 py-2 rounded-lg transition-colors ${trendView === 'weekly'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`, children: "Weekly" }), _jsx("button", { onClick: () => setTrendView('monthly'), className: `px-4 py-2 rounded-lg transition-colors ${trendView === 'monthly'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`, children: "Monthly" })] })] }), _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(LineChart, { data: trendData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: xAxisKey, stroke: "#9CA3AF" }), _jsx(YAxis, { stroke: "#9CA3AF" }), _jsx(Tooltip, { contentStyle: {
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '0.5rem',
                                    } }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "count", stroke: "#3B82F6", strokeWidth: 3, dot: { fill: '#3B82F6', r: 5 }, activeDot: { r: 7 }, name: "Bookings" })] }) })] })), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-6", children: "Booking Status Distribution" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: [
                                { status: 'Pending', count: report.pendingBookings },
                                { status: 'Confirmed', count: report.confirmedBookings },
                                { status: 'Completed', count: report.completedBookings },
                                { status: 'Cancelled', count: report.cancelledBookings },
                            ], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "status", stroke: "#9CA3AF" }), _jsx(YAxis, { stroke: "#9CA3AF" }), _jsx(Tooltip, { contentStyle: {
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '0.5rem',
                                    } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "count", fill: "#3B82F6", name: "Number of Bookings" })] }) })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Booking Summary" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Count" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Percentage" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: stats.slice(1).map((stat, index) => {
                                        const percentage = ((stat.value / report.totalBookings) * 100).toFixed(1);
                                        return (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700/50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white", children: stat.label }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: stat.value.toLocaleString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: `${percentage}%` } }) }), _jsxs("span", { children: [percentage, "%"] })] }) })] }, index));
                                    }) })] }) })] })] }));
};
export default BookingReports;
