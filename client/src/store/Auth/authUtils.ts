// client/src/store/Auth/authUtils.ts
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Create axios instance for token management
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle session expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to session expiration (401)
    if (error.response?.status === 401) {
      console.log('Session expired (401), redirecting to login...');
      
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      // Use window.location to ensure a full page reload and state reset
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Token setter function for RTK Query compatibility
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Export the axios instance if needed for any legacy compatibility
export { axiosInstance };
