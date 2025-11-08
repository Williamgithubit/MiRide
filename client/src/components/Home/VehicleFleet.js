import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Star, Users, Fuel, Settings } from 'lucide-react';
const VehicleFleet = () => {
    const vehicles = [
        {
            id: 1,
            name: 'Jeep Wrangler',
            category: 'SUV',
            image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            rating: 4.8,
            reviews: 124,
            passengers: 5,
            transmission: 'Manual',
            fuel: 'Gasoline',
            pricePerDay: 89,
            features: ['4WD', 'GPS', 'Bluetooth']
        },
        {
            id: 2,
            name: 'BMW 3 Series',
            category: 'Sedan',
            image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            rating: 4.9,
            reviews: 89,
            passengers: 5,
            transmission: 'Automatic',
            fuel: 'Gasoline',
            pricePerDay: 124,
            features: ['Luxury', 'GPS', 'Premium Audio']
        },
        {
            id: 3,
            name: 'Ferrari 458',
            category: 'Sports',
            image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            rating: 5.0,
            reviews: 67,
            passengers: 2,
            transmission: 'Manual',
            fuel: 'Gasoline',
            pricePerDay: 299,
            features: ['Sport Mode', 'Premium Interior', 'High Performance']
        }
    ];
    return (_jsx("section", { className: "py-20 bg-gray-50 w-full", children: _jsxs("div", { className: "w-full px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12 sm:mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4", children: "Our Vehicle Fleet" }), _jsx("p", { className: "text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4", children: "Choose from our premium collection of vehicles, each maintained to the highest standards for your comfort and safety." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: vehicles.map((vehicle) => (_jsxs("div", { className: "bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden", children: [_jsxs("div", { className: "relative h-48 overflow-hidden", children: [_jsx("img", { src: vehicle.image, alt: vehicle.name, className: "w-full h-full object-cover transition-transform duration-300 hover:scale-110" }), _jsx("div", { className: "absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold", children: vehicle.category }), _jsxs("div", { className: "absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1", children: [_jsx(Star, { className: "h-4 w-4 text-yellow-400 fill-current" }), _jsx("span", { className: "text-sm font-semibold", children: vehicle.rating })] })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-1", children: vehicle.name }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Star, { className: "h-4 w-4 text-yellow-400 fill-current mr-1" }), _jsxs("span", { children: [vehicle.rating, " (", vehicle.reviews, " reviews)"] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-4 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-1 text-gray-600", children: [_jsx(Users, { className: "h-4 w-4" }), _jsx("span", { children: vehicle.passengers })] }), _jsxs("div", { className: "flex items-center space-x-1 text-gray-600", children: [_jsx(Settings, { className: "h-4 w-4" }), _jsx("span", { children: vehicle.transmission })] }), _jsxs("div", { className: "flex items-center space-x-1 text-gray-600", children: [_jsx(Fuel, { className: "h-4 w-4" }), _jsx("span", { children: vehicle.fuel })] })] }), _jsx("div", { className: "mb-4", children: _jsx("div", { className: "flex flex-wrap gap-2", children: vehicle.features.map((feature, index) => (_jsx("span", { className: "bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium", children: feature }, index))) }) }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-2xl font-bold text-green-600", children: ["$", vehicle.pricePerDay] }), _jsx("span", { className: "text-gray-600 text-sm", children: "/day" })] }), _jsx("button", { className: "bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold", children: "Rent Now" })] })] })] }, vehicle.id))) }), _jsx("div", { className: "text-center mt-12", children: _jsx("button", { className: "bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold", children: "View All Vehicles" }) })] }) }));
};
export default VehicleFleet;
