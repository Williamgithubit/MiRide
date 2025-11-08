import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
const NotificationStatusBadge = ({ status, priority, size = 'md', showIcon = true }) => {
    const getStatusConfig = () => {
        if (status === 'read') {
            return {
                bgColor: 'bg-gray-100 dark:bg-gray-700',
                textColor: 'text-gray-600 dark:text-gray-400',
                icon: FaCheckCircle,
                label: 'Read'
            };
        }
        // Unread status with priority-based colors
        switch (priority) {
            case 'urgent':
                return {
                    bgColor: 'bg-red-100 dark:bg-red-900/30',
                    textColor: 'text-red-800 dark:text-red-300',
                    icon: FaExclamationCircle,
                    label: 'Urgent'
                };
            case 'high':
                return {
                    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
                    textColor: 'text-orange-800 dark:text-orange-300',
                    icon: FaExclamationTriangle,
                    label: 'High Priority'
                };
            case 'medium':
                return {
                    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                    textColor: 'text-blue-800 dark:text-blue-300',
                    icon: FaBell,
                    label: 'Unread'
                };
            case 'low':
            default:
                return {
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    textColor: 'text-green-800 dark:text-green-300',
                    icon: FaBell,
                    label: 'Unread'
                };
        }
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
            case 'md':
            default:
                return {
                    container: 'px-3 py-1 text-sm',
                    icon: 'w-4 h-4'
                };
        }
    };
    const config = getStatusConfig();
    const sizeClasses = getSizeClasses();
    const IconComponent = config.icon;
    return (_jsxs("span", { className: `
      inline-flex items-center space-x-1 rounded-full font-medium
      ${config.bgColor} ${config.textColor} ${sizeClasses.container}
    `, children: [showIcon && _jsx(IconComponent, { className: sizeClasses.icon }), _jsx("span", { children: config.label })] }));
};
export default NotificationStatusBadge;
