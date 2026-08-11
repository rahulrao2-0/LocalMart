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

      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              stats: {
                todaysDeliveries: 14,
                pendingDeliveries: 3,
                completedDeliveries: 11,
                todaysEarnings: 1284,
                weeklyEarnings: 8460,
                monthlyEarnings: 34200,
                averageRating: 4.8,
                totalRatings: 312,
                acceptanceRate: 94,
                onTimeRate: 97,
                hoursOnline: 6.5,
                distanceKm: 48.6,
                currentStatus: 'Active',
                todayTarget: 1500,
              },
              recentDeliveries: mockHistory.slice(0, 5),
              chartData: [
                { name: 'Mon', earnings: 1120, deliveries: 11 },
                { name: 'Tue', earnings: 1350, deliveries: 13 },
                { name: 'Wed', earnings: 980, deliveries: 9 },
                { name: 'Thu', earnings: 1470, deliveries: 15 },
                { name: 'Fri', earnings: 1620, deliveries: 16 },
                { name: 'Sat', earnings: 1980, deliveries: 19 },
                { name: 'Sun', earnings: 1284, deliveries: 14 },
              ],
            }),
          700,
        ),
      );
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
