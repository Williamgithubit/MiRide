import React, { useState } from "react";
import Modal from "../../shared/Modal";
import { useAddCarMutation } from "../../../../store/Car/carApi";
import toast from "react-hot-toast";

interface CreateCarData {
  name: string;
  make: string;
  model: string;
  year: number;
  rentalPricePerDay: number;
  seats: number;
  fuelType: string;
  location: string;
  features: string[];
  imageUrl: string;
}

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarAdded?: () => void;
}

const AddCarModal: React.FC<AddCarModalProps> = ({
  isOpen,
  onClose,
  onCarAdded,
}) => {
  const [formData, setFormData] = useState<CreateCarData>({
    name: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    rentalPricePerDay: 0,
    seats: 5,
    fuelType: "Petrol",
    location: "",
    features: [],
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [addCar] = useAddCarMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" || name === "rentalPricePerDay" || name === "seats"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate car name if not provided
      const carName =
        formData.name || `${formData.year} ${formData.make} ${formData.model}`;

      const carData = {
        ...formData,
        name: carName,
      };

      await addCar(carData).unwrap();
      toast.success("Car added successfully!");

      // Reset form
      setFormData({
        name: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        rentalPricePerDay: 0,
        seats: 5,
        fuelType: "Petrol",
        location: "",
        features: [],
        imageUrl: "",
      });

      onCarAdded?.();
      onClose();
    } catch (error) {
      console.error("Error adding car:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add car");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    } 
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Car" size="lg">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Make</label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="Toyota"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="Camry"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="2023"
              min="1900"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Seats</label>
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="5"
              min="2"
              max="8"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Daily Rate ($)
            </label>
            <input
              type="number"
              name="rentalPricePerDay"
              value={formData.rentalPricePerDay}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="45"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="Downtown"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fuel Type</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Car Name (Optional)
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="Will auto-generate if empty"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Image URL (Optional)
          </label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            placeholder="https://example.com/car-image.jpg"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            )}
            {isLoading ? "Adding..." : "Add Car"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCarModal;
