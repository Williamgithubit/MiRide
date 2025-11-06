import React, { useEffect, useState, Suspense } from "react";
import CarList, { CarCardProps } from "./CarList";
import { Car } from "../types/index";
import { Rental } from "../store/Rental/rentalApi";
import { useNavigate } from "react-router-dom";
import useReduxAuth from "../store/hooks/useReduxAuth";
import Header from "./Header";
import toast from "react-hot-toast";
import Modal from "react-modal";
import Confetti from "react-confetti";
import useCars from "../store/hooks/useCars";
import useRentals from "../store/hooks/useRentals";
import ErrorBoundary from "./ErrorBoundary";
import BookingModal from "./dashboards/dashboard-components/customer-components/BookingModal";

// Custom hook to get window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const BrowseCars: React.FC = () => {
  const [cars, setCars] = useState<CarCardProps[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState<any>(null);
  const { width, height } = useWindowSize();

  const navigate = useNavigate();
  const { user, isAuthenticated } = useReduxAuth();
  const pageSize = 12; // Number of items per page

  // Use Redux hooks for cars and rentals with pagination
  const {
    cars: carData,
    pagination,
    isLoading: isLoadingCars,
    error: carsError,
  } = useCars({
    page: currentPage,
    limit: pageSize,
  });

  const {
    rentals: rentalData,
    isLoading: isLoadingRentals,
    error: rentalsError,
  } = useRentals();

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Set cars from Redux state with pagination
    if (carData) {
      const mappedCars = carData.map((car: Car) => {
        // Extract the primary image or first image from the images array
        let primaryImage: string | null = null;
        
        if (car.images && Array.isArray(car.images) && car.images.length > 0) {
          // Find primary image first
          const primary = car.images.find((img) => img.isPrimary);
          primaryImage = primary ? primary.imageUrl : car.images[0].imageUrl;
        }
        
        return {
          ...car,
          id: car.id ?? 0,
          isLiked: false,
          isAvailable: Boolean(car.isAvailable),
          name: car.brand || "Unnamed Vehicle",
          make: car.brand || "Unknown",
          model: car.model || "Unknown",
          year: car.year ?? new Date().getFullYear(),
          seats: car.seats ?? 5,
          fuelType: car.fuelType || "Petrol",
          location: car.location || "Local",
          features: car.features || [],
          rating: Number(car.rating) || 4.5,
          reviews: car.reviews ?? 0,
          rentalPricePerDay: Number(car.rentalPricePerDay) || 0,
          description:
            car.description ||
            `${car.year || ""} ${car.brand || ""} ${car.model || ""}`.trim(),
          imageUrl: primaryImage, // Add the extracted image URL
        };
      });

      setCars(mappedCars as any);
    }
  }, [carData]);

  useEffect(() => {
    if (pagination) {
      setTotalPages(pagination.totalPages || 1);
    }
  }, [pagination]);

  useEffect(() => {
    // Set rentals if user is authenticated
    if (isAuthenticated && rentalData) {
      setRentals(rentalData);
    } else {
      setRentals([]);
    }
  }, [rentalData, isAuthenticated]);

  // Handle errors
  useEffect(() => {
    if (carsError) {
      toast.error("Failed to fetch car data");
      console.error(carsError);
    }

    if (rentalsError) {
      toast.error("Failed to fetch rental data");
      console.error(rentalsError);
    }
  }, [carsError, rentalsError]);

  // Handle loading state
  const isLoading = isLoadingCars || isLoadingRentals;

  const handleRentCar = async (carId: number) => {
    if (!isAuthenticated || !user || user.id === "0" || user.id === "") {
      setShowLoginModal(true);
      return;
    }

    // Find the selected car
    const selectedCar = cars.find((car) => car.id === carId);
    if (!selectedCar) {
      toast.error("Car not found");
      return;
    }

    // Check if user has already rented this car
    const hasAlreadyRented = rentalData?.some(
      (rental: Rental) =>
        rental.carId === Number(carId) && rental.customerId === user.id
    );
    if (hasAlreadyRented) {
      toast.error("You have already rented this car.");
      return;
    }

    // Open the booking modal with the selected car
    setSelectedCarForBooking(selectedCar);
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedCarForBooking(null);
  };


  // Filter user rentals
  const userRentals = user
    ? rentals.filter(
        (rental) => rental.customerId.toString() === user.id.toString()
      )
    : [];

  return (
    <>
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get the Ride That Suits You
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Choose from our wide selection of clean, reliable vehicles across Liberia
          </p>
          
          {/* Statistics */}
          <div className="flex justify-center items-center gap-8 md:gap-16 mb-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">{cars.length}+</div>
              <div className="text-blue-200 text-sm">Cars Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">15+</div>
              <div className="text-blue-200 text-sm">Locations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">4.8</div>
              <div className="text-blue-200 text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white py-6 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by make or model..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-4">
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
              </select>
              
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All</option>
                <option value="petrol">Petrol</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-600">Found {cars.length} vehicles available</p>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">

        <div className="container mx-auto px-4 py-8">
          <ErrorBoundary>
            <CarList
              cars={cars}
              onRent={handleRentCar}
              onViewDetails={(carId) => navigate(`/car-details/${carId}`)}
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
            />
          </ErrorBoundary>

          {!isLoading && cars.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50"
                >
                  «
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50"
                >
                  ‹
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50"
                >
                  ›
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>

        {user && userRentals.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Your Rental History
            </h3>
            <ul className="space-y-3">
              {userRentals.map((rental) => {
                const rentedCar = cars.find((car) => car.id === rental.carId);
                return (
                  <li key={rental.id} className="p-4 bg-white shadow rounded">
                    <p>
                      <strong>Car:</strong> {rentedCar?.name || "N/A"}
                    </p>
                    <p>
                      <strong>From:</strong> {rental.startDate} &nbsp;
                      <strong>To:</strong> {rental.endDate}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        </div>
      </section>

      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Enhanced Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={handleCloseBookingModal}
        selectedCar={selectedCarForBooking}
      />

      <Suspense fallback={null}>
        {showLoginModal && (
          <Modal
            isOpen={showLoginModal}
            onRequestClose={() => setShowLoginModal(false)}
            contentLabel="Login Required"
            className="modal"
            overlayClassName="modal-overlay"
          >
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-auto mt-20">
              <h3 className="text-xl font-semibold mb-4">Login Required</h3>
              <p className="mb-6">You need to be logged in to rent a car.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </Modal>
        )}
      </Suspense>
    </>
  );
};

Modal.setAppElement("#root");
export default BrowseCars;
