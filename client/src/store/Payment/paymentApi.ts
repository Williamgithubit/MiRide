import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { API_BASE_URL } from '../../config/api';

export interface CreateCheckoutSessionRequest {
  carId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  insurance: boolean;
  gps: boolean;
  childSeat: boolean;
  additionalDriver: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  specialRequests?: string;
  selectedCar: {
    id: number;
    year: number;
    brand: string;
    model: string;
    rentalPricePerDay: number;
    imageUrl?: string;
  };
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string; // Stripe Checkout URL for direct redirect
}

export interface CreatePaymentIntentRequest {
  paymentMethodId: string;
  amount: number;
  carId: number;
}

export interface CreatePaymentIntentResponse {
  success?: boolean;
  requiresAction?: boolean;
  paymentIntentClientSecret?: string;
  error?: string;
}

// New Stripe Connect Payment Intent
export interface CreateConnectPaymentIntentRequest {
  carId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  insurance: boolean;
  gps: boolean;
  childSeat: boolean;
  additionalDriver: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  specialRequests?: string;
}

export interface CreateConnectPaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  totalAmount: number;
  platformFee: number;
  ownerPayout: number;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  carId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  insurance: boolean;
  gps: boolean;
  childSeat: boolean;
  additionalDriver: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  specialRequests?: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  rental: any;
  payment: any;
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/payments`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    // Create Stripe Checkout Session
    createCheckoutSession: builder.mutation<CreateCheckoutSessionResponse, CreateCheckoutSessionRequest>({
      query: (sessionData) => ({
        url: '/create-checkout-session',
        method: 'POST',
        body: sessionData,
      }),
    }),

    // Legacy Payment Intent endpoint (for backward compatibility)
    createPaymentIntent: builder.mutation<CreatePaymentIntentResponse, CreatePaymentIntentRequest>({
      query: (paymentData) => ({
        url: '/create-payment-intent',
        method: 'POST',
        body: paymentData,
      }),
    }),

    // New Stripe Connect Payment Intent (with commission)
    createConnectPaymentIntent: builder.mutation<CreateConnectPaymentIntentResponse, CreateConnectPaymentIntentRequest>({
      query: (bookingData) => ({
        url: '/create-payment-intent',
        method: 'POST',
        body: bookingData,
      }),
    }),

    // Confirm Payment and Create Booking
    confirmPayment: builder.mutation<ConfirmPaymentResponse, ConfirmPaymentRequest>({
      query: (paymentData) => ({
        url: '/confirm-payment',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment'],
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useCreatePaymentIntentMutation,
  useCreateConnectPaymentIntentMutation,
  useConfirmPaymentMutation,
} = paymentApi;
