import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import toast from 'react-hot-toast';

/**
 * Type predicate to narrow an unknown error to `FetchBaseQueryError`
 */
export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

/**
 * Type predicate to narrow an unknown error to an object with a string 'message' property
 */
export function isErrorWithMessage(
  error: unknown
): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Helper function to extract error message from different error types
 */
export const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
  if (!error) return 'Unknown error occurred';
  
  // Handle FetchBaseQueryError
  if (isFetchBaseQueryError(error)) {
    const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);
    return errMsg;
  }
  
  // Handle SerializedError
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  
  return 'Unknown error occurred';
};

/**
 * Helper function to show toast notification for API errors
 */
export const showErrorToast = (error: FetchBaseQueryError | SerializedError | undefined): void => {
  const errorMessage = getErrorMessage(error);
  toast.error(errorMessage);
};

/**
 * Helper function to show toast notification for API success
 */
export const showSuccessToast = (message: string): void => {
  toast.success(message);
};
