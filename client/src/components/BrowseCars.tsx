import React, { useEffect, useState, Suspense } from "react";
import CarList, { CarCardProps } from "./CarList";
import { Car } from "../types";
import { Rental } from "../store/Rental/rentalApi";
import { useNavigate } from "react-router-dom";
import useReduxAuth from "../store/hooks/useReduxAuth";
import Header from "./Header";
import toast from "react-hot-toast";
import Modal from "react-modal";
import Confetti from "react-confetti";
import { useAppDispatch } from "../store/hooks";
import useCars from "../store/hooks/useCars";
import useRentals from "../store/hooks/useRentals";

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

type Tab = "available" | "rented";

const BrowseCars: React.FC = () => {
  const [cars, setCars] = useState<CarCardProps[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [tab, setTab] = useState<Tab>("available");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
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
    refetch: refetchCars,
  } = useCars({
    page: currentPage,
    limit: pageSize,
  });

  const {
    rentals: rentalData,
    isLoading: isLoadingRentals,
    error: rentalsError,
    addRental,
  } = useRentals();

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Set cars from Redux state with pagination
    if (carData && pagination) {
      const mappedCars = carData.map((car) => ({
        ...car,
        id: car.id ?? 0,
        isLiked: false,
        isAvailable: Boolean(car.isAvailable),
        name: car.name || `${car.make || ""} ${car.model || ""}`.trim(),
        make: car.make || "Unknown",
        model: car.model || "Unknown",
        year: car.year ?? new Date().getFullYear(),
        seats: car.seats ?? 5,
        fuelType: (car.fuelType as any) || "Petrol",
        location: car.location || "Local",
        features: car.features || [],
        rating: car.rating ?? 4.5,
        reviews: car.reviews ?? 0,
        rentalPricePerDay: car.dailyRate ?? car.rentalPricePerDay ?? 0,
        description:
          car.description ||
          `${car.year || ""} ${car.make || ""} ${car.model || ""}`.trim(),
      }));

      setCars(mappedCars as any);
      setTotalPages(pagination.totalPages || 1);
    }

    // Set rentals if user is authenticated
    if (isAuthenticated && rentalData) {
      setRentals(rentalData);
    } else {
      setRentals([]);
    }
  }, [carData, rentalData, isAuthenticated, pagination]);

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
    if (!user || user.id === "0" || user.id === "") {
      setShowLoginModal(true);
      return;
    }
    // Check if user has already rented this car
    const hasAlreadyRented = rentalData?.some(
      (rental: Rental) =>
        rental.carId === Number(carId) && rental.customerId === Number(user.id)
    );
    if (hasAlreadyRented) {
      toast.error("You have already rented this car.");
      return;
    }
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    try {
      // Use the addRental function from useRentals hook
      const rental = await addRental({
        carId,
        customerId: parseInt(user.id, 10),
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      toast.success("Car rented successfully!");
    } catch (error) {
      toast.error("Failed to rent car");
      console.error(error);
    }
  };

  // Map Car objects to CarCardProps objects
  const mapCarToCardProps = (car: Car) => {
    // Ensure all required fields are included with proper types
    return {
      ...car,
      id: car.id || 0, // Ensure id is always a number
      isLiked: false, // Default value, update if you have this info
      isAvailable: Boolean(car.isAvailable),
      imageUrl:
        car.imageUrl || "https://via.placeholder.com/300x200?text=Car+Image",
      name: car.name || "Unnamed Vehicle",
      make: car.make || "Unknown Brand",
      model: car.model || "Unknown Model",
      year: car.year || new Date().getFullYear(),
      color: car.color || "Unknown",
      licensePlate: car.licensePlate || "N/A",
      dailyRate: car.dailyRate || 0,
      seats: "seats" in car ? (car as any).seats : 5, // Type assertion for optional fields
      fuelType:
        "fuelType" in car
          ? ((car as any).fuelType as "Petrol" | "Electric" | "Hybrid")
          : "Petrol",
      location: "Local",
      features: [],
      rating: 4.5,
      reviews: 10,
      rentalPricePerDay: car.dailyRate || 0,
      description:
        car.description ||
        `${car.year || ""} ${car.make || ""} ${car.model || ""}`.trim() ||
        "No description available",
      // Include any additional fields that might be required by CarCardProps
      type: "type" in car ? (car as any).type : "Sedan",
      transmission:
        "transmission" in car ? (car as any).transmission : "Automatic",
    };
  };

  // Filter cars based on availability status
  const availableCars = cars
    .filter((car) => car.isAvailable)
    .map(mapCarToCardProps);
  const rentedCars = isAuthenticated
    ? cars.filter((car) => !car.isAvailable).map(mapCarToCardProps)
    : [];
  const userRentals = user
    ? rentals.filter(
        (rental) => rental.customerId.toString() === user.id.toString()
      )
    : [];

  return (
    <>
      <Header />
      <section className="py-16 px-4 md:px-10 lg:px-20 bg-gray-50 min-h-screen mt-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Browse Cars for Rent
        </h2>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setTab("available")}
            className={`px-4 py-2 rounded ${
              tab === "available"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Available Cars
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setTab("rented")}
              className={`px-4 py-2 rounded ${
                tab === "rented"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Rented Cars
            </button>
          )}
        </div>

        <div className="container mx-auto px-4 py-8">
          <CarList
            cars={tab === "available" ? cars : []}
            onRent={handleRentCar}
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
          />

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
      </section>

      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

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
