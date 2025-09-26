import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= rating;
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
              ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded' : ''}
              text-yellow-400
            `}
          >
            {isFilled ? (
              <FaStar className={`${sizeClasses[size]} text-yellow-400`} />
            ) : (
              <FaRegStar className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`} />
            )}
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          ({(Number(rating) || 0).toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default StarRating;
