import React from 'react';
import { Star, Users, Fuel, Settings } from 'lucide-react';

const VehicleFleet: React.FC = () => {
  const vehicles = [
    {
      id: 1,
      name: 'Jeep Wrangler',
      category: 'SUV',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 4.8,
      reviews: 124,
      passengers: 5,
      transmission: 'Manual',
      fuel: 'Gasoline',
      pricePerDay: 89,
      features: ['4WD', 'GPS', 'Bluetooth']
    },
    {
      id: 2,
      name: 'BMW 3 Series',
      category: 'Sedan',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 4.9,
      reviews: 89,
      passengers: 5,
      transmission: 'Automatic',
      fuel: 'Gasoline',
      pricePerDay: 124,
      features: ['Luxury', 'GPS', 'Premium Audio']
    },
    {
      id: 3,
      name: 'Ferrari 458',
      category: 'Sports',
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 5.0,
      reviews: 67,
      passengers: 2,
      transmission: 'Manual',
      fuel: 'Gasoline',
      pricePerDay: 299,
      features: ['Sport Mode', 'Premium Interior', 'High Performance']
    }
  ];

  return (
    <section className="py-20 bg-gray-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Our Vehicle Fleet
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Choose from our premium collection of vehicles, each maintained to the highest standards for your comfort and safety.
          </p>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Vehicle Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {vehicle.category}
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold">{vehicle.rating}</span>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {vehicle.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>{vehicle.rating} ({vehicle.reviews} reviews)</span>
                  </div>
                </div>

                {/* Vehicle Specs */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{vehicle.passengers}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Settings className="h-4 w-4" />
                    <span>{vehicle.transmission}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Fuel className="h-4 w-4" />
                    <span>{vehicle.fuel}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      ${vehicle.pricePerDay}
                    </span>
                    <span className="text-gray-600 text-sm">/day</span>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/cars'}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold"
                  >
                    Rent Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => window.location.href = '/cars'}
            className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
          >
            View All Vehicles
          </button>
        </div>
      </div>
    </section>
  );
};

export default VehicleFleet;
