import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useGetTransactionsQuery, useLazyExportTransactionsQuery, } from "@/store/Admin/adminPaymentsApi";
import { downloadBlob, csvFromTransactions } from "./exportPayments";
import { useGetCustomersQuery } from "@/store/Customer/customerApi";
import { useGetUsersQuery } from "@/store/User/userManagementApi";
const TransactionsTable = ({ filters, onChangeFilters, onSelectTransaction, }) => {
    const { data, isLoading } = useGetTransactionsQuery(filters);
    const [triggerExport] = useLazyExportTransactionsQuery();
    const [q, setQ] = useState("");
    const { data: ownersData } = useGetUsersQuery({ role: "owner" });
    const { data: customersData } = useGetCustomersQuery();
    const owners = ownersData?.users || [];
    const customers = customersData || [];
    const [ownerInput, setOwnerInput] = useState("");
    const [customerInput, setCustomerInput] = useState("");
    const filteredOwners = useMemo(() => owners.filter((o) => o.name.toLowerCase().includes(ownerInput.toLowerCase())), [owners, ownerInput]);
    const filteredCustomers = useMemo(() => customers.filter((c) => c.name.toLowerCase().includes(customerInput.toLowerCase())), [customers, customerInput]);
    const items = data?.items || [];
    const onSearch = () => {
        onChangeFilters({ search: q, page: 1 });
    };
    return (_jsxs("div", { className: "bg-slate-800 rounded-lg p-3 sm:p-4 text-white w-full", children: [_jsxs("div", { className: "flex flex-col gap-3 mb-4", children: [_jsx("div", { className: "flex flex-col sm:flex-row gap-2 items-stretch sm:items-center", children: _jsxs("div", { className: "flex gap-2 flex-1", children: [_jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search transactions", className: "flex-1 px-3 py-2 rounded bg-slate-700 text-white text-sm" }), _jsx("button", { onClick: onSearch, className: "px-4 py-2 bg-indigo-600 rounded text-white text-sm whitespace-nowrap hover:bg-indigo-700 transition", children: "Search" })] }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: ownerInput, onChange: (e) => setOwnerInput(e.target.value), placeholder: "Owner name", className: "w-full px-3 py-2 rounded bg-slate-700 text-white text-sm", autoComplete: "off" }), ownerInput && filteredOwners.length > 0 && (_jsx("div", { className: "absolute z-10 bg-slate-800 border border-slate-700 rounded w-full mt-1 max-h-40 overflow-y-auto", children: filteredOwners.map((o) => (_jsx("div", { className: "px-3 py-2 cursor-pointer hover:bg-slate-700 text-sm", onClick: () => {
                                                onChangeFilters({ owner: o.name, page: 1 });
                                                setOwnerInput(o.name);
                                            }, children: o.name }, o.id))) }))] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: customerInput, onChange: (e) => setCustomerInput(e.target.value), placeholder: "Customer name", className: "w-full px-3 py-2 rounded bg-slate-700 text-white text-sm", autoComplete: "off" }), customerInput && filteredCustomers.length > 0 && (_jsx("div", { className: "absolute z-10 bg-slate-800 border border-slate-700 rounded w-full mt-1 max-h-40 overflow-y-auto", children: filteredCustomers.map((c) => (_jsx("div", { className: "px-3 py-2 cursor-pointer hover:bg-slate-700 text-sm", onClick: () => {
                                                onChangeFilters({ customer: c.name, page: 1 });
                                                setCustomerInput(c.name);
                                            }, children: c.name }, c.id))) }))] }), _jsx("input", { type: "date", value: filters.startDate || "", onChange: (e) => onChangeFilters({ startDate: e.target.value, page: 1 }), className: "w-full px-3 py-2 rounded bg-slate-700 text-white text-sm" }), _jsx("input", { type: "date", value: filters.endDate || "", onChange: (e) => onChangeFilters({ endDate: e.target.value, page: 1 }), className: "w-full px-3 py-2 rounded bg-slate-700 text-white text-sm" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 items-stretch sm:items-center", children: [_jsxs("select", { value: filters.status || "", onChange: (e) => onChangeFilters({ status: e.target.value || undefined, page: 1 }), className: "px-3 py-2 rounded bg-slate-700 text-white text-sm", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "success", children: "Success" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "failed", children: "Failed" })] }), _jsx("button", { className: "px-4 py-2 bg-green-600 rounded text-white text-sm whitespace-nowrap hover:bg-green-700 transition", onClick: async () => {
                                    try {
                                        const blob = await triggerExport(filters).unwrap();
                                        downloadBlob(blob, "transactions_export.csv");
                                    }
                                    catch (e) {
                                        const blob = csvFromTransactions(items);
                                        downloadBlob(blob, "transactions_export.csv");
                                    }
                                }, children: "Export CSV" })] })] }), _jsx("div", { className: "overflow-x-auto -mx-3 sm:mx-0", children: _jsxs("table", { className: "min-w-full text-left text-sm", children: [_jsx("thead", { className: "bg-slate-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-2 sm:px-4 py-2 text-xs sm:text-sm", children: "ID" }), _jsx("th", { className: "px-2 sm:px-4 py-2 text-xs sm:text-sm hidden md:table-cell", children: "Owner" }), _jsx("th", { className: "px-2 sm:px-4 py-2 text-xs sm:text-sm", children: "Customer" }), _jsx("th", { className: "px-2 sm:px-4 py-2 text-xs sm:text-sm", children: "Amount" }), _jsx("th", { className: "px-2 sm:px-4 py-2 text-xs sm:text-sm", children: "Status" }), _jsx("th", { className: "px-2 sm:px-4 py-2 text-xs sm:text-sm hidden lg:table-cell", children: "Date" }), _jsx("th", { className: "px-2 sm:px-4 py-2 text-xs sm:text-sm", children: "Action" })] }) }), _jsx("tbody", { children: isLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-8 text-slate-400", children: "Loading transactions..." }) })) : items.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-8 text-slate-400", children: "No transactions found." }) })) : (items.map((t) => (_jsxs("tr", { className: "border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition", onClick: () => onSelectTransaction(t.id), children: [_jsxs("td", { className: "px-2 sm:px-4 py-3 text-xs sm:text-sm font-mono", children: ["#", t.id] }), _jsx("td", { className: "px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell", children: t.ownerName || 'N/A' }), _jsx("td", { className: "px-2 sm:px-4 py-3 text-xs sm:text-sm", children: t.customerName || 'N/A' }), _jsxs("td", { className: "px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-green-400", children: ["$", t.amount] }), _jsx("td", { className: "px-2 sm:px-4 py-3 text-xs sm:text-sm", children: _jsx("span", { className: `px-2 py-1 rounded text-xs ${t.status === 'success'
                                                ? 'bg-green-600/20 text-green-400'
                                                : t.status === 'pending'
                                                    ? 'bg-yellow-600/20 text-yellow-400'
                                                    : 'bg-red-600/20 text-red-400'}`, children: t.status }) }), _jsx("td", { className: "px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell text-slate-400", children: t.date || 'N/A' }), _jsx("td", { className: "px-2 sm:px-4 py-3 text-xs sm:text-sm", children: _jsx("button", { className: "text-indigo-400 hover:text-indigo-300 font-medium", children: "View" }) })] }, t.id)))) })] }) })] }));
};
export default TransactionsTable;
