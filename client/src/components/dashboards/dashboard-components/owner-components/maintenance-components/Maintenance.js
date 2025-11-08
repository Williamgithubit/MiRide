import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { FaPlus, FaWrench, FaClock, FaCheck, FaExclamationTriangle, FaSyncAlt, FaBell } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useGetMaintenanceByOwnerQuery, useCreateMaintenanceMutation, useUpdateMaintenanceMutation, useDeleteMaintenanceMutation } from '../../../../../store/Maintenance/maintenanceApi';
import MaintenanceTable from './MaintenanceTable';
import MaintenanceForm from './MaintenanceForm';
import { DeleteConfirmationModal, MaintenanceDetailsModal, CompleteMaintenanceModal } from './MaintenanceActionModals';
const Maintenance = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    // API hooks
    const { data: maintenanceRecords = [], isLoading, isError, error, refetch } = useGetMaintenanceByOwnerQuery();
    // Debug logging
    React.useEffect(() => {
        console.log('Maintenance Query State:', {
            isLoading,
            isError,
            error,
            recordsCount: maintenanceRecords.length
        });
    }, [isLoading, isError, error, maintenanceRecords]);
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
        const totalCost = maintenanceRecords
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + r.cost, 0);
        // Calculate upcoming maintenance (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const upcoming = maintenanceRecords.filter(r => {
            if (!r.scheduledDate || r.status === 'completed')
                return false;
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
            totalCost
        };
    }, [maintenanceRecords]);
    // Event handlers
    const handleAddNew = () => {
        setEditingRecord(null);
        setShowForm(true);
    };
    const handleEdit = (record) => {
        setEditingRecord(record);
        setShowForm(true);
    };
    const handleDelete = (record) => {
        setSelectedRecord(record);
        setShowDeleteModal(true);
    };
    const handleViewDetails = (record) => {
        setSelectedRecord(record);
        setShowDetailsModal(true);
    };
    const handleMarkCompleted = (record) => {
        setSelectedRecord(record);
        setShowCompleteModal(true);
    };
    const handleFormSubmit = async (data) => {
        try {
            console.log('Submitting maintenance data:', data);
            if ('id' in data) {
                // Update existing record
                console.log('Updating maintenance record...');
                await updateMaintenance(data).unwrap();
                toast.success('Maintenance record updated successfully');
            }
            else {
                // Create new record
                console.log('Creating new maintenance record...');
                const result = await createMaintenance(data).unwrap();
                console.log('Maintenance record created:', result);
                toast.success('Maintenance record created successfully');
            }
            setShowForm(false);
            setEditingRecord(null);
        }
        catch (error) {
            console.error('Error submitting maintenance:', error);
            toast.error(error?.data?.message || error?.message || 'Failed to save maintenance record');
        }
    };
    const handleConfirmDelete = async () => {
        if (!selectedRecord)
            return;
        try {
            await deleteMaintenance(selectedRecord.id).unwrap();
            toast.success('Maintenance record deleted successfully');
            setShowDeleteModal(false);
            setSelectedRecord(null);
        }
        catch (error) {
            toast.error(error?.data?.message || 'Failed to delete maintenance record');
        }
    };
    const handleConfirmComplete = async () => {
        if (!selectedRecord)
            return;
        try {
            await updateMaintenance({
                id: selectedRecord.id,
                status: 'completed',
                completedDate: new Date().toISOString()
            }).unwrap();
            toast.success('Maintenance marked as completed');
            setShowCompleteModal(false);
            setSelectedRecord(null);
        }
        catch (error) {
            toast.error(error?.data?.message || 'Failed to update maintenance status');
        }
    };
    const handleRefresh = () => {
        refetch();
        toast.success('Maintenance data refreshed');
    };
    // Show error state
    if (isError) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Maintenance Management" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Track and manage vehicle maintenance schedules" })] }) }), _jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(FaExclamationTriangle, { className: "w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-red-900 dark:text-red-100 mb-2", children: "Failed to Load Maintenance Records" }), _jsx("p", { className: "text-red-700 dark:text-red-300 mb-4", children: error?.data?.message || error?.message || 'An error occurred while fetching maintenance data. Please try again.' }), _jsxs("button", { onClick: () => refetch(), className: "flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors", children: [_jsx(FaSyncAlt, { className: "w-4 h-4" }), _jsx("span", { children: "Retry" })] })] })] }) })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Maintenance Management" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Track and manage vehicle maintenance schedules" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: handleRefresh, className: "p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors", title: "Refresh Data", children: _jsx(FaSyncAlt, { className: "w-5 h-5" }) }), _jsxs("button", { onClick: handleAddNew, className: "flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: [_jsx(FaPlus, { className: "w-4 h-4" }), _jsx("span", { children: "Add Maintenance" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Total Records" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats.total })] }), _jsx("div", { className: "w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center", children: _jsx(FaWrench, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Scheduled" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600 dark:text-yellow-400", children: stats.scheduled })] }), _jsx("div", { className: "w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center", children: _jsx(FaClock, { className: "w-6 h-6 text-yellow-600 dark:text-yellow-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Completed" }), _jsx("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: stats.completed })] }), _jsx("div", { className: "w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center", children: _jsx(FaCheck, { className: "w-6 h-6 text-green-600 dark:text-green-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Urgent" }), _jsx("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: stats.urgent })] }), _jsx("div", { className: "w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center", children: _jsx(FaExclamationTriangle, { className: "w-6 h-6 text-red-600 dark:text-red-400" }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Upcoming (30 days)" }), _jsx("p", { className: "text-xl font-bold text-orange-600 dark:text-orange-400", children: stats.upcoming }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Maintenance due soon" })] }), _jsx("div", { className: "w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center", children: _jsx(FaBell, { className: "w-5 h-5 text-orange-600 dark:text-orange-400" }) })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Total Spent" }), _jsxs("p", { className: "text-xl font-bold text-purple-600 dark:text-purple-400", children: ["$", (Number(stats.totalCost) || 0).toFixed(2)] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Completed maintenance" })] }), _jsx("div", { className: "w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center", children: _jsx(FaWrench, { className: "w-5 h-5 text-purple-600 dark:text-purple-400" }) })] }) })] }), _jsx(MaintenanceTable, { maintenanceRecords: maintenanceRecords, loading: isLoading, onEdit: handleEdit, onDelete: (recordId) => {
                    const record = maintenanceRecords.find(r => r.id === recordId);
                    if (record)
                        handleDelete(record);
                }, onViewDetails: handleViewDetails, onMarkCompleted: (recordId) => {
                    const record = maintenanceRecords.find(r => r.id === recordId);
                    if (record)
                        handleMarkCompleted(record);
                }, updating: {
                    [selectedRecord?.id?.toString() || '']: isUpdating || isDeleting
                } }), _jsx(MaintenanceForm, { isOpen: showForm, onClose: () => {
                    setShowForm(false);
                    setEditingRecord(null);
                }, onSubmit: handleFormSubmit, editingRecord: editingRecord, loading: isCreating || isUpdating }), _jsx(DeleteConfirmationModal, { isOpen: showDeleteModal, onClose: () => {
                    setShowDeleteModal(false);
                    setSelectedRecord(null);
                }, onConfirm: handleConfirmDelete, record: selectedRecord, loading: isDeleting }), _jsx(MaintenanceDetailsModal, { isOpen: showDetailsModal, onClose: () => {
                    setShowDetailsModal(false);
                    setSelectedRecord(null);
                }, record: selectedRecord }), _jsx(CompleteMaintenanceModal, { isOpen: showCompleteModal, onClose: () => {
                    setShowCompleteModal(false);
                    setSelectedRecord(null);
                }, onConfirm: handleConfirmComplete, record: selectedRecord, loading: isUpdating })] }));
};
export default Maintenance;
