// client/src/utils/errorHandler.ts
import tokenStorage from './tokenStorage';

/**
 * Centralized error handling utility for API errors
 * Helps determine if an error is authentication-related and requires logout
 */
export const errorHandler = {
  /**
   * Check if an error is authentication-related
   * @param {Error|any} error - The error to check
   * @returns {boolean} - Whether the error is authentication-related
   */
  isAuthError: (error: Error | any): boolean => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    // Check for common authentication error messages
    const authErrorKeywords = [
      'token', 'unauthorized', 'unauthenticated', 
      'expired', 'invalid', 'jwt', 'auth', 'login',
      'permission', 'forbidden', 'access denied'
    ];
    
    // Check for 401/403 status codes
    const statusCode = error?.response?.status;
    const isAuthStatusCode = statusCode === 401 || statusCode === 403;
    
    // Check if error message contains any auth-related keywords
    const containsAuthKeyword = authErrorKeywords.some(keyword => 
      errorMessage.includes(keyword.toLowerCase())
    );
    
    return isAuthStatusCode || containsAuthKeyword;
  },
  
  /**
   * Handle an API error, with special handling for auth errors
   * @param {Error|any} error - The error to handle
   * @param {boolean} shouldLogout - Whether to logout on auth errors
   * @returns {string} - A user-friendly error message
   */
  handleApiError: (error: Error | any, shouldLogout = true): string => {
    console.error('API Error:', error);
    
    // Extract error message
    const errorMessage = error?.response?.data?.error || 
                         error?.response?.data?.message || 
                         error?.message || 
                         'An unknown error occurred';
    
    // Log detailed error information
    console.log(`Error details: ${errorMessage}`);
    
    // Check if this is an auth error
    if (errorHandler.isAuthError(error) && shouldLogout) {
      console.log('Session expired, clearing auth data and redirecting to login...');
      tokenStorage.removeToken();
      
      // Clear user data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      
      // Redirect to login page immediately for 401 errors (session expired)
      const statusCode = error?.response?.status;
      if (typeof window !== 'undefined' && statusCode === 401) {
        window.location.href = '/login';
      } else if (typeof window !== 'undefined') {
        // For other auth errors, use a small delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    // Return user-friendly error message
    return errorMessage;
  },
  
  /**
   * Format an error message for display to the user
   * @param {Error|any} error - The error to format
   * @returns {string} - A user-friendly error message
   */
  formatErrorMessage: (error: Error | any): string => {
    if (!error) return 'An unknown error occurred';
    
    // Extract error message
    const errorMessage = error?.response?.data?.error || 
                         error?.response?.data?.message || 
                         error?.message || 
                         'An unknown error occurred';
    
    // Clean up common error formats
    return errorMessage
      .replace('Error: ', '')
      .replace(/^\w+:\s/, '')
      .replace(/^[a-z]/, (c: string) => c.toUpperCase());
  }
};

export default errorHandler;
