import toast from 'react-hot-toast';
/**
 * Type predicate to narrow an unknown error to `FetchBaseQueryError`
 */
export function isFetchBaseQueryError(error) {
    return typeof error === 'object' && error != null && 'status' in error;
}
/**
 * Type predicate to narrow an unknown error to an object with a string 'message' property
 */
export function isErrorWithMessage(error) {
    return (typeof error === 'object' &&
        error != null &&
        'message' in error &&
        typeof error.message === 'string');
}
/**
 * Helper function to extract error message from different error types
 */
export const getErrorMessage = (error) => {
    if (!error)
        return 'Unknown error occurred';
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
export const showErrorToast = (error) => {
    const errorMessage = getErrorMessage(error);
    toast.error(errorMessage);
};
/**
 * Helper function to show toast notification for API success
 */
export const showSuccessToast = (message) => {
    toast.success(message);
};
