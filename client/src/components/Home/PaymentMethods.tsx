import React from 'react';
import { CreditCard, Smartphone, Shield, CheckCircle } from 'lucide-react';

const PaymentMethods: React.FC = () => {
  return (
    <section className="py-20 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Flexible Payment Options
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Pay securely with your preferred method. We accept cards and mobile money for your convenience.
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Credit/Debit Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-100">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                Credit & Debit Cards
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Pay securely with your Visa, Mastercard, or other major credit and debit cards.
              </p>
              <div className="flex justify-center items-center space-x-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="font-bold text-blue-600">VISA</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="font-bold text-orange-600">Mastercard</span>
                </div>
              </div>
            </div>

            {/* Orange Money */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-orange-200">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Smartphone className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                Orange Money
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Fast and convenient mobile money payments through Orange Money Liberia.
              </p>
              <div className="flex justify-center">
                <div className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-md">
                  Orange Money
                </div>
              </div>
            </div>

            {/* Lonestar Cell MTN */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-yellow-200">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Smartphone className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                Lonestar Cell MTN
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Pay easily with Lonestar Cell MTN Mobile Money for instant confirmation.
              </p>
              <div className="flex justify-center">
                <div className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-md">
                  Lonestar MTN
                </div>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 lg:p-10 text-white">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-center mb-4">
              Secure & Protected Payments
            </h3>
            <p className="text-green-100 text-center text-lg mb-8 max-w-2xl mx-auto">
              Your payment information is encrypted and secure. We use industry-standard security measures to protect your transactions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-200 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">SSL Encrypted</h4>
                  <p className="text-sm text-green-100">All transactions are encrypted with 256-bit SSL</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-200 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Instant Confirmation</h4>
                  <p className="text-sm text-green-100">Receive booking confirmation immediately</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-200 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Refund Protection</h4>
                  <p className="text-sm text-green-100">Easy refunds for eligible cancellations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Process */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              How Payment Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Select Vehicle</h4>
                <p className="text-sm text-gray-600">Choose your preferred car and rental dates</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Choose Payment</h4>
                <p className="text-sm text-gray-600">Select card or mobile money option</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Complete Payment</h4>
                <p className="text-sm text-gray-600">Enter details and confirm transaction</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  4
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Get Confirmation</h4>
                <p className="text-sm text-gray-600">Receive instant booking confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentMethods;
