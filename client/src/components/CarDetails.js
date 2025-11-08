import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import toast from "react-hot-toast";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { useGetCarByIdQuery } from "../store/Car/carApi";
import useRentals from "../store/hooks/useRentals";
const CarDetails = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useReduxAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isRenting, setIsRenting] = useState(false);
    // Fetch car by ID directly from API
    const { data: carData, isLoading: isLoadingCar, error: carError, } = useGetCarByIdQuery(parseInt(carId || "0"), {
        skip: !carId,
    });
    const { addRental } = useRentals();
    // Helper function to get image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl)
            return "/car-placeholder.jpg";
        if (imageUrl.startsWith('http'))
            return imageUrl;
        if (imageUrl.startsWith('/uploads'))
            return `http://localhost:3000${imageUrl}`;
        return imageUrl;
    };
    // Get car images array
    const carImages = React.useMemo(() => {
        if (!carData)
            return [];
        // If car has images array, use those
        if (carData.images && Array.isArray(carData.images) && carData.images.length > 0) {
            // Create a copy of the array before sorting to avoid mutating the original
            return [...carData.images]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((img) => getImageUrl(img.imageUrl));
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
        if (!car)
            return;
        // Redirect to booking flow instead of directly renting
        navigate(`/booking/${car.id}`);
    };
    const handleMessageOwner = () => {
        toast("Messaging feature coming soon!", {
            icon: "ℹ️",
            duration: 3000,
        });
    };
    if (isLoadingCar) {
        return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx("div", { className: "flex justify-center items-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" }) })] }));
    }
    if (carError) {
        console.error("Error fetching car:", carError);
        console.error("Error details:", JSON.stringify(carError, null, 2));
        return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Error loading car details" }), _jsx("p", { className: "text-gray-600 mb-4", children: carError?.data?.message || carError?.message || "Failed to load car information" }), _jsxs("details", { className: "mt-4 text-sm text-gray-500", children: [_jsx("summary", { className: "cursor-pointer", children: "Technical Details" }), _jsx("pre", { className: "mt-2 p-4 bg-gray-100 rounded overflow-auto max-w-2xl", children: JSON.stringify(carError, null, 2) })] }), _jsx("button", { onClick: () => navigate("/browse-cars"), className: "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4", children: "Back to Browse Cars" })] })] }));
    }
    if (!carData) {
        return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Car not found" }), _jsx("button", { onClick: () => navigate("/browse-cars"), className: "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Back to Browse Cars" })] })] }));
    }
    // Map car data to display format
    const car = carData;
    const features = [
        "Air Conditioning",
        "Bluetooth",
        "USB Charging",
        "Backup Camera",
        "Automatic Transmission",
        "Power Windows",
        "GPS Navigation",
        "Premium Sound System",
    ];
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
    return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsxs("div", { className: "bg-gray-50 min-h-screen pt-16", children: [_jsx("div", { className: "max-w-6xl mx-auto px-4 py-4", children: _jsxs("button", { onClick: () => navigate("/browse-cars"), className: "flex items-center text-blue-600 hover:text-blue-800 font-medium", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Back to Browse"] }) }), _jsx("div", { className: "max-w-6xl mx-auto px-4 pb-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-lg overflow-hidden", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: carImages[currentImageIndex] || "/car-placeholder.jpg", alt: `${car.brand} ${car.model}`, className: "w-full h-96 object-cover", onError: (e) => {
                                                                e.target.src = "/car-placeholder.jpg";
                                                            } }), _jsx("button", { onClick: () => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : carImages.length - 1), className: "absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("button", { onClick: () => setCurrentImageIndex(prev => prev < carImages.length - 1 ? prev + 1 : 0), className: "absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) }), _jsxs("div", { className: "absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm", children: [currentImageIndex + 1, " / ", carImages.length] })] }), _jsx("div", { className: "p-4 flex gap-2 overflow-x-auto", children: carImages.map((image, index) => (_jsx("button", { onClick: () => setCurrentImageIndex(index), className: `flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${currentImageIndex === index ? "border-blue-500" : "border-gray-200"}`, children: _jsx("img", { src: image, alt: `View ${index + 1}`, className: "w-full h-full object-cover" }) }, index))) })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 mt-6", children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: [car.brand, " ", car.model, " (", car.year, ")"] }), car.isAvailable ? (_jsxs("div", { className: "inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full mb-4", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }), "Instant Book"] })) : (_jsxs("div", { className: "inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full mb-4", children: [_jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full mr-2" }), "Not Available"] })), _jsxs("div", { className: "grid grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "text-center p-4 bg-gray-50 rounded-lg", children: [_jsx("svg", { className: "w-8 h-8 mx-auto mb-2 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) }), _jsx("div", { className: "font-semibold text-gray-900", children: car.seats }), _jsx("div", { className: "text-sm text-gray-500", children: "Seats" })] }), _jsxs("div", { className: "text-center p-4 bg-gray-50 rounded-lg", children: [_jsx("svg", { className: "w-8 h-8 mx-auto mb-2 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }), _jsx("div", { className: "font-semibold text-gray-900", children: "Gasoline" }), _jsx("div", { className: "text-sm text-gray-500", children: "Fuel" })] }), _jsxs("div", { className: "text-center p-4 bg-gray-50 rounded-lg", children: [_jsx("svg", { className: "w-8 h-8 mx-auto mb-2 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("div", { className: "font-semibold text-gray-900", children: "Sedan" }), _jsx("div", { className: "text-sm text-gray-500", children: "Type" })] }), _jsxs("div", { className: "text-center p-4 bg-gray-50 rounded-lg", children: [_jsx("svg", { className: "w-8 h-8 mx-auto mb-2 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("div", { className: "font-semibold text-gray-900", children: "Automatic" }), _jsx("div", { className: "text-sm text-gray-500", children: "Transmission" })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-3", children: "About This Car" }), _jsx("p", { className: "text-gray-600 leading-relaxed", children: car.description || `Clean and reliable ${car.brand} ${car.model} perfect for city driving and short trips around Monrovia and beyond.` })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-3", children: "Features & Amenities" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: features.map((feature, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mr-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }), _jsx("span", { className: "text-gray-700", children: feature })] }, index))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-4", children: "Recent Reviews" }), _jsx("div", { className: "space-y-4", children: reviews.map((review, index) => (_jsxs("div", { className: "border-b border-gray-200 pb-4 last:border-b-0", children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx("div", { className: "w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3", children: review.name.charAt(0) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: review.name }), _jsxs("div", { className: "flex items-center", children: [[...Array(5)].map((_, i) => (_jsx("svg", { className: `w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`, fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }, i))), _jsx("span", { className: "ml-2 text-sm text-gray-500", children: review.date })] })] })] }), _jsx("p", { className: "text-gray-600", children: review.comment })] }, index))) })] })] })] }), _jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 sticky top-20", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-3xl font-bold text-blue-600", children: ["$", car.rentalPricePerDay] }), _jsx("div", { className: "text-gray-500", children: "/day" })] }), _jsx("div", { className: "text-right", children: _jsx("div", { className: "text-green-600 font-semibold", children: "Available" }) })] }), _jsx("button", { onClick: handleRentCar, disabled: !car.isAvailable || isRenting, className: `w-full py-4 rounded-lg font-semibold text-lg mb-4 transition-all duration-200 ${!car.isAvailable || isRenting
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"}`, children: isRenting ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Processing..."] })) : car.isAvailable ? ("Book This Car Now") : ("Not Available") }), _jsxs("button", { onClick: handleMessageOwner, className: "w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 mb-6", children: [_jsx("svg", { className: "w-5 h-5 inline mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), "Message Owner"] }), _jsxs("div", { className: "border-t pt-6", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-3", children: "Meet Your Host" }), _jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3", children: "JK" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: "James Kollie" }), _jsxs("div", { className: "flex items-center text-sm text-gray-500", children: [_jsx("svg", { className: "w-4 h-4 text-yellow-400 mr-1", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }), "4.9 rating"] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: "3" }), _jsx("div", { className: "text-sm text-gray-500", children: "Cars Listed" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: "156" }), _jsx("div", { className: "text-sm text-gray-500", children: "Trips Completed" })] })] }), _jsx("div", { className: "mt-4 text-sm text-gray-600", children: "Response time: 2 hours" }), _jsxs("div", { className: "mt-2 text-xs text-gray-500 flex items-center", children: [_jsx("svg", { className: "w-4 h-4 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }), "Protected by RideShare LR"] })] })] }) })] }) })] })] }));
};
export default CarDetails;
