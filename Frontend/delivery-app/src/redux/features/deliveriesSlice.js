import { createSlice } from '@reduxjs/toolkit';
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
  items: mockDeliveries,
};

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
    resetDeliveries: () => ({ items: mockDeliveries }),
  },
});

export const {
  acceptDelivery,
  rejectDelivery,
  advanceDelivery,
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
