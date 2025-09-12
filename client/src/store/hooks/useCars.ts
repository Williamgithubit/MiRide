import { useState } from "react";
import {
  useGetCarsQuery,
  useGetCarByIdQuery,
  useGetAvailableCarsQuery,
  useToggleLikeMutation,
  useAddCarMutation,
  useUpdateCarMutation,
  useDeleteCarMutation,
  Car,
} from "../Car/carApi";
import { showErrorToast, showSuccessToast } from "../utils/apiUtils";

export interface CarFormData {
  name?: string;
  model?: string;
  make?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  dailyRate?: number;
  isAvailable?: boolean;
  imageUrl?: string;
  type?: string;
  transmission?: string;
  description?: string;
  seats?: number;
  fuelType?: string;
}

export const useCars = (options?: { page?: number; limit?: number }) => {
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  // RTK Query hooks
  const {
    data: cars,
    isLoading: isLoadingCars,
    error: carsError,
    refetch: refetchCars,
  } = useGetCarsQuery();

  // Note: pagination and extra metadata may be returned by a custom endpoint
  // callers expect a `pagination` object sometimes; expose a best-effort shim
  const pagination =
    cars && (cars as any).pagination
      ? (cars as any).pagination
      : { totalPages: 1, total: Array.isArray(cars) ? cars.length : 0 };

  const { data: selectedCar, isLoading: isLoadingSelectedCar } =
    useGetCarByIdQuery(selectedCarId || 0, {
      skip: selectedCarId === null,
    });

  const [addCar, addCarResult] = useAddCarMutation();
  const [updateCar, updateCarResult] = useUpdateCarMutation();
  const [deleteCar, deleteCarResult] = useDeleteCarMutation();
  const [toggleLike, toggleLikeResult] = useToggleLikeMutation();

  // Custom functions
  const selectCar = (id: number) => {
    setSelectedCarId(id);
  };

  const clearSelectedCar = () => {
    setSelectedCarId(null);
  };

  const createCar = async (carData: CarFormData) => {
    try {
      // Provide defaults for required server fields when missing
      const payload: any = {
        name:
          carData.name ||
          `${carData.make || "Vehicle"} ${carData.model || ""}`.trim(),
        make: carData.make || "Unknown",
        model: carData.model || "Model",
        year: carData.year || new Date().getFullYear(),
        color: carData.color || "Unspecified",
        licensePlate: carData.licensePlate || "N/A",
        dailyRate: carData.dailyRate ?? 0,
        isAvailable: carData.isAvailable ?? true,
        imageUrl: carData.imageUrl || "",
        type: carData.type || "Sedan",
        transmission: carData.transmission || "Automatic",
        description: carData.description || "No description provided",
        seats: carData.seats ?? 5,
        fuelType: carData.fuelType || "Gasoline",
      };

      const result = await addCar(payload).unwrap();
      showSuccessToast("Car added successfully");
      return result;
    } catch (error) {
      showErrorToast(addCarResult.error);
      throw error;
    }
  };

  const editCar = async (id: number, carData: Partial<CarFormData>) => {
    try {
      const result = await updateCar({ id, ...carData }).unwrap();
      showSuccessToast("Car updated successfully");
      return result;
    } catch (error) {
      showErrorToast(updateCarResult.error);
      throw error;
    }
  };

  const removeCar = async (id: number) => {
    try {
      await deleteCar(id).unwrap();
      showSuccessToast("Car deleted successfully");
      if (selectedCarId === id) {
        clearSelectedCar();
      }
    } catch (error) {
      showErrorToast(deleteCarResult.error);
      throw error;
    }
  };

  const toggleLikeCar = async (id: number) => {
    try {
      const result = await toggleLike(id).unwrap();
      return result;
    } catch (error) {
      showErrorToast(toggleLikeResult.error);
      throw error;
    }
  };

  const getAvailableCars = (startDate: string, endDate: string) => {
    return useGetAvailableCarsQuery({ startDate, endDate });
  };

  return {
    cars,
    selectedCar,
    pagination,
    refetch: refetchCars,
    isLoading:
      isLoadingCars ||
      isLoadingSelectedCar ||
      addCarResult.isLoading ||
      updateCarResult.isLoading ||
      deleteCarResult.isLoading ||
      toggleLikeResult.isLoading,
    error:
      carsError ||
      addCarResult.error ||
      updateCarResult.error ||
      deleteCarResult.error ||
      toggleLikeResult.error,
    selectCar,
    clearSelectedCar,
    createCar,
    editCar,
    removeCar,
    toggleLikeCar,
    getAvailableCars,
    refetchCars,
  };
};

export default useCars;
