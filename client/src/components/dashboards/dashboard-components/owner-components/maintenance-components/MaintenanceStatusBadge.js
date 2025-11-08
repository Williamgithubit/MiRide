import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaClock, FaPlay, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
const MaintenanceStatusBadge = ({ status, priority = 'medium', size = 'md' }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'scheduled':
                return {
                    icon: FaClock,
                    label: 'Scheduled',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                    textColor: 'text-yellow-800 dark:text-yellow-300',
                    borderColor: 'border-yellow-200 dark:border-yellow-700'
                };
            case 'in-progress':
                return {
                    icon: FaPlay,
                    label: 'In Progress',
                    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                    textColor: 'text-blue-800 dark:text-blue-300',
                    borderColor: 'border-blue-200 dark:border-blue-700'
                };
            case 'completed':
                return {
                    icon: FaCheck,
                    label: 'Completed',
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    textColor: 'text-green-800 dark:text-green-300',
                    borderColor: 'border-green-200 dark:border-green-700'
                };
            case 'cancelled':
                return {
                    icon: FaTimes,
                    label: 'Cancelled',
                    bgColor: 'bg-red-100 dark:bg-red-900/30',
                    textColor: 'text-red-800 dark:text-red-300',
                    borderColor: 'border-red-200 dark:border-red-700'
                };
            default:
                return {
                    icon: FaClock,
                    label: 'Unknown',
                    bgColor: 'bg-gray-100 dark:bg-gray-700',
                    textColor: 'text-gray-800 dark:text-gray-300',
                    borderColor: 'border-gray-200 dark:border-gray-600'
                };
        }
    };
    const getPriorityIndicator = () => {
        if (priority === 'urgent') {
            return _jsx(FaExclamationTriangle, { className: "w-3 h-3 text-red-500 ml-1" });
        }
        return null;
    };
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    container: 'px-2 py-1 text-xs',
                    icon: 'w-3 h-3'
                };
            case 'lg':
                return {
                    container: 'px-4 py-2 text-base',
                    icon: 'w-5 h-5'
                };
            default: // md
                return {
                    container: 'px-3 py-1.5 text-sm',
                    icon: 'w-4 h-4'
                };
        }
    };
    const config = getStatusConfig();
    const sizeClasses = getSizeClasses();
    const IconComponent = config.icon;
    return (_jsxs("span", { className: `
      inline-flex items-center font-medium rounded-full border
      ${config.bgColor} ${config.textColor} ${config.borderColor}
      ${sizeClasses.container}
    `, children: [_jsx(IconComponent, { className: `${sizeClasses.icon} mr-1.5` }), config.label, getPriorityIndicator()] }));
};
export default MaintenanceStatusBadge;
