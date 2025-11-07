import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import toast from "react-hot-toast";
import useReduxAuth from "../store/hooks/useReduxAuth";
import useCars from "../store/hooks/useCars";
import useRentals from "../store/hooks/useRentals";
import { Car } from "../types";

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
}

const BookingFlow: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useReduxAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { cars, isLoading: isLoadingCars } = useCars({});
  const { addRental } = useRentals();

  const [bookingData, setBookingData] = useState<BookingData>({
    carId: parseInt(carId || "0"),
    startDate: "",
    endDate: "",
    totalDays: 0,
    totalPrice: 0,
    paymentMethod: "credit-card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const car = cars?.find((c: Car) => c.id === parseInt(carId || "0"));

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to book a car");
      navigate("/login");
      return;
    }

    if (!carId || !car) {
      toast.error("Car not found");
      navigate("/browse-cars");
      return;
    }
  }, [isAuthenticated, carId, car, navigate]);

  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate && car) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Get the daily rate from multiple possible properties
      const dailyRate = (car as any).rentalPricePerDay || car.dailyRate || (car as any).dailyRate || 0;
      
      setBookingData(prev => ({
        ...prev,
        totalDays: diffDays,
        totalPrice: diffDays * dailyRate,
      }));
    }
  }, [bookingData.startDate, bookingData.endDate, car]);

  const handleInputChange = (field: keyof BookingData, value: string | number) => {
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
    // No validation needed for step 2 since we're redirecting to Stripe
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    
    // Log booking data when moving from step 2 to step 3
    if (currentStep === 2) {
      console.log('Booking Data to be sent to server:', {
        carId: bookingData.carId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalDays: bookingData.totalDays,
        totalPrice: bookingData.totalPrice,
        selectedCar: car
      });
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
        customerId: parseInt(user?.id || "0"),
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
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

  if (isLoadingCars) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </>
    );
  }

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
              <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
            </div>
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
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
                  {step < 3 && (
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
              <span>Select Dates</span>
              <span>Payment</span>
              <span>Confirmation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Step 1: Date Selection */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Dates</h2>
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
                    
                    {bookingData.startDate && bookingData.endDate && (
                      <div className="mt-6 p-4 bg-green-50 rounded-lg">
                        <h3 className="font-medium text-green-800 mb-2">Rental Summary</h3>
                        <div className="text-sm text-green-700">
                          <p>Duration: {bookingData.totalDays} days</p>
                          <p>Daily Rate: ${(car as any).rentalPricePerDay || car.dailyRate || (car as any).dailyRate || 0}/day</p>
                          <p className="font-bold">Total: ${bookingData.totalPrice}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Information</h2>
                    
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-green-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-green-900 mb-2">Secure Payment with Stripe</h4>
                          <p className="text-green-800 text-sm leading-relaxed">
                            When you click "Next", you will be redirected to our secure Stripe checkout page to complete your payment. 
                            Your booking details and personal information are protected with industry-standard encryption.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Your Booking</h2>
                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="font-medium text-gray-800 mb-2">Rental Details</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Start Date: {new Date(bookingData.startDate).toLocaleDateString()}</p>
                          <p>End Date: {new Date(bookingData.endDate).toLocaleDateString()}</p>
                          <p>Duration: {bookingData.totalDays} days</p>
                        </div>
                      </div>
                      
                      <div className="border-b pb-4">
                        <h3 className="font-medium text-gray-800 mb-2">Payment Method</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Payment will be processed securely through Stripe</p>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-green-800">Total Amount</span>
                          <span className="text-2xl font-bold text-green-800">${bookingData.totalPrice}</span>
                        </div>
                      </div>
                    </div>
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
                  
                  {currentStep < 3 ? (
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Processing..." : "Confirm Booking"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Car Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Your Selection</h3>
                <div className="space-y-4">
                  <img
                    src={car.imageUrl || "/car-placeholder.jpg"}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{car.brand} {car.model}</h4>
                    <p className="text-sm text-gray-600">{car.year}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Daily Rate</span>
                    <span className="font-medium">${(car as any).rentalPricePerDay || car.dailyRate || (car as any).dailyRate || 0}</span>
                  </div>
                  {bookingData.totalDays > 0 && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{bookingData.totalDays} days</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between font-bold">
                          <span>Total</span>
                          <span className="text-green-600">${bookingData.totalPrice}</span>
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
