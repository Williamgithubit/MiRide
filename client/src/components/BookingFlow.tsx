import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import toast from "react-hot-toast";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { useGetCarByIdQuery } from "../store/Car/carApi";
import useRentals from "../store/hooks/useRentals";
import { Car } from "../types";
import { LIBERIA_LOCATIONS } from "../constants/locations";
import { MapPin, Car as CarIcon, Map as MapIcon } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useCreateCheckoutSessionMutation } from "../store/Payment/paymentApi";
import LocationPicker from "./maps/LocationPicker";
import RouteDisplay from "./maps/RouteDisplay";
import { Coordinates } from "../types/map";
import { getCoordsFromLocationName } from "../utils/mapUtils";

// Initialize Stripe
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
  insurance: boolean;
  gps: boolean;
  childSeat: boolean;
  additionalDriver: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  specialRequests: string;
}

const BookingFlow: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useReduxAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const hasShownOwnerError = React.useRef(false);

  const { addRental } = useRentals();
  const [createCheckoutSession] = useCreateCheckoutSessionMutation();
  
  // Fetch car by ID
  const {
    data: car,
    isLoading: isLoadingCar,
    error: carError,
  } = useGetCarByIdQuery(parseInt(carId || "0"), {
    skip: !carId,
  });

  const [bookingData, setBookingData] = useState<BookingData>({
    carId: parseInt(carId || "0"),
    startDate: "",
    endDate: "",
    totalDays: 0,
    totalPrice: 0,
    paymentMethod: "stripe",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    insurance: false,
    gps: false,
    childSeat: false,
    additionalDriver: false,
    pickupLocation: "default",
    dropoffLocation: "default",
    specialRequests: "",
  });

  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);
  const [showRouteMap, setShowRouteMap] = useState(false);

  // Check authentication and user role on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to book a car");
      navigate("/login");
      return;
    }

    // Prevent owners from booking cars (only show toast once)
    if (user?.role === 'owner' && !hasShownOwnerError.current) {
      hasShownOwnerError.current = true;
      toast.error("Car owners cannot book cars. Only customers can make bookings.");
      navigate("/browse-cars");
      return;
    }
  }, [isAuthenticated, user?.role, navigate]);

  // Handle car loading errors
  useEffect(() => {
    if (carError) {
      console.error("Error loading car:", carError);
      toast.error("Car not found");
      navigate("/browse-cars");
    }
  }, [carError, navigate]);

  // Show loading state
  if (isLoadingCar) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  // Show error if car not found
  if (!car) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Car not found</h2>
          <button
            onClick={() => navigate("/browse-cars")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Browse Cars
          </button>
        </div>
      </>
    );
  }

  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate && car) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Get the daily rate from multiple possible properties
      const dailyRate = (car as any).rentalPricePerDay || car.dailyRate || (car as any).dailyRate || 0;
      
      let totalPrice = diffDays * dailyRate;
      
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
  }, [bookingData.startDate, bookingData.endDate, bookingData.insurance, bookingData.gps, bookingData.childSeat, bookingData.additionalDriver, car]);

  const handleInputChange = (field: keyof BookingData, value: string | number | boolean) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep1 = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      toast.error("Please select both start and end dates");
      return false;
    }

    if (!bookingData.pickupLocation || bookingData.pickupLocation === "default") {
      toast.error("Please select a pickup location");
      return false;
    }

    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error("Start date cannot be in the past");
      return false;
    }

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    // Check if mobile money is selected (not yet available)
    if (bookingData.paymentMethod === "orange-money" || bookingData.paymentMethod === "mtn-money") {
      toast.error('Mobile money payments are coming soon. Please select Stripe payment method.');
      return false;
    }
    // No other validation needed for step 2 since we're redirecting to Stripe
    return true;
  };

  const handleStripeCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to proceed with payment');
      return;
    }

    // Prevent owners from booking cars (silent check - toast already shown in useEffect)
    if (user?.role === 'owner') {
      navigate('/browse-cars');
      return;
    }

    setIsSubmitting(true);
    setIsRedirectingToStripe(false);
    
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load. Please check your internet connection and try again.');
      }

      const loadingToast = toast.loading('Creating secure checkout session...');

      try {
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
            id: car!.id,
            year: car!.year,
            brand: (car as any).brand || (car as any).make,
            model: car!.model,
            rentalPricePerDay: (car as any).rentalPricePerDay || (car as any).dailyRate || 0,
            imageUrl: car!.imageUrl
          }
        }).unwrap();

        const { sessionId, url } = result;
        
        toast.dismiss(loadingToast);
        setIsRedirectingToStripe(true);
        toast.success('Redirecting to secure payment...', { duration: 2000 });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (url) {
          window.location.href = url;
          return;
        } else if (sessionId) {
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
        selectedCar: car,
      });

      toast.success("Booking confirmed successfully!");
      setTimeout(() => {
        navigate("/browse-cars");
      }, 2000);
    } catch (error) {
      toast.error("Failed to confirm booking");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  if (!car) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Car Not Found</h2>
            <button
              onClick={() => navigate("/browse-cars")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Back to Browse Cars
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 mt-16">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-800">Book Your Ride</h1>
              <span className="text-sm text-gray-500">Step {currentStep} of 2</span>
            </div>
            <div className="flex items-center">
              {[1, 2].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 2 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        step < currentStep ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Dates & Extras</span>
              <span>Payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Step 1: Date Selection & Extras */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Dates & Options</h2>
                    
                    {/* Date Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={bookingData.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={bookingData.endDate}
                          onChange={(e) => handleInputChange("endDate", e.target.value)}
                          min={bookingData.startDate || new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Pickup and Dropoff Locations with Map */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LocationPicker
                          selectedLocation={bookingData.pickupLocation !== "default" ? bookingData.pickupLocation : null}
                          onLocationSelect={(locationName, coordinates) => {
                            handleInputChange("pickupLocation", locationName);
                            setPickupCoords(coordinates);
                            // If dropoff is same as pickup, update it too
                            if (bookingData.dropoffLocation === "default" || bookingData.dropoffLocation === bookingData.pickupLocation) {
                              handleInputChange("dropoffLocation", locationName);
                              setDropoffCoords(coordinates);
                            }
                          }}
                          label="Pickup Location"
                        />
                        
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <MapPin className="w-4 h-4 inline mr-2 text-green-600" />
                              Drop-off Location
                            </label>
                            <label className="flex items-center text-xs font-normal cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bookingData.dropoffLocation === "default" || bookingData.dropoffLocation === bookingData.pickupLocation}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleInputChange("dropoffLocation", bookingData.pickupLocation);
                                    setDropoffCoords(pickupCoords);
                                  } else {
                                    handleInputChange("dropoffLocation", "default");
                                  }
                                }}
                                className="mr-2 rounded text-green-600 focus:ring-green-500"
                              />
                              Same as pickup
                            </label>
                          </div>
                          
                          {bookingData.dropoffLocation !== bookingData.pickupLocation && (
                            <LocationPicker
                              selectedLocation={bookingData.dropoffLocation !== "default" ? bookingData.dropoffLocation : null}
                              onLocationSelect={(locationName, coordinates) => {
                                handleInputChange("dropoffLocation", locationName);
                                setDropoffCoords(coordinates);
                              }}
                              label=""
                            />
                          )}
                          
                          {(bookingData.dropoffLocation === "default" || bookingData.dropoffLocation === bookingData.pickupLocation) && (
                            <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 text-sm">
                              Same as pickup location
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Route Display */}
                      {pickupCoords && dropoffCoords && bookingData.pickupLocation !== bookingData.dropoffLocation && (
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => setShowRouteMap(!showRouteMap)}
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
                          >
                            <MapIcon className="w-4 h-4 mr-2" />
                            {showRouteMap ? 'Hide Route Map' : 'Show Route Map'}
                          </button>
                          
                          {showRouteMap && (
                            <RouteDisplay
                              pickupLocation={pickupCoords}
                              dropoffLocation={dropoffCoords}
                              pickupName={bookingData.pickupLocation}
                              dropoffName={bookingData.dropoffLocation}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Add-ons and Extras */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <CarIcon className="w-5 h-5 mr-2" />
                        Add-ons & Extras
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={bookingData.insurance}
                            onChange={(e) => handleInputChange("insurance", e.target.checked)}
                            className="mr-3" 
                          />
                          <div>
                            <p className="font-medium">Full Insurance</p>
                            <p className="text-sm text-gray-500">+$15/day</p>
                          </div>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={bookingData.gps}
                            onChange={(e) => handleInputChange("gps", e.target.checked)}
                            className="mr-3" 
                          />
                          <div>
                            <p className="font-medium">GPS Navigation</p>
                            <p className="text-sm text-gray-500">+$5/day</p>
                          </div>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={bookingData.childSeat}
                            onChange={(e) => handleInputChange("childSeat", e.target.checked)}
                            className="mr-3" 
                          />
                          <div>
                            <p className="font-medium">Child Safety Seat</p>
                            <p className="text-sm text-gray-500">+$8/day</p>
                          </div>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={bookingData.additionalDriver}
                            onChange={(e) => handleInputChange("additionalDriver", e.target.checked)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                      <textarea 
                        rows={3} 
                        value={bookingData.specialRequests}
                        onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        placeholder="Any special requests or notes..." 
                      />
                    </div>
                    
                    {bookingData.startDate && bookingData.endDate && (
                      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h3 className="font-medium text-green-800 dark:text-white mb-2">Rental Summary</h3>
                        <div className="text-sm text-green-700 dark:text-white space-y-1">
                          <div className="flex justify-between">
                            <span>Car rental ({bookingData.totalDays} days)</span>
                            <span>${(bookingData.totalDays * ((car as any).rentalPricePerDay || car.dailyRate || 0)).toFixed(2)}</span>
                          </div>
                          {bookingData.insurance && (
                            <div className="flex justify-between">
                              <span>Insurance ({bookingData.totalDays} days)</span>
                              <span>${(bookingData.totalDays * 15).toFixed(2)}</span>
                            </div>
                          )}
                          {bookingData.gps && (
                            <div className="flex justify-between">
                              <span>GPS ({bookingData.totalDays} days)</span>
                              <span>${(bookingData.totalDays * 5).toFixed(2)}</span>
                            </div>
                          )}
                          {bookingData.childSeat && (
                            <div className="flex justify-between">
                              <span>Child seat ({bookingData.totalDays} days)</span>
                              <span>${(bookingData.totalDays * 8).toFixed(2)}</span>
                            </div>
                          )}
                          {bookingData.additionalDriver && (
                            <div className="flex justify-between">
                              <span>Additional driver</span>
                              <span>$25.00</span>
                            </div>
                          )}
                          <hr className="my-2 border-green-300" />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${bookingData.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Information</h2>
                    
                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Stripe */}
                        <button
                          type="button"
                          onClick={() => handleInputChange("paymentMethod", "stripe")}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            bookingData.paymentMethod === "stripe"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <svg className="w-8 h-8 mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <h4 className="font-semibold text-gray-900">Stripe</h4>
                            <p className="text-xs text-gray-500 mt-1">Credit/Debit Card</p>
                          </div>
                        </button>

                        {/* Orange Money */}
                        <button
                          type="button"
                          onClick={() => handleInputChange("paymentMethod", "orange-money")}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            bookingData.paymentMethod === "orange-money"
                              ? "border-orange-600 bg-orange-50"
                              : "border-gray-300 hover:border-orange-300"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <svg className="w-8 h-8 mb-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <h4 className="font-semibold text-gray-900">Orange Money</h4>
                            <p className="text-xs text-gray-500 mt-1">Mobile Money</p>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded mt-1">Coming Soon</span>
                          </div>
                        </button>

                        {/* Lonestar MTN */}
                        <button
                          type="button"
                          onClick={() => handleInputChange("paymentMethod", "mtn-money")}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            bookingData.paymentMethod === "mtn-money"
                              ? "border-yellow-600 bg-yellow-50"
                              : "border-gray-300 hover:border-yellow-300"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <svg className="w-8 h-8 mb-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <h4 className="font-semibold text-gray-900">Lonestar MTN</h4>
                            <p className="text-xs text-gray-500 mt-1">Mobile Money</p>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mt-1">Coming Soon</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Payment Method Details */}
                    {bookingData.paymentMethod === "stripe" && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start space-x-3">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <div>
                            <h4 className="font-semibold text-blue-900 dark:text-white mb-2">Secure Payment with Stripe</h4>
                            <p className="text-blue-800 dark:text-white text-sm leading-relaxed">
                              When you click "Continue to Payment", you will be redirected to our secure Stripe checkout page to complete your payment. 
                              Your booking details and personal information are protected with industry-standard encryption.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(bookingData.paymentMethod === "orange-money" || bookingData.paymentMethod === "mtn-money") && (
                      <div className={`p-6 rounded-lg border-2 ${
                        bookingData.paymentMethod === "orange-money"
                          ? "bg-orange-50 border-orange-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}>
                        <div className="flex items-start space-x-3">
                          <svg className={`w-6 h-6 mt-1 ${
                            bookingData.paymentMethod === "orange-money" ? "text-orange-600" : "text-yellow-600"
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <h4 className={`font-semibold mb-2 ${
                              bookingData.paymentMethod === "orange-money" ? "text-orange-900" : "text-yellow-900"
                            }`}>
                              {bookingData.paymentMethod === "orange-money" ? "Orange Money" : "Lonestar MTN Mobile Money"} - Coming Soon!
                            </h4>
                            <p className={`text-sm leading-relaxed mb-3 ${
                              bookingData.paymentMethod === "orange-money" ? "text-orange-800" : "text-yellow-800"
                            }`}>
                              We're working on integrating mobile money payments. For now, please use Stripe to complete your booking.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleInputChange("paymentMethod", "stripe")}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                            >
                              Switch to Stripe Payment
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {currentStep === 1 ? "Cancel" : "Back"}
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={
                      isSubmitting || 
                      isRedirectingToStripe || 
                      (currentStep === 2 && (bookingData.paymentMethod === 'orange-money' || bookingData.paymentMethod === 'mtn-money'))
                    }
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRedirectingToStripe ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Redirecting to Stripe...
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Session...
                      </>
                    ) : (
                      currentStep === 2 ? 'Continue to Payment' : 'Next'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Car Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Selection</h3>
                <div className="space-y-4">
                  <img
                    src={car.imageUrl || "/car-placeholder.jpg"}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">{car.brand} {car.model}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{car.year}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Daily Rate</span>
                    <span className="font-medium text-gray-800 dark:text-white">${(car as any).rentalPricePerDay || car.dailyRate || (car as any).dailyRate || 0}</span>
                  </div>
                  {bookingData.totalDays > 0 && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Duration</span>
                        <span className="font-medium text-gray-800 dark:text-white">{bookingData.totalDays} days</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-gray-800 dark:text-white">Total</span>
                          <span className="text-blue-600 dark:text-white">${bookingData.totalPrice}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingFlow;
