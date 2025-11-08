import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, } from "recharts";
const PieChartComponent = ({ data, title, }) => {
    return (_jsxs("div", { className: "bg-white p-4 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: title }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: false, outerRadius: 80, fill: "#104911", dataKey: "value", label: ({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`, children: data.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value, name) => [`${value}`, name] }), _jsx(Legend, {})] }) }) })] }));
};
export default PieChartComponent;
