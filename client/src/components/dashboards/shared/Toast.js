import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
const Toast = ({ type, message, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);
    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
        }
    };
    const getIcon = () => {
        switch (type) {
            case 'success':
                return _jsx(FaCheckCircle, { className: "w-5 h-5 text-green-600 dark:text-green-400" });
            case 'error':
                return _jsx(FaExclamationTriangle, { className: "w-5 h-5 text-red-600 dark:text-red-400" });
            case 'warning':
                return _jsx(FaExclamationTriangle, { className: "w-5 h-5 text-yellow-600 dark:text-yellow-400" });
            case 'info':
                return _jsx(FaInfoCircle, { className: "w-5 h-5 text-blue-600 dark:text-blue-400" });
            default:
                return _jsx(FaInfoCircle, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" });
        }
    };
    return (_jsx("div", { className: "fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 animate-in slide-in-from-right duration-300", children: _jsxs("div", { className: `flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-md mx-auto sm:mx-0 ${getToastStyles()}`, children: [getIcon(), _jsx("p", { className: "flex-1 text-sm font-medium", children: message }), _jsx("button", { onClick: onClose, className: "flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors", children: _jsx(FaTimes, { className: "w-4 h-4" }) })] }) }));
};
export default Toast;
