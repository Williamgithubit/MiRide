import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import toast from "react-hot-toast";
import useReduxAuth from "../store/hooks/useReduxAuth";
import useCars from "../store/hooks/useCars";
import useRentals from "../store/hooks/useRentals";
const BookingFlow = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useReduxAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { cars, isLoading: isLoadingCars } = useCars({});
    const { addRental } = useRentals();
    const [bookingData, setBookingData] = useState({
        carId: parseInt(carId || "0"),
        startDate: "",
        endDate: "",
        totalDays: 0,
        totalPrice: 0,
        paymentMethod: "credit-card",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
    });
    const car = cars?.find((c) => c.id === parseInt(carId || "0"));
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Please log in to book a car");
            navigate("/login");
            return;
        }
        if (!carId || !car) {
            toast.error("Car not found");
            navigate("/browse-cars");
            return;
        }
    }, [isAuthenticated, carId, car, navigate]);
    useEffect(() => {
        if (bookingData.startDate && bookingData.endDate && car) {
            const start = new Date(bookingData.startDate);
            const end = new Date(bookingData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Get the daily rate from multiple possible properties
            const dailyRate = car.rentalPricePerDay || car.dailyRate || car.dailyRate || 0;
            setBookingData(prev => ({
                ...prev,
                totalDays: diffDays,
                totalPrice: diffDays * dailyRate,
            }));
        }
    }, [bookingData.startDate, bookingData.endDate, car]);
    const handleInputChange = (field, value) => {
        setBookingData(prev => ({
            ...prev,
            [field]: value,
        }));
    };
    const validateStep1 = () => {
        if (!bookingData.startDate || !bookingData.endDate) {
            toast.error("Please select both start and end dates");
            return false;
        }
        const startDate = new Date(bookingData.startDate);
        const endDate = new Date(bookingData.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
            toast.error("Start date cannot be in the past");
            return false;
        }
        if (endDate <= startDate) {
            toast.error("End date must be after start date");
            return false;
        }
        return true;
    };
    const validateStep2 = () => {
        // No validation needed for step 2 since we're redirecting to Stripe
        return true;
    };
    const handleNext = () => {
        if (currentStep === 1 && !validateStep1())
            return;
        if (currentStep === 2 && !validateStep2())
            return;
        // Log booking data when moving from step 2 to step 3
        if (currentStep === 2) {
            console.log('Booking Data to be sent to server:', {
                carId: bookingData.carId,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                totalDays: bookingData.totalDays,
                totalPrice: bookingData.totalPrice,
                selectedCar: car
            });
        }
        setCurrentStep(prev => prev + 1);
    };
    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await addRental({
                carId: bookingData.carId,
                customerId: parseInt(user?.id || "0"),
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
            });
            toast.success("Booking confirmed successfully!");
            setTimeout(() => {
                navigate("/browse-cars");
            }, 2000);
        }
        catch (error) {
            toast.error("Failed to confirm booking");
            console.error(error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || "";
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(" ");
        }
        else {
            return v;
        }
    };
    if (isLoadingCars) {
        return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx("div", { className: "flex justify-center items-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" }) })] }));
    }
    if (!car) {
        return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx("div", { className: "flex justify-center items-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Car Not Found" }), _jsx("button", { onClick: () => navigate("/browse-cars"), className: "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700", children: "Back to Browse Cars" })] }) })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx("div", { className: "min-h-screen bg-gray-50 py-8 px-4 mt-16", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800", children: "Book Your Ride" }), _jsxs("span", { className: "text-sm text-gray-500", children: ["Step ", currentStep, " of 3"] })] }), _jsx("div", { className: "flex items-center", children: [1, 2, 3].map((step) => (_jsxs(React.Fragment, { children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
                                                    ? "bg-green-600 text-white"
                                                    : "bg-gray-200 text-gray-600"}`, children: step }), step < 3 && (_jsx("div", { className: `flex-1 h-1 mx-4 ${step < currentStep ? "bg-green-600" : "bg-gray-200"}` }))] }, step))) }), _jsxs("div", { className: "flex justify-between mt-2 text-sm text-gray-600", children: [_jsx("span", { children: "Select Dates" }), _jsx("span", { children: "Payment" }), _jsx("span", { children: "Confirmation" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [currentStep === 1 && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Select Your Dates" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Start Date" }), _jsx("input", { type: "date", value: bookingData.startDate, onChange: (e) => handleInputChange("startDate", e.target.value), min: new Date().toISOString().split("T")[0], className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "End Date" }), _jsx("input", { type: "date", value: bookingData.endDate, onChange: (e) => handleInputChange("endDate", e.target.value), min: bookingData.startDate || new Date().toISOString().split("T")[0], className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" })] })] }), bookingData.startDate && bookingData.endDate && (_jsxs("div", { className: "mt-6 p-4 bg-green-50 rounded-lg", children: [_jsx("h3", { className: "font-medium text-green-800 mb-2", children: "Rental Summary" }), _jsxs("div", { className: "text-sm text-green-700", children: [_jsxs("p", { children: ["Duration: ", bookingData.totalDays, " days"] }), _jsxs("p", { children: ["Daily Rate: $", car.rentalPricePerDay || car.dailyRate || car.dailyRate || 0, "/day"] }), _jsxs("p", { className: "font-bold", children: ["Total: $", bookingData.totalPrice] })] })] }))] })), currentStep === 2 && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Payment Information" }), _jsx("div", { className: "bg-green-50 p-6 rounded-lg border border-green-200", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("svg", { className: "w-6 h-6 text-green-600 mt-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-green-900 mb-2", children: "Secure Payment with Stripe" }), _jsx("p", { className: "text-green-800 text-sm leading-relaxed", children: "When you click \"Next\", you will be redirected to our secure Stripe checkout page to complete your payment. Your booking details and personal information are protected with industry-standard encryption." })] })] }) })] })), currentStep === 3 && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Confirm Your Booking" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "border-b pb-4", children: [_jsx("h3", { className: "font-medium text-gray-800 mb-2", children: "Rental Details" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("p", { children: ["Start Date: ", new Date(bookingData.startDate).toLocaleDateString()] }), _jsxs("p", { children: ["End Date: ", new Date(bookingData.endDate).toLocaleDateString()] }), _jsxs("p", { children: ["Duration: ", bookingData.totalDays, " days"] })] })] }), _jsxs("div", { className: "border-b pb-4", children: [_jsx("h3", { className: "font-medium text-gray-800 mb-2", children: "Payment Method" }), _jsx("div", { className: "text-sm text-gray-600 space-y-1", children: _jsx("p", { children: "Payment will be processed securely through Stripe" }) })] }), _jsx("div", { className: "bg-green-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium text-green-800", children: "Total Amount" }), _jsxs("span", { className: "text-2xl font-bold text-green-800", children: ["$", bookingData.totalPrice] })] }) })] })] })), _jsxs("div", { className: "flex justify-between mt-8", children: [_jsx("button", { onClick: currentStep === 1 ? () => navigate(-1) : handleBack, className: "px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors", children: currentStep === 1 ? "Cancel" : "Back" }), currentStep < 3 ? (_jsx("button", { onClick: handleNext, className: "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: "Next" })) : (_jsx("button", { onClick: handleSubmit, disabled: isSubmitting, className: "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? "Processing..." : "Confirm Booking" }))] })] }) }), _jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 sticky top-24", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Your Selection" }), _jsxs("div", { className: "space-y-4", children: [_jsx("img", { src: car.imageUrl || "/car-placeholder.jpg", alt: `${car.brand} ${car.model}`, className: "w-full h-32 object-cover rounded-lg" }), _jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-800", children: [car.brand, " ", car.model] }), _jsx("p", { className: "text-sm text-gray-600", children: car.year })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Daily Rate" }), _jsxs("span", { className: "font-medium", children: ["$", car.rentalPricePerDay || car.dailyRate || car.dailyRate || 0] })] }), bookingData.totalDays > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Duration" }), _jsxs("span", { className: "font-medium", children: [bookingData.totalDays, " days"] })] }), _jsx("div", { className: "border-t pt-2", children: _jsxs("div", { className: "flex items-center justify-between font-bold", children: [_jsx("span", { children: "Total" }), _jsxs("span", { className: "text-green-600", children: ["$", bookingData.totalPrice] })] }) })] }))] })] }) })] })] }) })] }));
};
export default BookingFlow;
