import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X } from 'lucide-react';
const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm sm:max-w-md',
        md: 'max-w-md sm:max-w-lg',
        lg: 'max-w-lg sm:max-w-xl md:max-w-2xl',
        xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl'
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen px-3 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [_jsx("div", { className: "fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75", onClick: onClose }), _jsxs("div", { className: `inline-block w-full ${sizeClasses[size]} p-4 sm:p-6 my-4 sm:my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg relative`, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: title }), showCloseButton && (_jsx("button", { onClick: onClose, className: "p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors", children: _jsx(X, { className: "w-5 h-5" }) }))] }), _jsx("div", { className: "text-gray-700 dark:text-gray-300", children: children })] })] }) }));
};
export default Modal;
