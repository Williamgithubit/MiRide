import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import SummaryCards from "./SummaryCards";
import TransactionsTable from "./TransactionsTable";
import RevenueCharts from "./RevenueCharts";
import TransactionDetailsModal from "./TransactionDetailsModal";
const RevenuePayments = () => {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filters, setFilters] = useState({
        page: 1,
        pageSize: 10,
    });
    return (_jsxs("div", { className: "p-4 sm:p-6 w-full max-w-full overflow-x-hidden", children: [_jsx("h2", { className: "text-xl sm:text-2xl font-semibold mb-4", children: "Revenue & Payments" }), _jsx(SummaryCards, { filters: filters }), _jsx("div", { className: "mt-6", children: _jsx(TransactionsTable, { filters: filters, onSelectTransaction: (id) => setSelectedTransaction(id), onChangeFilters: (next) => setFilters((s) => ({ ...s, ...next })) }) }), _jsx("div", { className: "mt-6", children: _jsx(RevenueCharts, { filters: filters }) }), _jsx(TransactionDetailsModal, { transactionId: selectedTransaction, onClose: () => setSelectedTransaction(null) })] }));
};
export default RevenuePayments;
