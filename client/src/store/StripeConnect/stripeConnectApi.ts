import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface StripeAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: any;
}

export interface OwnerBalance {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  currency: string;
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    date: string;
    rentalId: number;
  }>;
  recentWithdrawals: Array<{
    id: string;
    amount: number;
    status: string;
    date: string;
    processedAt?: string;
  }>;
}

export interface PlatformBalance {
  totalRevenue: number;
  totalCommission: number;
  availableBalance: number;
  totalWithdrawn: number;
  monthlyRevenue: number;
  monthlyCommission: number;
  currency: string;
  commissionRate: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  type: 'owner' | 'platform';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  transferId?: string;
  payoutId?: string;
  createdAt: string;
  processedAt?: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface WithdrawalHistory {
  withdrawals: Withdrawal[];
  total: number;
  page: number;
  totalPages: number;
}

export const stripeConnectApi = createApi({
  reducerPath: 'stripeConnectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/stripe`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AccountStatus', 'OwnerBalance', 'PlatformBalance', 'Withdrawals'],
  endpoints: (builder) => ({
    // Create Stripe Express Account
    createExpressAccount: builder.mutation<{ accountId: string; message: string }, void>({
      query: () => ({
        url: '/create-express-account',
        method: 'POST',
      }),
      invalidatesTags: ['AccountStatus'],
    }),

    // Create Account Link for Onboarding
    createAccountLink: builder.mutation<{ url: string }, void>({
      query: () => ({
        url: '/create-account-link',
        method: 'POST',
      }),
    }),

    // Get Account Status
    getAccountStatus: builder.query<StripeAccountStatus, string | void>({
      query: (ownerId) => ({
        url: ownerId ? `/account-status/${ownerId}` : '/account-status',
      }),
      providesTags: ['AccountStatus'],
    }),

    // Get Owner Balance
    getOwnerBalance: builder.query<OwnerBalance, string | void>({
      query: (ownerId) => ({
        url: ownerId ? `/owner-balance/${ownerId}` : '/owner-balance',
      }),
      providesTags: ['OwnerBalance'],
    }),

    // Get Platform Balance (Admin only)
    getPlatformBalance: builder.query<PlatformBalance, void>({
      query: () => '/platform-balance',
      providesTags: ['PlatformBalance'],
    }),

    // Withdraw Owner Earnings
    withdrawOwnerEarnings: builder.mutation<
      {
        success: boolean;
        withdrawal: {
          id: string;
          amount: number;
          status: string;
          transferId: string;
          processedAt: string;
        };
        newBalance: number;
      },
      { amount: number }
    >({
      query: (body) => ({
        url: '/withdraw-owner-earnings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OwnerBalance', 'Withdrawals'],
    }),

    // Withdraw Platform Revenue (Admin only)
    withdrawPlatformRevenue: builder.mutation<
      {
        success: boolean;
        withdrawal: {
          id: string;
          amount: number;
          status: string;
          payoutId: string;
          description: string;
        };
        newBalance: number;
      },
      { amount: number; description?: string }
    >({
      query: (body) => ({
        url: '/withdraw-platform-revenue',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PlatformBalance', 'Withdrawals'],
    }),

    // Get Withdrawal History
    getWithdrawalHistory: builder.query<
      WithdrawalHistory,
      { page?: number; limit?: number; type?: 'owner' | 'platform' }
    >({
      query: (params) => ({
        url: '/withdrawal-history',
        params,
      }),
      providesTags: ['Withdrawals'],
    }),
  }),
});

export const {
  useCreateExpressAccountMutation,
  useCreateAccountLinkMutation,
  useGetAccountStatusQuery,
  useGetOwnerBalanceQuery,
  useGetPlatformBalanceQuery,
  useWithdrawOwnerEarningsMutation,
  useWithdrawPlatformRevenueMutation,
  useGetWithdrawalHistoryQuery,
} = stripeConnectApi;
