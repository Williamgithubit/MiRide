// client/src/utils/tokenStorage.ts
import { setAuthToken } from '../store/Auth/authUtils';

/**
 * Enhanced token storage utility with improved error handling
 * for better authentication persistence in production environments
 */
const tokenStorage = {
  /**
   * Get the authentication token from localStorage
   * @returns {string|null} The authentication token or null if not found
   */
  getToken: (): string | null => {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  },

  /**
   * Set the authentication token in localStorage and API service
   * @param {string} token - The authentication token to store
   */
  setToken: (token: string | null): void => {
    try {
      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
        console.log('Token successfully stored and set in API service');
      } else {
        localStorage.removeItem('token');
        setAuthToken(null);
        console.log('Token cleared from storage and API service');
      }
    } catch (error) {
      console.error('Error setting token in localStorage:', error);
    }
  },

  /**
   * Remove the authentication token from localStorage and API service
   */
  removeToken: (): void => {
    try {
      localStorage.removeItem('token');
      setAuthToken(null);
      console.log('Token successfully removed from storage and API service');
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  },

  /**
   * Check if a token exists and is potentially valid
   * (This doesn't validate with the server, just checks if it exists and has expected format)
   * @returns {boolean} Whether a potentially valid token exists
   */
  hasToken: (): boolean => {
    try {
      const token = localStorage.getItem('token');
      return !!token && token.split('.').length === 3; // Basic JWT format check
    } catch (error) {
      console.error('Error checking token in localStorage:', error);
      return false;
    }
  },

  /**
   * Initialize token from localStorage on app startup
   * This should be called when the application first loads
   */
  initializeFromStorage: (): boolean => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        console.log('Token initialized from localStorage');
        return true;
      }
    } catch (error) {
      console.error('Error initializing token from localStorage:', error);
    }
    return false;
  }
};

export default tokenStorage;
