import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Wallet,
  Clock,
  Smartphone,
  Plus,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetAccountStatusQuery,
  useGetOwnerBalanceQuery,
  useCreateExpressAccountMutation,
  useCreateAccountLinkMutation,
  useWithdrawOwnerEarningsMutation,
  useGetWithdrawalHistoryQuery,
} from "../../../../store/StripeConnect/stripeConnectApi";

const EnhancedEarningsSection: React.FC = () => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showMobileMoneyModal, setShowMobileMoneyModal] = useState(false);
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'orange' | 'mtn' | null>(null);

  // Fetch account status and balance
  const { data: accountStatus, isLoading: statusLoading, refetch: refetchStatus } = useGetAccountStatusQuery();
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useGetOwnerBalanceQuery();
  const { data: withdrawalHistory } = useGetWithdrawalHistoryQuery({ page: 1, limit: 5 });

  // Mutations
  const [createExpressAccount, { isLoading: creatingAccount }] = useCreateExpressAccountMutation();
  const [createAccountLink, { isLoading: creatingLink }] = useCreateAccountLinkMutation();
  const [withdrawEarnings, { isLoading: withdrawing }] = useWithdrawOwnerEarningsMutation();

  const loading = statusLoading || balanceLoading;

  // Handle Stripe onboarding
  const handleStartOnboarding = async () => {
    try {
      // First create account if needed
      if (!accountStatus?.hasAccount) {
        const result = await createExpressAccount().unwrap();
        toast.success(result.message);
        await refetchStatus();
      }

      // Then create account link
      const linkResult = await createAccountLink().unwrap();
      window.location.href = linkResult.url;
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to start onboarding");
      console.error("Onboarding error:", error);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > (balance?.availableBalance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      const result = await withdrawEarnings({ amount }).unwrap();
      toast.success(`Successfully withdrew $${amount.toFixed(2)}`);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      refetchBalance();
    } catch (error: any) {
      toast.error(error?.data?.error || "Withdrawal failed");
      console.error("Withdrawal error:", error);
    }
  };

  // Check for URL params (onboarding success/refresh)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Stripe account setup completed!");
      refetchStatus();
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("refresh") === "true") {
      refetchStatus();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [refetchStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show onboarding prompt if not set up
  if (!accountStatus?.onboardingComplete) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 border border-blue-200 dark:border-gray-600">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <CreditCard className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Set Up Your Payment Account
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Complete your Stripe account setup to start receiving payments and withdraw your earnings.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Fast payouts to your bank account</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Track all your earnings in one place</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Mobile Money options (Orange & MTN) coming soon</span>
                </div>
              </div>
              <button
                onClick={handleStartOnboarding}
                disabled={creatingAccount || creatingLink}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingAccount || creatingLink ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Complete Setup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Show pending balance if any */}
        {balance && balance.pendingBalance > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Pending Earnings: ${balance.pendingBalance.toFixed(2)}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Complete your account setup to access your earnings
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Balance</p>
            <Wallet className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${balance?.availableBalance.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ready to withdraw</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${balance?.totalEarnings.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${balance?.pendingBalance.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Processing</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Withdrawn</p>
            <DollarSign className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${balance?.totalWithdrawn.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lifetime</p>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          Payment Methods
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stripe/Bank Account */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Bank Account</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">via Stripe</p>
              </div>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={!balance?.availableBalance || balance.availableBalance <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <ArrowUpRight className="h-4 w-4" />
              Withdraw
            </button>
          </div>

          {/* Orange Money */}
          <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-orange-50/30 dark:bg-orange-900/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Smartphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Orange Money</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mobile Money</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMoneyProvider('orange');
                setShowMobileMoneyModal(true);
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Setup (Coming Soon)
            </button>
          </div>

          {/* Lonestar MTN */}
          <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50/30 dark:bg-yellow-900/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Smartphone className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Lonestar MTN</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mobile Money</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMoneyProvider('mtn');
                setShowMobileMoneyModal(true);
              }}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Setup (Coming Soon)
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-white">
            <strong>Note:</strong> Mobile Money payment options are coming soon! You'll be able to receive payments directly to your Orange Money or Lonestar MTN Mobile Money account.
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {balance?.recentPayments && balance.recentPayments.length > 0 ? (
              balance.recentPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Rental #{payment.rentalId}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      +${payment.amount.toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'succeeded' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent payments</p>
            )}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Withdrawals</h3>
          <div className="space-y-3">
            {withdrawalHistory?.withdrawals && withdrawalHistory.withdrawals.length > 0 ? (
              withdrawalHistory.withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Withdrawal</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      -${withdrawal.amount.toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      withdrawal.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      withdrawal.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      withdrawal.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No withdrawals yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/20 dark:border-gray-700/50">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Withdraw Earnings</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available Balance</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${balance?.availableBalance.toFixed(2) || "0.00"}
              </p>
            </div>

            <div className="mb-6">
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
                  max={balance?.availableBalance || 0}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={() => setWithdrawAmount(balance?.availableBalance.toFixed(2) || "0")}
                className="text-sm text-blue-600 dark:text-white hover:underline mt-2"
              >
                Withdraw all
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Mobile Money Setup Modal */}
      {showMobileMoneyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Smartphone className={`h-6 w-6 ${mobileMoneyProvider === 'orange' ? 'text-orange-600' : 'text-yellow-600'}`} />
                {mobileMoneyProvider === 'orange' ? 'Orange Money' : 'Lonestar MTN Mobile Money'}
              </h3>
              <button
                onClick={() => {
                  setShowMobileMoneyModal(false);
                  setMobileMoneyProvider(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${
                mobileMoneyProvider === 'orange' 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Coming Soon!</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  We're working on integrating {mobileMoneyProvider === 'orange' ? 'Orange Money' : 'Lonestar MTN Mobile Money'} as a payment method. 
                  Soon you'll be able to:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-white">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Receive payments directly to your mobile money account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Instant withdrawals with no waiting period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Lower transaction fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Easy access to your funds anytime</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Stay tuned!</strong> We'll notify you as soon as this feature is available.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowMobileMoneyModal(false);
                  setMobileMoneyProvider(null);
                  toast.success('We\'ll notify you when mobile money is available!');
                }}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                  mobileMoneyProvider === 'orange'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedEarningsSection;
