import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import toast from "react-hot-toast";
import useReduxAuth from "../store/hooks/useReduxAuth";
import useCars from "../store/hooks/useCars";
import useRentals from "../store/hooks/useRentals";
import { CarCardProps } from "./CarList";

const CarDetails: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useReduxAuth();
  const [car, setCar] = useState<CarCardProps | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRenting, setIsRenting] = useState(false);

  const {
    cars: carData,
    isLoading: isLoadingCars,
    error: carsError,
  } = useCars({});

  const { addRental } = useRentals();

  useEffect(() => {
    if (carData && carId) {
      const foundCar = carData.find((c) => c.id === parseInt(carId));
      if (foundCar) {
        const mappedCar = {
          ...foundCar,
          id: foundCar.id ?? 0,
          isLiked: false,
          isAvailable: Boolean(foundCar.isAvailable),
          name: (foundCar as any).brand || "Unnamed Vehicle",
          make: (foundCar as any).brand || "Unknown",
          model: foundCar.model || "Unknown",
          year: foundCar.year ?? new Date().getFullYear(),
          seats: foundCar.seats ?? 5,
          fuelType: (foundCar.fuelType as any) || "Petrol",
          location: foundCar.location || "Local",
          features: foundCar.features || [],
          rating: Number(foundCar.rating) || 4.5,
          reviews: foundCar.reviews ?? 0,
          rentalPricePerDay: Number((foundCar as any).rentalPricePerDay) || foundCar.dailyRate || 0,
          description:
            foundCar.description ||
            `${foundCar.year || ""} ${(foundCar as any).brand || ""} ${foundCar.model || ""}`.trim(),
        };
        setCar(mappedCar as CarCardProps);
      }
    }
  }, [carData, carId]);

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

  if (isLoadingCars) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

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

  // Mock images for the carousel
  const carImages = [
    car.imageUrl || "https://source.unsplash.com/800x600/?car",
    "https://source.unsplash.com/800x600/?car,interior",
    "https://source.unsplash.com/800x600/?car,dashboard",
    "https://source.unsplash.com/800x600/?car,engine",
  ];

  const features = [
    "Air Conditioning",
    "Bluetooth",
    "USB Charging",
    "Backup Camera",
    "Automatic Transmission",
    "Power Windows",
    "GPS Navigation",
    "Premium Sound System",
  ];

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

        <div className="max-w-6xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Main Image */}
                <div className="relative">
                  <img
                    src={carImages[currentImageIndex]}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-96 object-cover"
                  />
                  
                  {/* Image Navigation */}
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : carImages.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < carImages.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {carImages.length}
                  </div>
                </div>

                {/* Thumbnail Images */}
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {carImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? "border-blue-500" : "border-gray-200"
                      }`}
                    >
                      <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Car Details */}
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {car.make} {car.model} ({car.year})
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
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="font-semibold text-gray-900">{car.seats}</div>
                    <div className="text-sm text-gray-500">Seats</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="font-semibold text-gray-900">Gasoline</div>
                    <div className="text-sm text-gray-500">Fuel</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="font-semibold text-gray-900">Sedan</div>
                    <div className="text-sm text-gray-500">Type</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="font-semibold text-gray-900">Automatic</div>
                    <div className="text-sm text-gray-500">Transmission</div>
                  </div>
                </div>

                {/* About This Car */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">About This Car</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Clean and reliable {car.make} {car.model} perfect for city driving and short trips around Monrovia and beyond. 
                    The car is well-maintained and comes with air conditioning, comfortable seating, and good fuel efficiency. 
                    Perfect for business trips, family outings, or exploring beautiful Liberia.
                  </p>
                </div>

                {/* Features & Amenities */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Features & Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{review.name}</div>
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
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">${car.rentalPricePerDay}</div>
                    <div className="text-gray-500">/day</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-semibold">Available</div>
                  </div>
                </div>

                <button
                  onClick={handleRentCar}
                  disabled={!car.isAvailable || isRenting}
                  className={`w-full py-4 rounded-lg font-semibold text-lg mb-4 transition-all duration-200 ${
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
                  className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 mb-6"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message Owner
                </button>

                {/* Meet Your Host */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Meet Your Host</h4>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      JK
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">James Kollie</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        4.9 rating
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">3</div>
                      <div className="text-sm text-gray-500">Cars Listed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">156</div>
                      <div className="text-sm text-gray-500">Trips Completed</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    Response time: 2 hours
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Protected by RideShare LR
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
