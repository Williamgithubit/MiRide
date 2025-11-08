import { jsx as _jsx } from "react/jsx-runtime";
const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    return (_jsx("div", { className: `flex items-center justify-center ${className}`, children: _jsx("div", { className: `${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin` }) }));
};
export default LoadingSpinner;
