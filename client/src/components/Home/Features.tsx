import React from 'react';
import { Clock, Shield, DollarSign, Smartphone, Star, MapPin } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Clock,
      title: 'Quick & Reliable',
      description: 'Get a ride in minutes with our fast matching algorithm and extensive driver network.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Your safety is our priority. All drivers are verified and trips are tracked in real-time.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'No hidden fees or surge pricing. Know exactly what you\'ll pay before you book.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Smartphone,
      title: 'Easy to Use',
      description: 'Simple, intuitive app design that gets you from A to B with just a few taps.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Star,
      title: 'Highly Rated',
      description: 'Join millions of satisfied customers who rate us 4.9/5 stars consistently.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: MapPin,
      title: 'Wide Coverage',
      description: 'Available in 200+ cities worldwide. Wherever you go, we\'re there for you.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <section className="py-20 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Why Choose MiRide?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Experience the difference with features designed to make your journey comfortable, safe, and convenient.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 sm:p-7 md:p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2"
            >
              <div className={`inline-flex p-3 sm:p-4 rounded-xl ${feature.bgColor} mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${feature.color}`} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;