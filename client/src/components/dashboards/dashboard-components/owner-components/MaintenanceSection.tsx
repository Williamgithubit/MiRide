// client/src/components/dashboards/dashboard-components/owner-components/MaintenanceSection.tsx
import { useState, useEffect } from "react";

type MaintenanceStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "cancelled";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Table from "@/components/dashboards/shared/Table";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  Plus,
  Calendar,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import {
  useGetMaintenanceByOwnerQuery,
  useGetMaintenanceStatsQuery,
  useUpdateMaintenanceMutation,
  useDeleteMaintenanceMutation,
  CarMaintenanceRecord,
} from "@/store/Maintenance/maintenanceApi";
import { getImageUrl } from "@/utils/imageUtils";

export const MaintenanceSection = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<CarMaintenanceRecord | null>(null);
  // Avoid unused variable complaints in some builds
  void showAddModal;
  void editingRecord;

  // Use RTK Query hooks
  const {
    data: maintenanceRecords = [],
    isLoading: recordsLoading,
    isError: recordsIsError,
    error: recordsError,
    refetch: refetchRecords,
  } = useGetMaintenanceByOwnerQuery();

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsIsError,
    error: statsError,
    refetch: refetchStats,
  } = useGetMaintenanceStatsQuery();

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

  const handleStatusUpdate = async (
    recordId: number,
    newStatus: MaintenanceStatus
  ) => {
    try {
      await updateMaintenance({ id: recordId, status: newStatus }).unwrap();
      toast.success("Maintenance status updated successfully");
    } catch (error) {
      console.error("Error updating maintenance status:", error);
      toast.error("Failed to update maintenance status");
    }
  };

  const handleDelete = async (recordId: number) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) {
      return;
    }

    try {
      await deleteMaintenance(recordId).unwrap();
      toast.success("Maintenance record deleted successfully");
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      toast.error("Failed to delete maintenance record");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "repair":
        return <Wrench className="h-4 w-4 text-orange-500" />;
      default:
        return <Wrench className="h-4 w-4 text-blue-500" />;
    }
  };

  const columns = [
    {
      key: "car",
      label: "Vehicle",
      render: (value: unknown, row: CarMaintenanceRecord) => (
        <div className="flex items-center gap-3">
          <img
            src={getImageUrl(row.car.imageUrl)}
            alt={`${row.car.make} ${row.car.model}`}
            className="w-12 h-12 rounded-md object-cover"
          />
          <div>
            <div className="font-medium text-white">
              {row.car.make} {row.car.model}
            </div>
            <div className="text-sm text-gray-400">{row.car.year}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: unknown, row: CarMaintenanceRecord) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row.type)}
          <span className="capitalize text-white">{row.type}</span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value: unknown, row: CarMaintenanceRecord) => (
        <div className="max-w-xs">
          <div className="font-medium text-white truncate">
            {row.description}
          </div>
          {row.serviceProvider && (
            <div className="text-sm text-gray-400">{row.serviceProvider}</div>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value: unknown, row: CarMaintenanceRecord) => (
        <Badge variant={getPriorityBadgeVariant(row.priority)}>
          {row.priority.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown, row: CarMaintenanceRecord) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.status)}
          <Badge variant={getStatusBadgeVariant(row.status)}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: "dates",
      label: "Dates",
      render: (value: unknown, row: CarMaintenanceRecord) => (
        <div className="text-sm">
          {row.scheduledDate && (
            <div className="text-white">
              Scheduled: {format(new Date(row.scheduledDate), "MMM d, yyyy")}
            </div>
          )}
          {row.completedDate && (
            <div className="text-gray-400">
              Completed: {format(new Date(row.completedDate), "MMM d, yyyy")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "cost",
      label: "Cost",
      render: (value: unknown, row: CarMaintenanceRecord) => (
        <div className="font-medium text-white">${row.cost.toFixed(2)}</div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: unknown, row: CarMaintenanceRecord) => (
        <div className="flex gap-2">
          {row.status === "scheduled" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(row.id, "in-progress")}
              className="h-8 px-2"
            >
              Start
            </Button>
          )}
          {row.status === "in-progress" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(row.id, "completed")}
              className="h-8 px-2"
            >
              Complete
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingRecord(row)}
            className="h-8 px-2"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(row.id)}
            className="h-8 px-2 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Maintenance Records
        </h2>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Maintenance
        </Button>
      </div>

      {/* Error Display */}
      {hasError && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold mb-1">Error Loading Data</h3>
              <p className="text-red-300 text-sm mb-3">
                {recordsIsError && 'Failed to load maintenance records. '}
                {statsIsError && 'Failed to load statistics. '}
                Please try again.
              </p>
              <Button
                onClick={() => {
                  refetchRecords();
                  refetchStats();
                }}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-500 hover:bg-red-900/30"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-white">Total Cost</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              ${stats.totalCost.toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-white">Upcoming</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.upcomingMaintenance}
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-white">Completed</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.statusBreakdown.find(
                (s: { status: string }) => s.status === "completed"
              )?.count || 0}
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <h3 className="font-medium text-white">In Progress</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.statusBreakdown.find(
                (s: { status: string }) => s.status === "in-progress"
              )?.count || 0}
            </p>
          </div>
        </div>
      )}

      {/* Maintenance Records Table */}
      <div className="bg-gray-800 rounded-lg">
        <Table
          columns={columns}
          data={maintenanceRecords}
          searchable={true}
          pagination={true}
          pageSize={10}
          loading={loading}
        />
      </div>
    </div>
  );
};
