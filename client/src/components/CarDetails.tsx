import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import toast from "react-hot-toast";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { useGetCarByIdQuery, useGetCarsByOwnerQuery } from '../store/Car/carApi';
import { API_BASE_URL } from '../config/api';
import useRentals from "../store/hooks/useRentals";
import { Car, CarImage } from "../types/index";
import { CAR_FEATURES } from "../constants/features";
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaUsers, 
  FaBolt, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaCog,
  FaCheck,
  FaTimes,
  FaStar,
  FaCommentDots,
  FaShieldAlt
} from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import MessageModal from './MessageModal';
import { generateNearbyCoords, LIBERIA_CENTER } from '../utils/mapUtils';
import 'leaflet/dist/leaflet.css';

const CarDetails: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useReduxAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRenting, setIsRenting] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [ownerStats, setOwnerStats] = useState<{ totalCars: number; totalBookings: number } | null>(null);

  // Fetch car by ID directly from API
  const {
    data: carData,
    isLoading: isLoadingCar,
    error: carError,
  } = useGetCarByIdQuery(parseInt(carId || "0"), {
    skip: !carId,
  });

  // Fetch owner's cars to get the count
  const {
    data: ownerCars,
    isLoading: isLoadingOwnerCars,
  } = useGetCarsByOwnerQuery(carData?.ownerId ? parseInt(carData.ownerId.toString()) : 0, {
    skip: !carData?.ownerId,
  });

  // Generate approximate car location (in production, this would come from backend)
  const carLocation = React.useMemo(() => {
    return generateNearbyCoords(LIBERIA_CENTER, 10);
  }, [carData]);

  // Custom marker icon
  const carMarkerIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const { addRental } = useRentals();

  // Fetch owner stats when owner ID is available
  useEffect(() => {
    const fetchOwnerStats = async () => {
      if (!carData?.ownerId) {
        console.log('❌ No ownerId available');
        return;
      }
      
      console.log('🔍 Fetching stats for ownerId:', carData.ownerId);
      console.log('📊 ownerCars data:', ownerCars);
      
      // First, set the car count from ownerCars if available
      if (ownerCars && ownerCars.length > 0) {
        console.log('✅ Setting stats from ownerCars:', ownerCars.length);
        setOwnerStats(prev => ({
          totalCars: ownerCars.length,
          totalBookings: prev?.totalBookings || 0,
        }));
      } else {
        console.log('⚠️ ownerCars is empty or undefined');
      }
      
      // Then try to fetch complete stats from API (public endpoint, no auth needed)
      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/dashboard/public-owner-stats/${carData.ownerId}`;
        console.log('🌐 Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Stats received:', data);
          setOwnerStats({
            totalCars: data.totalCars || ownerCars?.length || 0,
            totalBookings: data.totalBookings || 0,
          });
        } else {
          const errorText = await response.text();
          console.log('❌ Stats API failed:', response.status, errorText);
          console.log('Using ownerCars count as fallback');
        }
      } catch (error) {
        console.error('❌ Error fetching owner stats:', error);
        // Keep the ownerCars count we already set
      }
    };

    fetchOwnerStats();
  }, [carData?.ownerId, ownerCars]);

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
    if (!isAuthenticated || !user || user.id === "0" || user.id === "") {
      toast.error("Please log in to message the owner");
      navigate("/login");
      return;
    }

    if (car?.ownerId === user.id) {
      toast.error("You cannot message yourself");
      return;
    }

    setIsMessageModalOpen(true);
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

  // Get owner name - handle both name and firstName/lastName formats
  const ownerName = car.owner 
    ? car.owner.name || `${car.owner.firstName || ''} ${car.owner.lastName || ''}`.trim() || 'Car Owner'
    : 'Car Owner';

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
            <FaChevronLeft className="w-5 h-5 mr-2" />
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
                    <FaChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < carImages.length - 1 ? prev + 1 : 0)}
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-white"
                  >
                    <FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
                    <FaUsers className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{car.seats || 5}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Seats</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <FaBolt className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{car.fuelType || 'Gasoline'}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Fuel</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <FaCalendarAlt className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{car.type || 'Sedan'}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Type</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <FaCog className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
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
                            <FaCheck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          ) : (
                            <FaTimes className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
                          )}
                          <span className={`text-sm sm:text-base ${isAvailable ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Car Location */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Car Location</h3>
                    <button
                      onClick={() => setShowLocationMap(!showLocationMap)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showLocationMap ? 'Hide Map' : 'Show Map'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-green-600" />
                    Approximate location in Monrovia area
                  </p>
                  {showLocationMap && (
                    <div className="rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
                      <MapContainer
                        center={[carLocation.lat, carLocation.lng]}
                        zoom={13}
                        style={{ height: '300px', width: '100%' }}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[carLocation.lat, carLocation.lng]} icon={carMarkerIcon}>
                          <Popup>
                            <div className="text-center">
                              <p className="font-semibold text-gray-900">{car.brand} {car.model}</p>
                              <p className="text-sm text-gray-600">Approximate Location</p>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  )}
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
                                <FaStar
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                />
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
                      <AiOutlineLoading3Quarters className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
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
                  <FaCommentDots className="w-5 h-5 inline mr-2" />
                  Message Owner
                </button>

                {/* Meet Your Host */}
                <div className="border-t pt-4 sm:pt-6">
                  <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-3">Meet Your Host</h4>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-2 sm:mr-3 text-sm sm:text-base">
                      {ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'O'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base text-gray-900">{ownerName}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                        4.9 rating
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {ownerStats?.totalCars ?? (ownerCars?.length || 0)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">Cars Listed</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {ownerStats?.totalBookings ?? 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">Trips Completed</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs sm:text-sm text-gray-600">
                    Response time: 2 hours
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <FaShieldAlt className="w-4 h-4 mr-1" />
                    Protected by MiRide
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {car && car.ownerId && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          carId={car.id}
          ownerId={car.ownerId}
          ownerName={ownerName}
          carName={`${car.brand} ${car.model} (${car.year})`}
        />
      )}
    </>
  );
};

export default CarDetails;
