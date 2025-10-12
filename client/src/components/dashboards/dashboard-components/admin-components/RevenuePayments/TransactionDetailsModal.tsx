import * as React from "react";
import {
  useGetTransactionQuery,
  useApprovePayoutMutation,
} from "@/store/Admin/adminPaymentsApi";

const TransactionDetailsModal: React.FC<{
  transactionId: string | number | null;
  onClose: () => void;
}> = ({ transactionId, onClose }) => {
  const { data: tx, isLoading } = useGetTransactionQuery(transactionId as any, {
    skip: !transactionId,
  });
  const [approve, { isLoading: approving }] = useApprovePayoutMutation();

  if (!transactionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="bg-slate-800 text-white rounded-lg shadow-2xl z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-semibold">Transaction Details</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-10 text-slate-400">
            Loading transaction details...
          </div>
        )}
        
        {!isLoading && tx && (
          <div className="space-y-4">
            {/* Transaction Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Transaction ID</div>
                <div className="font-mono text-sm">{tx.transactionId}</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Amount</div>
                <div className="text-lg font-semibold text-green-400">${tx.amount}</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Customer</div>
                <div className="text-sm">{tx.customer?.name || "-"}</div>
                {tx.customer && 'email' in tx.customer && (tx.customer as { email?: string }).email && (
                  <div className="text-xs text-slate-400 mt-1">{(tx.customer as { email?: string }).email}</div>
                )}
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Owner</div>
                <div className="text-sm">{tx.owner?.name || "-"}</div>
                {tx.owner && 'email' in tx.owner && (tx.owner as { email?: string }).email && (
                  <div className="text-xs text-slate-400 mt-1">{(tx.owner as { email?: string }).email}</div>
                )}
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Car</div>
                <div className="text-sm">{tx.car?.title || "-"}</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Payment Method</div>
                <div className="text-sm capitalize">{tx.paymentMethod}</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Status</div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    tx.status === 'success'
                      ? 'bg-green-600/20 text-green-400'
                      : tx.status === 'pending'
                      ? 'bg-yellow-600/20 text-yellow-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Date</div>
                <div className="text-sm">{new Date(tx.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={async () => {
                  if (!tx || !tx.meta?.payoutId) return;
                  await approve({ payoutId: tx.meta.payoutId });
                }}
                disabled={approving || tx?.status !== "success"}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {approving ? 'Processing...' : 'Release Payout'}
              </button>

              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
