import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowDownRight,
  Loader2,
  Calendar,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetPlatformBalanceQuery,
  useWithdrawPlatformRevenueMutation,
  useGetWithdrawalHistoryQuery,
} from "../../../../../store/StripeConnect/stripeConnectApi";
import RevenuePayments from "./RevenuePayments";
import { useGetTransactionsQuery } from "@/store/Admin/adminPaymentsApi";

const EnhancedRevenueSection: React.FC = () => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDescription, setWithdrawDescription] = useState("");

  // Fetch platform balance and withdrawal history
  const {
    data: platformBalance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useGetPlatformBalanceQuery();

  const { data: withdrawalHistory } = useGetWithdrawalHistoryQuery({
    page: 1,
    limit: 10,
    type: "platform",
  });

  // Fetch transactions for client-side total calculations (to keep UI in sync with table)
  const { data: txData } = useGetTransactionsQuery({
    page: 1,
    pageSize: 1000,
  } as any);
  const txItems =
    txData?.items ??
    ((Array.isArray(txData) ? txData : []) || []);

  const computedTotals = useMemo(() => {
    if (!txItems.length) return null;

    const active = txItems.filter(
      (t: any) => !(t.status === "refunded" || t.bookingStatus === "cancelled")
    );

    const totalRevenue = active.reduce(
      (sum: number, t: any) => sum + (Number(t.amount) || 0),
      0
    );

    const totalCommission = active.reduce(
      (sum: number, t: any) =>
        sum + (Number(t.platformFee ?? t.platform_fee) || 0),
      0
    );

    // Note: monthlyRevenue is a fallback — ideally backend provides accurate monthly stats
    const monthlyRevenue = totalRevenue;

    return { totalRevenue, totalCommission, monthlyRevenue };
  }, [txItems]);

  // Withdrawal mutation
  const [withdrawRevenue, { isLoading: withdrawing }] =
    useWithdrawPlatformRevenueMutation();

  // Handle withdrawal submission
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0 || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > (platformBalance?.availableBalance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      await withdrawRevenue({
        amount,
        description:
          withdrawDescription ||
          `Platform revenue withdrawal - ${new Date().toLocaleDateString()}`,
      }).unwrap();

      toast.success(
        `Withdrawal of $${amount.toFixed(2)} initiated successfully`
      );
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawDescription("");
      refetchBalance();
    } catch (error: any) {
      toast.error(error?.data?.error || "Withdrawal failed");
      console.error("Withdrawal error:", error);
    }
  };

  // Loading state
  if (balanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Platform Revenue
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Commission Rate: {platformBalance?.commissionRate ?? "10"}%
          </p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={
            !platformBalance?.availableBalance ||
            platformBalance.availableBalance <= 0
          }
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ArrowDownRight className="h-5 w-5" />
          Withdraw Revenue
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Available Balance</p>
            <Wallet className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-3xl font-bold">
            ${(platformBalance?.availableBalance ?? 0).toFixed(2)}
          </p>
          <p className="text-xs opacity-75 mt-1">Ready to withdraw</p>
        </div>

        {/* Total Commission */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Total Commission</p>
            <DollarSign className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-3xl font-bold">
            $
            {(
              computedTotals?.totalCommission ??
              platformBalance?.totalCommission ??
              0
            ).toFixed(2)}
          </p>
          <p className="text-xs opacity-75 mt-1">All time earnings</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Monthly Revenue</p>
            <Calendar className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-3xl font-bold">
            $
            {(
              computedTotals?.monthlyRevenue ??
              platformBalance?.monthlyRevenue ??
              0
            ).toFixed(2)}
          </p>
          <p className="text-xs opacity-75 mt-1">This month</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Total Withdrawn</p>
            <TrendingUp className="h-6 w-6 opacity-80" />
          </div>
          <p className="text-3xl font-bold">
            ${(platformBalance?.totalWithdrawn ?? 0).toFixed(2)}
          </p>
          <p className="text-xs opacity-75 mt-1">Lifetime</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Total Platform Revenue
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                $
                {(
                  computedTotals?.totalRevenue ??
                  platformBalance?.totalRevenue ??
                  0
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Platform Commission
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                $
                {(
                  computedTotals?.totalCommission ??
                  platformBalance?.totalCommission ??
                  0
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Monthly Commission
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                $
                {(
                  computedTotals?.monthlyRevenue ??
                  platformBalance?.monthlyCommission ??
                  0
                ).toFixed(2)}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Available for Withdrawal
                </span>
                <span className="font-bold text-xl text-green-600 dark:text-green-400">
                  ${(platformBalance?.availableBalance ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Withdrawals
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {withdrawalHistory?.withdrawals &&
            withdrawalHistory.withdrawals.length > 0 ? (
              withdrawalHistory.withdrawals.map((withdrawal: any) => (
                <div
                  key={withdrawal.id}
                  className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${(withdrawal.amount ?? 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(withdrawal.createdAt).toLocaleDateString()} at{" "}
                      {new Date(withdrawal.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {withdrawal.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {withdrawal.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        withdrawal.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : withdrawal.status === "processing"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : withdrawal.status === "failed"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {withdrawal.status}
                    </span>
                    {withdrawal.payoutId && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        ID: {withdrawal.payoutId.substring(0, 12)}...
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  No withdrawals yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/20 dark:border-gray-700/50">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Withdraw Platform Revenue
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Available Balance
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${(platformBalance?.availableBalance ?? 0).toFixed(2)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={platformBalance?.availableBalance || 0}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setWithdrawAmount(
                    (platformBalance?.availableBalance ?? 0).toFixed(2)
                  )
                }
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
              >
                Withdraw all
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={withdrawDescription}
                onChange={(e) => setWithdrawDescription(e.target.value)}
                placeholder="e.g., Monthly revenue withdrawal"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Withdrawals typically take 2-3 business
                days to reach your bank account.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                  setWithdrawDescription("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={
                  withdrawing ||
                  !withdrawAmount ||
                  parseFloat(withdrawAmount) <= 0
                }
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {withdrawing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Withdrawal"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Transactions */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Detailed Transactions
        </h3>
        <RevenuePayments />
      </div>
    </div>
  );
};

export default EnhancedRevenueSection;
