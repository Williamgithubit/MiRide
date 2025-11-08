import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Search, MapPin, Star, X, RefreshCw } from 'lucide-react';
import Modal from '../../shared/Modal';
import BookingModal from './BookingModal';
import { useCustomerData } from './useCustomerData';
import { useDispatch } from 'react-redux';
import { carApi } from '../../../../store/Car/carApi';
const BrowseCars = ({ selectedCar, setSelectedCar, showBookingModal, setShowBookingModal }) => {
    const { availableCars, carsData } = useCustomerData();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilters, setSearchFilters] = useState({
        location: '',
        priceRange: 'All Prices',
        carType: 'All Types',
        availability: 'available'
    });
    // Get all cars (not just available ones) for better UX
    const allCars = carsData || [];
    // Filter cars based on search criteria
    const filteredCars = useMemo(() => {
        return allCars.filter(car => {
            // Search term filter (brand, model, year)
            const matchesSearch = searchTerm === '' ||
                car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                car.year?.toString().includes(searchTerm);
            // Location filter
            const matchesLocation = searchFilters.location === '' ||
                car.location?.toLowerCase().includes(searchFilters.location.toLowerCase());
            // Car type filter - since cars don't have 'type' property, treat all as matching when 'All Types' is selected
            // or try to infer type from model/brand for basic filtering
            const matchesCarType = searchFilters.carType === 'All Types' ||
                (() => {
                    if (!car.type && searchFilters.carType !== 'All Types') {
                        // If no type is set, allow all cars to pass through for now
                        // This could be enhanced to infer type from model/brand
                        return true;
                    }
                    return car.type?.toLowerCase() === searchFilters.carType.toLowerCase();
                })();
            // Price range filter - convert string price to number for comparison
            const matchesPriceRange = (() => {
                if (searchFilters.priceRange === 'All Prices') {
                    return true;
                }
                const price = Number(car.rentalPricePerDay) || 0;
                switch (searchFilters.priceRange) {
                    case '$0 - $50':
                        return price >= 0 && price <= 50;
                    case '$50 - $100':
                        return price > 50 && price <= 100;
                    case '$100+':
                        return price > 100;
                    default:
                        return true;
                }
            })();
            // Availability filter
            const matchesAvailability = searchFilters.availability === 'all' ||
                (searchFilters.availability === 'available' && car.isAvailable) ||
                (searchFilters.availability === 'unavailable' && !car.isAvailable);
            return matchesSearch && matchesLocation && matchesCarType && matchesPriceRange && matchesAvailability;
        });
    }, [allCars, searchTerm, searchFilters]);
    const handleSearch = () => {
        // Search is handled automatically by the useMemo hook
        // This function can be used for additional search actions if needed
        console.log('Searching with filters:', { searchTerm, ...searchFilters });
    };
    const clearFilters = () => {
        setSearchTerm('');
        setSearchFilters({
            location: '',
            priceRange: 'All Prices',
            carType: 'All Types',
            availability: 'available'
        });
    };
    const refreshCarList = () => {
        // Invalidate car cache to refresh availability status
        dispatch(carApi.util.invalidateTags([{ type: 'Car', id: 'LIST' }]));
        console.log('Car list refreshed - checking for availability updates');
    };
    const renderCarCard = (car) => {
        const isAvailable = car.isAvailable;
        return (_jsxs("div", { className: `bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${!isAvailable ? 'opacity-75' : ''}`, children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: car.imageUrl, alt: car.model, className: `w-full h-48 object-cover ${!isAvailable ? 'brightness-50' : ''}` }), !isAvailable && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center", children: _jsx("span", { className: "bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg", children: "Currently Booked" }) }))] }), _jsxs("div", { className: "p-4", children: [_jsxs("h3", { className: `text-lg font-semibold ${isAvailable ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`, children: [car.year, " ", car.brand, " ", car.model] }), _jsxs("div", { className: `flex items-center mt-2 text-sm ${isAvailable ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`, children: [_jsx(MapPin, { className: "w-4 h-4 mr-1" }), car.location] }), _jsxs("div", { className: `flex items-center mt-1 text-sm ${isAvailable ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`, children: [_jsx(Star, { className: "w-4 h-4 mr-1 text-yellow-500" }), car.rating, " (", car.reviews || 0, " reviews)"] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsxs("span", { className: `text-2xl font-bold ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`, children: ["$", car.rentalPricePerDay, "/day"] }), !isAvailable && (_jsx("span", { className: "text-sm text-red-600 font-medium", children: "Unavailable" }))] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [_jsx("button", { onClick: () => setSelectedCar(car), className: `flex-1 px-4 py-2 text-sm border rounded-lg transition-colors font-medium ${isAvailable
                                                ? 'text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                : 'text-gray-400 border-gray-300 cursor-not-allowed'}`, disabled: !isAvailable, children: "View Details" }), _jsx("button", { onClick: () => {
                                                if (isAvailable) {
                                                    setSelectedCar(car);
                                                    setShowBookingModal(true);
                                                }
                                            }, className: `flex-1 px-4 py-2 text-sm rounded-lg transition-colors font-medium ${isAvailable
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`, disabled: !isAvailable, children: isAvailable ? 'Book Now' : 'Unavailable' })] })] })] })] }, car.id));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Search Cars" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", placeholder: "Search by brand, model, or year...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-7 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Location" }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", placeholder: "Enter location", value: searchFilters.location, onChange: (e) => setSearchFilters({ ...searchFilters, location: e.target.value }), className: "pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Price Range" }), _jsxs("select", { value: searchFilters.priceRange, onChange: (e) => setSearchFilters({ ...searchFilters, priceRange: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700", children: [_jsx("option", { value: "All Prices", children: "All Prices" }), _jsx("option", { value: "$0 - $50", children: "$0 - $50" }), _jsx("option", { value: "$50 - $100", children: "$50 - $100" }), _jsx("option", { value: "$100+", children: "$100+" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Car Type" }), _jsxs("select", { value: searchFilters.carType, onChange: (e) => setSearchFilters({ ...searchFilters, carType: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700", children: [_jsx("option", { value: "All Types", children: "All Types" }), _jsx("option", { value: "Sedan", children: "Sedan" }), _jsx("option", { value: "SUV", children: "SUV" }), _jsx("option", { value: "Hatchback", children: "Hatchback" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Availability" }), _jsxs("select", { value: searchFilters.availability, onChange: (e) => setSearchFilters({ ...searchFilters, availability: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700", children: [_jsx("option", { value: "available", children: "Available Only" }), _jsx("option", { value: "all", children: "All Cars" }), _jsx("option", { value: "unavailable", children: "Unavailable Only" })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs("button", { onClick: handleSearch, className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors", children: [_jsx(Search, { className: "w-4 h-4 mr-2" }), "Search (", filteredCars.length, ")"] }) }), _jsx("div", { className: "flex items-end", children: _jsxs("button", { onClick: clearFilters, className: "w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center transition-colors", children: [_jsx(X, { className: "w-4 h-4 mr-2" }), "Clear"] }) }), _jsx("div", { className: "flex items-end", children: _jsxs("button", { onClick: refreshCarList, className: "w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors", title: "Refresh car availability", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }) })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredCars.length > 0 ? (filteredCars.map(renderCarCard)) : (_jsx("div", { className: "col-span-full text-center py-12", children: _jsxs("div", { className: "text-gray-500 dark:text-gray-400", children: [_jsx(Search, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No cars found" }), _jsx("p", { children: "Try adjusting your search criteria or filters" })] }) })) }), _jsx(Modal, { isOpen: !!selectedCar && !showBookingModal, onClose: () => setSelectedCar(null), title: "Car Details", size: "lg", children: selectedCar && (_jsxs("div", { className: "space-y-4", children: [_jsx("img", { src: selectedCar.imageUrl, alt: selectedCar.model, className: "w-full h-64 object-cover rounded-lg" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Make & Model" }), _jsxs("p", { className: "font-medium", children: [selectedCar.year, " ", selectedCar.brand, " ", selectedCar.model] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Daily Rate" }), _jsxs("p", { className: "font-medium", children: ["$", selectedCar.rentalPricePerDay] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Location" }), _jsx("p", { className: "font-medium", children: selectedCar.location })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Rating" }), _jsxs("p", { className: "font-medium", children: ["\u2B50 ", selectedCar.rating] })] })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4", children: [_jsx("button", { onClick: () => setSelectedCar(null), className: "px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50", children: "Close" }), _jsx("button", { onClick: () => setShowBookingModal(true), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Book Now" })] })] })) }), _jsx(BookingModal, { isOpen: showBookingModal, onClose: () => setShowBookingModal(false), selectedCar: selectedCar })] }));
};
export default BrowseCars;
