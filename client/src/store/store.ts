// client/src/store/store.ts
// This file sets up the Redux store, middleware, and persistor for the application.
// It combines reducers, applies middleware, and configures persistence for the auth state.
import { configureStore, Action, ThunkAction, combineReducers, ThunkDispatch, Middleware } from '@reduxjs/toolkit';
// Import necessary APIs and reducers
import { setupListeners } from '@reduxjs/toolkit/query';
// Import the APIs 
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
// Import storage from redux-persist
import storage from 'redux-persist/lib/storage';
// Import the auth middleware
import { authMiddleware } from './middleware/authMiddleware';
// Import the auth reducer and API
import authReducer, { AuthState } from './Auth/authSlice';
// Import the auth API
import { authApi } from './Auth/authApi';
// Import other APIs
import { carApi } from './Car/carApi';
// Import the rental API
import { rentalApi } from './Rental/rentalApi';
// Import the customer API
import { customerApi } from './Customer/customerApi';
// Import the admin API
import { adminApi } from './Admin/adminApi';
// Import the dashboard API
import dashboardApi from './Dashboard/dashboardApi';
// Import the maintenance API
import { maintenanceApi } from './Maintenance/maintenanceApi';
// Import the review API
import { reviewApi } from './Review/reviewApi';
// Import the notification API
import { notificationApi } from './Notification/notificationApi';
// Import the owner notification API
import { ownerNotificationApi } from './Notification/ownerNotificationApi';
// Import the owner review API
import { ownerReviewApi } from './Review/ownerReviewApi';
// Import the booking slice and API
import bookingReducer from './Booking/bookingSlice';
import { bookingApi } from './Booking/bookingApi';
// Import the payment API
import { paymentApi } from './Payment/paymentApi';

// Define the root state type
// Note: _persist property removed since we're temporarily bypassing persistence
export type RootState = ReturnType<typeof rootReducer>;

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 5, // Increment version to force cache invalidation
  storage,
  // Only persist the auth reducer
  whitelist: ['auth'],
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
  ],
};

// Combine reducers
const appReducer = {
  auth: authReducer,
  booking: bookingReducer,
  [authApi.reducerPath]: authApi.reducer,
  [carApi.reducerPath]: carApi.reducer,
  [rentalApi.reducerPath]: rentalApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [maintenanceApi.reducerPath]: maintenanceApi.reducer,
  [reviewApi.reducerPath]: reviewApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [ownerNotificationApi.reducerPath]: ownerNotificationApi.reducer,
  [ownerReviewApi.reducerPath]: ownerReviewApi.reducer,
  [bookingApi.reducerPath]: bookingApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
};
// Create the root reducer
const rootReducer = combineReducers(appReducer);

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with the persisted reducer and middleware
export const store = configureStore({
  reducer: rootReducer, // Temporarily use rootReducer directly to bypass persistence
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
      .concat(dashboardApi.middleware)
      .concat(maintenanceApi.middleware)
      .concat(reviewApi.middleware)
      .concat(notificationApi.middleware)
      .concat(ownerNotificationApi.middleware)
      .concat(ownerReviewApi.middleware)
      .concat(bookingApi.middleware)
      .concat(paymentApi.middleware)
      .concat(authMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
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