import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const partnerId = state.auth.user?._id || state.auth.user?.id;
      
      const data = await apiFetch(`/delivery/partner/${partnerId}/dashboard`, { method: 'GET' });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load dashboard data');
    }
  },
);

const initialState = {
  stats: null,
  recentDeliveries: [],
  chartData: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.recentDeliveries = action.payload.recentDeliveries;
        state.chartData = action.payload.chartData;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
