import React from 'react';
import { Tag, Clock, Gift, Percent, ArrowRight } from 'lucide-react';

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: string;
  code: string;
  validUntil: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const SpecialOffers: React.FC = () => {
  const offers: Offer[] = [
    {
      id: 1,
      title: 'First Time Rental',
      description: 'Get 15% off your first car rental with us. Perfect for new customers!',
      discount: '15% OFF',
      code: 'FIRST15',
      validUntil: 'Dec 31, 2025',
      icon: Gift,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 2,
      title: 'Weekend Special',
      description: 'Book for 3+ days over the weekend and save big on your adventure.',
      discount: '20% OFF',
      code: 'WEEKEND20',
      validUntil: 'Every Weekend',
      icon: Tag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 3,
      title: 'Early Bird Discount',
      description: 'Book 30 days in advance and enjoy exclusive savings on all vehicles.',
      discount: '25% OFF',
      code: 'EARLY25',
      validUntil: 'Limited Time',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 4,
      title: 'Long Term Rental',
      description: 'Rent for a month or more and get our best rates with flexible terms.',
      discount: '30% OFF',
      code: 'MONTHLY30',
      validUntil: 'Ongoing',
      icon: Percent,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You can add a toast notification here
    alert(`Promo code "${code}" copied to clipboard!`);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 w-full relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center space-x-2 bg-green-100 px-4 py-2 rounded-full mb-4">
            <Tag className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Limited Time Offers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Special Deals & Promotions
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Save more on your next rental with our exclusive offers. Use promo codes at checkout for instant discounts.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`${offer.bgColor} border-2 ${offer.borderColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group`}
            >
              {/* Discount Badge */}
              <div className="absolute top-4 right-4">
                <div className={`${offer.color} bg-white px-3 py-1 rounded-full text-sm font-bold shadow-md`}>
                  {offer.discount}
                </div>
              </div>

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <offer.icon className={`h-8 w-8 ${offer.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {offer.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {offer.description}
              </p>

              {/* Promo Code */}
              <div className="bg-white rounded-lg p-3 mb-3 border-2 border-dashed border-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Promo Code</div>
                    <div className="font-mono font-bold text-gray-900">{offer.code}</div>
                  </div>
                  <button
                    onClick={() => copyCode(offer.code)}
                    className={`${offer.color} hover:underline text-sm font-semibold`}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Valid Until */}
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>Valid until: {offer.validUntil}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 lg:p-12 text-center text-white shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              🎉 Refer a Friend, Get $50 Credit!
            </h3>
            <p className="text-green-100 text-lg mb-6">
              Share your unique referral code with friends. When they complete their first rental, you both get $50 in account credit!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
                <div className="text-xs text-green-100 mb-1">Your Referral Code</div>
                <div className="font-mono font-bold text-xl">FRIEND50</div>
              </div>
              <button className="bg-white text-green-600 px-8 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold flex items-center space-x-2">
                <span>Share Now</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default SpecialOffers;
