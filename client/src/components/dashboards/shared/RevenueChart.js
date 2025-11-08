import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";
const RevenueChart = ({ data, title }) => {
    return (_jsxs("div", { className: "bg-white p-4 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: title }), _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: {
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { yAxisId: "left", orientation: "left", stroke: "#104911" }), _jsx(YAxis, { yAxisId: "right", orientation: "right", stroke: "#82ca9d" }), _jsx(Tooltip, { formatter: (value, name) => {
                                    if (name === "revenue") {
                                        return [`$${value}`, "Revenue"];
                                    }
                                    return [value, "Bookings"];
                                } }), _jsx(Legend, {}), _jsx(Bar, { yAxisId: "left", dataKey: "revenue", name: "Revenue ($)", fill: "#104911" }), _jsx(Bar, { yAxisId: "right", dataKey: "bookings", name: "Bookings", fill: "#82ca9d" })] }) }) })] }));
};
export default RevenueChart;
