import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi.js";
import { userApi } from "../services/userApi.js";

/**
 * Async Thunks for Authentication & Profile Operations
 */
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getMe();
      if (data.success && data.user) {
        return data.user;
      }
      return rejectWithValue("Failed to retrieve user session");
    } catch (err) {
      return rejectWithValue(err.message || "Unauthenticated");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      if (data.success) {
        // Fetch full profile after login
        const fullProfileRes = await authApi.getMe().catch(() => null);
        return fullProfileRes?.user || data.user;
      }
      return rejectWithValue(data.message || "Login failed");
    } catch (err) {
      return rejectWithValue(err.message || "Invalid credentials");
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authApi.signup(userData);
      if (data.success) {
        const fullProfileRes = await authApi.getMe().catch(() => null);
        return fullProfileRes?.user || data.user;
      }
      return rejectWithValue(data.message || "Signup failed");
    } catch (err) {
      return rejectWithValue(err.message || "Registration failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return true;
    } catch (err) {
      return rejectWithValue(err.message || "Logout failed");
    }
  }
);

export const updateUserProfileThunk = createAsyncThunk(
  "auth/updateUserProfileThunk",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await userApi.updateProfile(profileData);
      if (res.success) {
        // Fetch full user session to guarantee complete state consistency
        const fullProfileRes = await authApi.getMe().catch(() => null);
        return fullProfileRes?.user || res.user;
      }
      return rejectWithValue(res.message || "Failed to update profile");
    } catch (err) {
      return rejectWithValue(err.message || "Update profile failed");
    }
  }
);

const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // signupUser
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      // updateUserProfileThunk
      .addCase(updateUserProfileThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = { ...state.user, ...action.payload };
        }
      });
  },
});

export const { setUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
