import React from 'react';
import { Shield, Phone, Eye, UserCheck, AlertCircle, Star } from 'lucide-react';

const SafetySection: React.FC = () => {
  const safetyFeatures = [
    {
      icon: Shield,
      title: 'Verified Drivers',
      description: 'All drivers undergo comprehensive background checks and regular vehicle inspections.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Eye,
      title: 'Real-Time Tracking',
      description: 'Share your trip with friends and family. GPS tracking for every ride.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Phone,
      title: '24/7 Support',
      description: 'Emergency assistance and customer support available around the clock.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: UserCheck,
      title: 'Identity Verification',
      description: 'Two-way verification system ensures both riders and drivers are verified.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: AlertCircle,
      title: 'Emergency Button',
      description: 'One-touch emergency button connects you directly to local authorities.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: Star,
      title: 'Rating System',
      description: 'Mutual rating system maintains high standards and accountability.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <section id="safety" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your Safety, Our Priority
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've built multiple layers of safety features to ensure every ride is secure and trustworthy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {safetyFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6`}>
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Safety Stats */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Safety by the Numbers</h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Safe Trips</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">Verified Drivers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Safety Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;