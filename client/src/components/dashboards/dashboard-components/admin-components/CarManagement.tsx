import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search,
  Filter,
  Eye, 
  Edit, 
  Trash2, 
  Settings,
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  DollarSign,
  Car as CarIcon,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetCarsQuery,
  useUpdateCarMutation,
  useDeleteCarMutation,
  useUpdateCarStatusMutation,
  useBulkCarActionMutation,
  useGetCarStatsQuery,
  useGetOwnersQuery,
  type Car,
  type CarFilters,
  type UpdateCarData,
  type UpdateCarStatusData
} from '../../../../store/Car/carManagementApi';
import CarActionModals from './car-management-components/CarActionModals';

const CarManagement: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<CarFilters>({
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
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState<Car | null>(null);
  const [showEditModal, setShowEditModal] = useState<Car | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Car | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<Car | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editCarData, setEditCarData] = useState<UpdateCarData>({});
  const [statusData, setStatusData] = useState<UpdateCarStatusData>({
    status: 'available'
  });

  // API queries and mutations
  const { data: carsData, isLoading, error, refetch } = useGetCarsQuery(filters);
  const { data: carStats } = useGetCarStatsQuery();
  const { data: owners } = useGetOwnersQuery();
  const [updateCar] = useUpdateCarMutation();
  const [deleteCar] = useDeleteCarMutation();
  const [updateCarStatus] = useUpdateCarStatusMutation();
  const [bulkCarAction] = useBulkCarActionMutation();

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
  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleFilterChange = (key: keyof CarFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSort = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCars([]);
    } else {
      setSelectedCars(cars.map(car => car.id));
    }
  };

  const handleSelectCar = (carId: string) => {
    setSelectedCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    );
  };

  const handleUpdateCarStatus = async (car: Car, status: Car['status'], rejectionReason?: string) => {
    try {
      await updateCarStatus({ 
        carId: car.id, 
        data: { status, rejectionReason } 
      }).unwrap();
      toast.success(`Car ${status} successfully`);
    } catch (error) {
      toast.error('Failed to update car status');
    }
  };

  const handleEditCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    
    try {
      await updateCar({ carId: showEditModal.id, data: editCarData }).unwrap();
      toast.success('Car updated successfully');
      setShowEditModal(null);
      setEditCarData({});
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update car');
    }
  };

  const handleDeleteCar = async (carId: string) => {
    try {
      await deleteCar(carId).unwrap();
      toast.success('Car deleted successfully');
      setShowDeleteModal(null);
      setSelectedCars(prev => prev.filter(id => id !== carId));
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete car');
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'deactivate' | 'delete') => {
    try {
      const result = await bulkCarAction({ carIds: selectedCars, action }).unwrap();
      toast.success(`${result.affectedCount} cars ${action}d successfully`);
      setSelectedCars([]);
      setShowBulkModal(false);
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${action} cars`);
    }
  };

  const openEditModal = (car: Car) => {
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

  const openStatusModal = (car: Car) => {
    setShowStatusModal(car);
    setStatusData({ status: car.status });
  };

  const getStatusBadgeColor = (status: Car['status']) => {
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

  const getStatusText = (status: Car['status']) => {
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

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) return <ArrowUpDown className="w-4 h-4" />;
    return filters.sortOrder === 'asc' 
      ? <ArrowUp className="w-4 h-4" /> 
      : <ArrowDown className="w-4 h-4" />;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">Error loading cars. Please try again.</p>
        <button 
          onClick={() => refetch()} 
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Car Listings Management</h3>
          <p className="text-gray-600 dark:text-gray-400">Manage all car listings on the platform</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleBulkAction('approve')}
            disabled={selectedCars.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Approve Selected
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <DollarSign className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {carStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cars</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{carStats.totalCars}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{carStats.availableCars}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{carStats.pendingApprovalCars}</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Price</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${(Number(carStats.averageRentalPrice) || 0).toFixed(0)}</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search cars by name, model, or brand..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.owner}
              onChange={(e) => handleFilterChange('owner', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Owners</option>
              {owners?.map(owner => (
                <option key={owner.id} value={owner.id}>{owner.name}</option>
              ))}
            </select>

            <div className="flex gap-1">
              <input
                type="number"
                placeholder="Min $"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max $"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCars.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedCars.length} car(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Bulk Actions
                </button>
                <button
                  onClick={() => setSelectedCars([])}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cars Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading cars...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No cars found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        {isAllSelected ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : isSomeSelected ? (
                          <Square className="w-4 h-4 bg-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Car Details {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('rentalPricePerDay')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Price/Day {getSortIcon('rentalPricePerDay')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Date Added {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSelectCar(car.id)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          {selectedCars.includes(car.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <CarIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {car.year} {car.brand} {car.model}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{car.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{car.owner.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{car.owner.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(car.status)}`}>
                          {getStatusText(car.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                        ${car.rentalPricePerDay}/day
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(car.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowDetailsModal(car)}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(car)}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                            title="Edit Car"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openStatusModal(car)}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                            title="Toggle Status"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(car)}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title="Delete Car"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {cars.map((car) => (
                <div key={car.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSelectCar(car.id)}
                        className="mr-3 text-gray-600 dark:text-gray-400"
                      >
                        {selectedCars.includes(car.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <CarIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {car.year} {car.brand} {car.model}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{car.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{car.owner.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(car.status)}`}>
                        {getStatusText(car.status)}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                        ${car.rentalPricePerDay}/day
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(car.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-end gap-1">
                    <button
                      onClick={() => setShowDetailsModal(car)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(car)}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openStatusModal(car)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(car)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {filters.page} of {totalPages}
                </span>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page! - 1))}
                  disabled={filters.page === 1}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page! - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleFilterChange('page', pageNum)}
                      className={`px-3 py-1 rounded text-sm ${
                        filters.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page! + 1))}
                  disabled={filters.page === totalPages}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Modals */}
      <CarActionModals
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editCarData={editCarData}
        setEditCarData={setEditCarData}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        showStatusModal={showStatusModal}
        setShowStatusModal={setShowStatusModal}
        statusData={statusData}
        setStatusData={setStatusData}
        showBulkModal={showBulkModal}
        setShowBulkModal={setShowBulkModal}
        selectedCars={selectedCars}
        onEditCar={handleEditCar}
        onDeleteCar={handleDeleteCar}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
};

export default CarManagement;
