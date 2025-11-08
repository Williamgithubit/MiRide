import { useState } from "react";
import { useGetCarsQuery, useGetCarByIdQuery, useGetAvailableCarsQuery, useToggleLikeMutation, useAddCarMutation, useUpdateCarMutation, useDeleteCarMutation, } from "../Car/carApi";
import { showErrorToast, showSuccessToast } from "../utils/apiUtils";
export const useCars = (options) => {
    const [selectedCarId, setSelectedCarId] = useState(null);
    // RTK Query hooks
    const { data: carsData, isLoading: isLoadingCars, error: carsError, refetch: refetchCars, } = useGetCarsQuery(options || {});
    // Extract cars and pagination from response
    const cars = Array.isArray(carsData) ? carsData : carsData?.cars || [];
    const pagination = carsData?.pagination || {
        totalPages: 1,
        total: Array.isArray(carsData) ? carsData.length : cars.length
    };
    const { data: selectedCar, isLoading: isLoadingSelectedCar } = useGetCarByIdQuery(selectedCarId || 0, {
        skip: selectedCarId === null,
    });
    const [addCar, addCarResult] = useAddCarMutation();
    const [updateCar, updateCarResult] = useUpdateCarMutation();
    const [deleteCar, deleteCarResult] = useDeleteCarMutation();
    const [toggleLike, toggleLikeResult] = useToggleLikeMutation();
    // Custom functions
    const selectCar = (id) => {
        setSelectedCarId(id);
    };
    const clearSelectedCar = () => {
        setSelectedCarId(null);
    };
    const createCar = async (carData) => {
        try {
            // Provide defaults for required server fields when missing
            const payload = {
                name: carData.name ||
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
                fuelType: carData.fuelType || "Petrol",
            };
            const result = await addCar(payload).unwrap();
            showSuccessToast("Car added successfully");
            return result;
        }
        catch (error) {
            showErrorToast(addCarResult.error);
            throw error;
        }
    };
    const editCar = async (id, carData) => {
        try {
            const result = await updateCar({ id, ...carData }).unwrap();
            showSuccessToast("Car updated successfully");
            return result;
        }
        catch (error) {
            showErrorToast(updateCarResult.error);
            throw error;
        }
    };
    const removeCar = async (id) => {
        try {
            await deleteCar(id).unwrap();
            showSuccessToast("Car deleted successfully");
            if (selectedCarId === id) {
                clearSelectedCar();
            }
        }
        catch (error) {
            showErrorToast(deleteCarResult.error);
            throw error;
        }
    };
    const toggleLikeCar = async (id) => {
        try {
            const result = await toggleLike(id).unwrap();
            return result;
        }
        catch (error) {
            showErrorToast(toggleLikeResult.error);
            throw error;
        }
    };
    const getAvailableCars = (startDate, endDate) => {
        return useGetAvailableCarsQuery({ startDate, endDate });
    };
    return {
        cars,
        selectedCar,
        pagination,
        refetch: refetchCars,
        isLoading: isLoadingCars ||
            isLoadingSelectedCar ||
            addCarResult.isLoading ||
            updateCarResult.isLoading ||
            deleteCarResult.isLoading ||
            toggleLikeResult.isLoading,
        error: carsError ||
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
