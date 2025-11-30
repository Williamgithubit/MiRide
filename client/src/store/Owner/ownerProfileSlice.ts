import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Types
export interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  carsCount: number;
  activeBookingsCount: number;
}

export interface UpdateOwnerProfileData {
  name?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

interface OwnerProfileState {
  owner: OwnerProfile | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
}

// Initial state
const initialState: OwnerProfileState = {
  owner: null,
  loading: false,
  updating: false,
  error: null,
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Async thunks
export const fetchOwnerProfile = createAsyncThunk(
  'ownerProfile/fetchOwnerProfile',
  async (ownerId: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/api/owners/profile/${ownerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.profile;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch owner profile'
      );
    }
  }
);

export const updateOwnerProfile = createAsyncThunk(
  'ownerProfile/updateOwnerProfile',
  async (
    { ownerId, data }: { ownerId: string; data: UpdateOwnerProfileData },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${API_URL}/api/owners/profile/update/${ownerId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.profile;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update owner profile'
      );
    }
  }
);

export const uploadOwnerAvatar = createAsyncThunk(
  'ownerProfile/uploadOwnerAvatar',
  async (
    { ownerId, file }: { ownerId: string; file: File },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(
        `${API_URL}/api/owners/profile/upload/${ownerId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.profile;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to upload avatar'
      );
    }
  }
);

// Slice
const ownerProfileSlice = createSlice({
  name: 'ownerProfile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOwnerProfile: (state) => {
      state.owner = null;
      state.loading = false;
      state.updating = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch owner profile
    builder
      .addCase(fetchOwnerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerProfile.fulfilled, (state, action: PayloadAction<OwnerProfile>) => {
        state.loading = false;
        state.owner = action.payload;
        state.error = null;
      })
      .addCase(fetchOwnerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update owner profile
    builder
      .addCase(updateOwnerProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOwnerProfile.fulfilled, (state, action: PayloadAction<OwnerProfile>) => {
        state.updating = false;
        state.owner = action.payload;
        state.error = null;
      })
      .addCase(updateOwnerProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Upload owner avatar
    builder
      .addCase(uploadOwnerAvatar.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(uploadOwnerAvatar.fulfilled, (state, action: PayloadAction<OwnerProfile>) => {
        state.updating = false;
        state.owner = action.payload;
        state.error = null;
      })
      .addCase(uploadOwnerAvatar.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetOwnerProfile } = ownerProfileSlice.actions;
export default ownerProfileSlice.reducer;
