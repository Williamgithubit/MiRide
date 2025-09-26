import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

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

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/payments',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
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
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useCreatePaymentIntentMutation,
} = paymentApi;
