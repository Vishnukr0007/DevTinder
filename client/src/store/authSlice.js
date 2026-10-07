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
      // Check for OAuth redirect token in URL query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      if (tokenFromUrl) {
        localStorage.setItem("token", tokenFromUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const data = await authApi.getMe();
      if (data.success && data.user) {
        return data.user;
      }
      localStorage.removeItem("token");
      return rejectWithValue("Failed to retrieve user session");
    } catch (err) {
      localStorage.removeItem("token");
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
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
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
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
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
    } catch (err) {
      console.warn("Logout API call warning:", err.message);
    } finally {
      localStorage.removeItem("token");
    }
    return true;
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
