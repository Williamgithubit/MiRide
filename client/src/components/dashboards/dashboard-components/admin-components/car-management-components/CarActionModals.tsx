import React, { useState } from 'react';
import { X, AlertTriangle, Car as CarIcon, User, Calendar, DollarSign, MapPin, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CarForm from './CarForm';
import {
  useUpdateCarMutation,
  useDeleteCarMutation,
  useUpdateCarStatusMutation,
  type UpdateCarData,
  type UpdateCarStatusData
} from '../../../../../store/Car/carManagementApi';
import type { Car } from '../../../../../store/Car/carManagementApi';
import { getPrimaryImageUrl } from '../../../../../utils/imageUtils';

interface CarActionModalsProps {
  // Details Modal
  showDetailsModal: Car | null;
  setShowDetailsModal: (car: Car | null) => void;

  // Edit Modal
  showEditModal: Car | null;
  setShowEditModal: (car: Car | null) => void;
  onEditCar: (data: any) => Promise<boolean>;

  // Delete Modal
  showDeleteModal: Car | null;
  setShowDeleteModal: (car: Car | null) => void;
  onDeleteCar: (carId: string) => void;

  // Status Modal
  showStatusModal: Car | null;
  setShowStatusModal: (car: Car | null) => void;
  statusData: UpdateCarStatusData;
  setStatusData: (data: UpdateCarStatusData) => void;

  // Bulk Modal
  showBulkModal: boolean;
  setShowBulkModal: (show: boolean) => void;
  selectedCars: string[];
  onBulkAction: (action: 'approve' | 'reject' | 'deactivate' | 'delete') => void;
}

const CarActionModals: React.FC<CarActionModalsProps> = ({
  showDetailsModal,
  setShowDetailsModal,
  showEditModal,
  setShowEditModal,
  showDeleteModal,
  setShowDeleteModal,
  onDeleteCar,
  showStatusModal,
  setShowStatusModal,
  statusData,
  setStatusData,
  showBulkModal,
  setShowBulkModal,
  selectedCars,
  onEditCar,
  onBulkAction
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateCarStatus] = useUpdateCarStatusMutation();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle image upload
  const handleImageUpload = async (carId: number, files: File[]): Promise<boolean> => {
    if (!carId || !files.length) return false;

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
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      return false;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (carId: number, imageId: string): Promise<boolean> => {
    if (!carId || !imageId) return false;

    try {
      // In a real app, you would use the actual API call here
      // await deleteCarImage({ carId, imageId }).unwrap();

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Invalidate the car data to refetch with updated images
      // queryClient.invalidateQueries(['car', carId]);

      toast.success('Image deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
      return false;
    }
  };

  // Handle setting primary image
  const handleSetPrimaryImage = async (carId: number, imageId: string): Promise<boolean> => {
    if (!carId || !imageId) return false;

    try {
      // In a real app, you would use the actual API call here
      // await setPrimaryImage({ carId, imageId }).unwrap();

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Invalidate the car data to refetch with updated primary image
      // queryClient.invalidateQueries(['car', carId]);

      toast.success('Primary image updated successfully');
      return true;
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast.error('Failed to update primary image');
      return false;
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStatusModal) return;

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
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update car status');
    }
  };

  const handleEditCar = async (data: any) => {
    if (!showEditModal) return false;

    try {
      setIsSubmitting(true);
      const result = await onEditCar(data);
      if (result) {
        setShowEditModal(null);
      }
      return result;
    } catch (error) {
      console.error('Error updating car:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
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

  return (
    <>
      {/* Car Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Car Details</h3>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Car Image */}
                <div className="space-y-4">
                  {getPrimaryImageUrl(showDetailsModal.images) ? (
                    <img
                      src={getPrimaryImageUrl(showDetailsModal.images)}
                      alt={showDetailsModal.name}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-64 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center ${getPrimaryImageUrl(showDetailsModal.images) ? 'hidden' : ''}`}>
                    <CarIcon className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(showDetailsModal.status)}`}>
                      {showDetailsModal.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${showDetailsModal.rentalPricePerDay}/day
                    </div>
                  </div>
                </div>

                {/* Car Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {showDetailsModal.year} {showDetailsModal.brand} {showDetailsModal.model}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{showDetailsModal.name}</p>

                    {showDetailsModal.description && (
                      <p className="text-gray-700 dark:text-gray-300">{showDetailsModal.description}</p>
                    )}
                  </div>

                  {/* Owner Information */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Owner Information
                    </h5>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium">{showDetailsModal.owner.name}</p>
                      <p>{showDetailsModal.owner.email}</p>
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Vehicle Details</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Year:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{showDetailsModal.year}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Brand:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{showDetailsModal.brand}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Model:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{showDetailsModal.model}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Price:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">${showDetailsModal.rentalPricePerDay}/day</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {showDetailsModal.features && showDetailsModal.features.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Features</h5>
                      <div className="flex flex-wrap gap-2">
                        {showDetailsModal.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Added: {new Date(showDetailsModal.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Updated: {new Date(showDetailsModal.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Car Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {showEditModal.id ? 'Edit Car' : 'Add New Car'}
              </h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <CarForm
                initialData={{
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
                }}
                onSubmit={async (data) => {
                  try {
                    // Convert features string back to array before saving
                    const carData = {
                      ...data,
                      features: data.features 
                        ? (typeof data.features === 'string' 
                            ? data.features.split(',').map((f: string) => f.trim()).filter(Boolean) 
                            : data.features)
                        : []
                    };
                    const success = await onEditCar(carData);
                    if (success) {
                      setShowEditModal(null);
                    }
                    return success;
                  } catch (error) {
                    console.error('Error updating car:', error);
                    toast.error('Failed to update car');
                    return false;
                  }
                }}
                isSubmitting={isSubmitting}
                onCancel={() => setShowEditModal(null)}
                onImageUpload={async (files) => {
                  if (showEditModal?.id) {
                    return await handleImageUpload(Number(showEditModal.id), files);
                  }
                  return false;
                }}
                onDeleteImage={async (imageId) => {
                  if (showEditModal?.id) {
                    return await handleDeleteImage(Number(showEditModal.id), imageId);
                  }
                  return false;
                }}
                onSetPrimaryImage={async (imageId) => {
                  if (showEditModal?.id) {
                    return await handleSetPrimaryImage(Number(showEditModal.id), imageId);
                  }
                  return false; // Return a boolean instead of Promise<void>
                }}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Car</h3>
                  <p className="text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Are you sure you want to delete this car?
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {showDeleteModal.year} {showDeleteModal.brand} {showDeleteModal.model}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{showDeleteModal.name}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDeleteCar(showDeleteModal.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Car
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Update Car Status</h3>
              <button
                onClick={() => setShowStatusModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="p-6 space-y-4">
              <div className="mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {showStatusModal.year} {showStatusModal.brand} {showStatusModal.model}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{showStatusModal.name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Status
                </label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData({ ...statusData, status: e.target.value as Car['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {statusData.status === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Bulk Actions</h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedCars.length} car(s) selected. Choose an action:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => onBulkAction('approve')}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left"
                >
                  <div className="font-medium">Approve All</div>
                  <div className="text-sm text-green-100">Set status to available</div>
                </button>

                <button
                  onClick={() => onBulkAction('reject')}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-left"
                >
                  <div className="font-medium">Reject All</div>
                  <div className="text-sm text-red-100">Set status to rejected</div>
                </button>

                <button
                  onClick={() => onBulkAction('deactivate')}
                  className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-left"
                >
                  <div className="font-medium">Deactivate All</div>
                  <div className="text-sm text-yellow-100">Set status to inactive</div>
                </button>

                <button
                  onClick={() => onBulkAction('delete')}
                  className="w-full px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-left"
                >
                  <div className="font-medium">Delete All</div>
                  <div className="text-sm text-red-100">Permanently remove cars</div>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarActionModals;