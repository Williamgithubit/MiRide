import React, { useState } from 'react';
import { BookingStatus } from '../../../../../store/Booking/bookingSlice';
import { useModifyBookingMutation } from '../../../../../store/Booking/bookingApi';

interface BookingModificationModalProps {
  booking: BookingStatus;
  onClose: () => void;
}

const BookingModificationModal: React.FC<BookingModificationModalProps> = ({ booking, onClose }) => {
  const [modifyBooking, { isLoading }] = useModifyBookingMutation();
  
  const [formData, setFormData] = useState({
    startDate: booking.startDate,
    endDate: booking.endDate,
    pickupLocation: booking.pickupLocation || '',
    dropoffLocation: booking.dropoffLocation || '',
    specialRequests: booking.specialRequests || '',
    hasInsurance: booking.hasInsurance,
    hasGPS: booking.hasGPS,
    hasChildSeat: booking.hasChildSeat,
    hasAdditionalDriver: booking.hasAdditionalDriver
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (new Date(formData.startDate) <= new Date()) {
      newErrors.startDate = 'Start date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await modifyBooking({
        id: booking.id,
        ...formData
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to modify booking:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateTotalDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateNewTotal = () => {
    const days = calculateTotalDays();
    const basePrice = days * (Number(booking.car?.rentalPricePerDay) || 0);
    const insuranceCost = formData.hasInsurance ? days * 15 : 0;
    const gpsCost = formData.hasGPS ? days * 5 : 0;
    const childSeatCost = formData.hasChildSeat ? days * 8 : 0;
    const additionalDriverCost = formData.hasAdditionalDriver ? days * 10 : 0;
    
    return basePrice + insuranceCost + gpsCost + childSeatCost + additionalDriverCost;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Modify Booking
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Car Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {booking.car?.name} {booking.car?.model}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {booking.car?.brand} • {booking.car?.year} • ${(Number(booking.car?.rentalPricePerDay) || 0).toFixed(2)}/day
            </p>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {calculateTotalDays() > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Duration: {calculateTotalDays()} {calculateTotalDays() === 1 ? 'day' : 'days'}
              </p>
            </div>
          )}

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                placeholder="Enter pickup location"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dropoff Location
              </label>
              <input
                type="text"
                value={formData.dropoffLocation}
                onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                placeholder="Enter dropoff location"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add-ons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasInsurance}
                  onChange={(e) => handleInputChange('hasInsurance', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Insurance (+$15/day)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasGPS}
                  onChange={(e) => handleInputChange('hasGPS', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  GPS Navigation (+$5/day)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasChildSeat}
                  onChange={(e) => handleInputChange('hasChildSeat', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Child Seat (+$8/day)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasAdditionalDriver}
                  onChange={(e) => handleInputChange('hasAdditionalDriver', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Additional Driver (+$10/day)
                </span>
              </label>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Special Requests
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              rows={3}
              placeholder="Any special requests or notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Price Summary */}
          {calculateTotalDays() > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">New Total</h4>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${calculateNewTotal().toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Original: ${(Number(booking.totalAmount) || 0).toFixed(2)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModificationModal;
