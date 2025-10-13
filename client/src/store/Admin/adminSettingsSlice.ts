import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types for settings
export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profilePicture?: string;
}

export interface PlatformConfig {
  companyName: string;
  companyLogo?: string;
  defaultCurrency: string;
  taxPercentage: number;
  serviceFeePercentage: number;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  newBookings: boolean;
  ownerRegistrations: boolean;
  paymentConfirmations: boolean;
  systemUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastLoginHistory: Array<{
    id: string;
    ipAddress: string;
    device: string;
    location: string;
    timestamp: string;
  }>;
  activeSessions: Array<{
    id: string;
    device: string;
    ipAddress: string;
    lastActive: string;
    isCurrent: boolean;
  }>;
}

export interface SystemControls {
  maintenanceMode: boolean;
  systemVersion: string;
  apiHealthStatus: "healthy" | "warning" | "error";
  uptime: string;
  lastBackup: string;
}

export interface AdminSettingsState {
  profile: AdminProfile | null;
  platformConfig: PlatformConfig | null;
  notificationPreferences: NotificationPreferences | null;
  securitySettings: SecuritySettings | null;
  systemControls: SystemControls | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AdminSettingsState = {
  profile: null,
  platformConfig: null,
  notificationPreferences: null,
  securitySettings: null,
  systemControls: null,
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
};

// Async thunks for API calls
export const fetchAdminSettings = createAsyncThunk(
  "adminSettings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/dashboard/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const updateAdminProfile = createAsyncThunk(
  "adminSettings/updateProfile",
  async (profileData: Partial<AdminProfile>, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const updatePlatformConfig = createAsyncThunk(
  "adminSettings/updatePlatformConfig",
  async (configData: Partial<PlatformConfig>, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configData),
      });

      if (!response.ok) {
        throw new Error("Failed to update platform configuration");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  "adminSettings/updateNotificationPreferences",
  async (
    preferences: Partial<NotificationPreferences>,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/admin/notification-preferences", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification preferences");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const updateSecuritySettings = createAsyncThunk(
  "adminSettings/updateSecuritySettings",
  async (securityData: Partial<SecuritySettings>, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/security-settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(securityData),
      });

      if (!response.ok) {
        throw new Error("Failed to update security settings");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const revokeAllSessions = createAsyncThunk(
  "adminSettings/revokeAllSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/revoke-sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to revoke sessions");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const updateSystemControls = createAsyncThunk(
  "adminSettings/updateSystemControls",
  async (systemData: Partial<SystemControls>, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/system-controls", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(systemData),
      });

      if (!response.ok) {
        throw new Error("Failed to update system controls");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const triggerBackup = createAsyncThunk(
  "adminSettings/triggerBackup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to trigger backup");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

const adminSettingsSlice = createSlice({
  name: "adminSettings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch settings
    builder
      .addCase(fetchAdminSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.profile;
        state.platformConfig = action.payload.platformConfig;
        state.notificationPreferences = action.payload.notificationPreferences;
        state.securitySettings = action.payload.securitySettings;
        state.systemControls = action.payload.systemControls;
      })
      .addCase(fetchAdminSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateAdminProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.isSaving = false;
        state.profile = { ...state.profile, ...action.payload };
        state.successMessage = "Profile updated successfully";
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update platform config
    builder
      .addCase(updatePlatformConfig.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updatePlatformConfig.fulfilled, (state, action) => {
        state.isSaving = false;
        state.platformConfig = { ...state.platformConfig, ...action.payload };
        state.successMessage = "Platform configuration updated successfully";
      })
      .addCase(updatePlatformConfig.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update notification preferences
    builder
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.isSaving = false;
        state.notificationPreferences = {
          ...state.notificationPreferences,
          ...action.payload,
        };
        state.successMessage = "Notification preferences updated successfully";
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update security settings
    builder
      .addCase(updateSecuritySettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        state.isSaving = false;
        state.securitySettings = {
          ...state.securitySettings,
          ...action.payload,
        };
        state.successMessage = "Security settings updated successfully";
      })
      .addCase(updateSecuritySettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Revoke all sessions
    builder
      .addCase(revokeAllSessions.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(revokeAllSessions.fulfilled, (state) => {
        state.isSaving = false;
        state.successMessage = "All sessions revoked successfully";
        if (state.securitySettings) {
          state.securitySettings.activeSessions = [];
        }
      })
      .addCase(revokeAllSessions.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update system controls
    builder
      .addCase(updateSystemControls.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateSystemControls.fulfilled, (state, action) => {
        state.isSaving = false;
        state.systemControls = { ...state.systemControls, ...action.payload };
        state.successMessage = "System controls updated successfully";
      })
      .addCase(updateSystemControls.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Trigger backup
    builder
      .addCase(triggerBackup.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(triggerBackup.fulfilled, (state, action) => {
        state.isSaving = false;
        state.successMessage = "Backup completed successfully";
        if (state.systemControls) {
          state.systemControls.lastBackup = action.payload.timestamp;
        }
      })
      .addCase(triggerBackup.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccessMessage, setSuccessMessage } =
  adminSettingsSlice.actions;
export default adminSettingsSlice.reducer;
