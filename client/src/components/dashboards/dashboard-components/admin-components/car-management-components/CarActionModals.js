import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { X, AlertTriangle, Car as CarIcon, User, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CarForm from './CarForm';
import { useUpdateCarStatusMutation } from '../../../../../store/Car/carManagementApi';
const CarActionModals = ({ showDetailsModal, setShowDetailsModal, showEditModal, setShowEditModal, showDeleteModal, setShowDeleteModal, onDeleteCar, showStatusModal, setShowStatusModal, statusData, setStatusData, showBulkModal, setShowBulkModal, selectedCars, onEditCar, onBulkAction }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updateCarStatus] = useUpdateCarStatusMutation();
    const [rejectionReason, setRejectionReason] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    // Handle image upload
    const handleImageUpload = async (carId, files) => {
        if (!carId || !files.length)
            return false;
        try {
            setIsUploading(true);
            setUploadProgress(0);
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });
            // Simulate upload progress (in a real app, you'd use axios or fetch with progress events)
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + Math.floor(Math.random() * 20);
                    return newProgress >= 100 ? 100 : newProgress;
                });
            }, 200);
            // In a real app, you would use the actual API call here
            // await uploadCarImages({ carId, formData }).unwrap();
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            clearInterval(interval);
            setUploadProgress(100);
            // Invalidate the car data to refetch with new images
            // queryClient.invalidateQueries(['car', carId]);
            toast.success('Images uploaded successfully');
            return true;
        }
        catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images');
            return false;
        }
        finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };
    // Handle image deletion
    const handleDeleteImage = async (carId, imageId) => {
        if (!carId || !imageId)
            return false;
        try {
            // In a real app, you would use the actual API call here
            // await deleteCarImage({ carId, imageId }).unwrap();
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            // Invalidate the car data to refetch with updated images
            // queryClient.invalidateQueries(['car', carId]);
            toast.success('Image deleted successfully');
            return true;
        }
        catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
            return false;
        }
    };
    // Handle setting primary image
    const handleSetPrimaryImage = async (carId, imageId) => {
        if (!carId || !imageId)
            return false;
        try {
            // In a real app, you would use the actual API call here
            // await setPrimaryImage({ carId, imageId }).unwrap();
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            // Invalidate the car data to refetch with updated primary image
            // queryClient.invalidateQueries(['car', carId]);
            toast.success('Primary image updated successfully');
            return true;
        }
        catch (error) {
            console.error('Error setting primary image:', error);
            toast.error('Failed to update primary image');
            return false;
        }
    };
    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        if (!showStatusModal)
            return;
        try {
            await updateCarStatus({
                carId: showStatusModal.id.toString(),
                data: {
                    status: statusData.status,
                    rejectionReason: statusData.status === 'rejected' ? rejectionReason : undefined
                }
            }).unwrap();
            toast.success(`Car ${statusData.status} successfully`);
            setShowStatusModal(null);
            setRejectionReason('');
        }
        catch (error) {
            toast.error(error?.data?.message || 'Failed to update car status');
        }
    };
    const handleEditCar = async (data) => {
        if (!showEditModal)
            return false;
        try {
            setIsSubmitting(true);
            const result = await onEditCar(data);
            if (result) {
                setShowEditModal(null);
            }
            return result;
        }
        catch (error) {
            console.error('Error updating car:', error);
            return false;
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rented': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'pending_approval': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    return (_jsxs(_Fragment, { children: [showDetailsModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "Car Details" }), _jsx("button", { onClick: () => setShowDetailsModal(null), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "w-full h-64 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center", children: _jsx(CarIcon, { className: "w-16 h-16 text-gray-500 dark:text-gray-400" }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(showDetailsModal.status)}`, children: showDetailsModal.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }), _jsxs("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: ["$", showDetailsModal.rentalPricePerDay, "/day"] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h4", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-3", children: [showDetailsModal.year, " ", showDetailsModal.brand, " ", showDetailsModal.model] }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: showDetailsModal.name }), showDetailsModal.description && (_jsx("p", { className: "text-gray-700 dark:text-gray-300", children: showDetailsModal.description }))] }), _jsxs("div", { className: "border-t border-gray-200 dark:border-gray-600 pt-4", children: [_jsxs("h5", { className: "font-medium text-gray-900 dark:text-white mb-2 flex items-center", children: [_jsx(User, { className: "w-4 h-4 mr-2" }), "Owner Information"] }), _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: [_jsx("p", { className: "font-medium", children: showDetailsModal.owner.name }), _jsx("p", { children: showDetailsModal.owner.email })] })] }), _jsxs("div", { className: "border-t border-gray-200 dark:border-gray-600 pt-4", children: [_jsx("h5", { className: "font-medium text-gray-900 dark:text-white mb-3", children: "Vehicle Details" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Year:" }), _jsx("span", { className: "ml-2 text-gray-900 dark:text-white", children: showDetailsModal.year })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Brand:" }), _jsx("span", { className: "ml-2 text-gray-900 dark:text-white", children: showDetailsModal.brand })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Model:" }), _jsx("span", { className: "ml-2 text-gray-900 dark:text-white", children: showDetailsModal.model })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Price:" }), _jsxs("span", { className: "ml-2 text-gray-900 dark:text-white", children: ["$", showDetailsModal.rentalPricePerDay, "/day"] })] })] })] }), showDetailsModal.features && showDetailsModal.features.length > 0 && (_jsxs("div", { className: "border-t border-gray-200 dark:border-gray-600 pt-4", children: [_jsx("h5", { className: "font-medium text-gray-900 dark:text-white mb-2", children: "Features" }), _jsx("div", { className: "flex flex-wrap gap-2", children: showDetailsModal.features.map((feature, index) => (_jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm", children: feature }, index))) })] })), _jsx("div", { className: "border-t border-gray-200 dark:border-gray-600 pt-4", children: _jsxs("div", { className: "grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-400", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), _jsxs("span", { children: ["Added: ", new Date(showDetailsModal.createdAt).toLocaleDateString()] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), _jsxs("span", { children: ["Updated: ", new Date(showDetailsModal.updatedAt).toLocaleDateString()] })] })] }) })] })] }) })] }) })), showEditModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: showEditModal.id ? 'Edit Car' : 'Add New Car' }), _jsx("button", { onClick: () => setShowEditModal(null), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "p-6", children: _jsx(CarForm, { initialData: {
                                    name: showEditModal?.name || '',
                                    brand: showEditModal?.brand || '',
                                    model: showEditModal?.model || '',
                                    year: showEditModal?.year ? Number(showEditModal.year) : new Date().getFullYear(),
                                    rentalPricePerDay: showEditModal?.rentalPricePerDay || 0,
                                    seats: showEditModal?.seats || 5, // Default to 5 seats if not provided
                                    fuelType: showEditModal?.fuelType || 'Petrol',
                                    location: showEditModal?.location || '',
                                    features: showEditModal?.features?.join(', '),
                                    isAvailable: showEditModal?.isAvailable ?? true,
                                    description: showEditModal?.description,
                                    id: showEditModal?.id ? Number(showEditModal.id) : undefined,
                                    images: showEditModal?.images
                                }, onSubmit: async (data) => {
                                    try {
                                        // Convert features string back to array before saving
                                        const carData = {
                                            ...data,
                                            features: data.features
                                                ? (typeof data.features === 'string'
                                                    ? data.features.split(',').map((f) => f.trim()).filter(Boolean)
                                                    : data.features)
                                                : []
                                        };
                                        const success = await onEditCar(carData);
                                        if (success) {
                                            setShowEditModal(null);
                                        }
                                        return success;
                                    }
                                    catch (error) {
                                        console.error('Error updating car:', error);
                                        toast.error('Failed to update car');
                                        return false;
                                    }
                                }, isSubmitting: isSubmitting, onCancel: () => setShowEditModal(null), onImageUpload: async (files) => {
                                    if (showEditModal?.id) {
                                        return await handleImageUpload(Number(showEditModal.id), files);
                                    }
                                    return false;
                                }, onDeleteImage: async (imageId) => {
                                    if (showEditModal?.id) {
                                        return await handleDeleteImage(Number(showEditModal.id), imageId);
                                    }
                                    return false;
                                }, onSetPrimaryImage: async (imageId) => {
                                    if (showEditModal?.id) {
                                        return await handleSetPrimaryImage(Number(showEditModal.id), imageId);
                                    }
                                    return false; // Return a boolean instead of Promise<void>
                                }, uploadProgress: uploadProgress, isUploading: isUploading }) })] }) })), showDeleteModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4", children: _jsx(AlertTriangle, { className: "w-6 h-6 text-red-600 dark:text-red-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Delete Car" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "This action cannot be undone" })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("p", { className: "text-gray-700 dark:text-gray-300 mb-2", children: "Are you sure you want to delete this car?" }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 p-3 rounded-lg", children: [_jsxs("p", { className: "font-medium text-gray-900 dark:text-white", children: [showDeleteModal.year, " ", showDeleteModal.brand, " ", showDeleteModal.model] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: showDeleteModal.name })] })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: () => setShowDeleteModal(null), className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors", children: "Cancel" }), _jsx("button", { onClick: () => onDeleteCar(showDeleteModal.id), className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: "Delete Car" })] })] }) }) })), showStatusModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "Update Car Status" }), _jsx("button", { onClick: () => setShowStatusModal(null), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("form", { onSubmit: handleStatusUpdate, className: "p-6 space-y-4", children: [_jsx("div", { className: "mb-4", children: _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 p-3 rounded-lg", children: [_jsxs("p", { className: "font-medium text-gray-900 dark:text-white", children: [showStatusModal.year, " ", showStatusModal.brand, " ", showStatusModal.model] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: showStatusModal.name })] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "New Status" }), _jsxs("select", { value: statusData.status, onChange: (e) => setStatusData({ ...statusData, status: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: "available", children: "Available" }), _jsx("option", { value: "rented", children: "Rented" }), _jsx("option", { value: "maintenance", children: "Maintenance" }), _jsx("option", { value: "pending_approval", children: "Pending Approval" }), _jsx("option", { value: "rejected", children: "Rejected" }), _jsx("option", { value: "inactive", children: "Inactive" })] })] }), statusData.status === 'rejected' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Rejection Reason" }), _jsx("textarea", { value: rejectionReason, onChange: (e) => setRejectionReason(e.target.value), rows: 3, placeholder: "Please provide a reason for rejection...", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white", required: true })] })), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: () => setShowStatusModal(null), className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "Update Status" })] })] })] }) })), showBulkModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "Bulk Actions" }), _jsx("button", { onClick: () => setShowBulkModal(false), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: [selectedCars.length, " car(s) selected. Choose an action:"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: () => onBulkAction('approve'), className: "w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left", children: [_jsx("div", { className: "font-medium", children: "Approve All" }), _jsx("div", { className: "text-sm text-green-100", children: "Set status to available" })] }), _jsxs("button", { onClick: () => onBulkAction('reject'), className: "w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-left", children: [_jsx("div", { className: "font-medium", children: "Reject All" }), _jsx("div", { className: "text-sm text-red-100", children: "Set status to rejected" })] }), _jsxs("button", { onClick: () => onBulkAction('deactivate'), className: "w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-left", children: [_jsx("div", { className: "font-medium", children: "Deactivate All" }), _jsx("div", { className: "text-sm text-yellow-100", children: "Set status to inactive" })] }), _jsxs("button", { onClick: () => onBulkAction('delete'), className: "w-full px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-left", children: [_jsx("div", { className: "font-medium", children: "Delete All" }), _jsx("div", { className: "text-sm text-red-100", children: "Permanently remove cars" })] })] }), _jsx("div", { className: "mt-6 pt-4 border-t border-gray-200 dark:border-gray-600", children: _jsx("button", { onClick: () => setShowBulkModal(false), className: "w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors", children: "Cancel" }) })] })] }) }))] }));
};
export default CarActionModals;
