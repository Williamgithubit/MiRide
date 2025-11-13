import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle } from 'react-icons/fa';

interface BookingExpirationProgressBarProps {
  startDate: string;
  endDate: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalMilliseconds: number;
  expired: boolean;
}

const BookingExpirationProgressBar: React.FC<BookingExpirationProgressBarProps> = ({
  startDate,
  endDate,
  status
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

  // Don't show progress bar for completed, cancelled, or rejected bookings
  if (status === 'completed' || status === 'cancelled' || status === 'rejected') {
    return null;
  }

  // Show completed state if expired
  if (timeRemaining.expired) {
    return (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rental Period Completed
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
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

  const getTextColor = () => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-orange-600 dark:text-orange-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const formatTimeRemaining = () => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days} day${timeRemaining.days !== 1 ? 's' : ''}, ${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? 's' : ''}`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? 's' : ''}, ${timeRemaining.minutes} minute${timeRemaining.minutes !== 1 ? 's' : ''}`;
    } else {
      return `${timeRemaining.minutes} minute${timeRemaining.minutes !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaClock className={getTextColor()} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Until Expiration
          </span>
        </div>
        <span className={`text-sm font-semibold ${getTextColor()}`}>
          {formatTimeRemaining()}
        </span>
      </div>
      
      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5">
        <div
          className={`${getProgressColor()} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{new Date(startDate).toLocaleDateString()}</span>
        <span>{new Date(endDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default BookingExpirationProgressBar;
