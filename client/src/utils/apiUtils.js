import axios from 'axios';
import { setAuthToken } from '../store/Auth/authUtils';
/**
 * Makes an authenticated API request with the current token
 * @param config Axios request config
 * @returns Promise with the response data
 */
export const authenticatedRequest = async (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    // Set the token in the axios instance
    if (token) {
        setAuthToken(token);
    }
    else {
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
    }
    catch (error) {
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
export const get = (url, params) => {
    return authenticatedRequest({ method: 'get', url, params });
};
/**
 * Makes an authenticated POST request
 */
export const post = (url, data) => {
    return authenticatedRequest({ method: 'post', url, data });
};
/**
 * Makes an authenticated PUT request
 */
export const put = (url, data) => {
    return authenticatedRequest({ method: 'put', url, data });
};
/**
 * Makes an authenticated DELETE request
 */
export const del = (url, data) => {
    return authenticatedRequest({ method: 'delete', url, data });
};
