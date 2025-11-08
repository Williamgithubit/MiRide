import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { useGetCarsQuery, useGetCarByIdQuery } from "../../store/Car/carApi";
import { useGetRentalsQuery } from "../../store/Rental/rentalApi";
import { loginStart, loginSuccess, loginFailure, logout, } from "../../store/Auth/authSlice";
import { useLoginMutation } from "../../store/Auth/authApi";
const ReduxExample = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);
    const [carId, setCarId] = useState(null);
    // RTK Query hooks
    const { data: cars, isLoading: carsLoading, error: carsError, } = useGetCarsQuery();
    const { data: car } = useGetCarByIdQuery(carId || 0, { skip: !carId });
    const { data: rentals } = useGetRentalsQuery();
    // Login mutation hook
    const [login, { isLoading: isLoggingIn }] = useLoginMutation();
    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            dispatch(loginStart());
            const result = await login({ email, password }).unwrap();
            // Transform the API response to match the expected AnyUser type
            dispatch(loginSuccess({
                token: result.token,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    phone: result.user.phone || "", // Add a default value since the API doesn't provide this
                    role: result.user.role,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            }));
        }
        catch (error) {
            dispatch(loginFailure(error instanceof Error ? error.message : "Login failed"));
        }
    };
    const handleLogout = () => {
        dispatch(logout());
    };
    const handleSelectCar = (id) => {
        setCarId(id);
    };
    return (_jsxs("div", { className: "container mx-auto p-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Redux Example" }), _jsxs("div", { className: "bg-white shadow-md rounded p-4 mb-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Authentication" }), auth.isAuthenticated ? (_jsxs("div", { children: [_jsxs("p", { className: "mb-2", children: ["Logged in as:", " ", _jsx("span", { className: "font-medium", children: auth.user?.email })] }), _jsx("button", { onClick: handleLogout, className: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600", children: "Logout" })] })) : (_jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block mb-1", children: "Email" }), _jsx("input", { type: "email", id: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full border rounded px-3 py-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block mb-1", children: "Password" }), _jsx("input", { type: "password", id: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full border rounded px-3 py-2", required: true })] }), _jsx("button", { type: "submit", disabled: isLoggingIn, className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300", children: isLoggingIn ? "Logging in..." : "Login" }), auth.error && _jsx("p", { className: "text-red-500", children: auth.error })] }))] }), _jsxs("div", { className: "bg-white shadow-md rounded p-4 mb-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Cars" }), carsLoading ? (_jsx("p", { children: "Loading cars..." })) : carsError ? (_jsx("p", { className: "text-red-500", children: "Error loading cars" })) : (_jsx("div", { children: _jsx("ul", { className: "divide-y", children: cars?.map((car) => (_jsx("li", { className: "py-2", children: _jsxs("button", { onClick: () => handleSelectCar(Number(car.id)), className: "text-left w-full hover:bg-gray-100 p-2 rounded", children: [_jsxs("span", { className: "font-medium", children: [car.name, " ", car.model, " (", car.year, ")"] }), _jsxs("span", { className: "ml-2 text-sm text-gray-500", children: ["$", car.dailyRate, "/day"] }), _jsx("span", { className: `ml-2 text-sm ${car.isAvailable ? "text-green-500" : "text-red-500"}`, children: car.isAvailable ? "Available" : "Unavailable" })] }) }, car.id))) }) }))] }), car && (_jsxs("div", { className: "bg-white shadow-md rounded p-4 mb-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Car Details" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Make:" }), _jsx("p", { className: "font-medium", children: car.name })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Model:" }), _jsx("p", { className: "font-medium", children: car.model })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Year:" }), _jsx("p", { className: "font-medium", children: car.year })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Color:" }), _jsx("p", { className: "font-medium", children: car.color })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "License Plate:" }), _jsx("p", { className: "font-medium", children: car.licensePlate })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Daily Rate:" }), _jsxs("p", { className: "font-medium", children: ["$", car.dailyRate] })] })] })] })), _jsxs("div", { className: "bg-white shadow-md rounded p-4", children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Rentals" }), !rentals ? (_jsx("p", { children: "Loading rentals..." })) : rentals.length === 0 ? (_jsx("p", { children: "No rentals found" })) : (_jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "ID" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Car" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Start Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "End Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Total Cost" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: rentals.map((rental) => (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: rental.id }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: rental.car
                                                ? `${rental.car.name} ${rental.car.model}`
                                                : `Car ID: ${rental.carId}` }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(rental.startDate).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(rental.endDate).toLocaleDateString() }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: ["$", rental.totalCost] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: _jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${rental.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : rental.status === "completed"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : rental.status === "cancelled"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-yellow-100 text-yellow-800"}`, children: rental.status }) })] }, rental.id))) })] }))] })] }));
};
export default ReduxExample;
