import React from 'react';
import { DollarSign, Clock, Users, TrendingUp, Car, CheckCircle } from 'lucide-react';

const DriverSection: React.FC = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn More',
      description: 'Competitive rates and weekly bonuses for active drivers.',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Drive whenever you want. Set your own hours and work at your pace.',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Growing Community',
      description: 'Join thousands of drivers earning extra income with RideShare.',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Maximize Earnings',
      description: 'Use our heat maps and surge pricing to earn more during peak times.',
      color: 'text-orange-600'
    }
  ];

  const requirements = [
    'Valid driver\'s license',
    'Background check clearance',
    'Vehicle inspection passed',
    'Minimum 2 years driving experience',
    'Insurance coverage required'
  ];

  return (
    <section id="driver" className="py-12 sm:py-16 lg:py-20 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Drive with MiRide
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                Turn your car into a money-making machine. Join our platform and start earning on your own terms with the support of our driver community.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <benefit.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${benefit.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">{benefit.title}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
              <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-5 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
                <Car className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold text-sm sm:text-base">Start Driving</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-white text-green-600 px-5 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-green-600 active:bg-gray-100">
                <span className="font-semibold text-sm sm:text-base">Learn More</span>
              </button>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-gray-50 p-6 sm:p-7 md:p-8 rounded-2xl mt-10 lg:mt-0">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Driver Requirements</h3>
            <div className="space-y-3 sm:space-y-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 sm:mt-8 p-5 sm:p-6 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 text-sm sm:text-base mb-1 sm:mb-2">Average Earnings</h4>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">$25-35/hour</div>
              <p className="text-xs sm:text-sm text-green-700">
                Based on 20 hours/week during peak times
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverSection;