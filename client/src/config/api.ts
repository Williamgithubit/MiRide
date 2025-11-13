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
    return apiUrl.replace(/\/$/, "");
  }

  // Default to empty string for development (Vite proxy handles routing to localhost:3000)
  return "";
};

export const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API base URL (will be visible in production console)
console.log("🔧 API_BASE_URL configured as:", API_BASE_URL);
console.log("🔧 VITE_API_URL from env:", import.meta.env.VITE_API_URL);
// Help devs/operators: If we're running in production and API_BASE_URL is empty,
// it's a common reason images under `/uploads` fail to load. Log a clear message
// with steps to fix in Render (frontend) and backend deployment.
try {
  const isProd =
    import.meta.env.MODE === "production" ||
    (import.meta.env && import.meta.env.PROD);
  if (isProd && !API_BASE_URL) {
    console.warn("\n[MiRide] WARNING: VITE_API_URL is not set for production.");
    console.warn(
      "Car images that use `/uploads/...` will point to the frontend origin and return 404."
    );
    console.warn("Fixes:");
    console.warn(
      "  1) In your frontend Render service, add an environment variable named VITE_API_URL with the backend URL (e.g. https://mirideservice.onrender.com)"
    );
    console.warn(
      "  2) Ensure your backend serves static files from /uploads (server uses express.static) and that public/uploads is present in the backend deployment."
    );
    console.warn(
      "  3) Alternatively, store uploads on persistent storage (S3) and save absolute URLs in the DB.\n"
    );
  }
} catch (e) {
  // ignore - logging should not break the app
}
