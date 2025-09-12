import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch } from "../store/hooks";
import toast from "react-hot-toast";
import { Skeleton } from "@mui/material";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { useToggleLikeMutation } from "../store/Car/carApi";

export interface CarCardProps {
  id: number;
  isLiked: boolean;
  isAvailable: boolean;
  name: string;
  make: string;
  model: string;
  year: number;
  seats: number;
  fuelType: "Petrol" | "Electric" | "Hybrid";
  location: string;
  features: string[];
  rating: number;
  reviews: number;
  rentalPricePerDay: number;
  description: string;
  imageUrl?: string;
  dailyRate?: number;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price || 0);
};

interface CarListProps {
  cars: CarCardProps[];
  onRent: (carId: number) => Promise<void>;
  onLike?: (carId: number) => Promise<void>;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}

const CarList: React.FC<CarListProps> = ({
  cars = [],
  onRent,
  onLike,
  isLoading = false,
  isAuthenticated = false,
}) => {
  const dispatch = useAppDispatch();
  const [loadingCarId, setLoadingCarId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [likedCars, setLikedCars] = useState<Record<number, boolean>>({});
  const [toggleLike] = useToggleLikeMutation();

  // Initialize liked cars from props
  useEffect(() => {
    const initialLikes = cars.reduce(
      (acc, car) => ({
        ...acc,
        [car.id]: car.isLiked || false,
      }),
      {} as Record<number, boolean>
    );
    setLikedCars(initialLikes);
  }, [cars]);

  const handleImageError = useCallback((carId: number) => {
    setImageErrors((prev) => ({ ...prev, [carId]: true }));
  }, []);

  const handleLikeClick = useCallback(
    async (carId: number, e: React.MouseEvent) => {
      e?.stopPropagation?.();
      if (!isAuthenticated) {
        toast.error("Please log in to like cars");
        return;
      }

      try {
        setLoadingCarId(carId);
        // Use the provided onLike callback if available, otherwise use the Redux action
        if (onLike) {
          await onLike(carId);
        } else {
          const response = await toggleLike(carId).unwrap();
          setLikedCars((prev) => ({
            ...prev,
            [carId]: response.isLiked,
          }));
          return;
        }

        // Toggle the like state if using the callback
        setLikedCars((prev) => ({
          ...prev,
          [carId]: !prev[carId],
        }));
      } catch (error) {
        console.error("Error toggling like:", error);
        toast.error("Failed to update like status");
      } finally {
        setLoadingCarId(null);
      }
    },
    [isAuthenticated, onLike, dispatch]
  );

  const handleRentClick = useCallback(
    async (carId: number) => {
      if (!isAuthenticated) {
        toast.error("Please log in to rent a car");
        return;
      }

      try {
        setLoadingCarId(carId);
        await onRent(carId);
        toast.success("Car rented successfully");
      } catch (error) {
        console.error("Error renting car:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process rental";
        toast.error(errorMessage);
      } finally {
        setLoadingCarId(null);
      }
    },
    [isAuthenticated, onRent]
  );

  const getCarImageUrl = (car: CarCardProps): string => {
    if (car.id && imageErrors[car.id]) {
      const searchTerm = `${car.make || "car"} ${car.model || ""}`.trim();
      return `https://source.unsplash.com/random/300x200/?${encodeURIComponent(
        searchTerm
      )}`;
    }
    return car.imageUrl || "/car-placeholder.jpg";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const auth = useReduxAuth();
  const isOwner = auth?.user?.role === "owner";

  if (!Array.isArray(cars) || cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4 text-center">
        <svg
          className="h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4.5L4 7m16 0l-8 4.5M4 7v9.5l8 4.5m0-14l8 4.5M4 16.5l8 4.5 8-4.5m-16-9l8-4.5"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-700">No cars available</h3>
        <p className="text-gray-500 mt-1">Check back later for new arrivals</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div />
        {isOwner && (
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-add-car-modal"))
            }
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-700"
          >
            + Add New Vehicle
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car: CarCardProps) => (
          <article
            key={car.id}
            className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative">
              <img
                src={getCarImageUrl(car) || "/car-placeholder.jpg"}
                alt={`${car.make} ${car.model}`}
                className="w-full h-48 object-cover"
                onError={() => handleImageError(car.id)}
              />
              <button
                onClick={(e) => handleLikeClick(car.id, e)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                aria-label={
                  likedCars[car.id] ? "Unlike this car" : "Like this car"
                }
                disabled={loadingCarId === car.id}
              >
                <svg
                  className={`w-6 h-6 ${
                    likedCars[car.id]
                      ? "text-red-500 fill-current"
                      : "text-gray-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              {!car.isAvailable && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Rented
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {car.make} {car.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {car.year} • {car.model}
                  </p>
                </div>
                {car.rating !== undefined && car.reviews !== undefined && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-gray-700 font-medium">
                      {car.rating.toFixed(1)}{" "}
                      <span className="text-gray-400 text-sm">
                        ({car.reviews})
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {car.seats} Seats
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  {car.fuelType}
                </span>
                {car.location && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                    {car.location}
                  </span>
                )}
              </div>

              {car.features && car.features.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {car.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {car.features.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                      +{car.features.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-primary-500">
                    {formatPrice(car.rentalPricePerDay)}
                  </span>
                  <span className="text-sm text-gray-500">/day</span>
                </div>
                <button
                  onClick={() => car.id && handleRentClick(car.id)}
                  disabled={
                    !car.isAvailable || !car.id || loadingCarId === car.id
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    !car.isAvailable || !car.id
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : loadingCarId === car.id
                      ? "bg-primary-600 text-white cursor-wait"
                      : "bg-primary-500 hover:bg-primary-700 text-white hover:shadow-md"
                  }`}
                  aria-label={
                    car.isAvailable
                      ? `Rent ${car.make} ${car.model} for ${formatPrice(
                          car.rentalPricePerDay
                        )} per day`
                      : `${car.make} ${car.model} is not available for rent`
                  }
                >
                  {loadingCarId === car.id ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : car.isAvailable ? (
                    "Rent Now"
                  ) : (
                    "Not Available"
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default CarList;
