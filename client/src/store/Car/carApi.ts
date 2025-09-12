import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { Car } from "../../types";

export const carApi = createApi({
  reducerPath: "carApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the state
      const token = (getState() as RootState).auth.token;

      // If we have a token, add it to the headers
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Car"],
  endpoints: (builder) => ({
    getCars: builder.query<Car[], void>({
      query: () => "/cars",
      // The server returns a paginated object: { cars: [...], pagination: { ... } }
      // Normalize to return just the array of cars so consumers get Car[]
      transformResponse: (response: any) => response?.cars ?? response,
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Car" as const, id })),
              { type: "Car", id: "LIST" },
            ]
          : [{ type: "Car", id: "LIST" }],
    }),
    getCarById: builder.query<Car, number>({
      query: (id) => `/cars/${id}`,
      providesTags: (result, error, id) => [{ type: "Car", id }],
    }),
    getAvailableCars: builder.query<
      Car[],
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: "/cars/available",
        params: { startDate, endDate },
      }),
      providesTags: [{ type: "Car", id: "AVAILABLE" }],
    }),
    getCarsByOwner: builder.query<Car[], number | void>({
      query: (ownerId) => ({
        url: ownerId ? `/cars/owner/${ownerId}` : "/cars/owner",
      }),
      transformResponse: (response: any) => response?.cars ?? response,
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Car" as const, id })),
              { type: "Car", id: "OWNER" },
            ]
          : [{ type: "Car", id: "OWNER" }],
    }),
    toggleLike: builder.mutation<{ isLiked: boolean }, number>({
      query: (id) => ({
        url: `/cars/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Car", id },
        { type: "Car", id: "LIST" },
      ],
    }),
    addCar: builder.mutation<Car, Omit<Car, "id" | "createdAt" | "updatedAt">>({
      query: (car) => ({
        url: "/cars",
        method: "POST",
        body: car,
      }),
      invalidatesTags: [{ type: "Car", id: "LIST" }],
    }),
    updateCar: builder.mutation<Car, Partial<Car> & { id: number }>({
      query: ({ id, ...car }) => ({
        url: `/cars/${id}`,
        method: "PUT",
        body: car,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Car", id },
        { type: "Car", id: "LIST" },
      ],
    }),
    deleteCar: builder.mutation<void, number>({
      query: (id) => ({
        url: `/cars/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Car", id },
        { type: "Car", id: "LIST" },
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
} = carApi;

// Re-export the Car type for convenience
export type { Car } from "../../types";
