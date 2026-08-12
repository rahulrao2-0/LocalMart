import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockHistory } from '../../data/mockDeliveries';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // Real endpoint (GET /delivery/dashboard) isn't live yet, so this resolves
      // demo figures. Amounts are in INR to match the rest of the platform.
      // const data = await apiFetch('/delivery/dashboard', { method: 'GET' });
      // return data;

      return {
        stats: {
          todaysDeliveries: 0,
          pendingDeliveries: 0,
          completedDeliveries: 0,
          todaysEarnings: 0,
          weeklyEarnings: 0,
          monthlyEarnings: 0,
          averageRating: 0,
          totalRatings: 0,
          acceptanceRate: 0,
          onTimeRate: 0,
          hoursOnline: 0,
          distanceKm: 0,
          currentStatus: 'Active',
          todayTarget: 1500,
        },
        recentDeliveries: [],
        chartData: [],
      };
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
