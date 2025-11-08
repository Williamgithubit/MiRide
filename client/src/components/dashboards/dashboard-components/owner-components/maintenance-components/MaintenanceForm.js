import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FaTimes, FaCar, FaWrench, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import { useGetCarsByOwnerQuery } from '../../../../../store/Car/carApi';
const MaintenanceForm = ({ isOpen, onClose, onSubmit, editingRecord, loading = false }) => {
    const { data: ownerCars = [], isLoading: carsLoading } = useGetCarsByOwnerQuery();
    const [formData, setFormData] = useState({
        carId: 0,
        type: 'routine',
        description: '',
        cost: 0,
        scheduledDate: '',
        serviceProvider: '',
        notes: '',
        mileage: 0,
        priority: 'medium'
    });
    const [errors, setErrors] = useState({});
    // Reset form when modal opens/closes or editing record changes
    useEffect(() => {
        if (isOpen) {
            if (editingRecord) {
                setFormData({
                    carId: editingRecord.carId,
                    type: editingRecord.type,
                    description: editingRecord.description,
                    cost: editingRecord.cost,
                    scheduledDate: editingRecord.scheduledDate ? editingRecord.scheduledDate.split('T')[0] : '',
                    serviceProvider: editingRecord.serviceProvider || '',
                    notes: editingRecord.notes || '',
                    mileage: editingRecord.mileage || 0,
                    priority: editingRecord.priority
                });
            }
            else {
                setFormData({
                    carId: 0,
                    type: 'routine',
                    description: '',
                    cost: 0,
                    scheduledDate: '',
                    serviceProvider: '',
                    notes: '',
                    mileage: 0,
                    priority: 'medium'
                });
            }
            setErrors({});
        }
    }, [isOpen, editingRecord]);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.carId) {
            newErrors.carId = 'Please select a car';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (formData.cost < 0) {
            newErrors.cost = 'Cost must be a positive number';
        }
        if (!formData.scheduledDate) {
            newErrors.scheduledDate = 'Scheduled date is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        const submitData = {
            ...formData,
            scheduledDate: formData.scheduledDate || undefined,
            serviceProvider: formData.serviceProvider || undefined,
            notes: formData.notes || undefined,
            mileage: formData.mileage || undefined
        };
        if (editingRecord) {
            onSubmit({
                id: editingRecord.id,
                ...submitData
            });
        }
        else {
            onSubmit(submitData);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center", children: _jsx(FaWrench, { className: "w-5 h-5 text-blue-600 dark:text-blue-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: editingRecord ? 'Edit Maintenance Record' : 'Add New Maintenance' }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: editingRecord ? 'Update maintenance details' : 'Schedule new maintenance for your vehicle' })] })] }), _jsx("button", { onClick: onClose, className: "p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", children: _jsx(FaTimes, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [_jsx(FaCar, { className: "w-4 h-4" }), _jsx("span", { children: "Select Car" })] }), _jsxs("select", { value: formData.carId, onChange: (e) => handleInputChange('carId', parseInt(e.target.value)), className: `w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.carId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`, disabled: carsLoading, children: [_jsx("option", { value: 0, children: "Select a car..." }), ownerCars.map((car) => (_jsxs("option", { value: car.id, children: [car.name, " - ", car.make, " ", car.model, " (", car.year, ")"] }, car.id)))] }), errors.carId && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.carId }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Maintenance Type" }), _jsxs("select", { value: formData.type, onChange: (e) => handleInputChange('type', e.target.value), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "routine", children: "Routine Maintenance" }), _jsx("option", { value: "repair", children: "Repair" }), _jsx("option", { value: "inspection", children: "Inspection" }), _jsx("option", { value: "emergency", children: "Emergency" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Priority" }), _jsxs("select", { value: formData.priority, onChange: (e) => handleInputChange('priority', e.target.value), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Description" }), _jsx("textarea", { value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), rows: 3, placeholder: "Describe the maintenance work needed...", className: `w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}` }), errors.description && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.description }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [_jsx(FaDollarSign, { className: "w-4 h-4" }), _jsx("span", { children: "Estimated Cost" })] }), _jsx("input", { type: "number", value: formData.cost, onChange: (e) => handleInputChange('cost', parseFloat(e.target.value) || 0), min: "0", step: "0.01", placeholder: "0.00", className: `w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cost ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}` }), errors.cost && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.cost }))] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [_jsx(FaCalendarAlt, { className: "w-4 h-4" }), _jsx("span", { children: "Scheduled Date" })] }), _jsx("input", { type: "date", value: formData.scheduledDate, onChange: (e) => handleInputChange('scheduledDate', e.target.value), className: `w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.scheduledDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}` }), errors.scheduledDate && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.scheduledDate }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Service Provider (Optional)" }), _jsx("input", { type: "text", value: formData.serviceProvider, onChange: (e) => handleInputChange('serviceProvider', e.target.value), placeholder: "e.g., AutoCare Center", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Current Mileage (Optional)" }), _jsx("input", { type: "number", value: formData.mileage, onChange: (e) => handleInputChange('mileage', parseInt(e.target.value) || 0), min: "0", placeholder: "e.g., 50000", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Additional Notes (Optional)" }), _jsx("textarea", { value: formData.notes, onChange: (e) => handleInputChange('notes', e.target.value), rows: 2, placeholder: "Any additional information or special instructions...", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" })] }), _jsxs("div", { className: "flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: loading, className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2", children: [loading && (_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" })), _jsx("span", { children: editingRecord ? 'Update Maintenance' : 'Add Maintenance' })] })] })] })] }) }));
};
export default MaintenanceForm;
