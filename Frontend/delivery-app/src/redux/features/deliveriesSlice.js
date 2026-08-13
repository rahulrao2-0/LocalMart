import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';
import {
  mockDeliveries,
  DELIVERY_STATUS,
  DELIVERY_STAGES,
  activeStatuses,
} from '../../data/mockDeliveries';

/**
 * Holds the driver's job board.
 *
 * Keeping it in Redux (rather than page-local state) means accepting a job on
 * the Deliveries list is still reflected on the Dashboard, the Live Map and the
 * detail screen. Swap the seeded `items` for an API thunk once the delivery
 * endpoints exist — the reducers below already model the state machine.
 */

/** The status a job moves to when the driver taps the primary action. */
export const nextStatusOf = (status) => {
  if (status === DELIVERY_STATUS.NEW) return DELIVERY_STATUS.ACCEPTED;
  const index = DELIVERY_STAGES.indexOf(status);
  if (index === -1 || index === DELIVERY_STAGES.length - 1) return null;
  return DELIVERY_STAGES[index + 1];
};

/** Label for the primary action button, per status. */
export const ACTION_LABELS = {
  [DELIVERY_STATUS.NEW]: 'Accept job',
  [DELIVERY_STATUS.ACCEPTED]: 'Mark picked up',
  [DELIVERY_STATUS.PICKED_UP]: 'Start delivery',
  [DELIVERY_STATUS.IN_TRANSIT]: 'Mark delivered',
};

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchDeliveries = createAsyncThunk(
  'deliveries/fetchDeliveries',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const partnerId = state.auth.user?._id || state.auth.user?.id;
      
      const data = await apiFetch(`/delivery/partner/${partnerId}/orders`, {
        method: 'GET',
      });
      
      console.log("🚚 [REDUX] Fetched Deliveries Data:", data.data);
      
      return data.data.map(order => {
        let status = DELIVERY_STATUS.NEW;
        if (order.status === 'SEARCHING_FOR_PARTNER') status = DELIVERY_STATUS.NEW;
        if (order.status === 'PARTNER_ASSIGNED') status = DELIVERY_STATUS.ACCEPTED;
        if (order.status === 'HEADING_TO_STORE' || order.status === 'REACHED_STORE' || order.status === 'PICKED_UP') status = DELIVERY_STATUS.PICKED_UP;
        if (order.status === 'HEADING_TO_CUSTOMER' || order.status === 'REACHED_LOCATION') status = DELIVERY_STATUS.IN_TRANSIT;
        if (order.status === 'DELIVERED') status = DELIVERY_STATUS.DELIVERED;
        if (order.status === 'CANCELLED') status = DELIVERY_STATUS.CANCELLED;

        return {
          id: order.orderId || order._id,
          orderId: order.orderNumber,
          status,
          placedAtLabel: new Date(order.createdAt).toLocaleTimeString(),
          slaMinutes: 45,
          paymentMode: order.paymentMethod || 'prepaid',
          orderValue: order.totalAmount || 500,
          payout: order.deliveryCharge || 50,
          distanceKm: 5.0, // To be calculated with real coordinates
          customer: { 
            name: order.shippingAddress?.fullName || order.customer?.name || 'Customer', 
            phone: order.shippingAddress?.phone || '+91 9999999999', 
            rating: 4.5 
          },
          pickup: {
            name: 'LocalMart Store',
            address: 'Store Address', // Ideally from seller service
            phone: '1234567890',
            position: { lat: 23.1852, lng: 77.0180 },
          },
          drop: {
            address: order.dropLocation?.address || 'Customer Address',
            landmark: 'City',
            position: { 
              lat: order.dropLocation?.lat || 28.7041, 
              lng: order.dropLocation?.lng || 77.1025 
            },
          },
          items: order.items || [],
          notes: 'Standard delivery',
        };
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptDeliveryThunk = createAsyncThunk(
  'deliveries/accept',
  async (orderId, { rejectWithValue, dispatch }) => {
    try {
      await apiFetch(`/delivery/${orderId}/accept`, { method: 'POST' });
      dispatch(fetchDeliveries());
      return orderId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectDeliveryThunk = createAsyncThunk(
  'deliveries/reject',
  async (orderId, { rejectWithValue, dispatch }) => {
    try {
      await apiFetch(`/delivery/${orderId}/cancel`, { 
        method: 'PUT',
        body: JSON.stringify({ reason: "Rejected by partner" })
      });
      dispatch(fetchDeliveries());
      return orderId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDeliveryStatusThunk = createAsyncThunk(
  'deliveries/updateStatus',
  async ({ orderId, status }, { rejectWithValue, dispatch }) => {
    try {
      let nextBackendStatus = 'PARTNER_ASSIGNED';
      if (status === DELIVERY_STATUS.PICKED_UP) nextBackendStatus = 'PICKED_UP';
      else if (status === DELIVERY_STATUS.IN_TRANSIT) nextBackendStatus = 'HEADING_TO_CUSTOMER';
      else if (status === DELIVERY_STATUS.DELIVERED) nextBackendStatus = 'DELIVERED';
      
      await apiFetch(`/delivery/${orderId}/status`, { 
        method: 'PUT',
        body: JSON.stringify({ status: nextBackendStatus })
      });
      dispatch(fetchDeliveries());
      return { orderId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const deliveriesSlice = createSlice({
  name: 'deliveries',
  initialState,
  reducers: {
    acceptDelivery: (state, action) => {
      const delivery = state.items.find((item) => item.id === action.payload);
      if (delivery) delivery.status = DELIVERY_STATUS.ACCEPTED;
    },
    rejectDelivery: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    /** Advance one step along DELIVERY_STAGES. */
    advanceDelivery: (state, action) => {
      const delivery = state.items.find((item) => item.id === action.payload);
      if (!delivery) return;
      const next = nextStatusOf(delivery.status);
      if (next) delivery.status = next;
    },
    setDeliveryStatus: (state, action) => {
      const { id, status } = action.payload;
      const delivery = state.items.find((item) => item.id === id);
      if (delivery) delivery.status = status;
    },
    resetDeliveries: () => ({ items: [], status: 'idle', error: null }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(acceptDeliveryThunk.fulfilled, (state, action) => {
        const delivery = state.items.find((item) => item.id === action.payload);
        if (delivery) delivery.status = DELIVERY_STATUS.ACCEPTED;
      })
      .addCase(rejectDeliveryThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(updateDeliveryStatusThunk.fulfilled, (state, action) => {
        const delivery = state.items.find((item) => item.id === action.payload.orderId);
        if (delivery) delivery.status = action.payload.status;
      });
  }
});

export const {
  setDeliveryStatus,
  resetDeliveries,
} = deliveriesSlice.actions;

export const selectDeliveries = (state) => state.deliveries.items;

export const selectActiveDeliveries = (state) =>
  state.deliveries.items.filter((item) => activeStatuses.includes(item.status));

export const selectNewDeliveries = (state) =>
  state.deliveries.items.filter((item) => item.status === DELIVERY_STATUS.NEW);

export const selectDeliveryById = (id) => (state) =>
  state.deliveries.items.find((item) => item.id === id) || null;

export default deliveriesSlice.reducer;
