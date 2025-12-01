import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';
import type { RootState } from '../store';

interface TermsState {
  termsAccepted: boolean;
  termsAcceptedAt: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: TermsState = {
  termsAccepted: false,
  termsAcceptedAt: null,
  loading: false,
  error: null,
};

// Thunk: Check terms status
export const checkTermsStatus = createAsyncThunk(
  'terms/checkStatus',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/terms/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch terms status');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk: Accept terms
export const acceptTerms = createAsyncThunk(
  'terms/accept',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/terms/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept terms');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const termsSlice = createSlice({
  name: 'terms',
  initialState,
  reducers: {
    resetTermsState: (state) => {
      state.termsAccepted = false;
      state.termsAcceptedAt = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check status
    builder.addCase(checkTermsStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkTermsStatus.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.termsAccepted = action.payload.termsAccepted;
      state.termsAcceptedAt = action.payload.termsAcceptedAt;
    });
    builder.addCase(checkTermsStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Accept terms
    builder.addCase(acceptTerms.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(acceptTerms.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.termsAccepted = true;
      state.termsAcceptedAt = action.payload.termsAcceptedAt;
    });
    builder.addCase(acceptTerms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetTermsState } = termsSlice.actions;
export default termsSlice.reducer;
