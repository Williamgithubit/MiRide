import React from "react";
import { ArrowRight, Shield, Clock, Award } from "lucide-react";
import SearchWidget from "./SearchWidget";

const HeroEnhanced: React.FC = () => {
  return (
    <section className="relative pt-20 pb-32 lg:pt-24 lg:pb-40 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 w-full mt-14 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">
                Trusted by 10,000+ Customers
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Journey Starts Here
                <span className="block text-green-600 mt-2">
                  Premium Cars, Unbeatable Prices
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Experience the freedom of the open road with our premium fleet. 
                From luxury sedans to rugged SUVs, find the perfect vehicle for your adventure.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">No Hidden Fees</div>
                  <div className="text-xs text-gray-600">Transparent pricing</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">24/7 Support</div>
                  <div className="text-xs text-gray-600">Always here to help</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Best Price</div>
                  <div className="text-xs text-gray-600">Guaranteed lowest</div>
                </div>
              </div>
            </div>

            {/* Mobile CTA (hidden on desktop) */}
            <div className="lg:hidden flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.location.href = '/cars'}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="font-semibold">Browse Cars</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-96">
              {/* Floating Car Image */}
              <div className="relative z-10 flex items-center justify-center h-full">
                <img 
                  src="https://www.madebydesignesia.com/themes/rentaly/images/misc/car-2.png" 
                  alt="Luxury Car" 
                  className="w-full max-w-lg h-auto object-contain animate-float"
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 bg-white p-6 rounded-2xl shadow-xl z-20 animate-bounce-slow">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">4.9★</div>
                  <div className="text-sm text-gray-600 mt-1">Customer Rating</div>
                  <div className="text-xs text-gray-500 mt-1">8,945 reviews</div>
                </div>
              </div>
              
              <div className="absolute bottom-8 left-8 bg-white p-6 rounded-2xl shadow-xl z-20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">16K+</div>
                  <div className="text-sm text-gray-600 mt-1">Premium Cars</div>
                  <div className="text-xs text-gray-500 mt-1">Available now</div>
                </div>
              </div>

              {/* Gradient Orbs */}
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>

        {/* Search Widget */}
        <div className="max-w-6xl mx-auto">
          <SearchWidget />
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroEnhanced;
