import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, Users, X } from 'lucide-react';
import Modal from '../../shared/Modal';
import BookingModal from './BookingModal';
import { useCustomerData } from './useCustomerData';

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
  const { availableCars } = useCustomerData();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    priceRange: '$0 - $50',
    carType: 'All Types',
    availability: 'available'
  });

  // Filter cars based on search criteria
  const filteredCars = useMemo(() => {
    return availableCars.filter(car => {
      // Search term filter (make, model, year)
      const matchesSearch = searchTerm === '' || 
        car.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.year?.toString().includes(searchTerm);

      // Location filter
      const matchesLocation = searchFilters.location === '' || 
        car.location?.toLowerCase().includes(searchFilters.location.toLowerCase());

      // Car type filter
      const matchesCarType = searchFilters.carType === 'All Types' || 
        car.type?.toLowerCase() === searchFilters.carType.toLowerCase();

      // Price range filter
      const matchesPriceRange = (() => {
        const price = car.rentalPricePerDay || 0;
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

      return matchesSearch && matchesLocation && matchesCarType && matchesPriceRange;
    });
  }, [availableCars, searchTerm, searchFilters]);

  const handleSearch = () => {
    // Search is handled automatically by the useMemo hook
    // This function can be used for additional search actions if needed
    console.log('Searching with filters:', { searchTerm, ...searchFilters });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchFilters({
      location: '',
      priceRange: '$0 - $50',
      carType: 'All Types',
      availability: 'available'
    });
  };

  const renderCarCard = (car: any) => (
    <div key={car.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img src={car.imageUrl} alt={car.model} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {car.year} {car.make} {car.model}
        </h3>
        <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-1" />
          {car.location}
        </div>
        <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
          <Star className="w-4 h-4 mr-1 text-yellow-500" />
          {car.rating} ({car.totalRentals} rentals)
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-2xl font-bold text-blue-600">${car.rentalPricePerDay}/day</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setSelectedCar(car)}
              className="flex-1 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
            >
              View Details
            </button>
            <button
              onClick={() => {
                setSelectedCar(car);
                setShowBookingModal(true);
              }}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
              placeholder="Search by make, model, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <img src={selectedCar.imageUrl} alt={selectedCar.model} className="w-full h-64 object-cover rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Make & Model</p><p className="font-medium">{selectedCar.year} {selectedCar.brand} {selectedCar.model}</p></div>
              <div><p className="text-sm text-gray-500">Daily Rate</p><p className="font-medium">${selectedCar.rentalPricePerDay}</p></div>
              <div><p className="text-sm text-gray-500">Location</p><p className="font-medium">{selectedCar.location}</p></div>
              <div><p className="text-sm text-gray-500">Rating</p><p className="font-medium">⭐ {selectedCar.rating}</p></div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={() => setSelectedCar(null)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Close
              </button>
              <button onClick={() => setShowBookingModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Book Now
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
