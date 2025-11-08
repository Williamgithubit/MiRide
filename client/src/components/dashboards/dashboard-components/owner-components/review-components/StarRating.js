import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
const StarRating = ({ rating, maxRating = 5, size = 'md', showNumber = false, className = '' }) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'w-3 h-3';
            case 'lg':
                return 'w-6 h-6';
            default: // md
                return 'w-4 h-4';
        }
    };
    const getTextSize = () => {
        switch (size) {
            case 'sm':
                return 'text-xs';
            case 'lg':
                return 'text-lg';
            default: // md
                return 'text-sm';
        }
    };
    const renderStar = (index) => {
        const starValue = index + 1;
        const sizeClass = getSizeClasses();
        if (rating >= starValue) {
            // Full star
            return (_jsx(FaStar, { className: `${sizeClass} text-yellow-400` }, index));
        }
        else if (rating >= starValue - 0.5) {
            // Half star
            return (_jsx(FaStarHalfAlt, { className: `${sizeClass} text-yellow-400` }, index));
        }
        else {
            // Empty star
            return (_jsx(FaRegStar, { className: `${sizeClass} text-gray-300 dark:text-gray-600` }, index));
        }
    };
    return (_jsxs("div", { className: `flex items-center space-x-1 ${className}`, children: [_jsx("div", { className: "flex items-center space-x-0.5", children: Array.from({ length: maxRating }, (_, index) => renderStar(index)) }), showNumber && (_jsx("span", { className: `font-medium text-gray-700 dark:text-gray-300 ${getTextSize()}`, children: rating.toFixed(1) }))] }));
};
export default StarRating;
