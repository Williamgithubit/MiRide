import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const paymentApi = createApi({
    reducerPath: 'paymentApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/payments',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Payment'],
    endpoints: (builder) => ({
        // Create Stripe Checkout Session
        createCheckoutSession: builder.mutation({
            query: (sessionData) => ({
                url: '/create-checkout-session',
                method: 'POST',
                body: sessionData,
            }),
        }),
        // Legacy Payment Intent endpoint (for backward compatibility)
        createPaymentIntent: builder.mutation({
            query: (paymentData) => ({
                url: '/create-payment-intent',
                method: 'POST',
                body: paymentData,
            }),
        }),
    }),
});
export const { useCreateCheckoutSessionMutation, useCreatePaymentIntentMutation, } = paymentApi;
