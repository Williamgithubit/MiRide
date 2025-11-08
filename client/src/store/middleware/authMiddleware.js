// Helper to get token from localStorage or Redux persist
const getToken = (state) => {
    // First try to get from Redux state
    if (state?.auth?.token) {
        return state.auth.token;
    }
    // If not in Redux, try localStorage persist
    if (typeof window !== 'undefined') {
        try {
            const persist = localStorage.getItem('persist:root');
            if (persist) {
                const parsed = JSON.parse(persist);
                if (parsed.auth) {
                    const authState = JSON.parse(parsed.auth);
                    if (authState.token) {
                        return authState.token;
                    }
                }
            }
            // Fallback to direct token in localStorage
            return localStorage.getItem('token');
        }
        catch (error) {
            console.error('Error reading token from storage:', error);
        }
    }
    return null;
};
const isPlainAction = (action) => {
    if (action === undefined || action === null) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('authMiddleware received invalid action:', action);
        }
        return false;
    }
    if (typeof action !== 'object') {
        return false;
    }
    const actionObj = action;
    return 'type' in actionObj && typeof actionObj.type === 'string';
};
// Define the middleware with proper type annotations
export const authMiddleware = (api) => (next) => async (action) => {
    // Skip if action is not a plain action object with a type
    if (!isPlainAction(action)) {
        return next(action);
    }
    // Get the current state
    const state = api.getState();
    // Skip token check for auth-related actions only (payment actions need auth)
    if (action.type && (action.type.includes('auth/') || action.type.includes('login'))) {
        return next(action);
    }
    // Get token from state or localStorage as fallback
    const token = state.auth?.token || getToken(state);
    // Debug log for token status
    if (process.env.NODE_ENV !== 'production') {
        console.log('AuthMiddleware - Token:', token ? 'Present' : 'Missing');
        console.log('AuthMiddleware - Action Type:', action.type);
    }
    // Handle API actions (both RTK Query and regular actions with payload.request)
    if (action.type.startsWith('api/') || action?.payload?.request) {
        // Clone the action to avoid mutating the original
        const newAction = { ...action };
        // Ensure payload exists
        if (!newAction.payload) {
            newAction.payload = {};
        }
        // Ensure request object exists
        if (!newAction.payload.request) {
            newAction.payload.request = {};
        }
        // Ensure headers object exists
        newAction.payload.headers = newAction.payload.headers || {};
        // Add authorization header if we have a token and it's not already set
        if (token && !newAction.payload.headers.Authorization) {
            newAction.payload.headers.Authorization = `Bearer ${token}`;
            if (process.env.NODE_ENV !== 'production') {
                console.log('AuthMiddleware - Added Authorization header');
            }
        }
        // Continue with the modified action
        return next(newAction);
    }
    // Skip other internal RTK Query actions
    if (action.type.startsWith('RTK_') ||
        action.type.includes('executeQuery') ||
        action.type.includes('executeMutation')) {
        return next(action);
    }
    const { getState, dispatch } = api;
    // Before the action is processed, verify auth state exists
    const previousAuth = getState().auth;
    if (!previousAuth && process.env.NODE_ENV !== 'production') {
        console.warn('authMiddleware: auth state is undefined or missing');
    }
    const previousToken = previousAuth?.token ?? null;
    const previousUser = previousAuth?.user ?? null;
    // Process the action
    const result = next(action);
    // After the action is processed
    const newAuth = getState().auth;
    if (!newAuth && process.env.NODE_ENV !== 'production') {
        console.warn('authMiddleware: new auth state is undefined or missing');
    }
    const newToken = newAuth?.token ?? null;
    const newUser = newAuth?.user ?? null;
    // Only handle token and user changes if the auth state actually changed
    if (previousAuth === newAuth || (!previousToken && !newToken && !previousUser && !newUser)) {
        return result;
    }
    try {
        // Handle token changes
        if (previousToken !== newToken) {
            if (newToken) {
                localStorage.setItem('token', newToken);
                if (process.env.NODE_ENV !== 'production') {
                    console.log('Token saved to localStorage:', newToken);
                }
            }
            else {
                localStorage.removeItem('token');
                if (process.env.NODE_ENV !== 'production') {
                    console.log('Token removed from localStorage');
                }
            }
        }
        // Handle user changes
        if (previousUser !== newUser) {
            if (newUser) {
                localStorage.setItem('user', JSON.stringify(newUser));
                if (process.env.NODE_ENV !== 'production') {
                    console.log('User data saved to localStorage:', newUser);
                }
            }
            else {
                localStorage.removeItem('user');
                if (process.env.NODE_ENV !== 'production') {
                    console.log('User data removed from localStorage');
                }
            }
        }
    }
    catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error persisting auth state:', error);
        }
    }
    return result;
};
