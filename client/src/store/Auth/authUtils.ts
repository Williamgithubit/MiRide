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
      console.log('Session expired (401), clearing auth data...');
      
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login/signup pages
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/signup';
        
        if (!isAuthPage) {
          console.log('Redirecting to login from:', currentPath);
          window.location.href = '/login';
        } else {
          console.log('Already on auth page, skipping redirect');
        }
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
