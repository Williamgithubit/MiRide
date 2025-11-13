import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle } from 'react-icons/fa';

interface RentalExpirationProgressBarProps {
  startDate: string;
  endDate: string;
  customerName: string;
  carName: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalMilliseconds: number;
  expired: boolean;
}

const RentalExpirationProgressBar: React.FC<RentalExpirationProgressBarProps> = ({
  startDate,
  endDate,
  customerName,
  carName
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    totalMilliseconds: 0,
    expired: false
  });
  const [percentage, setPercentage] = useState(0);

  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date();
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const totalMilliseconds = end.getTime() - now.getTime();

    if (totalMilliseconds <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        totalMilliseconds: 0,
        expired: true
      };
    }

    const days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    return {
      days,
      hours,
      minutes,
      totalMilliseconds,
      expired: false
    };
  };

  const calculatePercentage = (): number => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  useEffect(() => {
    // Update immediately
    setTimeRemaining(calculateTimeRemaining());
    setPercentage(calculatePercentage());

    // Update every minute
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
      setPercentage(calculatePercentage());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  // Show completed state if expired
  if (timeRemaining.expired) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">
              Rental Completed
            </span>
          </div>
        </div>
        <p className="text-xs text-green-700 dark:text-green-400 mb-2">
          {carName} is now available for new bookings
        </p>
        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
          <div
            className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  }

  // Determine color based on time remaining
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getBackgroundColor = () => {
    if (percentage >= 90) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (percentage >= 70) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (percentage >= 50) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  };

  const getTextColor = () => {
    if (percentage >= 90) return 'text-red-700 dark:text-red-400';
    if (percentage >= 70) return 'text-orange-700 dark:text-orange-400';
    if (percentage >= 50) return 'text-yellow-700 dark:text-yellow-400';
    return 'text-blue-700 dark:text-blue-400';
  };

  const formatTimeRemaining = () => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h remaining`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
    } else {
      return `${timeRemaining.minutes}m remaining`;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBackgroundColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaClock className={getTextColor()} />
          <span className={`text-sm font-medium ${getTextColor()}`}>
            Rental Period
          </span>
        </div>
        <span className={`text-xs font-semibold ${getTextColor()}`}>
          {formatTimeRemaining()}
        </span>
      </div>
      
      <p className={`text-xs ${getTextColor()} mb-2`}>
        Rented by {customerName}
      </p>
      
      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
        <div
          className={`${getProgressColor()} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{new Date(startDate).toLocaleDateString()}</span>
        <span>{new Date(endDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default RentalExpirationProgressBar;
