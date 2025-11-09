/**
 * API Configuration
 * 
 * In development: Empty string (uses Vite proxy to localhost:3000)
 * In production: Full backend URL without /api suffix
 * 
 * Example production URL: https://mirideservice.onrender.com
 * NOT: https://mirideservice.onrender.com/api (the /api is added by each API service)
 */

export const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    // Remove trailing slash if present
    return apiUrl.replace(/\/$/, '');
  }
  
  // Default to empty string for development (Vite proxy handles routing to localhost:3000)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API base URL (will be visible in production console)
console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);
console.log('🔧 VITE_API_URL from env:', import.meta.env.VITE_API_URL);
