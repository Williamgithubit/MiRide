import React, { useMemo, useState } from "react";
import {
  useGetTransactionsQuery,
  useLazyExportTransactionsQuery,
} from "@/store/Admin/adminPaymentsApi";
import { downloadBlob, csvFromTransactions } from "./exportPayments";
import { useGetCustomersQuery } from "@/store/Customer/customerApi";
import { useGetUsersQuery } from "@/store/User/userManagementApi";

interface Props {
  filters: Record<string, any>;
  onChangeFilters: (next: Record<string, any>) => void;
  onSelectTransaction: (id: number | string) => void;
}

const TransactionsTable: React.FC<Props> = ({
  filters,
  onChangeFilters,
  onSelectTransaction,
}) => {
  const { data, isLoading } = useGetTransactionsQuery(filters);
  const [triggerExport] = useLazyExportTransactionsQuery();
  const [q, setQ] = useState("");

  const { data: ownersData } = useGetUsersQuery({ role: "owner" });
  const { data: customersData } = useGetCustomersQuery();

  const owners = ownersData?.users || [];
  const customers = customersData || [];

  const [ownerInput, setOwnerInput] = useState("");
  const [customerInput, setCustomerInput] = useState("");

  const filteredOwners = useMemo(
    () =>
      owners.filter((o) =>
        o.name.toLowerCase().includes(ownerInput.toLowerCase())
      ),
    [owners, ownerInput]
  );

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) =>
        c.name.toLowerCase().includes(customerInput.toLowerCase())
      ),
    [customers, customerInput]
  );

  const items = data?.items || [];

  const onSearch = () => {
    onChangeFilters({ search: q, page: 1 });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-3 sm:p-4 text-white w-full">
      {/* Filter Section */}
      <div className="flex flex-col gap-3 mb-4">
        {/* Search and Filters Row */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="flex gap-2 flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search transactions"
              className="flex-1 px-3 py-2 rounded bg-slate-700 text-white text-sm"
            />
            <button
              onClick={onSearch}
              className="px-4 py-2 bg-indigo-600 rounded text-white text-sm whitespace-nowrap hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filter Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Owner Autocomplete */}
          <div className="relative">
            <input
              type="text"
              value={ownerInput}
              onChange={(e) => setOwnerInput(e.target.value)}
              placeholder="Owner name"
              className="w-full px-3 py-2 rounded bg-slate-700 text-white text-sm"
              autoComplete="off"
            />
            {ownerInput && filteredOwners.length > 0 && (
              <div className="absolute z-10 bg-slate-800 border border-slate-700 rounded w-full mt-1 max-h-40 overflow-y-auto">
                {filteredOwners.map((o) => (
                  <div
                    key={o.id}
                    className="px-3 py-2 cursor-pointer hover:bg-slate-700 text-sm"
                    onClick={() => {
                      onChangeFilters({ owner: o.name, page: 1 });
                      setOwnerInput(o.name);
                    }}
                  >
                    {o.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Autocomplete */}
          <div className="relative">
            <input
              type="text"
              value={customerInput}
              onChange={(e) => setCustomerInput(e.target.value)}
              placeholder="Customer name"
              className="w-full px-3 py-2 rounded bg-slate-700 text-white text-sm"
              autoComplete="off"
            />
            {customerInput && filteredCustomers.length > 0 && (
              <div className="absolute z-10 bg-slate-800 border border-slate-700 rounded w-full mt-1 max-h-40 overflow-y-auto">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    className="px-3 py-2 cursor-pointer hover:bg-slate-700 text-sm"
                    onClick={() => {
                      onChangeFilters({ customer: c.name, page: 1 });
                      setCustomerInput(c.name);
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) =>
              onChangeFilters({ startDate: e.target.value, page: 1 })
            }
            className="w-full px-3 py-2 rounded bg-slate-700 text-white text-sm"
          />
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) =>
              onChangeFilters({ endDate: e.target.value, page: 1 })
            }
            className="w-full px-3 py-2 rounded bg-slate-700 text-white text-sm"
          />
        </div>

        {/* Status and Export Row */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onChangeFilters({ status: e.target.value || undefined, page: 1 })
            }
            className="px-3 py-2 rounded bg-slate-700 text-white text-sm"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <button
            className="px-4 py-2 bg-green-600 rounded text-white text-sm whitespace-nowrap hover:bg-green-700 transition"
            onClick={async () => {
              try {
                const blob = await triggerExport(filters).unwrap();
                downloadBlob(blob, "transactions_export.csv");
              } catch (e) {
                const blob = csvFromTransactions(items);
                downloadBlob(blob, "transactions_export.csv");
              }
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm">ID</th>
              <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm hidden md:table-cell">Owner</th>
              <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Customer</th>
              <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Amount</th>
              <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Status</th>
              <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm hidden lg:table-cell">Date</th>
              <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Loading transactions...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              items.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition"
                  onClick={() => onSelectTransaction(t.id)}
                >
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-mono">
                    #{t.id}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">
                    {(t as any).ownerName || 'N/A'}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                    {(t as any).customerName || 'N/A'}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-green-400">
                    ${t.amount}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        t.status === 'success'
                          ? 'bg-green-600/20 text-green-400'
                          : t.status === 'pending'
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell text-slate-400">
                    {(t as any).date || 'N/A'}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                    <button className="text-indigo-400 hover:text-indigo-300 font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;
