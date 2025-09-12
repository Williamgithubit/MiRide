import React, { useState, useMemo } from "react";
import { Rental } from "../store/Rental/rentalApi";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { useAppDispatch } from "../store/hooks";
import useRentals from "../store/hooks/useRentals";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RentalListProps {
  rentals: Rental[];
  onRentalDeleted: (rentalId: number) => Promise<void>;
  setMessage: (message: { text: string; type: "success" | "error" }) => void;
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 6;

const RentalList: React.FC<RentalListProps> = ({
  rentals,
  onRentalDeleted,
  setMessage,
  isLoading: propIsLoading,
}) => {
  const { user } = useReduxAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired"
  >("all");
  const [sortKey, setSortKey] = useState<"name" | "cost" | "date">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingRentalId, setDeletingRentalId] = useState<number | null>(null);

  // Use the Redux hooks for rentals
  const { cancelRentalById, isLoading: isCancellingRental } = useRentals();

  // Combine loading states
  const isLoading = propIsLoading || isCancellingRental;

  // Define the handleDeleteRental function
  const handleDeleteRental = async (rentalId: number) => {
    if (!window.confirm("Are you sure you want to cancel this rental?")) {
      return;
    }

    setDeletingRentalId(rentalId);
    try {
      // Use the Redux cancelRentalById function
      await cancelRentalById(rentalId);

      // Still call the parent component's callback to maintain compatibility
      if (onRentalDeleted) {
        await onRentalDeleted(rentalId);
      }

      toast.success("Rental cancelled successfully");
      setMessage({
        text: "Rental cancelled successfully",
        type: "success",
      });
    } catch (error: any) {
      toast.error("Failed to cancel rental");
      setMessage({
        text: error?.data?.message || "Failed to cancel rental",
        type: "error",
      });
    } finally {
      setDeletingRentalId(null);
    }
  };

  const filteredRentals = useMemo(() => {
    return rentals
      .filter((rental) => {
        const carName = rental.car?.name?.toLowerCase() || "";
        const carModel = rental.car?.model?.toLowerCase() || "";
        const matchesSearch =
          carName.includes(searchTerm.toLowerCase()) ||
          carModel.includes(searchTerm.toLowerCase());

        const isExpired = new Date(rental.endDate) < new Date();
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && !isExpired) ||
          (statusFilter === "expired" && isExpired);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortKey === "name") {
          return (a.car?.name || "").localeCompare(b.car?.name || "");
        } else if (sortKey === "cost") {
          return b.totalCost - a.totalCost;
        } else {
          return (
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
        }
      });
  }, [rentals, searchTerm, statusFilter, sortKey]);

  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] p-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading rentals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="flex flex-wrap gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search by car name or model"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-full md:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as any)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="cost">Sort by Cost</option>
        </select>
      </div>

      {filteredRentals.length === 0 ? (
        <div className="p-6 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-lg text-center">
          <p className="text-lg font-medium">No matching rentals found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {paginatedRentals.map((rental) => {
              const isExpired = new Date(rental.endDate) < new Date();
              const isOwner =
                rental.customerId.toString() === user?.id?.toString();
              const canCancel = !isExpired && isOwner;

              return (
                <div
                  key={rental.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                            {rental.car?.name ?? "Unnamed Car"}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            Model: {rental.car?.model ?? "Unknown"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isExpired
                              ? "bg-gray-100 text-gray-500"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </div>

                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">
                            Start Date:
                          </span>
                          <span className="text-sm font-medium">
                            {rental.startDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-500">
                            End Date:
                          </span>
                          <span className="text-sm font-medium">
                            {rental.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-100">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="text-lg font-semibold text-primary-500">
                            ${rental.totalCost}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => handleDeleteRental(rental.id)}
                          disabled={
                            !canCancel || deletingRentalId === rental.id
                          }
                          className={`w-full px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 ${
                            canCancel && deletingRentalId === rental.id
                              ? "bg-blue-400 text-white cursor-wait"
                              : !canCancel
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>
                            {deletingRentalId === rental.id
                              ? "Cancelling..."
                              : "Cancel Rental"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md border text-sm ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RentalList;
