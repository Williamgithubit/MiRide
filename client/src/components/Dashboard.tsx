import React, { useState, useEffect } from "react";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { Car } from "../store/Car/carApi";
import { CarCardProps } from "./CarList";
import { Rental } from "../store/Rental/rentalApi";
import CarList from "./CarList";
import RentalList from "./RentalList";
import Navbar from "./Navbar";
import useCars from "../store/hooks/useCars";
import useRentals from "../store/hooks/useRentals";
import { toast } from "react-toastify";

type Tab = "cars" | "rentals";

type Message = {
  text: string;
  type: "success" | "error";
};

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("cars");
  const [cars, setCars] = useState<CarCardProps[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);
  const { user } = useReduxAuth();

  // Use Redux hooks for cars and rentals
  const {
    cars: carData,
    isLoading: isLoadingCars,
    error: carsError,
  } = useCars();
  const {
    rentals: rentalData,
    isLoading: isLoadingRentals,
    error: rentalsError,
    addRental,
  } = useRentals();

  useEffect(() => {
    // Set cars and rentals from Redux state
    if (carData) {
      // Map Car data to match CarCardProps expected by CarList
      const mappedCars: CarCardProps[] = carData.map((car: any) => ({
        ...car,
        id: car.id ?? 0,
        isLiked: false,
        isAvailable: Boolean(car.isAvailable),
        imageUrl:
          car.imageUrl || "https://via.placeholder.com/300x200?text=No+Image",
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
      setCars(mappedCars);
    }

    if (rentalData) {
      setRentals(rentalData);
    }

    // Show error toasts if needed
    if (carsError) {
      toast.error("Failed to fetch car data");
      setMessage({
        text: "Failed to fetch car data",
        type: "error",
      });
    }

    if (rentalsError) {
      toast.error("Failed to fetch rental data");
      setMessage({
        text: "Failed to fetch rental data",
        type: "error",
      });
    }
  }, [carData, rentalData, carsError, rentalsError]);

  // Update loading state based on Redux loading states
  useEffect(() => {
    setIsLoading(isLoadingCars || isLoadingRentals);
  }, [isLoadingCars, isLoadingRentals]);

  const handleRentCar = async (carId: number) => {
    if (!user) {
      toast.error("Please log in to rent a car");
      setMessage({
        text: "Please log in to rent a car",
        type: "error",
      });
      return;
    }

    // Check if user has already rented this car
    const hasAlreadyRented = rentalData?.some(
      (rental: Rental) =>
        rental.carId === carId &&
        rental.customerId.toString() === user.id.toString()
    );

    if (hasAlreadyRented) {
      toast.error("You have already rented this car.");
      return;
    }

    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    try {
      // Use the addRental function from useRentals hook
      const { addRental } = useRentals();

      await addRental({
        carId,
        customerId: Number(user.id),
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      // No need to manually update state as Redux will handle it

      toast.success("Car rented successfully");
      setMessage({
        text: "Car rented successfully",
        type: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to rent car";
      toast.error(errorMessage);
      setMessage({
        text: errorMessage,
        type: "error",
      });
      throw error; // Re-throw the error to be handled by CarList
    }
  };

  const handleCancelRental = async (rentalId: number) => {
    try {
      // Use the cancelRentalById function from useRentals hook
      const { cancelRentalById } = useRentals();

      await cancelRentalById(rentalId);

      // No need to manually update state as Redux will handle it

      toast.success("Rental cancelled successfully");
      setMessage({
        text: "Rental cancelled successfully",
        type: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel rental";
      toast.error(errorMessage);
      setMessage({
        text: errorMessage,
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          {user?.name && (
            <div className="text-xl font-semibold">Welcome, {user.name}</div>
          )}
          <div className="hidden md:flex space-x-4">
            <button
              onClick={() => setActiveTab("cars")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "cars"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Available Cars
            </button>
            <button
              onClick={() => setActiveTab("rentals")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "rentals"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              My Rentals
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" ? (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        {activeTab === "cars" ? (
          <CarList
            cars={
              cars
            } /* cars is already mapped to CarCardProps[] in the useEffect */
            onRent={handleRentCar}
            isLoading={isLoading}
          />
        ) : (
          <RentalList
            rentals={rentals}
            onRentalDeleted={handleCancelRental}
            setMessage={setMessage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
