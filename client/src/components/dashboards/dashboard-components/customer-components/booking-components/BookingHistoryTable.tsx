import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { BookingStatus } from "../../../../../store/Booking/bookingSlice";
import {
  useGetReviewsByCustomerQuery,
  useCreateReviewMutation,
  CreateReview,
  UpdateReview,
} from "../../../../../store/Review/reviewApi";
import { Rental } from "../../../../../store/Rental/rentalApi";
import BookingStatusBadge from "./BookingStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import ReviewForm from "../review-components/ReviewForm";
import { toast } from "react-hot-toast";
import { getPrimaryImageUrl } from "../../../../../utils/imageUtils";

interface BookingHistoryTableProps {
  bookings: BookingStatus[];
}

const BookingHistoryTable: React.FC<BookingHistoryTableProps> = ({
  bookings,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof BookingStatus>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingStatus | null>(
    null
  );

  // Get customer reviews to check which bookings have been reviewed
  const { data: reviews = [] } = useGetReviewsByCustomerQuery(user?.id || "", {
    skip: !user?.id,
  });
  const [createReview, { isLoading: createLoading }] =
    useCreateReviewMutation();

  // Create a set of reviewed booking IDs for quick lookup
  const reviewedBookingIds = useMemo(() => {
    return new Set(reviews.map((review) => review.rentalId));
  }, [reviews]);

  // Sort bookings
  const sortedBookings = [...bookings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle undefined/null values - put them at the end
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === "asc" ? 1 : -1;
    if (bValue == null) return sortDirection === "asc" ? -1 : 1;

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = sortedBookings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (field: keyof BookingStatus) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canReview = (booking: BookingStatus) => {
    return (
      booking.status === "completed" && !reviewedBookingIds.has(booking.id)
    );
  };

  const handleWriteReview = (booking: BookingStatus) => {
    setSelectedBooking(booking);
    setShowReviewForm(true);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setSelectedBooking(null);
  };

  const handleSubmitReview = async (
    reviewData: CreateReview | UpdateReview
  ) => {
    try {
      await createReview(reviewData as CreateReview).unwrap();
      toast.success("Review submitted successfully!");
      handleCloseReviewForm();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  const SortIcon = ({ field }: { field: keyof BookingStatus }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕️</span>;
    }
    return <span>{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No booking history
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Your completed and cancelled bookings will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort("car")}
              >
                <div className="flex items-center gap-1">
                  Car <SortIcon field="car" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort("startDate")}
              >
                <div className="flex items-center gap-1">
                  Dates <SortIcon field="startDate" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort("totalAmount")}
              >
                <div className="flex items-center gap-1">
                  Amount <SortIcon field="totalAmount" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedBookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {booking.car?.imageUrl || booking.car?.images?.length ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={getPrimaryImageUrl(
                            booking.car?.images,
                            booking.car?.imageUrl
                          )}
                          alt={`${booking.car.name} ${booking.car.model}`}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.car?.name} {booking.car?.model}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.car?.brand} • {booking.car?.year}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDate(booking.startDate)} -{" "}
                    {formatDate(booking.endDate)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {booking.totalDays}{" "}
                    {booking.totalDays === 1 ? "day" : "days"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <BookingStatusBadge status={booking.status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PaymentStatusBadge
                    status={booking.paymentStatus}
                    size="sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  ${(Number(booking.totalAmount) || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      View Details
                    </button>
                    {canReview(booking) && (
                      <button
                        onClick={() => handleWriteReview(booking)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Write Review
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {paginatedBookings.map((booking) => (
          <div
            key={booking.id}
            className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 mr-3">
                  {booking.car?.imageUrl || booking.car?.images?.length ? (
                    <img
                      className="h-12 w-12 rounded-lg object-cover"
                      src={getPrimaryImageUrl(
                        booking.car?.images,
                        booking.car?.imageUrl
                      )}
                      alt={`${booking.car.name} ${booking.car.model}`}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        viewBox="0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.car?.name} {booking.car?.model}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {booking.car?.brand} • {booking.car?.year}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  ${(Number(booking.totalAmount) || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Dates:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(booking.startDate)} -{" "}
                  {formatDate(booking.endDate)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Status:
                </span>
                <div className="flex gap-2">
                  <BookingStatusBadge status={booking.status} size="sm" />
                  <PaymentStatusBadge
                    status={booking.paymentStatus}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex gap-2">
              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                View Details
              </button>
              {canReview(booking) && (
                <button
                  onClick={() => handleWriteReview(booking)}
                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                >
                  Write Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, bookings.length)} of{" "}
              {bookings.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && selectedBooking && (
        <ReviewForm
          isOpen={showReviewForm}
          onClose={handleCloseReviewForm}
          onSubmit={handleSubmitReview}
          loading={createLoading}
          review={null}
          carInfo={{
            id: selectedBooking.carId,
            name: selectedBooking.car?.name || "",
            model: selectedBooking.car?.model || "",
            brand: selectedBooking.car?.brand || "",
            year: selectedBooking.car?.year || new Date().getFullYear(),
            imageUrl:
              selectedBooking.car?.images?.[0]?.imageUrl ||
              selectedBooking.car?.imageUrl,
            images: selectedBooking.car?.images,
          }}
          rentalInfo={{
            id: selectedBooking.id,
            startDate: selectedBooking.startDate,
            endDate: selectedBooking.endDate,
          }}
          mode="create"
        />
      )}
    </div>
  );
};

export default BookingHistoryTable;
