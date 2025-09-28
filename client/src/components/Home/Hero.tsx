import React from "react";
import { ArrowRight, MapPin, Calendar, Users, Car } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-20 pb-16 lg:pt-24 lg:pb-20 bg-gradient-to-br from-green-50 to-emerald-100 w-full mt-14">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">
                Premium Car Rentals
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Explore the world with
                <span className="text-green-600"> comfortable car</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Rent a car from our premium fleet and explore destinations with comfort and style. 
                Choose from luxury sedans, SUVs, and sports cars for your perfect journey.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.location.href = '/cars'}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="font-semibold">Rent Now</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="flex items-center justify-center space-x-2 bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-green-600">
                <span className="font-semibold">Learn More</span>
                <Car className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Hero Car Image with City Background */}
          <div className="relative">
            {/* Curved City Background */}
            <div className="relative w-full h-96 overflow-hidden">
              {/* City Background Image */}
            
              
              {/* Car Image */}
              <div className="relative z-10 flex items-center justify-center h-full pt-8">
                <img 
                  src="https://www.madebydesignesia.com/themes/rentaly/images/misc/car-2.png" 
                  alt="Luxury Car" 
                  className="w-full max-w-lg h-auto object-contain"
                />
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg z-20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4.9</div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-white p-4 rounded-xl shadow-lg z-20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-xs text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
