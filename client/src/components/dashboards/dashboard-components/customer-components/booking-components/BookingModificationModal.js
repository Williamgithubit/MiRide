import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useModifyBookingMutation } from '../../../../../store/Booking/bookingApi';
const BookingModificationModal = ({ booking, onClose }) => {
    const [modifyBooking, { isLoading }] = useModifyBookingMutation();
    const [formData, setFormData] = useState({
        startDate: booking.startDate,
        endDate: booking.endDate,
        pickupLocation: booking.pickupLocation || '',
        dropoffLocation: booking.dropoffLocation || '',
        specialRequests: booking.specialRequests || '',
        hasInsurance: booking.hasInsurance,
        hasGPS: booking.hasGPS,
        hasChildSeat: booking.hasChildSeat,
        hasAdditionalDriver: booking.hasAdditionalDriver
    });
    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }
        if (!formData.endDate) {
            newErrors.endDate = 'End date is required';
        }
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
        }
        if (new Date(formData.startDate) <= new Date()) {
            newErrors.startDate = 'Start date must be in the future';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            await modifyBooking({
                id: booking.id,
                ...formData
            }).unwrap();
            onClose();
        }
        catch (error) {
            console.error('Failed to modify booking:', error);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const calculateTotalDays = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return 0;
    };
    const calculateNewTotal = () => {
        const days = calculateTotalDays();
        const basePrice = days * (Number(booking.car?.rentalPricePerDay) || 0);
        const insuranceCost = formData.hasInsurance ? days * 15 : 0;
        const gpsCost = formData.hasGPS ? days * 5 : 0;
        const childSeatCost = formData.hasChildSeat ? days * 8 : 0;
        const additionalDriverCost = formData.hasAdditionalDriver ? days * 10 : 0;
        return basePrice + insuranceCost + gpsCost + childSeatCost + additionalDriverCost;
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "Modify Booking" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: _jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [_jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 rounded-lg p-4", children: [_jsxs("h3", { className: "font-medium text-gray-900 dark:text-white mb-2", children: [booking.car?.name, " ", booking.car?.model] }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [booking.car?.brand, " \u2022 ", booking.car?.year, " \u2022 $", (Number(booking.car?.rentalPricePerDay) || 0).toFixed(2), "/day"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Start Date" }), _jsx("input", { type: "date", value: formData.startDate, onChange: (e) => handleInputChange('startDate', e.target.value), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startDate
                                                ? 'border-red-500 dark:border-red-400'
                                                : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white` }), errors.startDate && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.startDate }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "End Date" }), _jsx("input", { type: "date", value: formData.endDate, onChange: (e) => handleInputChange('endDate', e.target.value), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endDate
                                                ? 'border-red-500 dark:border-red-400'
                                                : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white` }), errors.endDate && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.endDate }))] })] }), calculateTotalDays() > 0 && (_jsx("div", { className: "bg-blue-50 dark:bg-blue-900 rounded-lg p-3", children: _jsxs("p", { className: "text-sm text-blue-800 dark:text-blue-200", children: ["Duration: ", calculateTotalDays(), " ", calculateTotalDays() === 1 ? 'day' : 'days'] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Pickup Location" }), _jsx("input", { type: "text", value: formData.pickupLocation, onChange: (e) => handleInputChange('pickupLocation', e.target.value), placeholder: "Enter pickup location", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Dropoff Location" }), _jsx("input", { type: "text", value: formData.dropoffLocation, onChange: (e) => handleInputChange('dropoffLocation', e.target.value), placeholder: "Enter dropoff location", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-3", children: "Add-ons" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.hasInsurance, onChange: (e) => handleInputChange('hasInsurance', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700 dark:text-gray-300", children: "Insurance (+$15/day)" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.hasGPS, onChange: (e) => handleInputChange('hasGPS', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700 dark:text-gray-300", children: "GPS Navigation (+$5/day)" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.hasChildSeat, onChange: (e) => handleInputChange('hasChildSeat', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700 dark:text-gray-300", children: "Child Seat (+$8/day)" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.hasAdditionalDriver, onChange: (e) => handleInputChange('hasAdditionalDriver', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700 dark:text-gray-300", children: "Additional Driver (+$10/day)" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Special Requests" }), _jsx("textarea", { value: formData.specialRequests, onChange: (e) => handleInputChange('specialRequests', e.target.value), rows: 3, placeholder: "Any special requests or notes...", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" })] }), calculateTotalDays() > 0 && (_jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white mb-2", children: "New Total" }), _jsxs("div", { className: "text-2xl font-bold text-blue-600 dark:text-blue-400", children: ["$", calculateNewTotal().toFixed(2)] }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: ["Original: $", (Number(booking.totalAmount) || 0).toFixed(2)] })] })), _jsxs("div", { className: "flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isLoading, className: "flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors", children: isLoading ? 'Saving Changes...' : 'Save Changes' })] })] })] }) }));
};
export default BookingModificationModal;
