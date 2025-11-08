import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaClock, FaCheckCircle, FaTimesCircle, FaPlayCircle, FaStopCircle, FaBan, FaQuestionCircle } from 'react-icons/fa';
const BookingStatusBadge = ({ status, size = 'md' }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending_approval':
                return {
                    label: 'Pending Approval',
                    icon: FaClock,
                    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                };
            case 'approved':
                return {
                    label: 'Approved',
                    icon: FaCheckCircle,
                    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                };
            case 'rejected':
                return {
                    label: 'Rejected',
                    icon: FaTimesCircle,
                    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                };
            case 'active':
                return {
                    label: 'Active',
                    icon: FaPlayCircle,
                    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                };
            case 'completed':
                return {
                    label: 'Completed',
                    icon: FaStopCircle,
                    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    icon: FaBan,
                    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                };
            default:
                return {
                    label: 'Unknown',
                    icon: FaQuestionCircle,
                    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                };
        }
    };
    const getSizeClasses = (size) => {
        switch (size) {
            case 'sm':
                return 'px-2 py-1 text-xs';
            case 'lg':
                return 'px-4 py-2 text-sm';
            default:
                return 'px-3 py-1 text-sm';
        }
    };
    const config = getStatusConfig(status);
    const sizeClasses = getSizeClasses(size);
    return (_jsxs("span", { className: `inline-flex items-center gap-1 font-medium rounded-full ${config.className} ${sizeClasses}`, children: [_jsx(config.icon, { className: "text-xs" }), config.label] }));
};
export default BookingStatusBadge;
