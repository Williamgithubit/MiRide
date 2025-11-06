import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import Sidebar from "../shared/Sidebar";
import TopNavbar from "../shared/TopNavbar";
import {
  useGetCarsByOwnerQuery,
  useDeleteCarMutation,
  Car,
} from "../../../store/Car/carApi";
import {
  useGetOwnerBookingsQuery,
  Rental,
} from "../../../store/Rental/rentalApi";
import toast from "react-hot-toast";
import OverviewSection from "../dashboard-components/owner-components/OverviewSection";
import CarListingsSection from "../dashboard-components/owner-components/CarListingsSection";
import { BookingRequestsSection } from "../dashboard-components/owner-components/BookingRequestsSection";
import EarningsSection from "../dashboard-components/owner-components/EarningsSection";
import Analytics from "../dashboard-components/owner-components/Analytics";
import Maintenance from "../dashboard-components/owner-components/maintenance-components/Maintenance";
import { ReviewsSection } from "../dashboard-components/owner-components/ReviewsSection";
import { OwnerReviews } from "../dashboard-components/owner-components/OwnerReviews";
import { OwnerNotifications } from "../dashboard-components/owner-components/OwnerNotifications";
import CarDetailsModal from "../dashboard-components/owner-components/CarDetailsModal";
import EditCarModal from "../dashboard-components/owner-components/EditCarModal";
import DeleteConfirmationModal from "../dashboard-components/owner-components/DeleteConfirmationModal";
import AddCarModal from "../dashboard-components/owner-components/AddCarModal";

const OwnerDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Use RTK Query hooks
  const {
    data: ownerCars = [],
    isLoading,
    error: carsError,
    refetch: refetchCars,
  } = useGetCarsByOwnerQuery();

  const {
    data: ownerRentalsData = [],
    isLoading: rentalsLoading,
    error: rentalsError,
    refetch: refetchRentals,
  } = useGetOwnerBookingsQuery();

  const [deleteCar] = useDeleteCarMutation();

  // Memoize expensive calculations and derived data
  const totalCars = React.useMemo(() => Array.isArray(ownerCars) ? ownerCars.length : 0, [ownerCars]);
  const availableCars = React.useMemo(
    () => Array.isArray(ownerCars) ? ownerCars.filter((car) => car.isAvailable).length : 0,
    [ownerCars]
  );
  const rentedCars = React.useMemo(
    () => totalCars - availableCars,
    [totalCars, availableCars]
  );
  const avgRating = React.useMemo(
    () => {
      if (!Array.isArray(ownerCars) || ownerCars.length === 0) return 0;
      
      const validRatings = ownerCars
        .map(car => Number(car.rating) || 0)
        .filter(rating => !isNaN(rating) && rating > 0);
      
      if (validRatings.length === 0) return 0;
      
      const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
      const average = sum / validRatings.length;
      
      return isNaN(average) ? 0 : average;
    },
    [ownerCars]
  );

  // Calculate real earnings from actual rental data
  const totalEarnings = React.useMemo(
    () => {
      if (!Array.isArray(ownerRentalsData)) return 0;
      return ownerRentalsData.reduce((sum, rental) => {
        // Only count completed rentals for earnings
        if (rental.status === 'completed') {
          const amount = Number(rental.totalAmount) || Number(rental.totalCost) || 0;
          return sum + (isNaN(amount) ? 0 : amount);
        }
        return sum;
      }, 0);
    },
    [ownerRentalsData]
  );

  // Count total rentals from real data
  const totalRentals = React.useMemo(
    () => Array.isArray(ownerRentalsData) ? ownerRentalsData.length : 0,
    [ownerRentalsData]
  );

  const revenueChartData = React.useMemo(
    () => ({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Revenue",
          data: Array.from({ length: 6 }, (_, index) =>
            Math.floor((totalEarnings / 6) * (1 + Math.sin(index) * 0.3))
          ),
          borderColor: "#104911",
          backgroundColor: "rgba(16, 73, 17, 0.08)",
          tension: 0.4,
        },
      ],
    }),
    [totalEarnings]
  );

  const carStatusChartData = React.useMemo(
    () => ({
      labels: ["Available", "Rented", "Maintenance"],
      datasets: [
        {
          data: [availableCars, rentedCars, Math.floor(totalCars * 0.1)],
          backgroundColor: ["#104911", "#F59E0B", "#EF4444"],
          borderWidth: 0,
        }],
    }),
    [availableCars, rentedCars, totalCars]
  );

  // Process real rental data for display
  const ownerRentals = React.useMemo(
    () => {
      if (!Array.isArray(ownerRentalsData)) return [];
      return ownerRentalsData.slice(0, 5).map((rental) => ({
        id: rental.id,
        carId: rental.carId,
        carDetails: rental.car 
          ? `${rental.car.year || ''} ${rental.car.brand || rental.car.brand || ''} ${rental.car.model || ''}`.trim()
          : 'Unknown Car',
        customerName: rental.customer?.name || 'Unknown Customer',
        startDate: new Date(rental.startDate).toLocaleDateString(),
        endDate: new Date(rental.endDate).toLocaleDateString(),
        totalCost: Number(rental.totalAmount) || Number(rental.totalCost) || 0,
        status: rental.status,
      }));
    },
    [ownerRentalsData]
  );

  // Handle errors
  useEffect(() => {
    if (carsError) {
      console.error("Error fetching cars:", carsError);
      toast.error("Failed to load cars");
    }
    if (rentalsError) {
      console.error("Error fetching rentals:", rentalsError);
      toast.error("Failed to load rental data");
    }
  }, [carsError, rentalsError]);

  const handleCarAdded = () => {
    refetchCars(); // Refresh the car list
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setShowEditCarModal(true);
  };

  const handleCarUpdated = () => {
    refetchCars(); // Refresh the car list
    setShowEditCarModal(false);
    setEditingCar(null);
  };

  const handleDeleteCar = (car: Car) => {
    setDeletingCar(car);
    setShowDeleteModal(true);
  };

  const confirmDeleteCar = async () => {
    if (!deletingCar?.id) return;

    setIsDeleting(true);
    try {
      await deleteCar(deletingCar.id).unwrap();
      toast.success("Car deleted successfully");
      setShowDeleteModal(false);
      setDeletingCar(null);
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Failed to delete car");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingCar(null);
  };

  const carColumns = [
    {
      key: "imageUrl",
      label: "Car",
      render: (value: string, row: Car) => {
        if (!row) return "-";
        return (
          <div className="flex items-center space-x-3">
            <img
              src={value || "/placeholder-car.jpg"}
              alt={row.model || "Car"}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-car.jpg";
              }}
            />
            <div>
              <p className="font-medium">
                {row.year || ""} {row.brand || ""} {row.model || ""}
              </p>
              <p className="text-sm text-gray-500">{row.name || ""}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "isAvailable",
      label: "Status",
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Available" : "Unavailable"}
        </span>
      ),
    },
    {
      key: "rentalPricePerDay",
      label: "Daily Rate",
      render: (value: number) => (value ? `$${value}` : "$0"),
    },
    {
      key: "reviews",
      label: "Reviews",
      render: (value: number) => value || 0,
      sortable: true,
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: number) => {
        const numValue =
          typeof value === "number" ? value : parseFloat(value) || 0;
        return `⭐ ${numValue.toFixed(1)}`;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_value: unknown, row: Car) => {
        if (!row) return "-";
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCar(row)}
              className="p-1 text-primary-500 hover:bg-blue-100 rounded"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditCar(row)}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="Edit Car"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCar(row)}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              title="Delete Car"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  // Ensure ownerCars items have defined ids for downstream components
  const sanitizedOwnerCars = React.useMemo(
    () => Array.isArray(ownerCars) ? ownerCars.map((c, idx) => ({ ...c, id: c.id ?? idx })) : [],
    [ownerCars]
  );

  const rentalColumns = [
    {
      key: "id",
      label: "Booking ID",
      render: (value: number) => `#${value.toString().padStart(4, "0")}`,
    },
    {
      key: "customerName",
      label: "Customer",
    },
    {
      key: "carDetails",
      label: "Car",
    },
    {
      key: "startDate",
      label: "Start Date",
    },
    {
      key: "endDate",
      label: "End Date",
    },
    {
      key: "totalCost",
      label: "Amount",
      render: (value: number) => `$${value}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "completed"
              ? "bg-green-100 text-green-800"
              : value === "active"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        if (isLoading || rentalsLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          );
        }

        if (carsError || rentalsError) {
          return (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Failed to load dashboard data</p>
              <button
                onClick={() => {
                  refetchCars();
                  refetchRentals();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          );
        }

        return (
          <OverviewSection
            totalEarnings={totalEarnings}
            totalRentals={totalRentals}
            availableCars={availableCars}
            avgRating={avgRating}
            revenueChartData={revenueChartData}
            carStatusChartData={carStatusChartData}
            rentalColumns={rentalColumns}
            ownerRentals={ownerRentals}
          />
        );

      case "car-listings":
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          );
        }

        if (carsError) {
          return (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Failed to load cars</p>
              <button
                onClick={() => refetchCars()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          );
        }

        return (
          <CarListingsSection
            carColumns={carColumns}
            ownerCars={ownerCars}
            onAddCarClick={() => setShowAddCarModal(true)}
          />
        );

      case "booking-requests":
        return <BookingRequestsSection />;
      case "earnings":
        return (
          <EarningsSection
            totalEarnings={totalEarnings}
            ownerCars={sanitizedOwnerCars}
          />
        );

      case "analytics":
        return <Analytics />;

      case "maintenance":
        return <Maintenance />;

      case "owner-reviews":
        return <OwnerReviews />;

      case "notifications":
        return <OwnerNotifications />;

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Select a section from the sidebar to view content.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        role="owner"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full md:ml-64">
        <TopNavbar 
          title="Owner Dashboard" 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 w-full">
          {renderContent()}
        </main>
      </div>

      <AddCarModal
        isOpen={showAddCarModal}
        onClose={() => setShowAddCarModal(false)}
        onCarAdded={handleCarAdded}
      />

      <CarDetailsModal
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        selectedCar={selectedCar}
      />

      {editingCar && (
        <EditCarModal
          isOpen={showEditCarModal}
          onClose={() => {
            setShowEditCarModal(false);
            setEditingCar(null);
          }}
          car={editingCar}
          onCarUpdated={handleCarUpdated}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeleteCar}
        car={deletingCar}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default OwnerDashboard;
