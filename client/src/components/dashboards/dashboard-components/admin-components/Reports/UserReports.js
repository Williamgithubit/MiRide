import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { selectUserReport, selectReportStatus } from '../../../../../store/Admin/adminReportsSlice';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaUserCheck, FaUserSlash, FaUserPlus, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { exportToCSV, exportUserReportToPDF } from '../../../../../utils/exportUtils';
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const UserReports = () => {
    const report = useSelector(selectUserReport);
    const status = useSelector(selectReportStatus);
    if (!report) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No data available. Please generate a report." }) }));
    }
    const handleExportCSV = () => {
        const data = [
            { metric: 'Total Users', value: report.totalUsers },
            { metric: 'Active Users', value: report.activeUsers },
            { metric: 'Inactive Users', value: report.inactiveUsers },
            { metric: 'New Registrations', value: report.newRegistrations },
        ];
        exportToCSV(data, 'user_report');
    };
    const handleExportPDF = () => {
        exportUserReportToPDF(report);
    };
    const stats = [
        {
            label: 'Total Users',
            value: report.totalUsers,
            icon: _jsx(FaUsers, {}),
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Active Users',
            value: report.activeUsers,
            icon: _jsx(FaUserCheck, {}),
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Inactive Users',
            value: report.inactiveUsers,
            icon: _jsx(FaUserSlash, {}),
            color: 'bg-red-500',
            textColor: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
        },
        {
            label: 'New Registrations',
            value: report.newRegistrations,
            icon: _jsx(FaUserPlus, {}),
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-end gap-3", children: [_jsxs("button", { onClick: handleExportCSV, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: [_jsx(FaFileCsv, {}), _jsx("span", { children: "Export CSV" })] }), _jsxs("button", { onClick: handleExportPDF, className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: [_jsx(FaFilePdf, {}), _jsx("span", { children: "Export PDF" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat, index) => (_jsxs("div", { className: `${stat.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700`, children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("div", { className: `p-3 ${stat.color} text-white rounded-lg`, children: stat.icon }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-1", children: stat.value.toLocaleString() }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: stat.label })] }, index))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [report.registrationTrend && report.registrationTrend.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Registration Trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: report.registrationTrend, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "date", stroke: "#9CA3AF" }), _jsx(YAxis, { stroke: "#9CA3AF" }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '0.5rem',
                                            } }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "count", stroke: "#3B82F6", strokeWidth: 2, dot: { fill: '#3B82F6', r: 4 }, activeDot: { r: 6 }, name: "Registrations" })] }) })] })), report.usersByRole && report.usersByRole.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Users by Role" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: report.usersByRole, cx: "50%", cy: "50%", labelLine: false, label: (props) => `${props.role}: ${props.count} (${props.percent ? (props.percent * 100).toFixed(0) : 0}%)`, outerRadius: 100, fill: "#8884d8", dataKey: "count", children: report.usersByRole.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '0.5rem',
                                            } })] }) })] }))] }), report.usersByRole && report.usersByRole.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Detailed Breakdown" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Role" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Count" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Percentage" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: report.usersByRole.map((item, index) => {
                                        const percentage = ((item.count / report.totalUsers) * 100).toFixed(1);
                                        return (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700/50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white", children: item.role }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: item.count.toLocaleString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: `${percentage}%` } }) }), _jsxs("span", { children: [percentage, "%"] })] }) })] }, index));
                                    }) })] }) })] }))] }));
};
export default UserReports;
