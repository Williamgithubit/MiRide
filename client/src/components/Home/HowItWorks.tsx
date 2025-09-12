import React from 'react';
import { Smartphone, MapPin, Car, Star } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Smartphone,
      title: 'Request a Ride',
      description: 'Open the app, enter your destination, and choose your ride type.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: MapPin,
      title: 'Get Matched',
      description: 'Our algorithm finds the nearest driver and shares their details with you.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Car,
      title: 'Enjoy Your Ride',
      description: 'Track your driver in real-time and enjoy a comfortable, safe journey.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description: 'Rate your experience and help us maintain our high service standards.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How MiRide Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting a ride has never been easier. Follow these simple steps to book your next journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className={`inline-flex p-6 rounded-full ${step.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`h-10 w-10 ${step.color}`} />
                </div>
                <div className="absolute -top-2 -right-2 bg-white border-4 border-gray-50 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
            Start Your Journey Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;