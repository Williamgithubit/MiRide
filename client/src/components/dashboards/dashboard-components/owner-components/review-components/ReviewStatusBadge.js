import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaCheck, FaClock, FaEyeSlash } from 'react-icons/fa';
const ReviewStatusBadge = ({ status, size = 'md' }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'published':
                return {
                    icon: FaCheck,
                    label: 'Published',
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    textColor: 'text-green-800 dark:text-green-300',
                    iconColor: 'text-green-600 dark:text-green-400'
                };
            case 'pending':
                return {
                    icon: FaClock,
                    label: 'Pending',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                    textColor: 'text-yellow-800 dark:text-yellow-300',
                    iconColor: 'text-yellow-600 dark:text-yellow-400'
                };
            case 'hidden':
                return {
                    icon: FaEyeSlash,
                    label: 'Hidden',
                    bgColor: 'bg-gray-100 dark:bg-gray-700',
                    textColor: 'text-gray-800 dark:text-gray-300',
                    iconColor: 'text-gray-600 dark:text-gray-400'
                };
            default:
                return {
                    icon: FaClock,
                    label: 'Unknown',
                    bgColor: 'bg-gray-100 dark:bg-gray-700',
                    textColor: 'text-gray-800 dark:text-gray-300',
                    iconColor: 'text-gray-600 dark:text-gray-400'
                };
        }
    };
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    container: 'px-2 py-1 text-xs',
                    icon: 'w-3 h-3',
                    gap: 'space-x-1'
                };
            case 'lg':
                return {
                    container: 'px-4 py-2 text-base',
                    icon: 'w-5 h-5',
                    gap: 'space-x-2'
                };
            default: // md
                return {
                    container: 'px-3 py-1.5 text-sm',
                    icon: 'w-4 h-4',
                    gap: 'space-x-1.5'
                };
        }
    };
    const statusConfig = getStatusConfig();
    const sizeClasses = getSizeClasses();
    const IconComponent = statusConfig.icon;
    return (_jsxs("span", { className: `
        inline-flex items-center font-medium rounded-full
        ${statusConfig.bgColor}
        ${statusConfig.textColor}
        ${sizeClasses.container}
        ${sizeClasses.gap}
      `, children: [_jsx(IconComponent, { className: `${statusConfig.iconColor} ${sizeClasses.icon}` }), _jsx("span", { children: statusConfig.label })] }));
};
export default ReviewStatusBadge;
