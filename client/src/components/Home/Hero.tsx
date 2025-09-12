import React from "react";
import { ArrowRight, MapPin, Calendar, Users } from "lucide-react";

const Hero: React.FC = () => {
  console.log('Hero component rendering');
  return (
    <section className="relative pt-20 pb-16 lg:pt-24 lg:pb-20 bg-gradient-to-br from-blue-50 to-indigo-100 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your ride,
                <span className="text-blue-600"> your way</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Experience the future of transportation. Safe, reliable, and
                convenient rides at your fingertips. Join millions who trust
                MiRide for their daily commute.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10M+</div>
                <div className="text-sm text-gray-600">Happy Riders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">5M+</div>
                <div className="text-sm text-gray-600">Active Drivers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">100+</div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                <span className="font-semibold">Request a Ride</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="flex items-center justify-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-blue-600">
                <span className="font-semibold">Become a Driver</span>
                <Users className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Book Your Ride
            </h3>
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-blue-600" />
                  <input
                    type="text"
                    placeholder="Pickup location"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-purple-600" />
                  <input
                    type="datetime-local"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Find Your Ride
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
