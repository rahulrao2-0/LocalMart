import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../../services/authApi';
import { apiFetch } from '../../services/api';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginApi(credentials);
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
      // 1. Register with Auth Service (expects full_name instead of ownerName)
      const authPayload = {
        ...credentials,
        full_name: credentials.ownerName,
        role: 'SELLER'
      };
      
      const authResponse = await registerApi(authPayload);
      
      // Backend automatically sets the cookie tokens here.
      
      // 2. Now that cookies are set, create Seller Profile in User Service
      try {
        await apiFetch('/sellers/profile', {
          method: 'POST',
          body: JSON.stringify({
            businessName: credentials.businessName,
            ownerName: credentials.ownerName,
            phone: credentials.phone,
            businessType: credentials.businessType,
            gstNumber: credentials.gstNumber,
            panNumber: credentials.panNumber,
            addressType: credentials.addressType,
            addressLine1: credentials.addressLine1,
            addressLine2: credentials.addressLine2,
            city: credentials.city,
            state: credentials.state,
            postalCode: credentials.postalCode
          })
        });
      } catch (profileError) {
        console.error("Failed to create seller profile:", profileError);
        // We don't reject here because auth succeeded, but we log the error.
      }

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
