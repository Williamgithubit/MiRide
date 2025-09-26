import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  className = ''
}) => {
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

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const sizeClass = getSizeClasses();
    
    if (rating >= starValue) {
      // Full star
      return (
        <FaStar
          key={index}
          className={`${sizeClass} text-yellow-400`}
        />
      );
    } else if (rating >= starValue - 0.5) {
      // Half star
      return (
        <FaStarHalfAlt
          key={index}
          className={`${sizeClass} text-yellow-400`}
        />
      );
    } else {
      // Empty star
      return (
        <FaRegStar
          key={index}
          className={`${sizeClass} text-gray-300 dark:text-gray-600`}
        />
      );
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>
      {showNumber && (
        <span className={`font-medium text-gray-700 dark:text-gray-300 ${getTextSize()}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
