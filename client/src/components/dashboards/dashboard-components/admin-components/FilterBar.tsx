import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FilterBarProps {
  filters: {
    search: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
  };
  onFilterChange: (filters: FilterBarProps['filters']) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const bookingStatuses = [
    'All',
    'Pending',
    'Confirmed',
    'Cancelled',
    'Completed'
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value === 'All' ? '' : e.target.value });
  };

  const handleDateChange = (type: 'start' | 'end', date: Date | null) => {
    onFilterChange({
      ...filters,
      [type === 'start' ? 'startDate' : 'endDate']: date ? date.toISOString() : null,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search bookings..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status || 'All'}
            onChange={handleStatusChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {bookingStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filters */}
        <div>
          <DatePicker
            selected={filters.startDate ? new Date(filters.startDate) : null}
            onChange={(date) => handleDateChange('start', date)}
            placeholderText="Start Date"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dateFormat="MM/dd/yyyy"
          />
        </div>

        <div>
          <DatePicker
            selected={filters.endDate ? new Date(filters.endDate) : null}
            onChange={(date) => handleDateChange('end', date)}
            placeholderText="End Date"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dateFormat="MM/dd/yyyy"
            minDate={filters.startDate ? new Date(filters.startDate) : undefined}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onFilterChange({
            search: '',
            status: '',
            startDate: null,
            endDate: null,
          })}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};