import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // In a real scenario, this fetches from GET /delivery/dashboard
      // For now, we simulate the fetch and return mock data if backend isn't ready
      // const data = await apiFetch('/delivery/dashboard', { method: 'GET' });
      // return data;
      
      return new Promise((resolve) => setTimeout(() => resolve({
        stats: {
          todaysDeliveries: 12,
          pendingDeliveries: 3,
          completedDeliveries: 9,
          todaysEarnings: 150.50,
          weeklyEarnings: 840.20,
          monthlyEarnings: 3200.00,
          averageRating: 4.8,
          currentStatus: 'Active',
        },
        recentDeliveries: [
          { id: 'DEL-1001', status: 'Delivered', customer: 'Alice Smith', address: '123 Main St', amount: 15.00 },
          { id: 'DEL-1002', status: 'Out For Delivery', customer: 'Bob Jones', address: '456 Oak Ave', amount: 12.50 },
          { id: 'DEL-1003', status: 'Pending', customer: 'Charlie Brown', address: '789 Pine Ln', amount: 10.00 },
        ],
        chartData: [
          { name: 'Mon', earnings: 120 },
          { name: 'Tue', earnings: 150 },
          { name: 'Wed', earnings: 110 },
          { name: 'Thu', earnings: 170 },
          { name: 'Fri', earnings: 200 },
          { name: 'Sat', earnings: 250 },
          { name: 'Sun', earnings: 90 },
        ]
      }), 800));
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load dashboard data');
    }
  }
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
