import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch, setTokens, clearTokens } from '../../utils/api';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('delivery_user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      // Assuming registration endpoint for delivery partner is /auth/signup or /auth/register
      // The prompt mentioned POST /auth/signup
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ ...credentials, role: 'DELIVERY' }),
      });
      // Signup might require OTP verification before tokens are given, or it gives tokens immediately
      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
        localStorage.setItem('delivery_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otpData, { rejectWithValue }) => {
    try {
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(otpData),
      });
      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
        localStorage.setItem('delivery_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'OTP Verification failed');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiFetch('/auth/me', { method: 'GET' });
      localStorage.setItem('delivery_user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('delivery_user')) || { name: 'Demo Driver', email: 'driver@localmart.com' },
  isAuthenticated: true, // Bypassing auth temporarily
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.accessToken) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.accessToken) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Me
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
