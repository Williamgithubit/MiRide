import React, { useState, useEffect } from 'react';
import { FaTimes, FaCar, FaWrench, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import { CarMaintenanceRecord, CreateMaintenanceRecord, UpdateMaintenanceRecord } from '../../../../../store/Maintenance/maintenanceApi';
import { useGetCarsByOwnerQuery } from '../../../../../store/Car/carApi';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMaintenanceRecord | UpdateMaintenanceRecord) => void;
  editingRecord?: CarMaintenanceRecord | null;
  loading?: boolean;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRecord,
  loading = false
}) => {
  const { data: ownerCars = [], isLoading: carsLoading } = useGetCarsByOwnerQuery();
  
  const [formData, setFormData] = useState({
    carId: 0,
    type: 'routine' as 'routine' | 'repair' | 'inspection' | 'emergency',
    description: '',
    cost: 0,
    scheduledDate: '',
    serviceProvider: '',
    notes: '',
    mileage: 0,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      } else {
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
    const newErrors: Record<string, string> = {};

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

  const handleSubmit = (e: React.FormEvent) => {
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
      } as UpdateMaintenanceRecord);
    } else {
      onSubmit(submitData as CreateMaintenanceRecord);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FaWrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingRecord ? 'Edit Maintenance Record' : 'Add New Maintenance'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {editingRecord ? 'Update maintenance details' : 'Schedule new maintenance for your vehicle'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Car Selection */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaCar className="w-4 h-4" />
              <span>Select Car</span>
            </label>
            <select
              value={formData.carId}
              onChange={(e) => handleInputChange('carId', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.carId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={carsLoading}
            >
              <option value={0}>Select a car...</option>
              {ownerCars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} - {car.make} {car.model} ({car.year})
                </option>
              ))}
            </select>
            {errors.carId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.carId}</p>
            )}
          </div>

          {/* Type and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maintenance Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="routine">Routine Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="Describe the maintenance work needed..."
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Cost and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FaDollarSign className="w-4 h-4" />
                <span>Estimated Cost</span>
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cost ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cost}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FaCalendarAlt className="w-4 h-4" />
                <span>Scheduled Date</span>
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.scheduledDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.scheduledDate}</p>
              )}
            </div>
          </div>

          {/* Service Provider and Mileage Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Provider (Optional)
              </label>
              <input
                type="text"
                value={formData.serviceProvider}
                onChange={(e) => handleInputChange('serviceProvider', e.target.value)}
                placeholder="e.g., AutoCare Center"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Mileage (Optional)
              </label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                min="0"
                placeholder="e.g., 50000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              placeholder="Any additional information or special instructions..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{editingRecord ? 'Update Maintenance' : 'Add Maintenance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
