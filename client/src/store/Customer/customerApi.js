import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const customerApi = createApi({
    reducerPath: 'customerApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: (headers, { getState }) => {
            // Get the token from the state
            const token = getState().auth.token;
            // If we have a token, add it to the headers
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Customer'],
    endpoints: (builder) => ({
        getCustomers: builder.query({
            query: () => '/customers',
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Customer', id })),
                    { type: 'Customer', id: 'LIST' },
                ]
                : [{ type: 'Customer', id: 'LIST' }],
        }),
        getCustomerById: builder.query({
            query: (id) => {
                // Emergency fix: Prevent invalid ID calls
                if (!id || id === '0' || id === 'undefined' || id === 'null' || id === 'invalid') {
                    console.error('customerApi - Invalid ID provided:', id);
                    throw new Error('Invalid customer ID provided');
                }
                console.log('customerApi - Fetching customer with ID:', id);
                return `/customers/${id}`;
            },
            providesTags: (result, error, id) => [{ type: 'Customer', id }],
        }),
        addCustomer: builder.mutation({
            query: (customer) => ({
                url: '/customers',
                method: 'POST',
                body: customer,
            }),
            invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
        }),
        updateCustomer: builder.mutation({
            query: ({ id, ...customer }) => ({
                url: `/customers/${id}`,
                method: 'PUT',
                body: customer,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Customer', id },
                { type: 'Customer', id: 'LIST' },
            ],
        }),
        deleteCustomer: builder.mutation({
            query: (id) => ({
                url: `/customers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Customer', id },
                { type: 'Customer', id: 'LIST' },
            ],
        }),
        searchCustomers: builder.query({
            query: (searchTerm) => ({
                url: '/customers/search',
                params: { q: searchTerm },
            }),
            providesTags: [{ type: 'Customer', id: 'SEARCH' }],
        }),
    }),
});
export const { useGetCustomersQuery, useGetCustomerByIdQuery, useAddCustomerMutation, useUpdateCustomerMutation, useDeleteCustomerMutation, useSearchCustomersQuery, } = customerApi;
