import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/admin/payments`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        try {
            const state = getState();
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
                if (!token)
                    token = localStorage.getItem("token");
            }
            if (token) {
                const formattedToken = token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`;
                headers.set("Authorization", formattedToken);
            }
            return headers;
        }
        catch (error) {
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
        getPaymentStats: builder.query({
            query: () => ({ url: "/stats" }),
            providesTags: ["Payments"],
        }),
        getTransactions: builder.query({
            query: (params) => ({ url: "/transactions", params }),
            providesTags: (result) => result
                ? [
                    "Transactions",
                    ...result.items.map((t) => ({
                        type: "Transactions",
                        id: t.id,
                    })),
                ]
                : ["Transactions"],
        }),
        getTransaction: builder.query({
            query: (id) => `/transactions/${id}`,
            providesTags: (result, error, id) => [
                { type: "Transactions", id },
            ],
        }),
        approvePayout: builder.mutation({
            query: ({ payoutId }) => ({
                url: `/payouts/${payoutId}/approve`,
                method: "POST",
            }),
            invalidatesTags: ["Payments", "Payouts"],
        }),
        exportTransactions: builder.query({
            query: (params) => ({
                url: "/export",
                params,
                responseHandler: (res) => res.blob(),
            }),
        }),
    }),
});
export const { useGetPaymentStatsQuery, useGetTransactionsQuery, useLazyGetTransactionsQuery, useGetTransactionQuery, useApprovePayoutMutation, useLazyExportTransactionsQuery, } = adminPaymentsApi;
