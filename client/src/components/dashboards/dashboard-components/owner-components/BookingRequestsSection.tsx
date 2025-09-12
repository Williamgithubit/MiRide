// client/src/components/dashboards/dashboard-components/owner-components/BookingRequestsSection.tsx
import { useState, useEffect } from "react";
import Table from "@/components/dashboards/shared/Table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetRentalsQuery,
  useUpdateRentalMutation,
} from "@/store/Rental/rentalApi";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Loader2, Check, X } from "lucide-react";

interface BookingRequest {
  id: string;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    image: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalCost: number;
  status: "pending" | "active" | "cancelled" | "completed";
}

export const BookingRequestsSection = () => {
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  // Use RTK Query hooks
  const {
    data: rentals = [],
    isLoading: loading,
    error: rentalsError,
  } = useGetRentalsQuery();

  const [updateRental] = useUpdateRentalMutation();

  // Transform Rental[] to BookingRequest[]
  const bookings: BookingRequest[] = rentals.map((rental) => ({
    id: rental.id.toString(),
    car: {
      id: rental.car?.id?.toString() || rental.carId.toString(),
      make: rental.car?.make || rental.car?.name?.split(" ")[0] || "Unknown",
      model: rental.car?.model || rental.car?.name || "Unknown",
      year: rental.car?.year || new Date().getFullYear(),
      image: rental.car?.imageUrl || "/placeholder-car.jpg",
    },
    customer: {
      id: rental.customer?.id?.toString() || rental.customerId.toString(),
      name: rental.customer?.name || "Unknown Customer",
      email: rental.customer?.email || "unknown@email.com",
    },
    startDate: rental.startDate,
    endDate: rental.endDate,
    totalCost: rental.totalCost,
    status: rental.status === "active" ? "pending" : rental.status,
  }));

  // Handle errors
  useEffect(() => {
    if (rentalsError) {
      console.error("Error fetching rentals:", rentalsError);
      toast.error("Failed to load booking requests");
    }
  }, [rentalsError]);

  const handleUpdateStatus = async (
    bookingId: string,
    status: "confirmed" | "cancelled"
  ) => {
    try {
      setUpdating((prev) => ({ ...prev, [bookingId]: true }));
      const rentalStatus = status === "confirmed" ? "active" : "cancelled";
      await updateRental({
        id: parseInt(bookingId),
        status: rentalStatus,
      }).unwrap();
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(`Failed to ${status} booking`);
    } finally {
      setUpdating((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const columns = [
    {
      key: "car",
      label: "Car",
      render: (value: unknown, row: BookingRequest) => (
        <div className="flex items-center gap-3">
          <img
            src={row.car.image || "/placeholder-car.jpg"}
            alt={`${row.car.make} ${row.car.model}`}
            className="w-12 h-12 rounded-md object-cover"
          />
          <div>
            <div className="font-medium">
              {row.car.make} {row.car.model}
            </div>
            <div className="text-sm text-gray-500">{row.car.year}</div>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: unknown, row: BookingRequest) => (
        <div>
          <div className="font-medium">{row.customer.name}</div>
          <div className="text-sm text-gray-500">{row.customer.email}</div>
        </div>
      ),
    },
    {
      key: "dates",
      label: "Rental Period",
      render: (value: unknown, row: BookingRequest) => (
        <div>
          <div>
            {format(new Date(row.startDate), "MMM d, yyyy")} -{" "}
            {format(new Date(row.endDate), "MMM d, yyyy")}
          </div>
          <div className="text-sm text-gray-500">
            {Math.ceil(
              (new Date(row.endDate).getTime() -
                new Date(row.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            days
          </div>
        </div>
      ),
    },
    {
      key: "totalCost",
      label: "Total Cost",
      render: (value: unknown, row: BookingRequest) =>
        `$${(typeof row.totalCost === "number"
          ? row.totalCost
          : parseFloat(row.totalCost) || 0
        ).toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown, row: BookingRequest) => (
        <Badge
          variant={
            row.status === "active" || row.status === "completed"
              ? "default"
              : row.status === "cancelled"
              ? "destructive"
              : "outline"
          }
        >
          {row.status
            ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
            : "Unknown"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: unknown, row: BookingRequest) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                onClick={() => handleUpdateStatus(row.id, "confirmed")}
                disabled={!!updating[row.id]}
              >
                {updating[row.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                onClick={() => handleUpdateStatus(row.id, "cancelled")}
                disabled={!!updating[row.id]}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Booking Requests
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Table
        columns={columns}
        data={bookings}
        searchable={true}
        pagination={true}
        pageSize={10}
      />
    </div>
  );
};
