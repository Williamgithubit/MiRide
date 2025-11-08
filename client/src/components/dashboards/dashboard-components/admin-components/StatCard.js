import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const StatCard = ({ title, value, icon: Icon, change, changeLabel, className = '', }) => {
    const isPositive = change && change > 0;
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
    return (_jsxs("div", { className: `bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: title }), _jsx("p", { className: "text-2xl font-semibold text-gray-900 dark:text-white mt-2", children: value })] }), _jsx("div", { className: "p-3 bg-blue-100 dark:bg-blue-900 rounded-full", children: _jsx(Icon, { className: "w-6 h-6 text-blue-600 dark:text-blue-300" }) })] }), typeof change !== 'undefined' && (_jsxs("div", { className: "mt-4 flex items-center", children: [_jsxs("span", { className: `${changeColor} text-sm font-medium`, children: [isPositive ? '↑' : '↓', " ", Math.abs(change), "%"] }), changeLabel && (_jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400 ml-2", children: changeLabel }))] }))] }));
};
export default StatCard;
