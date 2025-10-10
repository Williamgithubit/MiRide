import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, CheckCircle, ArrowLeft, ArrowRight, X, Car, Users, MapPin } from 'lucide-react';
import Modal from '../../shared/Modal';
import toast from 'react-hot-toast';
import useReduxAuth from '../../../../store/hooks/useReduxAuth';
import useRentals from '../../../../store/hooks/useRentals';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useCreateCheckoutSessionMutation } from '../../../../store/Payment/paymentApi';

// Initialize Stripe with fallback
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef');

interface BookingData {
  carId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  // Additional fields from the original modal
  insurance: boolean;
  gps: boolean;
  childSeat: boolean;
  additionalDriver: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  specialRequests: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCar: any;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, selectedCar }) => {
  const { user, isAuthenticated } = useReduxAuth();
  const { addRental } = useRentals();
  const [createCheckoutSession] = useCreateCheckoutSessionMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);

  const [bookingData, setBookingData] = useState<BookingData>({
    carId: selectedCar?.id || 0,
    startDate: '',
    endDate: '',
    totalDays: 0,
    totalPrice: 0,
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    insurance: false,
    gps: false,
    childSeat: false,
    additionalDriver: false,
    pickupLocation: 'default',
    dropoffLocation: 'default',
    specialRequests: ''
  });

  // Update carId when selectedCar changes
  useEffect(() => {
    if (selectedCar) {
      setBookingData(prev => ({ ...prev, carId: selectedCar.id }));
    }
  }, [selectedCar]);

  // Calculate total price and days
  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate && selectedCar) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let totalPrice = diffDays * selectedCar.rentalPricePerDay;
      
      // Add extras
      if (bookingData.insurance) totalPrice += diffDays * 15;
      if (bookingData.gps) totalPrice += diffDays * 5;
      if (bookingData.childSeat) totalPrice += diffDays * 8;
      if (bookingData.additionalDriver) totalPrice += 25;
      
      setBookingData(prev => ({
        ...prev,
        totalDays: diffDays,
        totalPrice: Math.max(totalPrice, 0),
      }));
    }
  }, [bookingData.startDate, bookingData.endDate, bookingData.insurance, bookingData.gps, bookingData.childSeat, bookingData.additionalDriver, selectedCar]);

  // Check Stripe loading status
  useEffect(() => {
    const checkStripe = async () => {
      try {
        const stripe = await stripePromise;
        setStripeLoaded(!!stripe);
        if (!stripe) {
          console.error('Stripe failed to load. Please check your publishable key and internet connection.');
        }
      } catch (error) {
        console.error('Error loading Stripe:', error);
        setStripeLoaded(false);
      }
    };
    
    checkStripe();
  }, []);

  // Prevent navigation during Stripe redirect
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isRedirectingToStripe) {
        event.preventDefault();
        event.returnValue = 'You are being redirected to the payment page. Please wait...';
        return 'You are being redirected to the payment page. Please wait...';
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (isRedirectingToStripe) {
        event.preventDefault();
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
        toast.error('Please wait while we redirect you to the payment page.');
      }
    };

    if (isRedirectingToStripe) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      // Push a state to prevent back navigation
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isRedirectingToStripe]);

  const handleInputChange = (field: keyof BookingData, value: string | number | boolean) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep1 = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      toast.error('Please select both start and end dates');
      return false;
    }

    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error('Start date cannot be in the past');
      return false;
    }

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    // No validation needed for step 2 since we're redirecting to Stripe
    return true;
  };

  const handleStripeCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to proceed with payment');
      return;
    }

    if (!stripeLoaded) {
      toast.error('Payment system is not ready. Please wait a moment and try again.');
      return;
    }

    setIsSubmitting(true);
    setIsRedirectingToStripe(false);
    
    try {
      // Debug environment variables
      console.log('VITE_STRIPE_PUBLISHABLE_KEY:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      
      const stripe = await stripePromise;
      if (!stripe) {
        console.error('Stripe failed to initialize. Check your publishable key.');
        throw new Error('Stripe failed to load. Please check your internet connection and try again.');
      }

      // Show loading toast
      const loadingToast = toast.loading('Creating secure checkout session...');

      try {
        // Create checkout session using RTK Query
        const result = await createCheckoutSession({
          carId: bookingData.carId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          totalDays: bookingData.totalDays,
          totalPrice: bookingData.totalPrice,
          insurance: bookingData.insurance,
          gps: bookingData.gps,
          childSeat: bookingData.childSeat,
          additionalDriver: bookingData.additionalDriver,
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropoffLocation,
          specialRequests: bookingData.specialRequests,
          selectedCar: {
            id: selectedCar.id,
            year: selectedCar.year,
            brand: selectedCar.brand || selectedCar.make, // Handle both brand and make fields
            model: selectedCar.model,
            rentalPricePerDay: selectedCar.rentalPricePerDay,
            imageUrl: selectedCar.imageUrl
          }
        }).unwrap();

        const { sessionId, url } = result;
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        // Set redirecting state to prevent navigation
        setIsRedirectingToStripe(true);
        
        // Show redirecting message
        toast.success('Redirecting to secure payment...', { duration: 2000 });
        
        // Small delay to ensure state updates and toast are visible
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use the checkout URL if available (modern approach), otherwise fall back to sessionId
        if (url) {
          // Direct redirect to Stripe Checkout URL (modern, faster approach)
          // This will navigate away from the page, so no code after this will execute
          window.location.href = url;
          // Return to prevent any further execution
          return;
        } else if (sessionId) {
          // Fallback to legacy redirectToCheckout method
          const checkoutResult = await stripe.redirectToCheckout({ sessionId });
          
          if (checkoutResult.error) {
            setIsRedirectingToStripe(false);
            throw new Error(checkoutResult.error.message);
          }
        } else {
          throw new Error('No checkout session URL or ID received');
        }
      } catch (sessionError) {
        toast.dismiss(loadingToast);
        throw sessionError;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsRedirectingToStripe(false);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error('Network error. Please check your connection and try again.');
        } else if (error.message.includes('session')) {
          toast.error('Failed to create payment session. Please try again.');
        } else {
          toast.error(error.message || 'Failed to initialize payment. Please try again.');
        }
      } else {
        toast.error('Failed to initialize payment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    
    // Handle Step 2 -> Redirect to Stripe Checkout
    if (currentStep === 2) {
      handleStripeCheckout();
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a car');
      return;
    }

    setIsSubmitting(true);
    try {
      await addRental({
        carId: bookingData.carId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalDays: bookingData.totalDays,
        totalPrice: bookingData.totalPrice,
        insurance: bookingData.insurance,
        gps: bookingData.gps,
        childSeat: bookingData.childSeat,
        additionalDriver: bookingData.additionalDriver,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        specialRequests: bookingData.specialRequests,
        selectedCar: selectedCar
      });

      toast.success('Booking confirmed successfully!');
      onClose();
      // Reset form
      setCurrentStep(1);
      setBookingData({
        carId: selectedCar?.id || 0,
        startDate: '',
        endDate: '',
        totalDays: 0,
        totalPrice: 0,
        paymentMethod: 'credit-card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        insurance: false,
        gps: false,
        childSeat: false,
        additionalDriver: false,
        pickupLocation: 'default',
        dropoffLocation: 'default',
        specialRequests: ''
      });
    } catch (error) {
      toast.error('Failed to confirm booking');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleClose = () => {
    // Don't allow closing during Stripe redirect
    if (isRedirectingToStripe) {
      toast.error('Please wait while we redirect you to the payment page.');
      return;
    }
    
    setCurrentStep(1);
    setIsRedirectingToStripe(false);
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsRedirectingToStripe(false);
    };
  }, []);

  if (!selectedCar) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="xl">
      {/* Stripe Redirect Overlay */}
      {isRedirectingToStripe && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Redirecting to Secure Payment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please wait while we redirect you to Stripe's secure checkout page...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Do not close this window or navigate away.
            </p>
          </div>
        </div>
      )}
      
      <div className="max-h-[85vh] overflow-y-auto">
        {/* Header with Progress */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Your Ride</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Dates & Extras</span>
            <span>Payment</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Date Selection & Extras */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select Dates & Options</h3>
                
                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                {/* Pickup and Dropoff Locations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Pickup Location
                    </label>
                    <select 
                      value={bookingData.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    >
                      <option value="default">Car Location ({selectedCar.location})</option>
                      <option value="airport">Airport Terminal</option>
                      <option value="downtown">Downtown Office</option>
                      <option value="hotel">Hotel Delivery (+$25)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Dropoff Location
                    </label>
                    <select 
                      value={bookingData.dropoffLocation}
                      onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    >
                      <option value="default">Same as Pickup</option>
                      <option value="airport">Airport Terminal</option>
                      <option value="downtown">Downtown Office</option>
                      <option value="hotel">Hotel Pickup (+$25)</option>
                    </select>
                  </div>
                </div>

                {/* Add-ons and Extras */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Add-ons & Extras
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={bookingData.insurance}
                        onChange={(e) => handleInputChange('insurance', e.target.checked)}
                        className="mr-3" 
                      />
                      <div>
                        <p className="font-medium">Full Insurance</p>
                        <p className="text-sm text-gray-500">+$15/day</p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={bookingData.gps}
                        onChange={(e) => handleInputChange('gps', e.target.checked)}
                        className="mr-3" 
                      />
                      <div>
                        <p className="font-medium">GPS Navigation</p>
                        <p className="text-sm text-gray-500">+$5/day</p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={bookingData.childSeat}
                        onChange={(e) => handleInputChange('childSeat', e.target.checked)}
                        className="mr-3" 
                      />
                      <div>
                        <p className="font-medium">Child Safety Seat</p>
                        <p className="text-sm text-gray-500">+$8/day</p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={bookingData.additionalDriver}
                        onChange={(e) => handleInputChange('additionalDriver', e.target.checked)}
                        className="mr-3" 
                      />
                      <div>
                        <p className="font-medium">Additional Driver</p>
                        <p className="text-sm text-gray-500">+$25 one-time</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium mb-2">Special Requests</label>
                  <textarea 
                    rows={3} 
                    value={bookingData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700" 
                    placeholder="Any special requests or notes..." 
                  />
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h3>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Secure Payment with Stripe</h4>
                      <p className="text-black dark:text-white text-sm leading-relaxed">
                        When you click "Continue", you will be redirected to our secure Stripe checkout page to complete your payment. 
                        Your booking details and personal information are protected with industry-standard encryption.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm Your Booking
                </h3>
                
                <div className="space-y-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Rental Details</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Start Date: {new Date(bookingData.startDate).toLocaleDateString()}</p>
                      <p>End Date: {new Date(bookingData.endDate).toLocaleDateString()}</p>
                      <p>Duration: {bookingData.totalDays} days</p>
                      <p>Pickup: {bookingData.pickupLocation === 'default' ? selectedCar.location : bookingData.pickupLocation}</p>
                      <p>Dropoff: {bookingData.dropoffLocation === 'default' ? 'Same as pickup' : bookingData.dropoffLocation}</p>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Payment Method</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Payment will be processed securely through Stripe</p>
                    </div>
                  </div>
                  
                  {/* Cost Breakdown */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Cost Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Car rental ({bookingData.totalDays} days)</span>
                        <span>${(Number(bookingData.totalDays) * Number(selectedCar.rentalPricePerDay) || 0).toFixed(2)}</span>
                      </div>
                      {bookingData.insurance && (
                        <div className="flex justify-between">
                          <span>Insurance ({bookingData.totalDays} days)</span>
                          <span>${(Number(bookingData.totalDays) * 15 || 0).toFixed(2)}</span>
                        </div>
                      )}
                      {bookingData.gps && (
                        <div className="flex justify-between">
                          <span>GPS ({bookingData.totalDays} days)</span>
                          <span>${(Number(bookingData.totalDays) * 5 || 0).toFixed(2)}</span>
                        </div>
                      )}
                      {bookingData.childSeat && (
                        <div className="flex justify-between">
                          <span>Child seat ({bookingData.totalDays} days)</span>
                          <span>${(Number(bookingData.totalDays) * 8 || 0).toFixed(2)}</span>
                        </div>
                      )}
                      {bookingData.additionalDriver && (
                        <div className="flex justify-between">
                          <span>Additional driver</span>
                          <span>$25.00</span>
                        </div>
                      )}
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold text-lg text-blue-600">
                        <span>Total</span>
                        <span>${(Number(bookingData.totalPrice) || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={currentStep === 1 ? handleClose : handleBack}
                disabled={isRedirectingToStripe}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting || isRedirectingToStripe}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === 2 ? (
                    isRedirectingToStripe ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Redirecting to Stripe...
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Session...
                      </>
                    ) : (
                      'Continue to Payment'
                    )
                  ) : (
                    'Next'
                  )}
                  {!isSubmitting && !isRedirectingToStripe && <ArrowRight className="w-4 h-4 ml-2" />}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : `Confirm Booking - $${(Number(bookingData.totalPrice) || 0).toFixed(2)}`}
                </button>
              )}
            </div>
          </div>

          {/* Car Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sticky top-24">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Selection</h4>
              <div className="space-y-4">
                <img
                  src={selectedCar.imageUrl}
                  alt={selectedCar.model}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div>
                  <h5 className="font-medium text-gray-800 dark:text-gray-200">
                    {selectedCar.year} {selectedCar.brand} {selectedCar.model}
                  </h5>
                  <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-1" />
                    {selectedCar.seats} seats
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Daily Rate</span>
                  <span className="font-medium">${selectedCar.rentalPricePerDay}</span>
                </div>
                {bookingData.totalDays > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Duration</span>
                      <span className="font-medium">{bookingData.totalDays} days</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                      <div className="flex items-center justify-between font-bold text-blue-600">
                        <span>Total</span>
                        <span>${(Number(bookingData.totalPrice) || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingModal;
