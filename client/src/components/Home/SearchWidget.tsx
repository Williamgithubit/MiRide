import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetAvailableCarsQuery } from '../../store/Car/carApi';
import { LIBERIA_LOCATIONS } from '../../constants/locations';

interface SearchFormData {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

const SearchWidget: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SearchFormData>({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '10:00',
    returnDate: '',
    returnTime: '10:00',
  });

  const [sameLocation, setSameLocation] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.pickupLocation) {
      toast.error('Please select a pickup location');
      return;
    }
    if (!formData.pickupDate) {
      toast.error('Please select a pickup date');
      return;
    }
    if (!formData.returnDate) {
      toast.error('Please select a return date');
      return;
    }

    // Check if return date is after pickup date
    const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const returnDate = new Date(`${formData.returnDate}T${formData.returnTime}`);
    
    if (returnDate <= pickup) {
      toast.error('Return date must be after pickup date');
      return;
    }

    // Build query params
    const params = new URLSearchParams({
      pickupLocation: formData.pickupLocation,
      dropoffLocation: sameLocation ? formData.pickupLocation : (formData.dropoffLocation || formData.pickupLocation),
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      returnDate: formData.returnDate,
      returnTime: formData.returnTime,
    });

    // Navigate to search results page with search params
    navigate(`/search-results?${params.toString()}`);
    toast.success('Searching available vehicles...');
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl p-6 lg:p-8 -mt-8 relative z-20">
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Find Your Perfect Ride in Liberia
          </h3>
          <p className="text-gray-600">
            Enter your details to search available vehicles across Liberia
          </p>
        </div>

        {/* Location Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pickup Location */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <MapPin className="h-4 w-4 mr-2 text-green-600" />
              Pickup Location
            </label>
            <select
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
              required
            >
              <option value="">Select location</option>
              {LIBERIA_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Dropoff Location */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-green-600" />
                Drop-off Location
              </span>
              <label className="flex items-center text-xs font-normal cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameLocation}
                  onChange={(e) => setSameLocation(e.target.checked)}
                  className="mr-2 rounded text-green-600 focus:ring-green-500"
                />
                Same as pickup
              </label>
            </label>
            <select
              name="dropoffLocation"
              value={sameLocation ? formData.pickupLocation : formData.dropoffLocation}
              onChange={handleInputChange}
              disabled={sameLocation}
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none transition-colors ${
                sameLocation ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select location</option>
              {LIBERIA_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pickup Date & Time */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Calendar className="h-4 w-4 mr-2 text-green-600" />
              Pickup Date & Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                min={today}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                required
              />
              <input
                type="time"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleInputChange}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Return Date & Time */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Calendar className="h-4 w-4 mr-2 text-green-600" />
              Return Date & Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                min={formData.pickupDate || today}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                required
              />
              <input
                type="time"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleInputChange}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg font-semibold text-lg flex items-center justify-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>Search Available Cars</span>
        </button>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-green-600 font-bold text-lg">Free</div>
            <div className="text-xs text-gray-600">Cancellation</div>
          </div>
          <div className="text-center">
            <div className="text-green-600 font-bold text-lg">24/7</div>
            <div className="text-xs text-gray-600">Support</div>
          </div>
          <div className="text-center">
            <div className="text-green-600 font-bold text-lg">Instant</div>
            <div className="text-xs text-gray-600">Confirmation</div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchWidget;
