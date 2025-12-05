import React from "react";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import DashboardCard from "../../shared/DashboardCard";
import { useCustomerData } from "./useCustomerData";

const CustomerPayments: React.FC = () => {
  const { totalSpent, totalBookings, customerRentals } = useCustomerData();

  // Debug logging
  React.useEffect(() => {
    console.log("CustomerPayments - Debug Info:", {
      totalRentals: customerRentals?.length || 0,
      customerRentals: customerRentals,
      rentalsWithPaymentStatus:
        customerRentals?.filter((r) => r.paymentStatus).length || 0,
      sampleRental: customerRentals?.[0],
    });
  }, [customerRentals]);

  // Show all rentals, sorted by date (payment status defaults to 'pending' in the database)
  const paymentsData = (customerRentals || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Local filter state
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [minAmount, setMinAmount] = React.useState("");

  const filteredPayments = paymentsData.filter((rental) => {
    // Text search: car, booking id, transaction id
    const carName = rental.car
      ? `${rental.car.year} ${rental.car.brand} ${rental.car.model}`
      : "";
    const txId =
      rental.paymentIntentId || rental.stripeSessionId || `TXN-${rental.id}`;
    const textMatch = `${carName} ${rental.id} ${txId}`
      .toLowerCase()
      .includes(query.toLowerCase());

    // Status match
    const statusMatch =
      statusFilter === "all" ||
      (rental.paymentStatus || "pending") === statusFilter;

    // Date range match (based on createdAt)
    let dateMatch = true;
    if (startDate) {
      dateMatch = new Date(rental.createdAt) >= new Date(startDate);
    }
    if (endDate) {
      dateMatch = dateMatch && new Date(rental.createdAt) <= new Date(endDate);
    }

    // Amount match
    let amountMatch = true;
    if (minAmount) {
      amountMatch =
        (Number(rental.totalAmount) || Number(rental.totalCost) || 0) >=
        Number(minAmount);
    }

    return textMatch && statusMatch && dateMatch && amountMatch;
  });

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return {
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
          icon: CheckCircle,
          label: "Paid",
        };
      case "pending":
        return {
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
          icon: Clock,
          label: "Pending",
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
          icon: XCircle,
          label: "Failed",
        };
      case "refunded":
        return {
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
          icon: CheckCircle,
          label: "Refunded",
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
          icon: Clock,
          label: "Unknown",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="Total Spent"
          value={`$${(Number(totalSpent) || 0).toFixed(2)}`}
          icon={CreditCard}
        />
        <DashboardCard
          title="Average per Booking"
          value={`$${
            totalBookings > 0
              ? ((Number(totalSpent) || 0) / totalBookings).toFixed(2)
              : "0.00"
          }`}
          icon={CreditCard}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Payment History
        </h4>
        <div>
          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Search by car, booking id, or transaction id"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {filteredPayments.length > 0 ? (
            <div className="space-y-4">
              {filteredPayments.map((rental) => {
                const paymentConfig = getPaymentStatusConfig(
                  rental.paymentStatus || "pending"
                );
                const PaymentIcon = paymentConfig.icon;
                const carName = rental.car
                  ? `${rental.car.year} ${rental.car.brand} ${rental.car.model}`
                  : "N/A";

                // Transaction id fallback
                const txId =
                  rental.paymentIntentId ||
                  rental.stripeSessionId ||
                  `TXN-${rental.id}`;
                // Payment method placeholder (may be provided by API in future)
                const paymentMethod =
                  (rental as any).paymentMethod ||
                  (rental as any).paymentInfo?.paymentMethod ||
                  "Card";
                const pickup =
                  rental.pickupLocation ||
                  (rental as any).pickup_location ||
                  "Not provided";
                const dropoff =
                  rental.dropoffLocation ||
                  (rental as any).dropoff_location ||
                  "Not provided";
                const serviceFee =
                  (rental as any).platformFee ||
                  (rental as any).platform_fee ||
                  null;
                const refunds = (rental as any).refunds || null;

                return (
                  <div
                    key={rental.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Booking #{rental.id.toString().padStart(4, "0")}
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${paymentConfig.color}`}
                            >
                              <PaymentIcon className="w-3 h-3" />
                              {paymentConfig.label}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              $
                              {(
                                Number(rental.totalAmount) ||
                                Number(rental.totalCost) ||
                                0
                              ).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(rental.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">
                          {carName}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <div>
                              {new Date(rental.startDate).toLocaleDateString()}{" "}
                              — {new Date(rental.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <div>{paymentMethod}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-mono text-sm text-gray-700 dark:text-gray-200">
                              {txId}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <div>
                            <div className="text-xs text-gray-400">Pickup</div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {pickup}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">
                              Drop-off
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {dropoff}
                            </div>
                          </div>
                        </div>

                        {(serviceFee || refunds) && (
                          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            {serviceFee != null && (
                              <div>
                                Service fee: ${Number(serviceFee).toFixed(2)}
                              </div>
                            )}
                            {refunds && (
                              <div>
                                Refunds/adjustments: {JSON.stringify(refunds)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No payment records found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Your payment history will appear here once you make bookings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPayments;
