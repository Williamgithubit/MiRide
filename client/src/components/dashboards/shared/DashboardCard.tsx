import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 ${
        onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-1 sm:mt-2">
              <span
                className={`text-xs sm:text-sm font-medium ${
                  change.type === 'increase'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value).toFixed(0)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full ml-3 flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
