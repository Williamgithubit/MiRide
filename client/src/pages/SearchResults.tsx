import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetAvailableCarsQuery } from '../store/Car/carApi';
import Header from '../components/Header';
import CarList from '../components/CarList';
import { MapPin, Calendar, Filter, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useReduxAuth from '../store/hooks/useReduxAuth';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useReduxAuth();

  // Get search parameters
  const pickupLocation = searchParams.get('pickupLocation') || '';
  const dropoffLocation = searchParams.get('dropoffLocation') || '';
  const pickupDate = searchParams.get('pickupDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '';
  const returnDate = searchParams.get('returnDate') || '';
  const returnTime = searchParams.get('returnTime') || '';

  // Combine date and time for API call
  const startDate = pickupDate ? `${pickupDate}T${pickupTime}:00` : '';
  const endDate = returnDate ? `${returnDate}T${returnTime}:00` : '';

  // Fetch available cars from backend
  const {
    data: availableCars,
    isLoading,
    error,
  } = useGetAvailableCarsQuery(
    { startDate, endDate },
    { skip: !startDate || !endDate }
  );

  // Format date for display
  const formatDate = (dateStr: string, timeStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })} at ${timeStr}`;
  };

  const handleRentCar = async (carId: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to rent a car');
      navigate('/login');
      return;
    }
    // Navigate to booking with search params
    navigate(`/booking/${carId}?${searchParams.toString()}`);
  };

  const handleViewDetails = (carId: number) => {
    navigate(`/car-details/${carId}`);
  };

  const handleBackToSearch = () => {
    navigate('/');
  };

  if (!startDate || !endDate) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 px-4">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Search Criteria
            </h2>
            <p className="text-gray-600 mb-8">
              Please use the search form to find available vehicles.
            </p>
            <button
              onClick={handleBackToSearch}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Search Summary Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={handleBackToSearch}
              className="flex items-center text-green-600 hover:text-green-700 font-medium mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Modify Search
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Available Vehicles
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Pickup Location</div>
                  <div className="font-semibold text-gray-900">{pickupLocation}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Drop-off Location</div>
                  <div className="font-semibold text-gray-900">{dropoffLocation}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Pickup</div>
                  <div className="font-semibold text-gray-900">
                    {formatDate(pickupDate, pickupTime)}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Return</div>
                  <div className="font-semibold text-gray-900">
                    {formatDate(returnDate, returnTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-red-900 mb-2">
                Error Loading Vehicles
              </h3>
              <p className="text-red-700">
                Unable to fetch available vehicles. Please try again.
              </p>
            </div>
          )}

          {!isLoading && !error && availableCars && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {availableCars.length} {availableCars.length === 1 ? 'Vehicle' : 'Vehicles'} Available
                </h2>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </div>

              {availableCars.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No Vehicles Available
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No vehicles match your search criteria. Try adjusting your dates or location.
                  </p>
                  <button
                    onClick={handleBackToSearch}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Modify Search
                  </button>
                </div>
              ) : (
                <CarList
                  cars={availableCars.map((car) => ({
                    ...car,
                    id: car.id ?? 0,
                    isLiked: false,
                    isAvailable: Boolean(car.isAvailable),
                    name: car.brand || 'Unnamed Vehicle',
                    make: car.brand || 'Unknown',
                    model: car.model || 'Unknown',
                    year: car.year ?? new Date().getFullYear(),
                    seats: car.seats ?? 5,
                    fuelType: car.fuelType || 'Petrol',
                    location: car.location || 'Local',
                    features: car.features || [],
                    rating: Number(car.rating) || 4.5,
                    reviews: car.reviews ?? 0,
                    rentalPricePerDay: Number(car.rentalPricePerDay) || 0,
                    description: car.description || `${car.year || ''} ${car.brand || ''} ${car.model || ''}`.trim(),
                    imageUrl: car.images && car.images.length > 0
                      ? car.images.find((img) => img.isPrimary)?.imageUrl || car.images[0].imageUrl
                      : undefined,
                  }))}
                  onRent={handleRentCar}
                  onViewDetails={handleViewDetails}
                  isLoading={false}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchResults;
