import React, { useState } from 'react';
import { Car, Calendar, CreditCard, User, Search, MapPin, Star, Filter } from 'lucide-react';
import Sidebar from '../shared/Sidebar';
import TopNavbar from '../shared/TopNavbar';
import DashboardCard from '../shared/DashboardCard';
import Table from '../shared/Table';
import Modal from '../shared/Modal';
import { mockCars, mockRentals, mockUsers } from '../shared/mockData';

const CustomerDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('browse-cars');
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    priceRange: [0, 100],
    carType: '',
    availability: 'available'
  });

  const customerId = 2; // Current customer ID
  const customerRentals = mockRentals.filter(rental => rental.customerId === customerId);
  const customer = mockUsers.find(u => u.id === customerId);

  const availableCars = mockCars.filter(car => car.status === 'available');
  const activeRentals = customerRentals.filter(rental => rental.status === 'active').length;
  const totalSpent = customerRentals.reduce((sum, rental) => sum + rental.totalCost, 0);

  const rentalColumns = [
    {
      key: 'id',
      label: 'Booking ID',
      render: (value: number) => `#${value.toString().padStart(4, '0')}`
    },
    {
      key: 'carDetails',
      label: 'Car'
    },
    {
      key: 'startDate',
      label: 'Start Date'
    },
    {
      key: 'endDate',
      label: 'End Date'
    },
    {
      key: 'totalCost',
      label: 'Amount',
      render: (value: number) => `$${value}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'completed' ? 'bg-green-100 text-green-800' :
          value === 'active' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  const renderCarCard = (car: any) => (
    <div key={car.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img src={car.image} alt={car.model} className="w-full h-48 object-cover" />
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
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-blue-600">${car.dailyRate}/day</span>
          <div className="space-x-2">
            <button
              onClick={() => setSelectedCar(car)}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            >
              View Details
            </button>
            <button
              onClick={() => {
                setSelectedCar(car);
                setShowBookingModal(true);
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'browse-cars':
        return (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700">
                    <option>$0 - $50</option>
                    <option>$50 - $100</option>
                    <option>$100+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Car Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700">
                    <option>All Types</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Hatchback</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Available Cars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCars.map(renderCarCard)}
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardCard
                title="Active Rentals"
                value={activeRentals}
                icon={Calendar}
              />
              <DashboardCard
                title="Total Bookings"
                value={customerRentals.length}
                icon={Car}
              />
              <DashboardCard
                title="Total Spent"
                value={`$${totalSpent}`}
                icon={CreditCard}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Bookings</h3>
              <Table columns={rentalColumns} data={customerRentals} searchable />
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard
                title="Total Spent"
                value={`$${totalSpent}`}
                icon={CreditCard}
              />
              <DashboardCard
                title="Average per Booking"
                value={`$${Math.round(totalSpent / customerRentals.length)}`}
                icon={CreditCard}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold mb-4">Payment History</h4>
              <div className="space-y-4">
                {customerRentals.map(rental => (
                  <div key={rental.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium">Booking #{rental.id.toString().padStart(4, '0')}</p>
                      <p className="text-sm text-gray-500">{rental.carDetails}</p>
                      <p className="text-sm text-gray-500">{rental.startDate} - {rental.endDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${rental.totalCost}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rental.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rental.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={customer?.name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={customer?.email}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue={customer?.phone}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    placeholder="Enter your address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Driver's License</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Select a section from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar role="customer" activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <TopNavbar title="Customer Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>

      {/* Car Details Modal */}
      <Modal isOpen={!!selectedCar && !showBookingModal} onClose={() => setSelectedCar(null)} title="Car Details" size="lg">
        {selectedCar && (
          <div className="space-y-4">
            <img src={selectedCar.image} alt={selectedCar.model} className="w-full h-64 object-cover rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Make & Model</p><p className="font-medium">{selectedCar.year} {selectedCar.make} {selectedCar.model}</p></div>
              <div><p className="text-sm text-gray-500">Daily Rate</p><p className="font-medium">${selectedCar.dailyRate}</p></div>
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

      {/* Booking Modal */}
      <Modal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} title="Book Car" size="lg">
        {selectedCar && (
          <form className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <img src={selectedCar.image} alt={selectedCar.model} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <h4 className="font-medium">{selectedCar.year} {selectedCar.make} {selectedCar.model}</h4>
                <p className="text-sm text-gray-500">${selectedCar.dailyRate}/day</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Special Requests</label>
              <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700" placeholder="Any special requests or notes..." />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setShowBookingModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Confirm Booking
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CustomerDashboard;
