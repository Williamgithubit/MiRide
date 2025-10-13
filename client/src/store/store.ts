// client/src/store/store.ts
// This file sets up the Redux store, middleware, and persistor for the application.
// It combines reducers, applies middleware, and configures persistence for the auth state.
import {
  configureStore,
  Action,
  ThunkAction,
  combineReducers,
  ThunkDispatch,
  Middleware,
} from "@reduxjs/toolkit";
// Import necessary APIs and reducers
import { setupListeners } from "@reduxjs/toolkit/query";
// Import the APIs
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
// Import storage from redux-persist
import storage from "redux-persist/lib/storage";
// Import the auth middleware
import { authMiddleware } from "./middleware/authMiddleware";
// Import the auth reducer and API
import authReducer from "./Auth/authSlice";
// Import the auth API
import { authApi } from "./Auth/authApi";
// Import other APIs
import { carApi } from "./Car/carApi";
// Import the rental API
import { rentalApi } from "./Rental/rentalApi";
// Import the customer API
import { customerApi } from "./Customer/customerApi";
// Import the admin API
import { adminApi } from "./Admin/adminApi";
import { adminPaymentsApi } from "./Admin/adminPaymentsApi";
// Import the dashboard API
import dashboardApi from "./Dashboard/dashboardApi";
// Import the maintenance API
import { maintenanceApi } from "./Maintenance/maintenanceApi";
// Import the review API
import { reviewApi } from "./Review/reviewApi";
// Import the notification API
import { notificationApi } from "./Notification/notificationApi";
// Import the owner notification API
import { ownerNotificationApi } from "./Notification/ownerNotificationApi";
// Import the owner review API
import { ownerReviewApi } from "./Review/ownerReviewApi";
// Import the booking slice and API
import bookingReducer from "./Booking/bookingSlice";
import { bookingApi } from "./Booking/bookingApi";
// Import the payment API
import { paymentApi } from "./Payment/paymentApi";
// Import the user management API
import { userManagementApi } from "./User/userManagementApi";
// Import the car management API
import { carManagementApi } from "./Car/carManagementApi";
// Import admin bookings slice and API
import adminBookingsReducer from "./Admin/adminBookingsSlice";
import { adminBookingsApi } from "./Admin/bookingsService";
// Import admin notifications slice
import adminNotificationsReducer from "./Admin/adminNotificationsSlice";
// Import admin reports slice
import adminReportsReducer from "./Admin/adminReportsSlice";
// Import admin settings slice
import adminSettingsReducer from "./Admin/adminSettingsSlice";

// Define the root state type
// Note: _persist property removed since we're temporarily bypassing persistence
export type RootState = ReturnType<typeof rootReducer>;

// Persist configuration
const persistConfig = {
  key: "root",
  version: 5, // Increment version to force cache invalidation
  storage,
  // Only persist the auth reducer
  whitelist: ["auth"],
  // Blacklist API services to avoid persisting cache
  blacklist: [
    authApi.reducerPath,
    carApi.reducerPath,
    rentalApi.reducerPath,
    customerApi.reducerPath,
    adminApi.reducerPath,
    dashboardApi.reducerPath,
    maintenanceApi.reducerPath,
    reviewApi.reducerPath,
    notificationApi.reducerPath,
    ownerNotificationApi.reducerPath,
    ownerReviewApi.reducerPath,
    bookingApi.reducerPath,
    paymentApi.reducerPath,
    userManagementApi.reducerPath,
    carManagementApi.reducerPath,
  ],
};

// Combine reducers
const appReducer = {
  auth: authReducer,
  booking: bookingReducer,
  adminBookings: adminBookingsReducer,
  adminNotifications: adminNotificationsReducer,
  adminReports: adminReportsReducer,
  adminSettings: adminSettingsReducer,
  [authApi.reducerPath]: authApi.reducer,
  [carApi.reducerPath]: carApi.reducer,
  [rentalApi.reducerPath]: rentalApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [adminPaymentsApi.reducerPath]: adminPaymentsApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [maintenanceApi.reducerPath]: maintenanceApi.reducer,
  [reviewApi.reducerPath]: reviewApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [ownerNotificationApi.reducerPath]: ownerNotificationApi.reducer,
  [ownerReviewApi.reducerPath]: ownerReviewApi.reducer,
  [bookingApi.reducerPath]: bookingApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [userManagementApi.reducerPath]: userManagementApi.reducer,
  [carManagementApi.reducerPath]: carManagementApi.reducer,
  [adminBookingsApi.reducerPath]: adminBookingsApi.reducer,
};
// Create the root reducer
const rootReducer = combineReducers(appReducer);

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with the persisted reducer and middleware
export const store = configureStore({
  reducer: persistedReducer, // Use persisted reducer to enable persistence
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(authApi.middleware)
      .concat(carApi.middleware)
      .concat(rentalApi.middleware)
      .concat(customerApi.middleware)
      .concat(adminApi.middleware)
      .concat(adminPaymentsApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(maintenanceApi.middleware)
      .concat(reviewApi.middleware)
      .concat(notificationApi.middleware)
      .concat(ownerNotificationApi.middleware)
      .concat(ownerReviewApi.middleware)
      .concat(bookingApi.middleware)
      .concat(paymentApi.middleware)
      .concat(userManagementApi.middleware)
      .concat(carManagementApi.middleware)
      .concat(adminBookingsApi.middleware)
      .concat(authMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Create the persistor with immediate rehydration
export const persistor = persistStore(store);

// Define a reusable `AppThunk` type for writing thunks
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Export the store and types
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;

// Export the root reducer for use in type definitions
export default store;
