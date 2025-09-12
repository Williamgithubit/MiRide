import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';

// Import RootState from the store
import type { RootState } from './store';

// Define base types that don't depend on store
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

// Define AppDispatch type that will be used across the app
export type AppDispatch = import('./store').AppDispatch;

// Define middleware type
export type AppMiddleware = Middleware<{}, RootState>;
