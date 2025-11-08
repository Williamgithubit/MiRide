import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// client/src/components/dashboards/dashboard-components/owner-components/MaintenanceSection.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Table from "@/components/dashboards/shared/Table";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Plus, Calendar, DollarSign, Wrench, AlertTriangle, CheckCircle, Clock, XCircle, Edit, Trash2, } from "lucide-react";
import { useGetMaintenanceByOwnerQuery, useGetMaintenanceStatsQuery, useUpdateMaintenanceMutation, useDeleteMaintenanceMutation, } from "@/store/Maintenance/maintenanceApi";
export const MaintenanceSection = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    // Avoid unused variable complaints in some builds
    void showAddModal;
    void editingRecord;
    // Use RTK Query hooks
    const { data: maintenanceRecords = [], isLoading: recordsLoading, isError: recordsIsError, error: recordsError, refetch: refetchRecords, } = useGetMaintenanceByOwnerQuery();
    const { data: stats, isLoading: statsLoading, isError: statsIsError, error: statsError, refetch: refetchStats, } = useGetMaintenanceStatsQuery();
    const [updateMaintenance] = useUpdateMaintenanceMutation();
    const [deleteMaintenance] = useDeleteMaintenanceMutation();
    const loading = recordsLoading || statsLoading;
    const hasError = recordsIsError || statsIsError;
    // Handle errors
    useEffect(() => {
        if (recordsError) {
            console.error("Error fetching maintenance records:", recordsError);
            toast.error("Failed to load maintenance records");
        }
        if (statsError) {
            console.error("Error fetching maintenance stats:", statsError);
            toast.error("Failed to load maintenance statistics");
        }
    }, [recordsError, statsError]);
    const handleStatusUpdate = async (recordId, newStatus) => {
        try {
            await updateMaintenance({ id: recordId, status: newStatus }).unwrap();
            toast.success("Maintenance status updated successfully");
        }
        catch (error) {
            console.error("Error updating maintenance status:", error);
            toast.error("Failed to update maintenance status");
        }
    };
    const handleDelete = async (recordId) => {
        if (!confirm("Are you sure you want to delete this maintenance record?")) {
            return;
        }
        try {
            await deleteMaintenance(recordId).unwrap();
            toast.success("Maintenance record deleted successfully");
        }
        catch (error) {
            console.error("Error deleting maintenance record:", error);
            toast.error("Failed to delete maintenance record");
        }
    };
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "completed":
                return "default";
            case "in-progress":
                return "secondary";
            case "cancelled":
                return "destructive";
            default:
                return "outline";
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return _jsx(CheckCircle, { className: "h-4 w-4" });
            case "in-progress":
                return _jsx(Clock, { className: "h-4 w-4" });
            case "cancelled":
                return _jsx(XCircle, { className: "h-4 w-4" });
            default:
                return _jsx(Calendar, { className: "h-4 w-4" });
        }
    };
    const getPriorityBadgeVariant = (priority) => {
        switch (priority) {
            case "urgent":
                return "destructive";
            case "high":
                return "secondary";
            case "medium":
                return "outline";
            default:
                return "outline";
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case "emergency":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-500" });
            case "repair":
                return _jsx(Wrench, { className: "h-4 w-4 text-orange-500" });
            default:
                return _jsx(Wrench, { className: "h-4 w-4 text-blue-500" });
        }
    };
    const columns = [
        {
            key: "car",
            label: "Vehicle",
            render: (value, row) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: row.car.imageUrl || "/placeholder-car.jpg", alt: `${row.car.make} ${row.car.model}`, className: "w-12 h-12 rounded-md object-cover" }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium text-white", children: [row.car.make, " ", row.car.model] }), _jsx("div", { className: "text-sm text-gray-400", children: row.car.year })] })] })),
        },
        {
            key: "type",
            label: "Type",
            render: (value, row) => (_jsxs("div", { className: "flex items-center gap-2", children: [getTypeIcon(row.type), _jsx("span", { className: "capitalize text-white", children: row.type })] })),
        },
        {
            key: "description",
            label: "Description",
            render: (value, row) => (_jsxs("div", { className: "max-w-xs", children: [_jsx("div", { className: "font-medium text-white truncate", children: row.description }), row.serviceProvider && (_jsx("div", { className: "text-sm text-gray-400", children: row.serviceProvider }))] })),
        },
        {
            key: "priority",
            label: "Priority",
            render: (value, row) => (_jsx(Badge, { variant: getPriorityBadgeVariant(row.priority), children: row.priority.toUpperCase() })),
        },
        {
            key: "status",
            label: "Status",
            render: (value, row) => (_jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(row.status), _jsx(Badge, { variant: getStatusBadgeVariant(row.status), children: row.status.charAt(0).toUpperCase() + row.status.slice(1) })] })),
        },
        {
            key: "dates",
            label: "Dates",
            render: (value, row) => (_jsxs("div", { className: "text-sm", children: [row.scheduledDate && (_jsxs("div", { className: "text-white", children: ["Scheduled: ", format(new Date(row.scheduledDate), "MMM d, yyyy")] })), row.completedDate && (_jsxs("div", { className: "text-gray-400", children: ["Completed: ", format(new Date(row.completedDate), "MMM d, yyyy")] }))] })),
        },
        {
            key: "cost",
            label: "Cost",
            render: (value, row) => (_jsxs("div", { className: "font-medium text-white", children: ["$", row.cost.toFixed(2)] })),
        },
        {
            key: "actions",
            label: "Actions",
            render: (value, row) => (_jsxs("div", { className: "flex gap-2", children: [row.status === "scheduled" && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleStatusUpdate(row.id, "in-progress"), className: "h-8 px-2", children: "Start" })), row.status === "in-progress" && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleStatusUpdate(row.id, "completed"), className: "h-8 px-2", children: "Complete" })), _jsx(Button, { size: "sm", variant: "outline", onClick: () => setEditingRecord(row), className: "h-8 px-2", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleDelete(row.id), className: "h-8 px-2 text-red-500 hover:text-red-700", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })),
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight text-white", children: "Maintenance Records" }), _jsxs(Button, { onClick: () => setShowAddModal(true), className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add Maintenance"] })] }), hasError && (_jsx("div", { className: "bg-red-900/20 border border-red-500/50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-red-400 font-semibold mb-1", children: "Error Loading Data" }), _jsxs("p", { className: "text-red-300 text-sm mb-3", children: [recordsIsError && 'Failed to load maintenance records. ', statsIsError && 'Failed to load statistics. ', "Please try again."] }), _jsx(Button, { onClick: () => {
                                        refetchRecords();
                                        refetchStats();
                                    }, variant: "outline", size: "sm", className: "text-red-400 border-red-500 hover:bg-red-900/30", children: "Retry" })] })] }) })), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-gray-800 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "h-5 w-5 text-green-500" }), _jsx("h3", { className: "font-medium text-white", children: "Total Cost" })] }), _jsxs("p", { className: "text-2xl font-bold text-white mt-2", children: ["$", stats.totalCost.toFixed(2)] })] }), _jsxs("div", { className: "bg-gray-800 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5 text-blue-500" }), _jsx("h3", { className: "font-medium text-white", children: "Upcoming" })] }), _jsx("p", { className: "text-2xl font-bold text-white mt-2", children: stats.upcomingMaintenance })] }), _jsxs("div", { className: "bg-gray-800 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }), _jsx("h3", { className: "font-medium text-white", children: "Completed" })] }), _jsx("p", { className: "text-2xl font-bold text-white mt-2", children: stats.statusBreakdown.find((s) => s.status === "completed")?.count || 0 })] }), _jsxs("div", { className: "bg-gray-800 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5 text-orange-500" }), _jsx("h3", { className: "font-medium text-white", children: "In Progress" })] }), _jsx("p", { className: "text-2xl font-bold text-white mt-2", children: stats.statusBreakdown.find((s) => s.status === "in-progress")?.count || 0 })] })] })), _jsx("div", { className: "bg-gray-800 rounded-lg", children: _jsx(Table, { columns: columns, data: maintenanceRecords, searchable: true, pagination: true, pageSize: 10, loading: loading }) })] }));
};
