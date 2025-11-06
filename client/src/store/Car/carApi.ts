import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import type { 
  Car, 
  CarImage, 
  CarStatus,
  ImageUploadResponse, 
  ImageDeleteResponse, 
  SetPrimaryImagePayload, 
  ReorderImagesPayload,
  User
} from "../../types/index";

// Helper function to extract data from potential paginated responses
const transformResponse = (response: any) => {
  if (Array.isArray(response)) return response;
  // Handle the actual API response format: { cars: [...], pagination: {...} }
  // Always extract just the cars array, not the full pagination response
  const data = response?.cars || response?.data?.cars || response?.data || response;
  // Ensure we always return an array
  return Array.isArray(data) ? data : [];
};

// Helper function for single car responses
const transformSingleCarResponse = (response: any): Car => {
  // If response is wrapped in data property, unwrap it
  return response?.data || response;
};

export const carApi = createApi({
  reducerPath: "carApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Car"],
  endpoints: (builder) => ({
    getCars: builder.query<Car[], { page?: number; limit?: number; available?: boolean } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.available !== undefined) queryParams.append('available', params.available.toString());
        
        const queryString = queryParams.toString();
        return `/cars${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse,
      providesTags: (result = []) => [
        ...(Array.isArray(result) ? result.map(({ id }) => ({ type: 'Car' as const, id })) : []),
        { type: 'Car', id: 'LIST' },
      ],
    }),
    getCarById: builder.query<Car, number>({
      query: (id) => `/cars/${id}`,
      transformResponse: transformSingleCarResponse,
      providesTags: (result, error, id) => [
        { type: 'Car', id },
        { type: 'Car', id: 'DETAIL' }
      ],
    }),
    getAvailableCars: builder.query<Car[], { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: "/cars/available",
        params: { startDate, endDate },
      }),
      transformResponse,
      providesTags: (result = []) => [
        ...(Array.isArray(result) ? result.map(({ id }) => ({ type: 'Car' as const, id })) : []),
        { type: 'Car', id: 'AVAILABLE' },
      ],
    }),
    getCarsByOwner: builder.query<Car[], number | void>({
      query: (ownerId) => ({
        url: ownerId ? `/cars/owner/${ownerId}` : "/cars/owner",
      }),
      transformResponse,
      providesTags: (result = []) => [
        ...(Array.isArray(result) ? result.map(({ id }) => ({ type: 'Car' as const, id })) : []),
        { type: 'Car', id: 'OWNER' },
      ],
    }),
    toggleLike: builder.mutation<{ isLiked: boolean }, number>({
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
    addCar: builder.mutation<Car, Omit<Car, "id" | "createdAt" | "updatedAt">>({
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
    updateCar: builder.mutation<Car, Partial<Car> & { id: number }>({
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
    deleteCar: builder.mutation<void, number>({
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
    uploadCarImages: builder.mutation<ImageUploadResponse, { carId: number; formData: FormData }>({
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
    deleteCarImage: builder.mutation<ImageDeleteResponse, { carId: number; imageId: string }>({
      query: ({ carId, imageId }) => ({
        url: `/cars/${carId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { carId }) => [
        { type: 'Car', id: carId },
        { type: 'Car', id: 'DETAIL' },
      ],
    }),
    setPrimaryImage: builder.mutation<ImageDeleteResponse, SetPrimaryImagePayload>({
      query: ({ carId, imageId }) => ({
        url: `/cars/${carId}/images/${imageId}/set-primary`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { carId }) => [
        { type: 'Car', id: carId },
        { type: 'Car', id: 'DETAIL' },
      ],
    }),
    reorderImages: builder.mutation<void, ReorderImagesPayload>({
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

export const {
  useGetCarsQuery,
  useGetCarByIdQuery,
  useGetAvailableCarsQuery,
  useGetCarsByOwnerQuery,
  useToggleLikeMutation,
  useAddCarMutation,
  useUpdateCarMutation,
  useDeleteCarMutation,
  useUploadCarImagesMutation,
  useDeleteCarImageMutation,
  useSetPrimaryImageMutation,
  useReorderImagesMutation,
} = carApi;

// Re-export types for convenience
export type { 
  Car, 
  CarStatus,
  CarImage, 
  ImageUploadResponse, 
  ImageDeleteResponse, 
  SetPrimaryImagePayload, 
  ReorderImagesPayload,
  User 
} from '../../types/index';