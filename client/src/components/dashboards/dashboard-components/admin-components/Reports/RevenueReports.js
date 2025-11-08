import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { selectRevenueReport } from '../../../../../store/Admin/adminReportsSlice';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaDollarSign, FaMoneyBillWave, FaChartLine, FaHourglassHalf, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { exportToCSV, exportRevenueReportToPDF, formatCurrency } from '../../../../../utils/exportUtils';
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const RevenueReports = () => {
    const report = useSelector(selectRevenueReport);
    if (!report) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No data available. Please generate a report." }) }));
    }
    const handleExportCSV = () => {
        const data = [
            { metric: 'Total Revenue', value: report.totalRevenue },
            { metric: 'Total Payouts', value: report.totalPayouts },
            { metric: 'Total Commissions', value: report.totalCommissions },
            { metric: 'Pending Payouts', value: report.pendingPayouts },
        ];
        exportToCSV(data, 'revenue_report');
    };
    const handleExportPDF = () => {
        exportRevenueReportToPDF(report);
    };
    const stats = [
        {
            label: 'Total Revenue',
            value: report.totalRevenue,
            icon: _jsx(FaDollarSign, {}),
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Total Payouts',
            value: report.totalPayouts,
            icon: _jsx(FaMoneyBillWave, {}),
            color: 'bg-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Total Commissions',
            value: report.totalCommissions,
            icon: _jsx(FaChartLine, {}),
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
            label: 'Pending Payouts',
            value: report.pendingPayouts,
            icon: _jsx(FaHourglassHalf, {}),
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-end gap-3", children: [_jsxs("button", { onClick: handleExportCSV, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: [_jsx(FaFileCsv, {}), _jsx("span", { children: "Export CSV" })] }), _jsxs("button", { onClick: handleExportPDF, className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: [_jsx(FaFilePdf, {}), _jsx("span", { children: "Export PDF" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat, index) => (_jsxs("div", { className: `${stat.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700`, children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("div", { className: `p-3 ${stat.color} text-white rounded-lg`, children: stat.icon }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-1", children: formatCurrency(stat.value) }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: stat.label })] }, index))) }), report.revenueByMonth && report.revenueByMonth.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-6", children: "Monthly Revenue Trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(LineChart, { data: report.revenueByMonth, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "month", stroke: "#9CA3AF" }), _jsx(YAxis, { stroke: "#9CA3AF" }), _jsx(Tooltip, { contentStyle: {
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '0.5rem',
                                    }, formatter: (value) => formatCurrency(value) }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "#3B82F6", strokeWidth: 3, dot: { fill: '#3B82F6', r: 5 }, name: "Revenue" }), _jsx(Line, { type: "monotone", dataKey: "payouts", stroke: "#10B981", strokeWidth: 3, dot: { fill: '#10B981', r: 5 }, name: "Payouts" }), _jsx(Line, { type: "monotone", dataKey: "commissions", stroke: "#8B5CF6", strokeWidth: 3, dot: { fill: '#8B5CF6', r: 5 }, name: "Commissions" })] }) })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [report.revenueByCategory && report.revenueByCategory.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-6", children: "Revenue by Category" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: report.revenueByCategory, cx: "50%", cy: "50%", labelLine: false, label: ({ category, revenue, percent }) => `${category}: ${formatCurrency(revenue)} (${((percent ?? 0) * 100).toFixed(0)}%)`, outerRadius: 100, fill: "#8884d8", dataKey: "revenue", children: report.revenueByCategory.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '0.5rem',
                                            }, formatter: (value) => formatCurrency(value) })] }) })] })), report.revenueByMonth && report.revenueByMonth.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-6", children: "Monthly Comparison" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: report.revenueByMonth, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "month", stroke: "#9CA3AF" }), _jsx(YAxis, { stroke: "#9CA3AF" }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '0.5rem',
                                            }, formatter: (value) => formatCurrency(value) }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "revenue", fill: "#3B82F6", name: "Revenue" }), _jsx(Bar, { dataKey: "commissions", fill: "#8B5CF6", name: "Commissions" })] }) })] }))] }), report.revenueByMonth && report.revenueByMonth.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Monthly Revenue Breakdown" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Month" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Revenue" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Payouts" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Commissions" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Profit Margin" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: report.revenueByMonth.map((item, index) => {
                                        const profitMargin = ((item.commissions / item.revenue) * 100).toFixed(1);
                                        return (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700/50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white", children: item.month }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: formatCurrency(item.revenue) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: formatCurrency(item.payouts) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: formatCurrency(item.commissions) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: _jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400", children: [profitMargin, "%"] }) })] }, index));
                                    }) })] }) })] })), report.revenueByCategory && report.revenueByCategory.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Revenue by Category" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Category" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Revenue" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Percentage" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: report.revenueByCategory.map((item, index) => {
                                        const percentage = ((item.revenue / report.totalRevenue) * 100).toFixed(1);
                                        return (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700/50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize", children: item.category }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: formatCurrency(item.revenue) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: `${percentage}%` } }) }), _jsxs("span", { children: [percentage, "%"] })] }) })] }, index));
                                    }) })] }) })] }))] }));
};
export default RevenueReports;
