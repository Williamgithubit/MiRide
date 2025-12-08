import React from "react";
import { useGetPaymentStatsQuery } from "@/store/Admin/adminPaymentsApi";

const SummaryCards: React.FC<{
  filters?: Record<string, any>;
  items?: any[];
  loading?: boolean;
}> = ({ filters, items, loading }) => {
  const { data: stats, isLoading } = useGetPaymentStatsQuery();

  // If parent passed items (from the transactions query), compute totals client-side
  const computed = React.useMemo(() => {
    if (!items || items.length === 0) return null;
    const active = items.filter(
      (t: any) => !(t.status === "refunded" || t.bookingStatus === "cancelled")
    );
    const totalRevenue = active.reduce(
      (s: number, t: any) => s + (Number(t.amount) || 0),
      0
    );
    const totalCommission = active.reduce(
      (s: number, t: any) => s + (Number(t.platformFee ?? t.platform_fee) || 0),
      0
    );
    return { totalRevenue, totalCommission };
  }, [items]);

  const displayTotalRevenue = computed
    ? computed.totalRevenue
    : stats?.totalRevenue;
  const displayMonthly = stats?.monthlyRevenue ?? "-";
  const displayPending = stats?.pendingPayments ?? "-";
  const displayCompleted = stats?.completedPayments ?? "-";

  const cards = [
    {
      title: "Pending Payments",
      value: displayPending,
      className: "bg-gradient-to-r from-yellow-600 to-yellow-500",
    },
    {
      title: "Completed Payments",
      value: displayCompleted,
      className: "bg-gradient-to-r from-teal-600 to-teal-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((c) => (
        <div
          key={c.title}
          className={`rounded-lg p-4 text-white ${c.className}`}
        >
          <div className="text-sm opacity-90">{c.title}</div>
          <div className="text-2xl font-bold mt-2">
            {loading || isLoading ? "Loading..." : c.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
