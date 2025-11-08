import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
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
export const fetchAdminSettings = createAsyncThunk("adminSettings/fetchSettings", async (_, { rejectWithValue }) => {
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
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
});
export const updateAdminProfile = createAsyncThunk("adminSettings/updateProfile", async (profileData, { rejectWithValue }) => {
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
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
});
export const updatePlatformConfig = createAsyncThunk("adminSettings/updatePlatformConfig", async (configData, { rejectWithValue }) => {
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
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
});
export const updateNotificationPreferences = createAsyncThunk("adminSettings/updateNotificationPreferences", async (preferences, { rejectWithValue }) => {
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
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
});
export const updateSecuritySettings = createAsyncThunk("adminSettings/updateSecuritySettings", async (securityData, { rejectWithValue }) => {
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
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
});
export const revokeAllSessions = createAsyncThunk("adminSettings/revokeAllSessions", async (_, { rejectWithValue }) => {
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
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
});
export const updateSystemControls = createAsyncThunk("adminSettings/updateSystemControls", async (systemData, { rejectWithValue }) => {
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
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
});
export const triggerBackup = createAsyncThunk("adminSettings/triggerBackup", async (_, { rejectWithValue }) => {
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
    }
    catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
});
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
        setSuccessMessage: (state, action) => {
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
            state.error = action.payload;
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
            state.error = action.payload;
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
            state.error = action.payload;
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
            state.error = action.payload;
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
            state.error = action.payload;
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
            state.error = action.payload;
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
            state.error = action.payload;
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
            state.error = action.payload;
        });
    },
});
export const { clearError, clearSuccessMessage, setSuccessMessage } = adminSettingsSlice.actions;
export default adminSettingsSlice.reducer;
