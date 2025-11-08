import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaStar, FaRegStar } from 'react-icons/fa';
const StarRating = ({ rating, maxRating = 5, size = 'md', interactive = false, onRatingChange, className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };
    const handleStarClick = (starRating) => {
        if (interactive && onRatingChange) {
            onRatingChange(starRating);
        }
    };
    return (_jsxs("div", { className: `flex items-center space-x-1 ${className}`, children: [Array.from({ length: maxRating }, (_, index) => {
                const starRating = index + 1;
                const isFilled = starRating <= rating;
                return (_jsx("button", { type: "button", onClick: () => handleStarClick(starRating), disabled: !interactive, className: `
              ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
              ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded' : ''}
              text-yellow-400
            `, children: isFilled ? (_jsx(FaStar, { className: `${sizeClasses[size]} text-yellow-400` })) : (_jsx(FaRegStar, { className: `${sizeClasses[size]} text-gray-300 dark:text-gray-600` })) }, index));
            }), rating > 0 && (_jsxs("span", { className: "ml-2 text-sm text-gray-600 dark:text-gray-400", children: ["(", (Number(rating) || 0).toFixed(1), ")"] }))] }));
};
export default StarRating;
