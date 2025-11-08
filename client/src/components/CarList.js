import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { useAppDispatch } from "../store/hooks";
import toast from "react-hot-toast";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { useToggleLikeMutation } from "../store/Car/carApi";
const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price || 0);
};
const CarList = ({ cars = [], onRent, onLike, onViewDetails, isLoading = false, isAuthenticated = false, }) => {
    const dispatch = useAppDispatch();
    const [loadingCarId, setLoadingCarId] = useState(null);
    const [imageErrors, setImageErrors] = useState({});
    const [likedCars, setLikedCars] = useState({});
    const [toggleLike] = useToggleLikeMutation();
    // Move useReduxAuth to the top with other hooks
    const auth = useReduxAuth();
    const isOwner = auth?.user?.role === "owner";
    // Initialize liked cars from props with safety checks
    useEffect(() => {
        if (!Array.isArray(cars) || cars.length === 0) {
            setLikedCars({});
            return;
        }
        const initialLikes = cars.reduce((acc, car) => {
            if (car && typeof car.id === 'number') {
                return {
                    ...acc,
                    [car.id]: car.isLiked || false,
                };
            }
            return acc;
        }, {});
        setLikedCars(initialLikes);
    }, [cars]);
    const handleImageError = useCallback((carId) => {
        setImageErrors((prev) => ({ ...prev, [carId]: true }));
    }, []);
    const handleLikeClick = useCallback(async (carId, e) => {
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
            }
            else {
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
        }
        catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Failed to update like status");
        }
        finally {
            setLoadingCarId(null);
        }
    }, [isAuthenticated, onLike, toggleLike]);
    const handleRentClick = useCallback(async (carId) => {
        if (!isAuthenticated) {
            toast.error("Please log in to rent a car");
            return;
        }
        try {
            setLoadingCarId(carId);
            await onRent(carId);
            toast.success("Car rented successfully");
        }
        catch (error) {
            console.error("Error renting car:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to process rental";
            toast.error(errorMessage);
        }
        finally {
            setLoadingCarId(null);
        }
    }, [isAuthenticated, onRent]);
    const getCarImageUrl = (car) => {
        if (car.id && imageErrors[car.id]) {
            const searchTerm = `${car.make || "car"} ${car.model || ""}`.trim();
            return `https://source.unsplash.com/random/300x200/?${encodeURIComponent(searchTerm)}`;
        }
        // If car has imageUrl, handle it properly
        if (car.imageUrl) {
            // If it's already a full URL, return as is
            if (car.imageUrl.startsWith('http')) {
                return car.imageUrl;
            }
            // If it's a relative path starting with /uploads, prepend the API server URL
            if (car.imageUrl.startsWith('/uploads')) {
                return `http://localhost:3000${car.imageUrl}`;
            }
            // Otherwise, return as is (might be a data URL or other format)
            return car.imageUrl;
        }
        return "/car-placeholder.jpg";
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex justify-center items-center min-h-[300px]", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" }) }));
    }
    if (!Array.isArray(cars) || cars.length === 0) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[300px] p-4 text-center", children: [_jsx("svg", { className: "h-16 w-16 text-gray-400 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M20 7l-8-4.5L4 7m16 0l-8 4.5M4 7v9.5l8 4.5m0-14l8 4.5M4 16.5l8 4.5 8-4.5m-16-9l8-4.5" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-700", children: "No cars available" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Check back later for new arrivals" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", {}), isOwner && (_jsx("button", { onClick: () => window.dispatchEvent(new CustomEvent("open-add-car-modal")), className: "px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-700", children: "+ Add New Vehicle" }))] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: cars.map((car) => (_jsxs("article", { className: "bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: getCarImageUrl(car) || "/car-placeholder.jpg", alt: `${car.make} ${car.model}`, className: "w-full h-56 object-cover", onError: () => handleImageError(car.id) }), car.isAvailable ? (_jsx("div", { className: "absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full", children: "Available" })) : (_jsx("div", { className: "absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full", children: "Rented" })), _jsx("button", { onClick: (e) => handleLikeClick(car.id, e), className: "absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200", "aria-label": likedCars[car.id] ? "Unlike this car" : "Like this car", disabled: loadingCarId === car.id, children: _jsx("svg", { className: `w-5 h-5 ${likedCars[car.id]
                                            ? "text-red-500 fill-current"
                                            : "text-gray-400"}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" }) }) })] }), _jsxs("div", { className: "p-6 flex flex-col flex-grow", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-bold text-gray-900 mb-1", children: [car.make, " ", car.model] }), _jsx("p", { className: "text-gray-500 text-sm font-medium", children: car.year })] }), car.rating !== undefined && car.reviews !== undefined && (_jsxs("div", { className: "flex items-center bg-yellow-50 px-2 py-1 rounded-lg", children: [_jsx("svg", { className: "w-4 h-4 text-yellow-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }), _jsx("span", { className: "ml-1 text-gray-700 font-semibold text-sm", children: Number(car.rating || 0).toFixed(1) })] }))] }), _jsxs("div", { className: "flex items-center justify-between mb-4 py-3 px-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) }), _jsx("span", { className: "text-sm font-medium", children: car.seats })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }), _jsx("span", { className: "text-sm font-medium", children: car.fuelType })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("span", { className: "text-sm font-medium", children: "Automatic" })] })] }), car.location && (_jsxs("div", { className: "flex items-center text-gray-500 mb-4", children: [_jsxs("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })] }), _jsx("span", { className: "text-sm", children: car.location })] })), _jsxs("div", { className: "mt-auto", children: [_jsx("div", { className: "flex justify-between items-center mb-4", children: _jsxs("div", { children: [_jsxs("span", { className: "text-3xl font-bold text-blue-600", children: ["$", car.rentalPricePerDay] }), _jsx("span", { className: "text-gray-500 text-sm", children: "/day" })] }) }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: () => onViewDetails && onViewDetails(car.id), className: "w-full px-2 py-3 bg-green-900 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200", children: "View Details" }) })] })] })] }, car.id))) })] }));
};
export default CarList;
