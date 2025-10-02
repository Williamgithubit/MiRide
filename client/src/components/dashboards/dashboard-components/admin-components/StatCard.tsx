import React from 'react';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  change?: number;
  changeLabel?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  className = '',
}) => {
  const isPositive = change && change > 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
        </div>
      </div>
      {typeof change !== 'undefined' && (
        <div className="mt-4 flex items-center">
          <span className={`${changeColor} text-sm font-medium`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          {changeLabel && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;