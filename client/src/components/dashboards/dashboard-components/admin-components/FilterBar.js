import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
export const FilterBar = ({ filters, onFilterChange }) => {
    const bookingStatuses = [
        'All',
        'Pending',
        'Confirmed',
        'Cancelled',
        'Completed'
    ];
    const handleSearchChange = (e) => {
        onFilterChange({ ...filters, search: e.target.value });
    };
    const handleStatusChange = (e) => {
        onFilterChange({ ...filters, status: e.target.value === 'All' ? '' : e.target.value });
    };
    const handleDateChange = (type, date) => {
        onFilterChange({
            ...filters,
            [type === 'start' ? 'startDate' : 'endDate']: date ? date.toISOString() : null,
        });
    };
    return (_jsxs("div", { className: "bg-white p-4 rounded-lg shadow space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Search bookings...", value: filters.search, onChange: handleSearchChange, className: "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" }), _jsx("svg", { className: "absolute right-3 top-2.5 h-5 w-5 text-gray-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) })] }), _jsx("div", { children: _jsx("select", { value: filters.status || 'All', onChange: handleStatusChange, className: "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: bookingStatuses.map((status) => (_jsx("option", { value: status, children: status }, status))) }) }), _jsx("div", { children: _jsx(DatePicker, { selected: filters.startDate ? new Date(filters.startDate) : null, onChange: (date) => handleDateChange('start', date), placeholderText: "Start Date", className: "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", dateFormat: "MM/dd/yyyy" }) }), _jsx("div", { children: _jsx(DatePicker, { selected: filters.endDate ? new Date(filters.endDate) : null, onChange: (date) => handleDateChange('end', date), placeholderText: "End Date", className: "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", dateFormat: "MM/dd/yyyy", minDate: filters.startDate ? new Date(filters.startDate) : undefined }) })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { onClick: () => onFilterChange({
                        search: '',
                        status: '',
                        startDate: null,
                        endDate: null,
                    }), className: "px-4 py-2 text-sm text-gray-600 hover:text-gray-800", children: "Clear Filters" }) })] }));
};
