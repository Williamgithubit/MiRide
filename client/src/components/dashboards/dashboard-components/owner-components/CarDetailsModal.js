import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import Modal from '../../shared/Modal';
const CarDetailsModal = ({ isOpen, onClose, selectedCar }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Helper function to get image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl)
            return '/placeholder-car.jpg';
        if (imageUrl.startsWith('http'))
            return imageUrl;
        if (imageUrl.startsWith('/uploads'))
            return `http://localhost:3000${imageUrl}`;
        return imageUrl;
    };
    // Get car images array
    const carImages = useMemo(() => {
        if (!selectedCar)
            return [];
        // If car has images array, use those
        if (selectedCar.images && Array.isArray(selectedCar.images) && selectedCar.images.length > 0) {
            // Create a copy of the array before sorting to avoid mutating the original
            return [...selectedCar.images]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((img) => getImageUrl(img.imageUrl));
        }
        // Fallback to imageUrl if available
        if (selectedCar.imageUrl) {
            return [getImageUrl(selectedCar.imageUrl)];
        }
        return ['/placeholder-car.jpg'];
    }, [selectedCar]);
    // Reset image index when modal opens with new car
    React.useEffect(() => {
        setCurrentImageIndex(0);
    }, [selectedCar]);
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Car Details", size: "lg", children: selectedCar && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: carImages[currentImageIndex] || '/placeholder-car.jpg', alt: selectedCar.model, className: "w-full h-32 sm:h-48 object-cover rounded-lg", onError: (e) => {
                                e.target.src = '/placeholder-car.jpg';
                            } }), carImages.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : carImages.length - 1), className: "absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white shadow-md", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("button", { onClick: () => setCurrentImageIndex(prev => prev < carImages.length - 1 ? prev + 1 : 0), className: "absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white shadow-md", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) }), _jsxs("div", { className: "absolute bottom-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs", children: [currentImageIndex + 1, " / ", carImages.length] })] }))] }), carImages.length > 1 && (_jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: carImages.map((image, index) => (_jsx("button", { onClick: () => setCurrentImageIndex(index), className: `flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'}`, children: _jsx("img", { src: image, alt: `View ${index + 1}`, className: "w-full h-full object-cover" }) }, index))) })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Make & Model" }), _jsxs("p", { className: "font-medium", children: [selectedCar.year, " ", selectedCar.brand, " ", selectedCar.model] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Car Name" }), _jsx("p", { className: "font-medium", children: selectedCar.name })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Daily Rate" }), _jsxs("p", { className: "font-medium", children: ["$", selectedCar.rentalPricePerDay] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Status" }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${selectedCar.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: selectedCar.isAvailable ? 'Available' : 'Unavailable' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Location" }), _jsx("p", { className: "font-medium", children: selectedCar.location })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Seats" }), _jsx("p", { className: "font-medium", children: selectedCar.seats })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Fuel Type" }), _jsx("p", { className: "font-medium", children: selectedCar.fuelType })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Rating" }), _jsxs("p", { className: "font-medium", children: ["\u2B50 ", selectedCar.rating
                                            ? (typeof selectedCar.rating === 'number' ? selectedCar.rating : parseFloat(selectedCar.rating) || 0).toFixed(1)
                                            : '0.0'] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Reviews" }), _jsx("p", { className: "font-medium", children: selectedCar.reviews || 0 })] })] })] })) }));
};
export default CarDetailsModal;
