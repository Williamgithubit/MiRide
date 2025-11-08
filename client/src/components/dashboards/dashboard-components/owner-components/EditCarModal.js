import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUpdateCarMutation } from "../../../../store/Car/carApi";
import toast from "react-hot-toast";
const EditCarModal = ({ isOpen, onClose, car, onCarUpdated, }) => {
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        rentalPricePerDay: 0,
        seats: 5,
        fuelType: "Petrol",
        location: "",
        features: [],
        imageUrl: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updateCar] = useUpdateCarMutation();
    useEffect(() => {
        if (car) {
            setFormData({
                name: car.name || "",
                brand: car.brand || "",
                model: car.model || "",
                year: car.year || new Date().getFullYear(),
                rentalPricePerDay: car.rentalPricePerDay || 0,
                seats: car.seats || 5,
                fuelType: car.fuelType || "Petrol",
                location: car.location || "",
                features: car.features || [],
                imageUrl: car.imageUrl || "",
            });
        }
    }, [car]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "year" || name === "rentalPricePerDay" || name === "seats"
                ? parseInt(value) || 0
                : name === "fuelType"
                    ? value
                    : value,
        }));
    };
    const handleFeaturesChange = (e) => {
        const features = e.target.value
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f);
        setFormData((prev) => ({ ...prev, features }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name ||
            !formData.brand ||
            !formData.model ||
            !formData.rentalPricePerDay) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsSubmitting(true);
        try {
            await updateCar({ id: car.id, ...formData }).unwrap();
            toast.success("Car updated successfully!");
            onCarUpdated();
            onClose();
        }
        catch (error) {
            console.error("Error updating car:", error);
            toast.error("Failed to update car. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-4 sm:mb-6", children: [_jsx("h2", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white", children: "Edit Car" }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1", children: _jsx(X, { className: "w-5 h-5 sm:w-6 sm:h-6" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Car Name *" }), _jsx("input", { type: "text", name: "name", value: formData.name, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Brand *" }), _jsx("input", { type: "text", name: "brand", value: formData.brand, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Model *" }), _jsx("input", { type: "text", name: "model", value: formData.model, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Year *" }), _jsx("input", { type: "number", name: "year", value: formData.year, onChange: handleInputChange, min: "1900", max: new Date().getFullYear() + 1, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Daily Rate ($) *" }), _jsx("input", { type: "number", name: "rentalPricePerDay", value: formData.rentalPricePerDay, onChange: handleInputChange, min: "1", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Seats" }), _jsxs("select", { name: "seats", value: formData.seats, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: 2, children: "2 Seats" }), _jsx("option", { value: 4, children: "4 Seats" }), _jsx("option", { value: 5, children: "5 Seats" }), _jsx("option", { value: 7, children: "7 Seats" }), _jsx("option", { value: 8, children: "8 Seats" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Fuel Type" }), _jsxs("select", { name: "fuelType", value: formData.fuelType, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: "Petrol", children: "Petrol" }), _jsx("option", { value: "Diesel", children: "Diesel" }), _jsx("option", { value: "Electric", children: "Electric" }), _jsx("option", { value: "Hybrid", children: "Hybrid" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Location" }), _jsx("input", { type: "text", name: "location", value: formData.location, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", placeholder: "e.g., Downtown, Airport" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Image URL" }), _jsx("input", { type: "url", name: "imageUrl", value: formData.imageUrl, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", placeholder: "https://example.com/car-image.jpg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Features (comma-separated)" }), _jsx("textarea", { value: formData.features.join(", "), onChange: handleFeaturesChange, rows: 3, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", placeholder: "e.g., GPS, Bluetooth, Air Conditioning, Leather Seats" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-end gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 order-2 sm:order-1", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2", children: isSubmitting ? "Updating..." : "Update Car" })] })] })] }) }));
};
export default EditCarModal;
