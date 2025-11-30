import React, { useState } from 'react';
import { 
  FaPlus, 
  FaWrench, 
  FaClock, 
  FaCheck, 
  FaExclamationTriangle,
  FaSyncAlt,
  FaBell
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import {
  useGetMaintenanceByOwnerQuery,
  useCreateMaintenanceMutation,
  useUpdateMaintenanceMutation,
  useDeleteMaintenanceMutation,
  CarMaintenanceRecord,
  CreateMaintenanceRecord,
  UpdateMaintenanceRecord
} from '../../../../../store/Maintenance/maintenanceApi';
import MaintenanceTable from './MaintenanceTable';
import MaintenanceForm from './MaintenanceForm';
import {
  DeleteConfirmationModal,
  MaintenanceDetailsModal,
  CompleteMaintenanceModal
} from './MaintenanceActionModals';

const Maintenance: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CarMaintenanceRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CarMaintenanceRecord | null>(null);

  // API hooks
  const { 
    data: maintenanceRecords = [], 
    isLoading,
    isError,
    error,
    refetch 
  } = useGetMaintenanceByOwnerQuery(undefined, {
    // Add polling interval to retry if stuck
    pollingInterval: 0,
    // Skip if already errored
    skip: false,
  });

  // Track loading timeout
  const [isLoadingTimeout, setIsLoadingTimeout] = React.useState(false);

  // Timeout handling
  React.useEffect(() => {
    // Set a timeout for loading state
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoadingTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      setIsLoadingTimeout(false);
    }
  }, [isLoading]);
  
  const [createMaintenance, { isLoading: isCreating }] = useCreateMaintenanceMutation();
  const [updateMaintenance, { isLoading: isUpdating }] = useUpdateMaintenanceMutation();
  const [deleteMaintenance, { isLoading: isDeleting }] = useDeleteMaintenanceMutation();

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = maintenanceRecords.length;
    const scheduled = maintenanceRecords.filter(r => r.status === 'scheduled').length;
    const inProgress = maintenanceRecords.filter(r => r.status === 'in-progress').length;
    const completed = maintenanceRecords.filter(r => r.status === 'completed').length;
    const urgent = maintenanceRecords.filter(r => r.priority === 'urgent' && r.status !== 'completed').length;
    // Total spent on completed maintenance
    const totalCost = maintenanceRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.cost, 0);
    
    // Total estimated cost (all maintenance including scheduled)
    const totalEstimatedCost = maintenanceRecords
      .reduce((sum, r) => sum + (r.cost || 0), 0);

    // Calculate upcoming maintenance (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcoming = maintenanceRecords.filter(r => {
      if (!r.scheduledDate || r.status === 'completed') return false;
      const scheduledDate = new Date(r.scheduledDate);
      return scheduledDate <= thirtyDaysFromNow && scheduledDate >= new Date();
    }).length;

    return {
      total,
      scheduled,
      inProgress,
      completed,
      urgent,
      upcoming,
      totalCost,
      totalEstimatedCost
    };
  }, [maintenanceRecords]);

  // Event handlers
  const handleAddNew = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEdit = (record: CarMaintenanceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = (record: CarMaintenanceRecord) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (record: CarMaintenanceRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleMarkCompleted = (record: CarMaintenanceRecord) => {
    setSelectedRecord(record);
    setShowCompleteModal(true);
  };

  const handleFormSubmit = async (data: CreateMaintenanceRecord | UpdateMaintenanceRecord) => {
    try {
      console.log('Submitting maintenance data:', data);
      
      if ('id' in data) {
        // Update existing record
        console.log('Updating maintenance record...');
        await updateMaintenance(data as UpdateMaintenanceRecord).unwrap();
        toast.success('Maintenance record updated successfully');
      } else {
        // Create new record
        console.log('Creating new maintenance record...');
        const result = await createMaintenance(data as CreateMaintenanceRecord).unwrap();
        console.log('Maintenance record created:', result);
        toast.success('Maintenance record created successfully');
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (error: any) {
      console.error('Error submitting maintenance:', error);
      toast.error(error?.data?.message || error?.message || 'Failed to save maintenance record');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;

    try {
      await deleteMaintenance(selectedRecord.id).unwrap();
      toast.success('Maintenance record deleted successfully');
      setShowDeleteModal(false);
      setSelectedRecord(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete maintenance record');
    }
  };

  const handleConfirmComplete = async () => {
    if (!selectedRecord) return;

    try {
      await updateMaintenance({
        id: selectedRecord.id,
        status: 'completed',
        completedDate: new Date().toISOString()
      }).unwrap();
      toast.success('Maintenance marked as completed');
      setShowCompleteModal(false);
      setSelectedRecord(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update maintenance status');
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Maintenance data refreshed');
  };

  // Show timeout error if loading takes too long
  if (isLoadingTimeout && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Maintenance Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage vehicle maintenance schedules
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <FaExclamationTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Loading Taking Longer Than Expected
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                The maintenance data is taking longer to load than usual. This might be due to:
              </p>
              <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 mb-4 space-y-1">
                <li>The maintenance table hasn't been created in the database yet</li>
                <li>Network connectivity issues</li>
                <li>Server is processing a large amount of data</li>
              </ul>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsLoadingTimeout(false);
                    refetch();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  <FaSyncAlt className="w-4 h-4" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={() => setIsLoadingTimeout(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Continue Waiting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Maintenance Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage vehicle maintenance schedules
            </p>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <FaExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Failed to Load Maintenance Records
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {(error as any)?.data?.message || (error as any)?.message || 'An error occurred while fetching maintenance data. Please try again.'}
              </p>
              <button
                onClick={() => refetch()}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FaSyncAlt className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Maintenance Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage vehicle maintenance schedules
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <FaSyncAlt className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Maintenance</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FaWrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.scheduled}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <FaClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <FaCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.urgent}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming (30 days)</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.upcoming}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance due soon</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <FaBell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                ${(Number(stats.totalEstimatedCost) || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">All maintenance records</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <FaWrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Table */}
      <MaintenanceTable
        maintenanceRecords={maintenanceRecords}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={(recordId) => {
          const record = maintenanceRecords.find(r => r.id === recordId);
          if (record) handleDelete(record);
        }}
        onViewDetails={handleViewDetails}
        onMarkCompleted={(recordId) => {
          const record = maintenanceRecords.find(r => r.id === recordId);
          if (record) handleMarkCompleted(record);
        }}
        updating={{
          [selectedRecord?.id?.toString() || '']: isUpdating || isDeleting
        }}
      />

      {/* Modals */}
      <MaintenanceForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingRecord(null);
        }}
        onSubmit={handleFormSubmit}
        editingRecord={editingRecord}
        loading={isCreating || isUpdating}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleConfirmDelete}
        record={selectedRecord}
        loading={isDeleting}
      />

      <MaintenanceDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />

      <CompleteMaintenanceModal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleConfirmComplete}
        record={selectedRecord}
        loading={isUpdating}
      />
    </div>
  );
};

export default Maintenance;
