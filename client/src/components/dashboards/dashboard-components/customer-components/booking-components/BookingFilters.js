import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDispatch, useSelector } from 'react-redux';
import { setStatusFilter, setSortBy, setSortOrder, setRealTimeEnabled } from '../../../../../store/Booking/bookingSlice';
import { FaSortUp, FaSortDown, FaSync } from 'react-icons/fa';
const BookingFilters = () => {
    const dispatch = useDispatch();
    const { statusFilter, sortBy, sortOrder, realTimeEnabled } = useSelector((state) => state.booking);
    const statusOptions = [
        { value: 'all', label: 'All Bookings' },
        { value: 'pending_approval', label: 'Pending Approval' },
        { value: 'approved', label: 'Approved' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'rejected', label: 'Rejected' }
    ];
    const sortOptions = [
        { value: 'date', label: 'Date' },
        { value: 'status', label: 'Status' },
        { value: 'amount', label: 'Amount' }
    ];
    return (_jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Status:" }), _jsx("select", { value: statusFilter, onChange: (e) => dispatch(setStatusFilter(e.target.value)), className: "px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: statusOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Sort by:" }), _jsx("select", { value: sortBy, onChange: (e) => dispatch(setSortBy(e.target.value)), className: "px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: sortOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsx("button", { onClick: () => dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')), className: "px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center", title: `Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`, children: sortOrder === 'asc' ? _jsx(FaSortUp, { className: "w-4 h-4" }) : _jsx(FaSortDown, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Real-time:" }), _jsx("button", { onClick: () => dispatch(setRealTimeEnabled(!realTimeEnabled)), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${realTimeEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`, children: _jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${realTimeEnabled ? 'translate-x-6' : 'translate-x-1'}` }) })] }), _jsx("button", { onClick: () => window.location.reload(), className: "px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center", title: "Refresh Data", children: _jsx(FaSync, { className: "w-4 h-4" }) })] }));
};
export default BookingFilters;
