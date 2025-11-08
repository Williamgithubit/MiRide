import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { selectCarReport } from '../../../../../store/Admin/adminReportsSlice';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaCar, FaCheckCircle, FaTimesCircle, FaTools, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { exportToCSV, exportToPDF } from '../../../../../utils/exportUtils';
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const CarReports = () => {
    const report = useSelector(selectCarReport);
    if (!report) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No data available. Please generate a report." }) }));
    }
    const handleExportCSV = () => {
        const data = [
            { metric: 'Total Cars', value: report.totalCars },
            { metric: 'Available Cars', value: report.availableCars },
            { metric: 'Rented Cars', value: report.rentedCars },
            { metric: 'Under Maintenance', value: report.maintenanceCars },
        ];
        exportToCSV(data, 'car_report');
    };
    const handleExportPDF = () => {
        const data = [
            { Metric: 'Total Cars', Value: report.totalCars },
            { Metric: 'Available Cars', Value: report.availableCars },
            { Metric: 'Rented Cars', Value: report.rentedCars },
            { Metric: 'Under Maintenance', Value: report.maintenanceCars },
        ];
        exportToPDF(data, 'car_report', 'Car Listings Report');
    };
    const stats = [
        {
            label: 'Total Cars',
            value: report.totalCars,
            icon: _jsx(FaCar, {}),
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Available',
            value: report.availableCars,
            icon: _jsx(FaCheckCircle, {}),
            color: 'bg-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Rented',
            value: report.rentedCars,
            icon: _jsx(FaTimesCircle, {}),
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
            label: 'Maintenance',
            value: report.maintenanceCars,
            icon: _jsx(FaTools, {}),
            color: 'bg-red-500',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-end gap-3", children: [_jsxs("button", { onClick: handleExportCSV, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: [_jsx(FaFileCsv, {}), _jsx("span", { children: "Export CSV" })] }), _jsxs("button", { onClick: handleExportPDF, className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: [_jsx(FaFilePdf, {}), _jsx("span", { children: "Export PDF" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat, index) => (_jsxs("div", { className: `${stat.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700`, children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("div", { className: `p-3 ${stat.color} text-white rounded-lg`, children: stat.icon }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-1", children: stat.value.toLocaleString() }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: stat.label })] }, index))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [report.carsByCategory && report.carsByCategory.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Cars by Category" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: report.carsByCategory, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }), _jsx(XAxis, { dataKey: "category", stroke: "#9CA3AF" }), _jsx(YAxis, { stroke: "#9CA3AF" }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '0.5rem',
                                            } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "count", fill: "#3B82F6", name: "Number of Cars" })] }) })] })), report.carsByStatus && report.carsByStatus.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Cars by Status" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: report.carsByStatus, cx: "50%", cy: "50%", labelLine: false, label: (props) => `${props.status}: ${props.count} (${props.percent ? (props.percent * 100).toFixed(0) : 0}%)`, outerRadius: 100, fill: "#8884d8", dataKey: "count", children: report.carsByStatus.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '0.5rem',
                                            } })] }) })] }))] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [report.carsByCategory && report.carsByCategory.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Category Breakdown" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Category" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Count" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: report.carsByCategory.map((item, index) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700/50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize", children: item.category }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: item.count.toLocaleString() })] }, index))) })] }) })] })), report.carsByStatus && report.carsByStatus.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Status Breakdown" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider", children: "Count" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: report.carsByStatus.map((item, index) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700/50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize", children: item.status }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: item.count.toLocaleString() })] }, index))) })] }) })] }))] })] }));
};
export default CarReports;
