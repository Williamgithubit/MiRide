import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// Helper function to extract data from potential paginated responses
const transformResponse = (response) => {
    if (Array.isArray(response))
        return response;
    // Handle the actual API response format: { cars: [...], pagination: {...} }
    // Always extract just the cars array, not the full pagination response
    const data = response?.cars || response?.data?.cars || response?.data || response;
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
};
// Helper function for single car responses
const transformSingleCarResponse = (response) => {
    // If response is wrapped in data property, unwrap it
    return response?.data || response;
};
export const carApi = createApi({
    reducerPath: "carApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Car"],
    endpoints: (builder) => ({
        getCars: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page)
                    queryParams.append('page', params.page.toString());
                if (params?.limit)
                    queryParams.append('limit', params.limit.toString());
                if (params?.available !== undefined)
                    queryParams.append('available', params.available.toString());
                const queryString = queryParams.toString();
                return `/cars${queryString ? `?${queryString}` : ''}`;
            },
            transformResponse,
            providesTags: (result = []) => [
                ...(Array.isArray(result) ? result.map(({ id }) => ({ type: 'Car', id })) : []),
                { type: 'Car', id: 'LIST' },
            ],
        }),
        getCarById: builder.query({
            query: (id) => `/cars/${id}`,
            transformResponse: transformSingleCarResponse,
            providesTags: (result, error, id) => [
                { type: 'Car', id },
                { type: 'Car', id: 'DETAIL' }
            ],
        }),
        getAvailableCars: builder.query({
            query: ({ startDate, endDate }) => ({
                url: "/cars/available",
                params: { startDate, endDate },
            }),
            transformResponse,
            providesTags: (result = []) => [
                ...(Array.isArray(result) ? result.map(({ id }) => ({ type: 'Car', id })) : []),
                { type: 'Car', id: 'AVAILABLE' },
            ],
        }),
        getCarsByOwner: builder.query({
            query: (ownerId) => ({
                url: ownerId ? `/cars/owner/${ownerId}` : "/cars/owner",
            }),
            transformResponse,
            providesTags: (result = []) => [
                ...(Array.isArray(result) ? result.map(({ id }) => ({ type: 'Car', id })) : []),
                { type: 'Car', id: 'OWNER' },
            ],
        }),
        toggleLike: builder.mutation({
            query: (id) => ({
                url: `/cars/${id}/like`,
                method: "POST",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Car", id },
                { type: "Car", id: "LIST" },
                { type: "Car", id: "OWNER" },
                { type: "Car", id: "AVAILABLE" },
            ],
        }),
        addCar: builder.mutation({
            query: (car) => ({
                url: "/cars",
                method: "POST",
                body: car,
            }),
            invalidatesTags: [
                { type: 'Car', id: 'LIST' },
                { type: 'Car', id: 'OWNER' },
            ],
        }),
        updateCar: builder.mutation({
            query: ({ id, ...car }) => ({
                url: `/cars/${id}`,
                method: "PUT",
                body: car,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Car', id },
                { type: 'Car', id: 'LIST' },
                { type: 'Car', id: 'OWNER' },
                { type: 'Car', id: 'AVAILABLE' },
                { type: 'Car', id: 'DETAIL' },
            ],
        }),
        deleteCar: builder.mutation({
            query: (id) => ({
                url: `/cars/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Car', id },
                { type: 'Car', id: 'LIST' },
                { type: 'Car', id: 'OWNER' },
                { type: 'Car', id: 'AVAILABLE' },
            ],
        }),
        // Image management endpoints
        uploadCarImages: builder.mutation({
            query: ({ carId, formData }) => ({
                url: `/cars/${carId}/images`,
                method: 'POST',
                body: formData,
                // Don't set Content-Type header, let the browser set it with boundary
                formData: true,
            }),
            invalidatesTags: (result, error, { carId }) => [
                { type: 'Car', id: carId },
                { type: 'Car', id: 'LIST' },
                { type: 'Car', id: 'OWNER' },
                { type: 'Car', id: 'DETAIL' },
            ],
        }),
        deleteCarImage: builder.mutation({
            query: ({ carId, imageId }) => ({
                url: `/cars/${carId}/images/${imageId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { carId }) => [
                { type: 'Car', id: carId },
                { type: 'Car', id: 'DETAIL' },
            ],
        }),
        setPrimaryImage: builder.mutation({
            query: ({ carId, imageId }) => ({
                url: `/cars/${carId}/images/${imageId}/set-primary`,
                method: 'PATCH',
            }),
            invalidatesTags: (result, error, { carId }) => [
                { type: 'Car', id: carId },
                { type: 'Car', id: 'DETAIL' },
            ],
        }),
        reorderImages: builder.mutation({
            query: ({ carId, images }) => ({
                url: `/cars/${carId}/images/reorder`,
                method: 'PATCH',
                body: { images },
            }),
            invalidatesTags: (result, error, { carId }) => [
                { type: 'Car', id: carId },
                { type: 'Car', id: 'DETAIL' },
            ],
        }),
    }),
});
export const { useGetCarsQuery, useGetCarByIdQuery, useGetAvailableCarsQuery, useGetCarsByOwnerQuery, useToggleLikeMutation, useAddCarMutation, useUpdateCarMutation, useDeleteCarMutation, useUploadCarImagesMutation, useDeleteCarImageMutation, useSetPrimaryImageMutation, useReorderImagesMutation, } = carApi;
