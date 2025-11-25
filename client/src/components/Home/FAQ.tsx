import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'booking' | 'payment' | 'rental' | 'general';
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What documents do I need to rent a car?',
      answer: 'You\'ll need a valid driver\'s license, a credit card in your name, and proof of insurance. International travelers should also bring their passport and an International Driving Permit (IDP) if required.',
      category: 'rental'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'We offer free cancellation up to 24 hours before your scheduled pickup time. Cancellations made within 24 hours may incur a fee. No-shows will be charged the full rental amount.',
      category: 'booking'
    },
    {
      question: 'Is insurance included in the rental price?',
      answer: 'Basic insurance coverage is included in all our rental prices. However, you can upgrade to comprehensive coverage for additional protection. We also accept third-party insurance if you prefer.',
      category: 'payment'
    },
    {
      question: 'Can I extend my rental period?',
      answer: 'Yes! You can extend your rental period by contacting our support team or through your account dashboard. Extensions are subject to vehicle availability and will be charged at the current daily rate.',
      category: 'rental'
    },
    {
      question: 'What happens if I return the car late?',
      answer: 'We offer a 30-minute grace period. After that, you\'ll be charged for an additional day. If you know you\'ll be late, please contact us to extend your rental and avoid extra fees.',
      category: 'rental'
    },
    {
      question: 'Do you offer one-way rentals?',
      answer: 'Yes, we offer one-way rentals between select locations. A one-way fee may apply depending on the distance and availability. You can check this option during the booking process.',
      category: 'booking'
    },
    {
      question: 'What is the minimum age to rent a car?',
      answer: 'The minimum age to rent a car is 21 years old. Drivers under 25 may be subject to a young driver surcharge. Some luxury and specialty vehicles may require drivers to be 25 or older.',
      category: 'general'
    },
    {
      question: 'Are there mileage limits?',
      answer: 'Most of our rentals come with unlimited mileage. However, some specialty vehicles or long-term rentals may have mileage restrictions. Check your rental agreement for specific details.',
      category: 'rental'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital payment methods like PayPal. A credit card is required for the security deposit.',
      category: 'payment'
    },
    {
      question: 'Can I add an additional driver?',
      answer: 'Yes, you can add additional drivers for a small daily fee. All additional drivers must meet the same age and license requirements and be present at pickup to sign the rental agreement.',
      category: 'rental'
    },
    {
      question: 'What if the car breaks down during my rental?',
      answer: 'We provide 24/7 roadside assistance. If your vehicle breaks down, call our emergency hotline immediately. We\'ll arrange for repairs or provide a replacement vehicle at no additional cost.',
      category: 'general'
    },
    {
      question: 'Do you offer airport pickup and drop-off?',
      answer: 'Yes! We have locations at major airports and offer convenient pickup and drop-off services. Some locations may charge an airport service fee, which will be clearly displayed during booking.',
      category: 'booking'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'booking': return 'bg-blue-100 text-blue-700';
      case 'payment': return 'bg-green-100 text-green-700';
      case 'rental': return 'bg-purple-100 text-purple-700';
      case 'general': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <section className="py-20 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Find answers to common questions about our car rental service. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-start justify-between text-left hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(faq.category)}`}>
                      {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0 mt-1">
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
