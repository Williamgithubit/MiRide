import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, CustomerUser, OwnerUser } from '../User/userTypes';

// Type for any user type (base User, CustomerUser, or OwnerUser)
export type AnyUser = User | CustomerUser | OwnerUser;


export interface AuthState {
  user: AnyUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper to safely parse user from localStorage
const getInitialAuthState = (): Omit<AuthState, 'isLoading' | 'error'> => {
  // Skip if running on server
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  // If no token or user data, return unauthenticated state
  if (!token || !userStr) {
    // Clear any partial auth data
    if (token) localStorage.removeItem('token');
    if (userStr) localStorage.removeItem('user');
    
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  try {
    const user = JSON.parse(userStr) as AnyUser;
    
// Validate required user fields
    if (!user.id || !user.email || !user.role) {
      console.error('Invalid user data in localStorage');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    }

    return {
      user,
      token,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    // Clear invalid data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

const initialState: AuthState = {
  ...getInitialAuthState(),
  isLoading: false,
  error: null,
};

// Helper to update localStorage when auth state changes
const updateLocalStorage = (token: string | null, user: AnyUser | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Handles successful login
    loginSuccess: (state, action: PayloadAction<{ user: AnyUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      updateLocalStorage(action.payload.token, action.payload.user);
    },
    //Handles login failure
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      updateLocalStorage(null, null);
    },
    //Handle logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      updateLocalStorage(null, null);
    },
    clearError: (state) => {
      state.error = null;
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, updateToken } = authSlice.actions;
export default authSlice.reducer;