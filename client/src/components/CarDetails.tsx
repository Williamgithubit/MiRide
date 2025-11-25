import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import toast from "react-hot-toast";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { useGetCarByIdQuery } from "../store/Car/carApi";
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useDispatch } from 'react-redux';
import { carApi } from '../store/Car/carApi';
import { API_BASE_URL } from '../config/api';
import useRentals from "../store/hooks/useRentals";
import { CarCardProps } from "./CarList";
import { Car, CarImage } from "../types/index";
import { CAR_FEATURES } from "../constants/features";

const CarDetails: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useReduxAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRenting, setIsRenting] = useState(false);

  // Fetch car by ID directly from API
  const {
    data: carData,
    isLoading: isLoadingCar,
    error: carError,
  } = useGetCarByIdQuery(parseInt(carId || "0"), {
    skip: !carId,
  });

  const { addRental } = useRentals();

  // Helper function to get image URL
  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return "/car-placeholder.jpg";
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads')) return `${API_BASE_URL}${imageUrl}`;
    return imageUrl;
  };

  // Get car images array
  const carImages: string[] = React.useMemo(() => {
    if (!carData) return [];
    
    // If car has images array, use those
    if (carData.images && Array.isArray(carData.images) && carData.images.length > 0) {
      // Create a copy of the array before sorting to avoid mutating the original
      return [...carData.images]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((img: CarImage) => getImageUrl(img.imageUrl));
    }
    
    // Fallback to imageUrl if available
    if (carData.imageUrl) {
      return [getImageUrl(carData.imageUrl)];
    }
    
    return ["/car-placeholder.jpg"];
  }, [carData]);

  const handleRentCar = async () => {
    if (!isAuthenticated || !user || user.id === "0" || user.id === "") {
      toast.error("Please log in to rent this car");
      navigate("/login");
      return;
    }

    if (!car) return;

    // Redirect to booking flow instead of directly renting
    navigate(`/booking/${car.id}`);
  };

  const handleMessageOwner = () => {
    toast("Messaging feature coming soon!", {
      icon: "ℹ️",
      duration: 3000,
    });
  };

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

  if (carError) {
    console.error("Error fetching car:", carError);
    console.error("Error details:", JSON.stringify(carError, null, 2));
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error loading car details</h2>
          <p className="text-gray-600 mb-4">
            {(carError as any)?.data?.message || (carError as any)?.message || "Failed to load car information"}
          </p>
          <details className="mt-4 text-sm text-gray-500">
            <summary className="cursor-pointer">Technical Details</summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto max-w-2xl">
              {JSON.stringify(carError, null, 2)}
            </pre>
          </details>
          <button
            onClick={() => navigate("/browse-cars")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
          >
            Back to Browse Cars
          </button>
        </div>
      </>
    );
  }

  if (!carData) {
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

  // Map car data to display format
  const car = carData;

  // Get car's features from backend
  const carFeatures = car.features && Array.isArray(car.features) ? car.features : [];

  const reviews = [
    {
      name: "Mary Johnson",
      rating: 5,
      date: "2024-09-10",
      comment: "Excellent car! James was very professional and the car was exactly as described. Clean, comfortable, and perfect for my trip to Gbarnga.",
    },
    {
      name: "David Wilson",
      rating: 5,
      date: "2024-09-05",
      comment: "Great experience! The car was in perfect condition and James was very responsive. Highly recommend for anyone needing a reliable ride in Monrovia.",
    },
  ];

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen pt-16">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/browse-cars")}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Browse
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
                {/* Main Image */}
                <div className="relative">
                  <img
                    src={carImages[currentImageIndex] || "/car-placeholder.jpg"}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/car-placeholder.jpg";
                    }}
                  />
                  
                  {/* Image Navigation */}
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : carImages.length - 1)}
                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-white"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < carImages.length - 1 ? prev + 1 : 0)}
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-white"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">
                    {currentImageIndex + 1} / {carImages.length}
                  </div>
                </div>

                {/* Thumbnail Images */}
                <div className="p-2 sm:p-4 flex gap-2 overflow-x-auto">
                  {carImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? "border-blue-500" : "border-gray-200"
                      }`}
                    >
                      <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Car Details */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {car.brand} {car.model} ({car.year})
                </h1>
                
                {car.isAvailable ? (
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Instant Book
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full mb-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Not Available
                  </div>
                )}

                {/* Car Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{car.seats || 5}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Seats</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{car.fuelType || 'Gasoline'}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Fuel</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{car.type || 'Sedan'}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Type</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{car.transmission || 'Automatic'}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Transmission</div>
                  </div>
                </div>

                {/* About This Car */}
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">About This Car</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {car.description || `Clean and reliable ${car.brand} ${car.model} perfect for city driving and short trips around Monrovia and beyond.`} 
                  </p>
                </div>

                {/* Features & Amenities */}
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Features & Amenities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {CAR_FEATURES.map((feature, index) => {
                      const isAvailable = carFeatures.includes(feature);
                      return (
                        <div key={index} className={`flex items-center ${!isAvailable ? 'opacity-40' : ''}`}>
                          {isAvailable ? (
                            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={`text-sm sm:text-base ${isAvailable ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-2 sm:mr-3 text-sm sm:text-base">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm sm:text-base text-gray-900">{review.name}</div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-2 text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">${car.rentalPricePerDay}</div>
                    <div className="text-sm sm:text-base text-gray-500">/day</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-base text-green-600 font-semibold">Available</div>
                  </div>
                </div>

                <button
                  onClick={handleRentCar}
                  disabled={!car.isAvailable || isRenting}
                  className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg mb-3 sm:mb-4 transition-all duration-200 ${
                    !car.isAvailable || isRenting
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                  }`}
                >
                  {isRenting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : car.isAvailable ? (
                    "Book This Car Now"
                  ) : (
                    "Not Available"
                  )}
                </button>

                <button
                  onClick={handleMessageOwner}
                  className="w-full py-2.5 sm:py-3 border border-gray-300 rounded-lg font-medium text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200 mb-4 sm:mb-6"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message Owner
                </button>

                {/* Meet Your Host */}
                <div className="border-t pt-4 sm:pt-6">
                  <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-3">Meet Your Host</h4>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-2 sm:mr-3 text-sm sm:text-base">
                      JK
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base text-gray-900">James Kollie</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        4.9 rating
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">3</div>
                      <div className="text-xs sm:text-sm text-gray-500">Cars Listed</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">156</div>
                      <div className="text-xs sm:text-sm text-gray-500">Trips Completed</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs sm:text-sm text-gray-600">
                    Response time: 2 hours
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Protected by MiRide
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarDetails;
