import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState, Suspense } from "react";
import CarList from "./CarList";
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
        if (typeof window === "undefined")
            return;
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
const BrowseCars = () => {
    const [cars, setCars] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedCarForBooking, setSelectedCarForBooking] = useState(null);
    const { width, height } = useWindowSize();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useReduxAuth();
    const pageSize = 12; // Number of items per page
    // Use Redux hooks for cars and rentals with pagination
    const { cars: carData, pagination, isLoading: isLoadingCars, error: carsError, } = useCars({
        page: currentPage,
        limit: pageSize,
    });
    const { rentals: rentalData, isLoading: isLoadingRentals, error: rentalsError, } = useRentals();
    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    useEffect(() => {
        // Set cars from Redux state with pagination
        if (carData) {
            const mappedCars = carData.map((car) => {
                // Extract the primary image or first image from the images array
                let primaryImage = null;
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
                    description: car.description ||
                        `${car.year || ""} ${car.brand || ""} ${car.model || ""}`.trim(),
                    imageUrl: primaryImage, // Add the extracted image URL
                };
            });
            setCars(mappedCars);
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
        }
        else {
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
    const handleRentCar = async (carId) => {
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
        const hasAlreadyRented = rentalData?.some((rental) => rental.carId === Number(carId) && rental.customerId === user.id);
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
        ? rentals.filter((rental) => rental.customerId.toString() === user.id.toString())
        : [];
    return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx("section", { className: "bg-gradient-to-r from-green-600 to-green-800 text-white py-16 px-4 mt-12", children: _jsxs("div", { className: "max-w-6xl mx-auto text-center", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4", children: "Get the Ride That Suits You" }), _jsx("p", { className: "text-xl mb-8 text-blue-100", children: "Choose from our wide selection of clean, reliable vehicles across Liberia" }), _jsxs("div", { className: "flex justify-center items-center gap-8 md:gap-16 mb-8", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl md:text-4xl font-bold", children: [cars.length, "+"] }), _jsx("div", { className: "text-blue-200 text-sm", children: "Cars Available" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold", children: "15+" }), _jsx("div", { className: "text-blue-200 text-sm", children: "Locations" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold", children: "4.8" }), _jsx("div", { className: "text-blue-200 text-sm", children: "Average Rating" })] })] })] }) }), _jsx("section", { className: "bg-white py-6 px-4 shadow-sm", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-center justify-between", children: [_jsx("div", { className: "flex-1 max-w-md", children: _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Search by make or model...", className: "w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), _jsx("svg", { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) })] }) }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("select", { className: "px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "sedan", children: "Sedan" }), _jsx("option", { value: "suv", children: "SUV" }), _jsx("option", { value: "hatchback", children: "Hatchback" })] }), _jsxs("select", { className: "px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "petrol", children: "Petrol" }), _jsx("option", { value: "electric", children: "Electric" }), _jsx("option", { value: "hybrid", children: "Hybrid" })] })] })] }), _jsx("div", { className: "mt-4", children: _jsxs("p", { className: "text-gray-600", children: ["Found ", cars.length, " vehicles available"] }) })] }) }), _jsx("section", { className: "py-8 px-4 bg-gray-50 min-h-screen", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx(ErrorBoundary, { children: _jsx(CarList, { cars: cars, onRent: handleRentCar, onViewDetails: (carId) => navigate(`/car-details/${carId}`), isLoading: isLoading, isAuthenticated: isAuthenticated }) }), !isLoading && cars.length > 0 && (_jsx("div", { className: "mt-8 flex justify-center", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handlePageChange(1), disabled: currentPage === 1, className: "px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50", children: "\u00AB" }), _jsx("button", { onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 1, className: "px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50", children: "\u2039" }), Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                }
                                                else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                }
                                                else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                }
                                                else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (_jsx("button", { onClick: () => handlePageChange(pageNum), className: `px-3 py-1 rounded-md ${currentPage === pageNum
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-200 hover:bg-gray-300"}`, children: pageNum }, pageNum));
                                            }), _jsx("button", { onClick: () => handlePageChange(currentPage + 1), disabled: currentPage === totalPages, className: "px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50", children: "\u203A" }), _jsx("button", { onClick: () => handlePageChange(totalPages), disabled: currentPage === totalPages, className: "px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50", children: "\u00BB" })] }) }))] }), user && userRentals.length > 0 && (_jsxs("div", { className: "mt-12", children: [_jsx("h3", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Your Rental History" }), _jsx("ul", { className: "space-y-3", children: userRentals.map((rental) => {
                                        const rentedCar = cars.find((car) => car.id === rental.carId);
                                        return (_jsxs("li", { className: "p-4 bg-white shadow rounded", children: [_jsxs("p", { children: [_jsx("strong", { children: "Car:" }), " ", rentedCar?.name || "N/A"] }), _jsxs("p", { children: [_jsx("strong", { children: "From:" }), " ", rental.startDate, " \u00A0", _jsx("strong", { children: "To:" }), " ", rental.endDate] })] }, rental.id));
                                    }) })] }))] }) }), showConfetti && (_jsx(Confetti, { width: width, height: height, recycle: false, numberOfPieces: 500 })), _jsx(BookingModal, { isOpen: showBookingModal, onClose: handleCloseBookingModal, selectedCar: selectedCarForBooking }), _jsx(Suspense, { fallback: null, children: showLoginModal && (_jsx(Modal, { isOpen: showLoginModal, onRequestClose: () => setShowLoginModal(false), contentLabel: "Login Required", className: "modal", overlayClassName: "modal-overlay", children: _jsxs("div", { className: "bg-white p-6 rounded-lg max-w-md w-full mx-auto mt-20", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Login Required" }), _jsx("p", { className: "mb-6", children: "You need to be logged in to rent a car." }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx("button", { onClick: () => setShowLoginModal(false), className: "px-4 py-2 bg-gray-200 rounded hover:bg-gray-300", children: "Cancel" }), _jsx("button", { onClick: () => navigate("/login"), className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Go to Login" })] })] }) })) })] }));
};
Modal.setAppElement("#root");
export default BrowseCars;
