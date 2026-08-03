import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, registerSeller as registerSellerApi, logout as logoutApi } from '../../services/authApi';
import { apiFetch } from '../../services/api';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const data = await loginApi(credentials);
      
      // Enforce SELLER role authorization
      if (!data.user.roles || !data.user.roles.includes('SELLER')) {
        // If they are not a seller, we immediately log them out to clear the cookie
        await dispatch(logout());
        return rejectWithValue("Access Denied: You do not have a registered Seller Account.");
      }

      // The backend sets the token cookies automatically. We just cache the user object.
      localStorage.setItem('seller_user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi(); // Backend clears cookies
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('seller_user');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      // 1. Call the dedicated Seller Registration API
      const sellerPayload = {
        ...credentials,
        full_name: credentials.ownerName, // Backend might expect this
        role: 'SELLER'
      };
      
      const authResponse = await registerSellerApi(sellerPayload);
      
      // Backend handles everything and emits Kafka events to User Service.
      
      localStorage.setItem('seller_user', JSON.stringify(authResponse.user));
      return authResponse;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('seller_user')) || null,
  isAuthenticated: !!localStorage.getItem('seller_user'), // Base this on user object presence since tokens are HttpOnly
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
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
