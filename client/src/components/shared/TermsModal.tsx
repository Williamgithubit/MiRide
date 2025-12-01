import React, { useState } from 'react';
import { X, FileText, AlertCircle, DollarSign } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { acceptTerms } from '../../store/Terms/termsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { logout } from '../../store/Auth/authSlice';
import toast from 'react-hot-toast';

interface TermsModalProps {
  isOpen: boolean;
  userRole: 'customer' | 'owner' | 'admin';
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, userRole }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.terms);
  const [hasScrolled, setHasScrolled] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isAtBottom && !hasScrolled) {
      setHasScrolled(true);
    }
  };

  const handleAccept = async () => {
    try {
      await dispatch(acceptTerms()).unwrap();
      toast.success('Terms & Conditions accepted! Welcome to MiRide!');
    } catch (error) {
      toast.error('Failed to accept terms. Please try again.');
    }
  };

  const handleDecline = () => {
    toast.error('You must accept the Terms & Conditions to use the platform.');
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/20 dark:border-gray-700/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Terms & Conditions
              </h2>
              <p className="text-sm text-green-100">
                Please read carefully and accept to continue
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6"
          onScroll={handleScroll}
        >
          {/* Platform Terms */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                1
              </span>
              Platform Terms & Conditions
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300 ml-11">
              <p>Welcome to <strong>MiRide Car Rental Platform</strong>. By using our services, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide accurate and truthful information at all times</li>
                <li>Comply with all applicable local, state, and federal laws</li>
                <li>Respect other users, their property, and platform policies</li>
                <li>Not engage in fraudulent, harmful, or illegal activities</li>
                <li>Maintain the security and confidentiality of your account credentials</li>
                <li>Report any suspicious activity or security breaches immediately</li>
              </ul>
            </div>
          </section>

          {/* Commission Rules (For Owners) */}
          {userRole === 'owner' && (
            <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg border-2 border-green-300 dark:border-green-700 shadow-md">
              <div className="flex items-start space-x-3">
                <DollarSign className="w-7 h-7 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                      2
                    </span>
                    Commission Structure (Important for Car Owners)
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 ml-11">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="font-bold text-lg text-green-700 dark:text-green-400 mb-2">
                        Platform Commission: 10% per booking
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>You receive 90%</strong> of each booking amount directly to your Stripe account</li>
                        <li><strong>Platform retains 10%</strong> as a service fee for providing the marketplace</li>
                        <li>Commission is <strong>automatically deducted</strong> from payments via Stripe Connect</li>
                        <li>You can <strong>withdraw your earnings anytime</strong> from your dashboard</li>
                        <li>All transactions are processed <strong>securely via Stripe</strong></li>
                        <li>Real-time balance tracking and transparent transaction history</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-300 dark:border-yellow-700">
                      <p className="text-sm font-semibold mb-1">💡 Example:</p>
                      <p className="text-sm">
                        Customer pays <strong>$500</strong> for a booking →
                        You receive <strong className="text-green-600 dark:text-green-400">$450</strong> →
                        Platform fee <strong className="text-emerald-600 dark:text-emerald-400">$50</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Booking Rules */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                {userRole === 'owner' ? '3' : '2'}
              </span>
              Booking & Rental Rules
            </h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 ml-11">
              <div>
                <h4 className="font-semibold text-lg mb-2">For Customers:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Valid driver's license required for all rentals</li>
                  <li>Minimum age requirement: <strong>21 years old</strong></li>
                  <li>Payment must be completed before vehicle pickup</li>
                  <li>Late returns may incur additional charges</li>
                  <li>Damage to vehicles must be reported immediately</li>
                  <li>Vehicles must be returned with the same fuel level</li>
                  <li>Smoking and pets prohibited unless specified</li>
                </ul>
              </div>

              {userRole === 'owner' && (
                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-2">For Car Owners:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>All listed vehicles must have <strong>valid insurance</strong></li>
                    <li>Vehicles must pass safety inspections and meet platform standards</li>
                    <li>Accurate vehicle descriptions, photos, and specifications required</li>
                    <li>Respond to booking requests within <strong>24 hours</strong></li>
                    <li>Maintain vehicles in good working condition at all times</li>
                    <li>Complete Stripe Connect onboarding to receive payments</li>
                    <li>Provide clean vehicles for each rental</li>
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Cancellation Policy */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                {userRole === 'owner' ? '4' : '3'}
              </span>
              Cancellation Policy
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300 ml-11">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Free cancellation</strong> up to 48 hours before pickup</li>
                <li><strong>50% refund</strong> for cancellations 24-48 hours before pickup</li>
                <li><strong>No refund</strong> for cancellations within 24 hours of pickup</li>
                <li>Platform reserves the right to cancel fraudulent or suspicious bookings</li>
                <li>Refunds processed within 5-7 business days</li>
              </ul>
            </div>
          </section>

          {/* Liability */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                {userRole === 'owner' ? '5' : '4'}
              </span>
              Liability & Insurance
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300 ml-11">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Renters are <strong>fully responsible</strong> for damages during rental period</li>
                <li>Optional insurance coverage available at booking for additional protection</li>
                <li>Platform is <strong>not liable</strong> for accidents, damages, or injuries</li>
                <li>Users must have valid personal insurance coverage</li>
                <li>Report all accidents to local authorities and platform within 24 hours</li>
              </ul>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                {userRole === 'owner' ? '6' : '5'}
              </span>
              Privacy & Data Protection
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300 ml-11">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>We collect and store personal information securely using industry standards</li>
                <li>Data is used <strong>only for platform operations</strong> and service improvement</li>
                <li>We <strong>do not sell</strong> your information to third parties</li>
                <li>You can request data access, modification, or deletion at any time</li>
                <li>Payment information is processed securely through Stripe</li>
                <li>We comply with GDPR and applicable data protection laws</li>
              </ul>
            </div>
          </section>

          {/* Scroll Indicator */}
          {!hasScrolled && (
            <div className="sticky bottom-0 bg-gradient-to-t from-white dark:from-gray-800 via-white dark:via-gray-800 to-transparent pt-12 pb-4 text-center">
              <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-full inline-block animate-bounce">
                <p className="text-sm font-semibold">
                  ↓ Please scroll to read all terms ↓
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/30 dark:border-gray-700/30 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-b-2xl">
          <div className="flex items-start space-x-2 mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              By clicking <strong>"Accept & Continue"</strong>, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions. This is a legally binding agreement.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleDecline}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-md"
            >
              Decline & Logout
            </button>
            <button
              onClick={handleAccept}
              disabled={loading || !hasScrolled}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : hasScrolled ? (
                '✓ Accept & Continue'
              ) : (
                '⚠ Read All Terms First'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
