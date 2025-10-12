// index.ts - Central export file for Redux store and related utilities
import store from "./store";
import { authApi } from "./Auth/authApi";
import { carApi } from "./Car/carApi";
import { rentalApi } from "./Rental/rentalApi";
import { customerApi } from "./Customer/customerApi";
import { adminPaymentsApi } from "./Admin/adminPaymentsApi";
import { useAppDispatch, useAppSelector } from "./hooks";

// Re-export everything
export {
  store,
  authApi,
  carApi,
  rentalApi,
  customerApi,
  adminPaymentsApi,
  useAppDispatch,
  useAppSelector,
};

// Export types
export type { RootState, AppDispatch } from "./store";

// Export default
export default store;
