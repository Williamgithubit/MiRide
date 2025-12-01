import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, Users, X, RefreshCw } from 'lucide-react';
import Modal from '../../shared/Modal';
import BookingModal from './BookingModal';
import { useCustomerData } from './useCustomerData';
import { useDispatch } from 'react-redux';
import { carApi, CarImage } from '../../../../store/Car/carApi';
import { getPrimaryImageUrl } from '../../../../utils/imageUtils';
import { API_BASE_URL } from '../../../../config/api';
import { CAR_FEATURES } from '../../../../constants/features';

interface BrowseCarsProps {
  selectedCar: any;
  setSelectedCar: (car: any) => void;
  showBookingModal: boolean;
  setShowBookingModal: (show: boolean) => void;
}

const BrowseCars: React.FC<BrowseCarsProps> = ({
  selectedCar,
  setSelectedCar,
  showBookingModal, 
  setShowBookingModal
}) => {
  const { availableCars, carsData } = useCustomerData();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    priceRange: 'All Prices',
    carType: 'All Types',
    availability: 'available'
  });

  // Get all cars (not just available ones) for better UX
  const allCars = carsData || [];

  // Helper function to get image URL
  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return '/placeholder-car.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads')) return `${API_BASE_URL}${imageUrl}`;
    return imageUrl;
  };

  // Get car images array for modal
  const carImages: string[] = useMemo(() => {
    if (!selectedCar) return [];
    
    // If car has images array, use those
    if (selectedCar.images && Array.isArray(selectedCar.images) && selectedCar.images.length > 0) {
      return [...selectedCar.images]
        .sort((a: CarImage, b: CarImage) => (a.order || 0) - (b.order || 0))
        .map((img: CarImage) => getImageUrl(img.imageUrl));
    }
    
    // Fallback to imageUrl if available
    if (selectedCar.imageUrl) {
      return [getImageUrl(selectedCar.imageUrl)];
    }
    
    return ['/placeholder-car.jpg'];
  }, [selectedCar]);

  // Reset image index when modal opens with new car
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedCar]);

  // Filter cars based on search criteria
  const filteredCars = useMemo(() => {
    return allCars.filter(car => {
      // Search term filter (brand, model, year)
      const matchesSearch = searchTerm === '' || 
        car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.year?.toString().includes(searchTerm);

      // Location filter
      const matchesLocation = searchFilters.location === '' || 
        car.location?.toLowerCase().includes(searchFilters.location.toLowerCase());

      // Car type filter - since cars don't have 'type' property, treat all as matching when 'All Types' is selected
      // or try to infer type from model/brand for basic filtering
      const matchesCarType = searchFilters.carType === 'All Types' || 
        (() => {
          if (!car.type && searchFilters.carType !== 'All Types') {
            // If no type is set, allow all cars to pass through for now
            // This could be enhanced to infer type from model/brand
            return true;
          }
          return car.type?.toLowerCase() === searchFilters.carType.toLowerCase();
        })();

      // Price range filter - convert string price to number for comparison
      const matchesPriceRange = (() => {
        if (searchFilters.priceRange === 'All Prices') {
          return true;
        }
        
        const price = Number(car.rentalPricePerDay) || 0;
        switch (searchFilters.priceRange) {
          case '$0 - $50':
            return price >= 0 && price <= 50;
          case '$50 - $100':
            return price > 50 && price <= 100;
          case '$100+':
            return price > 100;
          default:
            return true;
        }
      })();

      // Availability filter
      const matchesAvailability = searchFilters.availability === 'all' || 
        (searchFilters.availability === 'available' && car.isAvailable) ||
        (searchFilters.availability === 'unavailable' && !car.isAvailable);

      return matchesSearch && matchesLocation && matchesCarType && matchesPriceRange && matchesAvailability;
    });
  }, [allCars, searchTerm, searchFilters]);

  const handleSearch = () => {
    // Search is handled automatically by the useMemo hook
    // This function can be used for additional search actions if needed
    console.log('Searching with filters:', { searchTerm, ...searchFilters });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchFilters({
      location: '',
      priceRange: 'All Prices',
      carType: 'All Types',
      availability: 'available'
    });
  };

  const refreshCarList = () => {
    // Invalidate car cache to refresh availability status
    dispatch(carApi.util.invalidateTags([{ type: 'Car', id: 'LIST' }]));
    console.log('Car list refreshed - checking for availability updates');
  };

  const renderCarCard = (car: any) => {
    const isAvailable = car.isAvailable;
    const carImageUrl = getPrimaryImageUrl(car.images, car.imageUrl);
    
    return (
      <div key={car.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${!isAvailable ? 'opacity-75' : ''}`}>
        <div className="relative">
          <img src={carImageUrl} alt={car.model} className={`w-full h-48 object-cover ${!isAvailable ? 'brightness-50' : ''}`} />
          {!isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                Currently Booked
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className={`text-lg font-semibold ${isAvailable ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {car.year} {car.brand} {car.model}
          </h3>
          <div className={`flex items-center mt-2 text-sm ${isAvailable ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <MapPin className="w-4 h-4 mr-1" />
            {car.location}
          </div>
          <div className={`flex items-center mt-1 text-sm ${isAvailable ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            {car.rating} ({car.reviews || 0} reviews)
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <span className={`text-2xl font-bold ${isAvailable ? 'text-blue-600 dark:text-white' : 'text-gray-400'}`}>
                ${car.rentalPricePerDay}/day
              </span>
              {!isAvailable && (
                <span className="text-sm text-red-600 font-medium">Unavailable</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setSelectedCar(car)}
                className={`flex-1 px-4 py-2 text-sm border rounded-lg transition-colors font-medium ${
                  isAvailable 
                    ? 'text-blue-600 dark:text-white border-blue-600 dark:border-white hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                    : 'text-gray-400 border-gray-300 cursor-not-allowed'
                }`}
                disabled={!isAvailable}
              >
                View Details
              </button>
              <button
                onClick={() => {
                  if (isAvailable) {
                    setSelectedCar(car);
                    setShowBookingModal(true);
                  }
                }}
                className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                  isAvailable 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isAvailable}
              >
                {isAvailable ? 'Book Now' : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Search Cars</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by brand, model, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Enter location"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price Range</label>
            <select 
              value={searchFilters.priceRange}
              onChange={(e) => setSearchFilters({...searchFilters, priceRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              <option value="All Prices">All Prices</option>
              <option value="$0 - $50">$0 - $50</option>
              <option value="$50 - $100">$50 - $100</option>
              <option value="$100+">$100+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Car Type</label>
            <select 
              value={searchFilters.carType}
              onChange={(e) => setSearchFilters({...searchFilters, carType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              <option value="All Types">All Types</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Availability</label>
            <select 
              value={searchFilters.availability}
              onChange={(e) => setSearchFilters({...searchFilters, availability: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              <option value="available">Available Only</option>
              <option value="all">All Cars</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleSearch}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Search ({filteredCars.length})
            </button>
          </div>
          <div className="flex items-end">
            <button 
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
          <div className="flex items-end">
            <button 
              onClick={refreshCarList}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
              title="Refresh car availability"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Available Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.length > 0 ? (
          filteredCars.map(renderCarCard)
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No cars found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Car Details Modal */}
      <Modal isOpen={!!selectedCar && !showBookingModal} onClose={() => setSelectedCar(null)} title="Car Details" size="lg">
        {selectedCar && (
          <div className="space-y-4">
            {/* Image Carousel */}
            <div className="relative">
              <img
                src={carImages[currentImageIndex] || '/placeholder-car.jpg'}
                alt={selectedCar.model}
                className="w-full h-32 sm:h-48 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
                }}
              />
              
              {/* Navigation Arrows - Only show if multiple images */}
              {carImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : carImages.length - 1)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < carImages.length - 1 ? prev + 1 : 0)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                    {currentImageIndex + 1} / {carImages.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Images - Only show if multiple images */}
            {carImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {carImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Car Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Make & Model</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCar.year} {selectedCar.brand} {selectedCar.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Car Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCar.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily Rate</p>
                <p className="font-medium text-gray-900 dark:text-white">${selectedCar.rentalPricePerDay}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedCar.isAvailable ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {selectedCar.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCar.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Seats</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCar.seats}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Type</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCar.fuelType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                <p className="font-medium text-gray-900 dark:text-white">⭐ {
                  selectedCar.rating 
                    ? (typeof selectedCar.rating === 'number' ? selectedCar.rating : parseFloat(selectedCar.rating) || 0).toFixed(1)
                    : '0.0'
                }</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reviews</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCar.reviews || 0}</p>
              </div>
            </div>

            {/* Features & Amenities Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Features & Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAR_FEATURES.map((feature, index) => {
                  const carFeatures = selectedCar.features && Array.isArray(selectedCar.features) ? selectedCar.features : [];
                  const isAvailable = carFeatures.includes(feature);
                  return (
                    <div key={index} className={`flex items-center ${!isAvailable ? 'opacity-40' : ''}`}>
                      {isAvailable ? (
                        <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={`text-sm ${isAvailable ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                        {feature}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button 
                onClick={() => setSelectedCar(null)} 
                className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button 
                onClick={() => setShowBookingModal(true)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedCar.isAvailable}
              >
                {selectedCar.isAvailable ? 'Book Now' : 'Unavailable'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Multi-step Booking Modal */}
      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)} 
        selectedCar={selectedCar} 
      />
    </div>
  );
};

export default BrowseCars;
