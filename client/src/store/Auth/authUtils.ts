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
