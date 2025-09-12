import axios from 'axios';
import { setAuthToken } from '../store/Auth/authUtils';

/**
 * Makes an authenticated API request with the current token
 * @param config Axios request config
 * @returns Promise with the response data
 */
export const authenticatedRequest = async <T = any>(config: any): Promise<T> => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Set the token in the axios instance
  if (token) {
    setAuthToken(token);
  } else {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios({
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('API Request Error:', error);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      setAuthToken(null);
      window.location.href = '/login';
    }
    
    throw error.response?.data || error.message || 'An error occurred';
  }
};

/**
 * Makes an authenticated GET request
 */
export const get = <T = any>(url: string, params?: any) => {
  return authenticatedRequest<T>({ method: 'get', url, params });
};

/**
 * Makes an authenticated POST request
 */
export const post = <T = any>(url: string, data?: any) => {
  return authenticatedRequest<T>({ method: 'post', url, data });
};

/**
 * Makes an authenticated PUT request
 */
export const put = <T = any>(url: string, data?: any) => {
  return authenticatedRequest<T>({ method: 'put', url, data });
};

/**
 * Makes an authenticated DELETE request
 */
export const del = <T = any>(url: string, data?: any) => {
  return authenticatedRequest<T>({ method: 'delete', url, data });
};
