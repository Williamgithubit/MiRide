// This file is now deprecated - admin stats are handled by dashboardApi
// Import the hook from dashboardApi instead
export { useGetAdminStatsQuery } from '../Dashboard/dashboardApi';
// Re-export for backward compatibility
export const fetchAdminStats = null; // Deprecated - use useGetAdminStatsQuery hook
export const selectAdminStats = null; // Deprecated - use RTK Query hook
export const selectAdminStatsLoading = null; // Deprecated - use RTK Query hook  
export const selectAdminStatsError = null; // Deprecated - use RTK Query hook
// Empty reducer for backward compatibility
export default () => null;
