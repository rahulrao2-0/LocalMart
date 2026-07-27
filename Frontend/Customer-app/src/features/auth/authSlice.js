import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Loading
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Login / Session
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    // Error Handling
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Initial auth check complete
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },

    // Reset Auth State
    resetAuth: () => initialState,
  },
});

export const {
  setLoading,
  setUser,
  logout,
  setError,
  clearError,
  setInitialized,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;