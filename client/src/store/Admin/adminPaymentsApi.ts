import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { API_BASE_URL } from '../../config/api';

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  platformCommission: number;
}

export interface TransactionItem {
  id: number | string;
  transactionId: string;
  customer: { id: number; name: string } | null;
  owner: { id: number; name: string } | null;
  car: { id: number; title: string } | null;
  amount: number;
  currency?: string;
  paymentMethod: string;
  status: "success" | "pending" | "failed";
  createdAt: string;
  meta?: any;
}

interface TransactionsResponse {
  items: TransactionItem[];
  total: number;
  page: number;
  pageSize: number;
}

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/admin/payments`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    try {
      const state = getState() as RootState;
      let token = state?.auth?.token;
      if (!token && typeof window !== "undefined") {
        const storedAuth = localStorage.getItem("persist:root");
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          if (parsedAuth.auth) {
            const authState = JSON.parse(parsedAuth.auth);
            token = authState.token || null;
          }
        }
        if (!token) token = localStorage.getItem("token");
      }
      if (token) {
        const formattedToken = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
        headers.set("Authorization", formattedToken);
      }
      return headers;
    } catch (error) {
      return headers;
    }
  },
});

export const adminPaymentsApi = createApi({
  reducerPath: "adminPaymentsApi",
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (process.env.NODE_ENV === "development") {
      console.log("Admin Payments API Request:", args);
      console.log("Admin Payments API Result:", result);
    }
    return result;
  },
  tagTypes: ["Payments", "Transactions", "Payouts"],
  endpoints: (builder) => ({
    getPaymentStats: builder.query<PaymentStats, void>({
      query: () => ({ url: "/stats" }),
      providesTags: ["Payments"],
    }),

    getTransactions: builder.query<TransactionsResponse, Record<string, any>>({
      query: (params) => ({ url: "/transactions", params }),
      providesTags: (result) =>
        result
          ? [
              "Transactions",
              ...result.items.map((t) => ({
                type: "Transactions" as const,
                id: t.id,
              })),
            ]
          : ["Transactions"],
    }),

    getTransaction: builder.query<TransactionItem, string | number>({
      query: (id) => `/transactions/${id}`,
      providesTags: (result, error, id) => [
        { type: "Transactions" as const, id },
      ],
    }),

    approvePayout: builder.mutation<
      { success: boolean },
      { payoutId: string | number }
    >({
      query: ({ payoutId }) => ({
        url: `/payouts/${payoutId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Payments", "Payouts"],
    }),

    exportTransactions: builder.query<Blob, Record<string, any>>({
      query: (params) => ({
        url: "/export",
        params,
        responseHandler: (res: Response) => res.blob(),
      }),
    }),
  }),
});

export const {
  useGetPaymentStatsQuery,
  useGetTransactionsQuery,
  useLazyGetTransactionsQuery,
  useGetTransactionQuery,
  useApprovePayoutMutation,
  useLazyExportTransactionsQuery,
} = adminPaymentsApi;

export type { PaymentStats, TransactionsResponse };
