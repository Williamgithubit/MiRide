import React, { useState } from "react";
import SummaryCards from "./SummaryCards";
import TransactionsTable from "./TransactionsTable";
import RevenueCharts from "./RevenueCharts";
import TransactionDetailsModal from "./TransactionDetailsModal";

const RevenuePayments: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<
    number | string | null
  >(null);
  const [filters, setFilters] = useState<Record<string, any>>({
    page: 1,
    pageSize: 10,
  });

  return (
    <div className="p-4 sm:p-6 w-full max-w-full overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Revenue & Payments</h2>
      
      {/* Summary Cards */}
      <SummaryCards filters={filters} />

      {/* Transactions Table - Full Width */}
      <div className="mt-6">
        <TransactionsTable
          filters={filters}
          onSelectTransaction={(id) => setSelectedTransaction(id)}
          onChangeFilters={(next) => setFilters((s) => ({ ...s, ...next }))}
        />
      </div>

      {/* Revenue Charts - Below Table */}
      <div className="mt-6">
        <RevenueCharts filters={filters} />
      </div>

      <TransactionDetailsModal
        transactionId={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

export default RevenuePayments;
