import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (sellerId, { rejectWithValue }) => {
    try {
      const endpoint = sellerId ? `/orders/seller/${sellerId}` : '/orders/seller';
      const response = await apiFetch(endpoint);
      return response?.data || response || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, reason }, { rejectWithValue }) => {
    try {
      const endpoint = status === "CANCELLED" ? `/orders/${orderId}/cancel` : `/orders/${orderId}/status`;
      const response = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus: status, status, reason }),
      });
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;
        const index = state.items.findIndex(o => (o.id || o._id) === (updated.id || updated._id));
        if (index !== -1) {
          state.items[index] = updated;
        }
      });
  },
});

export default orderSlice.reducer;
