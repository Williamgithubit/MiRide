import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { Car } from '../Car/carApi';
import { Customer } from '../Customer/customerApi';

export interface Rental {
  id: number;
  carId: number;
  customerId: number;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  car?: Car;
  customer?: Customer;
}

export interface CreateRentalRequest {
  carId: number;
  customerId: number;
  startDate: string;
  endDate: string;
}

export const rentalApi = createApi({
  reducerPath: 'rentalApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the state
      const token = (getState() as RootState).auth.token;
      
      // If we have a token, add it to the headers
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Rental'],
  endpoints: (builder) => ({
    getRentals: builder.query<Rental[], void>({
      query: () => '/rentals',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'LIST' },
            ]
          : [{ type: 'Rental', id: 'LIST' }],
    }),
    getRentalById: builder.query<Rental, number>({
      query: (id) => `/rentals/${id}`,
      providesTags: (result, error, id) => [{ type: 'Rental', id }],
    }),
    getCustomerRentals: builder.query<Rental[], number>({
      query: (customerId) => `/rentals/customer/${customerId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'CUSTOMER' },
            ]
          : [{ type: 'Rental', id: 'CUSTOMER' }],
    }),
    getCarRentals: builder.query<Rental[], number>({
      query: (carId) => `/rentals/car/${carId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'CAR' },
            ]
          : [{ type: 'Rental', id: 'CAR' }],
    }),
    createRental: builder.mutation<Rental, CreateRentalRequest>({
      query: (rental) => ({
        url: '/rentals',
        method: 'POST',
        body: rental,
      }),
      invalidatesTags: [
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
    updateRental: builder.mutation<Rental, Partial<Rental> & { id: number }>({
      query: ({ id, ...rental }) => ({
        url: `/rentals/${id}`,
        method: 'PUT',
        body: rental,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Rental', id },
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
    cancelRental: builder.mutation<Rental, number>({
      query: (id) => ({
        url: `/rentals/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Rental', id },
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
    completeRental: builder.mutation<Rental, number>({
      query: (id) => ({
        url: `/rentals/${id}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Rental', id },
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
  }),
});

export const {
  useGetRentalsQuery,
  useGetRentalByIdQuery,
  useGetCustomerRentalsQuery,
  useGetCarRentalsQuery,
  useCreateRentalMutation,
  useUpdateRentalMutation,
  useCancelRentalMutation,
  useCompleteRentalMutation,
} = rentalApi;
