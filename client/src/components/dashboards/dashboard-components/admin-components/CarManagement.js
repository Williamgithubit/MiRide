import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Settings, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, CheckCircle, DollarSign, Car as CarIcon, CheckSquare, Square } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetCarsQuery, useUpdateCarMutation, useDeleteCarMutation, useUpdateCarStatusMutation, useBulkCarActionMutation, useGetCarStatsQuery, useGetOwnersQuery } from '../../../../store/Car/carManagementApi';
import { useUploadCarImagesMutation, useDeleteCarImageMutation, useSetPrimaryImageMutation } from '../../../../store/Car/carApi';
import CarActionModals from './car-management-components/CarActionModals';
const CarManagement = () => {
    // State management
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        owner: 'all',
        minPrice: undefined,
        maxPrice: undefined,
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [searchInput, setSearchInput] = useState('');
    const [selectedCars, setSelectedCars] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(null);
    const [showEditModal, setShowEditModal] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [statusData, setStatusData] = useState({
        status: 'available'
    });
    const [editCarData, setEditCarData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    // API queries and mutations
    const { data: carsData, isLoading, error, refetch } = useGetCarsQuery(filters);
    const { data: carStats } = useGetCarStatsQuery();
    const { data: owners } = useGetOwnersQuery();
    const [updateCar] = useUpdateCarMutation();
    const [deleteCar] = useDeleteCarMutation();
    const [updateCarStatus] = useUpdateCarStatusMutation();
    const [bulkCarAction] = useBulkCarActionMutation();
    const [uploadCarImages] = useUploadCarImagesMutation();
    const [deleteCarImage] = useDeleteCarImageMutation();
    const [setPrimaryImage] = useSetPrimaryImageMutation();
    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchInput]);
    // Computed values
    const cars = carsData?.cars || [];
    const totalPages = carsData?.totalPages || 1;
    const isAllSelected = cars.length > 0 && selectedCars.length === cars.length;
    const isSomeSelected = selectedCars.length > 0 && selectedCars.length < cars.length;
    // Handlers
    const handleSearch = (value) => {
        setSearchInput(value);
    };
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };
    const handleSort = (sortBy) => {
        setFilters(prev => ({
            ...prev,
            sortBy: sortBy,
            sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedCars([]);
        }
        else {
            setSelectedCars(cars.map(car => car.id));
        }
    };
    const handleSelectCar = (carId) => {
        setSelectedCars(prev => prev.includes(carId)
            ? prev.filter(id => id !== carId)
            : [...prev, carId]);
    };
    const handleUpdateCarStatus = async (car, status, rejectionReason) => {
        try {
            await updateCarStatus({
                carId: car.id,
                data: { status, rejectionReason }
            }).unwrap();
            toast.success(`Car ${status} successfully`);
        }
        catch (error) {
            toast.error('Failed to update car status');
        }
    };
    const handleEditCar = async (data) => {
        if (!showEditModal)
            return false;
        try {
            setIsSubmitting(true);
            // Process features if it's a string (from the form)
            const processedData = {
                ...data,
                features: typeof data.features === 'string'
                    ? data.features.split(',').map((f) => f.trim()).filter(Boolean)
                    : data.features
            };
            await updateCar({
                carId: showEditModal.id,
                data: processedData
            }).unwrap();
            toast.success('Car updated successfully');
            setShowEditModal(null);
            setEditCarData({});
            return true;
        }
        catch (error) {
            console.error('Error updating car:', error);
            toast.error(error?.data?.message || 'Failed to update car');
            return false;
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleImageUpload = async (carId, files) => {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });
            const result = await uploadCarImages({
                carId,
                formData
            }).unwrap();
            if (result.success) {
                toast.success('Images uploaded successfully');
                refetch();
            }
            return result;
        }
        catch (error) {
            console.error('Error uploading images:', error);
            toast.error(error?.data?.message || 'Failed to upload images');
            throw error;
        }
    };
    const handleDeleteImage = async (carId, imageId) => {
        try {
            await deleteCarImage({
                carId,
                imageId
            }).unwrap();
            toast.success('Image deleted successfully');
            refetch();
        }
        catch (error) {
            console.error('Error deleting image:', error);
            toast.error(error?.data?.message || 'Failed to delete image');
            throw error;
        }
    };
    const handleSetPrimaryImage = async (carId, imageId) => {
        try {
            await setPrimaryImage({
                carId,
                imageId
            }).unwrap();
            toast.success('Primary image updated');
            refetch();
        }
        catch (error) {
            console.error('Error setting primary image:', error);
            toast.error(error?.data?.message || 'Failed to set primary image');
            throw error;
        }
    };
    const handleDeleteCar = async (carId) => {
        try {
            await deleteCar(carId).unwrap();
            toast.success('Car deleted successfully');
            setShowDeleteModal(null);
            setSelectedCars(prev => prev.filter(id => id !== carId));
        }
        catch (error) {
            toast.error(error?.data?.message || 'Failed to delete car');
        }
    };
    const handleBulkAction = async (action) => {
        try {
            const result = await bulkCarAction({ carIds: selectedCars, action }).unwrap();
            toast.success(`${result.affectedCount} cars ${action}d successfully`);
            setSelectedCars([]);
            setShowBulkModal(false);
        }
        catch (error) {
            toast.error(error?.data?.message || `Failed to ${action} cars`);
        }
    };
    const openEditModal = (car) => {
        setShowEditModal(car);
        setEditCarData({
            name: car.name,
            model: car.model,
            brand: car.brand,
            year: car.year,
            rentalPricePerDay: car.rentalPricePerDay,
            description: car.description,
            status: car.status,
            features: car.features
        });
    };
    const openStatusModal = (car) => {
        setShowStatusModal(car);
        setStatusData({ status: car.status });
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
    const getStatusText = (status) => {
        switch (status) {
            case 'available': return 'Available';
            case 'rented': return 'Rented';
            case 'maintenance': return 'Maintenance';
            case 'pending_approval': return 'Pending Approval';
            case 'rejected': return 'Rejected';
            case 'inactive': return 'Inactive';
            default: return 'Unknown';
        }
    };
    const getSortIcon = (column) => {
        if (filters.sortBy !== column)
            return _jsx(ArrowUpDown, { className: "w-4 h-4" });
        return filters.sortOrder === 'asc'
            ? _jsx(ArrowUp, { className: "w-4 h-4" })
            : _jsx(ArrowDown, { className: "w-4 h-4" });
    };
    if (error) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-red-600 dark:text-red-400", children: "Error loading cars. Please try again." }), _jsx("button", { onClick: () => refetch(), className: "mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Retry" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Car Listings Management" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Manage all car listings on the platform" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => handleBulkAction('approve'), disabled: selectedCars.length === 0, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Approve Selected"] }), _jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(DollarSign, { className: "w-4 h-4" }), "Export Data"] })] })] }), carStats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Total Cars" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: carStats.totalCars })] }), _jsx("div", { className: "p-2 bg-blue-100 dark:bg-blue-900 rounded-lg", children: _jsx(CarIcon, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Available" }), _jsx("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: carStats.availableCars })] }), _jsx("div", { className: "p-2 bg-green-100 dark:bg-green-900 rounded-lg", children: _jsx(CheckCircle, { className: "w-6 h-6 text-green-600 dark:text-green-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Pending Approval" }), _jsx("p", { className: "text-2xl font-bold text-orange-600 dark:text-orange-400", children: carStats.pendingApprovalCars })] }), _jsx("div", { className: "p-2 bg-orange-100 dark:bg-orange-900 rounded-lg", children: _jsx(Settings, { className: "w-6 h-6 text-orange-600 dark:text-orange-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Avg. Price" }), _jsxs("p", { className: "text-2xl font-bold text-purple-600 dark:text-purple-400", children: ["$", (Number(carStats.averageRentalPrice) || 0).toFixed(0)] })] }), _jsx("div", { className: "p-2 bg-purple-100 dark:bg-purple-900 rounded-lg", children: _jsx(DollarSign, { className: "w-6 h-6 text-purple-600 dark:text-purple-400" }) })] }) })] })), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow", children: [_jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", placeholder: "Search cars by name, model, or brand...", value: searchInput, onChange: (e) => handleSearch(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }) }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsxs("select", { value: filters.status, onChange: (e) => handleFilterChange('status', e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "available", children: "Available" }), _jsx("option", { value: "rented", children: "Rented" }), _jsx("option", { value: "maintenance", children: "Maintenance" }), _jsx("option", { value: "pending_approval", children: "Pending Approval" }), _jsx("option", { value: "rejected", children: "Rejected" }), _jsx("option", { value: "inactive", children: "Inactive" })] }), _jsxs("select", { value: filters.owner, onChange: (e) => handleFilterChange('owner', e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: "all", children: "All Owners" }), owners?.map(owner => (_jsx("option", { value: owner.id, children: owner.name }, owner.id)))] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("input", { type: "number", placeholder: "Min $", value: filters.minPrice || '', onChange: (e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined), className: "w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" }), _jsx("input", { type: "number", placeholder: "Max $", value: filters.maxPrice || '', onChange: (e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined), className: "w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] })] })] }), selectedCars.length > 0 && (_jsx("div", { className: "mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm text-blue-700 dark:text-blue-300", children: [selectedCars.length, " car(s) selected"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setShowBulkModal(true), className: "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700", children: "Bulk Actions" }), _jsx("button", { onClick: () => setSelectedCars([]), className: "px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700", children: "Clear Selection" })] })] }) }))] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden", children: [isLoading ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: "Loading cars..." })] })) : cars.length === 0 ? (_jsx("div", { className: "p-8 text-center", children: _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "No cars found" }) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden md:block overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: _jsx("button", { onClick: handleSelectAll, className: "flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white", children: isAllSelected ? (_jsx(CheckSquare, { className: "w-4 h-4" })) : isSomeSelected ? (_jsx(Square, { className: "w-4 h-4 bg-blue-600" })) : (_jsx(Square, { className: "w-4 h-4" })) }) }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsxs("button", { onClick: () => handleSort('name'), className: "flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200", children: ["Car Details ", getSortIcon('name')] }) }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Owner" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsxs("button", { onClick: () => handleSort('rentalPricePerDay'), className: "flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200", children: ["Price/Day ", getSortIcon('rentalPricePerDay')] }) }), _jsx("th", { className: "px-4 py-3 text-left", children: _jsxs("button", { onClick: () => handleSort('createdAt'), className: "flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200", children: ["Date Added ", getSortIcon('createdAt')] }) }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-600", children: cars.map((car) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [_jsx("td", { className: "px-4 py-3", children: _jsx("button", { onClick: () => handleSelectCar(car.id), className: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white", children: selectedCars.includes(car.id) ? (_jsx(CheckSquare, { className: "w-4 h-4 text-blue-600" })) : (_jsx(Square, { className: "w-4 h-4" })) }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center", children: [car.imageUrl ? (_jsx("img", { src: car.imageUrl, alt: car.name, className: "w-12 h-12 object-cover rounded-lg", onError: (e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                    } })) : null, _jsx("div", { className: `w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center ${car.imageUrl ? 'hidden' : ''}`, children: _jsx(CarIcon, { className: "w-6 h-6 text-gray-500 dark:text-gray-400" }) }), _jsxs("div", { className: "ml-3", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [car.year, " ", car.brand, " ", car.model] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: car.name })] })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: car.owner.name }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: car.owner.email })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(car.status)}`, children: getStatusText(car.status) }) }), _jsxs("td", { className: "px-4 py-3 text-sm text-gray-900 dark:text-white font-medium", children: ["$", car.rentalPricePerDay, "/day"] }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-400", children: new Date(car.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => setShowDetailsModal(car), className: "p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded", title: "View Details", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openEditModal(car), className: "p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded", title: "Edit Car", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openStatusModal(car), className: "p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded", title: "Toggle Status", children: _jsx(Settings, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setShowDeleteModal(car), className: "p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded", title: "Delete Car", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, car.id))) })] }) }), _jsx("div", { className: "md:hidden space-y-4 p-4", children: cars.map((car) => (_jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 rounded-lg p-4", children: [_jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => handleSelectCar(car.id), className: "mr-3 text-gray-600 dark:text-gray-400", children: selectedCars.includes(car.id) ? (_jsx(CheckSquare, { className: "w-4 h-4 text-blue-600" })) : (_jsx(Square, { className: "w-4 h-4" })) }), car.imageUrl ? (_jsx("img", { src: car.imageUrl, alt: car.name, className: "w-12 h-12 object-cover rounded-lg", onError: (e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        } })) : null, _jsx("div", { className: `w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center ${car.imageUrl ? 'hidden' : ''}`, children: _jsx(CarIcon, { className: "w-6 h-6 text-gray-500 dark:text-gray-400" }) }), _jsxs("div", { className: "ml-3", children: [_jsxs("p", { className: "font-medium text-gray-900 dark:text-white", children: [car.year, " ", car.brand, " ", car.model] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: car.name }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: car.owner.name })] })] }) }), _jsxs("div", { className: "mt-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(car.status)}`, children: getStatusText(car.status) }), _jsxs("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium", children: ["$", car.rentalPricePerDay, "/day"] })] }), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: new Date(car.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "mt-3 flex justify-end gap-1", children: [_jsx("button", { onClick: () => setShowDetailsModal(car), className: "p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openEditModal(car), className: "p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openStatusModal(car), className: "p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded", children: _jsx(Settings, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setShowDeleteModal(car), className: "p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, car.id))) })] })), totalPages > 1 && (_jsx("div", { className: "px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Page ", filters.page, " of ", totalPages] }), _jsxs("select", { value: filters.limit, onChange: (e) => handleFilterChange('limit', Number(e.target.value)), className: "px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white", children: [_jsx("option", { value: 5, children: "5 per page" }), _jsx("option", { value: 10, children: "10 per page" }), _jsx("option", { value: 25, children: "25 per page" }), _jsx("option", { value: 50, children: "50 per page" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => handleFilterChange('page', Math.max(1, filters.page - 1)), disabled: filters.page === 1, className: "p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                                            if (pageNum > totalPages)
                                                return null;
                                            return (_jsx("button", { onClick: () => handleFilterChange('page', pageNum), className: `px-3 py-1 rounded text-sm ${filters.page === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}`, children: pageNum }, pageNum));
                                        }), _jsx("button", { onClick: () => handleFilterChange('page', Math.min(totalPages, filters.page + 1)), disabled: filters.page === totalPages, className: "p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] })] }) }))] }), _jsx(CarActionModals, { showDetailsModal: showDetailsModal, setShowDetailsModal: setShowDetailsModal, showEditModal: showEditModal, setShowEditModal: setShowEditModal, showDeleteModal: showDeleteModal, setShowDeleteModal: setShowDeleteModal, showStatusModal: showStatusModal, setShowStatusModal: setShowStatusModal, statusData: statusData, setStatusData: setStatusData, showBulkModal: showBulkModal, setShowBulkModal: setShowBulkModal, selectedCars: selectedCars, onEditCar: handleEditCar, onDeleteCar: handleDeleteCar, onBulkAction: handleBulkAction })] }));
};
export default CarManagement;
